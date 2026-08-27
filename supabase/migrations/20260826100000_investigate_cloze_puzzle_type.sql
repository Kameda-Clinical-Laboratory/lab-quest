-- 調査(investigate)ビートに puzzleType: 'cloze'(穴埋め型)を追加。
-- docs/adventure-book/HANDOFF-見習い主人公設定と調査ギミック拡張.md §3-1 に対応。
--
-- text(歯抜けマーカー`{{blank}}`入りの本文)・blanks({answer: string}[])は
-- 既存のcipher/order/matchと同様、beats.payload jsonbにそのまま追加フィールドとして
-- 乗る(beat_to_json/beatToRowがpayloadを丸ごとマージするため、DB列追加は不要)。
--
-- 本マイグレーションで必要なのは fn_publish_unit の investigate検証に
-- puzzleType='cloze'の分岐を追加するのみ(src/mocks/learning.ts の validateUnit
-- と同じ内容を保つ、1:1移植の方針を継続)。

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
  v_marker_count int;
  v_blank_count int;
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

    if v_puzzle_type = 'cloze' then
      if coalesce(trim(b.payload->>'text'), '') = '' then
        v_errors := array_append(v_errors, format('調査ビート %s: 穴埋め本文(text)が空です', b.id));
      end if;
      v_blank_count := jsonb_array_length(coalesce(b.payload->'blanks', '[]'::jsonb));
      if v_blank_count = 0 then
        v_errors := array_append(v_errors, format('調査ビート %s: 空欄(blanks)が1つもありません', b.id));
      end if;
      -- 本文中の`{{blank}}`出現回数(splitして-1した個数)とblanksの件数が一致しているか
      v_marker_count := array_length(regexp_split_to_array(coalesce(b.payload->>'text', ''), '\{\{blank\}\}'), 1) - 1;
      if v_marker_count <> v_blank_count then
        v_errors := array_append(
          v_errors,
          format('調査ビート %s: 本文中の空欄マーカー数(%s)とblanksの件数(%s)が一致しません', b.id, v_marker_count, v_blank_count)
        );
      end if;
      if v_blank_count > 0 then
        for i in 0 .. v_blank_count - 1 loop
          if coalesce(trim(b.payload->'blanks'->i->>'answer'), '') = '' then
            v_errors := array_append(v_errors, format('調査ビート %s: blanks[%s]の正答が空です', b.id, i));
          elsif trim(b.payload->'blanks'->i->>'answer') !~ '^[ぁ-んー]+$' then
            v_errors := array_append(
              v_errors,
              format('調査ビート %s: blanks[%s]の正答「%s」はひらがな以外を含んでいます', b.id, i, b.payload->'blanks'->i->>'answer')
            );
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
