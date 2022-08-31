import * as d3 from "d3";
import { JSDOM } from "jsdom";
import { NextApiRequest, NextApiResponse } from "next";
import PDFDocument from "pdfkit";
import svgToPdfkit from "svg-to-pdfkit";
import { GetChartsData } from "../getChartsData";

const rtl = (s: string) =>
  s
    .split(" ")
    .map((w) =>
      w
        .split("")
        .map((c) => {
          const charCode = c.charCodeAt(0);
          return charCode >= 48 && charCode <= 57 ? String.fromCharCode(charCode + 1632 - 48) : c;
        })
        .join(""),
    )
    .map((w) => {
      let newW = w;

      for (const match of w.matchAll(/[٠-٩\.]+/g)) {
        newW =
          newW.slice(0, match.index) +
          match[0].split("").reverse().join("") +
          newW.slice(match.index! + match[0].length);
      }

      return newW;
    })
    .join("\u2009");

const shortDate = (date: Date) =>
  `${date.getDate()}\\${date.getMonth() + 1}\\${date.getFullYear()}`;

const width = 595;
const height = 842;

let subview: [x: number, y: number, width: number, height: number] = [0, 0, width, height];

const vw = (percentage: number) => subview[0] + (percentage / 100) * subview[2];
const vh = (percentage: number) => subview[1] + (percentage / 100) * subview[3];
const rvw = (percentage: number) => (percentage / 100) * subview[2];
const rvh = (percentage: number) => (percentage / 100) * subview[3];

const subviewSection = (vx0: number, vx1: number, vy0: number, vy1: number, callback: Function) => {
  const originalSubview = subview;

  const x0 = vw(vx0);
  const x1 = vw(vx1);
  const y0 = vh(vy0);
  const y1 = vh(vy1);

  subview = [x0, y0, x1 - x0, y1 - y0];

  try {
    callback();
  } finally {
    subview = originalSubview;
  }
};

const svg = (
  doc: PDFKit.PDFDocument,
  svg: string,
  {
    x0,
    x1,
    y0,
    y1,
    fit,
  }: {
    x0: number;
    x1?: number;
    y0: number;
    y1?: number;
    fit?: Exclude<Parameters<typeof svgToPdfkit>[4], undefined>["preserveAspectRatio"];
  },
) =>
  svgToPdfkit(doc, svg, x0, y0, {
    width: x1 && x1 - x0,
    height: y1 && y1 - y0,
    preserveAspectRatio: fit,
  });

const capitalize = <S extends string>(s: S): Capitalize<S> =>
  (s[0].toUpperCase() + s.slice(1)) as Capitalize<S>;

type FontWeight = "extraLight" | "light" | "regular" | "semiBold" | "bold" | "black";

const text = (
  doc: PDFKit.PDFDocument,
  text: string,
  {
    x0,
    y0,
    x1,
    y1,
    weight = "regular",
    size = 12,
    color = "black",
    align = "right",
  }: {
    x0: number;
    x1?: number;
    y0: number;
    y1?: number;
    weight?: FontWeight;
    size?: number;
    color?: string;
    align?: "center" | "justify" | "left" | "right";
  },
) =>
  doc
    .font("Cairo-" + capitalize(weight))
    .fontSize(size)
    .fillColor(color)
    .text(rtl(text), x0, y0, { width: x1 && x1 - x0, height: y1 && y1 - y0, align });

const legendEntry = (
  doc: PDFKit.PDFDocument,
  value: string,
  {
    x0,
    x1,
    y0,
    y1,
    size,
    color,
  }: { x0: number; x1: number; y0: number; y1?: number; size: number; color: string },
) => {
  doc
    .rect(x1 - size * 1.5, y0 + size * 0.75, size * 0.5, size * 0.5)
    .fillColor(color)
    .fill();

  text(doc, value, { x0, x1: x1 - size * 2, y0, y1, size, align: "right" });
};

const legendHorizontal = (
  doc: PDFKit.PDFDocument,
  entries: { color: string; value: string }[],
  { x0, x1, y0, y1, size }: { x0: number; x1: number; y0: number; y1?: number; size: number },
) => {
  const width = (x1 - x0) / entries.length;
  for (let i = 0; i < entries.length; i++) {
    const { color, value } = entries[i];
    //console.log("ENTRY", color, value);
    legendEntry(doc, value, {
      x0: x1 - width * (i + 1),
      x1: x1 - width * i,
      y0,
      y1,
      size,
      color,
    });
  }
};

const beige = "#c1b476";
const blue = "#175377";
const cyan = "#01b0f1";
const grey = "#595959";
const lightGrey = "#7f7f7f";
const red = "#ff0000";
const green = "#00b050";
const yellow = "#ffc000";
const purple = "#7030a0";
const lightGreen = "#92d050";
const pink = "#f4b183";

