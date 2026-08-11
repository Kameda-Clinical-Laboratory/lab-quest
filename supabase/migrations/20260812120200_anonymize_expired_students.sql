-- Phase 5: 実習終了後一定期間(app_config.retention_days)を過ぎた学生の匿名化。
--
-- 「実習終了」の基準日は、その学生のday_plansの最終日(最後に予定されていた実習日)。
-- day_plansが1件も無い学生(登録のみで未割当)は created_at の日付を代わりに使う。
--
-- 匿名化の内容: name を汎用文字列に、password_hash を空にしてログイン不能化、
-- anonymized_at を記録。day_plans.note(自由記述、PIIの可能性)も消す。
-- xp/stamps/cbt_score等の集計データとcodeは残す(氏名を消せば非識別化として十分で、
-- 集計目的での保持を優先する設計)。
--
-- pg_cronからの呼び出し用(supabase/migrations/20260812120300_pg_cron_schedule.sql)。
-- pg_cronが有効化できない環境でも、この関数自体はSQL Editor等から手動実行できる。

create or replace function anonymize_expired_students()
returns int
language plpgsql
as $$
declare
  v_retention_days int;
  v_ids uuid[];
  v_count int;
begin
  v_retention_days := fn_get_retention_days();

  select array_agg(s.id) into v_ids
  from students s
  left join (
    select student_id, max(date) as last_date from day_plans group by student_id
  ) dp on dp.student_id = s.id
  where s.anonymized_at is null
    and coalesce(dp.last_date, s.created_at::date) < (current_date - v_retention_days);

  if v_ids is null then
    return 0;
  end if;

  update students
  set name = '匿名化済み実習生',
      password_hash = '',
      anonymized_at = now(),
      updated_at = now()
  where id = any(v_ids);

  update day_plans
  set note = null
  where student_id = any(v_ids) and note is not null;

  v_count := array_length(v_ids, 1);
  return v_count;
end;
$$;

grant execute on function anonymize_expired_students() to service_role;
