import JSZip from 'jszip';
import { CFB } from 'xlsx';
import { importLegacyWordTemplate } from '@/api/template-modeling';
import type {
  CanvasCellBorder,
  CanvasPage,
  CanvasSelectionRange,
  CanvasSheetCell,
  CanvasSheetImage,
  CanvasSheetMedia,
  CanvasWordDocument,
  CanvasWordTableCell,
} from '../types';
import {
  buildDataUrl,
  clampImportedColumnCount,
  clampImportedRowCount,
  createImportedCanvasPage,
  DEFAULT_COLUMN_WIDTH,
  DEFAULT_ROW_HEIGHT,
  getImportedPaperContentWidth,
} from './importGrid';

const DEFAULT_FONT_SIZE = 14;
const DEFAULT_LINE_HEIGHT = 1.5;
const WORD_NAMESPACE_PREFIX_REGEXP = /^[a-z]+:/i;
const TWIP_PER_PX = 15;
const DXA_PER_PX = 15;
const EMU_PER_PX = 9525;
const LEGACY_WORD_CELL_MARK_REGEXP = new RegExp(String.fromCharCode(7), 'g');
const LEGACY_WORD_CONTROL_REGEXP = new RegExp(
  `[${String.fromCharCode(0)}-${String.fromCharCode(6)}${String.fromCharCode(8)}${String.fromCharCode(11)}${String.fromCharCode(12)}${String.fromCharCode(14)}-${String.fromCharCode(31)}]+`,
  'g',
);

type ParsedTable = {
  rows: Array<{ height: number; cells: CanvasSheetCell[] }>;
  colWidths: number[];
  mergedCells: CanvasSelectionRange[];
};

type ParsedBlock =
  | { type: 'paragraph'; text: string; style: Record<string, unknown> }
  | { type: 'table'; table: ParsedTable };

type DocxEntry = {
  name: string;
  bytes: Uint8Array;
};

function defaultTextStyle(wrap = false) {
  return {
    textAlign: 'left',
    verticalAlign: 'middle',
    fontSize: DEFAULT_FONT_SIZE,
    whiteSpace: wrap ? 'normal' : 'nowrap',
    lineHeight: wrap ? DEFAULT_LINE_HEIGHT : undefined,
  } as Record<string, unknown>;
}

function normalizePath(value: string) {
  return value.replace(/\\/g, '/').replace(/^\/+/, '');
}

function getLocalName(node: Element) {
  return (node.localName || node.nodeName.replace(WORD_NAMESPACE_PREFIX_REGEXP, '')).replace(
    WORD_NAMESPACE_PREFIX_REGEXP,
    '',
  );
}

function getAttribute(node: Element | undefined, name: string) {
  if (!node) return '';
  return node.getAttribute(`w:${name}`)
    || node.getAttribute(`r:${name}`)
    || node.getAttribute(`a:${name}`)
    || node.getAttribute(name)
    || '';
}

function elementChildren(node: Element | Document | undefined) {
  if (!node) return [];
  return Array.from(node.childNodes).filter((item) => item.nodeType === 1) as Element[];
}

function childrenByLocalName(node: Element | Document | undefined, names: string[]) {
  return elementChildren(node).filter((item) => names.includes(getLocalName(item)));
}

function descendantsByLocalName(node: Element | Document | undefined, name: string) {
  if (!node) return [];
  return Array.from(node.getElementsByTagName('*')).filter((item) => getLocalName(item) === name) as Element[];
}

function firstDescendant(node: Element | Document | undefined, name: string) {
  return descendantsByLocalName(node, name)[0];
}

function firstChild(node: Element | Document | undefined, name: string) {
  return childrenByLocalName(node, [name])[0];
}

function closestAncestor(node: Element | null | undefined, name: string, stopAt?: Element) {
  let current = node?.parentElement ?? null;
  while (current) {
    if (getLocalName(current) === name) return current;
    if (stopAt && current === stopAt) break;
    current = current.parentElement;
  }
  return null;
}

function parseXml(xml: string) {
  return new DOMParser().parseFromString(xml, 'application/xml');
}

