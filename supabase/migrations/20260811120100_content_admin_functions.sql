-- Phase 4: 管理画面コンテンツエディタのRPC群。
--
-- 方針(既存 20260810120300_student_progress_functions.sql と同じ規約):
--   - これらの関数は service_role からのみ呼び出す(anon/authenticated には一切公開しない)。
--     PUBLICへのEXECUTE権限は既に一括REVOKE済み(20260810120300)なので、ここでは
--     service_roleへの明示GRANTのみ追加する。
--   - 呼び出し元は Edge Function(supabase/functions/admin-content)のみを想定。
--     Edge Function自体が独自JWT(APP_JWT_SECRET)を検証し、role='staff'かつ
--     staffRole='full'であることを確認してからservice_roleクライアントでこれらを呼ぶ
--     (RLSではなくEdge Function層で認可する設計。student-progressと同じ)。
--   - 各ミューテーション関数は p_actor_staff_id を受け取り admin_audit_log に1行残す。

-- ==========================================================================
-- fn_create_unit: 新規ユニット作成(既定で非公開)
-- ==========================================================================

create or replace function fn_create_unit(
  p_stage_id text,
  p_title text,
  p_request_line text,
  p_actor_staff_id uuid
) returns jsonb
language plpgsql
as $$
declare
  v_next_position int;
  v_id text;
  v_n int;
  v_unit units%rowtype;
begin
  if not exists (select 1 from stages where id = p_stage_id) then
    raise exception 'stage not found: %', p_stage_id;
  end if;

  select coalesce(max(position), -1) + 1, count(*) + 1
    into v_next_position, v_n
  from units where stage_id = p_stage_id;

  loop
    v_id := p_stage_id || '-u' || v_n;
    begin
      insert into units (id, stage_id, title, request_line, position)
      values (v_id, p_stage_id, p_title, p_request_line, v_next_position)
      returning * into v_unit;
      exit;
    exception when unique_violation then
      v_n := v_n + 1;
      if v_n > 200 then
        raise exception 'could not allocate unit id for stage %', p_stage_id;
      end if;
    end;
  end loop;

  insert into admin_audit_log (actor_staff_id, action, target_table, target_id, detail)
  values (p_actor_staff_id, 'create_unit', 'units', v_id, jsonb_build_object('stageId', p_stage_id, 'title', p_title));

  return jsonb_build_object('unit', unit_to_json(v_unit));
end;
$$;

-- ==========================================================================
-- fn_save_unit_draft: ユニット全体(タイトル/依頼文/beats)を全置換保存する。
-- 差分upsertではなく「渡された配列が新しい全体」という意味論。
-- ==========================================================================

create or replace function fn_save_unit_draft(
  p_unit_id text,
  p_title text,
  p_request_line text,
  p_beats jsonb,
  p_actor_staff_id uuid
) returns jsonb
language plpgsql
as $$
declare
  v_unit units%rowtype;
begin
  update units
  set title = p_title, request_line = p_request_line, updated_at = now()
  where id = p_unit_id
  returning * into v_unit;

  if not found then
    raise exception 'unit not found: %', p_unit_id;
  end if;

  -- 1. p_beats に無くなったidのbeatを削除
  delete from beats b
  where b.unit_id = p_unit_id
    and not exists (
      select 1 from jsonb_array_elements(p_beats) elem
      where elem->>'id' = b.id
    );

  -- 2. 既存行のpositionを一旦負数へ退避(0..n-1との衝突を避けるための2段階更新)
  update beats
  set position = -(position + 1), updated_at = now()
  where unit_id = p_unit_id;

  -- 3. p_beats の配列順そのものを新しいpositionとしてupsert
  with incoming as (
    select
      elem->>'id' as id,
      elem->>'type' as type,
      (ord - 1)::int as position,
      nullif(elem->>'xp', '')::int as xp,
      nullif(elem->>'clueId', '') as clue_id,
      case when elem ? 'requiredClueIds'
        then array(select jsonb_array_elements_text(elem->'requiredClueIds'))
        else null
      end as required_clue_ids,
      coalesce(elem->'payload', '{}'::jsonb) as payload
    from jsonb_array_elements(p_beats) with ordinality as t(elem, ord)
  )
  insert into beats (id, unit_id, type, position, xp, clue_id, required_clue_ids, payload, updated_at)
  select id, p_unit_id, type, position, xp, clue_id, required_clue_ids, payload, now()
  from incoming
  on conflict (id) do update set
    unit_id = excluded.unit_id,
    type = excluded.type,
    position = excluded.position,
    xp = excluded.xp,
    clue_id = excluded.clue_id,
    required_clue_ids = excluded.required_clue_ids,
    payload = excluded.payload,
    updated_at = now();

  insert into admin_audit_log (actor_staff_id, action, target_table, target_id, detail)
  values (
    p_actor_staff_id, 'save_unit_draft', 'units', p_unit_id,
    jsonb_build_object('beatCount', jsonb_array_length(p_beats))
  );

  return jsonb_build_object('unit', unit_to_json(v_unit));
