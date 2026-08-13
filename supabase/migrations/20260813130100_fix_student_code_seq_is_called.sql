-- 20260813130000_fix_student_code_seq.sql の setval 第3引数(is_called)を誤って
-- false にしていた。false だと次回 nextval() が指定値そのもの(=既存コードと同じ番号)を
-- 返してしまい、結局 students_code_lower_idx のユニーク制約違反を再現してしまう。
-- is_called=true にして「次回 nextval() は value+1 を返す」の意図どおりにする。
do $$
declare
  v_max int;
begin
  select coalesce(max((regexp_match(code, '^TRAIN(\d+)$'))[1]::int), 0)
  into v_max
  from students
  where code ~ '^TRAIN\d+$';

  perform setval('student_code_seq', v_max, true);
end $$;
