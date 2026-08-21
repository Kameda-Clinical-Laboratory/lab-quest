// シリーズ「チーム医療への参加」(大項目23)
// 骨子案付録B優先度10位のシナリオ(「Albは低いままだが栄養は改善している。何を見ればよいか」)を
// u2の判断・報告幕に反映している。
//
// 大項目23は中項目A(感染制御ICT/AST)/B(栄養サポートNST)/C(糖尿病療養指導)の3本立て。
// u1=A、u2=B、u3=Cで全カバーする。
//
//   node scripts/push-series.mjs content/series/q23-team-medicine.mjs --dry-run
//   STAFF_FULL_PASSWORD=xxxx node scripts/push-series.mjs content/series/q23-team-medicine.mjs
//   STAFF_FULL_PASSWORD=xxxx node scripts/push-series.mjs content/series/q23-team-medicine.mjs --publish

export default {
  stageId: 'q23-team-medicine',

  clues: [
    {
      key: 'ict-round-and-lab-role',
      name: 'ICT/ASTラウンドへの同行と検査室の役割',
      summary:
        'ICT(感染制御チーム)・AST(抗菌薬適正使用支援チーム)のラウンドに検査室が同行し、培養・薬剤感受性結果などの検査データを提供する役割を担う。培養・薬剤感受性のほか、PCT(プロカルシトニン、細菌感染で上昇しやすい)、プレセプシン(敗血症の早期診断マーカー、腎機能低下で偽高値になりやすい)、β-Dグルカン(深在性真菌症のスクリーニング、グルカン含有物質による偽陽性に注意)などの検査データも活用される。',
    },
    {
      key: 'antibiogram-and-antimicrobial-stewardship',
      name: 'アンチバイオグラムの作成と抗菌薬適正使用',
      summary:
        'アンチバイオグラムは施設内で分離された菌の薬剤感受性パターンを集計した一覧表で、原因菌が判明する前の経験的治療(エンピリック治療)における抗菌薬選択の参考資料となり、AST活動の基礎データにもなる。',
    },
    {
      key: 'resistant-organism-reporting-flow',
      name: '耐性菌検出時の報告フロー',
      summary:
        'MRSAや多剤耐性緑膿菌などの重要な耐性菌が検出された際は、通常の検査結果報告経路とは別に、ICTへ迅速に報告する体制が必要になる(◆施設差)。',
    },
    {
      key: 'nst-role-of-lab-data',
      name: 'NSTにおける検査値の役割と栄養アセスメント蛋白の半減期',
      summary:
        'NST(栄養サポートチーム)では、身体所見だけでなく検査値を組み合わせて栄養状態を客観的に評価する。栄養アセスメント蛋白にはアルブミン(半減期約3週間)・プレアルブミン(トランスサイレチン、半減期約2日)・トランスフェリン(半減期約1週間)・RBP(レチノール結合蛋白、半減期約12〜16時間)があり、半減期の短いものほど短期的な栄養状態の変化(栄養介入の効果)を鋭敏に反映する(総称してRTP=動的蛋白と呼ばれる)。アルブミンは半減期が長いため、栄養改善の効果が反映されるまでにタイムラグが生じる。',
    },
    {
      key: 'trace-element-deficiency',
      name: '微量元素(Zn・Cu・Se)と欠乏症状',
      summary:
        '亜鉛(Zn)欠乏では味覚障害・皮膚炎・創傷治癒遅延、銅(Cu)欠乏では貧血・好中球減少、セレン(Se)欠乏では心筋症・骨格筋障害が現れることがある。長期の経腸栄養・中心静脈栄養では微量元素の欠乏に注意が必要。',
    },
    {
      key: 'refeeding-syndrome',
      name: '電解質・腎機能とリフィーディング症候群',
      summary:
        '慢性的な低栄養状態の患者に急速に栄養投与を再開すると、インスリン分泌の急増に伴いリン・カリウム・マグネシウムが細胞内へ急速に取り込まれ、血清中のこれらの電解質が急激に低下する(リフィーディング症候群)。特にリンの低下が中心的な指標で、重篤な場合は心不全・不整脈・呼吸不全を招くことがあり、電解質(特にリン)を中心としたモニタリングが重要。',
    },
    {
      key: 'diabetes-education-role-and-data-presentation',
      name: '糖尿病療養指導における検査技師の役割とデータの見せ方',
      summary:
        '検査技師は糖尿病療養指導において、HbA1c・グリコアルブミン・SMBG(自己血糖測定)/CGM(持続血糖測定)のデータをグラフ化するなど、患者にわかりやすく伝え、血糖コントロールの変化を実感してもらう役割を担う。',
    },
    {
      key: 'smbg-device-guidance-and-accuracy',
      name: '血糖自己測定器の指導と精度',
      summary:
        'SMBG機器は正しい穿刺・試験紙の取り扱い・清潔な指の状態などの手技指導が必要。院内の検査室測定値との間には、測定原理や検体の扱いの違いなどにより一定の差が生じうる(許容される精度の基準として国際規格ISO 15197がある)。',
    },
    {
      key: 'diabetes-complication-tests',
      name: '糖尿病合併症の検査(尿アルブミン・eGFR・脂質)',
      summary:
        '糖尿病合併症のスクリーニングとして、尿中微量アルブミン(早期腎症の指標)、eGFR(腎機能)、脂質検査(動脈硬化リスク評価)を定期的にモニタリングする。',
    },
  ],

  units: [
    // ══════════════════════════════════════════════════════════════
    // u1: 23-A(感染制御ICT/AST)
    // ══════════════════════════════════════════════════════════════
    {
      unitId: 'q23-team-medicine-u1',
      title: 'MRSAが検出された。まず何をする?',
      requestLine: '培養検査でMRSAが検出された。ICTへの報告と検査室の役割を整理する',
      beats: [
        {
          id: 'q23-u1-d0',
          type: 'dialogue',
          xp: 5,
          title: '培養結果の報告',
          backgroundId: 'labhall',
          lines: [
            { speaker: '実習生', text: 'この患者さんの培養、MRSAが検出されています。この後どうすればいいですか?' },
            { speaker: '技師', text: 'まずICT・ASTのラウンドと、検査室がそこでどんな役割を持つかを確認しよう。' },
            {
              speaker: '技師',
              text: 'ラウンド同行の役割と検査データの活用、アンチバイオグラムの作成、そして耐性菌検出時の報告フロー、教科書で確認して。',
            },
            { speaker: '技師', text: 'そのうえで、この結果をどう扱うか一緒に考えよう。' },
          ],
        },
        {
          id: 'q23-u1-problem',
          type: 'problem',
          xp: 5,
        },
        {
          id: 'q23-u1-lec',
          type: 'lecture',
          xp: 10,
          body:
            '感染制御チーム(ICT)や抗菌薬適正使用支援チーム(AST)のラウンドには、検査室のスタッフも同行します。培養・薬剤感受性検査の結果はもちろん、PCT(プロカルシトニン、細菌感染で上昇しやすい)、プレセプシン(敗血症の早期診断マーカーだが、腎機能低下があると偽高値になりやすい)、β-Dグルカン(深在性真菌症のスクリーニングに用いるが、グルカンを含む医療材料などで偽陽性が生じることがある)といった検査データも、ラウンドでの判断材料として活用されます。\n\n施設内でどのような菌が検出され、どの薬剤に感受性があるかを集計した一覧表をアンチバイオグラムと呼びます。原因菌がまだ判明していない段階での経験的治療(エンピリック治療)における抗菌薬選択の参考資料となり、AST活動の基礎データにもなります。\n\nMRSAや多剤耐性緑膿菌のような重要な耐性菌が検出された場合は、通常の検査結果報告の経路とは別に、ICTへ迅速に報告する体制が必要です。この報告の具体的な手順は施設によって異なります。',
          bridge:
            '教科書で、ICT/ASTラウンドへの同行と検査室の役割、アンチバイオグラムの作成と抗菌薬適正使用、そして耐性菌検出時の報告フローの3つを確認し、それぞれキーワードを入力してください。',
        },
        {
          id: 'q23-u1-inv-round',
          type: 'investigate',
          xp: 15,
          mode: 'textbook',
          required: true,
          purpose: 'ICT/ASTのラウンドで検査室がどんな役割を果たしているのかを確認する',
          howTo: '教科書・配布資料で、ICT/ASTラウンドへの同行と検査室の役割について正しい記述を確認する。',
          clueKey: 'ict-round-and-lab-role',
          demoHint: 'モック正解例: ICT/ASTのラウンドに検査室が同行し培養・薬剤感受性等の検査データを提供/PCT・プレセプシン・β-Dグルカンも活用される',
          choices: [
            {
              label: 'ICT(感染制御チーム)・AST(抗菌薬適正使用支援チーム)のラウンドに検査室が同行し、培養・薬剤感受性結果などの検査データを提供する',
              correct: true,
            },
            {
              label: 'PCT(細菌感染で上昇しやすい)、プレセプシン(敗血症早期診断マーカー、腎機能低下で偽高値になりやすい)、β-Dグルカン(深在性真菌症のスクリーニング)などの検査データも活用される',
              correct: true,
            },
            { label: 'ICT・ASTのラウンドに検査室のスタッフが関わることは一切ない', correct: false },
            { label: 'プレセプシンは腎機能の影響を全く受けない検査項目である', correct: false },
          ],
        },
        {
          id: 'q23-u1-inv-antibiogram',
          type: 'investigate',
          xp: 15,
          mode: 'textbook',
          required: true,
          purpose: 'アンチバイオグラムが抗菌薬適正使用の中でどんな役割を持つのかを確認する',
          howTo: '教科書・配布資料で、アンチバイオグラムの作成と抗菌薬適正使用について正しい記述を確認する。',
          clueKey: 'antibiogram-and-antimicrobial-stewardship',
          demoHint: 'モック正解例: アンチバイオグラムは施設内の分離菌の薬剤感受性パターンを集計した一覧表/エンピリック治療の抗菌薬選択の参考資料になる',
          choices: [
            {
              label: 'アンチバイオグラムは施設内で分離された菌の薬剤感受性パターンを集計した一覧表である',
              correct: true,
            },
            {
              label: '原因菌がまだ判明していない段階での経験的治療(エンピリック治療)における抗菌薬選択の参考資料となる',
              correct: true,
            },
            { label: 'アンチバイオグラムは患者1人ごとの感受性結果のみを指す言葉である', correct: false },
            { label: 'アンチバイオグラムは抗菌薬の選択には一切関係がない資料である', correct: false },
          ],
        },
        {
          id: 'q23-u1-inv-reporting',
          type: 'investigate',
          xp: 15,
          mode: 'textbook',
          required: true,
          purpose: '今回のMRSA検出のように、重要な耐性菌が検出されたときの報告のしかたを確認する',
          howTo: '教科書・配布資料で、耐性菌検出時の報告フローについて正しい記述を確認する。',
          clueKey: 'resistant-organism-reporting-flow',
          demoHint: 'モック正解例: MRSA等の重要な耐性菌検出時は通常の報告経路とは別にICTへ迅速に報告する体制が必要(◆施設差)',
          choices: [
            {
              label: 'MRSAや多剤耐性緑膿菌などの重要な耐性菌が検出された場合は、通常の検査結果報告の経路とは別に、ICTへ迅速に報告する体制が必要である',
              correct: true,
            },
            {
              label: 'この報告の具体的な手順は施設によって異なる',
              correct: true,
            },
            { label: '耐性菌が検出されても、通常の結果報告以外に特別な対応は一切不要である', correct: false },
            { label: '耐性菌の報告手順は全国どの施設でも完全に同一である', correct: false },
          ],
        },
        {
          id: 'q23-u1-res1',
          type: 'resolve',
          title: '判断',
          xp: 15,
          prompt: 'MRSAの検出結果を前に、まずどう考える?',
          requiredClueKeys: ['ict-round-and-lab-role'],
          choices: [
            {
              label: '通常の結果報告に加えて、ICTへの迅速な報告が必要な重要な耐性菌である可能性を踏まえ、自施設の報告手順を確認する',
              correct: true,
              feedback: '重要な耐性菌の検出は通常の報告経路だけで完結しない場合があることを意識する姿勢が大切です。',
            },
            {
              label: '通常の検査結果報告と同じ扱いでよいと判断し、特に何もしない',
              correct: false,
              feedback: '重要な耐性菌の検出は、通常の報告だけでは不十分な場合があります。',
            },
            {
              label: '自分の判断だけでICTに直接連絡し、指導者への確認は省略する',
              correct: false,
              feedback: '実習生の立場では、まず指導者に確認してから動くことが大切です。',
            },
          ],
        },
        {
          id: 'q23-u1-res2',
          type: 'resolve',
          title: '報告',
          xp: 15,
          prompt: 'では、この結果を最終的にどう扱う?',
          requiredClueKeys: [
            'ict-round-and-lab-role',
            'antibiogram-and-antimicrobial-stewardship',
            'resistant-organism-reporting-flow',
          ],
          choices: [
            {
              label: '通常の検査結果報告に加えて、自施設の手順に従いICTへ耐性菌検出を報告する。あわせて、この結果が施設のアンチバイオグラム作成やICT/ASTラウンドでの検討材料になることも理解しておく',
              correct: true,
              feedback: '通常報告とICTへの報告経路の両方、そして検査データがチーム医療にどう活かされるかまで理解しておくことが望ましい対応です。',
            },
            {
              label: '通常の検査結果報告のみを行い、ICTへの報告は行わない',
              correct: false,
              feedback: '重要な耐性菌の検出時は、通常報告に加えてICTへの報告経路を確認する必要があります。',
            },
            {
              label: 'アンチバイオグラムやラウンドとの関連には触れず、報告だけで完結させる',
              correct: false,
              feedback: '検査データがチーム医療の中でどう活用されるかを理解することも実習の学びとして重要です。',
            },
          ],
        },
        {
          id: 'q23-u1-drill',
          type: 'drill',
          xp: 20,
          questions: [
            {
              id: 'q23-u1-q1',
              format: 'mcq',
              prompt: '敗血症の早期診断マーカーとして知られ、腎機能低下があると偽高値になりやすい検査項目はどれか。',
              choices: [
                { label: 'プレセプシン', correct: true },
                { label: 'β-Dグルカン', correct: false },
                { label: 'アンチバイオグラム', correct: false },
                { label: 'HbA1c', correct: false },
              ],
              explanation: 'プレセプシンは敗血症の早期診断マーカーですが、腎機能低下があると偽高値になりやすい点に注意が必要です。',
            },
            {
              id: 'q23-u1-q2',
              format: 'mcq',
              prompt: 'ICT/ASTラウンドで活用される検査データに関する記述として正しいものはどれか(複数選択可)。',
              choices: [
                { label: 'PCTは細菌感染で上昇しやすい', correct: true },
                { label: 'β-Dグルカンは深在性真菌症のスクリーニングに用いる', correct: true },
                { label: 'ICT/ASTラウンドに検査室のスタッフが関わることはない', correct: false },
                { label: 'これらの検査データはラウンドでの判断に一切使われない', correct: false },
              ],
              explanation: 'PCT・プレセプシン・β-Dグルカンなどの検査データはICT/ASTラウンドでの判断材料として活用されます。',
            },
            {
              id: 'q23-u1-q3',
              format: 'mcq',
              prompt: 'アンチバイオグラムの説明として最も適切なのは?',
              choices: [
                { label: '施設内で分離された菌の薬剤感受性パターンを集計した一覧表', correct: true },
                { label: '特定の1患者だけの感受性結果', correct: false },
                { label: '抗菌薬の副作用を記録した文書', correct: false },
                { label: '培養検査の依頼書', correct: false },
              ],
              explanation: 'アンチバイオグラムは施設全体の感受性パターンを集計したもので、エンピリック治療の参考資料になります。',
            },
            {
              id: 'q23-u1-q4',
              format: 'mcq',
              prompt: '重要な耐性菌が検出されたときの対応として正しいものはどれか(複数選択可)。',
              choices: [
                { label: '通常の検査結果報告の経路とは別に、ICTへ迅速に報告する体制が必要である', correct: true },
                { label: 'この報告手順は施設によって異なる', correct: true },
                { label: '通常の結果報告以外の対応は一切不要である', correct: false },
                { label: '報告手順は全国どの施設でも完全に同一である', correct: false },
              ],
              explanation: '重要な耐性菌の検出時は、通常報告に加えてICTへの迅速な報告経路(施設ごとに異なる)が必要です。',
            },
            {
              id: 'q23-u1-q5',
              format: 'mcq',
              prompt: 'MRSA検出という結果を前にした対応として最も優先すべきは?',
              choices: [
                { label: '通常の結果報告に加え、自施設のICTへの報告手順を確認すること', correct: true },
                { label: '通常の結果報告のみで完結させること', correct: false },
                { label: '指導者に確認せず自分の判断でICTに直接連絡すること', correct: false },
                { label: '報告を後回しにして他の業務を優先すること', correct: false },
              ],
              explanation: '通常報告とICTへの報告経路の両方を意識し、自施設の手順に従うことが求められます。',
            },
          ],
        },
      ],
    },

    // ══════════════════════════════════════════════════════════════
    // u2: 23-B(栄養サポートNST) — 骨子案付録B優先#10のシナリオ
    // ══════════════════════════════════════════════════════════════
    {
      unitId: 'q23-team-medicine-u2',
      title: 'Albは低いままだが栄養は改善している',
      requestLine: '栄養介入から数日経ったが、Albの値は変わらない。何を見ればよいか整理する',
      beats: [
        {
          id: 'q23-u2-d0',
          type: 'dialogue',
          xp: 5,
          title: '変わらないAlb値',
          backgroundId: 'ward',
          lines: [
            { speaker: '実習生', text: 'この患者さん、栄養介入が始まって数日経つのに、Albの値がまったく変わっていません…' },
            { speaker: '技師', text: 'それはAlbの性質を考えると自然なことなんだ。栄養アセスメント蛋白について確認しよう。' },
            {
              speaker: '技師',
              text: 'NSTにおける検査値の役割と栄養アセスメント蛋白の半減期の違い、微量元素の欠乏症状、そしてリフィーディング症候群、教科書で確認して。',
            },
            { speaker: '技師', text: 'そのうえで、この患者さんの栄養状態をどう評価するか一緒に考えよう。' },
          ],
        },
        {
          id: 'q23-u2-problem',
          type: 'problem',
          xp: 5,
        },
        {
          id: 'q23-u2-lec',
          type: 'lecture',
          xp: 10,
          body:
            '栄養サポートチーム(NST)では、身体所見だけでなく検査値を組み合わせて栄養状態を客観的に評価します。栄養状態の指標として使われる蛋白質には、アルブミン・プレアルブミン(トランスサイレチン)・トランスフェリン・RBP(レチノール結合蛋白)があり、それぞれ体内での半減期が異なります。アルブミンの半減期は約3週間と長いのに対し、プレアルブミンは約2日、トランスフェリンは約1週間、RBPは約12〜16時間と短く、これらは総称してRTP(Rapid Turnover Protein、動的蛋白)と呼ばれます。半減期が短い蛋白ほど、直近の栄養状態の変化(栄養介入の効果)を短期間で鋭敏に反映します。アルブミンは半減期が長いため、栄養介入を始めてもすぐには値に反映されず、改善が実感しにくいことがあります。\n\n栄養管理では、蛋白質だけでなく微量元素の状態にも注意が必要です。亜鉛(Zn)が欠乏すると味覚障害・皮膚炎・創傷治癒の遅延が、銅(Cu)が欠乏すると貧血・好中球減少が、セレン(Se)が欠乏すると心筋症・骨格筋障害が現れることがあります。特に長期の経腸栄養や中心静脈栄養では、これらの微量元素の欠乏に注意が必要です。\n\nまた、慢性的に栄養状態が悪かった患者に急速に栄養投与を再開すると、インスリン分泌が急増し、リン・カリウム・マグネシウムが細胞内に急速に取り込まれて血清中のこれらの電解質が急激に低下することがあります。これをリフィーディング症候群と呼び、特にリンの低下が中心的な指標です。重篤な場合は心不全・不整脈・呼吸不全を招くため、電解質(特にリン)を中心としたモニタリングが重要です。',
          bridge:
            '教科書で、NSTにおける検査値の役割と栄養アセスメント蛋白の半減期の違い、微量元素(Zn・Cu・Se)と欠乏症状、そしてリフィーディング症候群の3つを確認し、それぞれキーワードを入力してください。',
        },
        {
          id: 'q23-u2-inv-rtp',
          type: 'investigate',
          xp: 15,
          mode: 'textbook',
          required: true,
          purpose: '今回のように「Albが変わらない」ケースを理解するため、栄養アセスメント蛋白の性質を確認する',
          howTo: '教科書・配布資料で、NSTにおける検査値の役割と栄養アセスメント蛋白の半減期の違いについて正しい記述を確認する。',
          clueKey: 'nst-role-of-lab-data',
          demoHint: 'モック正解例: アルブミンは半減期約3週間で変化に鈍感/プレアルブミン・トランスフェリン・RBPは半減期が短くRTPと呼ばれ短期変化を鋭敏に反映',
          choices: [
            {
              label: 'アルブミンの半減期は約3週間と長く、栄養介入の効果がすぐには値に反映されにくい',
              correct: true,
            },
            {
              label: 'プレアルブミン(約2日)・トランスフェリン(約1週間)・RBP(約12〜16時間)は半減期が短く、RTP(動的蛋白)と呼ばれ短期的な栄養状態の変化を鋭敏に反映する',
              correct: true,
            },
            { label: 'アルブミンとプレアルブミンは半減期が全く同じで、反映する期間に違いはない', correct: false },
            { label: '栄養アセスメント蛋白はアルブミンただ1種類しか存在しない', correct: false },
          ],
        },
        {
          id: 'q23-u2-inv-trace',
          type: 'investigate',
          xp: 15,
          mode: 'textbook',
          required: true,
          purpose: '蛋白質以外に栄養管理で注意すべき項目を確認する',
          howTo: '教科書・配布資料で、微量元素(Zn・Cu・Se)と欠乏症状について正しい記述を確認する。',
          clueKey: 'trace-element-deficiency',
          demoHint: 'モック正解例: 亜鉛欠乏は味覚障害・皮膚炎・創傷治癒遅延/銅欠乏は貧血・好中球減少/セレン欠乏は心筋症・骨格筋障害',
          choices: [
            {
              label: '亜鉛(Zn)欠乏では味覚障害・皮膚炎・創傷治癒の遅延が現れることがある',
              correct: true,
            },
            {
              label: '銅(Cu)欠乏では貧血・好中球減少、セレン(Se)欠乏では心筋症・骨格筋障害が現れることがある',
              correct: true,
            },
            { label: '微量元素の欠乏は、長期の栄養療法であっても一切問題にならない', correct: false },
            { label: '亜鉛欠乏と銅欠乏は、まったく同じ症状を引き起こす', correct: false },
          ],
        },
        {
          id: 'q23-u2-inv-refeeding',
          type: 'investigate',
          xp: 15,
          mode: 'textbook',
          required: true,
          purpose: '栄養介入を始める際に注意すべき合併症を確認する',
          howTo: '教科書・配布資料で、電解質・腎機能とリフィーディング症候群について正しい記述を確認する。',
          clueKey: 'refeeding-syndrome',
          demoHint: 'モック正解例: 慢性的な低栄養患者への急速な栄養再開でリン・カリウム・マグネシウムが低下する(リフィーディング症候群)/重篤な場合は心不全・不整脈等を招く',
          choices: [
            {
              label: '慢性的な低栄養状態の患者に急速に栄養投与を再開すると、リン・カリウム・マグネシウムが血清中で急激に低下することがある(リフィーディング症候群)',
              correct: true,
            },
            {
              label: 'リフィーディング症候群が重篤な場合、心不全・不整脈・呼吸不全を招くことがあり、電解質(特にリン)を中心としたモニタリングが重要である',
              correct: true,
            },
            { label: 'リフィーディング症候群は、栄養状態が良好な患者にのみ起こる現象である', correct: false },
            { label: '急速な栄養投与再開は、電解質バランスに一切影響を与えない', correct: false },
          ],
        },
        {
          id: 'q23-u2-res1',
          type: 'resolve',
          title: '判断',
          xp: 15,
          prompt: 'Albの値が変わらないことに気づいた。まずどう考える?',
          requiredClueKeys: ['nst-role-of-lab-data'],
          choices: [
            {
              label: 'アルブミンは半減期が長く短期的な変化を反映しにくいことを踏まえ、半減期の短いプレアルブミンなどRTPの値も確認する',
              correct: true,
              feedback: 'アルブミンの半減期の長さを理解し、より鋭敏な指標を併せて確認する視点が大切です。',
            },
            {
              label: 'Albが変わらないのだから栄養介入の効果は出ていないと判断する',
              correct: false,
              feedback: 'アルブミンの半減期の長さを考慮せずに判断するのは早計です。',
            },
            {
              label: 'Alb以外の指標は確認せず、経過を見るだけにする',
              correct: false,
              feedback: 'より半減期の短い指標を確認することで、より早く栄養状態の変化を捉えられます。',
            },
          ],
        },
        {
          id: 'q23-u2-res2',
          type: 'resolve',
          title: '報告',
          xp: 15,
          prompt: 'では、NSTへの報告として最終的にどうまとめる?',
          requiredClueKeys: ['nst-role-of-lab-data', 'trace-element-deficiency', 'refeeding-syndrome'],
          choices: [
            {
              label: 'アルブミンの半減期の長さから、値がすぐに変化しないのは想定内であることを説明したうえで、プレアルブミンなどRTPの推移を確認する。あわせて微量元素の欠乏やリフィーディング症候群の徴候がないかも継続的にモニタリングする必要があることを報告する',
              correct: true,
              feedback: 'アルブミンの限界を説明したうえで、より鋭敏な指標と合併症モニタリングまで含めて報告することが望ましい対応です。',
            },
            {
              label: 'Albの値だけを報告し、栄養介入の効果はないと結論づける',
              correct: false,
              feedback: 'アルブミンの半減期を考慮しない結論は、栄養介入の効果を見誤るおそれがあります。',
            },
            {
              label: '微量元素やリフィーディング症候群のリスクには触れず、蛋白質の話だけで完結させる',
              correct: false,
              feedback: '栄養管理では蛋白質以外の項目もあわせてモニタリングすることが重要です。',
            },
          ],
        },
        {
          id: 'q23-u2-drill',
          type: 'drill',
          xp: 20,
          questions: [
            {
              id: 'q23-u2-q1',
              format: 'mcq',
              prompt: '半減期が最も短く、直近の栄養状態の変化を最も鋭敏に反映する栄養アセスメント蛋白はどれか。',
              choices: [
                { label: 'RBP(レチノール結合蛋白)', correct: true },
                { label: 'アルブミン', correct: false },
                { label: 'トランスフェリン', correct: false },
                { label: 'プレアルブミン', correct: false },
              ],
              explanation: 'RBPは半減期が約12〜16時間と最も短く、直近の栄養状態の変化を最も鋭敏に反映します。',
            },
            {
              id: 'q23-u2-q2',
              format: 'mcq',
              prompt: '栄養アセスメント蛋白と半減期に関する記述として正しいものはどれか(複数選択可)。',
              choices: [
                { label: 'アルブミンの半減期は約3週間である', correct: true },
                { label: 'プレアルブミン・トランスフェリン・RBPはRTP(動的蛋白)と呼ばれる', correct: true },
                { label: 'アルブミンとプレアルブミンの半減期は同じである', correct: false },
                { label: 'RTPはアルブミンより変化を反映するのが遅い', correct: false },
              ],
              explanation: 'アルブミンは半減期が長く、RTP(プレアルブミン等)は半減期が短いため短期変化を鋭敏に反映します。',
            },
            {
              id: 'q23-u2-q3',
              format: 'mcq',
              prompt: '味覚障害・皮膚炎・創傷治癒の遅延を引き起こす微量元素欠乏はどれか。',
              choices: [
                { label: '亜鉛(Zn)欠乏', correct: true },
                { label: '銅(Cu)欠乏', correct: false },
                { label: 'セレン(Se)欠乏', correct: false },
                { label: '鉄(Fe)欠乏', correct: false },
              ],
              explanation: '亜鉛欠乏では味覚障害・皮膚炎・創傷治癒の遅延が代表的な症状です。',
            },
            {
              id: 'q23-u2-q4',
              format: 'mcq',
              prompt: 'リフィーディング症候群に関する記述として正しいものはどれか(複数選択可)。',
              choices: [
                { label: '慢性的な低栄養患者への急速な栄養投与再開で起こりやすい', correct: true },
                { label: 'リン・カリウム・マグネシウムが血清中で急激に低下することがある', correct: true },
                { label: '栄養状態が良好な患者にのみ起こる現象である', correct: false },
                { label: '電解質バランスには一切影響しない', correct: false },
              ],
              explanation: 'リフィーディング症候群は慢性的な低栄養患者での急速な栄養再開時に、電解質の急激な低下を伴う病態です。',
            },
            {
              id: 'q23-u2-q5',
              format: 'mcq',
              prompt: 'Albの値が変わらないことへの対応として最も優先すべきは?',
              choices: [
                { label: 'アルブミンの半減期の長さを踏まえ、半減期の短いRTP(プレアルブミン等)の推移も確認すること', correct: true },
                { label: 'Albが変わらないので栄養介入の効果はないと結論づけること', correct: false },
                { label: 'Alb以外の指標は一切確認しないこと', correct: false },
                { label: '経過観察をせず報告を保留すること', correct: false },
              ],
              explanation: 'アルブミンの限界を理解し、より鋭敏な指標を併せて確認することが求められます。',
            },
          ],
        },
      ],
    },

    // ══════════════════════════════════════════════════════════════
    // u3: 23-C(糖尿病療養指導)
    // ══════════════════════════════════════════════════════════════
    {
      unitId: 'q23-team-medicine-u3',
      title: '血糖自己測定器の値と検査室の値が違うと相談された',
      requestLine: '患者さんから、家庭のSMBG値と病院の血糖値が違うと相談された。療養指導における検査データの扱いを整理する',
      beats: [
        {
          id: 'q23-u3-d0',
          type: 'dialogue',
          xp: 5,
          title: '患者さんからの相談',
          backgroundId: 'ward',
          lines: [
            { speaker: '実習生', text: '患者さんから「家で測ってる血糖値と、病院で測った値が違う」って相談されました…' },
            { speaker: '技師', text: 'それは糖尿病療養指導でよくある相談だね。まず療養指導での検査技師の役割を確認しよう。' },
            {
              speaker: '技師',
              text: '療養指導における検査技師の役割とデータの見せ方、血糖自己測定器の指導と精度、そして合併症の検査、教科書で確認して。',
            },
            { speaker: '技師', text: 'そのうえで、この相談にどう答えるか一緒に考えよう。' },
          ],
        },
        {
          id: 'q23-u3-problem',
          type: 'problem',
          xp: 5,
        },
        {
          id: 'q23-u3-lec',
          type: 'lecture',
          xp: 10,
          body:
            '糖尿病の療養指導において、検査技師はHbA1c・グリコアルブミン・SMBG(自己血糖測定)/CGM(持続血糖測定)のデータをグラフ化するなどして患者にわかりやすく伝え、血糖コントロールの変化を実感してもらう役割を担います。数値の羅列だけでは患者に伝わりにくいため、見せ方の工夫が指導の質を左右します。\n\nSMBG機器の指導では、正しい穿刺の仕方・試験紙の取り扱い・清潔な指の状態を保つことなど、手技に関する指導が欠かせません。また、SMBG機器の値と院内の検査室での測定値との間には、測定原理や検体の扱いの違いなどにより一定の差が生じることがあり、これは許容される精度の基準(国際規格ISO 15197など)の範囲内であれば、機器の故障や患者の測定ミスとは限りません。\n\n療養指導では、血糖コントロールの状態だけでなく、合併症のスクリーニングも重要です。尿中微量アルブミンは早期腎症の指標、eGFRは腎機能、脂質検査は動脈硬化リスクの評価に用いられ、これらを定期的にモニタリングすることが糖尿病の療養指導に含まれます。',
          bridge:
            '教科書で、療養指導における検査技師の役割とデータの見せ方、血糖自己測定器の指導と精度、そして糖尿病合併症の検査(尿アルブミン・eGFR・脂質)の3つを確認し、それぞれキーワードを入力してください。',
        },
        {
          id: 'q23-u3-inv-role',
          type: 'investigate',
          xp: 15,
          mode: 'textbook',
          required: true,
          purpose: '糖尿病療養指導の中で検査技師がどんな役割を果たしているのかを確認する',
          howTo: '教科書・配布資料で、療養指導における検査技師の役割とデータの見せ方について正しい記述を確認する。',
          clueKey: 'diabetes-education-role-and-data-presentation',
          demoHint: 'モック正解例: 検査技師はHbA1c・GA・SMBG/CGMのデータをグラフ化するなどして患者にわかりやすく伝える役割を担う',
          choices: [
            {
              label: '検査技師は糖尿病療養指導において、HbA1c・グリコアルブミン・SMBG/CGMのデータをグラフ化するなど、患者にわかりやすく伝える役割を担う',
              correct: true,
            },
            {
              label: '数値の羅列だけでは患者に伝わりにくいため、見せ方の工夫が指導の質を左右する',
              correct: true,
            },
            { label: '糖尿病療養指導は医師のみが行うもので、検査技師が関わることは一切ない', correct: false },
            { label: '患者への説明は数値をそのまま羅列すれば十分であり、見せ方の工夫は不要である', correct: false },
          ],
        },
        {
          id: 'q23-u3-inv-smbg',
          type: 'investigate',
          xp: 15,
          mode: 'textbook',
          required: true,
          purpose: '今回の相談(SMBGと院内測定値の差)を理解するため、SMBG機器の指導と精度について確認する',
          howTo: '教科書・配布資料で、血糖自己測定器の指導と精度について正しい記述を確認する。',
          clueKey: 'smbg-device-guidance-and-accuracy',
          demoHint: 'モック正解例: SMBG機器は正しい穿刺・試験紙の取り扱い等の手技指導が必要/院内測定値との間には一定の差が生じうる(精度基準の範囲内なら故障とは限らない)',
          choices: [
            {
              label: 'SMBG機器の指導では、正しい穿刺の仕方・試験紙の取り扱い・清潔な指の状態を保つことなど、手技に関する指導が欠かせない',
              correct: true,
            },
            {
              label: 'SMBG機器の値と院内の検査室測定値との間には、測定原理や検体の扱いの違いなどにより一定の差が生じることがある',
              correct: true,
            },
            { label: 'SMBG機器の値と院内測定値に差が出ることは、常に機器の故障を意味する', correct: false },
            { label: 'SMBG機器の使用に手技の指導は一切必要ない', correct: false },
          ],
        },
        {
          id: 'q23-u3-inv-complication',
          type: 'investigate',
          xp: 15,
          mode: 'textbook',
          required: true,
          purpose: '血糖コントロールの相談だけでなく、あわせて確認すべき合併症の検査を確認する',
          howTo: '教科書・配布資料で、糖尿病合併症の検査(尿アルブミン・eGFR・脂質)について正しい記述を確認する。',
          clueKey: 'diabetes-complication-tests',
          demoHint: 'モック正解例: 尿中微量アルブミンは早期腎症の指標/eGFRは腎機能/脂質検査は動脈硬化リスク評価に用い定期的にモニタリングする',
          choices: [
            {
              label: '尿中微量アルブミンは早期腎症の指標、eGFRは腎機能の評価に用いられる',
              correct: true,
            },
            {
              label: '脂質検査は動脈硬化リスクの評価に用いられ、これらを定期的にモニタリングすることが糖尿病の療養指導に含まれる',
              correct: true,
            },
            { label: '糖尿病の療養指導では血糖コントロールの評価のみを行い、合併症の検査は一切関係がない', correct: false },
            { label: '尿中微量アルブミンは腎症とは無関係な検査項目である', correct: false },
          ],
        },
        {
          id: 'q23-u3-res1',
          type: 'resolve',
          title: '判断',
          xp: 15,
          prompt: '「SMBG値と病院の値が違う」という相談を受けた。まずどう考える?',
          requiredClueKeys: ['smbg-device-guidance-and-accuracy'],
          choices: [
            {
              label: '測定原理や検体の扱いの違いなどにより一定の差が生じうることを踏まえ、差が許容範囲内かどうかや測定手技に問題がないかを確認する',
              correct: true,
              feedback: '差が出ること自体は珍しくないため、まず条件や手技を確認する姿勢が大切です。',
            },
            {
              label: 'SMBG機器が故障していると即座に判断する',
              correct: false,
              feedback: '測定条件の違いによる差の可能性を確認せずに故障と決めつけるのは避けます。',
            },
            {
              label: '院内の値だけが正しいと決めつけ、患者の測定手技を確認しない',
              correct: false,
              feedback: 'どちらが正しいと決めつける前に、手技や条件を確認することが必要です。',
            },
          ],
        },
        {
          id: 'q23-u3-res2',
          type: 'resolve',
          title: '報告',
          xp: 15,
          prompt: 'では、この患者さんに最終的にどう説明する?',
          requiredClueKeys: [
            'diabetes-education-role-and-data-presentation',
            'smbg-device-guidance-and-accuracy',
            'diabetes-complication-tests',
          ],
          choices: [
            {
              label: 'SMBGと院内測定で差が生じうる理由を説明し、測定手技も確認したうえで、HbA1cなどのデータをグラフ化するなどしてわかりやすく血糖コントロールの変化を伝える。あわせて合併症スクリーニングの検査についても継続して確認していくことを伝える',
              correct: true,
              feedback: '差が生じる理由の説明、手技確認、わかりやすいデータの見せ方、合併症検査の継続確認までを一連の対応とすることが望ましい説明です。',
            },
            {
              label: '差の理由を説明せず、院内の値をそのまま信じるよう伝える',
              correct: false,
              feedback: '理由を説明せずに一方の値だけを信じるよう伝えるのは不十分な対応です。',
            },
            {
              label: '合併症の検査の話には触れず、血糖値の差の説明だけで済ませる',
              correct: false,
              feedback: '療養指導では血糖コントロールに加え合併症検査についても継続的に伝えることが望ましいです。',
            },
          ],
        },
        {
          id: 'q23-u3-drill',
          type: 'drill',
          xp: 20,
          questions: [
            {
              id: 'q23-u3-q1',
              format: 'mcq',
              prompt: '糖尿病療養指導における検査技師の役割として最も適切なのは?',
              choices: [
                { label: 'HbA1c・GA・SMBG/CGMのデータをグラフ化するなどして患者にわかりやすく伝えること', correct: true },
                { label: '数値をそのまま羅列して伝えるだけでよい', correct: false },
                { label: '療養指導には一切関わらない', correct: false },
                { label: '投薬の指示のみを行う', correct: false },
              ],
              explanation: '検査技師はデータをわかりやすく提示し、患者の理解と実感を助ける役割を担います。',
            },
            {
              id: 'q23-u3-q2',
              format: 'mcq',
              prompt: 'SMBG機器の指導・精度に関する記述として正しいものはどれか(複数選択可)。',
              choices: [
                { label: '正しい穿刺の仕方や試験紙の取り扱いなど、手技に関する指導が必要である', correct: true },
                { label: '院内測定値との間には測定原理等の違いにより一定の差が生じうる', correct: true },
                { label: '差が出ることは常に機器の故障を意味する', correct: false },
                { label: 'SMBG機器の使用に手技指導は不要である', correct: false },
              ],
              explanation: 'SMBG機器は手技指導が必要で、院内測定値との差は測定条件の違いによることもあります。',
            },
            {
              id: 'q23-u3-q3',
              format: 'mcq',
              prompt: '糖尿病の早期腎症の指標として用いられる検査はどれか。',
              choices: [
                { label: '尿中微量アルブミン', correct: true },
                { label: '脂質検査', correct: false },
                { label: 'HbA1c', correct: false },
                { label: 'CRP', correct: false },
              ],
              explanation: '尿中微量アルブミンは糖尿病性腎症の早期指標として用いられます。',
            },
            {
              id: 'q23-u3-q4',
              format: 'mcq',
              prompt: '糖尿病合併症のスクリーニングに関する記述として正しいものはどれか(複数選択可)。',
              choices: [
                { label: 'eGFRは腎機能の評価に用いられる', correct: true },
                { label: '脂質検査は動脈硬化リスクの評価に用いられる', correct: true },
                { label: '合併症検査は血糖コントロールの評価とは無関係で行う意味がない', correct: false },
                { label: '尿中微量アルブミンは腎症と無関係な項目である', correct: false },
              ],
              explanation: 'eGFR・脂質検査・尿中微量アルブミンはいずれも糖尿病合併症のスクリーニングに用いられます。',
            },
            {
              id: 'q23-u3-q5',
              format: 'mcq',
              prompt: '「SMBG値と病院の値が違う」という相談への対応として最も優先すべきは?',
              choices: [
                { label: '差が生じうる理由と測定手技を確認したうえで、わかりやすく説明すること', correct: true },
                { label: '理由を説明せず、院内の値だけを信じるよう伝えること', correct: false },
                { label: 'SMBG機器が故障していると即座に判断すること', correct: false },
                { label: '相談には対応せず放置すること', correct: false },
              ],
              explanation: '差が生じる理由の説明と手技確認を踏まえたわかりやすい説明が求められます。',
            },
          ],
        },
      ],
    },
  ],
}
