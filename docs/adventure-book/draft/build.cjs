const {
  Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell,
  WidthType, ShadingType, BorderStyle, AlignmentType, Header, Footer, PageNumber,
  VerticalAlign, convertInchesToTwip,
} = require("docx");
const fs = require("fs");

// ---------- helpers ----------

const COLOR = {
  accent: "8A5A2B",      // 焦げ茶(冒険の書らしい色)
  accentLight: "F5E9D8", // うすい生成り
  columnBg: "FDF3E3",    // コラム背景
  columnBorder: "C98A3B",
  warnBg: "FBEAE8",
  warnBorder: "B24C3F",
  tableHeadBg: "E9DDC4",
  tableAltBg: "FBF6EC",
  facilityBg: "EFE6F4",
  facilityBorder: "8B6BA8",
};

function h1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 320, after: 160 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: COLOR.accent, space: 4 } },
    children: [new TextRun({ text, bold: true, size: 32, color: COLOR.accent })],
  });
}

function h2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 260, after: 120 },
    children: [new TextRun({ text, bold: true, size: 26, color: "3E2C1C" })],
  });
}

function h3(text) {
  return new Paragraph({
    spacing: { before: 180, after: 80 },
    children: [new TextRun({ text, bold: true, size: 22, color: "5C3A1E" })],
  });
}

function p(text, opts = {}) {
  return new Paragraph({
    spacing: { after: 140, line: 300 },
    children: [new TextRun({ text, size: 21, ...opts })],
  });
}

function pRuns(runs, opts = {}) {
  return new Paragraph({ spacing: { after: 140, line: 300 }, ...opts, children: runs });
}

function bullet(text, opts = {}) {
  return new Paragraph({
    spacing: { after: 80, line: 280 },
    indent: { left: 340 },
    children: [new TextRun({ text: "・" + text, size: 21, ...opts })],
  });
}

// 表(項目名固定4列 or 可変)
function makeTable(headers, rows, widths) {
  const totalWidth = 9350; // A4本文幅の目安(twip)
  const colWidths = widths || headers.map(() => Math.floor(totalWidth / headers.length));

  const headerRow = new TableRow({
    tableHeader: true,
    children: headers.map((htext, i) => new TableCell({
      width: { size: colWidths[i], type: WidthType.DXA },
      shading: { type: ShadingType.CLEAR, fill: COLOR.tableHeadBg },
      verticalAlign: VerticalAlign.CENTER,
      margins: { top: 60, bottom: 60, left: 100, right: 100 },
      children: [new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: htext, bold: true, size: 19 })],
      })],
    })),
  });

  const bodyRows = rows.map((row, ridx) => new TableRow({
    children: row.map((cell, i) => new TableCell({
      width: { size: colWidths[i], type: WidthType.DXA },
      shading: { type: ShadingType.CLEAR, fill: ridx % 2 === 0 ? "FFFFFF" : COLOR.tableAltBg },
      verticalAlign: VerticalAlign.CENTER,
      margins: { top: 60, bottom: 60, left: 100, right: 100 },
      children: (Array.isArray(cell) ? cell : [cell]).map((line) =>
        typeof line === "string"
          ? new Paragraph({ children: [new TextRun({ text: line, size: 19 })] })
          : line
      ),
    })),
  }));

  return new Table({
    width: { size: totalWidth, type: WidthType.DXA },
    columnWidths: colWidths,
    rows: [headerRow, ...bodyRows],
  });
}

// コラム(発展編向け補足) — 1セルテーブルで色付き枠を作る
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

function sourceNote(text) {
  return new Paragraph({
    spacing: { before: 40, after: 160 },
    children: [new TextRun({ text: `出典: ${text}`, size: 16, color: "999999", italics: true })],
  });
}

function spacer(h = 160) {
  return new Paragraph({ spacing: { after: h }, children: [] });
}