end;
$$;

-- ==========================================================================
-- fn_reorder_units: あるstage内のunit並び順を丸ごと確定する。
-- (beatの並び替えは下書き保存(fn_save_unit_draft)のp_beats配列順に一本化しており、
--  対応する fn_reorder_beats は作らない。呼び出し経路が存在しないため)
-- ==========================================================================

create or replace function fn_reorder_units(
  p_stage_id text,
  p_ordered_ids text[],
  p_actor_staff_id uuid
) returns void
language plpgsql
as $$
declare
  v_sorted_ordered text[];
  v_sorted_current text[];
begin
  select array_agg(x order by x) into v_sorted_ordered from unnest(p_ordered_ids) x;
  select array_agg(id order by id) into v_sorted_current from units where stage_id = p_stage_id;

  if v_sorted_ordered is distinct from v_sorted_current then
    raise exception 'ordered_ids does not match current unit set for stage %', p_stage_id;
  end if;

  update units set position = -(position + 1), updated_at = now() where stage_id = p_stage_id;

  update units u
  set position = t.ord - 1, updated_at = now()
  from unnest(p_ordered_ids) with ordinality as t(id, ord)
  where u.id = t.id and u.stage_id = p_stage_id;

  insert into admin_audit_log (actor_staff_id, action, target_table, target_id, detail)
  values (p_actor_staff_id, 'reorder_units', 'units', p_stage_id, jsonb_build_object('orderedIds', to_jsonb(p_ordered_ids)));
end;
$$;

-- ==========================================================================
-- fn_publish_unit: src/mocks/learning.ts の validateUnit を1:1移植して
-- DBの beats 行から直接検証し、通ったときだけ published=true にする。
-- クライアント側のvalidateUnitはUXのための即時フィードバックに過ぎず、
-- ここがその強制力の実体。
-- ==========================================================================

create or replace function fn_publish_unit(
  p_unit_id text,
  p_actor_staff_id uuid
) returns jsonb
language plpgsql
as $$
declare
  v_unit units%rowtype;
  v_errors text[] := '{}';
  v_granted_clue_ids text[] := '{}';
  v_ok boolean;
  b record;
  i int;
