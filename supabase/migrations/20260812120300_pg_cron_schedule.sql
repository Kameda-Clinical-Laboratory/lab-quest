-- Phase 5: 匿名化バッチの定期実行(ベストエフォート)。
--
-- 注意: このファイルは独立したマイグレーションにしてある。プロジェクトのプラン/権限次第で
-- `create extension pg_cron` がここで失敗する可能性があるため(Supabaseダッシュボードの
-- Database > Extensions での手動有効化が必要な場合がある)、万一失敗してもこのファイルの
-- 適用がスキップされるだけで、anonymize_expired_students() 関数自体(前のマイグレーション
-- で作成済み)には影響しない。失敗した場合はダッシュボードでpg_cronを有効化してから
-- このファイルのSQLだけ手動で再実行すること。

create extension if not exists pg_cron;

select cron.schedule(
  'anonymize-expired-students',
  '0 18 * * *', -- UTC 18:00 = JST 3:00
  $$select anonymize_expired_students();$$
);
