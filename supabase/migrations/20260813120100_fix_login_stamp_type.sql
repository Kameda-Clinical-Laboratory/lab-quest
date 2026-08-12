-- fn_record_login_stamp: v_insertedをboolean宣言のままrow_count(int)を代入していたため
-- 「operator does not exist: boolean > integer」で必ず失敗していた。int型に修正する。

create or replace function fn_record_login_stamp(p_student_id uuid)
returns jsonb
language plpgsql
as $$
declare
  v_today date := (now() at time zone 'Asia/Tokyo')::date;
  v_inserted int;
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
