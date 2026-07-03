import { cloneDeep } from 'lodash-es';
import { CFB } from 'xlsx';
import type { ICell, ICellStyle, IImage, IMedia, IPaper, IRange } from '../types';
import {
  DEFAULT_COL_WIDTH,
  DEFAULT_FONT_SIZE,
  DEFAULT_ROW_HEIGHT,
  DefaultPaper,
} from '../constants';

type DocxEntry = {
  name: string;
  compression: number;
  compressed: Uint8Array;
};

type ParsedBlock =
  | {
      type: 'paragraph';
      text: string;
      style: ICellStyle;
    }
  | {
      type: 'table';
      table: ParsedTable;
    };

type ParsedTable = {
  rows: ParsedRow[];
  colWidths: number[];
  mergedCells: IRange[];
};

type ParsedRow = {
  height: number;
  cells: ICell[];
};

const WORD_NAMESPACE_PREFIX_REGEXP = /^[a-z]+:/i;
const TWIP_PER_PX = 15;
const DXA_PER_PX = 15;
const EMU_PER_PX = 9525;
const MAX_IMPORT_ROWS = 300;
const MAX_IMPORT_COLS = 75;
const LEGACY_WORD_CELL_MARK_REGEXP = new RegExp(String.fromCharCode(7), 'g');
const LEGACY_WORD_CONTROL_REGEXP = new RegExp(
  `[${String.fromCharCode(0)}-${String.fromCharCode(6)}${String.fromCharCode(
    8,
  )}${String.fromCharCode(11)}${String.fromCharCode(12)}${String.fromCharCode(
    14,
  )}-${String.fromCharCode(31)}]+`,
  'g',
);

export class WordParser {
  static isWord(file: File) {
    return ['docx', 'doc'].includes(WordParser.getExtension(file));
  }

  static isLegacyWord(file: File) {
    return WordParser.getExtension(file) === 'doc';
  }

  static getExtension(file: File) {
    return file.name.split('.').pop()?.toLowerCase() ?? '';
  }

  static async docx2json(file: File): Promise<IPaper> {
    if (WordParser.isLegacyWord(file)) {
      return WordParser.doc2json(file);
    }
    const entries = await WordParser._readZip(file);
    const documentXml = await WordParser._readEntryText(entries, 'word/document.xml');
    const relsXml = await WordParser._readEntryText(entries, 'word/_rels/document.xml.rels');
    if (!documentXml) {
      throw new Error('Word 文件中未找到 document.xml');
    }

    const doc = WordParser._parseXml(documentXml);
    const rels = relsXml ? WordParser._parseRelationships(relsXml) : new Map<string, string>();
    const blocks = WordParser._parseBlocks(doc);
    const paper = WordParser._blocksToPaper(blocks);
    await WordParser._appendImages(paper, doc, rels, entries);
    return paper;
  }

  static async doc2json(file: File): Promise<IPaper> {
    const wordDocument = WordParser._readLegacyWordDocument(
      new Uint8Array(await file.arrayBuffer()),
    );
    const text = WordParser._extractLegacyWordText(wordDocument);
    const blocks = WordParser._legacyTextToBlocks(text);
    if (!blocks.length) {
      throw new Error('未能从 .doc 文件中读取到可导入内容');
    }
    return WordParser._blocksToPaper(blocks);
  }