function wordHexColor(value?: string | null) {
  const normalized = String(value ?? '').trim();
  if (!normalized || normalized === 'auto') return undefined;
  return normalized.startsWith('#') ? normalized : `#${normalized}`;
}

function parseFontSize(runNode?: Element) {
  const size = Number(getAttribute(firstDescendant(runNode, 'sz'), 'val'));
  return Number.isFinite(size) && size > 0 ? Math.max(DEFAULT_FONT_SIZE, size / 2) : DEFAULT_FONT_SIZE;
}

function parseFontFamily(runNode?: Element) {
  const fontNode = firstDescendant(runNode, 'rFonts');
  return (
    getAttribute(fontNode, 'eastAsia')
    || getAttribute(fontNode, 'ascii')
    || getAttribute(fontNode, 'hAnsi')
    || undefined
  );
}

function estimateTextWidth(text: string) {
  return Array.from(text).reduce((total, char) => total + (((char.codePointAt(0) ?? 0) > 0xff) ? 2 : 1), 0);
}

function estimateTextHeight(text: string, width: number, fontSize = DEFAULT_FONT_SIZE) {
  const charsPerLine = Math.max(1, Math.floor(width / Math.max(7, fontSize * 0.56)));
  const lineCount = text
    .split(/\r?\n/)
    .reduce((sum, line) => sum + Math.max(1, Math.ceil(Math.max(1, estimateTextWidth(line)) / charsPerLine)), 0);
  return Math.max(DEFAULT_ROW_HEIGHT, Math.ceil(lineCount * fontSize * DEFAULT_LINE_HEIGHT + 8));
}

function paragraphsText(node?: Element) {
  return childrenByLocalName(node, ['p']).map(paragraphText).join('\n');
}