// 図版差し込み枠
function figurePlaceholder(caption, heightTwip = 2000) {
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

// 国試型ミニ問題
function examQ(num, source, prompt, choices, answerIdx, explanation) {
  const qPara = new Paragraph({
    spacing: { before: 180, after: 80 },
    children: [
      new TextRun({ text: `Q${num}. `, bold: true, size: 21, color: COLOR.accent }),
      new TextRun({ text: prompt, size: 21 }),
    ],
  });
  const choiceParas = choices.map((c, i) => new Paragraph({
    spacing: { after: 40 },
    indent: { left: 400 },
    children: [new TextRun({ text: `${i + 1}. ${c}`, size: 20 })],
  }));
  const answerPara = new Paragraph({
    spacing: { before: 80, after: 40 },
    indent: { left: 400 },
    children: [new TextRun({ text: `正答: ${answerIdx}　${explanation}`, size: 19, italics: true, color: "555555" })],
  });
  const sourcePara = new Paragraph({
    spacing: { after: 200 },
    indent: { left: 400 },
    children: [new TextRun({ text: `出典: ${source}(改変)`, size: 16, color: "999999" })],
  });
  return [qPara, ...choiceParas, answerPara, sourcePara];
}

// ---------- content ----------

const children = [];

// 表紙相当
children.push(
  new Paragraph({
    spacing: { before: 200, after: 40 },
    children: [new TextRun({ text: "冒険の書 — 生化学・免疫ラボクエスト 資料集(試作章)", size: 20, color: "999999" })],
  }),
  new Paragraph({
    spacing: { after: 60 },
    children: [new TextRun({ text: "第4章　検体の性状と測定妨害", size: 24, bold: true, color: "5C3A1E" })],
  }),
  new Paragraph({
    spacing: { after: 240 },
    children: [new TextRun({ text: "4-A　溶血", size: 40, bold: true, color: COLOR.accent })],
  }),
  new Paragraph({
    spacing: { after: 300 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: "CCCCCC", space: 4 } },
    children: [new TextRun({ text: "対応小項目: a 成因　b 溶血指数　c 偽高値項目　d 偽低値項目　e 許容限界　f 報告方針", size: 17, color: "888888" })],
  })
);

children.push(p(
  "この資料は、臨地実習中に「調査」で確認する内容をまとめたものです。国家試験レベルの知識を、実習の場面に即して使えるところまで身につけることを目標にしています。本文だけで基本を押さえられるようにし、少し発展した内容は「コラム」で補っています。コラムは飛ばしても本文の理解に支障はありませんが、発展問題や国家試験の応用問題まで解けるようになりたい人は目を通してください。"
));

// a. 成因
children.push(h1("a　溶血の成因"));
children.push(p("溶血とは、赤血球の細胞膜が損傷を受け、赤血球内部の成分が血漿(血清)中に漏れ出す現象をいう。赤血球の中と外とでは成分の濃度が大きく異なるため、いったん溶血が起こると、その検体で測定するほぼすべての項目の値が本来の値からずれてしまう。"));
children.push(p("溶血は起こる場所によって2種類に分けて考える必要がある。"));

children.push(h3("① 体外溶血(検体としての溶血)"));
children.push(p("採血・搬送・保存・遠心など、検体が患者の体を離れてから測定されるまでの過程で人為的に起こる溶血。本章で扱う「溶血」は、原則としてこちらを指す。主な原因は次のとおり。"));
children.push(bullet("採血手技: 細い注射針での急激な吸引、駆血帯の締めすぎと長時間の駆血、採取した血液を勢いよく試験管へ注入して泡立てること"));
children.push(bullet("搬送: 気送管(エアシューター)での急激な加減速・振動による物理的な衝撃"));
children.push(bullet("遠心: 規定より強いG・長い時間での遠心、遠心前の長時間放置"));
children.push(bullet("保存: 検体の凍結(グリセロール処理をしていない赤血球を凍結すると膜が壊れて溶血する)、高温での放置"));

children.push(h3("② 体内溶血(疾患としての溶血)"));
children.push(p("患者の体の中で赤血球が壊れている状態。溶血性貧血をはじめとする疾患であり、検体としての溶血(体外溶血)とは原因も対応も異なる。ただし紛らわしいことに、体内で溶血が起きている患者の検体は、体外溶血がなくても血漿中の遊離ヘモグロビンが多く、外見上・測定上は溶血検体と似た挙動を示すことがある。両者の違いは章末のコラムで整理する。"));

children.push(figurePlaceholder("正常検体(左)と溶血検体(右)の遠心後の外観比較 ※実際の写真をここに挿入", 1800));

