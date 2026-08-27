const {
  Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell,
  WidthType, ShadingType, BorderStyle, AlignmentType, Header, Footer, PageNumber,
} = require("docx");
const fs = require("fs");

// ---------- helpers (4A-溶血/22A-パニック値/2-採血管 build script と共通の様式) ----------

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

function p(text, opts = {}) {
  return new Paragraph({
    spacing: { after: 140, line: 300 },
    children: [new TextRun({ text, size: 21, ...opts })],
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
    children: [new TextRun({ text: "第8-9章　精度管理(内部精度管理と外部精度評価)", size: 32, bold: true, color: COLOR.accent })],
  }),
  new Paragraph({
    spacing: { after: 300 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: "CCCCCC", space: 4 } },
    children: [new TextRun({ text: "対応大項目: 8 内部精度管理　9 外部精度評価と標準化", size: 17, color: "888888" })],
  })
);

children.push(p(
  "この資料は、臨地実習中に「調査」で確認する内容をまとめたものです。国家試験レベルの知識を、実習の場面に即して使えるところまで身につけることを目標にしています。本文だけで基本を押さえられるようにし、少し発展した内容は「コラム」で補っています。コラムは飛ばしても本文の理解に支障はありませんが、発展問題や国家試験の応用問題まで解けるようになりたい人は目を通してください。"
));
children.push(p(
  "骨子案では大項目8(内部精度管理)と9(外部精度評価と標準化)は別項目だが、本書では「まず概要で内部と外部の違いを体系的に押さえ、そのうえで内部・外部それぞれの各論に入る」という構成でまとめて1冊にしている。これは、いきなり管理図のルール(2-2sなど)から学び始めると、そもそも精度管理が何のためにあるのかが見えないまま個別のルールだけを覚えることになってしまう、という指摘を踏まえた並び順である。"
));
children.push(spacer());

// ============ 概要 ============
children.push(h1("概要　精度管理の全体像: 内部精度管理と外部精度評価はどう違うか"));
children.push(p("精度管理とは、検査結果が信頼できる値であることを継続的に確認し保証する仕組み全体を指す。その中心にあるのが、内部精度管理(Internal Quality Control, IQC)と外部精度評価(External Quality Assessment, EQA。精度管理調査とも呼ばれる)という、目的の異なる2つの柱である。"));
children.push(p("内部精度管理は、自施設内で日常的に行う精度管理である。管理試料の測定値や患者データを使い、日々の測定のブレ(ランダムな変動である偶然誤差や、装置・試薬の劣化などによる系統誤差)をリアルタイムで検知することを目的とする。いわば「今日の測定はいつも通りか」を自施設だけで確認する仕組みである。"));
children.push(p("一方、外部精度評価は、日本臨床衛生検査技師会(日臨技)や日本医師会などの第三者機関が主催するサーベイに参加し、配布された共通の試料を測定した結果を、他の多数の施設やtarget値と比較する仕組みである。自施設の内部精度管理だけでは気づけない、施設固有の系統的なズレ(測定法・試薬・機器の違いによる施設間差)を、外部との比較によって初めて明らかにできる。"));
children.push(p("この2つはしばしば「精密さ(precision)は内部精度管理で、正確さ(trueness)は外部精度評価を通じて確認する」と整理される。内部が正常でも外部評価で問題が見つかることもあれば、その逆もあり、どちらか一方だけでは検査の質を十分に保証できない。両者を組み合わせて初めて、精度管理の環が完成する。"));

children.push(figurePlaceholder(
  "正確さ(trueness)と精密さ(precision)の違いを示す的当て(ダーツ)図(中心=真の値。①中心に集中=正確かつ精密、②中心から外れた一点に集中=精密だが不正確、③中心付近に散らばる=正確だが精密でない、④中心から外れて散らばる=不正確かつ不精密、の4パターン比較) ※教科書等の図を挿入",
  1400
));
children.push(spacer());

// ============ 第I部 内部精度管理 ============
children.push(h1("第I部　内部精度管理(大項目8)"));
children.push(p("内部精度管理には、大きく分けて「管理試料を使う方法(機器管理法)」と「実際の患者データを使う方法」の2種類がある。まずは誤差そのものの考え方(何をもって「ずれている」と判断するのか)を整理してから、それぞれの具体的な方法に入る。"));

