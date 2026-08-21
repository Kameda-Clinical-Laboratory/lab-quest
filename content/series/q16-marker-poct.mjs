// シリーズ「疾患マーカーとPOCT」(大項目16)
// 骨子案付録B優先度6位のシナリオ(「BNPとNT-proBNP、どちらを追えばよいかDr.に聞かれた」)を
// u1の判断・報告幕に反映している。
//
// 大項目16は中項目A(心不全・心筋マーカー)/B(腫瘍マーカー)/C(POCT)の3本立て。
// u1=A、u2=B、u3=Cで全カバーする。
//
//   node scripts/push-series.mjs content/series/q16-marker-poct.mjs --dry-run
//   STAFF_FULL_PASSWORD=xxxx node scripts/push-series.mjs content/series/q16-marker-poct.mjs
//   STAFF_FULL_PASSWORD=xxxx node scripts/push-series.mjs content/series/q16-marker-poct.mjs --publish

export default {
  stageId: 'q16-marker-poct',

  clues: [
    {
      key: 'bnp-vs-ntprobnp-basics',
      name: 'BNPとNT-proBNPの産生機序・採血管の違い',
      summary:
        'proBNPが心室から分泌され、切断されて活性型BNPと不活性のNT-proBNPになる。BNPは半減期が短くEDTA血漿での測定が必要、NT-proBNPは半減期が長く血清・血漿いずれでも測定可能で室温安定性が高い。',
    },
    {
      key: 'bnp-cutoff-interpretation',
      name: 'BNP/NT-proBNPのカットオフ解釈への影響要因',
      summary:
        'NT-proBNPは主に腎から排泄されるため腎機能低下があると特に上昇しやすく、BNPも腎機能低下の影響で上昇する傾向がある。高齢でも上昇しやすい一方、肥満では脂肪組織によるクリアランス亢進のため値が低下しやすい。肥満患者では心不全があっても値が「見かけ上低く」出て見逃されるおそれがあるため、年齢・腎機能・体格を考慮してカットオフを解釈する必要がある。',
    },
    {
      key: 'hs-troponin-kinetics',
      name: '高感度心筋トロポニンの推移パターンと0/1hアルゴリズム',
      summary:
        '高感度心筋トロポニンT/Iは心筋壊死を反映するマーカーで、発症からの時間経過に伴う上昇パターン(0/1hアルゴリズムなど)を見て急性心筋梗塞を判断する。心負荷を反映するBNP/NT-proBNPとは評価する病態が異なる。',
    },
    {
      key: 'tumor-marker-organ-mapping',
      name: '腫瘍マーカーと対応臓器・組織型',
      summary:
        'AFP(肝細胞癌)、CEA(大腸癌など消化器癌)、CA19-9(膵癌・胆道癌)、CA125(卵巣癌)、PSA(前立腺癌)、PIVKA-Ⅱ(肝細胞癌)、SCC(扁平上皮癌)、ProGRP(肺小細胞癌)など、マーカーごとにおおよそ対応する臓器・組織型がある。',
    },
    {
      key: 'tumor-marker-false-positive',
      name: '腫瘍マーカーの偽陽性要因',
      summary:
        '喫煙はCEAを上昇させる。良性疾患でも腫瘍マーカーが上昇することがある。CA125は月経・妊娠・子宮内膜症などの良性婦人科疾患で上昇し、PSAは直腸診など前立腺への機械的刺激で上昇しうる。',
    },
    {
      key: 'tumor-marker-false-negative-and-use',
      name: '腫瘍マーカーの偽陰性要因と使いどころ',
      summary:
        'Lewis式血液型陰性者はCA19-9を産生できないため、膵癌があってもCA19-9が上昇しない(偽陰性)ことがある。腫瘍マーカーは感度・特異度が十分でないため単独スクリーニングには適さず、治療効果判定や再発モニタリングなど経過観察に主に用いる。',
    },
    {
      key: 'poct-definition-and-setting',
      name: 'POCT血糖測定の原理(酵素法)とイムノクロマトグラフィとの違い',
      summary:
        'POCT(Point of Care Testing)は患者のそばで実施する検査で、外来・病棟・救急・在宅などに設置される。血糖のPOCT測定はグルコースオキシダーゼ法やグルコースデヒドロゲナーゼ(GDH)法などの酵素反応を電気化学的または比色的に検出する原理が主流。イムノクロマトグラフィは抗原抗体反応を利用する別のPOCT(インフルエンザ抗原・妊娠検査・心筋マーカー迅速検査など)で使われる原理で、血糖測定の原理とは異なる。',
    },
    {
      key: 'immunochromatography-principle-and-judgment',
      name: 'イムノクロマトグラフィの原理と判定基準',
      summary:
        '検体中の抗原(または抗体)が標識抗体と複合体を作り、テストライン上の捕捉抗体と結合してサンドイッチ形式で発色線を形成する原理。コントロールラインの発色は検体が正しく展開したことを示す必須の確認点で、コントロールラインが発色しなければテストラインの結果にかかわらず判定は無効。テストラインの有無で陽性・陰性を判定する定性〜半定量的な検査で、インフルエンザ抗原検査・妊娠検査・心筋マーカー迅速検査などに用いる。',
    },
    {
      key: 'poct-qc-and-central-lab-comparison',
      name: 'POCT血糖測定と中央検査室の測定値差(全血-血漿差・ヘマトクリット・妨害物質)',
      summary:
        'POCT血糖測定器の多くは全血を測定するのに対し中央検査室は血漿(血清)グルコースを測定するため、全血血糖値は血漿血糖値よりおおむね10〜15%程度低く出うる(近年の機種の多くは内部で血漿換算補正を行うため、この差はあらかじめ縮小されていることも多い)。ヘマトクリット値や、GDH-PQQ法の一部機器ではマルトース・イコデキストリン(腹膜透析液由来)などの妨害物質も測定値に影響しうる。POCT機器も精度管理が必要で、検査室がその管理・教育・記録に関与する(◆施設差)。',
    },
  ],

  units: [
    // ══════════════════════════════════════════════════════════════
    // u1: 16-A(心不全・心筋マーカー) — 骨子案付録B優先#6のシナリオ
    // ══════════════════════════════════════════════════════════════
    {
      unitId: 'q16-marker-poct-u1',
      title: 'BNPとNT-proBNP、どちらを追えばよいか',
      requestLine: '医師からBNPとNT-proBNP、どちらを追うべきか尋ねられた。使い分けの根拠を整理する',
      beats: [
        {
          id: 'q16-u1-d0',
          type: 'dialogue',
          xp: 5,
          title: '医師からの質問',
          backgroundId: 'ward',
          lines: [
            { speaker: '実習生', text: '先生から「BNPとNT-proBNP、結局どっちを見ればいいの?」と聞かれて困りました…' },
            { speaker: '技師', text: 'まず両者の違いを確認しよう。産生機序と採血管、安定性の違いが鍵になるよ。' },
            {
              speaker: '技師',
              text: 'カットオフの考え方(腎機能・年齢・肥満の影響)と、急性冠症候群での高感度トロポニンの使い方も教科書で確認して。',
            },
            { speaker: '技師', text: 'そのうえで、どちらのマーカーを推奨するか一緒に整理しよう。' },
          ],
        },
        {
          id: 'q16-u1-problem',
          type: 'problem',
          xp: 5,
        },
        {
          id: 'q16-u1-lec',
          type: 'lecture',
          xp: 10,
          body:
            'BNPは心室に負荷がかかると分泌が増えるプロホルモン、proBNPが体内で切断されて生じる活性型ホルモンです。切断時に生じるもう一方の断片が、不活性なN末端フラグメントであるNT-proBNPです。両者は起源は同じですが、性質は大きく異なります。\n\nBNPは活性型ホルモンで半減期が短く(約20分)、プロテアーゼによる分解を防ぐためEDTA血漿での測定が必要で、室温での安定性も低めです。一方NT-proBNPは不活性で半減期が長く(おおむね60〜120分程度とされる)、血清・血漿いずれでも測定可能で室温でも比較的安定しています。この違いが、採血管や保存条件の使い分けに直結します。\n\nカットオフ値をそのまま当てはめてよいわけではありません。NT-proBNPは主に腎から排泄されるため、腎機能が低下していると特に上昇しやすくなります。BNPも腎機能低下の影響で上昇する傾向がありますが、主なクリアランス経路は受容体を介した分解であり、NT-proBNPほど腎機能への依存度は高くありません。また高齢であっても両者は上昇しやすくなります。一方、肥満患者では脂肪組織によるクリアランス亢進などのため値が低下しやすく、心不全があっても値が「見かけ上低く」出て見逃されるおそれがあります。年齢・腎機能・体格を考慮してカットオフを解釈する必要があり、採用しているアッセイやカットオフも施設によって異なります。なお急性冠症候群が疑われる場面では高感度心筋トロポニンT/Iが用いられ、発症からの時間経過に伴う上昇パターン(0/1hアルゴリズムなど)を見て判断します。これは心筋壊死を反映するマーカーで、心負荷を反映するBNP/NT-proBNPとは評価する病態が異なります。',
          bridge:
            '教科書で、BNPとNT-proBNPの産生機序・採血管の違いと、カットオフ解釈への腎機能・年齢・肥満の影響(それぞれの変動の方向)、そして高感度心筋トロポニンの推移パターンの3つを確認し、それぞれキーワードを入力してください。',
        },
        {
          id: 'q16-u1-inv-basics',
          type: 'investigate',
          xp: 15,
          mode: 'textbook',
          required: true,
          purpose: '「BNPとNT-proBNP、どちらを追うべきか」の質問に答えるため、両者の産生機序と検体条件の違いを確認する',
          howTo: '教科書・配布資料で、BNPとNT-proBNPの産生機序・採血管の違いについて正しい記述を確認する。',
          clueKey: 'bnp-vs-ntprobnp-basics',
          demoHint: 'モック正解例: BNPは半減期が短くEDTA血漿が必要/NT-proBNPは半減期が長く血清・血漿どちらでも室温でも比較的安定',
          choices: [
            {
              label: 'BNPは活性型ホルモンで半減期が短く、測定にはプロテアーゼによる分解を防ぐためEDTA血漿を用いる',
              correct: true,
            },
            {
              label: 'NT-proBNPは不活性なN末端フラグメントで半減期が長く、血清・血漿いずれでも測定可能で室温での安定性が比較的高い',
              correct: true,
            },
            { label: 'BNPとNT-proBNPは全く同じ分子であり、名称が違うだけである', correct: false },
            { label: 'NT-proBNPは室温での安定性が低いため、常に氷冷して測定する必要がある', correct: false },
          ],
        },
        {
          id: 'q16-u1-inv-cutoff',
          type: 'investigate',
          xp: 15,
          mode: 'textbook',
          required: true,
          purpose: 'カットオフ値をそのまま当てはめてよいか、患者背景を踏まえて確認する',
          howTo: '教科書・配布資料で、カットオフ解釈に影響する要因について正しい記述を確認する。',
          clueKey: 'bnp-cutoff-interpretation',
          demoHint: 'モック正解例: 腎機能低下・高齢ではNT-proBNP/BNPが上昇しやすい/肥満ではクリアランス亢進のため低下しやすく心不全を見逃すおそれ',
          choices: [
            {
              label: 'NT-proBNPは主に腎から排泄されるため腎機能低下があると特に上昇しやすく、高齢でもNT-proBNP/BNPは上昇しやすい',
              correct: true,
            },
            {
              label: '肥満患者では脂肪組織によるクリアランス亢進などのためBNP/NT-proBNPが低下しやすく、心不全があっても見かけ上低く出て見逃されるおそれがある',
              correct: true,
            },
            { label: '腎機能や年齢、体格にかかわらず、カットオフ値は一律に適用してよい', correct: false },
            { label: '肥満患者ではBNP/NT-proBNPが必ず高値になる', correct: false },
          ],
        },
        {
          id: 'q16-u1-inv-troponin',
          type: 'investigate',
          xp: 15,
          mode: 'textbook',
          required: true,
          purpose: '急性冠症候群が疑われる場面での高感度トロポニンの使い方を確認する(BNP/NT-proBNPとは目的が異なるマーカーであることも整理)',
          howTo: '教科書・配布資料で、高感度心筋トロポニンの推移パターンと0/1hアルゴリズムについて正しい記述を確認する。',
          clueKey: 'hs-troponin-kinetics',
          demoHint: 'モック正解例: 心筋壊死マーカーで発症からの時間経過での上昇パターンを見る/BNP・NT-proBNPとは評価する病態が異なる',
          choices: [
            {
              label:
                '高感度心筋トロポニンT/Iは心筋壊死を反映するマーカーで、発症からの時間経過に伴う上昇パターン(0/1hアルゴリズムなど)を見て急性心筋梗塞を判断する',
              correct: true,
            },
            {
              label: '高感度トロポニンは心筋壊死マーカーであり、心負荷を反映するBNP/NT-proBNPとは評価する病態が異なる',
              correct: true,
            },
            { label: '高感度トロポニンは心不全の重症度のみを評価するマーカーである', correct: false },
            { label: '1回の測定値だけで急性心筋梗塞の有無を確定できる', correct: false },
          ],
        },
        {
          id: 'q16-u1-res1',
          type: 'resolve',
          title: '判断',
          xp: 15,
          prompt: '医師「BNPとNT-proBNP、結局どちらを見ればいいの?」まずどう答える?',
          requiredClueKeys: ['bnp-vs-ntprobnp-basics'],
          choices: [
            {
              label: '両者の産生機序・半減期・検体条件の違いを踏まえたうえで、どちらの測定を自施設が採用しているか(採血管・保存条件を含め)を確認して答える',
              correct: true,
              feedback: 'まず両マーカーの性質の違いと自施設の運用を整理してから答えることが大切です。',
            },
            {
              label: 'BNPとNT-proBNPはどちらでも同じ結果になるので、どちらでもよいと答える',
              correct: false,
              feedback: '産生機序や検体条件が異なるため、同じ結果になるとは限りません。',
            },
            {
              label: '医師の質問には答えず、検査部長に丸投げする',
              correct: false,
              feedback: '実習生としてまず自分で整理し、わかる範囲で説明する姿勢が求められます。',
            },
          ],
        },
        {
          id: 'q16-u1-res2',
          type: 'resolve',
          title: '報告',
          xp: 15,
          prompt: 'では、最終的にどう説明する?',
          requiredClueKeys: ['bnp-vs-ntprobnp-basics', 'bnp-cutoff-interpretation', 'hs-troponin-kinetics'],
          choices: [
            {
              label:
                '両マーカーの違いに加え、腎機能・年齢・肥満などカットオフ解釈への影響、自施設で採用しているアッセイ・カットオフ・採血管を踏まえて説明する。自施設の基準・運用は施設ごとに異なるため、自施設の方針を優先して確認する',
              correct: true,
              feedback: '施設ごとに採用アッセイ・カットオフが異なるため、自施設の方針を確認したうえで説明することが重要です。',
            },
            {
              label: 'カットオフ値だけを一律に伝え、患者背景には触れない',
              correct: false,
              feedback: '腎機能・年齢・肥満などの影響を踏まえずに一律の値だけ伝えるのは誤解を招きます。',
            },
            {
              label: '高感度トロポニンの話は今回とは無関係なので触れない',
              correct: false,
              feedback: '目的の異なるマーカーであることを整理して伝えることも、医師の理解を助けます。',
            },
          ],
        },
        {
          id: 'q16-u1-drill',
          type: 'drill',
          xp: 20,
          questions: [
            {
              id: 'q16-u1-q1',
              format: 'mcq',
              prompt: 'BNPの測定に用いる検体として最も適切なのは?',
              choices: [
                { label: 'EDTA血漿', correct: true },
                { label: '血清(抗凝固剤なし)', correct: false },
                { label: 'フッ化ナトリウム加血漿', correct: false },
                { label: 'クエン酸血漿', correct: false },
              ],
              explanation: 'BNPはプロテアーゼによる分解を防ぐため、EDTA血漿での測定が必要です。',
            },
            {
              id: 'q16-u1-q2',
              format: 'mcq',
              prompt: 'BNPとNT-proBNPの性質として正しいものはどれか(複数選択可)。',
              choices: [
                { label: 'BNPは活性型ホルモンで半減期が短い', correct: true },
                { label: 'NT-proBNPは不活性で半減期が長く、室温での安定性が比較的高い', correct: true },
                { label: 'BNPとNT-proBNPは同一の分子で性質に違いはない', correct: false },
                { label: 'NT-proBNPは氷冷しなければ数分で分解してしまう', correct: false },
              ],
              explanation: '両者は起源(proBNP)は同じでも、活性・半減期・安定性が大きく異なります。',
            },
            {
              id: 'q16-u1-q3',
              format: 'mcq',
              prompt: 'BNP/NT-proBNPのカットオフ解釈と患者背景の関係として正しいものはどれか(複数選択可)。',
              choices: [
                { label: '腎機能低下があると、腎排泄の影響を強く受け上昇しやすい', correct: true },
                { label: '肥満患者ではクリアランス亢進などにより値が低下しやすく、心不全があっても見逃されるおそれがある', correct: true },
                { label: '肥満患者では値が必ず上昇する', correct: false },
                { label: '血液型によってカットオフの解釈が変わる', correct: false },
              ],
              explanation: '腎機能低下・高齢では上昇しやすく、肥満では逆に低下しやすいため、変動の「方向」を区別して覚える必要があります。',
            },
            {
              id: 'q16-u1-q4',
              format: 'mcq',
              prompt: '高感度心筋トロポニンに関する記述として正しいものはどれか(複数選択可)。',
              choices: [
                { label: '心筋壊死を反映するマーカーである', correct: true },
                { label: '発症からの時間経過に伴う上昇パターン(0/1hアルゴリズムなど)を見て判断する', correct: true },
                { label: '心負荷の評価にのみ用いるマーカーである', correct: false },
                { label: '1回の測定のみで診断を確定できる', correct: false },
              ],
              explanation: '高感度トロポニンは心筋壊死マーカーで、複数時点での推移を見て判断します。',
            },
            {
              id: 'q16-u1-q5',
              format: 'mcq',
              prompt: '医師から「BNPとNT-proBNP、どちらを追えばよいか」と聞かれたときの対応として最も優先すべきは?',
              choices: [
                { label: '両マーカーの違いと患者背景への影響、自施設の採用状況を踏まえて説明すること', correct: true },
                { label: 'どちらでも同じなので好きな方を選んでよいと伝えること', correct: false },
                { label: '検査部長にすべて任せて自分では説明しないこと', correct: false },
                { label: 'カットオフ値の数字だけを伝えること', correct: false },
              ],
              explanation: '性質の違いと患者背景、自施設の運用を踏まえた説明が求められます。',
            },
          ],
        },
      ],
    },

    // ══════════════════════════════════════════════════════════════
    // u2: 16-B(腫瘍マーカー)
    // ══════════════════════════════════════════════════════════════
    {
      unitId: 'q16-marker-poct-u2',
      title: '喫煙者なのにCEAが高い',
      requestLine: '喫煙歴のある患者のCEAが基準値より高い。腫瘍マーカーの数値をどう解釈するか整理する',
      beats: [
        {
          id: 'q16-u2-d0',
          type: 'dialogue',
          xp: 5,
          title: 'CEA高値の相談',
          backgroundId: 'labhall',
          lines: [
            { speaker: '実習生', text: '喫煙している患者さんのCEAが高いんですが、これはがんの可能性が高いということですか?' },
            { speaker: '技師', text: '腫瘍マーカーにはそれぞれ特有の偽陽性・偽陰性要因があるんだ。CEAと喫煙の関係も含めて確認しよう。' },
            {
              speaker: '技師',
              text: '各マーカーがどの臓器・組織型に対応するかと、スクリーニングではなく経過観察に用いる理由も教科書で確認して。',
            },
            { speaker: '技師', text: 'そのうえで、この患者さんの値をどう解釈するか一緒に考えよう。' },
          ],
        },
        {
          id: 'q16-u2-problem',
          type: 'problem',
          xp: 5,
        },
        {
          id: 'q16-u2-lec',
          type: 'lecture',
          xp: 10,
          body:
            '腫瘍マーカーには、それぞれおおよそ対応する臓器・組織型があります。AFPは肝細胞癌、CEAは大腸癌など消化器癌、CA19-9は膵癌・胆道癌、CA125は卵巣癌、PSAは前立腺癌、PIVKA-Ⅱは肝細胞癌、SCCは扁平上皮癌、ProGRPは肺小細胞癌でそれぞれ上昇しやすいとされています。\n\nただし、マーカーの上昇=がん、と単純には言えません。CEAは喫煙によっても上昇することが知られており、多くのマーカーは肝疾患などの良性疾患でも上昇することがあります。CA125は月経・妊娠・子宮内膜症といった良性婦人科疾患でも上昇し、PSAは直腸診やカテーテル留置など前立腺への機械的刺激でも上昇しうるため、採血前の状況にも注意が必要です。\n\n逆に、がんがあっても上昇しない偽陰性もあります。たとえばLewis式血液型陰性の人はCA19-9を産生する酵素を欠くため、膵癌があってもCA19-9がほとんど上昇しないことがあります。このように腫瘍マーカーは感度・特異度が十分に高くないため、単独で健常者を対象としたスクリーニングに用いるのには適さず、主に治療効果の判定や再発の有無を追う経過観察に用いられます。',
          bridge:
            '教科書で、腫瘍マーカーと対応臓器・組織型、偽陽性要因(喫煙とCEA、良性疾患、月経・妊娠とCA125、機械的刺激とPSA)、そして偽陰性要因とスクリーニングではなく経過観察に用いる理由の3つを確認し、それぞれキーワードを入力してください。',
        },
        {
          id: 'q16-u2-inv-mapping',
          type: 'investigate',
          xp: 15,
          mode: 'textbook',
          required: true,
          purpose: 'CEA高値の患者を前に、そもそも各腫瘍マーカーがどの臓器・組織型に対応するのかを確認する',
          howTo: '教科書・配布資料で、腫瘍マーカーと対応臓器・組織型について正しい記述を確認する。',
          clueKey: 'tumor-marker-organ-mapping',
          demoHint: 'モック正解例: AFPは肝細胞癌/CEAは大腸癌など消化器癌/CA19-9は膵癌・胆道癌/CA125は卵巣癌/PSAは前立腺癌',
          choices: [
            { label: 'AFPは肝細胞癌、CA19-9は膵癌・胆道癌で上昇しやすいマーカーである', correct: true },
            { label: 'CEAは大腸癌など消化器癌、CA125は卵巣癌で上昇しやすいマーカーである', correct: true },
            { label: 'PSAは肺小細胞癌で特異的に上昇するマーカーである', correct: false },
            { label: 'すべての腫瘍マーカーはどの臓器のがんでも同程度に上昇する', correct: false },
          ],
        },
        {
          id: 'q16-u2-inv-fp',
          type: 'investigate',
          xp: 15,
          mode: 'textbook',
          required: true,
          purpose: '喫煙者のCEA高値が、必ずしもがんを意味しない可能性を、偽陽性要因の観点から確認する',
          howTo: '教科書・配布資料で、腫瘍マーカーの偽陽性要因について正しい記述を確認する。',
          clueKey: 'tumor-marker-false-positive',
          demoHint: 'モック正解例: 喫煙はCEAを上昇させる/CA125は月経・妊娠・子宮内膜症で上昇/PSAは前立腺への機械的刺激で上昇',
          choices: [
            { label: '喫煙はCEAを上昇させることが知られている', correct: true },
            {
              label: 'CA125は月経・妊娠・子宮内膜症などの良性婦人科疾患でも上昇し、PSAは直腸診など前立腺への機械的刺激でも上昇しうる',
              correct: true,
            },
            { label: '良性疾患では腫瘍マーカーが上昇することは一切ない', correct: false },
            { label: '喫煙は腫瘍マーカーの値に影響を与えない', correct: false },
          ],
        },
        {
          id: 'q16-u2-inv-fn',
          type: 'investigate',
          xp: 15,
          mode: 'textbook',
          required: true,
          purpose: '腫瘍マーカーが上昇しないケースと、そもそもの臨床的な使いどころを確認する',
          howTo: '教科書・配布資料で、腫瘍マーカーの偽陰性要因とスクリーニングではなく経過観察に用いる理由について正しい記述を確認する。',
          clueKey: 'tumor-marker-false-negative-and-use',
          demoHint: 'モック正解例: Lewis式血液型陰性者はCA19-9が上昇しにくい/感度・特異度が十分でないため単独スクリーニングには不向きで経過観察に用いる',
          choices: [
            { label: 'Lewis式血液型陰性者はCA19-9を産生する酵素を欠くため、膵癌があってもCA19-9が上昇しないことがある', correct: true },
            {
              label: '腫瘍マーカーは感度・特異度が十分に高くないため、単独での健常者スクリーニングには適さず、主に治療効果判定や再発モニタリングなどの経過観察に用いられる',
              correct: true,
            },
            { label: '腫瘍マーカーはすべてのがんを100%の精度で検出できる', correct: false },
            { label: '血液型は腫瘍マーカーの値に一切影響しない', correct: false },
          ],
        },
        {
          id: 'q16-u2-res1',
          type: 'resolve',
          title: '判断',
          xp: 15,
          prompt: '医師「このCEA高値、大腸癌の可能性は?」実習生としてまずどう考える?',
          requiredClueKeys: ['tumor-marker-organ-mapping'],
          choices: [
            {
              label: '対応臓器・組織型の知識を踏まえつつ、喫煙歴など偽陽性要因になりうる背景も考慮したうえで、一つの数値だけで判断しない',
              correct: true,
              feedback: '腫瘍マーカーは対応臓器の目安であって確定診断ではないため、背景も含めて考えることが大切です。',
            },
            {
              label: 'CEAが高いので、ほぼ確実に大腸癌だと判断する',
              correct: false,
              feedback: 'CEAは喫煙などでも上昇するため、単独の数値だけで断定するのは避けます。',
            },
            {
              label: '腫瘍マーカーは絶対的な指標なので、他の情報は考慮しなくてよいと判断する',
              correct: false,
              feedback: '偽陽性・偽陰性要因があるため、他の情報と合わせて考える必要があります。',
            },
          ],
        },
        {
          id: 'q16-u2-res2',
          type: 'resolve',
          title: '報告',
          xp: 15,
          prompt: 'では、最終的にどう報告・説明する?',
          requiredClueKeys: [
            'tumor-marker-organ-mapping',
            'tumor-marker-false-positive',
            'tumor-marker-false-negative-and-use',
          ],
          choices: [
            {
              label:
                '喫煙などの偽陽性要因を踏まえたうえで、腫瘍マーカーは単独のスクリーニングでなく画像検査などと組み合わせた経過観察に用いるものであることを説明する。マーカーパネルや報告基準は施設によって異なるため、自施設の方針も確認する',
              correct: true,
              feedback: '偽陽性・偽陰性要因と本来の使いどころ(経過観察)を踏まえた説明が求められます。',
            },
            {
              label: 'CEA高値のみをもって「がんの可能性が高い」と断定的に報告する',
              correct: false,
              feedback: '偽陽性要因を踏まえずに断定的な報告をするのは避けます。',
            },
            {
              label: '偽陽性・偽陰性要因には触れず、数値だけを機械的に報告する',
              correct: false,
              feedback: '数値の解釈に必要な背景情報を伝えないのは不十分な報告です。',
            },
          ],
        },
        {
          id: 'q16-u2-drill',
          type: 'drill',
          xp: 20,
          questions: [
            {
              id: 'q16-u2-q1',
              format: 'mcq',
              prompt: '膵癌・胆道癌で上昇しやすい腫瘍マーカーはどれか。',
              choices: [
                { label: 'CA19-9', correct: true },
                { label: 'PSA', correct: false },
                { label: 'CA125', correct: false },
                { label: 'ProGRP', correct: false },
              ],
              explanation: 'CA19-9は膵癌・胆道癌で上昇しやすいマーカーです。',
            },
            {
              id: 'q16-u2-q2',
              format: 'mcq',
              prompt: '腫瘍マーカーと対応臓器・組織型の組合せとして正しいものはどれか(複数選択可)。',
              choices: [
                { label: 'AFP — 肝細胞癌', correct: true },
                { label: 'PSA — 前立腺癌', correct: true },
                { label: 'ProGRP — 前立腺癌', correct: false },
                { label: 'SCC — 肝細胞癌', correct: false },
              ],
              explanation: 'AFPは肝細胞癌、PSAは前立腺癌に対応します。ProGRPは肺小細胞癌、SCCは扁平上皮癌が対応臓器です。',
            },
            {
              id: 'q16-u2-q3',
              format: 'mcq',
              prompt: '腫瘍マーカーの偽陽性要因として正しいものはどれか(複数選択可)。',
              choices: [
                { label: '喫煙によるCEAの上昇', correct: true },
                { label: '月経・妊娠・子宮内膜症によるCA125の上昇', correct: true },
                { label: '前立腺への機械的刺激はPSA値に影響しない', correct: false },
                { label: '良性疾患では腫瘍マーカーは一切上昇しない', correct: false },
              ],
              explanation: '喫煙・良性婦人科疾患・機械的刺激はいずれも偽陽性の原因になりえます。',
            },
            {
              id: 'q16-u2-q4',
              format: 'mcq',
              prompt: '膵癌があってもCA19-9が上昇しないことがある理由として正しいのは?',
              choices: [
                { label: 'Lewis式血液型陰性者はCA19-9を産生する酵素を欠くため', correct: true },
                { label: 'CA19-9は膵癌では絶対に上昇しないため', correct: false },
                { label: '喫煙者ではCA19-9が常に低下するため', correct: false },
                { label: '性別によりCA19-9の産生能が決まるため', correct: false },
              ],
              explanation: 'Lewis式血液型陰性者はCA19-9合成に必要な酵素を欠くため、偽陰性となることがあります。',
            },
            {
              id: 'q16-u2-q5',
              format: 'mcq',
              prompt: '腫瘍マーカーの臨床的な使い方として最も適切なのは?',
              choices: [
                { label: '単独での健常者スクリーニングではなく、治療効果判定や再発モニタリングなどの経過観察に主に用いる', correct: true },
                { label: '健常者全員を対象としたがんスクリーニングの唯一の指標として用いる', correct: false },
                { label: '数値が基準範囲内であれば、がんの可能性は完全に否定できる', correct: false },
                { label: '偽陽性・偽陰性の可能性を考えず、数値のみで確定診断する', correct: false },
              ],
              explanation: '感度・特異度の限界から、腫瘍マーカーは経過観察を主目的として用いられます。',
            },
          ],
        },
      ],
    },

    // ══════════════════════════════════════════════════════════════
    // u3: 16-C(POCT)
    // ══════════════════════════════════════════════════════════════
    {
      unitId: 'q16-marker-poct-u3',
      title: '病棟の血糖測定値が中央検査室と違う',
      requestLine: '病棟でPOCT測定した血糖値が、中央検査室の値と異なると相談を受けた。POCTの特性を踏まえて説明する',
      beats: [
        {
          id: 'q16-u3-d0',
          type: 'dialogue',
          xp: 5,
          title: '病棟からの相談',
          backgroundId: 'ward',
          lines: [
            { speaker: '実習生', text: '病棟の看護師さんから「POCTの血糖値と中央検査室の値が違う」と相談されました' },
            { speaker: '技師', text: 'POCTにはPOCTならではの原理と精度管理の考え方があるんだ。まず確認しよう。' },
            {
              speaker: '技師',
              text: 'POCTの設置場所や原理、精度管理と検査室の関わり、中央検査室との測定値差の説明、それぞれ教科書で確認して。',
            },
            { speaker: '技師', text: 'そのうえで、この相談にどう答えるか一緒に整理しよう。' },
          ],
        },
        {
          id: 'q16-u3-problem',
          type: 'problem',
          xp: 5,
        },
        {
          id: 'q16-u3-lec',
          type: 'lecture',
          xp: 10,
          body:
            'POCT(Point of Care Testing)は、患者のそばで実施する検査のことです。外来・病棟・救急・在宅など、中央検査室を介さずにその場で結果が得られる利点があり、迅速な治療判断につながります。\n\n血糖のPOCT測定(病棟の簡易血糖測定器など)は、グルコースオキシダーゼ法やグルコースデヒドロゲナーゼ(GDH)法などの酵素反応を、電気化学的な電流変化や比色反応で検出する原理が主流です。一方、イムノクロマトグラフィは抗原抗体反応を利用する別のPOCTの原理で、インフルエンザ抗原検査や妊娠検査、心筋マーカーの迅速検査などに使われます。検体中の抗原(または抗体)が標識抗体と複合体を作り、テストライン上の捕捉抗体と結合してサンドイッチ形式で発色線を形成する仕組みで、テストラインの有無で陽性・陰性を判定する定性〜半定量的な検査です。コントロールラインの発色は検体が正しく展開したことを示す必須の確認点で、コントロールラインが発色しなければテストラインの結果にかかわらず判定は無効になります。血糖測定とは異なる原理であり、POCTと一括りにせず検査項目によって原理が異なることを押さえておく必要があります。\n\n血糖のPOCT機器の多くは全血を測定するのに対し、中央検査室は血漿(または血清)グルコースを測定します。赤血球内は血漿より水分含量が少ないため、全血血糖値は血漿血糖値よりおおむね10〜15%程度低く出ることがありますが、近年の機種の多くは内部で血漿換算補正を行っているため、この差はあらかじめ縮小されていることも多く、実務で問題になりやすいのはむしろヘマトクリット値の影響や、GDH-PQQ法を用いる一部の機器でのマルトース・腹膜透析液に含まれるイコデキストリンなどの糖類による偽高値です。POCT機器も精度管理の対象であり、その管理・操作者への教育・記録の維持に検査室が関与することが求められます(この関与の範囲は施設によって異なります)。差が出ること自体が必ずしも異常を意味するわけではありませんが、許容範囲を超えて大きい場合は原因を確認する必要があります。',
          bridge:
            '教科書で、POCT血糖測定の原理(酵素法)、イムノクロマトグラフィの原理・判定基準、POCT血糖測定と中央検査室の測定値差(ヘマトクリット・妨害物質など)の3つを確認し、それぞれキーワードを入力してください。',
        },
        {
          id: 'q16-u3-inv-basics',
          type: 'investigate',
          xp: 15,
          mode: 'textbook',
          required: true,
          purpose: 'POCTとはそもそも何か、どこで使われ、この血糖測定はどんな原理で判定しているのかを確認する',
          howTo: '教科書・配布資料で、POCT血糖測定の原理(酵素法)とイムノクロマトグラフィとの違いについて正しい記述を確認する。',
          clueKey: 'poct-definition-and-setting',
          demoHint: 'モック正解例: 患者のそばで実施する検査で外来・病棟・救急・在宅に設置/血糖POCTはグルコースオキシダーゼ・デヒドロゲナーゼ法などの酵素反応を検出/イムノクロマトは抗原抗体反応を使う別のPOCTの原理',
          choices: [
            {
              label: 'POCTは患者のそばで実施する検査で、外来・病棟・救急・在宅などに設置される',
              correct: true,
            },
            {
              label: '血糖のPOCT測定は、グルコースオキシダーゼ法やグルコースデヒドロゲナーゼ法などの酵素反応を電気化学的または比色的に検出する原理が主流である',
              correct: true,
            },
            { label: 'この血糖測定器は、抗原抗体反応を利用するイムノクロマトグラフィを原理としている', correct: false },
            { label: 'POCTは必ず中央検査室内でのみ実施される検査である', correct: false },
          ],
        },
        {
          id: 'q16-u3-inv-ic',
          type: 'investigate',
          xp: 15,
          mode: 'textbook',
          required: true,
          purpose: '血糖測定とは別のPOCT(インフルエンザ抗原検査など)で使われるイムノクロマトグラフィ自体の原理と判定基準を確認する',
          howTo: '教科書・配布資料で、イムノクロマトグラフィの原理と判定基準について正しい記述を確認する。',
          clueKey: 'immunochromatography-principle-and-judgment',
          demoHint: 'モック正解例: 抗原抗体反応によるサンドイッチ形式でテストラインが発色/コントロールライン非発色は判定無効',
          choices: [
            {
              label: '検体中の抗原(または抗体)が標識抗体と複合体を作り、テストライン上の捕捉抗体と結合してサンドイッチ形式で発色線を形成する',
              correct: true,
            },
            {
              label: 'コントロールラインが発色しない場合は、テストラインの結果にかかわらず判定を無効とする',
              correct: true,
            },
            { label: 'イムノクロマトグラフィはテストラインの発色濃度から正確な定量値を得るための方法である', correct: false },
            { label: 'コントロールラインは判定結果に影響しない、参考程度の表示である', correct: false },
          ],
        },
        {
          id: 'q16-u3-inv-qc',
          type: 'investigate',
          xp: 15,
          mode: 'textbook',
          required: true,
          purpose: 'POCTと中央検査室の血糖値が違う具体的な理由と、POCTの精度管理に検査室がどう関わるかを確認する',
          howTo: '教科書・配布資料で、POCT血糖測定と中央検査室の測定値差(ヘマトクリット・妨害物質など)について正しい記述を確認する。',
          clueKey: 'poct-qc-and-central-lab-comparison',
          demoHint: 'モック正解例: 全血-血漿差(約10〜15%)は近年の機種では内部補正済みのことが多い/ヘマトクリットや一部機器ではマルトース等の妨害物質も影響/POCT機器も精度管理が必要で検査室が関与(◆施設差)',
          choices: [
            {
              label: '多くのPOCT血糖測定器は全血を測定するのに対し中央検査室は血漿を測定するため差が生じうるが、近年の機種の多くは内部で血漿換算補正を行っており、この差はあらかじめ縮小されていることが多い',
              correct: true,
            },
            {
              label: '実務で問題になりやすいのはヘマトクリット値の影響や、GDH-PQQ法を用いる一部機器でのマルトース・イコデキストリンなどの糖類による偽高値である',
              correct: true,
            },
            {
              label: 'POCT機器も精度管理の対象であり、その管理・操作者への教育・記録の維持に検査室が関与することが求められる',
              correct: true,
            },
            { label: 'POCT機器は精度管理の対象外であり、検査室が関与する必要はない', correct: false },
            { label: '中央検査室との値に差が出ることは、常にPOCT機器の故障を意味する', correct: false },
          ],
        },
        {
          id: 'q16-u3-res1',
          type: 'resolve',
          title: '判断',
          xp: 15,
          prompt: '看護師「POCTと中央検査室で血糖値が違うんです」。まずどう考える?',
          requiredClueKeys: ['poct-definition-and-setting'],
          choices: [
            {
              label: 'POCTと中央検査室では検体の扱いや測定原理が異なりうることを踏まえ、まず値の乖離の程度と測定条件を確認する',
              correct: true,
              feedback: '差が出ること自体は珍しくないため、まず乖離の程度と条件を確認する姿勢が大切です。',
            },
            {
              label: 'POCT機器が壊れていると即座に断定する',
              correct: false,
              feedback: '原理の違いによる差の可能性を確認せずに断定するのは避けます。',
            },
            {
              label: '中央検査室の値が常に正しいと決めつけ、POCT側の状況を確認しない',
              correct: false,
              feedback: 'どちらが正しいと決めつける前に、条件の違いを確認することが必要です。',
            },
          ],
        },
        {
          id: 'q16-u3-res2',
          type: 'resolve',
          title: '報告',
          xp: 15,
          prompt: 'では、この相談に最終的にどう答える?',
          requiredClueKeys: [
            'poct-definition-and-setting',
            'immunochromatography-principle-and-judgment',
            'poct-qc-and-central-lab-comparison',
          ],
          choices: [
            {
              label:
                'この血糖測定はイムノクロマトグラフィではなく酵素法の原理であることを踏まえたうえで、ヘマトクリット・妨害物質の影響などでPOCTと中央検査室の値には一定の差が生じうることを説明し、精度管理の記録も確認して乖離が許容範囲を超える場合は原因を調べる。POCT機器の精度管理への検査室の関与範囲は施設によって異なるため、自施設の運用に従う',
              correct: true,
              feedback: '差が生じる具体的な理由の説明と、精度管理記録の確認、施設の運用確認までがセットで求められます。',
            },
            {
              label: '差の理由を説明せず、POCTの値をそのまま採用するよう伝える',
              correct: false,
              feedback: '理由を説明せずに一方の値だけを採用させるのは不十分な対応です。',
            },
            {
              label: '精度管理の記録を確認せず、機器を疑わずに済ませる',
              correct: false,
              feedback: '乖離の原因を確認する姿勢を欠いており、適切な対応とは言えません。',
            },
          ],
        },
        {
          id: 'q16-u3-drill',
          type: 'drill',
          xp: 20,
          questions: [
            {
              id: 'q16-u3-q1',
              format: 'mcq',
              prompt: 'POCTの説明として最も適切なのは?',
              choices: [
                { label: '患者のそばで実施する検査で、外来・病棟・救急・在宅などに設置される', correct: true },
                { label: '中央検査室内でのみ実施される検査の総称である', correct: false },
                { label: '医師のみが操作できる検査である', correct: false },
                { label: '結果が出るまでに数日を要する検査である', correct: false },
              ],
              explanation: 'POCTは患者のそばで実施し、迅速に結果が得られることが特徴です。',
            },
            {
              id: 'q16-u3-q2',
              format: 'mcq',
              prompt: '血糖のPOCT測定の原理と、イムノクロマトグラフィに関する記述として正しいものはどれか(複数選択可)。',
              choices: [
                { label: '血糖のPOCT測定は、グルコースオキシダーゼ法やグルコースデヒドロゲナーゼ法などの酵素反応を検出する原理が主流である', correct: true },
                { label: 'イムノクロマトグラフィは抗原抗体反応を利用する原理で、インフルエンザ抗原検査など血糖測定とは別のPOCTに用いられる', correct: true },
                { label: '血糖のPOCT測定は、抗原抗体反応を利用するイムノクロマトグラフィを原理としている', correct: false },
                { label: 'POCTで用いられる測定原理は、検査項目によらずすべて同一である', correct: false },
              ],
              explanation: '血糖のPOCT測定は酵素法、イムノクロマトグラフィは抗原抗体反応を利用する別の原理で、項目によって使い分けられます。',
            },
            {
              id: 'q16-u3-q2b',
              format: 'mcq',
              prompt: 'イムノクロマトグラフィ法の判定基準として最も適切なのは?',
              choices: [
                { label: 'コントロールラインが発色しない場合は、テストラインの結果にかかわらず判定を無効とする', correct: true },
                { label: 'テストラインの発色濃度から正確な定量値を読み取る', correct: false },
                { label: 'コントロールラインは判定結果に影響しない参考表示である', correct: false },
                { label: 'テストラインが発色しなくても、コントロールラインが発色していれば陽性と判定する', correct: false },
              ],
              explanation: 'コントロールラインの発色は検体が正しく展開したことを示す必須の確認点で、これが発色しなければ判定は無効です。',
            },
            {
              id: 'q16-u3-q3',
              format: 'mcq',
              prompt: 'POCTと中央検査室で測定値差が生じたときの初動として最も適切なのは?',
              choices: [
                { label: '値の乖離の程度と測定条件(原理・検体の扱いなど)を確認する', correct: true },
                { label: 'POCT機器が壊れていると即座に断定する', correct: false },
                { label: '中央検査室の値のみが常に正しいと決めつける', correct: false },
                { label: 'どちらの値も無視して再検査の依頼をしない', correct: false },
              ],
              explanation: 'まず乖離の程度と測定条件の違いを確認することが基本です。',
            },
            {
              id: 'q16-u3-q4',
              format: 'mcq',
              prompt: 'POCT機器の精度管理に関する記述として正しいものはどれか(複数選択可)。',
              choices: [
                { label: 'POCT機器も精度管理の対象である', correct: true },
                { label: '検査室がその管理・教育・記録に関与することが求められる', correct: true },
                { label: 'POCT機器は精度管理の対象外である', correct: false },
                { label: '検査室はPOCTの精度管理に一切関与しない', correct: false },
              ],
              explanation: 'POCT機器も中央の検査機器と同様に精度管理の対象であり、検査室の関与が求められます。',
            },
            {
              id: 'q16-u3-q5',
              format: 'mcq',
              prompt: '病棟からのPOCTと中央検査室の値の相違に関する相談への対応として最も優先すべきは?',
              choices: [
                { label: '差が生じうる理由を説明したうえで精度管理記録を確認し、乖離が大きい場合は原因を調べること', correct: true },
                { label: '差の理由を説明せず、どちらか一方の値をそのまま採用させること', correct: false },
                { label: '精度管理記録を見ずに、機器の異常はないと決めつけること', correct: false },
                { label: '相談自体に対応せず放置すること', correct: false },
              ],
              explanation: '理由の説明・記録確認・原因調査までを一連の対応として行うことが求められます。',
            },
            {
              id: 'q16-u3-q6',
              format: 'mcq',
              prompt: 'POCT血糖測定と中央検査室の測定値差の要因に関する記述として正しいものはどれか(複数選択可)。',
              choices: [
                { label: '多くのPOCT血糖測定器は全血を測定するため、血漿を測定する中央検査室の値よりおおむね10〜15%程度低く出ることがある', correct: true },
                { label: 'GDH-PQQ法を用いる一部の機器では、マルトースやイコデキストリンなどの糖類により偽高値が生じることが知られている', correct: true },
                { label: '全血血糖値と血漿血糖値は、測定条件にかかわらず常に完全に一致する', correct: false },
                { label: 'ヘマトクリット値は血糖のPOCT測定値に一切影響しない', correct: false },
              ],
              explanation: '全血-血漿差やヘマトクリット、一部機器での糖類による干渉は、POCT血糖測定で実務上よく問題になる測定値差の要因です。',
            },
          ],
        },
      ],
    },
  ],
}
