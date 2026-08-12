import type { CbtQuestion, Stage, StaffUser, Student } from './types'
import { BIO_BASICS_CLUES, BIO_BASICS_UNITS } from './bioBasicsUnits'
import { isUnitCleared, validateStagesUnits } from './learning'

const _unitErrors = validateStagesUnits([{ id: 'bio-basics', units: BIO_BASICS_UNITS }])
if (_unitErrors.length && typeof console !== 'undefined') {
  console.warn('[lab-quest] unit validation', _unitErrors)
}

/** RCPC（発展）シリーズのstage id。専用の背景(quest-rcpc-bg.png)の出し分けに使う。 */
export const RCPC_STAGE_ID = 'bio-rcpc'

export const AREAS = [
  { id: 'biochem' as const, name: '生化学', blurb: '検体・測定・精度の基礎エリア' },
  { id: 'immuno' as const, name: '免疫', blurb: 'ホルモン・感染・薬物のエリア' },
]

export const STAGES: Stage[] = [
  {
    id: 'bio-basics',
    areaId: 'biochem',
    title: '基礎知識',
    required: true,
    hasProcedure: false,
    units: BIO_BASICS_UNITS,
    clues: BIO_BASICS_CLUES,
    chapters: [
      {
        id: 'bio-basics-c1',
        title: '検査室の一日',
        lecture:
          '生化学検査は、血液や尿に含まれる成分を測定し、臓器の働きや代謝の状態を評価します。午前は受付・遠心・分析装置への投入、午後は精度管理と異常値対応が中心になります。\n\n実習では「なぜその順番か」を意識すると、現場の動きが理解しやすくなります。',
        quiz: {
          id: 'bio-basics-c1-q',
          prompt: '生化学検査で主に評価するのはどれか。',
          choices: ['骨の形態', '臓器の働きや代謝の状態', '皮膚の色調のみ', '視力'],
          correctIndex: 1,
          explanation: '成分測定を通じて臓器機能・代謝を評価します。',
        },
        xp: 20,
      },
      {
        id: 'bio-basics-c2',
        title: '検体の流れ',
        lecture:
          '採血 → 受付 → 遠心 → 分析 → 結果確認、が基本の流れです。溶血・乳び・黄疸などの検体性状は、測定値を大きく変えることがあります。\n\n異常な性状を見つけたら、黙って流さず指導者に相談する習慣が大切です。',
        quiz: {
          id: 'bio-basics-c2-q',
          prompt: '溶血した検体で起きやすいことは？',
          choices: ['カリウムなどが偽高値になりうる', '常に問題なし', '血糖だけが下がる', '受付番号が消える'],
          correctIndex: 0,
          explanation: '溶血はKやLDなどに影響しやすく、再採血判断の材料になります。',
        },
        xp: 20,
      },
      {
        id: 'bio-basics-c3',
        title: '基準値とパニック値',
        lecture:
          '基準値は「健常者の分布」を示す目安で、診断の絶対基準ではありません。パニック値は生命に関わる可能性があり、速やかな連絡が求められます。\n\n施設ごとの連絡手順を、初日に確認しておきましょう。',
        quiz: {
          id: 'bio-basics-c3-q',
          prompt: 'パニック値を見たらまず行うべきは？',
          choices: ['SNSに投稿', '施設手順に沿って速やかに連絡', '翌日まで待つ', '自分で診断する'],
          correctIndex: 1,
          explanation: 'パニック値は生命リスクに関わりうるため、手順どおりの連絡が最優先です。',
        },
        xp: 25,
      },
    ],
    caseSteps: [
      {
        id: 'bio-basics-case-1',
        prompt: 'AST・ALTが高値。次に確認したい追加情報は？',
        choices: [
          { label: '検体性状と既往・薬剤情報', correct: true, feedback: '良い着眼です。性状異常と臨床背景の両方を見ます。' },
          { label: 'とりあえず再測定だけ繰り返す', correct: false, feedback: '再測も有用ですが、まず性状と背景を確認します。' },
          { label: '結果を破棄して報告しない', correct: false, feedback: '破棄の判断は指導者と手順に従います。' },
        ],
      },
      {
        id: 'bio-basics-case-2',
        prompt: '指導者不在でパニック値が出た。どうする？',
        choices: [
          { label: '施設の連絡手順に従い報告ルートを使う', correct: true, feedback: '代理指導アプリでも、緊急連絡は現場手順が優先です。' },
          { label: '自分の判断で主治医に直接診断を伝える', correct: false, feedback: '診断行為は行わず、決められたルートで伝えます。' },
        ],
      },
    ],
  },
  {
    id: 'bio-hemolysis',
    areaId: 'biochem',
    title: '溶血',
    required: true,
    hasProcedure: true,
    procedureImageNote: '（モック）溶血の程度見本写真がここに入ります',
    chapters: [
      {
        id: 'bio-hemolysis-c1',
        title: '溶血とは',
        lecture:
          '溶血は赤血球が壊れ、ヘモグロビンが血清／血漿に漏れた状態です。採血手技、強振とう、遅延処理などが原因になります。\n\n見た目（薄いピンク〜濃い赤）と測定への影響をセットで覚えましょう。',
        quiz: {
          id: 'bio-hemolysis-c1-q',
          prompt: '溶血の主な原因として適切なのは？',
          choices: ['強振とうや採血手技の問題', '部屋の温度表示ミスのみ', 'プリンタ故障', 'バーコードの色'],
          correctIndex: 0,
          explanation: '物理的な赤血球破壊が典型原因です。',
        },
        xp: 20,
      },
      {
        id: 'bio-hemolysis-c2',
        title: '影響する項目',
        lecture:
          'K、LD、AST、Feなどが上がりやすく、偽の異常値として解釈を誤ることがあります。施設の溶血インデックスと運用を確認してください。',
        quiz: {
          id: 'bio-hemolysis-c2-q',
          prompt: '溶血で偽高値になりやすいのは？',
          choices: ['カリウム（K）', 'Naのみ必ず低下', '血糖のみ必ず上昇', '影響する項目はない'],
          correctIndex: 0,
          explanation: 'Kは溶血の影響を受けやすい代表項目です。',
        },
        xp: 25,
      },
    ],
    caseSteps: [
      {
        id: 'bio-hemolysis-case-1',
        prompt: '明らかな溶血検体でKが高値。次の行動は？',
        choices: [
          { label: '溶血の影響を疑い、手順に沿って再採血等を検討', correct: true, feedback: '臨床判断材料として性状とセットで扱います。' },
          { label: 'そのままパニック連絡だけして終わり', correct: false, feedback: '連絡と並行し、溶血の可能性も伝えます。' },
        ],
      },
    ],
    procedureSteps: [
      { id: 'h1', label: '検体の外観を観察する', correctOrder: 1 },
      { id: 'h2', label: '溶血の程度を記録する', correctOrder: 2 },
      { id: 'h3', label: '影響項目を確認する', correctOrder: 3 },
      { id: 'h4', label: '指導者／手順に沿って対応を決める', correctOrder: 4 },
    ],
  },
  {
    id: 'bio-tubes',
    areaId: 'biochem',
    title: '採血管種類',
    required: true,
    hasProcedure: true,
    procedureImageNote: '（モック）採血管キャップ色の見本がここに入ります',
    chapters: [
      {
        id: 'bio-tubes-c1',
        title: 'キャップ色と用途',
        lecture:
          '採血管は添加剤と用途で色分けされています。生化学では血清分離剤入りがよく使われます。間違った管は再採血につながります。',
        quiz: {
          id: 'bio-tubes-c1-q',
          prompt: '採血管を選ぶとき重要なのは？',
          choices: ['添加剤と検査目的の対応', '一番きれいな色', '在庫が一番多い管', '好きなメーカー'],
          correctIndex: 0,
          explanation: '検査目的に合った添加剤の管を選びます。',
        },
        xp: 20,
      },
    ],
    caseSteps: [
      {
        id: 'bio-tubes-case-1',
        prompt: '凝固系用の管で生化学を依頼された。どうする？',
        choices: [
          { label: '管の適応を確認し、必要なら正しい管で再採血を検討', correct: true, feedback: '目的と管の不一致は測定不能や誤解釈の原因です。' },
          { label: 'とりあえず測れるだけ測る', correct: false, feedback: '不適切な管での測定は避けます。' },
        ],
      },
    ],
    procedureSteps: [
      { id: 't1', label: '依頼内容を確認する', correctOrder: 1 },
      { id: 't2', label: '適切な採血管を選ぶ', correctOrder: 2 },
      { id: 't3', label: 'ラベルと検体を照合する', correctOrder: 3 },
      { id: 't4', label: '転倒混和など指定手技を行う', correctOrder: 4 },
    ],
  },
  {
    id: 'bio-qc',
    areaId: 'biochem',
    title: '精度管理',
    required: true,
    hasProcedure: false,
    chapters: [
      {
        id: 'bio-qc-c1',
        title: '内部精度管理の目的',
        lecture:
          '精度管理は、装置と試薬が安定して測れているかを日常的に監視する活動です。管理試料の結果が管理限界を外れたら、患者検体の報告前に原因を調べます。',
        quiz: {
          id: 'bio-qc-c1-q',
          prompt: 'QCが管理限界外のとき、まず優先すべきは？',
          choices: ['原因調査と報告可否の判断', '無視して患者結果を出す', '装置を叩く', '試薬を全部廃棄する'],
          correctIndex: 0,
          explanation: '患者結果の信頼性を守るため、先にQC対応を行います。',
        },
        xp: 25,
      },
    ],
    caseSteps: [
      {
        id: 'bio-qc-case-1',
        prompt: '朝のQCが連続で上限超え。次は？',
        choices: [
          { label: 'キャリブレーションや試薬・装置の確認手順へ', correct: true, feedback: '系統的な外れは装置・試薬側を疑います。' },
          { label: '患者検体を先に全部測定する', correct: false, feedback: 'QC不良のまま測定を進めるのは避けます。' },
        ],
      },
    ],
  },
  {
    id: 'bio-rcpc',
    areaId: 'biochem',
    title: 'RCPC（発展）',
    required: false,
    hasProcedure: false,
    chapters: [
      {
        id: 'bio-rcpc-c1',
        title: '臨床検査技師の臨床的関わり',
        lecture:
          'RCPCは、検査結果を臨床側と共有・討議し、より良い検査活用につなげる取り組みです。実習では「結果の意味を言葉にする」練習として触れます。',
        quiz: {
          id: 'bio-rcpc-c1-q',
          prompt: 'RCPCの趣旨に近いのは？',
          choices: ['結果の臨床的な意味を共有し検査活用を高める', '装置の掃除だけ', '受付番号の付け替え', '食事当番'],
          correctIndex: 0,
          explanation: '検査と臨床の橋渡しがポイントです。',
        },
        xp: 30,
      },
    ],
    caseSteps: [
      {
        id: 'bio-rcpc-case-1',
        prompt: '急激な肝酵素上昇の相談を受けた。技師として有用な情報は？',
        choices: [
          { label: '経時変化・検体性状・関連項目のセット', correct: true, feedback: '単点の数値より文脈が役立ちます。' },
          { label: '確定診断名を断言する', correct: false, feedback: '診断の断定は医師の役割です。' },
        ],
      },
    ],
  },
  {
    id: 'imm-hormone',
    areaId: 'immuno',
    title: 'ホルモン',
    required: true,
    hasProcedure: false,
    chapters: [
      {
        id: 'imm-hormone-c1',
        title: '免疫測定の基本',
        lecture:
          'ホルモン検査の多くは抗原抗体反応を利用します。交差反応やビオチン干渉など、免疫特有のピットフォールがあります。',
        quiz: {
          id: 'imm-hormone-c1-q',
          prompt: 'ホルモン測定でよく使う原理は？',
          choices: ['抗原抗体反応', 'グラム染色', 'PCRのみ', '尿試験紙のみ'],
          correctIndex: 0,
          explanation: '免疫学的測定が中心です。',
        },
        xp: 20,
      },
    ],
    caseSteps: [
      {
        id: 'imm-hormone-case-1',
        prompt: '臨床症状と合わない甲状腺ホルモン値。疑うことは？',
        choices: [
          { label: '干渉物質や検体取り違えの可能性', correct: true, feedback: '不一致時は測定系の限界も視野に入れます。' },
          { label: '必ず装置故障と決めつける', correct: false, feedback: '決めつけず、鑑別の一つとして扱います。' },
        ],
      },
    ],
  },
  {
    id: 'imm-infection',
    areaId: 'immuno',
    title: '感染症',
    required: true,
    hasProcedure: false,
    chapters: [
      {
        id: 'imm-infection-c1',
        title: '感染症検査の読み方',
        lecture:
          '抗原・抗体・核酸検査は「何を検出しているか」が異なります。ウィンドウ期やワクチン後の抗体にも注意します。',
        quiz: {
          id: 'imm-infection-c1-q',
          prompt: 'ウィンドウ期に起きやすいのは？',
          choices: ['感染初期に検査が陰性になりうること', '必ず陽性になること', '採血管が溶けること', '基準値が消えること'],
          correctIndex: 0,
          explanation: '感染初期は検出限界以下になり得ます。',
        },
        xp: 20,
      },
    ],
    caseSteps: [
      {
        id: 'imm-infection-case-1',
        prompt: '抗体陰性でも感染を否定しきれない理由は？',
        choices: [
          { label: 'ウィンドウ期などの可能性があるため', correct: true, feedback: '時期と検査原理をセットで考えます。' },
          { label: '抗体検査は常に100%正確なため', correct: false, feedback: 'どの検査にも限界があります。' },
        ],
      },
    ],
  },
  {
    id: 'imm-drug',
    areaId: 'immuno',
    title: '薬物',
    required: true,
    hasProcedure: true,
    procedureImageNote: '（モック）TDM検体取扱いのポイント画像',
    chapters: [
      {
        id: 'imm-drug-c1',
        title: 'TDMの基本',
        lecture:
          '治療薬物モニタリング（TDM）は、有効・安全な血中濃度を保つための測定です。採血タイミング（トラフ等）が結果解釈を左右します。',
        quiz: {
          id: 'imm-drug-c1-q',
          prompt: 'TDMで特に重要なのは？',
          choices: ['採血タイミング', 'プリンタの解像度', '昼休みの長さ', '部屋の壁色'],
          correctIndex: 0,
          explanation: 'トラフ／ピークなど、タイミングが解釈の前提です。',
        },
        xp: 25,
      },
    ],
    caseSteps: [
      {
        id: 'imm-drug-case-1',
        prompt: '投与直後に採血されたTDM。解釈は？',
        choices: [
          { label: 'タイミング不適切の可能性を伝え再採血を検討', correct: true, feedback: '数値だけでは判断できません。' },
          { label: '高いので中止と自分で指示する', correct: false, feedback: '治療方針の指示は医師の役割です。' },
        ],
      },
    ],
    procedureSteps: [
      { id: 'd1', label: '薬剤名と採血指定時刻を確認', correctOrder: 1 },
      { id: 'd2', label: '実際の採血時刻を記録', correctOrder: 2 },
      { id: 'd3', label: '指定の管で受け入れ', correctOrder: 3 },
      { id: 'd4', label: '測定・報告時にタイミング情報を付記', correctOrder: 4 },
    ],
  },
  {
    id: 'imm-methods',
    areaId: 'immuno',
    title: '測定方法',
    required: true,
    hasProcedure: false,
    chapters: [
      {
        id: 'imm-methods-c1',
        title: '測定法の違い',
        lecture:
          'ELISA、CLEIA、ラテックス凝集など、感度・特異度・自動化の度合いが異なります。施設の採用法と注意点を押さえるのが実習のゴールです。',
        quiz: {
          id: 'imm-methods-c1-q',
          prompt: '測定法を学ぶ意義は？',
          choices: ['結果の限界と干渉を理解するため', '暗記コンテストのため', '掃除用具の名前を増やすため', '特に意味はない'],
          correctIndex: 0,
          explanation: '方法の特性が結果解釈に直結します。',
        },
        xp: 20,
      },
    ],
    caseSteps: [
      {
        id: 'imm-methods-case-1',
        prompt: '他院結果と数値差があるとき最初に確認するのは？',
        choices: [
          { label: '測定法・試薬・単位の違い', correct: true, feedback: '方法差はよくある原因です。' },
          { label: '相手の結果を必ず誤りとする', correct: false, feedback: '先に条件差を確認します。' },
        ],
      },
    ],
  },
]