  static _blocksToPaper(blocks: ParsedBlock[]): IPaper {
    const rows: IPaper['rows'] = [];
    const cols: IPaper['cols'] = [];
    const cells: IPaper['cells'] = [];
    const mergedCells: IRange[] = [];

    const ensureCols = (count: number, widths: number[] = []) => {
      Array(Math.min(count, MAX_IMPORT_COLS))
        .fill('')
        .forEach((_, index) => {
          if (!cols[index]) {
            cols[index] = {
              width: widths[index] ?? DEFAULT_COL_WIDTH,
            };
          } else if (widths[index]) {
            cols[index].width = Math.max(cols[index].width, widths[index]);
          }
        });
    };

    blocks.forEach((block) => {
      if (rows.length >= MAX_IMPORT_ROWS) return;
      if (block.type === 'paragraph') {
        if (!block.text.trim()) return;
        ensureCols(1);
        rows.push({ height: WordParser._estimateTextHeight(block.text, cols[0].width) });
        cells.push([{ value: block.text, style: block.style }]);
        return;
      }

      const rowOffset = rows.length;
      ensureCols(block.table.colWidths.length, block.table.colWidths);
      block.table.rows.forEach((row) => {
        if (rows.length >= MAX_IMPORT_ROWS) return;
        rows.push({ height: row.height });
        cells.push(
          Array(Math.min(cols.length, MAX_IMPORT_COLS))
            .fill('')
            .map((_, index) => row.cells[index] ?? {}),
        );
      });
      block.table.mergedCells.forEach((range) => {
        if (range.t + rowOffset > MAX_IMPORT_ROWS || range.l > MAX_IMPORT_COLS) return;
        mergedCells.push({
          t: range.t + rowOffset,
          b: Math.min(range.b + rowOffset, MAX_IMPORT_ROWS),
          l: range.l,
          r: Math.min(range.r, MAX_IMPORT_COLS),
        });
      });
    });

    if (cols.length === 0) {
      ensureCols(1);
    }

    return {
      ...cloneDeep(DefaultPaper),
      rows: rows.length ? rows : cloneDeep(DefaultPaper.rows),
      cols: cols.length ? cols : cloneDeep(DefaultPaper.cols),
      cells: cells.length ? cells : cloneDeep(DefaultPaper.cells),
      mergedCells,
      medias: [],
      images: [],
    };
  }

  static _parseBlocks(doc: Document): ParsedBlock[] {
    return WordParser._childrenByLocalName(WordParser._firstDescendant(doc, 'body'), ['p', 'tbl'])
      .map((node): ParsedBlock | null => {
        if (WordParser._localName(node) === 'tbl') {
          return {
            type: 'table',
            table: WordParser._parseTable(node),
          };
        }
        const text = WordParser._paragraphText(node);
        return text
          ? {
              type: 'paragraph',
              text,
              style: WordParser._parseParagraphStyle(node),
            }
          : null;
      })
      .filter(Boolean) as ParsedBlock[];
  }

  static _parseTable(tableNode: Element): ParsedTable {
    const gridWidths = WordParser._parseGridWidths(tableNode);
    const widthHints: number[] = [];
    const rows: ParsedRow[] = [];
    const mergedCells: IRange[] = [];
    const verticalMergeMap = new Map<number, IRange>();

    WordParser._childrenByLocalName(tableNode, ['tr']).forEach((trNode, rowIndex) => {
      const row: ParsedRow = {
        height: WordParser._parseRowHeight(trNode),
        cells: [],
      };
      let colIndex = 0;

      WordParser._childrenByLocalName(trNode, ['tc']).forEach((tcNode) => {
        while (row.cells[colIndex]) colIndex += 1;

        const gridSpan = WordParser._parseGridSpan(tcNode);
        const vMerge = WordParser._parseVerticalMerge(tcNode);
        const cellWidth = WordParser._parseCellWidth(tcNode);
        const text = WordParser._paragraphsText(tcNode);
        const style = WordParser._parseCellStyle(tcNode);
        const border = WordParser._parseCellBorder(tcNode);
        const cell: ICell = {
          value: text,
          style,
          border,
        };

        if (cellWidth) {
          const width = cellWidth / gridSpan;
          Array(gridSpan)
            .fill('')
            .forEach((_, index) => {
              const targetIndex = colIndex + index;
              widthHints[targetIndex] = Math.max(widthHints[targetIndex] ?? 0, width);
            });
        }

        row.cells[colIndex] = cell;
        Array(gridSpan - 1)
          .fill('')
          .forEach((_, index) => {
            row.cells[colIndex + index + 1] = {
              style,
              border,
            };
          });

        if (gridSpan > 1) {
          mergedCells.push({
            t: rowIndex + 1,
            b: rowIndex + 1,
            l: colIndex + 1,
            r: colIndex + gridSpan,
          });
        }

        if (vMerge === 'restart') {
          const range = {
            t: rowIndex + 1,
            b: rowIndex + 1,
            l: colIndex + 1,
            r: colIndex + gridSpan,
          };
          verticalMergeMap.set(colIndex, range);
          mergedCells.push(range);
        } else if (vMerge === 'continue') {
          const range = verticalMergeMap.get(colIndex);
          if (range) {
            range.b = rowIndex + 1;
          }
        } else {
          verticalMergeMap.delete(colIndex);
        }

        colIndex += gridSpan;
      });

      row.height = Math.max(
        row.height,
        ...row.cells.map((cell, index) =>
          WordParser._estimateTextHeight(
            String(cell?.value ?? ''),
            Math.max(20, gridWidths[index] ?? widthHints[index] ?? DEFAULT_COL_WIDTH),
          ),
        ),
      );
      rows.push(row);
    });

    const colCount = Math.max(gridWidths.length, ...rows.map((row) => row.cells.length), 1);

    return {
      rows,
      colWidths: Array(colCount)
        .fill('')
        .map((_, index) => gridWidths[index] ?? widthHints[index] ?? DEFAULT_COL_WIDTH),
      mergedCells: WordParser._normalizeMergedCells(mergedCells),
    };
  }

