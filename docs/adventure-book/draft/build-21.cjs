const {
  Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell,
  WidthType, ShadingType, BorderStyle, AlignmentType, Header, Footer, PageNumber,
} = require("docx");
const fs = require("fs");

// ---------- helpers (4A-溶血/22A-パニック値/2-採血管/8-9-精度管理 build script と共通の様式) ----------

const COLOR = {
  accent: "8A5A2B",
  columnBg: "FDF3E3",
  columnBorder: "C98A3B",
  warnBg: "FBEAE8",
  warnBorder: "B24C3F",
};

function h1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 380, after: 180 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 10, color: COLOR.accent, space: 4 } },
    children: [new TextRun({ text, bold: true, size: 34, color: COLOR.accent })],
  });
}

function h2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 260, after: 120 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: "D8C4A0", space: 3 } },
    children: [new TextRun({ text, bold: true, size: 26, color: "5C3A1E" })],
  });
}

function h3(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 200, after: 90 },
    children: [new TextRun({ text, bold: true, size: 22, color: "6B4423" })],
  });
}

function p(text, opts = {}) {
  return new Paragraph({
    spacing: { after: 140, line: 300 },
    children: [new TextRun({ text, size: 21, ...opts })],
  });
}

function formula(text) {
  return new Paragraph({
    spacing: { before: 60, after: 160 },
    indent: { left: 340 },
    children: [new TextRun({ text, size: 22, bold: true, color: "5C3A1E", font: "Consolas" })],
  });
}

function column(title, bodyParas, opts = {}) {
  const bg = opts.warn ? COLOR.warnBg : COLOR.columnBg;
  const border = opts.warn ? COLOR.warnBorder : COLOR.columnBorder;
  const label = opts.warn ? "⚠ 注意" : "📖 コラム(発展編対応)";
  return new Table({
    width: { size: 9350, type: WidthType.DXA },
    columnWidths: [9350],
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 9350, type: WidthType.DXA },
            shading: { type: ShadingType.CLEAR, fill: bg },
            margins: { top: 160, bottom: 160, left: 220, right: 220 },
            borders: {
              top: { style: BorderStyle.SINGLE, size: 8, color: border },
              bottom: { style: BorderStyle.SINGLE, size: 8, color: border },
              left: { style: BorderStyle.SINGLE, size: 16, color: border },
              right: { style: BorderStyle.SINGLE, size: 8, color: border },
            },
            children: [
              new Paragraph({
                spacing: { after: 100 },
                children: [new TextRun({ text: label, size: 17, color: border, italics: true })],
              }),
              new Paragraph({
                spacing: { after: 100 },
                children: [new TextRun({ text: title, bold: true, size: 22, color: "3E2C1C" })],
              }),
              ...bodyParas,
            ],
          }),
        ],
      }),
    ],
  });
}

function spacer(h = 160) {
  return new Paragraph({ spacing: { after: h }, children: [] });
}

// 図版差し込み枠
function figurePlaceholder(caption, heightTwip = 1800) {
  return new Table({
    width: { size: 9350, type: WidthType.DXA },
    columnWidths: [9350],
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 9350, type: WidthType.DXA },
            shading: { type: ShadingType.CLEAR, fill: "FAFAFA" },
            margins: { top: 80, bottom: 80, left: 120, right: 120 },
            borders: {
              top: { style: BorderStyle.DASHED, size: 6, color: "999999" },
              bottom: { style: BorderStyle.DASHED, size: 6, color: "999999" },
              left: { style: BorderStyle.DASHED, size: 6, color: "999999" },
              right: { style: BorderStyle.DASHED, size: 6, color: "999999" },
            },
            children: [
              new Paragraph({ spacing: { before: 100 }, children: [] }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [new TextRun({ text: "🖼  図版差し込み枠", size: 20, color: "888888", bold: true })],
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { after: 100 },
                children: [new TextRun({ text: caption, size: 17, color: "999999" })],
              }),
              new Paragraph({
                spacing: { after: Math.max(0, heightTwip - 600) },
                children: [],
              }),
            ],
          }),
        ],
      }),
    ],
  });
}

// ---------- content ----------

const children = [];

