// シリーズ「患者データによる結果照合」(大項目21)
// 骨子案付録B優先度5位のシナリオ(「前回値と桁が違うクレアチニン。取り違えか、病態か」)を
// u2の判断・報告幕に反映している。
//
// 大項目21は中項目A(基準値の3概念)/B(前回値との比較)/C(項目間の整合性)/
// D(生理的・薬剤性要因の除外)/E(分析的異常か病態かの切り分け)の5本立て。
// u1=A、u2=B、u3=C、u4=D、u5=Eで全カバーする。
// A-c(パニック値)は既存シリーズ22(q22-panic-value/Critical Value)で詳しく
// カバー済みのため、ここでは「3概念のうちの1つ」として簡潔に触れるにとどめる。
//
//   node scripts/push-series.mjs content/series/q21-patient-data-check.mjs --dry-run
//   STAFF_FULL_PASSWORD=xxxx node scripts/push-series.mjs content/series/q21-patient-data-check.mjs
//   STAFF_FULL_PASSWORD=xxxx node scripts/push-series.mjs content/series/q21-patient-data-check.mjs --publish

export default {
  stageId: 'q21-patient-data-check',

  clues: [
    {
      key: 'reference-vs-clinical-decision',
      name: '基準範囲と臨床判断値の違い',
      summary:
        '基準範囲は健常者の分布から求めた統計的区間(多くは95%区間)。臨床判断値は治療開始などの臨床的意思決定のために設定された閾値(予防医学的閾値・治療閾値・病態識別値など)。',
    },
    {
      key: 'three-concepts-and-shared-range',
      name: '3概念を混同しない意義と共用基準範囲',
      summary:
        '基準範囲・臨床判断値・パニック値は目的が異なり、混同すると判断を誤る。基準範囲には複数施設共通の共用基準範囲と、施設独自の基準範囲がある。',
    },
    {
      key: 'delta-check-principle',
      name: 'デルタチェックの原理と取り違え検知',
      summary:
        'デルタチェックは前回値からの変化量・変化率・経過時間から異常な変動を検知する方法。生理的にありえない急変は患者・検体取り違えを疑うきっかけになる。',
    },
    {
      key: 'legit-change-and-delta-workflow',
      name: '治療介入による正当な変動とデルタチェック確認手順',
      summary:
        '輸血・透析・輸液・手術など治療介入でも検査値は大きく変動しうる。デルタチェック警告時はまず患者・検体の照合や治療内容の確認を行う。',
    },
    {
      key: 'electrolyte-protein-consistency',
      name: '電解質・蛋白系の項目間整合性',
      summary:
        'Na/Clの乖離はアニオンギャップ異常を、TP/Alb(A/G比)は蛋白分画異常を示唆する。低アルブミン時のCaはPayneの式などで補正して評価する。',
    },
    {
      key: 'enzyme-other-consistency',
      name: '酵素・他分野との整合性',
      summary:
        'AST・ALT・LDの組合せから障害部位を推測できる。総ビリルビンより直接ビリルビンが高い逆転は通常ありえず問題を疑う。生化学は血算・凝固・尿検査とも整合を確認する。',
    },
    {
      key: 'drug-treatment-effects',
      name: '薬剤・処置による検査値変動',
      summary:
        'ステロイド・利尿薬・スタチン・抗菌薬などの薬剤や、輸液・輸血・造影剤・透析などの処置は検査値を変動させることがある。',
    },
    {
      key: 'physiological-variation-check',
      name: '生理的変動と病的異常の見分け方',
      summary:
        '妊娠・加齢・体位などの生理的要因でも検査値は変動する。病的異常か生理的・薬剤性のものかは、服薬・処置・年齢・状態など患者背景の確認が欠かせない。',
    },
    {
      key: 'analytical-troubleshoot-order',
      name: '分析的異常の切り分け手順',
      summary:
        '分析的異常が疑われる場合、装置→試薬→検体→患者の順に確認していくのが基本的な思考手順。装置・試薬に問題がなければ検体の性状や取り違えを確認する。',
    },
    {
      key: 'report-wording-discipline',
      name: '切り分け結論の報告書への書き方',
      summary:
        '切り分けの結論をどこまで報告書に書くかは断定を避け、必要な情報にとどめるなど、自施設の方針に従う。',
    },
  ],

  units: [
    // ══════════════════════════════════════════════════════════════
    // u1: 21-A(基準値の3概念)
    // ══════════════════════════════════════════════════════════════
    {
      unitId: 'q21-patient-data-check-u1',
      title: '基準範囲内なのに治療が始まった',
      requestLine: 'コレステロール値が基準範囲内なのに、医師が治療を始めた。「基準値」の意味を整理する',
      beats: [
        {
          id: 'q21-u1-d0',
          type: 'dialogue',
          xp: 5,
          title: '検査室での疑問',
          backgroundId: 'labhall',
          lines: [
            { speaker: '実習生', text: 'この患者さん、コレステロールは基準範囲内なのに、なんで薬が出てるんですか?' },
            { speaker: '技師', text: 'いい質問だね。「基準値」と一言で言っても、実はいくつか違う意味があるんだ。' },
            {
              speaker: '技師',
              text: '基準範囲・臨床判断値・パニック値、それぞれの違いを教科書で確認して。',
            },
            { speaker: '技師', text: 'そのうえで、この患者さんにどう説明するか一緒に決めよう。' },
          ],
        },
        {
          id: 'q21-u1-problem',
          type: 'problem',
          xp: 5,
        },
        {
          id: 'q21-u1-lec',
          type: 'lecture',
          xp: 10,
          body:
            '「基準値」と呼ばれるものには、実は目的の異なる複数の概念があります。基準範囲は、健常者を測定した値の分布から統計的に求めた区間で、多くの場合その95%が含まれる範囲として設定されます。あくまで「健常者集団の目安」であり、それ自体が治療の要否を決めるものではありません。\n\n一方、臨床判断値は、治療を開始すべきか・注意が必要かなど、臨床的な意思決定のために設定された閾値で、予防医学的閾値・治療閾値・病態識別値などがあります。コレステロールのように、基準範囲内でも将来のリスクを踏まえて臨床判断値で治療が始まることがあるのはこのためです。さらにパニック値(Critical Value)は、生命に直結しうる極端な異常値を指し、これは別シリーズで詳しく扱った通り、報告の速さが特に重要になる値です。\n\nこの3つを混同すると、患者への説明や報告の判断を誤ることがあります。また基準範囲には、複数施設が共通して使う共用基準範囲と、施設が独自に設定する基準範囲があり、自施設がどちらを採用しているかを知っておくことも大切です。',
          bridge:
            '教科書で、基準範囲と臨床判断値の違い、そして3概念を混同しない意義・共用基準範囲の両方を確認し、それぞれキーワードを入力してください。',
        },
        {
          id: 'q21-u1-inv-concepts',
          type: 'investigate',
          xp: 15,
          mode: 'textbook',
          required: true,
          purpose: '基準範囲内なのに治療が始まった理由を、基準範囲と臨床判断値の違いから確認する',
          howTo: '教科書・配布資料で、基準範囲と臨床判断値の違いについて正しい記述を確認する。',
          clueKey: 'reference-vs-clinical-decision',
          demoHint: 'モック正解例: 基準範囲は健常者分布の統計的区間/臨床判断値は治療開始などの意思決定のための閾値',
          choices: [
            {
              label: '基準範囲は健常者の測定値分布から求めた統計的な区間(多くは95%区間)である',
              correct: true,
            },
            {
              label:
                '臨床判断値は治療を開始すべきかなど、臨床的な意思決定のために設定された閾値である(予防医学的閾値・治療閾値・病態識別値など)',
              correct: true,
            },
            { label: '基準範囲を外れていなければ、治療の必要は一切ない', correct: false },
            { label: '臨床判断値は基準範囲とまったく同じ考え方で決められる', correct: false },
          ],
        },
        {
          id: 'q21-u1-inv-shared',
          type: 'investigate',
          xp: 15,
          mode: 'textbook',
          required: true,
          purpose: '3つの概念を混同しない意義と、基準範囲そのものにも種類があることを確認する',
          howTo: '教科書・配布資料で、3概念を混同しない意義と共用基準範囲について正しい記述を確認する。',
          clueKey: 'three-concepts-and-shared-range',
          demoHint: 'モック正解例: 3概念は目的が異なるため混同すると判断を誤る/共用基準範囲と施設独自基準範囲がある',
          choices: [
            {
              label: '基準範囲・臨床判断値・パニック値は目的が異なるため、混同すると患者説明や報告の判断を誤ることがある',
              correct: true,
            },
            {
              label: '基準範囲には複数施設で共通して使う共用基準範囲と、施設独自に設定する基準範囲がある',
              correct: true,
            },
            { label: '3つの値は本質的に同じものであり、呼び方が違うだけである', correct: false },
            { label: '基準範囲はどの施設でも完全に同じ数値である', correct: false },
          ],
        },
        {
          id: 'q21-u1-res1',
          type: 'resolve',
          title: '判断',
          xp: 15,
          prompt: '技師「基準範囲内なのに治療が始まった。まずどう考える?」',
          requiredClueKeys: ['reference-vs-clinical-decision'],
          choices: [
            {
              label: '基準範囲と臨床判断値は目的が違うことを踏まえ、この患者の値がどちらの基準で評価されているか確認する',
              correct: true,
              feedback: '基準範囲内=正常、と単純に結びつけないことが大切です。',
            },
            {
              label: '基準範囲内なので誤った治療だと判断する',
              correct: false,
              feedback: '基準範囲と臨床判断値の違いを確認せずに判断するのは避けます。',
            },
            {
              label: '医師の判断には関与せず、特に何もしない',
              correct: false,
              feedback: '実習生として、まず自分で概念の違いを整理して理解することが大切です。',
            },
          ],
        },
        {
          id: 'q21-u1-res2',
          type: 'resolve',
          title: '報告',
          xp: 15,
          prompt: 'では、この患者さんへの説明にどう活かす? 基準範囲の考え方を踏まえて考えて。',
          requiredClueKeys: ['reference-vs-clinical-decision', 'three-concepts-and-shared-range'],
          choices: [
            {
              label:
                '自施設が採用している基準範囲(共用基準範囲か施設独自基準範囲か)を確認したうえで、基準範囲と臨床判断値の違いを踏まえて説明する',
              correct: true,
              feedback: '基準範囲の採用方針は施設ごとに異なるため、自施設の基準を確認したうえで説明します。',
            },
            {
              label: '基準範囲内という結果だけを伝え、それ以上は説明しない',
              correct: false,
              feedback: '臨床判断値との違いを踏まえずに結果だけ伝えるのは誤解を招きます。',
            },
            {
              label: '臨床判断値という概念自体を無視して、基準範囲だけで説明する',
              correct: false,
              feedback: '2つの概念の違いを踏まえない説明は避けます。',
            },
          ],
        },
        {
          id: 'q21-u1-drill',
          type: 'drill',
          xp: 20,
          questions: [
            {
              id: 'q21-u1-q1',
              format: 'mcq',
              prompt: '基準範囲の説明として最も適切なのは?',
              choices: [
                { label: '健常者の測定値分布から求めた統計的な区間(多くは95%区間)', correct: true },
                { label: '治療を開始すべきかを決める閾値', correct: false },
                { label: '生命に直結しうる極端な異常値', correct: false },
                { label: '装置メーカーが独自に決めた数値', correct: false },
              ],
              explanation: '基準範囲は健常者集団の統計的な分布から求められます。',
            },
            {
              id: 'q21-u1-q2',
              format: 'mcq',
              prompt: '基準範囲と臨床判断値に関する記述として正しいものはどれか(複数選択可)。',
              choices: [
                { label: '臨床判断値には予防医学的閾値・治療閾値・病態識別値などがある', correct: true },
                { label: '基準範囲内でも臨床判断値により治療が始まることがある', correct: true },
                { label: '基準範囲を外れていなければ治療の必要は一切ない', correct: false },
                { label: '基準範囲と臨床判断値はまったく同じ考え方で決まる', correct: false },
              ],
              explanation: '基準範囲と臨床判断値は目的が異なる別の概念です。',
            },
            {
              id: 'q21-u1-q3',
              format: 'mcq',
              prompt: '「基準値内なのに治療が始まった」ときの最初の考え方として最も適切なのは?',
              choices: [
                { label: 'この値がどちらの基準(基準範囲か臨床判断値か)で評価されているか確認する', correct: true },
                { label: '基準範囲内なので誤りだと判断する', correct: false },
                { label: '医師の判断が絶対なので何も考えない', correct: false },
                { label: '基準範囲という概念自体を無視する', correct: false },
              ],
              explanation: 'まず、どの基準で評価された値かを確認する視点が重要です。',
            },
            {
              id: 'q21-u1-q4',
              format: 'mcq',
              prompt: '共用基準範囲と施設独自の基準範囲に関する記述として正しいものはどれか(複数選択可)。',
              choices: [
                { label: '共用基準範囲は複数施設が共通して使う基準範囲である', correct: true },
                { label: '施設によっては独自に基準範囲を設定していることがある', correct: true },
                { label: '基準範囲はどの施設でも完全に同じ数値である', correct: false },
                { label: '基準範囲に種類があることは臨床的に意味がない', correct: false },
              ],
              explanation: '基準範囲には共用基準範囲と施設独自の基準範囲があります。',
            },
            {
              id: 'q21-u1-q5',
              format: 'mcq',
              prompt: '基準範囲・臨床判断値・パニック値の説明として最も優先すべきは?',
              choices: [
                { label: '自施設が採用している基準を確認したうえで、それぞれの違いを踏まえて説明すること', correct: true },
                { label: '3つをまとめて「基準値」とだけ説明すること', correct: false },
                { label: '検査者の主観的な印象だけで説明すること', correct: false },
                { label: '実習生の判断のみで説明すること', correct: false },
              ],
              explanation: '3概念の違いと自施設の基準の両方を踏まえた説明が求められます。',
            },
          ],
        },
      ],
    },

    // ══════════════════════════════════════════════════════════════
    // u2: 21-B(前回値との比較) — 骨子案付録B優先#5のシナリオ
    // ══════════════════════════════════════════════════════════════
    {
      unitId: 'q21-patient-data-check-u2',
      title: '前回値と桁が違うクレアチニン',
      requestLine: 'クレアチニンが前回値と桁違いに高い。検体取り違えか病態か判断する',
      beats: [
        {
          id: 'q21-u2-d0',
          type: 'dialogue',
          xp: 5,
          title: '前回値との落差',
          backgroundId: 'labhall',
          lines: [
            { speaker: '実習生', text: 'このクレアチニン、前回値の10倍近くあります…' },
            { speaker: '技師', text: 'それは大きな変化だね。まずデルタチェックの考え方を確認して。' },
            {
              speaker: '技師',
              text: '変化の検知の仕方と、取り違えの可能性・治療介入による正当な変動、両方を教科書で確認しよう。',
            },
            { speaker: '技師', text: 'そのうえで、このクレアチニンをどう扱うか一緒に決めよう。' },
          ],
        },
        {
          id: 'q21-u2-problem',
          type: 'problem',
          xp: 5,
        },
        {
          id: 'q21-u2-lec',
          type: 'lecture',
          xp: 10,
          body:
            'デルタチェックは、同一患者の前回値と今回値を比較し、変化量・変化率・経過時間をもとに、生理的にありえない急激な変動がないかを検知する方法です。急激すぎる変化は、患者取り違えや検体取り違えを疑うきっかけになります。\n\nただし、大きな変化がすべて取り違えを意味するわけではありません。輸血・透析・輸液・手術といった治療介入によっても、検査値は正当な理由で大きく変動することがあります。たとえば透析後にはクレアチニンが大きく下がるなど、治療内容を知っていれば説明がつく変化もあります。\n\nデルタチェックで警告が出たときは、まず患者氏名・ID・採取時刻などの照合や、直近の治療内容の確認を行うのが基本です。取り違えの可能性と治療介入による正当な変動の両方を視野に入れて対応することが求められます。',
          bridge:
            '教科書で、デルタチェックの原理・取り違え検知の考え方と、治療介入による正当な変動・警告時の確認手順の両方を確認し、それぞれキーワードを入力してください。',
        },
        {
          id: 'q21-u2-inv-delta',
          type: 'investigate',
          xp: 15,
          mode: 'textbook',
          required: true,
          purpose: '前回値との大きな乖離を前に、デルタチェックの考え方と取り違え検知の視点を確認する',
          howTo: '教科書・配布資料で、デルタチェックの原理と取り違え検知について正しい記述を確認する。',
          clueKey: 'delta-check-principle',
          demoHint: 'モック正解例: 変化量・変化率・経過時間から異常な変動を検知/急激な変動は取り違えを疑うきっかけになる',
          choices: [
            {
              label: 'デルタチェックは、前回値からの変化量や変化率、経過時間をもとに異常な変動を検知する方法である',
              correct: true,
            },
            {
              label: '生理的にありえない急激な変動は、患者取り違えや検体取り違えを疑うきっかけになる',
              correct: true,
            },
            { label: 'デルタチェックは前回値を一切参照しない方法である', correct: false },
            { label: 'どんなに大きな変化でも取り違えを疑う必要はない', correct: false },
          ],
        },
        {
          id: 'q21-u2-inv-legit',
          type: 'investigate',
          xp: 15,
          mode: 'textbook',
          required: true,
          purpose: '取り違え以外にも、大きな変動を正当に説明できる理由があることを確認する',
          howTo: '教科書・配布資料で、治療介入による正当な変動とデルタチェック警告時の確認手順について正しい記述を確認する。',
          clueKey: 'legit-change-and-delta-workflow',
          demoHint: 'モック正解例: 輸血・透析・輸液・手術でも検査値は大きく変動しうる/警告時はまず患者・検体の照合を行う',
          choices: [
            {
              label: '輸血・透析・輸液・手術など治療介入によっても、検査値が大きく変動することがある',
              correct: true,
            },
            {
              label: 'デルタチェック警告が出たときは、まず患者氏名・ID・採取時刻などの照合や治療内容の確認を行う',
              correct: true,
            },
            { label: '治療介入による変動は必ず異常値として扱う', correct: false },
            { label: 'デルタチェック警告が出たら、確認せず直ちに検体を廃棄する', correct: false },
          ],
        },
        {
          id: 'q21-u2-res1',
          type: 'resolve',
          title: '判断',
          xp: 15,
          prompt: '技師「クレアチニンが前回の桁違い。まずどうする?」',
          requiredClueKeys: ['delta-check-principle'],
          choices: [
            {
              label: '患者氏名・ID・採取時刻の照合や、透析など治療介入の有無を確認する',
              correct: true,
              feedback: '取り違えの可能性と治療介入の可能性、両方をまず確認します。',
            },
            {
              label: 'そのまま数値通り報告する',
              correct: false,
              feedback: '取り違えや治療介入の可能性を確認せずに報告するのは避けます。',
            },
            {
              label: '検体を廃棄し、特に連絡はしない',
              correct: false,
              feedback: '記録や連絡を残さず廃棄するのは避け、手順に沿って対応します。',
            },
          ],
        },
        {
          id: 'q21-u2-res2',
          type: 'resolve',
          title: '報告',
          xp: 15,
          prompt: 'では、このクレアチニンをどう扱う? 照合・確認の結果を踏まえて考えて。',
          requiredClueKeys: ['delta-check-principle', 'legit-change-and-delta-workflow'],
          choices: [
            {
              label:
                '取り違えの可能性と治療介入の可能性の両方を確認したうえで、自施設のデルタチェック確認手順に沿って報告・再検・再採血のいずれかを判断する',
              correct: true,
              feedback: 'デルタチェック警告時の確認手順は施設ごとに異なるため、自施設の手順を優先します。',
            },
            {
              label: '照合や治療内容の確認をせず、そのまま報告する',
              correct: false,
              feedback: '確認をせずに報告するのは避けます。',
            },
            {
              label: '取り違えの可能性だけを疑い、治療介入の可能性は考えない',
              correct: false,
              feedback: '取り違えと治療介入、両方の可能性を確認する必要があります。',
            },
          ],
        },
        {
          id: 'q21-u2-drill',
          type: 'drill',
          xp: 20,
          questions: [
            {
              id: 'q21-u2-q1',
              format: 'mcq',
              prompt: 'デルタチェックの説明として最も適切なのは?',
              choices: [
                { label: '前回値からの変化量・変化率・経過時間をもとに異常な変動を検知する方法', correct: true },
                { label: '管理試料の値だけを見る方法', correct: false },
                { label: '複数患者の平均値を見る方法', correct: false },
                { label: '装置の温度を記録する方法', correct: false },
              ],
              explanation: 'デルタチェックは前回値との比較に基づく方法です。',
            },
            {
              id: 'q21-u2-q2',
              format: 'mcq',
              prompt: '前回値との大きな乖離に関する記述として正しいものはどれか(複数選択可)。',
              choices: [
                { label: '生理的にありえない急激な変動は取り違えを疑うきっかけになる', correct: true },
                { label: '輸血・透析・輸液・手術などの治療介入でも大きく変動することがある', correct: true },
                { label: 'デルタチェックは前回値を一切参照しない', correct: false },
                { label: '治療介入による変動は必ず異常値として扱う', correct: false },
              ],
              explanation: '取り違えと治療介入による正当な変動、両方の可能性があります。',
            },
            {
              id: 'q21-u2-q3',
              format: 'mcq',
              prompt: 'デルタチェック警告が出たときの最初の行動として最も適切なのは?',
              choices: [
                { label: '患者氏名・ID・採取時刻の照合や治療内容の確認を行う', correct: true },
                { label: 'そのまま数値通り報告する', correct: false },
                { label: '検体を廃棄して連絡しない', correct: false },
                { label: '他の患者の結果と平均を取って評価する', correct: false },
              ],
              explanation: '照合と治療内容の確認がデルタチェック警告時の初動です。',
            },
            {
              id: 'q21-u2-q4',
              format: 'mcq',
              prompt: '検査値を正当に大きく変動させうる治療介入はどれか(複数選択可)。',
              choices: [
                { label: '透析', correct: true },
                { label: '輸血', correct: true },
                { label: '輸液', correct: true },
                { label: '問診票の記入', correct: false },
              ],
              explanation: '透析・輸血・輸液・手術などの治療介入は検査値に大きな影響を与えることがあります。',
            },
            {
              id: 'q21-u2-q5',
              format: 'mcq',
              prompt: 'デルタチェック警告後の対応を判断するとき、最も優先すべきは?',
              choices: [
                { label: '自施設のデルタチェック確認手順に従うこと', correct: true },
                { label: '検査者の主観的な印象だけで判断すること', correct: false },
                { label: '常に取り違えだと決めつけること', correct: false },
                { label: '実習生の判断のみで決めること', correct: false },
              ],
              explanation: '施設ごとに確認手順が異なるため、自施設の手順を優先します。',
            },
          ],
        },
      ],
    },

    // ══════════════════════════════════════════════════════════════
    // u3: 21-C(項目間の整合性)
    // ══════════════════════════════════════════════════════════════
    {
      unitId: 'q21-patient-data-check-u3',
      title: 'NaとClだけがずれている',
      requestLine: 'Naは正常なのにClだけ低い。項目間の整合性から原因を考える',
      beats: [
        {
          id: 'q21-u3-d0',
          type: 'dialogue',
          xp: 5,
          title: '一項目だけの違和感',
          backgroundId: 'labhall',
          lines: [
            { speaker: '実習生', text: 'Naは基準範囲内なのに、Clだけ低いんです。これって変ですか?' },
            { speaker: '技師', text: '単独の項目だけでなく、関連する項目との整合性を見る視点も大事だよ。' },
            {
              speaker: '技師',
              text: '電解質・蛋白系の関係と、酵素・他分野との整合性、両方を教科書で確認して。',
            },
            { speaker: '技師', text: 'そのうえで、この結果をどう扱うか一緒に決めよう。' },
          ],
        },
        {
          id: 'q21-u3-problem',
          type: 'problem',
          xp: 5,
        },
        {
          id: 'q21-u3-lec',
          type: 'lecture',
          xp: 10,
          body:
            '検査結果は単独の項目だけでなく、関連する項目との整合性を見ることで、より正確に解釈できます。たとえばNaとClの乖離が大きいときはアニオンギャップの異常を疑い、TPとAlbのバランス(A/G比)からは蛋白分画の異常を推測できます。またアルブミンが低い患者のCaは、見かけ上低く出やすいため、Payneの式などでアルブミン濃度により補正して評価します。\n\n酵素の分野でも、AST・ALT・LDの相互関係や、どの酵素がどの程度逸脱しているかの組合せから、障害が起きている部位を推測する手がかりになります。また、総ビリルビンより直接ビリルビンの値が高くなる(逆転する)ことは通常ありえず、測定や検体に問題がないか確認が必要です。\n\nさらに、生化学の結果は生化学の中だけで完結させず、血算・凝固・尿検査など他分野の結果ともあわせて整合性を確認します。たとえばHb低値と溶血所見の関係、腎機能と尿所見の関係などです。',
          bridge:
            '教科書で、電解質・蛋白系の項目間整合性と、酵素・他分野との整合性の両方を確認し、それぞれキーワードを入力してください。',
        },
        {
          id: 'q21-u3-inv-electrolyte',
          type: 'investigate',
          xp: 15,
          mode: 'textbook',
          required: true,
          purpose: 'NaとClの乖離のように、電解質・蛋白系の項目間の関係から原因を考える視点を確認する',
          howTo: '教科書・配布資料で、電解質・蛋白系の項目間整合性について正しい記述を確認する。',
          clueKey: 'electrolyte-protein-consistency',
          demoHint: 'モック正解例: Na/Clの乖離はアニオンギャップ異常を示唆/TP・AlbのバランスからA/G比を評価/CaはPayneの式で補正',
          choices: [
            {
              label: 'NaとClの乖離が大きいときはアニオンギャップの異常を疑う',
              correct: true,
            },
            {
              label: 'TPとAlbのバランス(A/G比)から、蛋白分画の異常を推測できる',
              correct: true,
            },
            {
              label: '低アルブミン血症があるときは、Ca値をアルブミン濃度で補正して評価する(Payneの式など)',
              correct: true,
            },
            { label: 'Na・Cl・TP・Alb・Caはそれぞれ独立していて、互いに参照する意味はない', correct: false },
          ],
        },
        {
          id: 'q21-u3-inv-enzyme',
          type: 'investigate',
          xp: 15,
          mode: 'textbook',
          required: true,
          purpose: '酵素項目の組合せや、生化学以外の検査分野との整合性を確認する',
          howTo: '教科書・配布資料で、酵素・他分野との整合性について正しい記述を確認する。',
          clueKey: 'enzyme-other-consistency',
          demoHint: 'モック正解例: AST・ALT・LDの組合せで障害部位を推測/直接ビリルビンが総ビリルビンより高いのは通常ありえない/血算等とも整合確認',
          choices: [
            {
              label: 'AST・ALT・LDの相互関係や、どの逸脱酵素が高いかの組合せから、障害部位を推測できる',
              correct: true,
            },
            {
              label: '総ビリルビンより直接ビリルビンが高くなる(逆転する)のは通常ありえず、測定や検体の問題を疑う',
              correct: true,
            },
            {
              label: '生化学の結果は、血算・凝固・尿検査など他分野の結果とあわせて整合性を確認する',
              correct: true,
            },
            { label: '生化学の検査項目は他分野の検査結果と切り離して評価してよい', correct: false },
          ],
        },
        {
          id: 'q21-u3-res1',
          type: 'resolve',
          title: '判断',
          xp: 15,
          prompt: '技師「NaとClだけずれている。まずどう考える?」',
          requiredClueKeys: ['electrolyte-protein-consistency'],
          choices: [
            {
              label: '単独項目として見るのではなく、関連する項目(この場合はアニオンギャップなど)との整合性を確認する',
              correct: true,
              feedback: '項目間の関係から原因を推測する視点が重要です。',
            },
            {
              label: 'Clの値だけを再測定して終わる',
              correct: false,
              feedback: '関連項目との整合性を確認せずに再測定だけで終えるのは避けます。',
            },
            {
              label: 'Naが正常だから問題ないと判断する',
              correct: false,
              feedback: 'Naが正常でも、Clとの関係(アニオンギャップなど)を確認する必要があります。',
            },
          ],
        },
        {
          id: 'q21-u3-res2',
          type: 'resolve',
          title: '報告',
          xp: 15,
          prompt: 'では、この結果をどう扱う? 項目間の整合性を踏まえて考えて。',
          requiredClueKeys: ['electrolyte-protein-consistency', 'enzyme-other-consistency'],
          choices: [
            {
              label:
                '項目間の整合性を確認したうえで、説明がつく生理的・病的な理由が見当たらない場合は、測定・検体の問題も含めて自施設の手順に沿って確認する',
              correct: true,
              feedback: '整合性の確認結果に応じた対応手順は施設ごとに異なるため、自施設の手順を優先します。',
            },
            {
              label: '項目間の関係を確認せず、そのまま数値通り報告する',
              correct: false,
              feedback: '整合性を確認せずに報告するのは避けます。',
            },
            {
              label: 'ずれている項目だけを削除して報告する',
              correct: false,
              feedback: '原因を確認せずに結果を削除して報告するのは避けます。',
            },
          ],
        },
        {
          id: 'q21-u3-drill',
          type: 'drill',
          xp: 20,
          questions: [
            {
              id: 'q21-u3-q1',
              format: 'mcq',
              prompt: 'NaとClの乖離が大きいときに疑うべきは?',
              choices: [
                { label: 'アニオンギャップの異常', correct: true },
                { label: '肝機能障害のみ', correct: false },
                { label: '血糖値の異常のみ', correct: false },
                { label: '装置の色調異常', correct: false },
              ],
              explanation: 'Na/Clの乖離はアニオンギャップ異常を示唆する代表的な所見です。',
            },
            {
              id: 'q21-u3-q2',
              format: 'mcq',
              prompt: '電解質・蛋白系の項目間整合性に関する記述として正しいものはどれか(複数選択可)。',
              choices: [
                { label: 'TPとAlbのバランス(A/G比)から蛋白分画の異常を推測できる', correct: true },
                { label: '低アルブミン血症時のCaはアルブミン濃度で補正して評価する', correct: true },
                { label: 'Na・Cl・TP・Alb・Caは互いにまったく関連しない', correct: false },
                { label: 'Ca値は常に補正なしでそのまま評価してよい', correct: false },
              ],
              explanation: 'これらの項目は互いに関連づけて評価することで、より正確な解釈ができます。',
            },
            {
              id: 'q21-u3-q3',
              format: 'mcq',
              prompt: '単独項目がずれているときの最初の考え方として最も適切なのは?',
              choices: [
                { label: '関連する項目との整合性を確認する', correct: true },
                { label: 'その項目だけを再測定して終える', correct: false },
                { label: '他の項目が正常なら問題ないと判断する', correct: false },
                { label: '確認せずそのまま無視する', correct: false },
              ],
              explanation: '項目間の関係から原因を推測する視点が求められます。',
            },
            {
              id: 'q21-u3-q4',
              format: 'mcq',
              prompt: '酵素・他分野との整合性に関する記述として正しいものはどれか(複数選択可)。',
              choices: [
                { label: 'AST・ALT・LDの組合せから障害部位を推測できる', correct: true },
                { label: '直接ビリルビンが総ビリルビンより高いのは通常ありえない', correct: true },
                { label: '生化学の結果は血算・凝固・尿検査と切り離して評価してよい', correct: false },
                { label: 'LD単独の値だけで障害部位を断定できる', correct: false },
              ],
              explanation: '酵素の組合せパターンや他分野の結果とあわせた整合性の確認が重要です。',
            },
            {
              id: 'q21-u3-q5',
              format: 'mcq',
              prompt: '項目間の整合性を確認しても説明がつかない結果を扱うとき、最も優先すべきは?',
              choices: [
                { label: '測定・検体の問題も含めて自施設の手順に沿って確認すること', correct: true },
                { label: '検査者の主観的な印象だけで判断すること', correct: false },
                { label: 'ずれている項目を削除して報告すること', correct: false },
                { label: '実習生の判断のみで決めること', correct: false },
              ],
              explanation: '説明がつかない結果は自施設の確認手順に沿って対応します。',
            },
          ],
        },
      ],
    },

    // ══════════════════════════════════════════════════════════════
    // u4: 21-D(生理的・薬剤性要因の除外)
    // ══════════════════════════════════════════════════════════════
    {
      unitId: 'q21-patient-data-check-u4',
      title: '異常値だけど病気じゃない?',
      requestLine: 'ある項目が基準範囲を外れているが、薬や生理的な要因かもしれない。除外すべき要因を確認する',
      beats: [
        {
          id: 'q21-u4-d0',
          type: 'dialogue',
          xp: 5,
          title: '元気そうな患者さん',
          backgroundId: 'ward',
          lines: [
            { speaker: '実習生', text: 'この値、異常なんですけど…この患者さん、元気そうに見えます。' },
            { speaker: '技師', text: 'それ、薬や生理的な要因で変動している可能性もあるよ。' },
            {
              speaker: '技師',
              text: '薬剤・処置による変動と、生理的な変動・見分け方の両方を教科書で確認して。',
            },
            { speaker: '技師', text: 'そのうえで、この異常値をどう扱うか一緒に決めよう。' },
          ],
        },
        {
          id: 'q21-u4-problem',
          type: 'problem',
          xp: 5,
        },
        {
          id: 'q21-u4-lec',
          type: 'lecture',
          xp: 10,
          body:
            '基準範囲を外れた値がすべて病的な異常を意味するとは限りません。ステロイド・利尿薬・スタチン・抗菌薬など、多くの薬剤は検査値に影響を与えることがあります。また、輸液・輸血・造影剤・透析といった処置も、検査値を変動させる要因になります。\n\nさらに、妊娠・加齢・体位(臥位か立位かなど)といった生理的な要因によっても、検査値は変動します。これらは病気によるものではなく、身体の自然な状態の変化として説明できる変動です。\n\n異常値が病的なものか、それとも生理的・薬剤性の説明がつくものかを見分けるには、服薬状況・最近の処置・年齢・妊娠の有無・体位といった患者背景を確認することが欠かせません。背景を確認せずに数値だけで判断すると、誤った解釈につながることがあります。',
          bridge:
            '教科書で、薬剤・処置による検査値変動と、生理的変動・病的異常の見分け方の両方を確認し、それぞれキーワードを入力してください。',
        },
        {
          id: 'q21-u4-inv-drug',
          type: 'investigate',
          xp: 15,
          mode: 'textbook',
          required: true,
          purpose: '薬や処置によっても検査値が変動しうることを確認する',
          howTo: '教科書・配布資料で、薬剤・処置による検査値変動について正しい記述を確認する。',
          clueKey: 'drug-treatment-effects',
          demoHint: 'モック正解例: ステロイド・利尿薬・スタチン・抗菌薬などの薬剤/輸液・輸血・造影剤・透析などの処置',
          choices: [
            {
              label: 'ステロイド・利尿薬・スタチン・抗菌薬など、多くの薬剤が検査値に影響することがある',
              correct: true,
            },
            {
              label: '輸液・輸血・造影剤・透析などの処置も検査値を変動させる要因になる',
              correct: true,
            },
            { label: '薬剤や処置は検査値にまったく影響しない', correct: false },
            { label: '薬剤の影響は服薬をやめた瞬間にすべて消える', correct: false },
          ],
        },
        {
          id: 'q21-u4-inv-physio',
          type: 'investigate',
          xp: 15,
          mode: 'textbook',
          required: true,
          purpose: '生理的な要因でも検査値が変動すること、その見分け方を確認する',
          howTo: '教科書・配布資料で、生理的変動と病的異常の見分け方について正しい記述を確認する。',
          clueKey: 'physiological-variation-check',
          demoHint: 'モック正解例: 妊娠・加齢・体位などの生理的要因でも変動する/患者背景の確認が見分け方の鍵',
          choices: [
            {
              label: '妊娠・加齢・体位(臥位/立位)などの生理的な要因でも検査値は変動する',
              correct: true,
            },
            {
              label: '異常値が病的なものか生理的・薬剤性のものかを見分けるには、患者背景(服薬・処置・年齢・状態)を確認することが欠かせない',
              correct: true,
            },
            { label: '基準範囲を外れた値は常に病的な異常とみなしてよい', correct: false },
            { label: '生理的な変動は測定誤差と同じものである', correct: false },
          ],
        },
        {
          id: 'q21-u4-res1',
          type: 'resolve',
          title: '判断',
          xp: 15,
          prompt: '技師「この異常値、まずどう考える?」',
          requiredClueKeys: ['drug-treatment-effects'],
          choices: [
            {
              label: '服薬状況や最近の処置、年齢・妊娠の有無など患者背景を確認する',
              correct: true,
              feedback: '数値だけでなく、患者背景を確認する視点が重要です。',
            },
            {
              label: '数値だけを見て、すぐに病的な異常だと判断する',
              correct: false,
              feedback: '患者背景を確認せずに病的異常と決めつけるのは避けます。',
            },
            {
              label: '患者が元気そうに見えるので、結果を報告しない',
              correct: false,
              feedback: '見た目の印象だけで報告を省略するのは避けます。',
            },
          ],
        },
        {
          id: 'q21-u4-res2',
          type: 'resolve',
          title: '報告',
          xp: 15,
          prompt: 'では、この異常値をどう扱う? 患者背景の確認結果を踏まえて考えて。',
          requiredClueKeys: ['drug-treatment-effects', 'physiological-variation-check'],
          choices: [
            {
              label: '患者背景を確認し、生理的・薬剤性の説明がつく場合はその旨を申し送りつつ、自施設の報告基準に沿って対応する',
              correct: true,
              feedback: '説明がつく変動かどうかの記載方針は施設ごとに異なるため、自施設の基準を優先します。',
            },
            {
              label: '患者背景を確認せず、そのまま数値通り報告する',
              correct: false,
              feedback: '患者背景を確認せずに報告するのは避けます。',
            },
            {
              label: '生理的な変動だと決めつけて、報告自体を省略する',
              correct: false,
              feedback: '確認結果を記録・報告せずに省略するのは避けます。',
            },
          ],
        },
        {
          id: 'q21-u4-drill',
          type: 'drill',
          xp: 20,
          questions: [
            {
              id: 'q21-u4-q1',
              format: 'mcq',
              prompt: '検査値に影響しうる薬剤として適切なものはどれか(複数選択可)。',
              choices: [
                { label: 'ステロイド', correct: true },
                { label: '利尿薬', correct: true },
                { label: 'スタチン', correct: true },
                { label: 'うがい薬', correct: false },
              ],
              explanation: 'ステロイド・利尿薬・スタチン・抗菌薬などは検査値に影響することがあります。',
            },
            {
              id: 'q21-u4-q2',
              format: 'mcq',
              prompt: '検査値を変動させうる処置として適切なものはどれか(複数選択可)。',
              choices: [
                { label: '輸液', correct: true },
                { label: '輸血', correct: true },
                { label: '透析', correct: true },
                { label: '問診', correct: false },
              ],
              explanation: '輸液・輸血・造影剤・透析などの処置は検査値を変動させることがあります。',
            },
            {
              id: 'q21-u4-q3',
              format: 'mcq',
              prompt: '異常値を見つけたときの最初の考え方として最も適切なのは?',
              choices: [
                { label: '服薬状況・処置・年齢・妊娠の有無など患者背景を確認する', correct: true },
                { label: '数値だけを見てすぐに病的異常と判断する', correct: false },
                { label: '患者が元気そうなら報告しない', correct: false },
                { label: '確認せずそのまま無視する', correct: false },
              ],
              explanation: '患者背景の確認が病的異常か否かを見分ける鍵になります。',
            },
            {
              id: 'q21-u4-q4',
              format: 'mcq',
              prompt: '生理的な変動要因として適切なものはどれか(複数選択可)。',
              choices: [
                { label: '妊娠', correct: true },
                { label: '加齢', correct: true },
                { label: '体位(臥位/立位)', correct: true },
                { label: '検査技師の勤続年数', correct: false },
              ],
              explanation: '妊娠・加齢・体位などは検査値に影響しうる生理的な要因です。',
            },
            {
              id: 'q21-u4-q5',
              format: 'mcq',
              prompt: '生理的・薬剤性の説明がつく異常値を扱うとき、最も優先すべきは?',
              choices: [
                { label: '自施設の報告基準に沿って、確認結果を申し送りつつ対応すること', correct: true },
                { label: '確認せず、そのまま数値通り報告すること', correct: false },
                { label: '生理的変動だと決めつけて報告を省略すること', correct: false },
                { label: '実習生の判断のみで決めること', correct: false },
              ],
              explanation: '確認結果の記載方針は施設ごとに異なるため、自施設の基準を優先します。',
            },
          ],
        },
      ],
    },

    // ══════════════════════════════════════════════════════════════
    // u5: 21-E(分析的異常か病態かの切り分け)
    // ══════════════════════════════════════════════════════════════
    {
      unitId: 'q21-patient-data-check-u5',
      title: 'この異常、機械のせい? 患者さんのせい?',
      requestLine: '原因不明の異常値が出た。分析的な問題か、患者の病態によるものかを切り分ける',
      beats: [
        {
          id: 'q21-u5-d0',
          type: 'dialogue',
          xp: 5,
          title: '原因不明の異常値',
          backgroundId: 'labhall',
          lines: [
            { speaker: '実習生', text: 'この異常値、原因がまったくわからないんです…' },
            { speaker: '技師', text: 'こういうときは、切り分けの手順があるよ。' },
            {
              speaker: '技師',
              text: '装置→試薬→検体→患者の順に確認する考え方と、報告書への書き方を教科書で確認して。',
            },
            { speaker: '技師', text: 'そのうえで、この異常値をどう扱うか一緒に決めよう。' },
          ],
        },
        {
          id: 'q21-u5-problem',
          type: 'problem',
          xp: 5,
        },
        {
          id: 'q21-u5-lec',
          type: 'lecture',
          xp: 10,
          body:
            '原因不明の異常値に出会ったとき、闇雲に病態を疑うのではなく、順序立てて確認することが大切です。基本的な思考手順は、装置→試薬→検体→患者の順です。まず装置に異常がないか(校正・保守状況など)、次に試薬に問題がないか(ロット・保存状態など)を確認し、それらに問題がなければ検体の性状(溶血・混濁など)や取り違えの可能性を確認します。ここまでで説明がつかなければ、初めて患者の病態を検討します。\n\nこの切り分けの結論を報告書にどこまで書くかも重要な判断です。断定的な表現は避け、必要な情報にとどめるなど、記載の範囲や踏み込み方は自施設の方針に従います。',
          bridge:
            '教科書で、切り分けの思考手順(装置→試薬→検体→患者)と、報告書への書き方の両方を確認し、それぞれキーワードを入力してください。',
        },
        {
          id: 'q21-u5-inv-order',
          type: 'investigate',
          xp: 15,
          mode: 'textbook',
          required: true,
          purpose: '原因不明の異常値を切り分けるための基本的な思考手順を確認する',
          howTo: '教科書・配布資料で、分析的異常の切り分け手順について正しい記述を確認する。',
          clueKey: 'analytical-troubleshoot-order',
          demoHint: 'モック正解例: 装置→試薬→検体→患者の順に確認する',
          choices: [
            {
              label: '分析的異常が疑われる場合は、装置→試薬→検体→患者の順に確認していくのが基本的な思考手順である',
              correct: true,
            },
            {
              label: '装置・試薬に問題がなければ、次に検体の性状(溶血・混濁など)や取り違えの可能性を確認する',
              correct: true,
            },
            { label: '原因がわからない異常値は、常にすぐ患者の病態のせいだと判断してよい', correct: false },
            { label: '装置と試薬は確認せず、いきなり患者の病態から検討してよい', correct: false },
          ],
        },
        {
          id: 'q21-u5-inv-report',
          type: 'investigate',
          xp: 15,
          mode: 'textbook',
          required: true,
          purpose: '切り分けの結論を報告書にどう書くか、その考え方を確認する',
          howTo: '教科書・配布資料で、切り分け結論の報告書への書き方について正しい記述を確認する。',
          clueKey: 'report-wording-discipline',
          demoHint: 'モック正解例: 断定を避け必要な情報にとどめる、自施設の方針に従う',
          choices: [
            {
              label: '切り分けの結論をどこまで報告書に書くかは、断定を避け必要な情報にとどめるなど、自施設の方針に従う',
              correct: true,
            },
            { label: '原因がはっきりしなくても、断定的な病名を報告書に書いてよい', correct: false },
            { label: '切り分けの過程はすべて詳細に、常に一律の書式で報告書に記載する', correct: false },
          ],
        },
        {
          id: 'q21-u5-res1',
          type: 'resolve',
          title: '判断',
          xp: 15,
          prompt: '技師「原因不明の異常値。まずどうする?」',
          requiredClueKeys: ['analytical-troubleshoot-order'],
          choices: [
            {
              label: '装置→試薬→検体→患者の順に、順を追って確認する',
              correct: true,
              feedback: '順序立てて確認することで、見落としを防げます。',
            },
            {
              label: 'いきなり患者の病態を疑って対応する',
              correct: false,
              feedback: '装置・試薬・検体を確認する前に病態を疑うのは避けます。',
            },
            {
              label: '原因不明のまま報告書を作成する',
              correct: false,
              feedback: '確認の手順を踏まずに報告書を作成するのは避けます。',
            },
          ],
        },
        {
          id: 'q21-u5-res2',
          type: 'resolve',
          title: '報告',
          xp: 15,
          prompt: 'では、切り分けの結果をどう報告書に書く? 記載の考え方を踏まえて考えて。',
          requiredClueKeys: ['analytical-troubleshoot-order', 'report-wording-discipline'],
          choices: [
            {
              label: '切り分けの結果を踏まえ、自施設の方針に沿って報告書に必要な情報を記載する(断定的な表現は避ける)',
              correct: true,
              feedback: '報告書への記載範囲は施設ごとに方針が異なるため、自施設の方針を優先します。',
            },
            {
              label: '断定的な病名を報告書に書き、確定診断のように扱う',
              correct: false,
              feedback: '検査技師が断定的な病名を報告書に書くのは避けます。',
            },
            {
              label: '切り分けの過程を報告書には一切書かない',
              correct: false,
              feedback: '必要な情報を記載せずに省略するのは避けます。',
            },
          ],
        },
        {
          id: 'q21-u5-drill',
          type: 'drill',
          xp: 20,
          questions: [
            {
              id: 'q21-u5-q1',
              format: 'mcq',
              prompt: '分析的異常の切り分けの基本的な思考手順として正しいのは?',
              choices: [
                { label: '装置→試薬→検体→患者の順に確認する', correct: true },
                { label: '患者→検体→試薬→装置の順に確認する', correct: false },
                { label: '常に患者の病態から確認する', correct: false },
                { label: '順序は決まっておらず、思いついた順でよい', correct: false },
              ],
              explanation: '装置→試薬→検体→患者の順で確認するのが基本的な思考手順です。',
            },
            {
              id: 'q21-u5-q2',
              format: 'mcq',
              prompt: '切り分けの手順に関する記述として正しいものはどれか(複数選択可)。',
              choices: [
                { label: '装置・試薬に問題がなければ検体の性状や取り違えを確認する', correct: true },
                { label: 'それでも説明がつかなければ患者の病態を検討する', correct: true },
                { label: '原因不明の異常値は常にすぐ病態のせいだと判断してよい', correct: false },
                { label: '装置と試薬の確認は省略してよい', correct: false },
              ],
              explanation: '順を追って確認し、最後に患者の病態を検討するのが基本です。',
            },
            {
              id: 'q21-u5-q3',
              format: 'mcq',
              prompt: '原因不明の異常値を見つけたときの最初の行動として最も適切なのは?',
              choices: [
                { label: '装置の状態から順に確認していく', correct: true },
                { label: 'すぐに患者の病態を疑う', correct: false },
                { label: '確認せず報告書を作成する', correct: false },
                { label: '検体を廃棄して終える', correct: false },
              ],
              explanation: '装置から順に確認していくのが基本的な初動です。',
            },
            {
              id: 'q21-u5-q4',
              format: 'mcq',
              prompt: '切り分けの結論を報告書に書くときの考え方として正しいのは?',
              choices: [
                { label: '断定を避け、必要な情報にとどめる', correct: true },
                { label: '断定的な病名を書いてよい', correct: false },
                { label: '切り分けの過程をすべて書かなくてよい理由はない', correct: false },
                { label: '常に同じ定型文だけを使えばよい', correct: false },
              ],
              explanation: '断定を避け、必要な情報にとどめて記載するのが基本です。',
            },
            {
              id: 'q21-u5-q5',
              format: 'mcq',
              prompt: '分析的異常か病態かの切り分けを判断するとき、最も優先すべきは?',
              choices: [
                { label: '順序立てた確認手順と、自施設の報告方針に沿うこと', correct: true },
                { label: '検査者の主観的な印象だけで判断すること', correct: false },
                { label: '常に患者の病態のせいだと判断すること', correct: false },
                { label: '実習生の判断のみで決めること', correct: false },
              ],
              explanation: '手順を踏んだ確認と、自施設の報告方針の両方が重要です。',
            },
          ],
        },
      ],
    },
  ],
}
