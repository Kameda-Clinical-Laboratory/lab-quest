-- カリキュラム取得RPC。移行計画セクションD「公開フラグの伝播」に対応。
--
-- 設計:
--   - RLSポリシーではなく、このRPC(SECURITY DEFINER)がフィルタリングを担う。
--   - published_only=true  : 学生ランタイム用。非公開stage/unitを木から除外する。
--     beatには公開フラグが無い(決定#6)ため、公開されたunit配下のbeatは全件含まれる。
--   - published_only=false : スタッフ編集画面用(Phase 4で使用)。全件(下書き含む)を返す。
--   - anon/authenticated には、この関数のEXECUTE権限のみ付与する
--     (テーブルへの直接SELECTは引き続き拒否したまま)。
--
-- 返り値の形は src/mocks/types.ts の Stage[] とフィールド名まで一致させてある
-- (フロントは受け取ったJSONをそのまま Stage[] として使える)。

create or replace function beat_to_json(b beats)
returns jsonb
language sql
stable
as $$
  select
    jsonb_build_object('type', b.type, 'id', b.id)
    || case when b.xp is not null then jsonb_build_object('xp', b.xp) else '{}'::jsonb end
    || case when b.type = 'investigate' then jsonb_build_object('clueId', b.clue_id) else '{}'::jsonb end
    || case when b.type = 'resolve'
         then jsonb_build_object('requiredClueIds', to_jsonb(coalesce(b.required_clue_ids, '{}'::text[])))
         else '{}'::jsonb end
    || b.payload
$$;

create or replace function unit_to_json(u units)
returns jsonb
language sql
stable
as $$
  select jsonb_build_object(
    'id', u.id,
    'title', u.title,
    'requestLine', u.request_line,
    'beats', (
      select coalesce(jsonb_agg(beat_to_json(b) order by b.position), '[]'::jsonb)
      from beats b
      where b.unit_id = u.id
    )
  )
$$;

create or replace function stage_to_json(s stages, published_only boolean)
returns jsonb
language sql
stable
as $$
  select jsonb_build_object(
    'id', s.id,
    'areaId', s.area_id,
    'title', s.title,
    'required', s.required,
    'hasProcedure', s.has_procedure,
    'procedureImageNote', s.procedure_image_note,
    -- 移行期間限定(Phase 6で廃止): units未着手のシリーズはここに旧コンテンツが入る
    'chapters', coalesce(s.chapters, '[]'::jsonb),
    'caseSteps', coalesce(s.case_steps, '[]'::jsonb),
    'procedureSteps', (
      select coalesce(jsonb_agg(jsonb_build_object(
        'id', p.id, 'label', p.label, 'correctOrder', p.correct_order
      ) order by p.correct_order), '[]'::jsonb)
      from procedure_steps p where p.stage_id = s.id
    ),
    'clues', (
      select coalesce(jsonb_agg(jsonb_build_object(
        'id', c.id, 'name', c.name, 'summary', c.summary
      ) order by c.id), '[]'::jsonb)
      from clues c where c.stage_id = s.id
    ),
    'units', (
      select coalesce(jsonb_agg(unit_to_json(u) order by u.position), '[]'::jsonb)
      from units u
      where u.stage_id = s.id
        and (not published_only or u.published)
    )
  )
$$;

create or replace function get_curriculum(published_only boolean default true)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(jsonb_agg(stage_to_json(s, published_only) order by s.position), '[]'::jsonb)
  from stages s
  where not published_only or s.published
$$;

grant execute on function get_curriculum(boolean) to anon, authenticated;