children.push(
  new Paragraph({
    spacing: { before: 200, after: 40 },
    children: [new TextRun({ text: "冒険の書 — 生化学・免疫ラボクエスト 資料集(試作章)", size: 20, color: "999999" })],
  }),
  new Paragraph({
    spacing: { after: 240 },
    children: [new TextRun({ text: "第21章　患者データによる結果照合", size: 32, bold: true, color: COLOR.accent })],
  }),
  new Paragraph({
    spacing: { after: 300 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: "CCCCCC", space: 4 } },
    children: [new TextRun({ text: "対応大項目: 21 患者データによる結果照合", size: 17, color: "888888" })],
  })
);

children.push(p(
  "この資料は、臨地実習中に「調査」で確認する内容をまとめたものです。国家試験レベルの知識を、実習の場面に即して使えるところまで身につけることを目標にしています。本文だけで基本を押さえられるようにし、少し発展した内容は「コラム」で補っています。コラムは飛ばしても本文の理解に支障はありませんが、発展問題や国家試験の応用問題まで解けるようになりたい人は目を通してください。"
));
children.push(p(
  "装置が算出した数値は、そのままでは“データ”にすぎない。その数値が本当にその患者の状態を表しているか、装置や検体の異常を拾ってしまっていないかを見極め、“検査情報”に変える作業が検査後プロセスの中心である。本章では、A基準値の3概念(何と比べて異常と判断するか)→B前回値との比較→C項目間の整合性→D生理的・薬剤性要因の除外→E分析的異常か病態かの切り分け、という骨子案の順に進む。B・Cは「他のデータと見比べる」視点、D・Eは「見比べた結果、原因をどう絞り込むか」という視点で、互いに補い合う関係にある。"
));
children.push(spacer());

// ============ A ============
children.push(h1("A　基準値の3概念"));
children.push(p("「基準値」とひとくくりに呼ばれるものには、実は目的の異なる複数の概念がある。この違いを整理しておかないと、「基準範囲内だから正常」「基準範囲を外れたから異常」という単純な二分法に陥ってしまう。"));
children.push(p("基準範囲は、健常者を測定した値の分布から統計的に求めた区間で、多くの場合その95%が含まれる範囲として設定される。あくまで「健常者集団の目安」であり、それ自体が治療の要否を決めるものではない。"));
children.push(p("臨床判断値は、治療を開始すべきか・注意が必要かなど、臨床的な意思決定のために設定された閾値である。これにはさらに、生活習慣病などの発症を予防する目的で設定される予防医学的閾値、治療を開始する基準となる治療閾値、複数の病態を鑑別するための病態識別値などがある。コレステロールのように、基準範囲内であっても将来の心血管リスクを踏まえて臨床判断値により治療が始まることがあるのはこのためである。"));
children.push(p("パニック値(Critical Value)は、生命に直結しうる極端な異常値を指し、検出したら直ちに主治医へ報告することが求められる値である。項目ごとの具体的な閾値・報告体制については、22章「Critical Value・緊急異常値の報告」で詳しく扱う。"));
children.push(p("この3つはいずれも「ある数値を境界として区切る」という形は似ているが、目的がまったく異なる。混同すると、「基準範囲内だから治療の必要はない」「臨床判断値を超えていないからパニック値でもない」といった誤った判断につながりかねない。"));
children.push(p("基準範囲そのものにも種類がある。複数の施設が測定法の標準化を前提に共通して用いる共用基準範囲と、自施設の患者集団や測定機器の特性に応じて独自に設定する施設独自の基準範囲である(標準化と共用基準範囲の関係は9章「外部精度評価と標準化」も参照)。どちらを採用しているかは施設ごとに異なるため、報告書や患者説明の際は自施設の方針を確認しておく必要がある。"));
children.push(spacer());

// ============ B ============
children.push(h1("B　前回値との比較(デルタチェック)"));
children.push(p("同一患者の検査値は、通常は緩やかにしか変化しない。この性質を利用して、前回値との差から異常を検知する方法がデルタチェックである。"));
children.push(p("デルタチェックは、前回値と今回値の変化量・変化率、そして採取間隔(経過時間)をもとに、生理的にはあり得ない急激な変動がないかを確認する方法である。変化率は項目によって「正常な変動」として許容できる幅が異なるため、項目ごとに閾値(デルタチェックリミット)を設定して運用する。"));

