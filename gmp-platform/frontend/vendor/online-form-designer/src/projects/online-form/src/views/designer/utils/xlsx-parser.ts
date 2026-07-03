import ExcelJs from 'exceljs';
import * as XLSX from 'xlsx';
import type { IPaper, IRange, ICellStyle, IImage } from '../types';
import toPx from 'unit-to-px';
import {
  DEFAULT_FONT_SIZE,
  DefaultPaper,
  FIELD_PROP_LABEL_MAP,
  FIELD_TYPE_LABEL_MAP,
} from '../constants';
import { cloneDeep } from 'lodash-es';
import { CellBorder } from './cell-border';
import {
  FIELD_TYPE,
  FIELD_TYPE_BUSINESS,
  FIELD_TYPE_TRACE,
} from '/@online-form/views/designer/enums/local-field';

type CellField = {
  x: number;
  y: number;
  fieldKey?: string;
  fieldName?: string;
  fieldType: string;
};
type ImportedFieldMeta = {
  key?: string;
  tmpOldKey?: string;
  name: string;
  type: string;
  required: string;
  uniqueConstraint: any;
  disabled: string;
};
type PaperViewportRange = [string, string];
type PaperTextFitTarget = Pick<IPaper, 'cols' | 'rows' | 'cells' | 'mergedCells'>;
const FieldPropLabels = Object.entries(FIELD_PROP_LABEL_MAP);
const FieldTypeLabels = Object.entries(FIELD_TYPE_LABEL_MAP);
const TRACE_FIELDS = Object.values(FIELD_TYPE_TRACE);
const BUSINESS_FIELDS = Object.values(FIELD_TYPE_BUSINESS);
const TEXT_HEIGHT_PADDING = 8;
const TEXT_WIDTH_RATIO = 0.56;
const DEFAULT_LINE_HEIGHT_RATIO = 1.5;
const MAX_IMPORT_ROWS = 300;
const MAX_IMPORT_COLS = 75;

const isTypeInGroup = (type: string, group: string[]) => group.includes(type);

const generateAutoFieldKey = (type: string, fieldGroup: string[], keyList: string[]) => {
  if (!isTypeInGroup(type, fieldGroup)) return;
  const nums = keyList
    .filter((item) => item.startsWith(type))
    .map((item) => parseInt(item.match(/\d+/)?.[0] || '0', 10));
  const max = nums.length ? Math.max(...nums) : 0;
  return `${type}_${max + 1}_`;
};

export class XlsxParser {
  static isLegacyExcel(file: File) {
    return file.name.split('.').pop()?.toLowerCase() === 'xls';
  }

  static async xlsx2json(file: any) {
    if (XlsxParser.isLegacyExcel(file)) {
      return XlsxParser.xls2json(file);
    }
    const workbook = new ExcelJs.Workbook();
    const xlsxData = await workbook.xlsx.load(file);
    const paperSheet =
      workbook.getWorksheet($t('sys.onlineForm.formStyle')) || workbook.getWorksheet();
    if (!paperSheet) return;
    return XlsxParser.sheetToPaper(paperSheet, xlsxData);
  }

  static async xlsx2jsonWithFields(file: any, keyList: string[]) {
    if (XlsxParser.isLegacyExcel(file)) {
      return XlsxParser.xls2jsonWithFields(file, keyList);
    }
    const workbook = new ExcelJs.Workbook();
    const xlsxData = await workbook.xlsx.load(file);
    const paperSheet =
      workbook.getWorksheet($t('sys.onlineForm.formStyle')) || workbook.getWorksheet();
    const fieldSheet = workbook.getWorksheet($t('sys.onlineForm.formFields'));
    const paper = paperSheet ? XlsxParser.sheetToPaper(paperSheet, xlsxData) : null;
    const fields: Nullable<ImportedFieldMeta[]> = fieldSheet
      ? XlsxParser.sheetToFields(fieldSheet, keyList)
      : null;
    const paperFields: CellField[] = [];
    paper &&
      paper.cells.forEach((row, rowIndex) => {
        row.forEach((cell, colIndex) => {
          console.log('cell', cell);
          // 匹配任意字符，普通模式是中文
          const matches =
            typeof cell?.value === 'string' ? cell?.value?.match(/^\$\{(.+?)\}$/) : null;
          if (!matches) return;
          const matchKey = matches[1];

          const fieldMeta = fields?.find(
            (item) =>
              item.tmpOldKey === matchKey || item.key === matchKey || item.name === matchKey,
          );
          if (!fieldMeta) return;
          paperFields.push({
            x: colIndex + 1,
            y: rowIndex + 1,
            fieldKey: fieldMeta.key,
            fieldName: fieldMeta.name,
            fieldType: fieldMeta.type,
          });
        });
      });
    return {
      paper,
      fields,
      paperFields,
    };
  }

