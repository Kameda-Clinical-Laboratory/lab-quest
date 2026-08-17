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
  ],

  units: [
    {
      // 既存ユニットを拡充する(新規作成ではない)
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
              text: 'まずは溶血について教科書で確認して。上がりやすい項目・下がりやすい項目の両方を押さえよう。',
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
            '教科書で、上がりやすい項目と下がりやすい項目の両方を確認し、それぞれキーワードを入力してください。',
        },
        {
          id: 'bio-hemolysis-u1-inv-high',
          type: 'investigate',
          xp: 15,
          mode: 'textbook',
          required: true,
          purpose: '溶血が疑われる検体を前に、偽高値になりやすい項目を確認するため',
          howTo: '教科書・配布資料で、溶血によって偽高値になりやすい項目を確認する。',
          clueKey: 'hemolysis-impact',
          demoHint: 'モック正解例: K・LD・AST・Fe',
          choices: [
            { label: 'K', correct: true },
            { label: 'LD', correct: true },
            { label: 'AST', correct: true },
            { label: 'Fe', correct: true },
            { label: 'Na', correct: false },
            { label: '血糖', correct: false },
          ],
        },
        {
          id: 'bio-hemolysis-u1-inv-low',
          type: 'investigate',
          xp: 15,
          mode: 'textbook',
          required: true,
          purpose: '同じ溶血検体で、逆に低く出てしまう項目もあることを確認するため',
          howTo:
            '教科書・配布資料で、溶血によって偽低値になりやすい項目(インスリン・ハプトグロビン・ビリルビンなど)を確認する。',
          clueKey: 'hemolysis-false-low',
          demoHint: 'モック正解例: インスリン・ハプトグロビン・ビリルビン',
          choices: [
            { label: 'インスリン', correct: true },
            { label: 'ハプトグロビン', correct: true },
            { label: 'ビリルビン', correct: true },
            { label: 'K', correct: false },
            { label: 'AST', correct: false },
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
          requiredClueKeys: ['hemolysis-impact', 'hemolysis-false-low'],
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
          ],
        },
      ],
    },
  ],
}