children.push(figurePlaceholder(
  "デルタチェックのイメージ図(横軸=時間、縦軸=検査値。過去数回分の推移が緩やかな折れ線で、直近の1点だけが大きく外れて閾値線を超えている様子) ※教科書等の図を挿入"
));

children.push(p("生理的にあり得ない急激な変動が検知された場合、まず疑うべきは患者取り違え(別の患者の検体を測ってしまった)や検体取り違え(ラベル貼り間違い・搬送時の混同など)である。同一患者の検査値が短期間でここまで動くことは通常考えにくい、という感覚を養っておくことが早期発見につながる。"));
children.push(p("ただし、大きな変化のすべてが取り違えを意味するわけではない。輸血・透析・輸液・手術といった治療介入によっても、検査値は正当な理由で大きく変動することがある。たとえば透析後にはクレアチニン・尿素窒素・カリウムなどが大きく低下する、大量輸血後にはヘモグロビンや電解質が変動する、といった具合である。"));
children.push(p("したがって、デルタチェックで警告が出たときの確認手順はおおむね次のようになる。①患者氏名・ID・採取時刻などを照合し、取り違えの可能性を確認する、②直近の治療内容(輸血・透析・輸液・手術など)を確認し、正当な変動として説明がつくかを検討する、③いずれでも説明がつかない場合は、C・D・Eで扱う項目間の整合性・生理的要因・分析的異常の切り分けへと進む。この確認手順の具体的な運用(誰が確認し、どこまで自動化されているかなど)は自施設の手順に従う。"));

children.push(column(
  "① 「患者データを用いる方法」は精度管理でも登場する",
  [p("デルタチェック法は、8章「内部精度管理」で扱う患者データを用いる精度管理法のひとつでもある。装置・試薬側の異常を検知する目的で使うか、個々の患者の結果を評価する目的で使うかで文脈は異なるが、「同一患者・関連項目のデータそのものから異常を検知する」という考え方は共通している。国家試験では、この患者データ法を管理血清(コントロール血清)を用いる方法(x-R管理図法など)と対比させ、どちらに分類されるかを問う出題がある。第59回国家試験(午後)では「内部精度管理法で管理血清を用いるのはどれか。2つ選べ」という設問に、累積和法・x-R管理図法・項目間チェック法・デルタチェック法・ナンバープラス法の5つが選択肢として並んだ。デルタチェック法と項目間チェック法(次のCで扱う)はいずれも患者データを用いる方法であり、管理血清を用いる方法(x-R管理図法など)には分類されない、という整理が問われている。", { size: 20 })]
));
children.push(spacer());

// ============ C ============
children.push(h1("C　項目間の整合性"));
children.push(p("検査結果は単独の項目だけでなく、生理的・生化学的に関連する項目とあわせて見ることで、より正確に解釈できる。単独の項目が基準範囲を外れているとき、あるいは逆に基準範囲内でも、関連項目との整合性を確認する視点を持っておきたい。"));

children.push(h2("C-a　Na と Cl の乖離(アニオンギャップ)"));
children.push(p("血清電解質のNaとClの差が通常より大きいときは、アニオンギャップ(anion gap, AG)の異常を疑う。アニオンギャップは、測定していない陰イオン(蛋白質、有機酸、リン酸、硫酸など)の総量を反映する計算値で、次の式で求める。"));
children.push(formula("AG = [Na⁺] − ([Cl⁻] + [HCO3⁻])"));
children.push(p("基準範囲は測定法・施設によって幅があるが、おおよそ8〜16 mEq/L程度が目安とされる(具体的な基準範囲は自施設の設定に従う)。AGが増加する代表例は、糖尿病性ケトアシドーシスのようにケト酸が蓄積する場合や、腎不全のように尿毒症物質(硫酸・リン酸などの酸)が蓄積する場合である。一方、下痢のように消化管からHCO3⁻が失われ、代わりにClが再吸収されて上昇する場合はAGが変化しない代謝性アシドーシス(高Cl性代謝性アシドーシス)となる。AGを計算することで、同じ代謝性アシドーシスでも原因の見当をつけやすくなる。"));

