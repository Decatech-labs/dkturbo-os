import {
  PDFDocument,
  PDFFont,
  PDFPage,
  StandardFonts,
  rgb,
} from 'pdf-lib';

const PAGE_WIDTH =
  595.28;

const PAGE_HEIGHT =
  841.89;

const MARGIN_X =
  46;

const TOP_MARGIN =
  52;

const BOTTOM_MARGIN =
  48;

const CONTENT_WIDTH =
  PAGE_WIDTH -
  MARGIN_X * 2;

const COLORS = {
  ink:
    rgb(
      0.12,
      0.14,
      0.17,
    ),

  muted:
    rgb(
      0.43,
      0.46,
      0.5,
    ),

  faint:
    rgb(
      0.91,
      0.92,
      0.94,
    ),

  surface:
    rgb(
      0.965,
      0.97,
      0.975,
    ),

  green:
    rgb(
      0.24,
      0.42,
      0.28,
    ),

  greenSoft:
    rgb(
      0.93,
      0.97,
      0.93,
    ),

  blue:
    rgb(
      0.24,
      0.36,
      0.55,
    ),
} as const;

const cleanText =
  (
    value:
      string,
  ): string =>
    value
      .replace(
        /\r\n/g,
        '\n',
      )
      .replace(
        /\r/g,
        '\n',
      );

const splitLongWord =
  (
    word:
      string,

    font:
      PDFFont,

    fontSize:
      number,

    maxWidth:
      number,
  ): string[] => {

    const parts:
      string[] = [];

    let current =
      '';

    for (
      const character
      of word
    ) {
      const candidate =
        `${current}${character}`;

      if (
        current &&
        font.widthOfTextAtSize(
          candidate,
          fontSize,
        ) >
          maxWidth
      ) {
        parts.push(
          current,
        );

        current =
          character;
      } else {
        current =
          candidate;
      }
    }

    if (current) {
      parts.push(
        current,
      );
    }

    return parts;
  };

const wrapText =
  (
    value:
      string,

    font:
      PDFFont,

    fontSize:
      number,

    maxWidth:
      number,
  ): string[] => {

    const paragraphs =
      cleanText(
        value,
      ).split(
        '\n',
      );

    const lines:
      string[] = [];

    for (
      const paragraph
      of paragraphs
    ) {

      if (
        paragraph.trim() ===
        ''
      ) {
        lines.push(
          '',
        );

        continue;
      }

      const sourceWords =
        paragraph
          .trim()
          .split(
            /\s+/,
          );

      const words =
        sourceWords.flatMap(
          word =>
            font.widthOfTextAtSize(
              word,
              fontSize,
            ) >
            maxWidth
              ? splitLongWord(
                  word,
                  font,
                  fontSize,
                  maxWidth,
                )
              : [
                  word,
                ],
        );

      let current =
        '';

      for (
        const word
        of words
      ) {

        const candidate =
          current
            ? `${current} ${word}`
            : word;

        if (
          current &&
          font.widthOfTextAtSize(
            candidate,
            fontSize,
          ) >
            maxWidth
        ) {
          lines.push(
            current,
          );

          current =
            word;
        } else {
          current =
            candidate;
        }
      }

      if (current) {
        lines.push(
          current,
        );
      }
    }

    return lines.length >
      0
      ? lines
      : [
          '',
        ];
  };

export class ReportPdf {

  private readonly document:
    PDFDocument;

  private readonly regular:
    PDFFont;

  private readonly bold:
    PDFFont;

  private page:
    PDFPage;

  private y:
    number;

  private readonly reportTitle:
    string;

  private constructor(
    document:
      PDFDocument,

    regular:
      PDFFont,

    bold:
      PDFFont,

    reportTitle:
      string,
  ) {

    this.document =
      document;

    this.regular =
      regular;

    this.bold =
      bold;

    this.reportTitle =
      reportTitle;

    this.page =
      this.document.addPage([
        PAGE_WIDTH,
        PAGE_HEIGHT,
      ]);

    this.y =
      PAGE_HEIGHT -
      TOP_MARGIN;
  }