// b. 溶血指数
children.push(h1("b　溶血指数(H)の測定原理と表示"));
children.push(p("多くの自動分析装置は、検体を測定する際に二波長比色測定を行い、そこから演算によって「溶血指数(溶血度、H)」という相対値を算出して表示する機能を持っている。ヘモグロビンは特定の波長で強く吸光するため、その吸光度から血漿中の遊離ヘモグロビンのおおよその濃度を推定するしくみである。"));
children.push(p("溶血指数の表示のしかたは施設・機種によって異なり(段階表示、数値表示など)、統一された基準はない。以下の2点を必ず押さえておくこと。"));
children.push(bullet("① 標準化されていない相対値であるため、機種や施設が違えば同じ検体でも表示される値が異なりうる。他施設の基準をそのまま持ち込むことはできない。"));
children.push(bullet("② 溶血の程度と赤血球内成分の増分の関係はおおむね比例するが、必ずしも一致するとは限らない。たとえばLDだけが単独で高い場合、溶血以外の原因(悪性腫瘍など)が隠れている可能性もあり、「溶血指数が高いから異常値は無視してよい」と単純に判断するのは危険である。"));

// c. 偽高値
children.push(h1("c　偽高値となる項目"));
children.push(p("赤血球の中に多く含まれる成分ほど、少しの溶血でも血漿中の値が大きく底上げされる。赤血球内濃度が血漿中濃度の何倍あるかという「赤血球/血漿 濃度比」が、そのままその項目の溶血への鋭敏さの目安になる。"));

children.push(makeTable(
  ["項目", "赤血球/血漿\n濃度比(目安)", "溶血への\n鋭敏さ", "備考"],
  [
    ["LD(LDH)", "約160倍", "非常に高い", "溶血に最も敏感な項目。わずかな溶血でも上昇する。LD1・LD2が優位"],
    ["AST(GOT)", "約20〜40倍", "高い", "同じ酵素でもALTとは対照的(コラム①参照)"],
    ["酸性ホスファターゼ", "約67倍", "高い", ""],
    ["K(カリウム)", "約23倍", "高い", "パニック値の誤報告に直結しやすいので特に注意"],
    ["NSE(神経特異エノラーゼ)", "―", "高い", "腫瘍マーカー。溶血検体では再採血が必要になることが多い"],
    ["総蛋白(TP)", "約8.5倍", "中程度", "ヘモグロビン自体を蛋白として測り込むため、比色妨害を補正しても正誤差が残る"],
    ["ALT(GPT)", "約7倍", "低い", "「溶血の影響を受けない」と明記する教科書もある(コラム①参照)"],
    ["Mg・リン(無機リン)", "―", "中程度", "赤血球内にも一定量含まれるため、強い溶血でやや上昇しうる"],
    ["鉄(Fe)", "―", "低い(測定法に依存)", "赤血球内濃度は高いが、多くの測定法はトランスフェリン結合鉄のみを測るため実際の影響は小さい"],
  ],
  [1800, 1750, 1800, 4000]
));
children.push(sourceNote("出居真由美・三宅一徳「溶血の検査影響」『臨床検査』57巻11号 p.1422-1423、医学書院、2013(表1)/『臨床検査学講座 臨床化学検査学』第3版 表I-15(Caraway 1962による)、医歯薬出版"));

children.push(column(
  "当院は血清を使用 — この比率表は血漿基準であることに注意",
  [
    p("上の表の「赤血球/血漿 濃度比」は、いずれも血漿検体を基準にした古典的な数値(Caraway, 1962)であり、血清を基準にしたデータではない。当院のように血清を使用している場合、この比率をそのまま「血清でも同じ倍率で影響する」と読み替えないよう注意する。", { size: 20 }),
    p("血清は血漿に比べて、次の2つの理由でわずかに高値に出やすい項目がある(いずれも「溶血」そのものとは別の、血清特有の理由であることに注意)。", { size: 20 }),
    bullet("K(カリウム): 採血後に血液を凝固させる過程で、血小板などから凝固に伴いKが追加で放出されるため、血清Kは血漿Kよりわずかに高値になりやすい(血小板数が多い患者ほど差が出やすい)", { size: 20 }),
    bullet("LD: 血清を得る過程(凝固・血餅形成)は、血漿を得る過程(抗凝固剤を加えてすぐ遠心)よりも赤血球への機械的な負荷が大きく、機械的な赤血球破壊(=溶血)がより起こりやすい。そのぶんLDの偽高値も血清の方が生じやすい(第63回国家試験PM問13、f節コラム③も参照)", { size: 20 }),
    p("血清運用の施設では、この表の数値を「最低限これだけの倍率差がある」という目安として捉え、実際の許容限界は自施設のデータで確認することが望ましい。", { size: 20 }),
  ]
));
children.push(spacer());