children.push(figurePlaceholder(
  "アニオンギャップの概念図(陽イオン〈Na⁺〉と陰イオン〈Cl⁻・HCO3⁻・その他の陰イオン〉を積み上げ棒グラフで対比させ、「その他の陰イオン」の部分がAGに相当することを示す図) ※教科書等の図を挿入"
));

children.push(h2("C-b　TP と Alb、A/G比"));
children.push(p("総蛋白(TP)とアルブミン(Alb)のバランスからは、蛋白分画の異常を推測できる。目安として用いられるのがA/G比(アルブミン/グロブリン比)で、TPからAlbを引いた値(グロブリン量の近似)に対するAlbの比である。"));
children.push(formula("A/G比 = Alb ÷ (TP − Alb)"));
children.push(p("基準範囲はおおよそ1.2〜2.0程度が目安とされる。A/G比が低下する場合は、アルブミンの低下(肝合成能低下・栄養不良・ネフローゼ症候群など)かグロブリンの増加(炎症性疾患・多発性骨髄腫など)のいずれか、あるいは両方を考える。"));
children.push(spacer());

children.push(h2("C-c　AST・ALT・LD の相互関係、逸脱酵素の組合せ"));
children.push(p("AST・ALT・LDのようないわゆる逸脱酵素は、細胞が障害を受けたときに血中へ漏れ出す酵素であり、どの酵素がどの程度上昇しているかの組合せから、障害を受けている臓器・部位の見当をつけられる。たとえばASTはALTに比べて心筋・骨格筋にも多く含まれるため、ASTのみが優位に上昇している場合は肝臓以外の原因(心筋・骨格筋の障害など)も考える。肝疾患の中でも、AST/ALT比(De Ritis比)が1を大きく超える場合はアルコール性肝障害や肝硬変など、逆にALTが優位な場合はウイルス性肝炎の急性期などが示唆される、という使い分けも知られている。"));

children.push(column(
  "② 複数の逸脱酵素が同時に上昇したときの考え方",
  [p("単独の酵素だけでなく、複数の逸脱酵素が同時に、しかも一見無関係な項目(コレステロールなど)とあわせて動くことがある。ある症例報告では、AST・ALT・LD・CK・アミラーゼが軒並み上昇し、同時に総コレステロールも上昇していた患者について、①急性心筋梗塞、②薬剤の副作用(スタチンなどによる横紋筋融解・肝機能障害)、③甲状腺機能低下症、の3つを鑑別に挙げて検討している。甲状腺機能低下症では、甲状腺ホルモンの不足により蛋白の異化作用が抑制されて血清酵素が全般的に増加しやすく、また肝における脂質利用が低下してコレステロール・トリグリセライドが増加しやすい。この症例では、FT4・FT3の低下とTSHの上昇が確認され、甲状腺機能低下症による検査値異常であることが確定した。「1項目だけを個別に見るのではなく、複数項目が動くパターンから鑑別を絞り込む」という考え方の実例として押さえておくとよい(出典: 浦山ほか「臨床病理」47巻, 1999年)。", { size: 20 })]
));
children.push(spacer());

children.push(h2("C-d　Ca とアルブミン補正(Payneの式)"));
children.push(p("血中カルシウムの約半分はイオン化カルシウム(生理活性を持つ形)として存在し、残りの多くはアルブミンなどの蛋白質と結合した形で存在する。そのため、低アルブミン血症があると、総カルシウム値は実際のイオン化カルシウムが正常でも見かけ上低く出やすい。この見かけ上の低値を補正するのに用いられるのがPayneの式である。"));
children.push(formula("補正Ca(mg/dL) = 実測Ca(mg/dL) + (4.0 − 血清Alb(g/dL))"));
children.push(p("この式はアルブミンが4.0 g/dLを下回る場合に適用する。低アルブミン血症の患者で総カルシウムが基準範囲を下回っていても、補正すると基準範囲内に収まることは珍しくない。逆に言えば、低アルブミン血症の患者のCaを補正せずに評価すると、実際には問題のないカルシウム値を異常と誤認しかねない。"));

