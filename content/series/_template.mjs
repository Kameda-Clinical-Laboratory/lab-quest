// ユニット原稿テンプレート(コード版)。
// 使い方: このファイルを `content/series/<stageId>.mjs` としてコピーしてから、
// TODOを埋める。直接このファイルをpushしないこと。
//
// 埋め方の指針は docs/unit-content-template.md を参照。参考実装は
// content/series/bio-hemolysis.mjs。
//
//   node scripts/push-series.mjs content/series/<stageId>.mjs --dry-run
//   STAFF_FULL_PASSWORD=xxxx node scripts/push-series.mjs content/series/<stageId>.mjs --publish

export default {
  // TODO: 既存シリーズ(stage)のid。新規シリーズの場合は先にstage自体を
  // 作る必要がある(このスクリプトはunit/beat/clueのみを扱う)。
  stageId: 'TODO-stage-id',

  // 調査カードで使う手がかり。key はこのファイル内だけで使う符牒(実IDはサーバ側が
  // 採番する)。name が既存clueと同名なら新規作成せず既存idを再利用する。
  clues: [
    {
      key: 'clue-a',
      name: 'TODO: 手がかり名1(例: ◯◯の△△)',
      summary: 'TODO: 1〜2文。何がわかる手がかりか。',
    },
    // TODO: 調査カードが2枚以上なら、その分だけ追加する(1枚なら1件だけでよい)。
    // {
    //   key: 'clue-b',
    //   name: 'TODO: 手がかり名2',
    //   summary: 'TODO',
    // },
  ],

  units: [
    {
      // TODO: 既存ユニットを拡充する場合はunitIdを指定(save_unit_draftで上書き)。
      // 新規ユニットならunitIdを省略する(create_unitで新規id採番→ログに出るので
      // 次回以降はそれをここに書き戻す)。
      // unitId: 'TODO-unit-id',
      title: 'TODO: ユニットタイトル(体言止め、例:「赤く染まった検体」)',
      requestLine: 'TODO: 依頼文1文(状況+今回何を決めるか)',
      beats: [
        // ── 第1幕 会話(自由記載、3〜5行) ──────────────────────────
        {
          id: 'TODO-unit-id-d0',
          type: 'dialogue',
          xp: 5,
          title: 'TODO: 幕タイトル(例:「看護室での立ち話」)',
          backgroundId: 'labhall', // labhall / ward / conference / corridor
          lines: [
            { speaker: 'TODO', text: 'TODO: 違和感の提示' },
            { speaker: 'TODO', text: 'TODO: 反応' },
            { speaker: 'TODO', text: 'TODO: 講義・調査への橋渡し' },
            { speaker: 'TODO', text: 'TODO: 今回決めることを一言' },
          ],
        },

        // ── 第2幕 クエスト発生(固定、編集不要) ──────────────────────
        {
          id: 'TODO-unit-id-problem',
          type: 'problem',
          xp: 5,
        },

        // ── 第3幕 講義(200〜500字、2〜3段落) ─────────────────────
        {
          id: 'TODO-unit-id-lec',
          type: 'lecture',
          xp: 10,
          body:
            'TODO: 段落1(現象の定義・成因)\n\nTODO: 段落2(影響の方向性。対になる2方向があれば両方に言及)\n\nTODO: 段落3(施設差・許容限界・報告手順への言及)',
          bridge: 'TODO: 「教科書で〇〇を確認し、キーワードを入力してください」',
        },

        // ── 第4幕 調査(1〜3枚。カードごとにclueKeyで手がかりを紐付ける) ─────
        {
          id: 'TODO-unit-id-inv-a',
          type: 'investigate',
          xp: 15,
          mode: 'textbook', // textbook / doc / observe
          required: true,
          purpose: 'TODO: なぜ確認するか(症例の文脈に紐づける)',
          howTo: 'TODO: どこで確認するか(教科書・配布資料・観察)',
          clueKey: 'clue-a',
          demoHint: 'TODO: モック正解例',
          choices: [
            { label: 'TODO: 正解1', correct: true },
            { label: 'TODO: 正解2(あれば)', correct: true },
            { label: 'TODO: 不正解1', correct: false },
            { label: 'TODO: 不正解2', correct: false },
          ],
        },
        // TODO: 調査カードが2枚以上なら、その分だけ追加する。
        // {
        //   id: 'TODO-unit-id-inv-b',
        //   type: 'investigate',
        //   xp: 15,
        //   mode: 'textbook',
        //   required: true,
        //   purpose: 'TODO',
        //   howTo: 'TODO',
        //   clueKey: 'clue-b',
        //   demoHint: 'TODO',
        //   choices: [
        //     { label: 'TODO', correct: true },
        //     { label: 'TODO', correct: false },
        //   ],
        // },

        // ── 第5幕 判断(title固定、requiredClueKeysは最初の手がかりのみ) ────
        {
          id: 'TODO-unit-id-res1',
          type: 'resolve',
          title: '判断',
          xp: 15,
          prompt: 'TODO: 「(役職)「(状況の再掲)。次はどうする?」」',
          requiredClueKeys: ['clue-a'],
          choices: [
            { label: 'TODO: 正解(初動対応)', correct: true, feedback: 'TODO' },
            { label: 'TODO: 不正解1', correct: false, feedback: 'TODO' },
            { label: 'TODO: 不正解2', correct: false, feedback: 'TODO' },
          ],
        },

        // ── 第6幕 報告(title固定、requiredClueKeysは全カード) ────────────
        {
          id: 'TODO-unit-id-res2',
          type: 'resolve',
          title: '報告',
          xp: 15,
          prompt: 'TODO: 「では、最終的にどう報告する/対応する?」',
          requiredClueKeys: ['clue-a' /* , 'clue-b' */],
          choices: [
            {
              label: 'TODO: 正解(施設差◆を踏まえた最終判断)',
              correct: true,
              feedback: 'TODO: 施設ごとに基準・手順が異なるため、自施設の手順を優先する旨を必ず一言入れる',
            },
            { label: 'TODO: 不正解1', correct: false, feedback: 'TODO' },
            { label: 'TODO: 不正解2', correct: false, feedback: 'TODO' },
          ],
        },

        // ── 第7幕 発展(3〜6問。単一選択のみで埋めず、複数選択も混ぜる) ─────
        {
          id: 'TODO-unit-id-drill',
          type: 'drill',
          xp: 20,
          questions: [
            {
              id: 'TODO-unit-id-q1',
              format: 'mcq',
              prompt: 'TODO: 講義の基本知識(単一選択)',
              choices: [
                { label: 'TODO: 正解', correct: true },
                { label: 'TODO: 不正解1', correct: false },
                { label: 'TODO: 不正解2', correct: false },
                { label: 'TODO: 不正解3', correct: false },
              ],
              explanation: 'TODO',
            },
            {
              id: 'TODO-unit-id-q2',
              format: 'mcq',
              prompt: 'TODO: 調査カード1の内容を国試形式で聞き直す(複数選択可)',
              choices: [
                { label: 'TODO: 正解1', correct: true },
                { label: 'TODO: 正解2', correct: true },
                { label: 'TODO: 不正解1', correct: false },
                { label: 'TODO: 不正解2', correct: false },
              ],
              explanation: 'TODO',
            },
            {
              id: 'TODO-unit-id-q3',
              format: 'mcq',
              prompt: 'TODO: 初動対応・最初の行動を問う(単一選択)',
              choices: [
                { label: 'TODO: 正解', correct: true },
                { label: 'TODO: 不正解1', correct: false },
                { label: 'TODO: 不正解2', correct: false },
                { label: 'TODO: 不正解3', correct: false },
              ],
              explanation: 'TODO',
            },
            {
              id: 'TODO-unit-id-q4',
              format: 'mcq',
              prompt: 'TODO: 調査カード2の内容を国試形式で聞き直す(複数選択可、カードが2枚以上あれば)',
              choices: [
                { label: 'TODO: 正解1', correct: true },
                { label: 'TODO: 正解2', correct: true },
                { label: 'TODO: 不正解1', correct: false },
                { label: 'TODO: 不正解2', correct: false },
              ],
              explanation: 'TODO',
            },
            {
              id: 'TODO-unit-id-q5',
              format: 'mcq',
              prompt: 'TODO: 判断/報告の考え方を一般化した設問(単一選択、「最も優先すべきは」型)',
              choices: [
                { label: 'TODO: 正解', correct: true },
                { label: 'TODO: 不正解1', correct: false },
                { label: 'TODO: 不正解2', correct: false },
                { label: 'TODO: 不正解3', correct: false },
              ],
              explanation: 'TODO',
            },
          ],
        },
      ],
    },
  ],
}
