-- プロローグ画面(§1.1、docs/adventure-book/HANDOFF-見習い主人公設定と調査ギミック拡張.md)用に、
-- 実習生の呼び名(ニックネーム)を管理者用のフルネームとは別に持たせる。
-- マスタ(students.name)はスタッフ管理画面で使うフルネームのまま変更しない。
-- nicknameはプロローグで実習生自身が入力し、以後アプリ内(アスピアの呼びかけ等)で使う。

alter table students add column nickname text;

comment on column students.nickname is
  'プロローグでプレイヤー自身が入力する呼び名。マスタのfull name(students.name)とは別枠。未入力(null)ならプロローグ未実施として扱う。';

-- fn_get_student_state に nickname を追加。20260813120000時点の定義(schoolName/stampDates
-- 込み)をベースに、nicknameだけ足す(シグネチャ不変なので既存のGRANTを引き継ぐ)。
create or replace function fn_get_student_state(p_student_id uuid)
returns jsonb
language sql
stable
as $$
  select jsonb_build_object(
    'id', s.id,
    'name', s.name,
    'code', s.code,
    'nickname', s.nickname,
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
-- fn_set_nickname: プロローグでの初回入力(以後の変更手段は今回は用意しない)。
-- ==========================================================================

create or replace function fn_set_nickname(p_student_id uuid, p_nickname text)
returns void
language plpgsql
as $$
begin
  if coalesce(trim(p_nickname), '') = '' then
    raise exception 'ニックネームを入力してください';
  end if;
  if length(trim(p_nickname)) > 20 then
    raise exception 'ニックネームは20文字以内で入力してください';
  end if;

  update students
  set nickname = trim(p_nickname), updated_at = now()
  where id = p_student_id;
end;
$$;

grant execute on function fn_set_nickname(uuid, text) to service_role;
