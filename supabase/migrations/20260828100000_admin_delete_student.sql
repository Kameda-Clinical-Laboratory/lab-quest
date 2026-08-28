-- ==========================================================================
-- fn_admin_delete_student: 実習生を完全に削除する(full権限のみ、Edge Function側でゲート)。
--
-- 関連テーブル(day_plans / student_progress / student_stage_clears /
-- consent_records / student_login_stamps)はすべて students(id) を
-- on delete cascade で参照しているため、students 行の削除だけで
-- 付随データも一括して消える(20260810120000_init_schema.sql / 20260813120000_login_stamps_and_quest_xp.sql 参照)。
--
-- 削除前に名前・コードを監査ログへ残す(削除後は students 側から参照できなくなるため)。
-- ==========================================================================

create or replace function fn_admin_delete_student(p_student_id uuid, p_actor_staff_id uuid)
returns void
language plpgsql
as $$
declare
  v_name text;
  v_code text;
begin
  select name, code into v_name, v_code from students where id = p_student_id;
  if not found then
    raise exception 'student not found: %', p_student_id;
  end if;

  delete from students where id = p_student_id;

  insert into admin_audit_log (actor_staff_id, action, target_table, target_id, detail)
  values (
    p_actor_staff_id,
    'delete_student',
    'students',
    p_student_id::text,
    jsonb_build_object('name', v_name, 'code', v_code)
  );
end;
$$;

grant execute on function fn_admin_delete_student(uuid, uuid) to service_role;
