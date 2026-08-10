-- 「Automatically expose new tables」をOFFにしたプロジェクト設定のため、
-- service_role にも通常のテーブル権限(GRANT)が自動付与されない。
-- service_role はRLSをバイパスできる(BYPASSRLS)役割だが、それはRLSポリシー判定を
-- 免除されるだけで、GRANTベースの基本権限が無ければテーブルにアクセスできない。
--
-- ここでは service_role にのみ全テーブル/シーケンスへのフルアクセスを付与する。
-- anon/authenticated には意図的に何も付与しない
-- (直接のテーブルアクセスは行わせず、Phase 1以降でRPC関数単位にEXECUTE権限を付与する設計のため)。

grant usage on schema public to service_role;

grant select, insert, update, delete on all tables in schema public to service_role;
grant usage, select on all sequences in schema public to service_role;

-- 今後 migration で追加するテーブル/シーケンスにも自動的に同じ権限が付くようにしておく
alter default privileges in schema public grant select, insert, update, delete on tables to service_role;
alter default privileges in schema public grant usage, select on sequences to service_role;