children.push(column(
  "pHの変化もイオン化カルシウムに影響する",
  [p("アルブミンとカルシウムの結合の強さは血液のpHによっても変わる。アルカローシス(pH上昇)では、アルブミンの水素イオン結合部位が奪われることでカルシウムとの結合が増え、イオン化カルシウムはむしろ減少する(過換気によるテタニー〈しびれ・こむら返り〉はこの機序による)。逆にアシドーシスではイオン化カルシウムが増加する。「アルカローシスだからイオン化カルシウムも増える」と直感的に考えてしまうと逆方向に間違えるので注意したい。", { size: 20 })],
  { warn: true }
));
children.push(spacer());

children.push(h2("C-e　総ビリルビンと直接ビリルビンの逆転"));
children.push(p("直接ビリルビン(抱合型ビリルビン)は総ビリルビンの内訳の一部であるため、直接ビリルビンが総ビリルビンより高い値になることは定義上あり得ない。このような「逆転」が見られたときは、患者の病態ではなく、測定上の問題(検体の性状、測定法の干渉など)や入力・転記の誤りをまず疑う。"));
children.push(spacer());

children.push(h2("C-f　生化学と血算・凝固・尿検査との整合"));
children.push(p("生化学の結果は、生化学の中だけで完結させず、血算・凝固・尿検査など他分野の結果ともあわせて整合性を確認する。たとえばHb(ヘモグロビン)低値と検体の溶血所見が同時に見られる場合、真の貧血なのか、溶血による検体不良でヘモグロビンやカリウムなどが偽高値・偽低値になっているのかを見分ける必要がある(検体の溶血については4章「検体の性状と測定妨害」も参照)。同様に、腎機能検査(クレアチニン・尿素窒素)の異常は尿検査(尿蛋白・尿潜血・尿沈渣)の所見とあわせて評価すると、より確からしい判断ができる。"));

children.push(column(
  "③ 国家試験に見る項目間整合性の視点",
  [p("第59回国家試験(前半)では「アニオンギャップが増加するのはどれか。2つ選べ」という設問に、下痢・腎不全・慢性肺気腫・低アルブミン血症・糖尿病性ケトアシドーシスの5つが選択肢として並んだ。正解は腎不全と糖尿病性ケトアシドーシスで、いずれも酸(尿毒症物質・ケト酸)が体内に蓄積してアニオンギャップが増加する病態である。下痢はHCO3⁻の喪失によるAG正常型の代謝性アシドーシス、慢性肺気腫は呼吸性の変化でありAGには直接関与しない。低アルブミン血症はむしろAGを低下させる方向に働く(アルブミンはAGを構成する陰イオンの中で最大の割合を占めるため、低アルブミン血症では見かけ上AGが低く出ることがある)。第60回国家試験(前半)でも「アニオンギャップに占める最大の陰イオンはどれか」という設問でアルブミンが正解として問われており、AGを評価するときはアルブミン値もあわせて確認するとよい、という実務上のポイントにもつながる。", { size: 20 })]
));
children.push(spacer());

// ============ D ============
children.push(h1("D　生理的・薬剤性要因の除外"));
children.push(p("基準範囲を外れた値のすべてが病的な異常を意味するわけではない。病態を疑う前に、薬剤・処置・生理的な要因によって説明がつかないかを確認する視点が欠かせない。"));

children.push(h2("D-a　薬剤による検査値変動"));
children.push(p("多くの薬剤が検査値に影響を与えることがある。ステロイドは血糖・白血球数を上昇させ、脂質代謝にも影響する。利尿薬は電解質(特にK・Na)に影響し、種類によっては尿酸値を上昇させる。スタチンはCKの上昇(横紋筋融解症のリスクを含む)や肝機能検査値の変動を起こすことがある。抗菌薬の中にも、肝機能検査値や腎機能検査値に影響を与えるものがある。これらは代表例であり、実際にはさらに多くの薬剤が何らかの検査値に影響しうる。"));

children.push(h2("D-b　処置による検査値変動"));
children.push(p("輸液・輸血・造影剤・透析といった処置も検査値を変動させる。輸液は希釈により電解質やアルブミンなどを見かけ上低下させることがあり、輸血は輸血された血液成分(電解質・凝固因子など)の影響を受ける。造影剤は腎機能検査値に一時的な影響を及ぼすことがあり、透析は既に触れた通り尿毒症物質や電解質を大きく変動させる。"));