const monthNames = [
  "يناير",
  "فبراير",
  "مارس",
  "إبريل",
  "مايو",
  "يونيو",
  "يوليو",
  "أغسطس",
  "سبتمبر",
  "أكتوبر",
  "نوفمبر",
  "ديسمبر",
];

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const { id, month, year } = req.query;

  const reportName = `${monthNames[+month - 1]} ${year}`;

  const data = await GetChartsData(+id, new Date(`${year}-${month}-15`));
  if (!data) return res.status(404).json({ message: "Not Found" });

  const pageBackground = (doc: PDFKit.PDFDocument) => {
    doc.image("pdf-assets/image.L53LX0.png", 0, 0, { cover: [width, height] });

    text(doc, `مشروع ${data.projectName} - ${reportName}`, {
      x0: vw(5),
      x1: vw(95),
      y0: vh(3),
      color: beige,
    });
  };

  const doc = new PDFDocument({ size: [width, height], margin: 0 });

  doc.registerFont("Cairo", "pdf-assets/Cairo-Regular.ttf");
  doc.registerFont("Cairo-ExtraLight", "pdf-assets/Cairo-ExtraLight.ttf");
  doc.registerFont("Cairo-Light", "pdf-assets/Cairo-Light.ttf");
  doc.registerFont("Cairo-Regular", "pdf-assets/Cairo-Regular.ttf");
  doc.registerFont("Cairo-SemiBold", "pdf-assets/Cairo-SemiBold.ttf");
  doc.registerFont("Cairo-Bold", "pdf-assets/Cairo-Bold.ttf");

  res.setHeader("Content-Type", "application/pdf");
  doc.pipe(res);

  doc.image("pdf-assets/image.YX2MX0.jpeg", 0, 0, { cover: [width, height] });

  text(doc, "مشروع", { x0: vw(15), x1: vw(85), y0: vh(37), size: 14, color: beige });

  text(doc, data.projectName, {
    x0: vw(15),
    x1: vw(85),
    y0: vh(40),
    weight: "bold",
    size: 24,
    color: blue,
  });

  text(doc, reportName, {
    x0: vw(15),
    x1: vw(85),
    y0: vh(60),
    weight: "semiBold",
    size: 18,
    color: grey,
  });

  text(doc, "تقرير المتابعة الشهرية", {
    x0: vw(15),
    x1: vw(85),
    y0: vh(65),
    size: 14,
    color: lightGrey,
  });

  doc.addPage();

  doc.image("pdf-assets/image.3WVPX0.png", 0, 0, { cover: [width, height], valign: "center" });

  doc.addPage();
  pageBackground(doc);

  {
    const gradient = doc.linearGradient(0, 0, vw(15), 0);
    gradient.stop(0, cyan);
    gradient.stop(1, "white");

    doc.save().rect(0, vh(15), vw(15), vh(65)).fill(gradient).fillColor(beige).restore();
  }

  doc.save().rotate(-90);

  text(doc, "نسب الإنجاز", {
    x0: -vh(35),
    x1: -vh(15),
    y0: vw(4),
    weight: "bold",
    size: 16,
    color: "white",
    align: "center",
  });

  text(doc, "القيمة", {
    x0: -vh(45),
    x1: -vh(35),
    y0: vw(4),
    weight: "bold",
    size: 16,
    color: "white",
    align: "center",
  });

  text(doc, "البيانات", {
    x0: -vh(55),
    x1: -vh(45),
    y0: vw(4),
    weight: "bold",
    size: 16,
    color: "white",
    align: "center",
  });

  text(doc, "العمالة", {
    x0: -vh(65),
    x1: -vh(55),
    y0: vw(4),
    weight: "bold",
    size: 16,
    color: "white",
    align: "center",
  });

  text(doc, "الطقس", {
    x0: -vh(80),
    x1: -vh(65),
    y0: vw(4),
    weight: "bold",
    size: 16,
    color: "white",
    align: "center",
  });

  doc.restore();

  doc.moveTo(vw(0), vh(80)).lineTo(vw(100), vh(80)).strokeColor(cyan).stroke();

  subviewSection(70, 100, 12.5, 80, () => {
    text(doc, "الحالة الراهنة بنهاية الشهر", {
      x0: vw(0),
      x1: vw(100),
      y0: vh(0),
      weight: "bold",
      align: "center",
    });

    subviewSection(55, 100, 5, 100, () => {
      text(doc, shortDate(data.startDate), {
        x0: vw(0),
        x1: vw(100),
        y0: vh(2),
        weight: "bold",
        size: 14,
        align: "center",
      });

      text(doc, "انطلاق العمل", {
        x0: vw(0),
        x1: vw(100),
        y0: vh(2) + 16,
        weight: "semiBold",
        size: 8,
        color: grey,
        align: "center",
      });

      text(doc, shortDate(data.plannedEndDate), {
        x0: vw(0),
        x1: vw(100),
        y0: vh(9),
        weight: "bold",
        size: 14,
        align: "center",
      });

      text(doc, "نهاية العمل المخططة", {
        x0: vw(0),
        x1: vw(100),
        y0: vh(9) + 16,
        weight: "semiBold",
        size: 8,
        color: grey,
        align: "center",
      });

      svg(doc, donutSinglePercentage(data.plannedRatio, { color: yellow }), {
        x0: vw(10),
        x1: vw(90),
        y0: vh(20),
        fit: "xMidYMin meet",
      });

      text(doc, "الإنجاز المخطط", {
        x0: vw(0),
        x1: vw(100),
        y0: vh(20) + rvw(80),
        weight: "bold",
        size: 9,
        align: "center",
      });

      svg(doc, donutSinglePercentage(data.certifiedRatio, { color: green }), {
        x0: vw(10),
        x1: vw(90),
        y0: vh(35),
        fit: "xMidYMin meet",
      });

      text(doc, "الإنجاز المعتمد", {
        x0: vw(0),
        x1: vw(100),
        y0: vh(35) + rvw(80),
        weight: "bold",
        size: 9,
        align: "center",
      });

      svg(
        doc,
        donutSinglePercentage(
          Number(((data.paidToContractor / data.projectCost) * 100).toFixed(1)),
          { color: purple },
        ),
        {
          x0: vw(10),
          x1: vw(90),
          y0: vh(50),
          fit: "xMidYMin meet",
        },
      );

      text(doc, "المنصرف للمقاول", {
        x0: vw(0),
        x1: vw(100),
        y0: vh(50) + rvw(80),
        weight: "bold",
        size: 9,
        align: "center",
      });

      text(doc, data.totalExecutedValues.toString(), {
        x0: vw(0),
        x1: vw(100),
        y0: vh(67),
        weight: "bold",
        size: 16,
        align: "center",
      });

      text(doc, "قيمة الأعمال المنفذة بالريال", {
        x0: vw(0),
        x1: vw(100),
        y0: vh(67) + 25,
        weight: "bold",
        size: 10,
        color: grey,
        align: "center",
      });
    });

    subviewSection(0, 55, 5, 100, () => {
      svg(doc, donutSinglePercentage(Number(data.elapsedRatio), { color: cyan }), {
        x0: vw(5),
        x1: vw(95),
        y0: vh(0),
        fit: "xMidYMin meet",
      });

      text(doc, "الوقت المنقضي", {
        x0: vw(0),
        x1: vw(100),
        y0: vh(0) + rvw(90),
        weight: "bold",
        size: 10,
        align: "center",
      });

      svg(doc, donutSinglePercentage(data.achievedRatio, { color: red }), {
        x0: vw(5),
        x1: vw(95),
        y0: vh(25),
        fit: "xMidYMin meet",
      });

      text(doc, "نسبة الإنجاز المتحقق", {
        x0: vw(0),
        x1: vw(100),
        y0: vh(25) + rvw(90),
        weight: "bold",
        size: 10,
        align: "center",
      });

      text(doc, `${Math.round((data.achievedRatio / data.plannedRatio) * 100)}%`, {
        x0: vw(0),
        x1: vw(100),
        y0: vh(50),
        weight: "bold",
        size: 16,
        align: "center",
      });

      text(doc, "معامل الإنجازية", {
        x0: vw(0),
        x1: vw(100),
        y0: vh(50) + 25,
        weight: "bold",
        size: 10,
        align: "center",
      });

      text(doc, "الإنجاز المتحقق \\ الإنجاز المخطط", {
        x0: vw(0),
        x1: vw(100),
        y0: vh(50) + 40,
        size: 7,
        color: grey,
        align: "center",
      });

      text(doc, data.paidToContractor.toString(), {
        x0: vw(0),
        x1: vw(100),
        y0: vh(67),
        weight: "bold",
        size: 16,
        align: "center",
      });

      text(doc, "إجمالي المنصرف للمقاول بالريال", {
        x0: vw(0),
        x1: vw(100),
        y0: vh(67) + 25,
        weight: "bold",
        size: 10,
        color: grey,
        align: "center",
      });

      doc.moveTo(vw(0), vh(0)).lineTo(vw(0), vh(100)).strokeColor(cyan).stroke();
    });

    text(doc, "نسب الإنجاز المتحققة في مجموعات الأعمال", {
      x0: vw(0),
      x1: vw(100),
      y0: vh(81),
      weight: "bold",
      size: 8,
      color: grey,
      align: "center",
    });

    legendHorizontal(
      doc,
      [
        { color: pink, value: "نسبة الإنجاز التراكمي المخطط" },
        { color: lightGreen, value: "نسبة الإنجاز التراكمي المتحقق" },
      ],
      {
        x0: vw(10),
        x1: vw(90),
        y0: vh(84),
        size: 4,
      },
    );

    svg(
      doc,
      barChart({
        width: 600,
        height: 300,
        marginRight: 150,
        orientation: "horizontal",
        sections: data.termsData.map((entry) => ({
          ...entry,
          name: entry.name.split(" ").reverse().join(" "),
        })),
        domain: [0, 100],
        bar: barGrouped({ fills: [lightGreen, pink] }),
      }),
      {
        x0: vw(0),
        x1: vw(100),
        y0: vh(84),
        fit: "xMidYMin meet",
      },
    );
  });

  subviewSection(15, 70, 12.5, 85, () => {
    text(doc, "تطور الأعمال والإنجازية خلال الشهر", {
      x0: vw(0),
      x1: vw(100),
      y0: vh(0),
      weight: "bold",
      align: "center",
    });

    legendHorizontal(
      doc,
      [
        { color: cyan, value: "التراكمي حتى نهاية الشهر" },
        { color: yellow, value: "القيم خلال الشهر" },
      ],
      { x0: vw(5), x1: vw(90), y0: vh(5), size: 10 },
    );

    svg(
      doc,
      barChart({
        width: rvw(100),
        height: rvh(17),
        marginTop: rvh(3),
        marginRight: 100,
        orientation: "horizontal",
        padding: 0.3,
        sections: data.RatiosSection.map((entry) => ({
          ...entry,
          name: entry.name.split(" ").reverse().join(" "),
        })),
        domain: [0, 100],
        bar: barStacked({ fills: [cyan, yellow] }),
      }),
      { x0: vw(0), x1: vw(100), y0: vh(5), fit: "xMidYMin meet" },
    );

    text(doc, "تطور نسب الإنجاز المخطط، المتحقق والمعتمد خلال الشهر", {
      x0: vw(0),
      x1: vw(100),
      y0: vh(18),
      weight: "bold",
      size: 10,
      color: grey,
      align: "center",
    });

    svg(
      doc,
      barChart({
        width: rvw(200),
        height: rvh(25),
        padding: 0.3,
        sections: data.achievementStatus.map((entry) => ({
          name: entry.name.toString(),
          data: entry.data!,
        })),
        marginTop: rvh(2),
        marginLeft: rvw(5),
        domain: [0, 100],
        bar: barStacked({ fills: [green, red, yellow] }),
      }),
      { x0: vw(0), x1: vw(100), y0: vh(18), fit: "xMidYMin meet" },
    );

    legendHorizontal(
      doc,
      [
        { color: yellow, value: "الإنجاز المخطط" },
        { color: red, value: "الإنجاز المتحقق" },
        { color: green, value: "الإنجاز المعتمد" },
      ],
      { x0: vw(20), x1: vw(80), y0: vh(28.5), size: 6 },
    );

    text(doc, "قيمة الأعمال المنفذة بالألف ريال سعودي", {
      x0: vw(0),
      x1: vw(70),
      y0: vh(30),
      weight: "bold",
      size: 10,
      color: grey,
      align: "center",
    });

    svg(
      doc,
      barChart({
        width: rvw(200),
        height: rvh(30),
        padding: 0.3,
        sections: data.executedValues.map((entry) => ({ ...entry, data: entry.data / 1000 })),
        marginLeft: rvw(5),
        marginRight: rvw(65),
        domain: [0, Math.max(...data.executedValues.map((entry) => entry.data / 1000))],
        bar: barSingle({ fill: cyan }),
      }),
      { x0: vw(0), x1: vw(100), y0: vh(30), fit: "xMidYMin meet" },
    );

    text(doc, data.averageExecutedValues.toString(), {
      x0: vw(70),
      x1: vw(100),
      y0: vh(33),
      weight: "bold",
      align: "center",
    });

    text(doc, "متوسط قيمة الأعمال المنفذة يوميا بالريال السعودي", {
      x0: vw(73),
      x1: vw(97),
      y0: vh(37),
      size: 6,
      align: "center",
    });

    text(doc, "متابعة الإدخال اليومي لبيانات الموقع", {
      x0: vw(0),
      x1: vw(70),
      y0: vh(45),
      weight: "bold",
      size: 10,
      color: grey,
      align: "center",
    });

    svg(
      doc,
      barChart({
        width: rvw(200),
        height: rvh(18),
        padding: 0.3,
        sections: data.updatingStatus.map((entry) => ({
          name: entry.name,
          data: [
            entry.data == "منتظم" ? 1 : 0,
            entry.data == "متأخر" ? 1 : 0,
            entry.data == "لم يقدم" ? 1 : 0,
          ],
        })),
        marginLeft: rvw(5),
        marginRight: rvw(65),
        domain: [0, 1],
        verticalAxisVisible: false,
        bar: barStacked({ fills: [green, yellow, red] }),
      }),
      { x0: vw(0), x1: vw(100), y0: vh(45), fit: "xMidYMin meet" },
    );

    text(
      doc,
      `${Math.round(
        (data.updatingStatus.filter((entry) => entry.data == "منتظم").length /
          data.updatingStatus.filter((entry) => entry.data).length) *
          100,
      )}%`,
      {
        x0: vw(70),
        x1: vw(100),
        y0: vh(48),
        weight: "bold",
        align: "center",
      },
    );

    text(doc, "معامل الالتزام بتحديث البيانات", {
      x0: vw(73),
      x1: vw(97),
      y0: vh(51),
      size: 6,
      align: "center",
    });

    legendHorizontal(
      doc,
      [
        { color: green, value: "منتظم" },
        { color: yellow, value: "متأخر" },
        { color: red, value: "لم يقدم" },
      ],
      { x0: vw(0), x1: vw(70), y0: vh(52), size: 8 },
    );

    text(doc, "أعداد العمالة بالموقع خلال أيام الشهر", {
      x0: vw(0),
      x1: vw(70),
      y0: vh(55),
      weight: "bold",
      size: 10,
      color: grey,
      align: "center",
    });

    svg(
      doc,
      barChart({
        width: rvw(200),
        height: rvh(30),
        padding: 0.3,
        sections: data.workersData,
        marginLeft: rvw(5),
        marginRight: rvw(65),
        domain: [
          0,
          Math.max(...data.workersData.map((entry) => entry.data.reduce((a, b) => a + b, 0))),
        ],
        bar: barStacked({ fills: [red, yellow, lightGreen, cyan] }),
      }),
      { x0: vw(0), x1: vw(100), y0: vh(55), fit: "xMidYMin meet" },
    );

    legendHorizontal(
      doc,
      [
        { color: red, value: "مهندسين" },
        { color: yellow, value: "مراقبين" },
        { color: lightGreen, value: "عمالة مدربة" },
        { color: cyan, value: "عمالة عادية" },
      ],
      { x0: vw(0), x1: vw(95), y0: vh(68), size: 8 },
    );

    text(
      doc,
      `${Object.values<number>(data.workersAverage)
        .reduce((a, b) => a + b, 0)
        .toFixed(1)} فرد \\ يوم`,
      {
        x0: vw(70),
        x1: vw(100),
        y0: vh(53),
        weight: "bold",
        align: "center",
      },
    );

    text(doc, "المتوسط اليومي للعمالة", {
      x0: vw(73),
      x1: vw(97),
      y0: vh(56),
      size: 6,
      align: "center",
    });

    svg(
      doc,
      barChart({
        width: rvw(60),
        height: rvh(30),
        padding: 0.3,
        sections: ["مهندسين", "مراقبين", "عمالة مدربة", "عمالة عادية"].map((key, index) => {
          const value = [0, 0, 0, 0];
          value[index] = data.workersAverage[key];

          return { name: key, data: value };
        }),

        marginLeft: rvw(5),
        marginRight: rvw(10),
        horizontalAxisVisible: false,
        domain: [0, Math.max(...(Object.values(data.workersAverage) as number[]))],
        bar: barStacked({ fills: [red, yellow, lightGreen, cyan] }),
      }),
      { x0: vw(70), x1: vw(100), y0: vh(55), fit: "xMidYMin meet" },
    );

    text(doc, "درجات الحرارة العظمى والصغرى", {
      x0: vw(0),
      x1: vw(70),
      y0: vh(70),
      weight: "bold",
      size: 10,
      color: grey,
      align: "center",
    });

    svg(
      doc,
      barChart({
        width: rvw(200),
        height: rvh(30),
        padding: 0.7,
        sections: data.weatherData,
        marginLeft: rvw(5),
        marginRight: rvw(65),
        domain: [
          Math.min(...data.weatherData.map((entry) => entry.data[0])),
          Math.max(...data.weatherData.map((entry) => entry.data[1])),
        ],
        bar: barRangeSingle({ fill: red }),
      }),
      { x0: vw(0), x1: vw(100), y0: vh(70), fit: "xMidYMin meet" },
    );

    text(
      doc,
      `${(
        data.weatherData.map((entry) => entry.data[1]).reduce((a, b) => a + b, 0) /
        data.weatherData.length
      ).toFixed(1)} \\ ${(
        data.weatherData.map((entry) => entry.data[0]).reduce((a, b) => a + b, 0) /
        data.weatherData.length
      ).toFixed(1)}`,
      {
        x0: vw(70),
        x1: vw(100),
        y0: vh(73),
        weight: "bold",
        align: "center",
      },
    );

    text(doc, "متوسط درجات الحرارة العظمى والصغرى", {
      x0: vw(73),
      x1: vw(97),
      y0: vh(77),
      size: 6,
      align: "center",
    });

    ["أمطار شديدة", "أمطار خفيفة", "غائم كليا", "غائم جزئيا", "مشمس"].forEach((key, index) => {
      text(doc, key, {
        x0: vw((4 - index) * 20),
        x1: vw((5 - index) * 20),
        y0: vh(85),
        weight: "bold",
        size: 10,
        align: "center",
      });

      text(doc, data.weatherStatus[key].toString(), {
        x0: vw((4 - index) * 20),
        x1: vw((5 - index) * 20),
        y0: vh(87),
        weight: "light",
        size: 18,
        align: "center",
      });
    });
  });

  subviewSection(0, 100, 80, 94, () => {
    text(doc, "مكونات المشروع", {
      x0: vw(80),
      x1: vw(98),
      y0: vh(5),
      weight: "bold",
      color: grey,
    });

    data.termsChart.forEach((term, index) => {
      legendEntry(doc, term.name, {
        x0: vw(80),
        x1: vw(100),
        y0: vh(24 + 10 * index),
        color: term.color,
        size: 8,
      });
    });

    svg(doc, donutMultiplePercentages(data.termsChart), {
      x0: vw(62.5),
      x1: vw(82.5),
      y0: vh(0),
      y1: vh(100),
      fit: "xMaxYMid meet",
    });

    text(doc, data.project.beneficiariesCount.toString(), {
      x0: vw(50),
      x1: vw(65),
      y0: vh(15),
      weight: "bold",
      size: 22,
      color: purple,
      align: "center",
    });

    text(doc, "شخص يمني", {
      x0: vw(50),
      x1: vw(65),
      y0: vh(55),
      weight: "bold",
      color: grey,
      align: "center",
    });

    text(doc, data.projectCost.toString(), {
      x0: vw(35),
      x1: vw(50),
      y0: vh(15),
      weight: "bold",
      size: 22,
      color: cyan,
      align: "center",
    });

    text(doc, "تكلفة المشروع بالريال السعودي", {
      x0: vw(35),
      x1: vw(50),
      y0: vh(55),
      weight: "bold",
      color: grey,
      align: "center",
    });

    text(doc, `${data.project.modifiedPeriod} أشهر`, {
      x0: vw(15),
      x1: vw(35),
      y0: vh(15),
      weight: "bold",
      size: 22,
      color: green,
      align: "center",
    });

    text(doc, "فترة التنفيذ", {
      x0: vw(15),
      x1: vw(35),
      y0: vh(55),
      weight: "bold",
      color: grey,
      align: "center",
    });

    text(doc, "عدن", {
      x0: vw(0),
      x1: vw(15),
      y0: vh(25),
      weight: "bold",
      size: 28,
      align: "center",
    });
  });

  doc.addPage();
  pageBackground(doc);

  text(doc, "بيانات المشروع", { x0: vw(10), x1: vw(90), y0: vh(15), color: beige });

  text(doc, data.project.beneficiariesCount.toString(), {
    x0: vw(70),
    x1: vw(90),
    y0: vh(70),
    weight: "bold",
    size: 28,
    color: purple,
    align: "center",
  });

  text(doc, "شخص يمني", {
    x0: vw(70),
    x1: vw(90),
    y0: vh(75),
    weight: "bold",
    color: grey,
    align: "center",
  });

  text(doc, data.projectCost.toString(), {
    x0: vw(70),
    x1: vw(90),
    y0: vh(25),
    weight: "bold",
    size: 28,
    color: cyan,
    align: "center",
  });

  text(doc, "تكلفة المشروع بالريال السعودي", {
    x0: vw(70),
    x1: vw(90),
    y0: vh(30),
    weight: "bold",
    color: grey,
    align: "center",
  });

  text(doc, `${data.project.modifiedPeriod} أشهر`, {
    x0: vw(70),
    x1: vw(90),
    y0: vh(50),
    weight: "bold",
    size: 28,
    color: green,
    align: "center",
  });

  text(doc, "فترة التنفيذ", {
    x0: vw(70),
    x1: vw(90),
    y0: vh(55),
    weight: "bold",
    color: grey,
    align: "center",
  });

  text(doc, "عدن", {
    x0: vw(0),
    x1: vw(70),
    y0: vh(25),
    weight: "bold",
    size: 36,
    align: "center",
  });

  text(doc, "مكونات المشروع", {
    x0: vw(10),
    x1: vw(65),
    y0: vh(50),
    weight: "bold",
    size: 18,
    color: grey,
  });

  data.termsChart.forEach((term, index) => {
    legendEntry(doc, term.name, {
      x0: vw(33),
      x1: vw(68),
      y0: vh(60 + 4 * index),
      color: term.color,
      size: 12,
    });
  });

  svg(doc, donutMultiplePercentages(data.termsChart), {
    x0: vw(5),
    x1: vw(45),
    y0: vh(50),
    y1: vh(95),
    fit: "xMidYMid meet",
  });

  doc.addPage();
  pageBackground(doc);

  text(doc, "الملخص التنفيذي", { x0: vw(10), x1: vw(90), y0: vh(15), color: beige });

  [
    ["اسم المشروع", data.projectName],
    ["المحفظة", "-"],
    ["المجموعة", "-"],
    ["الموقع", data.project.location],
    ["تكلفة المشروع", `${data.projectCost} ريال سعودي`],
    ["عدد المستفيدين", `${data.project.beneficiariesCount} شخص يمني`],
    ["المقاول", data.project.contractorName],
    ["المالك والمشغل", data.project.ownerName],
    ["الاستشاري", data.project.advisorName!],
    ["تاريخ البداية", shortDate(new Date(data.project.startDate))],
    ["فترة التنفيذ", `${data.project.modifiedPeriod} أشهر`],
    ["تاريخ الانتهاء المخطط", shortDate(new Date(data.project.currentExpirationDate!))],
    ["الحالة الراهنة للمشروع", data.projectStatus!],
    ["نسبة الإنجاز المخطط", `${data.plannedRatio}%`],
    ["نسبة الإنجاز المتحقق", `${data.achievedRatio}%`],
    ["معامل الإنجازية", `${Math.round((data.achievedRatio / data.plannedRatio) * 100)}%`],
  ].forEach(([key, value], index) => {
    text(doc, key, { x0: vw(70), x1: vw(90), y0: vh(25 + 4 * index), color: beige });
    text(doc, value, { x0: vw(5), x1: vw(65), y0: vh(25 + 4 * index) });
  });

  doc.addPage();
  pageBackground(doc);

  text(doc, "الحالة الراهنة للمشروع", { x0: vw(10), x1: vw(90), y0: vh(15), color: beige });

  text(doc, "الوقت المنقضي", { x0: vw(10), x1: vw(90), y0: vh(20), size: 16 });

  text(doc, shortDate(data.startDate), {
    x0: vw(50),
    x1: vw(90),
    y0: vh(29),
    weight: "bold",
    size: 24,
    align: "center",
  });

  text(doc, "انطلاق العمل", {
    x0: vw(50),
    x1: vw(90),
    y0: vh(29) + 32,
    weight: "semiBold",
    size: 12,
    color: grey,
    align: "center",
  });

  text(doc, shortDate(data.plannedEndDate), {
    x0: vw(50),
    x1: vw(90),
    y0: vh(37),
    weight: "bold",
    size: 24,
    align: "center",
  });

  text(doc, "نهاية العمل المخططة", {
    x0: vw(50),
    x1: vw(90),
    y0: vh(37) + 32,
    weight: "semiBold",
    size: 12,
    color: grey,
    align: "center",
  });

  svg(doc, donutSinglePercentage(Number(data.elapsedRatio), { color: cyan }), {
    x0: vw(15),
    x1: vw(45),
    y0: vh(25),
    fit: "xMidYMin meet",
  });

  text(doc, "الوقت المنقضي", {
    x0: vw(10),
    x1: vw(50),
    y0: vh(25) + rvw(30),
    weight: "bold",
    size: 12,
    align: "center",
  });

  text(doc, "نسب الإنجاز التراكمي المتحقق مقارنة بالمخطط له", {
    x0: vw(10),
    x1: vw(90),
    y0: vh(55),
    size: 16,
  });

  legendHorizontal(
    doc,
    [
      { color: cyan, value: "التراكمي حتى نهاية الشهر" },
      { color: yellow, value: "القيم خلال الشهر" },
    ],
    { x0: vw(10), x1: vw(75), y0: vh(63), size: 12 },
  );

  svg(
    doc,
    barChart({
      width: rvw(100),
      height: rvh(28),
      marginTop: rvh(3),
      marginRight: 100,
      orientation: "horizontal",
      padding: 0.5,
      sections: data.RatiosSection.map((entry) => ({
        ...entry,
        name: entry.name.split(" ").reverse().join(" "),
      })),
      domain: [0, 100],
      bar: barStacked({ fills: [cyan, yellow] }),
    }),
    { x0: vw(0), x1: vw(100), y0: vh(65), fit: "xMidYMin meet" },
  );

  doc.addPage();
  pageBackground(doc);

  text(doc, "الحالة الراهنة للمشروع", { x0: vw(10), x1: vw(90), y0: vh(15), color: beige });

  svg(doc, donutSinglePercentage(Number(data.achievedRatio), { color: red }), {
    x0: vw(65),
    x1: vw(85),
    y0: vh(22),
    fit: "xMidYMin meet",
  });

  text(doc, "نسبة الإنجاز المتحقق", {
    x0: vw(60),
    x1: vw(90),
    y0: vh(22) + rvw(20),
    weight: "bold",
    size: 12,
    align: "center",
  });

  text(doc, `${Math.round((data.achievedRatio / data.plannedRatio) * 100)}%`, {
    x0: vw(40),
    x1: vw(55),
    y0: vh(20),
    weight: "bold",
    size: 24,
  });

  text(doc, "معامل الإنجازية", {
    x0: vw(10),
    x1: vw(40),
    y0: vh(20),
    weight: "bold",
    size: 14,
  });

  text(doc, "الإنجاز المتحقق \\ الإنجاز المخطط", {
    x0: vw(10),
    x1: vw(40),
    y0: vh(23),
    size: 10,
    color: grey,
  });

  svg(doc, donutSinglePercentage(Number(data.certifiedRatio), { color: green }), {
    x0: vw(40),
    x1: vw(55),
    y0: vh(30),
    fit: "xMidYMin meet",
  });

  text(doc, "الإنجاز المعتمد", {
    x0: vw(35),
    x1: vw(60),
    y0: vh(30) + rvw(15),
    weight: "bold",
    size: 12,
    align: "center",
  });

  svg(doc, donutSinglePercentage(Number(data.plannedRatio), { color: yellow }), {
    x0: vw(15),
    x1: vw(30),
    y0: vh(30),
    fit: "xMidYMin meet",
  });

  text(doc, "الإنجاز المخطط", {
    x0: vw(10),
    x1: vw(35),
    y0: vh(30) + rvw(15),
    weight: "bold",
    size: 12,
    align: "center",
  });

  text(doc, "نسب الإنجاز على مستوى المجموعات الرئيسية", {
    x0: vw(10),
    x1: vw(90),
    y0: vh(45),
    size: 16,
  });

  legendHorizontal(
    doc,
    [
      { color: pink, value: "نسبة الإنجاز التراكمي المخطط" },
      { color: lightGreen, value: "نسبة الإنجاز التراكمي المتحقق" },
    ],
    {
      x0: vw(10),
      x1: vw(90),
      y0: vh(50),
      size: 10,
    },
  );

  svg(
    doc,
    barChart({
      width: 600,
      height: 250,
      marginRight: 150,
      orientation: "horizontal",
      sections: data.termsData.map((entry) => ({
        ...entry,
        name: entry.name.split(" ").reverse().join(" "),
      })),
      domain: [0, 100],
      bar: barGrouped({ fills: [lightGreen, pink] }),
    }),
    {
      x0: vw(0),
      x1: vw(100),
      y0: vh(50),
      fit: "xMidYMin meet",
    },
  );

  text(doc, "الماليات", {
    x0: vw(10),
    x1: vw(90),
    y0: vh(78),
    size: 16,
  });

  text(doc, data.projectCost.toString(), {
    x0: vw(67),
    x1: vw(100),
    y0: vh(82),
    weight: "bold",
    size: 24,
    align: "center",
  });

  text(doc, "تكلفة المشروع", {
    x0: vw(67),
    x1: vw(100),
    y0: vh(87),
    weight: "bold",
    color: grey,
    align: "center",
  });

  text(doc, data.totalExecutedValues.toString(), {
    x0: vw(33),
    x1: vw(67),
    y0: vh(82),
    weight: "bold",
    size: 24,
    align: "center",
  });

  text(doc, "قيمة الأعمال المنفذة", {
    x0: vw(33),
    x1: vw(67),
    y0: vh(87),
    weight: "bold",
    color: grey,
    align: "center",
  });

  text(doc, data.paidToContractor.toString(), {
    x0: vw(0),
    x1: vw(33),
    y0: vh(82),
    weight: "bold",
    size: 24,
    align: "center",
  });

  text(doc, "إجمالي المنصرف للمقاول", {
    x0: vw(0),
    x1: vw(33),
    y0: vh(87),
    weight: "bold",
    color: grey,
    align: "center",
  });

  doc.addPage();
  pageBackground(doc);

  text(doc, "متابعات الأداء خلال الفترة", { x0: vw(10), x1: vw(90), y0: vh(15), color: beige });

  text(doc, "تطور نسب الإنجاز اليومي خلال الشهر", { x0: vw(10), x1: vw(90), y0: vh(20), size: 16 });

  svg(
    doc,
    barChart({
      width: rvw(80),
      height: rvh(25),
      padding: 0.3,
      sections: data.achievementStatus.map((entry) => ({
        name: entry.name.toString(),
        data: entry.data!,
      })),
      marginTop: rvh(2),
      marginLeft: rvw(5),
      domain: [0, 100],
      bar: barStacked({ fills: [green, red, yellow] }),
    }),
    { x0: vw(10), x1: vw(90), y0: vh(25), fit: "xMidYMin meet" },
  );

  legendHorizontal(
    doc,
    [
      { color: yellow, value: "الإنجاز المخطط" },
      { color: red, value: "الإنجاز المتحقق" },
      { color: green, value: "الإنجاز المعتمد" },
    ],
    { x0: vw(20), x1: vw(80), y0: vh(50), size: 12 },
  );

  text(doc, "تطور نسب الإنجاز المخطط، المتحقق والمعتمد خلال الشهر", {
    x0: vw(10),
    x1: vw(90),
    y0: vh(55),
    size: 16,
  });

  legendHorizontal(
    doc,
    [
      { color: cyan, value: "التراكمي حتى نهاية الشهر" },
      { color: yellow, value: "القيم خلال الشهر" },
    ],
    { x0: vw(10), x1: vw(75), y0: vh(63), size: 12 },
  );

  svg(
    doc,
    barChart({
      width: rvw(100),
      height: rvh(28),
      marginTop: rvh(3),
      marginRight: 100,
      orientation: "horizontal",
      padding: 0.5,
      sections: data.RatiosSection.map((entry) => ({
        ...entry,
        name: entry.name.split(" ").reverse().join(" "),
      })),
      domain: [0, 100],
      bar: barStacked({ fills: [cyan, yellow] }),
    }),
    { x0: vw(0), x1: vw(100), y0: vh(65), fit: "xMidYMin meet" },
  );

  doc.addPage();
  pageBackground(doc);

  text(doc, "متابعات الأداء خلال الفترة", { x0: vw(10), x1: vw(90), y0: vh(15), color: beige });

  text(doc, "المتوسط اليومي لأعداد عمالة المقاول المتواجدة بالموقع", {
    x0: vw(10),
    x1: vw(90),
    y0: vh(20),
    size: 16,
  });

  text(
    doc,
    `${Object.values<number>(data.workersAverage)
      .reduce((a, b) => a + b, 0)
      .toFixed(1)} فرد \\ يوم`,
    {
      x0: vw(60),
      x1: vw(90),
      y0: vh(33),
      weight: "bold",
      size: 16,
      align: "center",
    },
  );

  text(doc, "المتوسط اليومي للعمالة", {
    x0: vw(60),
    x1: vw(90),
    y0: vh(36),
    align: "center",
  });

  svg(
    doc,
    barChart({
      width: rvw(60),
      height: rvh(30),
      padding: 0.3,
      sections: ["مهندسين", "مراقبين", "عمالة مدربة", "عمالة عادية"].map((key, index) => {
        const value = [0, 0, 0, 0];
        value[index] = data.workersAverage[key];

        return { name: key, data: value };
      }),

      marginLeft: rvw(5),
      marginRight: rvw(10),
      horizontalAxisVisible: false,
      domain: [0, Math.max(...(Object.values(data.workersAverage) as number[]))],
      bar: barStacked({ fills: [red, yellow, lightGreen, cyan] }),
    }),
    { x0: vw(10), x1: vw(60), y0: vh(22), fit: "xMidYMin meet" },
  );

  legendHorizontal(
    doc,
    [
      { color: red, value: "مهندسين" },
      { color: yellow, value: "مراقبين" },
      { color: lightGreen, value: "عمالة مدربة" },
      { color: cyan, value: "عمالة عادية" },
    ],
    { x0: vw(10), x1: vw(90), y0: vh(45), size: 12 },
  );

  text(doc, "أعداد العمالة المتواجدة يومياً بالموقع", {
    x0: vw(10),
    x1: vw(90),
    y0: vh(50),
    size: 16,
  });

  svg(
    doc,
    barChart({
      width: rvw(80),
      height: rvh(30),
      padding: 0.3,
      sections: data.workersData,
      marginLeft: rvw(5),
      marginRight: rvw(5),
      domain: [
        0,
        Math.max(...data.workersData.map((entry) => entry.data.reduce((a, b) => a + b, 0))),
      ],
      bar: barStacked({ fills: [red, yellow, lightGreen, cyan] }),
    }),
    { x0: vw(10), x1: vw(90), y0: vh(55), fit: "xMidYMin meet" },
  );

  legendHorizontal(
    doc,
    [
      { color: red, value: "مهندسين" },
      { color: yellow, value: "مراقبين" },
      { color: lightGreen, value: "عمالة مدربة" },
      { color: cyan, value: "عمالة عادية" },
    ],
    { x0: vw(10), x1: vw(90), y0: vh(85), size: 12 },
  );

  doc.addPage();
  pageBackground(doc);

  text(doc, "متابعات الأداء خلال الفترة", { x0: vw(10), x1: vw(90), y0: vh(15), color: beige });

  text(doc, "قيمة الأعمال المنفذة يوميا بالموقع", {
    x0: vw(10),
    x1: vw(90),
    y0: vh(20),
    size: 16,
  });

  text(doc, data.monthlyExecutedValues.toString(), {
    x0: vw(55),
    x1: vw(90),
    y0: vh(25),
    weight: "bold",
    size: 24,
    color: cyan,
    align: "center",
  });

  text(doc, "إجمالي قيمة الأعمال المنفذة خلال الشهر بالريال السعودي", {
    x0: vw(55),
    x1: vw(90),
    y0: vh(30),
    weight: "bold",
    color: grey,
    align: "center",
  });

  text(doc, data.averageExecutedValues.toString(), {
    x0: vw(10),
    x1: vw(45),
    y0: vh(25),
    weight: "bold",
    size: 24,
    color: cyan,
    align: "center",
  });

  text(doc, "متوسط قيمة الأعمال المنفذة يومياً بالريال السعودي", {
    x0: vw(10),
    x1: vw(45),
    y0: vh(30),
    weight: "bold",
    color: grey,
    align: "center",
  });

  text(doc, "قيمة الأعمال المنفذة بالألف ريال سعودي", {
    x0: vw(10),
    x1: vw(90),
    y0: vh(37),
    weight: "bold",
    size: 10,
    color: grey,
    align: "center",
  });

  svg(
    doc,
    barChart({
      width: rvw(80),
      height: rvh(30),
      padding: 0.3,
      sections: data.executedValues.map((entry) => ({ ...entry, data: entry.data / 1000 })),
      marginLeft: rvw(5),
      marginRight: rvw(5),
      domain: [0, Math.max(...data.executedValues.map((entry) => entry.data / 1000))],
      bar: barSingle({ fill: cyan }),
    }),
    { x0: vw(10), x1: vw(90), y0: vh(37), fit: "xMidYMin meet" },
  );

  text(doc, "التزام المقاول بتحديث البيانات اليومية", {
    x0: vw(10),
    x1: vw(90),
    y0: vh(65),
    size: 16,
  });

  svg(
    doc,
    barChart({
      width: rvw(80),
      height: rvh(13),
      padding: 0.3,
      sections: data.updatingStatus.map((entry) => ({
        name: entry.name,
        data: [
          entry.data == "منتظم" ? 1 : 0,
          entry.data == "متأخر" ? 1 : 0,
          entry.data == "لم يقدم" ? 1 : 0,
        ],
      })),
      marginLeft: rvw(5),
      marginRight: rvw(5),
      domain: [0, 1],
      verticalAxisVisible: false,
      bar: barStacked({ fills: [green, yellow, red] }),
    }),
    { x0: vw(10), x1: vw(90), y0: vh(75), fit: "xMidYMin meet" },
  );

  text(
    doc,
    `${Math.round(
      (data.updatingStatus.filter((entry) => entry.data == "منتظم").length /
        data.updatingStatus.filter((entry) => entry.data).length) *
        100,
    )}%`,
    {
      x0: vw(60),
      x1: vw(70),
      y0: vh(70),
      weight: "bold",
      size: 24,
      align: "center",
    },
  );

  text(doc, "معامل الالتزام بتحديث البيانات", {
    x0: vw(30),
    x1: vw(60),
    y0: vh(71),
    size: 14,
    align: "center",
  });

  legendHorizontal(
    doc,
    [
      { color: green, value: "منتظم" },
      { color: yellow, value: "متأخر" },
      { color: red, value: "لم يقدم" },
    ],
    { x0: vw(10), x1: vw(80), y0: vh(87), size: 12 },
  );

  doc.addPage();
  pageBackground(doc);

  text(doc, "متابعات الأداء خلال الفترة", { x0: vw(10), x1: vw(90), y0: vh(15), color: beige });

  text(doc, "حالة الطقس خلال الشهر", {
    x0: vw(10),
    x1: vw(90),
    y0: vh(20),
    size: 16,
  });

  svg(
    doc,
    barChart({
      width: rvw(80),
      height: rvh(35),
      padding: 0.7,
      sections: data.weatherData,
      marginLeft: rvw(5),
      marginRight: rvw(5),
      domain: [
        Math.min(...data.weatherData.map((entry) => entry.data[0])),
        Math.max(...data.weatherData.map((entry) => entry.data[1])),
      ],
      bar: barRangeSingle({ fill: red }),
    }),
    { x0: vw(10), x1: vw(90), y0: vh(35), fit: "xMidYMin meet" },
  );

  text(
    doc,
    `${(
      data.weatherData.map((entry) => entry.data[1]).reduce((a, b) => a + b, 0) /
      data.weatherData.length
    ).toFixed(1)} \\ ${(
      data.weatherData.map((entry) => entry.data[0]).reduce((a, b) => a + b, 0) /
      data.weatherData.length
    ).toFixed(1)}`,
    {
      x0: vw(60),
      x1: vw(80),
      y0: vh(30),
      weight: "bold",
      size: 24,
      align: "center",
    },
  );

  text(doc, "متوسط درجات الحرارة العظمى والصغرى", {
    x0: vw(20),
    x1: vw(60),
    y0: vh(31),
    size: 14,
    align: "center",
  });

  subviewSection(10, 90, 0, 100, () => {
    ["أمطار شديدة", "أمطار خفيفة", "غائم كليا", "غائم جزئيا", "مشمس"].forEach((key, index) => {
      text(doc, key, {
        x0: vw((4 - index) * 20),
        x1: vw((5 - index) * 20),
        y0: vh(75),
        weight: "bold",
        size: 16,
        align: "center",
      });

      text(doc, data.weatherStatus[key].toString(), {
        x0: vw((4 - index) * 20),
        x1: vw((5 - index) * 20),
        y0: vh(80),
        weight: "light",
        size: 36,
        align: "center",
      });
    });
  });

  doc.end();
};

