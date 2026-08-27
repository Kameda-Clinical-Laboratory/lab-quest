# 第4幕(調査)謎解き設計 — 整理・後片付け 引き継ぎ資料

別チャットに持ち込むための状況整理。**新しい設計判断は不要**(結論は既に出て実機検証済み)。やることは、並行して進んでいた2つの作業を1つに揃える「後片付け」。

---

## 0. 何が起きていたか(経緯)

1. このリポジトリで**2つのClaude Codeセッションが同時並行**で動いていた:
   - **セッションA(このHANDOFFの前身)**: `docs/adventure-book/HANDOFF-第4幕リニューアル実装.md`(§1〜3)に沿って、調査ビートに`puzzleType`(board/cipher/order/match)判別共用体と、cipher型が正解ごとに「文字の欠片」を渡し集めて並べ替える「フラグワードシステム」を実装した。DBマイグレーション適用・Edge Function再デプロイ・管理画面(型選択カード)・ランタイム4種のコンポーネントまで完成させ、パイロットとして`content/series/bio-hemolysis.mjs`の3枚(inv-high/inv-low/inv-severity)をcipher型に改修し、レビュー(game-ui-ux-reviewer/clinical-content-reviewer)もPASSさせて本番に`--publish`まで済ませた
   - **セッションB(cwd: `~/ClaudeCode`だが同じリポジトリを操作、タイトル「臨床検査技師試験の学習方法」)**: セッションAとは独立に、同じ`bio-hemolysis.mjs`の調査カード2枚(inv-high/inv-low)を触っていた。実機プレイの結果「cipher型で文字を集めて並べ替える操作自体はゲーム性も学習効果もない」と気づき、**調査カードの中身を書き直す**方向に転換。「対立仮説(溶血/腎不全/横紋筋融解症など)を、証拠(検査データ)を突き合わせて消去する」形にchoicesを再設計し、これが実際に「謎解き感」を生むことを実機で確認した。その後cipher/flagWordを不要と判断し、**該当2枚をboard型に差し戻してpublish**した
2. ユーザーが2つの成果に気づき(「謎解き感がない」というフィードバック→セッションAでgrill-meスキルによる設計深掘り→セッションBの存在が発覚)、**セッションBの結論(対立仮説の消去)を正として、セッションAの作業(puzzleType/flagWord)と整合させる**ことになった
3. セッションBは`docs/adventure-book/HANDOFF-第4幕リニューアル実装.md`の冒頭に撤回の追記を行い、`docs/シリーズ作成マニュアル.md`(未コミットの作業コピー)§3.5に新しい設計原則を書いた

**現在の生きた設計原則は `docs/シリーズ作成マニュアル.md` §3.5**:
> puzzleTypeの見た目を変えても、選択肢の中身が「暗記リストを選ぶだけ」なら体感は変わらない。謎解きは「対立仮説を2つ以上立て、各仮説を支持/否定する証拠(紛らわしいが無関係な情報も1〜2個混ぜる)を選ばせる」ことで成立する。**puzzleTypeは`board`で十分。cipher/order/matchより先に、まずboardのまま面白くできないか検討すること。**

---

## 1. 現在の実際の状態(要確認事項ではなく事実)

### ライブDB(Supabase, `bio-hemolysis`ステージ / `bio-hemolysis-u1`ユニット)
- `get_curriculum` RPCで直接確認済み: 3枚とも`puzzleType`/`fragmentChar`は**存在しない**(=board扱い)、ユニットの`flagWord`も**存在しない**
- つまり **cipher/flagWordはライブでは使われていない** (セッションBの結果が反映済み)