export function emptyProgress(): Student['progress'] {
  return {
    clearedChapterIds: [],
    clearedCaseStageIds: [],
    clearedProcedureStageIds: [],
    clearedStageIds: [],
    clearedBeatIds: [],
    ownedClueIds: [],
    unitCursors: {},
    xp: 0,
    stamps: 0,
    cbtSubmitted: false,
    cbtAnswers: {},
    cbtScore: null,
    cbtRetakeAllowed: false,
    cbtDrawnIds: [],
    cbtScopeStageIds: [],
  }
}

function q(
  id: string,
  sourceStageId: string,
  prompt: string,
  choices: string[],
  correctIndex: number,
  explanation: string,
): CbtQuestion {
  return { id, sourceStageId, prompt, choices, correctIndex, explanation }
}

/** シリーズ紐づけ問題プール（クリア済みシリーズからCBTを構成） */
export const CBT_QUESTIONS: CbtQuestion[] = [
  q('cbt-bb1', 'bio-basics', '生化学検査が主に評価する対象はどれか。', ['臓器の働きや代謝', '視力', '骨密度のみ', '皮膚色のみ'], 0, '成分測定を通じ臓器・代謝を評価します。'),
  q('cbt-bb2', 'bio-basics', '検体性状の異常でまず行うべきは？', ['指導者／手順に沿って確認・相談', '黙って報告', '破棄して帰宅', 'SNS相談'], 0, '性状異常は測定解釈に直結します。'),
  q('cbt-bb3', 'bio-basics', 'パニック値の扱いで適切なのは？', ['施設手順に沿って速やかに連絡', '翌日まとめて連絡', '本人判断で診断', '無視'], 0, '生命リスクに関わりうるため手順どおり連絡します。'),
  q('cbt-bb4', 'bio-basics', '基準値の正しい理解は？', ['健常分布の目安で絶対基準ではない', '常に診断を確定する', '装置のエラーコード', '受付番号'], 0, '基準値は目安であり診断の絶対基準ではありません。'),
  q('cbt-he1', 'bio-hemolysis', '溶血で偽高値になりやすい項目は？', ['カリウム（K）', '影響なし', '体温', '身長'], 0, '溶血はKなどに影響しやすいです。'),
  q('cbt-he2', 'bio-hemolysis', '溶血の主な原因として適切なのは？', ['強振とうや採血手技', 'プリンタ故障', '壁色', '曜日'], 0, '物理的な赤血球破壊が典型です。'),
  q('cbt-he3', 'bio-hemolysis', '明らかな溶血検体でK高値のとき', ['溶血影響を疑い再採血等を検討', '必ず真の高Kと断定', '放置', '診断名を付ける'], 0, '性状とセットで解釈します。'),
  q('cbt-he4', 'bio-hemolysis', '溶血対応の最初の観察は？', ['検体の外観', '食事内容', '天気', '椅子の高さ'], 0, '外観観察が実務の入口です。'),
  q('cbt-tu1', 'bio-tubes', '採血管選択で最も重要なのは？', ['添加剤と検査目的', 'キャップの好み', '在庫数だけ', '箱のデザイン'], 0, '目的に合った管を選びます。'),
  q('cbt-tu2', 'bio-tubes', '管を間違えたときのリスクは？', ['再採血や誤解釈', '必ず正確になる', '特にない', '印刷がきれいになる'], 0, '不適切管は測定不能・誤解釈の原因です。'),
  q('cbt-tu3', 'bio-tubes', '受入れ前に確認すべきは？', ['依頼内容と管の対応', '壁のポスター', '昼休み', '気温だけ'], 0, '依頼と管の一致を確認します。'),
  q('cbt-tu4', 'bio-tubes', 'ラベル照合の目的は？', ['検体取り違え防止', '装飾', '在庫管理だけ', '休憩時間の記録'], 0, '患者・検体の同一性確保です。'),
  q('cbt-qc1', 'bio-qc', 'QCが管理限界外のときの優先対応は？', ['原因調査と報告判断', '無視', '患者測定を加速', '休憩'], 0, '患者結果の前にQC対応が必要です。'),
  q('cbt-qc2', 'bio-qc', '内部精度管理の目的は？', ['装置・試薬の安定監視', '掃除当番', '食事管理', '受付番号付与'], 0, '日常の測定信頼性を守ります。'),
  q('cbt-qc3', 'bio-qc', '朝QCが連続上限超えのとき', ['装置・試薬側の確認手順へ', '患者を先に全部測る', '値を書き換え', '放置'], 0, '系統的外れは装置・試薬を疑います。'),
  q('cbt-qc4', 'bio-qc', 'QC不良のまま患者報告すると', ['誤った結果を出すリスク', '必ず正確', '問題にならない', '装置が直る'], 0, '信頼性のない結果を出せません。'),
  q('cbt-ho1', 'imm-hormone', 'ホルモン測定でよく用いる原理は？', ['抗原抗体反応', '聴診', '視力検査', '握力'], 0, '免疫学的測定が中心です。'),
  q('cbt-ho2', 'imm-hormone', '症状と合わない甲状腺値で疑うのは？', ['干渉や取り違えの可能性', '必ず装置全壊', '天気の影響だけ', '休憩不足'], 0, '不一致時は測定系の限界も視野に。'),
  q('cbt-ho3', 'imm-hormone', '免疫測定のピットフォール例は？', ['交差反応やビオチン干渉', '重力定数', '音量', 'フォント'], 0, '免疫特有の干渉に注意します。'),
  q('cbt-ho4', 'imm-hormone', '結果解釈で重要なのは？', ['臨床背景との照合', '数値の絶対信仰', '壁色', '曜日'], 0, '数値単独では判断しきれません。'),
  q('cbt-in1', 'imm-infection', '感染初期に陰性になりうる概念は？', ['ウィンドウ期', '永久陽性期', '休診期', '校正期限'], 0, 'ウィンドウ期では検出できないことがあります。'),
  q('cbt-in2', 'imm-infection', '抗原・抗体・核酸で違うのは？', ['何を検出しているか', '部屋の広さ', '椅子の数', '昼のメニュー'], 0, '検出対象の違いが解釈の鍵です。'),
  q('cbt-in3', 'imm-infection', '抗体陰性でも感染を否定しきれない理由', ['ウィンドウ期などの可能性', '検査は常に100%', '特に理由なし', '印刷ミスだけ'], 0, '時期と原理をセットで考えます。'),
  q('cbt-in4', 'imm-infection', 'ワクチン後の抗体で注意するのは？', ['感染免疫との区別', '必ず無効', '無視してよい', '気温'], 0, 'ワクチン由来抗体との区別が必要です。'),
  q('cbt-dr1', 'imm-drug', 'TDMで特に重要な情報は？', ['採血タイミング', '壁の色', '椅子の高さ', '昼のメニュー'], 0, 'トラフ等のタイミングが解釈の前提です。'),
  q('cbt-dr2', 'imm-drug', '投与直後採血のTDMは？', ['タイミング不適切の可能性', '常に正しい', '必ず低値', '装置不要'], 0, '数値だけでは判断できません。'),
  q('cbt-dr3', 'imm-drug', 'TDMの目的に近いのは？', ['有効・安全な血中濃度の維持', '装飾', '受付番号付与', '掃除'], 0, '治療域のモニタリングです。'),
  q('cbt-dr4', 'imm-drug', '報告時に付記するとよいのは？', ['実際の採血時刻', '好きな色', '天気', '座席番号'], 0, '解釈に時刻情報が必要です。'),
  q('cbt-me1', 'imm-methods', '他院と数値差があるとき最初に見るのは？', ['測定法・試薬・単位', '相手の人格', '天気', '曜日'], 0, '方法差を先に確認します。'),
  q('cbt-me2', 'imm-methods', '測定法を学ぶ意義は？', ['結果の限界と干渉の理解', '暗記コンテスト', '掃除用具名', '特になし'], 0, '方法特性が解釈に直結します。'),
  q('cbt-me3', 'imm-methods', 'ELISAやCLEIAで異なるのは？', ['感度・特異度・自動化の度合い', '重力', '音階', '気温だけ'], 0, '方法ごとに特性が違います。'),
  q('cbt-me4', 'imm-methods', '施設で押さえるべきは？', ['採用法と注意点', '壁紙', '昼食メニュー', '椅子色'], 0, '自施設の方法理解が実習ゴールです。'),
  q('cbt-rc1', 'bio-rcpc', 'RCPCの趣旨に近いのは？', ['結果の臨床的意味を共有し検査活用を高める', '掃除だけ', '受付番号付け替え', '食事当番'], 0, '検査と臨床の橋渡しがポイントです。'),
  q('cbt-rc2', 'bio-rcpc', '急な肝酵素上昇の相談で有用なのは？', ['経時変化・性状・関連項目', '確定診断の断言', '無視', '天気'], 0, '文脈情報が役立ちます。'),
]