const donutSinglePercentage = (percentage: number, { color }: { color: string }): string => {
  const width = 100;
  const thickness = 20;
  const strokeWidth = 2;

  return createSvg(width, width, (svg) => {
    const container = svg.append("g").attr("transform", `translate(${width / 2},${width / 2})`);

    const pie = d3
      .pie<number>()
      .sort(null)
      .value((d) => d);

    const data = pie([percentage, 100 - percentage]);

    const arc = d3
      .arc()
      .outerRadius(width / 2 - strokeWidth / 2)
      .innerRadius(width / 2 - strokeWidth / 2 - thickness);

    container
      .selectAll("path")
      .data(data)
      .join("path")
      .attr("d", arc as any)
      .attr("fill", (d) => (d.index == 0 ? color : "transparent"))
      .attr("stroke", color)
      .attr("stroke-width", strokeWidth);

    container
      .append("text")
      .attr("font-weight", "bold")
      .attr("text-anchor", "middle")
      .attr("alignment-baseline", "central")
      .attr("transform", "translate(1,0)")
      .attr("font-family", "Cairo")
      .text(rtl(`${percentage}%`));
  });
};

const donutMultiplePercentages = (components: { percentage: number; color: string }[]): string => {
  const width = 100;
  const thickness = 15;
  const margin = 15;

  return createSvg(width, width, (svg) => {
    const container = svg.append("g").attr("transform", `translate(${width / 2},${width / 2})`);

    const pie = d3
      .pie<typeof components[number]>()
      .sort(null)
      .value((d) => d.percentage);

    const data = pie(components);

    const arc = d3
      .arc()
      .outerRadius(width / 2 - margin)
      .innerRadius(width / 2 - thickness - margin);

    container
      .selectAll("path")
      .data(data)
      .join("path")
      .attr("d", arc as any)
      .attr("fill", (d) => d.data.color);

    arc.outerRadius(width / 2).innerRadius(width / 2 - margin);

    container
      .selectAll("text")
      .data(data.filter((d) => d.data.percentage >= 5))
      .join("text")
      .attr("font-size", 7)
      .attr("transform", (d) => `translate(${arc.centroid(d as any)})`)
      .attr("text-anchor", "middle")
      .attr("alignment-baseline", "central")
      .attr("font-family", "Cairo")
      .text((d) => rtl(`${d.data.percentage}%`));
  });
};