children.push(h2("8-C　誤差論"));
children.push(p("測定には常に何らかの誤差が伴う。誤差は大きく、系統誤差(一定方向に偏るずれ)・偶然誤差(ランダムなばらつき)・過失誤差(操作ミスなど本来あってはならない誤り)の3つに分類される。"));
children.push(p("ここで区別しておきたいのが、正確さ(trueness)と精密さ(precision)である。正確さは測定値が真の値にどれだけ近いかを表し、精密さは繰り返し測定したときの値のばらつきの小ささを表す。この2つは別の概念で、精密さが高くても正確さが低い(いつも同じようにずれる)ことも、その逆もありえる(上の的当て図を参照)。"));
children.push(p("精密さを評価する指標には、同一条件下(同日・同一検査者など)での繰り返し測定のばらつきを表す併行精度と、日・検査者・試薬ロットなど条件が変わっても含めたより長期的なばらつきを表す室内再現精度がある。さらに近年は、測定値のばらつきを「不確かさ(uncertainty)」という数値化された指標として見積もる考え方も重視されている。不確かさは単に「ばらつきがある」という漠然とした事実ではなく、測定値に合理的に帰属しうる値の散らばりの範囲を、統計的な手法で定量的に見積もったものである。"));

children.push(column(
  "偶然誤差は「無くす」ものではなく「見積もる」もの",
  [p("偶然誤差は原因を完全に取り除くことができない性質の誤差である(取り除けるなら、それは系統誤差か過失誤差である)。同じ検体を繰り返し測ってわずかに違う値が出ること自体は異常ではなく、その振れ幅が自施設で定めた許容範囲(精密さの基準)に収まっているかどうかで判断する。", { size: 20 })],
  { warn: true }
));
children.push(spacer());

children.push(h2("8-A　管理図法"));
children.push(p("内部精度管理の代表的な方法が、管理試料(コントロール血清など)を日常検査と並行して測定し、その値を継続的に監視する管理図法である。"));
children.push(p("Levey-Jennings管理図は、管理試料を繰り返し測定した値を、平均値と標準偏差(SD)の線とともに時系列でグラフ化したものである。日々のQC結果をこの図にプロットすることで、装置・試薬が安定して測れているかを一目で確認できる。"));
children.push(p("この管理図の逸脱を判定する代表的な手法がWestgardマルチルールである。まず1-2s(1点が平均から2SDを超える)は「警告ルール」で、これ自体は即座に管理外れとはみなさず、他のルールを詳しく確認するきっかけになる。実際に管理外れと判定する「棄却ルール」には、1-3s(1点が平均から3SDを超える)、2-2s(連続する2点が同じ側で2SDを超える)、R-4s(連続する2点の差が4SDを超える)、4-1s・10xなどがあり、これらを組み合わせることで単一の基準では見逃しやすい異常も検出する。"));
children.push(p("管理図の逸脱パターンからは、系統誤差(一方向への連続したずれ=シフトやトレンド)と偶然誤差(ランダムなばらつき)を見分けることができ、原因調査の手がかりになる。「シフト」は基準線を境に急に一段階ずれて、その後はその新しい水準で推移する変化(試薬ロット交換や校正のやり直しなどで起こりやすい)、「トレンド」は徐々に連続的に一方向へずれ続けていく変化(試薬の劣化や光源ランプの経時劣化などで起こりやすい)を指す、という違いも押さえておくとよい。"));

children.push(figurePlaceholder(
  "Levey-Jennings管理図の例(①管理内で安定して推移しているパターン、②シフト変動〈ある時点から急に一段階ずれてその水準で推移する〉パターン、③トレンド変動〈徐々に連続的に一方向へずれ続ける〉パターンの3枚を並べたもの) ※実際の管理図(自施設のデータまたは教科書の図)をここに挿入"
));
children.push(figurePlaceholder(
  "Westgardマルチルールの判定フローチャート(1-2s〈警告〉→1-3s・2-2s・R-4s・4-1s・10x〈棄却ルール〉の分岐図) ※教科書等のフローチャート図を挿入"
));
children.push(spacer());