  static async xls2json(file: File) {
    const workbook = XLSX.read(await file.arrayBuffer(), { type: 'array', cellStyles: true });
    const sheet =
      workbook.Sheets[$t('sys.onlineForm.formStyle')] ||
      workbook.Sheets[workbook.SheetNames[0] ?? ''];
    if (!sheet) return;
    return XlsxParser.legacySheetToPaper(sheet);
  }

  static async xls2jsonWithFields(file: File, keyList: string[]) {
    const workbook = XLSX.read(await file.arrayBuffer(), { type: 'array', cellStyles: true });
    const paperSheet =
      workbook.Sheets[$t('sys.onlineForm.formStyle')] ||
      workbook.Sheets[workbook.SheetNames[0] ?? ''];
    const fieldSheet = workbook.Sheets[$t('sys.onlineForm.formFields')];
    const paper = paperSheet ? XlsxParser.legacySheetToPaper(paperSheet) : null;
    const fields = fieldSheet ? XlsxParser.legacySheetToFields(fieldSheet, keyList) : null;
    const paperFields: CellField[] = [];

    paper &&
      paper.cells.forEach((row, rowIndex) => {
        row.forEach((cell, colIndex) => {
          const matches =
            typeof cell?.value === 'string' ? cell?.value?.match(/^\$\{(.+?)\}$/) : null;
          if (!matches) return;
          const matchKey = matches[1];

          const fieldMeta = fields?.find(
            (item) =>
              item.tmpOldKey === matchKey || item.key === matchKey || item.name === matchKey,
          );
          if (!fieldMeta) return;
          paperFields.push({
            x: colIndex + 1,
            y: rowIndex + 1,
            fieldKey: fieldMeta.key,
            fieldName: fieldMeta.name,
            fieldType: fieldMeta.type,
          });
        });
      });

    return {
      paper,
      fields,
      paperFields,
    };
  }

  static legacySheetToPaper(sheet: XLSX.WorkSheet) {
    const range = XlsxParser._decodeLegacySheetRange(sheet);
    const rowCount = Math.min(range.e.r - range.s.r + 1, MAX_IMPORT_ROWS);
    const colCount = Math.min(range.e.c - range.s.c + 1, MAX_IMPORT_COLS);
    const paper: Partial<IPaper> = {
      rows: XlsxParser._legacyRows(sheet, rowCount),
      cols: XlsxParser._legacyCols(sheet, colCount),
      cells: Array(rowCount)
        .fill('')
        .map(() =>
          Array(colCount)
            .fill('')
            .map(() => ({})),
        ),
      mergedCells: XlsxParser._legacyMergedCells(sheet, rowCount, colCount),
      medias: [],
      images: [],
    };

    Array(rowCount)
      .fill('')
      .forEach((_, rowIndex) => {
        Array(colCount)
          .fill('')
          .forEach((_, colIndex) => {
            const address = XLSX.utils.encode_cell({
              r: range.s.r + rowIndex,
              c: range.s.c + colIndex,
            });
            const cell = sheet[address];
            if (!cell) return;
            const targetCell = paper.cells![rowIndex][colIndex];
            targetCell.style = XlsxParser._legacyCellStyle(cell);
            if (XlsxParser._isMergedSecondaryCell(paper.mergedCells!, colIndex + 1, rowIndex + 1)) {
              return;
            }
            targetCell.value = XlsxParser._legacyCellValue(cell);
          });
      });

    XlsxParser.fitRowsToWrappedText(paper as PaperTextFitTarget);
    return {
      ...cloneDeep(DefaultPaper),
      ...paper,
    };
  }