children.push(column(
  "① AST は溶血で上がるのに、ALT はほとんど動かないのはなぜ?",
  [
    p("AST・ALTはどちらも「肝機能の指標」として並べて習う酵素だが、赤血球内での量には大きな差がある。ASTは肝細胞だけでなく心筋・骨格筋・赤血球にも比較的多く存在し、赤血球内では血漿の20〜40倍の濃度がある。一方ALTは肝細胞に選択的に多く、赤血球内の含量はASTよりずっと少ない(赤血球/血漿比は約7倍)。この分布の違いが、溶血に対する感受性の差としてそのまま表れる。", { size: 20 }),
    p("国家試験では「溶血検体でAST・ALTのどちらが変化するか」がしばしば問われる。「ASTは上昇するが、ALTはほとんど変化しない」という非対称性を、丸暗記ではなく赤血球内含量の違いから理解しておくと、選択肢の言い回しが変わっても対応できる。", { size: 20 }),
  ]
));
children.push(spacer());

// d. 偽低値
children.push(h1("d　偽低値となる項目"));
children.push(p("反対に、赤血球内にほとんど含まれない成分は、溶血によって血漿が実質的に「薄まる」形になり、見かけ上の値が下がる。また、赤血球から漏れ出した酵素(プロテアーゼ)が特定の物質を分解してしまうために低値になるケースもある。"));

children.push(makeTable(
  ["項目", "偽低値になる理由"],
  [
    ["Na(ナトリウム)", "赤血球内の濃度が血漿よりもずっと低いため、溶血により血漿が希釈されたのと同じ形になり、見かけ上低下する"],
    ["ビリルビン", "赤血球中にはほとんど存在しないため、Naと同じ理屈で相対的に薄まって低値になりうる。ただし測定法によって挙動が異なることがあり、一律に低値になるとは限らない"],
    ["インスリン・BNP・ACTHなどのペプチドホルモン", "赤血球から漏出したプロテアーゼによって分解され、偽低値になる"],
    ["ハプトグロビン", "遊離ヘモグロビンと結合する、体内溶血のときと同じ反応が採血後の検体内でも起こり、見かけ上低く出ることがある。※体内溶血で本当に消費されて下がる場合と紛らわしいので注意(コラム②参照)"],
  ],
  [2600, 6750]
));
children.push(sourceNote("出居真由美・三宅一徳「溶血の検査影響」『臨床検査』57巻11号 p.1422-1423、医学書院、2013"));

children.push(column(
  "② 「ハプトグロビン低値」には2つの意味がある",
  [
    p("ハプトグロビンは、血漿中に遊離したヘモグロビンと結合して処理する働きを持つ蛋白質である。この「ハプトグロビン低値」という所見は、次の2つの全く違う状況で起こりうる。", { size: 20 }),
    bullet("(1) 患者が溶血性貧血などで体内溶血を起こしている場合: 実際に体内で大量のヘモグロビンが遊離し、ハプトグロビンが結合・消費され尽くして本当に減っている(疾患の所見としてのハプトグロビン低値)", { size: 20 }),
    bullet("(2) 採血した検体そのものが溶血している場合: 体内溶血のときと同じ「ハプトグロビン+遊離ヘモグロビン」の結合反応が、採血後の試験管の中でも起こり、見かけ上低く出る(測定上のアーチファクトとしてのハプトグロビン低値)", { size: 20 }),
    p("同じ「ハプトグロビン低値」という結果でも、(1)は疾患を疑う所見、(2)は採血・検体のやり直しを検討すべき所見であり、意味がまったく異なる。結果を見るときは、検体の溶血指数と、他の検査値(LD・間接ビリルビン・網赤血球数など)を必ず合わせて確認する。", { size: 20 }),
  ]
));
children.push(spacer());

