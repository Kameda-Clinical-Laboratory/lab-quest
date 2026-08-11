-- Phase 5: 同意ゲート。
--
-- 方針(既存 fn_* 群と同じ規約): service_role専用、呼び出し元は student-progress
-- Edge Function のみを想定(自前JWTを検証してstudent_idを確定させてから呼ぶ)。

-- fn_get_student_state に consentAt を追加(シグネチャ不変なので既存のGRANTは
-- そのまま引き継がれる)。
create or replace function fn_get_student_state(p_student_id uuid)
returns jsonb
language sql
stable
as $$
  select jsonb_build_object(
    'id', s.id,
    'name', s.name,
    'code', s.code,
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

create or replace function fn_record_consent(p_student_id uuid, p_consent_version text)
returns void
language plpgsql
as $$
begin
  insert into consent_records (student_id, consent_version)
  values (p_student_id, p_consent_version);

  update students
  set consent_at = now(), updated_at = now()
  where id = p_student_id;
end;
$$;

grant execute on function fn_record_consent(uuid, text) to service_role;
