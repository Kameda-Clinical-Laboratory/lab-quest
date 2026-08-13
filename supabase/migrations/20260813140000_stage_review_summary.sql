-- シリーズふりかえりページ(旧: 手がかり図鑑)用。
-- スタッフ(full権限)がシリーズごとに「まとめ文」を書けるようにする。
-- 学生画面はこれを get_curriculum() 経由でそのまま読む(reviewSummaryフィールド)。

alter table stages add column review_summary text;
comment on column stages.review_summary is
  'スタッフが編集する、実習記録用のシリーズまとめ文(手がかり図鑑改めシリーズふりかえりページで表示)。';

-- stage_to_json に reviewSummary を追加(get_curriculum.sqlの定義を上書き)
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
    'reviewSummary', s.review_summary,
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

-- ==========================================================================
-- fn_admin_update_stage_review_summary: スタッフ編集画面からのまとめ文更新
-- ==========================================================================

create or replace function fn_admin_update_stage_review_summary(
  p_stage_id text,
  p_summary text,
  p_actor_staff_id uuid
) returns void
language plpgsql
as $$
begin
  update stages set review_summary = nullif(trim(p_summary), ''), updated_at = now()
  where id = p_stage_id;
  if not found then
    raise exception 'stage not found: %', p_stage_id;
  end if;

  insert into admin_audit_log (actor_staff_id, action, target_table, target_id, detail)
  values (p_actor_staff_id, 'update_stage_review_summary', 'stages', p_stage_id, null);
end;
$$;

grant execute on function fn_admin_update_stage_review_summary(text, text, uuid) to service_role;