// e. 許容限界
children.push(h1("e　溶血の程度と許容限界の考え方"));
children.push(p("溶血があっても、その程度が小さく測定値への影響が無視できる範囲であれば、そのまま報告して差し支えない場合もある。どこまでを「許容範囲」とするかは、各項目の測定原理や、施設が設定している精度目標によって異なる。"));
children.push(p("一方で、次のような項目は、わずかな溶血でも測定値が大きく動くため、「溶血を起こさないこと」自体が最大の対策になる。"));
children.push(bullet("黄疸指数、血漿ヘモグロビン値そのもの"));
children.push(bullet("各種酵素活性(LD・ASTなど)"));
children.push(bullet("K(カリウム)、Mg(マグネシウム)"));
children.push(bullet("総コレステロール、鉄 など"));
children.push(p("溶血による妨害を客観的に確認する標準的な方法として、ヘモグロビン純品を使った干渉チェック用試薬を用い、濃度を変えながら測定値がどう動くかを見る「用量反応的な確認」がある。この結果と、b節で述べた自動分析装置の溶血指数とを組み合わせて、施設ごとの許容限界(判定基準)を設定する。"));

children.push(column(
  "許容限界は施設ごとに違う",
  [p("同じ項目でも、使っている試薬・測定原理・分析装置が違えば、溶血の影響の出方も変わる。したがって「K検体は溶血指数がいくつまでなら報告してよいか」といった具体的な数値基準は、施設ごとに個別に定められている。教科書の一般論を丸暗記するのではなく、自施設の基準・SOPを確認して優先することが重要である。", { size: 20 })],
  { warn: true }
));
children.push(spacer());

children.push(column(
  "◆ 当院の例 溶血指数と受け入れ基準の実際",
  [
    p("当院の検体受け入れ基準では、溶血の程度を溶血指数(H値)で数値化し、次のように扱いを分けている。", { size: 20 }),
    bullet("溶血指数30以上、または目視で強溶血と判断できる検体は、原則として受け入れ不適合とし、再採血を依頼する。ただし、依頼が特定の項目(下記の「再採血不要」項目)だけだった場合は、この強溶血の基準に該当していても再採血は不要という例外がある。", { size: 20 }),
    bullet("溶血指数20以上の検体では、項目によって再採血の要否がさらに細かく分かれる。K・AST・LD、そしてインスリン・ACTH・BNPといったペプチドホルモン類は再採血が必要になる(インスリン・ACTH・BNPが再採血対象に入っているのは、d節で述べた「赤血球から漏出したプロテアーゼによる分解」という、K・AST・LDとは別の機序で影響を受けるためである)。一方、CEA・AFP・CA19-9・CA125・CA15-3・PSA・SCC抗原・ProGRP・シフラといった腫瘍マーカー類と、当院で使っている特定の免疫測定装置(ARCHITECT)で測る項目は、強い溶血があっても再採血不要という扱いになっている。", { size: 20 }),
    p("注意したいのは、この「再採血不要」の腫瘍マーカー群に、c節で名前を挙げたNSE(神経特異エノラーゼ)は含まれていない点である。NSEは腫瘍マーカーではあるが、エノラーゼという酵素そのものが赤血球内に大量に存在するため、LDやASTと同じ「赤血球内成分の混入」で本当に値が動いてしまう。同じ「腫瘍マーカー」でも、抗原の量が赤血球にほとんど無いために測定原理上ほぼ影響を受けないもの(CEA・AFP等)と、赤血球内の含有量が多いために影響を受けるもの(NSE)とがあり、一律に「腫瘍マーカーだから溶血に強い」とはいえないことがこの例からも分かる。教科書の一般論(c・d節の表)と、自施設が実際に定めている数値基準・項目別の扱い(この例)は、混同せず別々に押さえておくこと。数値そのものは自施設のSOPで必ず確認すること。", { size: 20 }),
  ]
));
children.push(spacer());