  public static async create(
    reportTitle:
      string,
  ): Promise<ReportPdf> {

    const document =
      await PDFDocument.create();

    const [
      regular,
      bold,
    ] =
      await Promise.all([
        document.embedFont(
          StandardFonts.Helvetica,
        ),

        document.embedFont(
          StandardFonts.HelveticaBold,
        ),
      ]);

    document.setCreator(
      'DKTURBO OS',
    );

    document.setProducer(
      'DKTURBO OS',
    );

    document.setTitle(
      reportTitle,
    );

    return new ReportPdf(
      document,
      regular,
      bold,
      reportTitle,
    );
  }

  private addPage(): void {

    this.page =
      this.document.addPage([
        PAGE_WIDTH,
        PAGE_HEIGHT,
      ]);

    this.y =
      PAGE_HEIGHT -
      TOP_MARGIN;

    this.page.drawText(
      'DKTURBO OS',
      {
        x:
          MARGIN_X,

        y:
          this.y,

        size:
          8,

        font:
          this.bold,

        color:
          COLORS.green,
      },
    );

    this.page.drawText(
      this.reportTitle,
      {
        x:
          MARGIN_X +
          72,

        y:
          this.y,

        size:
          8,

        font:
          this.regular,

        color:
          COLORS.muted,
      },
    );

    this.y -=
      28;
  }

  private ensureSpace(
    requiredHeight:
      number,
  ): void {

    if (
      this.y -
        requiredHeight <
      BOTTOM_MARGIN
    ) {
      this.addPage();
    }
  }

  public spacer(
    height:
      number,
  ): void {

    this.ensureSpace(
      height,
    );

    this.y -=
      height;
  }

  public title(
    kicker:
      string,

    title:
      string,

    subtitle:
      string,
  ): void {

    this.ensureSpace(
      94,
    );

    this.page.drawText(
      kicker.toUpperCase(),
      {
        x:
          MARGIN_X,

        y:
          this.y,

        size:
          8.5,

        font:
          this.bold,

        color:
          COLORS.green,
      },
    );

    this.y -=
      23;

    const titleLines =
      wrapText(
        title,
        this.bold,
        22,
        CONTENT_WIDTH,
      );

    for (
      const line
      of titleLines
    ) {
      this.page.drawText(
        line,
        {
          x:
            MARGIN_X,

          y:
            this.y,

          size:
            22,

          font:
            this.bold,

          color:
            COLORS.ink,
        },
      );

      this.y -=
        25;
    }

    this.y -=
      2;

    const subtitleLines =
      wrapText(
        subtitle,
        this.regular,
        10,
        CONTENT_WIDTH,
      );

    for (
      const line
      of subtitleLines
    ) {
      this.page.drawText(
        line,
        {
          x:
            MARGIN_X,

          y:
            this.y,

          size:
            10,

          font:
            this.regular,

          color:
            COLORS.muted,
        },
      );

      this.y -=
        13;
    }

    this.y -=
      18;
  }

  public section(
    title:
      string,

    subtitle?:
      string,
  ): void {

    this.ensureSpace(
      48,
    );

    this.page.drawRectangle({
      x:
        MARGIN_X,

      y:
        this.y -
        26,

      width:
        CONTENT_WIDTH,

      height:
        31,

      color:
        COLORS.greenSoft,
    });

    this.page.drawText(
      title,
      {
        x:
          MARGIN_X +
          11,

        y:
          this.y -
          14,

        size:
          11,

        font:
          this.bold,

        color:
          COLORS.green,
      },
    );

    if (subtitle) {
      const width =
        this.regular
          .widthOfTextAtSize(
            subtitle,
            8,
          );

      this.page.drawText(
        subtitle,
        {
          x:
            PAGE_WIDTH -
            MARGIN_X -
            width -
            11,

          y:
            this.y -
            13,

          size:
            8,

          font:
            this.regular,

          color:
            COLORS.muted,
        },
      );
    }

    this.y -=
      42;
  }