children.push(h2("8-B　患者データを用いる方法"));
children.push(p("内部精度管理には、管理試料を使う機器管理法のほかに、実際の患者データを使って異常を検知する方法もある。これは、たとえば管理試料の到着が遅れた日など、機器管理法が使えない場面での代替・補助手段として位置づけられる。"));
children.push(p("デルタチェック法は、同一患者の前回値と今回値の差(デルタ)が異常に大きい場合に、検体の取り違えや測定異常を疑う方法である。累積和法(CUSUM)は、1回ごとには小さいずれでも、時間をかけて積算することで系統的なずれを検出する方法である。"));
children.push(p("正常値平均法(患者データ平均法)は、多数の患者データの平均値が本来安定していることを利用し、その平均が大きくずれたときに機器の変動を疑う方法である。項目間チェック法は、生理的に関連する複数の検査項目(たとえばNaとCl、ASTとALTなど)の値の整合性を確認する方法である。"));
children.push(p("これらの患者データを用いる方法は、管理試料が使えない場面でも異常を検知できる利点があるが、あくまで機器管理法を補う手段であり、日常的に機器管理法の代わりを恒常的に務めるものではない。両者の使い分け・併用は国試でも頻出のポイントである。"));
children.push(spacer());

// ============ 第II部 外部精度評価と標準化 ============
children.push(h1("第II部　外部精度評価と標準化(大項目9)"));

children.push(h2("9-A　外部精度評価"));
children.push(p("外部精度評価(External Quality Assessment, EQA)は、日本臨床衛生検査技師会(日臨技)の精度管理調査、日本医師会の精度管理調査、都道府県による調査など、第三者機関が主催するサーベイに参加する形で行われる。基本的な流れは、共通の試料が全国の参加施設に配布され、各施設がその試料を測定し、結果を主催者に提出し、主催者が全参加施設の結果を集計して各施設に評価報告を返す、というものである。"));
children.push(p("評価報告では、自施設の測定値が他施設の集団(またはtarget値)からどれだけ離れているかを表す指標が使われる。代表的なものがSDI(Standard Deviation Index)とZ-scoreで、いずれも自施設の値とtarget値(多くの場合、参加施設全体の平均やコンセンサス値)との差を、集団の標準偏差(SD)で割って標準化した値である。一般的な目安として絶対値が2未満は満足、2〜3は要注意、3以上は不良とされることが多い。これらSDIやZ-scoreをもとに、乖離が大きいほど低くなるよう点数化した評価点として報告されることも多く、複数項目を横断して自施設の全体的な成績を一目で把握するのに使われる(具体的な区分・運用は調査を主催する団体・調査項目によって異なる)。"));
children.push(p("不良評価(SDIやZ-scoreが大きく外れた場合)を受け取ったときは、まず自施設の内部精度管理の記録を遡って確認し、同じ時期に管理図の逸脱がなかったかを調べる。そのうえで、装置・試薬・キャリブレーション・検体の取り扱いなど考えられる原因を系統的に洗い出し、原因が特定できれば是正処置を行い、記録を残す。外部評価は自施設だけでは気づけない系統的なズレを教えてくれる貴重な機会であるため、真摯に受け止めて調査を継続することが求められる。"));
children.push(spacer());

