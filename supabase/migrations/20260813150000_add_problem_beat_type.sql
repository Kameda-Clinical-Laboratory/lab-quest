-- 幕構成リニューアル(2026-08): 「クエスト発生」ビート種別(problem)を追加する。
-- 会話の直後に、ユニットの依頼(unit.requestLine)を依頼票として見せる専用の幕。
-- 中身は持たず(payloadは空)、学生画面は unit.title / unit.requestLine をそのまま表示する。

alter table beats drop constraint beats_type_check;
alter table beats add constraint beats_type_check
  check (type in ('dialogue', 'lecture', 'problem', 'investigate', 'resolve', 'drill'));

-- 既存の bio-basics-u1 / bio-basics-u2 の会話(position 0)の直後にproblem幕を挿入する。
-- position にはユニークインデックス(unit_id, position)があるため、まず既存行を
-- 負の位置へ退避してから最終位置へ振り直し、途中の一意制約違反を避ける。
do $$
declare
  u record;
begin
  for u in select id from units where id in ('bio-basics-u1', 'bio-basics-u2') loop
    update beats set position = -position where unit_id = u.id and position >= 1;
    update beats set position = -position + 1 where unit_id = u.id and position < 0;

    insert into beats (id, unit_id, type, position, xp, payload)
    values (u.id || '-problem', u.id, 'problem', 1, 5, '{}'::jsonb);
  end loop;
end $$;