  static _parseGridWidths(tableNode: Element) {
    const grid = WordParser._firstChild(tableNode, 'tblGrid');
    return WordParser._childrenByLocalName(grid, ['gridCol']).map((node) => {
      const value = Number(WordParser._attr(node, 'w'));
      return Number.isFinite(value) && value > 0
        ? Math.max(20, value / DXA_PER_PX)
        : DEFAULT_COL_WIDTH;
    });
  }

  static _parseRowHeight(trNode: Element) {
    const trHeight = WordParser._firstDescendant(trNode, 'trHeight');
    const value = Number(WordParser._attr(trHeight, 'val'));
    return Number.isFinite(value) && value > 0
      ? Math.max(DEFAULT_ROW_HEIGHT, value / TWIP_PER_PX)
      : DEFAULT_ROW_HEIGHT;
  }

  static _parseGridSpan(tcNode: Element) {
    const gridSpan = WordParser._firstDescendant(tcNode, 'gridSpan');
    const value = Number(WordParser._attr(gridSpan, 'val'));
    return Number.isFinite(value) && value > 1 ? value : 1;
  }

  static _parseCellWidth(tcNode: Element) {
    const tcW = WordParser._firstDescendant(tcNode, 'tcW');
    const type = WordParser._attr(tcW, 'type');
    const value = Number(WordParser._attr(tcW, 'w'));
    return (!type || type === 'dxa') && Number.isFinite(value) && value > 0
      ? Math.max(20, value / DXA_PER_PX)
      : 0;
  }

  static _parseVerticalMerge(tcNode: Element): 'restart' | 'continue' | undefined {
    const vMerge = WordParser._firstDescendant(tcNode, 'vMerge');
    if (!vMerge) return undefined;
    const value = WordParser._attr(vMerge, 'val');
    return value === 'restart' ? 'restart' : 'continue';
  }

  static _parseCellStyle(tcNode: Element): ICellStyle {
    const tcPr = WordParser._firstChild(tcNode, 'tcPr');
    const shading = WordParser._firstChild(tcPr, 'shd');
    const paragraphs = WordParser._descendantsByLocalName(tcNode, 'p');
    const runs = WordParser._descendantsByLocalName(tcNode, 'r');
    const firstParagraph = paragraphs[0];
    const firstRun = runs[0];
    const fontSize = WordParser._parseFontSize(firstRun);
    const style = WordParser._getDefaultTextStyle(/\r|\n/.test(WordParser._paragraphsText(tcNode)));
    style['font-size'] = `${fontSize}px`;
    Object.assign(style, WordParser._parseCellPadding(tcPr));

    const backgroundColor = WordParser._hexColor(WordParser._attr(shading, 'fill'));
    if (backgroundColor) {
      style['background-color'] = backgroundColor;
    }

    const color = WordParser._hexColor(
      WordParser._attr(WordParser._firstDescendant(firstRun, 'color'), 'val'),
    );
    if (color) {
      style.color = color;
    }

    const jc = WordParser._attr(WordParser._firstDescendant(firstParagraph, 'jc'), 'val');
    if (jc) {
      style['text-align'] = jc === 'both' ? 'justify' : jc;
    }

    const vAlign = WordParser._attr(WordParser._firstChild(tcPr, 'vAlign'), 'val');
    if (vAlign) {
      style['vertical-align'] = vAlign === 'center' ? 'middle' : vAlign;
    }

    WordParser._applyRunStyle(style, firstRun);

    return style;
  }