begin
  select * into v_unit from units where id = p_unit_id;
  if not found then
    raise exception 'unit not found: %', p_unit_id;
  end if;

  if coalesce(trim(v_unit.request_line), '') = '' then
    v_errors := array_append(v_errors, '依頼文(requestLine)が空です');
  end if;

  -- investigate: acceptedAnswers非空 + clueId必須。付与されるclueを収集。
  for b in select * from beats where unit_id = p_unit_id and type = 'investigate' loop
    if not (
      coalesce(jsonb_typeof(b.payload->'acceptedAnswers'), '') = 'array'
      and jsonb_array_length(coalesce(b.payload->'acceptedAnswers', '[]'::jsonb)) > 0
    ) then
      v_errors := array_append(v_errors, format('調査ビート %s: 正解候補(acceptedAnswers)が空です', b.id));
    end if;
    if b.clue_id is null then
      v_errors := array_append(v_errors, format('調査ビート %s: 手がかり(clueId)が未設定です', b.id));
    else
      v_granted_clue_ids := array_append(v_granted_clue_ids, b.clue_id);
    end if;
  end loop;

  -- resolve: requiredClueIdsが全て付与済み + steps非空
  for b in select * from beats where unit_id = p_unit_id and type = 'resolve' loop
    if not (
      coalesce(jsonb_typeof(b.payload->'steps'), '') = 'array'
      and jsonb_array_length(coalesce(b.payload->'steps', '[]'::jsonb)) > 0
    ) then
      v_errors := array_append(v_errors, format('解決ビート %s: ステップ(steps)が空です', b.id));
    end if;
    if b.required_clue_ids is not null then
      for i in 1 .. array_length(b.required_clue_ids, 1) loop
        if not (b.required_clue_ids[i] = any(v_granted_clue_ids)) then
          v_errors := array_append(
            v_errors,
            format('解決ビート %s: 手がかり %s はこのユニット内の調査ビートで付与されません', b.id, b.required_clue_ids[i])
          );
        end if;
      end loop;
    end if;
  end loop;

  -- drill: questions非空
  for b in select * from beats where unit_id = p_unit_id and type = 'drill' loop
    if not (
      coalesce(jsonb_typeof(b.payload->'questions'), '') = 'array'
      and jsonb_array_length(coalesce(b.payload->'questions', '[]'::jsonb)) > 0
    ) then
      v_errors := array_append(v_errors, format('発展ビート %s: 問題(questions)が空です', b.id));
    end if;
  end loop;

  v_ok := array_length(v_errors, 1) is null;

  insert into admin_audit_log (actor_staff_id, action, target_table, target_id, detail)
  values (
    p_actor_staff_id, 'publish_unit', 'units', p_unit_id,
    jsonb_build_object('ok', v_ok, 'errorCount', coalesce(array_length(v_errors, 1), 0))
  );

  if not v_ok then
    return jsonb_build_object('ok', false, 'errors', to_jsonb(v_errors), 'unit', null);
  end if;

  update units set published = true, updated_at = now() where id = p_unit_id;
  select * into v_unit from units where id = p_unit_id;

  return jsonb_build_object('ok', true, 'errors', '[]'::jsonb, 'unit', unit_to_json(v_unit));
end;
$$;

-- ==========================================================================
-- fn_create_clue: stageにスコープした手がかりをその場作成する。
-- ==========================================================================

create or replace function fn_create_clue(
  p_stage_id text,
  p_name text,
  p_summary text,
  p_actor_staff_id uuid
) returns jsonb
language plpgsql
as $$
declare
  v_base text;
  v_id text;
  v_n int := 1;
  v_clue clues%rowtype;
begin
  if not exists (select 1 from stages where id = p_stage_id) then
    raise exception 'stage not found: %', p_stage_id;
  end if;

  v_base := trim(both '-' from regexp_replace(lower(trim(p_name)), '[^a-z0-9]+', '-', 'g'));
  if coalesce(v_base, '') = '' then
    v_base := 'clue';
  end if;

  loop
    v_id := case when v_n = 1 then 'clue-' || v_base else 'clue-' || v_base || '-' || v_n end;
    begin
      insert into clues (id, stage_id, name, summary)
      values (v_id, p_stage_id, p_name, p_summary)
      returning * into v_clue;
      exit;
    exception when unique_violation then
      v_n := v_n + 1;
      if v_n > 200 then
        raise exception 'could not allocate clue id for %', p_name;
      end if;
    end;
  end loop;

  insert into admin_audit_log (actor_staff_id, action, target_table, target_id, detail)
  values (p_actor_staff_id, 'create_clue', 'clues', v_id, jsonb_build_object('stageId', p_stage_id, 'name', p_name));

  return jsonb_build_object(
    'clue', jsonb_build_object('id', v_clue.id, 'name', v_clue.name, 'summary', v_clue.summary)
  );
end;
$$;

-- ==========================================================================
-- fn_get_unit: 単一unitの軽量再取得(ミューテーション後のUI更新用)
-- ==========================================================================

create or replace function fn_get_unit(p_unit_id text)
returns jsonb
language sql
stable
as $$
  select jsonb_build_object('unit', unit_to_json(u))
  from units u
  where u.id = p_unit_id
$$;

-- ==========================================================================
-- 権限: service_role にのみ実行権を付与
-- ==========================================================================

grant execute on function fn_create_unit(text, text, text, uuid) to service_role;
grant execute on function fn_save_unit_draft(text, text, text, jsonb, uuid) to service_role;
grant execute on function fn_reorder_units(text, text[], uuid) to service_role;
grant execute on function fn_publish_unit(text, uuid) to service_role;
grant execute on function fn_create_clue(text, text, text, uuid) to service_role;
grant execute on function fn_get_unit(text) to service_role;
