-- 調査(investigate)ビートの回答方式を自由入力(inputPrompt/acceptedAnswers)から
-- 選択式(choices[]、複数正解可)へ刷新したことに伴う fn_publish_unit の検証更新。
--
-- 背景: 実習生から「入力するのはむずかしい」との声を受け、調査ビートを
-- チェックボックス選択式に変更した(src/mocks/learning.ts のBeat型、
-- BeatView.tsxのInvestigateBeat、InvestigateForm.tsx参照)。payloadは
-- acceptedAnswers(string[])からchoices({label,correct}[])に置き換わった。

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

  -- investigate: choices非空 + 正解が1つ以上 + clueId必須。付与されるclueを収集。
  for b in select * from beats where unit_id = p_unit_id and type = 'investigate' loop
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
    if b.clue_id is null then
      v_errors := array_append(v_errors, format('調査ビート %s: 手がかり(clueId)が未設定です', b.id));
    else
      v_granted_clue_ids := array_append(v_granted_clue_ids, b.clue_id);
    end if;
  end loop;

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
