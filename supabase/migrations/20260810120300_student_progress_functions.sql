-- Phase 3: 学生進捗の書き込み経路。
--
-- 方針:
--   - これらの関数は service_role からのみ呼び出す(anon/authenticated には一切公開しない)。
--     PUBLICへのEXECUTE権限は明示的にREVOKEし、service_roleにのみGRANTする。
--   - 呼び出し元は Edge Function(supabase/functions/student-progress)のみを想定。
--     Edge Function自体が独自JWT(APP_JWT_SECRET)を検証してstudent_idを確定させてから
--     service_roleクライアントでこれらの関数を呼ぶ(RLSではなくEdge Function層で認可する設計)。
--   - CBT(出題抽選・採点)のロジックはSQL関数にせず、Edge Function側のTypeScriptで行う
--     (buildCbtPaperの並び替え/シャッフルはSQLよりTSの方が素直に書けるため)。

revoke execute on all functions in schema public from public;
alter default privileges in schema public revoke execute on functions from public;
alter default privileges in schema public grant execute on functions to service_role;

-- ==========================================================================
-- 読み取り: Student形状を丸ごと再構成する
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
-- クリア判定(isUnitCleared / isStageCleared のSQL移植)
-- ==========================================================================

create or replace function fn_is_unit_cleared(p_student_id uuid, p_unit_id text)
returns boolean
language sql
stable
as $$
  select coalesce(bool_and(
    (b.type = 'investigate' and (b.payload->>'required')::boolean is not distinct from false)
    or (b.id = any(sp.cleared_beat_ids))
  ), true)
  from beats b
  cross join (
    select coalesce(cleared_beat_ids, '{}'::text[]) as cleared_beat_ids
    from student_progress where student_id = p_student_id
  ) sp
  where b.unit_id = p_unit_id
$$;

create or replace function fn_is_stage_cleared(p_student_id uuid, p_stage_id text)
returns boolean
language plpgsql
stable
as $$
declare
  v_stage stages%rowtype;
  v_progress student_progress%rowtype;
  v_proc_done boolean;
  v_units_done boolean;
  v_chapters_done boolean;
  v_case_done boolean;
  v_unit_count int;
begin
  select * into v_stage from stages where id = p_stage_id;
  select * into v_progress from student_progress where student_id = p_student_id;
  if v_stage.id is null or v_progress.student_id is null then
    return false;
  end if;

  v_proc_done := (not v_stage.has_procedure) or (p_stage_id = any(coalesce(v_progress.cleared_procedure_stage_ids, '{}'::text[])));

  select count(*) into v_unit_count from units where stage_id = p_stage_id and published;

  if v_unit_count > 0 then
    select bool_and(fn_is_unit_cleared(p_student_id, u.id)) into v_units_done
    from units u
    where u.stage_id = p_stage_id and u.published;

    return coalesce(v_units_done, false) and v_proc_done;
  else
    select bool_and(elem->>'id' = any(coalesce(v_progress.cleared_chapter_ids, '{}'::text[])))
      into v_chapters_done
    from jsonb_array_elements(coalesce(v_stage.chapters, '[]'::jsonb)) elem;

    v_case_done := p_stage_id = any(coalesce(v_progress.cleared_case_stage_ids, '{}'::text[]));

    return coalesce(v_chapters_done, true) and v_case_done and v_proc_done;
  end if;
end;
$$;

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
      update student_progress
      set stamps = stamps + 3, xp = xp + 50, updated_at = now()
      where student_id = p_student_id;
    end if;
  end if;
end;
$$;

-- ==========================================================================
-- 各種クリア操作(既存 src/context/AppState.tsx のロジックを1:1移植)
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
begin
  select p_beat_id = any(coalesce(cleared_beat_ids, '{}'::text[])) into v_already
  from student_progress where student_id = p_student_id;

  update student_progress
  set
    cleared_beat_ids = case when v_already then cleared_beat_ids
                        else array_append(coalesce(cleared_beat_ids, '{}'::text[]), p_beat_id) end,
    owned_clue_ids = case when p_clue_id is not null and not (p_clue_id = any(coalesce(owned_clue_ids, '{}'::text[])))
                        then array_append(coalesce(owned_clue_ids, '{}'::text[]), p_clue_id)
                        else owned_clue_ids end,
    unit_cursors = coalesce(unit_cursors, '{}'::jsonb) || jsonb_build_object(p_unit_id, p_next_beat_index),
    xp = xp + case when v_already then 0 else coalesce(p_xp, 0) end,
    updated_at = now()
  where student_id = p_student_id;

  perform fn_refresh_stage_clear(p_student_id, p_stage_id);
end;
$$;

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
    stamps = stamps + case when v_already then 0 else 1 end,
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
    stamps = stamps + case when v_already then 0 else 1 end,
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
    stamps = stamps + case when v_already then 0 else 2 end,
    xp = xp + case when v_already then 0 else 40 end,
    updated_at = now()
  where student_id = p_student_id;

  perform fn_refresh_stage_clear(p_student_id, p_stage_id);
end;
$$;

create or replace function fn_set_unit_cursor(p_student_id uuid, p_unit_id text, p_beat_index int)
returns void
language sql
as $$
  update student_progress
  set unit_cursors = coalesce(unit_cursors, '{}'::jsonb) || jsonb_build_object(p_unit_id, p_beat_index),
      updated_at = now()
  where student_id = p_student_id;
$$;

-- ==========================================================================
-- 権限: service_role にのみ実行権を付与(anon/authenticated/publicは不可)
-- ==========================================================================

grant execute on function fn_get_student_state(uuid) to service_role;
grant execute on function fn_is_unit_cleared(uuid, text) to service_role;
grant execute on function fn_is_stage_cleared(uuid, text) to service_role;
grant execute on function fn_refresh_stage_clear(uuid, text) to service_role;
grant execute on function fn_complete_beat(uuid, text, text, int, int, text, text) to service_role;
grant execute on function fn_complete_chapter(uuid, text, int) to service_role;
grant execute on function fn_complete_case(uuid, text) to service_role;
grant execute on function fn_complete_procedure(uuid, text) to service_role;
grant execute on function fn_set_unit_cursor(uuid, text, int) to service_role;

-- get_curriculum(Phase 1)はanon/authenticatedへの公開が必要なので、
-- 上のPUBLIC一括revokeの影響を受けないよう明示的に再付与しておく。
grant execute on function get_curriculum(boolean) to anon, authenticated;
