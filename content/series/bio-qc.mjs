// シリーズ「精度管理」(大項目8: 内部精度管理 + 大項目9: 外部精度評価と標準化。
// docs/series-roadmap.md「要決定」1を、ユーザー指示により1本のシリーズにまとめる
// 方針で解消した)
// 既存stage bio-qcは旧chapters/caseSteps(オリエンテーション級の薄い内容)のみで、
// 新形式(beats)のユニットはu1〜u3(初回投入、大項目8のみ)まで済んでいた。
// 今回u4〜u7を追加投入し、大項目8・9を1シリーズとして完結させる。
//
// 表示順(fn_reorder_unitsで並び替え、unitId自体は既存互換のため変更しない):
//   u4(概要・内部と外部の違い) → u3(誤差論) → u1(管理図法) → u2(患者データ法)
//   → u5(9-A外部精度評価) → u6(9-B標準化とトレーサビリティ) → u7(9-C施設間差と方法間差)
// ユーザーからのフィードバック(「いきなり2SD外れたと言われても分からない」)を受け、
// 概要ユニットを新設して先頭に配置し、かつ誤差論(SD・系統誤差/偶然誤差の基礎語彙)を
// 管理図法(2-2sなどのルールが登場するu1)より前に読む順序へ変更した。
//
// 骨子案付録B優先度4位のシナリオ(「朝の管理試料が2-2sに触れた。患者結果を出して
// よいか決める」)は表示順3番目のu1(管理図法)の判断・報告幕に反映している。
//
// 大項目8(内部精度管理)は中項目A(管理図法)/B(患者データを用いる方法)/C(誤差論)の
// 3本立て(u1=A、u2=B、u3=C)。
// 大項目9(外部精度評価と標準化)は中項目A(外部精度評価)/B(標準化とトレーサビリティ)/
// C(施設間差と方法間差)の3本立て(u5=A、u6=B、u7=C)。
//
//   node scripts/push-series.mjs content/series/bio-qc.mjs --dry-run
//   STAFF_FULL_PASSWORD=xxxx node scripts/push-series.mjs content/series/bio-qc.mjs
//   STAFF_FULL_PASSWORD=xxxx node scripts/push-series.mjs content/series/bio-qc.mjs --publish
//
// 投入後、表示順を反映するために一回限りのfn_reorder_units呼び出しが必要
// (service_role keyで直接、または admin-content 経由。このファイル自体には
// reorder用のコードは含まない)。

