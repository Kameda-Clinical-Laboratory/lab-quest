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
    {
      key: 'naf-heparin-effects',
      name: 'NaF・ヘパリンによる特殊な影響',
      summary:
        'NaFは解糖を阻止するが採血直後数時間は完全ではない。ヘパリンは蛋白分画でβ-γブリッジ様所見が出たり、一部の免疫測定を妨害することがある。',
    },
    {
      key: 'citrate-tdm-effects',
      name: 'クエン酸の希釈効果とTDMへの吸着',
      summary:
        'クエン酸ナトリウム管は液状の抗凝固剤のため希釈効果が生じる(特にHt高値検体で注意)。血清分離剤には薬物が吸着し、TDMの値に影響することがある。',
    },
    {
      key: 'serum-plasma-k-diff',
      name: '血清とヘパリン血漿でKが異なる理由',
      summary:
        '血清はフィブリノゲンが除去されており、凝固の過程で血小板からKが放出されるためヘパリン血漿よりK値が高くなりやすい(EDTA血漿のK偽高値とは別の話)。',
    },
    {
      key: 'plasma-rapid-report',
      name: 'ヘパリン血漿検体の迅速報告利点と施設差',
      summary:
        'ヘパリン血漿検体は凝固を待たずに遠心できるため迅速報告に向く。ただし採用する検体種(血清/ヘパリン血漿)は施設によって異なる。',
    },
    {
      key: 'draw-volume-shortage',
      name: '採血量不足の影響',
      summary:
        '既定量に満たない採血は抗凝固剤に対して血液が少なくなり、相対的な希釈効果が生じる。液状抗凝固剤(クエン酸など)を使う検査で特に問題になりやすい。',
    },
    {
      key: 'draw-volume-overfill',
      name: '過剰充填・混和不良の影響',
      summary:
        '血液を入れすぎると抗凝固効果が不十分になり凝固検体になることがある。転倒混和が不十分でも同様に微小凝固が生じうる。',
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

    // ══════════════════════════════════════════════════════════════
    // u3: 2-C-b〜e(ヘパリン・NaF・クエン酸・血清分離剤の特殊な影響)
    // ══════════════════════════════════════════════════════════════
    {
      unitId: 'bio-tubes-u3',
      title: '血糖の依頼にNaF管がなかった',
      requestLine: '血糖の依頼だが、届いた検体はNaF管ではなくプレーン管だった。このまま使えるか判断する',
      beats: [
        {
          id: 'bio-tubes-u3-d0',
          type: 'dialogue',
          xp: 5,
          title: '血糖の依頼票',
          backgroundId: 'labhall',
          lines: [
            { speaker: '実習生', text: '血糖の依頼なんですが、届いたのが普通のプレーン管でした…' },
            { speaker: '技師', text: 'NaF管じゃないんだ。時間が経つと数値がどうなるか、説明できる?' },
            {
              speaker: '技師',
              text: 'NaFの解糖阻止の仕組みと限界、それにヘパリン・クエン酸・血清分離剤の影響もあわせて教科書で確認して。',
            },
            { speaker: '技師', text: 'そのうえで、この検体をどう扱うか一緒に決めよう。' },
          ],
        },
        {
          id: 'bio-tubes-u3-problem',
          type: 'problem',
          xp: 5,
        },
        {
          id: 'bio-tubes-u3-lec',
          type: 'lecture',
          xp: 10,
          body:
            'NaF(フッ化ナトリウム)は解糖系の酵素を阻害することで血糖値の低下を防ぐために使われますが、採血直後数時間は完全には効果が現れず、その間はわずかに解糖が進むことがあります。プレーン管などNaFの入っていない管では、時間経過とともに血糖値が実際より低く出てしまいます。\n\nヘパリンは凝固を阻害する抗凝固剤ですが、蛋白分画検査でβ-γブリッジ様の所見が出たり、一部の免疫測定を妨害したりすることがあります。またクエン酸ナトリウム管は液状の抗凝固剤が入っているため、特にヘマトクリットが高い検体では血液が薄まる希釈効果に注意が必要です。\n\nさらに、血清分離剤には薬物が吸着する性質があり、TDM(薬物血中濃度モニタリング)の値に影響することがあります。このように、添加剤や分離剤の性質は検査項目ごとの適否に直結するため、目的に合った採血管を選ぶことが重要です。',
          bridge:
            '教科書で、NaF・ヘパリンの影響と、クエン酸・血清分離剤の影響の両方を確認し、それぞれキーワードを入力してください。',
        },
        {
          id: 'bio-tubes-u3-inv-naf-heparin',
          type: 'investigate',
          xp: 15,
          mode: 'textbook',
          required: true,
          purpose: 'NaF管でない検体で血糖を測るとどうなるか、またヘパリンの影響を確認する',
          howTo: '教科書・配布資料で、NaFの解糖阻止とヘパリンの影響について正しい記述を確認する。',
          clueKey: 'naf-heparin-effects',
          demoHint: 'モック正解例: NaFは採血直後数時間は完全ではない/ヘパリンはβ-γブリッジ様所見や免疫測定干渉を起こしうる',
          choices: [
            {
              label: 'NaF(フッ化ナトリウム)は解糖を阻止するが、採血直後数時間は完全には効果が現れない',
              correct: true,
            },
            {
              label: 'ヘパリンを使うと蛋白分画でβ-γブリッジ様の所見が出たり、一部の免疫測定を妨害することがある',
              correct: true,
            },
            { label: 'NaF管を使えば採血後どれだけ時間が経っても血糖値は一切変化しない', correct: false },
            { label: 'ヘパリンは免疫測定に一切影響しない', correct: false },
          ],
        },
        {
          id: 'bio-tubes-u3-inv-citrate-tdm',
          type: 'investigate',
          xp: 15,
          mode: 'textbook',
          required: true,
          purpose: 'クエン酸管や血清分離剤の性質による特殊な影響を確認する',
          howTo: '教科書・配布資料で、クエン酸の希釈効果とTDMへの吸着について正しい記述を確認する。',
          clueKey: 'citrate-tdm-effects',
          demoHint: 'モック正解例: クエン酸管はHt高値検体で希釈効果に注意/血清分離剤は薬物を吸着しTDMに影響しうる',
          choices: [
            {
              label:
                'クエン酸ナトリウム管は液状の抗凝固剤のため、ヘマトクリットが高い検体では希釈効果に注意が必要',
              correct: true,
            },
            {
              label: '血清分離剤に薬物が吸着し、TDM(薬物血中濃度モニタリング)の値に影響することがある',
              correct: true,
            },
            { label: 'クエン酸管の希釈効果は患者の状態に関わらず無視できるほど小さい', correct: false },
            { label: '血清分離剤は薬物濃度にまったく影響しない', correct: false },
          ],
        },
        {
          id: 'bio-tubes-u3-res1',
          type: 'resolve',
          title: '判断',
          xp: 15,
          prompt: '技師「血糖の依頼だけどNaF管を使っていない検体が届いた。まずどうする?」',
          requiredClueKeys: ['naf-heparin-effects'],
          choices: [
            {
              label: '採血からの経過時間・保存状況を確認し、必要なら遠心分離を急ぐか再採血を検討する',
              correct: true,
              feedback: 'NaF管でない場合、時間経過による解糖の影響を最小限にする対応が必要です。',
            },
            {
              label: 'そのまま数値通り報告する',
              correct: false,
              feedback: '解糖による偽低値の可能性を確認せずに報告するのは避けます。',
            },
            {
              label: '検体を破棄し、特に連絡はしない',
              correct: false,
              feedback: '記録や連絡を残さず廃棄するのは避け、手順に沿って対応します。',
            },
          ],
        },
        {
          id: 'bio-tubes-u3-res2',
          type: 'resolve',
          title: '報告',
          xp: 15,
          prompt: 'では、この検体の血糖値をどう扱う? 経過時間と自施設のルールを踏まえて考えて。',
          requiredClueKeys: ['naf-heparin-effects', 'citrate-tdm-effects'],
          choices: [
            {
              label:
                '経過時間による解糖の影響を踏まえ、自施設の許容基準に沿って報告・コメント付与・再採血のいずれかを判断する',
              correct: true,
              feedback: '施設ごとに許容できる経過時間や運用が異なるため、自施設の手順を優先します。',
            },
            {
              label: '管の種類に関わらず、そのまま数値通り報告する',
              correct: false,
              feedback: '解糖による偽低値の可能性を確認せずに報告するのは避けます。',
            },
            {
              label: '原因を追及せず、検体を黙って破棄する',
              correct: false,
              feedback: '記録や連絡を残さず廃棄するのは避け、手順に沿って対応します。',
            },
          ],
        },
        {
          id: 'bio-tubes-u3-drill',
          type: 'drill',
          xp: 20,
          questions: [
            {
              id: 'bio-tubes-u3-q1',
              format: 'mcq',
              prompt: 'NaF(フッ化ナトリウム)が血糖測定用の管に使われる理由は?',
              choices: [
                { label: '解糖(糖の分解)を阻止するため', correct: true },
                { label: '凝固を促進するため', correct: false },
                { label: '溶血を防ぐため', correct: false },
                { label: '検体の色を変えるため', correct: false },
              ],
              explanation: 'NaFは解糖系の酵素を阻害し、血糖値の低下を防ぎます。',
            },
            {
              id: 'bio-tubes-u3-q2',
              format: 'mcq',
              prompt: 'NaF・ヘパリンの影響に関する記述として正しいものはどれか(複数選択可)。',
              choices: [
                { label: 'NaFは採血直後数時間は解糖阻止の効果が完全には現れない', correct: true },
                { label: 'ヘパリンは蛋白分画でβ-γブリッジ様の所見が出ることがある', correct: true },
                { label: 'NaF管を使えば採血直後から一切解糖は進まない', correct: false },
                { label: 'ヘパリンは免疫測定に一切影響しない', correct: false },
              ],
              explanation: 'NaFの効果発現には時間がかかり、ヘパリンは蛋白分画や一部免疫測定に影響しえます。',
            },
            {
              id: 'bio-tubes-u3-q3',
              format: 'mcq',
              prompt: 'NaF管でない検体で血糖を依頼されたときの最初の行動として最も適切なのは?',
              choices: [
                { label: '採血からの経過時間・保存状況を確認する', correct: true },
                { label: 'そのまま数値通り報告する', correct: false },
                { label: '検体を破棄して連絡しない', correct: false },
                { label: '他の患者の結果と平均を取って評価する', correct: false },
              ],
              explanation: '経過時間による解糖の影響を確認するのが初動です。',
            },
            {
              id: 'bio-tubes-u3-q4',
              format: 'mcq',
              prompt: 'クエン酸管・血清分離剤の特殊な影響として正しいものはどれか(複数選択可)。',
              choices: [
                {
                  label: 'クエン酸ナトリウム管はヘマトクリットが高い検体で希釈効果に注意が必要',
                  correct: true,
                },
                { label: '血清分離剤に薬物が吸着し、TDMの値に影響することがある', correct: true },
                { label: 'クエン酸管の希釈効果は患者の状態に関わらず無視できる', correct: false },
                { label: '血清分離剤は薬物濃度にまったく影響しない', correct: false },
              ],
              explanation: 'クエン酸管の希釈効果とTDMへの吸着は、いずれも添加剤・分離剤の性質による特殊な影響です。',
            },
            {
              id: 'bio-tubes-u3-q5',
              format: 'mcq',
              prompt: '添加剤の影響が疑われる検体の扱いを判断するとき、最も優先すべきは?',
              choices: [
                { label: '自施設の許容基準・報告手順に従うこと', correct: true },
                { label: '検査者の主観的な印象だけで判断すること', correct: false },
                { label: '他の患者の結果との平均で判断すること', correct: false },
                { label: '実習生の判断のみで決めること', correct: false },
              ],
              explanation: '施設ごとに許容基準や運用が異なるため、自施設の手順を優先します。',
            },
          ],
        },
      ],
    },

    // ══════════════════════════════════════════════════════════════
    // u4: 2-D(血清とヘパリン血漿の使い分け)
    // ══════════════════════════════════════════════════════════════
    {
      unitId: 'bio-tubes-u4',
      title: '血清とヘパリン血漿でKの値が違う',
      requestLine: '同じ患者の血清・ヘパリン血漿でKの値が違う。原因と使い分けを確認する',
      beats: [
        {
          id: 'bio-tubes-u4-d0',
          type: 'dialogue',
          xp: 5,
          title: '検査室での気づき',
          backgroundId: 'labhall',
          lines: [
            { speaker: '技師', text: 'あれ、同じ患者さんなのに血清管とヘパリン血漿管でKの値が違うね。' },
            { speaker: '実習生', text: '本当ですね…どちらかが間違っているんでしょうか?' },
            {
              speaker: '技師',
              text: '間違いとは限らないよ。血清とヘパリン血漿の違いを教科書で確認して。フィブリノゲンの有無やK値の傾向、迅速報告での使い分けもね。',
            },
            { speaker: '技師', text: 'そのうえで、この患者さんのK値をどう報告するか一緒に決めよう。' },
          ],
        },
        {
          id: 'bio-tubes-u4-problem',
          type: 'problem',
          xp: 5,
        },
        {
          id: 'bio-tubes-u4-lec',
          type: 'lecture',
          xp: 10,
          body:
            '血清は、血液が凝固したあとに残る上清で、凝固の過程でフィブリノゲンが消費されるため含まれていません。一方、ヘパリン血漿は抗凝固剤で凝固を止めた血液を遠心して得るもので、フィブリノゲンがそのまま残っています。\n\nこの違いにより、K(カリウム)は血清の方がヘパリン血漿より高くなりやすいことが知られています。これは凝固の過程で血小板が壊れ、血小板内のKが放出されるためです。ヘパリン血漿検体では、この放出が起こらないぶんK値は本来の値に近くなります。\n\nヘパリン血漿検体は凝固を待つ必要がないため、緊急検査など迅速報告が求められる場面で有利です。ただし実際にどちらの検体種を採用するかは施設によって異なるため、自施設がどちらを採用しているかを確認しておくことが欠かせません。',
          bridge:
            '教科書で、血清とヘパリン血漿でKの値が異なる理由と、ヘパリン血漿検体の迅速報告での利点・施設差の両方を確認し、それぞれキーワードを入力してください。',
        },
        {
          id: 'bio-tubes-u4-inv-k',
          type: 'investigate',
          xp: 15,
          mode: 'textbook',
          required: true,
          purpose: '血清とヘパリン血漿でK値が違って見える理由を確認する',
          howTo: '教科書・配布資料で、血清とヘパリン血漿の違いとK値の傾向について正しい記述を確認する。',
          clueKey: 'serum-plasma-k-diff',
          demoHint: 'モック正解例: 血清はフィブリノゲンが除去されている/血清のK値は血小板由来でヘパリン血漿より高くなりやすい',
          choices: [
            {
              label: '血清はフィブリノゲンが除去されているのに対し、ヘパリン血漿にはフィブリノゲンが残っている',
              correct: true,
            },
            {
              label: '血清のK値は、凝固の過程で血小板からKが放出されるためヘパリン血漿より高くなりやすい',
              correct: true,
            },
            { label: '血清とヘパリン血漿でK値に差が出ることはない', correct: false },
            { label: 'フィブリノゲンの有無は測定値にまったく影響しない', correct: false },
          ],
        },
        {
          id: 'bio-tubes-u4-inv-report',
          type: 'investigate',
          xp: 15,
          mode: 'textbook',
          required: true,
          purpose: '迅速報告におけるヘパリン血漿検体の利点と、検体種の施設差を確認する',
          howTo: '教科書・配布資料で、ヘパリン血漿検体の利点と、施設ごとの検体種の違いについて正しい記述を確認する。',
          clueKey: 'plasma-rapid-report',
          demoHint: 'モック正解例: ヘパリン血漿検体は凝固を待たず迅速報告に向く/採用する検体種は施設によって異なる',
          choices: [
            {
              label: 'ヘパリン血漿検体は凝固を待つ必要がないため、迅速報告に向いている',
              correct: true,
            },
            {
              label: '施設によって採用する検体種(血清/ヘパリン血漿)が異なるため、自施設の採用検体種を確認しておく必要がある',
              correct: true,
            },
            { label: '検体種はどの施設でも完全に統一されている', correct: false },
            { label: 'ヘパリン血漿検体は血清検体より必ず結果が遅く出る', correct: false },
          ],
        },
        {
          id: 'bio-tubes-u4-res1',
          type: 'resolve',
          title: '判断',
          xp: 15,
          prompt: '技師「このKの差、まず何を疑う?」',
          requiredClueKeys: ['serum-plasma-k-diff'],
          choices: [
            {
              label: 'それぞれの検体が血清・ヘパリン血漿どちらか(検体種)を確認する',
              correct: true,
              feedback: '検体種の違いによるK値の傾向差である可能性をまず確認します。',
            },
            {
              label: 'どちらかの検体が異常だと決めつけ、廃棄する',
              correct: false,
              feedback: '検体種による差の可能性を確認せずに廃棄するのは避けます。',
            },
            {
              label: '測定機器の故障を疑い、点検だけ依頼する',
              correct: false,
              feedback: 'まず確認すべきは検体種の違いです。機器点検だけでは原因を見落とします。',
            },
          ],
        },
        {
          id: 'bio-tubes-u4-res2',
          type: 'resolve',
          title: '報告',
          xp: 15,
          prompt: 'では、この患者のK値をどう報告する? 検体種の確認結果を踏まえて考えて。',
          requiredClueKeys: ['serum-plasma-k-diff', 'plasma-rapid-report'],
          choices: [
            {
              label:
                '自施設が採用している検体種の基準値・報告ルールに沿って判断する(施設ごとに採用検体種が異なるため)',
              correct: true,
              feedback: '検体種は施設によって採用が異なるため、自施設の基準を優先します。',
            },
            {
              label: '検体種を確認せず、高い方の値をそのまま報告する',
              correct: false,
              feedback: '検体種の違いを確認せずに報告するのは避けます。',
            },
            {
              label: '2つの値を平均して報告する',
              correct: false,
              feedback: '検体種の違いによる傾向差を無視した平均処理は避けます。',
            },
          ],
        },
        {
          id: 'bio-tubes-u4-drill',
          type: 'drill',
          xp: 20,
          questions: [
            {
              id: 'bio-tubes-u4-q1',
              format: 'mcq',
              prompt: '血清とヘパリン血漿の違いとして正しいのは?',
              choices: [
                { label: '血清はフィブリノゲンが除去されているが、ヘパリン血漿には残っている', correct: true },
                { label: 'ヘパリン血漿にはフィブリノゲンが含まれない', correct: false },
                { label: '血清とヘパリン血漿は成分的にまったく同じものである', correct: false },
                { label: '血清は抗凝固剤を使って作る', correct: false },
              ],
              explanation: '血清は凝固の過程でフィブリノゲンが消費されるため含まれません。',
            },
            {
              id: 'bio-tubes-u4-q2',
              format: 'mcq',
              prompt: '血清とヘパリン血漿のK値の違いに関する記述として正しいものはどれか(複数選択可)。',
              choices: [
                { label: '血清のK値はヘパリン血漿より高くなりやすい', correct: true },
                { label: 'これは凝固の過程で血小板からKが放出されるためである', correct: true },
                { label: '血清とヘパリン血漿でK値に差が出ることはない', correct: false },
                { label: 'ヘパリン血漿のK値の方が必ず血清より高くなる', correct: false },
              ],
              explanation: '凝固の過程での血小板由来のK放出により、血清のK値はヘパリン血漿より高くなりやすくなります。',
            },
            {
              id: 'bio-tubes-u4-q3',
              format: 'mcq',
              prompt: '同じ患者で血清・ヘパリン血漿のK値に差があるときの最初の確認事項は?',
              choices: [
                { label: 'それぞれの検体が血清・ヘパリン血漿どちらかを確認する', correct: true },
                { label: 'どちらかを異常値として廃棄する', correct: false },
                { label: '測定機器の故障を疑い点検だけ依頼する', correct: false },
                { label: '他の患者の結果と平均を取って評価する', correct: false },
              ],
              explanation: '検体種の違いによる傾向差である可能性をまず確認します。',
            },
            {
              id: 'bio-tubes-u4-q4',
              format: 'mcq',
              prompt: 'ヘパリン血漿検体・検体種の施設差に関する記述として正しいものはどれか(複数選択可)。',
              choices: [
                { label: 'ヘパリン血漿検体は凝固を待つ必要がなく迅速報告に向いている', correct: true },
                { label: '採用する検体種(血清/ヘパリン血漿)は施設によって異なる', correct: true },
                { label: '検体種はどの施設でも完全に統一されている', correct: false },
                { label: 'ヘパリン血漿検体は血清検体より必ず結果が遅く出る', correct: false },
              ],
              explanation: 'ヘパリン血漿検体は迅速報告に向く一方、採用する検体種自体は施設ごとに異なります。',
            },
            {
              id: 'bio-tubes-u4-q5',
              format: 'mcq',
              prompt: '血清・ヘパリン血漿どちらを採用するか判断するとき、最も優先すべきは?',
              choices: [
                { label: '自施設が採用している検体種の基準・報告ルールに従うこと', correct: true },
                { label: '検査者の主観的な印象だけで判断すること', correct: false },
                { label: '常に値が高い方を採用すること', correct: false },
                { label: '実習生の判断のみで決めること', correct: false },
              ],
              explanation: '検体種は施設によって採用が異なるため、自施設の基準を優先します。',
            },
          ],
        },
      ],
    },

    // ══════════════════════════════════════════════════════════════
    // u5: 2-E(採血量と充填)
    // ══════════════════════════════════════════════════════════════
    {
      unitId: 'bio-tubes-u5',
      title: '採血量が足りなかった検体',
      requestLine: '届いた検体が既定量より少ない。このまま使ってよいか判断する',
      beats: [
        {
          id: 'bio-tubes-u5-d0',
          type: 'dialogue',
          xp: 5,
          title: '目盛りに満たない検体',
          backgroundId: 'labhall',
          lines: [
            { speaker: '実習生', text: 'この検体、管の目盛りまで入っていないですね…' },
            { speaker: '技師', text: '本当だ。抗凝固剤との比率が崩れると、何が起きるか説明できる?' },
            {
              speaker: '技師',
              text: 'まずは採血量不足の影響と、逆に入れすぎた場合の影響も教科書で確認して。',
            },
            { speaker: '技師', text: 'そのうえで、この検体を使ってよいか一緒に決めよう。' },
          ],
        },
        {
          id: 'bio-tubes-u5-problem',
          type: 'problem',
          xp: 5,
        },
        {
          id: 'bio-tubes-u5-lec',
          type: 'lecture',
          xp: 10,
          body:
            '採血管の抗凝固剤や添加剤は、規定量の血液が採れることを前提とした量で入っています。既定量に満たない採血(採血不足)では、血液に対して抗凝固剤の割合が相対的に多くなり、希釈効果や検査値への影響が生じます。特にクエン酸ナトリウム管のように液状の抗凝固剤を使う検査では、この影響が大きくなりやすいため注意が必要です。\n\n逆に、血液を入れすぎて充填が過剰になると、今度は抗凝固剤に対して血液が多くなりすぎ、抗凝固効果が不十分になって凝固検体(微小な凝固塊を含む検体)になることがあります。転倒混和が不十分な場合も、抗凝固剤が血液全体に行き渡らず同様の問題が起こります。\n\nこのように、採血量と抗凝固剤の比率、そして混和の丁寧さは、検体の質を左右する重要な要素です。',
          bridge:
            '教科書で、採血量不足の影響と、過剰充填・混和不良の影響の両方を確認し、それぞれキーワードを入力してください。',
        },
        {
          id: 'bio-tubes-u5-inv-shortage',
          type: 'investigate',
          xp: 15,
          mode: 'textbook',
          required: true,
          purpose: '既定量に満たない検体が測定にどう影響するかを確認する',
          howTo: '教科書・配布資料で、採血量不足の影響について正しい記述を確認する。',
          clueKey: 'draw-volume-shortage',
          demoHint: 'モック正解例: 抗凝固剤に対し血液が少なくなり希釈効果が生じる/液状抗凝固剤で特に問題になりやすい',
          choices: [
            {
              label: '既定量に満たない採血では、抗凝固剤に対して血液が少なくなり、相対的な希釈効果が生じる',
              correct: true,
            },
            {
              label: '採血量不足はクエン酸管など液状抗凝固剤を使う検査で特に問題になりやすい',
              correct: true,
            },
            { label: '採血量が多少不足しても測定値にはまったく影響しない', correct: false },
            { label: '採血量不足は粉末状の抗凝固剤の管でも液状の管でも影響の大きさは同じである', correct: false },
          ],
        },
        {
          id: 'bio-tubes-u5-inv-overfill',
          type: 'investigate',
          xp: 15,
          mode: 'textbook',
          required: true,
          purpose: '逆に血液を入れすぎた場合や、混和が不十分な場合の影響を確認する',
          howTo: '教科書・配布資料で、過剰充填・混和不良の影響について正しい記述を確認する。',
          clueKey: 'draw-volume-overfill',
          demoHint: 'モック正解例: 血液を入れすぎると抗凝固効果が不十分になり凝固検体になる/混和不足でも微小凝固が生じる',
          choices: [
            {
              label: '抗凝固剤に対して血液を入れすぎると、抗凝固効果が不十分になり凝固検体になることがある',
              correct: true,
            },
            {
              label: '転倒混和が不十分だと、抗凝固剤が均一に混ざらず微小凝固が生じることがある',
              correct: true,
            },
            { label: '採血管は目盛りを超えて満タンまで入れるほど検査には望ましい', correct: false },
            { label: '転倒混和の回数や丁寧さは検体の質に関係しない', correct: false },
          ],
        },
        {
          id: 'bio-tubes-u5-res1',
          type: 'resolve',
          title: '判断',
          xp: 15,
          prompt: '技師「この検体、既定量より少ないね。まずどうする?」',
          requiredClueKeys: ['draw-volume-shortage'],
          choices: [
            {
              label: '採血管の目盛りや採取量を確認し、比率が保たれているか(使用可能か)判断する',
              correct: true,
              feedback: '採血量と抗凝固剤の比率が保たれているかをまず確認します。',
            },
            {
              label: '量に関わらずそのまま測定に使う',
              correct: false,
              feedback: '希釈効果の可能性を確認せずに使用するのは避けます。',
            },
            {
              label: '検体を破棄し、特に連絡はしない',
              correct: false,
              feedback: '記録や連絡を残さず廃棄するのは避け、手順に沿って対応します。',
            },
          ],
        },
        {
          id: 'bio-tubes-u5-res2',
          type: 'resolve',
          title: '報告',
          xp: 15,
          prompt: 'では、この検体をどう扱う? 採血量の確認結果を踏まえて考えて。',
          requiredClueKeys: ['draw-volume-shortage', 'draw-volume-overfill'],
          choices: [
            {
              label:
                '採血量不足・充填不良が疑われる場合は、自施設の検体受付基準に沿って再採血依頼やコメント付与を検討する',
              correct: true,
              feedback: '施設ごとに検体受付の許容基準が異なるため、自施設の手順を優先します。',
            },
            {
              label: '量に関わらず、そのまま数値通り報告する',
              correct: false,
              feedback: '希釈効果や凝固不良の可能性を確認せずに報告するのは避けます。',
            },
            {
              label: '原因を追及せず、検体を黙って破棄する',
              correct: false,
              feedback: '記録や連絡を残さず廃棄するのは避け、手順に沿って対応します。',
            },
          ],
        },
        {
          id: 'bio-tubes-u5-drill',
          type: 'drill',
          xp: 20,
          questions: [
            {
              id: 'bio-tubes-u5-q1',
              format: 'mcq',
              prompt: '採血量不足が問題になる主な理由は?',
              choices: [
                { label: '抗凝固剤に対して血液が相対的に少なくなり希釈効果が生じるため', correct: true },
                { label: '採血にかかる時間が長くなるため', correct: false },
                { label: '管のラベルが剥がれやすくなるため', correct: false },
                { label: '患者の痛みが強くなるため', correct: false },
              ],
              explanation: '既定量に満たないと抗凝固剤との比率が崩れ、希釈効果が生じます。',
            },
            {
              id: 'bio-tubes-u5-q2',
              format: 'mcq',
              prompt: '採血量不足の影響に関する記述として正しいものはどれか(複数選択可)。',
              choices: [
                { label: '抗凝固剤に対して血液が少なくなり、相対的な希釈効果が生じる', correct: true },
                { label: '液状抗凝固剤(クエン酸など)を使う検査で特に問題になりやすい', correct: true },
                { label: '採血量が多少不足しても測定値にはまったく影響しない', correct: false },
                { label: '粉末状の抗凝固剤なら量不足の影響は一切ない', correct: false },
              ],
              explanation: '希釈効果は特に液状抗凝固剤を使う検査で顕著になります。',
            },
            {
              id: 'bio-tubes-u5-q3',
              format: 'mcq',
              prompt: '既定量に満たない検体を見つけたときの最初の行動として最も適切なのは?',
              choices: [
                { label: '採血管の目盛りや採取量を確認し、使用可能か判断する', correct: true },
                { label: '量に関わらずそのまま測定に使う', correct: false },
                { label: '検体を破棄して連絡しない', correct: false },
                { label: '他の患者の結果と平均を取って評価する', correct: false },
              ],
              explanation: '採血量と抗凝固剤の比率が保たれているかをまず確認します。',
            },
            {
              id: 'bio-tubes-u5-q4',
              format: 'mcq',
              prompt: '過剰充填・混和不良の影響として正しいものはどれか(複数選択可)。',
              choices: [
                { label: '血液を入れすぎると抗凝固効果が不十分になり凝固検体になることがある', correct: true },
                { label: '転倒混和が不十分だと微小凝固が生じることがある', correct: true },
                { label: '採血管は満タンまで入れるほど検査には望ましい', correct: false },
                { label: '転倒混和の回数や丁寧さは検体の質に関係しない', correct: false },
              ],
              explanation: '過剰充填も混和不良も、いずれも抗凝固剤が適切に働かない原因になります。',
            },
            {
              id: 'bio-tubes-u5-q5',
              format: 'mcq',
              prompt: '採血量不足・充填不良が疑われる検体の扱いを判断するとき、最も優先すべきは?',
              choices: [
                { label: '自施設の検体受付基準に従うこと', correct: true },
                { label: '検査者の主観的な印象だけで判断すること', correct: false },
                { label: '他の患者の結果との平均で判断すること', correct: false },
                { label: '実習生の判断のみで決めること', correct: false },
              ],
              explanation: '施設ごとに検体受付の許容基準が異なるため、自施設の手順を優先します。',
            },
          ],
        },
      ],
    },
  ],
}