  static _parseCellBorder(tcNode: Element) {
    const borders = WordParser._firstDescendant(tcNode, 'tcBorders');
    const border = {
      top: WordParser._hasWordBorder(WordParser._firstChild(borders, 'top')),
      bottom: WordParser._hasWordBorder(WordParser._firstChild(borders, 'bottom')),
      left: WordParser._hasWordBorder(WordParser._firstChild(borders, 'left')),
      right: WordParser._hasWordBorder(WordParser._firstChild(borders, 'right')),
    };
    const hasBorder = border.top || border.bottom || border.left || border.right;
    return hasBorder ? border : undefined;
  }

  static _parseParagraphStyle(paragraphNode: Element): ICellStyle {
    const style = WordParser._getDefaultTextStyle(true);
    const pPr = WordParser._firstChild(paragraphNode, 'pPr');
    const firstRun = WordParser._firstDescendant(paragraphNode, 'r');

    const jc = WordParser._attr(WordParser._firstChild(pPr, 'jc'), 'val');
    if (jc) {
      style['text-align'] = jc === 'both' ? 'justify' : jc;
    }

    const spacing = WordParser._firstChild(pPr, 'spacing');
    const line = Number(WordParser._attr(spacing, 'line'));
    if (Number.isFinite(line) && line > 0) {
      style['line-height'] = `${WordParser._trimNumber(line / 240)}em`;
    }
    WordParser._setDxaStyle(style, 'padding-top', WordParser._attr(spacing, 'before'));
    WordParser._setDxaStyle(style, 'padding-bottom', WordParser._attr(spacing, 'after'));

    const indent = WordParser._firstChild(pPr, 'ind');
    WordParser._setDxaStyle(style, 'padding-left', WordParser._attr(indent, 'left'));
    WordParser._setDxaStyle(style, 'padding-right', WordParser._attr(indent, 'right'));

    WordParser._applyRunStyle(style, firstRun);
    return style;
  }

  static _parseCellPadding(tcPr?: Element) {
    const tcMar = WordParser._firstChild(tcPr, 'tcMar');
    const style: ICellStyle = {};
    const map: Record<string, keyof ICellStyle> = {
      top: 'padding-top',
      bottom: 'padding-bottom',
      left: 'padding-left',
      right: 'padding-right',
    };
    Object.keys(map).forEach((key) => {
      WordParser._setDxaStyle(
        style,
        map[key],
        WordParser._attr(WordParser._firstChild(tcMar, key), 'w'),
      );
    });
    return style;
  }

  static _applyRunStyle(style: ICellStyle, runNode?: Element) {
    if (!runNode) return;
    if (WordParser._firstDescendant(runNode, 'b')) {
      style['font-weight'] = 'bold';
    }
    if (WordParser._firstDescendant(runNode, 'i')) {
      style['font-style'] = 'italic';
    }
    if (WordParser._firstDescendant(runNode, 'u')) {
      style['text-decoration'] = 'underline';
    }

    const color = WordParser._hexColor(
      WordParser._attr(WordParser._firstDescendant(runNode, 'color'), 'val'),
    );
    if (color) {
      style.color = color;
    }

    const fontSize = WordParser._parseFontSize(runNode);
    if (fontSize) {
      style['font-size'] = `${fontSize}px`;
    }

    const fontFamily = WordParser._parseFontFamily(runNode);
    if (fontFamily) {
      style['font-family'] = fontFamily;
    }
  }

  static _hasWordBorder(border?: Element) {
    if (!border) return false;
    const value = WordParser._attr(border, 'val');
    return value !== 'nil' && value !== 'none';
  }

  static _setDxaStyle(style: ICellStyle, key: keyof ICellStyle, rawValue: string) {
    const value = Number(rawValue);
    if (Number.isFinite(value) && value > 0) {
      style[key] = `${Math.round(value / DXA_PER_PX)}px`;
    }
  }

  static _parseFontSize(runNode?: Element) {
    const sz = WordParser._firstDescendant(runNode, 'sz');
    const value = Number(WordParser._attr(sz, 'val'));
    return Number.isFinite(value) && value > 0
      ? Math.max(DEFAULT_FONT_SIZE, value / 2)
      : DEFAULT_FONT_SIZE;
  }

  static _parseFontFamily(runNode?: Element) {
    const rFonts = WordParser._firstDescendant(runNode, 'rFonts');
    return (
      WordParser._attr(rFonts, 'eastAsia') ||
      WordParser._attr(rFonts, 'ascii') ||
      WordParser._attr(rFonts, 'hAnsi') ||
      undefined
    );
  }

