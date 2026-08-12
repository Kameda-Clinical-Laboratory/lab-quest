-- Phase 5: データ保持期間の設定(app_config.retention_days)の読み書きRPC。
-- 読み取りはスタッフ管理画面(/staff/settings)、匿名化バッチ(anonymize_expired_students)
-- の両方から使う。書き込みはfull権限スタッフのみ(Edge Function側でゲート)。

create or replace function fn_get_retention_days()
returns int
language sql
stable
as $$
  select coalesce((value #>> '{}')::int, 365) from app_config where key = 'retention_days'
$$;

create or replace function fn_set_retention_days(p_days int, p_actor_staff_id uuid)
returns void
language plpgsql
as $$
begin
  if p_days < 1 then
    raise exception 'retention_days must be positive';
  end if;

  insert into app_config (key, value) values ('retention_days', to_jsonb(p_days))
  on conflict (key) do update set value = excluded.value;

  insert into admin_audit_log (actor_staff_id, action, target_table, target_id, detail)
  values (p_actor_staff_id, 'set_retention_days', 'app_config', 'retention_days', jsonb_build_object('days', p_days));
end;
$$;

grant execute on function fn_get_retention_days() to service_role;
grant execute on function fn_set_retention_days(int, uuid) to service_role;