  public subsection(
    title:
      string,

    subtitle?:
      string,
  ): void {

    this.ensureSpace(
      38,
    );

    this.page.drawText(
      title,
      {
        x:
          MARGIN_X,

        y:
          this.y,

        size:
          11,

        font:
          this.bold,

        color:
          COLORS.ink,
      },
    );

    if (subtitle) {
      const lines =
        wrapText(
          subtitle,
          this.regular,
          8.5,
          CONTENT_WIDTH -
          165,
        );

      const text =
        lines[0] ??
        '';

      const width =
        this.regular
          .widthOfTextAtSize(
            text,
            8.5,
          );

      this.page.drawText(
        text,
        {
          x:
            Math.max(
              MARGIN_X +
                170,
              PAGE_WIDTH -
                MARGIN_X -
                width,
            ),

          y:
            this.y +
            1,

          size:
            8.5,

          font:
            this.regular,

          color:
            COLORS.muted,
        },
      );
    }

    this.y -=
      8;

    this.page.drawLine({
      start: {
        x:
          MARGIN_X,

        y:
          this.y,
      },

      end: {
        x:
          PAGE_WIDTH -
          MARGIN_X,

        y:
          this.y,
      },

      thickness:
        0.7,

      color:
        COLORS.faint,
    });

    this.y -=
      16;
  }

  public text(
    value:
      string,

    options?: {
      bold?:
        boolean;

      muted?:
        boolean;

      size?:
        number;

      indent?:
        number;
    },
  ): void {

    const font =
      options?.bold
        ? this.bold
        : this.regular;

    const fontSize =
      options?.size ??
      9;

    const indent =
      options?.indent ??
      0;

    const lineHeight =
      fontSize +
      3;

    const lines =
      wrapText(
        value,
        font,
        fontSize,
        CONTENT_WIDTH -
          indent,
      );

    this.ensureSpace(
      lines.length *
        lineHeight +
        4,
    );

    for (
      const line
      of lines
    ) {
      this.page.drawText(
        line,
        {
          x:
            MARGIN_X +
            indent,

          y:
            this.y,

          size:
            fontSize,

          font,

          color:
            options?.muted
              ? COLORS.muted
              : COLORS.ink,
        },
      );

      this.y -=
        lineHeight;
    }

    this.y -=
      3;
  }

  public comparisonHeader(): void {

    const labelWidth =
      116;

    const plannedWidth =
      182;

    this.ensureSpace(
      29,
    );

    this.page.drawRectangle({
      x:
        MARGIN_X,

      y:
        this.y -
        18,

      width:
        CONTENT_WIDTH,

      height:
        24,

      color:
        COLORS.surface,
    });

    this.page.drawText(
      'DATO',
      {
        x:
          MARGIN_X +
          7,

        y:
          this.y -
          8,

        size:
          7,

        font:
          this.bold,

        color:
          COLORS.muted,
      },
    );

    this.page.drawText(
      'PLANIFICADO',
      {
        x:
          MARGIN_X +
          labelWidth +
          7,

        y:
          this.y -
          8,

        size:
          7,

        font:
          this.bold,

        color:
          COLORS.blue,
      },
    );

    this.page.drawText(
      'REAL',
      {
        x:
          MARGIN_X +
          labelWidth +
          plannedWidth +
          7,

        y:
          this.y -
          8,

        size:
          7,

        font:
          this.bold,

        color:
          COLORS.green,
      },
    );

    this.y -=
      28;
  }