  static _trimNumber(value: number) {
    return Number(value.toFixed(2)).toString();
  }

  static _paragraphsText(node: Element) {
    return WordParser._childrenByLocalName(node, ['p']).map(WordParser._paragraphText).join('\n');
  }

  static _paragraphText(node?: Element) {
    if (!node) return '';
    return WordParser._descendantsByLocalName(node, 'r')
      .map((run) => {
        const parts: string[] = [];
        WordParser._elementChildren(run).forEach((child) => {
          const localName = WordParser._localName(child);
          if (localName === 't') {
            parts.push(child.textContent ?? '');
          } else if (localName === 'tab') {
            parts.push('\t');
          } else if (localName === 'br') {
            parts.push('\n');
          }
        });
        return parts.join('');
      })
      .join('');
  }

  static _legacyTextToBlocks(text: string): ParsedBlock[] {
    const lines = text
      .split(/\r\n|\n|\r/)
      .map((line) => line.trim())
      .filter(Boolean);
    const blocks: ParsedBlock[] = [];
    let tableRows: string[][] = [];

    const flushTable = () => {
      if (!tableRows.length) return;
      blocks.push({
        type: 'table',
        table: WordParser._legacyRowsToTable(tableRows),
      });
      tableRows = [];
    };

    lines.forEach((line) => {
      if (line.includes('\t')) {
        tableRows.push(line.split('\t').map((cell) => cell.trim()));
        return;
      }
      flushTable();
      blocks.push({
        type: 'paragraph',
        text: line,
        style: WordParser._getDefaultTextStyle(true),
      });
    });
    flushTable();
    return blocks;
  }

  static _legacyRowsToTable(rows: string[][]): ParsedTable {
    const colCount = Math.min(Math.max(...rows.map((row) => row.length), 1), MAX_IMPORT_COLS);
    return {
      rows: rows.slice(0, MAX_IMPORT_ROWS).map((row) => {
        const cells = Array(colCount)
          .fill('')
          .map((_, index) => ({
            value: row[index] ?? '',
            style: WordParser._getDefaultTextStyle(/\r|\n/.test(row[index] ?? '')),
            border: {
              top: true,
              bottom: true,
              left: true,
              right: true,
            },
          }));
        const height = Math.max(
          DEFAULT_ROW_HEIGHT,
          ...cells.map((cell) =>
            WordParser._estimateTextHeight(String(cell.value ?? ''), DEFAULT_COL_WIDTH),
          ),
        );
        return {
          height,
          cells,
        };
      }),
      colWidths: Array(colCount).fill(DEFAULT_COL_WIDTH),
      mergedCells: [],
    };
  }

  static _getDefaultTextStyle(wrap = false): ICellStyle {
    return {
      'text-align': 'left',
      'vertical-align': 'middle',
      'font-size': `${DEFAULT_FONT_SIZE}px`,
      'white-space': wrap ? 'pre-line' : undefined,
      'line-height': wrap ? '1.5em' : undefined,
    };
  }

  static _estimateTextHeight(text: string, width: number) {
    const charsPerLine = Math.max(1, Math.floor(width / (DEFAULT_FONT_SIZE * 0.56)));
    const lines = text.split(/\r|\n/).reduce((total, line) => {
      return total + Math.max(1, Math.ceil(WordParser._textWidth(line) / charsPerLine));
    }, 0);
    return Math.max(DEFAULT_ROW_HEIGHT, Math.ceil(lines * DEFAULT_FONT_SIZE * 1.5 + 8));
  }

  static _textWidth(text: string) {
    return Array.from(text).reduce(
      (total, char) => total + ((char.codePointAt(0) ?? 0) > 0xff ? 2 : 1),
      0,
    );
  }

  static _normalizeMergedCells(ranges: IRange[]) {
    const map = new Map<string, IRange>();
    ranges.forEach((range) => {
      if (range.t === range.b && range.l === range.r) return;
      const key = `${range.t}:${range.l}`;
      const existing = map.get(key);
      if (!existing) {
        map.set(key, { ...range });
      } else {
        existing.b = Math.max(existing.b, range.b);
        existing.r = Math.max(existing.r, range.r);
      }
    });
    return Array.from(map.values());
  }