children.push(h2("9-B　標準化とトレーサビリティ"));
children.push(p("検査値が施設や時代を越えて信頼できるものであるためには、測定値の正確さがどこから保証されているかを辿れる仕組みが必要である。これをトレーサビリティといい、最も高い純度・精度を持つ一次標準物質を出発点に、二次標準物質という段階を経て、日常検査で実際に使う常用標準物質(メーカーの校正用標準物質)まで値の正確さを繋いでいく連鎖(トレーサビリティ連鎖)として成り立っている。この連鎖の中で、値とその不確かさが公的な手続きを経て認証された標準物質を認証標準物質(CRM)と呼ぶ。認証標準物質は一次標準物質・二次標準物質いずれの段階にもあり得る「認証されているかどうか」を表す性質であり、二次標準物質と常用標準物質の間に独立して存在する階層ではない。"));
children.push(p("この連鎖を実際に機能させるのが、JSCC(日本臨床化学会)勧告法やIFCC(国際臨床化学連合)準拠法のような標準化された測定法である。測定法が標準化されていれば、施設ごとに測定原理や試薬が違っても値を比較できるようになる。ALP(アルカリホスファターゼ)が従来法からIFCC準拠法へ移行した際、測定される値の水準そのものが変わったため基準範囲も見直された、というのはこの標準化の代表例である。"));
children.push(p("こうした標準化の広がりを背景に生まれたのが共用基準範囲である。測定法が施設間で標準化されていることを前提に、複数の施設で同じ基準範囲を共有して用いる考え方で、施設を移っても一貫した基準で検査値を解釈できるようにする取り組みである。"));

children.push(figurePlaceholder(
  "トレーサビリティ連鎖の模式図(一次標準物質→二次標準物質→常用標準物質→日常検査、のピラミッド型階層図。認証標準物質〈CRM〉がどの段階にも位置しうることを示す注記付き) ※教科書等の模式図を挿入"
));
children.push(spacer());

children.push(h2("9-C　施設間差と方法間差"));
children.push(p("同一項目であっても、測定原理・試薬・機器メーカーの違いや、標準化の程度の違いなどにより、施設間で測定値が異なることがある。これは必ずしもどちらかの施設の測定が誤っているという意味ではなく、方法間差として一般に起こりうる現象である。9-Bで扱った標準化・共用基準範囲の取り組みは、この施設間差をできるだけ小さくするためのものでもある。"));
children.push(p("施設内で機器や試薬を更新する際には、新旧の測定法で同じ検体を測定する相関試験を行い、系統的なズレの有無を確認する。ズレがあれば、その大きさを踏まえて運用を調整し、これまでの測定成績との連続性を保てるようにする。"));
children.push(p("こうした施設間差・方法間差は、患者本人や紹介元・紹介先の臨床医にとって分かりにくいことがある。前回値との差が病態の変化ではなく測定法の違いによるものである場合は、その旨をわかりやすく説明することが求められる。検査値の標準化が進むことは、施設をまたいでも一貫した臨床判断がしやすくなるという意味で、診療全体にとって大きな意義を持つ。"));
children.push(spacer());

children.push(column(
  "① なぜ内部精度管理「だけ」では不十分なのか",
  [
    p("内部精度管理がどれだけ厳密に運用されていても、それだけでは防げない種類のズレがある。たとえば、自施設の管理試料そのものの値付けがわずかにずれている場合や、試薬・キャリブレーターのロット全体に系統的な偏りがある場合である。この場合、自施設の管理図は「いつも通り安定している」ように見えてしまう(管理試料に対しては一貫した値が出るため)。このような「自施設の中だけでは気づけないズレ」を発見できるのが、外部の集団やtarget値と比較する外部精度評価の役割である。「内部精度管理で問題が見つからない=検査値が正確である」とは限らない、という点を国試でも問われることがあるので注意しておくこと。", { size: 20 }),
  ]
));
children.push(spacer());

children.push(column(
  "② 「順序」を変えて分かること",
  [
    p("このシリーズはもともと、8-A(管理図法)→8-B(患者データ法)→8-C(誤差論)という骨子案どおりの順で学ぶ構成だった。しかし「いきなり2-2sのようなルールの名前を覚えさせられても、そもそも何を検知したいのか分からない」という指摘を受け、誤差論(系統誤差・偶然誤差・正確さ・精密さという基礎語彙)を管理図法より先に学ぶ順序に変更した経緯がある。用語の意味を先に押さえてから個別の手法(管理図・患者データ法・サーベイ)に入ると理解しやすい、という学び方の一例として覚えておいてもよい。", { size: 20 }),
  ]
));
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
              children: [new TextRun({ text: "冒険の書　第8-9章　精度管理(試作)", size: 15, color: "AAAAAA" })],
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
  fs.writeFileSync(__dirname + "/8-9-精度管理.docx", buf);
  console.log("done");
});