// f. 報告方針
children.push(h1("f　溶血検体の報告方針"));
children.push(p("溶血が疑われる検体を扱うときの基本的な流れは、おおむね次のとおりである。"));
children.push(bullet("① 検体情報(溶血の有無・程度)と、測定結果(異常値・パニック値の有無)を確認する"));
children.push(bullet("② 溶血がある場合は検体そのものを目視でも確認し、ない場合は前回値と比較する"));
children.push(bullet("③ パニック値・異常値が出ている項目については、反応過程(タイムコース)を確認し、必要に応じて再検する"));
children.push(bullet("④ 異常反応が疑われる場合、生理食塩水などで希釈しての再測定、添加回収試験、測定原理の異なる方法での確認、のいずれかで妨害の有無を精査する"));
children.push(bullet("⑤ 報告が遅れる場合は状況を担当医へ速やかに連絡し、最終結果が出たら改めて連絡する"));
children.push(p("最終的にとる対応は、大きく分けて「再採血を依頼する」「コメントを付けて報告する」「報告を見合わせて確認を急ぐ」の3通りがある。どれを選ぶかは、溶血の程度、項目の重要度・緊急度、再採血のしやすさなど複数の要素で決まり、施設ごとに手順が異なる。臨地実習では、自施設(実習先)の手順を確認し、それを最優先することを徹底すること。"));

children.push(column(
  "◆ 当院の例 検体の性状異常と確認方法の対応表",
  [
    p("当院では、パニック値など緊急性の高い異常値に遭遇した際、検体の性状ごとに「何が影響を受けうるか」「どう確認するか」をあらかじめ対応づけている。溶血であればKへの影響を疑い検体の色調と溶血指数を確認する、フィブリン析出であれば血小板数への影響を疑い鏡検で凝集の有無を確認する、検体の凝固であれば血小板数・Hb・血液ガスへの影響を疑い目視で確認する、といった具合である。本節②の「検体そのものを目視でも確認する」という手順を、実際の業務でどう具体化するかの一例として参考にするとよい。", { size: 20 }),
  ]
));
children.push(spacer());

children.push(column(
  "③ 血清と血漿で、LDの偽高値の出方は同じ?",
  [
    p("採血管の種類(血清用・血漿用)によっても、溶血の影響の出方に違いが生じることがある。国家試験でも「血清と比較した血漿検体の特徴」として、血漿のほうがLDの偽高値が起こりにくいという趣旨の内容が問われたことがある。", { size: 20 }),
    p("これは、血清を得る過程(いったん凝固させてから遠心する)が、血漿を得る過程(抗凝固剤を加えてすぐ遠心する)よりも赤血球への機械的な負荷が大きく、機械的な赤血球破壊(=溶血)がより起こりやすいためと考えられている。採血管の選択自体が、後工程である「溶血の影響」にまでつながっているという例として覚えておくとよい(b節コラムも参照)。", { size: 20 }),
  ]
));
children.push(spacer());

// ---- コラム: 体外溶血 vs 体内溶血、HbA1cの例 ----
children.push(column(
  "④ 体内溶血がHbA1cを下げる、というもう一つの「溶血の影響」",
  [
    p("ここまでは「検体そのものが溶血する」場合の話をしてきたが、国家試験では「患者が溶血性貧血である場合、HbA1cはどうなるか」という形で、体内溶血の影響を問う問題も頻出する。答えは「低値になる」である。", { size: 20 }),
    p("HbA1cは、赤血球中のヘモグロビンにブドウ糖がゆっくり結合してできる。赤血球の寿命が通常どおりであれば、結合する時間も一定に保たれる。ところが溶血性貧血では赤血球の寿命が短くなるため、ブドウ糖が結合する時間も短くなり、HbA1cは低めに出てしまう。", { size: 20 }),
    p("これは検体の溶血(本章c・d節の話)とは原因も機序もまったく別の現象だが、「溶血」という同じ言葉が使われるため混同しやすい。両者の違いを問う応用問題はアプリの発展ドリルで確認しよう。", { size: 20 }),
  ]
));
children.push(spacer());

// ---- 付録: この章の参照コード ----
children.push(h1("(付録)この章の参照コード"));
children.push(p("この本は「a・b・c…」の小項目コードと「①②③④…」のコラム番号を、章をまたいでも変わらない住所として使っています。ページ番号は版によってずれることがありますが、これらのコードは本文の並び順を大きく組み替えない限り変わりません。アプリの調査クエストで「資料の◯◯を見る」と指示するときは、ページ番号ではなくこのコードで指定します(例:「冒険の書 4-A-c を見よ」)。"));
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
              children: [new TextRun({ text: "冒険の書　第4章-A　溶血(試作)", size: 15, color: "AAAAAA" })],
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
  fs.writeFileSync(__dirname + "/4A-溶血.docx", buf);
  console.log("done");
});
