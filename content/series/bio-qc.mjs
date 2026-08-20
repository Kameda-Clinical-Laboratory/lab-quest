// シリーズ「精度管理」(大項目8: 内部精度管理)
// 既存stage bio-qcは旧chapters/caseSteps(オリエンテーション級の薄い内容)のみで、
// 新形式(beats)のユニットはまだ無い。今回が新形式の初投入。
// 骨子案付録B優先度4位のシナリオ(「朝の管理試料が2-2sに触れた。患者結果を出して
// よいか決める」)をu1の判断・報告幕に反映している。
//
// 大項目8(内部精度管理)は中項目A(管理図法)/B(患者データを用いる方法)/C(誤差論)の
// 3本立て。u1=A、u2=B、u3=Cで全カバーする。
// 大項目9(外部精度評価と標準化)は別大項目・別シリーズ扱いで、今回のスコープ外
// (docs/series-roadmap.md「要決定」1参照、9番投入時に bio-qc を8番専用に改名するか
// 再検討する)。
//
//   node scripts/push-series.mjs content/series/bio-qc.mjs --dry-run
//   STAFF_FULL_PASSWORD=xxxx node scripts/push-series.mjs content/series/bio-qc.mjs
//   STAFF_FULL_PASSWORD=xxxx node scripts/push-series.mjs content/series/bio-qc.mjs --publish

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
  ],
}