  public comparisonRow(
    label:
      string,

    planned:
      string,

    actual:
      string,

    options?: {
      emphasis?:
        boolean;
    },
  ): void {

    const labelWidth =
      116;

    const plannedWidth =
      182;

    const actualWidth =
      CONTENT_WIDTH -
      labelWidth -
      plannedWidth;

    const fontSize =
      options?.emphasis
        ? 9
        : 8.3;

    const font =
      options?.emphasis
        ? this.bold
        : this.regular;

    const labelLines =
      wrapText(
        label,
        this.bold,
        8,
        labelWidth -
          13,
      );

    const plannedLines =
      wrapText(
        planned,
        font,
        fontSize,
        plannedWidth -
          13,
      );

    const actualLines =
      wrapText(
        actual,
        font,
        fontSize,
        actualWidth -
          13,
      );

    const lineCount =
      Math.max(
        labelLines.length,
        plannedLines.length,
        actualLines.length,
      );

    const lineHeight =
      fontSize +
      3;

    const rowHeight =
      Math.max(
        26,
        lineCount *
          lineHeight +
          10,
      );

    this.ensureSpace(
      rowHeight,
    );

    const rowTop =
      this.y;

    const drawLines =
      (
        lines:
          string[],

        x:
          number,

        drawFont:
          PDFFont,

        color:
          ReturnType<
            typeof rgb
          >,
      ) => {

        let lineY =
          rowTop -
          10;

        for (
          const line
          of lines
        ) {
          this.page.drawText(
            line,
            {
              x,

              y:
                lineY,

              size:
                fontSize,

              font:
                drawFont,

              color,
            },
          );

          lineY -=
            lineHeight;
        }
      };

    drawLines(
      labelLines,
      MARGIN_X +
        7,
      this.bold,
      COLORS.muted,
    );

    drawLines(
      plannedLines,
      MARGIN_X +
        labelWidth +
        7,
      font,
      COLORS.ink,
    );

    drawLines(
      actualLines,
      MARGIN_X +
        labelWidth +
        plannedWidth +
        7,
      font,
      COLORS.ink,
    );

    this.page.drawLine({
      start: {
        x:
          MARGIN_X,

        y:
          rowTop -
          rowHeight +
          3,
      },

      end: {
        x:
          PAGE_WIDTH -
          MARGIN_X,

        y:
          rowTop -
          rowHeight +
          3,
      },

      thickness:
        0.45,

      color:
        COLORS.faint,
    });

    this.y -=
      rowHeight;
  }

  public async save():
  Promise<Uint8Array> {

    const pages =
      this.document.getPages();

    for (
      let index = 0;
      index <
      pages.length;
      index +=
        1
    ) {

      const page =
        pages[index];

      if (!page) {
        continue;
      }

      const footer =
        `DKTURBO OS  ·  ${index + 1}/${pages.length}`;

      page.drawText(
        footer,
        {
          x:
            MARGIN_X,

          y:
            23,

          size:
            7,

          font:
            this.regular,

          color:
            COLORS.muted,
        },
      );
    }

    return this.document.save();
  }
}

export const normalizePdfFilename =
  (
    value:
      string,
  ): string => {

    const trimmed =
      value
        .trim()
        .replace(
          /[\p{Cc}]/gu,
          '',
        )
        .replace(
          /[\\/:"*?<>|]/g,
          '-',
        )
        .replace(
          /\s+/g,
          ' ',
        )
        .slice(
          0,
          140,
        )
        .trim();

    const base =
      trimmed ||
      'DKTURBO OS';

    return base
      .toLocaleLowerCase(
        'es-ES',
      )
      .endsWith(
        '.pdf',
      )
      ? base
      : `${base}.pdf`;
  };

export const buildPdfContentDisposition =
  (
    filename:
      string,
  ): string => {

    const asciiFallback =
      filename
        .normalize(
          'NFD',
        )
        .replace(
          /[\u0300-\u036f]/g,
          '',
        )
        .replace(
          /[^\x20-\x7e]/g,
          '_',
        )
        .replace(
          /["\\]/g,
          '_',
        );

    return [
      `attachment; filename="${asciiFallback}"`,
      `filename*=UTF-8''${encodeURIComponent(
        filename,
      )}`,
    ].join(
      '; ',
    );
  };