  static async _appendImages(
    paper: IPaper,
    doc: Document,
    rels: Map<string, string>,
    entries: Map<string, DocxEntry>,
  ) {
    const imageItems = WordParser._collectImageItems(doc);
    const medias: IMedia[] = [];
    const images: IImage[] = [];

    for (let index = 0; index < imageItems.length; index += 1) {
      const target = rels.get(imageItems[index].relationshipId);
      if (!target) continue;
      const normalizedTarget = target.startsWith('word/') ? target : `word/${target}`;
      const entry = entries.get(WordParser._normalizePath(normalizedTarget));
      if (!entry) continue;
      const bytes = await WordParser._readEntryBytes(entry);
      const extension = normalizedTarget.split('.').pop()?.toLowerCase() ?? 'png';
      const mediaId = `word-media-${index}`;
      medias.push({
        id: mediaId,
        src: `data:image/${extension};base64,${WordParser._bytesToBase64(bytes)}`,
      });
      images.push({
        id: `word-image-${index}`,
        mediaId,
        layout: {
          width: imageItems[index].width,
          height: imageItems[index].height,
          left: imageItems[index].left,
          top: imageItems[index].top,
        },
      });
    }

    paper.medias = medias;
    paper.images = images;
  }

  static _collectImageItems(doc: Document) {
    const items: Array<{
      relationshipId: string;
      width: number;
      height: number;
      left: number;
      top: number;
    }> = [];
    const body = WordParser._firstDescendant(doc, 'body');
    const blocks = WordParser._childrenByLocalName(body, ['p', 'tbl']);
    let top = 0;

    blocks.forEach((blockNode) => {
      WordParser._descendantsByLocalName(blockNode, 'blip').forEach((blipNode) => {
        const relationshipId = WordParser._attr(blipNode, 'embed');
        if (!relationshipId) return;
        const { width, height } = WordParser._parseDrawingSize(blipNode);
        const offset = WordParser._parseImageOffsetInBlock(blipNode, blockNode);
        items.push({
          relationshipId,
          width,
          height,
          left: offset.left,
          top: top + offset.top,
        });
      });
      top += WordParser._estimateBlockHeight(blockNode);
    });

    if (!items.length) {
      WordParser._descendantsByLocalName(doc, 'blip').forEach((blipNode, index) => {
        const relationshipId = WordParser._attr(blipNode, 'embed');
        if (!relationshipId) return;
        const { width, height } = WordParser._parseDrawingSize(blipNode);
        items.push({
          relationshipId,
          width,
          height,
          left: 0,
          top: index * (height + 10),
        });
      });
    }

    return items;
  }

  static _parseDrawingSize(blipNode: Element) {
    const drawing = WordParser._closestAncestor(blipNode, 'drawing');
    const extent =
      WordParser._firstDescendant(drawing, 'extent') || WordParser._firstDescendant(drawing, 'ext');
    const width = Number(WordParser._attr(extent, 'cx'));
    const height = Number(WordParser._attr(extent, 'cy'));
    return {
      width: Number.isFinite(width) && width > 0 ? Math.round(width / EMU_PER_PX) : 120,
      height: Number.isFinite(height) && height > 0 ? Math.round(height / EMU_PER_PX) : 80,
    };
  }

  static _parseImageOffsetInBlock(blipNode: Element, blockNode: Element) {
    if (WordParser._localName(blockNode) !== 'tbl') {
      return { top: 0, left: 0 };
    }

    const trNode = WordParser._closestAncestor(blipNode, 'tr', blockNode);
    const tcNode = WordParser._closestAncestor(blipNode, 'tc', blockNode);
    const rows = WordParser._childrenByLocalName(blockNode, ['tr']);
    const rowIndex = trNode ? rows.indexOf(trNode) : -1;
    const table = WordParser._parseTable(blockNode);
    const top =
      rowIndex > 0
        ? table.rows.slice(0, rowIndex).reduce((total, row) => total + row.height, 0)
        : 0;

    if (!tcNode || !trNode) {
      return { top, left: 0 };
    }

    let colIndex = 0;
    const cells = WordParser._childrenByLocalName(trNode, ['tc']);
    for (const cell of cells) {
      if (cell === tcNode) break;
      colIndex += WordParser._parseGridSpan(cell);
    }

    return {
      top,
      left: table.colWidths.slice(0, colIndex).reduce((total, width) => total + width, 0),
    };
  }

