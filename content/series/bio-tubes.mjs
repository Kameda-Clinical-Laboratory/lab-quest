// シリーズ「採血管種類」(大項目2: 採血管と抗凝固剤)
// 既存u1は中項目2-A(採血管の種類)相当。今回追加するu2は
// 2-B(採血管の採取順序)+2-C(抗凝固剤・添加物の影響)をカバーする。
// 骨子案付録B優先度3位のシナリオ(「病棟から届いた"Caが異様に低い"検体の原因を
// 突き止める」)を判断・報告幕に反映している。
//
//   node scripts/push-series.mjs content/series/bio-tubes.mjs --dry-run
//   STAFF_FULL_PASSWORD=xxxx node scripts/push-series.mjs content/series/bio-tubes.mjs
//   STAFF_FULL_PASSWORD=xxxx node scripts/push-series.mjs content/series/bio-tubes.mjs --publish

export default {
  stageId: 'bio-tubes',

  clues: [
    {
      key: 'tube-order-carryover',
      name: '採血管の採取順序とキャリーオーバー',
      summary:
        '添加剤の多い管を先に採ると、次の管へ添加剤が持ち込まれる(キャリーオーバー)ことがある。推奨される採取順序を守ることで相互汚染を防ぐ。',
    },
    {
      key: 'edta-false-low',
      name: 'EDTA混入で偽低値になる項目',
      summary:
        'EDTAはCa・Mg・ALP・鉄などをキレートして偽低値にする一方、Kは逆に偽高値になる(方向が項目ごとに異なる)。',
    },
  ],

  units: [
    {
      unitId: 'bio-tubes-u2',
      title: 'Caが異様に低い検体',
      requestLine: '病棟から届いた検体のCaが異様に低い。採血管の使い方に問題がなかったか確認する',
      beats: [
        // ── 第1幕 会話 ──────────────────────────────────────────
        {
          id: 'bio-tubes-u2-d0',
          type: 'dialogue',
          xp: 5,
          title: '病棟から届いた検体',
          backgroundId: 'ward',
          lines: [
            { speaker: '技師', text: 'このCa、ずいぶん低いね…この患者さん、こんな値になる病態あったっけ?' },
            { speaker: '実習生', text: '特にそういう記録は見当たらないですね…採血の状況、確認しましょうか。' },
            {
              speaker: '技師',
              text: 'うん。まずは採血管の採取順序と、添加剤の持ち込み(キャリーオーバー)について教科書で確認して。',
            },
            { speaker: '技師', text: 'そのうえで、この検体をどう扱うか一緒に決めよう。' },
          ],
        },

        // ── 第2幕 クエスト発生 ──────────────────────────────────
        {
          id: 'bio-tubes-u2-problem',
          type: 'problem',
          xp: 5,
        },

        // ── 第3幕 講義 ────────────────────────────────────────
        {
          id: 'bio-tubes-u2-lec',
          type: 'lecture',
          xp: 10,
          body:
            '複数の採血管を使う場合、採血には推奨される採取順序があります。一般に「血液培養→凝固(クエン酸Na)→血清(プレーン/分離剤)→ヘパリン→EDTA→解糖阻止剤(NaF)」の順が教科書的に広く教えられており、添加剤の少ない管・汚染に弱い検査を先に、添加剤の多い管を後に採るのが基本です。添加剤の多い管を先に採ると、その添加剤が次の管に微量持ち込まれる「キャリーオーバー」が起こることがあり、順序を誤ると後続の管の検査値に偽の異常が出ることがあります。\n\n代表的な例がEDTA(EDTA-2K/2Na管に使用)です。EDTAはCa・Mg・ALP・鉄などの金属イオンをキレート(捕捉)するため、これらの項目は偽低値になります。一方でKは逆に偽高値になり、項目によって影響の方向が異なる点に注意が必要です。\n\nこのため、原因不明の異常値を見たときは、測定そのものだけでなく採血管の種類・採取順序・キャリーオーバーの可能性も確認する視点が欠かせません。なお具体的な採取順序は教科書・ガイドラインによって多少の表記差があるため、詳細は自施設の手順書・教科書で確認してください。',
          bridge:
            '教科書で、採取順序・キャリーオーバーの考え方と、EDTA混入で偽低値になる項目の両方を確認し、それぞれキーワードを入力してください。',
        },

        // ── 第4幕 調査 ────────────────────────────────────────
        {
          id: 'bio-tubes-u2-inv-order',
          type: 'investigate',
          xp: 15,
          mode: 'textbook',
          required: true,
          purpose: '原因不明のCa低値を前に、採血手技(順序)に問題がなかったか確認する',
          howTo: '教科書・配布資料で、採血管の推奨採取順序とキャリーオーバーについて正しい記述を確認する。',
          clueKey: 'tube-order-carryover',
          demoHint:
            'モック正解例: 血液培養→凝固→血清→ヘパリン→EDTA→解糖阻止剤の順/添加剤の多い管を先に採ると持ち込まれる',
          choices: [
            {
              label: '推奨される順序は、血液培養→凝固(クエン酸Na)→血清(プレーン/分離剤)→ヘパリン→EDTA→解糖阻止剤(NaF)である',
              correct: true,
            },
            {
              label: '添加剤の多い管を先に採ると、次の管へ添加剤が持ち込まれる(キャリーオーバー)ことがある',
              correct: true,
            },
            { label: 'EDTA管は血清管より先に採るのが正しい順序である', correct: false },
            { label: '採血管の順序は検査結果に一切影響しない', correct: false },
          ],
        },
        {
          id: 'bio-tubes-u2-inv-edta',
          type: 'investigate',
          xp: 15,
          mode: 'textbook',
          required: true,
          purpose: '前の管からEDTAが持ち込まれていた場合、どの項目に影響が出るかを確認する',
          howTo: '教科書・配布資料で、EDTA混入によって偽低値になりやすい項目を確認する。',
          clueKey: 'edta-false-low',
          demoHint: 'モック正解例: Ca・Mg・ALP・鉄',
          choices: [
            { label: 'Ca', correct: true },
            { label: 'Mg', correct: true },
            { label: 'ALP', correct: true },
            { label: '鉄', correct: true },
            { label: 'K(実際は偽高値になる)', correct: false },
            { label: 'Na', correct: false },
          ],
        },

        // ── 第5幕 判断 ────────────────────────────────────────
        {
          id: 'bio-tubes-u2-res1',
          type: 'resolve',
          title: '判断',
          xp: 15,
          prompt: '技師「このCa低値、まず何を確認する?」',
          requiredClueKeys: ['tube-order-carryover'],
          choices: [
            {
              label: '採血の順序やEDTA管からの持ち込みがなかったか、採血記録・検体の外観を確認する',
              correct: true,
              feedback: '数値だけでなく、採血手技(順序・混入)の可能性から確認します。',
            },
            {
              label: 'そのままCa低値として報告する',
              correct: false,
              feedback: '偽低値の可能性を確認せずに報告するのは避けます。',
            },
            {
              label: '測定機器を疑い、再校正だけ行う',
              correct: false,
              feedback: 'まず確認すべきは採血手技の可能性です。装置の再校正だけでは原因を見落とします。',
            },
          ],
        },

        // ── 第6幕 報告 ────────────────────────────────────────
        {
          id: 'bio-tubes-u2-res2',
          type: 'resolve',
          title: '報告',
          xp: 15,
          prompt: 'では、この検体の結果をどう扱う? 採血手技の確認結果を踏まえて考えて。',
          requiredClueKeys: ['tube-order-carryover', 'edta-false-low'],
          choices: [
            {
              label:
                'EDTA持ち込みなど手技上の問題が疑われる場合は、自施設の検体拒否・再採血基準に沿って対応する(コメント付与・再採血依頼など)',
              correct: true,
              feedback:
                '疑いがある検体をどう扱うかは施設の基準によって異なるため、自施設の手順を優先します。',
            },
            {
              label: '検体の状態に関わらず、そのまま数値通り報告する',
              correct: false,
              feedback: '偽低値の可能性を確認せずに報告するのは避けます。',
            },
            {
              label: '原因を追及せず、検体を黙って廃棄する',
              correct: false,
              feedback: '記録や連絡を残さず廃棄するのは避け、手順に沿って対応します。',
            },
          ],
        },

        // ── 第7幕 発展 ────────────────────────────────────────
        {
          id: 'bio-tubes-u2-drill',
          type: 'drill',
          xp: 20,
          questions: [
            {
              id: 'bio-tubes-u2-q1',
              format: 'mcq',
              prompt: '採血管の採取順序を守る主な理由は?',
              choices: [
                { label: '添加剤の持ち込み(キャリーオーバー)を防ぐため', correct: true },
                { label: '採血にかかる時間を短縮するため', correct: false },
                { label: '管のラベルを揃えるため', correct: false },
                { label: '患者の痛みを減らすため', correct: false },
              ],
              explanation: '順序を誤ると添加剤が次の管に持ち込まれ、検査値に影響することがあります。',
            },
            {
              id: 'bio-tubes-u2-q2',
              format: 'mcq',
              prompt: '採血管の採取順序に関する記述として正しいものはどれか(複数選択可)。',
              choices: [
                {
                  label: '推奨される順序は、血液培養→凝固→血清→ヘパリン→EDTA→解糖阻止剤である',
                  correct: true,
                },
                {
                  label: '添加剤の多い管を先に採ると、次の管へ添加剤が持ち込まれることがある',
                  correct: true,
                },
                { label: '採血管の順序は検査結果に一切影響しない', correct: false },
                { label: '順序を誤っても検体量が十分なら問題にならない', correct: false },
              ],
              explanation: '順序違反によるキャリーオーバーは、検体量に関わらず検査値へ影響し得ます。',
            },
            {
              id: 'bio-tubes-u2-q3',
              format: 'mcq',
              prompt: 'Caが異様に低い検体を見つけたときの最初の行動として最も適切なのは?',
              choices: [
                { label: '採血の順序やEDTA管からの持ち込みがなかったか確認する', correct: true },
                { label: 'そのまま数値通り報告する', correct: false },
                { label: '検体を廃棄し、結果は報告しない', correct: false },
                { label: '他の患者の結果と平均を取って評価する', correct: false },
              ],
              explanation: '採血手技(順序・混入)の可能性から確認するのが初動です。',
            },
            {
              id: 'bio-tubes-u2-q4',
              format: 'mcq',
              prompt: 'EDTAの混入で偽低値になりやすい項目はどれか(複数選択可)。',
              choices: [
                { label: 'Ca', correct: true },
                { label: 'Mg', correct: true },
                { label: 'ALP', correct: true },
                { label: '鉄', correct: true },
                { label: 'K(実際は偽高値になる)', correct: false },
              ],
              explanation: 'EDTAは金属イオンをキレートするため、Ca・Mg・ALP・鉄は偽低値、Kは逆に偽高値になります。',
            },
            {
              id: 'bio-tubes-u2-q5',
              format: 'mcq',
              prompt: '採血手技に問題が疑われる検体の扱いを判断するとき、最も優先すべきは?',
              choices: [
                { label: '自施設の検体拒否・再採血基準に従うこと', correct: true },
                { label: '検査者の主観的な印象だけで判断すること', correct: false },
                { label: '他の患者の結果との平均で判断すること', correct: false },
                { label: '実習生の判断のみで決めること', correct: false },
              ],
              explanation: '施設ごとに検体拒否・再採血の基準が異なるため、自施設の手順を優先します。',
            },
          ],
        },
      ],
    },
  ],
}