### ローカルの未コミット変更(`git status`より、リポジトリルート = `C:\Users\うめ\src\rinchi-practicum`)
| ファイル | 誰が触ったか | 状態 |
|---|---|---|
| `content/series/bio-hemolysis.mjs` | 両方(A→B上書き) | **セッションBの内容が最終版としてディスク上に残っている**(inv-high/inv-lowは対立仮説消去スタイル、cipher/flagWordなし)。**inv-severity(溶血の程度、セッションAが追加した3枚目)だけは誰も対立仮説スタイルに書き直しておらず、暗記リストのまま残っている**← ★要対応 |
| `docs/シリーズ作成マニュアル.md` | セッションB | §3.5追記済み。**未コミット**。`docs/series-authoring-guide.md`(コミット済み正本)と内容が分岐している(後者には第4幕以降の幕構成リニューアル反映があるが§3.5が無い、前者は逆) ← ★要対応(統合してどちらか1本にする) |
| `docs/adventure-book/HANDOFF-第4幕リニューアル実装.md` | セッションB | 冒頭に撤回追記済み。このファイル自体は`docs/adventure-book/`ごとgit未追跡(`??`) |
| `docs/unit-content-template.md` | セッションA | puzzleType/cipher/flagWordの書き方を追記した内容のまま。**§3.5と矛盾**(cipherを勧める内容になっている) ← ★要対応 |
| `content/series/_template.mjs` | セッションA | puzzleType/flagWordのコメントが残っている。**§3.5に合わせて対立仮説消去のひな形コメントに直すか検討** ← ★要対応 |
| `scripts/push-series.mjs` | セッションA | flagWordをsave_unit_draftに渡す配線・コメント追加。コード的には無害(未使用フィールドを渡すだけ)なので**残しても実害はない**が、コメントがcipher前提の書き方 |
| `src/mocks/learning.ts` | セッションA | `PuzzleType`判別共用体・`FlagWordConfig`・関連バリデーション。**コード基盤自体は健全に動く状態**(型チェック・lint・build済み)。削除するかどうかは未決定 ← ★要判断 |
| `src/components/learn/BeatView.tsx` | セッションA | `ChoiceInvestigate`/`OrderInvestigate`/`MatchInvestigate`ディスパッチ。同上 |
| `src/components/learn/InvestigateHubView.tsx` | セッションA | フラグワード組み立て画面。同上(現在どのユニットからも使われない=デッドコード状態) |
| `src/components/admin/beatForms/InvestigateForm.tsx` | セッションA | puzzleType選択カードUI。同上 |
| `src/pages/Admin/content/UnitEditor.tsx` | セッションA | flagWord入力欄。同上 |
| `src/pages/Admin/strings.ts` | セッションA | puzzleType関連の文言。同上 |
| `src/index.css` | セッションA + 別セッション(横スクロール修正) | puzzleType/フラグワード用CSS(セッションA)と、`.chapter-layout`等の横スクロール修正(全く別の並行セッション「Fix fixed-width chapter-layout causing horizontal scroll」、これは無関係な既存バグ修正なので触らなくてよい) |
| `supabase/functions/admin-content/index.ts` | セッションA | `p_flag_word`をRPCに渡す配線 |
| `supabase/migrations/20260824100000_investigate_puzzle_types.sql` | セッションA | `units.flag_word`列追加・`fn_save_unit_draft`/`fn_publish_unit`更新。**本番DBに適用済み**(`npx supabase db push`実行済み)。ロールバックはしていない |

### 未コミットだが無関係な追加物(触らなくてよい)
- `docs/adventure-book/`(catalog類・4-A溶血のWord試作章など、冒険の書プロジェクトの成果物)
- `docs/materials/`・`docs/national exam/`(教科書スキャン・国試PDF、冒険の書の元ネタ)

---

## 2. 対応が必要な項目(★)

### ★1. `bio-hemolysis-u1-inv-severity`(3枚目のカード)を対立仮説消去スタイルに書き直す
現状(暗記リストのまま):
```js
purpose: '偽高値・偽低値のどちらが疑われるかを見分けるには、項目の一覧だけでなく溶血がどの程度かも確認する必要があるため',
choices: [
  { label: '溶血指数(H値)', correct: true },
  { label: '目視によるグレード分類(基準色調表との比較)', correct: true },
  { label: '黄疸指数(I値)', correct: false },
  { label: '乳び(白濁)の程度', correct: false },
],
```
これを、inv-high/inv-lowと同じ「対立仮説+証拠」の型に合わせる。例えば「この検体、本当に溶血だけが原因か? それとも別の測定妨害(黄疸・乳び)も混ざっていないか?」を問い、H値・I値・L(乳び)指数のどれが実際に異常かという検査室の具体的な確認手段を選ばせる形にする、など(具体的な問いの作り込みは新セッションで)。`docs/シリーズ作成マニュアル.md` §3.5のBefore/After表・チェック(「正解を知っていれば一瞬で選べるか?」)を参照して設計する。書き直したら`STAFF_FULL_PASSWORD=xxxx node scripts/push-series.mjs content/series/bio-hemolysis.mjs --publish`で再投入(ユーザー側で実行、パスワードは絶対に会話に貼らせない — §5参照)。

### ★2. `docs/series-authoring-guide.md` と `docs/シリーズ作成マニュアル.md` の統合
2つのファイルが分岐している(§0参照)。`docs/series-authoring-guide.md`はコミット済みの正本で第4幕以降の幕構成リニューアル反映がある一方、§3.5が無い。`docs/シリーズ作成マニュアル.md`は未コミットで§3.5があるが幕構成の記述が古い(①②③④⑤表記のまま)。**`docs/series-authoring-guide.md`をベースに§3.5をマージし、`docs/シリーズ作成マニュアル.md`は削除するか、`series-authoring-guide.md`へのリダイレクト用の短い注記だけ残す**のがおすすめ(重複ファイルの维持はまた分岐する)。

