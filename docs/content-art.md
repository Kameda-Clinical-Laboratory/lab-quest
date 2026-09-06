# 教材画像の置き方（写真 vs イラスト）

講義本文・冒険の書・会話背景で使う画像の分担。イラストはリポジトリに入れてある。写真は当院で撮って差し込む。

## 写真の方がよい（未収録）

現場の実物を一度見ないと、色・程度・画面の読み方が定着しないもの。

| 題材 | 使う場所 | 撮り方 |
|---|---|---|
| 当院の採血管キャップ色一覧 | シリーズ2、手順シミュ | 同じ向き・同じ背景で並べ撮り。「当院の例」と明記 |
| 規定量／過少／過剰の3本 | シリーズ2 u5 | 充填線が見えるアングル |
| 遠心後の血清分離剤管（血餅／ゲル／上清） | シリーズ2 A・D | 溶血写真と同じ構図だと対比しやすい |
| 溶血グレード見本（−〜+++） | シリーズ4-A、手順シミュ | 遠心後上清。冒険の書の差し込み枠 |
| 分析装置のHインデックス画面 | シリーズ4-A | 機種固有なので「当院の例」 |
| 乳び上清（溶血と同じ日に撮れる） | 将来の4-B | 正常／溶血／乳びの3枚 |
| POCTストリップ実物（Cのみ／C+T／Cなし） | シリーズ20 | 模式図はイラスト済み。判定そのものは写真 |
| Levey-Jenningsの実データ | シリーズ8 | 模式の3パターン図はイラスト済み。実管理図は写真 |
| HPLCのA1cクロマトグラム | シリーズ11 | 実ピークが必要。模式では足りない |
| 蛋白分画のデンシトグラム | 将来の12 | 正常／M蛋白／β-γブリッジ |
| 血液ガスシリンジの気泡 | 将来の15-C | 除去前／後 |

## イラストでよい（作成済み）

仕組み・順序・対比が本題で、実物写真だと却って読みにくいもの。講義エディタの「画像を挿入」から本文へ入れられる。

| ファイル | 内容 |
|---|---|
| `public/art/figures/accuracy-precision.png` | 正確さ vs 精密さの的当て |
| `public/art/figures/levy-jennings.png` | 管理図の安定／シフト／トレンド |
| `public/art/figures/westgard-flow.png` | Westgard判定の流れ |
| `public/art/figures/traceability.png` | トレーサビリティ連鎖 |
| `public/art/figures/order-of-draw.png` | 採取順序（色は施設で違う旨を注記） |
| `public/art/figures/sandwich-competitive.png` | サンドイッチ法と競合法 |
| `public/art/figures/hook-effect.png` | フック効果の曲線 |
| `public/art/figures/immunochromatography.png` | イムノクロマトの模式 |
| `public/art/figures/anion-gap.png` | アニオンギャップ |
| `public/art/figures/delta-check.png` | デルタチェック |
| `public/art/figures/analysis-flow.png` | 装置→試薬→検体→患者 |
| `public/art/figures/ogtt-timeline.png` | 75gOGTTのタイミング |
| `public/art/figures/probnp-cleavage.png` | proBNP切断 |
| `public/art/figures/sop-hierarchy.png` | SOPの階層 |

再生成: `python3 scripts/render-content-figures.py`（matplotlib が必要）。

## アスピア立ち絵

デフォルメ全身。講義本文の右に浮かべる想定。背景は透過PNG。

表情: `public/art/aspia/chibi-{neutral,think,happy,worry,explain,determined}.png`

検査作業: `public/art/aspia/chibi-{scope,pipette,tubes,analyzer}.png`（顕微鏡・ピペット・採血管・分析装置）

## 会話背景（追加分）

既存のホール／病棟／カンファ／廊下に加えて、スタッフの会話ビート背景ピッカーから選べる。

| id | ファイル | 想定シーン |
|---|---|---|
| nightlab | `quest-dialogue-bg-nightlab.png` | パニック値・当直 |
| phlebotomy | `quest-dialogue-bg-phlebotomy.png` | 採血管シリーズ |
| centrifuge | `quest-dialogue-bg-centrifuge.png` | 前処理・溶血 |
| nursestation | `quest-dialogue-bg-nursestation.png` | 病棟からの相談 |
| reception | `quest-dialogue-bg-reception.png` | 依頼・受付 |
| courtyard | `quest-dialogue-bg-courtyard.png` | チーム医療・締め |