  static legacySheetToFields(sheet: XLSX.WorkSheet, keyList: string[]): ImportedFieldMeta[] {
    const data = XLSX.utils.sheet_to_json<string[]>(sheet, { header: 1, raw: false });
    const headers = (data[0] ?? []).slice(0, 10);
    const colFieldPropMap = new Map<number, string>();
    headers.forEach((text, colIndex) => {
      const fieldProp = FieldPropLabels.find(
        (field) =>
          field[1] ===
          String(text ?? '')
            .replaceAll('*', '')
            .trim(),
      );
      if (fieldProp) {
        colFieldPropMap.set(colIndex, fieldProp[0]);
      }
    });

    const fields = data.slice(1, MAX_IMPORT_ROWS).map((row) => {
      const field: Partial<ImportedFieldMeta> = {};
      Array(Math.min(row.length, 10))
        .fill('')
        .forEach((_, colIndex) => {
          if (colFieldPropMap.has(colIndex)) {
            field[colFieldPropMap.get(colIndex)!] = row[colIndex] ?? '';
          }
        });
      return field as ImportedFieldMeta;
    });

    const cloneKeyList = [...keyList];
    fields.forEach((field) => {
      XlsxParser._field2Meta(field, cloneKeyList);
    });
    return fields;
  }

  static _decodeLegacySheetRange(sheet: XLSX.WorkSheet) {
    return sheet['!ref']
      ? XLSX.utils.decode_range(sheet['!ref'])
      : {
          s: { r: 0, c: 0 },
          e: { r: 0, c: 0 },
        };
  }

  static _legacyRows(sheet: XLSX.WorkSheet, rowCount: number): IPaper['rows'] {
    return Array(rowCount)
      .fill('')
      .map((_, index) => {
        const rowInfo = sheet['!rows']?.[index];
        const height = rowInfo?.hpx ?? (rowInfo?.hpt ? parseInt(toPx(`${rowInfo.hpt}pt`)) : 24);
        return { height };
      });
  }

  static _legacyCols(sheet: XLSX.WorkSheet, colCount: number): IPaper['cols'] {
    return Array(colCount)
      .fill('')
      .map((_, index) => {
        const colInfo = sheet['!cols']?.[index];
        const width = colInfo?.wpx ?? (colInfo?.wch ? Math.floor(colInfo.wch * toPx('ch')) : 80);
        return { width };
      });
  }

  static _legacyMergedCells(sheet: XLSX.WorkSheet, rowCount: number, colCount: number): IRange[] {
    return (sheet['!merges'] ?? [])
      .map((range) => ({
        t: range.s.r + 1,
        l: range.s.c + 1,
        b: range.e.r + 1,
        r: range.e.c + 1,
      }))
      .filter((range) => range.t <= rowCount && range.l <= colCount)
      .map((range) => ({
        ...range,
        b: Math.min(rowCount, range.b),
        r: Math.min(colCount, range.r),
      }));
  }

  static _isMergedSecondaryCell(mergedCells: IRange[], x: number, y: number) {
    return mergedCells.some(
      (range) =>
        range.l <= x &&
        range.r >= x &&
        range.t <= y &&
        range.b >= y &&
        !(range.l === x && range.t === y),
    );
  }

  static _legacyCellValue(cell: XLSX.CellObject) {
    if (cell.w !== undefined) return cell.w;
    if (cell.v !== undefined) return cell.v;
    return '';
  }

