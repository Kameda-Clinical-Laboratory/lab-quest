// シリーズ「Critical Value・緊急異常値の報告」(大項目22 / 中項目22-A パニック値〈Critical Value〉の設定)
// ラボクエスト骨子案.md 22-A(a定義 b代表的な項目と値◆ c施設ごとに設定値が異なる理由)を
// カバーする。付録B優先度2位のシナリオ(「深夜の血糖22 mg/dLを、誰に、何分以内に、
// 何と伝えるか決める」)と、付録A(誰に・いつ・どう伝えるか/記録の残し方)を判断・報告幕に
// 反映している。
//
// 用語について: 骨子案・国家試験では「パニック値」が正式名称だが、本学(自施設)の呼称に
// 合わせてアプリ内表記は「Critical Value」に統一している(2026-08-20、ユーザー指示)。
// 国試の出題語彙との対応は要チェック — 学生が「パニック値」という表記でも同じ概念だと
// 気づけるよう、将来的にどこか一箇所で対応関係に触れておくことを検討する。
//
// stage(q22-panic-value)は事前にDBへ作成済み(published:false, required:false の下書き)。
// レビュー(clinical-content-reviewer / game-ui-ux-reviewer)がPASSしてから
// stages.published / stages.required をtrueへ切り替える。
//
//   node scripts/push-series.mjs content/series/q22-panic-value.mjs --dry-run
//   STAFF_FULL_PASSWORD=xxxx node scripts/push-series.mjs content/series/q22-panic-value.mjs
//   STAFF_FULL_PASSWORD=xxxx node scripts/push-series.mjs content/series/q22-panic-value.mjs --publish

