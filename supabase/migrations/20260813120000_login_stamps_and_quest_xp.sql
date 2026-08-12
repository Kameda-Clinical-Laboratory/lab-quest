-- ゲーム性の見直し(2026-08):
--   - XP: 幕(beat)クリアのたびではなく、クエスト(unit)を1本まるごとクリアした
--     瞬間にそのクエスト内の幕XP合計をまとめて加算する。
--   - スタンプ: 達成報酬ではなく、ログインした日ごとに1つだけ押す「ログインボーナス」
--     方式に変更する。旧チャプター/症例/手技/シリーズ全クリアでのスタンプ付与は廃止。
--     (XPは旧方式のまま残す。この変更対象は新方式のcomplete_beatとスタンプのみ)

-- ==========================================================================
-- student_login_stamps: ログイン日ごとに1行(student_id, stamp_date)。
-- ==========================================================================

create table student_login_stamps (
  student_id uuid not null references students (id) on delete cascade,
  stamp_date date not null,
  created_at timestamptz not null default now(),
  primary key (student_id, stamp_date)
);

alter table student_login_stamps enable row level security;

-- ==========================================================================
-- fn_record_login_stamp: 今日(JST)のスタンプがまだなら1つ記録して押す。
-- 何度呼んでも同じ日には1回しか増えない(primary keyでガード)。
-- ==========================================================================

create or replace function fn_record_login_stamp(p_student_id uuid)
returns jsonb
language plpgsql
as $$
declare
  v_today date := (now() at time zone 'Asia/Tokyo')::date;
  v_inserted boolean;
  v_total int;
begin
  insert into student_login_stamps (student_id, stamp_date)
  values (p_student_id, v_today)
  on conflict (student_id, stamp_date) do nothing;

  get diagnostics v_inserted = row_count;

  if v_inserted > 0 then
    update student_progress set stamps = stamps + 1, updated_at = now()
    where student_id = p_student_id;
  end if;

  select count(*) into v_total from student_login_stamps where student_id = p_student_id;

  return jsonb_build_object('isNew', v_inserted > 0, 'dayNumber', v_total, 'totalStamps', v_total);
end;
$$;

grant execute on function fn_record_login_stamp(uuid) to service_role;

-- ==========================================================================
-- fn_get_student_state: stampDates(スタンプ手帳表示用)を追加。
-- ==========================================================================

create or replace function fn_get_student_state(p_student_id uuid)
returns jsonb
language sql
stable
as $$
  select jsonb_build_object(
    'id', s.id,
    'name', s.name,
    'code', s.code,
    'schoolName', s.school_name,
    'consentAt', s.consent_at,
    'visitDates', (
      select coalesce(jsonb_agg(dp.date order by dp.date), '[]'::jsonb)
      from day_plans dp where dp.student_id = s.id
    ),
    'dayPlans', (
      select coalesce(jsonb_agg(
        jsonb_build_object('date', dp.date, 'seriesIds', dp.series_ids, 'note', dp.note)
        order by dp.date
      ), '[]'::jsonb)
      from day_plans dp where dp.student_id = s.id
    ),
    'stampDates', (
      select coalesce(jsonb_agg(ls.stamp_date order by ls.stamp_date), '[]'::jsonb)
      from student_login_stamps ls where ls.student_id = s.id
    ),
    'progress', jsonb_build_object(
      'clearedChapterIds', to_jsonb(coalesce(sp.cleared_chapter_ids, '{}'::text[])),
      'clearedCaseStageIds', to_jsonb(coalesce(sp.cleared_case_stage_ids, '{}'::text[])),
      'clearedProcedureStageIds', to_jsonb(coalesce(sp.cleared_procedure_stage_ids, '{}'::text[])),
      'clearedStageIds', (
        select coalesce(jsonb_agg(ssc.stage_id), '[]'::jsonb)
        from student_stage_clears ssc where ssc.student_id = s.id
      ),
      'clearedBeatIds', to_jsonb(coalesce(sp.cleared_beat_ids, '{}'::text[])),
      'ownedClueIds', to_jsonb(coalesce(sp.owned_clue_ids, '{}'::text[])),
      'unitCursors', coalesce(sp.unit_cursors, '{}'::jsonb),
      'xp', coalesce(sp.xp, 0),
      'stamps', coalesce(sp.stamps, 0),
      'cbtSubmitted', coalesce(sp.cbt_submitted, false),
      'cbtAnswers', coalesce(sp.cbt_answers, '{}'::jsonb),
      'cbtScore', sp.cbt_score,
      'cbtRetakeAllowed', coalesce(sp.cbt_retake_allowed, false),
      'cbtDrawnIds', to_jsonb(coalesce(sp.cbt_drawn_ids, '{}'::text[])),
      'cbtScopeStageIds', to_jsonb(coalesce(sp.cbt_scope_stage_ids, '{}'::text[]))
    )
  )
  from students s
  left join student_progress sp on sp.student_id = s.id
  where s.id = p_student_id
$$;