  static _legacyCellStyle(cell: XLSX.CellObject): ICellStyle {
    const style: ICellStyle = {
      'text-align': 'left',
      'vertical-align': 'middle',
      'font-size': `${DEFAULT_FONT_SIZE}px`,
    };
    const rawStyle = cell.s as any;
    const alignment = rawStyle?.alignment;
    if (alignment?.horizontal) {
      style['text-align'] = alignment.horizontal;
    }
    if (alignment?.vertical) {
      style['vertical-align'] = alignment.vertical;
    }
    if (alignment?.wrapText) {
      style['white-space'] = 'pre-line';
      style['line-height'] = '1.5em';
    }
    if (rawStyle?.font?.sz) {
      style['font-size'] = `${Math.max(DEFAULT_FONT_SIZE, rawStyle.font.sz)}px`;
    }
    if (rawStyle?.font?.bold) {
      style['font-weight'] = 'bold';
    }
    if (rawStyle?.font?.italic) {
      style['font-style'] = 'italic';
    }
    if (rawStyle?.font?.underline) {
      style['text-decoration'] = 'underline';
    }
    if (rawStyle?.font?.color?.rgb) {
      style.color = XlsxParser._legacyRgbColor(rawStyle.font.color.rgb);
    }
    const backgroundColor = rawStyle?.fill?.fgColor?.rgb || rawStyle?.fill?.patternColor?.rgb;
    if (backgroundColor) {
      style['background-color'] = XlsxParser._legacyRgbColor(backgroundColor);
    }
    return style;
  }

