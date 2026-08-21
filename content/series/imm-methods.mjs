// シリーズ「免疫学的分析法」(大項目17)
// 既存ステージ imm-methods(測定方法)は旧chapters/caseSteps形式のみだったため、
// 新形式ユニットを初めて投入する(bio-qcと同じパターン: 旧chapters/caseStepsは
// 残したまま、新形式unitsを追加投入する)。
//
// 骨子案付録B優先度8位のシナリオ(「腫瘍マーカーだけが極端に高い。フック効果を疑えるか」)を
// u1の判断・報告幕に反映している。
//
// 大項目17は中項目A(抗原抗体反応の基礎)/B(非標識法)/C(標識免疫測定法)の3本立て。
// u1=A、u2=B、u3=Cで全カバーする。
//
//   node scripts/push-series.mjs content/series/imm-methods.mjs --dry-run
//   STAFF_FULL_PASSWORD=xxxx node scripts/push-series.mjs content/series/imm-methods.mjs
//   STAFF_FULL_PASSWORD=xxxx node scripts/push-series.mjs content/series/imm-methods.mjs --publish

export default {
  stageId: 'imm-methods',

  clues: [
    {
      key: 'antigen-antibody-structure-and-binding',
      name: '抗原抗体の構造・エピトープと結合に働く力',
      summary:
        '抗体はY字型の構造を持ち、Fab部位で抗原のエピトープ(抗原決定基)を認識する。結合は水素結合・疎水性相互作用・静電気力などの非共有結合による。親和性(affinity)は1つの結合部位の強さ、アビディティ(avidity)は複数の結合部位を含めた総合的な結合強度を指す。',
    },
    {
      key: 'antibody-reaction-types-and-monoclonal',
      name: '抗原抗体反応の種類とモノクローナル抗体の作製',
      summary:
        '沈降反応(可溶性抗原の複合体沈殿)・凝集反応(粒子状抗原の凝集)・溶解反応(補体を介した溶血)・中和反応(毒素・ウイルスの活性中和)がある。モノクローナル抗体はB細胞とミエローマ細胞を融合したハイブリドーマから、単一クローン由来の均一な抗体として作製する。',
    },
    {
      key: 'prozone-and-hook-effect',
      name: 'プロゾーン現象(地帯現象)とフック効果',
      summary:
        '抗原・抗体の量比が適切でないと、複合体形成が妨げられ偽陰性・偽低値になることがある(プロゾーン現象)。特にサンドイッチ免疫測定法で抗原が極端に過剰なときに生じる偽低値をフック効果と呼び、高濃度のはずの検体が低い値として報告されるおそれがある。',
    },
    {
      key: 'turbidimetric-and-nephelometric-methods',
      name: '免疫比濁法(TIA)・免疫比ろう法(NIA)とラテックス凝集比濁法',
      summary:
        '免疫比濁法(TIA)は抗原抗体複合体形成による濁度上昇を透過光で、免疫比ろう法(NIA)は散乱光で検出する非標識の測定法。ラテックス凝集比濁法はラテックス粒子に抗体を結合させて凝集による濁度変化を測定し、感度を高めた方法。',
    },
    {
      key: 'immunodiffusion-and-immunoelectrophoresis',
      name: '免疫拡散法・免疫電気泳動法',
      summary:
        '免疫拡散法はゲル内で抗原と抗体を拡散させ沈降線を形成させて可視化する古典的手法。免疫電気泳動法は電気泳動と免疫拡散を組み合わせ、蛋白分画の異常(M蛋白の同定など)の検出に用いる。',
    },
    {
      key: 'measurement-range-and-dilution-retest',
      name: '非標識法の測定範囲と希釈再検',
      summary:
        '非標識法は測定できる濃度範囲(ダイナミックレンジ)が限られ、高濃度検体ではプロゾーン現象により見かけ上低い値が出ることがある。疑わしい場合は検体を希釈して再測定し、希釈倍率に比例した値の変化(直線性)を確認する。',
    },
    {
      key: 'label-substances-and-methods',
      name: '標識物質と測定法の対応',
      summary:
        '酵素標識はEIA/ELISA(酵素基質反応の発色・発光)、蛍光標識はFIA、化学発光標識はCLIA/CLEIA、電気化学発光標識はECLIA(電極上での電気化学的励起による発光、高感度)、放射性同位元素標識はRIA(現在はほとんど使われない)に対応する。',
    },
    {
      key: 'sandwich-and-competitive-assay',
      name: 'サンドイッチ法(非競合法)と競合法・B/F分離',
      summary:
        'サンドイッチ法は固相化抗体と標識抗体で抗原を挟み込み、抗原量に比例してシグナルが増加する(複数エピトープを持つ大きな抗原に向く)。競合法は標識抗原(または抗体)が検体中の抗原と固相上の抗体(または抗原)を奪い合い、検体中抗原量が多いほどシグナルが減少する(単一エピトープしか持たない低分子量物質に向く)。いずれもB/F分離(結合型と遊離型の標識物質の分離)が必要で、固相には磁石で捕捉・洗浄しやすい磁性ビーズ(磁性マイクロ粒子)がよく使われる。',
    },
    {
      key: 'immunoassay-interference-and-countermeasures',
      name: '免疫測定の干渉(異好抗体・HAMA・RF・ビオチン)と対処',
      summary:
        '異好抗体(動物由来試薬に非特異的に結合するヒト抗体、代表例はHAMA=ヒト抗マウス抗体)やRF(リウマトイド因子)はサンドイッチ法で偽高値・偽低値の原因になる。高用量ビオチンサプリメント摂取は、ビオチン-ストレプトアビジン結合系を利用する測定法に干渉し偽高値・偽低値を招くことがある。干渉が疑われる場合は希釈系列の確認・別法での再測定・服薬歴の確認などで対処する(◆施設差)。',
    },
  ],

  units: [
    // ══════════════════════════════════════════════════════════════
    // u1: 17-A(抗原抗体反応の基礎) — 骨子案付録B優先#8のシナリオ
    // ══════════════════════════════════════════════════════════════
    {
      unitId: 'imm-methods-u1',
      title: '腫瘍マーカーだけが極端に高い',
      requestLine: '他の項目は落ち着いているのに、この腫瘍マーカーだけ極端に高い。フック効果の可能性を整理する',
      beats: [
        {
          id: 'imm-u1-d0',
          type: 'dialogue',
          xp: 5,
          title: '不自然に高い値',
          backgroundId: 'labhall',
          lines: [
            { speaker: '実習生', text: 'この患者さん、腫瘍マーカーだけ突出して高いんです。他の所見とちょっと合わない気がします…' },
            { speaker: '技師', text: 'それは注意すべきパターンだね。まず免疫測定の反応の仕組みを確認しよう。' },
            {
              speaker: '技師',
              text: '抗原抗体反応の基礎(構造・結合力、反応の種類、モノクローナル抗体)と、プロゾーン現象・フック効果、教科書で確認して。',
            },
            { speaker: '技師', text: 'そのうえで、この値をどう扱うか一緒に考えよう。' },
          ],
        },
        {
          id: 'imm-u1-problem',
          type: 'problem',
          xp: 5,
        },
        {
          id: 'imm-u1-lec',
          type: 'lecture',
          xp: 10,
          body:
            '免疫測定は、抗体が抗原のエピトープ(抗原決定基)を認識して結合する反応を利用しています。抗体はY字型の構造をしており、その先端のFab部位でエピトープに結合します。この結合は水素結合や疎水性相互作用、静電気力などの非共有結合によるもので、1つの結合部位の強さを親和性(affinity)、複数の結合部位を含めた総合的な結合の強さをアビディティ(avidity)と呼びます。\n\n抗原抗体反応には、可溶性抗原が複合体を作って沈殿する沈降反応、粒子状抗原が凝集する凝集反応、補体を介して赤血球などが溶ける溶解反応、毒素やウイルスの活性を抑える中和反応などがあります。また、検査で使う抗体には、単一のエピトープを認識する均一なモノクローナル抗体があり、B細胞とミエローマ細胞を融合させたハイブリドーマから作られます。\n\nこれらの反応は、抗原と抗体の量比が適切でないとうまく進みません。抗体が過剰、あるいは抗原が過剰な場合に、複合体形成が妨げられて偽陰性・偽低値になることがあり、これをプロゾーン現象(地帯現象)と呼びます。特にサンドイッチ免疫測定法では、抗原が極端に過剰なときに同様の現象が起こり、本来は高値のはずの検体が見かけ上低い値として出てしまうことがあります。これを特にフック効果と呼びます。腫瘍マーカーが極端に高い(あるいは臨床像と合わず不自然に低い)ときは、この可能性を念頭に置く必要があります。',
          bridge:
            '教科書で、抗原抗体反応の基礎(構造・結合力、反応の種類、モノクローナル抗体)と、プロゾーン現象・フック効果の2つを確認し、それぞれキーワードを入力してください。',
        },
        {
          id: 'imm-u1-inv-basics',
          type: 'investigate',
          xp: 15,
          mode: 'textbook',
          required: true,
          purpose: '免疫測定の基礎になっている抗原抗体反応の性質を確認する',
          howTo: '教科書・配布資料で、抗原抗体の構造・エピトープと結合に働く力について正しい記述を確認する。',
          clueKey: 'antigen-antibody-structure-and-binding',
          demoHint: 'モック正解例: 抗体はFab部位でエピトープに結合/結合は非共有結合による/親和性は1部位の強さ、アビディティは総合的な結合の強さ',
          choices: [
            {
              label: '抗体はFab部位で抗原のエピトープ(抗原決定基)に結合する',
              correct: true,
            },
            {
              label: '親和性(affinity)は1つの結合部位の強さ、アビディティ(avidity)は複数の結合部位を含めた総合的な結合の強さを指す',
              correct: true,
            },
            { label: '抗原抗体の結合は共有結合によって形成される', correct: false },
            { label: '親和性とアビディティは全く同じ概念であり、区別する意味がない', correct: false },
          ],
        },
        {
          id: 'imm-u1-inv-types',
          type: 'investigate',
          xp: 15,
          mode: 'textbook',
          required: true,
          purpose: '免疫測定法の基盤になっている反応の種類と、検査で使われる抗体について確認する',
          howTo: '教科書・配布資料で、抗原抗体反応の種類とモノクローナル抗体の作製について正しい記述を確認する。',
          clueKey: 'antibody-reaction-types-and-monoclonal',
          demoHint: 'モック正解例: 沈降・凝集・溶解・中和反応がある/モノクローナル抗体はハイブリドーマ法(B細胞とミエローマ細胞の融合)で作製',
          choices: [
            {
              label: '抗原抗体反応には、沈降反応・凝集反応・溶解反応・中和反応などがある',
              correct: true,
            },
            {
              label: 'モノクローナル抗体はB細胞とミエローマ細胞を融合したハイブリドーマから、単一クローン由来の均一な抗体として作製する',
              correct: true,
            },
            { label: '沈降反応と凝集反応はまったく同じ現象を指す言葉である', correct: false },
            { label: 'モノクローナル抗体はポリクローナル抗体と全く同じ性質を持つ', correct: false },
          ],
        },
        {
          id: 'imm-u1-inv-hook',
          type: 'investigate',
          xp: 15,
          mode: 'textbook',
          required: true,
          purpose: '「腫瘍マーカーだけが極端に高い」という今回のケースの原因になりうる現象を確認する',
          howTo: '教科書・配布資料で、プロゾーン現象(地帯現象)とフック効果について正しい記述を確認する。',
          clueKey: 'prozone-and-hook-effect',
          demoHint: 'モック正解例: 抗原・抗体の量比が不適切だと複合体形成が妨げられ偽陰性・偽低値になる/フック効果はサンドイッチ法で抗原過剰時に生じる偽低値',
          choices: [
            {
              label: '抗原・抗体の量比が適切でないと複合体形成が妨げられ、偽陰性・偽低値になることがある(プロゾーン現象)',
              correct: true,
            },
            {
              label: 'フック効果は、サンドイッチ免疫測定法で抗原が極端に過剰なときに生じる偽低値で、本来高値のはずの検体が低く出ることがある',
              correct: true,
            },
            { label: 'プロゾーン現象やフック効果は、抗原抗体反応では理論上一切起こりえない', correct: false },
            { label: 'フック効果が起きているときは、常に検体を希釈せず原液のまま再測定すればよい', correct: false },
          ],
        },
        {
          id: 'imm-u1-res1',
          type: 'resolve',
          title: '判断',
          xp: 15,
          prompt: '腫瘍マーカーだけが極端に高い検体を前に、まずどう考える?',
          requiredClueKeys: ['prozone-and-hook-effect'],
          choices: [
            {
              label: '臨床像と合わない極端な高値の場合、フック効果による見かけ上の値である可能性も含めて検討する',
              correct: true,
              feedback: '極端な高値・臨床像との不一致は、フック効果を疑うきっかけの一つです。',
            },
            {
              label: '数値が高いのだからそのまま重症と判断し、他の可能性は考えない',
              correct: false,
              feedback: '極端な値ほど、測定上の現象の可能性も検討する必要があります。',
            },
            {
              label: '臨床像と合わないことには触れず、そのまま報告してよいと判断する',
              correct: false,
              feedback: '臨床像との不一致に気づいたら、まず原因を検討する姿勢が求められます。',
            },
          ],
        },
        {
          id: 'imm-u1-res2',
          type: 'resolve',
          title: '報告',
          xp: 15,
          prompt: 'では、この値を最終的にどう扱う?',
          requiredClueKeys: [
            'antigen-antibody-structure-and-binding',
            'antibody-reaction-types-and-monoclonal',
            'prozone-and-hook-effect',
          ],
          choices: [
            {
              label: 'フック効果の可能性を念頭に、検体を希釈して再測定し、希釈倍率に応じた値の変化を確認したうえで報告する。フック効果が疑われる場合の具体的な確認手順は施設ごとに異なるため、自施設の手順に従う',
              correct: true,
              feedback: '希釈再検による確認と、自施設の手順に従うことの両方が重要です。',
            },
            {
              label: '希釈再検はせず、初回の測定値をそのまま報告する',
              correct: false,
              feedback: 'フック効果が疑われる場合、希釈再検で確認せずに報告するのは避けます。',
            },
            {
              label: '原因を確認せず、機器の故障として片付ける',
              correct: false,
              feedback: '原因を確認しないまま機器の故障と決めつけるのは適切ではありません。',
            },
          ],
        },
        {
          id: 'imm-u1-drill',
          type: 'drill',
          xp: 20,
          questions: [
            {
              id: 'imm-u1-q1',
              format: 'mcq',
              prompt: '抗体が抗原のエピトープに結合する部位はどれか。',
              choices: [
                { label: 'Fab部位', correct: true },
                { label: 'Fc部位', correct: false },
                { label: 'ヒンジ部位', correct: false },
                { label: 'ハイブリドーマ', correct: false },
              ],
              explanation: '抗体のFab部位が抗原のエピトープを認識・結合します。',
            },
            {
              id: 'imm-u1-q2',
              format: 'mcq',
              prompt: '抗原抗体の結合と反応の種類に関する記述として正しいものはどれか(複数選択可)。',
              choices: [
                { label: '抗原抗体の結合は水素結合などの非共有結合による', correct: true },
                { label: '抗原抗体反応には沈降反応・凝集反応・溶解反応・中和反応などがある', correct: true },
                { label: '抗原抗体の結合は必ず共有結合で形成される', correct: false },
                { label: '沈降反応と凝集反応は同一の現象である', correct: false },
              ],
              explanation: '抗原抗体反応は非共有結合によるもので、反応の型にはいくつかの種類があります。',
            },
            {
              id: 'imm-u1-q3',
              format: 'mcq',
              prompt: 'モノクローナル抗体の作製に用いられる方法はどれか。',
              choices: [
                { label: 'ハイブリドーマ法', correct: true },
                { label: 'PCR法', correct: false },
                { label: '電気泳動法', correct: false },
                { label: 'クロマトグラフィー法', correct: false },
              ],
              explanation: 'B細胞とミエローマ細胞を融合したハイブリドーマから、単一クローン由来の均一な抗体を作製します。',
            },
            {
              id: 'imm-u1-q4',
              format: 'mcq',
              prompt: 'サンドイッチ免疫測定法で、抗原が極端に過剰なときに生じる偽低値を何と呼ぶか。',
              choices: [
                { label: 'フック効果', correct: true },
                { label: 'キャリーオーバー', correct: false },
                { label: 'B/F分離', correct: false },
                { label: 'アビディティ', correct: false },
              ],
              explanation: '抗原過剰時にサンドイッチ法で生じる偽低値をフック効果と呼びます。',
            },
            {
              id: 'imm-u1-q5',
              format: 'mcq',
              prompt: '臨床像と合わない極端な高値の腫瘍マーカーを前にした対応として最も優先すべきは?',
              choices: [
                { label: 'フック効果の可能性を検討し、希釈再検で値の変化を確認すること', correct: true },
                { label: '数値をそのまま信じて重症と判断すること', correct: false },
                { label: '原因を確認せず機器の故障と決めつけること', correct: false },
                { label: '再測定をせずに初回値のみで報告すること', correct: false },
              ],
              explanation: 'フック効果を念頭に置いた希釈再検による確認が、極端な値を扱う際の基本です。',
            },
          ],
        },
      ],
    },

    // ══════════════════════════════════════════════════════════════
    // u2: 17-B(非標識法)
    // ══════════════════════════════════════════════════════════════
    {
      unitId: 'imm-methods-u2',
      title: '希釈したら値が急に変わった',
      requestLine: '検体を希釈して再測定したら、予想と違う値になった。非標識法の測定範囲を整理する',
      beats: [
        {
          id: 'imm-u2-d0',
          type: 'dialogue',
          xp: 5,
          title: '希釈後の意外な結果',
          backgroundId: 'labhall',
          lines: [
            { speaker: '実習生', text: 'この検体、希釈して測り直したら、予想していたのと違う値になりました…' },
            { speaker: '技師', text: 'まず非標識法がどんな原理で、どんな測定範囲を持つかを確認しよう。' },
            {
              speaker: '技師',
              text: '免疫比濁法(TIA)・免疫比ろう法(NIA)とラテックス凝集比濁法、免疫拡散法・免疫電気泳動法、そして測定範囲と希釈再検、教科書で確認して。',
            },
            { speaker: '技師', text: 'そのうえで、この結果をどう解釈するか一緒に考えよう。' },
          ],
        },
        {
          id: 'imm-u2-problem',
          type: 'problem',
          xp: 5,
        },
        {
          id: 'imm-u2-lec',
          type: 'lecture',
          xp: 10,
          body:
            '標識物質を使わずに抗原抗体反応を検出する方法を非標識法と呼びます。免疫比濁法(TIA)は、抗原抗体複合体の形成による濁度の上昇を透過光で検出する方法で、免疫比ろう法(NIA)は同じ現象を散乱光で検出します。ラテックス凝集比濁法は、ラテックス粒子に抗体を結合させておき、抗原と反応させて生じる凝集による濁度変化を測定する方法で、感度を高めたTIAの一種として広く使われています。\n\nこのほか、ゲル内で抗原と抗体を拡散させて沈降線を形成させる免疫拡散法や、電気泳動と免疫拡散を組み合わせた免疫電気泳動法(M蛋白の同定など蛋白分画の異常検出に用いる)といった古典的な手法もあります。\n\n非標識法には、正確に測定できる濃度範囲(ダイナミックレンジ)に限りがあるという特徴があります。この範囲を超える高濃度の検体では、抗原が過剰になることで複合体形成が妨げられ、プロゾーン現象により見かけ上低い値が出てしまうことがあります。臨床像と合わない値や、測定範囲の上限に近い値が出た場合には、検体を希釈して再測定し、希釈倍率に応じて値が比例して変化する(直線性がある)かどうかを確認することが大切です。',
          bridge:
            '教科書で、免疫比濁法(TIA)・免疫比ろう法(NIA)とラテックス凝集比濁法、免疫拡散法・免疫電気泳動法、そして測定範囲と希釈再検の3つを確認し、それぞれキーワードを入力してください。',
        },
        {
          id: 'imm-u2-inv-turbidimetric',
          type: 'investigate',
          xp: 15,
          mode: 'textbook',
          required: true,
          purpose: '非標識法の代表的な測定原理を確認する',
          howTo: '教科書・配布資料で、免疫比濁法(TIA)・免疫比ろう法(NIA)とラテックス凝集比濁法について正しい記述を確認する。',
          clueKey: 'turbidimetric-and-nephelometric-methods',
          demoHint: 'モック正解例: TIAは透過光、NIAは散乱光で濁度を検出/ラテックス凝集比濁法はラテックス粒子で感度を高めたTIAの一種',
          choices: [
            {
              label: '免疫比濁法(TIA)は透過光、免疫比ろう法(NIA)は散乱光で抗原抗体複合体による濁度上昇を検出する',
              correct: true,
            },
            {
              label: 'ラテックス凝集比濁法はラテックス粒子に抗体を結合させ、凝集による濁度変化を測定する、感度を高めた方法である',
              correct: true,
            },
            { label: 'TIAとNIAは全く同じ光の検出方式を用いる', correct: false },
            { label: 'ラテックス凝集比濁法は標識物質を用いる方法である', correct: false },
          ],
        },
        {
          id: 'imm-u2-inv-classical',
          type: 'investigate',
          xp: 15,
          mode: 'textbook',
          required: true,
          purpose: '古典的な非標識法についても確認する',
          howTo: '教科書・配布資料で、免疫拡散法・免疫電気泳動法について正しい記述を確認する。',
          clueKey: 'immunodiffusion-and-immunoelectrophoresis',
          demoHint: 'モック正解例: 免疫拡散法はゲル内拡散で沈降線を形成/免疫電気泳動法は電気泳動と組み合わせM蛋白同定など蛋白分画異常の検出に用いる',
          choices: [
            {
              label: '免疫拡散法はゲル内で抗原と抗体を拡散させ、沈降線を形成させて可視化する古典的手法である',
              correct: true,
            },
            {
              label: '免疫電気泳動法は電気泳動と免疫拡散を組み合わせ、M蛋白の同定など蛋白分画の異常検出に用いる',
              correct: true,
            },
            { label: '免疫拡散法は現代の全自動分析装置と全く同じ原理である', correct: false },
            { label: '免疫電気泳動法は電気泳動の要素を含まない方法である', correct: false },
          ],
        },
        {
          id: 'imm-u2-inv-range',
          type: 'investigate',
          xp: 15,
          mode: 'textbook',
          required: true,
          purpose: '希釈後に値が変わった今回のケースを理解するため、測定範囲の考え方を確認する',
          howTo: '教科書・配布資料で、非標識法の測定範囲と希釈再検について正しい記述を確認する。',
          clueKey: 'measurement-range-and-dilution-retest',
          demoHint: 'モック正解例: 非標識法は測定できる濃度範囲に限りがある/高濃度検体はプロゾーン現象で低値が出うるため希釈再検で直線性を確認する',
          choices: [
            {
              label: '非標識法は正確に測定できる濃度範囲(ダイナミックレンジ)に限りがある',
              correct: true,
            },
            {
              label: '測定範囲を超える高濃度の検体ではプロゾーン現象により見かけ上低い値が出ることがあるため、希釈して再測定し直線性を確認する',
              correct: true,
            },
            { label: '非標識法の測定範囲には上限がなく、どんな高濃度でも正確に測定できる', correct: false },
            { label: '希釈再検を行っても、値が比例して変化するかどうかは確認できない', correct: false },
          ],
        },
        {
          id: 'imm-u2-res1',
          type: 'resolve',
          title: '判断',
          xp: 15,
          prompt: '希釈して測り直したら予想と違う値になった。まずどう考える?',
          requiredClueKeys: ['measurement-range-and-dilution-retest'],
          choices: [
            {
              label: '原液での測定が測定範囲を超えていた(プロゾーン現象の影響を受けていた)可能性を考え、希釈倍率に応じた値の変化(直線性)を確認する',
              correct: true,
              feedback: '希釈後の値の変化を確認することで、原液での値が信頼できるかを判断できます。',
            },
            {
              label: '希釈後の値の方を無条件に信頼せず、原液の値をそのまま採用する',
              correct: false,
              feedback: '希釈再検の意味を確認せずに原液の値を優先するのは適切ではありません。',
            },
            {
              label: '装置が壊れていると即座に判断する',
              correct: false,
              feedback: '測定範囲や希釈再検の考え方を確認する前に故障と決めつけるのは避けます。',
            },
          ],
        },
        {
          id: 'imm-u2-res2',
          type: 'resolve',
          title: '報告',
          xp: 15,
          prompt: 'では、最終的にどう報告する?',
          requiredClueKeys: [
            'turbidimetric-and-nephelometric-methods',
            'immunodiffusion-and-immunoelectrophoresis',
            'measurement-range-and-dilution-retest',
          ],
          choices: [
            {
              label: '希釈倍率に応じて値が比例して変化していることを確認したうえで、希釈補正後の値を報告する。プロゾーン現象の影響が疑われた経緯も記録に残す',
              correct: true,
              feedback: '直線性の確認と、経緯の記録の両方が今後の検体対応にも役立ちます。',
            },
            {
              label: '希釈補正の確認をせず、希釈後の値をそのまま報告する',
              correct: false,
              feedback: '直線性を確認せずに希釈後の値だけを採用するのは不十分です。',
            },
            {
              label: '原液と希釈後の値のどちらが正しいか判断せず、両方とも報告しない',
              correct: false,
              feedback: '確認の手順を踏んだうえで、適切な値を選んで報告する必要があります。',
            },
          ],
        },
        {
          id: 'imm-u2-drill',
          type: 'drill',
          xp: 20,
          questions: [
            {
              id: 'imm-u2-q1',
              format: 'mcq',
              prompt: '免疫比濁法(TIA)の検出方式として正しいものはどれか。',
              choices: [
                { label: '透過光', correct: true },
                { label: '散乱光', correct: false },
                { label: '化学発光', correct: false },
                { label: '放射能', correct: false },
              ],
              explanation: 'TIA(免疫比濁法)は透過光で濁度上昇を検出します(NIAは散乱光)。',
            },
            {
              id: 'imm-u2-q2',
              format: 'mcq',
              prompt: '非標識法に関する記述として正しいものはどれか(複数選択可)。',
              choices: [
                { label: 'ラテックス凝集比濁法は感度を高めたTIAの一種として広く使われる', correct: true },
                { label: '免疫電気泳動法はM蛋白の同定など蛋白分画異常の検出に用いる', correct: true },
                { label: 'ラテックス凝集比濁法は標識物質を必須とする方法である', correct: false },
                { label: '免疫拡散法は現代の全自動分析装置と同一の原理である', correct: false },
              ],
              explanation: 'ラテックス凝集比濁法・免疫電気泳動法はいずれも非標識法の代表例です。',
            },
            {
              id: 'imm-u2-q3',
              format: 'mcq',
              prompt: '測定範囲を超える高濃度検体で、非標識法に起こりうる現象はどれか。',
              choices: [
                { label: 'プロゾーン現象による見かけ上の低値', correct: true },
                { label: '常に正確な高値が得られる', correct: false },
                { label: '測定不能エラーが必ず出る', correct: false },
                { label: '検体の色が変化する', correct: false },
              ],
              explanation: '測定範囲を超える高濃度検体ではプロゾーン現象により見かけ上低い値が出ることがあります。',
            },
            {
              id: 'imm-u2-q4',
              format: 'mcq',
              prompt: '希釈再検の目的として最も適切なのは?',
              choices: [
                { label: '希釈倍率に応じて値が比例して変化する(直線性がある)かを確認すること', correct: true },
                { label: '検体量を減らして廃棄しやすくすること', correct: false },
                { label: '測定時間を短縮すること', correct: false },
                { label: '試薬の消費量を増やすこと', correct: false },
              ],
              explanation: '希釈再検は、希釈倍率に応じた値の変化(直線性)を確認するために行います。',
            },
            {
              id: 'imm-u2-q5',
              format: 'mcq',
              prompt: '希釈後に予想と異なる値が出た検体への対応として最も優先すべきは?',
              choices: [
                { label: '希釈倍率に応じた値の変化(直線性)を確認したうえで報告すること', correct: true },
                { label: '希釈後の値を確認せず原液の値を採用すること', correct: false },
                { label: '直ちに装置の故障と判断すること', correct: false },
                { label: 'どちらの値も報告せず放置すること', correct: false },
              ],
              explanation: '直線性の確認を経てから報告することが、正確な値を伝えるために重要です。',
            },
          ],
        },
      ],
    },

    // ══════════════════════════════════════════════════════════════
    // u3: 17-C(標識免疫測定法)
    // ══════════════════════════════════════════════════════════════
    {
      unitId: 'imm-methods-u3',
      title: 'ビオチンサプリを飲んでいる患者の値がおかしい',
      requestLine: '高用量ビオチンサプリメントを摂取している患者の検査値に矛盾がある。標識免疫測定法の干渉要因を整理する',
      beats: [
        {
          id: 'imm-u3-d0',
          type: 'dialogue',
          xp: 5,
          title: 'サプリメントの申告',
          backgroundId: 'labhall',
          lines: [
            { speaker: '実習生', text: 'この患者さん、問診票に「高用量のビオチンサプリを飲んでいる」と書いてあって、値が臨床像と合いません…' },
            { speaker: '技師', text: 'それは重要な情報だね。まず標識免疫測定法がどんな原理で成り立っているかを確認しよう。' },
            {
              speaker: '技師',
              text: '標識物質と測定法の対応、サンドイッチ法と競合法・B/F分離、そして干渉(異好抗体・HAMA・RF・ビオチン)と対処、教科書で確認して。',
            },
            { speaker: '技師', text: 'そのうえで、この値をどう扱うか一緒に考えよう。' },
          ],
        },
        {
          id: 'imm-u3-problem',
          type: 'problem',
          xp: 5,
        },
        {
          id: 'imm-u3-lec',
          type: 'lecture',
          xp: 10,
          body:
            '標識免疫測定法は、抗原や抗体に目印となる標識物質を付けて反応を検出する方法です。標識物質にはいくつかの種類があり、酵素を使うEIA/ELISA(酵素基質反応による発色・発光)、蛍光物質を使うFIA、化学発光物質を使うCLIA/CLEIA、電気化学発光物質を使うECLIA(電極上での電気化学的な励起による発光で、高感度なことで知られます)、放射性同位元素を使うRIA(現在はほとんど使われなくなっています)があります。\n\n測定の形式には、大きく分けてサンドイッチ法(非競合法)と競合法があります。サンドイッチ法は、固相化した抗体と標識抗体で抗原を挟み込み、抗原量が多いほどシグナルが増加する方式で、複数のエピトープを持つ大きな抗原に向いています。競合法は、標識抗原(または抗体)が検体中の抗原と固相上の抗体(または抗原)を奪い合う方式で、検体中の抗原量が多いほどシグナルは減少します。こちらは単一のエピトープしか持たない低分子量の物質に向いています。いずれの方式でも、結合型(Bound)と遊離型(Free)の標識物質を分離するB/F分離という操作が必要で、固相には磁石で捕捉・洗浄しやすい磁性ビーズ(磁性マイクロ粒子)がよく使われます。\n\n標識免疫測定法は、検体中の物質によって干渉を受けることがあります。動物由来の試薬に非特異的に結合するヒトの抗体(異好抗体)は、代表例としてマウス由来の抗体を使う検査に対するHAMA(ヒト抗マウス抗体)があり、偽高値・偽低値の原因になります。リウマトイド因子(RF)も同様に非特異的な干渉を起こすことがあります。近年注目されているのが、ビオチン-ストレプトアビジン結合系を利用する測定法への高用量ビオチンサプリメントの干渉で、偽高値・偽低値のどちらも起こりえます。干渉が疑われる場合は、希釈系列での確認や別法での再測定、服薬・サプリメント摂取歴の確認などで対処します(具体的な確認手順は自施設の方針によります)。',
          bridge:
            '教科書で、標識物質と測定法の対応、サンドイッチ法と競合法・B/F分離、そして免疫測定の干渉(異好抗体・HAMA・RF・ビオチン)と対処の3つを確認し、それぞれキーワードを入力してください。',
        },
        {
          id: 'imm-u3-inv-labels',
          type: 'investigate',
          xp: 15,
          mode: 'textbook',
          required: true,
          purpose: '標識免疫測定法にどんな種類があるのかを確認する',
          howTo: '教科書・配布資料で、標識物質と測定法の対応について正しい記述を確認する。',
          clueKey: 'label-substances-and-methods',
          demoHint: 'モック正解例: 酵素標識はEIA/ELISA/蛍光標識はFIA/化学発光標識はCLIA・CLEIA/電気化学発光標識はECLIA(高感度)',
          choices: [
            {
              label: '酵素標識はEIA/ELISA、蛍光標識はFIA、化学発光標識はCLIA/CLEIAに対応する',
              correct: true,
            },
            {
              label: '電気化学発光標識はECLIAに対応し、高感度な測定法として知られる',
              correct: true,
            },
            { label: 'RIA(放射性同位元素標識)は現在最も広く使われている標識法である', correct: false },
            { label: '標識物質の種類によらず、検出原理はすべて同一である', correct: false },
          ],
        },
        {
          id: 'imm-u3-inv-format',
          type: 'investigate',
          xp: 15,
          mode: 'textbook',
          required: true,
          purpose: '標識免疫測定法の測定形式(サンドイッチ法・競合法)と、その仕組みを確認する',
          howTo: '教科書・配布資料で、サンドイッチ法(非競合法)と競合法、B/F分離とマイクロ粒子について正しい記述を確認する。',
          clueKey: 'sandwich-and-competitive-assay',
          demoHint: 'モック正解例: サンドイッチ法は抗原量に比例してシグナル増加/競合法は抗原量が多いほどシグナル減少/磁性ビーズはB/F分離に使われる固相',
          choices: [
            {
              label: 'サンドイッチ法は固相化抗体と標識抗体で抗原を挟み込み、抗原量に比例してシグナルが増加する',
              correct: true,
            },
            {
              label: '競合法は検体中の抗原量が多いほどシグナルが減少し、磁性ビーズはB/F分離のための固相としてよく使われる',
              correct: true,
            },
            { label: 'サンドイッチ法は単一エピトープしか持たない低分子量物質の測定に最も向いている', correct: false },
            { label: 'B/F分離は結合型と遊離型を区別せず、まとめて測定するための操作である', correct: false },
          ],
        },
        {
          id: 'imm-u3-inv-interference',
          type: 'investigate',
          xp: 15,
          mode: 'textbook',
          required: true,
          purpose: 'ビオチンサプリメントを摂取している今回の患者の値が臨床像と合わない理由を確認する',
          howTo: '教科書・配布資料で、免疫測定の干渉(異好抗体・HAMA・RF・ビオチン)と対処について正しい記述を確認する。',
          clueKey: 'immunoassay-interference-and-countermeasures',
          demoHint: 'モック正解例: 異好抗体(HAMA等)やRFは偽高値・偽低値の原因になる/高用量ビオチン摂取はビオチン-ストレプトアビジン結合系の測定法に干渉しうる',
          choices: [
            {
              label: '異好抗体(HAMAなど)やリウマトイド因子(RF)は、サンドイッチ法などで偽高値・偽低値の原因になることがある',
              correct: true,
            },
            {
              label: '高用量ビオチンサプリメントの摂取は、ビオチン-ストレプトアビジン結合系を利用する測定法に干渉し、偽高値・偽低値を招くことがある',
              correct: true,
            },
            { label: '標識免疫測定法は、検体中の物質による干渉を一切受けない', correct: false },
            { label: 'ビオチンサプリメントの摂取歴は、免疫測定の結果解釈に一切関係しない', correct: false },
          ],
        },
        {
          id: 'imm-u3-res1',
          type: 'resolve',
          title: '判断',
          xp: 15,
          prompt: 'ビオチンサプリを摂取している患者の値が臨床像と合わない。まずどう考える?',
          requiredClueKeys: ['immunoassay-interference-and-countermeasures'],
          choices: [
            {
              label: 'ビオチン干渉の可能性を念頭に置き、服薬・サプリメント摂取歴と測定原理(ビオチン-ストレプトアビジン結合系を使う方法かどうか)を確認する',
              correct: true,
              feedback: 'サプリメント摂取歴と測定原理の両方を確認することが、干渉を疑う第一歩です。',
            },
            {
              label: 'サプリメントの申告は測定結果に関係ないと判断し、無視する',
              correct: false,
              feedback: 'ビオチンは実際に一部の測定法に干渉しうるため、無視するのは適切ではありません。',
            },
            {
              label: '値をそのまま信頼し、他の可能性は検討しない',
              correct: false,
              feedback: '臨床像と合わない場合は、干渉の可能性を検討することが必要です。',
            },
          ],
        },
        {
          id: 'imm-u3-res2',
          type: 'resolve',
          title: '報告',
          xp: 15,
          prompt: 'では、最終的にどう報告・対応する?',
          requiredClueKeys: ['label-substances-and-methods', 'sandwich-and-competitive-assay', 'immunoassay-interference-and-countermeasures'],
          choices: [
            {
              label: 'ビオチン干渉が疑われることを説明したうえで、可能であれば服薬中止後の再検査や別法での確認を提案する。干渉確認の具体的な手順は施設ごとに異なるため、自施設の方針に従う',
              correct: true,
              feedback: '干渉の可能性の説明と、確認のための具体的な提案、自施設方針の確認までがセットで求められます。',
            },
            {
              label: 'サプリメントの話には触れず、数値だけをそのまま報告する',
              correct: false,
              feedback: '干渉の可能性を伝えないと、臨床側が誤って判断してしまうおそれがあります。',
            },
            {
              label: '再検査や別法での確認を一切提案しない',
              correct: false,
              feedback: '疑わしい場合は、確認のための具体的な対応を提案することが望ましい対応です。',
            },
          ],
        },
        {
          id: 'imm-u3-drill',
          type: 'drill',
          xp: 20,
          questions: [
            {
              id: 'imm-u3-q1',
              format: 'mcq',
              prompt: '高感度な測定法として知られる、電気化学発光を利用する標識免疫測定法はどれか。',
              choices: [
                { label: 'ECLIA', correct: true },
                { label: 'RIA', correct: false },
                { label: 'イムノクロマトグラフィ', correct: false },
                { label: '免疫拡散法', correct: false },
              ],
              explanation: 'ECLIA(電気化学発光免疫測定法)は電極上での電気化学的な励起による発光を利用する高感度な方法です。',
            },
            {
              id: 'imm-u3-q2',
              format: 'mcq',
              prompt: 'サンドイッチ法と競合法に関する記述として正しいものはどれか(複数選択可)。',
              choices: [
                { label: 'サンドイッチ法は抗原量に比例してシグナルが増加する', correct: true },
                { label: '競合法は検体中の抗原量が多いほどシグナルが減少する', correct: true },
                { label: 'サンドイッチ法は単一エピトープの低分子量物質に最も向いている', correct: false },
                { label: '競合法は抗原量が多いほどシグナルが増加する', correct: false },
              ],
              explanation: 'サンドイッチ法は抗原量に比例して増加、競合法は抗原量が多いほど減少するシグナルを利用します。',
            },
            {
              id: 'imm-u3-q3',
              format: 'mcq',
              prompt: 'B/F分離の固相としてよく使われ、磁石で捕捉・洗浄できるものはどれか。',
              choices: [
                { label: '磁性ビーズ(磁性マイクロ粒子)', correct: true },
                { label: 'ろ紙', correct: false },
                { label: 'ガラス電極', correct: false },
                { label: 'セルロースアセテート膜', correct: false },
              ],
              explanation: '磁性ビーズは磁石で捕捉・洗浄しやすく、自動化にも適した固相です。',
            },
            {
              id: 'imm-u3-q4',
              format: 'mcq',
              prompt: '免疫測定の干渉要因に関する記述として正しいものはどれか(複数選択可)。',
              choices: [
                { label: 'HAMA(ヒト抗マウス抗体)はマウス由来抗体を使う検査で偽高値の原因になりうる', correct: true },
                { label: '高用量ビオチンサプリメントはビオチン-ストレプトアビジン結合系の測定法に干渉しうる', correct: true },
                { label: 'リウマトイド因子(RF)は免疫測定に一切影響しない', correct: false },
                { label: '標識免疫測定法は干渉物質の影響を受けない', correct: false },
              ],
              explanation: '異好抗体・ビオチンなどは、それぞれ異なる仕組みで免疫測定に干渉しえます。',
            },
            {
              id: 'imm-u3-q5',
              format: 'mcq',
              prompt: 'サプリメント摂取歴と検査値が矛盾する場合の対応として最も優先すべきは?',
              choices: [
                { label: '干渉の可能性を説明したうえで、再検査や別法での確認を提案すること', correct: true },
                { label: 'サプリメントの話には触れず数値だけを報告すること', correct: false },
                { label: '値をそのまま信頼し、他の可能性は検討しないこと', correct: false },
                { label: '再検査の提案を一切行わないこと', correct: false },
              ],
              explanation: '干渉の可能性を踏まえた説明と、確認のための具体的な提案が求められます。',
            },
          ],
        },
      ],
    },
  ],
}
