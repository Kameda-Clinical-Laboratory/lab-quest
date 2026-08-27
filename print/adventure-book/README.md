# LAB QUEST『冒険の書』表紙・背表紙

紙媒体の教科書役として使う **冒険の書** の表紙・背表紙です。横書きの左綴じを想定しています。背幅の初期値は **12 mm**（およそ 150 頁前後の目安）です。

## ファイル

| ファイル | 用途 |
|---|---|
| `cover-a4.png` | 表紙（A4・約288dpi） |
| `spine-12mm.png` | 背表紙（幅 12 mm × 高さ 297 mm） |
| `back-a4.png` | 裏表紙（A4） |
| `wrap-a4-12mm.png` | 印刷所向けの巻きカバー（裏 210 + 背 12 + 表 210 mm） |
| `wrap-preview.png` | 巻きカバーの縮小見本 |
| `冒険の書-表紙.docx` | 表紙をA4全面に置いたWord |
| `冒険の書-カバー巻き.docx` | 巻きカバーを 432 × 297 mm に置いたWord |
| `art/cover-bg.png` | 金の飾り枠＋中央に色・外側は白の背景だけ |

## Wordへの入れ方

表紙だけ使う場合:

1. `冒険の書-表紙.docx` を開く  
   または新規A4文書を作り、余白をすべて 0 mm にして `cover-a4.png` を 210 × 297 mm で挿入する
2. 2ページ目以降は通常余白に戻して本文を書く

製本用の背・裏も一緒に出す場合:

- `冒険の書-カバー巻き.docx` または `wrap-a4-12mm.png` を印刷所へ渡す（左から裏表紙・背・表紙）
- ページ数が大きく違うときは背幅を変える。目安は約 80 頁で 8 mm、約 150 頁で 12 mm、約 220 頁で 16 mm

## デザインの考え方

- **白ベース**で、色は中央に置く。外周は純白へ溶かし、白い紙に印刷したときに余白との境目が出ないようにしている
- 背表紙も左右（表紙・裏表紙との接合）と天地を白へ溶かし、縦書きで **冒険の書** が読めるようにしている
- **ラボクエストのロゴ** を表紙上部の徽章として置く
- 下部の薄いフラスコは「書の封蝋」代わり。角の金の飾り枠は手帳・冒険日誌の合図

## 文言

- 徽章: LAB QUEST / Biochemistry and Immunology（ロゴ画像のまま）
- 英語ラベル: THE BOOK OF ADVENTURE
- メイン: 冒険の書
- サブ: 臨地実習の手引き
- キャッチ: 検査室は、冒険の拠点になる
- フッタ: CLINICAL PRACTICUM / 生化学・免疫検査　臨地実習（学校名に差し替えてよい）
- 背: LAB QUEST / 冒険の書 / 臨地実習

## 色と字体

| 役割 | 色 | Wordでの字体の目安 |
|---|---|---|
| 本文タイトル「冒険の書」 | `#143532` | 游明朝 / Zen Antique Soft / ヒラギノ明朝 58 pt、字間広め |
| サブ・キャッチ | `#3d5a54` / `#1a5f56` | 同じ明朝 12–14 pt |
| 英語ラベル・金の飾り | `#6b5a28` / `#c9a24a` | 游ゴシック 9.5 pt、字間を広く |
| ロゴ下地（参考） | `#0d2a27` 系 | ロゴは画像のまま使う |
| 背のタイトル | `#143532` | 游明朝 15 pt 相当、縦書き |

アプリ側のトークン: 金 `#d4a017`、羊皮紙 `#f3e6c4`、ティール `#1a9b8a`。表紙ではこれらを **ごく薄く** 白へ溶かす。

## 再出力

日本語フォント（Zen Antique Soft / IBM Plex Sans JP）を `fonts/` に置いたうえで:

```bash
print/adventure-book/render-panel.sh cover
print/adventure-book/render-panel.sh spine
print/adventure-book/render-panel.sh back
python3 print/adventure-book/compose-wrap.py
pip install python-docx
python3 print/adventure-book/build-docx.py
```
