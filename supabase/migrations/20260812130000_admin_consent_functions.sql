-- Phase 5 追加: スタッフ進捗画面(/staff/progress)で同意日を表示し、
-- 同意をリセットして同意画面を再度出せるようにする。
--
-- 方針: 既存 fn_admin_* 群と同じ規約(service_role専用、admin-content Edge Function
-- 経由のみ、p_actor_staff_idでaudit記録)。
--
-- 注意: consent_records は「過去の同意履歴」の監査ログなので、リセット時も
-- 削除しない。students.consent_at のみをnullに戻し、同意ゲート(StudentShell)が
-- 再び /consent へ誘導するようにする。

-- ==========================================================================
-- fn_admin_list_student_consent: 全実習生のcode/同意日時の一覧。
-- スタッフ進捗画面がAppStateのモック学生一覧(code基準)に突き合わせて表示する。
-- ==========================================================================

create or replace function fn_admin_list_student_consent()
returns jsonb
language sql
stable
as $$
  select coalesce(
    jsonb_agg(
      jsonb_build_object('studentId', id, 'code', code, 'consentAt', consent_at)
      order by code
    ),
    '[]'::jsonb
  )
  from students
$$;

-- ==========================================================================
-- fn_admin_reset_consent: 指定学生のconsent_atをnullに戻す(full権限のみ、
-- Edge Function側でゲート)。
-- ==========================================================================

create or replace function fn_admin_reset_consent(p_student_id uuid, p_actor_staff_id uuid)
returns void
language plpgsql
as $$
begin
  update students set consent_at = null, updated_at = now() where id = p_student_id;
  if not found then
    raise exception 'student not found: %', p_student_id;
  end if;

  insert into admin_audit_log (actor_staff_id, action, target_table, target_id, detail)
  values (p_actor_staff_id, 'reset_consent', 'students', p_student_id::text, null);
end;
$$;

grant execute on function fn_admin_list_student_consent() to service_role;
grant execute on function fn_admin_reset_consent(uuid, uuid) to service_role;