const barChart = <T>({
  width,
  height,
  marginLeft = 40,
  marginRight = 40,
  marginTop = 40,
  marginBottom = 40,
  padding = 0.05,
  orientation = "vertical",
  horizontalAxisVisible = true,
  verticalAxisVisible = true,
  sections,
  domain,
  bar,
}: {
  width: number;
  height: number;
  marginLeft?: number;
  marginRight?: number;
  marginTop?: number;
  marginBottom?: number;
  padding?: number;
  orientation?: "vertical" | "horizontal";
  horizontalAxisVisible?: boolean;
  verticalAxisVisible?: boolean;
  sections: { name: string; data: T }[];
  domain: [number, number];
  bar: Bar<T>;
}) =>
  createSvg(width, height, (svg) => {
    let sectionScale = d3
      .scaleBand()
      .domain(sections.map((section) => section.name))
      .padding(padding);
    let barScale = d3.scaleLinear().domain(domain).nice();

    const xAxis = (orientation == "vertical" ? sectionScale : barScale).range([
      width - marginRight,
      marginLeft,
    ]) as d3.AxisScale<string | number>;

    const yAxis = (orientation == "vertical" ? barScale : sectionScale).range([
      height - marginBottom,
      marginTop,
    ]) as d3.AxisScale<string | number>;

    svg.append("g").call((g) => bar(g, { xAxis, yAxis, orientation, sections }));

    if (horizontalAxisVisible)
      svg
        .append("g")
        .call(d3.axisBottom(xAxis))
        .attr("transform", `translate(0,${height - marginBottom})`)
        .attr("stroke", "black")
        .selectAll("text")
        .attr("stroke", "none")
        .attr("font-family", "Cairo")
        .attr("color", "black");

    if (verticalAxisVisible)
      svg
        .append("g")
        .call(d3.axisRight(yAxis))
        .attr("transform", `translate(${width - marginRight},0)`)
        .attr("stroke", "black")
        .selectAll("text")
        .attr("stroke", "none")
        .attr("font-family", "Cairo")
        .attr("color", "black");
  });