  static _estimateBlockHeight(blockNode: Element) {
    if (WordParser._localName(blockNode) === 'tbl') {
      return WordParser._parseTable(blockNode).rows.reduce((total, row) => total + row.height, 0);
    }
    const text = WordParser._paragraphText(blockNode);
    if (!text.trim()) {
      return DEFAULT_ROW_HEIGHT;
    }
    return WordParser._estimateTextHeight(text, DEFAULT_COL_WIDTH);
  }

  static _parseRelationships(xml: string) {
    const rels = WordParser._parseXml(xml);
    const map = new Map<string, string>();
    Array.from(rels.getElementsByTagName('Relationship')).forEach((item) => {
      const id = item.getAttribute('Id');
      const target = item.getAttribute('Target');
      if (id && target) {
        map.set(id, WordParser._normalizePath(target));
      }
    });
    return map;
  }

  static async _readZip(file: File) {
    const entries = new Map<string, DocxEntry>();
    const bytes = new Uint8Array(await file.arrayBuffer());
    const centralDirectoryOffset = WordParser._findCentralDirectoryOffset(bytes);
    if (centralDirectoryOffset < 0) {
      throw new Error('无法读取 Word 文件内容，请确认文件是否为有效的 .docx 文件');
    }

    let offset = centralDirectoryOffset;
    while (offset + 46 <= bytes.length && WordParser._readUint32(bytes, offset) === 0x02014b50) {
      const compression = WordParser._readUint16(bytes, offset + 10);
      const compressedSize = WordParser._readUint32(bytes, offset + 20);
      const nameLength = WordParser._readUint16(bytes, offset + 28);
      const extraLength = WordParser._readUint16(bytes, offset + 30);
      const commentLength = WordParser._readUint16(bytes, offset + 32);
      const localHeaderOffset = WordParser._readUint32(bytes, offset + 42);
      const nameStart = offset + 46;
      const nameEnd = nameStart + nameLength;
      const name = WordParser._normalizePath(
        new TextDecoder().decode(bytes.slice(nameStart, nameEnd)),
      );
      const dataStart = WordParser._readLocalFileDataStart(bytes, localHeaderOffset);
      const dataEnd = dataStart + compressedSize;
      entries.set(name, {
        name,
        compression,
        compressed: bytes.slice(dataStart, dataEnd),
      });
      offset = nameEnd + extraLength + commentLength;
    }
    return entries;
  }

  static _findCentralDirectoryOffset(bytes: Uint8Array) {
    for (let offset = bytes.length - 22; offset >= 0; offset -= 1) {
      if (WordParser._readUint32(bytes, offset) === 0x06054b50) {
        return WordParser._readUint32(bytes, offset + 16);
      }
    }
    return -1;
  }

  static _readLocalFileDataStart(bytes: Uint8Array, offset: number) {
    if (offset + 30 > bytes.length || WordParser._readUint32(bytes, offset) !== 0x04034b50) {
      throw new Error('Word 文件内部结构异常，无法读取压缩条目');
    }
    const nameLength = WordParser._readUint16(bytes, offset + 26);
    const extraLength = WordParser._readUint16(bytes, offset + 28);
    return offset + 30 + nameLength + extraLength;
  }

  static async _readEntryText(entries: Map<string, DocxEntry>, name: string) {
    const entry = entries.get(WordParser._normalizePath(name));
    if (!entry) return '';
    const bytes = await WordParser._readEntryBytes(entry);
    return new TextDecoder('utf-8').decode(bytes);
  }

  static async _readEntryBytes(entry: DocxEntry) {
    if (entry.compression === 0) {
      return entry.compressed;
    }
    if (entry.compression !== 8) {
      throw new Error(`不支持的 docx 压缩方式: ${entry.compression}`);
    }
    const stream = new Blob([entry.compressed])
      .stream()
      .pipeThrough(new DecompressionStream('deflate-raw'));
    return new Uint8Array(await new Response(stream).arrayBuffer());
  }

  static _readLegacyWordDocument(bytes: Uint8Array) {
    const cfb = CFB.read(bytes, { type: 'buffer' });
    const entry = CFB.find(cfb, '/WordDocument') || CFB.find(cfb, 'WordDocument');
    const content = entry?.content;
    if (!content) {
      throw new Error('Word 文件中未找到 WordDocument 内容流');
    }
    return new Uint8Array(content);
  }

