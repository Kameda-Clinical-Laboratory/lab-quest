// シリーズ「疾患マーカー」(大項目16)
// 骨子案付録B優先度6位のシナリオ(「BNPとNT-proBNP、どちらを追えばよいかDr.に聞かれた」)を
// u1の判断・報告幕に反映している。
//
// 大項目16は中項目A(心不全・心筋マーカー)/B(腫瘍マーカー)の2本立て。
// u1=A、u2=Bで全カバーする。
//
// 2026-08-27改訂: 骨子案の再構成により、旧C(POCT)は独立した大項目20「POCT」
// (content/series/q20-poct.mjs)へ分割した。stage idは`q16-marker-poct`のまま
// 変更していない(既存のunit/beat idへの影響を避けるため、旧IDを引き継ぐ既存の
// 慣例に従う)が、titleは「疾患マーカー」に更新済み。旧u3(POCT)はunit行の
// stage_idを直接付け替える形でDB上も`q20-poct`へ移設済み(削除・再作成ではない
// ため、unit id `q16-marker-poct-u3`自体は変わっていない)。
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
  ],
}