-- ==========================================================================
-- fn_refresh_stage_clear: シリーズ全クリアでのスタンプ/XP付与をやめ、
-- student_stage_clearsへの記録のみ残す(バッジ/CBT範囲判定に使われ続けるため)。
-- ==========================================================================

create or replace function fn_refresh_stage_clear(p_student_id uuid, p_stage_id text)
returns void
language plpgsql
as $$
begin
  if fn_is_stage_cleared(p_student_id, p_stage_id) then
    if not exists (
      select 1 from student_stage_clears
      where student_id = p_student_id and stage_id = p_stage_id
    ) then
      insert into student_stage_clears (student_id, stage_id) values (p_student_id, p_stage_id);
    end if;
  end if;
end;
$$;

-- ==========================================================================
-- fn_complete_beat: 幕クリアの都度ではなく、クエスト(unit)が新たに完全クリア
-- になった瞬間にそのunit配下の幕XP合計をまとめて加算する。p_xpは互換のため
-- 引数として残すが、もう使わない(呼び出し元Edge Functionは変更不要)。
-- ==========================================================================

create or replace function fn_complete_beat(
  p_student_id uuid,
  p_beat_id text,
  p_unit_id text,
  p_next_beat_index int,
  p_xp int,
  p_clue_id text,
  p_stage_id text
) returns void
language plpgsql
as $$
declare
  v_already boolean;
  v_unit_was_cleared boolean;
  v_unit_now_cleared boolean;
  v_unit_xp int;
begin
  select p_beat_id = any(coalesce(cleared_beat_ids, '{}'::text[])) into v_already
  from student_progress where student_id = p_student_id;

  select fn_is_unit_cleared(p_student_id, p_unit_id) into v_unit_was_cleared;

  update student_progress
  set
    cleared_beat_ids = case when v_already then cleared_beat_ids
                        else array_append(coalesce(cleared_beat_ids, '{}'::text[]), p_beat_id) end,
    owned_clue_ids = case when p_clue_id is not null and not (p_clue_id = any(coalesce(owned_clue_ids, '{}'::text[])))
                        then array_append(coalesce(owned_clue_ids, '{}'::text[]), p_clue_id)
                        else owned_clue_ids end,
    unit_cursors = coalesce(unit_cursors, '{}'::jsonb) || jsonb_build_object(p_unit_id, p_next_beat_index),
    updated_at = now()
  where student_id = p_student_id;

  select fn_is_unit_cleared(p_student_id, p_unit_id) into v_unit_now_cleared;

  if (not v_unit_was_cleared) and v_unit_now_cleared then
    select coalesce(sum(xp), 0) into v_unit_xp from beats where unit_id = p_unit_id;
    update student_progress set xp = xp + v_unit_xp, updated_at = now()
    where student_id = p_student_id;
  end if;

  perform fn_refresh_stage_clear(p_student_id, p_stage_id);
end;
$$;

-- ==========================================================================
-- 旧チャプター/症例/手技: スタンプ付与のみ廃止(XPはそのまま)。
-- ==========================================================================

create or replace function fn_complete_chapter(p_student_id uuid, p_chapter_id text, p_xp int)
returns void
language plpgsql
as $$
declare
  v_already boolean;
begin
  select p_chapter_id = any(coalesce(cleared_chapter_ids, '{}'::text[])) into v_already
  from student_progress where student_id = p_student_id;

  update student_progress
  set
    cleared_chapter_ids = case when v_already then cleared_chapter_ids
                            else array_append(coalesce(cleared_chapter_ids, '{}'::text[]), p_chapter_id) end,
    xp = xp + case when v_already then 0 else coalesce(p_xp, 0) end,
    updated_at = now()
  where student_id = p_student_id;
end;
$$;

create or replace function fn_complete_case(p_student_id uuid, p_stage_id text)
returns void
language plpgsql
as $$
declare
  v_already boolean;
begin
  select p_stage_id = any(coalesce(cleared_case_stage_ids, '{}'::text[])) into v_already
  from student_progress where student_id = p_student_id;

  update student_progress
  set
    cleared_case_stage_ids = case when v_already then cleared_case_stage_ids
                               else array_append(coalesce(cleared_case_stage_ids, '{}'::text[]), p_stage_id) end,
    xp = xp + case when v_already then 0 else 30 end,
    updated_at = now()
  where student_id = p_student_id;

  perform fn_refresh_stage_clear(p_student_id, p_stage_id);
end;
$$;

create or replace function fn_complete_procedure(p_student_id uuid, p_stage_id text)
returns void
language plpgsql
as $$
declare
  v_already boolean;
begin
  select p_stage_id = any(coalesce(cleared_procedure_stage_ids, '{}'::text[])) into v_already
  from student_progress where student_id = p_student_id;

  update student_progress
  set
    cleared_procedure_stage_ids = case when v_already then cleared_procedure_stage_ids
                                    else array_append(coalesce(cleared_procedure_stage_ids, '{}'::text[]), p_stage_id) end,
    xp = xp + case when v_already then 0 else 40 end,
    updated_at = now()
  where student_id = p_student_id;

  perform fn_refresh_stage_clear(p_student_id, p_stage_id);
end;
$$;
