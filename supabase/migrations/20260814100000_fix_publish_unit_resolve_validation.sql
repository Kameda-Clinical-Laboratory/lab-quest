-- fn_publish_unit のresolveビート検証を修正する(2026-08-14)。
--
-- 発見の経緯: 溶血/採血管種類シリーズにコンテンツエディタでresolveビートを含む
-- ユニットを作成し、「公開する」を押したところ2つのバグが見つかった。
--
-- 1) 「解決ビート %s: ステップ(steps)が空です」が常に出るデッドコード。
--    resolveビートは2026-08の「1問1幕」フラット化で prompt/choices を
--    トップレベルに持つ形に変わったが(admin-content/index.tsのbeatToRow、
--    supabase/seed/seed.tsのbeatPayload()参照)、この検証だけ旧structure
--    (payload->'steps')を見たまま取り残されていた。そのため
--    resolveビートを含むユニットはUI経由では一度も公開できていなかった
--    (bio-basics-u1/u2は publish_unit を経由せず、seed.tsから
--    published=trueで直接投入されていたため気づかれていなかった)。
--
-- 2) required_clue_idsが「空配列(NULL ではない)」のresolveビートがあると、
--    `array_length('{}'::text[], 1)` がPostgresの仕様でNULLを返すため
--    `for i in 1..NULL loop` が "upper bound of FOR loop cannot be null"
--    で例外落ちする(検証結果を返す前にクラッシュする)。
--    複数resolveを連続させ、2番目以降のrequiredClueIdsを空にする運用
--    (関数冒頭のコメント通りの想定パターン)で必ず踏む。

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

  -- resolve: requiredClueIdsが全て付与済み + prompt/choices非空
  -- (2026-08の1問1幕フラット化以降、resolveビートはpayload.stepsではなく
  --  payload.prompt/payload.choicesを直接持つ。beatToRow()/beatPayload()参照)
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
    -- array_length()は空配列(NULLでない)に対してもNULLを返すため、
    -- 「NULLでない」だけでなく「要素が1件以上ある」ことも確認してからループする。
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
