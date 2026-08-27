const {
  Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell,
  WidthType, ShadingType, BorderStyle, AlignmentType, Header, Footer, PageNumber,
  VerticalAlign,
} = require("docx");
const fs = require("fs");

// ---------- helpers (4A-溶血/22A-パニック値/2-採血管/8-9-精度管理/21-患者データ build script と共通の様式) ----------

const COLOR = {
  accent: "8A5A2B",
  columnBg: "FDF3E3",
  columnBorder: "C98A3B",
  warnBg: "FBEAE8",
  warnBorder: "B24C3F",
  tableHeadBg: "E9DDC4",
  tableAltBg: "FBF6EC",
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

function makeTable(headers, rows, widths) {
  const totalWidth = 9350;
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
        children: [new TextRun({ text: htext, bold: true, size: 18 })],
      })],
    })),
  });

  const bodyRows = rows.map((row, ridx) => new TableRow({
    children: row.map((cell, i) => new TableCell({
      width: { size: colWidths[i], type: WidthType.DXA },
      shading: { type: ShadingType.CLEAR, fill: ridx % 2 === 0 ? "FFFFFF" : COLOR.tableAltBg },
      verticalAlign: VerticalAlign.CENTER,
      margins: { top: 50, bottom: 50, left: 90, right: 90 },
      children: (Array.isArray(cell) ? cell : [cell]).map((line) =>
        typeof line === "string"
          ? new Paragraph({ children: [new TextRun({ text: line, size: 18 })] })
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
    children: [new TextRun({ text: "第16章　疾患マーカー", size: 32, bold: true, color: COLOR.accent })],
  }),
  new Paragraph({
    spacing: { after: 300 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: "CCCCCC", space: 4 } },
    children: [new TextRun({ text: "対応大項目: 16 疾患マーカー", size: 17, color: "888888" })],
  })
);

children.push(p(
  "この資料は、臨地実習中に「調査」で確認する内容をまとめたものです。国家試験レベルの知識を、実習の場面に即して使えるところまで身につけることを目標にしています。本文だけで基本を押さえられるようにし、少し発展した内容は「コラム」で補っています。コラムは飛ばしても本文の理解に支障はありませんが、発展問題や国家試験の応用問題まで解けるようになりたい人は目を通してください。"
));
children.push(p(
  "本章は、A心不全・心筋マーカー→B腫瘍マーカー、という骨子案の順に進む。いずれも「その数値がどんな病態を反映するマーカーなのか、そしてどこまで信じてよいのか」を扱う点で共通している。"
));
children.push(p(
  "2026-08-27改訂: 骨子案の再構成により、本章はもともと中項目Cとして含んでいたPOCTを分割し、Ⅱ検査プロセスの最後に位置する独立した大項目20「POCT」(第20章)へ移した。POCTについては第20章を参照。",
  { color: "888888", size: 19 }
));
children.push(spacer());

// ============ A ============
children.push(h1("A　心不全・心筋マーカー"));

children.push(h2("A-a　BNP と NT-proBNP(産生機序、採血管の違い)"));
children.push(p("BNPは、心室に負荷がかかると分泌が増えるプロホルモン、proBNPが体内で切断されて生じる活性型ホルモンである。切断時に生じるもう一方の断片が、不活性なN末端フラグメントであるNT-proBNPである。両者は起源(proBNP)は同じだが、性質は大きく異なる。"));
children.push(p("BNPは活性型ホルモンで半減期が短く(約20分)、プロテアーゼによる分解を防ぐためEDTA血漿での測定が必要で、室温での安定性も低めである。一方NT-proBNPは不活性で半減期が長く(おおむね60〜120分程度とされる)、血清・血漿いずれでも測定可能で室温でも比較的安定している。この違いが、採血管や保存条件の使い分けに直結する。"));

children.push(figurePlaceholder(
  "proBNPの切断とBNP・NT-proBNPの産生模式図(心室の負荷→proBNP合成・分泌→酵素による切断→活性型BNPと不活性なNT-proBNPに分かれる過程を示す図) ※教科書等の図を挿入"
));

children.push(h2("A-b　心不全診断・重症度評価におけるカットオフと解釈"));
children.push(p("カットオフ値をそのまま当てはめてよいわけではない。NT-proBNPは主に腎から排泄されるため、腎機能が低下していると特に上昇しやすくなる。BNPも腎機能低下の影響で上昇する傾向があるが、主なクリアランス経路は受容体を介した分解であり、NT-proBNPほど腎機能への依存度は高くない。また高齢であっても両者は上昇しやすくなる。一方、肥満患者では脂肪組織によるクリアランス亢進などのため値が低下しやすく、心不全があっても値が「見かけ上低く」出て見逃されるおそれがある。年齢・腎機能・体格を考慮してカットオフを解釈する必要があり、採用しているアッセイやカットオフも施設によって異なる。"));

children.push(column(
  "① BNP/NT-proBNPの具体的なカットオフ値",
  [p("日本心不全学会は2023年に「血中BNPやNT-proBNPを用いた心不全診療に関するステートメント」を改訂し、次のような目安を示している。基準値(潜在的な心不全の可能性が極めて低い)はBNP 18.4 pg/mL以下・NT-proBNP 55 pg/mL以下。心不全の可能性がある(前心不全を含め、循環器専門医への紹介を検討する)目安はBNP 35 pg/mL以上・NT-proBNP 125 pg/mL以上である(2013年版のBNP 40・NT-proBNP 400からの引き下げで、国際的な定義との整合や、左室駆出率が保たれた心不全〈HFpEF〉の早期発見を意識した改訂とされる)。ただしこれらはあくまで「疑うべきかどうか」の目安であり、確定診断は心エコーなど他の検査とあわせて行う。A-bで触れた腎機能・年齢・肥満による変動を踏まえたうえで解釈する必要があり、採用しているアッセイ・カットオフは自施設の運用を優先して確認すること(出典: 日本心不全学会「血中BNPやNT-proBNPを用いた心不全診療に関するステートメント2023年改訂版」)。", { size: 20 })]
));
children.push(spacer());

children.push(h2("A-c　高感度心筋トロポニン T/I"));
children.push(p("急性冠症候群が疑われる場面では高感度心筋トロポニンT/Iが用いられる。これは心筋壊死を反映するマーカーで、発症からの時間経過に伴う上昇パターン(0/1hアルゴリズムなど、来院時〈0時間〉と1時間後の2時点の値とその変化量から急性心筋梗塞の可能性を判定する手法)を見て判断する。心負荷を反映するBNP/NT-proBNPとは評価する病態が異なる点を、両者を混同しないためにも押さえておきたい。"));

children.push(column(
  "② 国家試験に見る「心不全の指標」",
  [p("第60回国家試験(前半)では「心不全の指標として適切なのはどれか」という設問に、AST・BNP・CK-MB・トロポニンT・ミオグロビンの5つが選択肢として並んだ。正解はBNPで、他の4つ(AST・CK-MB・トロポニンT・ミオグロビン)はいずれも心筋の壊死・障害を反映する逸脱酵素・蛋白であり、心臓に負荷がかかっているかどうかを示すBNPとは評価している病態が異なる。「心臓のどんな異常を見ているマーカーなのか」を区別する視点が問われた設問である。", { size: 20 })]
));
children.push(spacer());

// ============ B ============
children.push(h1("B　腫瘍マーカー"));

children.push(h2("B-a・B-b　代表的な腫瘍マーカーと対応臓器・組織型"));
children.push(p("腫瘍マーカーには、それぞれおおよそ対応する臓器・組織型がある。代表的なものを次に示す。"));

children.push(figurePlaceholder(
  "腫瘍マーカーの臓器別対応図(人体のシルエットに各臓器を配置し、対応する腫瘍マーカー名を吹き出しで示す図) ※教科書等の図を挿入"
));

children.push(makeTable(
  ["マーカー", "主な対応臓器・組織型"],
  [
    ["AFP", "肝細胞癌"],
    ["CEA", "大腸癌など消化器癌(複数臓器で上昇しうる)"],
    ["CA19-9", "膵癌・胆道癌"],
    ["CA125", "卵巣癌"],
    ["PSA", "前立腺癌"],
    ["PIVKA-Ⅱ", "肝細胞癌"],
    ["SCC", "扁平上皮癌(子宮頸部・肺・食道など)"],
    ["ProGRP", "肺小細胞癌"],
  ],
  [2200, 7150]
));
children.push(spacer());

children.push(p("ただし、マーカーの上昇=がん、と単純には言えない。以下のB-c・B-dで扱う偽陽性・偽陰性の要因を踏まえて解釈する必要がある。"));

children.push(h2("B-c　偽陽性要因"));
children.push(p("CEAは喫煙によっても上昇することが知られており、多くのマーカーは肝疾患などの良性疾患でも上昇することがある。CA125は月経・妊娠・子宮内膜症といった良性婦人科疾患でも上昇し、PSAは直腸診やカテーテル留置など前立腺への機械的刺激でも上昇しうるため、採血前の状況にも注意が必要である。"));

children.push(h2("B-d　偽陰性要因"));
children.push(p("がんがあっても上昇しない偽陰性もある。たとえばLewis式血液型陰性の人はCA19-9を産生する酵素を欠くため、膵癌があってもCA19-9がほとんど上昇しないことがある。"));

children.push(h2("B-e　スクリーニングではなく経過観察に用いる理由"));
children.push(p("腫瘍マーカーは感度・特異度が十分に高くないため、単独で健常者を対象としたスクリーニングに用いるのには適さず、主に治療効果の判定や再発の有無を追う経過観察に用いられる。"));

children.push(column(
  "③ 「臓器特異性の高さ」というものさし",
  [p("腫瘍マーカーは、対応する臓器がどれだけ絞り込めるかという「臓器特異性」の高さにも幅がある。たとえばPIVKA-Ⅱは肝細胞癌に対する臓器特異性が比較的高いマーカーとされる一方、CEAは大腸癌をはじめ、肺癌・胃癌・膵癌・乳癌など複数の臓器のがんで上昇しうる、臓器特異性の低い(汎用性の高い)マーカーである。第60回国家試験(前半)では「臓器特異性の高い腫瘍マーカーはどれか」という設問に、CEA・SCC・CA15-3・CA19-9・PIVKA-Ⅱの5つが選択肢として並び、正解はPIVKA-Ⅱとされる。臓器特異性が高いマーカーは特定の臓器のがんを疑う手がかりとして使いやすい一方、臓器特異性が低いマーカーは複数のがんや良性疾患でも動くため、B-c・B-dで扱った偽陽性・偽陰性の幅もより広くなりやすい、という関係を押さえておくとよい。", { size: 20 })]
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
              children: [new TextRun({ text: "冒険の書　第16章　疾患マーカー(試作)", size: 15, color: "AAAAAA" })],
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
  fs.writeFileSync(__dirname + "/16-疾患マーカー.docx", buf);
  console.log("done");
});