function paragraphText(node?: Element) {
  if (!node) return '';
  return descendantsByLocalName(node, 'r')
    .map((run) => {
      const parts: string[] = [];
      elementChildren(run).forEach((child) => {
        const localName = getLocalName(child);
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
    .join('')
    .replace(/\u00a0/g, ' ')
    .trim();
}

function applyRunStyle(style: Record<string, unknown>, runNode?: Element) {
  if (!runNode) return;
  if (firstDescendant(runNode, 'b')) style.fontWeight = 'bold';
  if (firstDescendant(runNode, 'i')) style.fontStyle = 'italic';
  if (firstDescendant(runNode, 'u') && getAttribute(firstDescendant(runNode, 'u'), 'val') !== 'none') {
    style.textDecoration = 'underline';
  }
  const color = wordHexColor(getAttribute(firstDescendant(runNode, 'color'), 'val'));
  if (color) style.color = color;
  style.fontSize = parseFontSize(runNode);
  const fontFamily = parseFontFamily(runNode);
  if (fontFamily) style.fontFamily = fontFamily;
}

function parseParagraphStyle(paragraphNode: Element) {
  const style = defaultTextStyle(true);
  const pPr = firstChild(paragraphNode, 'pPr');
  const firstRun = firstDescendant(paragraphNode, 'r');
  const alignment = getAttribute(firstChild(pPr, 'jc'), 'val');
  if (alignment) {
    style.textAlign = alignment === 'both' ? 'justify' : alignment;
  }
  applyRunStyle(style, firstRun);
  return style;
}

function setDxaStyle(style: Record<string, unknown>, key: string, rawValue: string) {
  const value = Number(rawValue);
  if (Number.isFinite(value) && value > 0) {
    style[key] = Math.round(value / DXA_PER_PX);
  }
}

function parseCellStyle(tcNode: Element): Record<string, unknown> {
  const tcPr = firstChild(tcNode, 'tcPr');
  const shading = firstChild(tcPr, 'shd');
  const firstParagraph = firstDescendant(tcNode, 'p');
  const firstRun = firstDescendant(tcNode, 'r');
  const style = defaultTextStyle(/\r|\n/.test(paragraphsText(tcNode)));

  setDxaStyle(style, 'paddingTop', getAttribute(firstChild(firstChild(tcPr, 'tcMar'), 'top'), 'w'));
  setDxaStyle(style, 'paddingBottom', getAttribute(firstChild(firstChild(tcPr, 'tcMar'), 'bottom'), 'w'));
  setDxaStyle(style, 'paddingLeft', getAttribute(firstChild(firstChild(tcPr, 'tcMar'), 'left'), 'w'));
  setDxaStyle(style, 'paddingRight', getAttribute(firstChild(firstChild(tcPr, 'tcMar'), 'right'), 'w'));

  const backgroundColor = wordHexColor(getAttribute(shading, 'fill'));
  if (backgroundColor) style.backgroundColor = backgroundColor;
  const alignment = getAttribute(firstDescendant(firstParagraph, 'jc'), 'val');
  if (alignment) style.textAlign = alignment === 'both' ? 'justify' : alignment;
  const verticalAlign = getAttribute(firstChild(tcPr, 'vAlign'), 'val');
  if (verticalAlign) style.verticalAlign = verticalAlign === 'center' ? 'middle' : verticalAlign;
  applyRunStyle(style, firstRun);
  return style;
}

function hasWordBorder(border?: Element) {
  if (!border) return false;
  const value = getAttribute(border, 'val');
  return value !== 'nil' && value !== 'none';
}

function parseCellBorder(tcNode: Element): CanvasCellBorder | undefined {
  const borders = firstDescendant(tcNode, 'tcBorders');
  const border: CanvasCellBorder = {
    top: hasWordBorder(firstChild(borders, 'top')),
    bottom: hasWordBorder(firstChild(borders, 'bottom')),
    left: hasWordBorder(firstChild(borders, 'left')),
    right: hasWordBorder(firstChild(borders, 'right')),
  };
  return Object.values(border).some(Boolean) ? border : undefined;
}

function parseGridSpan(tcNode: Element) {
  const value = Number(getAttribute(firstDescendant(tcNode, 'gridSpan'), 'val'));
  return Number.isFinite(value) && value > 1 ? value : 1;
}

function parseCellWidth(tcNode: Element) {
  const tcW = firstDescendant(tcNode, 'tcW');
  const type = getAttribute(tcW, 'type');
  const value = Number(getAttribute(tcW, 'w'));
  return (!type || type === 'dxa') && Number.isFinite(value) && value > 0
    ? Math.max(24, Math.round(value / DXA_PER_PX))
    : 0;
}

function parseVerticalMerge(tcNode: Element): 'restart' | 'continue' | undefined {
  const vMerge = firstDescendant(tcNode, 'vMerge');
  if (!vMerge) return undefined;
  return getAttribute(vMerge, 'val') === 'restart' ? 'restart' : 'continue';
}

function normalizeMergedCells(ranges: CanvasSelectionRange[]) {
  const map = new Map<string, CanvasSelectionRange>();
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

function parseGridWidths(tableNode: Element) {
  return childrenByLocalName(firstChild(tableNode, 'tblGrid'), ['gridCol']).map((node) => {
    const value = Number(getAttribute(node, 'w'));
    return Number.isFinite(value) && value > 0 ? Math.max(24, Math.round(value / DXA_PER_PX)) : DEFAULT_COLUMN_WIDTH;
  });
}

function parseRowHeight(trNode: Element) {
  const value = Number(getAttribute(firstDescendant(trNode, 'trHeight'), 'val'));
  return Number.isFinite(value) && value > 0
    ? Math.max(DEFAULT_ROW_HEIGHT, Math.round(value / TWIP_PER_PX))
    : DEFAULT_ROW_HEIGHT;
}

function parseTable(tableNode: Element): ParsedTable {
  const gridWidths = parseGridWidths(tableNode);
  const widthHints: number[] = [];
  const rows: ParsedTable['rows'] = [];
  const mergedCells: CanvasSelectionRange[] = [];
  const verticalMergeMap = new Map<number, CanvasSelectionRange>();

  childrenByLocalName(tableNode, ['tr']).forEach((trNode, rowIndex) => {
    const rowCells: CanvasSheetCell[] = [];
    let rowHeight = parseRowHeight(trNode);
    let colIndex = 0;

    childrenByLocalName(trNode, ['tc']).forEach((tcNode) => {
      while (rowCells[colIndex]) colIndex += 1;
      const gridSpan = parseGridSpan(tcNode);
      const vMerge = parseVerticalMerge(tcNode);
      const cellWidth = parseCellWidth(tcNode);
      const text = paragraphsText(tcNode);
      const style = parseCellStyle(tcNode);
      const border = parseCellBorder(tcNode);
      const fontSize = Number(style.fontSize ?? DEFAULT_FONT_SIZE);
      const widthPerCol = Math.max(24, Math.round((cellWidth || gridWidths[colIndex] || DEFAULT_COLUMN_WIDTH) / gridSpan));
      const cellHeight = estimateTextHeight(text || ' ', Math.max(24, widthPerCol * gridSpan), fontSize);
      rowHeight = Math.max(rowHeight, cellHeight);

      const cell: CanvasSheetCell = { value: text, style, border };
      rowCells[colIndex] = cell;
      for (let offset = 1; offset < gridSpan; offset += 1) {
        rowCells[colIndex + offset] = { style, border };
      }

      if (cellWidth) {
        for (let offset = 0; offset < gridSpan; offset += 1) {
          const targetIndex = colIndex + offset;
          widthHints[targetIndex] = Math.max(widthHints[targetIndex] ?? 0, widthPerCol);
        }
      }

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

    rows.push({ height: rowHeight, cells: rowCells });
  });

  const columnCount = clampImportedColumnCount(Math.max(gridWidths.length, ...rows.map((row) => row.cells.length), 1));
  const colWidths = Array.from({ length: columnCount }, (_, index) => (
    Math.max(24, Math.round(gridWidths[index] ?? widthHints[index] ?? DEFAULT_COLUMN_WIDTH))
  ));

  return {
    rows,
    colWidths,
    mergedCells: normalizeMergedCells(mergedCells),
  };
}

function parseBlocks(doc: Document) {
  return childrenByLocalName(firstDescendant(doc, 'body'), ['p', 'tbl'])
    .map((node): ParsedBlock | null => {
      if (getLocalName(node) === 'tbl') {
        return {
          type: 'table',
          table: parseTable(node),
        };
      }
      const text = paragraphText(node);
      return text
        ? {
            type: 'paragraph',
            text,
            style: parseParagraphStyle(node),
          }
        : null;
    })
    .filter(Boolean) as ParsedBlock[];
}

function sumNumbers(values: number[]) {
  return values.reduce((total, value) => total + value, 0);
}

function findMergedRangeForWordCell(ranges: CanvasSelectionRange[], row: number, col: number) {
  return ranges.find((range) => row >= range.t && row <= range.b && col >= range.l && col <= range.r);
}

function buildWordTableCells(table: ParsedTable, tableIndex: number): CanvasWordTableCell[] {
  const cells: CanvasWordTableCell[] = [];

  table.rows.forEach((row, rowIndex) => {
    row.cells.forEach((cell, colIndex) => {
      const row = rowIndex + 1;
      const col = colIndex + 1;
      const mergedRange = findMergedRangeForWordCell(table.mergedCells, row, col);
      if (mergedRange && (mergedRange.t !== row || mergedRange.l !== col)) return;

      const colSpan = mergedRange ? mergedRange.r - mergedRange.l + 1 : 1;
      const rowSpan = mergedRange ? mergedRange.b - mergedRange.t + 1 : 1;
      cells.push({
        id: `word-table-${tableIndex + 1}-cell-${row}-${col}`,
        row,
        col,
        rowSpan,
        colSpan,
        text: String(cell?.value ?? ''),
        style: cell?.style,
        border: cell?.border,
      });
    });
  });

  return cells;
}

function blocksToWordDocument(
  blocks: ParsedBlock[],
  contentWidth: number,
  images: CanvasSheetImage[],
): CanvasWordDocument {
  const wordBlocks: CanvasWordDocument['blocks'] = [];
  let top = 0;
  let paragraphIndex = 0;
  let tableIndex = 0;

  blocks.forEach((block) => {
    if (block.type === 'paragraph') {
      const fontSize = Number(block.style.fontSize ?? DEFAULT_FONT_SIZE);
      const height = estimateTextHeight(block.text, contentWidth, fontSize);
      wordBlocks.push({
        id: `word-doc-paragraph-${paragraphIndex + 1}`,
        type: 'paragraph',
        text: block.text,
        style: block.style,
        layout: {
          top,
          left: 0,
          width: contentWidth,
          height,
        },
      });
      top += height;
      paragraphIndex += 1;
      return;
    }

    const tableWidth = Math.min(contentWidth, Math.max(1, sumNumbers(block.table.colWidths)));
    const tableHeight = Math.max(1, sumNumbers(block.table.rows.map((row) => row.height)));
    wordBlocks.push({
      id: `word-doc-table-${tableIndex + 1}`,
      type: 'table',
      layout: {
        top,
        left: 0,
        width: tableWidth,
        height: tableHeight,
      },
      columnWidths: block.table.colWidths,
      rowHeights: block.table.rows.map((row) => row.height),
      cells: buildWordTableCells(block.table, tableIndex),
    });
    top += tableHeight;
    tableIndex += 1;
  });

  images.forEach((image, index) => {
    wordBlocks.push({
      id: `word-doc-image-${index + 1}`,
      type: 'image',
      mediaId: image.mediaId,
      layout: {
        left: image.layout.left,
        top: image.layout.top,
        width: image.layout.width,
        height: image.layout.height,
      },
    });
    top = Math.max(top, image.layout.top + image.layout.height);
  });

  return {
    source: 'docx',
    contentWidth,
    contentHeight: Math.max(top, DEFAULT_ROW_HEIGHT),
    blocks: wordBlocks,
  };
}

function resolveDocxOrientation(documentXml: Document) {
  const pageSize = firstDescendant(documentXml, 'pgSz');
  const orient = getAttribute(pageSize, 'orient');
  if (orient === 'landscape') return 'landscape' as const;
  const width = Number(getAttribute(pageSize, 'w'));
  const height = Number(getAttribute(pageSize, 'h'));
  return Number.isFinite(width) && Number.isFinite(height) && width > height ? 'landscape' as const : 'portrait' as const;
}

function parseRelationships(xml: string) {
  const doc = parseXml(xml);
  const rels = new Map<string, string>();
  Array.from(doc.getElementsByTagName('Relationship')).forEach((item) => {
    const id = item.getAttribute('Id');
    const target = item.getAttribute('Target');
    if (id && target) {
      rels.set(id, normalizePath(target.startsWith('word/') ? target : `word/${target}`));
    }
  });
  return rels;
}

async function readZipEntries(file: File) {
  const zip = await JSZip.loadAsync(await file.arrayBuffer());
  const entries = new Map<string, DocxEntry>();
  await Promise.all(Object.keys(zip.files).map(async (name) => {
    const entry = zip.files[name];
    if (entry.dir) return;
    entries.set(normalizePath(name), {
      name: normalizePath(name),
      bytes: new Uint8Array(await entry.async('arraybuffer')),
    });
  }));
  return entries;
}

function collectImageItems(doc: Document) {
  const items: Array<{ relationshipId: string; width: number; height: number; left: number; top: number }> = [];
  const body = firstDescendant(doc, 'body');
  const blocks = childrenByLocalName(body, ['p', 'tbl']);
  let top = 0;

  blocks.forEach((blockNode) => {
    descendantsByLocalName(blockNode, 'blip').forEach((blipNode) => {
      const relationshipId = getAttribute(blipNode, 'embed');
      if (!relationshipId) return;
      const drawing = closestAncestor(blipNode, 'drawing') ?? undefined;
      const extent = firstDescendant(drawing, 'extent') || firstDescendant(drawing, 'ext');
      const widthValue = Number(getAttribute(extent, 'cx'));
      const heightValue = Number(getAttribute(extent, 'cy'));
      const width = Number.isFinite(widthValue) && widthValue > 0 ? Math.round(widthValue / EMU_PER_PX) : 120;
      const height = Number.isFinite(heightValue) && heightValue > 0 ? Math.round(heightValue / EMU_PER_PX) : 80;

      let left = 0;
      let innerTop = 0;
      if (getLocalName(blockNode) === 'tbl') {
        const table = parseTable(blockNode);
        const trNode = closestAncestor(blipNode, 'tr', blockNode);
        const tcNode = closestAncestor(blipNode, 'tc', blockNode);
        const rows = childrenByLocalName(blockNode, ['tr']);
        const rowIndex = trNode ? rows.indexOf(trNode) : -1;
        innerTop = rowIndex > 0 ? table.rows.slice(0, rowIndex).reduce((sum, row) => sum + row.height, 0) : 0;
        if (tcNode && trNode) {
          let colIndex = 0;
          for (const cell of childrenByLocalName(trNode, ['tc'])) {
            if (cell === tcNode) break;
            colIndex += parseGridSpan(cell);
          }
          left = table.colWidths.slice(0, colIndex).reduce((sum, widthPart) => sum + widthPart, 0);
        }
      }

      items.push({
        relationshipId,
        width,
        height,
        left,
        top: top + innerTop,
      });
    });

    top += getLocalName(blockNode) === 'tbl'
      ? parseTable(blockNode).rows.reduce((sum, row) => sum + row.height, 0)
      : estimateTextHeight(paragraphText(blockNode), DEFAULT_COLUMN_WIDTH * 3);
  });

  return items;
}

function mimeTypeByPath(path: string) {
  const extension = path.split('.').pop()?.toLowerCase() ?? 'png';
  if (extension === 'png') return 'image/png';
  if (extension === 'gif') return 'image/gif';
  if (extension === 'svg') return 'image/svg+xml';
  if (extension === 'webp') return 'image/webp';
  return 'image/jpeg';
}

function buildDocxImages(
  doc: Document,
  rels: Map<string, string>,
  entries: Map<string, DocxEntry>,
): { medias: CanvasSheetMedia[]; images: CanvasSheetImage[] } {
  const items = collectImageItems(doc);
  const medias: CanvasSheetMedia[] = [];
  const images: CanvasSheetImage[] = [];

  items.forEach((item, index) => {
    const target = rels.get(item.relationshipId);
    if (!target) return;
    const entry = entries.get(normalizePath(target));
    if (!entry) return;
    const mediaId = `word-media-${index}`;
    const src = buildDataUrl(entry.bytes, mimeTypeByPath(entry.name));
    if (!src) return;
    medias.push({ id: mediaId, src });
    images.push({
      id: `word-image-${index}`,
      mediaId,
      layout: {
        width: item.width,
        height: item.height,
        left: item.left,
        top: item.top,
      },
    });
  });

  return { medias, images };
}

function cleanupLegacyWordText(text: string) {
  return text
    .replace(LEGACY_WORD_CELL_MARK_REGEXP, '\t')
    .replace(LEGACY_WORD_CONTROL_REGEXP, '\n')
    .replace(/[^\S\r\n\t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function scoreLegacyWordText(text: string) {
  return Array.from(text).reduce((score, char) => {
    const codePoint = char.codePointAt(0) ?? 0;
    if (char === '\t') return score + 3;
    if (char === '\n' || char === '\r' || char === ' ') return score;
    if (char === '\ufffd' || (codePoint >= 0x80 && codePoint <= 0x9f)) return score - 12;
    if (codePoint < 0x20) return score - 8;
    return score + (codePoint > 0xff ? 2 : 1);
  }, 0);
}

function extractLegacyWordText(buffer: ArrayBuffer) {
  const cfb = CFB.read(new Uint8Array(buffer), { type: 'buffer' });
  const entry = CFB.find(cfb, '/WordDocument') || CFB.find(cfb, 'WordDocument');
  const content = entry?.content;
  if (!content) {
    throw new Error('Word 文件中未找到 WordDocument 内容流');
  }
  const bytes = new Uint8Array(content);
  const utf16Text = cleanupLegacyWordText(new TextDecoder('utf-16le').decode(bytes));
  const fallbackText = cleanupLegacyWordText(new TextDecoder('windows-1252').decode(bytes));
  return scoreLegacyWordText(utf16Text) >= scoreLegacyWordText(fallbackText) ? utf16Text : fallbackText;
}

function legacyRowsToTable(rows: string[][]): ParsedTable {
  const columnCount = clampImportedColumnCount(Math.max(...rows.map((row) => row.length), 1));
  return {
    rows: rows.slice(0, clampImportedRowCount(rows.length)).map((row) => {
      const cells = Array.from({ length: columnCount }, (_, index) => ({
        value: row[index] ?? '',
        style: defaultTextStyle(/\r|\n/.test(row[index] ?? '')),
        border: {
          top: true,
          right: true,
          bottom: true,
          left: true,
        },
      } satisfies CanvasSheetCell));
      const height = Math.max(
        DEFAULT_ROW_HEIGHT,
        ...cells.map((cell) => estimateTextHeight(String(cell.value ?? ''), DEFAULT_COLUMN_WIDTH)),
      );
      return { height, cells };
    }),
    colWidths: Array(columnCount).fill(DEFAULT_COLUMN_WIDTH),
    mergedCells: [],
  };
}

function legacyTextToBlocks(text: string): ParsedBlock[] {
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
      table: legacyRowsToTable(tableRows),
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
      style: defaultTextStyle(true),
    });
  });
  flushTable();
  return blocks;
}

async function importDocxToCanvasPage(file: File, pageId: string, pageName: string): Promise<CanvasPage> {
  const entries = await readZipEntries(file);
  const documentEntry = entries.get('word/document.xml');
  if (!documentEntry) {
    throw new Error('Word 文件中未找到 document.xml');
  }
  const relsEntry = entries.get('word/_rels/document.xml.rels');
  const doc = parseXml(new TextDecoder().decode(documentEntry.bytes));
  const rels = relsEntry ? parseRelationships(new TextDecoder().decode(relsEntry.bytes)) : new Map<string, string>();
  const orientation = resolveDocxOrientation(doc);
  const blocks = parseBlocks(doc);
  const { medias, images } = buildDocxImages(doc, rels, entries);
  const contentWidth = getImportedPaperContentWidth(orientation);
  const wordDocument = blocksToWordDocument(blocks, contentWidth, images);

  return createImportedCanvasPage({
    pageId,
    pageName,
    orientation,
    canvasMode: 'paper',
    paperMode: 'free',
    wordDocument,
    grid: {
      rowHeights: [DEFAULT_ROW_HEIGHT],
      columnWidths: [contentWidth],
      cells: {},
      mergedCells: [],
      medias,
      images: [],
    },
  });
}

async function importLegacyDocToCanvasPage(file: File, pageId: string, pageName: string): Promise<CanvasPage> {
  const response = await importLegacyWordTemplate(file);
  const imported = response.data.data;
  const cells = Object.fromEntries(
    Object.entries(imported.grid.cells).map(([key, cell]) => [
      key,
      {
        value: cell.value,
        style: cell.style,
        ...(cell.border ? { border: cell.border } : {}),
      },
    ]),
  );
  return createImportedCanvasPage({
    pageId,
    pageName,
    orientation: imported.orientation,
    canvasMode: imported.canvasMode,
    paperMode: imported.paperMode,
    grid: {
      ...imported.grid,
      cells,
    },
  });
}

export async function importWordToCanvasPage(
  file: File,
  options?: { pageId?: string; pageName?: string },
): Promise<CanvasPage> {
  const extension = file.name.split('.').pop()?.toLowerCase() ?? '';
  const pageId = options?.pageId ?? 'page-1';
  const pageName = options?.pageName ?? '页面 1';

  if (extension === 'doc') {
    return importLegacyDocToCanvasPage(file, pageId, pageName);
  }
  return importDocxToCanvasPage(file, pageId, pageName);
}
