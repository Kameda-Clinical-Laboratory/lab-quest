-- Phase 5 追加: 実習生に「学校名」を持たせる(スタッフ進捗画面のヘッダー
-- ネームプレート用)。あわせて、これまでモック内(ローカル)だけで完結していた
-- 実習生登録・編集・パスワード再発行(M9の既知の制限)を、実際にSupabaseへ
-- 書き込むよう配線する前提のDB変更。
--
-- create or replace function の制約上、既存の関数に引数を追加する場合は
-- 末尾にdefault付きで足す(既存の呼び出し側/GRANTをそのまま引き継げる)。

alter table students add column school_name text;

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

create or replace function fn_admin_create_student(
  p_name text,
  p_password_hash text,
  p_visit_dates date[],
  p_day_plans jsonb,
  p_actor_staff_id uuid,
  p_school_name text default null
) returns jsonb
language plpgsql
as $$
declare
  v_code text;
  v_student students%rowtype;
  d date;
  v_plan jsonb;
begin
  v_code := 'TRAIN' || lpad(nextval('student_code_seq')::text, 2, '0');

  insert into students (code, name, password_hash, school_name)
  values (v_code, p_name, p_password_hash, p_school_name)
  returning * into v_student;

  insert into student_progress (student_id) values (v_student.id);

  foreach d in array coalesce(p_visit_dates, '{}'::date[]) loop
    select elem into v_plan
    from jsonb_array_elements(coalesce(p_day_plans, '[]'::jsonb)) elem
    where (elem->>'date')::date = d
    limit 1;

    insert into day_plans (student_id, date, series_ids, note)
    values (
      v_student.id,
      d,
      case when v_plan is not null and v_plan ? 'seriesIds'
        then array(select jsonb_array_elements_text(v_plan->'seriesIds'))
        else '{}'::text[]
      end,
      case when v_plan is not null then v_plan->>'note' else null end
    )
    on conflict (student_id, date) do nothing;
  end loop;

  insert into admin_audit_log (actor_staff_id, action, target_table, target_id, detail)
  values (p_actor_staff_id, 'create_student', 'students', v_student.id::text, jsonb_build_object('name', p_name, 'code', v_code));

  return jsonb_build_object('studentId', v_student.id, 'code', v_code);
end;
$$;

create or replace function fn_admin_update_student(
  p_student_id uuid,
  p_name text,
  p_visit_dates date[],
  p_day_plans jsonb,
  p_actor_staff_id uuid,
  p_school_name text default null
) returns jsonb
language plpgsql
as $$
declare
  d date;
  v_plan jsonb;
begin
  update students
  set name = p_name, school_name = p_school_name, updated_at = now()
  where id = p_student_id;
  if not found then
    raise exception 'student not found: %', p_student_id;
  end if;

  delete from day_plans where student_id = p_student_id;

  foreach d in array coalesce(p_visit_dates, '{}'::date[]) loop
    select elem into v_plan
    from jsonb_array_elements(coalesce(p_day_plans, '[]'::jsonb)) elem
    where (elem->>'date')::date = d
    limit 1;

    insert into day_plans (student_id, date, series_ids, note)
    values (
      p_student_id,
      d,
      case when v_plan is not null and v_plan ? 'seriesIds'
        then array(select jsonb_array_elements_text(v_plan->'seriesIds'))
        else '{}'::text[]
      end,
      case when v_plan is not null then v_plan->>'note' else null end
    )
    on conflict (student_id, date) do nothing;
  end loop;

  insert into admin_audit_log (actor_staff_id, action, target_table, target_id, detail)
  values (p_actor_staff_id, 'update_student', 'students', p_student_id::text, jsonb_build_object('name', p_name));

  return jsonb_build_object('studentId', p_student_id);
end;
$$;

grant execute on function fn_admin_create_student(text, text, date[], jsonb, uuid, text) to service_role;
grant execute on function fn_admin_update_student(uuid, text, date[], jsonb, uuid, text) to service_role;