  static _legacyRgbColor(value: string) {
    const color = value.replace(/^#/, '').slice(-6);
    return `#${color.padStart(6, '0')}`;
  }

  static sheetToPaper(paperSheet: any, xlsxData: any) {
    // 限制解析范围
    const SheetRowCount = Math.min(paperSheet.dimensions.bottom, 300);
    const SheetColCount = Math.min(paperSheet.dimensions.right, 75);
    const paper: Partial<IPaper> = {};

    // 设置行高
    const { defaultRowHeight, defaultColWidth } = paperSheet.properties;
    const defaultRowHeightPx = parseInt(toPx(`${defaultRowHeight}pt`));
    const rows: IPaper['rows'] = [];

    Array(SheetRowCount)
      .fill('')
      .forEach((r, i) => {
        const row = paperSheet._rows[i];
        // const { height } =;
        rows.push({
          height: parseInt(toPx(`${row?.height ?? defaultRowHeight}pt`)),
        });
      });
    paper.rows = rows;

    // 设置列宽
    const cols: IPaper['cols'] = [];
    Array(SheetColCount)
      .fill('')
      .forEach((c, i) => {
        const { width } = paperSheet.columns[i];
        const _w = width ?? defaultColWidth;

        cols.push({
          // width: _w === undefined ? 80 : Math.floor(_w * 7 + 5),
          width: _w === undefined ? 80 : Math.floor(_w * toPx('ch')),
        });
      });
    paper.cols = cols;

    // 读取样式和数据
    const cells = Array(SheetRowCount)
      .fill('')
      .map(() =>
        Array(SheetColCount)
          .fill('')
          .map(() => ({})),
      );

    Array(SheetRowCount)
      .fill('')
      .forEach((_, rowIndex) => {
        if (!paperSheet._rows[rowIndex]) return;
        Array(SheetColCount)
          .fill('')
          .forEach((_, colIndex) => {
            const cell = paperSheet._rows[rowIndex]._cells[colIndex];
            if (!cell) return;
            const { alignment, fill, font } = cell.style;
            const cellName = cell._address;

            const fontSize =
              typeof font?.size === 'number'
                ? Math.max(font.size, DEFAULT_FONT_SIZE)
                : DEFAULT_FONT_SIZE;
            const cellStyle = {
              'text-align': alignment?.horizontal ?? 'left',
              'vertical-align': alignment?.vertical ?? 'middle',
              'background-color': fill?.fgColor?.argb?.substring(2).padStart(7, '#'),
              color: font?.color?.argb?.substring(2).padStart(7, '#'),
              'font-size': `${fontSize}px`,
              'white-space': alignment?.wrapText ? 'pre-line' : undefined,
            };
            if (alignment?.wrapText) {
              cellStyle['line-height'] = '1.5em';
            }

            cells[rowIndex][colIndex].style = cellStyle;

            // 这里过滤掉合并单元格 只设置主单元格
            if (cellName !== cell.master.address) return;
            let cellValue = '';
            if (typeof cell.value !== 'object') {
              cellValue = cell.value;
            } else if (typeof cell.text !== 'object') {
              cellValue = cell.text;
            }
            if (/\r|\n/.test(String(cellValue)) && !cellStyle['white-space']) {
              cellStyle['white-space'] = 'pre-line';
              cellStyle['line-height'] = '1.5em';
            }
            cells[rowIndex][colIndex].value = cellValue;
          });
      });

    paper.cells = cells;

    const mergedCells: IRange[] = [];
    Object.entries(paperSheet._merges).forEach((m) => {
      const { top: t, bottom: b, left: l, right: r } = m[1];
      if (t > SheetRowCount || l > SheetColCount) return;
      mergedCells.push({
        t,
        l,
        b: Math.min(SheetRowCount, b),
        r: Math.min(SheetColCount, r),
      });
    });
    paper.mergedCells = mergedCells;
    XlsxParser.fitRowsToWrappedText(paper as PaperTextFitTarget);

    /**
     * 抽离边框设置逻辑 与设计器中保持一致
     */
    Array(SheetRowCount)
      .fill('')
      .forEach((_, rowIndex) => {
        if (!paperSheet._rows[rowIndex]) return;
        Array(SheetColCount)
          .fill('')
          .forEach((_, colIndex) => {
            const cell = paperSheet._rows[rowIndex]._cells[colIndex];
            if (!cell) return;
            const { border } = cell.style;
            !!border?.top && CellBorder.setTop(colIndex + 1, rowIndex + 1, paper as any);
            !!border?.bottom && CellBorder.setBottom(colIndex + 1, rowIndex + 1, paper as any);
            !!border?.left && CellBorder.setLeft(colIndex + 1, rowIndex + 1, paper as any);
            !!border?.right && CellBorder.setRight(colIndex + 1, rowIndex + 1, paper as any);
          });
      });

    // 处理图片
    // todo 判断一下时图片类型
    const medias = (xlsxData.media ?? []).map((m) => {
      const id = Math.random().toString(36).substring(2, 10);
      const src = `data:image/${m.extension};base64,` + m.buffer.toString('base64');
      return {
        id,
        src,
      };
    });
    const images: IImage[] = [];
    paperSheet._media.forEach((m) => {
      const { imageId, range } = m;
      // 单位EMU 1EMU=1/914400英寸
      const imageLayout = {
        height:
          parseInt(toPx(`${(range.br.nativeRowOff - range.tl.nativeRowOff) / 914400}in`)) +
          (range.br.nativeRow - range.tl.nativeRow > 0
            ? Array(range.br.nativeRow - range.tl.nativeRow)
                .fill('')
                .reduce((total, r, i) => {
                  total = total + paper.rows[i + range.tl.nativeRow]?.height ?? defaultRowHeightPx;
                  return total;
                }, 0)
            : 0),
        width:
          parseInt(toPx(`${(range.br.nativeColOff - range.tl.nativeColOff) / 914400}in`)) +
          (range.br.nativeCol - range.tl.nativeCol > 0
            ? Array(range.br.nativeCol - range.tl.nativeCol)
                .fill('')
                .reduce((total, c, i) => {
                  total = total + paper.cols[i + range.tl.nativeCol].width;
                  return total;
                }, 0)
            : 0),
        top: parseInt(toPx(`${range.tl.nativeRowOff / 914400}in`)),
        left: parseInt(toPx(`${range.tl.nativeColOff / 914400}in`)),
      };

      const deltaX = Array(range.tl.nativeCol)
        .fill('')
        .reduce((result, i, index) => {
          result += paper.cols[index].width;
          return result;
        }, 0);

      const deltaY = Array(range.tl.nativeRow)
        .fill('')
        .reduce((result, i, index) => {
          result += paper.rows[index]?.height ?? defaultRowHeightPx;
          return result;
        }, 0);

      const img: IImage = {
        id: Math.random().toString(36).substring(2, 10),
        mediaId: medias[imageId].id,
        layout: {
          height: imageLayout.height,
          width: imageLayout.width,
          top: imageLayout.top + deltaY,
          left: imageLayout.left + deltaX,
        },
      };

      images.push(img);
    });
    paper.medias = medias;
    paper.images = images;

    return {
      ...cloneDeep(DefaultPaper),
      ...paper,
    };
  }

  /**
   * 根据 sheet 内容解析字段信息
   * @param sheet
   * @returns
   */
  static sheetToFields(sheet: any, keyList: string[]): ImportedFieldMeta[] {
    const SheetRowCount: number = Math.min(sheet.rowCount, 300);
    const SheetColCount: number = Math.min(sheet.columnCount, 10);

    const colFieldPropMap = new Map();

    Array(SheetColCount)
      .fill('')
      .forEach((_, colIndex) => {
        const cell = sheet._rows[0]._cells[colIndex];
        const fieldProp = FieldPropLabels.find(
          (f) => f[1] === (cell?.text ?? '').replaceAll('*', '').trim(),
        );
        if (fieldProp) {
          colFieldPropMap.set(colIndex, fieldProp[0]);
        }
      });

    const fields: ImportedFieldMeta[] = [];

    Array(SheetRowCount)
      .fill('')
      .forEach((_, rowIndex) => {
        if (rowIndex === 0) return;
        if (!sheet._rows[rowIndex]) return;
        const field: Partial<ImportedFieldMeta> = {};
        Array(SheetColCount)
          .fill('')
          .forEach((_, colIndex) => {
            const cell = sheet._rows[rowIndex]._cells[colIndex];
            if (colFieldPropMap.has(colIndex)) {
              field[colFieldPropMap.get(colIndex)] = cell?.text ?? '';
            }
          });
        // if (!fields.find((f) => f.key === field.key)) {
        //   // 重复字段不导入
        //   fields.push(field as any);
        // }
        fields.push(field as any);
      });
    const cloneKeyList = [...keyList];
    fields.forEach((f) => {
      XlsxParser._field2Meta(f, cloneKeyList);
    });

    return fields;
  }

  /**
   * 字段信息转换为元数据
   * @param field
   */
  static _field2Meta(field, keyList: string[]) {
    const { type, required } = field;
    field.required = required === $t('sys.true') ? 1 : 0;
    const fieldType = FieldTypeLabels.find((f) => f[1] === type);
    if (fieldType) {
      field.type = fieldType[0];
    } else {
      field.type = FIELD_TYPE.TEXT;
    }

    // 对特殊字段进行处理
    if (isTypeInGroup(field.type, BUSINESS_FIELDS)) {
      field.tmpOldKey = field.key;
      field.key = generateAutoFieldKey(field.type, BUSINESS_FIELDS, []);
    } else if (isTypeInGroup(field.type, TRACE_FIELDS)) {
      field.tmpOldKey = field.key;
      const key = generateAutoFieldKey(field.type, TRACE_FIELDS, keyList);
      field.key = key;
      keyList.push(key!);
    }
    field.uniqueConstraint = {
      type: field.uniqueConstraint === $t('sys.true') ? 'GLOBAL' : 'NONE',
    };
    field.disabled = field.disabled === $t('sys.true') ? 1 : 0;
  }

  /**
   * @param paper 导入的纸张数据
   * @param range 最大显示范围
   * @param mode 缩放模式 x: 横向 y: 纵向
   */
  static contentFitToPaper(paper: IPaper, range: PaperViewportRange, mode = 'x') {
    //内容宽度
    const contentWidth = paper?.cols.reduce((total, item) => {
      total += item.width;
      return total;
    }, 0);
    //内容高度
    const contentHeight = paper?.rows.reduce((total, item) => {
      total += item.height;
      return total;
    }, 0);

    // 视口宽度
    const viewportWidth = parseInt(toPx(range[0]));
    // 视口高度
    const viewportHeight = parseInt(toPx(range[1]));

    const xRatio = contentWidth / viewportWidth;
    const yRatio = contentHeight / viewportHeight;

    const maxRatio = mode === 'x' ? xRatio : Math.max(xRatio, yRatio);
    // 按比例缩放
    if (maxRatio > 1) {
      paper.cols.forEach((item) => {
        item.width = item.width / maxRatio;
      });
      paper.rows.forEach((item) => {
        item.height = item.height / maxRatio;
      });
    }
    XlsxParser.fitRowsToWrappedText(paper);
  }

  static fitRowsToWrappedText(paper: PaperTextFitTarget) {
    paper.cells.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        if (cell?.value === undefined || cell?.value === null || cell.value === '') return;
        const text = String(cell.value);
        const hasLineBreak = /\r|\n/.test(text);
        const style = cell.style ?? {};
        const whiteSpace = String(style['white-space'] ?? '');
        const wordBreak = String(style['word-break'] ?? '');
        const canWrap =
          whiteSpace === 'pre-line' ||
          whiteSpace === 'pre-wrap' ||
          whiteSpace === 'break-spaces' ||
          wordBreak === 'break-all';
        if (!canWrap && !hasLineBreak) return;

        const x = colIndex + 1;
        const y = rowIndex + 1;
        const mergedCell = XlsxParser._getMergedCell(paper, x, y);
        if (mergedCell && (mergedCell.l !== x || mergedCell.t !== y)) return;

        const fontSize = XlsxParser._parseFontSize(style['font-size']);
        const lineHeight = XlsxParser._parseLineHeight(style['line-height'], fontSize);
        const availableWidth = XlsxParser._getCellWidth(paper, mergedCell, x);
        const requiredHeight =
          XlsxParser._getTextLineCount(text, availableWidth, fontSize, canWrap) * lineHeight +
          TEXT_HEIGHT_PADDING;

        XlsxParser._expandRowsToHeight(paper, mergedCell, y, Math.ceil(requiredHeight));
      });
    });
  }

  static _parseFontSize(value: ICellStyle[string]) {
    const parsed = Number.parseFloat(String(value ?? ''));
    return Number.isFinite(parsed) ? parsed : DEFAULT_FONT_SIZE;
  }

  static _parseLineHeight(value: ICellStyle[string], fontSize: number) {
    const raw = String(value ?? '').trim();
    const parsed = Number.parseFloat(raw);
    if (!Number.isFinite(parsed)) return fontSize * DEFAULT_LINE_HEIGHT_RATIO;
    if (raw.endsWith('em')) return parsed * fontSize;
    return parsed > DEFAULT_LINE_HEIGHT_RATIO ? parsed : parsed * fontSize;
  }

  static _getMergedCell(paper: PaperTextFitTarget, x: number, y: number) {
    return paper.mergedCells.find(
      (item) => item.l <= x && item.r >= x && item.t <= y && item.b >= y,
    );
  }

  static _getCellWidth(paper: PaperTextFitTarget, mergedCell: IRange | undefined, x: number) {
    const start = mergedCell?.l ?? x;
    const end = mergedCell?.r ?? x;
    return Array(end - start + 1)
      .fill('')
      .reduce((total, _, index) => total + (paper.cols[start - 1 + index]?.width ?? 0), 0);
  }

  static _getTextLineCount(
    text: string,
    availableWidth: number,
    fontSize: number,
    canWrap: boolean,
  ) {
    const charsPerLine = Math.max(1, Math.floor(availableWidth / (fontSize * TEXT_WIDTH_RATIO)));
    return text
      .replace(/\r\n/g, '\n')
      .split(/\r|\n/)
      .reduce((total, line) => {
        if (!canWrap) return total + 1;
        const textWidth = XlsxParser._getTextWidth(line);
        return total + Math.max(1, Math.ceil(textWidth / charsPerLine));
      }, 0);
  }

  static _getTextWidth(text: string) {
    return Array.from(text).reduce((total, char) => {
      return total + ((char.codePointAt(0) ?? 0) > 0xff ? 2 : 1);
    }, 0);
  }

  static _expandRowsToHeight(
    paper: PaperTextFitTarget,
    mergedCell: IRange | undefined,
    y: number,
    requiredHeight: number,
  ) {
    const start = mergedCell?.t ?? y;
    const end = mergedCell?.b ?? y;
    const currentHeight = Array(end - start + 1)
      .fill('')
      .reduce((total, _, index) => total + (paper.rows[start - 1 + index]?.height ?? 0), 0);
    if (currentHeight >= requiredHeight) return;
    const targetRow = paper.rows[end - 1];
    if (targetRow) {
      targetRow.height += requiredHeight - currentHeight;
    }
  }
}
