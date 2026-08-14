import type { ClueDef, LearningUnit } from './learning'

export const BIO_BASICS_CLUES: ClueDef[] = [
  {
    id: 'clue-priority-flow',
    name: '午前の優先順',
    summary: '受付・適正・投入の流れを意識し、緊急度の高い対応を後回しにしない。',
  },
  {
    id: 'clue-panic-def',
    name: 'パニック値',
    summary: '生命に関わる可能性がある異常値。施設手順に沿って速やかに連絡する。',
  },
]

export const BIO_BASICS_UNITS: LearningUnit[] = [
  {
    id: 'bio-basics-u1',
    title: '検査室の一日',
    requestLine: '朝の受付が溜まっている。何から手を付けるべきかを決める',
    beats: [
      {
        type: 'dialogue',
        id: 'bio-basics-u1-d0',
        xp: 5,
        lines: [
          { speaker: 'Ns.', text: 'すみません、朝から検体が留まってて…急ぎの依頼もあるんですが、何から手を付けるべきか分からなくて。' },
          { speaker: '実習生', text: '受付と急ぎ度の整理が先ですね。' },
          { speaker: 'Ns.', text: 'そうです。教科書で一日の流れを確認してから、また声をかけてください。' },
          { speaker: 'Ns.', text: 'ルーチンの妨害はしない範囲でお願いします。' },
        ],
      },
      {
        type: 'problem',
        id: 'bio-basics-u1-problem',
        xp: 5,
      },
      {
        type: 'lecture',
        id: 'bio-basics-u1-lec',
        xp: 10,
        body: '生化学検査は、血液や尿に含まれる成分を測定し、臓器の働きや代謝の状態を評価します。\n\n午前は受付・適正・分析装置への投入が中心です。緊急度の高い依頼は優先度を上げて処理します。',
        bridge: '次に教科書で基本流れを確認し、キーワードを入力してください。',
      },
      {
        type: 'investigate',
        id: 'bio-basics-u1-inv',
        mode: 'textbook',
        required: true,
        purpose: '朝の溜まりに対し、受付から投入までの基本順を言語化するため',
        howTo: '教科書・配布資料で、午前の業務に含まれる工程を確認する。',
        choices: [
          { label: '受付', correct: true },
          { label: '適正確認', correct: true },
          { label: '分析装置への投入', correct: true },
          { label: '患者への診断結果の説明', correct: false },
          { label: '会計精算の対応', correct: false },
        ],
        clueId: 'clue-priority-flow',
        demoHint: 'モック正解例: 受付・適正確認・分析装置への投入',
        xp: 15,
      },
      {
        type: 'investigate',
        id: 'bio-basics-u1-obs',
        mode: 'observe',
        required: false,
        purpose: '（任意）受付周辺の動線を短時間視察する',
        howTo: '受付・適正周辺を目安5分視察。触らない、声をかけない。',
        choices: [
          { label: '視察した', correct: true },
          { label: 'まだ視察していない', correct: false },
        ],
        clueId: 'clue-priority-flow',
        manners: 'ルーチン妨害禁止・不要な声かけ禁止・目安5分以内',
        demoHint: 'モック: 視察したを選ぶ',
        xp: 5,
      },
      {
        // 2026-08、1幕1問化: 以前はsteps配列で2問を内包する1幕だった。
        // 手がかりロックは連続するresolveの最初の幕(この幕)にだけ付ける。
        type: 'resolve',
        id: 'bio-basics-u1-res-1',
        requiredClueIds: ['clue-priority-flow'],
        xp: 13,
        prompt: 'Ns. 「まず何から手を付けますか？」',
        choices: [
          { label: '受付と急ぎ度の整理から入る', correct: true, feedback: '流れの入口を整えるのが先です。' },
          { label: 'まず分析装置の細かい設定から', correct: false, feedback: '今の溜まりに対しては受付側が先行です。' },
          { label: '全部後回しにして見学だけする', correct: false, feedback: '今の依頼には応えが必要です。' },
        ],
      },
      {
        type: 'resolve',
        id: 'bio-basics-u1-res-2',
        requiredClueIds: [],
        xp: 12,
        prompt: 'Ns. 「急ぎ依頼があったら？」',
        choices: [
          { label: '流れの中で優先度を上げて処理する', correct: true, feedback: '優先を言語化できると現場で動けます。' },
          { label: '通常依頼と同じ順で処理する', correct: false, feedback: '緊急度に応じて優先を変えます。' },
        ],
      },
      {
        type: 'drill',
        id: 'bio-basics-u1-drill',
        xp: 20,
        questions: [
          {
            id: 'bio-basics-u1-q1',
            format: 'mcq',
            prompt: '生化学検査で主に評価するのはどれか。',
            choices: ['臓器の働きや代謝の状態', '骨の形態', '皮膚の色調のみ', '視力'],
            correctIndex: 0,
            explanation: '成分測定を通じて臓器機能・代謝を評価します。',
          },
          {
            id: 'bio-basics-u1-q2',
            format: 'mcq',
            prompt: '午前の生化学検査で中心になりやすい作業は？',
            choices: ['受付・適正・投入', '日次報告のみ', '部屋の塗装', '食事当番'],
            correctIndex: 0,
            explanation: '午前は受付から分析投入までが中心です。',
          },
          {
            id: 'bio-basics-u1-q3',
            format: 'mcq',
            prompt: 'パニック値を見たらまず行うべきは？',
            choices: ['施設手順に沿って速やかに連絡', 'SNSに投稿', '翌日まで待つ', '自分で診断する'],
            correctIndex: 0,
            explanation: '生命リスクに関わりうるため、手順どおりの連絡が最優先です。',
          },
        ],
      },
    ],
  },
  {
    id: 'bio-basics-u2',
    title: '基準値と報告',
    requestLine: 'パニック値出現時の初動を決める',
    beats: [
      {
        type: 'dialogue',
        id: 'bio-basics-u2-d0',
        xp: 5,
        lines: [
          { speaker: 'Dr.', text: 'パニック値が出たと連絡があった。まず何を確認する？' },
          { speaker: '実習生', text: '施設の連絡手順を確認します。' },
          { speaker: 'Dr.', text: '定義を教科書で確認してから、判断を言語化してほしい。' },
        ],
      },
      {
        type: 'problem',
        id: 'bio-basics-u2-problem',
        xp: 5,
      },
      {
        type: 'lecture',
        id: 'bio-basics-u2-lec',
        xp: 10,
        body: '基準値は健常者分布の目安で、診断の絶対基準ではありません。パニック値は生命に関わる可能性があり、速やかな連絡が求められます。',
        bridge: '教科書でパニック値の定義を確認してください。',
      },
      {
        type: 'investigate',
        id: 'bio-basics-u2-inv',
        mode: 'textbook',
        required: true,
        purpose: 'パニック値対応の核になる用語を確認する',
        howTo: '教科書でパニック値（クリティカル値）の項を読む',
        choices: [
          { label: 'パニック値', correct: true },
          { label: '基準値', correct: false },
          { label: '標準偏差', correct: false },
          { label: '相関係数', correct: false },
        ],
        clueId: 'clue-panic-def',
        demoHint: 'モック正解: パニック値',
        xp: 15,
      },
      {
        // こちらは元々1問だけだったので、形を変えるだけで済む。
        type: 'resolve',
        id: 'bio-basics-u2-res-1',
        requiredClueIds: ['clue-panic-def'],
        xp: 25,
        prompt: 'Dr. 「パニック値出現。最初の動作は？」',
        choices: [
          { label: '施設手順に沿って速やかに連絡する', correct: true, feedback: '正解です。診断を自分で下さない。' },
          { label: '自分で診断名を伝える', correct: false, feedback: '診断行為は行わず、決められたルートで伝えます。' },
        ],
      },
      {
        type: 'drill',
        id: 'bio-basics-u2-drill',
        xp: 15,
        questions: [
          {
            id: 'bio-basics-u2-q1',
            format: 'mcq',
            prompt: '基準値の正しい理解は？',
            choices: ['健常分布の目安で絶対基準ではない', '常に診断を確定する', '装置のエラーコード', '受付番号'],
            correctIndex: 0,
            explanation: '基準値は目安であり診断の絶対基準ではありません。',
          },
        ],
      },
    ],
  },
]