  static _extractLegacyWordText(bytes: Uint8Array) {
    const utf16Text = WordParser._cleanupLegacyWordText(new TextDecoder('utf-16le').decode(bytes));
    const windows1252Text = WordParser._cleanupLegacyWordText(
      new TextDecoder('windows-1252').decode(bytes),
    );
    return WordParser._scoreLegacyWordText(utf16Text) >=
      WordParser._scoreLegacyWordText(windows1252Text)
      ? utf16Text
      : windows1252Text;
  }

  static _cleanupLegacyWordText(text: string) {
    return text
      .replace(LEGACY_WORD_CELL_MARK_REGEXP, '\t')
      .replace(LEGACY_WORD_CONTROL_REGEXP, '\n')
      .replace(/[^\S\r\n\t]+/g, ' ')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }

  static _scoreLegacyWordText(text: string) {
    return Array.from(text).reduce((score, char) => {
      const codePoint = char.codePointAt(0) ?? 0;
      if (char === '\t') return score + 3;
      if (char === '\n' || char === '\r' || char === ' ') return score;
      if (char === '\ufffd' || (codePoint >= 0x80 && codePoint <= 0x9f)) return score - 12;
      if (codePoint < 0x20) return score - 8;
      return score + (codePoint > 0xff ? 2 : 1);
    }, 0);
  }

  static _parseXml(xml: string) {
    const parser = new DOMParser();
    return parser.parseFromString(xml, 'application/xml');
  }

  static _firstDescendant(node: Element | Document | undefined, localName: string) {
    return WordParser._descendantsByLocalName(node, localName)[0];
  }

  static _firstChild(node: Element | Document | undefined, localName: string) {
    return WordParser._childrenByLocalName(node, [localName])[0];
  }

  static _closestAncestor(node: Element, localName: string, stopAt?: Element) {
    let current: Node | null = node;
    while (current && current.nodeType === 1) {
      const element = current as Element;
      if (element !== node && WordParser._localName(element) === localName) {
        return element;
      }
      if (stopAt && element === stopAt) break;
      current = current.parentNode;
    }
    return undefined;
  }

  static _descendantsByLocalName(node: Element | Document | undefined, localName: string) {
    if (!node) return [];
    return Array.from(node.getElementsByTagName('*')).filter(
      (item) => WordParser._localName(item) === localName,
    ) as Element[];
  }

  static _childrenByLocalName(node: Element | Document | undefined, localNames: string[]) {
    if (!node) return [];
    return WordParser._elementChildren(node).filter((item) =>
      localNames.includes(WordParser._localName(item)),
    );
  }

  static _elementChildren(node: Element | Document) {
    return Array.from(node.childNodes).filter((item) => item.nodeType === 1) as Element[];
  }

  static _localName(node: Element) {
    return (node.localName || node.nodeName.replace(WORD_NAMESPACE_PREFIX_REGEXP, '')).replace(
      WORD_NAMESPACE_PREFIX_REGEXP,
      '',
    );
  }

  static _attr(node: Element | undefined, name: string) {
    if (!node) return '';
    return (
      node.getAttribute(`w:${name}`) ||
      node.getAttribute(`r:${name}`) ||
      node.getAttribute(`wp:${name}`) ||
      node.getAttribute(`a:${name}`) ||
      node.getAttribute(name) ||
      ''
    );
  }

  static _hexColor(value: string) {
    if (!value || value === 'auto') return '';
    return `#${value.replace(/^#/, '').padStart(6, '0')}`;
  }

  static _normalizePath(path: string) {
    const result: string[] = [];
    path.split('/').forEach((part) => {
      if (!part || part === '.') return;
      if (part === '..') {
        result.pop();
      } else {
        result.push(part);
      }
    });
    return result.join('/');
  }

  static _bytesToBase64(bytes: Uint8Array) {
    let binary = '';
    bytes.forEach((byte) => {
      binary += String.fromCharCode(byte);
    });
    return btoa(binary);
  }

  static _readUint16(bytes: Uint8Array, offset: number) {
    return bytes[offset] | (bytes[offset + 1] << 8);
  }

  static _readUint32(bytes: Uint8Array, offset: number) {
    return (
      (bytes[offset] |
        (bytes[offset + 1] << 8) |
        (bytes[offset + 2] << 16) |
        (bytes[offset + 3] << 24)) >>>
      0
    );
  }
}