export default {
  stageId: 'bio-qc',

  clues: [
    {
      key: 'lj-chart-shift-trend',
      name: 'Levey-Jennings管理図とシフト・トレンド',
      summary:
        'Levey-Jennings管理図は管理試料の値を平均値±SDの線とともに時系列でプロットしたもの。一方向に連続してずれる変化(シフト・トレンド)は系統誤差を示唆する。',
    },
    {
      key: 'westgard-multirule',
      name: 'Westgardマルチルール',
      summary:
        '1-3s(1点が3SD超)・2-2s(連続2点が同側で2SD超)など複数のルールを組み合わせて管理限界からの逸脱を判定する方法。',
    },
    {
      key: 'delta-cusum',
      name: 'デルタチェック法とCUSUM',
      summary:
        'デルタチェック法は同一患者の前回値との差が異常に大きい場合に異常を疑う方法。CUSUM(累積和法)は小さな系統的ずれを積算して検出する方法。',
    },
    {
      key: 'patient-mean-cross-check',
      name: '正常値平均法と項目間チェック法',
      summary:
        '正常値平均法(患者データ平均法)は多数の患者データの平均が安定していることを利用して機器の変動を検知する方法。項目間チェック法は生理的に関連する複数項目間の整合性を確認する方法。',
    },
    {
      key: 'error-classification-accuracy-precision',
      name: '誤差の分類と正確さ・精密さの区別',
      summary:
        '誤差は系統誤差・偶然誤差・過失誤差に大別される。正確さ(trueness)は真の値への近さ、精密さ(precision)はばらつきの小ささを表す、別の概念。',
    },
    {
      key: 'repeatability-reproducibility',
      name: '併行精度と室内再現精度',
      summary:
        '併行精度は同一条件下(同日・同一検査者など)での繰り返し測定のばらつき。室内再現精度は日・検査者・試薬ロットなど条件が変わっても含めた、より長期的なばらつき。',
    },
    {
      key: 'internal-vs-external-qc-purpose',
      name: '内部精度管理と外部精度評価の目的の違い',
      summary:
        '内部精度管理(IQC)は自施設内で日常的に行い、管理試料や患者データを用いて日々の測定のブレをリアルタイムで検知する。外部精度評価(EQA)は第三者機関のサーベイに参加し、他施設・target値と比較することで自施設だけでは気づけない系統的なズレを検出する。',
    },
    {
      key: 'qc-overall-framework',
      name: '精度管理の全体像(内部と外部の補完関係)',
      summary:
        '内部精度管理は主に精密さ(precision)を、外部精度評価は主に正確さ(trueness)を確認する役割分担と整理されることが多い。内部が正常でも外部評価で初めて明らかになる施設固有のズレがありうるため、両者は互いを代替できず組み合わせて初めて精度管理の環が完成する。',
    },
    {
      key: 'external-qc-survey-and-indicators',
      name: '外部精度評価サーベイの流れと評価指標',
      summary:
        '日臨技・日本医師会・都道府県などが主催するサーベイは、試料配布→測定→提出→評価報告の流れで行われる。SDIやZ-scoreは自施設の値がtarget値からどれだけ離れているかを、集団の標準偏差(SD)を単位として標準化した指標。評価点はSDIやZ-scoreなど乖離の大きさをもとに点数化した指標で、乖離が大きいほど低い点数になるよう設計されることが多い。',
    },
    {
      key: 'poor-evaluation-response',
      name: '不良評価時の原因追及と是正',
      summary:
        '外部精度評価で不良評価を受けた場合、まず自施設の内部精度管理の記録を遡り同時期の管理図逸脱の有無を確認し、装置・試薬・キャリブレーション等の原因を系統的に洗い出して是正処置を行い記録を残す。',
    },
    {
      key: 'traceability-and-reference-materials',
      name: 'トレーサビリティ連鎖と標準物質の階層',
      summary:
        'トレーサビリティ連鎖とは、一次標準物質から二次標準物質を経て、日常検査で実際に使う常用標準物質へと、段階的に値の正確さを伝達していく仕組み。認証標準物質(CRM)は値と不確かさが公的な手続きで認証された標準物質を指す用語で、階層の独立した1段階ではなく、一次・二次いずれの標準物質にも当てはまりうる性質を表す。',
    },
    {
      key: 'standardized-methods-and-shared-reference-range',
      name: '標準化された測定法と共用基準範囲',
      summary:
        'JSCC勧告法やIFCC準拠法など測定法が標準化されることで施設間の値を比較できるようになる。ALPのIFCC法移行のように測定法の変更は基準範囲自体の変化につながることがあり、共用基準範囲は測定法が標準化されていることを前提に複数施設で同じ基準範囲を用いる考え方。',
    },
    {
      key: 'inter-facility-and-inter-method-difference',
      name: '施設間差・方法間差が生じる理由',
      summary:
        '同一項目でも測定原理・試薬・機器メーカーの違いなどにより施設間で値が異なることがある。検査値の標準化が進むことで施設をまたいでも一貫した臨床判断がしやすくなる。',
    },
    {
      key: 'instrument-changeover-correlation-and-explanation',
      name: '機器更新時の相関試験と患者への説明',
      summary:
        '機器や試薬を更新する際は新旧の測定法で同じ検体を測定する相関試験を行い系統的なズレの有無を確認する。前回値との差が測定法の違いによるものである場合は、病態の変化ではないことを患者・臨床にわかりやすく説明する。',
    },
  ],

  units: [
    // ══════════════════════════════════════════════════════════════
    // u1: 8-A(管理図法)
    // ══════════════════════════════════════════════════════════════
    {
      unitId: 'bio-qc-u1',
      title: '朝のQCが2-2sに触れた',
      requestLine: '朝の管理試料の値が2-2sルールに触れた。患者結果をこのまま出してよいか判断する',
      beats: [
        {
          id: 'bio-qc-u1-d0',
          type: 'dialogue',
          xp: 5,
          title: '朝の管理試料',
          backgroundId: 'labhall',
          lines: [
            { speaker: '技師', text: '朝のQC、2-2sに触れてるね。気づいた?' },
            { speaker: '実習生', text: 'あ…グラフ見てませんでした。これ、大丈夫なんですか?' },
            {
              speaker: '技師',
              text: 'まずはLevey-Jennings管理図の見方と、Westgardマルチルールを教科書で確認して。系統誤差・偶然誤差の見分け方もね。',
            },
            { speaker: '技師', text: 'そのうえで、今日の患者結果をどう扱うか一緒に決めよう。' },
          ],
        },
        {
          id: 'bio-qc-u1-problem',
          type: 'problem',
          xp: 5,
        },
        {
          id: 'bio-qc-u1-lec',
          type: 'lecture',
          xp: 10,
          body:
            'Levey-Jennings管理図は、管理試料を繰り返し測定した値を、平均値と標準偏差(SD)の線とともに時系列でグラフ化したものです。日々のQC結果をこの図にプロットすることで、装置・試薬が安定して測れているかを一目で確認できます。\n\nこの管理図の逸脱を判定する代表的な手法がWestgardマルチルールです。まず1-2s(1点が平均から2SDを超える)は「警告ルール」で、これ自体は即座に管理外れとはみなさず、他のルールを詳しく確認するきっかけになります。実際に管理外れと判定する「棄却ルール」には、1-3s(1点が平均から3SDを超える)、2-2s(連続する2点が同じ側で2SDを超える)、R-4s(連続する2点の差が4SDを超える)、4-1s・10xなどがあり、これらを組み合わせることで単一の基準では見逃しやすい異常も検出します。\n\n管理図の逸脱パターンからは、系統誤差(一方向への連続したずれ=シフトやトレンド)と偶然誤差(ランダムなばらつき)を見分けることができ、原因調査の手がかりになります。',
          bridge:
            '教科書で、Levey-Jennings管理図とシフト・トレンドの考え方、そしてWestgardマルチルールの両方を確認し、それぞれキーワードを入力してください。',
        },
        {
          id: 'bio-qc-u1-inv-lj',
          type: 'investigate',
          xp: 15,
          mode: 'textbook',
          required: true,
          purpose: '管理図の逸脱パターンから系統誤差と偶然誤差を見分ける考え方を確認する',
          howTo: '教科書・配布資料で、Levey-Jennings管理図とシフト・トレンドについて正しい記述を確認する。',
          clueKey: 'lj-chart-shift-trend',
          demoHint: 'モック正解例: 管理試料を平均値±SDの線とともに時系列でプロット/一方向の連続したずれは系統誤差を示唆する',
          choices: [
            {
              label:
                'Levey-Jennings管理図は、管理試料の測定値を平均値±標準偏差(SD)の線とともに時系列でプロットしたものである',
              correct: true,
            },
            {
              label: '測定値が一方向に連続してずれていく変化はシフトやトレンドと呼ばれ、系統誤差を示唆する',
              correct: true,
            },
            { label: 'Levey-Jennings管理図では管理試料を測定しなくてもよい', correct: false },
            { label: '偶然誤差は必ず同じ方向に値がずれる現象である', correct: false },
          ],
        },
        {
          id: 'bio-qc-u1-inv-westgard',
          type: 'investigate',
          xp: 15,
          mode: 'textbook',
          required: true,
          purpose: '朝のQCが触れた「2-2s」というルールの意味と、他の代表的なルールを確認する',
          howTo: '教科書・配布資料で、Westgardマルチルールの代表的なルールについて正しい記述を確認する。',
          clueKey: 'westgard-multirule',
          demoHint: 'モック正解例: 1-3sは1点が3SD超/2-2sは連続2点が同側で2SD超',
          choices: [
            {
              label: '1-3sルールは、1点が平均から3SDを超えたら管理外れとみなすルールである',
              correct: true,
            },
            {
              label: '2-2sルールは、連続する2点が同じ側で2SDを超えたら管理外れとみなすルールである',
              correct: true,
            },
            { label: 'Westgardマルチルールは1つのルールのみで構成される', correct: false },
            { label: 'R-4sルールは、測定値が平均値ちょうどに一致したときに適用される', correct: false },
          ],
        },
        {
          id: 'bio-qc-u1-res1',
          type: 'resolve',
          title: '判断',
          xp: 15,
          prompt: '技師「朝のQC、2-2sに触れてる。まずどうする?」',
          requiredClueKeys: ['westgard-multirule'],
          choices: [
            {
              label: '装置・試薬・キャリブレーションなど原因を確認し、解消するまで患者結果の報告を保留する',
              correct: true,
              feedback: '管理外れのまま報告を進めると、誤った患者結果を出す危険があります。',
            },
            {
              label: 'そのまま患者結果を報告する',
              correct: false,
              feedback: '管理外れの原因を確認せずに報告するのは避けます。',
            },
            {
              label: 'QCを無視して次の患者検体の測定に進む',
              correct: false,
              feedback: 'QC逸脱を無視して測定を続けるのは避けます。',
            },
          ],
        },
        {
          id: 'bio-qc-u1-res2',
          type: 'resolve',
          title: '報告',
          xp: 15,
          prompt: 'では、この状況をどう扱う? 原因確認の結果を踏まえて考えて。',
          requiredClueKeys: ['lj-chart-shift-trend', 'westgard-multirule'],
          choices: [
            {
              label:
                '原因を特定・是正し、QCが管理内に収まったことを確認したうえで、自施設の手順に沿って報告を再開する(保留していた分の遡及確認も検討する)',
              correct: true,
              feedback:
                '原因調査・是正・再確認・遡及確認のどこまでを求めるかは施設ごとに手順が異なるため、自施設のルールを優先します。',
            },
            {
              label: '原因を確認せず、時間が経ったので報告を再開する',
              correct: false,
              feedback: '原因を特定・是正せずに報告を再開するのは避けます。',
            },
            {
              label: '管理外れを記録に残さず、なかったことにする',
              correct: false,
              feedback: '記録を残さないのは避け、手順に沿って対応します。',
            },
          ],
        },
        {
          id: 'bio-qc-u1-drill',
          type: 'drill',
          xp: 20,
          questions: [
            {
              id: 'bio-qc-u1-q1',
              format: 'mcq',
              prompt: 'Levey-Jennings管理図の説明として最も適切なのは?',
              choices: [
                {
                  label: '管理試料の測定値を平均値±SDの線とともに時系列でプロットしたグラフ',
                  correct: true,
                },
                { label: '患者結果だけをプロットしたグラフ', correct: false },
                { label: '試薬の在庫数を記録するグラフ', correct: false },
                { label: '装置の稼働時間を記録するグラフ', correct: false },
              ],
              explanation: '管理試料の値を平均値・SDの線とともに時系列でプロットするのがLevey-Jennings管理図です。',
            },
            {
              id: 'bio-qc-u1-q2',
              format: 'mcq',
              prompt: 'Westgardマルチルールに関する記述として正しいものはどれか(複数選択可)。',
              choices: [
                { label: '1-3sルールは、1点が平均から3SDを超えたときに適用される', correct: true },
                { label: '2-2sルールは、連続する2点が同じ側で2SDを超えたときに適用される', correct: true },
                { label: 'Westgardマルチルールは1つのルールのみで構成される', correct: false },
                { label: 'すべてのルールは1点の逸脱だけで判定する', correct: false },
              ],
              explanation: '複数のルールを組み合わせることで、単一基準では見逃しやすい異常も検出できます。',
            },
            {
              id: 'bio-qc-u1-q3',
              format: 'mcq',
              prompt: '朝のQCが管理限界を外れたときの最初の行動として最も適切なのは?',
              choices: [
                { label: '装置・試薬・キャリブレーションなど原因を確認する', correct: true },
                { label: 'そのまま患者結果を報告する', correct: false },
                { label: 'QCを無視して次の検体に進む', correct: false },
                { label: '管理試料を交換せず再測定だけ繰り返す', correct: false },
              ],
              explanation: '報告前にまず原因を確認するのが初動です。',
            },
            {
              id: 'bio-qc-u1-q4',
              format: 'mcq',
              prompt: '系統誤差と偶然誤差に関する記述として正しいものはどれか(複数選択可)。',
              choices: [
                { label: '一方向に連続してずれていく変化(シフト・トレンド)は系統誤差を示唆する', correct: true },
                { label: '偶然誤差はランダムなばらつきとして現れる', correct: true },
                { label: '偶然誤差は必ず同じ方向にずれる', correct: false },
                { label: '系統誤差と偶然誤差はまったく同じ現象である', correct: false },
              ],
              explanation: '系統誤差は一方向のずれ、偶然誤差はランダムなばらつきとして現れます。',
            },
            {
              id: 'bio-qc-u1-q5',
              format: 'mcq',
              prompt: 'QC逸脱後の報告再開を判断するとき、最も優先すべきは?',
              choices: [
                { label: '原因を特定・是正し、自施設の手順に沿って確認すること', correct: true },
                { label: '時間が経てば自動的に再開してよいこと', correct: false },
                { label: '検査者の主観的な印象だけで判断すること', correct: false },
                { label: '実習生の判断のみで決めること', correct: false },
              ],
              explanation: '原因調査・是正・確認の手順は施設ごとに異なるため、自施設のルールを優先します。',
            },
          ],
        },
      ],
    },

    // ══════════════════════════════════════════════════════════════
    // u2: 8-B(患者データを用いる方法)
    // ══════════════════════════════════════════════════════════════
    {
      unitId: 'bio-qc-u2',
      title: 'QC試料がまだ届いていない',
      requestLine: '今日は管理試料の到着が遅れている。患者データだけで異常を検知する方法を確認する',
      beats: [
        {
          id: 'bio-qc-u2-d0',
          type: 'dialogue',
          xp: 5,
          title: '届かない管理試料',
          backgroundId: 'labhall',
          lines: [
            { speaker: '実習生', text: '今日、管理試料がまだ届いていないみたいです…どうしましょう?' },
            { speaker: '技師', text: 'それなら、患者データを使って異常を見つける方法があるよ。' },
            {
              speaker: '技師',
              text: 'デルタチェック法やCUSUM、正常値平均法、項目間チェック法を教科書で確認して。機器管理法との使い分けもね。',
            },
            { speaker: '技師', text: 'そのうえで、今日の運用をどうするか一緒に決めよう。' },
          ],
        },
        {
          id: 'bio-qc-u2-problem',
          type: 'problem',
          xp: 5,
        },
        {
          id: 'bio-qc-u2-lec',
          type: 'lecture',
          xp: 10,
          body:
            '内部精度管理には、管理試料を使う機器管理法のほかに、実際の患者データを使って異常を検知する方法もあります。デルタチェック法は、同一患者の前回値と今回値の差(デルタ)が異常に大きい場合に、検体の取り違えや測定異常を疑う方法です。累積和法(CUSUM)は、1回ごとには小さいずれでも、時間をかけて積算することで系統的なずれを検出する方法です。\n\n正常値平均法(患者データ平均法)は、多数の患者データの平均値が本来安定していることを利用し、その平均が大きくずれたときに機器の変動を疑う方法です。項目間チェック法は、生理的に関連する複数の検査項目(たとえばNaとCl、AST とALTなど)の値の整合性を確認する方法です。\n\nこれらの患者データを用いる方法は、管理試料が使えない場面でも異常を検知できる利点がありますが、あくまで機器管理法を補う手段です。どちらを使うべきかの判断は国試でも頻出のポイントです。',
          bridge:
            '教科書で、デルタチェック法・CUSUMと、正常値平均法・項目間チェック法の両方を確認し、それぞれキーワードを入力してください。',
        },
        {
          id: 'bio-qc-u2-inv-delta',
          type: 'investigate',
          xp: 15,
          mode: 'textbook',
          required: true,
          purpose: '管理試料がなくても患者データから異常を検知する代表的な方法を確認する',
          howTo: '教科書・配布資料で、デルタチェック法とCUSUM(累積和法)について正しい記述を確認する。',
          clueKey: 'delta-cusum',
          demoHint: 'モック正解例: デルタチェックは前回値との差が異常な検体を疑う/CUSUMは小さなずれを積算して検出する',
          choices: [
            {
              label:
                'デルタチェック法は、同一患者の前回値と今回値の差(デルタ)が異常に大きい場合に検体取り違えや測定異常を疑う方法である',
              correct: true,
            },
            {
              label: '累積和法(CUSUM)は、小さな系統的ずれを積算して検出する方法である',
              correct: true,
            },
            { label: 'デルタチェック法は患者データを一切使わない方法である', correct: false },
            { label: 'CUSUMは1回の測定値だけで判定する方法である', correct: false },
          ],
        },
        {
          id: 'bio-qc-u2-inv-mean',
          type: 'investigate',
          xp: 15,
          mode: 'textbook',
          required: true,
          purpose: 'ほかにも患者データを使った異常検知の方法があることを確認する',
          howTo: '教科書・配布資料で、正常値平均法と項目間チェック法について正しい記述を確認する。',
          clueKey: 'patient-mean-cross-check',
          demoHint: 'モック正解例: 正常値平均法は多数患者の平均の安定性を利用/項目間チェック法は関連項目の整合性を確認',
          choices: [
            {
              label: '正常値平均法(患者データ平均法)は、多数の患者データの平均値が安定していることを利用して機器の変動を検知する',
              correct: true,
            },
            {
              label: '項目間チェック法は、生理的に関連する複数項目間の整合性を確認する方法である',
              correct: true,
            },
            { label: '正常値平均法は必ず1人の患者データだけで判定する方法である', correct: false },
            { label: '項目間チェック法は単一項目だけを見て判定する方法である', correct: false },
          ],
        },
        {
          id: 'bio-qc-u2-res1',
          type: 'resolve',
          title: '判断',
          xp: 15,
          prompt: '技師「QC試料がまだ届かない。まずどうする?」',
          requiredClueKeys: ['delta-cusum'],
          choices: [
            {
              label:
                'デルタチェックや項目間チェックなど、患者データを用いる方法で異常な結果がないか確認しながら報告可否を判断する',
              correct: true,
              feedback: '管理試料がなくても、患者データを使った方法で異常検知を続けることができます。',
            },
            {
              label: 'QCなしでもいつも通り報告する',
              correct: false,
              feedback: '何の確認もせずに報告するのは避けます。',
            },
            {
              label: 'QCが届くまで検査室の作業をすべて止める',
              correct: false,
              feedback: '患者データを用いる方法で代替できる場面では、作業を止める前に検討します。',
            },
          ],
        },
        {
          id: 'bio-qc-u2-res2',
          type: 'resolve',
          title: '報告',
          xp: 15,
          prompt: 'では、この日の運用をどう扱う? 患者データ法と機器管理法の使い分けを踏まえて考えて。',
          requiredClueKeys: ['delta-cusum', 'patient-mean-cross-check'],
          choices: [
            {
              label:
                '患者データを用いる方法はあくまで補助的な代替手段として使い、管理試料が届き次第、機器管理法(管理図法)での確認も行う(自施設の運用手順に従う)',
              correct: true,
              feedback: '患者データ法と機器管理法の使い分けは国試でも頻出のポイントで、互いを補完する関係にあります。',
            },
            {
              label: '患者データ法だけで十分なので、以後は管理試料での確認を省略する',
              correct: false,
              feedback: '患者データ法は機器管理法の代わりを恒常的に務めるものではありません。',
            },
            {
              label: '今日の分の記録を特に残さない',
              correct: false,
              feedback: '運用の記録を残さないのは避け、手順に沿って対応します。',
            },
          ],
        },
        {
          id: 'bio-qc-u2-drill',
          type: 'drill',
          xp: 20,
          questions: [
            {
              id: 'bio-qc-u2-q1',
              format: 'mcq',
              prompt: 'デルタチェック法の説明として最も適切なのは?',
              choices: [
                {
                  label: '同一患者の前回値と今回値の差(デルタ)が異常に大きい場合に異常を疑う方法',
                  correct: true,
                },
                { label: '複数患者の平均値だけを見る方法', correct: false },
                { label: '管理試料のみを使う方法', correct: false },
                { label: '装置の温度を記録する方法', correct: false },
              ],
              explanation: 'デルタチェック法は同一患者の前回値との差に着目します。',
            },
            {
              id: 'bio-qc-u2-q2',
              format: 'mcq',
              prompt: '患者データを用いる方法に関する記述として正しいものはどれか(複数選択可)。',
              choices: [
                { label: 'CUSUM(累積和法)は小さな系統的ずれを積算して検出する', correct: true },
                { label: '正常値平均法は多数の患者データの平均の安定性を利用する', correct: true },
                { label: 'デルタチェック法は患者データを一切使わない', correct: false },
                { label: '項目間チェック法は単一項目だけを見て判定する', correct: false },
              ],
              explanation: 'CUSUMと正常値平均法はいずれも患者データの集積を利用する方法です。',
            },
            {
              id: 'bio-qc-u2-q3',
              format: 'mcq',
              prompt: '管理試料が使えないときの最初の行動として最も適切なのは?',
              choices: [
                { label: '患者データを用いる方法で異常な結果がないか確認する', correct: true },
                { label: '確認せずにいつも通り報告する', correct: false },
                { label: '検査室の作業をすべて止める', correct: false },
                { label: '過去の任意の日の結果をそのまま流用する', correct: false },
              ],
              explanation: '患者データを用いる方法で代替の異常検知を試みるのが初動です。',
            },
            {
              id: 'bio-qc-u2-q4',
              format: 'mcq',
              prompt: '項目間チェック法の説明として最も適切なのは?',
              choices: [
                { label: '生理的に関連する複数項目間の値の整合性を確認する方法', correct: true },
                { label: '同一項目を複数回測定して平均を取る方法', correct: false },
                { label: '管理試料を複数ロット比較する方法', correct: false },
                { label: '患者の年齢だけで異常を判定する方法', correct: false },
              ],
              explanation: '関連する項目同士の整合性を見るのが項目間チェック法です。',
            },
            {
              id: 'bio-qc-u2-q5',
              format: 'mcq',
              prompt: '患者データ法と機器管理法の使い分けとして最も適切なのは?',
              choices: [
                { label: '患者データ法は機器管理法を補う手段として使い、両方を組み合わせる', correct: true },
                { label: '患者データ法があれば機器管理法は不要になる', correct: false },
                { label: '機器管理法があれば患者データ法は不要になる', correct: false },
                { label: 'どちらか一方だけを恒常的に選べばよい', correct: false },
              ],
              explanation: '両者は互いを補完する関係にあり、使い分け・併用が国試でも問われるポイントです。',
            },
          ],
        },
      ],
    },

    // ══════════════════════════════════════════════════════════════
    // u3: 8-C(誤差論)
    // ══════════════════════════════════════════════════════════════
    {
      unitId: 'bio-qc-u3',
      title: '同じ検体なのに値が微妙に違う',
      requestLine: '同じ検体を繰り返し測定すると、毎回微妙に違う値が出る。この現象をどう説明し扱うか確認する',
      beats: [
        {
          id: 'bio-qc-u3-d0',
          type: 'dialogue',
          xp: 5,
          title: '繰り返し測定の疑問',
          backgroundId: 'labhall',
          lines: [
            { speaker: '実習生', text: '同じ検体なのに、測るたびに値が微妙に違うんです…これって大丈夫なんですか?' },
            { speaker: '技師', text: 'いい気づきだね。まず誤差の考え方を整理しよう。' },
            {
              speaker: '技師',
              text: '誤差の分類、正確さと精密さの違い、併行精度と室内再現精度を教科書で確認して。',
            },
            { speaker: '技師', text: 'そのうえで、この検体の測定値をどう扱うか一緒に決めよう。' },
          ],
        },
        {
          id: 'bio-qc-u3-problem',
          type: 'problem',
          xp: 5,
        },
        {
          id: 'bio-qc-u3-lec',
          type: 'lecture',
          xp: 10,
          body:
            '測定には常に何らかの誤差が伴います。誤差は大きく、系統誤差(一定方向に偏るずれ)・偶然誤差(ランダムなばらつき)・過失誤差(操作ミスなど本来あってはならない誤り)の3つに分類されます。\n\nここで区別しておきたいのが、正確さ(trueness)と精密さ(precision)です。正確さは測定値が真の値にどれだけ近いかを表し、精密さは繰り返し測定したときの値のばらつきの小ささを表します。この2つは別の概念で、精密さが高くても正確さが低い(いつも同じようにずれる)ことも、その逆もありえます。\n\n精密さを評価する指標には、同一条件下(同日・同一検査者など)での繰り返し測定のばらつきを表す併行精度と、日・検査者・試薬ロットなど条件が変わっても含めたより長期的なばらつきを表す室内再現精度があります。さらに近年は、測定値のばらつきを「不確かさ(uncertainty)」という数値化された指標として見積もる考え方も重視されています。不確かさは単に「ばらつきがある」という漠然とした事実ではなく、測定値に合理的に帰属しうる値の散らばりの範囲を、統計的な手法で定量的に見積もったものです。',
          bridge:
            '教科書で、誤差の分類と正確さ・精密さの区別、そして併行精度と室内再現精度の両方を確認し、それぞれキーワードを入力してください。',
        },
        {
          id: 'bio-qc-u3-inv-error',
          type: 'investigate',
          xp: 15,
          mode: 'textbook',
          required: true,
          purpose: '同じ検体で値がばらつく現象を、誤差の考え方から整理する',
          howTo: '教科書・配布資料で、誤差の分類と正確さ・精密さの区別について正しい記述を確認する。',
          clueKey: 'error-classification-accuracy-precision',
          demoHint: 'モック正解例: 誤差は系統誤差・偶然誤差・過失誤差に大別/正確さと精密さは別の概念',
          choices: [
            {
              label: '誤差は系統誤差・偶然誤差・過失誤差の3つに大別される',
              correct: true,
            },
            {
              label: '正確さ(trueness)は真の値への近さ、精密さ(precision)はばらつきの小ささを表す、別の概念である',
              correct: true,
            },
            { label: '正確さと精密さはまったく同じ意味の言葉である', correct: false },
            { label: '偶然誤差は原因を完全に取り除くことができる誤差である', correct: false },
          ],
        },
        {
          id: 'bio-qc-u3-inv-precision',
          type: 'investigate',
          xp: 15,
          mode: 'textbook',
          required: true,
          purpose: '精密さを評価する具体的な指標を確認する',
          howTo: '教科書・配布資料で、併行精度と室内再現精度について正しい記述を確認する。',
          clueKey: 'repeatability-reproducibility',
          demoHint: 'モック正解例: 併行精度は同一条件下のばらつき/室内再現精度は条件が変わっても含めたばらつき',
          choices: [
            {
              label: '併行精度は同一条件下(同日・同一検査者など)で繰り返し測定したときのばらつきを表す',
              correct: true,
            },
            {
              label: '室内再現精度は、日や検査者、試薬ロットなどの条件が変わっても含めた、より長期的なばらつきを表す',
              correct: true,
            },
            { label: '併行精度と室内再現精度はまったく同じ条件を指す', correct: false },
            { label: '不確かさは測定値の絶対的な正しさを保証する指標である', correct: false },
          ],
        },
        {
          id: 'bio-qc-u3-res1',
          type: 'resolve',
          title: '判断',
          xp: 15,
          prompt: '技師「同じ検体なのに値が微妙に違う。まずどう考える?」',
          requiredClueKeys: ['error-classification-accuracy-precision'],
          choices: [
            {
              label: '偶然誤差の範囲内かどうか(許容される精密さの範囲内か)を確認する',
              correct: true,
              feedback: '微小なばらつきは偶然誤差として通常起こりうるため、許容範囲内かをまず確認します。',
            },
            {
              label: '装置が壊れていると即断して修理を呼ぶ',
              correct: false,
              feedback: 'いきなり故障と決めつける前に、許容範囲内の偶然誤差かどうかを確認します。',
            },
            {
              label: '複数回測った中で一番低い値を採用する',
              correct: false,
              feedback: '恣意的に値を選ぶのではなく、精度の考え方に基づいて判断します。',
            },
          ],
        },
        {
          id: 'bio-qc-u3-res2',
          type: 'resolve',
          title: '報告',
          xp: 15,
          prompt: 'では、この検体の測定値をどう扱う? 精度の考え方を踏まえて考えて。',
          requiredClueKeys: ['error-classification-accuracy-precision', 'repeatability-reproducibility'],
          choices: [
            {
              label:
                '併行精度・室内再現精度など自施設で定めた許容範囲内であれば通常通り報告し、範囲を外れていれば原因を調査する',
              correct: true,
              feedback: '許容範囲の設定は施設ごとに異なるため、自施設の基準に沿って判断します。',
            },
            {
              label: 'ばらつきの大きさに関わらず、常に平均値を報告する',
              correct: false,
              feedback: '許容範囲を確認せずに一律の処理をするのは避けます。',
            },
            {
              label: 'ばらつきを理由に、この検体の結果はすべて破棄する',
              correct: false,
              feedback: '許容範囲内のばらつきまで一律に破棄するのは避けます。',
            },
          ],
        },
        {
          id: 'bio-qc-u3-drill',
          type: 'drill',
          xp: 20,
          questions: [
            {
              id: 'bio-qc-u3-q1',
              format: 'mcq',
              prompt: '誤差の分類として正しい組み合わせは?',
              choices: [
                { label: '系統誤差・偶然誤差・過失誤差', correct: true },
                { label: '系統誤差・機器誤差・患者誤差', correct: false },
                { label: '偶然誤差のみ', correct: false },
                { label: '正確さ誤差・精密さ誤差', correct: false },
              ],
              explanation: '誤差は系統誤差・偶然誤差・過失誤差の3つに大別されます。',
            },
            {
              id: 'bio-qc-u3-q2',
              format: 'mcq',
              prompt: '正確さ・精密さに関する記述として正しいものはどれか(複数選択可)。',
              choices: [
                { label: '正確さ(trueness)は真の値にどれだけ近いかを表す', correct: true },
                { label: '精密さ(precision)は測定値のばらつきの小ささを表す', correct: true },
                { label: '正確さと精密さは同じ意味の言葉である', correct: false },
                { label: '精密さが高ければ正確さも自動的に高くなる', correct: false },
              ],
              explanation: '正確さと精密さは別の概念で、一方が高くても他方が低いことがありえます。',
            },
            {
              id: 'bio-qc-u3-q3',
              format: 'mcq',
              prompt: '同じ検体で微小なばらつきが出たときの最初の行動として最も適切なのは?',
              choices: [
                { label: '偶然誤差の範囲内かどうかを確認する', correct: true },
                { label: '即座に装置故障と判断する', correct: false },
                { label: '一番低い値を選んで報告する', correct: false },
                { label: '確認せずそのまま無視する', correct: false },
              ],
              explanation: '許容される偶然誤差の範囲内かをまず確認するのが初動です。',
            },
            {
              id: 'bio-qc-u3-q4',
              format: 'mcq',
              prompt: '併行精度と室内再現精度に関する記述として正しいものはどれか(複数選択可)。',
              choices: [
                { label: '併行精度は同一条件下での繰り返し測定のばらつきを表す', correct: true },
                { label: '室内再現精度は条件が変わっても含めたより長期的なばらつきを表す', correct: true },
                { label: '併行精度と室内再現精度はまったく同じ条件を指す', correct: false },
                { label: '室内再現精度は1回の測定だけで評価できる', correct: false },
              ],
              explanation: '併行精度は短期的・同一条件、室内再現精度は長期的・条件変動を含むばらつきです。',
            },
            {
              id: 'bio-qc-u3-q5',
              format: 'mcq',
              prompt: '測定における「不確かさ(uncertainty)」の説明として最も適切なのは?',
              choices: [
                {
                  label: '測定値に合理的に帰属しうる値の散らばりの範囲を、統計的な手法で定量的に見積もったもの',
                  correct: true,
                },
                { label: '測定値が絶対に正しいことを保証する指標', correct: false },
                { label: '装置が故障しているかどうかを直接示す指標', correct: false },
                { label: '検査者の主観的な自信の度合い', correct: false },
              ],
              explanation: '不確かさは「ばらつきがある」という漠然とした事実ではなく、統計的に見積もる定量的な指標です。',
            },
            {
              id: 'bio-qc-u3-q6',
              format: 'mcq',
              prompt: '測定値のばらつきを扱うとき、最も優先すべきは?',
              choices: [
                { label: '自施設で定めた許容範囲(精度の基準)に沿って判断すること', correct: true },
                { label: '検査者の主観的な印象だけで判断すること', correct: false },
                { label: '常に一番小さい値を採用すること', correct: false },
                { label: '実習生の判断のみで決めること', correct: false },
              ],
              explanation: '許容範囲の設定は施設ごとに異なるため、自施設の基準を優先します。',
            },
          ],
        },
      ],
    },

    // ══════════════════════════════════════════════════════════════
    // u4: 概要(内部精度管理と外部精度評価の違い)
    // ══════════════════════════════════════════════════════════════
    // fn_reorder_unitsで先頭(position 0)へ移動する。骨子案の特定小項目に対応する
    // ものではなく、大項目8・9をまとめた本シリーズ全体の導入として新設。
    {
      unitId: 'bio-qc-u4',
      title: '内部だけ見ていればいいですか?',
      requestLine: '内部精度管理と外部精度評価、両方を行う理由と役割の違いを確認する',
      beats: [
        {
          id: 'bio-qc-u4-d0',
          type: 'dialogue',
          xp: 5,
          title: 'もうひとつの精度管理',
          backgroundId: 'labhall',
          lines: [
            { speaker: '実習生', text: '内部精度管理は毎日やってるって分かったんですけど、外部精度評価っていうのも別にあるんですか?' },
            { speaker: '技師', text: 'うん、これから外部のサーベイ試料も測ってもらうよ。' },
            { speaker: '実習生', text: '内部で毎日チェックしてるのに、それとは別にまだ必要なんですか?' },
            { speaker: '技師', text: '目的が違うんだ。まず精度管理の全体像と、内部・外部それぞれの役割を教科書で確認してみて。' },
            { speaker: '技師', text: 'そのうえで、なぜ両方必要なのか一緒に整理しよう。' },
          ],
        },
        {
          id: 'bio-qc-u4-problem',
          type: 'problem',
          xp: 5,
        },
        {
          id: 'bio-qc-u4-lec',
          type: 'lecture',
          xp: 10,
          body:
            '精度管理とは、検査結果が信頼できる値であることを継続的に確認し保証する仕組み全体を指します。その中心にあるのが、内部精度管理(Internal Quality Control, IQC)と外部精度評価(External Quality Assessment, EQA。精度管理調査とも呼ばれる)という、目的の異なる2つの柱です。\n\n内部精度管理は、自施設内で日常的に行う精度管理です。管理試料の測定値や患者データを使い、日々の測定のブレ(ランダムな変動である偶然誤差や、装置・試薬の劣化などによる系統誤差)をリアルタイムで検知することを目的とします。いわば「今日の測定はいつも通りか」を自施設だけで確認する仕組みです。\n\n一方、外部精度評価は、日本臨床衛生検査技師会(日臨技)や日本医師会などの第三者機関が主催するサーベイに参加し、配布された共通の試料を測定した結果を、他の多数の施設やtarget値と比較する仕組みです。自施設の内部精度管理だけでは気づけない、施設固有の系統的なズレ(測定法・試薬・機器の違いによる施設間差)を、外部との比較によって初めて明らかにできます。\n\nこの2つはしばしば「精密さ(precision)は内部精度管理で、正確さ(trueness)は外部精度評価を通じて確認する」と整理されます。内部が正常でも外部評価で問題が見つかることもあれば、その逆もあり、どちらか一方だけでは検査の質を十分に保証できません。両者を組み合わせて初めて、精度管理の環が完成します。',
          bridge:
            '教科書で、内部精度管理と外部精度評価、それぞれの目的と役割の違いを確認し、キーワードを入力してください。',
        },
        {
          id: 'bio-qc-u4-inv-purpose',
          type: 'investigate',
          xp: 15,
          mode: 'textbook',
          required: true,
          purpose: '内部精度管理と外部精度評価、それぞれの目的の違いを理解する',
          howTo: '教科書・配布資料で、内部精度管理と外部精度評価それぞれの目的について正しい記述を確認する。',
          clueKey: 'internal-vs-external-qc-purpose',
          demoHint: 'モック正解例: 内部は自施設内で日々のブレを検知/外部は他施設・target値と比較し施設固有のズレを検出',
          choices: [
            {
              label: '内部精度管理は自施設内で日常的に行い、管理試料や患者データを用いて日々の測定のブレをリアルタイムで検知する',
              correct: true,
            },
            {
              label: '外部精度評価は第三者機関が主催するサーベイに参加し、他施設・target値と比較することで自施設だけでは気づけない系統的なズレを検出する',
              correct: true,
            },
            { label: '内部精度管理と外部精度評価はまったく同じ試料・同じ方法で行うものである', correct: false },
            { label: '外部精度評価は毎日行うものである', correct: false },
          ],
        },
        {
          id: 'bio-qc-u4-inv-framework',
          type: 'investigate',
          xp: 15,
          mode: 'textbook',
          required: true,
          purpose: '内部と外部、両方を組み合わせて初めて精度管理が成立するという全体像を理解する',
          howTo: '教科書・配布資料で、精度管理全体における内部と外部の位置づけについて正しい記述を確認する。',
          clueKey: 'qc-overall-framework',
          demoHint: 'モック正解例: 内部は精密さ、外部は正確さの確認と整理されることが多い/どちらか一方だけでは不十分',
          choices: [
            {
              label: '内部精度管理は主に精密さ(precision)を、外部精度評価は主に正確さ(trueness)を確認する役割分担と整理されることが多い',
              correct: true,
            },
            {
              label: '内部精度管理が正常であっても、外部精度評価で初めて明らかになる施設固有のズレがありうる',
              correct: true,
            },
            { label: '内部精度管理が正常であれば、外部精度評価は省略してよい', correct: false },
            { label: '外部精度評価の結果が良ければ、内部精度管理は不要になる', correct: false },
          ],
        },
        {
          id: 'bio-qc-u4-res1',
          type: 'resolve',
          title: '判断',
          xp: 15,
          prompt: '技師「内部と外部、両方を毎回きちんとやる必要があるかな? どう思う?」',
          requiredClueKeys: ['internal-vs-external-qc-purpose'],
          choices: [
            {
              label: '目的が異なるため、内部精度管理と外部精度評価は互いを代替できず、両方を独立して継続する必要がある',
              correct: true,
              feedback: '内部だけでは施設固有の系統的なズレに気づけないため、両方を続ける必要があります。',
            },
            {
              label: '内部精度管理さえしっかりしていれば、外部精度評価は省略してよい',
              correct: false,
              feedback: '内部だけでは施設固有の系統的なズレに気づけないため、省略は避けます。',
            },
            {
              label: '外部精度評価の結果が良ければ、その後は内部精度管理を簡略化してよい',
              correct: false,
              feedback: '内部精度管理は日々の変動を検知する役割があり、外部評価の結果によって省略してよいものではありません。',
            },
          ],
        },
        {
          id: 'bio-qc-u4-res2',
          type: 'resolve',
          title: '報告',
          xp: 15,
          prompt: 'では、この違いを踏まえて、精度管理全体をどう捉える?',
          requiredClueKeys: ['internal-vs-external-qc-purpose', 'qc-overall-framework'],
          choices: [
            {
              label:
                '内部精度管理(日々のブレの検知)と外部精度評価(施設間・標準への適合の確認)は、互いに補完し合う一つの精度保証の仕組みとして捉える(具体的な運用ルールは施設ごとに定められているため、詳細は自施設の手順に従う)',
              correct: true,
              feedback: 'この後のユニットで、それぞれの具体的な方法を順番に確認していきます。',
            },
            {
              label: 'どちらか一方だけを重視すればよいと考える',
              correct: false,
              feedback: '内部と外部は目的が異なるため、どちらか一方に偏るのは避けます。',
            },
            {
              label: '精度管理は検査技師個人の裁量に任されており、施設としての仕組みではないと考える',
              correct: false,
              feedback: '精度管理は施設全体の仕組みとして運用されるものです。',
            },
          ],
        },
        {
          id: 'bio-qc-u4-drill',
          type: 'drill',
          xp: 20,
          questions: [
            {
              id: 'bio-qc-u4-q1',
              format: 'mcq',
              prompt: '内部精度管理(IQC)の説明として最も適切なのは?',
              choices: [
                { label: '自施設内で日常的に行い、日々の測定のブレをリアルタイムで検知する精度管理', correct: true },
                { label: '第三者機関が主催するサーベイに参加する精度管理', correct: false },
                { label: '年に一度だけ行えばよい精度管理', correct: false },
                { label: '患者への説明のためだけに行う精度管理', correct: false },
              ],
              explanation: '内部精度管理は自施設内で日常的に行い、日々のブレをリアルタイムで検知するものです。',
            },
            {
              id: 'bio-qc-u4-q2',
              format: 'mcq',
              prompt: '内部精度管理と外部精度評価に関する記述として正しいものはどれか(複数選択可)。',
              choices: [
                { label: '外部精度評価は第三者機関のサーベイに参加し、他施設・target値と比較する', correct: true },
                { label: '内部が正常でも、外部評価で初めて明らかになる施設固有のズレがありうる', correct: true },
                { label: '内部精度管理と外部精度評価はまったく同じ試料・同じ方法で行う', correct: false },
                { label: '外部精度評価の結果が良ければ内部精度管理は不要になる', correct: false },
              ],
              explanation: '内部と外部は目的が異なり、互いを代替できません。',
            },
            {
              id: 'bio-qc-u4-q3',
              format: 'mcq',
              prompt: '「精密さ(precision)は内部精度管理で、正確さ(trueness)は外部精度評価を通じて確認する」という整理に最も近いのは?',
              choices: [
                { label: '内部と外部は役割分担があり、両方で初めて精度管理の環が完成するという考え方', correct: true },
                { label: '内部だけで精密さも正確さも両方確認できるという考え方', correct: false },
                { label: '外部だけで精密さも正確さも両方確認できるという考え方', correct: false },
                { label: '精密さと正確さはまったく同じ概念であるという考え方', correct: false },
              ],
              explanation: '内部は主に精密さ、外部は主に正確さを確認する役割分担と整理されることが多いです。',
            },
            {
              id: 'bio-qc-u4-q4',
              format: 'mcq',
              prompt: '内部精度管理が正常なとき、外部精度評価についての対応として最も適切なのは?',
              choices: [
                { label: '目的が異なるため、外部精度評価も独立して継続する', correct: true },
                { label: '内部が正常なら外部精度評価は省略してよい', correct: false },
                { label: '外部精度評価は形式的なものなので結果を確認しなくてよい', correct: false },
                { label: '内部精度管理の記録だけを外部精度評価の代わりに提出する', correct: false },
              ],
              explanation: '内部だけでは気づけない施設固有のズレがあるため、外部精度評価も独立して継続します。',
            },
            {
              id: 'bio-qc-u4-q5',
              format: 'mcq',
              prompt: '精度管理全体の捉え方として最も優先すべきは?',
              choices: [
                { label: '内部精度管理と外部精度評価を、互いに補完し合う一つの仕組みとして捉えること', correct: true },
                { label: 'どちらか一方だけを重視すること', correct: false },
                { label: '精度管理は検査技師個人の裁量に任せること', correct: false },
                { label: '実習生の判断のみで決めること', correct: false },
              ],
              explanation: '内部と外部は互いを代替できず、組み合わせて初めて精度保証の環が完成します。',
            },
          ],
        },
      ],
    },

    // ══════════════════════════════════════════════════════════════
    // u5: 9-A(外部精度評価)
    // ══════════════════════════════════════════════════════════════
    {
      unitId: 'bio-qc-u5',
      title: 'サーベイの評価結果でZ-scoreが2.5と出た',
      requestLine: '外部精度評価(サーベイ)の評価結果を正しく読み、不良評価時にどう対応するかを確認する',
      beats: [
        {
          id: 'bio-qc-u5-d0',
          type: 'dialogue',
          xp: 5,
          title: '届いた評価報告',
          backgroundId: 'labhall',
          lines: [
            { speaker: '実習生', text: 'サーベイの結果、Z-scoreが2.5って書いてあるんですけど、これって大丈夫なんですか?' },
            { speaker: '技師', text: 'それは要注意のレベルだね。まずサーベイの仕組みと評価指標の読み方を確認しよう。' },
            { speaker: '技師', text: 'そのうえで、この評価をどう扱うか一緒に考えよう。' },
          ],
        },
        {
          id: 'bio-qc-u5-problem',
          type: 'problem',
          xp: 5,
        },
        {
          id: 'bio-qc-u5-lec',
          type: 'lecture',
          xp: 10,
          body:
            '外部精度評価(External Quality Assessment, EQA)は、日本臨床衛生検査技師会(日臨技)の精度管理調査、日本医師会の精度管理調査、都道府県による調査など、第三者機関が主催するサーベイに参加する形で行われます。基本的な流れは、共通の試料が全国の参加施設に配布され、各施設がその試料を測定し、結果を主催者に提出し、主催者が全参加施設の結果を集計して各施設に評価報告を返す、というものです。\n\n評価報告では、自施設の測定値が他施設の集団(またはtarget値)からどれだけ離れているかを表す指標が使われます。代表的なものがSDI(Standard Deviation Index)とZ-scoreで、いずれも自施設の値とtarget値(多くの場合、参加施設全体の平均やコンセンサス値)との差を、集団の標準偏差(SD)で割って標準化した値です。一般的な目安として絶対値が2未満は満足、2〜3は要注意、3以上は不良とされることが多いです。これらSDIやZ-scoreをもとに、乖離が大きいほど低くなるよう点数化した評価点として報告されることも多く、複数項目を横断して自施設の全体的な成績を一目で把握するのに使われます(具体的な区分・運用は調査を主催する団体・調査項目によって異なります)。\n\n不良評価(SDIやZ-scoreが大きく外れた場合)を受け取ったときは、まず自施設の内部精度管理の記録を遡って確認し、同じ時期に管理図の逸脱がなかったかを調べます。そのうえで、装置・試薬・キャリブレーション・検体の取り扱いなど考えられる原因を系統的に洗い出し、原因が特定できれば是正処置を行い、記録を残します。外部評価は自施設だけでは気づけない系統的なズレを教えてくれる貴重な機会であるため、真摯に受け止めて調査を継続することが求められます。',
          bridge:
            '教科書で、サーベイの流れと評価指標の読み方、そして不良評価時の対応の両方を確認し、それぞれキーワードを入力してください。',
        },
        {
          id: 'bio-qc-u5-inv-survey',
          type: 'investigate',
          xp: 15,
          mode: 'textbook',
          required: true,
          purpose: 'サーベイの流れと、評価指標(SDI・Z-score・評価点)の読み方を確認する',
          howTo: '教科書・配布資料で、外部精度評価サーベイの流れと評価指標について正しい記述を確認する。',
          clueKey: 'external-qc-survey-and-indicators',
          demoHint:
            'モック正解例: サーベイは試料配布→測定→提出→評価報告の流れ/SDI・Z-scoreはSDを単位とした標準化された乖離指標/評価点はそれらをもとにした点数化指標',
          choices: [
            {
              label: 'サーベイは、共通試料の配布→各施設での測定→結果の提出→主催者による評価報告、という流れで行われる',
              correct: true,
            },
            {
              label: 'SDIやZ-scoreは、自施設の値がtarget値からどれだけ離れているかを、集団の標準偏差(SD)を単位として標準化した指標である',
              correct: true,
            },
            {
              label: '評価点は、SDIやZ-scoreなど乖離の大きさをもとに点数化した指標で、乖離が大きいほど低い点数になるよう設計されることが多い',
              correct: true,
            },
            { label: '外部精度評価は自施設のみで完結する調査であり、他施設の結果と比較することはない', correct: false },
            { label: 'Z-scoreは値が大きいほど良好な結果であることを示す', correct: false },
          ],
        },
        {
          id: 'bio-qc-u5-inv-response',
          type: 'investigate',
          xp: 15,
          mode: 'textbook',
          required: true,
          purpose: '不良評価を受け取ったときの対応の流れを確認する',
          howTo: '教科書・配布資料で、不良評価時の原因追及と是正について正しい記述を確認する。',
          clueKey: 'poor-evaluation-response',
          demoHint: 'モック正解例: まず内部精度管理の記録を遡って確認/原因を系統的に洗い出し是正処置を行い記録を残す',
          choices: [
            {
              label: '不良評価を受けた場合は、まず自施設の内部精度管理の記録を遡り、同時期に管理図の逸脱がなかったかを確認する',
              correct: true,
            },
            {
              label: '装置・試薬・キャリブレーションなど考えられる原因を系統的に洗い出し、特定できれば是正処置を行い記録を残す',
              correct: true,
            },
            { label: '不良評価が出ても、次回のサーベイで良い結果が出れば今回の記録は残さなくてよい', correct: false },
            { label: '外部精度評価の結果は内部精度管理の記録と無関係なので照合する必要はない', correct: false },
          ],
        },
        {
          id: 'bio-qc-u5-res1',
          type: 'resolve',
          title: '判断',
          xp: 15,
          prompt: '技師「Z-scoreが2.5だった。まずどうする?」',
          requiredClueKeys: ['external-qc-survey-and-indicators'],
          choices: [
            {
              label: '自施設の内部精度管理の記録を遡って確認し、同時期に管理図の逸脱がなかったか調べる',
              correct: true,
              feedback: '外部評価の結果は、まず内部の記録と照らし合わせるところから調査を始めます。',
            },
            {
              label: 'Z-scoreの数値を見なかったことにして、次回のサーベイまで様子を見る',
              correct: false,
              feedback: '要注意レベルの評価を放置するのは避けます。',
            },
            {
              label: 'すぐに機器を停止し、業者を呼んで機器を交換してもらう',
              correct: false,
              feedback: '原因を確認する前に機器交換を決めるのは早計です。',
            },
          ],
        },
        {
          id: 'bio-qc-u5-res2',
          type: 'resolve',
          title: '報告',
          xp: 15,
          prompt: 'では、この評価結果をどう扱う? 原因追及の結果を踏まえて考えて。',
          requiredClueKeys: ['external-qc-survey-and-indicators', 'poor-evaluation-response'],
          choices: [
            {
              label:
                '装置・試薬・キャリブレーションなど考えられる原因を系統的に洗い出し、特定できれば是正処置を行って記録を残す(原因追及・是正の具体的な手順は施設ごとに定められているため、自施設の手順に従う)',
              correct: true,
              feedback: '不良評価時の対応手順は施設ごとに異なるため、自施設のルールを優先します。',
            },
            {
              label: '原因を追及せず、次回のサーベイの結果だけを待つ',
              correct: false,
              feedback: '原因を追及せずに次回を待つのは避けます。',
            },
            {
              label: '不良評価の記録を残さない',
              correct: false,
              feedback: '記録を残さないのは避け、手順に沿って対応します。',
            },
          ],
        },
        {
          id: 'bio-qc-u5-drill',
          type: 'drill',
          xp: 20,
          questions: [
            {
              id: 'bio-qc-u5-q1',
              format: 'mcq',
              prompt: '外部精度評価サーベイの流れとして正しいのは?',
              choices: [
                { label: '試料配布 → 測定 → 提出 → 評価報告', correct: true },
                { label: '評価報告 → 試料配布 → 測定 → 提出', correct: false },
                { label: '測定 → 評価報告 → 試料配布 → 提出', correct: false },
                { label: '提出 → 試料配布 → 測定 → 評価報告', correct: false },
              ],
              explanation: 'サーベイは試料配布→測定→提出→評価報告の順で進みます。',
            },
            {
              id: 'bio-qc-u5-q2',
              format: 'mcq',
              prompt: 'SDI・Z-scoreに関する記述として正しいものはどれか(複数選択可)。',
              choices: [
                { label: '自施設の値がtarget値からどれだけ離れているかを、SDを単位として標準化した指標である', correct: true },
                { label: '絶対値が大きいほど、target値からの乖離が大きいことを示す', correct: true },
                { label: '値が大きいほど良好な結果であることを示す', correct: false },
                { label: '他施設の結果とは無関係に算出される指標である', correct: false },
              ],
              explanation: 'SDI・Z-scoreは値が大きい(絶対値が大きい)ほどtarget値から離れていることを示します。',
            },
            {
              id: 'bio-qc-u5-q3',
              format: 'mcq',
              prompt: '不良評価を受け取ったときの最初の行動として最も適切なのは?',
              choices: [
                { label: '自施設の内部精度管理の記録を遡って確認する', correct: true },
                { label: '結果を見なかったことにする', correct: false },
                { label: 'すぐに機器を交換する', correct: false },
                { label: '次回のサーベイの結果だけを待つ', correct: false },
              ],
              explanation: 'まず内部精度管理の記録と照らし合わせて調査を始めるのが初動です。',
            },
            {
              id: 'bio-qc-u5-q4',
              format: 'mcq',
              prompt: '不良評価時の原因追及と是正に関する記述として正しいものはどれか(複数選択可)。',
              choices: [
                { label: '装置・試薬・キャリブレーションなど考えられる原因を系統的に洗い出す', correct: true },
                { label: '原因が特定できれば是正処置を行い、記録を残す', correct: true },
                { label: '良い結果が出れば過去の不良評価の記録は残さなくてよい', correct: false },
                { label: '外部精度評価と内部精度管理の記録は照合する必要がない', correct: false },
              ],
              explanation: '原因の洗い出し・是正・記録は不良評価対応の基本セットです。',
            },
            {
              id: 'bio-qc-u5-q5',
              format: 'mcq',
              prompt: '外部精度評価の結果を扱ううえで最も優先すべきは?',
              choices: [
                { label: '自施設の手順に沿って原因追及・是正・記録を行うこと', correct: true },
                { label: '検査者の主観的な印象だけで判断すること', correct: false },
                { label: '結果が悪くても特に何もしないこと', correct: false },
                { label: '実習生の判断のみで決めること', correct: false },
              ],
              explanation: '不良評価時の対応手順は施設ごとに異なるため、自施設のルールを優先します。',
            },
            {
              id: 'bio-qc-u5-q6',
              format: 'mcq',
              prompt: '評価点の説明として最も適切なのは?',
              choices: [
                {
                  label: 'SDIやZ-scoreなど乖離の大きさをもとに点数化した指標で、乖離が大きいほど低い点数になるよう設計されることが多い',
                  correct: true,
                },
                { label: '試料の配布日数だけを表す指標', correct: false },
                { label: '検査者の経験年数を表す指標', correct: false },
                { label: '装置の型番ごとに固定された指標', correct: false },
              ],
              explanation: '評価点はSDI・Z-scoreなどの乖離をもとに点数化され、自施設の全体的な成績を把握するのに使われます。',
            },
          ],
        },
      ],
    },

    // ══════════════════════════════════════════════════════════════
    // u6: 9-B(標準化とトレーサビリティ)
    // ══════════════════════════════════════════════════════════════
    {
      unitId: 'bio-qc-u6',
      title: 'ALPの基準範囲が急に変わった',
      requestLine: 'ALPの基準範囲変更のお知らせを見て、標準化とトレーサビリティの考え方を確認する',
      beats: [
        {
          id: 'bio-qc-u6-d0',
          type: 'dialogue',
          xp: 5,
          title: '基準範囲のお知らせ',
          backgroundId: 'labhall',
          lines: [
            { speaker: '実習生', text: 'ALPの基準範囲、急に数値が変わったんですけど、患者さんの体が急に変わったわけじゃないですよね?' },
            { speaker: '技師', text: '測定法が変わったからだよ。標準化とトレーサビリティの考え方を確認しよう。' },
            { speaker: '技師', text: 'そのうえで、この変更をどう理解するか一緒に整理しよう。' },
          ],
        },
        {
          id: 'bio-qc-u6-problem',
          type: 'problem',
          xp: 5,
        },
        {
          id: 'bio-qc-u6-lec',
          type: 'lecture',
          xp: 10,
          body:
            '検査値が施設や時代を越えて信頼できるものであるためには、測定値の正確さがどこから保証されているかを辿れる仕組みが必要です。これをトレーサビリティといい、最も高い純度・精度を持つ一次標準物質を出発点に、二次標準物質という段階を経て、日常検査で実際に使う常用標準物質(メーカーの校正用標準物質)まで値の正確さを繋いでいく連鎖(トレーサビリティ連鎖)として成り立っています。この連鎖の中で、値とその不確かさが公的な手続きを経て認証された標準物質を認証標準物質(CRM)と呼びます。認証標準物質は一次標準物質・二次標準物質いずれの段階にもあり得る「認証されているかどうか」を表す性質であり、二次標準物質と常用標準物質の間に独立して存在する階層ではありません。\n\nこの連鎖を実際に機能させるのが、JSCC(日本臨床化学会)勧告法やIFCC(国際臨床化学連合)準拠法のような標準化された測定法です。測定法が標準化されていれば、施設ごとに測定原理や試薬が違っても値を比較できるようになります。ALP(アルカリホスファターゼ)が従来法からIFCC準拠法へ移行した際、測定される値の水準そのものが変わったため基準範囲も見直された、というのはこの標準化の代表例です。\n\nこうした標準化の広がりを背景に生まれたのが共用基準範囲です。測定法が施設間で標準化されていることを前提に、複数の施設で同じ基準範囲を共有して用いる考え方で、施設を移っても一貫した基準で検査値を解釈できるようにする取り組みです。',
          bridge:
            '教科書で、トレーサビリティ連鎖と標準物質の階層、そして標準化された測定法と共用基準範囲の両方を確認し、それぞれキーワードを入力してください。',
        },
        {
          id: 'bio-qc-u6-inv-traceability',
          type: 'investigate',
          xp: 15,
          mode: 'textbook',
          required: true,
          purpose: 'トレーサビリティ連鎖と標準物質の階層構造を確認する',
          howTo: '教科書・配布資料で、トレーサビリティ連鎖と標準物質の階層について正しい記述を確認する。',
          clueKey: 'traceability-and-reference-materials',
          demoHint: 'モック正解例: トレーサビリティは一次標準物質から常用標準物質・日常検査へ段階的に値を伝達する仕組み/認証標準物質は独立した階層ではない',
          choices: [
            {
              label: 'トレーサビリティ連鎖とは、一次標準物質から常用標準物質、日常検査へと段階的に値の正確さを伝達していく仕組みである',
              correct: true,
            },
            {
              label: '一次標準物質は最も高い純度・精度を持つ基準となる物質で、二次標準物質・常用標準物質はそれを基に段階的に値付けされる',
              correct: true,
            },
            { label: 'トレーサビリティは測定機器の型番だけで決まる概念である', correct: false },
            { label: '認証標準物質(CRM)は、二次標準物質と常用標準物質の間に独立して位置する階層区分である', correct: false },
          ],
        },
        {
          id: 'bio-qc-u6-inv-standardization',
          type: 'investigate',
          xp: 15,
          mode: 'textbook',
          required: true,
          purpose: '標準化された測定法と、それが基準範囲・共用基準範囲に与える影響を確認する',
          howTo: '教科書・配布資料で、標準化された測定法と共用基準範囲について正しい記述を確認する。',
          clueKey: 'standardized-methods-and-shared-reference-range',
          demoHint: 'モック正解例: JSCC/IFCC法は施設間比較を可能にする/共用基準範囲は標準化を前提に複数施設で共有',
          choices: [
            {
              label:
                'JSCC勧告法やIFCC準拠法など測定法が標準化されることで施設間でも値を比較できるようになり、ALPのIFCC法移行のように測定法の変更は基準範囲自体の変化につながることがある',
              correct: true,
            },
            {
              label: '共用基準範囲は、測定法が施設間で標準化されていることを前提に、複数施設で同じ基準範囲を用いる考え方である',
              correct: true,
            },
            { label: '測定法が変わっても基準範囲は絶対に変化しない', correct: false },
            { label: '共用基準範囲は測定法の違いを無視してどの施設でも自由に使ってよい', correct: false },
          ],
        },
        {
          id: 'bio-qc-u6-res1',
          type: 'resolve',
          title: '判断',
          xp: 15,
          prompt: '技師「ALPの基準範囲、なぜ変わったと思う?」',
          requiredClueKeys: ['standardized-methods-and-shared-reference-range'],
          choices: [
            {
              label: '測定法がIFCC準拠法などへ変更されたことで値の水準そのものが変わり、それに伴って基準範囲も見直されたと考える',
              correct: true,
              feedback: '測定法の変更は基準範囲の変化につながることがあります。',
            },
            {
              label: '患者集団の体質が急に変化したと考える',
              correct: false,
              feedback: '短期間で患者集団の体質が一斉に変わることは考えにくいです。',
            },
            {
              label: '基準範囲は一度決めたら測定法が変わっても変更する必要はないと考える',
              correct: false,
              feedback: '測定法が変われば基準範囲も見直しが必要になります。',
            },
          ],
        },
        {
          id: 'bio-qc-u6-res2',
          type: 'resolve',
          title: '報告',
          xp: 15,
          prompt: 'では、患者さんや臨床医からこの基準範囲の変更について聞かれたら、どう説明する?',
          requiredClueKeys: ['traceability-and-reference-materials', 'standardized-methods-and-shared-reference-range'],
          choices: [
            {
              label:
                '測定法が標準化された新しい方法に変更されたことに伴い基準範囲も見直されたことを、トレーサビリティに基づく標準化の一環として説明する(詳しい説明の言葉遣い・手順は自施設の運用に従う)',
              correct: true,
              feedback: '変更の背景を説明する際の具体的な進め方は施設ごとに異なるため、自施設の方針を優先します。',
            },
            {
              label: '特に説明せず、そのまま新しい基準範囲だけを伝える',
              correct: false,
              feedback: '変更の背景を説明できることが望ましいです。',
            },
            {
              label: '測定法の変更については触れず、装置が古くなったからとだけ伝える',
              correct: false,
              feedback: '不正確な理由を伝えるのは避けます。',
            },
          ],
        },
        {
          id: 'bio-qc-u6-drill',
          type: 'drill',
          xp: 20,
          questions: [
            {
              id: 'bio-qc-u6-q1',
              format: 'mcq',
              prompt: 'トレーサビリティ連鎖の説明として最も適切なのは?',
              choices: [
                { label: '一次標準物質から段階を経て日常検査まで値の正確さを伝達していく仕組み', correct: true },
                { label: '装置の稼働時間を記録する仕組み', correct: false },
                { label: '試薬の在庫を管理する仕組み', correct: false },
                { label: '患者データだけを使って異常を検知する仕組み', correct: false },
              ],
              explanation: 'トレーサビリティ連鎖は一次標準物質から日常検査までの値の伝達の仕組みです。',
            },
            {
              id: 'bio-qc-u6-q2',
              format: 'mcq',
              prompt: '標準物質の階層に関する記述として正しいものはどれか(複数選択可)。',
              choices: [
                { label: '一次標準物質は最も高い純度・精度を持つ基準となる物質である', correct: true },
                { label: '二次標準物質・常用標準物質は一次標準物質を基に段階的に値付けされる', correct: true },
                { label: 'すべての標準物質は同じ精度水準である', correct: false },
                { label: '認証標準物質(CRM)は、二次標準物質と常用標準物質の間に独立して位置する階層区分である', correct: false },
              ],
              explanation:
                '標準物質は一次標準物質を頂点とした段階的な階層構造を持ちます。認証標準物質(CRM)は値と不確かさが公的に認証されているかを表す性質で、階層の独立した中間段階ではありません。',
            },
            {
              id: 'bio-qc-u6-q3',
              format: 'mcq',
              prompt: 'ALPの基準範囲が測定法変更後に変わった理由として最も適切なのは?',
              choices: [
                { label: 'IFCC準拠法への移行により測定される値の水準が変わったため', correct: true },
                { label: '患者集団の体質が短期間で変化したため', correct: false },
                { label: '基準範囲は測定法と無関係に定期的に変えるものだから', correct: false },
                { label: '装置が故障していたため', correct: false },
              ],
              explanation: '測定法の変更が基準範囲の変化につながる代表例です。',
            },
            {
              id: 'bio-qc-u6-q4',
              format: 'mcq',
              prompt: '共用基準範囲に関する記述として正しいものはどれか(複数選択可)。',
              choices: [
                { label: '測定法が施設間で標準化されていることを前提に、複数施設で同じ基準範囲を用いる考え方である', correct: true },
                { label: '施設を移っても一貫した基準で検査値を解釈できるようにする取り組みである', correct: true },
                { label: '測定法の違いを無視してどの施設でも自由に使ってよい', correct: false },
                { label: '共用基準範囲は標準化とは無関係に定められる', correct: false },
              ],
              explanation: '共用基準範囲は測定法の標準化を前提とした仕組みです。',
            },
            {
              id: 'bio-qc-u6-q5',
              format: 'mcq',
              prompt: '基準範囲の変更を患者・臨床医に説明するとき、最も優先すべきは?',
              choices: [
                { label: '変更の背景(測定法の標準化)を、自施設の方針に沿って分かりやすく説明すること', correct: true },
                { label: '説明せずに新しい基準範囲だけを伝えること', correct: false },
                { label: '装置が古くなったからとだけ伝えること', correct: false },
                { label: '実習生の判断のみで説明の仕方を決めること', correct: false },
              ],
              explanation: '変更の背景を説明する具体的な進め方は自施設の方針を優先します。',
            },
          ],
        },
      ],
    },

    // ══════════════════════════════════════════════════════════════
    // u7: 9-C(施設間差と方法間差)
    // ══════════════════════════════════════════════════════════════
    {
      unitId: 'bio-qc-u7',
      title: '転院してきた患者さんの検査値が前の病院と違う',
      requestLine: '同じ項目でも施設によって検査値が異なる理由を理解し、患者・臨床への説明を考える',
      beats: [
        {
          id: 'bio-qc-u7-d0',
          type: 'dialogue',
          xp: 5,
          title: '前院との値の違い',
          backgroundId: 'labhall',
          lines: [
            { speaker: '実習生', text: '転院されてきた患者さんの検査値、前の病院のデータと少し違うんです。同じ項目のはずなのに…' },
            { speaker: '技師', text: 'それはよくあることだよ。施設間差・方法間差の考え方を確認しよう。' },
            { speaker: '技師', text: 'そのうえで、この違いをどう説明するか一緒に考えよう。' },
          ],
        },
        {
          id: 'bio-qc-u7-problem',
          type: 'problem',
          xp: 5,
        },
        {
          id: 'bio-qc-u7-lec',
          type: 'lecture',
          xp: 10,
          body:
            '同一項目であっても、測定原理・試薬・機器メーカーの違いや、標準化の程度の違いなどにより、施設間で測定値が異なることがあります。これは必ずしもどちらかの施設の測定が誤っているという意味ではなく、方法間差として一般に起こりうる現象です。前回のユニットで扱った標準化・共用基準範囲の取り組みは、この施設間差をできるだけ小さくするためのものでもあります。\n\n施設内で機器や試薬を更新する際には、新旧の測定法で同じ検体を測定する相関試験を行い、系統的なズレの有無を確認します。ズレがあれば、その大きさを踏まえて運用を調整し、これまでの測定成績との連続性を保てるようにします。\n\nこうした施設間差・方法間差は、患者本人や紹介元・紹介先の臨床医にとって分かりにくいことがあります。前回値との差が病態の変化ではなく測定法の違いによるものである場合は、その旨をわかりやすく説明することが求められます。検査値の標準化が進むことは、施設をまたいでも一貫した臨床判断がしやすくなるという意味で、診療全体にとって大きな意義を持ちます。',
          bridge:
            '教科書で、施設間差・方法間差が生じる理由と、機器更新時の相関試験・患者への説明の両方を確認し、それぞれキーワードを入力してください。',
        },
        {
          id: 'bio-qc-u7-inv-difference',
          type: 'investigate',
          xp: 15,
          mode: 'textbook',
          required: true,
          purpose: '同じ項目でも施設間で値が異なりうる理由を確認する',
          howTo: '教科書・配布資料で、施設間差・方法間差が生じる理由について正しい記述を確認する。',
          clueKey: 'inter-facility-and-inter-method-difference',
          demoHint: 'モック正解例: 測定原理・試薬・機器メーカーの違いなどにより施設間で値が異なることがある',
          choices: [
            {
              label: '同一項目でも、測定原理・試薬・機器メーカーの違いなどにより、施設間で値が異なることがある',
              correct: true,
            },
            {
              label: '検査値の標準化が進むことで、施設をまたいでも一貫した臨床判断がしやすくなる',
              correct: true,
            },
            { label: '施設間で値が異なるのは必ず測定ミスが原因である', correct: false },
            { label: '標準化された測定法を用いれば、施設間で値が異なることは理論上ありえない', correct: false },
          ],
        },
        {
          id: 'bio-qc-u7-inv-changeover',
          type: 'investigate',
          xp: 15,
          mode: 'textbook',
          required: true,
          purpose: '機器・試薬更新時の対応と、患者・臨床への説明の考え方を確認する',
          howTo: '教科書・配布資料で、機器更新時の相関試験と患者への説明について正しい記述を確認する。',
          clueKey: 'instrument-changeover-correlation-and-explanation',
          demoHint: 'モック正解例: 機器更新時は相関試験でズレを確認/測定法の違いによる差は分かりやすく説明する',
          choices: [
            {
              label: '機器や試薬を更新する際は、新旧の測定法で同じ検体を測定する相関試験を行い、系統的なズレの有無を確認する',
              correct: true,
            },
            {
              label: '前回値との差が測定法の違いによるものである場合は、病態の変化ではないことを患者・臨床にわかりやすく説明する',
              correct: true,
            },
            { label: '機器更新時は相関試験を行わずにそのまま新しい機器の値を使い始めてよい', correct: false },
            { label: '測定法の違いによる差は、患者や臨床に説明する必要のない技術的な内部事情である', correct: false },
          ],
        },
        {
          id: 'bio-qc-u7-res1',
          type: 'resolve',
          title: '判断',
          xp: 15,
          prompt: '技師「転院患者さんの値が前院と違う。まずどう考える?」',
          requiredClueKeys: ['inter-facility-and-inter-method-difference'],
          choices: [
            {
              label: '測定原理や試薬・機器の違いによる施設間差の可能性を考え、病態の変化と決めつけない',
              correct: true,
              feedback: '施設間差は方法間差として一般に起こりうる現象であり、まず可能性の一つとして考えます。',
            },
            {
              label: '前の病院の測定が間違っていたと決めつける',
              correct: false,
              feedback: 'どちらかの施設の測定が誤っていると決めつけるのは避けます。',
            },
            {
              label: '自施設の測定が間違っていると決めつけ、再検査だけを繰り返す',
              correct: false,
              feedback: '原因を考えずに再検査を繰り返すのは避けます。',
            },
          ],
        },
        {
          id: 'bio-qc-u7-res2',
          type: 'resolve',
          title: '報告',
          xp: 15,
          prompt: 'では、この値の違いを臨床医・患者さんにどう説明する?',
          requiredClueKeys: ['inter-facility-and-inter-method-difference', 'instrument-changeover-correlation-and-explanation'],
          choices: [
            {
              label:
                '測定法・施設の違いによる差である可能性を分かりやすく説明し、必要であれば経過を追って傾向を確認する(説明の具体的な言葉遣い・手順は自施設の方針に従う)',
              correct: true,
              feedback: '施設間差の説明の仕方は施設ごとの方針に沿って行います。',
            },
            {
              label: '違いの理由を説明せず、新しい値だけを伝える',
              correct: false,
              feedback: '違いの理由を説明できることが望ましいです。',
            },
            {
              label: '前の病院の値が誤りだったと伝える',
              correct: false,
              feedback: '根拠なく他施設の値を誤りと伝えるのは避けます。',
            },
          ],
        },
        {
          id: 'bio-qc-u7-drill',
          type: 'drill',
          xp: 20,
          questions: [
            {
              id: 'bio-qc-u7-q1',
              format: 'mcq',
              prompt: '施設間で同一項目の検査値が異なる理由として最も適切なのは?',
              choices: [
                { label: '測定原理・試薬・機器メーカーの違いなどによる方法間差', correct: true },
                { label: '必ずどちらかの施設の測定ミス', correct: false },
                { label: '患者の体質が施設ごとに変わるため', correct: false },
                { label: '検体の保存条件とは無関係な偶然', correct: false },
              ],
              explanation: '施設間差は測定原理・試薬・機器の違いなどによる方法間差として一般に起こりえます。',
            },
            {
              id: 'bio-qc-u7-q2',
              format: 'mcq',
              prompt: '施設間差・方法間差に関する記述として正しいものはどれか(複数選択可)。',
              choices: [
                { label: '同一項目でも測定原理・試薬・機器メーカーの違いにより施設間で値が異なることがある', correct: true },
                { label: '検査値の標準化が進むことで施設をまたいでも一貫した臨床判断がしやすくなる', correct: true },
                { label: '施設間で値が異なるのは必ず測定ミスが原因である', correct: false },
                { label: '標準化された測定法を用いれば施設間差は理論上ありえない', correct: false },
              ],
              explanation: '標準化は施設間差を小さくする取り組みですが、方法間差自体は起こりうる現象です。',
            },
            {
              id: 'bio-qc-u7-q3',
              format: 'mcq',
              prompt: '機器・試薬を更新するときに行うべきことは?',
              choices: [
                { label: '新旧の測定法で同じ検体を測定する相関試験を行う', correct: true },
                { label: '相関試験を行わずそのまま新しい機器の値を使い始める', correct: false },
                { label: '旧機器のデータはすべて破棄する', correct: false },
                { label: '相関試験は年に一度だけ行えば十分である', correct: false },
              ],
              explanation: '機器更新時は相関試験で系統的なズレの有無を確認します。',
            },
            {
              id: 'bio-qc-u7-q4',
              format: 'mcq',
              prompt: '転院患者の検査値が前院と異なるときの最初の考え方として最も適切なのは?',
              choices: [
                { label: '測定原理や試薬・機器の違いによる施設間差の可能性を考える', correct: true },
                { label: '前の病院の測定が間違っていたと決めつける', correct: false },
                { label: '自施設の測定が間違っていると決めつけて再検査だけを繰り返す', correct: false },
                { label: '違いを無視してそのまま報告する', correct: false },
              ],
              explanation: '施設間差の可能性をまず考え、どちらかの誤りと決めつけないことが大切です。',
            },
            {
              id: 'bio-qc-u7-q5',
              format: 'mcq',
              prompt: '前回値との差を臨床医・患者に説明するとき、最も優先すべきは?',
              choices: [
                { label: '測定法・施設の違いによる差である可能性を分かりやすく説明すること', correct: true },
                { label: '違いの理由を説明せず値だけを伝えること', correct: false },
                { label: '他施設の値を根拠なく誤りと伝えること', correct: false },
                { label: '実習生の判断のみで説明の仕方を決めること', correct: false },
              ],
              explanation: '説明の具体的な進め方は自施設の方針に従いつつ、理由を分かりやすく伝えることが大切です。',
            },
          ],
        },
      ],
    },
  ],
}