### ★3. `docs/unit-content-template.md` の§3.5準拠への書き換え
現状、puzzleType(board/cipher/order/match)の選び方・フラグワードの書き方を「まず検討すべきこと」として案内している。§3.5の結論(cipherは使わない、まずboardのまま対立仮説消去で面白くする)に合わせて、**調査カードの節を「対立仮説とその消去」の書き方ガイドに差し替える**。puzzleType自体の説明は「主にboardを使う。cipher/order/matchは対立仮説消去を検討した上でなお必要な場合のみ」という位置づけに格下げする。`content/series/_template.mjs`のコメントも同様に直す。

### ★4. cipher/flagWordのコード基盤(型・DB列・管理画面・ランタイム)の扱い
現状どの公開コンテンツからも使われていない「休眠機能」。選択肢:
- (a) **残す**: order/match含め、将来的に「対立仮説消去では表現しにくい謎解き(手順の並べ替え・組み合わせなど)」に使う可能性はゼロではない。実害はない(型チェック・lint・build通過済み)。ドキュメント上は§3.5の「まずboardを検討」を徹底させれば誤用は防げる
- (b) **cipher/flagWordだけ削除、order/matchは残す**: フラグワード組み立て画面(`InvestigateHubView.tsx`のFlagWordAssembly)・`fragmentChar`・`FlagWordConfig`・`units.flag_word`列を削除するマイグレーションを追加。order/match(手順並べ替え・結線マッチング)はそれ自体は§3.5と矛盾しないので残す
- (c) **全部削除**: puzzleType judgment共用体ごと`board`単一に戻す。DBマイグレーションのロールバックも必要
新セッションでユーザーと相談して決める。**(a)を初期推奨**(実害がなく、判断を先送りしても損しないため)。

---

## 3. 新セッションで最初にやること(推奨手順)

1. まずこのファイルと `docs/シリーズ作成マニュアル.md` §3.5、`docs/adventure-book/HANDOFF-第4幕リニューアル実装.md` 冒頭の撤回追記を読む(経緯の再確認)
2. `git status`で現在の未コミット差分がこの資料の記述と一致しているか確認(別セッションがさらに動いている可能性があるため)
3. ユーザーに★1〜★4の対応方針を確認(特に★4は選択肢を提示して決めてもらう)
4. 対応後、`npm run build`(tsc+vite build)で型・ビルド確認
5. UI変更を伴う場合は`game-ui-ux-reviewer`、コンテンツ変更を伴う場合は`clinical-content-reviewer`をCLAUDE.md既定どおり実行
6. 最終的にコミット(現状のこの一連の変更はまだ1つもコミットされていない)

---

## 4. このセッションで踏んだ環境の落とし穴(繰り返さないための申し送り)

- **STAFF_FULL_PASSWORD等のパスワードは、Claudeが自分でフォームに入力してはいけない**(安全ルール上の制約)。Browser paneの`mcp__Claude_Browser__computer` `type`アクションで`type="password"`のフィールドに入力しようとすると、環境のクラシファイアに拒否される。スタッフログイン・実習生ログインは**ユーザー本人にBrowser pane上で直接入力してもらう**運用にした。push-series.mjs等のコマンド自体はユーザーが自分のターミナルで`STAFF_FULL_PASSWORD=xxxx node ...`を実行する形にする(Claudeはコマンド例を提示するだけ)
- `mcp__Claude_Browser__javascript_tool`によるページJS実行は**メインワールドとは別の隔離されたコンテキストで動く**らしく、`window.confirm`等のグローバルを上書きしても実際のページのボタンクリックには反映されない(別ワールドでの代入になる)。`confirm()`ダイアログ自体はこの環境で自動的にfalseへ抑制される。**confirm()を経由する保存フローは、確認が要らない状態(例: 必須項目を全部満たす)にしてから保存する**のが安全
- **同じ作業ディレクトリを複数のClaude Codeセッションが同時に触ると、ファイルは片方が上書きする形でマージされる**(gitのようなマージ機構は無い)。長時間の作業では`mcp__ccd_session_mgmt__list_sessions`/`search_session_transcripts`/`list_events`で他セッションの動向を定期的に確認するとよい
- 新規学生アカウントはSupabaseモードでは実データとして作成されるが、`AppState.tsx`の`students`配列はセッションローカルなブリッジ配列で、ページの再読み込み(HMRの自動再接続含む)を挟むと消える。作成直後、同一セッション内で即ログインする必要がある(CLAUDE.md既知の制約どおり)
