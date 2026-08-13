-- 講義ビートへのPDF添付用Storageバケット(2026-08、PDF/動画添付機能)。
-- 動画はYouTube等の外部URLを貼るだけ(payload.videoUrlに保存)にして、Storage/egressの
-- 消費が大きい動画そのものはSupabaseに置かない方針。PDFはファイルサイズが小さく
-- 現実的なため、こちらだけ専用バケットにアップロードする。
--
-- public: true にして、objects向けのRLSポリシーなしで学生側から直接読める公開URLを
-- 発行できるようにする(既存の /art/* 静的画像と同じ「非機微な公開コンテンツ」の扱い)。
-- 書き込みはservice_roleを使うEdge Function(admin-content)経由のみなので、
-- INSERT/UPDATE/DELETE向けのRLSポリシーは不要(service_roleはRLSを無条件にバイパスする)。
insert into storage.buckets (id, name, public, file_size_limit)
values ('lecture-attachments', 'lecture-attachments', true, 20971520) -- 20MB上限
on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit;
