const {
  Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell,
  WidthType, ShadingType, BorderStyle, AlignmentType, Header, Footer, PageNumber,
  VerticalAlign,
} = require("docx");
const fs = require("fs");

// ---------- helpers (4A-溶血/22A-パニック値 build script と共通の様式) ----------

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
    children: [new TextRun({ text, bold: true, size: 36, color: COLOR.accent })],
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

function bullet(text, opts = {}) {
  return new Paragraph({
    spacing: { after: 80, line: 280 },
    indent: { left: 340 },
    children: [new TextRun({ text: "・" + text, size: 21, ...opts })],
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

// ---------- content ----------

const children = [];

// 表紙相当
children.push(
  new Paragraph({
    spacing: { before: 200, after: 40 },
    children: [new TextRun({ text: "冒険の書 — 生化学・免疫ラボクエスト 資料集(試作章)", size: 20, color: "999999" })],
  }),
  new Paragraph({
    spacing: { after: 240 },
    children: [new TextRun({ text: "第2章　採血管と抗凝固剤", size: 40, bold: true, color: COLOR.accent })],
  }),
  new Paragraph({
    spacing: { after: 300 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: "CCCCCC", space: 4 } },
    children: [new TextRun({ text: "対応中項目: A 採血管の種類　B 採血管の採取順序　C 抗凝固剤・添加物の影響　D 血清と血漿の使い分け　E 採血量と充填", size: 17, color: "888888" })],
  })
);

children.push(p(
  "この資料は、臨地実習中に「調査」で確認する内容をまとめたものです。国家試験レベルの知識を、実習の場面に即して使えるところまで身につけることを目標にしています。本文だけで基本を押さえられるようにし、少し発展した内容は「コラム」で補っています。コラムは飛ばしても本文の理解に支障はありませんが、発展問題や国家試験の応用問題まで解けるようになりたい人は目を通してください。"
));

// ============ A 採血管の種類 ============
children.push(h1("A　採血管の種類"));
children.push(p("採血管は、中に入っている添加剤(抗凝固剤・凝固促進剤・解糖阻止剤など)によって用途が決まる。キャップの色は添加剤の種類を一目で見分けるための目印であり、JIS規格でおおまかな対応が決められているが、細かい色調・ラベル表記はメーカーや施設で異なることがある。ここでは代表的な種類を、何のために・どういう仕組みで使われるかとセットで整理する。"));

children.push(h2("a　プレイン管・血清分離剤入り管"));
children.push(p("プレイン管(無添加、または凝固促進剤のみ)は、採血した血液をそのまま凝固させ、遠心して上清の血清を得るための管である。血清分離剤入り管は、遠心すると血餅と血清の間に分離剤の層ができ、両者が混じらないように分けられる仕組みを持つ。凝固を早めるため、シリカ末やトロンビンなどの凝固促進剤が添加されていることが多い。生化学検査の多くは、この血清分離剤入り管(または後述するヘパリン血漿)で行われる。"));

children.push(h2("b　EDTA-2K／2Na管"));
children.push(p("EDTA(エチレンジアミン四酢酸)は、血液中のカルシウムイオンをキレート(捕捉)することで凝固を止める抗凝固剤である。カリウム塩(EDTA-2K)とナトリウム塩(EDTA-2Na)があり、どちらも同じ仕組みで抗凝固作用を持つが、対イオン(K・Na)が違うため、それぞれK・Naの測定には使えない(測定項目そのものに対イオンが混入し偽高値になるため)。血球算定・血液像など血液学的検査の標準的な抗凝固剤であり、免疫学的検査や一部のTDM(薬物血中濃度モニタリング)にも用いられる。"));

children.push(h2("c　ヘパリンリチウム／ナトリウム管"));
children.push(p("ヘパリンは、それ自体が凝固因子を直接阻害するのではなく、血漿中のアンチトロンビン(AT)と結合してその阻害活性を著しく増強し、活性化された凝固因子(トロンビン・第Xa因子など)を間接的に阻害することで抗凝固作用を発揮する。EDTAのように金属イオンを強くキレートする働きは無いため、多くの生化学的な測定への影響が少なく、生化学検査用の血漿(ヘパリン血漿)を得るのに広く使われる。対イオンにはリチウム塩とナトリウム塩があり、生化学検査(特に電解質を含む項目)にはヘパリンリチウムが使われることが多い。これはヘパリンナトリウムを使うと、管から溶け出したナトリウムが測定対象のNa値に上乗せされてしまうためである。逆に、リチウム製剤(炭酸リチウムなど)の血中濃度をモニタリングする場合は、ヘパリンリチウム管を使うとリチウムの値そのものが偽高値になってしまうため使用できず、ヘパリンナトリウム管など他の抗凝固剤を用いる。"));
children.push(p("なお、ヘパリンは金属を強くキレートするわけではないものの、血漿中のカルシウムイオンの一部と弱く結合する性質があり、通常濃度のヘパリンではイオン化カルシウムの測定値をわずかに低くしてしまうことが知られている。そのためイオン化カルシウムや血液ガスの測定専用の採血管には、通常の生化学用ヘパリン管とは別に、ヘパリン濃度を低く抑えた「低濃度ヘパリン」や、あらかじめカルシウムを添加して結合分を補ってある「カルシウム調整済みヘパリン」といった専用の製剤が使われる。「ヘパリンだから金属の影響は無視できる」と一律に考えず、測定したい項目がカルシウムそのものである場合は特別な配慮が必要になる点を押さえておくこと。"));

children.push(h2("d　クエン酸ナトリウム管(3.2%、1:9)"));
children.push(p("クエン酸ナトリウムも、カルシウムをキレートして凝固を止める抗凝固剤である。凝固機能検査(PT・APTTなど)には、血液と抗凝固剤の体積比が9:1になるよう、あらかじめ一定量の3.2%クエン酸ナトリウム液が入った専用管が使われる。この比率は凝固反応にカルシウムを再添加して測定するという凝固検査の原理上厳密に決められており、規定の線まで正確に採血しないと、抗凝固剤の相対的な割合が変わって結果に影響する(採血量の過不足の影響はE節で扱う)。なお、赤血球沈降速度(赤沈、ESR)の検査には、同じクエン酸ナトリウムでも3.8%の濃度・別の比率の専用管が使われることがあり、凝固検査用のクエン酸管とは別物である。"));

children.push(h2("e　フッ化ナトリウム(NaF)+解糖阻止剤管"));
children.push(p("血液中の血球(特に赤血球・白血球)は、採血後もしばらく解糖(ブドウ糖の消費)を続けるため、何も対策しない検体では血糖値が徐々に低下していく。NaF(フッ化ナトリウム)は解糖系の酵素を阻害することでこれを防ぐ。ただしNaFの効果は採血直後から完全に働くわけではなく、効果が十分に現れるまでには一定の時間を要する。血糖専用の採血管は、NaFと合わせて別の抗凝固剤(EDTAなど)を組み合わせて作られていることが多い。"));

children.push(h2("f　微量元素用・特殊採血管"));
children.push(p("亜鉛・銅・セレンなどの微量元素を測定する場合は、採血管や添加剤に含まれるごく微量の金属イオンでも結果に影響しうるため、専用に清浄化された採血管を用いる。同様に、光で分解されやすい成分(一部のビタミンなど)を測定する場合は遮光性の採血管を用いる。いずれも、目的の項目にとって「余計な混入源にならない」ことを最優先に作られた特殊管である。"));

children.push(p("◆ 当院の例(採血管一覧の抜粋)", { bold: true, color: COLOR.accent }));
children.push(p("当院で実際に使われている採血管の一部を、キャップ・添加剤・主な検査項目とともに挙げる(容器番号は当院独自のもの)。"));
children.push(makeTable(
  ["容器名称の例", "添加剤", "主な検査項目"],
  [
    ["血清用(シリカ/トロンビン+分離剤)", "凝固促進剤+分離剤", "生化学項目"],
    ["紫蓋", "EDTA-2K", "血球計算・血液像、サイクロスポリン、タクロリムス"],
    ["灰蓋", "EDTA-2K+フッ化ナトリウム", "血糖、HbA1c"],
    ["黒蓋", "クエン酸ナトリウム", "凝固線溶検査、血小板凝集能"],
    ["赤沈用", "3.8%クエン酸ナトリウム", "赤血球沈降速度"],
    ["濃紫蓋", "EDTA-2K", "血液型、不規則性抗体、クロスマッチ"],
    ["桃蓋(2mL)", "EDTA-2K", "BNP"],
    ["桃蓋(7mL)", "EDTA-2K", "PTH-intact、ACTH、レニン活性"],
    ["濃緑蓋", "ヘパリン", "トロポニンなど、染色体検査"],
    ["ヘパリンナトリウム管(5mL)", "ヘパリンナトリウム(カルシウム測定用)", "イオン化カルシウム"],
    ["ヘパリンナトリウム管(10mL)", "ヘパリンナトリウム", "染色体・DLST"],
    ["黄緑蓋", "EDTA-2Na(アプロチニン入り)", "ANP、膵グルカゴン"],
    ["ビタミン用(遮光)", "EDTA-2K", "ビタミンB1・B2"],
  ],
  [2600, 3400, 3350]
));
children.push(p("この一覧を見ると、教科書で習う「EDTA管・ヘパリン管・クエン酸管」という大分類の中にも、当院では検査項目ごとにさらに細かく専用管を使い分けていることが分かる(たとえば同じEDTA-2K管でも、血球算定用・BNP用・ホルモン用でボリューム・容器番号が別になっている)。実習では、教科書の一般的な分類と、実習先で実際に使われている個々の採血管の対応関係を、容器一覧などで確認しておくとよい。実際の色調・容器番号は施設・メーカーによって異なるため、必ず自施設の検査案内・容器一覧を確認すること。"));

children.push(column(
  "① ヘパリンナトリウム管が「使われない」わけではない",
  [
    p("c節で「生化学にはヘパリンリチウムが使われることが多い」と説明したが、これは常にそうというわけではない。当院の例でも、イオン化カルシウムの測定や染色体検査にはヘパリンナトリウム管が使われている。染色体検査はナトリウム値そのものを測るわけではないため対イオンの種類は問題にならず、ヘパリンナトリウムで差し支えない。イオン化カルシウムの測定でヘパリンナトリウムが使われているのも、対イオンがナトリウムであること自体は妨害にならないためだが、c節末尾で述べたとおり、イオン化カルシウム用のヘパリン管は通常の生化学用ヘパリン管とは異なり、ヘパリン自体のカルシウム結合による影響を抑えた専用の製剤(低濃度ヘパリンやカルシウム調整済みヘパリンなど)が使われているのが一般的である。「ヘパリンなら必ずリチウム塩」ではなく、測定したい項目にナトリウムやリチウムが含まれるかどうか、さらにカルシウムそのものを測る場合は専用製剤が必要かどうかで、そのつど適切な抗凝固剤が選ばれている点を理解しておくとよい。", { size: 20 }),
  ]
));
children.push(spacer());

// ============ B 採血管の採取順序 ============
children.push(h1("B　採血管の採取順序"));

children.push(h2("a　推奨される採取順序とその根拠"));
children.push(p("複数の採血管を使う場合、各国のガイドライン(日本では「標準採血法ガイドライン」)に沿った推奨採取順序がある。一般に広く教えられている順序は、血液培養→凝固(クエン酸Na)→血清(プレーン・分離剤)→ヘパリン→EDTA→解糖阻止剤(NaF)である。この順序の考え方は、「添加剤による汚染(下記b)を受けやすい検査・添加剤の影響が結果に直結しやすい検査ほど先に採る」というものである。特に血液培養は微生物汚染を避けるため最優先で、凝固検査はごく微量の他の抗凝固剤の混入でも結果が大きく狂うため、添加剤の入った他の管より先に採る。"));

children.push(h2("b　添加物の持ち込み(キャリーオーバー)による誤差"));
children.push(p("1回の採血で複数の管を使うとき、同じ採血針(またはホルダー)を通して次々に採血すると、先に採った管の添加剤がごく微量、次の管に持ち込まれることがある。これを「キャリーオーバー」という。たとえばEDTA管を先に採り、その後に生化学用の血清管を採ると、微量のEDTAが血清側に持ち込まれ、Caなどが偽低値になることがある。推奨される採取順序は、このキャリーオーバーの影響が最小になるよう設計されている。"));

children.push(h2("c　順序違反が生じたときの影響項目の推定"));
children.push(p("順序を誤った疑いがある検体では、「どの管が先だったか」から「何が偽の異常値として出やすいか」を逆算して考えることができる。たとえばEDTA管の後に採った管でCa・Mg・鉄が説明のつかない低値を示している、あるいはKだけが説明のつかない高値を示している場合は、EDTAの持ち込みを疑う。原因不明の異常値を見たときは、測定そのものだけでなく、採血管の種類・採取順序・キャリーオーバーの可能性も確認する視点が欠かせない。"));

children.push(column(
  "「順序」には複数の意味がある",
  [
    p("一般的な採血の順序(異なる種類の管を汚染なく採るための順序)と、QFT(クオンティフェロン)のような専用キットの中での管の順序(免疫応答を一定の条件で調べるための順序)は、目的も理由もまったく別の話である。当院のQFT専用管の場合、灰色→緑色→黄色→紫色という決められた順で採取するが、これはキャリーオーバー対策ではなく、キットの検査原理上の理由による。「順序」という言葉が出てきたら、それが複数の検査項目間のキャリーオーバー対策なのか、単一の検査キット内の手順なのかを区別すること。", { size: 20 }),
  ],
  { warn: true }
));
children.push(spacer());

// ============ C 抗凝固剤・添加物の影響 ============
children.push(h1("C　抗凝固剤・添加物の影響"));

children.push(h2("a　EDTA→Ca・Mg・ALP・鉄の偽低値、Kの偽高値"));
children.push(p("EDTAはカルシウムだけでなく、Mg(マグネシウム)などの二価金属イオンも広くキレートする。ALP(アルカリホスファターゼ)は反応にMgを補因子として必要とする酵素であるため、EDTAが持ち込まれるとMgが奪われ、ALPの酵素活性が偽低値になる。鉄も同様にキレートされて偽低値になる。一方でKは、EDTA-2K管であればカリウム塩そのものが持ち込まれるため偽高値になる(EDTA-2Naの場合はNaが偽高値になる)。「金属をキレートする項目は軒並み低値、対イオンの元素だけは逆に高値」という向きの違いを整理しておくこと。"));

children.push(h2("b　ヘパリン→蛋白分画のβ-γブリッジ様所見、一部免疫測定の干渉"));
children.push(p("ヘパリンを使った血漿検体をそのまま蛋白分画(電気泳動)にかけると、血清にはないフィブリノゲンが泳動パターン上でβ分画とγ分画の間に山を作り、あたかも両者がつながった(ブリッジ様の)所見に見えることがある。これは異常蛋白ではなくフィブリノゲンによる見かけ上の所見であるため、蛋白分画は血清で行うのが原則である。また、ヘパリンは一部の免疫測定法において、抗原抗体反応や標識酵素の反応を妨害することが知られており、測定法によっては血清の使用が推奨される場合がある。"));

children.push(h2("c　NaF→解糖阻止の機序と限界(初期数時間は完全でない)"));
children.push(p("NaFは解糖系酵素の働きを阻害することで血糖値の低下を防ぐが、採血直後からただちに完全に効くわけではない。当院の例では、採血から遠心分離までは1時間以内に行うことを目安とし、NaFを加えていてもこの間に血糖値が1〜5 mg/dL程度低下しうるとされている。この具体的な時間・変動幅はあくまで当院の目安であり、NaFの濃度や気温、使用する分析機器・試薬によって変わりうるため、他施設でそのまま当てはまるとは限らない。いずれにせよ、NaF管であっても「採血後すぐに遠心すれば安心、いつまで放置しても平気」というわけではなく、できるだけ早く遠心・測定することが望ましいという原則は共通しており、具体的な許容時間は自施設の基準を確認すること。"));

children.push(h2("d　クエン酸→希釈効果(ヘマトクリット高値時の補正)"));
children.push(p("クエン酸ナトリウム管は、あらかじめ一定量の液状の抗凝固剤(クエン酸ナトリウム液)が入っているため、採血した血液がその分だけ薄まる形になる(希釈効果)。通常はこの希釈率を織り込んで基準値が設定されているが、ヘマトクリット(Ht)が極端に高い患者(多血症など)や極端に低い患者では、血漿成分に対する血球成分の比率が通常と大きく異なるため、既定の抗凝固剤量では希釈率がずれてしまう。そのため、Htが基準範囲から大きく外れる場合は、採取するクエン酸液の量を補正する必要があるとされている。"));

children.push(h2("e　血清分離剤への薬物の吸着(TDM)"));
children.push(p("血清分離剤(ゲル)には、一部の脂溶性の高い薬物が吸着してしまう性質がある。TDM(薬物血中濃度モニタリング)で測定する薬物の中には、分離剤付き採血管を使うと薬物濃度が本来より低く出てしまうものが知られており、そのような薬物では分離剤の入っていない専用の採血管が指定されることがある。TDM検体を扱うときは、対象の薬物に指定された採血管を使っているかを必ず確認する。"));

children.push(column(
  "② EDTAは「キレート」以外の仕組みでも影響する: EDTA依存性偽性血小板減少",
  [
    p("a節で説明したEDTAの影響は、金属をキレートすることによる偽低値・偽高値だった。しかしEDTAには、キレートとはまったく別の仕組みで検査値をゆがめる、よく知られた現象がある。ごく一部の患者では、EDTAが血液中に入ることをきっかけに血小板同士が凝集塊を作ってしまい、自動血球計数装置がその凝集塊を「血小板ではないもの」として数え損ね、見かけ上の血小板数が実際より低く出てしまう(EDTA依存性偽性血小板減少)。同時に、その凝集塊を白血球として誤ってカウントし、見かけ上の白血球数が増加することもある。本当の血小板減少(治療的な介入が必要になりうる)と、この採血管に起因するアーチファクトとを取り違えると、不要な精査や誤った治療判断につながりかねない。対応としては、クエン酸ナトリウムなど別の抗凝固剤で採り直した検体で血小板数を再検する、末梢血塗抹標本を鏡検して血小板の凝集塊の有無を確認する、といった方法がある。当院でも、EDTA依存性凝集による偽性血小板減少の再検専用として、EDTAを使わない抗凝固剤(フッ化ナトリウム・クエン酸系)の専用採血管を別に用意している。血小板数が原因不明に低い(あるいは白血球数だけが説明のつかない高値を示す)ときは、この現象を鑑別に入れることを忘れないこと。", { size: 20 }),
  ]
));
children.push(spacer());

// ============ D 血清と血漿の使い分け ============
children.push(h1("D　血清と血漿の使い分け"));

children.push(h2("a　フィブリノゲンの有無による測定値差"));
children.push(p("血清は、血液を凝固させたあとの上清であり、凝固の過程でフィブリノゲンが消費されて残っていない。血漿(ヘパリン血漿など)は、凝固させずに遠心して得るため、フィブリノゲンがそのまま残っている。このフィブリノゲンの有無が、蛋白分画の見え方(C節b参照)をはじめ、いくつかの検査での血清・血漿間の値の違いの原因になる。"));

children.push(h2("b　K値が血清＞血漿となる理由(血小板由来)"));
children.push(p("血清を得る過程(凝固・血餅形成)では、血小板が壊れて内部のカリウムが放出されるため、血清のK値はヘパリン血漿のK値よりわずかに高くなりやすい(血小板数が多い患者ほどこの差が出やすい)。これはC節aで説明したEDTA血漿のK偽高値(EDTAのカリウム塩そのものが混入することによる)とは、原因がまったく異なる別の現象である点に注意する。"));

children.push(h2("c　迅速報告における血漿検体の利点"));
children.push(p("ヘパリン血漿検体は、血液が凝固するのを待つ必要がなく、採血後すぐに遠心分離ができるため、緊急検査など迅速な報告が求められる場面で有利である。血清検体は、凝固が完了するまで一定時間(概ね20〜30分程度)静置する必要がある。"));

children.push(h2("d　施設で採用している検体種の確認◆"));
children.push(column(
  "施設差に関する注意",
  [p("生化学検査に血清を使うか、ヘパリン血漿を使うかは、施設(あるいは検査項目)によって方針が異なる。同じ患者・同じ項目でも、血清とヘパリン血漿とでは値がわずかに(場合によっては無視できない程度に)異なりうるため、基準範囲も採用している検体種を前提に設定されている。実習では、自施設がどちらを標準としているか、また項目によって使い分けているかを必ず確認すること。", { size: 20 })],
  { warn: true }
));
children.push(spacer());

// ============ E 採血量と充填 ============
children.push(h1("E　採血量と充填"));

children.push(h2("a　規定量未満(採血不足)の影響"));
children.push(p("採血管の添加剤は、規定量の血液が採れることを前提とした量で入っている。既定量に満たない採血(採血不足)では、血液に対して抗凝固剤の割合が相対的に多くなり、希釈効果や検査値への影響が生じる。特にクエン酸ナトリウム管のように、あらかじめ一定量の液状の抗凝固剤が入っている管では、この影響が大きくなりやすい(C節d参照)。"));

children.push(h2("b　抗凝固剤と血液の比率"));
children.push(p("多くの採血管には、規定量まで採血したときに適切な比率になるよう、あらかじめ量の決まった添加剤が入っている。この比率が崩れると、抗凝固効果が不十分になったり(採血量が多すぎる場合)、逆に薄まりすぎたり(採血量が少なすぎる場合)する。とくに凝固機能検査用のクエン酸ナトリウム管は、血液と抗凝固剤の体積比(9:1)が検査原理そのものに組み込まれているため、規定量から外れた検体は原則として使用できない。"));

children.push(h2("c　過剰充填・凝固不十分による凝固検体"));
children.push(p("血液を入れすぎて充填が過剰になると、抗凝固剤に対して血液が多くなりすぎ、抗凝固効果が不十分になって微小な凝固塊を含む検体(凝固検体)になることがある。転倒混和が不十分な場合も、抗凝固剤が血液全体に行き渡らず同様の問題が起こる。凝固検体は、血球計算装置での誤カウントや、生化学的測定でのフィブリン析出による妨害など、さまざまなトラブルの原因になるため、規定量の採血と適切な転倒混和(管によって推奨される回数が異なる)の両方が重要である。"));

children.push(p("◆ 当院の例", { bold: true, color: COLOR.accent }));
children.push(p("当院の容器一覧では、クエン酸ナトリウム管(凝固線溶検査用・血小板凝集能検査用)や赤沈用のクエン酸管に、「血液が線より多すぎても、少なすぎても検査不可」という明確な注記がある。これはb節で述べた比率の重要性を、実務上の受け入れ基準としてそのまま表したものである。またEDTA管などでは「凝固しないよう、速やかに8〜10回転倒混和」のように、管ごとに推奨される転倒混和の回数が具体的に定められている。回数は添加剤の種類・量によって異なるため、教科書の一般論だけでなく、実際に使う採血管の添付文書・自施設の手順を確認する習慣をつけること。"));
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
              children: [new TextRun({ text: "冒険の書　第2章　採血管と抗凝固剤(試作)", size: 15, color: "AAAAAA" })],
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
  fs.writeFileSync(__dirname + "/2-採血管と抗凝固剤.docx", buf);
  console.log("done");
});