export default {
  stageId: 'q22-panic-value',

  clues: [
    {
      key: 'panic-representative-items',
      name: '代表的なCritical Value項目と値',
      summary:
        '生命に危険が及びうる代表的な異常値の目安(血糖・K・Na・アンモニアなど)。値そのものは施設ごとの基準に従う。',
    },
    {
      key: 'panic-facility-variation',
      name: 'Critical Valueが施設ごとに異なる理由',
      summary:
        '対象患者層・当直/報告体制・臨床各科との事前合意などにより、施設ごとに閾値や運用が異なる理由。',
    },
  ],

  units: [
    {
      unitId: 'q22-panic-value-u1',
      title: '深夜に出た血糖22',
      requestLine: '深夜当直中、血糖22 mg/dLという結果が出た。誰に、どれくらい早く、どう伝えるか決める',
      beats: [
        // ── 第1幕 会話 ──────────────────────────────────────────
        {
          id: 'q22-panic-value-u1-d0',
          type: 'dialogue',
          xp: 5,
          title: '深夜の検査室',
          backgroundId: 'labhall',
          lines: [
            { speaker: '技師', text: 'この血糖、22。もう一度測ってもらえる?' },
            { speaker: '実習生', text: '再検でも22でした…これ、かなり低いですよね。' },
            {
              speaker: '技師',
              text: 'Critical Valueだね。まずはCritical Valueの考え方を教科書で確認して。代表的な項目と、施設ごとに基準が違う理由の両方を押さえよう。',
            },
            { speaker: '技師', text: 'そのうえで、この値を誰に・どれくらい急いで伝えるか一緒に決めよう。' },
          ],
        },

        // ── 第2幕 クエスト発生 ──────────────────────────────────
        {
          id: 'q22-panic-value-u1-problem',
          type: 'problem',
          xp: 5,
        },

        // ── 第3幕 講義 ────────────────────────────────────────
        {
          id: 'q22-panic-value-u1-lec',
          type: 'lecture',
          xp: 10,
          body:
            'Critical Valueとは、直ちに治療的介入をしなければ生命に危険が及ぶ可能性がある異常値のことです。測定して終わりではなく、正しく・速く臨床側に伝わって初めて意味を持ちます。\n\n代表的な項目には血糖(高度低血糖・高度高血糖)、K(高度な高K血症・低K血症)、Na、アンモニアなどがあり、それぞれ生命の危険に直結する方向(下がりすぎ/上がりすぎ)が項目ごとに決まっています。ただし具体的な閾値は、日本臨床検査医学会などの参考値をもとに各施設が独自に設定するもので、全国一律の数値ではありません。\n\n施設によって閾値や運用が異なるのは、対象となる患者層(小児科の有無、透析患者の割合など)や検査室の当直・報告体制、各診療科とのあらかじめの取り決めが異なるためです。そのため実際の運用では、常に自施設の基準と報告手順に従います。',
          bridge:
            '教科書で、代表的なCritical Value項目と、施設ごとに基準が異なる理由の両方を確認し、それぞれキーワードを入力してください。',
        },

        // ── 第4幕 調査 ────────────────────────────────────────
        {
          id: 'q22-panic-value-u1-inv-items',
          type: 'investigate',
          xp: 15,
          mode: 'textbook',
          required: true,
          purpose: '深夜の検査で危険な異常値を見逃さないため、代表的なCritical Value項目を確認する',
          howTo: '教科書・配布資料で、Critical Valueの代表項目として扱われることが多いものを確認する。',
          clueKey: 'panic-representative-items',
          demoHint: 'モック正解例: 血糖・K・Na・アンモニア',
          choices: [
            { label: '血糖(高度低値・高度高値)', correct: true },
            { label: 'K(高度高値・高度低値)', correct: true },
            { label: 'Na(高度高値・高度低値)', correct: true },
            { label: 'アンモニア(高度高値)', correct: true },
            { label: 'CRP(軽度上昇)', correct: false },
            { label: 'ALP(軽度上昇)', correct: false },
          ],
        },
        {
          id: 'q22-panic-value-u1-inv-variation',
          type: 'investigate',
          xp: 15,
          mode: 'textbook',
          required: true,
          purpose: '同じ項目でも施設によって基準・運用が異なることを確認する',
          howTo: '教科書・配布資料で、Critical Valueの閾値や運用が施設ごとに異なる理由を確認する。',
          clueKey: 'panic-facility-variation',
          demoHint: 'モック正解例: 対象患者層の違い・当直/報告体制の違い・臨床各科との事前合意',
          choices: [
            { label: '対象となる患者層(小児科・透析患者の割合など)の違い', correct: true },
            { label: '検査室の当直体制・報告フローの違い', correct: true },
            { label: '各診療科とのあらかじめの取り決め内容の違い', correct: true },
            { label: '検査技師個人の裁量で自由に決めてよいから', correct: false },
            { label: '全国一律の数値が法令で定められているから', correct: false },
          ],
        },

        // ── 第5幕 判断 ────────────────────────────────────────
        {
          id: 'q22-panic-value-u1-res1',
          type: 'resolve',
          title: '判断',
          xp: 15,
          prompt: '技師「血糖22、再検でも同じ値。次はどうする?」',
          requiredClueKeys: ['panic-representative-items'],
          choices: [
            {
              label: '直ちに主治医(不在なら当直医)へ電話で連絡し、口頭で伝える',
              correct: true,
              feedback: 'Critical Valueは速さが命です。まず電話で直接伝えることを優先します。',
            },
            {
              label: '電子カルテに結果を入力し、翌朝の定時報告まで待つ',
              correct: false,
              feedback: '入力するだけでは伝わったことになりません。緊急性のある値は直ちに連絡します。',
            },
            {
              label: '看護師にメモを渡すだけで、医師への直接連絡はしない',
              correct: false,
              feedback: '伝達経路が途切れる可能性があります。医師本人への直接連絡を優先します。',
            },
          ],
        },

        // ── 第6幕 報告 ────────────────────────────────────────
        {
          id: 'q22-panic-value-u1-res2',
          type: 'resolve',
          title: '報告',
          xp: 15,
          prompt: 'では、この値をどう伝え、どう記録に残す? 施設の基準と手順を踏まえて考えて。',
          requiredClueKeys: ['panic-representative-items', 'panic-facility-variation'],
          choices: [
            {
              label:
                '自施設のCritical Value基準・報告手順に沿って連絡し、伝えた相手・時刻・内容を記録に残す',
              correct: true,
              feedback:
                '施設ごとに基準値や報告フローが異なるため、自施設の手順を優先します。誰に・いつ・何を伝えたかの記録も欠かせません。',
            },
            {
              label: '自分の判断で閾値を決め、危険と感じたときだけ口頭で伝える',
              correct: false,
              feedback: '個人の裁量ではなく、自施設が定めた基準・手順に従います。',
            },
            {
              label: '口頭で伝えた後は、特に記録を残さない',
              correct: false,
              feedback: '誰に・いつ・どう伝えたかを記録に残すところまでが報告です。',
            },
          ],
        },

        // ── 第7幕 発展 ────────────────────────────────────────
        {
          id: 'q22-panic-value-u1-drill',
          type: 'drill',
          xp: 20,
          questions: [
            {
              id: 'q22-panic-value-u1-q1',
              format: 'mcq',
              prompt: 'Critical Valueの説明として最も適切なのは?',
              choices: [
                {
                  label: '直ちに治療的介入をしなければ生命に危険が及ぶ可能性がある異常値',
                  correct: true,
                },
                { label: '基準範囲をわずかに外れた値全般', correct: false },
                { label: '再検査が必要と装置が自動判定した値', correct: false },
                { label: '患者から検査結果について問い合わせがあった値', correct: false },
              ],
              explanation: 'Critical Valueは「生命の危険」に直結し得る値である点が定義の核心です。',
            },
            {
              id: 'q22-panic-value-u1-q2',
              format: 'mcq',
              prompt: 'Critical Valueとして扱われることが多い項目はどれか(複数選択可)。',
              choices: [
                { label: '血糖(高度低値・高度高値)', correct: true },
                { label: 'K(高度異常値)', correct: true },
                { label: 'アンモニア(高度高値)', correct: true },
                { label: 'CRP(軽度上昇)', correct: false },
                { label: '総コレステロール(軽度高値)', correct: false },
              ],
              explanation: '血糖・K・アンモニアなどは、高度な異常値が急速に生命を脅かしうる代表項目です。',
            },
            {
              id: 'q22-panic-value-u1-q3',
              format: 'mcq',
              prompt: 'Critical Valueを検出したときの最初の行動として最も適切なのは?',
              choices: [
                { label: '再検査で値を確認したうえで、直ちに主治医・当直医へ連絡する', correct: true },
                { label: '翌朝の定時報告までカルテ入力だけしておく', correct: false },
                { label: '検体を廃棄し、結果は報告しない', correct: false },
                { label: '他の患者の結果と平均を取って評価する', correct: false },
              ],
              explanation: '再検で値を確認したうえで、速やかに医師本人へ直接連絡することが初動です。',
            },
            {
              id: 'q22-panic-value-u1-q4',
              format: 'mcq',
              prompt: 'Critical Valueの閾値や運用が施設ごとに異なる理由として適切なのはどれか(複数選択可)。',
              choices: [
                { label: '対象となる患者層(小児科・透析患者の割合など)が異なるため', correct: true },
                { label: '検査室の当直体制・報告フローが異なるため', correct: true },
                { label: '各診療科とのあらかじめの取り決め内容が異なるため', correct: true },
                { label: '検査技師個人が自由に決めてよいと法令で定められているため', correct: false },
              ],
              explanation:
                '患者層・体制・診療科との合意など、施設固有の事情によって基準や運用が変わります。',
            },
            {
              id: 'q22-panic-value-u1-q5',
              format: 'mcq',
              prompt: 'Critical Valueを報告するとき、最も優先すべきは?',
              choices: [
                { label: '自施設の基準・報告手順に従い、伝達内容を記録に残すこと', correct: true },
                { label: '検査者自身が正しいと思う基準を使うこと', correct: false },
                { label: '他施設の基準値をそのまま採用すること', correct: false },
                { label: '記録を残さず、口頭で伝えたことにすること', correct: false },
              ],
              explanation: '施設ごとに基準・手順が異なるため、自施設の手順を優先し、記録まで残します。',
            },
          ],
        },
      ],
    },
  ],
}
