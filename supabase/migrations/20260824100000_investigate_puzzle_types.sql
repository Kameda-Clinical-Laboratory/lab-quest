-- 第4幕(調査)リニューアル: puzzleType(board/cipher/order/match)導入 + フラグワード。
-- docs/adventure-book/HANDOFF-第4幕リニューアル実装.md セクション2・3に対応。
--
-- puzzleType自体・cipherのfragmentChar・orderのsteps・matchのpairsは、既存の
-- beats.payload jsonb にそのまま追加フィールドとして乗る(beat_to_jsonは
-- payloadを丸ごとマージしているため、この移行にDB列追加は不要)。
--
-- 新規に必要なのは、フラグワード(cipherカードで集めた文字の欠片を並べ替えて
-- 完成させる語)の答えをユニット単位で持つ場所だけ:
--   1. units.flag_word jsonb を新設(§3、{"answer": "みわけ"} のような形)
--   2. unit_to_json に flagWord として含める
--   3. fn_save_unit_draft に p_flag_word を追加(全置換保存の対象に含める)
--   4. fn_publish_unit の investigate検証をpuzzleType別に分岐 +
--      cipherカードがあるユニットはflagWordの文字集合一致を必須にする
--      (src/mocks/learning.ts の validateUnit と同じ内容、1:1移植を維持)

alter table units add column flag_word jsonb;

comment on column units.flag_word is
  'フラグワード(§3)。ユニット内にcipher型調査カードが1枚でもあれば必須。{"answer": "みわけ"} の形。';

-- ==========================================================================
-- unit_to_json: flagWordを含める
-- ==========================================================================

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
  || case when u.flag_word is not null then jsonb_build_object('flagWord', u.flag_word) else '{}'::jsonb end
$$;

-- ==========================================================================
-- fn_save_unit_draft: flag_wordも全置換保存の対象に加える(既存シグネチャは
-- 維持し、末尾に default null の新パラメータを追加するだけ — 呼び出し元は
-- named引数でRPCを呼んでいるため、この追加は後方互換)。
-- ==========================================================================

create or replace function fn_save_unit_draft(
  p_unit_id text,
  p_title text,
  p_request_line text,
  p_beats jsonb,
  p_actor_staff_id uuid,
  p_flag_word jsonb default null
) returns jsonb
language plpgsql
as $$
declare
  v_unit units%rowtype;
begin
  update units
  set title = p_title, request_line = p_request_line, flag_word = p_flag_word, updated_at = now()
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

grant execute on function fn_save_unit_draft(text, text, text, jsonb, uuid, jsonb) to service_role;

-- ==========================================================================
-- fn_publish_unit: investigate検証をpuzzleType別に分岐 + flagWord整合性検証。
-- src/mocks/learning.ts の validateUnit と同じ内容を保つ(1:1移植の方針を継続)。
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
  v_cipher_fragments text[] := '{}';
  v_puzzle_type text;
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

  -- investigate: puzzleType別の必須項目 + clueId必須。付与されるclueを収集。
  for b in select * from beats where unit_id = p_unit_id and type = 'investigate' loop
    v_puzzle_type := coalesce(b.payload->>'puzzleType', 'board');

    if v_puzzle_type in ('board', 'cipher') then
      if not (
        coalesce(jsonb_typeof(b.payload->'choices'), '') = 'array'
        and jsonb_array_length(coalesce(b.payload->'choices', '[]'::jsonb)) > 0
      ) then
        v_errors := array_append(v_errors, format('調査ビート %s: 選択肢(choices)が空です', b.id));
      elsif not exists (
        select 1 from jsonb_array_elements(b.payload->'choices') c
        where (c->>'correct')::boolean is true
      ) then
        v_errors := array_append(v_errors, format('調査ビート %s: 正解の選択肢が1つもありません', b.id));
      end if;
    end if;

    if v_puzzle_type = 'cipher' then
      if coalesce(trim(b.payload->>'fragmentChar'), '') = '' then
        v_errors := array_append(v_errors, format('調査ビート %s: 文字の欠片(fragmentChar)が空です', b.id));
      else
        v_cipher_fragments := array_append(v_cipher_fragments, trim(b.payload->>'fragmentChar'));
      end if;
    end if;

    if v_puzzle_type = 'order' then
      if not (
        coalesce(jsonb_typeof(b.payload->'steps'), '') = 'array'
        and jsonb_array_length(coalesce(b.payload->'steps', '[]'::jsonb)) >= 2
      ) then
        v_errors := array_append(v_errors, format('調査ビート %s: 手順(steps)は2件以上必要です', b.id));
      end if;
    end if;

    if v_puzzle_type = 'match' then
      if not (
        coalesce(jsonb_typeof(b.payload->'pairs'), '') = 'array'
        and jsonb_array_length(coalesce(b.payload->'pairs', '[]'::jsonb)) > 0
      ) then
        v_errors := array_append(v_errors, format('調査ビート %s: 組み合わせ(pairs)が空です', b.id));
      else
        for i in 0 .. jsonb_array_length(b.payload->'pairs') - 1 loop
          if coalesce(trim(b.payload->'pairs'->i->>'left'), '') = ''
            or coalesce(trim(b.payload->'pairs'->i->>'right'), '') = '' then
            v_errors := array_append(v_errors, format('調査ビート %s: 組み合わせ(pairs)に空欄があります', b.id));
          end if;
        end loop;
      end if;
    end if;

    if b.clue_id is null then
      v_errors := array_append(v_errors, format('調査ビート %s: 手がかり(clueId)が未設定です', b.id));
    else
      v_granted_clue_ids := array_append(v_granted_clue_ids, b.clue_id);
    end if;
  end loop;

  -- flagWord: cipherカードが1枚でもあれば必須。answerの文字集合(1文字ずつ)が
  -- 全cipherカードのfragmentCharの集合と過不足なく一致しなければならない。
  if array_length(v_cipher_fragments, 1) > 0 then
    if coalesce(trim(v_unit.flag_word->>'answer'), '') = '' then
      v_errors := array_append(v_errors, format('%s: cipher型カードがあるためflagWordが必要です', p_unit_id));
    elsif (
      select array_agg(x order by x) from unnest(string_to_array(trim(v_unit.flag_word->>'answer'), null)) x
    ) is distinct from (
      select array_agg(x order by x) from unnest(v_cipher_fragments) x
    ) then
      v_errors := array_append(
        v_errors,
        format(
          '%s: flagWord「%s」がcipherカードの文字の欠片(%s)と一致しません',
          p_unit_id, v_unit.flag_word->>'answer', array_to_string(v_cipher_fragments, '、')
        )
      );
    end if;
  end if;

  -- resolve: requiredClueIdsが全て付与済み + prompt/choices非空
  for b in select * from beats where unit_id = p_unit_id and type = 'resolve' loop
    if coalesce(trim(b.payload->>'prompt'), '') = '' then
      v_errors := array_append(v_errors, format('解決ビート %s: 設問(prompt)が空です', b.id));
    end if;
    if not (
      coalesce(jsonb_typeof(b.payload->'choices'), '') = 'array'
      and jsonb_array_length(coalesce(b.payload->'choices', '[]'::jsonb)) > 0
    ) then
      v_errors := array_append(v_errors, format('解決ビート %s: 選択肢(choices)が空です', b.id));
    end if;
    if b.required_clue_ids is not null and array_length(b.required_clue_ids, 1) > 0 then
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
