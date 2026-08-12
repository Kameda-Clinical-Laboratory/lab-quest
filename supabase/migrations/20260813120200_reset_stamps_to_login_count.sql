-- 旧付与方式(シリーズ全クリア+3、チャプター+1等)で溜まっていたstampsの値を、
-- 実際のログインスタンプ記録数に合わせてリセットする(1回限りのデータ補正)。
-- 以後はfn_record_login_stampのみがstampsを増減させる。

update student_progress sp
set stamps = coalesce((
  select count(*) from student_login_stamps ls where ls.student_id = sp.student_id
), 0),
updated_at = now();
