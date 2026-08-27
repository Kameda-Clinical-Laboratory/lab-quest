// シリーズ「溶血」(大項目4: 検体の性状と測定妨害 / 中項目4-A 溶血)
// ラボクエスト骨子案.md 4-A(a〜f)のうち、この改訂で b/d/e/f を新たにカバーする。
// scripts/push-series.mjs で投入する。
//
//   node scripts/push-series.mjs content/series/bio-hemolysis.mjs --dry-run
//   STAFF_FULL_PASSWORD=xxxx node scripts/push-series.mjs content/series/bio-hemolysis.mjs
//   STAFF_FULL_PASSWORD=xxxx node scripts/push-series.mjs content/series/bio-hemolysis.mjs --publish

export default {
  stageId: 'bio-hemolysis',

  clues: [
    {
      // 2026-08追加: 穴埋め型(cloze)調査カードのパイロット投入用の手がかり
      // (docs/adventure-book/HANDOFF-見習い主人公設定と調査ギミック拡張.md §3-1)。
      key: 'hemolysis-mechanism',
      name: '溶血の機序',
      summary:
        '赤血球が破壊されて内容物が血漿・血清中に漏れ出す現象。採血手技(強い駆血・細い針・急な吸引)や検体の振とう・放置が主な原因になる。',
    },
    {
      key: 'hemolysis-impact',
      // 既存clue「溶血の影響項目」と同名なので、投入時は新規作成せず既存idを再利用する
      name: '溶血の影響項目',
      summary:
        '溶血で偽高値になりやすい代表項目(K・LD・AST・Feなど)。報告前に検体性状とセットで確認する。',
    },
    {
      key: 'hemolysis-false-low',
      name: '溶血の偽低値項目',
      summary:
        '溶血で見かけ低値になりやすい項目(インスリン・ハプトグロビン・ビリルビンなど)。偽高値だけでなく偽低値もあることに注意する。',
    },
    {
      key: 'hemolysis-severity',
      name: '溶血の程度(H値)',
      summary:
        '溶血指数(H値)や目視でのグレード分類など、溶血の程度そのものを確認する手段。偽高値・偽低値の判断材料として程度も併せて見る。',
    },
  ],

  units: [
    {
      // 既存ユニットを拡充する(新規作成ではない)。2026-08、第4幕リニューアルで
      // 調査カード2枚をcipher型へ移行しフラグワード「みわけ」(見分け)を仕込んだが、
      // 実機プレイの結果「文字のかけらを並べ替える」操作自体はゲーム性も学習効果も
      // なく、謎解きが調査カードの中身(対立仮説の消去)に移った後は不要な追加操作
      // でしかないと判断し、2026-08にboard型へ差し戻した
      // (docs/adventure-book/HANDOFF-第4幕リニューアル実装.md §3は経緯として残す。
      // シリーズ作成マニュアル.md §3.5参照)。
      unitId: 'bio-hemolysis-u1',
      title: '赤く染まった検体',
      requestLine: '届いた検体がうっすら赤い。このまま報告していいか確認する',
      beats: [
        {
          id: 'bio-hemolysis-u1-d0',
          type: 'dialogue',
          xp: 5,
          title: '看護室での立ち話',
          backgroundId: 'labhall',
          lines: [
            { speaker: '技師', text: 'この検体、見て。ちょっと赤みがかってない?' },
            { speaker: '実習生', text: '本当ですね…このまま測定していいんでしょうか。' },
            {
              speaker: '技師',
              text: 'まずは溶血について教科書で確認して。起こる仕組み(機序)と、上がりやすい項目・下がりやすい項目の両方を押さえよう。',
            },
            { speaker: '技師', text: 'そのうえで、この検体をどう報告するか一緒に決めよう。' },
          ],
        },
        {
          id: 'bio-hemolysis-u1-problem',
          type: 'problem',
          xp: 5,
        },
        {
          id: 'bio-hemolysis-u1-lec',
          type: 'lecture',
          xp: 10,
          body:
            '溶血は、赤血球が壊れてヘモグロビンなどの成分が血清・血漿中に漏れ出した状態です。強い振とうや採血手技、検体の放置・遅延処理などが主な原因になります。\n\n見た目は薄いピンク〜濃い赤色まで程度差があり、多くの機器は溶血指数(H)として数値化して表示します。K・LD・AST・Feなどは赤血球内に多く含まれるため偽高値になりやすい一方、インスリンやハプトグロビンなど一部の項目は逆に偽低値として現れます。\n\nどちらも「本当の値」とは限らないため、施設が定める許容限界(H値の基準)と報告手順に沿って扱います。',
          bridge:
            '次の調査で、まず溶血が起こる仕組み(機序)を文章で確認してから、上がりやすい項目・下がりやすい項目・溶血の程度の確認方法を見ていきましょう。',
        },
        {
          // 2026-08追加: 穴埋め型(cloze)調査カードのパイロット投入(HANDOFF-見習い
          // 主人公設定と調査ギミック拡張.md §3-1)。講義本文の該当箇所を歯抜けにして
          // 「溶血の機序」を読解・定着させる。後続のinv-high(血清外観=薄赤色を根拠に
          // 使う)の前提知識になる。
          id: 'bio-hemolysis-u1-inv-mechanism',
          type: 'investigate',
          xp: 15,
          mode: 'textbook',
          required: true,
          puzzleType: 'cloze',
          purpose: '技師から「溶血について教科書で確認して」と言われた。まず、溶血がどう起こるのかを正しく説明できるか確認する',
          howTo: '教科書の「溶血」の項を読み、文中の空欄をすべてひらがなで埋める。',
          text: '溶血とは、{{blank}}が破壊されて、内部の成分が血清・血漿中に漏れ出す現象である。代表的な原因は、駆血帯を強く締めすぎる採血手技や、採血後の激しい{{blank}}、検体の放置・温度管理不良などである。',
          // 2026-08修正(clinical-content-reviewer指摘): 完全一致・ひらがな入力のため、
          // 「振とう」と読みが近い「振動(しんどう)」を選んでも不正解にならないよう
          // altAnswersで別解として許容する(どちらも激しく揺らす、という理解として妥当)。
          blanks: [
            { answer: 'せっけっきゅう' },
            { answer: 'しんとう', altAnswers: ['しんどう'] },
          ],
          clueKey: 'hemolysis-mechanism',
          demoHint: 'ヒント: 1つ目は「赤い血の細胞」、2つ目は「激しく振り動かすこと」を指す語です',
        },
        {
          // 2026-08改訂: 単語の暗記リスト選択(K・LD・AST・Feを選ぶだけ)から、
          // 「対立仮説(腎不全・横紋筋融解症)を消去する」設計に変更。
          // シリーズ作成マニュアル.md §3.5 参照。
          id: 'bio-hemolysis-u1-inv-high',
          type: 'investigate',
          xp: 15,
          mode: 'textbook',
          required: true,
          purpose:
            '同じ検体でKが5.8と高値。Ns.「腎不全や横紋筋融解症の可能性は?」と聞かれた。データを踏まえ、溶血を裏付ける根拠を選ぶ',
          howTo:
            '検査データ: K 5.8 / LD 620 / AST 85 / Cr 0.9(基準内) / BUN 14(基準内) / CK 90(基準内) / 血清外観:薄赤色。教科書で溶血による偽高値項目(K・LD・AST・Feなど)も確認したうえで判断する。',
          clueKey: 'hemolysis-impact',
          demoHint: 'ヒント: Cr・BUN・CKがいずれも基準内なら、腎不全・横紋筋融解症は考えにくい',
          choices: [
            { label: 'Cr・BUNが基準範囲内(腎不全によるK上昇は考えにくい)', correct: true },
            { label: 'CKが基準範囲内(横紋筋融解症は考えにくい)', correct: true },
            {
              label: 'K・LD・ASTがそろって上昇し、いずれも赤血球内に多い成分と一致する',
              correct: true,
            },
            { label: '血清の外観が薄赤色である', correct: true },
            { label: '体温38.5℃の発熱がある', correct: false },
            { label: '白血球数が著明に増加している', correct: false },
          ],
        },
        {
          // 2026-08改訂: 「溶血で偽低値になる項目を選ぶ」暗記から、
          // 「この検体の数値だけで溶血性貧血と決めつけられない理由」を選ぶ
          // メタな消去法に変更。ユニット全体のテーマ(検体由来か患者由来かの
          // 切り分け)と直結させた。
          id: 'bio-hemolysis-u1-inv-low',
          type: 'investigate',
          xp: 15,
          mode: 'textbook',
          required: true,
          purpose:
            'Ns.「ハプトグロビンが低くて、間接ビリルビンも高め。溶血性貧血では?」と聞かれた。この検体だけで結論づけられない理由を選ぶ',
          howTo:
            'この検体は肉眼的に薄い赤み(溶血)がある。教科書で、溶血によって偽低値になりやすい項目(インスリン・ハプトグロビン・ビリルビンなど)を確認したうえで判断する。',
          clueKey: 'hemolysis-false-low',
          demoHint:
            'ヒント: ハプトグロビンは急性相反応蛋白として炎症で上昇する一方、遊離Hbと結合して消費される働きの方が大きく働くため、低値そのものは矛盾しない。ビリルビンも含め、どちらも溶血の影響を受ける項目であり、この検体自体が溶血しているなら検体由来か患者由来か切り分けられない',
          choices: [
            { label: 'ハプトグロビンは溶血で偽低値になりうる項目である', correct: true },
            { label: '間接ビリルビンも溶血の影響を受けうる項目である', correct: true },
            {
              label: 'この検体自体が肉眼的に溶血している(検体由来か患者由来か区別できない)',
              correct: true,
            },
            {
              label: 'ハプトグロビンは炎症で上昇する急性相反応蛋白だから、低いのはおかしい',
              correct: false,
            },
            { label: '間接ビリルビンは肝機能障害でしか上昇しない', correct: false },
          ],
        },
        {
          id: 'bio-hemolysis-u1-inv-severity',
          type: 'investigate',
          xp: 15,
          mode: 'textbook',
          required: true,
          purpose:
            '偽高値・偽低値のどちらが疑われるかを見分けるには、項目の一覧だけでなく溶血がどの程度かも確認する必要があるため',
          howTo:
            '教科書・配布資料で、溶血の程度を確認する手段(溶血指数=H値、目視によるグレード分類など)を確認する。',
          clueKey: 'hemolysis-severity',
          demoHint: 'モック正解例: 溶血指数(H値)・目視によるグレード分類',
          choices: [
            { label: '溶血指数(H値)', correct: true },
            { label: '目視によるグレード分類(基準色調表との比較)', correct: true },
            { label: '黄疸指数(I値)', correct: false },
            { label: '乳び(白濁)の程度', correct: false },
          ],
        },
        {
          id: 'bio-hemolysis-u1-res1',
          type: 'resolve',
          title: '判断',
          xp: 15,
          prompt: '技師「明らかな溶血検体でKが高値。次はどうする?」',
          requiredClueKeys: ['hemolysis-impact'],
          choices: [
            {
              label: '溶血の影響を疑い、手順に沿って再採血等を検討する',
              correct: true,
              feedback: '臨床判断材料として、検体性状とセットで扱います。',
            },
            {
              label: 'そのままパニック連絡だけして終える',
              correct: false,
              feedback: '連絡と並行し、溶血の可能性も申し送りましょう。',
            },
            {
              label: '誤差の範囲として無視して報告する',
              correct: false,
              feedback: '偽高値の可能性を確認せずに報告するのは避けます。',
            },
          ],
        },
        {
          id: 'bio-hemolysis-u1-res2',
          type: 'resolve',
          title: '報告',
          xp: 15,
          prompt:
            '技師「では、この検体の結果はどう報告する? 溶血の程度と施設のルールを踏まえて考えて。」',
          requiredClueKeys: [
            'hemolysis-mechanism',
            'hemolysis-impact',
            'hemolysis-false-low',
            'hemolysis-severity',
          ],
          choices: [
            {
              label:
                '溶血の程度と自施設の報告基準(許容限界)を確認し、再採血・コメント付与・報告見合わせのいずれかを判断する',
              correct: true,
              feedback: '施設ごとに基準が異なるため、自施設の手順を優先して判断します。',
            },
            {
              label: '検体の見た目に関わらず、そのまま数値通り報告する',
              correct: false,
              feedback: '偽高値・偽低値の可能性を確認せずに報告するのは避けます。',
            },
            {
              label: '溶血に気づいた時点で、報告せず検体を廃棄する',
              correct: false,
              feedback: '報告や記録を残さずに廃棄するのは避け、手順に沿って対応します。',
            },
          ],
        },
        {
          id: 'bio-hemolysis-u1-drill',
          type: 'drill',
          xp: 20,
          questions: [
            {
              id: 'bio-hemolysis-u1-q1',
              format: 'mcq',
              prompt: '溶血の主な原因として適切なのは?',
              choices: [
                { label: '強振とうや採血手技の問題', correct: true },
                { label: '部屋の温度表示ミスのみ', correct: false },
                { label: 'プリンタ故障', correct: false },
                { label: 'バーコードの色', correct: false },
              ],
              explanation: '物理的な赤血球破壊が典型原因です。',
            },
            {
              id: 'bio-hemolysis-u1-q2',
              format: 'mcq',
              prompt: '溶血で偽高値になりやすいのはどれか(複数選択可)。',
              choices: [
                { label: 'K', correct: true },
                { label: 'LD', correct: true },
                { label: 'AST', correct: true },
                { label: 'Na', correct: false },
                { label: '血糖', correct: false },
              ],
              explanation: 'K・LD・ASTは赤血球内に多く、溶血で偽高値になりやすい代表項目です。',
            },
            {
              id: 'bio-hemolysis-u1-q3',
              format: 'mcq',
              prompt: '溶血が疑われる検体を見つけたときの最初の行動は?',
              choices: [
                { label: '検体の外観を観察し、溶血の程度を記録する', correct: true },
                { label: 'そのまま何もせず提出する', correct: false },
                { label: '検体を廃棄して報告しない', correct: false },
                { label: '色を無視して数値だけ見る', correct: false },
              ],
              explanation: '外観観察と記録が対応の入口です。',
            },
            {
              id: 'bio-hemolysis-u1-q4',
              format: 'mcq',
              prompt: '溶血で偽低値になりやすいのはどれか(複数選択可)。',
              choices: [
                { label: 'インスリン', correct: true },
                { label: 'ハプトグロビン', correct: true },
                { label: 'ビリルビン', correct: true },
                { label: 'K', correct: false },
                { label: 'AST', correct: false },
              ],
              explanation: '溶血では上がる項目だけでなく、下がって見える項目もあります。',
            },
            {
              id: 'bio-hemolysis-u1-q5',
              format: 'mcq',
              prompt: '溶血検体の報告可否を判断するとき、最も優先すべきは?',
              choices: [
                { label: '自施設の許容限界・報告手順', correct: true },
                { label: '検査者の主観的な印象だけ', correct: false },
                { label: '他の患者の結果との平均', correct: false },
                { label: '実習生の判断のみ', correct: false },
              ],
              explanation: '施設ごとに許容限界や運用が異なるため、自施設手順を優先します。',
            },
            {
              id: 'bio-hemolysis-u1-q6',
              format: 'mcq',
              prompt: '溶血の程度そのものを確認する手段として適切なのはどれか(複数選択可)。',
              choices: [
                { label: '溶血指数(H値)', correct: true },
                { label: '目視によるグレード分類', correct: true },
                { label: '黄疸指数(I値)', correct: false },
                { label: '乳び(白濁)の程度', correct: false },
              ],
              explanation:
                'H値や目視グレードは溶血そのものの程度を表す指標です。I値(黄疸)・乳びは別の測定妨害要因であり、混同しないようにします。',
            },
          ],
        },
      ],
    },
  ],
}