type Bar<T> = (
  g: d3.Selection<SVGGElement, unknown, null, undefined>,
  options: {
    xAxis: d3.AxisScale<string | number>;
    yAxis: d3.AxisScale<string | number>;
    orientation: "vertical" | "horizontal";
    sections: { name: string; data: T }[];
  },
) => void;

const barSingle = ({ fill }: { fill: string }): Bar<number> => (
  g,
  { xAxis, yAxis, orientation, sections },
): void => {
  g.attr("fill", fill)
    .selectAll("rect")
    .data(sections)
    .join("rect")
    .attr("x", (d) => (orientation == "vertical" ? xAxis(d.name)! : xAxis(d.data)!))
    .attr("y", (d) => (orientation == "vertical" ? yAxis(d.data)! : yAxis(d.name)!))
    .attr("height", (d) =>
      orientation == "vertical" ? yAxis(0)! - yAxis(d.data)! : yAxis.bandwidth!(),
    )
    .attr("width", (d) =>
      orientation == "vertical" ? xAxis.bandwidth!() : xAxis(0)! - xAxis(d.data)!,
    );
};

const barRangeSingle = ({ fill }: { fill: string }): Bar<[number, number]> => (
  g,
  { xAxis, yAxis, orientation, sections },
): void => {
  g.attr("fill", fill)
    .selectAll("rect")
    .data(sections)
    .join("rect")
    .attr("x", (d) => (orientation == "vertical" ? xAxis(d.name)! : xAxis(d.data[1])!))
    .attr("y", (d) => (orientation == "vertical" ? yAxis(d.data[1])! : yAxis(d.name)!))
    .attr("height", (d) =>
      orientation == "vertical" ? yAxis(d.data[0])! - yAxis(d.data[1])! : yAxis.bandwidth!(),
    )
    .attr("width", (d) =>
      orientation == "vertical" ? xAxis.bandwidth!() : xAxis(d.data[0])! - xAxis(d.data[1])!,
    );
};

