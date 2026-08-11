-- Phase 4: 管理画面コンテンツエディタの下準備。
--
-- unit_to_json に published を追加する(スタッフ編集画面のunit一覧で
-- 公開中/非公開を出し分けるために必要。学生ランタイム側は
-- get_curriculum(published_only=true) が非公開unitをそもそも木から
-- 除外するので、このフィールドが増えても学生側の挙動には影響しない)。
--
-- あわせて unit_to_json / beat_to_json に service_role へのEXECUTE権限を
-- 明示的に付与する。これまでは get_curriculum(security definer) が
-- 関数所有者権限で内部的に呼んでいるだけで動いていたが、次のマイグレーション
-- (content_admin_functions.sql)で追加する fn_create_unit 等は
-- security definer にしない方針(service_role専用関数の既存規約)なので、
-- service_role自身がこれらのヘルパーを呼べる必要がある。

create or replace function unit_to_json(u units)
returns jsonb
language sql
stable
as $$
  select jsonb_build_object(
    'id', u.id,
    'title', u.title,
    'requestLine', u.request_line,
    'published', u.published,
    'beats', (
      select coalesce(jsonb_agg(beat_to_json(b) order by b.position), '[]'::jsonb)
      from beats b
      where b.unit_id = u.id
    )
  )
$$;

grant execute on function unit_to_json(units) to service_role;
grant execute on function beat_to_json(beats) to service_role;