/** モックの「今日」初期値（山田の2日目想定） */
export const MOCK_TODAY_DEFAULT = '2026-08-11'

export const INITIAL_STUDENTS: Student[] = [
  {
    id: 'stu-1',
    name: '山田 花',
    code: 'TRAIN01',
    password: '1234',
    visitDates: [
      '2026-08-10',
      '2026-08-11',
      '2026-08-12',
      '2026-08-13',
      '2026-08-14',
      '2026-08-17',
    ],
    dayPlans: [
      { date: '2026-08-10', seriesIds: ['bio-basics'], note: '' },
      { date: '2026-08-11', seriesIds: ['bio-tubes', 'bio-hemolysis'], note: '1日2シリーズ' },
      { date: '2026-08-12', seriesIds: [], note: '午前見学（アプリなし）' },
      { date: '2026-08-13', seriesIds: ['bio-qc', 'imm-hormone'], note: '' },
      { date: '2026-08-14', seriesIds: ['imm-infection', 'imm-drug'], note: '' },
      { date: '2026-08-17', seriesIds: ['imm-methods'], note: '午後CBT想定' },
    ],
    progress: {
      ...emptyProgress(),
      xp: 0,
      stamps: 0,
    },
    consentAt: null,
  },
  {
    id: 'stu-2',
    name: '佐藤 健',
    code: 'TRAIN02',
    password: '5678',
    visitDates: [
      '2026-08-10',
      '2026-08-11',
      '2026-08-12',
      '2026-08-13',
      '2026-08-14',
    ],
    dayPlans: [
      { date: '2026-08-10', seriesIds: ['bio-basics', 'bio-tubes'], note: '' },
      { date: '2026-08-11', seriesIds: ['bio-hemolysis'], note: '' },
      { date: '2026-08-12', seriesIds: ['bio-qc'], note: '' },
      { date: '2026-08-13', seriesIds: ['imm-hormone', 'imm-infection'], note: '' },
      { date: '2026-08-14', seriesIds: ['imm-drug', 'imm-methods'], note: '最終日CBT' },
    ],
    progress: {
      ...emptyProgress(),
      clearedBeatIds: [
        'bio-basics-u1-d0',
        'bio-basics-u1-lec',
        'bio-basics-u1-inv',
        'bio-basics-u1-res',
        'bio-basics-u1-drill',
        'bio-basics-u2-d0',
        'bio-basics-u2-lec',
        'bio-basics-u2-inv',
        'bio-basics-u2-res',
        'bio-basics-u2-drill',
      ],
      ownedClueIds: ['clue-priority-flow', 'clue-panic-def'],
      clearedStageIds: ['bio-basics'],
      xp: 85,
      stamps: 4,
    },
    consentAt: null,
  },
]

export const STAFF_USERS: StaffUser[] = [
  { id: 'staff-full', name: '指導 太郎（フル）', role: 'full', password: 'full' },
  { id: 'staff-ops', name: '運用 花子（運用）', role: 'ops', password: 'ops' },
]

/**
 * stages は呼び出し側から渡す(Phase 1でSupabase由来にも切り替わるため、
 * このファイルの静的 STAGES に固定しない)。
 * 従来の静的モックが欲しい場合は `getStage(STAGES, id)` と書く。
 */
export function getStage(stages: Stage[], id: string) {
  return stages.find((s) => s.id === id)
}

export function isStageCleared(stage: Stage, progress: Student['progress']) {
  const procDone = !stage.hasProcedure || progress.clearedProcedureStageIds.includes(stage.id)
  if (stage.units && stage.units.length > 0) {
    const unitsDone = stage.units.every((u) => isUnitCleared(u, progress))
    return unitsDone && procDone
  }
  const chaptersDone = stage.chapters.every((c) => progress.clearedChapterIds.includes(c.id))
  const caseDone = progress.clearedCaseStageIds.includes(stage.id)
  return chaptersDone && caseDone && procDone
}