const barGrouped = ({
  fills,
  padding = 0.05,
}: {
  fills: string[];
  padding?: number;
}): Bar<number[]> => (g, { xAxis, yAxis, orientation, sections }): void => {
  let subAxis = d3
    .scaleBand()
    .domain(
      Array(fills.length)
        .fill(0)
        .map((_d, i) => i.toString())
        .reverse(),
    )
    .padding(padding)
    .range([0, orientation == "vertical" ? xAxis.bandwidth!() : yAxis.bandwidth!()]);

  g.selectAll("g")
    .data(sections)
    .join("g")
    .attr("transform", (d) =>
      orientation == "vertical" ? `translate(${xAxis(d.name)},0)` : `translate(0,${yAxis(d.name)})`,
    )
    .selectAll("rect")
    .data((d) => d.data)
    .join("rect")
    .attr("fill", (_d, i) => fills[i])
    .attr("x", (d, i) => (orientation == "vertical" ? subAxis(i.toString())! : xAxis(d)!))
    .attr("y", (d, i) => (orientation == "vertical" ? yAxis(d)! : subAxis(i.toString())!))
    .attr("height", (d) =>
      orientation == "vertical" ? yAxis(0)! - yAxis(d)! : subAxis.bandwidth(),
    )
    .attr("width", (d) =>
      orientation == "vertical" ? subAxis.bandwidth() : xAxis(0)! - xAxis(d)!,
    );
};

