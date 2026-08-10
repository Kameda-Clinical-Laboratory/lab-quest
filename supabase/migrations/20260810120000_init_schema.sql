-- LAB QUEST: 初期スキーマ
-- 計画書 C:\Users\うめ\.claude\plans\fizzy-greeting-castle.md セクションA に対応。
--
-- 方針:
--   - stages/units/beats/clues/cbt_questions/procedure_steps は人間可読な text 主キー
--     (既存モックの id をそのまま踏襲。DayPlan.seriesIds 等が安定キーとして参照するため)
--   - students/staff/consent_records/admin_audit_log は uuid 主キー
--   - このマイグレーションではテーブル定義とRLS有効化(deny-by-default)のみ行う。
--     RPC関数(complete_beat, start_cbt, publish_unit, get_curriculum 等)は
--     Phase 1〜4の各マイグレーションで追加し、そこでRLS/権限を配線する。
--   - pg_cron の有効化はプロジェクト単位の拡張機能(ダッシュボードのDatabase > Extensions)
--     で行うため、このファイルでは触れない。

create extension if not exists pgcrypto;

-- ==========================================================================
-- staff / students
-- ==========================================================================

create table staff (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role text not null check (role in ('full', 'ops')),
  password_hash text not null,
  created_at timestamptz not null default now()
);

create sequence student_code_seq start 1;

create table students (
  id uuid primary key default gen_random_uuid(),
  code text not null,
  name text not null,
  password_hash text not null,
  consent_at timestamptz,
  anonymized_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- コードは大文字小文字を無視して一意(現行 loginStudent のコード照合を踏襲)
create unique index students_code_lower_idx on students (lower(code));

-- ==========================================================================
-- day_plans (旧 Student.dayPlans / visitDates)
-- ==========================================================================

create table day_plans (
  student_id uuid not null references students (id) on delete cascade,
  date date not null,
  series_ids text[] not null default '{}',
  note text,
  primary key (student_id, date)
);

-- ==========================================================================
-- stages (旧 Stage) / procedure_steps (旧 ProcedureStep, Stage形状から独立)
-- ==========================================================================

create table stages (
  id text primary key,
  area_id text not null check (area_id in ('biochem', 'immuno')),
  title text not null,
  required boolean not null default true,
  has_procedure boolean not null default false,
  procedure_image_note text,
  published boolean not null default true,
  position int not null default 0,
  -- 移行期間限定カラム(Phase 6で削除): 旧chapters/caseStepsモデルの一時退避先
  chapters jsonb,
  case_steps jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on column stages.chapters is '移行期間限定。全シリーズがunits化されたらPhase 6でカラムごと削除。';
comment on column stages.case_steps is '移行期間限定。全シリーズがunits化されたらPhase 6でカラムごと削除。';

create table procedure_steps (
  id text primary key,
  stage_id text not null references stages (id) on delete cascade,
  label text not null,
  correct_order int not null
);

-- ==========================================================================
-- units / clues / beats (新学習モデル)
-- ==========================================================================

create table units (
  id text primary key,
  stage_id text not null references stages (id) on delete cascade,
  title text not null,
  request_line text not null,
  published boolean not null default false,
  position int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table clues (
  id text primary key,
  stage_id text not null references stages (id) on delete cascade,
  name text not null,
  summary text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table beats (
  id text primary key,
  unit_id text not null references units (id) on delete cascade,
  type text not null check (type in ('dialogue', 'lecture', 'investigate', 'resolve', 'drill')),
  position int not null default 0,
  xp int,
  -- investigate ビートのみ使用
  clue_id text references clues (id) on delete restrict,
  -- resolve ビートのみ使用(配列要素はアプリ/RPC層で存在検証。DBレベルのFKは張れない)
  required_clue_ids text[],
  -- 残りのフィールド(dialogue.lines / lecture.body,bridge / investigate.mode,purpose,...
  -- / resolve.steps / drill.questions)はここに格納
  payload jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index beats_unit_position_idx on beats (unit_id, position);

-- ==========================================================================
-- cbt_questions (旧 CbtQuestion)
-- ==========================================================================

create table cbt_questions (
  id text primary key,
  source_stage_id text not null references stages (id) on delete cascade,
  prompt text not null,
  choices text[] not null,
  correct_index int not null,
  explanation text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ==========================================================================
-- student_progress / student_stage_clears
-- ==========================================================================

create table student_progress (
  student_id uuid primary key references students (id) on delete cascade,
  cleared_beat_ids text[] not null default '{}',
  owned_clue_ids text[] not null default '{}',
  unit_cursors jsonb not null default '{}',
  xp int not null default 0,
  stamps int not null default 0,
  cbt_submitted boolean not null default false,
  cbt_answers jsonb not null default '{}',
  cbt_score int,
  cbt_retake_allowed boolean not null default false,
  cbt_drawn_ids text[] not null default '{}',
  cbt_scope_stage_ids text[] not null default '{}',
  cleared_procedure_stage_ids text[] not null default '{}',
  -- 移行期間限定カラム(Phase 6で削除)
  cleared_chapter_ids text[] not null default '{}',
  cleared_case_stage_ids text[] not null default '{}',
  updated_at timestamptz not null default now()
);

comment on column student_progress.cleared_chapter_ids is '移行期間限定。Phase 6で削除。';
comment on column student_progress.cleared_case_stage_ids is '移行期間限定。Phase 6で削除。';

create table student_stage_clears (
  student_id uuid not null references students (id) on delete cascade,
  stage_id text not null references stages (id) on delete cascade,
  cleared_at timestamptz not null default now(),
  primary key (student_id, stage_id)
);

-- ==========================================================================
-- consent_records / app_config / admin_audit_log
-- ==========================================================================

create table consent_records (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references students (id) on delete cascade,
  consented_at timestamptz not null default now(),
  consent_version text not null
);

create table app_config (
  key text primary key,
  value jsonb not null
);

insert into app_config (key, value) values ('retention_days', '365');

create table admin_audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_staff_id uuid references staff (id),
  action text not null,
  target_table text not null,
  target_id text,
  detail jsonb,
  created_at timestamptz not null default now()
);

-- ==========================================================================
-- RLS: いったん全テーブルで有効化し、ポリシーは各フェーズのマイグレーションで
-- SECURITY DEFINER なRPC/Edge Function経由のアクセスに限定して追加していく
-- (直接のテーブル読み書きはデフォルト拒否)。
-- ==========================================================================

alter table staff enable row level security;
alter table students enable row level security;
alter table day_plans enable row level security;
alter table stages enable row level security;
alter table procedure_steps enable row level security;
alter table units enable row level security;
alter table clues enable row level security;
alter table beats enable row level security;
alter table cbt_questions enable row level security;
alter table student_progress enable row level security;
alter table student_stage_clears enable row level security;
alter table consent_records enable row level security;
alter table app_config enable row level security;
alter table admin_audit_log enable row level security;
