// シリーズ「糖代謝関連検査」(大項目11)
// 骨子案付録B優先度7位のシナリオ(「血糖は高いのにHbA1cが低い。この患者に何が起きているか」)を
// u2の判断・報告幕に反映している。
//
// 大項目11は中項目A(血糖)/B(HbA1c)/C(その他の血糖コントロール指標)/D(糖尿病の診断と療養)の
// 4本立て。u1=A、u2=B、u3=C、u4=Dで全カバーする。
// A-c(解糖とNaF採血管)は既存シリーズ2(q02-tubes-anticoagulant/bio-tubes-u3)で詳しくカバー
// 済みのため、ここでは測定原理の文脈から簡潔に触れるにとどめる。
// A-e(パニック値対応)は既存シリーズ22(q22-panic-value/Critical Value)で詳しくカバー済み。
//
//   node scripts/push-series.mjs content/series/q11-glucose.mjs --dry-run
//   STAFF_FULL_PASSWORD=xxxx node scripts/push-series.mjs content/series/q11-glucose.mjs
//   STAFF_FULL_PASSWORD=xxxx node scripts/push-series.mjs content/series/q11-glucose.mjs --publish

export default {
  stageId: 'q11-glucose',

  clues: [
    {
      key: 'glucose-measurement-principles',
      name: '血糖測定の原理(ヘキソキナーゼ-G6PDH法・GOD法・GDH法)',
      summary:
        'ヘキソキナーゼ-G6PDH法はグルコースをG6Pに変換後G6PDHでNADPHを生成し340nmで測定する、特異性が高く基準測定法として用いられる。GOD(グルコースオキシダーゼ)法・GDH(グルコースデヒドロゲナーゼ)法は簡易・迅速な酵素法で、日常検査や自己測定機器に広く使われる。',
    },
    {
      key: 'glycolysis-and-specimen-differences',
      name: '解糖による低下・NaF採血管と全血・血漿・血清での値の差',
      summary:
        '採血後、赤血球が解糖を続けるため放置検体は血糖値が低下する(解糖阻止剤NaFで防止)。また全血血糖は血漿・血清血糖よりおおむね10〜15%程度低く出る(赤血球内の水分含量が少ないため)。',
    },
    {
      key: 'glucose-panic-value-response',
      name: '低血糖・著明高血糖のパニック値対応',
      summary:
        '著しい低血糖・高血糖は意識障害など生命に関わるため、パニック値として速やかな報告が求められる(具体的な閾値・報告手順は◆施設差)。',
    },
    {
      key: 'hba1c-formation-and-window',
      name: '糖化ヘモグロビンの生成機序と反映期間',
      summary:
        'HbA1cは血中グルコースがヘモグロビンβ鎖N末端に非酵素的に結合(糖化)して生じる。赤血球の寿命(約120日)を反映し、直近1〜2か月の平均血糖を反映する(直近1か月の血糖の影響が比較的大きい)。このため血糖が最近急に悪化したばかりの場合、HbA1cはまだ追いついておらず低めに出ることがある(測定の誤りではない)。',
    },
    {
      key: 'hba1c-measurement-methods',
      name: 'HbA1c測定法(HPLC法・免疫法・酵素法)',
      summary:
        'HPLC(イオン交換)法は電荷の違いを利用して分離しクロマトグラムとして検出する高精度な方法。免疫法は糖化N末端に対する抗体を用いる方法、酵素法は糖化N末端アミノ酸を特異的に切断・酸化する酵素を用いる方法で、いずれも簡便な機器で測定できる。',
    },
    {
      key: 'hba1c-false-value-causes',
      name: '異常ヘモグロビン・貧血・腎不全によるHbA1c偽値',
      summary:
        '異常ヘモグロビン(HbS・HbF等)は測定法によりクロマトグラムの分離や検出に影響し偽高値・偽低値の原因になる。溶血性貧血・出血・輸血直後など赤血球寿命が短縮する病態では糖化する時間が足りず偽低値になりやすい。腎不全では尿毒症物質による赤血球寿命短縮や、エリスロポエチン(ESA)製剤治療に伴う網状赤血球増加(若い赤血球の増加)のため偽低値になりやすい一方、尿毒症物質(カルバミル化ヘモグロビン)が一部の測定法で偽高値の原因になることもあり、方向が一定しない。',
    },
    {
      key: 'other-glycemic-indicators',
      name: 'グリコアルブミンと1,5-アンヒドログルシトールの特徴',
      summary:
        'グリコアルブミン(GA)はアルブミンの糖化産物で、アルブミンの半減期(約2〜3週間)を反映し直近約2週間の平均血糖を示す。1,5-アンヒドログルシトール(1,5-AG)は高血糖時の糖尿(グルコース排泄)に伴い尿中に失われて低下するため、直近数日の血糖変動(特に食後高血糖)を鋭敏に反映する。',
    },
    {
      key: 'glycemic-indicator-selection',
      name: '血糖コントロール指標の使い分け(透析・妊娠・急激な変動時)',
      summary:
        '透析患者や貧血のある患者ではHbA1cが赤血球寿命の影響を受け不正確になりやすいためグリコアルブミンが有用。妊娠糖尿病では生理的な変化でHbA1cが低めに出やすくグリコアルブミンが補助的に用いられる。急激な血糖変動を把握したい場合は反映期間の短い1,5-AGやグリコアルブミンが適する。SGLT2阻害薬服用中は薬理作用による糖尿のため1,5-AGは血糖コントロールと無関係に低値となり指標として使えない。',
    },
    {
      key: 'diabetes-diagnostic-criteria',
      name: '糖尿病型の判定基準と75gOGTTの実施手順',
      summary:
        '糖尿病型の判定基準は血糖値(空腹時126mg/dL以上・随時200mg/dL以上・75gOGTT2時間値200mg/dL以上のいずれか)が必須で、HbA1c(NGSP)6.5%以上は補助的な基準。血糖値とHbA1cが同時に基準を満たせば1回の検査で糖尿病と診断できるが、HbA1c単独では糖尿病型と判定できない。75gOGTTはブドウ糖75gを経口負荷し、空腹時と経時的な採血(通常120分値を含む)で血糖の推移を確認する検査で、前日からの食事・絶食時間の指示や検査中の安静が必要。',
    },
    {
      key: 'insulin-secretion-and-autoantibody-markers',
      name: 'インスリン・Cペプチド・抗GAD抗体',
      summary:
        'Cペプチドはプロインスリンから切り出される副産物で、外因性インスリン投与の影響を受けずに内因性インスリン分泌能を評価できる。抗GAD抗体(抗グルタミン酸脱炭酸酵素抗体)は1型糖尿病(自己免疫性)を示唆する自己抗体マーカー。',
    },
  ],

  units: [
    // ══════════════════════════════════════════════════════════════
    // u1: 11-A(血糖)
    // ══════════════════════════════════════════════════════════════
    {
      unitId: 'q11-glucose-u1',
      title: '検査室の血糖値と病棟の血糖値、原理が違う?',
      requestLine: '中央検査室の血糖測定原理について、病棟スタッフから質問された。測定原理と検体の扱いを整理する',
      beats: [
        {
          id: 'q11-u1-d0',
          type: 'dialogue',
          xp: 5,
          title: '血糖測定の原理について',
          backgroundId: 'labhall',
          lines: [
            { speaker: '実習生', text: '病棟の看護師さんに「中央検査室の血糖ってどうやって測ってるんですか?」って聞かれました' },
            { speaker: '技師', text: 'いい機会だね。血糖の測定原理と、採血後の検体の扱いで気をつける点を確認しよう。' },
            {
              speaker: '技師',
              text: '測定原理(ヘキソキナーゼ-G6PDH法・GOD法・GDH法)と、解糖・NaF採血管・全血血漿血清の差、そして低血糖・高血糖のパニック値対応、教科書で確認して。',
            },
            { speaker: '技師', text: 'そのうえで、看護師さんにどう説明するか一緒に整理しよう。' },
          ],
        },
        {
          id: 'q11-u1-problem',
          type: 'problem',
          xp: 5,
        },
        {
          id: 'q11-u1-lec',
          type: 'lecture',
          xp: 10,
          body:
            '血糖の測定原理にはいくつかの種類があります。ヘキソキナーゼ-G6PDH法は、グルコースをヘキソキナーゼでグルコース-6-リン酸(G6P)に変換し、続けてG6PDHでNADPHを生成させ、その吸光度(340nm)を測定する方法です。特異性が高く、基準測定法として中央検査室での精密測定によく用いられます。\n\nこれに対しグルコースオキシダーゼ(GOD)法やグルコースデヒドロゲナーゼ(GDH)法は、より簡易・迅速に測定できる酵素法で、日常検査や血糖自己測定器・POCT機器に広く使われています(GDH法の一部はマルトースなどの糖類による干渉を受けることがある点は、別シリーズのPOCTでも扱った通りです)。\n\n採血後は赤血球が解糖を続けるため、放置した検体は血糖値が徐々に低下します。これを防ぐのがNaF(フッ化ナトリウム)入りの採血管で、解糖を阻止して採血時の値を保持します(採血管の使い分けは別シリーズで詳しく扱っています)。また、血糖値は検体の種類によっても異なり、全血血糖は血漿・血清血糖よりおおむね10〜15%程度低く出ます(赤血球内は血漿より水分含量が少ないため)。著しい低血糖・高血糖は意識障害など生命に関わるため、パニック値として速やかな報告が求められます(具体的な閾値・報告手順は自施設の方針によります)。',
          bridge:
            '教科書で、血糖測定の原理(ヘキソキナーゼ-G6PDH法・GOD法・GDH法)、解糖による低下・NaF採血管と全血・血漿・血清での値の差、そして低血糖・高血糖のパニック値対応の3つを確認し、それぞれキーワードを入力してください。',
        },
        {
          id: 'q11-u1-inv-principles',
          type: 'investigate',
          xp: 15,
          mode: 'textbook',
          required: true,
          purpose: '看護師からの質問に答えるため、血糖測定の原理を確認する',
          howTo: '教科書・配布資料で、血糖測定の原理について正しい記述を確認する。',
          clueKey: 'glucose-measurement-principles',
          demoHint: 'モック正解例: ヘキソキナーゼ-G6PDH法は特異性が高く基準測定法/GOD法・GDH法は簡易迅速で日常検査やPOCT機器に用いる',
          choices: [
            {
              label: 'ヘキソキナーゼ-G6PDH法はグルコースをG6Pに変換後、G6PDHでNADPHを生成させて測定する、特異性の高い方法である',
              correct: true,
            },
            {
              label: 'GOD法・GDH法は簡易・迅速に測定できる酵素法で、日常検査や血糖自己測定器・POCT機器に広く用いられる',
              correct: true,
            },
            { label: '血糖の測定原理はどの機器・施設でも常に同一である', correct: false },
            { label: 'ヘキソキナーゼ-G6PDH法はGOD法よりも特異性が低い方法である', correct: false },
          ],
        },
        {
          id: 'q11-u1-inv-specimen',
          type: 'investigate',
          xp: 15,
          mode: 'textbook',
          required: true,
          purpose: '採血後の検体の扱いによって血糖値がどう変わりうるかを確認する',
          howTo: '教科書・配布資料で、解糖による低下・NaF採血管と全血・血漿・血清での値の差について正しい記述を確認する。',
          clueKey: 'glycolysis-and-specimen-differences',
          demoHint: 'モック正解例: 放置検体は解糖により血糖が低下する(NaFで防止)/全血血糖は血漿・血清血糖より約10〜15%低い',
          choices: [
            {
              label: '採血後、赤血球が解糖を続けるため放置した検体は血糖値が徐々に低下する。NaF入り採血管はこれを防ぐ',
              correct: true,
            },
            {
              label: '全血血糖は血漿・血清血糖よりおおむね10〜15%程度低く出る',
              correct: true,
            },
            { label: '採血後、検体を放置しても血糖値は一切変化しない', correct: false },
            { label: '全血血糖と血漿血糖は常に完全に同じ値になる', correct: false },
          ],
        },
        {
          id: 'q11-u1-inv-panic',
          type: 'investigate',
          xp: 15,
          mode: 'textbook',
          required: true,
          purpose: '著しい低血糖・高血糖がなぜ緊急報告の対象になるのかを確認する',
          howTo: '教科書・配布資料で、低血糖・著明高血糖のパニック値対応について正しい記述を確認する。',
          clueKey: 'glucose-panic-value-response',
          demoHint: 'モック正解例: 著しい低血糖・高血糖は意識障害など生命に関わるためパニック値として速やかな報告が求められる',
          choices: [
            {
              label: '著しい低血糖・高血糖は意識障害など生命に関わるため、パニック値として速やかな報告が求められる',
              correct: true,
            },
            {
              label: 'パニック値の具体的な閾値や報告手順は自施設の方針によって定められる',
              correct: true,
            },
            { label: '血糖値がどんなに異常でも、通常の報告手順と同じ速さで問題ない', correct: false },
            { label: 'パニック値の閾値は全国どの施設でも完全に同一である', correct: false },
          ],
        },
        {
          id: 'q11-u1-res1',
          type: 'resolve',
          title: '判断',
          xp: 15,
          prompt: '看護師「中央検査室の血糖ってどうやって測ってるんですか?」まずどう答える?',
          requiredClueKeys: ['glucose-measurement-principles'],
          choices: [
            {
              label: '中央検査室で使っている測定原理(ヘキソキナーゼ-G6PDH法など)と、POCT機器の原理との違いを踏まえて答える',
              correct: true,
              feedback: '測定原理の違いを踏まえて説明することが、両者の値の差の理解にもつながります。',
            },
            {
              label: '「血糖は血糖」としか答えず、原理には触れない',
              correct: false,
              feedback: '原理を説明しないと、値の差が生じた際の疑問に答えられません。',
            },
            {
              label: '質問には答えず、医師に聞くよう伝える',
              correct: false,
              feedback: '実習生としてまず自分でわかる範囲を整理して答える姿勢が大切です。',
            },
          ],
        },
        {
          id: 'q11-u1-res2',
          type: 'resolve',
          title: '報告',
          xp: 15,
          prompt: 'では、検体の取り扱いについても含めて、最終的にどう説明する?',
          requiredClueKeys: [
            'glucose-measurement-principles',
            'glycolysis-and-specimen-differences',
            'glucose-panic-value-response',
          ],
          choices: [
            {
              label:
                '測定原理の違いに加え、採血後は解糖により値が下がりうること(NaF採血管で防止)、全血・血漿・血清で値が異なること、著しい異常値はパニック値として速やかに報告されることを説明する',
              correct: true,
              feedback: '原理・検体の扱い・緊急報告のしくみをまとめて説明することで、看護師の理解と協力を得やすくなります。',
            },
            {
              label: '検体の扱いには触れず、測定原理だけを説明する',
              correct: false,
              feedback: '解糖や検体差の説明を省くと、現場での採血後の扱いに誤解が生じかねません。',
            },
            {
              label: 'パニック値の話は今回とは無関係なので触れない',
              correct: false,
              feedback: '緊急報告の仕組みを共有しておくことも、病棟との連携には有用です。',
            },
          ],
        },
        {
          id: 'q11-u1-drill',
          type: 'drill',
          xp: 20,
          questions: [
            {
              id: 'q11-u1-q1',
              format: 'mcq',
              prompt: '基準測定法として中央検査室での精密測定によく用いられる血糖測定原理はどれか。',
              choices: [
                { label: 'ヘキソキナーゼ-G6PDH法', correct: true },
                { label: 'GOD法のみ', correct: false },
                { label: 'GDH法のみ', correct: false },
                { label: 'イムノクロマトグラフィ法', correct: false },
              ],
              explanation: 'ヘキソキナーゼ-G6PDH法は特異性が高く、基準測定法として用いられます。',
            },
            {
              id: 'q11-u1-q2',
              format: 'mcq',
              prompt: '血糖測定原理に関する記述として正しいものはどれか(複数選択可)。',
              choices: [
                { label: 'GOD法・GDH法は簡易・迅速に測定できる酵素法で日常検査やPOCT機器に用いられる', correct: true },
                { label: 'ヘキソキナーゼ-G6PDH法はNADPHの吸光度を測定する', correct: true },
                { label: 'GOD法はイムノクロマトグラフィと同じ原理である', correct: false },
                { label: '血糖の測定原理はどの機器でも常に同一である', correct: false },
              ],
              explanation: '測定原理は方法によって異なり、それぞれ特徴があります。',
            },
            {
              id: 'q11-u1-q3',
              format: 'mcq',
              prompt: '採血後の検体を放置すると血糖値が低下する理由として正しいのは?',
              choices: [
                { label: '赤血球が解糖を続けるため', correct: true },
                { label: '白血球が糖を分解するため', correct: false },
                { label: '血漿中の水分が蒸発するため', correct: false },
                { label: '検体が冷えることで化学反応が進むため', correct: false },
              ],
              explanation: '解糖により赤血球がグルコースを消費し続けるため、放置した検体の血糖値は低下します。',
            },
            {
              id: 'q11-u1-q4',
              format: 'mcq',
              prompt: '全血血糖と血漿血糖の関係として正しいものはどれか(複数選択可)。',
              choices: [
                { label: '全血血糖は血漿血糖よりおおむね10〜15%程度低く出る', correct: true },
                { label: '赤血球内は血漿より水分含量が少ないため差が生じる', correct: true },
                { label: '全血血糖と血漿血糖は常に完全に一致する', correct: false },
                { label: '全血血糖は血漿血糖より常に高く出る', correct: false },
              ],
              explanation: '赤血球内の水分含量の違いにより、全血血糖は血漿血糖より低く出ます。',
            },
            {
              id: 'q11-u1-q5',
              format: 'mcq',
              prompt: '著しい低血糖・高血糖への対応として最も優先すべきは?',
              choices: [
                { label: 'パニック値として速やかに報告すること', correct: true },
                { label: '通常の結果と同じ速さで報告すること', correct: false },
                { label: '再検査の予定がなければ報告しないこと', correct: false },
                { label: '報告せず記録だけ残すこと', correct: false },
              ],
              explanation: '著しい低血糖・高血糖は生命に関わるため、速やかな報告が求められます。',
            },
          ],
        },
      ],
    },

    // ══════════════════════════════════════════════════════════════
    // u2: 11-B(HbA1c) — 骨子案付録B優先#7のシナリオ
    // ══════════════════════════════════════════════════════════════
    {
      unitId: 'q11-glucose-u2',
      title: '血糖は高いのにHbA1cが低い',
      requestLine: '血糖値は高いのにHbA1cが低い患者がいる。この患者に何が起きているかを整理する',
      beats: [
        {
          id: 'q11-u2-d0',
          type: 'dialogue',
          xp: 5,
          title: 'かみ合わない2つの値',
          backgroundId: 'labhall',
          lines: [
            { speaker: '実習生', text: 'この患者さん、血糖はかなり高いのに、HbA1cは低めなんです…何が起きてるんでしょう?' },
            { speaker: '技師', text: 'それは注目すべき組み合わせだね。まずHbA1cがそもそも何を反映しているかを確認しよう。' },
            {
              speaker: '技師',
              text: 'HbA1cの生成機序と反映期間、測定法、そして偽値の原因(異常ヘモグロビン・貧血・腎不全)、教科書で確認して。',
            },
            { speaker: '技師', text: 'そのうえで、この患者さんに何が起きているか一緒に考えよう。' },
          ],
        },
        {
          id: 'q11-u2-problem',
          type: 'problem',
          xp: 5,
        },
        {
          id: 'q11-u2-lec',
          type: 'lecture',
          xp: 10,
          body:
            'HbA1cは、血中のグルコースがヘモグロビンβ鎖のN末端に非酵素的に結合(糖化)して生じるものです。赤血球の寿命(約120日)の間、血糖にさらされ続けることでゆっくり蓄積するため、HbA1cは直近1〜2か月間の平均血糖を反映すると考えられています(直近1か月の血糖の影響が比較的大きいとされます)。この反映期間の長さゆえに、血糖が最近急に悪化したばかりの場合は、HbA1cがまだその上昇に追いついておらず低めに出ることがあります。これは測定の誤りではなく、HbA1cの性質上正しい反映であり、高血糖がいつから始まったのかをまず確認することが解釈の第一歩になります。\n\nHbA1cの測定法にはいくつかあります。HPLC(イオン交換)法は電荷の違いを利用してヘモグロビンの分画を分離し、クロマトグラムとして検出する高精度な方法です。免疫法は糖化されたN末端に対する抗体を用いる方法、酵素法は糖化N末端アミノ酸を特異的に切断・酸化する酵素を用いる方法で、いずれも比較的簡便な機器で測定できます。\n\nそれでも説明がつかない場合は、HbA1cが正確に平均血糖を反映していない可能性を考えます。異常ヘモグロビン(HbSやHbFなど)は、測定法によってはクロマトグラムの分離や検出に影響し、偽高値・偽低値の原因になります。また、溶血性貧血・出血・輸血直後など赤血球の寿命が短縮する病態では、ヘモグロビンが糖化にさらされる時間が足りず、実際の血糖より低いHbA1cになりやすくなります(偽低値)。腎不全では尿毒症物質による赤血球寿命の短縮や、エリスロポエチン(ESA)製剤治療に伴う網状赤血球増加(若い赤血球の増加)のため偽低値になりやすい一方、尿毒症物質(カルバミル化ヘモグロビン)が一部の測定法で偽高値の原因になることもあり、腎不全は方向が一定しない点に注意が必要です。',
          bridge:
            '教科書で、糖化ヘモグロビンの生成機序と反映期間、HbA1cの測定法(HPLC法・免疫法・酵素法)、そして異常ヘモグロビン・貧血・腎不全によるHbA1c偽値の3つを確認し、それぞれキーワードを入力してください。',
        },
        {
          id: 'q11-u2-inv-formation',
          type: 'investigate',
          xp: 15,
          mode: 'textbook',
          required: true,
          purpose: 'HbA1cがそもそも何を反映しているのかを確認する',
          howTo: '教科書・配布資料で、糖化ヘモグロビンの生成機序と反映期間について正しい記述を確認する。',
          clueKey: 'hba1c-formation-and-window',
          demoHint: 'モック正解例: 血中グルコースがヘモグロビンβ鎖N末端に非酵素的に結合/赤血球寿命を反映し直近1〜2か月の平均血糖を示す/急激な悪化直後はまだ追いついておらず低めに出ることがある',
          choices: [
            {
              label: 'HbA1cは血中グルコースがヘモグロビンβ鎖N末端に非酵素的に結合(糖化)して生じる',
              correct: true,
            },
            {
              label: '赤血球の寿命(約120日)の間の糖化の蓄積を反映し、直近1〜2か月の平均血糖を示す(直近1か月の影響が比較的大きい)',
              correct: true,
            },
            {
              label: '血糖が最近急に悪化したばかりの場合、HbA1cはまだその上昇に追いついておらず低めに出ることがある(測定の誤りではない)',
              correct: true,
            },
            { label: 'HbA1cは採血直前の数時間の血糖のみを反映する', correct: false },
            { label: 'HbA1cは赤血球の寿命とは無関係に決まる値である', correct: false },
          ],
        },
        {
          id: 'q11-u2-inv-methods',
          type: 'investigate',
          xp: 15,
          mode: 'textbook',
          required: true,
          purpose: 'HbA1cがどのように測定されているのかを確認する',
          howTo: '教科書・配布資料で、HbA1c測定法(HPLC法・免疫法・酵素法)について正しい記述を確認する。',
          clueKey: 'hba1c-measurement-methods',
          demoHint: 'モック正解例: HPLC(イオン交換)法は電荷の違いを利用しクロマトグラムとして検出/免疫法・酵素法は簡便な機器で測定できる',
          choices: [
            {
              label: 'HPLC(イオン交換)法は電荷の違いを利用してヘモグロビン分画を分離し、クロマトグラムとして検出する高精度な方法である',
              correct: true,
            },
            {
              label: '免疫法は糖化N末端に対する抗体を用いる方法、酵素法は糖化N末端を特異的に切断・酸化する酵素を用いる方法で、いずれも比較的簡便な機器で測定できる',
              correct: true,
            },
            { label: 'HbA1cはイムノクロマトグラフィでしか測定できない', correct: false },
            { label: 'HPLC法・免疫法・酵素法はすべて同一の反応原理である', correct: false },
          ],
        },
        {
          id: 'q11-u2-inv-falsevalue',
          type: 'investigate',
          xp: 15,
          mode: 'textbook',
          required: true,
          purpose: 'この患者の「血糖は高いのにHbA1cが低い」現象を説明できる要因を確認する',
          howTo: '教科書・配布資料で、異常ヘモグロビン・貧血・腎不全によるHbA1c偽値について正しい記述を確認する。',
          clueKey: 'hba1c-false-value-causes',
          demoHint: 'モック正解例: 溶血性貧血・出血・輸血直後など赤血球寿命が短縮する病態では偽低値になりやすい/腎不全は偽低値・偽高値どちらもありうる',
          choices: [
            {
              label: '溶血性貧血・出血・輸血直後など赤血球の寿命が短縮する病態では、糖化する時間が足りず偽低値になりやすい',
              correct: true,
            },
            {
              label: '腎不全では尿毒症物質による赤血球寿命短縮や、ESA製剤治療に伴う網状赤血球増加のため偽低値になりやすい一方、尿毒症物質による偽高値が生じることもあり、方向が一定しない',
              correct: true,
            },
            { label: '異常ヘモグロビンやHbA1cの偽値は、どんな測定法でも一切起こらない', correct: false },
            { label: '貧血の有無はHbA1cの値に一切影響しない', correct: false },
          ],
        },
        {
          id: 'q11-u2-res1',
          type: 'resolve',
          title: '判断',
          xp: 15,
          prompt: '血糖は高いのにHbA1cが低い患者を前に、まずどう考える?',
          requiredClueKeys: ['hba1c-formation-and-window'],
          choices: [
            {
              label: 'まず高血糖がいつから始まった(悪化した)のかを確認し、HbA1cの反映期間がまだ追いついていない可能性を検討する。それで説明がつかなければ、赤血球寿命に影響する要因(貧血・出血・輸血など)がないか患者背景を確認する',
              correct: true,
              feedback: 'HbA1cは反映期間のある値なので、まず高血糖の発症時期を確認することが最初の一歩です。それで説明がつかない場合に初めて赤血球寿命への影響を疑います。',
            },
            {
              label: 'HbA1cの測定が誤っていると即座に断定する',
              correct: false,
              feedback: '測定精度管理に問題がなければ、患者側の要因をまず検討します。',
            },
            {
              label: '血糖値の方を疑い、再検査せず無視する',
              correct: false,
              feedback: '一方だけを疑って他方を無視するのは適切な進め方ではありません。',
            },
          ],
        },
        {
          id: 'q11-u2-res2',
          type: 'resolve',
          title: '報告',
          xp: 15,
          prompt: 'では、この乖離について最終的にどう報告する?',
          requiredClueKeys: ['hba1c-formation-and-window', 'hba1c-measurement-methods', 'hba1c-false-value-causes'],
          choices: [
            {
              label:
                '高血糖の発症・悪化時期を確認し、反映期間の関係でまだ追いついていないだけの可能性を伝える。それでも説明がつかない場合は、赤血球寿命が短縮する病態(溶血性貧血・出血・輸血直後など)や腎不全の有無を確認し、該当があればHbA1cが偽低値になりうることを説明したうえで、必要に応じてグリコアルブミンなど他の指標との併用を提案する',
              correct: true,
              feedback: '反映期間による説明を先に検討し、それでも説明がつかない場合に偽値の可能性・他指標の併用を提案するのが臨床的に自然な順序です。',
            },
            {
              label: 'HbA1cの値だけをそのまま報告し、乖離には触れない',
              correct: false,
              feedback: '明らかな乖離がある場合、その可能性を伝えないのは不十分な報告です。',
            },
            {
              label: '測定法の違いには触れず、数値だけを機械的に伝える',
              correct: false,
              feedback: '偽値の背景を説明しないと、臨床側が誤って血糖コントロール良好と判断しかねません。',
            },
          ],
        },
        {
          id: 'q11-u2-drill',
          type: 'drill',
          xp: 20,
          questions: [
            {
              id: 'q11-u2-q1',
              format: 'mcq',
              prompt: 'HbA1cが反映する期間として最も適切なのは?',
              choices: [
                { label: '直近1〜2か月の平均血糖', correct: true },
                { label: '採血直前の数時間の血糖', correct: false },
                { label: '直近1年間の平均血糖', correct: false },
                { label: '生涯を通じた平均血糖', correct: false },
              ],
              explanation: 'HbA1cは赤血球の寿命(約120日)の間の糖化を反映し、直近1〜2か月の平均血糖を示します。',
            },
            {
              id: 'q11-u2-q2',
              format: 'mcq',
              prompt: 'HbA1cの測定法に関する記述として正しいものはどれか(複数選択可)。',
              choices: [
                { label: 'HPLC(イオン交換)法は電荷の違いを利用してクロマトグラムとして検出する', correct: true },
                { label: '免疫法・酵素法は比較的簡便な機器で測定できる', correct: true },
                { label: 'HbA1cはイムノクロマトグラフィでしか測定できない', correct: false },
                { label: 'HPLC法・免疫法・酵素法はすべて同一の反応原理である', correct: false },
              ],
              explanation: 'HbA1cにはいくつかの測定法があり、原理はそれぞれ異なります。',
            },
            {
              id: 'q11-u2-q3',
              format: 'mcq',
              prompt: '血糖は高いのにHbA1cが低い場合に、まず確認すべきことは?',
              choices: [
                { label: '高血糖がいつから始まった(悪化した)のか(反映期間の関係でまだ追いついていない可能性がないか)', correct: true },
                { label: '利き手', correct: false },
                { label: '身長のみ', correct: false },
                { label: '血液型のみ(貧血や輸血歴と無関係に)', correct: false },
              ],
              explanation: 'HbA1cには反映期間があるため、まず高血糖の発症時期を確認することが最初のステップです。',
            },
            {
              id: 'q11-u2-q3b',
              format: 'mcq',
              prompt: '高血糖の発症時期だけでは説明がつかない場合に、次に確認すべき患者背景として最も適切なのは?',
              choices: [
                { label: '溶血性貧血・出血・輸血直後など、赤血球寿命が短縮する要因の有無', correct: true },
                { label: '身長・体重のみ', correct: false },
                { label: '利き手', correct: false },
                { label: '血液型のみ(貧血や輸血歴と無関係に)', correct: false },
              ],
              explanation: '赤血球寿命が短縮すると糖化する時間が不足し、HbA1cが偽低値になりやすくなります。',
            },
            {
              id: 'q11-u2-q4',
              format: 'mcq',
              prompt: 'HbA1cの偽値に関する記述として正しいものはどれか(複数選択可)。',
              choices: [
                { label: '溶血性貧血では赤血球寿命短縮により偽低値になりやすい', correct: true },
                { label: '腎不全では偽低値・偽高値のどちらも起こりうる', correct: true },
                { label: '異常ヘモグロビンはHbA1c測定に一切影響しない', correct: false },
                { label: '貧血の有無はHbA1cの値に一切関係しない', correct: false },
              ],
              explanation: '腎不全は尿毒症物質による赤血球寿命短縮などによる偽低値と、尿毒症物質(カルバミル化ヘモグロビン)による偽高値の両方の可能性があり、方向が一定しません。',
            },
            {
              id: 'q11-u2-q5',
              format: 'mcq',
              prompt: '血糖とHbA1cが乖離している患者への報告として最も優先すべきは?',
              choices: [
                { label: '偽値の可能性のある背景要因を確認し、該当があればその旨と他指標の併用を提案して報告すること', correct: true },
                { label: 'HbA1cの数値だけを機械的に伝えること', correct: false },
                { label: '乖離には一切触れず血糖値のみ報告すること', correct: false },
                { label: '測定が誤っていると決めつけて再検査を勧めないこと', correct: false },
              ],
              explanation: '偽値の可能性を踏まえた説明と、必要な指標の補完提案がセットで求められます。',
            },
          ],
        },
      ],
    },

    // ══════════════════════════════════════════════════════════════
    // u3: 11-C(その他の血糖コントロール指標)
    // ══════════════════════════════════════════════════════════════
    {
      unitId: 'q11-glucose-u3',
      title: '透析患者のHbA1cが実感と合わない',
      requestLine: '透析を受けている糖尿病患者のHbA1cが、血糖コントロールの実感と合わない。他の指標の使い分けを整理する',
      beats: [
        {
          id: 'q11-u3-d0',
          type: 'dialogue',
          xp: 5,
          title: '透析患者のHbA1c',
          backgroundId: 'labhall',
          lines: [
            { speaker: '実習生', text: 'この透析患者さん、HbA1cが実際の血糖コントロールの様子と合っていない気がします…' },
            { speaker: '技師', text: '透析患者はHbA1cが不正確になりやすい代表例だね。他の血糖コントロール指標を確認しよう。' },
            {
              speaker: '技師',
              text: 'グリコアルブミンと1,5-アンヒドログルシトールの特徴、そして指標の使い分け(透析・妊娠・急激な変動時)、教科書で確認して。',
            },
            { speaker: '技師', text: 'そのうえで、この患者さんにはどの指標が適しているか一緒に考えよう。' },
          ],
        },
        {
          id: 'q11-u3-problem',
          type: 'problem',
          xp: 5,
        },
        {
          id: 'q11-u3-lec',
          type: 'lecture',
          xp: 10,
          body:
            'HbA1c以外にも、血糖コントロールを評価する指標があります。グリコアルブミン(GA)は、アルブミンが糖化された産物で、アルブミンの半減期(約2〜3週間)を反映するため、直近約2週間の平均血糖を示します。HbA1cより反映期間が短く、赤血球の寿命に依存しないという特徴があります。\n\n1,5-アンヒドログルシトール(1,5-AG)は、高血糖時に生じる糖尿(尿中へのグルコース排泄)に伴って尿中に失われ低下する物質です。直近数日程度の血糖変動、特に食後高血糖を鋭敏に反映します。\n\nこれらの指標は、状況によって使い分けます。透析患者や貧血のある患者では、赤血球の寿命が影響するHbA1cが不正確になりやすいため、赤血球寿命に依存しないグリコアルブミンが有用です。妊娠糖尿病でも、妊娠に伴う生理的な変化でHbA1cが低めに出やすく、グリコアルブミンが補助的に用いられます。急激な血糖変動を把握したい場合は、反映期間の短い1,5-AGやグリコアルブミンが適しています。ただし、SGLT2阻害薬を服用中の患者では、薬理作用による糖尿のため1,5-AGは血糖コントロールの状態と無関係に低値となり、指標として使えない点に注意が必要です。',
          bridge:
            '教科書で、グリコアルブミンと1,5-アンヒドログルシトールの特徴、そして血糖コントロール指標の使い分け(透析・妊娠・急激な変動時)の2つを確認し、それぞれキーワードを入力してください。',
        },
        {
          id: 'q11-u3-inv-indicators',
          type: 'investigate',
          xp: 15,
          mode: 'textbook',
          required: true,
          purpose: 'HbA1c以外の血糖コントロール指標がそれぞれ何を反映しているのかを確認する',
          howTo: '教科書・配布資料で、グリコアルブミンと1,5-アンヒドログルシトールの特徴について正しい記述を確認する。',
          clueKey: 'other-glycemic-indicators',
          demoHint: 'モック正解例: グリコアルブミンは直近約2週間の平均血糖(赤血球寿命に依存しない)/1,5-AGは直近数日の血糖変動(特に食後高血糖)を反映',
          choices: [
            {
              label: 'グリコアルブミンはアルブミンの半減期を反映し、直近約2週間の平均血糖を示す(赤血球寿命に依存しない)',
              correct: true,
            },
            {
              label: '1,5-アンヒドログルシトールは高血糖時の糖尿に伴い低下し、直近数日の血糖変動(特に食後高血糖)を鋭敏に反映する',
              correct: true,
            },
            { label: 'グリコアルブミンはHbA1cと全く同じ期間の血糖を反映する', correct: false },
            { label: '1,5-アンヒドログルシトールは高血糖時に上昇する物質である', correct: false },
          ],
        },
        {
          id: 'q11-u3-inv-selection',
          type: 'investigate',
          xp: 15,
          mode: 'textbook',
          required: true,
          purpose: 'この透析患者にはどの指標が適しているか、使い分けの考え方を確認する',
          howTo: '教科書・配布資料で、血糖コントロール指標の使い分け(透析・妊娠・急激な変動時)について正しい記述を確認する。',
          clueKey: 'glycemic-indicator-selection',
          demoHint: 'モック正解例: 透析・貧血ではHbA1cが不正確になりやすくグリコアルブミンが有用/SGLT2阻害薬服用中は1,5-AGが指標として使えない',
          choices: [
            {
              label: '透析患者や貧血のある患者ではHbA1cが赤血球寿命の影響で不正確になりやすく、グリコアルブミンが有用である',
              correct: true,
            },
            {
              label: 'SGLT2阻害薬服用中は薬理作用による糖尿のため、1,5-AGは血糖コントロールと無関係に低値となり指標として使えない',
              correct: true,
            },
            { label: '透析患者ではHbA1cが常に正確な指標になる', correct: false },
            { label: 'すべての患者で使う指標は常に同一で、使い分ける必要はない', correct: false },
          ],
        },
        {
          id: 'q11-u3-res1',
          type: 'resolve',
          title: '判断',
          xp: 15,
          prompt: '透析患者のHbA1cが実感と合わない。まずどう考える?',
          requiredClueKeys: ['other-glycemic-indicators'],
          choices: [
            {
              label: '透析患者ではHbA1cが不正確になりやすいことを踏まえ、グリコアルブミンなど他の指標も確認する',
              correct: true,
              feedback: 'HbA1c単独に頼らず、別の指標も併せて確認する視点が大切です。',
            },
            {
              label: 'HbA1cの値だけを信頼し、他の指標は確認しない',
              correct: false,
              feedback: '透析患者ではHbA1cが不正確になりやすいため、単独で判断するのは避けます。',
            },
            {
              label: '血糖コントロールの評価自体をあきらめる',
              correct: false,
              feedback: '適切な指標を選べば血糖コントロールの評価は可能です。',
            },
          ],
        },
        {
          id: 'q11-u3-res2',
          type: 'resolve',
          title: '報告',
          xp: 15,
          prompt: 'では、最終的にどう報告・提案する?',
          requiredClueKeys: ['other-glycemic-indicators', 'glycemic-indicator-selection'],
          choices: [
            {
              label: '透析患者ではHbA1cが不正確になりやすいことを説明したうえで、グリコアルブミンなど反映期間の異なる指標の併用を提案する',
              correct: true,
              feedback: '患者の病態に応じた指標の使い分けを提案することが、有用な報告につながります。',
            },
            {
              label: 'HbA1cの数値だけをそのまま報告する',
              correct: false,
              feedback: '透析患者特有の限界を説明しないのは不十分な報告です。',
            },
            {
              label: '他の指標の存在には触れず、再検査だけを勧める',
              correct: false,
              feedback: '指標そのものの限界を説明せず再検査するだけでは、同じ問題が繰り返されます。',
            },
          ],
        },
        {
          id: 'q11-u3-drill',
          type: 'drill',
          xp: 20,
          questions: [
            {
              id: 'q11-u3-q1',
              format: 'mcq',
              prompt: 'グリコアルブミンが反映する期間として最も適切なのは?',
              choices: [
                { label: '直近約2週間の平均血糖', correct: true },
                { label: '直近1〜2か月の平均血糖', correct: false },
                { label: '採血直前の数時間の血糖', correct: false },
                { label: '直近1年間の平均血糖', correct: false },
              ],
              explanation: 'グリコアルブミンはアルブミンの半減期(約2〜3週間)を反映し、直近約2週間の平均血糖を示します。',
            },
            {
              id: 'q11-u3-q2',
              format: 'mcq',
              prompt: '1,5-アンヒドログルシトールに関する記述として正しいものはどれか(複数選択可)。',
              choices: [
                { label: '高血糖時の糖尿に伴い尿中に失われて低下する', correct: true },
                { label: '直近数日の血糖変動、特に食後高血糖を鋭敏に反映する', correct: true },
                { label: '高血糖時に上昇する物質である', correct: false },
                { label: 'SGLT2阻害薬の影響を受けない', correct: false },
              ],
              explanation: '1,5-AGは高血糖時の糖尿に伴い低下し、短期的な血糖変動を反映します。',
            },
            {
              id: 'q11-u3-q3',
              format: 'mcq',
              prompt: '透析患者や貧血のある患者で、HbA1cの代わりに有用な指標はどれか。',
              choices: [
                { label: 'グリコアルブミン', correct: true },
                { label: '空腹時血糖のみ', correct: false },
                { label: 'CRP', correct: false },
                { label: 'PSA', correct: false },
              ],
              explanation: 'グリコアルブミンは赤血球寿命に依存しないため、透析患者・貧血患者でも比較的正確に評価できます。',
            },
            {
              id: 'q11-u3-q4',
              format: 'mcq',
              prompt: '血糖コントロール指標の使い分けに関する記述として正しいものはどれか(複数選択可)。',
              choices: [
                { label: '妊娠糖尿病ではHbA1cが低めに出やすく、グリコアルブミンが補助的に用いられる', correct: true },
                { label: 'SGLT2阻害薬服用中は1,5-AGが血糖コントロールと無関係に低値となり指標として使えない', correct: true },
                { label: 'すべての患者で使う指標は常に同一である', correct: false },
                { label: '妊娠中はHbA1cが常に正確に評価できる', correct: false },
              ],
              explanation: '患者の病態や服薬状況によって、適した指標を使い分ける必要があります。',
            },
            {
              id: 'q11-u3-q5',
              format: 'mcq',
              prompt: '透析患者のHbA1cが実感と合わないときの対応として最も優先すべきは?',
              choices: [
                { label: 'HbA1cの限界を説明したうえで、グリコアルブミンなど他の指標の併用を提案すること', correct: true },
                { label: 'HbA1cの数値のみをそのまま報告すること', correct: false },
                { label: '血糖コントロールの評価自体をあきらめること', correct: false },
                { label: '指標の限界を説明せず再検査のみ勧めること', correct: false },
              ],
              explanation: '指標の限界の説明と、適した代替指標の提案がセットで求められます。',
            },
          ],
        },
      ],
    },

    // ══════════════════════════════════════════════════════════════
    // u4: 11-D(糖尿病の診断と療養)
    // ══════════════════════════════════════════════════════════════
    {
      unitId: 'q11-glucose-u4',
      title: '75gOGTTって何のためにやるの?',
      requestLine: '75gOGTTを受ける患者から検査の目的を聞かれた。糖尿病の診断基準と検査の流れを整理する',
      beats: [
        {
          id: 'q11-u4-d0',
          type: 'dialogue',
          xp: 5,
          title: '検査前の患者からの質問',
          backgroundId: 'labhall',
          lines: [
            { speaker: '実習生', text: 'これから75gOGTTを受ける患者さんに「これ何のための検査ですか?」って聞かれました' },
            { speaker: '技師', text: 'まず糖尿病型の判定基準と、75gOGTTがその中でどんな位置づけかを確認しよう。' },
            {
              speaker: '技師',
              text: '判定基準と75gOGTTの実施手順、そしてインスリン・Cペプチド・抗GAD抗体、教科書で確認して。',
            },
            { speaker: '技師', text: 'そのうえで、患者さんにどう説明するか一緒に整理しよう。' },
          ],
        },
        {
          id: 'q11-u4-problem',
          type: 'problem',
          xp: 5,
        },
        {
          id: 'q11-u4-lec',
          type: 'lecture',
          xp: 10,
          body:
            '糖尿病型の判定には、血糖値による基準(空腹時血糖126mg/dL以上、随時血糖200mg/dL以上、75gOGTT2時間値200mg/dL以上のいずれか)と、HbA1c(NGSP値)6.5%以上という基準を用います。ただし両者は対等ではありません。血糖値がこの基準を満たすことが必須で、HbA1cはあくまで補助的な位置づけです。HbA1cだけが6.5%以上でも、血糖値の基準を満たしていなければ糖尿病型とは判定できません。逆に、同一の採血で血糖値とHbA1cの両方が基準を満たせば、1回の検査だけで糖尿病と診断できます(血糖値基準のみを満たす場合は、原則として別の日に再検査して確認します)。\n\n75gOGTT(75g経口ブドウ糖負荷試験)は、空腹の状態でブドウ糖75gを溶かした液を飲み、その後の血糖の推移を経時的な採血で確認する検査です。空腹時と負荷後120分の採血が基本で、施設によってはさらに細かい時点での採血を行うこともあります。検査の前日からの食事の指示や、検査当日の絶食時間、検査中は激しい運動を避け安静に過ごすことなど、正確な結果を得るための注意点があります。\n\n診断だけでなく、糖尿病の病型を考えるうえではインスリンの分泌能や自己免疫の関与を調べることもあります。Cペプチドはプロインスリンから切り出される副産物で、外因性にインスリンを投与していてもその影響を受けずに、患者自身の内因性インスリン分泌能を評価できるという利点があります。抗GAD抗体(抗グルタミン酸脱炭酸酵素抗体)は、自己免疫の関与が疑われる1型糖尿病を示唆する自己抗体マーカーとして用いられます。',
          bridge:
            '教科書で、糖尿病型の判定基準(具体的な数値とHbA1cの位置づけ)と75gOGTTの実施手順、そしてインスリン・Cペプチド・抗GAD抗体の2つを確認し、それぞれキーワードを入力してください。',
        },
        {
          id: 'q11-u4-inv-diagnosis',
          type: 'investigate',
          xp: 15,
          mode: 'textbook',
          required: true,
          purpose: '75gOGTTが糖尿病の診断の中でどんな位置づけの検査かを確認する',
          howTo: '教科書・配布資料で、糖尿病型の判定基準と75gOGTTの実施手順について正しい記述を確認する。',
          clueKey: 'diabetes-diagnostic-criteria',
          demoHint: 'モック正解例: 血糖値基準(空腹時126/随時200/OGTT2時間値200mg/dL以上)が必須、HbA1c6.5%以上は補助的/HbA1c単独では糖尿病型と判定できない',
          choices: [
            {
              label: '糖尿病型の判定は、血糖値基準(空腹時血糖126mg/dL以上・随時血糖200mg/dL以上・75gOGTT2時間値200mg/dL以上のいずれか)を満たすことが必須で、HbA1c(NGSP)6.5%以上は補助的な基準である',
              correct: true,
            },
            {
              label: '75gOGTTは空腹の状態でブドウ糖75gを負荷し、空腹時と負荷後120分を基本に経時的な採血で血糖の推移を確認する',
              correct: true,
            },
            { label: 'HbA1cが6.5%以上でありさえすれば、血糖値の基準を満たしていなくても糖尿病型と判定できる', correct: false },
            { label: '75gOGTTは検査前の食事制限や安静などの注意点が一切不要な検査である', correct: false },
          ],
        },
        {
          id: 'q11-u4-inv-insulin',
          type: 'investigate',
          xp: 15,
          mode: 'textbook',
          required: true,
          purpose: '診断だけでなく病型を考えるうえで用いられる検査を確認する',
          howTo: '教科書・配布資料で、インスリン・Cペプチド・抗GAD抗体について正しい記述を確認する。',
          clueKey: 'insulin-secretion-and-autoantibody-markers',
          demoHint: 'モック正解例: Cペプチドは外因性インスリンの影響を受けず内因性インスリン分泌能を評価できる/抗GAD抗体は1型糖尿病を示唆する自己抗体',
          choices: [
            {
              label: 'Cペプチドはプロインスリンから切り出される副産物で、外因性インスリン投与の影響を受けずに内因性インスリン分泌能を評価できる',
              correct: true,
            },
            {
              label: '抗GAD抗体(抗グルタミン酸脱炭酸酵素抗体)は、自己免疫の関与が疑われる1型糖尿病を示唆する自己抗体マーカーである',
              correct: true,
            },
            { label: 'Cペプチドは外因性インスリンの投与量そのものを直接測定する指標である', correct: false },
            { label: '抗GAD抗体は2型糖尿病の確定診断に用いる検査である', correct: false },
          ],
        },
        {
          id: 'q11-u4-res1',
          type: 'resolve',
          title: '判断',
          xp: 15,
          prompt: '患者「これ何のための検査ですか?」まずどう答える?',
          requiredClueKeys: ['diabetes-diagnostic-criteria'],
          choices: [
            {
              label: '糖尿病型の判定基準の中で75gOGTTがどう使われるかを踏まえて説明する',
              correct: true,
              feedback: '検査の位置づけを説明することで、患者の理解と協力を得やすくなります。',
            },
            {
              label: '「決まりだから」とだけ答え、内容には触れない',
              correct: false,
              feedback: '患者が納得して検査に臨めるよう、目的を説明することが大切です。',
            },
            {
              label: '検査の説明はせず、そのまま検査を進める',
              correct: false,
              feedback: '検査前に目的や流れを伝えることは、患者の協力を得るうえで重要です。',
            },
          ],
        },
        {
          id: 'q11-u4-res2',
          type: 'resolve',
          title: '報告',
          xp: 15,
          prompt: 'では、検査中の注意点も含めて、最終的にどう説明する?',
          requiredClueKeys: ['diabetes-diagnostic-criteria', 'insulin-secretion-and-autoantibody-markers'],
          choices: [
            {
              label: '75gOGTTが判定基準の一つであることに加え、空腹時からの経時採血であることや検査中は安静に過ごす必要があることを説明する。あわせて、必要に応じてインスリン分泌能や自己抗体を調べる検査もあることに触れる',
              correct: true,
              feedback: '検査の位置づけと、検査中に協力してほしい点をあわせて説明することが望ましい対応です。',
            },
            {
              label: '採血の回数だけを伝え、目的や注意点には触れない',
              correct: false,
              feedback: '目的や注意点を説明しないと、患者が不安なまま検査を受けることになります。',
            },
            {
              label: '検査の意味を尋ねられても、担当医に聞くようにとだけ伝える',
              correct: false,
              feedback: '実習生としてわかる範囲は自分で説明する姿勢が大切です。',
            },
          ],
        },
        {
          id: 'q11-u4-drill',
          type: 'drill',
          xp: 20,
          questions: [
            {
              id: 'q11-u4-q1',
              format: 'mcq',
              prompt: '糖尿病型の血糖値基準として正しい組合せはどれか(複数選択可)。',
              choices: [
                { label: '空腹時血糖126mg/dL以上', correct: true },
                { label: '75gOGTT2時間値200mg/dL以上', correct: true },
                { label: '空腹時血糖100mg/dL以上', correct: false },
                { label: '75gOGTT2時間値140mg/dL以上', correct: false },
              ],
              explanation: '空腹時血糖126mg/dL以上、随時血糖200mg/dL以上、75gOGTT2時間値200mg/dL以上のいずれかが血糖値基準です。',
            },
            {
              id: 'q11-u4-q1b',
              format: 'mcq',
              prompt: 'HbA1c(NGSP)が6.5%以上だが、血糖値はいずれの基準も満たさない患者について正しいのは?',
              choices: [
                { label: 'この時点では糖尿病型と判定できない(血糖値基準を満たすことが必須)', correct: true },
                { label: 'HbA1cが基準を満たしているので、直ちに糖尿病型と判定できる', correct: false },
                { label: 'HbA1cは糖尿病型の判定には一切使われない', correct: false },
                { label: '血糖値の基準は無視してよい', correct: false },
              ],
              explanation: 'HbA1cは補助的な基準で、血糖値基準を満たさない限り単独では糖尿病型と判定できません。',
            },
            {
              id: 'q11-u4-q2',
              format: 'mcq',
              prompt: '75gOGTTの実施手順として正しいものはどれか(複数選択可)。',
              choices: [
                { label: '空腹の状態でブドウ糖75gを負荷する', correct: true },
                { label: '空腹時と負荷後120分を基本に経時的な採血を行う', correct: true },
                { label: '検査前の食事内容や当日の安静は結果に一切関係しない', correct: false },
                { label: '採血は検査終了直後の1回のみでよい', correct: false },
              ],
              explanation: '75gOGTTは空腹時からの経時的な採血で血糖の推移を確認する検査です。',
            },
            {
              id: 'q11-u4-q3',
              format: 'mcq',
              prompt: '外因性インスリンを投与していても、内因性インスリン分泌能を評価できる検査はどれか。',
              choices: [
                { label: 'Cペプチド', correct: true },
                { label: 'HbA1c', correct: false },
                { label: 'グリコアルブミン', correct: false },
                { label: '1,5-アンヒドログルシトール', correct: false },
              ],
              explanation: 'Cペプチドはプロインスリンから切り出される副産物で、外因性インスリンの影響を受けません。',
            },
            {
              id: 'q11-u4-q4',
              format: 'mcq',
              prompt: '1型糖尿病を示唆する自己抗体マーカーはどれか。',
              choices: [
                { label: '抗GAD抗体', correct: true },
                { label: 'CA125', correct: false },
                { label: 'PIVKA-Ⅱ', correct: false },
                { label: 'SCC', correct: false },
              ],
              explanation: '抗GAD抗体(抗グルタミン酸脱炭酸酵素抗体)は、自己免疫の関与が疑われる1型糖尿病を示唆します。',
            },
            {
              id: 'q11-u4-q5',
              format: 'mcq',
              prompt: '75gOGTTを受ける患者への説明として最も優先すべきは?',
              choices: [
                { label: '検査の目的(診断基準における位置づけ)と、経時採血・安静などの注意点をあわせて説明すること', correct: true },
                { label: '採血の回数だけを伝えること', correct: false },
                { label: '目的の説明を省略し、そのまま検査を進めること', correct: false },
                { label: '担当医に聞くようにとだけ伝えること', correct: false },
              ],
              explanation: '目的と注意点をあわせて説明することが、患者の理解と協力を得るために重要です。',
            },
          ],
        },
      ],
    },
  ],
}
