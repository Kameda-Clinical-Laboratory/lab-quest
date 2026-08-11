-- Phase 4(M9): スタッフによる実習生登録・パスワード再発行の書き込み経路。
-- コンテンツエディタ本体(20260811120100)とは独立したサブタスク。
--
-- 方針: 既存 fn_* 群と同じ規約(service_role専用、p_actor_staff_idでaudit記録)。
-- パスワードのbcryptハッシュ化はEdge Function側で行い、ここでは
-- 既にハッシュ化済みの値のみを受け取る(平文パスワードはSQLに一切渡さない)。

-- ==========================================================================
-- fn_admin_create_student: 新規実習生登録。学籍コードは student_code_seq から採番。
-- ==========================================================================

create or replace function fn_admin_create_student(
  p_name text,
  p_password_hash text,
  p_visit_dates date[],
  p_day_plans jsonb,
  p_actor_staff_id uuid
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

  insert into students (code, name, password_hash)
  values (v_code, p_name, p_password_hash)
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

-- ==========================================================================
-- fn_admin_update_student: 氏名・実習日程(visitDates/dayPlans)の更新。
-- dayPlansはbeats同様「渡された内容が新しい全体」として全置換する
-- (student_id,dateがPKで並び順制約が無いため、2段階position更新は不要)。
-- ==========================================================================

create or replace function fn_admin_update_student(
  p_student_id uuid,
  p_name text,
  p_visit_dates date[],
  p_day_plans jsonb,
  p_actor_staff_id uuid
) returns jsonb
language plpgsql
as $$
declare
  d date;
  v_plan jsonb;
begin
  update students set name = p_name, updated_at = now() where id = p_student_id;
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

-- ==========================================================================
-- fn_admin_reset_student_password
-- ==========================================================================

create or replace function fn_admin_reset_student_password(
  p_student_id uuid,
  p_password_hash text,
  p_actor_staff_id uuid
) returns void
language plpgsql
as $$
begin
  update students set password_hash = p_password_hash, updated_at = now() where id = p_student_id;
  if not found then
    raise exception 'student not found: %', p_student_id;
  end if;

  insert into admin_audit_log (actor_staff_id, action, target_table, target_id, detail)
  values (p_actor_staff_id, 'reset_student_password', 'students', p_student_id::text, null);
end;
$$;

-- ==========================================================================
-- 権限: service_role にのみ実行権を付与
-- ==========================================================================

grant execute on function fn_admin_create_student(text, text, date[], jsonb, uuid) to service_role;
grant execute on function fn_admin_update_student(uuid, text, date[], jsonb, uuid) to service_role;
grant execute on function fn_admin_reset_student_password(uuid, text, uuid) to service_role;
