-- supabase/seed/seed.ts は students.code に 'TRAIN01'/'TRAIN02' を直接指定して
-- insert するため、fn_admin_create_student が使う student_code_seq シーケンスが
-- 同期されないまま残っていた。この状態でスタッフ画面から実習生を新規登録すると
-- nextval() が既に使用済みの番号(例: 2 → 'TRAIN02')を返し、
-- students_code_lower_idx のユニーク制約違反で必ず失敗する。
--
-- 既存 students.code から実際の最大連番を割り出し、シーケンスをそこへ合わせる。
-- setval の第3引数 false は「次回 nextval() で max+1 を返す」指定。
do $$
declare
  v_max int;
begin
  select coalesce(max((regexp_match(code, '^TRAIN(\d+)$'))[1]::int), 0)
  into v_max
  from students
  where code ~ '^TRAIN\d+$';

  perform setval('student_code_seq', v_max, false);
end $$;
