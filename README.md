# 生化学免疫ラボクエスト（臨地実習モック）

院内PC向けのクリック可能モック。バックエンドなし。

> Supabaseへの本実装移行を進行中。移行計画は `.claude/plans/fizzy-greeting-castle.md`
> (このリポジトリの外、Claude Codeのプラン保存先)を参照。

## 起動

```bash
npm install
npm run dev
```

## Supabaseセットアップ(移行作業用、Phase 0)

1. `.env.local.example` を `.env.local` にコピーし、Supabaseダッシュボード
   (Project Settings > API)の値を設定する
   - `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`: フロントエンドで使用
   - `SUPABASE_SERVICE_ROLE_KEY`: シードスクリプト専用。**フロントに絶対含めない**
2. `supabase/migrations/` のSQLをSupabaseプロジェクトに適用する
   (SQL Editorに貼り付けて実行、または `supabase db push` 等)
3. `npm run db:seed` で既存モックデータ(9シリーズ・学生・スタッフ・CBT問題)を投入する
   - 既存データをtruncateしてから入れ直すため、検証用プロジェクト以外では実行しないこと

## モックログイン

| 役割 | 入り方 |
|------|--------|
| 実習生 | `TRAIN01` / `1234`（山田・6実習日）、`TRAIN02` / `5678` |
| 運用 | `/staff/login` → `ops` |
| フル | `/staff/login` → `full` |

## 今回の運用モデル

- 管理者: 氏名・パスワード・実習カレンダー → 日ごとにシリーズ 0〜N 本
- 0本の日 = 見学などアプリなし
- 未完了シリーズは翌日へ繰り越し
- 最終CBTはクリア済みシリーズの問題からランダム構成（最大30問）

山田の初期モック日付は 8/11。前日の「基礎知識」が途中のため繰り越し表示されます。
