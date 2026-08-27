const {
  Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell,
  WidthType, ShadingType, BorderStyle, AlignmentType, Header, Footer, PageNumber,
} = require("docx");
const fs = require("fs");

// ---------- helpers (4A-溶血/22A-パニック値/2-採血管/8-9-精度管理/21-患者データ/16-疾患マーカー build script と共通の様式) ----------

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
    children: [new TextRun({ text: "第20章　POCT", size: 32, bold: true, color: COLOR.accent })],
  }),
  new Paragraph({
    spacing: { after: 300 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: "CCCCCC", space: 4 } },
    children: [new TextRun({ text: "対応大項目: 20 POCT", size: 17, color: "888888" })],
  })
);

children.push(p(
  "この資料は、臨地実習中に「調査」で確認する内容をまとめたものです。国家試験レベルの知識を、実習の場面に即して使えるところまで身につけることを目標にしています。本文だけで基本を押さえられるようにし、少し発展した内容は「コラム」で補っています。コラムは飛ばしても本文の理解に支障はありませんが、発展問題や国家試験の応用問題まで解けるようになりたい人は目を通してください。"
));
children.push(p(
  "2026-08-27新設: 本章はもともと大項目16「疾患マーカーとPOCT」の中項目Cだったが、骨子案の再構成により分割され、Ⅱ検査プロセスの最後に位置する独立した大項目20「POCT」となった。内容そのものは分割前と同じで、章の切り出しに伴い節番号をC-a〜dからA-a〜dへ振り直している。心不全・心筋マーカー(旧A)や腫瘍マーカー(旧B)は第16章「疾患マーカー」を参照。",
  { color: "888888", size: 19 }
));
children.push(spacer());

// ============ A ============
children.push(h1("A　POCT"));

children.push(h2("A-a　POCTの定義と設置場所"));
children.push(p("POCT(Point of Care Testing)は、患者のそばで実施する検査のことである。外来・病棟・救急・在宅など、中央検査室を介さずにその場で結果が得られる利点があり、迅速な治療判断につながる。"));
children.push(p("血糖のPOCT測定(病棟の簡易血糖測定器など)は、グルコースオキシダーゼ法やグルコースデヒドロゲナーゼ(GDH)法などの酵素反応を、電気化学的な電流変化や比色反応で検出する原理が主流である。"));

children.push(h2("A-b　イムノクロマトグラフィの原理と判定"));
children.push(p("血糖測定とは別に、抗原抗体反応を利用するイムノクロマトグラフィという原理のPOCTもある。インフルエンザ抗原検査や妊娠検査、心筋マーカーの迅速検査などに使われる。検体中の抗原(または抗体)が標識抗体と複合体を作り、テストライン上の捕捉抗体と結合してサンドイッチ形式で発色線を形成する仕組みで、テストラインの有無で陽性・陰性を判定する定性〜半定量的な検査である。コントロールラインの発色は検体が正しく展開したことを示す必須の確認点で、コントロールラインが発色しなければテストラインの結果にかかわらず判定は無効になる。血糖測定とは異なる原理であり、POCTと一括りにせず検査項目によって原理が異なることを押さえておく必要がある。"));

children.push(figurePlaceholder(
  "イムノクロマトグラフィの反応模式図(検体滴下→標識抗体との複合体形成→テストライン〈捕捉抗体〉での発色→コントロールラインでの発色、をストリップの断面とともに示す図) ※教科書等の図を挿入"
));

children.push(column(
  "① イムノクロマト法で使う検体の例",
  [p("イムノクロマトグラフィは検体の種類も項目によって異なる。第60回国家試験(後半)では「イムノクロマトグラフィによるインフルエンザウイルス検査用材料として適切なのはどれか」という設問に、鼻咽頭ぬぐい液・唾液・喀痰・胸水・胃液の5つが選択肢として並び、正解は鼻咽頭ぬぐい液である。ウイルスが増殖している気道粘膜から直接検体を採取することが、原理だけでなく検体採取の正しさもあわせて重要であることを示す一例である。", { size: 20 })]
));
children.push(spacer());

children.push(h2("A-c　POCT機器の精度管理と検査室の関与"));
children.push(p("血糖のPOCT機器の多くは全血を測定するのに対し、中央検査室は血漿(または血清)グルコースを測定する。赤血球内は血漿より水分含量が少ないため、全血血糖値は血漿血糖値よりおおむね10〜15%程度低く出ることがあるが、近年の機種の多くは内部で血漿換算補正を行っているため、この差はあらかじめ縮小されていることも多い。実務で問題になりやすいのはむしろヘマトクリット値の影響や、GDH-PQQ法を用いる一部の機器でのマルトース・腹膜透析液に含まれるイコデキストリンなどの糖類による偽高値である。"));
children.push(p("POCT機器も精度管理の対象であり、その管理・操作者への教育・記録の維持に検査室が関与することが求められる(この関与の範囲は施設によって異なる)。"));

children.push(h2("A-d　中央検査室との測定値差の説明"));
children.push(p("差が出ること自体が必ずしも異常を意味するわけではないが、許容範囲を超えて大きい場合は原因を確認する必要がある。測定原理の違い(全血か血漿か)、ヘマトクリットや妨害物質の影響、そしてPOCT機器の精度管理記録を順に確認し、乖離の理由を病棟や依頼元に説明できるようにしておくことが、検査室としての役割である。"));
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
              children: [new TextRun({ text: "冒険の書　第20章　POCT(試作)", size: 15, color: "AAAAAA" })],
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
  fs.writeFileSync(__dirname + "/20-POCT.docx", buf);
  console.log("done");
});