children.push(h2("D-c　妊娠・加齢・体位による変動"));
children.push(p("病的な要因がなくても、妊娠・加齢・体位(臥位か立位か)といった生理的な要因で検査値は変動する。たとえば妊娠中はアルブミンが希釈により低下しやすく、体位の違いは立位で毛細血管から水分が組織側へ移動することで、蛋白質や蛋白結合性の高い成分(Caなど)の血清中濃度をわずかに上昇させることが知られている。"));

children.push(h2("D-d　「異常値だが病的でない」パターンの見分け方"));
children.push(p("異常値が病的なものか、それとも生理的・薬剤性の説明がつくものかを見分けるには、数値だけでなく患者背景(服薬状況・直近の処置・年齢・妊娠の有無・採血時の体位など)を確認することが欠かせない。背景を確認せずに数値だけで判断すると、誤った解釈につながりやすい。"));
children.push(spacer());

// ============ E ============
children.push(h1("E　分析的異常か病態かの切り分け"));
children.push(p("原因不明の異常値に出会ったとき、闇雲に病態を疑うのではなく、順序立てて確認することが基本である。"));

children.push(h2("E-a　切り分けの思考手順(装置→試薬→検体→患者)"));
children.push(p("基本的な思考手順は、装置→試薬→検体→患者の順である。"));
children.push(p("まず装置に異常がないかを確認する。直近の校正(キャリブレーション)状況、内部精度管理(管理図)に逸脱がなかったか、装置のエラーフラグの有無などを確認する。次に試薬を確認する。ロットが交換された直後でないか、使用期限や保存状態に問題がなかったかを確認する。装置・試薬に問題がなければ、検体の性状(溶血・乳び・凝固など)や取り違えの可能性を確認する。ここまでで説明がつかなければ、初めて患者の病態を検討する。"));
children.push(p("この順序で確認する理由は、装置・試薬・検体の問題は多くの場合、他の検体・他の患者にも共通して影響する可能性がある一方、患者の病態は個々の患者に固有の原因だからである。まず「測定システム側の問題ではないか」を消去してから、患者固有の要因(病態・生理的変動・薬剤など)の検討に進むという流れは、B〜Dで扱った視点とも一貫している。"));

children.push(figurePlaceholder(
  "分析的異常の切り分けフローチャート(装置の校正・エラーフラグ確認→試薬のロット・期限確認→検体の性状・取り違え確認→患者の病態検討、の4段階を上から下へ流れる形の図。各段階で「問題あり」と判定されたら是正処置へ、「問題なし」なら次の段階へ進む分岐を明示) ※教科書等の図または自作の模式図を挿入"
));

children.push(h2("E-b　切り分けの結論をどこまで報告書に書くか"));
children.push(p("切り分けの結論を報告書にどこまで書くかは重要な判断である。「病態によるものと考えられる」といった断定的な表現は避け、必要な情報にとどめるのが基本的な考え方である。検査技師が診断を確定させるような書き方をすることは避け、担当医が判断材料として使える範囲の情報を、事実に基づいて記載する。具体的な記載範囲・書式は自施設の方針に従う。"));
children.push(spacer());

// ---------- doc ----------

const doc = new Document({
  sections: [
    {
      properties: {
        page: {
          margin: { top: 1000, bottom: 1000, left: 1100, right: 1100 },
        },
      },
      headers: {
        default: new Header({
          children: [
            new Paragraph({
              alignment: AlignmentType.RIGHT,
              children: [new TextRun({ text: "冒険の書　第21章　患者データによる結果照合(試作)", size: 15, color: "AAAAAA" })],
            }),
          ],
        }),
      },
      footers: {
        default: new Footer({
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new TextRun({ text: "- ", size: 16, color: "AAAAAA" }),
                new TextRun({ children: [PageNumber.CURRENT], size: 16, color: "AAAAAA" }),
                new TextRun({ text: " -", size: 16, color: "AAAAAA" }),
              ],
            }),
          ],
        }),
      },
      children,
    },
  ],
});

Packer.toBuffer(doc).then((buf) => {
  fs.writeFileSync(__dirname + "/21-患者データによる結果照合.docx", buf);
  console.log("done");
});