const barStacked = ({ fills }: { fills: string[] }): Bar<number[]> => (
  g,
  { xAxis, yAxis, orientation, sections },
): void => {
  g.selectAll("g")
    .data(sections)
    .join("g")
    .attr("transform", (d) =>
      orientation == "vertical" ? `translate(${xAxis(d.name)},0)` : `translate(0,${yAxis(d.name)})`,
    )
    .selectAll("rect")
    .data((d) => {
      let last = 0;

      return d.data.map((e) => {
        const start = last;
        last = start + e;
        return [start, last] as [number, number];
      });
    })
    .join("rect")
    .attr("fill", (_d, i) => fills[i])
    .attr("x", (d) => (orientation == "vertical" ? 0 : xAxis(d[1])!))
    .attr("y", (d) => (orientation == "vertical" ? yAxis(d[1])! : 0))
    .attr("height", (d) =>
      orientation == "vertical" ? yAxis(d[0])! - yAxis(d[1])! : yAxis.bandwidth!(),
    )
    .attr("width", (d) =>
      orientation == "vertical" ? xAxis.bandwidth!() : xAxis(d[0])! - xAxis(d[1])!,
    );
};

const createSvg = (
  width: number,
  height: number,
  handler: (svg: d3.Selection<SVGSVGElement, unknown, null, undefined>) => void,
): string => {
  const dom = new JSDOM("<!DOCTYPE html><html><body></body</html>");
  const body = d3.select(dom.window.document).select("body");
  const svg = body.append("svg").attr("width", width).attr("height", height);

  handler(svg);

  return body.html();
};
