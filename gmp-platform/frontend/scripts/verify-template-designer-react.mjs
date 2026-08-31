import { existsSync, readFileSync } from 'node:fs';
import { mkdtemp, rm } from 'node:fs/promises';
import { createRequire } from 'node:module';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';
import ExcelJS from 'exceljs';
import * as XLSX from 'xlsx';

const failures = [];
const require = createRequire(import.meta.url);

function read(relativePath) {
  const url = new URL(relativePath, import.meta.url);
  if (!existsSync(url)) {
    failures.push(`${relativePath}: missing file`);
    return '';
  }
  return readFileSync(url, 'utf8');
}

function assert(condition, message) {
  if (!condition) failures.push(message);
}

function assertIncludes(source, needles, messagePrefix) {
  for (const needle of needles) {
    if (!source.includes(needle)) failures.push(`${messagePrefix}: missing ${needle}`);
  }
}

async function loadExcelImporter() {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), 'verify-template-designer-react-'));
  const outfile = path.join(tempDir, 'importExcel.cjs');
  await build({
    entryPoints: [fileURLToPath(new URL('../src/pages/master-data/template-designer-react/utils/importExcel.ts', import.meta.url))],
    outfile,
    bundle: true,
    format: 'cjs',
    platform: 'node',
    logLevel: 'silent',
  });

  try {
    return require(outfile);
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
}

async function loadSubTableRegionUtils() {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), 'verify-template-designer-react-'));
  const outfile = path.join(tempDir, 'subTableRegion.cjs');
  await build({
    entryPoints: [fileURLToPath(new URL('../src/pages/master-data/template-designer-react/utils/subTableRegion.ts', import.meta.url))],
    outfile,
    bundle: true,
    format: 'cjs',
    platform: 'node',
    logLevel: 'silent',
  });

  try {
    return require(outfile);
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
}

async function loadCommonComponentRegistry() {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), 'verify-template-designer-react-'));
  const outfile = path.join(tempDir, 'commonComponentRegistry.cjs');
  await build({
    entryPoints: [fileURLToPath(new URL('../src/pages/master-data/template-designer-react/registry/commonComponentRegistry.ts', import.meta.url))],
    outfile,
    bundle: true,
    format: 'cjs',
    platform: 'node',
    logLevel: 'silent',
  });

  try {
    return require(outfile);
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
}

async function loadWordTableOperations() {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), 'verify-template-designer-react-'));
  const outfile = path.join(tempDir, 'wordTableOperations.cjs');
  await build({
    entryPoints: [fileURLToPath(new URL('../src/pages/master-data/template-designer-react/utils/wordTableOperations.ts', import.meta.url))],
    outfile,
    bundle: true,
    format: 'cjs',
    platform: 'node',
    logLevel: 'silent',
  });

  try {
    return require(outfile);
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
}

async function loadWordTableLayout() {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), 'verify-template-designer-react-'));
  const outfile = path.join(tempDir, 'wordTableLayout.cjs');
  await build({
    entryPoints: [fileURLToPath(new URL('../src/pages/master-data/template-designer-react/utils/wordTableLayout.ts', import.meta.url))],
    outfile,
    bundle: true,
    format: 'cjs',
    platform: 'node',
    logLevel: 'silent',
  });

  try {
    return require(outfile);
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
}

async function verifyWordTableLayoutBehavior() {
  const { constrainWordTableLayout, constrainWordTableToCanvas, getWordTableEffectiveLayout, fitWordTableColumnWidthsToCanvas, snapWordTableLayout } = await loadWordTableLayout();

  const constrained = constrainWordTableLayout({ left: 720, top: 24, width: 320, height: 180 }, 900);
  assert(constrained.left === 580 && constrained.width === 320, 'wordTableLayout.ts: tables must stay inside the right canvas edge when dragged');

  const oversize = constrainWordTableLayout({ left: 80, top: 24, width: 1200, height: 180 }, 900);
  assert(oversize.left === 0 && oversize.width === 900, 'wordTableLayout.ts: tables wider than the canvas must be reduced to the canvas width');

  const manyColumns = fitWordTableColumnWidthsToCanvas(Array.from({ length: 57 }, () => 100), 900);
  assert(manyColumns.reduce((sum, width) => sum + width, 0) === 900, 'wordTableLayout.ts: column fitting must never let many-column tables exceed the canvas width');

  const constrainedStructure = constrainWordTableToCanvas({
    id: 'wide-table',
    type: 'table',
    layout: { left: 80, top: 24, width: 5700, height: 40 },
    columnWidths: Array.from({ length: 57 }, () => 100),
    rowHeights: [40],
    cells: [],
  }, 900);
  assert(
    constrainedStructure.layout.left + constrainedStructure.columnWidths.reduce((sum, width) => sum + width, 0) <= 900,
    'wordTableLayout.ts: structural table updates must persist constrained width and position',
  );

  const importedNarrowTableLayout = getWordTableEffectiveLayout({
    id: 'imported-narrow-table',
    type: 'table',
    layout: { left: 0, top: 0, width: 900, height: 80 },
    columnWidths: [340, 340],
    rowHeights: [80],
    cells: [],
  }, 900);
  assert(importedNarrowTableLayout.width === 680, 'wordTableLayout.ts: imported table alignment must use its rendered column width rather than stale layout width');
  assert(
    snapWordTableLayout({ ...importedNarrowTableLayout, left: 210 }, 900, []).left === 210,
    'wordTableLayout.ts: imported narrow tables must retain right-drag space inside the canvas',
  );

  const tableWithUnusedTrailingColumn = {
    id: 'table-with-unused-trailing-column',
    type: 'table',
    layout: { left: 0, top: 0, width: 900, height: 80 },
    columnWidths: [340, 340, 220],
    rowHeights: [80],
    cells: [
      { id: 'left', row: 1, col: 1, rowSpan: 1, colSpan: 1, text: '' },
      { id: 'right', row: 1, col: 2, rowSpan: 1, colSpan: 1, text: '' },
    ],
  };
  assert(
    getWordTableEffectiveLayout(tableWithUnusedTrailingColumn, 900).width === 680,
    'wordTableLayout.ts: invisible trailing grid columns must not extend the draggable table width',
  );
  assert(
    constrainWordTableToCanvas(tableWithUnusedTrailingColumn, 900).columnWidths.length === 2,
    'wordTableLayout.ts: invisible trailing grid columns must be removed before rendering resize handles',
  );

  const snapped = snapWordTableLayout(
    { left: 294, top: 360, width: 240, height: 160 },
    900,
    [{ id: 'upper', left: 300, top: 80, width: 240, height: 160 }],
  );
  assert(snapped.left === 300, 'wordTableLayout.ts: dragging near another table left edge must snap into alignment');

  const rightSnapped = snapWordTableLayout(
    { left: 505, top: 360, width: 240, height: 160 },
    900,
    [{ id: 'upper', left: 300, top: 80, width: 450, height: 160 }],
  );
  assert(rightSnapped.left === 510, 'wordTableLayout.ts: dragging near another table right edge must snap into alignment');
}

async function verifyWordTableContextMenuOperations() {
  const {
    insertWordTableColumns,
    insertWordTableRows,
    mergeWordTableCells,
    splitWordTableCell,
    deleteWordTableColumns,
    deleteWordTableRows,
    updateWordTableCellStyle,
  } = await loadWordTableOperations();
  const border = { top: true, right: true, bottom: true, left: true, color: '#111827' };
  const table = {
    id: 'word-table',
    type: 'table',
    layout: { left: 0, top: 0, width: 180, height: 90 },
    columnWidths: [60, 60, 60],
    rowHeights: [30, 30, 30],
    cells: Array.from({ length: 3 }, (_, rowIndex) => Array.from({ length: 3 }, (_, columnIndex) => ({
      id: `cell-${rowIndex + 1}-${columnIndex + 1}`,
      row: rowIndex + 1,
      col: columnIndex + 1,
      rowSpan: 1,
      colSpan: 1,
      text: `${rowIndex + 1}:${columnIndex + 1}`,
      border,
    }))).flat(),
  };

  const withColumn = insertWordTableColumns(table, 2, 2);
  assert(withColumn.columnWidths.length === 5 && withColumn.cells.length === 15, 'wordTableOperations.ts: inserting columns must create editable cells for each inserted track');
  assert(withColumn.cells.some((cell) => cell.row === 1 && cell.col === 2 && cell.text === ''), 'wordTableOperations.ts: inserted columns must contain blank cells at the insertion point');
  assert(withColumn.cells.some((cell) => cell.id === 'cell-1-2' && cell.col === 4), 'wordTableOperations.ts: inserting columns must shift existing cell coordinates');

  const withRow = insertWordTableRows(table, 2, 1);
  assert(withRow.rowHeights.length === 4 && withRow.cells.length === 12, 'wordTableOperations.ts: inserting rows must create editable cells for each inserted track');
  assert(withRow.cells.some((cell) => cell.row === 2 && cell.col === 1 && cell.text === ''), 'wordTableOperations.ts: inserted rows must contain blank cells at the insertion point');

  const merged = mergeWordTableCells(table, { top: 1, left: 1, bottom: 2, right: 2 });
  assert(merged.cells.length === 6 && merged.cells.some((cell) => cell.id === 'cell-1-1' && cell.rowSpan === 2 && cell.colSpan === 2), 'wordTableOperations.ts: merging a selected rectangular range must create one spanning anchor cell');
  const split = splitWordTableCell(merged, 1, 1);
  assert(split.cells.length === 9 && split.cells.every((cell) => cell.rowSpan === 1 && cell.colSpan === 1), 'wordTableOperations.ts: splitting a merged cell must restore individual editable cells');

  const withoutColumn = deleteWordTableColumns(table, 2, 1);
  assert(withoutColumn.columnWidths.length === 2 && withoutColumn.cells.length === 6, 'wordTableOperations.ts: deleting selected columns must remove tracks and reflow cells');
  const withoutRow = deleteWordTableRows(table, 2, 1);
  assert(withoutRow.rowHeights.length === 2 && withoutRow.cells.length === 6, 'wordTableOperations.ts: deleting selected rows must remove tracks and reflow cells');

  const styled = updateWordTableCellStyle(table, { top: 1, left: 1, bottom: 2, right: 2 }, { fontWeight: 'bold', textAlign: 'center' });
  assert(styled.cells.filter((cell) => cell.row <= 2 && cell.col <= 2).every((cell) => cell.style?.fontWeight === 'bold' && cell.style?.textAlign === 'center'), 'wordTableOperations.ts: selected Word table cells must receive toolbar text styles');
  assert(styled.cells.filter((cell) => cell.row > 2 || cell.col > 2).every((cell) => !cell.style?.fontWeight && !cell.style?.textAlign), 'wordTableOperations.ts: Word table text styling must not mutate cells outside the selected range');
}

async function verifyCommonComponentBehavior() {
  const {
    commonCanvasComponents,
    commonDisplayComponents,
    createCommonDisplayNode,
    createCommonWordTableBlock,
  } = await loadCommonComponentRegistry();
  assert(Array.isArray(commonDisplayComponents), 'commonComponentRegistry.ts: must export commonDisplayComponents');
  assert(Array.isArray(commonCanvasComponents), 'commonComponentRegistry.ts: must export commonCanvasComponents');
  assert(typeof createCommonDisplayNode === 'function', 'commonComponentRegistry.ts: must export createCommonDisplayNode');
  assert(typeof createCommonWordTableBlock === 'function', 'commonComponentRegistry.ts: must export createCommonWordTableBlock');
  if (!Array.isArray(commonDisplayComponents) || !Array.isArray(commonCanvasComponents) || typeof createCommonDisplayNode !== 'function' || typeof createCommonWordTableBlock !== 'function') return;

  const labels = commonDisplayComponents.map((component) => component.label);
  assert(JSON.stringify(labels) === JSON.stringify(['文本', '图片', '页码', '条码', '二维码', '表头分栏', '次幂', '线条', '序号', '时间差']), 'commonComponentRegistry.ts: must expose the approved common-component catalogue in order');
  assert(commonCanvasComponents.some((component) => component.id === 'table' && component.label === '表格'), 'commonComponentRegistry.ts: component management must offer the table component');

  const textNode = createCommonDisplayNode('text', { left: 24, top: 36 });
  assert(textNode.type === 'static-text', 'commonComponentRegistry.ts: text must create a static text node');
  assert(textNode.style.position === 'absolute' && textNode.style.compLeft === 24 && textNode.style.compTop === 36, 'commonComponentRegistry.ts: inserted nodes must preserve free-canvas coordinates');
  assert(textNode.props.text === '文本', 'commonComponentRegistry.ts: text must use the component default content');

  const lineNode = createCommonDisplayNode('line', { left: 0, top: 80 });
  assert(lineNode.type === 'display-line', 'commonComponentRegistry.ts: line must create a dedicated display-line node');
  const headerNode = createCommonDisplayNode('header-columns', { left: 12, top: 16 });
  assert(headerNode.type === 'display-header-columns', 'commonComponentRegistry.ts: header columns must create a dedicated two-column node');

  const tableBlock = createCommonWordTableBlock({ left: 24, top: 36 });
  assert(tableBlock.type === 'table', 'commonComponentRegistry.ts: table must create a dedicated Word-table block');
  assert(tableBlock.borderEncodingVersion === 2, 'commonComponentRegistry.ts: new tables must use the current table-level border encoding');
  assert(tableBlock.layout.left === 24 && tableBlock.layout.top === 36, 'commonComponentRegistry.ts: table blocks must preserve free-canvas coordinates');
  assert(tableBlock.columnWidths.length === 3 && tableBlock.rowHeights.length === 3 && tableBlock.cells.length === 9, 'commonComponentRegistry.ts: table must start as a 3 by 3 grid');
  assert(tableBlock.cells.every((cell) => cell.border?.top && cell.border.right && cell.border.bottom && cell.border.left), 'commonComponentRegistry.ts: table cells must start with visible editable borders');
}

async function verifyExcelImportStyleBehavior() {
  const { importExcelToCanvasPage } = await loadExcelImporter();

  const modernWorkbook = new ExcelJS.Workbook();
  const modernSheet = modernWorkbook.addWorksheet('sheet');
  modernSheet.mergeCells('B1:I1');
  modernSheet.getCell('B1').value = '注射器类包装工序检验记录';
  modernSheet.getCell('B1').font = { bold: true, size: 14 };
  modernSheet.getCell('B1').alignment = { horizontal: 'center', vertical: 'middle' };
  for (let row = 1; row <= 4; row += 1) {
    for (let col = 2; col <= 9; col += 1) {
      modernSheet.getCell(row, col).value = modernSheet.getCell(row, col).value ?? (row === 1 ? null : `${row}:${col}`);
      modernSheet.getCell(row, col).border = {
        top: { style: 'thin', color: { argb: 'FF000000' } },
        right: { style: 'thin', color: { argb: 'FF000000' } },
        bottom: { style: 'thin', color: { argb: 'FF000000' } },
        left: { style: 'thin', color: { argb: 'FF000000' } },
      };
    }
  }
  const modernPage = await importExcelToCanvasPage(
    new File([await modernWorkbook.xlsx.writeBuffer()], 'styled.xlsx'),
    { pageId: 'page-modern', pageName: 'modern' },
  );
  const modernTitle = modernPage.cells['1:2'];
  assert(modernTitle?.style?.fontWeight === 'bold', 'importExcel.ts: modern Excel merged title must preserve bold font');
  assert(modernTitle?.style?.textAlign === 'center', 'importExcel.ts: modern Excel merged title must preserve center alignment');
  assert(modernTitle?.style?.verticalAlign === 'middle', 'importExcel.ts: modern Excel merged title must preserve middle vertical alignment');
  assert(Number(modernTitle?.style?.fontSize ?? 0) >= 18, 'importExcel.ts: modern Excel merged title must preserve source font size');
  assert(modernTitle?.border?.top && modernTitle.border.right && modernTitle.border.bottom && modernTitle.border.left, 'importExcel.ts: modern Excel merged title must preserve black outer borders');
  assert(modernTitle?.border?.color === '#000000', 'importExcel.ts: modern Excel imported borders must be black');

  const legacyWorkbook = XLSX.utils.book_new();
  const legacySheet = XLSX.utils.aoa_to_sheet([
    [null, '注射器类包装工序检验记录', null, null, null, null, null, null, null],
    [null, '工序名称', '纸塑小包装', '产品名称', '检验员巡检', '1次', '2次', '3次', '备注'],
    [null, '班组', '注射器包装班', '型号规格', '', '', '', '', ''],
  ]);
  legacySheet['!merges'] = [{ s: { r: 0, c: 1 }, e: { r: 0, c: 8 } }];
  XLSX.utils.book_append_sheet(legacyWorkbook, legacySheet, 'sheet');
  const legacyPage = await importExcelToCanvasPage(
    new File([XLSX.write(legacyWorkbook, { type: 'array', bookType: 'xls' })], 'legacy.xls'),
    { pageId: 'page-legacy', pageName: 'legacy' },
  );
  const legacyTitle = legacyPage.cells['1:2'];
  assert(legacyTitle?.style?.fontWeight === 'bold', 'importExcel.ts: legacy Excel title fallback must render as bold');
  assert(legacyTitle?.style?.textAlign === 'center', 'importExcel.ts: legacy Excel title fallback must render centered');
  assert(legacyTitle?.style?.verticalAlign === 'middle', 'importExcel.ts: legacy Excel title fallback must render vertically centered');
  assert(legacyTitle?.border?.top && legacyTitle.border.right && legacyTitle.border.bottom && legacyTitle.border.left, 'importExcel.ts: legacy Excel table fallback must restore black borders');
  assert(legacyTitle?.border?.color === '#000000', 'importExcel.ts: legacy Excel fallback borders must be black');
}

async function verifySubTableGroupRepeatBehavior() {
  const { buildSubTableGroupRepeatRanges, buildSubTableRepeatedGroupSheetLayout } = await loadSubTableRegionUtils();
  assert(typeof buildSubTableGroupRepeatRanges === 'function', 'subTableRegion.ts: must export buildSubTableGroupRepeatRanges for data grouping fill behavior');
  assert(typeof buildSubTableRepeatedGroupSheetLayout === 'function', 'subTableRegion.ts: must export buildSubTableRepeatedGroupSheetLayout for repeated group cell rendering');
  if (typeof buildSubTableGroupRepeatRanges !== 'function') return;

  const rowRepeatRanges = buildSubTableGroupRepeatRanges(
    { t: 1, l: 1, b: 6, r: 8 },
    { t: 1, l: 1, b: 2, r: 2 },
    'row',
  );
  assert(rowRepeatRanges.length === 11, 'subTableRegion.ts: row-direction grouping must fill complete groups across and then down within the region');
  assert(JSON.stringify(rowRepeatRanges[0]) === JSON.stringify({ t: 1, l: 3, b: 2, r: 4 }), 'subTableRegion.ts: row-direction grouping first repeat must continue to the right');
  assert(JSON.stringify(rowRepeatRanges[2]) === JSON.stringify({ t: 1, l: 7, b: 2, r: 8 }), 'subTableRegion.ts: row-direction grouping must finish the first row band before wrapping');
  assert(JSON.stringify(rowRepeatRanges[3]) === JSON.stringify({ t: 3, l: 1, b: 4, r: 2 }), 'subTableRegion.ts: row-direction grouping must wrap to the next complete row band');
  assert(JSON.stringify(rowRepeatRanges[10]) === JSON.stringify({ t: 5, l: 7, b: 6, r: 8 }), 'subTableRegion.ts: row-direction grouping must keep filling until the region no longer fits a full group');

  const clippedRowRepeatRanges = buildSubTableGroupRepeatRanges(
    { t: 1, l: 1, b: 5, r: 8 },
    { t: 1, l: 1, b: 2, r: 2 },
    'row',
  );
  assert(clippedRowRepeatRanges.length === 7, 'subTableRegion.ts: row-direction grouping must stop instead of drawing a partial group when the remaining rows are insufficient');

  const columnRepeatRanges = buildSubTableGroupRepeatRanges(
    { t: 1, l: 1, b: 6, r: 6 },
    { t: 1, l: 1, b: 2, r: 2 },
    'column',
  );
  assert(JSON.stringify(columnRepeatRanges[0]) === JSON.stringify({ t: 3, l: 1, b: 4, r: 2 }), 'subTableRegion.ts: column-direction grouping first repeat must continue downward');
  assert(JSON.stringify(columnRepeatRanges[2]) === JSON.stringify({ t: 1, l: 3, b: 2, r: 4 }), 'subTableRegion.ts: column-direction grouping must wrap to the next complete column band');

  if (typeof buildSubTableRepeatedGroupSheetLayout === 'function') {
    const repeatedLayout = buildSubTableRepeatedGroupSheetLayout({
      cells: {
        '1:1': { value: 'AAA', style: { fontSize: 16 } },
        '2:1': { value: '检验项目' },
      },
      mergedCells: [{ t: 1, l: 1, b: 1, r: 2 }],
      nodes: [{
        id: 'sub-table-1',
        type: 'sub-table',
        parentId: null,
        children: [],
        props: {},
        style: { cellRange: { t: 1, l: 1, b: 4, r: 4 } },
        bindings: {
          fieldId: 'inspectionTable',
          subTableRegion: {
            id: 'region-1',
            fieldId: 'inspectionTable',
            mode: 'record',
            ranges: [{ pageId: 'page-1', range: { t: 1, l: 1, b: 4, r: 4 }, order: 1 }],
            repeat: { type: 'fixed', count: 4, stride: 1 },
            recordTemplate: {
              direction: 'row',
              anchor: { row: 1, col: 1 },
              groupRange: { t: 1, l: 1, b: 2, r: 2 },
              fields: [],
            },
            presentation: {
              showHeader: false,
              showIndex: false,
              emptyText: '暂无数据',
              addEntry: 'bottom',
            },
          },
        },
      }],
    });
    assert(repeatedLayout.cells['1:3']?.value === 'AAA', 'subTableRegion.ts: row repeated groups must copy merged-cell text to the next group');
    assert(repeatedLayout.cells['3:1']?.value === 'AAA', 'subTableRegion.ts: row repeated groups must copy merged-cell text after wrapping downward');
    assert(repeatedLayout.mergedCells.some((range) => JSON.stringify(range) === JSON.stringify({ t: 1, l: 3, b: 1, r: 4 })), 'subTableRegion.ts: row repeated groups must copy merged-cell ranges to the next group');
    assert(repeatedLayout.mergedCells.some((range) => JSON.stringify(range) === JSON.stringify({ t: 3, l: 1, b: 3, r: 2 })), 'subTableRegion.ts: row repeated groups must copy merged-cell ranges after wrapping downward');
  }
}

const packageJson = read('../package.json');
const viteConfig = read('../vite.config.ts');
const routerFile = read('../src/router/index.tsx');
const templateModelingPage = read('../src/pages/master-data/TemplateModelingPage.tsx');
const saveDesignerMutationBlock = templateModelingPage.match(/const saveDesignerMutation = useMutation\(\{[\s\S]*?const renderTemplateCategoryPanel/)?.[0] ?? '';
const autoSaveDesignerMutationBlock = templateModelingPage.match(/const autoSaveDesignerMutation = useMutation\(\{[\s\S]*?const saveDesignerMutation/)?.[0] ?? '';
const dialog = read('../src/pages/master-data/template-designer-react/TemplateDesignerReactDialog.tsx');
const shell = read('../src/pages/master-data/template-designer-react/TemplateDesignerReactShell.tsx');
const documentTypes = read('../src/pages/master-data/template-designer-react/types/document.ts');
const modelTypes = read('../src/pages/master-data/template-designer-react/types/model.ts');
const canvasTypes = read('../src/pages/master-data/template-designer-react/types/canvas.ts');
const storeFile = read('../src/pages/master-data/template-designer-react/store/useTemplateDesignerStore.ts');
const subTableRegionUtils = read('../src/pages/master-data/template-designer-react/utils/subTableRegion.ts');
const documentUtils = read('../src/pages/master-data/template-designer-react/utils/document.ts');
const modelTab = read('../src/pages/master-data/template-designer-react/tabs/model/ModelTab.tsx');
const fieldManagementPanelOpening = modelTab.match(/<Paper[\s\S]*?data-field-management-panel="true"[\s\S]*?>/)?.[0] ?? '';
const fieldCardGridStyleBlock = modelTab.match(/const fieldCardGridSx = \{[\s\S]*?\n\};/)?.[0] ?? '';
const fieldCountFooterStyleBlock = modelTab.match(/const fieldCountFooterSx = \{[\s\S]*?\n\};/)?.[0] ?? '';
const fieldCountFooterTextStyleBlock = modelTab.match(/const fieldCountFooterTextSx = \{[\s\S]*?\n\};/)?.[0] ?? '';
const fieldReportTableHeadBlock = modelTab.match(/<TableHead>[\s\S]*?<\/TableHead>/)?.[0] ?? '';
const fieldReportColumnSettingsPanelBlock = modelTab.match(/<Stack data-field-report-column-settings-panel[\s\S]*?<\/Stack>/)?.[0] ?? '';
const fieldRegistry = read('../src/pages/master-data/template-designer-react/registry/fieldRegistry.ts');
const fieldTypeIcon = read('../src/pages/master-data/template-designer-react/components/FieldTypeIcon.tsx');
const propertyRenderer = read('../src/pages/master-data/template-designer-react/components/PropertyFormRenderer.tsx');
const canvasTab = read('../src/pages/master-data/template-designer-react/tabs/canvas/CanvasTab.tsx');
const canvasToolbar = read('../src/pages/master-data/template-designer-react/components/canvas/CanvasDesignerToolbar.tsx');
const canvasWorkspace = read('../src/pages/master-data/template-designer-react/components/canvas/CanvasSheetWorkspace.tsx');
const pageThumbnails = read('../src/pages/master-data/template-designer-react/components/canvas/CanvasPageThumbnails.tsx');
const mockFillDialog = read('../src/pages/master-data/template-designer-react/components/mock-fill/MockFillDialog.tsx');
const apiClient = read('../src/api/client.ts');
const identityApi = read('../src/api/identity.ts');
const shellFile = shell;
const headerActionButtonStyleBlock = shell.match(/const headerActionButtonSx = \{[\s\S]*?\n\};/)?.[0] ?? '';
const workflowTab = read('../src/pages/master-data/template-designer-react/tabs/workflow/WorkflowTab.tsx');
const componentRegistry = read('../src/pages/master-data/template-designer-react/registry/componentRegistry.tsx');
const parseConfiguredOptionsBlock = componentRegistry.match(/function parseConfiguredOptions[\s\S]*?return text/)?.[0] ?? '';
const referenceFieldTypeConfigBlock = fieldRegistry.match(/const REFERENCE_TYPE_CONFIG_SCHEMA: PropertySchemaItem\[\] = \[[\s\S]*?\];/)?.[0] ?? '';
const sidebar = read('../src/pages/master-data/template-designer-react/components/DesignerSidebar.tsx');
const inspector = read('../src/pages/master-data/template-designer-react/components/DesignerInspector.tsx');
const displayModeOptionsBlock = inspector.match(/const DISPLAY_MODE_OPTIONS = \[[\s\S]*?\];/)?.[0] ?? '';
const renderer = read('../src/pages/master-data/template-designer-react/components/canvas/CanvasNodeRenderer.tsx');
const templateImportUtils = read('../src/pages/master-data/template-designer-react/utils/templateImport.ts');
const importGridUtils = read('../src/pages/master-data/template-designer-react/utils/importGrid.ts');
const excelImportUtils = read('../src/pages/master-data/template-designer-react/utils/importExcel.ts');
const wordImportUtils = read('../src/pages/master-data/template-designer-react/utils/importWord.ts');
const commonComponentRegistry = read('../src/pages/master-data/template-designer-react/registry/commonComponentRegistry.ts');
const componentLibrary = read('../src/pages/master-data/template-designer-react/components/ComponentLibrary.tsx');
const reactHostTypes = read('../src/pages/master-data/template-designer-react/types/host.ts');
const snackbarProvider = read('../src/components/SnackbarProvider.tsx');

const commitEditingCellBlock = canvasWorkspace.match(/const commitEditingCell = \([\s\S]*?const cancelEditingCell/)?.[0] ?? '';
const sheetCellEditorBlock = canvasWorkspace.match(/<TextField\s+data-sheet-cell-editor="true"[\s\S]*?\/>/)?.[0] ?? '';
const freeCanvasBodyBlock = canvasWorkspace.match(/ref=\{freeCanvasBodyRef\}[\s\S]*?<CanvasNodeRenderer/)?.[0] ?? '';
const freeCanvasFocusInteractionBlock = canvasWorkspace.match(/<Box\s+ref=\{freeCanvasBodyRef\}[\s\S]*?onPointerDown=\{\(event\) => \{[\s\S]*?freeCanvasBodyRef\.current\?\.focus\(\{ preventScroll: true \}\)[\s\S]*?\}\}[\s\S]*?onMouseDown=/)?.[0] ?? '';
const freeCanvasPointerFocusHandlerBlock = freeCanvasFocusInteractionBlock.match(/onPointerDown=\{\(event\) => \{[\s\S]*?\n\s*\}\}/)?.[0] ?? '';
const gridOffsetCellLayoutBlock = canvasWorkspace.match(/const getGridOffsetCellLayout = \(range: CanvasSelectionRange\) => \{[\s\S]*?\n  \};/)?.[0] ?? '';
const findCellRangeAtClientPointBlock = canvasWorkspace.match(/const findCellRangeAtClientPoint = \(clientX: number, clientY: number\) => \{[\s\S]*?return getMergedAwareCellRange/)?.[0] ?? '';
const pointerFieldDropBlock = canvasWorkspace.match(/const handlePointerFieldDrop = \(event: Event\) => \{[\s\S]*?addDroppedFieldToCell/)?.[0] ?? '';
const renderSelectionOutlineBlock = canvasWorkspace.match(/const renderSelectionOutline = \(layer: 'grid' \| 'overlay'\) => \([\s\S]*?const normalizedFieldDropGuideRange/)?.[0] ?? '';
const renderFieldDropGuideBlock = canvasWorkspace.match(/const renderFieldDropGuide = \(layer: 'grid' \| 'overlay' = 'overlay'\)[\s\S]*?const mergedCellMaps/)?.[0] ?? '';
const importedGridRenderBlock = canvasWorkspace.match(/const renderImportedGrid = \(mode: 'sheet' \| 'paper'\) => \([\s\S]*?<\/Box>\n  \);/)?.[0] ?? '';
const subTableHoverLabelBlock = canvasWorkspace.match(/data-canvas-sub-table-hover-label="true"[\s\S]*?data-canvas-sub-table-group-repeat-overlay="true"/)?.[0] ?? '';
const mockFillSubTableFrameBlock = mockFillDialog.match(/data-mock-fill-sub-table-frame="true"[\s\S]*?recordRanges\.forEach/)?.[0] ?? '';
const mockFillSheetBorderOverlayBlock = mockFillDialog.match(/data-mock-fill-sheet-border-overlay="true"[\s\S]*?\)\)\}/)?.[0] ?? '';
const mockFillSignatureControlBlock = mockFillDialog.match(/if \(field\?\.type === 'signature'\)[\s\S]*?if \(field\?\.type === 'attachment'/)?.[0] ?? '';
const storeInitialStateBlock = storeFile.match(/export const useTemplateDesignerStore = create<TemplateDesignerStore>\(\(set, get\) => \(\{[\s\S]*?setDocument:/)?.[0] ?? '';
const storeSetDocumentBlock = storeFile.match(/setDocument: \(document\) => set\(\{[\s\S]*?\}\),\n  setActiveTab:/)?.[0] ?? '';
const storeSetCurrentPageIdBlock = storeFile.match(/setCurrentPageId: \(pageId\) => set\(\(state\) => \(\{[\s\S]*?\}\)\),\n  setSelectedFieldId:/)?.[0] ?? '';
const storeReplaceFromImportBlock = storeFile.match(/replaceCurrentPageFromImport: \(importedPage\) => set\(\(state\) => \{[\s\S]*?\n  \}\),\n  setCanvasMode:/)?.[0] ?? '';
const toolbarButtonUsages = [...canvasToolbar.matchAll(/<ToolbarIconButton\b([^>]*)>/g)].map((match) => match[1]);
const toolbarLabels = [
  '撤销',
  '重做',
  '字号',
  '字体颜色',
  '加粗',
  '斜体',
  '下划线',
  '删除线',
  '边框线',
  '单元格背景颜色',
  '左对齐',
  '居中对齐',
  '右对齐',
  '顶部对齐',
  '垂直居中',
  '底部对齐',
];
const removedToolbarLabels = [
  '自动换行',
  '合并单元格',
  '拆分单元格',
  '插入表格',
  '调整列宽',
  '调整行高',
];
const expectedDesignerFieldTypes = [
  ['text', '文本', 'TextFieldsOutlined'],
  ['number', '数字', 'NumbersOutlined'],
  ['datetime', '日期时间', 'CalendarMonthOutlined'],
  ['signature', '签名', 'DrawOutlined'],
  ['attachment', '附件', 'AttachFileOutlined'],
  ['image', '图片', 'ImageOutlined'],
  ['singleSelect', '单选', 'RadioButtonCheckedOutlined'],
  ['multiSelect', '多选', 'CheckBoxOutlined'],
  ['reference', '引用', 'HubOutlined'],
  ['subTable', '子表', 'TableChartOutlined'],
];

if (!packageJson.includes('verify:template-designer-react')) failures.push('package.json: missing verify:template-designer-react script');
if (packageJson.includes('verify:template-designer"')) failures.push('package.json: Vue designer verify script must be removed');
if (packageJson.includes('designer:install') || packageJson.includes('designer:dev') || packageJson.includes('designer:build')) failures.push('package.json: Vue designer install/dev/build scripts must be removed');
if (!packageJson.includes('"exceljs"')) failures.push('package.json: missing exceljs dependency for template import');
if (!packageJson.includes('"xlsx"')) failures.push('package.json: missing xlsx dependency for template import');
if (templateModelingPage.includes('React设计')) failures.push('TemplateModelingPage.tsx: design action label must read 设计, not React设计');
if (!templateModelingPage.includes('aria-label="设计"')) failures.push('TemplateModelingPage.tsx: design action must expose aria-label 设计');
if (!templateModelingPage.includes('Tooltip title="设计"')) failures.push('TemplateModelingPage.tsx: design action tooltip must read 设计');
if (!templateModelingPage.includes('TemplateDesignerReactDialog')) failures.push('TemplateModelingPage.tsx: missing React dialog mount');
if (templateModelingPage.includes('import TemplateDesignerDialog') || templateModelingPage.includes('<TemplateDesignerDialog')) failures.push('TemplateModelingPage.tsx: Vue designer dialog references must be removed');
if (templateModelingPage.includes('TemplateDesignerPreloadFrame')) failures.push('TemplateModelingPage.tsx: Vue designer preload frame must be removed');
if (templateModelingPage.includes('const [designerState') || templateModelingPage.includes('setDesignerState')) failures.push('TemplateModelingPage.tsx: Vue designer state must be removed');
if (templateModelingPage.includes("import TemplateDesignerReactDialog from './template-designer-react'")) failures.push('TemplateModelingPage.tsx: React designer must be lazy-loaded instead of statically imported into the template modeling chunk');
if (!templateModelingPage.includes("lazy(() => import('./template-designer-react'))")) failures.push('TemplateModelingPage.tsx: missing lazy import for React designer dialog');
if (!templateModelingPage.includes('<Suspense')) failures.push('TemplateModelingPage.tsx: lazy React designer dialog must be wrapped in Suspense');
if (!templateModelingPage.includes('isReservedTemplateCategory')) failures.push('TemplateModelingPage.tsx: template category options must filter reserved category names to avoid duplicate React keys');
if (!saveDesignerMutationBlock.includes('reactDesignerState.row')) failures.push('TemplateModelingPage.tsx: React designer save mutation must use React designer row context');
if (!saveDesignerMutationBlock.includes('reactDesignerState.version')) failures.push('TemplateModelingPage.tsx: React designer save mutation must use React designer version context');
if (saveDesignerMutationBlock.includes('setReactDesignerState')) failures.push('TemplateModelingPage.tsx: React designer manual save must not close the designer');
if (!templateModelingPage.includes('autoSaveDesignerMutation')) failures.push('TemplateModelingPage.tsx: React designer must support auto-saving field changes without the top Save button');
if (!autoSaveDesignerMutationBlock.includes('saveDesignerPayload')) failures.push('TemplateModelingPage.tsx: React designer auto-save must reuse the same persistence API payload path');
if (autoSaveDesignerMutationBlock.includes('setReactDesignerState')) failures.push('TemplateModelingPage.tsx: React designer field auto-save must not close the designer');
if (!templateModelingPage.includes('onAutoSave={(payload) => autoSaveDesignerMutation.mutateAsync(payload)}')) failures.push('TemplateModelingPage.tsx: React designer dialog must receive the field auto-save handler');
if (!templateModelingPage.includes("import { useSnackbar } from '@/components/SnackbarProvider'")) failures.push('TemplateModelingPage.tsx: template modeling messages must reuse the global snackbar');
if (templateModelingPage.includes('<Snackbar') || templateModelingPage.includes('setSnackbar')) failures.push('TemplateModelingPage.tsx: template modeling page must not keep a local snackbar implementation');
if (!viteConfig.includes('manualChunks')) failures.push('vite.config.ts: missing manualChunks split for large production chunks');
if (!viteConfig.includes('vendor-template-import')) failures.push('vite.config.ts: template import dependencies must be split out of page chunks');
if (!viteConfig.includes('chunkSizeWarningLimit: 1000')) failures.push('vite.config.ts: chunk size warning limit must account for the lazy-loaded Excel parser chunk');
if (viteConfig.includes('templateDesignerDevTarget') || viteConfig.includes('/template-designer-runtime')) failures.push('vite.config.ts: Vue designer runtime proxy must be removed');
if (routerFile.includes('template-designer/')) failures.push('router/index.tsx: routes must not import from the removed Vue designer directory');
if (existsSync(new URL('../src/pages/master-data/template-designer', import.meta.url))) failures.push('src/pages/master-data/template-designer: Vue designer host directory must be removed');
if (existsSync(new URL('../src/pages/master-data/TemplateDesignerDialog.tsx', import.meta.url))) failures.push('src/pages/master-data/TemplateDesignerDialog.tsx: Vue designer dialog re-export must be removed');
if (existsSync(new URL('../vendor/online-form-designer', import.meta.url))) failures.push('vendor/online-form-designer: Vue designer vendor package must be removed');
if (existsSync(new URL('../scripts/verify-template-designer-pages.mjs', import.meta.url))) failures.push('scripts/verify-template-designer-pages.mjs: Vue designer verifier must be removed');
if (!reactHostTypes.includes('TemplateDesignerDialogProps')) failures.push('template-designer-react/types/host.ts: React designer dialog props must live under the React designer');
if (!reactHostTypes.includes('TemplateDesignerSavePayload')) failures.push('template-designer-react/types/host.ts: React designer save payload must live under the React designer');
if (!reactHostTypes.includes('onAutoSave?: (payload: TemplateDesignerSavePayload) => Promise<unknown>')) failures.push('template-designer-react/types/host.ts: React designer dialog props must expose optional auto-save');
if (dialog.includes('../template-designer') || shell.includes('../template-designer') || documentUtils.includes('/template-designer/')) failures.push('template-designer-react: React designer must not import from the removed Vue designer directory');
if (!dialog.includes('fullScreen')) failures.push('TemplateDesignerReactDialog.tsx: missing fullScreen dialog');
if (!shell.includes('字段设计')) failures.push('TemplateDesignerReactShell.tsx: missing model tab');
if (!shell.includes('表单设计')) failures.push('TemplateDesignerReactShell.tsx: missing canvas tab');
if (!shell.includes('流程设计')) failures.push('TemplateDesignerReactShell.tsx: missing workflow tab');
if (!shellFile.includes('模板导入')) failures.push('TemplateDesignerReactShell.tsx: missing import action');
if (!shellFile.includes('模拟填报')) failures.push('TemplateDesignerReactShell.tsx: missing mock-fill action');
if (!shellFile.includes('const headerActionButtonSx =')) failures.push('TemplateDesignerReactShell.tsx: header actions must share a single size style');
if (!headerActionButtonStyleBlock.includes('height: 32')) failures.push('TemplateDesignerReactShell.tsx: header action buttons must be 32px high');
if (!shellFile.includes('const headerOutlinedActionButtonSx =')) failures.push('TemplateDesignerReactShell.tsx: outlined header actions must share the mock-fill style');
if (!shellFile.includes('const headerPrimaryActionButtonSx =')) failures.push('TemplateDesignerReactShell.tsx: save action must use a dedicated blue primary style');
if (!shellFile.includes("bgcolor: '#2990ff'")) failures.push('TemplateDesignerReactShell.tsx: save action must be blue');
if (!shellFile.includes('sx={headerPrimaryActionButtonSx}')) failures.push('TemplateDesignerReactShell.tsx: save button must use the blue primary style');
if (!shellFile.includes('<Button variant="outlined" onClick={handleClose} sx={headerOutlinedActionButtonSx}>')) failures.push('TemplateDesignerReactShell.tsx: close button must match the mock-fill outlined style');
if (!shellFile.includes("import MockFillDialog from './components/mock-fill/MockFillDialog'")) failures.push('TemplateDesignerReactShell.tsx: mock-fill dialog must be isolated under components/mock-fill');
if (!shellFile.includes('const [mockFillOpen, setMockFillOpen] = useState(false)')) failures.push('TemplateDesignerReactShell.tsx: mock-fill open state must be local to the shell');
if (!shellFile.includes('onClick={() => setMockFillOpen(true)}')) failures.push('TemplateDesignerReactShell.tsx: mock-fill button must open the local runtime preview');
if (!shellFile.includes('<MockFillDialog') || !shellFile.includes('document={document}') || !shellFile.includes('open={mockFillOpen}')) failures.push('TemplateDesignerReactShell.tsx: mock-fill dialog must receive the current unsaved designer document');
if (!shellFile.includes('返回上一页')) failures.push('TemplateDesignerReactShell.tsx: missing back action');
if (!shellFile.includes('type="file"')) failures.push('TemplateDesignerReactShell.tsx: missing hidden file input for template import');
if (!shellFile.includes('.xlsx,.xlsm,.xls,.docx,.doc')) failures.push('TemplateDesignerReactShell.tsx: missing template import accept types');
if (!shellFile.includes('importTemplateToCanvasPage')) failures.push('TemplateDesignerReactShell.tsx: missing template import conversion call');
if (!shellFile.includes('replaceCurrentPageFromImport')) failures.push('TemplateDesignerReactShell.tsx: missing store import replacement action');
if (!documentTypes.includes("schema: 'edhr-template-designer-react'")) failures.push('document.ts: missing persisted schema marker');
if (!documentTypes.includes('export interface TemplateDesignerDocument')) failures.push('document.ts: missing TemplateDesignerDocument interface');
if (!canvasTypes.includes("export type SubTableRegionMode = 'record' | 'matrix'")) failures.push('canvas.ts: missing sub-table region mode type');
if (!canvasTypes.includes("export type SubTableRecordDirection = 'row' | 'column'")) failures.push('canvas.ts: missing sub-table record direction type');
if (!canvasTypes.includes('export interface SubTableRegionRange')) failures.push('canvas.ts: missing sub-table region range interface');
if (!canvasTypes.includes('export interface SubTableRecordTemplate')) failures.push('canvas.ts: missing sub-table record template interface');
if (!canvasTypes.includes('export interface SubTableRegion')) failures.push('canvas.ts: missing sub-table region interface');
if (!canvasTypes.includes('subTableRegion?: SubTableRegion')) failures.push('canvas.ts: canvas node bindings must store sub-table region metadata');
if (!subTableRegionUtils.includes('createDefaultSubTableRegion')) failures.push('subTableRegion.ts: missing createDefaultSubTableRegion helper');
if (!subTableRegionUtils.includes('createLegacySubTableRegion')) failures.push('subTableRegion.ts: missing createLegacySubTableRegion helper');
if (!subTableRegionUtils.includes('inferFixedRepeatCount')) failures.push('subTableRegion.ts: missing inferFixedRepeatCount helper');
if (!subTableRegionUtils.includes('rebuildSubTableRecordTemplate')) failures.push('subTableRegion.ts: missing rebuildSubTableRecordTemplate helper');
if (!subTableRegionUtils.includes('rangeContainsRange')) failures.push('subTableRegion.ts: missing rangeContainsRange helper');
if (!subTableRegionUtils.includes('rangesIntersect')) failures.push('subTableRegion.ts: missing rangesIntersect helper');
if (!storeFile.includes('create<TemplateDesignerStore>')) failures.push('useTemplateDesignerStore.ts: missing Zustand store creation');
if (!storeFile.includes('setActiveTab')) failures.push('useTemplateDesignerStore.ts: missing setActiveTab action');
if (!storeFile.includes('markSaved')) failures.push('useTemplateDesignerStore.ts: missing markSaved action');
if (!storeFile.includes("activeTab: 'canvas'")) failures.push('useTemplateDesignerStore.ts: missing default canvas tab');
if (!documentTypes.includes("export type TemplateDesignerCanvasRailKey = 'thumbnails' | 'fields' | 'grid' | 'config';")) failures.push('document.ts: canvas side rail keys must use config for the fourth rail');
if (!storeFile.includes('activeCanvasRail: TemplateDesignerCanvasRailKey')) failures.push('useTemplateDesignerStore.ts: missing active canvas side rail state');
if (!storeFile.includes('isCanvasSidebarVisible: boolean')) failures.push('useTemplateDesignerStore.ts: missing canvas side panel visibility state');
if (!storeFile.includes('setActiveCanvasRail: (rail: TemplateDesignerCanvasRailKey) => void')) failures.push('useTemplateDesignerStore.ts: missing canvas side rail setter');
if (!storeFile.includes('setCanvasSidebarVisible: (visible: boolean) => void')) failures.push('useTemplateDesignerStore.ts: missing canvas side panel visibility setter');
if (!storeInitialStateBlock.includes("activeCanvasRail: 'thumbnails'")) failures.push('useTemplateDesignerStore.ts: canvas side rail should default to page thumbnails');
if (!storeInitialStateBlock.includes('isCanvasSidebarVisible: true')) failures.push('useTemplateDesignerStore.ts: canvas side panel should be visible by default');
if (!storeFile.includes("setActiveCanvasRail: (activeCanvasRail) => set({ activeCanvasRail, isCanvasSidebarVisible: true })")) failures.push('useTemplateDesignerStore.ts: selecting a canvas side rail should reopen the side panel');
if (!storeFile.includes('selectedFieldNode?.type === \'sub-table\' ? \'fields\' : \'config\'')) failures.push('useTemplateDesignerStore.ts: selecting a sub-table cell must keep field management focused');
if (!storeFile.includes('resolveSelectedCellRail')) failures.push('useTemplateDesignerStore.ts: cell selection rail should be resolved in one store update to avoid side-panel flicker');
if (!canvasTab.includes('useTemplateDesignerStore')) failures.push('CanvasTab.tsx: canvas rail state must come from the designer store');
if (!canvasTab.includes('const activeRail = useTemplateDesignerStore((state) => state.activeCanvasRail);')) failures.push('CanvasTab.tsx: side rail should read the active rail from store');
if (!canvasTab.includes('const setActiveRail = useTemplateDesignerStore((state) => state.setActiveCanvasRail);')) failures.push('CanvasTab.tsx: side rail should update through store');
if (!canvasTab.includes('const isSidebarVisible = useTemplateDesignerStore((state) => state.isCanvasSidebarVisible);')) failures.push('CanvasTab.tsx: side panel visibility should read from store');
if (!canvasTab.includes('const setIsSidebarVisible = useTemplateDesignerStore((state) => state.setCanvasSidebarVisible);')) failures.push('CanvasTab.tsx: side panel visibility should update through store');
if (canvasTab.includes("useState<(typeof sideRailItems)[number]['id']>('thumbnails')")) failures.push('CanvasTab.tsx: side rail state must not stay local to CanvasTab');
if (!storeInitialStateBlock.includes('selectedCell: null')) failures.push('useTemplateDesignerStore.ts: designer entry must start without a selected cell');
if (!storeInitialStateBlock.includes('selectedRange: null')) failures.push('useTemplateDesignerStore.ts: designer entry must start without a selected range');
if (storeInitialStateBlock.includes('selectedCell: { row: 1, col: 1 }')) failures.push('useTemplateDesignerStore.ts: designer entry must not default-select A1');
if (storeInitialStateBlock.includes('selectedRange: createSingleCellRange()')) failures.push('useTemplateDesignerStore.ts: designer entry must not default-select an A1 range');
if (!storeSetDocumentBlock.includes('selectedCell: null')) failures.push('useTemplateDesignerStore.ts: loading a document must clear the selected cell');
if (!storeSetDocumentBlock.includes('selectedRange: null')) failures.push('useTemplateDesignerStore.ts: loading a document must clear the selected range');
if (storeSetDocumentBlock.includes('selectedCell: { row: 1, col: 1 }')) failures.push('useTemplateDesignerStore.ts: loading a document must not default-select A1');
if (storeSetDocumentBlock.includes('selectedRange: createSingleCellRange()')) failures.push('useTemplateDesignerStore.ts: loading a document must not default-select an A1 range');
if (!storeSetCurrentPageIdBlock.includes('selectedCell: null')) failures.push('useTemplateDesignerStore.ts: changing pages must clear the selected cell');
if (!storeSetCurrentPageIdBlock.includes('selectedRange: null')) failures.push('useTemplateDesignerStore.ts: changing pages must clear the selected range');
if (!storeReplaceFromImportBlock.includes('selectedCell: null')) failures.push('useTemplateDesignerStore.ts: importing a template must clear the selected cell');
if (!storeReplaceFromImportBlock.includes('selectedRange: null')) failures.push('useTemplateDesignerStore.ts: importing a template must clear the selected range');
if (!storeFile.includes('selectedRange')) failures.push('useTemplateDesignerStore.ts: missing range selection state');
if (!storeFile.includes('selectAllCells')) failures.push('useTemplateDesignerStore.ts: missing selectAllCells action');
if (!storeFile.includes('selectColumnRange')) failures.push('useTemplateDesignerStore.ts: missing selectColumnRange action');
if (!storeFile.includes('selectRowRange')) failures.push('useTemplateDesignerStore.ts: missing selectRowRange action');
if (!storeFile.includes('insertSheetColumns')) failures.push('useTemplateDesignerStore.ts: missing insertSheetColumns action');
if (!storeFile.includes('insertSheetRows')) failures.push('useTemplateDesignerStore.ts: missing insertSheetRows action');
if (!storeFile.includes('deleteSheetColumns')) failures.push('useTemplateDesignerStore.ts: missing deleteSheetColumns action');
if (!storeFile.includes('deleteSheetRows')) failures.push('useTemplateDesignerStore.ts: missing deleteSheetRows action');
if (!storeFile.includes('mergeSelectedCells')) failures.push('useTemplateDesignerStore.ts: missing selected-cell merge action');
if (!storeFile.includes('splitSelectedCells')) failures.push('useTemplateDesignerStore.ts: missing selected-cell split action');
if (!storeFile.includes('mergeCellFieldNodesForRange')) failures.push('useTemplateDesignerStore.ts: merging cells must reconcile field components in the merged range');
if (!storeFile.includes('findFirstCellFieldNodeIdInRange')) failures.push('useTemplateDesignerStore.ts: merged field reconciliation must keep the first field by cell position');
if (!storeFile.includes('collapseSplitCellFieldNodesToFirstCells')) failures.push('useTemplateDesignerStore.ts: splitting merged cells must move field components back to the first cell');
if (!storeFile.includes('removedMergedRanges')) failures.push('useTemplateDesignerStore.ts: split-cell field reconciliation must use the ranges actually removed by the split action');
if (!storeFile.includes('removeMergedRangesInSelection')) failures.push('useTemplateDesignerStore.ts: selected-cell split must remove merged ranges inside the current selection');
if (!storeFile.includes('isMergeableCellFieldNode')) failures.push('useTemplateDesignerStore.ts: merge/split reconciliation must not treat sub-table frames as ordinary field components');
if (!storeFile.includes("node.type !== 'sub-table'")) failures.push('useTemplateDesignerStore.ts: merge/split field reconciliation must preserve fixed sub-table region nodes');
if (!storeFile.includes('selectionCrossesSubTableBoundary')) failures.push('useTemplateDesignerStore.ts: merging cells must not create merged cells across sub-table region boundaries');
if (!storeFile.includes('mergePageCellValuesInRange')) failures.push('useTemplateDesignerStore.ts: merging selected cells must preserve selected cell text as a multiline value');
if (!storeFile.includes("mergedValues.join('\\n')")) failures.push('useTemplateDesignerStore.ts: merged selected-cell text must be joined with newlines');
if (!storeFile.includes('shiftCellsForDeletedColumns')) failures.push('useTemplateDesignerStore.ts: missing deleted-column cell shifting helper');
if (!storeFile.includes('shiftCellsForDeletedRows')) failures.push('useTemplateDesignerStore.ts: missing deleted-row cell shifting helper');
if (!storeFile.includes('setSheetColumnWidth')) failures.push('useTemplateDesignerStore.ts: missing setSheetColumnWidth action');
if (!storeFile.includes('setSheetRowHeight')) failures.push('useTemplateDesignerStore.ts: missing setSheetRowHeight action');
if (!storeFile.includes('activePagePreviewIndexes')) failures.push('useTemplateDesignerStore.ts: missing active preview-page state for thumbnail/canvas sync');
if (!storeFile.includes('pagePreviewScrollTarget')) failures.push('useTemplateDesignerStore.ts: missing thumbnail scroll target state');
if (!storeFile.includes('setActivePagePreviewIndex')) failures.push('useTemplateDesignerStore.ts: missing active preview-page setter');
if (!storeFile.includes('requestPagePreviewScroll')) failures.push('useTemplateDesignerStore.ts: missing thumbnail-to-canvas scroll request action');
if (!storeFile.includes('clearPagePreviewScrollTarget: (requestId: number) => void')) failures.push('useTemplateDesignerStore.ts: missing one-shot thumbnail scroll target clearer');
if (!storeFile.includes('state.pagePreviewScrollTarget?.requestId === requestId')) failures.push('useTemplateDesignerStore.ts: thumbnail scroll target clearer must only clear the matching request');
if (!documentUtils.includes('isReactTemplateDesignerPayload')) failures.push('document utils: missing schema guard');
if (!documentUtils.includes('parseReactTemplateDesignerDocument')) failures.push('document utils: missing persisted document parser');
if (!documentUtils.includes('serializeTemplateDesignerDocument')) failures.push('document utils: missing serializer');
if (!documentUtils.includes('rowCount: 30')) failures.push('document utils: missing portrait-oriented default row count');
if (!documentUtils.includes('columnWidths')) failures.push('document utils: missing column width normalization');
if (!documentUtils.includes('rowHeights')) failures.push('document utils: missing row height normalization');
if (!documentUtils.includes("paperMode: 'table'")) failures.push('document utils: missing default paper mode');
if (!documentUtils.includes("paperOrientation: 'portrait'")) failures.push('document utils: missing default paper orientation');
if (!documentUtils.includes('paperMarginTopMm')) failures.push('document utils: missing paper margin normalization');
if (!shell.includes('window.confirm')) failures.push('TemplateDesignerReactShell.tsx: missing dirty close confirmation');
if (!shell.includes('markSaved')) failures.push('TemplateDesignerReactShell.tsx: missing markSaved usage after save');
if (!shell.includes("setActiveTab('canvas')")) failures.push('TemplateDesignerReactShell.tsx: missing reset to canvas tab on entry');
if (!shell.includes('height: 28')) failures.push('TemplateDesignerReactShell.tsx: missing back-area divider');
if (!shell.includes('useTemplateDesignerStore.getState().document')) failures.push('TemplateDesignerReactShell.tsx: saves must read the latest store document after field mutations');
if (!shell.includes('handleFieldConfirmPersist')) failures.push('TemplateDesignerReactShell.tsx: missing field-confirm auto-save handler');
if (!shell.includes('onFieldConfirmPersist={handleFieldConfirmPersist}')) failures.push('TemplateDesignerReactShell.tsx: model tab must receive the field-confirm auto-save handler');
if (!shell.includes('subTableDesignFieldId')) failures.push('TemplateDesignerReactShell.tsx: sub-table drilldown state must be lifted to the shell');
if (!shell.includes('data-shell-template-path="true"')) failures.push('TemplateDesignerReactShell.tsx: sub-table path must render beside the main template name in the shell header');
if (!shell.includes('isSubTableDesigning ? null')) failures.push('TemplateDesignerReactShell.tsx: sub-table drilldown must hide the top tab switcher and header actions');
if (!shell.includes('onSubTableDesignFieldIdChange={setSubTableDesignFieldId}')) failures.push('TemplateDesignerReactShell.tsx: model tab must control shell-level sub-table drilldown state');
if (!shell.includes('handleShellBack')) failures.push('TemplateDesignerReactShell.tsx: shell back action must handle sub-table drilldown before closing');
if (!shell.includes('if (isSubTableDesigning)')) failures.push('TemplateDesignerReactShell.tsx: shell back action must branch on sub-table drilldown state');
if (!shell.includes("isSubTableDesigning ? '返回上一层' : '返回上一页'")) failures.push('TemplateDesignerReactShell.tsx: shell back label must become 返回上一层 in sub-table drilldown');
if (shell.includes('返回主表')) failures.push('TemplateDesignerReactShell.tsx: sub-table header must not render a separate 返回主表 action');
if (!shell.includes("const templateVersionLabel = version?.version || '-'")) failures.push('TemplateDesignerReactShell.tsx: shell header path must derive a reusable version label');
if (!shell.includes(' : ${templateVersionLabel} > ')) failures.push('TemplateDesignerReactShell.tsx: sub-table path order must be 主表名称 : 版本 > 子表名称');
if (shell.includes("{templatePathLabel} · {version?.version || '-'}")) failures.push('TemplateDesignerReactShell.tsx: shell header path must not append version after the sub-table name');
for (const [type, label, icon] of expectedDesignerFieldTypes) {
  if (!fieldRegistry.includes(`type: '${type}'`)) failures.push(`fieldRegistry.ts: missing canonical field type "${type}"`);
  if (!fieldRegistry.includes(`label: '${label}'`)) failures.push(`fieldRegistry.ts: missing field type label "${label}"`);
  if (!fieldRegistry.includes(`iconKey: '${type}'`)) failures.push(`fieldRegistry.ts: missing icon key for field type "${type}"`);
  if (!fieldTypeIcon.includes(icon)) failures.push(`FieldTypeIcon.tsx: missing ${icon} icon for field type "${type}"`);
}
if (fieldRegistry.includes("type: 'link'") || fieldRegistry.includes("label: '超链接'")) failures.push('fieldRegistry.ts: 超链接 must be merged into text configuration, not remain an independent field type');
if (fieldRegistry.includes('LINK_TYPE_CONFIG_SCHEMA') || fieldRegistry.includes("key: 'linkMode'")) failures.push('fieldRegistry.ts: link-specific field type config must not remain as a separate type schema');
if (modelTypes.includes("| 'link'")) failures.push('model.ts: FieldType must not include independent link type');
if (fieldTypeIcon.includes('LinkOutlined')) failures.push('FieldTypeIcon.tsx: link icon must not remain in field type icon map');
if (!documentUtils.includes("link: 'text'")) failures.push('document.ts: legacy link fields must normalize to text fields');
if (!modelTypes.includes("export type FieldType =")) failures.push('model.ts: missing canonical FieldType union');
if (!modelTypes.includes('export type FieldTypeIconKey = FieldType')) failures.push('model.ts: field type icons must share the canonical field type key');
if (!modelTypes.includes("export type ModelFieldStatus = 'enabled' | 'disabled'")) failures.push('model.ts: missing enabled/disabled field status union');
if (!modelTypes.includes('sortOrder: number')) failures.push('model.ts: fields must persist sortOrder');
if (!modelTypes.includes('status: ModelFieldStatus')) failures.push('model.ts: fields must persist enabled/disabled status');
if (!modelTypes.includes('description?: string')) failures.push('model.ts: fields must persist optional business description');
if (!modelTypes.includes('typeConfig: Record<string, unknown>')) failures.push('model.ts: fields must persist typeConfig');
if (modelTypes.includes('required?:') || modelTypes.includes('readonly?:') || modelTypes.includes('hidden?:') || modelTypes.includes('defaultValue?:') || modelTypes.includes('placeholder?:') || modelTypes.includes('optionsText?:')) failures.push('model.ts: required/readonly/hidden/defaultValue/placeholder/optionsText must not live on field definitions');
if (!fieldRegistry.includes('typeConfigSchema')) failures.push('fieldRegistry.ts: field type definitions must expose typeConfigSchema');
if (!fieldRegistry.includes('iconKey')) failures.push('fieldRegistry.ts: field type definitions must expose iconKey');
if (!fieldRegistry.includes('defaultComponentType')) failures.push('fieldRegistry.ts: field type definitions must map to a default canvas component');
if (fieldRegistry.includes('optionsText') || fieldRegistry.includes("key: 'required'") || fieldRegistry.includes("key: 'readonly'") || fieldRegistry.includes("key: 'hidden'") || fieldRegistry.includes("key: 'placeholder'")) failures.push('fieldRegistry.ts: field registry must not configure binding/display rules on field definitions');
if (!canvasTypes.includes('export interface FieldBinding')) failures.push('canvas.ts: missing FieldBinding structure for version-level binding rules');
for (const key of ['fieldId', 'displayLabel', 'required', 'readonly', 'hidden', 'defaultValue', 'placeholder', 'helpText', 'widgetConfig']) {
  if (!canvasTypes.includes(key)) failures.push(`canvas.ts: FieldBinding must include ${key}`);
}
if (!modelTab.includes('新增字段')) failures.push('ModelTab.tsx: missing add field action');
if (!modelTab.includes('onFieldConfirmPersist')) failures.push('ModelTab.tsx: add-field confirmation must support immediate persistence');
if (!modelTab.includes('await onFieldConfirmPersist()')) failures.push('ModelTab.tsx: add-field confirmation must persist immediately after creating a field');
if (!modelTab.includes('void handleSaveField()')) failures.push('ModelTab.tsx: add-field confirmation must invoke the async save handler safely');
if (modelTab.includes('确认新增')) failures.push('ModelTab.tsx: add-field primary action must be renamed from 确认新增 to 确认');
if (!modelTab.includes("editingFieldId ? '保存修改' : '确认'")) failures.push('ModelTab.tsx: add-field primary action must read 确认 while edit mode still reads 保存修改');
if (!modelTab.includes('确认并继续')) failures.push('ModelTab.tsx: add-field dialog must provide a confirm-and-continue action for rapid field creation');
if (!modelTab.includes('continueAdding?: boolean')) failures.push('ModelTab.tsx: save field handler must support keeping the dialog open after adding');
if (!modelTab.includes('options?.continueAdding')) failures.push('ModelTab.tsx: confirm-and-continue must be controlled by the save handler option');
if (!modelTab.includes('handleSaveField({ continueAdding: true })')) failures.push('ModelTab.tsx: confirm-and-continue button must call save with continueAdding');
if (!modelTab.includes('isFieldNameDuplicate')) failures.push('ModelTab.tsx: manual add/edit must detect duplicate field names');
if (!modelTab.includes('字段名称不允许重复')) failures.push('ModelTab.tsx: duplicate field names must show an explicit validation message');
if (!modelTab.includes('disabled={!newFieldName.trim() || isFieldNameDuplicate || saving}')) failures.push('ModelTab.tsx: duplicate manual field names must disable submit actions');
if (!modelTab.includes('data-field-create-dialog="true"')) failures.push('ModelTab.tsx: add-field flow must use a dialog instead of inline form controls');
if (!modelTab.includes('DialogTitle')) failures.push('ModelTab.tsx: add-field dialog must have a clear title');
if (!modelTab.includes("'& .MuiOutlinedInput-input'")) failures.push('ModelTab.tsx: compact text fields must set balanced input padding');
if (!modelTab.includes("'& .MuiInputLabel-shrink'")) failures.push('ModelTab.tsx: compact text fields must adjust floating label position');
if (!modelTab.includes("pt: '12px !important'")) failures.push('ModelTab.tsx: add-field dialog content must leave room for the floating first-field label');
if (!modelTab.includes('pb: 1')) failures.push('ModelTab.tsx: add-field dialog content must reduce excess bottom spacing');
if (!modelTab.includes('fieldCardGridSx')) failures.push('ModelTab.tsx: field cards must use a compact grid layout');
if (!modelTab.includes('fieldCardSx')) failures.push('ModelTab.tsx: field cards must share compact card styling');
if (!modelTab.includes('gridTemplateColumns')) failures.push('ModelTab.tsx: compact field cards must render as a responsive grid');
if (!modelTab.includes('sidebarWidth')) failures.push('ModelTab.tsx: field management sidebar must support a resizable width state');
if (!modelTab.includes('data-model-sidebar-resize="true"')) failures.push('ModelTab.tsx: field management sidebar must expose a resize handle');
if (!modelTab.includes('Math.max(300')) failures.push('ModelTab.tsx: field management sidebar must clamp to a 300px minimum width');
if (!modelTab.includes('Math.min(450')) failures.push('ModelTab.tsx: field management sidebar must clamp to a 450px maximum width');
if (!modelTab.includes('gap: { xs: 1.5, md: 0 }')) failures.push('ModelTab.tsx: desktop resize handle must sit flush against the left field panel');
if (!modelTab.includes('data-field-status-dot="true"')) failures.push('ModelTab.tsx: field cards must show a red/green status dot');
if (!modelTab.includes('data-field-status-corner="true"')) failures.push('ModelTab.tsx: field status dot and text must render in the card top-right corner');
if (!modelTab.includes("field.status === 'enabled' ? '#22c55e' : '#ef4444'")) failures.push('ModelTab.tsx: enabled fields must use a green dot and disabled fields a red dot');
if (!modelTab.includes('data-field-version-usage-dot="true"')) failures.push('ModelTab.tsx: field names must show a current-version usage dot');
if (!modelTab.includes("bgcolor: used ? '#2990ff' : '#c0c4cc'")) failures.push('ModelTab.tsx: current-version usage dot must be blue when used and gray when unused');
if (!modelTab.includes("title={`该字段在当前表单版本中${used ? '已使用' : '未使用'}`}")) failures.push('ModelTab.tsx: current-version usage dot must explain used/unused state on hover');
if (!modelTab.includes('data-field-name-with-usage="true"')) failures.push('ModelTab.tsx: field name row must expose a stable usage marker');
if (!modelTab.includes('字段编码')) failures.push('ModelTab.tsx: field cards must label code as 字段编码');
if (modelTab.includes('Key:')) failures.push('ModelTab.tsx: field cards must not label code as Key');
if (!modelTab.includes('FieldTypeIcon')) failures.push('ModelTab.tsx: field cards and type selectors must render field type icons');
if (!modelTab.includes('data-field-type-badge="true"')) failures.push('ModelTab.tsx: field cards must show an icon-backed field type badge');
if (!modelTab.includes('EditOutlined')) failures.push('ModelTab.tsx: field cards must expose an edit icon on hover');
if (!modelTab.includes('Tooltip')) failures.push('ModelTab.tsx: hover actions must explain enable/disable and edit icons');
if (!modelTab.includes('field-card-actions')) failures.push('ModelTab.tsx: field-card action icons must be hidden until hover');
if (!modelTab.includes('bottom: 8')) failures.push('ModelTab.tsx: field-card hover actions must appear below the top-right status area');
if (!modelTab.includes('transform: \'translateY(4px)\'')) failures.push('ModelTab.tsx: field-card hover actions must animate upward from the lower position');
if (!modelTab.includes('data-sub-table-design-action="true"')) failures.push('ModelTab.tsx: sub-table field cards must expose a design action');
if (!modelTab.includes("field.type === 'subTable'")) failures.push('ModelTab.tsx: sub-table design action must only render for subTable fields');
if (!modelTab.includes('DesignServicesOutlined')) failures.push('ModelTab.tsx: sub-table design action must use a design icon');
if (!modelTab.includes('openSubTableDesignView')) failures.push('ModelTab.tsx: sub-table design action must drill into a design view');
if (!modelTab.includes('data-sub-table-design-view="true"')) failures.push('ModelTab.tsx: sub-table design view must expose a stable marker');
if (modelTab.includes('data-sub-table-design-path="true"')) failures.push('ModelTab.tsx: sub-table path must not render inside the query panel');
if (!modelTab.includes('getSubTableFields')) failures.push('ModelTab.tsx: sub-table design view must derive an independent sub-field list');
if (!modelTab.includes('activeSubTableDesignField')) failures.push('ModelTab.tsx: sub-table design view must track the active sub-table field');
if (!modelTab.includes('currentFields')) failures.push('ModelTab.tsx: field management must switch to the current main/sub-table field collection');
if (!modelTab.includes('updateSubTableFields')) failures.push('ModelTab.tsx: sub-table field management must update the sub-table field collection');
if (!modelTab.includes('currentFieldRegistry')) failures.push('ModelTab.tsx: sub-table design view must use a scoped field type registry');
if (!modelTab.includes("fieldType.type !== 'subTable'")) failures.push('ModelTab.tsx: sub-table design view must not allow adding nested sub-table fields');
if ((modelTab.match(/currentFieldRegistry\.map/g) ?? []).length < 2) failures.push('ModelTab.tsx: field type selectors must use the scoped field type registry');
if (!modelTab.includes('effectiveFieldType') || !modelTab.includes("newFieldType === 'subTable' ? 'text' : newFieldType")) failures.push('ModelTab.tsx: save handler must guard against nested sub-table field types');
if (modelTab.includes('data-sub-table-design-dialog="true"')) failures.push('ModelTab.tsx: sub-table design action must not open the old modal dialog');
if (!modelTab.includes('设计子表')) failures.push('ModelTab.tsx: sub-table design action must be clearly labelled');
if (modelTab.includes("'停用字段'") || modelTab.includes('"停用字段"')) failures.push('ModelTab.tsx: field cards must not render a visible stop-field button');
if (modelTab.includes('类型结构配置')) failures.push('ModelTab.tsx: field cards must not expand into heavy inline type configuration forms');
if (modelTab.includes('删除字段')) failures.push('ModelTab.tsx: fields must not expose a delete action');
if (!modelTab.includes('字段管理')) failures.push('ModelTab.tsx: missing field management card-list title');
if (!modelTab.includes('搜索字段')) failures.push('ModelTab.tsx: missing field search control');
if (!modelTab.includes('类型筛选')) failures.push('ModelTab.tsx: missing type filter control');
if (!modelTab.includes('状态筛选')) failures.push('ModelTab.tsx: missing status filter control');
if (!modelTab.includes("containerType: 'inline-size'")) failures.push('ModelTab.tsx: field management panel must support container-based responsive filters');
if (!modelTab.includes('fieldFilterGridSx')) failures.push('ModelTab.tsx: field filters must use a responsive grid layout');
if (!modelTab.includes('field-filter-search')) failures.push('ModelTab.tsx: search filter must expand to full width when the panel is narrow');
if (!modelTab.includes("'@container (max-width: 360px)'")) failures.push('ModelTab.tsx: narrow field panel must move type/status filters below search');
if (!modelTab.includes('data-field-count-footer="true"')) failures.push('ModelTab.tsx: field count must render in a persistent bottom footer');
if (!modelTab.includes('fieldCountFooterSx')) failures.push('ModelTab.tsx: field count footer must use a dedicated bottom layout');
if (!modelTab.includes('共 {currentFields.length} 个字段')) failures.push('ModelTab.tsx: bottom field count must read 共 N 个字段 for the current field collection');
if (!modelTab.includes('data-field-management-panel="true"')) failures.push('ModelTab.tsx: field management panel must expose a stable marker');
if (!fieldManagementPanelOpening.includes('elevation={0}')) failures.push('ModelTab.tsx: field management panel must remove the default Paper shadow');
if (!fieldManagementPanelOpening.includes("border: '1px solid #e4e7ed'")) failures.push('ModelTab.tsx: field management panel must use the same border as the report panel');
if (!fieldManagementPanelOpening.includes("boxShadow: 'none'")) failures.push('ModelTab.tsx: field management panel bottom shadow must match the report panel');
if (!fieldCardGridStyleBlock.includes("width: 'calc(100% + 12px)'")) failures.push('ModelTab.tsx: field card list scrollbar must sit flush against the panel right edge');
if (!fieldCardGridStyleBlock.includes("paddingRight: '12px'")) failures.push('ModelTab.tsx: field card list must keep content spacing away from the flush scrollbar');
if (!fieldCountFooterStyleBlock.includes("borderTop: '1px solid #e4e7ed'")) failures.push('ModelTab.tsx: field count footer divider must match the report footer divider');
if (!fieldCountFooterStyleBlock.includes('minHeight: 32')) failures.push('ModelTab.tsx: field count footer must use a compact bottom height');
if (!fieldCountFooterStyleBlock.includes("alignItems: 'flex-end'")) failures.push('ModelTab.tsx: field count footer text must sit at the bottom');
if (!fieldCountFooterStyleBlock.includes('pb: 0.75')) failures.push('ModelTab.tsx: field count footer bottom spacing must be compact');
if (!fieldCountFooterStyleBlock.includes("bgcolor: '#fff'")) failures.push('ModelTab.tsx: field count footer background must match the report footer');
if (!fieldCountFooterTextStyleBlock.includes('mt: 0')) failures.push('ModelTab.tsx: field count footer text top margin must be 0');
if (modelTab.includes('Chip')) failures.push('ModelTab.tsx: field count must not render as a header chip');
if (!modelTab.includes('fieldEmptyStateSx')) failures.push('ModelTab.tsx: empty field list state must use a centered layout');
if (!modelTab.includes('暂无字段</Typography>')) failures.push('ModelTab.tsx: empty field list text must read 暂无字段 without punctuation');
if (modelTab.includes('暂无字段。')) failures.push('ModelTab.tsx: empty field list text must not end with punctuation');
if (modelTab.includes('当前版本已使用') || modelTab.includes('当前版本未使用')) failures.push('ModelTab.tsx: field cards must not repeat current-version usage text after the field type');
if (modelTab.includes('暂无说明')) failures.push('ModelTab.tsx: field cards must not render an empty description placeholder');
if (!modelTab.includes('setCurrentFieldStatus(field.id')) failures.push('ModelTab.tsx: field hover actions must toggle enabled/disabled status for the current field collection');
if (!modelTab.includes('data-field-report-query-panel="true"')) failures.push('ModelTab.tsx: field data report must use the standard query panel');
if (!modelTab.includes('data-field-report-table-panel="true"')) failures.push('ModelTab.tsx: field data report must use the standard table panel');
if (!modelTab.includes('data-field-report-column-settings="true"')) failures.push('ModelTab.tsx: field data report must expose the standard column settings trigger');
if (!modelTab.includes('Tooltip title="字段设置"')) failures.push('ModelTab.tsx: field report settings trigger must be named 字段设置');
if (!modelTab.includes('aria-label="字段设置"')) failures.push('ModelTab.tsx: field report settings trigger aria label must be 字段设置');
if (modelTab.includes('字段数据报表字段设置')) failures.push('ModelTab.tsx: field report settings trigger must not use the verbose old label');
if (!modelTypes.includes('fieldReportColumnWidths')) failures.push('model.ts: model design state must persist field report column widths');
if (!documentUtils.includes('normalizeFieldReportColumnWidths')) failures.push('document.ts: persisted field report column widths must be normalized from modelDesignJson');
if (!documentUtils.includes('normalizeCanvasNodes')) failures.push('document.ts: persisted sub-table nodes must be normalized recursively');
if (!documentUtils.includes('createLegacySubTableRegion')) failures.push('document.ts: legacy sub-table nodes must be upgraded to structured regions');
if (!storeFile.includes('setModelFieldReportColumnWidth')) failures.push('useTemplateDesignerStore.ts: missing persisted field report column width update action');
if (!modelTab.includes('REPORT_FIELD_COLUMN_MIN_WIDTH = 120')) failures.push('ModelTab.tsx: field report table must use the standard minimum column width');
if (!modelTab.includes('reportColumnScopeKey')) failures.push('ModelTab.tsx: field report column widths must be scoped for main table and sub-table designs');
if (!modelTab.includes('document?.model.fieldReportColumnWidths?.[reportColumnScopeKey]')) failures.push('ModelTab.tsx: field report column widths must read from persisted model design state');
if (!modelTab.includes('beginReportColumnResize')) failures.push('ModelTab.tsx: field report table headers must support drag resizing');
if (!modelTab.includes('data-field-report-column-resizer')) failures.push('ModelTab.tsx: field report table headers must expose resize handles');
if (!modelTab.includes('setModelFieldReportColumnWidth(reportColumnScopeKey, column.key, nextWidth)')) failures.push('ModelTab.tsx: resized field report column widths must be persisted through the designer store');
if (!modelTab.includes('<colgroup>')) failures.push('ModelTab.tsx: field report table must use colgroup widths for stable resizing');
if (!modelTab.includes('minWidth: column.minWidth')) failures.push('ModelTab.tsx: field report table header cells must enforce column minimum widths');
if (!modelTab.includes('fieldReportColumnSettingsAnchorEl')) failures.push('ModelTab.tsx: field report settings trigger must track its popover anchor');
if (!modelTab.includes('setFieldReportColumnSettingsAnchorEl(event.currentTarget)')) failures.push('ModelTab.tsx: field report settings trigger must open a settings popover');
if (!modelTab.includes('data-field-report-column-settings-panel')) failures.push('ModelTab.tsx: field report settings trigger must render a settings panel');
if (!modelTab.includes('data-field-report-column-settings-row')) failures.push('ModelTab.tsx: field report settings panel must render field rows');
if (!modelTab.includes('reportColumnOrder')) failures.push('ModelTab.tsx: field report settings must keep an explicit column order');
if (!modelTab.includes('orderedReportColumns')) failures.push('ModelTab.tsx: field report table must render the configured column order');
if (!fieldReportColumnSettingsPanelBlock.includes('DragIndicator')) failures.push('ModelTab.tsx: field report settings rows must show the standard drag handle');
if (!fieldReportColumnSettingsPanelBlock.includes('draggable')) failures.push('ModelTab.tsx: field report settings rows must be draggable');
if (!fieldReportColumnSettingsPanelBlock.includes("gridTemplateColumns: '24px 34px minmax(0, 1fr)'")) failures.push('ModelTab.tsx: field report settings rows must reserve a drag-handle column');
if (!fieldReportColumnSettingsPanelBlock.includes('handleReportColumnSettingDragStart')) failures.push('ModelTab.tsx: field report settings rows must wire drag start');
if (!fieldReportColumnSettingsPanelBlock.includes('handleReportColumnSettingDrop')) failures.push('ModelTab.tsx: field report settings rows must wire drop reordering');
if (!modelTab.includes('hiddenReportColumnKeys')) failures.push('ModelTab.tsx: field report settings must support field visibility state');
if (!modelTab.includes('visibleReportColumns')) failures.push('ModelTab.tsx: field report table must render visible configured fields');
if (!modelTab.includes('TableContainer')) failures.push('ModelTab.tsx: field data report must use the standard table container');
if (!modelTab.includes('tableHeaderCellSx')) failures.push('ModelTab.tsx: field data report must use shared header cell styling');
if (!modelTab.includes('tableBodyCellSx')) failures.push('ModelTab.tsx: field data report must use shared body cell styling');
if (!modelTab.includes('reportAuditColumns')) failures.push('ModelTab.tsx: field data report must define audit columns');
for (const label of ['创建人', '创建时间', '更新人', '更新时间']) {
  if (!modelTab.includes(`label: '${label}'`)) failures.push(`ModelTab.tsx: field data report missing audit column "${label}"`);
}
if (!modelTab.includes('const reportColumns = useMemo')) failures.push('ModelTab.tsx: field data report columns must be derived from model fields');
if (!modelTab.includes('currentFields.map((field)')) failures.push('ModelTab.tsx: field data report must include the current left-side field collection');
if (modelTab.includes('activeSubTableDesignField ? getSubTableReportColumns(activeSubTableDesignField)')) failures.push('ModelTab.tsx: sub-table drilldown table must not reuse the old single-column fallback');
if (!fieldReportTableHeadBlock.includes('visibleReportColumns.map((column)')) failures.push('ModelTab.tsx: field data report header must render visible dynamic model/audit columns');
if (!modelTab.includes('colSpan={visibleReportColumns.length}')) failures.push('ModelTab.tsx: empty field data report row must span all visible dynamic columns');
for (const label of ['发生时间', '字段名称', '字段类型', '数据值', '表单版本', '状态']) {
  if (fieldReportTableHeadBlock.includes(`>${label}</TableCell>`)) failures.push(`ModelTab.tsx: field data report header must not include fixed legacy column "${label}"`);
}
if (!modelTab.includes('Pagination')) failures.push('ModelTab.tsx: field data report must use the standard bottom pagination');
if (!modelTab.includes('共 {reportRows.length} 条数据')) failures.push('ModelTab.tsx: field data report footer must show total row count');
if (!modelTab.includes('条/页')) failures.push('ModelTab.tsx: field data report footer must expose page-size options');
if (!modelTab.includes('RestartAlt')) failures.push('ModelTab.tsx: field data report query panel must include reset action');
if (modelTab.includes('TablePagination')) failures.push('ModelTab.tsx: field data report must not use MUI TablePagination');
for (const label of ['字段名称', '操作人', '操作日志', '变更记录', '审计日志']) {
  if (!modelTab.includes(label)) failures.push(`ModelTab.tsx: data report missing "${label}"`);
}
if (!modelTab.includes('字段类型')) failures.push('ModelTab.tsx: missing field type editor');
if (!modelTab.includes('MenuItem')) failures.push('ModelTab.tsx: missing MUI MenuItem field type selector');
if (!propertyRenderer.includes('TextField')) failures.push('PropertyFormRenderer.tsx: missing MUI text editor rendering');
if (!componentRegistry.includes('layout-container')) failures.push('componentRegistry.tsx: missing layout-container component definition');
if (!componentRegistry.includes('bottom-button-container')) failures.push('componentRegistry.tsx: missing bottom-button-container component definition');
if (!componentRegistry.includes('RadioGroup')) failures.push('componentRegistry.tsx: missing field renderer previews');
if (!canvasTab.includes('分页缩略图')) failures.push('CanvasTab.tsx: missing page thumbnails panel');
if (!canvasTab.includes('Tooltip')) failures.push('CanvasTab.tsx: side rail icons must show hover names');
if (!canvasTab.includes("tooltip: '分页'")) failures.push('CanvasTab.tsx: missing pagination rail tooltip');
if (!canvasTab.includes("tooltip: '字段'")) failures.push('CanvasTab.tsx: missing fields rail tooltip');
if (!canvasTab.includes("tooltip: '组件'")) failures.push('CanvasTab.tsx: missing components rail tooltip');
if (!canvasTab.includes("id: 'config'")) failures.push('CanvasTab.tsx: fourth side rail must use config as its key');
if (!canvasTab.includes("title: '字段配置'")) failures.push('CanvasTab.tsx: config side panel title must be 字段配置');
if (!canvasTab.includes("tooltip: '配置'")) failures.push('CanvasTab.tsx: config rail tooltip must be 配置');
if (canvasTab.includes("tooltip: '布局'") || canvasTab.includes("title: '布局管理'")) failures.push('CanvasTab.tsx: fourth side rail must not be labeled 布局');
if (canvasTab.includes('CropLandscapeOutlined')) failures.push('CanvasTab.tsx: config rail must not use the generic layout/rectangle icon');
if (!canvasTab.includes('TuneRounded')) failures.push('CanvasTab.tsx: config rail must use a business configuration icon');
if (!canvasTab.includes('const selectedNode = useTemplateDesignerStore((state) => state.getSelectedNode());')) failures.push('CanvasTab.tsx: config rail visibility must be driven by the selected node');
if (!canvasTab.includes('shouldShowConfigRail')) failures.push('CanvasTab.tsx: missing conditional config rail visibility flag');
if (!canvasTab.includes('selectedNode?.bindings?.fieldId')) failures.push('CanvasTab.tsx: config rail should only show when a field-bound component is selected');
if (!canvasTab.includes('visibleSideRailItems')) failures.push('CanvasTab.tsx: side rail must filter out config before a field component is selected');
if (canvasTab.includes('{sideRailItems.map((item) => (')) failures.push('CanvasTab.tsx: side rail must not render the config action unconditionally');
if (!canvasTab.includes("title: '分页缩略图'")) failures.push('CanvasTab.tsx: missing pagination side panel title');
if (!canvasTab.includes("title: '字段管理'")) failures.push('CanvasTab.tsx: missing fields side panel title');
if (!canvasTab.includes("title: '组件管理'")) failures.push('CanvasTab.tsx: missing components side panel title');
if (!canvasTab.includes('activeRailItem.title')) failures.push('CanvasTab.tsx: side panel title must update from active rail item');
if (!canvasTab.includes("import DesignerSidebar from '../../components/DesignerSidebar'")) failures.push('CanvasTab.tsx: field side panel must mount the field management component');
if (!canvasTab.includes("import DesignerInspector from '../../components/DesignerInspector'")) failures.push('CanvasTab.tsx: config side panel must mount the field configuration inspector');
if (!canvasTab.includes("panelRail === 'fields' ? <DesignerSidebar />")) failures.push('CanvasTab.tsx: field side panel must render fields from model design');
if (!canvasTab.includes("panelRail === 'config' ? <DesignerInspector />")) failures.push('CanvasTab.tsx: config side panel must render field configuration');
if (!canvasTab.includes('const configPanelMinWidth = defaultPanelMinWidth')) failures.push('CanvasTab.tsx: field configuration side panel must share the default minimum width with fields and thumbnails');
if (canvasTab.includes('const configPanelMinWidth = 320')) failures.push('CanvasTab.tsx: field configuration side panel must not force a wider minimum width');
if (!canvasTab.includes('effectiveSidebarWidth')) failures.push('CanvasTab.tsx: side panel width must clamp against the active rail width range');
if (canvasTab.includes('其它侧边面板继续按 Vue 设计器迁移')) failures.push('CanvasTab.tsx: field management side panel must not show the old migration placeholder');
if (!canvasTab.includes('CanvasDesignerToolbar')) failures.push('CanvasTab.tsx: missing designer toolbar mount');
if (!canvasToolbar.includes('Tooltip')) failures.push('CanvasDesignerToolbar.tsx: toolbar buttons must use Tooltip for hover descriptions');
if (!canvasToolbar.includes('label: string')) failures.push('CanvasDesignerToolbar.tsx: ToolbarIconButton must require a label');
if (!canvasToolbar.includes('title={label}')) failures.push('CanvasDesignerToolbar.tsx: tooltip title must use the button label');
if (!canvasToolbar.includes('aria-label={label}')) failures.push('CanvasDesignerToolbar.tsx: toolbar buttons must expose accessible labels');
if (toolbarButtonUsages.some((props) => !/\blabel=/.test(props))) failures.push('CanvasDesignerToolbar.tsx: every ToolbarIconButton usage must provide a label');
for (const label of toolbarLabels) {
  if (!canvasToolbar.includes(`label="${label}"`)) failures.push(`CanvasDesignerToolbar.tsx: missing toolbar label "${label}"`);
}
for (const label of removedToolbarLabels) {
  if (canvasToolbar.includes(`label="${label}"`)) failures.push(`CanvasDesignerToolbar.tsx: removed toolbar label "${label}" must not render`);
}
if (!canvasToolbar.includes('undoCanvasChange')) failures.push('CanvasDesignerToolbar.tsx: undo button must call store undoCanvasChange');
if (!canvasToolbar.includes('redoCanvasChange')) failures.push('CanvasDesignerToolbar.tsx: redo button must call store redoCanvasChange');
if (!canvasToolbar.includes('canUndoCanvasChange')) failures.push('CanvasDesignerToolbar.tsx: undo button must reflect store availability');
if (!canvasToolbar.includes('canRedoCanvasChange')) failures.push('CanvasDesignerToolbar.tsx: redo button must reflect store availability');
if (!canvasToolbar.includes('data-toolbar-font-size="true"')) failures.push('CanvasDesignerToolbar.tsx: missing compact font-size toolbar control');
if (!canvasToolbar.includes('data-toolbar-font-color="true"')) failures.push('CanvasDesignerToolbar.tsx: missing font-color toolbar control');
if (!canvasToolbar.includes('data-toolbar-border="true"')) failures.push('CanvasDesignerToolbar.tsx: missing border-line toolbar control');
if (!canvasToolbar.includes('data-toolbar-background-color="true"')) failures.push('CanvasDesignerToolbar.tsx: missing cell-background toolbar control');
if (!canvasToolbar.includes('updateSelectedStyle({ fontSize')) failures.push('CanvasDesignerToolbar.tsx: font-size toolbar control must route updates to the active target');
if (!canvasToolbar.includes('COLOR_PICKER_COMMIT_DELAY_MS')) failures.push('CanvasDesignerToolbar.tsx: color picker changes must be deferred to avoid repainting the full canvas while dragging');
if (!canvasToolbar.includes('draftColorRef')) failures.push('CanvasDesignerToolbar.tsx: color picker must keep a local draft color while the native picker is active');
if (!canvasToolbar.includes('scheduleDraftColorCommit')) failures.push('CanvasDesignerToolbar.tsx: color picker must debounce commits to the selected cell or text component');
if (!canvasToolbar.includes('onBlur={commitDraftColor}')) failures.push('CanvasDesignerToolbar.tsx: color picker must flush the draft color when focus leaves the picker');
if (!canvasToolbar.includes('captureColorTarget')) failures.push('CanvasDesignerToolbar.tsx: color picker must capture the original formatting target before deferred commit');
if (!canvasToolbar.includes('updateCellStyleInRange(target.range, patch)')) failures.push('CanvasDesignerToolbar.tsx: deferred color commits must update the original selected range');
if (!storeFile.includes('updateCellStyleInRange: (range: CanvasSelectionRange, patch: Record<string, unknown>) => void')) failures.push('useTemplateDesignerStore.ts: missing explicit range style update action for deferred toolbar commits');
if (!storeFile.includes('updateCellStyleInRange: (range, patch) => set((state) =>')) failures.push('useTemplateDesignerStore.ts: explicit range style update must write through document history');
if (canvasToolbar.includes('onChange={(event: ChangeEvent<HTMLInputElement>) => onChange(event.target.value)}')) failures.push('CanvasDesignerToolbar.tsx: color picker must not write canvas state on every native color change event');
if (!canvasToolbar.includes('updateColorStyle({ color }, target)')) failures.push('CanvasDesignerToolbar.tsx: font-color toolbar control must route updates to the captured active target');
if (!canvasToolbar.includes('updateSelectedCellBorder')) failures.push('CanvasDesignerToolbar.tsx: border-line toolbar control must update selected cell border');
if (!canvasToolbar.includes('updateColorStyle({ backgroundColor }, target)')) failures.push('CanvasDesignerToolbar.tsx: background toolbar control must route updates to the captured active target');
if (!storeFile.includes('updateSelectedCellBorder: (border: CanvasCellBorder | null) => void')) failures.push('useTemplateDesignerStore.ts: missing selected cell border update action contract');
if (!storeFile.includes('updatePageCellStyleInRange')) failures.push('useTemplateDesignerStore.ts: toolbar cell style updates must support the selected range');
if (!storeFile.includes('updatePageCellBorderInRange')) failures.push('useTemplateDesignerStore.ts: toolbar border updates must support the selected range');
if (!canvasTab.includes('CanvasSheetWorkspace')) failures.push('CanvasTab.tsx: missing sheet workspace mount');
if (!canvasTab.includes('sidebarWidth')) failures.push('CanvasTab.tsx: missing resizable thumbnail sidebar width state');
if (!canvasTab.includes('isSidebarVisible')) failures.push('CanvasTab.tsx: missing side panel visibility state');
if (!canvasTab.includes('setIsSidebarVisible(false)')) failures.push('CanvasTab.tsx: close icon must hide the side panel');
if (!canvasTab.includes('setIsSidebarVisible(true)')) failures.push('CanvasTab.tsx: function rail buttons must show the side panel again');
if (!canvasTab.includes('data-canvas-side-panel="true"')) failures.push('CanvasTab.tsx: missing side panel visibility marker');
if (!canvasTab.includes('<CanvasPageThumbnails onClose=')) failures.push('CanvasTab.tsx: page thumbnail panel must receive a close handler');
if (!canvasTab.includes('data-thumbnail-resize')) failures.push('CanvasTab.tsx: missing thumbnail sidebar resize handle');
if (!pageThumbnails.includes('CanvasThumbnailWordTable')) failures.push('CanvasPageThumbnails.tsx: free-canvas Word tables must render in page thumbnails');
if (!pageThumbnails.includes('page.wordDocument.blocks.map')) failures.push('CanvasPageThumbnails.tsx: page thumbnails must render Word document blocks');
if (!pageThumbnails.includes("node.type === 'static-text' ? node.props.text ?? ''")) failures.push('CanvasPageThumbnails.tsx: text component thumbnails must render the component text instead of a generic label');
if (!pageThumbnails.includes('getWordDocumentBottom(page)')) failures.push('CanvasPageThumbnails.tsx: free-canvas thumbnail stage height must include Word document content');
if (!canvasTab.includes('defaultPanelMinWidth = 250')) failures.push('CanvasTab.tsx: missing default sidebar min width clamp');
if (!canvasTab.includes('defaultPanelMaxWidth = 350')) failures.push('CanvasTab.tsx: missing default sidebar max width clamp');
if (!canvasWorkspace.includes('scrollbarWidth')) failures.push('CanvasSheetWorkspace.tsx: missing sheet viewport calculations');
const wordTableBlockTypeStart = canvasTypes.indexOf('export interface CanvasWordTableBlock {');
const wordTableBlockTypeEnd = canvasTypes.indexOf('\n}\n\nexport interface CanvasWordImageBlock', wordTableBlockTypeStart);
const wordTableBlockType = wordTableBlockTypeStart >= 0 && wordTableBlockTypeEnd >= 0
  ? canvasTypes.slice(wordTableBlockTypeStart, wordTableBlockTypeEnd)
  : '';
if (!canvasTypes.includes('borderEncodingVersion?: 2')) failures.push('canvas.ts: Word document border encoding must be versioned for backward compatibility');
if (!wordTableBlockType.includes('borderEncodingVersion?: 2')) failures.push('canvas.ts: Word table blocks must preserve their own border encoding version');
if (!wordImportUtils.includes('borderEncodingVersion: 2')) failures.push('importWord.ts: newly imported Word documents must persist the current border encoding version');
if (!canvasWorkspace.includes('usesLegacyWordTableBorders')) failures.push('CanvasSheetWorkspace.tsx: legacy Word table border encoding must inherit the table grid');
if (!canvasWorkspace.includes('columnLabels')) failures.push('CanvasSheetWorkspace.tsx: missing column labels');
if (!canvasWorkspace.includes('selectedCell')) failures.push('CanvasSheetWorkspace.tsx: missing cell selection wiring');
if (!canvasWorkspace.includes('selectedRange')) failures.push('CanvasSheetWorkspace.tsx: missing range selection rendering');
if (!canvasWorkspace.includes('getMergedAwareCellRange')) failures.push('CanvasSheetWorkspace.tsx: missing merged-cell aware selection helper');
if (!canvasWorkspace.includes('cellSelectionRange')) failures.push('CanvasSheetWorkspace.tsx: cell click selection must use merged cell range when present');
if (canvasWorkspace.includes('setSelectedRange({ t: row, l: col, b: row, r: col }, { row, col })')) failures.push('CanvasSheetWorkspace.tsx: merged cell click must not select only the top-left logical cell');
if (!canvasWorkspace.includes('hasMultilineCellValue')) failures.push('CanvasSheetWorkspace.tsx: rendered cells must detect multiline values');
if (!canvasWorkspace.includes('hasSpecialWrapCellValue')) failures.push('CanvasSheetWorkspace.tsx: rendered merged cells must detect checkbox/special-symbol values that need wrapping');
if (!canvasWorkspace.includes('hasPlainOverflowCellValue')) failures.push('CanvasSheetWorkspace.tsx: rendered plain long text cells must auto-wrap when text exceeds cell width');
if (!canvasWorkspace.includes('mergedRange && hasSpecialWrapCellValue')) failures.push('CanvasSheetWorkspace.tsx: special-symbol wrapping must be scoped to merged cells');
if (!canvasWorkspace.includes('shouldWrapCellText')) failures.push('CanvasSheetWorkspace.tsx: rendered merged checkbox/special-symbol cells must use the shared wrap decision');
if (!canvasWorkspace.includes('plainOverflowWrap')) failures.push('CanvasSheetWorkspace.tsx: plain long-text wrapping must be part of the shared wrap decision');
if (!canvasWorkspace.includes("hasMultilineValue ? 'pre-wrap'")) failures.push('CanvasSheetWorkspace.tsx: rendered multiline cells must preserve line breaks');
if (!canvasWorkspace.includes('getSheetContentBottom')) failures.push('CanvasSheetWorkspace.tsx: page count must be based on actual sheet content bottom, not blank trailing rows');
if (!canvasWorkspace.includes('paperPaginationBodyHeight')) failures.push('CanvasSheetWorkspace.tsx: page break markers must use actual content height for pagination');
if (!canvasWorkspace.includes('const paperPaginationBodyHeight = isFreeCanvas ? freeCanvasBodyHeight : Math.max(sheetContentBottom, 1);')) failures.push('CanvasSheetWorkspace.tsx: imported blank trailing rows must not create empty extra pages');
if (canvasWorkspace.includes('const rawPaperHeight = paperInsetTop + paperHeaderHeight + paperBodyHeight + paperFooterHeight + paperInsetBottom')) failures.push('CanvasSheetWorkspace.tsx: page count must not use full sheetHeight including blank trailing rows');
if (canvasWorkspace.includes('Math.max(sheetContentBottom, sheetHeight, 1)')) failures.push('CanvasSheetWorkspace.tsx: sheet pagination must ignore blank trailing row height');
if (!canvasWorkspace.includes('sheetPaperWidth')) failures.push('CanvasSheetWorkspace.tsx: missing centered paper size calculations');
if (!canvasWorkspace.includes('data-sheet-paper')) failures.push('CanvasSheetWorkspace.tsx: missing explicit paper container marker');
if (!canvasWorkspace.includes('data-sheet-column-active')) failures.push('CanvasSheetWorkspace.tsx: missing column highlight marker');
if (!canvasWorkspace.includes('data-sheet-row-active')) failures.push('CanvasSheetWorkspace.tsx: missing row highlight marker');
if (!canvasWorkspace.includes('handleColumnHeaderMouseDown')) failures.push('CanvasSheetWorkspace.tsx: column header Shift-click must be handled from the header mouse down event');
if (!canvasWorkspace.includes('handleRowHeaderMouseDown')) failures.push('CanvasSheetWorkspace.tsx: row header Shift-click must be handled from the header mouse down event');
if (!canvasWorkspace.includes('getShiftColumnSelectionAnchor')) failures.push('CanvasSheetWorkspace.tsx: column header Shift-click must use the existing column selection as an anchor');
if (!canvasWorkspace.includes('getShiftRowSelectionAnchor')) failures.push('CanvasSheetWorkspace.tsx: row header Shift-click must use the existing row selection as an anchor');
if (!canvasWorkspace.includes('event.shiftKey')) failures.push('CanvasSheetWorkspace.tsx: row/column header clicks must inspect Shift key state for range selection');
if (!canvasWorkspace.includes("position: 'sticky'")) failures.push('CanvasSheetWorkspace.tsx: missing sticky header positioning');
if (!canvasWorkspace.includes('data-paper-toggle-key={item.key}')) failures.push('CanvasSheetWorkspace.tsx: paper setting toggles must expose stable keys for ruler QA');
if (!canvasWorkspace.includes('data-paper-toggle-active={item.active ? \'true\' : \'false\'}')) failures.push('CanvasSheetWorkspace.tsx: paper setting toggles must expose their active state for ruler QA');
if (!canvasWorkspace.includes("zIndex: PAPER_RULER_Z_INDEX")) failures.push('CanvasSheetWorkspace.tsx: paper rulers must use the highest shared ruler layer');
if (!canvasWorkspace.includes('const PAPER_RULER_Z_INDEX = 220')) failures.push('CanvasSheetWorkspace.tsx: paper ruler layer must be above sub-table overlays, group overlays, and page labels');
if (!canvasWorkspace.includes('const showSheetRuler = currentPage?.sheet.showRuler ?? true')) failures.push('CanvasSheetWorkspace.tsx: sheet-mode rulers must read the shared ruler toggle state');
if (!canvasWorkspace.includes('const sheetRowHeaderWidth = showSheetRuler ? rowHeaderWidth : 0')) failures.push('CanvasSheetWorkspace.tsx: sheet-mode row ruler width must collapse when ruler is disabled');
if (!canvasWorkspace.includes('const sheetColumnHeaderHeight = showSheetRuler ? columnHeaderHeight : 0')) failures.push('CanvasSheetWorkspace.tsx: sheet-mode column ruler height must collapse when ruler is disabled');
if (!canvasWorkspace.includes('data-sheet-column-ruler="true"')) failures.push('CanvasSheetWorkspace.tsx: sheet-mode column ruler must expose a QA marker');
if (!canvasWorkspace.includes('data-sheet-row-ruler="true"')) failures.push('CanvasSheetWorkspace.tsx: sheet-mode row ruler must expose a QA marker');
if (!canvasWorkspace.includes('{showSheetRuler ? (')) failures.push('CanvasSheetWorkspace.tsx: sheet-mode ruler labels must be conditionally rendered by the ruler toggle');
if (!canvasWorkspace.includes('data-sheet-select-all-corner="true"')) failures.push('CanvasSheetWorkspace.tsx: sheet-mode select-all corner must expose a QA marker');
if (!canvasWorkspace.includes('zIndex: PAPER_RULER_Z_INDEX + 2')) failures.push('CanvasSheetWorkspace.tsx: sheet-mode top ruler must sit above the scrolling row ruler');
if (!canvasWorkspace.includes('zIndex: PAPER_RULER_Z_INDEX + 3')) failures.push('CanvasSheetWorkspace.tsx: sheet-mode select-all corner must sit above all ruler labels');
if (freeCanvasBodyBlock.includes('CanvasDropZone')) failures.push('CanvasSheetWorkspace.tsx: free paper mode must not render the blue insert-input drop zone over imported Word content');
if (!snackbarProvider.includes("anchorOrigin={{ vertical: 'top', horizontal: 'right' }}")) failures.push('SnackbarProvider.tsx: global messages must follow the UI standard top-right snackbar position');
if (snackbarProvider.includes('variant="filled"')) failures.push('SnackbarProvider.tsx: global messages must use MUI Alert default appearance, not filled variant');
if (snackbarProvider.includes('snackbarAccentColor') || snackbarProvider.includes("'&::before'") || snackbarProvider.includes('boxShadow')) failures.push('SnackbarProvider.tsx: global messages must not add custom decorative snackbar styling beyond the standard MUI Alert appearance');
if (!canvasWorkspace.includes('onContextMenu')) failures.push('CanvasSheetWorkspace.tsx: missing context menu support');
if (!canvasWorkspace.includes('openColumnContextMenu')) failures.push('CanvasSheetWorkspace.tsx: column header right-click must preserve existing multi-column selection');
if (!canvasWorkspace.includes('openRowContextMenu')) failures.push('CanvasSheetWorkspace.tsx: row header right-click must preserve existing multi-row selection');
if (!canvasWorkspace.includes('getColumnContextMenuRange')) failures.push('CanvasSheetWorkspace.tsx: column header right-click must expand a merged-cell selection to its full column span');
if (!canvasWorkspace.includes('getRowContextMenuRange')) failures.push('CanvasSheetWorkspace.tsx: row header right-click must expand a merged-cell selection to its full row span');
if (!canvasWorkspace.includes('selectColumnRange(columnMenuRange.l, columnMenuRange.r)')) failures.push('CanvasSheetWorkspace.tsx: column header context menu must select the merged-cell column range');
if (!canvasWorkspace.includes('selectRowRange(rowMenuRange.t, rowMenuRange.b)')) failures.push('CanvasSheetWorkspace.tsx: row header context menu must select the merged-cell row range');
if (!canvasWorkspace.includes('openCellContextMenu')) failures.push('CanvasSheetWorkspace.tsx: selected cells must expose a cell right-click context menu');
if (!canvasWorkspace.includes('const activeMenuAxis = menuState?.axis ?? null')) failures.push('CanvasSheetWorkspace.tsx: context menu must preserve an explicit active axis during render');
if (!canvasWorkspace.includes("activeMenuAxis === 'column' ?")) failures.push('CanvasSheetWorkspace.tsx: row/column menu labels must not default to row while closing');
if (!canvasWorkspace.includes("activeMenuAxis ? (")) failures.push('CanvasSheetWorkspace.tsx: closing context menu must not render row menu content when no axis is active');
if (!canvasWorkspace.includes("openContextMenu('cell'")) failures.push('CanvasSheetWorkspace.tsx: cell right-click must open the cell context menu axis');
if (!canvasWorkspace.includes('data-sheet-menu-action="insert-column-before"')) failures.push('CanvasSheetWorkspace.tsx: cell context menu must include insert-column-before');
if (!canvasWorkspace.includes('data-sheet-menu-action="insert-column-after"')) failures.push('CanvasSheetWorkspace.tsx: cell context menu must include insert-column-after');
if (!canvasWorkspace.includes('data-sheet-menu-action="insert-row-before"')) failures.push('CanvasSheetWorkspace.tsx: cell context menu must include insert-row-before');
if (!canvasWorkspace.includes('data-sheet-menu-action="insert-row-after"')) failures.push('CanvasSheetWorkspace.tsx: cell context menu must include insert-row-after');
if (!canvasWorkspace.includes('data-sheet-menu-action="delete-column"') && !canvasWorkspace.includes("action: 'delete-column'")) failures.push('CanvasSheetWorkspace.tsx: cell context menu must include delete-column');
if (!canvasWorkspace.includes('data-sheet-menu-action="delete-row"') && !canvasWorkspace.includes("action: 'delete-row'")) failures.push('CanvasSheetWorkspace.tsx: cell context menu must include delete-row');
if (!canvasWorkspace.includes('data-sheet-menu-action="merge-cells"')) failures.push('CanvasSheetWorkspace.tsx: multi-cell context menu must include merge-cells');
if (!canvasWorkspace.includes('data-sheet-menu-action="split-cells"')) failures.push('CanvasSheetWorkspace.tsx: merged-cell context menu must include split-cells');
if (!canvasWorkspace.includes('const [multiSelectedRanges')) failures.push('CanvasSheetWorkspace.tsx: Command-click must keep multiple selected cell ranges');
if (!canvasWorkspace.includes('handleCommandCellSelection')) failures.push('CanvasSheetWorkspace.tsx: Command-click must use a dedicated multi-cell selection handler');
if (!canvasWorkspace.includes('const baseRanges = normalizedMultiSelectedRanges.length')) failures.push('CanvasSheetWorkspace.tsx: Command-click must preserve the existing selected cell before adding another cell');
if (!canvasWorkspace.includes('rangeMap.delete(selectionKey)')) failures.push('CanvasSheetWorkspace.tsx: Command-clicking an already selected cell must toggle it off');
if (!canvasWorkspace.includes('const nextSelectedRange = nextRanges.length > 0 ? nextRanges[nextRanges.length - 1] : null')) failures.push('CanvasSheetWorkspace.tsx: Command-click toggle must keep the remaining selected cell active');
if (!canvasWorkspace.includes('data-sheet-multi-selection-outline="true"')) failures.push('CanvasSheetWorkspace.tsx: Command-click selections must render additional range outlines');
if (!canvasWorkspace.includes('const isColumnInSelectedRanges')) failures.push('CanvasSheetWorkspace.tsx: column ruler highlight must include Command-click selected cells');
if (!canvasWorkspace.includes('const isRowInSelectedRanges')) failures.push('CanvasSheetWorkspace.tsx: row ruler highlight must include Command-click selected cells');
if (!canvasWorkspace.includes('const isColumnActive = isColumnInSelectedRanges(col)')) failures.push('CanvasSheetWorkspace.tsx: column ruler active state must use the full multi-selected range set');
if (!canvasWorkspace.includes('const isRowActive = isRowInSelectedRanges(row)')) failures.push('CanvasSheetWorkspace.tsx: row ruler active state must use the full multi-selected range set');
if (!canvasWorkspace.includes('clearSelectionAfterSheetStructureChange')) failures.push('CanvasSheetWorkspace.tsx: insert/delete row and column menu actions must clear stale selection after changing sheet structure');
if (!canvasWorkspace.includes('let didChangeSheetStructure = false')) failures.push('CanvasSheetWorkspace.tsx: menu actions must track row and column structure changes before clearing selection');
if (!canvasWorkspace.includes('if (didChangeSheetStructure)')) failures.push('CanvasSheetWorkspace.tsx: menu actions must clear selection only after row or column structure changes');
if ((canvasWorkspace.match(/didChangeSheetStructure = true;/g) ?? []).length < 8) failures.push('CanvasSheetWorkspace.tsx: every insert/delete row and column branch must mark the sheet structure as changed');
if (!canvasWorkspace.includes('getCellStructureActionRange')) failures.push('CanvasSheetWorkspace.tsx: cell menu delete row/column actions must derive the action range from all selected cells');
if (!canvasWorkspace.includes('const cellStructureActionRange = getCellStructureActionRange();')) failures.push('CanvasSheetWorkspace.tsx: menu actions must compute the full Command-click structure range once');
if (!canvasWorkspace.includes('deleteSheetColumns(cellStructureActionRange.l, cellStructureActionRange.r)')) failures.push('CanvasSheetWorkspace.tsx: delete-column from a cell menu must apply to all selected columns');
if (!canvasWorkspace.includes('deleteSheetRows(cellStructureActionRange.t, cellStructureActionRange.b)')) failures.push('CanvasSheetWorkspace.tsx: delete-row from a cell menu must apply to all selected rows');
if (!canvasWorkspace.includes('function rangesFormContinuousRectangle')) failures.push('CanvasSheetWorkspace.tsx: discontinuous Command-click selections must be detected before rendering structure menu actions');
if (!canvasWorkspace.includes('const isDiscontinuousCellMenuSelection')) failures.push('CanvasSheetWorkspace.tsx: cell context menu must distinguish discontinuous selected cells');
if (!canvasWorkspace.includes('const canShowCellStructureMenu')) failures.push('CanvasSheetWorkspace.tsx: discontinuous selected cells must hide insert/delete row and column actions');
if (!canvasWorkspace.includes('{canShowCellStructureMenu ? (')) failures.push('CanvasSheetWorkspace.tsx: insert row and column actions must not render for discontinuous selected cells');
if (!canvasWorkspace.includes('{canShowCellStructureMenu ? renderDeleteMenuGroup')) failures.push('CanvasSheetWorkspace.tsx: delete row and column actions must not render for discontinuous selected cells');
if (!canvasWorkspace.includes('data-sheet-menu-divider="quick-add-fields"')) failures.push('CanvasSheetWorkspace.tsx: quick field add must be separated from merge/split and delete actions');
if (!canvasWorkspace.includes('const shouldShowQuickAddFieldsDivider')) failures.push('CanvasSheetWorkspace.tsx: quick field add divider must be conditional');
if (!canvasWorkspace.includes('{shouldShowQuickAddFieldsDivider ? (')) failures.push('CanvasSheetWorkspace.tsx: quick field add divider must not render when it is the only menu action');
if (/<Divider data-sheet-menu-divider="quick-add-fields" sx=\{\{ my: 0\.5 \}\} \/>\s*<MenuItem\s+data-sheet-menu-action="quick-add-fields"/.test(canvasWorkspace)) failures.push('CanvasSheetWorkspace.tsx: quick field add divider must not be rendered unconditionally');
if (!canvasWorkspace.includes('data-sheet-menu-action="quick-add-fields"')) failures.push('CanvasSheetWorkspace.tsx: cell context menu must include quick field add');
if (!canvasWorkspace.includes('快速添加字段')) failures.push('CanvasSheetWorkspace.tsx: quick field add label must read 快速添加字段');
if (!canvasWorkspace.includes("'quick-add-fields'")) failures.push('CanvasSheetWorkspace.tsx: quick field add must have a typed menu action');
if (!canvasWorkspace.includes('data-quick-add-field-dialog="true"')) failures.push('CanvasSheetWorkspace.tsx: quick field add must open an editable dialog');
if (!canvasWorkspace.includes('添加目标')) failures.push('CanvasSheetWorkspace.tsx: quick field add dialog must include target selection');
if (!canvasWorkspace.includes('序号') || !canvasWorkspace.includes('字段名称') || !canvasWorkspace.includes('字段类型') || !canvasWorkspace.includes('字段说明') || !canvasWorkspace.includes('操作')) failures.push('CanvasSheetWorkspace.tsx: quick field add dialog must include serial number and editable field table columns');
if (!canvasWorkspace.includes('CloseRounded')) failures.push('CanvasSheetWorkspace.tsx: quick field add dialog must include a title-aligned close icon');
if (!canvasWorkspace.includes('data-quick-add-field-table-frame="true"')) failures.push('CanvasSheetWorkspace.tsx: quick field add table must render a full outside border frame');
if (!canvasWorkspace.includes('quickAddTargetOptions')) failures.push('CanvasSheetWorkspace.tsx: quick field add target must render a flat option list');
if (!canvasWorkspace.includes('quickAddSubTableTargetFields')) failures.push('CanvasSheetWorkspace.tsx: quick field add target must include all enabled sub-table fields');
if (/quickAddTargetOptions[\s\S]{0,240}availableSubTableFields/.test(canvasWorkspace)) failures.push('CanvasSheetWorkspace.tsx: quick field add target must not reuse available field filtering');
if (!canvasWorkspace.includes('`主表-${quickAddMainTargetName}`')) failures.push('CanvasSheetWorkspace.tsx: quick field add main target label must read 主表-当前模板');
if (!canvasWorkspace.includes('`子表-${field.name || field.code || \'未命名子表\'}`')) failures.push('CanvasSheetWorkspace.tsx: quick field add sub-table target labels must read 子表-子表名称');
if (canvasWorkspace.includes('data-quick-add-field-sub-table="true"')) failures.push('CanvasSheetWorkspace.tsx: quick field add target should not render a second sub-table selector');
if (!canvasWorkspace.includes('inferQuickAddFieldType')) failures.push('CanvasSheetWorkspace.tsx: quick field add should infer field types when possible');
if (!canvasWorkspace.includes('getQuickAddFieldCells')) failures.push('CanvasSheetWorkspace.tsx: quick field add must derive rows from visible selected cells');
if (!canvasWorkspace.includes('findMergedRangeForCell(currentPage, row, col)')) failures.push('CanvasSheetWorkspace.tsx: quick field add must inspect merged cells when deriving rows');
if (!canvasWorkspace.includes('mergedRange.t !== row || mergedRange.l !== col')) failures.push('CanvasSheetWorkspace.tsx: quick field add must skip secondary coordinates inside merged cells');
if (!canvasWorkspace.includes('borderCollapse: \'collapse\'')) failures.push('CanvasSheetWorkspace.tsx: quick field add table must render visible cell borders');
if (!canvasWorkspace.includes('height: 34')) failures.push('CanvasSheetWorkspace.tsx: quick field add table header must use compact height');
if (!canvasWorkspace.includes('quickAddMainTargetLabel') || !canvasWorkspace.includes('quickAddTargetOptions')) failures.push('CanvasSheetWorkspace.tsx: quick field add target must explain main table destination');
if (!canvasWorkspace.includes('sourceName: name')) failures.push('CanvasSheetWorkspace.tsx: quick add dialog drafts must retain the source cell name for visible duplicate resolution');
if (!canvasWorkspace.includes('resolveQuickAddFieldDraftNames(drafts, defaultTarget.target, defaultTarget.subTableId)')) failures.push('CanvasSheetWorkspace.tsx: quick add dialog must show de-duplicated names before confirmation');
if (!canvasWorkspace.includes('resolveQuickAddUniqueFieldName(usedNames, sourceName)')) failures.push('CanvasSheetWorkspace.tsx: quick add dialog must apply 字段名称_索引 naming to visible draft names');
if (!canvasWorkspace.includes('normalizeQuickAddSubTableFields(subTableField?.typeConfig.columns)')) failures.push('CanvasSheetWorkspace.tsx: quick add dialog must de-duplicate against existing sub-table fields for the selected target');
if (!canvasWorkspace.includes('addFields(')) failures.push('CanvasSheetWorkspace.tsx: quick field add must batch add fields to field management');
if (!canvasWorkspace.includes('addSubTableFields(')) failures.push('CanvasSheetWorkspace.tsx: quick field add must batch add fields to sub-tables');
if (!storeFile.includes('addFields: (fields)')) failures.push('useTemplateDesignerStore.ts: store must support batch adding main fields');
if (!storeFile.includes('addSubTableFields: (subTableFieldId, fields)')) failures.push('useTemplateDesignerStore.ts: store must support batch adding sub-table fields');
if (!storeFile.includes('function createUniqueFieldName')) failures.push('useTemplateDesignerStore.ts: quick add must generate unique field names when labels already exist');
if (!storeFile.includes('createUniqueFieldName(fields, preferredName)')) failures.push('useTemplateDesignerStore.ts: quick add model fields must de-duplicate against existing target fields');
if (!storeFile.includes('`${baseName}_${index}`')) failures.push('useTemplateDesignerStore.ts: quick add duplicate field names must use 字段名称_索引 naming');
if (!canvasWorkspace.includes('availableSubTableFields')) failures.push('CanvasSheetWorkspace.tsx: context menu must derive unused sub-table fields for selected ranges');
if (!canvasWorkspace.includes("field.type === 'subTable'")) failures.push('CanvasSheetWorkspace.tsx: sub-table context action must only use subTable fields');
if (!canvasWorkspace.includes('getAvailableFieldsForCurrentVersion()')) failures.push('CanvasSheetWorkspace.tsx: sub-table context action must exclude fields already consumed on the canvas');
if (!canvasWorkspace.includes('canSetSubTableMenuSelection')) failures.push('CanvasSheetWorkspace.tsx: set-sub-table menu item must be conditional on a multi-cell selection');
if (!canvasWorkspace.includes('data-sheet-menu-action="set-sub-table"')) failures.push('CanvasSheetWorkspace.tsx: multi-cell context menu must include set-sub-table action');
if (!canvasWorkspace.includes('data-sheet-menu-action="sub-table-data-group"')) failures.push('CanvasSheetWorkspace.tsx: sub-table context menu must include data grouping action');
if (!canvasWorkspace.includes('数据分组')) failures.push('CanvasSheetWorkspace.tsx: sub-table data grouping action must read 数据分组');
if (!canvasWorkspace.includes('handleSubTableDataGroup')) failures.push('CanvasSheetWorkspace.tsx: sub-table data grouping action must call a dedicated handler');
const canGroupSubTableSelectionBlock = canvasWorkspace.match(/const canGroupSubTableSelection = Boolean\([\s\S]*?\);/)?.[0] ?? '';
if (!canvasWorkspace.includes('const selectedSubTableRegion = selectedSubTableNode?.bindings?.subTableRegion')) failures.push('CanvasSheetWorkspace.tsx: sub-table data grouping menu must read the selected sub-table region once');
if (!canGroupSubTableSelectionBlock.includes("selectedSubTableRegion?.repeat.type === 'fixed'")) failures.push('CanvasSheetWorkspace.tsx: data grouping menu must only appear for fixed sub-tables');
if (!canGroupSubTableSelectionBlock.includes('!selectedSubTableRegion.recordTemplate.groupRange')) failures.push('CanvasSheetWorkspace.tsx: data grouping menu must hide after a fixed sub-table group is created');
if (!canvasWorkspace.includes('isSubTableRangeSelection')) failures.push('CanvasSheetWorkspace.tsx: set-sub-table action must detect selections inside existing sub-table regions');
if (!canvasWorkspace.includes('!isSubTableRangeSelection')) failures.push('CanvasSheetWorkspace.tsx: set-sub-table action must be hidden inside existing sub-table regions');
if (!canvasWorkspace.includes('data-sheet-menu-sub-table-list="true"') && !canvasWorkspace.includes("'data-sheet-menu-sub-table-list': 'true'")) failures.push('CanvasSheetWorkspace.tsx: multiple sub-table fields must render a second-level button area');
if (!canvasWorkspace.includes('anchorEl={subTableMenuAnchorEl}')) failures.push('CanvasSheetWorkspace.tsx: sub-table second-level actions must render in an independent menu anchored beside the parent item');
if (!canvasWorkspace.includes('data-sheet-sub-table-menu-root="true"')) failures.push('CanvasSheetWorkspace.tsx: sub-table second-level menu must expose an independent menu root marker');
if (canvasWorkspace.includes('data-sheet-menu-sub-table-cascade="true"')) failures.push('CanvasSheetWorkspace.tsx: sub-table second-level actions must not be rendered inside the first-level menu item');
if (canvasWorkspace.includes("display: 'flex',\n          alignItems: 'flex-start'")) failures.push('CanvasSheetWorkspace.tsx: sub-table second-level actions must not expand the first-level context menu width');
if (!canvasWorkspace.includes('data-sheet-menu-sub-table-field-id={field.id}')) failures.push('CanvasSheetWorkspace.tsx: sub-table submenu buttons must expose the selected field id');
if (!canvasWorkspace.includes('handleSetSubTableField')) failures.push('CanvasSheetWorkspace.tsx: sub-table menu must insert the selected sub-table field');
if (!canvasWorkspace.includes('addNodeFromFieldToRange')) failures.push('CanvasSheetWorkspace.tsx: set-sub-table action must place a field component over the selected range');
if (!canvasWorkspace.includes('canMergeMenuSelection')) failures.push('CanvasSheetWorkspace.tsx: merge-cells menu item must be conditional on a multi-cell selection');
if (!canvasWorkspace.includes('selectionCrossesSubTableBoundary')) failures.push('CanvasSheetWorkspace.tsx: merge-cells menu must hide when selection crosses a sub-table region boundary');
if (!canvasWorkspace.includes('canSplitMenuSelection')) failures.push('CanvasSheetWorkspace.tsx: split-cells menu item must be conditional on merged cells in the selection');
if (!canvasWorkspace.includes('deleteSheetColumns')) failures.push('CanvasSheetWorkspace.tsx: missing delete-column right-click wiring');
if (!canvasWorkspace.includes('deleteSheetRows')) failures.push('CanvasSheetWorkspace.tsx: missing delete-row right-click wiring');
if (!canvasWorkspace.includes('删除列')) failures.push('CanvasSheetWorkspace.tsx: missing delete-column menu label');
if (!canvasWorkspace.includes('删除行')) failures.push('CanvasSheetWorkspace.tsx: missing delete-row menu label');
if (!canvasWorkspace.includes('renderDangerMenuItem')) failures.push('CanvasSheetWorkspace.tsx: right-click delete actions must use a shared danger menu item renderer');
if (!canvasWorkspace.includes('renderDeleteMenuGroup')) failures.push('CanvasSheetWorkspace.tsx: right-click delete actions must render as the final separated menu group');
if (!canvasWorkspace.includes('data-sheet-menu-delete-group')) failures.push('CanvasSheetWorkspace.tsx: delete menu group must be explicitly tagged');
if (!canvasWorkspace.includes("borderTop: '1px solid #e5e7eb'")) failures.push('CanvasSheetWorkspace.tsx: delete menu group must have a top divider');
if (!canvasWorkspace.includes("color: '#d32f2f'")) failures.push('CanvasSheetWorkspace.tsx: delete menu items must use red text');
if (!canvasWorkspace.includes("bgcolor: '#fff5f5'")) failures.push('CanvasSheetWorkspace.tsx: delete menu item hover must use a danger background');
if (canvasWorkspace.indexOf('data-sheet-menu-action="delete-row"') > -1
  && canvasWorkspace.indexOf('data-sheet-menu-action="split-cells"') > -1
  && canvasWorkspace.indexOf('data-sheet-menu-action="delete-row"') < canvasWorkspace.indexOf('data-sheet-menu-action="split-cells"')) {
  failures.push('CanvasSheetWorkspace.tsx: cell menu delete actions must appear after merge/split actions');
}
if (!canvasWorkspace.includes('window.prompt')) failures.push('CanvasSheetWorkspace.tsx: missing width/height prompt editing');
if (!canvasWorkspace.includes('insertMenuCount')) failures.push('CanvasSheetWorkspace.tsx: missing insert count state for right-click add row/column');
if (!canvasWorkspace.includes('parseInsertMenuCount')) failures.push('CanvasSheetWorkspace.tsx: missing positive-integer parser for insert count');
if (!canvasWorkspace.includes('normalizeInsertMenuCountInput')) failures.push('CanvasSheetWorkspace.tsx: insert count input must sanitize non-integer characters');
if (!canvasWorkspace.includes('data-sheet-menu-insert-count="true"')) failures.push('CanvasSheetWorkspace.tsx: insert count input must be explicitly tagged in the context menu');
if (!canvasWorkspace.includes('inputMode: \'numeric\'')) failures.push('CanvasSheetWorkspace.tsx: insert count input must request numeric keyboard/input');
if (!canvasWorkspace.includes("height: 32")) failures.push('CanvasSheetWorkspace.tsx: insert count TextField must use compact menu-item height');
if (!canvasWorkspace.includes("'& .MuiOutlinedInput-root'")) failures.push('CanvasSheetWorkspace.tsx: insert count TextField must compact the outlined input root');
if (!canvasWorkspace.includes("height: 30")) failures.push('CanvasSheetWorkspace.tsx: insert count input root must be shorter than the default MUI field height');
if (!canvasWorkspace.includes("minHeight: 0")) failures.push('CanvasSheetWorkspace.tsx: insert count input root must clear default min height');
if (!canvasWorkspace.includes("renderInsertCountInput('insert-before')")) failures.push('CanvasSheetWorkspace.tsx: insert-before menu item must render the shared insert count input');
if (!canvasWorkspace.includes("renderInsertCountInput('insert-after')")) failures.push('CanvasSheetWorkspace.tsx: insert-after menu item must render the shared insert count input');
if (!canvasWorkspace.includes('insertSheetColumns(normalizedRange.l, insertCount)')) failures.push('CanvasSheetWorkspace.tsx: column insert-before must use the requested positive insert count');
if (!canvasWorkspace.includes('insertSheetRows(normalizedRange.t, insertCount)')) failures.push('CanvasSheetWorkspace.tsx: row insert-before must use the requested positive insert count');
if (!canvasWorkspace.includes('insertSheetColumns(normalizedRange.r + 1, insertCount)')) failures.push('CanvasSheetWorkspace.tsx: column insert-after must use the requested positive insert count');
if (!canvasWorkspace.includes('insertSheetRows(normalizedRange.b + 1, insertCount)')) failures.push('CanvasSheetWorkspace.tsx: row insert-after must use the requested positive insert count');
if (!canvasWorkspace.includes('autoFitSheetColumnWidth')) failures.push('CanvasSheetWorkspace.tsx: missing auto-fit column width helper');
if (!canvasWorkspace.includes('autoFitSheetRowHeight')) failures.push('CanvasSheetWorkspace.tsx: missing auto-fit row height helper');
if (!canvasWorkspace.includes('measureSheetRowHeightFromDom')) failures.push('CanvasSheetWorkspace.tsx: row Auto height must measure rendered DOM content height');
if (!canvasWorkspace.includes('data-sheet-cell-row={row}')) failures.push('CanvasSheetWorkspace.tsx: rendered cells must expose row markers for DOM height measurement');
if (!canvasWorkspace.includes('data-sheet-cell-col={col}')) failures.push('CanvasSheetWorkspace.tsx: rendered cells must expose column markers for DOM height measurement');
if (!canvasWorkspace.includes('data-sheet-cell-content="true"')) failures.push('CanvasSheetWorkspace.tsx: rendered cell text must expose a content marker for DOM height measurement');
if (!canvasWorkspace.includes('getBoundingClientRect().height')) failures.push('CanvasSheetWorkspace.tsx: row Auto height must use actual rendered content height');
if (!canvasWorkspace.includes("handleMenuAction('auto-size'")) failures.push('CanvasSheetWorkspace.tsx: right-click menu must wire Auto size action');
if (!canvasWorkspace.includes('data-sheet-menu-auto-size="true"')) failures.push('CanvasSheetWorkspace.tsx: Auto size button must be explicitly tagged in the context menu');
if (!canvasWorkspace.includes('event.stopPropagation()')) failures.push('CanvasSheetWorkspace.tsx: Auto size button must stop propagation so manual resize prompt is not triggered');
if (!canvasWorkspace.includes('Auto</Button>')) failures.push('CanvasSheetWorkspace.tsx: context menu must display an Auto mini button next to width/height resize');
if (!canvasWorkspace.includes('resize-column')) failures.push('CanvasSheetWorkspace.tsx: missing column resize handles');
if (!canvasWorkspace.includes('resize-row')) failures.push('CanvasSheetWorkspace.tsx: missing row resize handles');
if (!canvasWorkspace.includes('editingCell')) failures.push('CanvasSheetWorkspace.tsx: missing inline cell editing state');
if (!canvasWorkspace.includes('skipNextBlurCommitRef')) failures.push('CanvasSheetWorkspace.tsx: Escape cancel must skip the following blur commit');
if (!canvasWorkspace.includes('onDoubleClick')) failures.push('CanvasSheetWorkspace.tsx: missing double-click cell editing');
if (!canvasWorkspace.includes('onKeyDown')) failures.push('CanvasSheetWorkspace.tsx: missing keyboard direct input handling');
if (!canvasWorkspace.includes('data-sheet-cell-focus')) failures.push('CanvasSheetWorkspace.tsx: missing focusable cell keyboard target');
if (!canvasWorkspace.includes('event.currentTarget.focus()')) failures.push('CanvasSheetWorkspace.tsx: missing per-cell focus handoff for direct typing');
if (!canvasWorkspace.includes('updateSelectedCellValue') && !canvasWorkspace.includes('updateSheetCellValue')) failures.push('CanvasSheetWorkspace.tsx: missing cell value commit handling');
if (!canvasWorkspace.includes('addNodeFromFieldToCell')) failures.push('CanvasSheetWorkspace.tsx: field drag drop must add a field component at the target cell');
if (!canvasWorkspace.includes('handleFieldDropOnCell')) failures.push('CanvasSheetWorkspace.tsx: sheet cells must handle dropped field cards');
if (!canvasWorkspace.includes("event.dataTransfer.getData('application/x-template-designer-field')")) failures.push('CanvasSheetWorkspace.tsx: sheet cell drop must read the dragged field id');
if (!canvasWorkspace.includes('onDrop={(event) => handleFieldDropOnCell(event, cellSelectionRange)}')) failures.push('CanvasSheetWorkspace.tsx: each sheet cell must be a field drop target');
if (!canvasWorkspace.includes('data-canvas-field-drop-cell="true"')) failures.push('CanvasSheetWorkspace.tsx: field drop target cells must expose a stable marker');
if (!canvasWorkspace.includes('FIELD_POINTER_DROP_EVENT')) failures.push('CanvasSheetWorkspace.tsx: sheet cells must accept pointer-based field drops');
if (!canvasWorkspace.includes('application/x-template-designer-sub-table-field')) failures.push('CanvasSheetWorkspace.tsx: sheet cells must accept scoped sub-table field drops');
if (!canvasWorkspace.includes('addNodeFromSubTableFieldToCell')) failures.push('CanvasSheetWorkspace.tsx: sub-table field drops must insert scoped sub-table field components');
if (!canvasWorkspace.includes('subTableField') || !canvasWorkspace.includes('subTableId')) failures.push('CanvasSheetWorkspace.tsx: sub-table field drops must preserve both parent sub-table and child field ids');
if (!canvasWorkspace.includes('useSnackbar')) failures.push('CanvasSheetWorkspace.tsx: invalid fixed sub-table field drops must report a visible snackbar message');
if (!canvasWorkspace.includes('字段只能拖入分组中')) failures.push('CanvasSheetWorkspace.tsx: fixed sub-table fields must warn when dropped outside an existing group');
if (!canvasWorkspace.includes('请先框选范围右键创建分组')) failures.push('CanvasSheetWorkspace.tsx: fixed sub-table fields must warn when dropped before creating a group');
if (!canvasWorkspace.includes('resolveSubTableFieldDropMessage')) failures.push('CanvasSheetWorkspace.tsx: fixed sub-table field drop validation must centralize message resolution');
if (!canvasWorkspace.includes('rangeContainsRange(groupRange, normalizedSelection)')) failures.push('CanvasSheetWorkspace.tsx: fixed sub-table fields must only drop inside the configured group range');
if (!canvasWorkspace.includes('handlePointerFieldDrop')) failures.push('CanvasSheetWorkspace.tsx: pointer-based field drops must use the same cell layout path');
if (!canvasWorkspace.includes('FIELD_POINTER_HOVER_EVENT')) failures.push('CanvasSheetWorkspace.tsx: pointer field drags must update a visual drop guide while hovering cells');
if (!canvasWorkspace.includes('data-field-drop-guide="true"')) failures.push('CanvasSheetWorkspace.tsx: field drag hover must render a visible target-cell guide');
if (!canvasWorkspace.includes('range: normalizedSelection')) failures.push('CanvasSheetWorkspace.tsx: dropped field components must keep the target cell range');
if (!storeFile.includes('removeCellFieldNodesFromTree')) failures.push('useTemplateDesignerStore.ts: cell field drops must replace existing field nodes in the same cell range');
if (!storeFile.includes('rangesIntersect')) failures.push('useTemplateDesignerStore.ts: cell field replacement must detect overlapping cell ranges');
if (storeFile.includes('get().insertNode(null, createBoundNodeFromField(field, layout))')) failures.push('useTemplateDesignerStore.ts: field cell drops must replace the old cell field in one history entry instead of blindly inserting');
if (!storeFile.includes('updateSheetCellValue')) failures.push('useTemplateDesignerStore.ts: missing cell commit action by row/col');
if (!storeFile.includes('clearSelectedCells')) failures.push('useTemplateDesignerStore.ts: missing selected cell range clearing action');
if (!storeFile.includes('clearPageCellsInRange')) failures.push('useTemplateDesignerStore.ts: missing range-based cell clearing helper');
if (!storeFile.includes('delete nextCells[cellKey]')) failures.push('useTemplateDesignerStore.ts: clearing cell values must remove empty value-only cells');
if (!storeFile.includes('style: cell.style')) failures.push('useTemplateDesignerStore.ts: clearing cell values must preserve cell style');
if (!storeFile.includes('border: cell.border')) failures.push('useTemplateDesignerStore.ts: clearing cell values must preserve cell border');
if (!storeFile.includes("selectedNode?.type === 'sub-table' ? page.nodes : reconcileSubTableRegionTemplates(removeCellNodesInRange(page.nodes, selectedRange))")) failures.push('useTemplateDesignerStore.ts: clearing selected cells must remove selected non-sub-table component nodes through the selected range');
if (!storeFile.includes('selectedNode?.type === \'sub-table\' ? page.nodes')) failures.push('useTemplateDesignerStore.ts: clearing selected cells must keep selected sub-table nodes');
if (!storeFile.includes('removeCellNodesInRange')) failures.push('useTemplateDesignerStore.ts: clearing a selected range must remove all cell-bound components inside the range');
if (!storeFile.includes('removeCellNodesInRange(page.nodes, selectedRange)')) failures.push('useTemplateDesignerStore.ts: Delete/Backspace on a selected range must clear components in that selected range');
if (!canvasWorkspace.includes('clearSelectedCells')) failures.push('CanvasSheetWorkspace.tsx: Delete/Backspace must clear the selected cell range');
if (!canvasWorkspace.includes('handleCopySelectedCells')) failures.push('CanvasSheetWorkspace.tsx: missing Ctrl/Cmd+C selected-cell copy handler');
if (!canvasWorkspace.includes('handleCutSelectedCells')) failures.push('CanvasSheetWorkspace.tsx: missing Ctrl/Cmd+X selected-cell cut handler');
if (!canvasWorkspace.includes('handlePasteSelectedCells')) failures.push('CanvasSheetWorkspace.tsx: missing Ctrl/Cmd+V selected-cell paste handler');
if (!canvasWorkspace.includes('fieldNodeClipboardRef')) failures.push('CanvasSheetWorkspace.tsx: Ctrl/Cmd+X field cutting must keep an internal field-node clipboard');
if (!canvasWorkspace.includes('handleCutSelectedFieldNode')) failures.push('CanvasSheetWorkspace.tsx: Ctrl/Cmd+X must cut a selected field node before falling back to cell text');
if (!canvasWorkspace.includes('handlePasteSelectedFieldNode')) failures.push('CanvasSheetWorkspace.tsx: Ctrl/Cmd+V must paste an internal field-node clipboard before falling back to cell text');
if (!canvasWorkspace.includes('if (handleCutSelectedFieldNode())')) failures.push('CanvasSheetWorkspace.tsx: field cut must take priority over selected-cell cut');
if (!canvasWorkspace.includes('if (handlePasteSelectedFieldNode())')) failures.push('CanvasSheetWorkspace.tsx: field paste must take priority over selected-cell paste');
if (!canvasWorkspace.includes('navigator.clipboard.writeText')) failures.push('CanvasSheetWorkspace.tsx: copy/cut must write selected cells to the system clipboard');
if (!canvasWorkspace.includes('navigator.clipboard.readText')) failures.push('CanvasSheetWorkspace.tsx: paste must read selected cells from the system clipboard');
if (!canvasWorkspace.includes("event.key.toLowerCase() === 'c'")) failures.push('CanvasSheetWorkspace.tsx: Ctrl/Cmd+C must be handled from the sheet keyboard target');
if (!canvasWorkspace.includes("event.key.toLowerCase() === 'x'")) failures.push('CanvasSheetWorkspace.tsx: Ctrl/Cmd+X must be handled from the sheet keyboard target');
if (!canvasWorkspace.includes("event.key.toLowerCase() === 'v'")) failures.push('CanvasSheetWorkspace.tsx: Ctrl/Cmd+V must be handled from the sheet keyboard target');
if (!storeFile.includes('copySelectedCellsText: () => string')) failures.push('useTemplateDesignerStore.ts: missing selected-cell clipboard text export action contract');
if (!storeFile.includes('pasteCellsFromText: (startRow: number, startCol: number, text: string) => void')) failures.push('useTemplateDesignerStore.ts: missing selected-cell clipboard text paste action contract');
if (!storeFile.includes('cutSelectedFieldNode: () => CanvasNode | null')) failures.push('useTemplateDesignerStore.ts: missing selected field-node cut action contract');
if (!storeFile.includes('pasteFieldNodeToCell: (node: CanvasNode, layout: FieldCellLayout) => void')) failures.push('useTemplateDesignerStore.ts: missing field-node paste action contract');
if (!storeFile.includes('isCuttableCellFieldNode')) failures.push('useTemplateDesignerStore.ts: field-node cut must only target ordinary cell-bound field components');
if (!storeFile.includes('cloneFieldNodeForCellPaste')) failures.push('useTemplateDesignerStore.ts: field-node paste must preserve field configuration while assigning a new cell layout');
if (!storeFile.includes('serializePageCellsInRange')) failures.push('useTemplateDesignerStore.ts: selected-cell copy must serialize range values as TSV text');
if (!storeFile.includes('pastePageCellsFromText')) failures.push('useTemplateDesignerStore.ts: selected-cell paste must parse TSV text into cells');
if (canvasWorkspace.includes("startEditingCell(selectedCell.row, selectedCell.col, '')")) failures.push('CanvasSheetWorkspace.tsx: Delete/Backspace must not enter empty single-cell editing mode');
if (!canvasWorkspace.includes('data-sheet-cell-editor')) failures.push('CanvasSheetWorkspace.tsx: missing explicit inline cell editor marker');
if (!sheetCellEditorBlock.includes('multiline')) failures.push('CanvasSheetWorkspace.tsx: inline cell editor must use a multiline input so wrapped text stays multiline while editing');
if (!sheetCellEditorBlock.includes('minRows={1}')) failures.push('CanvasSheetWorkspace.tsx: inline cell editor must keep one-row cells compact');
if (!sheetCellEditorBlock.includes('maxRows={')) failures.push('CanvasSheetWorkspace.tsx: inline cell editor must cap multiline growth inside the cell');
if (!sheetCellEditorBlock.includes("'& .MuiInputBase-inputMultiline'")) failures.push('CanvasSheetWorkspace.tsx: inline cell editor must style the textarea input directly');
if (!sheetCellEditorBlock.includes("whiteSpace: 'pre-wrap'")) failures.push('CanvasSheetWorkspace.tsx: inline cell editor must preserve line breaks while editing');
if (!sheetCellEditorBlock.includes("height: '100%'")) failures.push('CanvasSheetWorkspace.tsx: inline cell editor must fill the selected cell height');
if (!sheetCellEditorBlock.includes("'& .MuiInputBase-root.MuiInputBase-multiline'")) failures.push('CanvasSheetWorkspace.tsx: multiline cell editor root must be styled separately');
if (!sheetCellEditorBlock.includes("alignItems: 'flex-start'")) failures.push('CanvasSheetWorkspace.tsx: multiline cell editor must start text at the top to avoid clipping');
if (!sheetCellEditorBlock.includes("boxSizing: 'border-box'")) failures.push('CanvasSheetWorkspace.tsx: multiline cell editor textarea must use border-box sizing to avoid clipped text');
if (!sheetCellEditorBlock.includes("overflowY: 'auto !important'")) failures.push('CanvasSheetWorkspace.tsx: multiline cell editor textarea must scroll vertically instead of hiding text');
if (sheetCellEditorBlock.includes("event.key === 'Enter'")) failures.push('CanvasSheetWorkspace.tsx: inline cell editor Enter must insert a newline instead of committing');
if (!commitEditingCellBlock.includes('skipNextBlurCommitRef.current = true')) failures.push('CanvasSheetWorkspace.tsx: explicit cell editor commits must skip the following blur commit so undo restores the previous cell value');
if (!canvasWorkspace.includes('selectionOutline')) failures.push('CanvasSheetWorkspace.tsx: missing range selection outline');
if (!canvasWorkspace.includes('renderSelectionOutline')) failures.push('CanvasSheetWorkspace.tsx: selection outline must be reusable above field components');
if (!canvasWorkspace.includes('selectionOverlay')) failures.push('CanvasSheetWorkspace.tsx: field components must not cover the selected cell outline');
if (!canvasWorkspace.includes('zIndex: layer === \'overlay\' ? 20 : undefined')) failures.push('CanvasSheetWorkspace.tsx: selected cell overlay must render above cell-target field components');
if (!canvasWorkspace.includes('shouldShowSingleCellSelection')) failures.push('CanvasSheetWorkspace.tsx: multi-cell range selection must not render the first cell with single-cell focus styling');
if (!canvasWorkspace.includes('isSelected && !isMultiCellRange(normalizedRange)')) failures.push('CanvasSheetWorkspace.tsx: single-cell focus styling must be disabled when the active selection is a range');
if (!canvasWorkspace.includes("boxShadow: shouldShowSingleCellSelection ? 'inset 0 0 0 2px #1274dd' : 'none'")) failures.push('CanvasSheetWorkspace.tsx: first cell in a selected range must not render the single-cell inset outline');
if (!canvasWorkspace.includes('A4_PAPER_WIDTH_MM')) failures.push('CanvasSheetWorkspace.tsx: missing A4 paper width standard');
if (!canvasWorkspace.includes('A4_PAPER_HEIGHT_MM')) failures.push('CanvasSheetWorkspace.tsx: missing A4 paper height standard');
if (!canvasWorkspace.includes('const paperContentWidth = a4PaperWidthPx - paperInsetLeft - paperInsetRight - PAPER_BORDER_WIDTH * 2')) failures.push('CanvasSheetWorkspace.tsx: paper content width must reserve both paper border pixels so table borders remain inside the dashed canvas boundary');
if (!canvasWorkspace.includes("paperOrientation === 'landscape' ? A4_PAPER_HEIGHT_MM : A4_PAPER_WIDTH_MM")) failures.push('CanvasSheetWorkspace.tsx: canvas width must use landscape/portrait A4 dimensions');
if (!canvasWorkspace.includes("paperOrientation === 'landscape' ? A4_PAPER_WIDTH_MM : A4_PAPER_HEIGHT_MM")) failures.push('CanvasSheetWorkspace.tsx: pagination height must use landscape/portrait A4 dimensions');
if (!canvasWorkspace.includes('data-page-break-marker="true"')) failures.push('CanvasSheetWorkspace.tsx: page break marker must be explicitly tagged');
if (!canvasWorkspace.includes('data-page-break-layer="workspace"')) failures.push('CanvasSheetWorkspace.tsx: page break layer must span the whole workspace, including gray margins');
if (!canvasWorkspace.includes('data-page-break-badge="workspace-margin"')) failures.push('CanvasSheetWorkspace.tsx: page break badge must sit in the gray workspace margin');
if (!canvasWorkspace.includes('PAGE_BREAK_MARKER_Z_INDEX')) failures.push('CanvasSheetWorkspace.tsx: page break marker must sit above grid/content layers');
if (!canvasWorkspace.includes('const rawPaperHeight = paperInsetTop + paperHeaderHeight + paperPaginationBodyHeight + paperFooterHeight;')) failures.push('CanvasSheetWorkspace.tsx: page marker count must use physical paper overflow without adding the bottom margin twice');
if (canvasWorkspace.includes('const rawPaperHeight = paperInsetTop + paperHeaderHeight + paperPaginationBodyHeight + paperFooterHeight + paperInsetBottom;')) failures.push('CanvasSheetWorkspace.tsx: bottom margin must not create an empty extra page when content is still inside the physical page');
if (!canvasWorkspace.includes('const pageMarkerCount = Math.max(1, Math.ceil(rawPaperHeight / a4PaperHeightPx));')) failures.push('CanvasSheetWorkspace.tsx: page marker count must be based on continuous paper height in every canvas mode');
if (!canvasWorkspace.includes('const sheetPaperHeight = pageMarkerCount * a4PaperHeightPx;')) failures.push('CanvasSheetWorkspace.tsx: sheet paper height must extend as continuous A4 page multiples');
if (!canvasWorkspace.includes('const top = paperViewportGapTop + boundaryIndex * a4PaperHeightPx;')) failures.push('CanvasSheetWorkspace.tsx: page break marker must align from the full workspace canvas, not the inner paper content');
if ((canvasWorkspace.match(/renderPageBreakMarkers\(\)/g) ?? []).length < 2) failures.push('CanvasSheetWorkspace.tsx: page break markers must render in both free-canvas and sheet/table layouts');
if (!canvasWorkspace.includes('workspaceScrollRef')) failures.push('CanvasSheetWorkspace.tsx: missing scroll container ref for thumbnail anchor sync');
if (!canvasWorkspace.includes('handleWorkspaceScroll')) failures.push('CanvasSheetWorkspace.tsx: missing canvas-to-thumbnail scroll sync handler');
if (!canvasWorkspace.includes('setActivePagePreviewIndex')) failures.push('CanvasSheetWorkspace.tsx: scrolling the canvas must update active thumbnail page');
if (!canvasWorkspace.includes('SHEET_ROW_RENDER_OVERSCAN_PX = 1440')) failures.push('CanvasSheetWorkspace.tsx: sheet virtualization must keep a larger row overscan buffer to avoid fast-scroll blanking');
if (!canvasWorkspace.includes('workspaceScrollFrameRef')) failures.push('CanvasSheetWorkspace.tsx: scroll viewport updates must be coalesced per animation frame');
if (!canvasWorkspace.includes('findIndexByOffset')) failures.push('CanvasSheetWorkspace.tsx: pointer hit-testing must derive row/column from cached offsets instead of scanning cell DOM');
if (canvasWorkspace.includes("querySelectorAll<HTMLElement>('[data-canvas-field-drop-cell=\"true\"]')")) failures.push('CanvasSheetWorkspace.tsx: pointer hit-testing must not query and measure every rendered cell on pointer movement');
if (!canvasWorkspace.includes('scheduleCellRangeDrag')) failures.push('CanvasSheetWorkspace.tsx: cell drag selection updates must be coalesced per animation frame');
if (!canvasWorkspace.includes('scheduleSheetResizeDrag')) failures.push('CanvasSheetWorkspace.tsx: column resize updates must be coalesced per animation frame');
if (!canvasWorkspace.includes('resizeRowDragPreview')) failures.push('CanvasSheetWorkspace.tsx: row-height drag must use a transient preview line instead of rerendering sheet rows on every mousemove');
if (!canvasWorkspace.includes('data-sheet-row-resize-preview-line="true"')) failures.push('CanvasSheetWorkspace.tsx: row-height drag must render a visible preview line while dragging');
if (!canvasWorkspace.includes('commitPendingRowResizeDrag')) failures.push('CanvasSheetWorkspace.tsx: row-height drag must commit the final height only on mouseup');
if (canvasWorkspace.includes("scheduleSheetResizeDrag({ type: 'row'")) failures.push('CanvasSheetWorkspace.tsx: row-height drag must not write global sheet row height during mousemove');
if (!canvasWorkspace.includes('scheduleHoveredSubTableUpdate')) failures.push('CanvasSheetWorkspace.tsx: sub-table hover updates must be coalesced per animation frame');
if (!canvasWorkspace.includes('window.requestAnimationFrame')) failures.push('CanvasSheetWorkspace.tsx: scroll sync must use requestAnimationFrame instead of updating React state on every scroll event');
if (!canvasWorkspace.includes('window.cancelAnimationFrame')) failures.push('CanvasSheetWorkspace.tsx: pending scroll animation frame must be cancelled on cleanup');
if (!canvasWorkspace.includes('syncWorkspaceViewportFromScroll')) failures.push('CanvasSheetWorkspace.tsx: scroll state sync must be isolated so direct jumps and native scrolling share the same optimized path');
if (!canvasWorkspace.includes('activePagePreviewIndexRef')) failures.push('CanvasSheetWorkspace.tsx: active thumbnail sync must avoid redundant store writes during scrolling');
if (!canvasWorkspace.includes('pagePreviewScrollTarget')) failures.push('CanvasSheetWorkspace.tsx: canvas must listen for thumbnail scroll target requests');
if (!canvasWorkspace.includes("behavior: 'auto'")) failures.push('CanvasSheetWorkspace.tsx: page thumbnail scroll must jump directly without smooth intermediate flashes');
if (canvasWorkspace.includes("behavior: 'smooth'")) failures.push('CanvasSheetWorkspace.tsx: thumbnail clicks must not smooth-scroll through intermediate pages');
if (!canvasWorkspace.includes('clearPagePreviewScrollTarget')) failures.push('CanvasSheetWorkspace.tsx: thumbnail scroll requests must be consumed after scrolling');
if (!canvasWorkspace.includes('clearPagePreviewScrollTarget(requestId)')) failures.push('CanvasSheetWorkspace.tsx: thumbnail scroll requests must be cleared by request id after use');
if (!canvasWorkspace.includes('data-paper-mode-ruler="top"')) failures.push('CanvasSheetWorkspace.tsx: missing paper-mode top ruler');
if (!canvasWorkspace.includes('data-paper-mode-ruler="left"')) failures.push('CanvasSheetWorkspace.tsx: missing paper-mode left ruler');
if (!canvasWorkspace.includes('data-canvas-settings-floating="true"')) failures.push('CanvasSheetWorkspace.tsx: missing global canvas settings floating panel');
if (!canvasWorkspace.includes('data-paper-settings-floating="true"')) failures.push('CanvasSheetWorkspace.tsx: missing floating paper settings');
if (!canvasWorkspace.includes('画布设置')) failures.push('CanvasSheetWorkspace.tsx: missing paper settings label');
if (!canvasWorkspace.includes('画布方向')) failures.push('CanvasSheetWorkspace.tsx: missing paper orientation settings');
if (!canvasWorkspace.includes('画布间距')) failures.push('CanvasSheetWorkspace.tsx: missing paper spacing settings');
if (!canvasWorkspace.includes('自由模式')) failures.push('CanvasSheetWorkspace.tsx: missing free paper mode option');
if (!canvasWorkspace.includes('paperMode')) failures.push('CanvasSheetWorkspace.tsx: missing persisted paper mode usage');
if (!canvasWorkspace.includes('paperOrientation')) failures.push('CanvasSheetWorkspace.tsx: missing persisted paper orientation usage');
if (!canvasWorkspace.includes('paperMarginLeftMm')) failures.push('CanvasSheetWorkspace.tsx: missing persisted paper margin usage');
if (!canvasWorkspace.includes('showRuler')) failures.push('CanvasSheetWorkspace.tsx: missing paper ruler toggle');
if (!canvasWorkspace.includes('buildRulerTicks')) failures.push('CanvasSheetWorkspace.tsx: missing word-style ruler ticks');
if (!canvasWorkspace.includes("linear-gradient(180deg, #fafbfc 0%, #f0f2f6 100%)")) failures.push('CanvasSheetWorkspace.tsx: missing word-style horizontal ruler surface');
if (!canvasWorkspace.includes('paperViewportGapTop')) failures.push('CanvasSheetWorkspace.tsx: missing paper top viewport gap');
if (!canvasWorkspace.includes('paperViewportGapBottom')) failures.push('CanvasSheetWorkspace.tsx: missing paper bottom viewport gap');
if (!canvasWorkspace.includes('paperContentWidth')) failures.push('CanvasSheetWorkspace.tsx: missing fixed paper content width');
if (!canvasWorkspace.includes('renderWordDocumentLayer')) failures.push('CanvasSheetWorkspace.tsx: free DOCX mode must render an independent Word document layer');
if (!canvasWorkspace.includes('data-word-document-layer="true"')) failures.push('CanvasSheetWorkspace.tsx: Word document layer must expose a stable QA marker');
if (!canvasWorkspace.includes('data-word-block="paragraph"')) failures.push('CanvasSheetWorkspace.tsx: Word paragraphs must render as editable paragraph blocks');
if (!canvasWorkspace.includes('data-word-block="table"')) failures.push('CanvasSheetWorkspace.tsx: Word tables must render as editable Word table blocks');
if (!canvasWorkspace.includes('data-word-table-cell="true"')) failures.push('CanvasSheetWorkspace.tsx: Word table cells must expose stable editable markers');
if (!canvasWorkspace.includes('contentEditable')) failures.push('CanvasSheetWorkspace.tsx: Word layer must reserve direct editing behavior');
if (!canvasWorkspace.includes('updateWordParagraphText')) failures.push('CanvasSheetWorkspace.tsx: Word paragraph edits must write back to wordDocument');
if (!canvasWorkspace.includes('updateWordTableCellText')) failures.push('CanvasSheetWorkspace.tsx: Word table cell edits must write back to wordDocument');
if (!canvasWorkspace.includes('minWidth: 0')) failures.push('CanvasSheetWorkspace.tsx: Word table cells must allow grid columns to shrink before wrapping text');
if (!canvasWorkspace.includes("overflowWrap: 'anywhere'")) failures.push('CanvasSheetWorkspace.tsx: Word table cells must wrap long text inside their own bounds');
if (!canvasWorkspace.includes("whiteSpace: 'pre-wrap'")) failures.push('CanvasSheetWorkspace.tsx: Word table cells must preserve Enter line breaks');
if (!canvasWorkspace.includes('serializeContentEditableLineBreaks')) failures.push('CanvasSheetWorkspace.tsx: Word table cells must serialize only manual contentEditable line breaks');
if (!canvasWorkspace.includes('insertContentEditableLineBreak')) failures.push('CanvasSheetWorkspace.tsx: Word table cells must normalize Enter as a line-break node');
if (canvasWorkspace.includes('updateWordTableCellText(block.id, cell.id, event.currentTarget.innerText)')) failures.push('CanvasSheetWorkspace.tsx: Word table cells must not persist visual wrapping from innerText');
if (!canvasWorkspace.includes('data-word-table-cell-content="true"')) failures.push('CanvasSheetWorkspace.tsx: Word table cells must place editable text in its own normal-flow element');
if (!canvasWorkspace.includes("maxWidth: '100%'")) failures.push('CanvasSheetWorkspace.tsx: Word table cell text flow must remain constrained to its cell');
if (!canvasWorkspace.includes('!currentPage.wordDocument ? renderImportedGrid')) failures.push('CanvasSheetWorkspace.tsx: imported sheet grid must not render over DOCX wordDocument content');
if (!canvasWorkspace.includes('importedGridTop')) failures.push('CanvasSheetWorkspace.tsx: free Word import must render table grid below restored absolute text nodes');
if (!canvasWorkspace.includes('gridOffsetTop')) failures.push('CanvasSheetWorkspace.tsx: sheet selection overlays must account for imported grid top offset');
if (!gridOffsetCellLayoutBlock.includes('top: gridOffsetTop + rowTop')) failures.push('CanvasSheetWorkspace.tsx: field-drop layouts must add gridOffsetTop to the visual top');
if (!gridOffsetCellLayoutBlock.includes('height: (rowOffsets[normalizedSelection.b] ?? rowTop) - rowTop')) failures.push('CanvasSheetWorkspace.tsx: field-drop layout height must not subtract gridOffsetTop');
if (!findCellRangeAtClientPointBlock.includes('- gridOffsetTop')) failures.push('CanvasSheetWorkspace.tsx: pointer hit testing must subtract gridOffsetTop before resolving row indexes');
if (!pointerFieldDropBlock.includes('getGridOffsetCellLayout(cellSelectionRange)')) failures.push('CanvasSheetWorkspace.tsx: pointer field drops must reuse the grid-offset cell layout');
if (!renderSelectionOutlineBlock.includes("(layer === 'overlay' ? gridOffsetTop : 0) + selectionOutline.top")) failures.push('CanvasSheetWorkspace.tsx: selection outline must offset only overlay layer, not the already-shifted grid layer');
if (!renderFieldDropGuideBlock.includes("(layer === 'overlay' ? gridOffsetTop : 0) + fieldDropGuideOutline.top")) failures.push('CanvasSheetWorkspace.tsx: field drop guide must offset only overlay layer, not the already-shifted grid layer');
if (!importedGridRenderBlock.includes("renderFieldDropGuide('grid')")) failures.push('CanvasSheetWorkspace.tsx: imported grid must render its internal field drop guide in grid-local coordinates');
if (!canvasWorkspace.includes('displayColumnWidths')) failures.push('CanvasSheetWorkspace.tsx: missing fixed-width column rendering');
if (!canvasWorkspace.includes("borderLeft: index === 0")) failures.push('CanvasSheetWorkspace.tsx: missing first-column border rendering');
if (!canvasWorkspace.includes("borderTop: index === 0")) failures.push('CanvasSheetWorkspace.tsx: missing first-row border rendering');
if (!canvasWorkspace.includes('clearSelection')) failures.push('CanvasSheetWorkspace.tsx: missing blank-area clear selection behavior');
if (!canvasWorkspace.includes("borderBottom: '5px solid #d9d9d9'")) failures.push('CanvasSheetWorkspace.tsx: missing Vue-style top-left selector triangle');
if (!pageThumbnails.includes('第 1 页')) failures.push('CanvasPageThumbnails.tsx: missing thumbnail page label');
if (pageThumbnails.includes('displayPageNumber')) failures.push('CanvasPageThumbnails.tsx: thumbnails must derive page labels from preview index, not split imported canvas pages');
if (!pageThumbnails.includes('分页缩略图')) failures.push('CanvasPageThumbnails.tsx: missing thumbnail title');
if (!pageThumbnails.includes('onClose: () => void')) failures.push('CanvasPageThumbnails.tsx: missing close callback prop');
if (!pageThumbnails.includes('aria-label="关闭侧边栏"')) failures.push('CanvasPageThumbnails.tsx: close button must expose a clear label');
if (!pageThumbnails.includes('onClick={onClose}')) failures.push('CanvasPageThumbnails.tsx: close button must trigger the side panel close callback');
if (!pageThumbnails.includes('activePagePreviewIndexes')) failures.push('CanvasPageThumbnails.tsx: thumbnails must read active preview-page state');
if (!pageThumbnails.includes('requestPagePreviewScroll')) failures.push('CanvasPageThumbnails.tsx: thumbnail clicks must request canvas anchor scrolling');
if (!pageThumbnails.includes("behavior: 'auto'")) failures.push('CanvasPageThumbnails.tsx: active thumbnail must jump directly without smooth intermediate flashes');
if (!pageThumbnails.includes('data-page-thumbnail-active')) failures.push('CanvasPageThumbnails.tsx: thumbnails must mark active preview pages');
if (!pageThumbnails.includes('CanvasThumbnailPreview')) failures.push('CanvasPageThumbnails.tsx: thumbnails must render actual canvas preview content');
if (!pageThumbnails.includes('memo(function CanvasThumbnailPreview')) failures.push('CanvasPageThumbnails.tsx: thumbnail previews must be memoized so canvas scrolling does not rerender every preview cell');
if (!pageThumbnails.includes('THUMBNAIL_VIRTUAL_OVERSCAN')) failures.push('CanvasPageThumbnails.tsx: thumbnail list must virtualize previews with overscan for large imported forms');
if (!pageThumbnails.includes('visibleThumbnailItems')) failures.push('CanvasPageThumbnails.tsx: thumbnail list must render only visible preview cards');
if (!pageThumbnails.includes("contentVisibility: 'auto'")) failures.push('CanvasPageThumbnails.tsx: thumbnail cards must allow the browser to skip offscreen paint work');
if (!pageThumbnails.includes('page.cells')) failures.push('CanvasPageThumbnails.tsx: thumbnails must render imported cell content, not only a placeholder grid');
if (!pageThumbnails.includes('page.mergedCells')) failures.push('CanvasPageThumbnails.tsx: thumbnails must reflect merged cells in preview content');
if (!pageThumbnails.includes('page.images')) failures.push('CanvasPageThumbnails.tsx: thumbnails must reflect imported images in preview content');
if (pageThumbnails.includes('buildColumnCount') || pageThumbnails.includes('buildRowCount')) failures.push('CanvasPageThumbnails.tsx: thumbnails must not render a fake row/column placeholder grid');
if (!pageThumbnails.includes('height: 36')) failures.push('CanvasPageThumbnails.tsx: missing aligned thumbnail header height');
if (!pageThumbnails.includes('fontWeight: 600')) failures.push('CanvasPageThumbnails.tsx: missing adjusted thumbnail title weight');
if (!pageThumbnails.includes("maxWidth: 'none'")) failures.push('CanvasPageThumbnails.tsx: missing adaptive thumbnail card width');
if (!sidebar.includes('getAvailableFieldsForCurrentVersion')) failures.push('DesignerSidebar.tsx: field management panel must render fields created in model design');
if (!sidebar.includes('data-canvas-field-card="true"')) failures.push('DesignerSidebar.tsx: field management panel must render model fields as cards');
if (!sidebar.includes('const canvasFieldCardHeight = 56')) failures.push('DesignerSidebar.tsx: field management cards must use a fixed height');
if (!sidebar.includes('flex: `0 0 ${canvasFieldCardHeight}px`')) failures.push('DesignerSidebar.tsx: field management cards must not shrink below their fixed height');
if (!sidebar.includes('height: canvasFieldCardHeight') || !sidebar.includes('minHeight: canvasFieldCardHeight')) failures.push('DesignerSidebar.tsx: field management card height must be fixed consistently');
if (!sidebar.includes('data-canvas-field-type-label="true"') || !sidebar.includes('<Typography data-canvas-field-type-label="true"')) failures.push('DesignerSidebar.tsx: field management type labels must be individually constrained');
if (!sidebar.includes('draggable')) failures.push('DesignerSidebar.tsx: field cards must be draggable to the canvas');
if (!sidebar.includes('DragEvent<HTMLButtonElement>')) failures.push('DesignerSidebar.tsx: field drag source must be the current field Button');
if (!sidebar.includes('variant="text"')) failures.push('DesignerSidebar.tsx: field cards must keep Button as the drag source');
if (!sidebar.includes('draggingFieldId')) failures.push('DesignerSidebar.tsx: dragging field state must be tracked during drag');
if (sidebar.includes('.filter((field) => field.id !== draggingFieldId)')) failures.push('DesignerSidebar.tsx: dragging field source Button must stay mounted so native drag is not canceled');
if (!sidebar.includes('const isDragging = field.id === draggingFieldId')) failures.push('DesignerSidebar.tsx: dragging field card must be detected without removing it from the list');
if (!sidebar.includes("opacity: isDragging ? 0 : 1")) failures.push('DesignerSidebar.tsx: dragging source Button must remain as an invisible in-place placeholder');
if (!sidebar.includes("pointerEvents: isDragging ? 'none' : 'auto'")) failures.push('DesignerSidebar.tsx: dragging source Button placeholder must not intercept pointer events');
if (!sidebar.includes('handleFieldPointerDown')) failures.push('DesignerSidebar.tsx: field cards must support pointer-based manual drag fallback');
if (!sidebar.includes('data-canvas-field-drag-preview="true"')) failures.push('DesignerSidebar.tsx: pointer drag preview must render the full field Button');
if (!sidebar.includes('ownerDocument.elementFromPoint')) failures.push('DesignerSidebar.tsx: pointer drag must resolve the drop cell under the cursor');
if (!sidebar.includes('findFieldDropCellAtPoint')) failures.push('DesignerSidebar.tsx: pointer drag must find a cell by coordinates when an existing component covers the cell');
if (!sidebar.includes('FIELD_POINTER_HOVER_EVENT')) failures.push('DesignerSidebar.tsx: pointer drag must dispatch hover updates for the canvas drop guide');
if (!sidebar.includes('FIELD_POINTER_DROP_EVENT')) failures.push('DesignerSidebar.tsx: pointer drag must dispatch a canvas drop event');
if (!sidebar.includes('setDraggingFieldId(fieldId)')) failures.push('DesignerSidebar.tsx: drag start must mark the active field');
if (!sidebar.includes('handleFieldDragEnd')) failures.push('DesignerSidebar.tsx: drag end must use a shared cleanup handler');
if (!sidebar.includes('setDraggingFieldId(null)')) failures.push('DesignerSidebar.tsx: canceled drags must restore the field list');
if (!sidebar.includes("event.dataTransfer.setData('application/x-template-designer-field', fieldId)")) failures.push('DesignerSidebar.tsx: dragged field cards must carry the field id');
if (!sidebar.includes('event.currentTarget.cloneNode(true)')) failures.push('DesignerSidebar.tsx: drag preview must clone only the current field card');
if (!sidebar.includes('dragPreviewRef')) failures.push('DesignerSidebar.tsx: drag preview element must stay mounted until drag end');
if (!sidebar.includes('cleanupDragPreview')) failures.push('DesignerSidebar.tsx: drag preview element must be removed during drag cleanup');
if (!sidebar.includes('dragOffsetX') || !sidebar.includes('dragOffsetY')) failures.push('DesignerSidebar.tsx: drag preview must keep the cursor grab point inside the Button');
if (!sidebar.includes('event.dataTransfer.setDragImage(dragPreview, dragOffsetX, dragOffsetY)')) failures.push('DesignerSidebar.tsx: drag preview must use the full field Button at the cursor position');
if (!sidebar.includes("dragPreview.style.backgroundColor = '#fff'") || !sidebar.includes('dragPreview.style.boxShadow')) failures.push('DesignerSidebar.tsx: drag preview must look like the whole floating field Button');
if (!sidebar.includes("field.type !== 'subTable'")) failures.push('DesignerSidebar.tsx: normal field mapping list must exclude sub-table fields');
if (!sidebar.includes('selectedSubTableField')) failures.push('DesignerSidebar.tsx: field management must detect the currently selected sub-table node');
if (!sidebar.includes('state.getSubTableFieldForSelectedRange()')) failures.push('DesignerSidebar.tsx: field management must use the selected sub-table cell range as its sub-table context');
if (sidebar.includes('state.getSelectedNode()') || sidebar.includes("selectedNode?.type === 'sub-table'")) failures.push('DesignerSidebar.tsx: sub-table field management must not require selecting the whole sub-table frame');
if (!sidebar.includes('typeConfig.columns')) failures.push('DesignerSidebar.tsx: selected sub-table field management must render the sub-table columns');
if (!sidebar.includes('displayFields')) failures.push('DesignerSidebar.tsx: field management must switch between main-table and selected sub-table fields');
if (!sidebar.includes('data-canvas-sub-table-field-card') || !sidebar.includes('isSubTableFieldList ? \'true\' : undefined')) failures.push('DesignerSidebar.tsx: sub-table field management must expose sub-table column cards');
if (!sidebar.includes('subTableFieldIdsUsedOnCanvas')) failures.push('DesignerSidebar.tsx: sub-table field management must consume sub-table fields already placed on the canvas');
if (!sidebar.includes('data-canvas-field-sub-table-id')) failures.push('DesignerSidebar.tsx: sub-table field cards must carry the parent sub-table id');
if (!sidebar.includes("event.dataTransfer.setData('application/x-template-designer-sub-table-field'")) failures.push('DesignerSidebar.tsx: sub-table field cards must carry scoped drag data');
if (sidebar.includes('draggable={!isSubTableFieldList}')) failures.push('DesignerSidebar.tsx: sub-table field cards must remain draggable');
if (sidebar.includes("cursor: isSubTableFieldList ? 'default' : 'grab'")) failures.push('DesignerSidebar.tsx: sub-table field cards must keep the drag cursor');
if (sidebar.includes('onClick={() => addNodeFromField(field.id)}')) failures.push('DesignerSidebar.tsx: field cards must be consumed by dropping onto a cell, not by clicking the sidebar');
if (!sidebar.includes("sx={{ p: 1.5, overflow: 'auto', height: '100%' }}")) failures.push('DesignerSidebar.tsx: field management panel must let the empty state fill the sidebar height');
if (!sidebar.includes('data-canvas-field-empty-state="true"')) failures.push('DesignerSidebar.tsx: empty field state must expose a stable marker');
if (!sidebar.includes("flex: 1") || !sidebar.includes("justifyContent=\"center\"") || !sidebar.includes("alignItems=\"center\"")) failures.push('DesignerSidebar.tsx: empty field state must be centered in the available panel area');
if (!sidebar.includes('暂无可添加字段</Typography>')) failures.push('DesignerSidebar.tsx: empty field state text must read 暂无可添加字段 without punctuation');
if (sidebar.includes('基础字段') || sidebar.includes('字段映射') || sidebar.includes('布局组件') || sidebar.includes('插入目标')) failures.push('DesignerSidebar.tsx: field management panel must render only the field list without extra titles');
if (!sidebar.includes('FieldTypeIcon')) failures.push('DesignerSidebar.tsx: field mapping list must show field type icons');
if (!inspector.includes('页面属性')) failures.push('DesignerInspector.tsx: missing page inspector fallback');
if (!inspector.includes('基础信息')) failures.push('DesignerInspector.tsx: field configuration must include 基础信息 section');
if (!inspector.includes('填写限制')) failures.push('DesignerInspector.tsx: field configuration must include 填写限制 section');
if (!inspector.includes('验证规则')) failures.push('DesignerInspector.tsx: field configuration must include 验证规则 section');
if (!inspector.includes('查看效果')) failures.push('DesignerInspector.tsx: field configuration must include 查看效果 section');
if (!inspector.includes('handleFillLimitChange')) failures.push('DesignerInspector.tsx: fill limits must be updated through a mutual-exclusion handler');
if (!inspector.includes('maskMode') || !inspector.includes('maskDigits')) failures.push('DesignerInspector.tsx: mask display mode must expose mask direction and digit count config');
if (!inspector.includes('linkTarget')) failures.push('DesignerInspector.tsx: hyperlink display mode must expose link target config');
if (displayModeOptionsBlock.includes('自动换行') || displayModeOptionsBlock.includes("value: 'wrap'")) failures.push('DesignerInspector.tsx: 自动换行 must be an independent option instead of a display mode value');
if (!inspector.includes('label="自动换行"') || !inspector.includes('checked={Boolean(bindings.autoWrap)}') || !inspector.includes('updateBinding({ autoWrap: checked })')) failures.push('DesignerInspector.tsx: 查看效果 must expose 自动换行 as an independent checkbox');
if (!inspector.includes('CompactTextareaField')) failures.push('DesignerInspector.tsx: long text config fields must use the compact auto-height textarea editor');
if (!inspector.includes('maxHeight: 80')) failures.push('DesignerInspector.tsx: auto-height textarea editor must cap its height at 80px');
if (!inspector.includes('maxHeight: 72')) failures.push('DesignerInspector.tsx: textarea content area must stay inside the 80px input frame');
if (!inspector.includes('verticalRowSx')) failures.push('DesignerInspector.tsx: text configuration rows must support a vertical label/control layout');
if (!inspector.includes("layout=\"vertical\"")) failures.push('DesignerInspector.tsx: text-heavy basic information fields must render label above the input');
if (!inspector.includes("overflow: 'visible'")) failures.push('DesignerInspector.tsx: textarea outer input root must keep the focused outline visible');
if (!inspector.includes("boxSizing: 'border-box'")) failures.push('DesignerInspector.tsx: textarea content area must keep long text inside the input frame');
if (!inspector.includes("scrollbarGutter: 'stable'")) failures.push('DesignerInspector.tsx: textarea content area must reserve space for its internal scrollbar');
if (!inspector.includes("overflowY: 'auto'")) failures.push('DesignerInspector.tsx: textarea content must keep only the internal overflow scrollbar');
if (!inspector.includes("overflowX: 'hidden'")) failures.push('DesignerInspector.tsx: field configuration panel must avoid horizontal overflow scrollbars');
if (!inspector.includes("userSelect: 'none'")) failures.push('DesignerInspector.tsx: field configuration panel must prevent accidental bulk text selection');
if (!inspector.includes("userSelect: 'text'")) failures.push('DesignerInspector.tsx: field configuration inputs must still allow text selection while editing');
if (!inspector.includes('state.getFieldById') || !inspector.includes('selectedNode.bindings?.fieldId')) failures.push('DesignerInspector.tsx: field configuration must resolve the bound model field from the selected node fieldId');
if (!inspector.includes('boundField?.type')) failures.push('DesignerInspector.tsx: field configuration must branch by the bound field type');
if (!inspector.includes("import FieldTypeIcon from './FieldTypeIcon'")) failures.push('DesignerInspector.tsx: field configuration must use the standard field type icon component');
if (!inspector.includes("import { getFieldTypeDefinition } from '../registry/fieldRegistry'")) failures.push('DesignerInspector.tsx: field configuration must resolve field type labels from the registry');
if (!inspector.includes("import DeleteIcon from '@mui/icons-material/Delete'")) failures.push('DesignerInspector.tsx: field configuration must use a red trash icon for delete');
if (!inspector.includes('data-field-config-delete-action="true"')) failures.push('DesignerInspector.tsx: field and group configuration must expose a stable delete action');
if (!inspector.includes('handleDeleteConfigTarget')) failures.push('DesignerInspector.tsx: field and group configuration must use a unified delete handler');
if (!inspector.includes('data-field-config-section-title-row="true"')) failures.push('DesignerInspector.tsx: field delete icon must align with the section title row');
if (!inspector.includes('action={renderDeleteConfigAction()}')) failures.push('DesignerInspector.tsx: delete icon must be rendered as the first configuration section action');
const fieldConfigDeleteActionBlock = inspector.match(/data-field-config-delete-action="true"[\s\S]*?<\/IconButton>/)?.[0] ?? '';
if (fieldConfigDeleteActionBlock.includes("position: 'absolute'")) failures.push('DesignerInspector.tsx: field delete icon must not use absolute positioning inside the panel');
if (!fieldConfigDeleteActionBlock.includes('width: 22') || !fieldConfigDeleteActionBlock.includes('height: 22') || !fieldConfigDeleteActionBlock.includes('fontSize: 16')) failures.push('DesignerInspector.tsx: field delete icon must use the compact 22px/16px sizing');
if (!inspector.includes('removeNode(selectedNode.id)')) failures.push('DesignerInspector.tsx: field configuration delete action must remove the selected canvas node');
if (!inspector.includes('delete nextRecordTemplate.groupRange')) failures.push('DesignerInspector.tsx: group configuration delete action must clear only the current sub-table group');
if (!inspector.includes('data-field-identity-summary="true"')) failures.push('DesignerInspector.tsx: basic information must show the current field identity summary');
if (!inspector.includes('data-field-identity-name="true"')) failures.push('DesignerInspector.tsx: field identity summary must show the current field name');
if (!inspector.includes('data-field-identity-type="true"')) failures.push('DesignerInspector.tsx: field identity summary must show the current field type');
if (!inspector.includes('<FieldTypeIcon')) failures.push('DesignerInspector.tsx: field identity summary must render the field type icon');
if ((inspector.match(/renderFieldIdentitySummary\(\)/g) ?? []).length < 10) failures.push('DesignerInspector.tsx: every field basic information section must include the current field identity summary');
const numberConfigBlock = inspector.match(/const renderNumberSections = \(\) => \{[\s\S]*?const renderDateTimeSections/)?.[0] ?? '';
assertIncludes(numberConfigBlock, [
  '整数/小数',
  'numberKind === \'decimal\'',
  '最小值 / 最大值',
  '公式自动赋值',
  '公式配置',
  '正负规则',
  '区间校验',
], 'DesignerInspector.tsx: number field configuration');
if (!inspector.includes("const NUMBER_DISPLAY_MODE_OPTIONS") || !inspector.includes("label: '百分比'")) failures.push('DesignerInspector.tsx: number display mode options must include 百分比');
if (numberConfigBlock.includes('label="千分位"')) failures.push('DesignerInspector.tsx: number basic information must not expose the 千分位 checkbox');
if (numberConfigBlock.includes('renderConditionLimit')) failures.push('DesignerInspector.tsx: number fill limits must not expose 条件配置');
if (numberConfigBlock.includes('crossFieldCompare') || numberConfigBlock.includes('跨字段对比')) failures.push('DesignerInspector.tsx: number validation must not expose 跨字段对比');
if (numberConfigBlock.includes('uniqueValidation') || numberConfigBlock.includes('唯一校验')) failures.push('DesignerInspector.tsx: number validation must not expose 唯一校验');
if (numberConfigBlock.includes('errorMessage') || numberConfigBlock.includes('错误提示')) failures.push('DesignerInspector.tsx: number validation must not expose 错误提示');
if (numberConfigBlock.includes('viewPrecision') || numberConfigBlock.includes('查看小数位数')) failures.push('DesignerInspector.tsx: number display must not expose 查看小数位数');
if (numberConfigBlock.includes('thresholdColor') || numberConfigBlock.includes('数值阈值标色')) failures.push('DesignerInspector.tsx: number display must not expose 数值阈值标色');
if (numberConfigBlock.includes('longNumberDisplay') || numberConfigBlock.includes('超长数值')) failures.push('DesignerInspector.tsx: number display must not expose 超长数值 options');
if (numberConfigBlock.includes('emptyText') || numberConfigBlock.includes('空值文案')) failures.push('DesignerInspector.tsx: number display must not expose 空值文案');
const numberMinMaxRowBlock = numberConfigBlock.match(/label="最小值 \/ 最大值"[\s\S]*?<\/Stack>/)?.[0] ?? '';
if (numberMinMaxRowBlock.indexOf('widgetConfig.minValue') < 0 || numberMinMaxRowBlock.indexOf('widgetConfig.maxValue') < 0 || numberMinMaxRowBlock.indexOf('widgetConfig.minValue') > numberMinMaxRowBlock.indexOf('widgetConfig.maxValue')) failures.push('DesignerInspector.tsx: number min/max row must render minValue on the left and maxValue on the right');
const datetimeConfigBlock = inspector.match(/const renderDateTimeSections = \(\) => \([\s\S]*?const renderSignatureSections/)?.[0] ?? '';
assertIncludes(datetimeConfigBlock, [
  '日期类型',
  '时间先后校验',
  '日期格式',
  '过期置灰',
], 'DesignerInspector.tsx: datetime field configuration');
if (!inspector.includes('DATE_DEFAULT_VALUE_OPTIONS') || !inspector.includes("label: '当前时间'")) failures.push('DesignerInspector.tsx: datetime default value options must include 当前时间');
const datetimeDateFormatRowBlock = datetimeConfigBlock.match(/label="日期格式"[\s\S]*?<CompactSelect/)?.[0] ?? '';
if (!datetimeDateFormatRowBlock.includes('layout="vertical"')) failures.push('DesignerInspector.tsx: datetime date format row must use vertical label/control layout');
if (datetimeConfigBlock.includes('timeRangeLimit') || datetimeConfigBlock.includes('时间范围限制')) failures.push('DesignerInspector.tsx: datetime basic information must not expose 时间范围限制');
if (datetimeConfigBlock.includes('label="前缀"') || datetimeConfigBlock.includes('label="后缀"')) failures.push('DesignerInspector.tsx: datetime basic information must not expose prefix or suffix rows');
if (datetimeConfigBlock.includes('renderConditionLimit')) failures.push('DesignerInspector.tsx: datetime fill limits must not expose 条件配置');
if (datetimeConfigBlock.includes('customMessage') || datetimeConfigBlock.includes('自定义提示')) failures.push('DesignerInspector.tsx: datetime validation must not expose 自定义提示');
if (datetimeConfigBlock.includes('emptyText') || datetimeConfigBlock.includes('空值文案')) failures.push('DesignerInspector.tsx: datetime display must not expose 空值文案');
if (datetimeConfigBlock.includes('copyable') || datetimeConfigBlock.includes('label="复制"')) failures.push('DesignerInspector.tsx: datetime display must not expose 复制');
if (datetimeConfigBlock.includes('longDateHoverPreview') || datetimeConfigBlock.includes('超长时间 hover 预览')) failures.push('DesignerInspector.tsx: datetime display must not expose 超长时间 hover 预览');
const signatureConfigBlock = inspector.match(/const renderSignatureSections = \(\) => \([\s\S]*?const renderAttachmentSections/)?.[0] ?? '';
const signatureDisplayOptionsBlock = inspector.match(/const SIGNATURE_DISPLAY_OPTIONS = \[[\s\S]*?\];/)?.[0] ?? '';
const attachmentDisplayOptionsBlock = inspector.match(/const ATTACHMENT_DISPLAY_OPTIONS = \[[\s\S]*?\];/)?.[0] ?? '';
assertIncludes(signatureConfigBlock, [
  '允许删除签名',
  'currentUserValidation',
  '只允许当前登录人签名',
  "signatureDisplayMode, 'signatureOnly'",
  '展示方式',
], 'DesignerInspector.tsx: signature field configuration');
assertIncludes(signatureDisplayOptionsBlock, [
  '仅签名',
  '签名 + 日期',
  '签名 + 日期时间',
], 'DesignerInspector.tsx: signature display options');
if (signatureConfigBlock.includes('defaultValue') || signatureConfigBlock.includes('默认值')) failures.push('DesignerInspector.tsx: signature basic information must not expose 默认值');
if (signatureConfigBlock.includes('strokeWidth') || signatureConfigBlock.includes('线条粗细')) failures.push('DesignerInspector.tsx: signature basic information must not expose 线条粗细');
if (signatureConfigBlock.includes('strokeColor') || signatureConfigBlock.includes('线条颜色')) failures.push('DesignerInspector.tsx: signature basic information must not expose 线条颜色');
if (signatureConfigBlock.includes('renderConditionLimit')) failures.push('DesignerInspector.tsx: signature fill limits must not expose 条件配置');
if (signatureConfigBlock.includes('nonEmptyValidation') || signatureConfigBlock.includes('非空校验')) failures.push('DesignerInspector.tsx: signature validation must not expose 非空校验');
if (signatureConfigBlock.includes('emptyText') || signatureConfigBlock.includes('空值文案')) failures.push('DesignerInspector.tsx: signature display must not expose 空值文案');
if (signatureConfigBlock.includes('downloadable') || signatureConfigBlock.includes('label="下载"')) failures.push('DesignerInspector.tsx: signature display must not expose 下载');
if (signatureConfigBlock.includes('imageOverflowPopover') || signatureConfigBlock.includes('图片超出单元格 hover')) failures.push('DesignerInspector.tsx: signature display must not expose image overflow hover preview');
if (signatureDisplayOptionsBlock.includes('缩略图') || signatureDisplayOptionsBlock.includes('完整图')) failures.push('DesignerInspector.tsx: signature display options must not use thumbnail/full image wording');
const attachmentConfigBlock = inspector.match(/const renderAttachmentSections = \(\) => \([\s\S]*?const renderImageSections/)?.[0] ?? '';
const attachmentUploadModeOptionsBlock = inspector.match(/const ATTACHMENT_UPLOAD_MODE_OPTIONS = \[[\s\S]*?\];/)?.[0] ?? '';
const attachmentFormatLimitOptionsBlock = inspector.match(/const ATTACHMENT_FORMAT_LIMIT_OPTIONS = \[[\s\S]*?\];/)?.[0] ?? '';
assertIncludes(attachmentConfigBlock, [
  '帮助提示',
  '上传策略',
  '大小限制',
  '数量限制',
  '格式限制',
], 'DesignerInspector.tsx: attachment field configuration');
assertIncludes(attachmentDisplayOptionsBlock, [
  '列表',
  '卡片',
], 'DesignerInspector.tsx: attachment display options');
assertIncludes(attachmentUploadModeOptionsBlock, [
  '单文件',
  '多文件',
], 'DesignerInspector.tsx: attachment upload mode options');
assertIncludes(attachmentFormatLimitOptionsBlock, [
  '所有格式',
  '文档格式',
], 'DesignerInspector.tsx: attachment format limit options');
const uploadModeIndex = attachmentConfigBlock.indexOf('上传策略');
const fileSizeIndex = attachmentConfigBlock.indexOf('大小限制');
if (uploadModeIndex === -1 || fileSizeIndex === -1 || uploadModeIndex > fileSizeIndex) failures.push('DesignerInspector.tsx: attachment basic information must list 上传策略 before 大小限制');
if (attachmentConfigBlock.includes('上传方式') || attachmentConfigBlock.includes('文件大小限制') || attachmentConfigBlock.includes('label="数量"')) failures.push('DesignerInspector.tsx: attachment basic information must use renamed labels');
if (!attachmentConfigBlock.includes('readNumber(widgetConfig.fileSize, 30)')) failures.push('DesignerInspector.tsx: attachment file size default must be 30M');
if (attachmentConfigBlock.includes('defaultValue') || attachmentConfigBlock.includes('默认值')) failures.push('DesignerInspector.tsx: attachment basic information must not expose 默认值');
if (attachmentConfigBlock.includes('提示文本')) failures.push('DesignerInspector.tsx: attachment basic information must not expose 提示文本');
if (attachmentConfigBlock.includes('fileFormat') || attachmentConfigBlock.includes('文件格式')) failures.push('DesignerInspector.tsx: attachment basic information must not expose 文件格式');
if (attachmentConfigBlock.includes('batchUpload')) failures.push('DesignerInspector.tsx: attachment basic information must not expose batchUpload');
if (attachmentConfigBlock.includes('安全限制')) failures.push('DesignerInspector.tsx: attachment basic information must not expose 安全限制');
if (attachmentConfigBlock.includes('renderConditionLimit')) failures.push('DesignerInspector.tsx: attachment fill limits must not expose 条件配置');
if (attachmentConfigBlock.includes('fileCountValidation') || attachmentConfigBlock.includes('文件数量')) failures.push('DesignerInspector.tsx: attachment validation must not expose 文件数量');
if (attachmentConfigBlock.includes('nonEmptyValidation') || attachmentConfigBlock.includes('非空校验')) failures.push('DesignerInspector.tsx: attachment validation must not expose 非空校验');
if (attachmentConfigBlock.includes('fileNameHoverPreview') || attachmentConfigBlock.includes('文件名超长省略 + hover 预览')) failures.push('DesignerInspector.tsx: attachment display must not expose 文件名超长省略 + hover 预览');
if (!attachmentConfigBlock.includes('previewable')) failures.push('DesignerInspector.tsx: attachment display must still support preview');
if (!attachmentConfigBlock.includes("attachmentFormatLimit, 'all') === 'document'")) failures.push('DesignerInspector.tsx: attachment preview must only appear when attachment format limit is 文档格式');
if (!attachmentConfigBlock.includes("readText(widgetConfig.uploadMode, 'single')")) failures.push('DesignerInspector.tsx: attachment upload mode must default to 单文件上传');
const imageConfigBlock = inspector.match(/const renderImageSections = \(\) => \([\s\S]*?const renderSingleSelectSections/)?.[0] ?? '';
const imageDisplayOptionsBlock = inspector.match(/const IMAGE_DISPLAY_OPTIONS = \[[\s\S]*?\];/)?.[0] ?? '';
const imageUploadStrategyOptionsBlock = inspector.match(/const IMAGE_UPLOAD_STRATEGY_OPTIONS = \[[\s\S]*?\];/)?.[0] ?? '';
assertIncludes(imageConfigBlock, [
  '上传策略',
  '大小限制',
  '数量限制',
  '放大预览',
], 'DesignerInspector.tsx: image field configuration');
assertIncludes(imageDisplayOptionsBlock, [
  '缩略',
  '大图',
], 'DesignerInspector.tsx: image display options');
assertIncludes(imageUploadStrategyOptionsBlock, [
  '单图片',
  '多图片',
], 'DesignerInspector.tsx: image upload strategy options');
if (imageConfigBlock.includes('defaultValue') || imageConfigBlock.includes('默认值')) failures.push('DesignerInspector.tsx: image basic information must not expose 默认值');
if (imageConfigBlock.includes('提示文本')) failures.push('DesignerInspector.tsx: image basic information must not expose 提示文本');
if (imageConfigBlock.includes('imageFormat') || imageConfigBlock.includes('图片格式')) failures.push('DesignerInspector.tsx: image basic information must not expose 图片格式');
if (imageConfigBlock.includes('watermark') || imageConfigBlock.includes('水印')) failures.push('DesignerInspector.tsx: image basic information must not expose 水印');
if (imageConfigBlock.includes('crop') || imageConfigBlock.includes('裁剪')) failures.push('DesignerInspector.tsx: image basic information must not expose 裁剪');
if (imageConfigBlock.includes('label="图片大小限制"') || imageConfigBlock.includes('label="上传数量限制"')) failures.push('DesignerInspector.tsx: image basic information must use renamed labels');
if (!imageConfigBlock.includes('readNumber(widgetConfig.imageSize, 20)')) failures.push('DesignerInspector.tsx: image size default must be 20M');
if (imageConfigBlock.includes('marker="validation"') || imageConfigBlock.includes('验证规则')) failures.push('DesignerInspector.tsx: image validation section must be removed');
if (imageConfigBlock.includes('imageCountValidation') || imageConfigBlock.includes('图片数量校验')) failures.push('DesignerInspector.tsx: image validation must not expose 图片数量校验');
if (imageConfigBlock.includes('renderConditionLimit')) failures.push('DesignerInspector.tsx: image fill limits must not expose 条件配置');
if (imageConfigBlock.includes('imageOverflowHoverPreview') || imageConfigBlock.includes('图片溢出 hover 查看原图')) failures.push('DesignerInspector.tsx: image display must not expose 图片溢出 hover 查看原图');
if (!imageConfigBlock.includes("readText(widgetConfig.imageUploadStrategy, 'single')")) failures.push('DesignerInspector.tsx: image upload strategy must default to 单图片');
const singleSelectConfigBlock = inspector.match(/const renderSingleSelectSections = \(\) => [\s\S]*?const renderReferenceSections/)?.[0] ?? '';
const referenceConfigBlock = inspector.match(/const renderReferenceSections = \(\) => \{[\s\S]*?const renderMultiSelectSections/)?.[0] ?? '';
const singleSelectShapeOptionsBlock = inspector.match(/const SINGLE_SELECT_SHAPE_OPTIONS = \[[\s\S]*?\];/)?.[0] ?? '';
const singleSelectDisplayOptionsBlock = inspector.match(/const SINGLE_SELECT_DISPLAY_OPTIONS = \[[\s\S]*?\];/)?.[0] ?? '';
const referenceDisplayOptionsBlock = inspector.match(/const REFERENCE_DISPLAY_OPTIONS = \[[\s\S]*?\];/)?.[0] ?? '';
const optionListEditorStyleBlock = inspector.match(/const optionListEditorSx = \{[\s\S]*?\};/)?.[0] ?? '';
const optionRowStyleBlock = inspector.match(/const optionRowSx = \{[\s\S]*?\};/)?.[0] ?? '';
const optionChoiceStyleBlock = inspector.match(/const optionChoiceSx = \{[\s\S]*?\};/)?.[0] ?? '';
const optionDragHandleStyleBlock = inspector.match(/const optionDragHandleSx = \{[\s\S]*?\};/)?.[0] ?? '';
const optionInputStyleBlock = inspector.match(/const optionInputSx = \{[\s\S]*?\};/)?.[0] ?? '';
assertIncludes(singleSelectConfigBlock, [
  '选项来源',
  '选项列表',
  'renderOptionListEditor',
  'data-option-list-header="true"',
  'data-option-list-add="true"',
  'data-option-row="true"',
  'onPointerDown',
  'onPointerEnter',
  'onPointerUp',
  'onMouseDown',
  'onMouseEnter',
  'onMouseMove',
  'onMouseUp',
  'data-option-row-index',
  'moveOptionRow',
  'data-option-drag-handle="true"',
  'data-option-default-action="true"',
  '设为默认值',
  '展现形态',
  '排序方式',
  '显示样式',
], 'DesignerInspector.tsx: single-select field configuration');
assertIncludes(singleSelectShapeOptionsBlock, [
  '下拉框',
  '单选框',
  '复选框',
], 'DesignerInspector.tsx: single-select shape options');
assertIncludes(singleSelectDisplayOptionsBlock, [
  '同展现形态',
  '纯文本',
], 'DesignerInspector.tsx: single-select display options');
if (singleSelectConfigBlock.includes('FieldConfigRow label="默认值"')) failures.push('DesignerInspector.tsx: single-select basic information must not expose a standalone 默认值 row');
if (singleSelectShapeOptionsBlock.includes('平铺按钮')) failures.push('DesignerInspector.tsx: single-select shape options must not expose 平铺按钮');
const singleSelectShapeIndex = singleSelectConfigBlock.indexOf('label="展现形态"');
const singleSelectSourceIndex = singleSelectConfigBlock.indexOf('label="选项来源"');
if (singleSelectShapeIndex < 0 || singleSelectSourceIndex < 0 || singleSelectShapeIndex > singleSelectSourceIndex) failures.push('DesignerInspector.tsx: single-select 展现形态 must appear above 选项来源');
if (!singleSelectConfigBlock.includes("readText(widgetConfig.optionSource, 'manual') === 'manual'")) failures.push('DesignerInspector.tsx: single-select option list must only show for 手动输入 source');
if (!singleSelectConfigBlock.includes("['radio', 'checkbox'].includes(singleSelectOptionShape)")) failures.push('DesignerInspector.tsx: single-select 排序方式 must only show for 单选框 or 复选框');
if (!singleSelectConfigBlock.includes("readText(widgetConfig.optionLayout, 'horizontal')")) failures.push('DesignerInspector.tsx: single-select 排序方式 must default to 横向');
if (singleSelectConfigBlock.includes('optionListToolbarSx')) failures.push('DesignerInspector.tsx: single-select option add action must align with the 选项列表 header instead of using an internal toolbar row');
if (!singleSelectConfigBlock.includes('updateBinding({ defaultValue: optionLabel })')) failures.push('DesignerInspector.tsx: single-select option row must be able to set the selected option as default');
if (!inspector.includes('&:hover [data-option-drag-handle="true"]')) failures.push('DesignerInspector.tsx: single-select option drag handle must appear on row hover');
if (optionListEditorStyleBlock.includes('border:')) failures.push('DesignerInspector.tsx: single-select option list editor must not render an outer framed container');
if (!singleSelectConfigBlock.includes('data-option-choice="true"')) failures.push('DesignerInspector.tsx: single-select option rows must render each option as a gray choice block');
if (!optionChoiceStyleBlock.includes("bgcolor: '#f7f8fa'")) failures.push('DesignerInspector.tsx: single-select option choice block must use a gray background');
if (!optionRowStyleBlock.includes("gridTemplateColumns: 'minmax(0, 1fr) 18px'")) failures.push('DesignerInspector.tsx: single-select option rows must align the gray choice block with the option-list label');
if (!optionChoiceStyleBlock.includes("gridTemplateColumns: '12px minmax(0, 1fr) 10px'")) failures.push('DesignerInspector.tsx: single-select option choice block must keep drag and default markers inside the gray background');
if (!optionDragHandleStyleBlock.includes('fontSize: 14')) failures.push('DesignerInspector.tsx: single-select option drag handle must use smaller compact sizing');
if (inspector.includes('BoltOutlined')) failures.push('DesignerInspector.tsx: single-select default option action must not use a lightning icon');
if (!singleSelectConfigBlock.includes('data-option-default-dot="true"')) failures.push('DesignerInspector.tsx: single-select default option action must be a compact dot button');
if (!inspector.includes('optionDefaultDotSx')) failures.push('DesignerInspector.tsx: single-select default option dot must use a dedicated compact style');
if (!inspector.includes('data-option-default-active-marker="true"')) failures.push('DesignerInspector.tsx: single-select selected default option must keep a compact blue active marker');
if (singleSelectConfigBlock.includes('renderConditionLimit')) failures.push('DesignerInspector.tsx: single-select fill limits must not expose 条件配置');
if (singleSelectConfigBlock.includes('selectedAssign') || singleSelectConfigBlock.includes('选中赋值')) failures.push('DesignerInspector.tsx: single-select fill limits must not expose 选中赋值');
if (singleSelectConfigBlock.includes('marker="validation"') || singleSelectConfigBlock.includes('验证规则')) failures.push('DesignerInspector.tsx: single-select validation section must be removed');
if (singleSelectConfigBlock.includes('optionValueValidation') || singleSelectConfigBlock.includes('可选值校验')) failures.push('DesignerInspector.tsx: single-select validation must not expose 可选值校验');
if (singleSelectConfigBlock.includes('customMessage') || singleSelectConfigBlock.includes('自定义提示')) failures.push('DesignerInspector.tsx: single-select validation must not expose 自定义提示');
if (singleSelectConfigBlock.includes('文本/标签样式')) failures.push('DesignerInspector.tsx: single-select display must rename 文本/标签样式 to 显示样式');
if (singleSelectConfigBlock.includes('emptyText') || singleSelectConfigBlock.includes('空值文案')) failures.push('DesignerInspector.tsx: single-select display must not expose 空值文案');
if (singleSelectConfigBlock.includes('copyable') || singleSelectConfigBlock.includes('label="复制"')) failures.push('DesignerInspector.tsx: single-select display must not expose 复制');
if (singleSelectConfigBlock.includes('optionColor') || singleSelectConfigBlock.includes('选项颜色')) failures.push('DesignerInspector.tsx: single-select display must not expose 选项颜色');
if (singleSelectConfigBlock.includes('longLabelHoverPreview') || singleSelectConfigBlock.includes('长标签 hover 预览')) failures.push('DesignerInspector.tsx: single-select display must not expose 长标签 hover 预览');
if (singleSelectDisplayOptionsBlock.includes('文本/标签样式')) failures.push('DesignerInspector.tsx: single-select display options must not expose 文本/标签样式');
assertIncludes(referenceConfigBlock, [
  '需要引用的功能数据',
  'referenceSourceType',
  'referenceField',
  '选择引用字段',
  '查询条件',
  '查找条件',
  'referenceQueryConditions',
  '引用表中的字段',
  '当前表中的字段',
  'REFERENCE_QUERY_OPERATOR_OPTIONS',
  '显示样式',
], 'DesignerInspector.tsx: reference field configuration');
assertIncludes(referenceDisplayOptionsBlock, [
  '链接文本',
  '纯文本',
], 'DesignerInspector.tsx: reference display options');
if (referenceConfigBlock.includes('label="展现形态"')) failures.push('DesignerInspector.tsx: reference basic information must not expose 展现形态');
if (referenceConfigBlock.includes('label="选项来源"')) failures.push('DesignerInspector.tsx: reference basic information must not expose 选项来源');
if (referenceConfigBlock.includes('选项列表') || referenceConfigBlock.includes('renderOptionListEditor')) failures.push('DesignerInspector.tsx: reference basic information must not expose option-list editing');
if (!inspector.includes('SelectProps={{ displayEmpty: true }}')) failures.push('DesignerInspector.tsx: compact selects must display empty reference/query placeholders');
if (!referenceFieldTypeConfigBlock.includes('需要引用的功能数据')) failures.push('fieldRegistry.ts: reference field type config must use 需要引用的功能数据 wording');
if (
  referenceFieldTypeConfigBlock.includes("key: 'multiple'")
  || referenceFieldTypeConfigBlock.includes("key: 'displayFields'")
  || referenceFieldTypeConfigBlock.includes("key: 'valueFields'")
  || fieldRegistry.includes('multiple: false')
  || fieldRegistry.includes('displayFields')
  || fieldRegistry.includes('valueFields')
) {
  failures.push('fieldRegistry.ts: reference field type config must remove old multiple/display/value fields');
}
const multiSelectConfigBlock = inspector.match(/const renderMultiSelectSections = \(\) => [\s\S]*?const renderSubTableRegionSections/)?.[0] ?? '';
assertIncludes(multiSelectConfigBlock, [
  '选项来源',
  '选项列表',
  '展现形态',
  '排序方式',
  'renderOptionListEditor',
  'data-option-default-dot="true"',
  'toggleMultiSelectDefaultOption',
  '选择数量校验',
  '最小选择数 / 最大选择数',
  '显示样式',
], 'DesignerInspector.tsx: multi-select field configuration');
if (multiSelectConfigBlock.includes('FieldConfigRow label="默认值"')) failures.push('DesignerInspector.tsx: multi-select basic information must not expose a standalone 默认值 row');
const multiSelectShapeIndex = multiSelectConfigBlock.indexOf('label="展现形态"');
const multiSelectSourceIndex = multiSelectConfigBlock.indexOf('label="选项来源"');
if (multiSelectShapeIndex < 0 || multiSelectSourceIndex < 0 || multiSelectShapeIndex > multiSelectSourceIndex) failures.push('DesignerInspector.tsx: multi-select 展现形态 must appear above 选项来源');
if (!multiSelectConfigBlock.includes("readText(widgetConfig.optionSource, 'manual') === 'manual'")) failures.push('DesignerInspector.tsx: multi-select option list must only show for 手动输入 source');
if (!multiSelectConfigBlock.includes("['radio', 'checkbox'].includes(multiSelectOptionShape)")) failures.push('DesignerInspector.tsx: multi-select 排序方式 must only show for 单选框 or 复选框');
if (!multiSelectConfigBlock.includes("readText(widgetConfig.optionLayout, 'horizontal')")) failures.push('DesignerInspector.tsx: multi-select 排序方式 must default to 横向');
if (!multiSelectConfigBlock.includes('Boolean(widgetConfig.selectCountValidation) ? (')) failures.push('DesignerInspector.tsx: multi-select min/max count controls must only show after enabling 选择数量校验');
if (!multiSelectConfigBlock.includes('minSelectCount: 2')) failures.push('DesignerInspector.tsx: multi-select count validation must initialize 最小选择数 to 2 when enabled');
if (!multiSelectConfigBlock.includes('maxSelectCount: optionRows.length')) failures.push('DesignerInspector.tsx: multi-select count validation must initialize 最大选择数 to the option count when enabled');
if (!multiSelectConfigBlock.includes('readNumber(widgetConfig.minSelectCount, 2)')) failures.push('DesignerInspector.tsx: multi-select min select count display default must be 2');
if (!multiSelectConfigBlock.includes('readNumber(widgetConfig.maxSelectCount, optionRows.length)')) failures.push('DesignerInspector.tsx: multi-select max select count display default must be the option count');
if (multiSelectConfigBlock.includes('renderConditionLimit')) failures.push('DesignerInspector.tsx: multi-select fill limits must not expose 条件配置');
if (multiSelectConfigBlock.includes('mutuallyExclusiveValidation') || multiSelectConfigBlock.includes('互斥校验')) failures.push('DesignerInspector.tsx: multi-select validation must not expose 互斥校验');
if (multiSelectConfigBlock.includes('最大/最小选择数')) failures.push('DesignerInspector.tsx: multi-select basic information must not expose 最大/最小选择数');
if (multiSelectConfigBlock.includes('FieldConfigRow label="形态"') || multiSelectConfigBlock.includes('FieldConfigRow label="排列"')) failures.push('DesignerInspector.tsx: multi-select must use 展现形态 and 排序方式 labels like single-select');
if (multiSelectConfigBlock.includes('逗号文本/标签')) failures.push('DesignerInspector.tsx: multi-select display must not expose 逗号文本/标签 wording');
if (multiSelectConfigBlock.includes('emptyText') || multiSelectConfigBlock.includes('空值文案')) failures.push('DesignerInspector.tsx: multi-select display must not expose 空值文案');
if (multiSelectConfigBlock.includes('tagColor') || multiSelectConfigBlock.includes('标签颜色')) failures.push('DesignerInspector.tsx: multi-select display must not expose 标签颜色');
if (multiSelectConfigBlock.includes('longLabelHoverPreview') || multiSelectConfigBlock.includes('超长标签 hover 预览')) failures.push('DesignerInspector.tsx: multi-select display must not expose 超长标签 hover 预览');
if (!inspector.includes('function readMultiDefaultValues')) failures.push('DesignerInspector.tsx: multi-select default values must be read as a reusable array');
if (!multiSelectConfigBlock.includes('defaultValues.includes(optionLabel)')) failures.push('DesignerInspector.tsx: multi-select option default dot must support selecting multiple options');
if (multiSelectConfigBlock.includes('updateBinding({ defaultValue: optionLabel })')) failures.push('DesignerInspector.tsx: multi-select default option action must not replace all defaults like single-select');
assertIncludes(inspector.match(/const MULTI_SELECT_DISPLAY_OPTIONS = \[[\s\S]*?\];/)?.[0] ?? '', [
  '同展现形态',
  '文本选项 + 逗号分割',
], 'DesignerInspector.tsx: multi-select display options');
if (!renderer.includes('children?.map')) failures.push('CanvasNodeRenderer.tsx: missing recursive children render');
if (!renderer.includes('CanvasDropZone')) failures.push('CanvasNodeRenderer.tsx: missing child insert zone');
if (!renderer.includes('data-canvas-absolute-node-layer="true"')) failures.push('CanvasNodeRenderer.tsx: absolute field components must render in an overlay layer');
if (!renderer.includes('renderMode="cell"')) failures.push('CanvasNodeRenderer.tsx: cell-target field nodes must render only the field component');
if (!renderer.includes('const CELL_FIELD_INSET = 3')) failures.push('CanvasNodeRenderer.tsx: cell-target field nodes must leave the cell border lines visible');
if (!renderer.includes("node.type === 'sub-table' ? 0 : CELL_FIELD_INSET")) failures.push('CanvasNodeRenderer.tsx: sub-table frames must align to their selected cell range without field inset');
if (!renderer.includes("node.type === 'sub-table' ? 'visible' : 'hidden'")) failures.push('CanvasNodeRenderer.tsx: sub-table right-side identifier must be allowed to render outside the selected range');
if (!renderer.includes("pointerEvents: node.type === 'sub-table' ? 'none' : 'auto'")) failures.push('CanvasNodeRenderer.tsx: sub-table absolute wrapper must let individual sheet cells receive pointer clicks');
if (!renderer.includes('left: absoluteLeft + cellInset')) failures.push('CanvasNodeRenderer.tsx: cell-target field nodes must inset from the left cell border');
if (!renderer.includes('top: absoluteTop + cellInset')) failures.push('CanvasNodeRenderer.tsx: cell-target field nodes must inset from the top cell border');
if (!renderer.includes('width: Math.max(0, absoluteWidth - cellInset * 2)')) failures.push('CanvasNodeRenderer.tsx: cell-target field nodes must not cover horizontal cell borders');
if (!renderer.includes('height: Math.max(0, absoluteHeight - cellInset * 2)')) failures.push('CanvasNodeRenderer.tsx: cell-target field nodes must not cover vertical cell borders');
if (!renderer.includes('readNodeCellRange')) failures.push('CanvasNodeRenderer.tsx: absolute field components must read their stored cell range');
if (!renderer.includes('resolveCellRangeLayout')) failures.push('CanvasNodeRenderer.tsx: cell-target field nodes must resolve current cell layout after row or column resize');
if (renderer.includes('Math.max(cellRangeLayout.width, persistedWidth)') || renderer.includes('Math.max(cellRangeLayout.height, persistedHeight)')) failures.push('CanvasNodeRenderer.tsx: cell-target field nodes must stay inside the current cell range instead of expanding over neighboring cells');
if (!renderer.includes('const absoluteWidth = cellRangeLayout ? cellRangeLayout.width : persistedWidth') || !renderer.includes('const absoluteHeight = cellRangeLayout ? cellRangeLayout.height : persistedHeight')) failures.push('CanvasNodeRenderer.tsx: cell-target field nodes must render from the current cell range size when a cell range is available');
if (!canvasWorkspace.includes('resolveCellRangeLayout={getFieldDropCellLayout}')) failures.push('CanvasSheetWorkspace.tsx: canvas field nodes must receive current row and column layout');
if (!renderer.includes('setSelectedRange')) failures.push('CanvasNodeRenderer.tsx: clicking an absolute field component must update the selected cell range');
if (!renderer.includes('setSelectedRange(cellRange, { row: cellRange.t, col: cellRange.l })')) failures.push('CanvasNodeRenderer.tsx: clicking a cell-target field component must select its target cell');
if (!renderer.includes('setActiveCanvasRail')) failures.push('CanvasNodeRenderer.tsx: clicking a cell-target field component must be able to switch the side rail');
if (!renderer.includes("setActiveCanvasRail('config')")) failures.push('CanvasNodeRenderer.tsx: clicking a cell-target field component must open field configuration');
if (!renderer.includes("node.type === 'sub-table' ? 'fields' : 'config'")) failures.push('CanvasNodeRenderer.tsx: clicking a sub-table frame must focus field management');
if (!renderer.includes('handleOpenConfig') || !renderer.includes('onOpenConfig={handleOpenConfig}')) failures.push('CanvasNodeRenderer.tsx: sub-table right-side identifier must be able to open field configuration directly');
if (!storeFile.includes('findFirstCellFieldNodeInRange(currentPage.nodes, normalizedSelection)')) failures.push('useTemplateDesignerStore.ts: selecting a cell range must inspect the selected field component type');
if (!storeFile.includes('? rangesEqual(cellRange, normalizedTarget)')) failures.push('useTemplateDesignerStore.ts: selecting a sub-table cell must not select the whole sub-table frame unless the ranges match exactly');
if (!storeFile.includes('findSubTableNodeInRange')) failures.push('useTemplateDesignerStore.ts: selected sub-table cell context must be resolved separately from selected field nodes');
if (!storeFile.includes('getSubTableFieldForSelectedRange')) failures.push('useTemplateDesignerStore.ts: store must expose the sub-table field for the selected cell range');
if (!storeFile.includes('activeCanvasRail: resolveSelectedCellRail(selectedFieldNode, selectedRange)')) failures.push('useTemplateDesignerStore.ts: selecting a field-bearing cell must switch side rail without a config-to-fields flicker');
if (!storeFile.includes('selectedNodeId: selectedFieldNodeId')) failures.push('useTemplateDesignerStore.ts: selecting a field-bearing cell edge must select the bound field node');
if (!canvasTypes.includes('onCellMouseDown?:')) failures.push('canvas.ts: cell-only designer renderers must expose a mouse-down bridge for range selection');
if (!canvasTypes.includes('onCellContextMenu?:')) failures.push('canvas.ts: cell-only designer renderers must expose a context-menu bridge for cell menus');
if (!canvasTypes.includes('onOpenConfig?:')) failures.push('canvas.ts: cell-only designer renderers must expose a direct config-open callback');
if (!renderer.includes('onCellFieldMouseDown')) failures.push('CanvasNodeRenderer.tsx: cell-target field nodes must receive a mouse-down bridge from the sheet');
if (!renderer.includes('onCellFieldContextMenu')) failures.push('CanvasNodeRenderer.tsx: cell-target field nodes must receive a context-menu bridge from the sheet');
if (!renderer.includes('onCellMouseDown={(event) => {')) failures.push('CanvasNodeRenderer.tsx: cell-target field nodes must forward mouse-down events with their cell range');
if (!renderer.includes('onCellContextMenu={(event) => {')) failures.push('CanvasNodeRenderer.tsx: cell-target field nodes must forward context-menu events with their cell range');
if (!componentRegistry.includes('onCellMouseDown?.(event)')) failures.push('componentRegistry.tsx: cell-only field components must bridge mouse-down to sheet range selection');
if (!componentRegistry.includes('onCellContextMenu?.(event)')) failures.push('componentRegistry.tsx: cell-only field components must bridge context menus to the sheet cell menu');
if (!componentRegistry.includes("node.type === 'sub-table' && renderMode === 'cell'")) failures.push('componentRegistry.tsx: sub-table must have a cell-mode renderer distinct from generic containers');
if (!componentRegistry.includes('data-canvas-sub-table-frame="true"')) failures.push('componentRegistry.tsx: sub-table cell renderer must expose a dashed frame marker');
if (!componentRegistry.includes('node.bindings?.subTableRegion')) failures.push('componentRegistry.tsx: sub-table frame must read structured region metadata');
if (!componentRegistry.includes('data-canvas-sub-table-repeat-type')) failures.push('componentRegistry.tsx: sub-table frame must expose fixed/dynamic repeat type');
if (!canvasWorkspace.includes('data-canvas-sub-table-region-overlay="true"')) failures.push('CanvasSheetWorkspace.tsx: sub-table range overlay must render above table borders');
if (!canvasWorkspace.includes('SUB_TABLE_OVERLAY_Z_INDEX')) failures.push('CanvasSheetWorkspace.tsx: sub-table range overlay must use a dedicated z-index above the grid');
if (!canvasWorkspace.includes('data-canvas-sub-table-group-overlay="true"')) failures.push('CanvasSheetWorkspace.tsx: sub-table data grouping must render an orange dashed group overlay');
if (!canvasWorkspace.includes('data-canvas-sub-table-group-label="true"')) failures.push('CanvasSheetWorkspace.tsx: sub-table data grouping must render a 分组 label');
if (!canvasWorkspace.includes("{'分组'}")) failures.push('CanvasSheetWorkspace.tsx: sub-table data grouping corner label must show 分组 without a direction arrow');
if (canvasWorkspace.includes('groupDirection')) failures.push('CanvasSheetWorkspace.tsx: sub-table data grouping corner label must not append direction arrows');
if (!canvasWorkspace.includes('#f59e0b')) failures.push('CanvasSheetWorkspace.tsx: sub-table data grouping overlay must use orange styling');
if (!canvasWorkspace.includes('buildSubTableGroupRepeatRanges')) failures.push('CanvasSheetWorkspace.tsx: sub-table data grouping must calculate repeated fixed group ranges');
if (!canvasWorkspace.includes('data-canvas-sub-table-group-repeat-overlay="true"')) failures.push('CanvasSheetWorkspace.tsx: sub-table data grouping must render gray repeated group overlays');
if (!canvasWorkspace.includes('SUB_TABLE_GROUP_REPEAT_INSET = 5')) failures.push('CanvasSheetWorkspace.tsx: repeated sub-table group overlays must keep the gray fill spacing compact at 5px');
if (!canvasWorkspace.includes('data-canvas-sub-table-group-repeat-fill="true"')) failures.push('CanvasSheetWorkspace.tsx: repeated sub-table group overlays must render an inset fill layer');
if (!canvasWorkspace.includes('data-canvas-sub-table-group-repeat-index="true"')) failures.push('CanvasSheetWorkspace.tsx: sub-table repeated group overlays must show group indexes');
if (!canvasWorkspace.includes('rgba(148, 163, 184, 0.14)')) failures.push('CanvasSheetWorkspace.tsx: repeated sub-table group overlays must use gray shading');
if (!storeFile.includes('selectedSubTableGroupNodeId')) failures.push('useTemplateDesignerStore.ts: store must track the selected sub-table group marker');
if (!storeFile.includes('selectSubTableGroup')) failures.push('useTemplateDesignerStore.ts: store must expose a dedicated sub-table group selection action');
if (!canvasWorkspace.includes('selectSubTableGroup')) failures.push('CanvasSheetWorkspace.tsx: clicking the group corner label must select the sub-table group');
if (!canvasWorkspace.includes("pointerEvents: 'auto'")) failures.push('CanvasSheetWorkspace.tsx: sub-table group corner label must be clickable above the non-interactive overlay');
if (!canvasWorkspace.includes('onClick={(event) => {')) failures.push('CanvasSheetWorkspace.tsx: sub-table group corner label must handle clicks');
if (!inspector.includes('renderSubTableGroupSections')) failures.push('DesignerInspector.tsx: missing sub-table group configuration renderer');
if (!inspector.includes('分组配置')) failures.push('DesignerInspector.tsx: sub-table group selection must show a 分组配置 panel');
const subTableGroupConfigBlock = inspector.match(/const renderSubTableGroupSections = \(\) => \{[\s\S]*?const renderSubTableRegionSections/)?.[0] ?? '';
if (!subTableGroupConfigBlock.includes('renderSubTableGroupIdentitySummary')) failures.push('DesignerInspector.tsx: group configuration must use a dedicated group identity summary');
if (!inspector.includes('typeCaption="类型"')) failures.push('DesignerInspector.tsx: group configuration identity label must be 类型');
if (!inspector.includes('showName={false}')) failures.push('DesignerInspector.tsx: group configuration must not show 当前字段名称');
if (!inspector.includes('`子表（${fieldDisplayName}） > 分组`')) failures.push('DesignerInspector.tsx: group configuration type value must read 子表（子表名称） > 分组');
if (!inspector.includes('data-field-identity-single={showName ? undefined : \'true\'}')) failures.push('DesignerInspector.tsx: single-item group identity summary must expose a stable marker');
if (!inspector.includes("gridTemplateColumns: showName ? fieldIdentitySummarySx.gridTemplateColumns : '1fr'")) failures.push('DesignerInspector.tsx: single-item group identity summary must use the full card width');
if (!inspector.includes('noWrap={showName}')) failures.push('DesignerInspector.tsx: group identity type text must not be forced into ellipsis');
if (!inspector.includes("wordBreak: showName ? 'normal' : 'break-word'")) failures.push('DesignerInspector.tsx: long group identity type text must wrap instead of overflowing');
if (subTableGroupConfigBlock.includes('sub-table-group-display') || subTableGroupConfigBlock.includes('画布中橙色虚线') || subTableGroupConfigBlock.includes('title="查看效果"')) failures.push('DesignerInspector.tsx: group configuration must not render the 查看效果 section');
if (!canvasTab.includes("selectedSubTableGroupNodeId ? '分组配置'")) failures.push('CanvasTab.tsx: side panel title must switch to 分组配置 for selected sub-table groups');
if (!componentRegistry.includes('动态') || !componentRegistry.includes('固定')) failures.push('componentRegistry.tsx: sub-table frame must show fixed/dynamic state text');
if (!componentRegistry.includes('data-canvas-sub-table-header="true"')) failures.push('componentRegistry.tsx: sub-table frame must mark an enabled table header row');
if (!componentRegistry.includes('data-canvas-sub-table-header-label="true"')) failures.push('componentRegistry.tsx: sub-table header marker must render as a right-side label');
if (!componentRegistry.includes('data-canvas-sub-table-header-connector="true"')) failures.push('componentRegistry.tsx: sub-table header marker must use the same right-side dashed connector as the fixed label');
if (!componentRegistry.includes('· 表头')) failures.push('componentRegistry.tsx: sub-table header marker must read 表名 · 表头');
if (componentRegistry.includes("right: 0,\n              minHeight: 22")) failures.push('componentRegistry.tsx: sub-table header marker must not be a full-width in-frame strip');
if (!componentRegistry.includes("pointerEvents: 'none'")) failures.push('componentRegistry.tsx: sub-table frame must not block clicking individual sheet cells');
if (!componentRegistry.includes('data-canvas-sub-table-hover-label="true"')) failures.push('componentRegistry.tsx: sub-table frame must show the sub-table identifier');
if (!componentRegistry.includes('opacity: 0')) failures.push('componentRegistry.tsx: sub-table connector and identifier must stay hidden until hover');
if (componentRegistry.includes("opacity: 1,\n            pointerEvents: 'auto'")) failures.push('componentRegistry.tsx: sub-table identifier must not be directly visible by default');
if (!canvasWorkspace.includes('hoveredSubTableNodeId')) failures.push('CanvasSheetWorkspace.tsx: sub-table identifier visibility must be controlled by sheet-cell hover state');
if (!canvasWorkspace.includes('data-canvas-sub-table-hover-label="true"')) failures.push('CanvasSheetWorkspace.tsx: sub-table hover identifier must render from the sheet overlay');
if (!canvasWorkspace.includes('const shouldShowSubTableLabel = isHovered || isSubTableFocused')) failures.push('CanvasSheetWorkspace.tsx: sub-table identifier must only show while hovered or when the full sub-table is focused');
if (!canvasWorkspace.includes('rangesEqual(normalizedRange, normalizedRegionRange)')) failures.push('CanvasSheetWorkspace.tsx: sub-table focus state must require the active range to equal the full sub-table region');
if (subTableHoverLabelBlock.indexOf('setSelectedRange(normalizedRegionRange') > subTableHoverLabelBlock.indexOf('setSelectedNodeId(node.id)')) failures.push('CanvasSheetWorkspace.tsx: clicking the sub-table identifier must keep the sub-table selected after setting its range');
if (!canvasWorkspace.includes('scheduleHoveredSubTableUpdate(findCellRangeAtClientPoint(event.clientX, event.clientY))')) failures.push('CanvasSheetWorkspace.tsx: sub-table hover state must clear when the pointer moves outside sub-table cells');
if (!canvasWorkspace.includes('data-canvas-sub-table-hover-label-text="true"')) failures.push('CanvasSheetWorkspace.tsx: sub-table identifier text must use a constrained text box');
if (!subTableHoverLabelBlock.includes('minWidth: 44')) failures.push('CanvasSheetWorkspace.tsx: sub-table identifier must render as a readable horizontal badge');
if (!canvasWorkspace.includes('const subTableLabelHeight = Math.max(0, Math.min(24, regionLayout.height - 4))')) failures.push('CanvasSheetWorkspace.tsx: sub-table identifier height must be clamped by the current row height');
if (!canvasWorkspace.includes('const subTableLabelTopOffset = Math.min(6, Math.max(0, regionLayout.height - subTableLabelHeight))')) failures.push('CanvasSheetWorkspace.tsx: sub-table identifier must stay anchored at the table top-right without overflowing short rows');
if (canvasWorkspace.includes('Math.round((regionLayout.height - subTableLabelHeight) / 2)')) failures.push('CanvasSheetWorkspace.tsx: sub-table identifier must not be vertically centered on the table edge');
if (!subTableHoverLabelBlock.includes('height: subTableLabelHeight')) failures.push('CanvasSheetWorkspace.tsx: sub-table identifier must use the clamped row-safe height');
if (!subTableHoverLabelBlock.includes('top: regionLayout.top + subTableLabelTopOffset')) failures.push('CanvasSheetWorkspace.tsx: sub-table identifier must use the top-right offset');
if (!subTableHoverLabelBlock.includes("cursor: 'pointer'")) failures.push('CanvasSheetWorkspace.tsx: clickable sub-table identifier must show a pointer cursor on hover');
if (!subTableHoverLabelBlock.includes('maxWidth: 112')) failures.push('CanvasSheetWorkspace.tsx: sub-table identifier must constrain long horizontal labels');
if (!subTableHoverLabelBlock.includes("whiteSpace: 'nowrap'")) failures.push('CanvasSheetWorkspace.tsx: sub-table identifier text must stay horizontal');
if (!subTableHoverLabelBlock.includes('lineHeight: `${subTableLabelHeight}px`')) failures.push('CanvasSheetWorkspace.tsx: sub-table identifier line-height must follow the clamped row-safe height');
if (!subTableHoverLabelBlock.includes("textOverflow: 'ellipsis'")) failures.push('CanvasSheetWorkspace.tsx: sub-table identifier text must truncate instead of overflowing the badge background');
if (subTableHoverLabelBlock.includes('subTableLabelChars')) failures.push('CanvasSheetWorkspace.tsx: sub-table identifier must not split the table name into vertical characters');
if (!componentRegistry.includes('data-canvas-sub-table-connector="true"')) failures.push('componentRegistry.tsx: sub-table identifier must be connected by a dashed line');
if (!componentRegistry.includes("left: '100%'") || !componentRegistry.includes("left: 'calc(100% + 18px)'")) failures.push('componentRegistry.tsx: sub-table identifier must render to the right of the frame');
if (!componentRegistry.includes("top: '50%'") || !componentRegistry.includes("transform: 'translateY(-50%)'")) failures.push('componentRegistry.tsx: sub-table identifier connector and badge must be vertically centered');
if (!componentRegistry.includes("borderTop: '1px dashed #8b5cf6'")) failures.push('componentRegistry.tsx: sub-table connector line must use the same purple as the identifier');
if (!componentRegistry.includes('onOpenConfig?.()')) failures.push('componentRegistry.tsx: clicking the sub-table identifier must open sub-table configuration');
if (!componentRegistry.includes("pointerEvents: 'auto'")) failures.push('componentRegistry.tsx: sub-table identifier must be directly clickable');
if (!componentRegistry.includes('node.bindings?.subTableField')) failures.push('componentRegistry.tsx: sub-table field components must render from the bound sub-field snapshot');
if (!canvasWorkspace.includes('findCellRangeAtClientPoint')) failures.push('CanvasSheetWorkspace.tsx: sheet drag selection must resolve cells by pointer coordinates');
if (!canvasWorkspace.includes('startCellRangeDrag')) failures.push('CanvasSheetWorkspace.tsx: sheet and component cells must share range-drag startup logic');
if (!canvasWorkspace.includes('handleCellFieldMouseDown')) failures.push('CanvasSheetWorkspace.tsx: component-hosting cells must start range selection from component mouse-down');
if (!canvasWorkspace.includes('handleCellFieldContextMenu')) failures.push('CanvasSheetWorkspace.tsx: component-hosting cells must open the cell context menu from component right-click');
if (!canvasWorkspace.includes("dragState.type === 'cell'")) failures.push('CanvasSheetWorkspace.tsx: cell drag state must update range during global mousemove');
if (!renderer.includes('DeleteOutline')) failures.push('CanvasNodeRenderer.tsx: missing node delete action');
if (!componentRegistry.includes('propSchema')) failures.push('componentRegistry.tsx: missing propSchema support');
if (!componentRegistry.includes('styleSchema')) failures.push('componentRegistry.tsx: missing styleSchema support');
if (!canvasTypes.includes("renderMode?: 'normal' | 'cell'")) failures.push('canvas.ts: designer renderers must support a cell-only render mode');
if (!componentRegistry.includes("renderMode = 'normal'")) failures.push('componentRegistry.tsx: field renderer must default to normal render mode');
if (!componentRegistry.includes("const isCellMode = renderMode === 'cell'")) failures.push('componentRegistry.tsx: field renderer must detect cell-only mode');
if (!componentRegistry.includes('data-canvas-cell-field-component="true"')) failures.push('componentRegistry.tsx: cell-only field renderer must expose a stable marker');
if (!componentRegistry.includes('onMouseDown={(event) => {')) failures.push('componentRegistry.tsx: cell-only field renderer must select the target cell on mouse down');
if (!componentRegistry.includes('inputPlaceholder = isCellMode ? (placeholder || label) : placeholder')) failures.push('componentRegistry.tsx: cell-only field renderer must use field label as placeholder fallback');
if (!componentRegistry.includes('const controlReadonly = isCellMode || readonly')) failures.push('componentRegistry.tsx: cell-only field renderer must force controls to readonly');
if (!componentRegistry.includes("tabIndex: isCellMode ? -1 : undefined")) failures.push('componentRegistry.tsx: cell-only field controls must not receive keyboard focus');
if (!componentRegistry.includes("pointerEvents: 'none'")) failures.push('componentRegistry.tsx: cell-only field controls must not receive direct pointer editing');
if (!componentRegistry.includes("caretColor: 'transparent'")) failures.push('componentRegistry.tsx: cell-only field controls must not show an edit caret');
if (!componentRegistry.includes('renderCellDateTimePicker')) failures.push('componentRegistry.tsx: cell datetime fields must render as a date-time picker control');
if (!componentRegistry.includes('data-canvas-cell-datetime-picker="true"')) failures.push('componentRegistry.tsx: cell datetime picker must expose a stable marker');
if (!componentRegistry.includes('CalendarMonthOutlined')) failures.push('componentRegistry.tsx: cell datetime picker must show a calendar affordance');
if (!componentRegistry.includes('renderCellSignatureButton')) failures.push('componentRegistry.tsx: cell signature fields must render as a dedicated signature button');
if (!componentRegistry.includes('data-canvas-cell-signature-button="true"')) failures.push('componentRegistry.tsx: cell signature button must expose a stable marker');
if (!componentRegistry.includes('点击签名')) failures.push('componentRegistry.tsx: cell signature button text must read 点击签名');
if (!componentRegistry.includes('renderCellUploadButton')) failures.push('componentRegistry.tsx: cell attachment/image fields must render as upload buttons');
if (!componentRegistry.includes('data-canvas-cell-upload-button="true"')) failures.push('componentRegistry.tsx: cell upload button must expose a stable marker');
if (!componentRegistry.includes('AddOutlined')) failures.push('componentRegistry.tsx: cell upload button must show a plus icon');
if (!componentRegistry.includes('点击上传')) failures.push('componentRegistry.tsx: cell upload button text must read 点击上传');
if (!componentRegistry.includes('renderCellSelect')) failures.push('componentRegistry.tsx: cell single-select and multi-select fields must render dropdown controls when configured as dropdowns');
if (!componentRegistry.includes('data-canvas-cell-select="true"')) failures.push('componentRegistry.tsx: cell dropdown control must expose a stable marker');
if (!componentRegistry.includes('displayEmpty: true')) failures.push('componentRegistry.tsx: cell dropdown control must show placeholder text when empty');
if (!componentRegistry.includes('parseConfiguredOptions')) failures.push('componentRegistry.tsx: cell option fields must read optionList configured from the inspector before field typeConfig options');
if (!parseConfiguredOptionsBlock.includes("['singleSelect', 'multiSelect'].includes(field?.type ?? '')") || !parseConfiguredOptionsBlock.includes("label: '选项1'") || !parseConfiguredOptionsBlock.includes("label: '选项2'")) failures.push('componentRegistry.tsx: single-select and multi-select fields without configured options must preview the same default options shown by the inspector');
if (!componentRegistry.includes("const optionShape = String(readConfig('optionShape', 'select'))")) failures.push('componentRegistry.tsx: cell option fields must read the configured 展现形态');
if (!componentRegistry.includes('renderCellOptionGroup')) failures.push('componentRegistry.tsx: cell single-select and multi-select radio/checkbox shapes must render as option groups');
if (!componentRegistry.includes('data-canvas-cell-radio-group="true"')) failures.push('componentRegistry.tsx: cell radio shape must expose a stable marker');
if (!componentRegistry.includes('data-canvas-cell-checkbox-group="true"')) failures.push('componentRegistry.tsx: cell checkbox shape must expose a stable marker');
if (!componentRegistry.includes("['singleSelect', 'multiSelect'].includes(field?.type ?? '') && optionShape === 'radio'")) failures.push('componentRegistry.tsx: cell single-select and multi-select must switch to radio group when 展现形态 is 单选框');
if (!componentRegistry.includes("['singleSelect', 'multiSelect'].includes(field?.type ?? '') && optionShape === 'checkbox'")) failures.push('componentRegistry.tsx: cell single-select and multi-select must switch to checkbox group when 展现形态 is 复选框');
if (!componentRegistry.includes('const defaultValues = readDefaultValues')) failures.push('componentRegistry.tsx: option groups must parse default values as an array');
if (!componentRegistry.includes("field?.type === 'multiSelect'")) failures.push('componentRegistry.tsx: option groups must distinguish multi-select default semantics');
if (!componentRegistry.includes('const isOptionChecked = isMultiSelect')) failures.push('componentRegistry.tsx: multi-select radio and checkbox defaults must share array-based checked logic');
if (!componentRegistry.includes('defaultValues.includes(option.value) || defaultValues.includes(option.label)')) failures.push('componentRegistry.tsx: multi-select checkbox defaults must allow multiple checked options');
if (!componentRegistry.includes("fontSize: 12")) failures.push('componentRegistry.tsx: cell single-select radio/checkbox labels must use smaller compact text');
if (!componentRegistry.includes("lineHeight: '18px'")) failures.push('componentRegistry.tsx: cell single-select radio/checkbox labels must use compact line height');
if (!componentRegistry.includes("fontSize: 17")) failures.push('componentRegistry.tsx: cell single-select radio/checkbox controls must use smaller icons');
if (!componentRegistry.includes("spacing={0.25}")) failures.push('componentRegistry.tsx: cell single-select radio/checkbox groups must use compact spacing');
if (componentRegistry.includes('renderReferenceText') || componentRegistry.includes('data-canvas-reference-display="true"')) failures.push('componentRegistry.tsx: reference fields must use the same TextField rendering path as text and number fields on the canvas');
if (componentRegistry.includes("field?.type === 'reference'")) failures.push('componentRegistry.tsx: reference fields must not branch into a dedicated canvas renderer');
if (!componentRegistry.includes("['singleSelect', 'multiSelect'].includes(field?.type ?? '')")) failures.push('componentRegistry.tsx: cell single-select and multi-select dropdown rendering must share option shape handling');
if (componentRegistry.includes("['singleSelect', 'multiSelect', 'reference'].includes(field?.type ?? '')")) failures.push('componentRegistry.tsx: cell single-select must not be forced to dropdown when 展现形态 is radio or checkbox');
if (!componentRegistry.includes('emptySymbol')) failures.push('componentRegistry.tsx: missing widget config schema');
if (!componentRegistry.includes('prefix')) failures.push('componentRegistry.tsx: missing prefix/suffix config support');
if (!componentRegistry.includes('node.bindings?.defaultValue')) failures.push('componentRegistry.tsx: field renderer must preview configured default values');
if (!componentRegistry.includes("readConfig('minLength'")) failures.push('componentRegistry.tsx: field renderer must pass configured minimum text length to inputs');
if (!mockFillDialog.includes('data-mock-fill-dialog="true"')) failures.push('MockFillDialog.tsx: missing mock-fill dialog marker');
if (!mockFillDialog.includes('data-mock-fill-title-divider="true"')) failures.push('MockFillDialog.tsx: mock-fill title and document name must be separated by a visible divider');
if (!mockFillDialog.includes('data-mock-fill-page-paper="true"')) failures.push('MockFillDialog.tsx: mock-fill pages must render a paper shell around the sheet');
if (!mockFillDialog.includes('getMockFillPagePaperMetrics')) failures.push('MockFillDialog.tsx: mock-fill pages must calculate paper size and page margins');
if (!mockFillDialog.includes('gridHeight = sumTrackSizes(rowCount')) failures.push('MockFillDialog.tsx: mock-fill paper height must include the rendered sheet height');
if (!mockFillDialog.includes('gridWidth + insetLeft + insetRight')) failures.push('MockFillDialog.tsx: mock-fill paper width must include left and right page margins');
if (!mockFillDialog.includes("pl: `${paperMetrics.insetLeft}px`")) failures.push('MockFillDialog.tsx: mock-fill sheet must be inset from the left paper edge');
if (!mockFillDialog.includes("pt: `${paperMetrics.insetTop}px`")) failures.push('MockFillDialog.tsx: mock-fill sheet must be inset from the top paper edge');
if (!mockFillDialog.includes("boxShadow: '0 16px 40px rgba(30, 41, 59, 0.10)'")) failures.push('MockFillDialog.tsx: mock-fill page shadow must belong to the paper shell');
if (mockFillDialog.includes('document.model.fields.slice')) failures.push('MockFillDialog.tsx: mock-fill bottom field icon preview area must not render');
if (mockFillDialog.includes("import FieldTypeIcon from '../FieldTypeIcon'")) failures.push('MockFillDialog.tsx: mock-fill must not keep the bottom field icon preview dependency');
if (!mockFillDialog.includes("overflow: 'auto', px: 3, pt: 3, pb: '20px'")) failures.push('MockFillDialog.tsx: mock-fill scroll body must reserve only a 20px bottom margin');
if (mockFillDialog.includes("sx={{ overflowX: 'auto', pb: 1 }}")) failures.push('MockFillDialog.tsx: mock-fill page wrapper must not add bottom background padding');
if (mockFillDialog.includes('还原填报模拟')) failures.push('MockFillDialog.tsx: page-level simulation label must be removed from the sheet area');
if (mockFillDialog.includes('{page.name}</Typography>')) failures.push('MockFillDialog.tsx: page name must not render above the simulated sheet');
if (mockFillDialog.includes('本地模拟')) failures.push('MockFillDialog.tsx: page simulation label must not read 本地模拟');
if (!mockFillDialog.includes('createInitialMockFillValues')) failures.push('MockFillDialog.tsx: mock-fill runtime must initialize values from field defaults');
if (!mockFillDialog.includes('renderMockFillControl')) failures.push('MockFillDialog.tsx: mock-fill runtime must render fillable controls from bound fields');
if (!mockFillDialog.includes("data-mock-fill-field-control=\"true\"")) failures.push('MockFillDialog.tsx: mock-fill controls must expose a focus-expand target');
if (!mockFillDialog.includes("'&:not(:focus-within)':")) failures.push('MockFillDialog.tsx: mock-fill field cells must clip content again after blur');
if (!mockFillDialog.includes('shouldExpandFieldOnFocus')) failures.push('MockFillDialog.tsx: mock-fill field focus expansion must depend on actual content width');
if (!mockFillDialog.includes('data-mock-fill-field-overflowing={shouldExpandFieldOnFocus ? \'true\' : undefined}')) failures.push('MockFillDialog.tsx: mock-fill field cells must only mark overflowing content for focus expansion');
if (!mockFillDialog.includes('getMockFillRangeWidth')) failures.push('MockFillDialog.tsx: mock-fill field overflow detection must compare content against the actual cell width');
if (!mockFillDialog.includes('estimateMockFillControlContentWidth')) failures.push('MockFillDialog.tsx: mock-fill field overflow detection must estimate current content width');
if (!mockFillDialog.includes("'&[data-mock-fill-field-overflowing=\"true\"]:focus-within'")) failures.push('MockFillDialog.tsx: focused mock-fill field cells must temporarily allow overflow only when content exceeds the cell');
if (!mockFillDialog.includes("'&[data-mock-fill-field-overflowing=\"true\"]:focus-within': {\n            overflow: 'visible',\n            zIndex: 120")) failures.push('MockFillDialog.tsx: focused overflowing mock-fill field cells must sit above sheet border overlays');
if (!mockFillDialog.includes("'&[data-mock-fill-field-overflowing=\"true\"]:focus-within [data-mock-fill-field-control=\"true\"]'")) failures.push('MockFillDialog.tsx: focused mock-fill controls must expand beyond narrow cells only when content overflows');
if (!mockFillDialog.includes("'&[data-mock-fill-field-overflowing=\"true\"]:focus-within [data-mock-fill-field-control=\"true\"]': {\n            position: 'relative',\n            zIndex: 121")) failures.push('MockFillDialog.tsx: focused overflowing mock-fill controls must be the top interactive layer');
if (!mockFillDialog.includes("width: 'var(--mock-fill-focus-width)'")) failures.push('MockFillDialog.tsx: overflowing focused mock-fill controls must expand based on current content width');
if (!mockFillDialog.includes('Boolean(node.bindings?.hidden)')) failures.push('MockFillDialog.tsx: hidden fields must not render for line operators');
if (!mockFillDialog.includes('Boolean(node.bindings?.readonly)')) failures.push('MockFillDialog.tsx: readonly fields must render without allowing edits');
if (!mockFillDialog.includes('node.bindings?.autoWrap')) failures.push('MockFillDialog.tsx: auto-wrap text fields must stay multiline in mock fill');
if (mockFillDialog.includes("height: autoWrap ? 'auto' : 28")) failures.push('MockFillDialog.tsx: mock-fill field controls must not be fixed to 28px height');
if (!mockFillDialog.includes("alignItems: autoWrap ? 'stretch' : 'center'")) failures.push('MockFillDialog.tsx: mock-fill field controls must stretch to the cell height');
if (!mockFillDialog.includes("'& .MuiInputBase-root.MuiInputBase-multiline'")) failures.push('MockFillDialog.tsx: mock-fill multiline text controls must have a dedicated full-height root style');
if (!mockFillDialog.includes("height: '100% !important'")) failures.push('MockFillDialog.tsx: mock-fill multiline text input must fill the bound cell height');
if (!mockFillDialog.includes("maxHeight: 'none'")) failures.push('MockFillDialog.tsx: mock-fill multiline text input must not cap height below the cell height');
if (mockFillDialog.includes('minHeight: 28')) failures.push('MockFillDialog.tsx: mock-fill controls must not impose a 28px minimum height that covers short-row borders');
if (!mockFillDialog.includes('minHeight: 0')) failures.push('MockFillDialog.tsx: mock-fill controls must allow short rows to keep table borders visible');
if (!mockFillSheetBorderOverlayBlock) failures.push('MockFillDialog.tsx: mock-fill sheet borders must render in a top overlay above field controls');
if (mockFillSheetBorderOverlayBlock && !mockFillSheetBorderOverlayBlock.includes("position: 'relative'")) failures.push('MockFillDialog.tsx: mock-fill sheet border overlay must be positioned so z-index wins over overflowing controls');
if (mockFillSheetBorderOverlayBlock && !mockFillSheetBorderOverlayBlock.includes("zIndex: 80")) failures.push('MockFillDialog.tsx: mock-fill sheet border overlay must sit below focused overflowing field controls');
if (mockFillSheetBorderOverlayBlock && !mockFillSheetBorderOverlayBlock.includes("pointerEvents: 'none'")) failures.push('MockFillDialog.tsx: mock-fill sheet border overlay must not block field editing');
if (mockFillSheetBorderOverlayBlock && !mockFillSheetBorderOverlayBlock.includes("bgcolor: 'transparent'")) failures.push('MockFillDialog.tsx: mock-fill sheet border overlay must only draw lines');
if (!mockFillSubTableFrameBlock.includes('zIndex: 90')) failures.push('MockFillDialog.tsx: sub-table dashed frame must render above the mock-fill sheet border overlay');
if (!identityApi.includes('verifyCurrentUserSignaturePassword')) failures.push('identity.ts: mock-fill signature must expose a current-user signature password verification API');
if (!identityApi.includes("'/auth/me/signature/verify'")) failures.push('identity.ts: current-user signature verification must call /auth/me/signature/verify');
if (!identityApi.includes('skipAuthRedirect: true')) failures.push('identity.ts: signature password business failures must not clear the current login session');
if (!mockFillDialog.includes("import { verifyCurrentUserSignaturePassword } from '@/api/identity'")) failures.push('MockFillDialog.tsx: mock-fill signature dialog must import the real backend verification API');
if (!mockFillSignatureControlBlock.includes('onSignatureRequest(valueKey)')) failures.push('MockFillDialog.tsx: mock-fill signature fields must open an electronic signature password dialog instead of signing immediately');
if (mockFillDialog.includes("'已签名'") || mockFillDialog.includes('>已签名<')) failures.push('MockFillDialog.tsx: mock-fill signature must not store or render 已签名 text');
if (!mockFillDialog.includes('data-mock-fill-signature-dialog="true"')) failures.push('MockFillDialog.tsx: mock-fill signature confirmation dialog must expose a stable marker');
if (!mockFillDialog.includes('data-mock-fill-signature-password="true"')) failures.push('MockFillDialog.tsx: mock-fill signature dialog must require an electronic signature password input');
if (!mockFillDialog.includes('await verifyCurrentUserSignaturePassword')) failures.push('MockFillDialog.tsx: mock-fill signature dialog must verify against the backend before writing a signature value');
if (!mockFillDialog.includes('data-mock-fill-signature-image="true"')) failures.push('MockFillDialog.tsx: verified mock-fill signatures must render the authorized signature image');
if (!mockFillDialog.includes('signatureImageUrl')) failures.push('MockFillDialog.tsx: verified mock-fill signature values must carry the backend signature image URL');
if (!mockFillDialog.includes("import { getFilePreviewBlob } from '@/api/files'")) failures.push('MockFillDialog.tsx: verified signature images must be loaded through the authenticated file preview API');
if (!mockFillDialog.includes('URL.createObjectURL')) failures.push('MockFillDialog.tsx: verified signature image blobs must be converted to object URLs before rendering');
if (!mockFillDialog.includes('signatureImageObjectUrl')) failures.push('MockFillDialog.tsx: verified signature image values must render the authenticated object URL');
if (!mockFillDialog.includes('URL.revokeObjectURL')) failures.push('MockFillDialog.tsx: verified signature image object URLs must be released when reset or closed');
if (!apiClient.includes("response.config.responseType === 'blob'")) failures.push('client.ts: blob responses must bypass ApiResponse JSON code checks');
if (!mockFillDialog.includes("'Request failed'")) failures.push('MockFillDialog.tsx: generic request failures must be replaced with readable signature error text');
if (!mockFillSignatureControlBlock.includes("objectFit: 'contain'")) failures.push('MockFillDialog.tsx: verified signature images must fit inside the signature cell');
if (!mockFillDialog.includes('type="datetime-local"')) failures.push('MockFillDialog.tsx: date-time fields must use a fillable date-time input');
if (!mockFillDialog.includes('data-mock-fill-date-control="true"')) failures.push('MockFillDialog.tsx: date-time fields must expose a stretched date control marker');
if (!mockFillDialog.includes('dateTextFieldSx')) failures.push('MockFillDialog.tsx: date-time fields must use a dedicated full-height input style');
if (!mockFillDialog.includes('openMockFillDatePicker')) failures.push('MockFillDialog.tsx: date-time mock-fill fields must open the native picker from the whole input area');
if (!mockFillDialog.includes('showPicker')) failures.push('MockFillDialog.tsx: date-time mock-fill fields must use native showPicker when available');
if (!mockFillDialog.includes("openMockFillDatePicker(event.currentTarget.querySelector<HTMLInputElement>('input'))")) failures.push('MockFillDialog.tsx: date-time mock-fill field clicks must target the inner native input');
if (!mockFillDialog.includes("'& input::-webkit-calendar-picker-indicator'")) failures.push('MockFillDialog.tsx: date-time mock-fill fields must hide the native browser calendar indicator');
if (!mockFillDialog.includes("const isNumberField = field?.type === 'number'")) failures.push('MockFillDialog.tsx: numeric fields must be detected before rendering text inputs');
if (mockFillDialog.includes("type={field?.type === 'number' ? 'number' : 'text'}")) failures.push('MockFillDialog.tsx: numeric mock-fill fields must not use native number inputs that clip values in narrow cells');
if (!mockFillDialog.includes('numberTextFieldSx')) failures.push('MockFillDialog.tsx: numeric mock-fill fields must use a compact no-spinner display style');
if (!mockFillDialog.includes("inputMode: isNumberField ? 'decimal' : undefined")) failures.push('MockFillDialog.tsx: numeric mock-fill fields must preserve decimal keyboard semantics without native spinners');
if (!mockFillDialog.includes("'data-mock-fill-number-control': isNumberField ? 'true' : undefined")) failures.push('MockFillDialog.tsx: numeric mock-fill fields must expose a stable marker');
if (!mockFillDialog.includes('normalizeMockFillNumberInput')) failures.push('MockFillDialog.tsx: numeric mock-fill fields must sanitize non-numeric input');
if (!mockFillDialog.includes("onValueChange(valueKey, isNumberField ? normalizeMockFillNumberInput(event.target.value) : event.target.value)")) failures.push('MockFillDialog.tsx: numeric mock-fill field changes must reject letters and Chinese characters');
if (!mockFillDialog.includes("value.replace(/[^\\d.-]/g, '')")) failures.push('MockFillDialog.tsx: numeric mock-fill sanitizer must remove non-digit text');
if (!mockFillDialog.includes('readImageFilesAsDataUrls')) failures.push('MockFillDialog.tsx: mock-fill image uploads must create local thumbnail previews');
if (!mockFillDialog.includes('data-mock-fill-image-thumbnail="true"')) failures.push('MockFillDialog.tsx: mock-fill image fields must render an in-cell thumbnail marker');
if (!mockFillDialog.includes('component="img"')) failures.push('MockFillDialog.tsx: mock-fill image thumbnails must render as img elements');
if (!mockFillDialog.includes("objectFit: 'cover'")) failures.push('MockFillDialog.tsx: mock-fill image thumbnails must fill the cell with cover sizing');
if (!mockFillDialog.includes('const isMultiSelectDropdown = field?.type === \'multiSelect\'')) failures.push('MockFillDialog.tsx: multi-select dropdown must be handled separately from single-select');
if (!mockFillDialog.includes('multiple: isMultiSelectDropdown')) failures.push('MockFillDialog.tsx: multi-select dropdown must enable multiple selection');
if (!mockFillDialog.includes('Array.isArray(nextValue) ? nextValue : String(nextValue).split')) failures.push('MockFillDialog.tsx: multi-select dropdown changes must keep an array of selected values');
if (!mockFillDialog.includes('renderValue: (selected) =>')) failures.push('MockFillDialog.tsx: multi-select dropdown must render selected option labels');
if (!mockFillDialog.includes('checked={currentValues.includes(option.value)')) failures.push('MockFillDialog.tsx: multi-select dropdown menu items must show checked selections');
if (mockFillDialog.includes('<MenuItem value=""')) failures.push('MockFillDialog.tsx: select dropdowns must not render placeholder text as a selectable menu option');
if (!mockFillDialog.includes('mockFillSelectOptionSx')) failures.push('MockFillDialog.tsx: single-select and multi-select dropdown options must share one height style');
if (!mockFillDialog.includes('minHeight: 40')) failures.push('MockFillDialog.tsx: dropdown options must keep a compact consistent row height');
if (!mockFillDialog.includes("'& .MuiCheckbox-root': { p: 0, mr: 1 }")) failures.push('MockFillDialog.tsx: multi-select checkbox spacing must not make options taller than single-select rows');
if (!mockFillDialog.includes('shouldRenderMockFillCellBorderEdge')) failures.push('MockFillDialog.tsx: mock-fill imported table borders must use edge-aware rendering');
if (!mockFillDialog.includes("cellBorder?.color ?? '#000000'")) failures.push('MockFillDialog.tsx: mock-fill imported table borders must default to black when a stored border lacks color');
if (!mockFillDialog.includes("borderTop: shouldRenderMockFillCellBorderEdge(displayPage, range, 'top')")) failures.push('MockFillDialog.tsx: mock-fill must restore top borders from imported table cells');
if (!mockFillDialog.includes("borderLeft: shouldRenderMockFillCellBorderEdge(displayPage, range, 'left')")) failures.push('MockFillDialog.tsx: mock-fill must restore left borders from imported table cells');
if (!mockFillDialog.includes('sheet: { ...page.sheet, rowCount }')) failures.push('MockFillDialog.tsx: mock-fill dynamic table borders must de-duplicate against the expanded runtime row count');
if (!mockFillDialog.includes('getMockFillRangeHeight')) failures.push('MockFillDialog.tsx: dynamic sub-table row actions must be aligned from the rendered row height');
if (!mockFillDialog.includes('getMockFillRowOffset')) failures.push('MockFillDialog.tsx: dynamic sub-table row actions must calculate their row-relative offset');
if (!mockFillSubTableFrameBlock.includes("boxSizing: 'border-box'")) failures.push('MockFillDialog.tsx: sub-table frame border must stay inside the rendered grid area');
if (!mockFillSubTableFrameBlock.includes("overflow: 'visible'")) failures.push('MockFillDialog.tsx: sub-table frame must let row-end icon actions render outside without affecting table lines');
if (!mockFillSubTableFrameBlock.includes('data-mock-fill-sub-table-actions="true"')) failures.push('MockFillDialog.tsx: dynamic sub-table row actions must render in a dedicated row-end action area');
if (!mockFillSubTableFrameBlock.includes("left: 'calc(100% + 6px)'")) failures.push('MockFillDialog.tsx: dynamic sub-table add-row action must sit after the row instead of inside the table');
if (!mockFillSubTableFrameBlock.includes('top: subTableActionCenterY')) failures.push('MockFillDialog.tsx: dynamic sub-table add-row action must align to the active row center');
if (!mockFillDialog.includes('data-mock-fill-sub-table-add-row="true"')) failures.push('MockFillDialog.tsx: dynamic sub-tables must expose an add-row action');
if (!mockFillSubTableFrameBlock.includes('aria-label="新增行"')) failures.push('MockFillDialog.tsx: dynamic sub-table add-row action must be an icon button with an accessible label');
if (mockFillSubTableFrameBlock.includes('startIcon={<AddOutlined />}')) failures.push('MockFillDialog.tsx: dynamic sub-table add-row action must not render as a text button with a start icon');
if (!mockFillDialog.includes('data-mock-fill-sub-table-label="true"')) failures.push('MockFillDialog.tsx: sub-table frame label must expose a hover-only marker');
if (!mockFillDialog.includes('&:hover [data-mock-fill-sub-table-label="true"]')) failures.push('MockFillDialog.tsx: sub-table frame label must only show on hover');
if (!mockFillDialog.includes("window.confirm('确认删除当前记录吗？')")) failures.push('MockFillDialog.tsx: dynamic sub-table delete must require second confirmation');
if (!mockFillDialog.includes('data-mock-fill-sub-table-remove-row="true"')) failures.push('MockFillDialog.tsx: dynamic sub-tables must expose a remove-row action');
if (canvasTypes.includes("'wrap'")) failures.push('canvas.ts: displayMode must not include 自动换行 as a display mode value');
if (!canvasTypes.includes('autoWrap?: boolean')) failures.push('canvas.ts: field bindings must store 自动换行 as an independent boolean option');
if (componentRegistry.includes("displayMode === 'wrap'")) failures.push('componentRegistry.tsx: field renderer must not treat 自动换行 as a display mode');
if (!componentRegistry.includes('Boolean(node.bindings?.autoWrap)')) failures.push('componentRegistry.tsx: field renderer must read 自动换行 from an independent boolean binding');
if (!componentRegistry.includes('wrapTextFieldProps')) failures.push('componentRegistry.tsx: field renderer must apply multiline props for automatic wrapping');
if (!componentRegistry.includes('maxRows: isCellMode ? 2 : 4')) failures.push('componentRegistry.tsx: cell auto-wrap text must stay compact instead of using the full form-editor height');
if (!componentRegistry.includes("p: '2px 6px'")) failures.push('componentRegistry.tsx: cell auto-wrap input root must use compact padding');
if (!componentRegistry.includes("height: '100% !important'")) failures.push('componentRegistry.tsx: cell auto-wrap textarea must stay inside the cell height');
if (!componentRegistry.includes("lineHeight: isCellMode ? '16px' : '20px'")) failures.push('componentRegistry.tsx: cell auto-wrap textarea must use compact line height');
if (!componentRegistry.includes("padding: '0 !important'")) failures.push('componentRegistry.tsx: cell auto-wrap textarea must remove default multiline padding');
if (!componentRegistry.includes('compWidth')) failures.push('componentRegistry.tsx: missing component size config');
if (!componentRegistry.includes('maxLength')) failures.push('componentRegistry.tsx: missing text-length config support');
if (!componentRegistry.includes('precision')) failures.push('componentRegistry.tsx: missing numeric precision config support');
if (!componentRegistry.includes('optionLayout')) failures.push('componentRegistry.tsx: missing option layout config support');
if (!componentRegistry.includes('format')) failures.push('componentRegistry.tsx: missing date/time format config support');
if (!fieldRegistry.includes('compatibleComponents')) failures.push('fieldRegistry.ts: missing compatibleComponents');
if (!componentRegistry.includes('field.typeConfig')) failures.push('componentRegistry.tsx: field renderer must read option/config data from field.typeConfig');
if (!inspector.includes('renderSubTableRegionSections')) failures.push('DesignerInspector.tsx: missing sub-table region configuration renderer');
if (!inspector.includes('结构设置')) failures.push('DesignerInspector.tsx: sub-table configuration must expose structure settings');
if (!inspector.includes('填报方向')) failures.push('DesignerInspector.tsx: sub-table configuration must expose record direction');
if (!inspector.includes('子表类型')) failures.push('DesignerInspector.tsx: sub-table repeat mode must be labeled 子表类型');
if (!inspector.includes('展示表头')) failures.push('DesignerInspector.tsx: sub-table basic section must expose 展示表头');
if (inspector.includes('设置展示表头')) failures.push('DesignerInspector.tsx: sub-table header label must not keep 设置展示表头');
if (!inspector.includes('setSelectedSubTableHeaderVisible')) failures.push('DesignerInspector.tsx: sub-table header toggle must call the dedicated header-row action');
if (!inspector.includes('允许删除记录')) failures.push('DesignerInspector.tsx: sub-table configuration must expose dynamic remove option');
if (!inspector.includes('新增入口')) failures.push('DesignerInspector.tsx: sub-table configuration must expose add-entry option');
if (!inspector.includes("selectedNode.type === 'sub-table' && fieldType === 'subTable'")) failures.push('DesignerInspector.tsx: sub-table region panel must only render for selected sub-table nodes');
const subTableRegionConfigBlock = inspector.match(/const renderSubTableRegionSections = \(\) => [\s\S]*?const renderFieldSections/)?.[0] ?? '';
if (subTableRegionConfigBlock.includes('子表名称')) failures.push('DesignerInspector.tsx: sub-table basic section must not show 子表名称');
if (subTableRegionConfigBlock.includes('帮助提示')) failures.push('DesignerInspector.tsx: sub-table basic section must not show 帮助提示');
if (subTableRegionConfigBlock.includes('重复方式')) failures.push('DesignerInspector.tsx: sub-table config must not keep the old 重复方式 label');
if (!subTableRegionConfigBlock.includes("region.repeat.type === 'fixed' ? (")) failures.push('DesignerInspector.tsx: sub-table structure settings must only render for fixed sub-tables');
const dynamicSubTableConfigBlock = subTableRegionConfigBlock.match(/<FieldConfigSection title="动态设置"[\s\S]*?<\/FieldConfigSection>/)?.[0] ?? '';
if (dynamicSubTableConfigBlock.includes('最小数量') || dynamicSubTableConfigBlock.includes('最大数量')) failures.push('DesignerInspector.tsx: dynamic sub-table settings must not expose min/max row limits');
if (subTableRegionConfigBlock.includes('固定设置')) failures.push('DesignerInspector.tsx: sub-table fixed settings section must be removed');
if (subTableRegionConfigBlock.includes('固定数量')) failures.push('DesignerInspector.tsx: sub-table fixed count setting must be removed');
if (subTableRegionConfigBlock.includes('填写限制')) failures.push('DesignerInspector.tsx: sub-table fill settings section must be removed');
if (subTableRegionConfigBlock.includes('marker="sub-table-display"') || subTableRegionConfigBlock.includes('title="查看效果"')) failures.push('DesignerInspector.tsx: sub-table region configuration must not show 查看效果');
if (subTableRegionConfigBlock.includes('marker="sub-table-pagination"') || subTableRegionConfigBlock.includes('分页设置')) failures.push('DesignerInspector.tsx: sub-table region configuration must not show 分页设置');
if (inspector.includes('字段信息')) failures.push('DesignerInspector.tsx: field configuration panel must not show field information');
if (inspector.includes('绑定关系')) failures.push('DesignerInspector.tsx: field configuration panel must not show binding relationship');
if (inspector.includes('Paper')) failures.push('DesignerInspector.tsx: field configuration panel must not add an extra Paper container');
if (inspector.includes("height: '100%'")) failures.push('DesignerInspector.tsx: field configuration content must not render a full-height empty container');
if (inspector.includes('填写规则')) failures.push('DesignerInspector.tsx: field configuration should use business-facing 填写限制 wording instead of 填写规则');
if (inspector.includes('展示规则')) failures.push('DesignerInspector.tsx: field configuration should use business-facing 查看效果 wording instead of 展示规则');
if (inspector.includes('控件规则')) failures.push('DesignerInspector.tsx: field configuration should not expose generic widget-rule wording');
if (inspector.includes('样式配置')) failures.push('DesignerInspector.tsx: field configuration should not expose generic style-rule wording');
if (inspector.includes('字段编码')) failures.push('DesignerInspector.tsx: field configuration panel must not show field code metadata');
if (inspector.includes('切换绑定字段')) failures.push('DesignerInspector.tsx: field configuration panel must not show the binding switcher');
if (inspector.includes('解绑字段')) failures.push('DesignerInspector.tsx: field configuration panel must not show unbind action');
if (!storeFile.includes('bindFieldToNode')) failures.push('useTemplateDesignerStore.ts: missing bindFieldToNode action');
if (!storeFile.includes('insertNode')) failures.push('useTemplateDesignerStore.ts: missing insertNode action');
if (!storeFile.includes('addNodeFromField')) failures.push('useTemplateDesignerStore.ts: missing addNodeFromField action');
if (!storeFile.includes('addNodeFromFieldToCell')) failures.push('useTemplateDesignerStore.ts: missing cell-target field insertion action');
if (!storeFile.includes('addNodeFromSubTableFieldToCell')) failures.push('useTemplateDesignerStore.ts: missing sub-table cell-target field insertion action');
if (!storeFile.includes('subTableFieldIdsUsedOnCanvas')) failures.push('useTemplateDesignerStore.ts: must expose consumed sub-table fields for the sidebar');
if (!storeFile.includes('subTableField: field')) failures.push('useTemplateDesignerStore.ts: sub-table field nodes must keep a field snapshot for rendering');
if (!storeFile.includes('removeSubTableFieldNodesFromTree')) failures.push('useTemplateDesignerStore.ts: sub-table field drops must replace only scoped sub-table child fields');
if (!storeFile.includes('node.bindings?.subTableId !== subTableId')) failures.push('useTemplateDesignerStore.ts: sub-table field replacement must not remove the parent sub-table frame');
if (!storeFile.includes('collectDeletedSubTableFieldIds')) failures.push('useTemplateDesignerStore.ts: deleting a sub-table node must collect the bound sub-table field id');
if (!storeFile.includes('removeSubTableChildFieldNodesFromTree')) failures.push('useTemplateDesignerStore.ts: deleting a sub-table node must also remove its placed sub-table child fields');
if (!storeFile.includes('removeNodeAndSubTableFieldsFromTree')) failures.push('useTemplateDesignerStore.ts: removeNode must cascade-delete placed child fields when removing a sub-table');
if (!storeFile.includes('nodes: removeNodeAndSubTableFieldsFromTree(page.nodes, nodeId)') && !storeFile.includes('nodes: reconcileSubTableRegionTemplates(removeNodeAndSubTableFieldsFromTree(page.nodes, nodeId))')) failures.push('useTemplateDesignerStore.ts: removeNode action must use cascading sub-table deletion');
if (!storeFile.includes('selectedNode?.type === \'sub-table\' ? page.nodes')) failures.push('useTemplateDesignerStore.ts: Delete/Backspace clearing must not directly delete selected sub-table nodes');
if (!storeFile.includes('addNodeFromFieldToRange')) failures.push('useTemplateDesignerStore.ts: missing range-target field insertion action');
if (!storeFile.includes('createDefaultSubTableRegion')) failures.push('useTemplateDesignerStore.ts: missing sub-table region default helper import or usage');
if (!storeFile.includes('createBoundSubTableRegionNode')) failures.push('useTemplateDesignerStore.ts: missing sub-table region node creation helper');
if (!storeFile.includes('addSubTableRegionFromFieldToRange')) failures.push('useTemplateDesignerStore.ts: missing sub-table region insertion action');
if (!storeFile.includes('setSubTableRecordTemplateFromRange')) failures.push('useTemplateDesignerStore.ts: missing sub-table record-template grouping action');
if (!storeFile.includes('reconcileSubTableRegionTemplates')) failures.push('useTemplateDesignerStore.ts: missing sub-table record template reconciliation');
if (!storeFile.includes('rebuildSubTableRecordTemplate')) failures.push('useTemplateDesignerStore.ts: missing sub-table record template rebuild helper usage');
if (!storeFile.includes('updateSelectedSubTableRegion')) failures.push('useTemplateDesignerStore.ts: missing selected sub-table region update action');
if (!storeFile.includes('setSelectedSubTableHeaderVisible')) failures.push('useTemplateDesignerStore.ts: missing selected sub-table header toggle action');
if (!storeFile.includes('shiftCanvasNodesForDeletedRows')) failures.push('useTemplateDesignerStore.ts: disabling sub-table header must delete the reserved header row and shift nodes back');
if (!storeFile.includes('rowHeights: deleteSizes(')) failures.push('useTemplateDesignerStore.ts: disabling sub-table header must retract the inserted sheet row');
if (!storeFile.includes('resolveFixedRepeatFromTemplateRange')) failures.push('useTemplateDesignerStore.ts: fixed sub-table data grouping must derive repeat stride/count from the grouped range');
if (!storeFile.includes('selectedNodeId: subTableNodeId')) failures.push('useTemplateDesignerStore.ts: sub-table data grouping must select the sub-table so the result is visible in configuration');
if (!canvasTypes.includes('groupRange?: CanvasSelectionRange')) failures.push('canvas.ts: sub-table record template must persist the current data grouping range');
if (!storeFile.includes('groupRange: normalizedRange')) failures.push('useTemplateDesignerStore.ts: data grouping must persist the selected grouped range for canvas rendering');
if (!storeFile.includes('shiftCanvasNodesForInsertedRows')) failures.push('useTemplateDesignerStore.ts: inserting rows must shift bound component cell ranges');
if (!storeFile.includes('shiftCanvasNodesForInsertedRows(page.nodes, insertAt, count, rowOffset)')) failures.push('useTemplateDesignerStore.ts: insertSheetRows must shift bound component nodes when rows are inserted');
const shiftSubTableInsertedRowsBlock = storeFile.match(/function shiftSubTableRegionForInsertedRows\([\s\S]*?\n}\n\nfunction shiftRangeForDeletedRows/)?.[0] ?? '';
const shiftSubTableDeletedRowsBlock = storeFile.match(/function shiftSubTableRegionForDeletedRows\([\s\S]*?\n}\n\nfunction getSubTableRegionPrimaryRange/)?.[0] ?? '';
const shiftSubTableDeletedColumnsBlock = storeFile.match(/function shiftSubTableRegionForDeletedColumns\([\s\S]*?\n}\n\nfunction getSubTableRegionPrimaryRange/)?.[0] ?? '';
if (!shiftSubTableInsertedRowsBlock.includes('groupRange: region.recordTemplate.groupRange')) failures.push('useTemplateDesignerStore.ts: inserting rows must shift sub-table data group ranges');
if (!shiftSubTableInsertedRowsBlock.includes('shiftRangeForInsertedRows(region.recordTemplate.groupRange, insertAt, count)')) failures.push('useTemplateDesignerStore.ts: inserted-row sub-table group range shifting must use the same row range helper as region fragments');
if (!shiftSubTableDeletedRowsBlock.includes('const nextGroupRange = region.recordTemplate.groupRange')) failures.push('useTemplateDesignerStore.ts: deleting rows must calculate the shifted sub-table data group range');
if (!shiftSubTableDeletedRowsBlock.includes('shiftRangeForDeletedRows(region.recordTemplate.groupRange, deleteStart, count)')) failures.push('useTemplateDesignerStore.ts: deleted-row sub-table group range shifting must use the same row range helper as region fragments');
if (!shiftSubTableDeletedRowsBlock.includes('groupRange: nextGroupRange ?? undefined')) failures.push('useTemplateDesignerStore.ts: deleting rows must drop a sub-table data group range when its rows are fully deleted');
if (!storeFile.includes('function shiftRangeForDeletedColumns')) failures.push('useTemplateDesignerStore.ts: missing deleted-column range shifting helper');
if (!storeFile.includes('function shiftSubTableRegionForDeletedColumns')) failures.push('useTemplateDesignerStore.ts: deleting columns must shift sub-table regions and group ranges');
if (!storeFile.includes('function shiftCanvasNodesForDeletedColumns')) failures.push('useTemplateDesignerStore.ts: deleting columns must delete or shift bound component nodes');
if (!shiftSubTableDeletedColumnsBlock.includes('const nextGroupRange = region.recordTemplate.groupRange')) failures.push('useTemplateDesignerStore.ts: deleting columns must calculate the shifted sub-table data group range');
if (!shiftSubTableDeletedColumnsBlock.includes('shiftRangeForDeletedColumns(region.recordTemplate.groupRange, deleteStart, count)')) failures.push('useTemplateDesignerStore.ts: deleted-column sub-table group range shifting must use the same column range helper as region fragments');
if (!shiftSubTableDeletedColumnsBlock.includes('groupRange: nextGroupRange ?? undefined')) failures.push('useTemplateDesignerStore.ts: deleting columns must drop a sub-table data group range when its columns are fully deleted');
const deleteSheetColumnsBlock = storeFile.match(/deleteSheetColumns: \(colStart, colEnd = colStart\) => set\(\(state\) => \{[\s\S]*?\n  \}\),\n  deleteSheetRows:/)?.[0] ?? '';
if (!deleteSheetColumnsBlock.includes('const columnOffset = sumSizes(')) failures.push('useTemplateDesignerStore.ts: deleteSheetColumns must measure deleted column width before shifting bound nodes');
if (!deleteSheetColumnsBlock.includes('shiftCanvasNodesForDeletedColumns(page.nodes, deleteRange.start, deleteRange.count, columnOffset)')) failures.push('useTemplateDesignerStore.ts: deleteSheetColumns must shift bound component nodes when columns are deleted');
if (!deleteSheetColumnsBlock.includes('nodes: reconcileSubTableRegionTemplates(')) failures.push('useTemplateDesignerStore.ts: deleteSheetColumns must rebuild sub-table templates after column deletion shifts regions');
const deleteSheetRowsBlock = storeFile.match(/deleteSheetRows: \(rowStart, rowEnd = rowStart\) => set\(\(state\) => \{[\s\S]*?\n  \}\),\n  updateSheetCellValue:/)?.[0] ?? '';
if (!deleteSheetRowsBlock.includes('const rowOffset = sumSizes(')) failures.push('useTemplateDesignerStore.ts: deleteSheetRows must measure deleted row height before shifting bound nodes');
if (!deleteSheetRowsBlock.includes('shiftCanvasNodesForDeletedRows(page.nodes, deleteRange.start, deleteRange.count, rowOffset)')) failures.push('useTemplateDesignerStore.ts: deleteSheetRows must shift bound component nodes when rows are deleted');
if (!deleteSheetRowsBlock.includes('nodes: reconcileSubTableRegionTemplates(')) failures.push('useTemplateDesignerStore.ts: deleteSheetRows must rebuild sub-table templates after row deletion shifts regions');
if (!storeFile.includes('expandSelectedSubTableForHeaderRow')) failures.push('useTemplateDesignerStore.ts: enabling sub-table header must insert and reserve a table header row');
if (!storeFile.includes("selectedNode?.type === 'sub-table'")) failures.push('useTemplateDesignerStore.ts: Backspace/Delete clearing must not directly delete selected sub-table nodes');
if (!storeFile.includes('getSelectedSubTableRegionNode')) failures.push('useTemplateDesignerStore.ts: missing selected sub-table region selector');
if (!storeFile.includes('layoutRange = normalizeRange(range)')) failures.push('useTemplateDesignerStore.ts: range-target field insertion must normalize the selected range');
if (!storeFile.includes('removeCellFieldNodesFromTree(page.nodes, layoutRange)')) failures.push('useTemplateDesignerStore.ts: range-target field insertion must replace field nodes in the selected range');
if (!storeFile.includes("position: 'absolute'")) failures.push('useTemplateDesignerStore.ts: cell-target field insertion must create an absolute component');
if (!canvasWorkspace.includes('SHEET_ROW_RENDER_OVERSCAN_PX')) failures.push('CanvasSheetWorkspace.tsx: sheet rendering must use row-window overscan for large canvases');
if (!canvasWorkspace.includes('visibleRowRange')) failures.push('CanvasSheetWorkspace.tsx: sheet rendering must compute a visible row range');
if (!canvasWorkspace.includes('gridRow: `${row} / span ${spanRows}`')) failures.push('CanvasSheetWorkspace.tsx: virtualized sheet cells must preserve absolute grid row placement');
if (!canvasWorkspace.includes('getCanvasNodeContentBottom')) failures.push('CanvasSheetWorkspace.tsx: page break height must include canvas node content bottom');
if (!canvasWorkspace.includes('Math.max(sheetContentBottom, 1)')) failures.push('CanvasSheetWorkspace.tsx: sheet page break height must keep one page without counting blank trailing rows');
if (!storeFile.includes('compLeft: layout.left') || !storeFile.includes('compTop: layout.top')) failures.push('useTemplateDesignerStore.ts: cell-target field insertion must use the target cell position');
if (!storeFile.includes('MIN_CELL_FIELD_WIDTH') || !storeFile.includes('MIN_CELL_FIELD_HEIGHT')) failures.push('useTemplateDesignerStore.ts: cell-target field insertion must initialize minimum component width and height');
if (!storeFile.includes('MIN_CELL_FIELD_HEIGHT = 24 + CELL_FIELD_INSET * 2')) failures.push('useTemplateDesignerStore.ts: cell-target field visible minimum height must be 24px');
if (!storeFile.includes('compWidth: Math.max(layout.width, MIN_CELL_FIELD_WIDTH)') || !storeFile.includes('compHeight: Math.max(layout.height, MIN_CELL_FIELD_HEIGHT)')) failures.push('useTemplateDesignerStore.ts: cell-target field insertion must use the larger value between target cell size and minimum component size');
if (!storeFile.includes('cellRange: layout.range')) failures.push('useTemplateDesignerStore.ts: cell-target field insertion must persist the target cell range');
if (!storeFile.includes("field.type === 'subTable' && (!selectedRange || !isMultiCellRange(normalizeRange(selectedRange)))")) failures.push('useTemplateDesignerStore.ts: sub-table fields must only be drawable from a multi-cell selection');
if (!storeFile.includes('getFieldById')) failures.push('useTemplateDesignerStore.ts: missing getFieldById helper');
if (!storeFile.includes('syncBoundNodesForField')) failures.push('useTemplateDesignerStore.ts: missing bound-node sync helper');
if (!storeFile.includes('bindings?.fieldId === fieldId')) failures.push('useTemplateDesignerStore.ts: missing field-to-canvas propagation');
if (!storeFile.includes('setFieldStatus')) failures.push('useTemplateDesignerStore.ts: fields must be enabled/disabled instead of physically deleted');
if (!storeFile.includes('getUsedFieldIdsForCurrentVersion')) failures.push('useTemplateDesignerStore.ts: missing current-version used field selector');
if (!storeFile.includes('getAvailableFieldsForCurrentVersion')) failures.push('useTemplateDesignerStore.ts: missing enabled unused field selector');
if (!storeFile.includes('removeNode')) failures.push('useTemplateDesignerStore.ts: missing canvas node removal action');
if (!storeFile.includes('updateNodeStyle')) failures.push('useTemplateDesignerStore.ts: missing node style update action');
if (!storeFile.includes('moveNode')) failures.push('useTemplateDesignerStore.ts: missing node move action');
if (storeFile.includes('removeField')) failures.push('useTemplateDesignerStore.ts: field definitions must not expose physical removal');
if (storeFile.includes('clearRemovedFieldBindings')) failures.push('useTemplateDesignerStore.ts: field binding cleanup for deleted fields must be removed');
if (!storeFile.includes('replaceCurrentPageFromImport')) failures.push('useTemplateDesignerStore.ts: missing import page replacement action');
if (storeFile.includes('CanvasPage | CanvasPage[]')) failures.push('useTemplateDesignerStore.ts: import replacement must keep a single continuous CanvasPage');
if (!storeFile.includes('undoStack: TemplateDesignerDocument[]')) failures.push('useTemplateDesignerStore.ts: missing undo history stack');
if (!storeFile.includes('redoStack: TemplateDesignerDocument[]')) failures.push('useTemplateDesignerStore.ts: missing redo history stack');
if (!storeFile.includes('pushDocumentHistory')) failures.push('useTemplateDesignerStore.ts: missing document history helper');
if (!storeFile.includes('undoCanvasChange')) failures.push('useTemplateDesignerStore.ts: missing undoCanvasChange action');
if (!storeFile.includes('redoCanvasChange')) failures.push('useTemplateDesignerStore.ts: missing redoCanvasChange action');
if (!storeFile.includes('canUndoCanvasChange')) failures.push('useTemplateDesignerStore.ts: missing canUndoCanvasChange selector');
if (!storeFile.includes('canRedoCanvasChange')) failures.push('useTemplateDesignerStore.ts: missing canRedoCanvasChange selector');
if (!componentRegistry.includes("type === 'tabs'")) failures.push('componentRegistry.tsx: missing structured tabs default node');
if (!componentRegistry.includes("type === 'grid'")) failures.push('componentRegistry.tsx: missing structured grid default node');
if (!renderer.includes('ArrowUpward')) failures.push('CanvasNodeRenderer.tsx: missing move-up action');
if (!renderer.includes('ArrowDownward')) failures.push('CanvasNodeRenderer.tsx: missing move-down action');
if (!renderer.includes('moveNode')) failures.push('CanvasNodeRenderer.tsx: missing node reorder wiring');
if (!renderer.includes('isAbsoluteNode')) failures.push('CanvasNodeRenderer.tsx: missing absolute-position node rendering helper');
if (!componentRegistry.includes('static-text')) failures.push('componentRegistry.tsx: missing static-text component for imported Word text');
if (!componentRegistry.includes('static-image')) failures.push('componentRegistry.tsx: missing static-image component for imported Word images');
if (!templateImportUtils.includes('importTemplateToCanvasPage')) failures.push('templateImport.ts: missing importTemplateToCanvasPage orchestrator');
if (templateImportUtils.includes('normalizeImportPages')) failures.push('templateImport.ts: imported Excel must not normalize multiple split canvas pages');
if (!templateImportUtils.includes('orientation')) failures.push('templateImport.ts: missing orientation normalization');
if (!excelImportUtils.includes('importExcelToCanvasPage')) failures.push('importExcel.ts: missing excel import converter');
if (excelImportUtils.includes('importExcelToCanvasPages')) failures.push('importExcel.ts: Excel import must return one continuous canvas page');
if (!excelImportUtils.includes('createImportedCanvasPage')) failures.push('importExcel.ts: Excel import must create one continuous canvas page');
if (excelImportUtils.includes('createImportedCanvasPages')) failures.push('importExcel.ts: Excel import must not split content into multiple canvas pages');
if (!excelImportUtils.includes('sheet.columnWidths')) failures.push('importExcel.ts: missing excel column width mapping');
if (!excelImportUtils.includes('safeGetWorksheetImages')) failures.push('importExcel.ts: modern Excel image lookup must be isolated from cell import');
if (!excelImportUtils.includes('safeGetImageRange')) failures.push('importExcel.ts: modern Excel image range lookup must tolerate unsupported anchors');
if (!excelImportUtils.includes('normalizeImportedCheckboxGlyphs')) failures.push('importExcel.ts: Excel import must normalize Wingdings checkbox glyphs such as £ back to visible checkbox symbols');
if (!excelImportUtils.includes('shouldPreserveMergedTextLayout')) failures.push('importExcel.ts: merged checkbox/list cells must keep their original merged layout instead of being whitespace-split');
if (!excelImportUtils.includes('applyPreservedMergedTextWrap')) failures.push('importExcel.ts: preserved merged checkbox/special-text cells must be forced to wrap');
if (!excelImportUtils.includes("whiteSpace: 'normal'")) failures.push('importExcel.ts: preserved merged checkbox/special-text cells must set normal whitespace for display wrapping');
if (!excelImportUtils.includes('DEFAULT_IMPORTED_LINE_HEIGHT')) failures.push('importExcel.ts: preserved merged checkbox/special-text cells must keep readable wrapped line height');
if (!canvasTypes.includes('color?: string')) failures.push('canvas.ts: imported cell borders must be able to persist their original color');
if (!excelImportUtils.includes('IMPORTED_EXCEL_BORDER_COLOR')) failures.push('importExcel.ts: Excel-imported borders must have an explicit black color token');
if (!excelImportUtils.includes('color: IMPORTED_EXCEL_BORDER_COLOR')) failures.push('importExcel.ts: imported Excel border objects must carry the black border color');
if (!excelImportUtils.includes('buildExcelJsEffectiveFont')) failures.push('importExcel.ts: modern Excel import must resolve effective font styles from cell/row/column/rich text');
if (!excelImportUtils.includes('readExcelFontSize')) failures.push('importExcel.ts: modern Excel import must normalize effective font size');
if (!excelImportUtils.includes('readExcelFontBold')) failures.push('importExcel.ts: modern Excel import must normalize effective bold style');
if (!excelImportUtils.includes('cell.worksheet.getRow(cell.fullAddress.row).font')) failures.push('importExcel.ts: modern Excel import must inspect row font styles');
if (!excelImportUtils.includes('cell.worksheet.getColumn(cell.fullAddress.col).font')) failures.push('importExcel.ts: modern Excel import must inspect column font styles');
if (!excelImportUtils.includes('normalizeCellValue(cell.value, cell.text, effectiveFont?.name)')) failures.push('importExcel.ts: modern Excel import must normalize text with the effective font name');
if (!excelImportUtils.includes('MERGED_TEXT_SPLIT_GAP_PATTERN')) failures.push('importExcel.ts: missing merged-cell whitespace split detector');
if (!excelImportUtils.includes('splitMergedCellTextByWhitespace')) failures.push('importExcel.ts: missing merged-cell text split helper');
if (!excelImportUtils.includes('applyMergedWhitespaceSplits')) failures.push('importExcel.ts: missing merged-cell whitespace split application');
if (!excelImportUtils.includes('findColumnForMergedTextOffset')) failures.push('importExcel.ts: merged text split must map text offsets back to imported column widths');
if (!excelImportUtils.includes('remainingMergedCells')) failures.push('importExcel.ts: split merged cells must be removed from mergedCells');
if (!excelImportUtils.includes('!shouldPreserveMergedTextLayout(sourceValue)') && !excelImportUtils.includes('!shouldPreserveLayout')) failures.push('importExcel.ts: whitespace split must skip merged cells containing checkbox markers or line breaks');
if (!excelImportUtils.includes('normalizeCellValue(cell.value, cell.text, effectiveFont?.name)')) failures.push('importExcel.ts: modern Excel import must pass effective font name when normalizing cell text');
if (!excelImportUtils.includes('normalizeCellValue(cell.v, cell.w, getLegacyCellFontName(cell))')) failures.push('importExcel.ts: legacy Excel import must pass font name when normalizing cell text');
if ((excelImportUtils.match(/applyMergedWhitespaceSplits\(/g) ?? []).length < 3) failures.push('importExcel.ts: both modern and legacy Excel import paths must apply merged whitespace splitting');
if (!excelImportUtils.includes('applyLongTextOverflowLayout')) failures.push('importExcel.ts: missing long-text overflow layout adjustment');
if (!excelImportUtils.includes('findRightBlankOverflowMergeEnd')) failures.push('importExcel.ts: long text must inspect blank cells to the right before wrapping');
if (!excelImportUtils.includes('estimateImportedTextPixelWidth')) failures.push('importExcel.ts: long text overflow detection must estimate imported text width');
if (!excelImportUtils.includes('estimateImportedTextHeight')) failures.push('importExcel.ts: long text blocked by right-side values must increase row height');
if (!excelImportUtils.includes('hasCellTextValue')) failures.push('importExcel.ts: right-side blank detection must be based on cell text value');
if ((excelImportUtils.match(/applyLongTextOverflowLayout\(/g) ?? []).length < 3) failures.push('importExcel.ts: both modern and legacy Excel import paths must apply long-text overflow layout');
if (!excelImportUtils.includes('overflowGrid.rowHeights')) failures.push('importExcel.ts: Excel import must use row heights adjusted for long-text wrapping');
if (!excelImportUtils.includes('overflowGrid.mergedCells')) failures.push('importExcel.ts: Excel import must use auto-merged ranges for long text');
if (!excelImportUtils.includes('mergeImportedCellBorders')) failures.push('importExcel.ts: missing merged-cell border preservation helper');
if (!excelImportUtils.includes('aggregateMergedRangeBorder')) failures.push('importExcel.ts: merged-cell borders must be aggregated onto the rendered top-left cell');
if (!excelImportUtils.includes('sourceCell?.border?.top')) failures.push('importExcel.ts: merged-cell border aggregation must inspect top-edge cells');
if (!excelImportUtils.includes('sourceCell?.border?.right')) failures.push('importExcel.ts: merged-cell border aggregation must inspect right-edge cells');
if (!excelImportUtils.includes('sourceCell?.border?.bottom')) failures.push('importExcel.ts: merged-cell border aggregation must inspect bottom-edge cells');
if (!excelImportUtils.includes('sourceCell?.border?.left')) failures.push('importExcel.ts: merged-cell border aggregation must inspect left-edge cells');
if ((excelImportUtils.match(/mergeImportedCellBorders\(/g) ?? []).length < 3) failures.push('importExcel.ts: both modern and legacy Excel import paths must preserve merged-cell borders after layout adjustment');
if (!canvasWorkspace.includes("cellBorder?.color ?? '#000000'")) failures.push('CanvasSheetWorkspace.tsx: imported cell borders must render as black unless a stored border color exists');
if (!pageThumbnails.includes("cell.border?.color ?? '#000000'")) failures.push('CanvasPageThumbnails.tsx: thumbnail cell borders must render as black unless a stored border color exists');
if (!canvasWorkspace.includes('shouldRenderCellBorderEdge')) failures.push('CanvasSheetWorkspace.tsx: imported cell borders must avoid drawing shared adjacent edges twice');
if (!canvasWorkspace.includes('isAdjacentCellBorderCovered')) failures.push('CanvasSheetWorkspace.tsx: shared border de-duplication must check adjacent cells before rendering right/bottom edges');
if (!canvasWorkspace.includes("shouldRenderCellBorderEdge(sheetRenderPage, cellSelectionRange, 'right')")) failures.push('CanvasSheetWorkspace.tsx: right imported borders must be de-duplicated against adjacent left borders');
if (!canvasWorkspace.includes("shouldRenderCellBorderEdge(sheetRenderPage, cellSelectionRange, 'bottom')")) failures.push('CanvasSheetWorkspace.tsx: bottom imported borders must be de-duplicated against adjacent top borders');
if (!pageThumbnails.includes('shouldRenderThumbnailCellBorderEdge')) failures.push('CanvasPageThumbnails.tsx: thumbnail imported cell borders must avoid drawing shared adjacent edges twice');
if (!pageThumbnails.includes('isThumbnailAdjacentCellBorderCovered')) failures.push('CanvasPageThumbnails.tsx: thumbnail shared border de-duplication must check adjacent cells before rendering right/bottom edges');
if (!excelImportUtils.includes('return importModernExcel(file, pageId, pageName).catch(() => importLegacyExcel(file, pageId, pageName));')) failures.push('importExcel.ts: modern Excel import failures must fall back to legacy cell import');
if (!importGridUtils.includes('createImportedCanvasPage')) failures.push('importGrid.ts: missing continuous imported canvas page factory');
if (!importGridUtils.includes('fitImportedColumnWidthsToPaper')) failures.push('importGrid.ts: imported column widths must be fitted to the A4 paper content width');
if (!importGridUtils.includes('getImportedPaperContentWidth')) failures.push('importGrid.ts: missing import paper content width helper');
if (!importGridUtils.includes("orientation === 'landscape' ? A4_PAPER_HEIGHT_MM : A4_PAPER_WIDTH_MM")) failures.push('importGrid.ts: imported width fitting must use landscape/portrait A4 content widths');
if (!importGridUtils.includes('DEFAULT_SIDE_MARGIN_MM * 2')) failures.push('importGrid.ts: imported width fitting must respect paper side margins');
if (!importGridUtils.includes('const fittedColumnWidths = fitImportedColumnWidthsToPaper')) failures.push('importGrid.ts: createImportedCanvasPage must store fitted imported column widths');
if (!importGridUtils.includes('nodes?: CanvasPage[\'nodes\']')) failures.push('importGrid.ts: imported pages must accept overlay nodes without affecting Excel callers');
if (!importGridUtils.includes('wordDocument?: CanvasWordDocument')) failures.push('importGrid.ts: imported DOCX pages must persist the independent Word document layer');
if (!importGridUtils.includes('importedGridTop: params.gridTop ?? 0')) failures.push('importGrid.ts: imported pages must persist the Word table-grid top offset');
if (importGridUtils.includes('buildImportPageSlices')) failures.push('importGrid.ts: imported grid must not be sliced into per-page row/column chunks');
if (importGridUtils.includes('sliceImportedGridPage')) failures.push('importGrid.ts: imported grid must remain one continuous sheet');
if (importGridUtils.includes('createImportedCanvasPages')) failures.push('importGrid.ts: imported grid must not create multiple canvas pages');
if (!wordImportUtils.includes('importWordToCanvasPage')) failures.push('importWord.ts: missing word import converter');
if (!wordImportUtils.includes('blocksToWordDocument')) failures.push('importWord.ts: DOCX import must convert content into an independent Word document layer');
if (!wordImportUtils.includes("type: 'table'")) failures.push('importWord.ts: Word tables must remain Word table blocks in free mode');
if (!wordImportUtils.includes('wordDocument,')) failures.push('importWord.ts: imported DOCX page must carry wordDocument separately from the sheet grid');
if (!wordImportUtils.includes('cells: {}')) failures.push('importWord.ts: DOCX free mode must not use sheet cells to render Word content');
if (wordImportUtils.includes('paragraphRows')) failures.push('importWord.ts: Word paragraphs must not be represented as merged sheet rows in free mode');
if (!commonComponentRegistry.includes("'时间差'")) failures.push('commonComponentRegistry.ts: missing the approved time-difference component');
if (!componentLibrary.includes('data-common-component-library="true"')) failures.push('ComponentLibrary.tsx: missing stable component-library marker');
if (!componentLibrary.includes('commonCanvasComponents')) failures.push('ComponentLibrary.tsx: must render the component-management catalogue');
if (!componentLibrary.includes('TableChartOutlined')) failures.push('ComponentLibrary.tsx: table component must render a table icon');
if (!componentLibrary.includes('draggable')) failures.push('ComponentLibrary.tsx: common components must support drag insertion');
if (!componentLibrary.includes('template-designer-common-component-insert')) failures.push('ComponentLibrary.tsx: common components must support click insertion');
if (!canvasTab.includes("import ComponentLibrary from '../../components/ComponentLibrary'")) failures.push('CanvasTab.tsx: missing component library import');
if (!canvasTab.includes("panelRail === 'grid' ? <ComponentLibrary />")) failures.push('CanvasTab.tsx: component rail must render ComponentLibrary');
if (!storeFile.includes('addFreeCanvasComponent: (componentId: CommonDisplayComponentId')) failures.push('useTemplateDesignerStore.ts: missing free-canvas component insertion action');
if (!canvasWorkspace.includes('template-designer-common-component-insert')) failures.push('CanvasSheetWorkspace.tsx: free canvas must receive component click insertion');
if (!canvasWorkspace.includes('application/x-template-designer-common-component')) failures.push('CanvasSheetWorkspace.tsx: free canvas must receive component drag insertion');
const wordDocumentBuilderStart = wordImportUtils.indexOf('function blocksToWordDocument(');
const wordDocumentBuilderEnd = wordImportUtils.indexOf('\nfunction resolveDocxOrientation', wordDocumentBuilderStart);
const wordDocumentBuilder = wordDocumentBuilderStart >= 0 && wordDocumentBuilderEnd >= 0
  ? wordImportUtils.slice(wordDocumentBuilderStart, wordDocumentBuilderEnd)
  : '';
const wordParagraphNodeBuilderStart = wordImportUtils.indexOf('function buildWordParagraphNodes(');
const wordParagraphNodeBuilderImageEnd = wordImportUtils.indexOf('\nfunction buildWordImageNodes', wordParagraphNodeBuilderStart);
const wordParagraphNodeBuilderFallbackEnd = wordImportUtils.indexOf('\nfunction blocksToWordDocument', wordParagraphNodeBuilderStart);
const wordParagraphNodeBuilderEnd = wordParagraphNodeBuilderImageEnd >= 0
  ? wordParagraphNodeBuilderImageEnd
  : wordParagraphNodeBuilderFallbackEnd;
const wordParagraphNodeBuilder = wordParagraphNodeBuilderStart >= 0 && wordParagraphNodeBuilderEnd > wordParagraphNodeBuilderStart
  ? wordImportUtils.slice(wordParagraphNodeBuilderStart, wordParagraphNodeBuilderEnd)
  : '';
const wordImageNodeBuilderStart = wordImportUtils.indexOf('function buildWordImageNodes(');
const wordImageNodeBuilderEnd = wordImportUtils.indexOf('\nfunction blocksToWordDocument', wordImageNodeBuilderStart);
const wordImageNodeBuilder = wordImageNodeBuilderStart >= 0 && wordImageNodeBuilderEnd >= 0
  ? wordImportUtils.slice(wordImageNodeBuilderStart, wordImageNodeBuilderEnd)
  : '';
const docxPageImporterStart = wordImportUtils.indexOf('async function importDocxToCanvasPage(');
const docxPageImporterEnd = wordImportUtils.indexOf('\nasync function importLegacyDocToCanvasPage', docxPageImporterStart);
const docxPageImporter = docxPageImporterStart >= 0 && docxPageImporterEnd >= 0
  ? wordImportUtils.slice(docxPageImporterStart, docxPageImporterEnd)
  : '';
const normalizeWordDocumentStart = documentUtils.indexOf('function normalizeWordDocument(');
const normalizeWordDocumentEnd = documentUtils.indexOf('\nfunction normalizeCanvasPage', normalizeWordDocumentStart);
const normalizeWordDocument = normalizeWordDocumentStart >= 0 && normalizeWordDocumentEnd >= 0
  ? documentUtils.slice(normalizeWordDocumentStart, normalizeWordDocumentEnd)
  : '';
const legacyWordRendererStart = canvasWorkspace.indexOf('const renderWordDocumentLayer = () => {');
const legacyWordRendererEnd = canvasWorkspace.indexOf('\n  const renderWordTableDragHandleLayer = () => {', legacyWordRendererStart);
const legacyWordRenderer = legacyWordRendererStart >= 0 && legacyWordRendererEnd >= 0
  ? canvasWorkspace.slice(legacyWordRendererStart, legacyWordRendererEnd)
  : '';
const commonTableInsertionStart = canvasWorkspace.indexOf('const insertCommonComponentAtClientPoint = useCallback(');
const commonTableInsertionEnd = canvasWorkspace.indexOf('\n  const updateWordParagraphText', commonTableInsertionStart);
const commonTableInsertion = commonTableInsertionStart >= 0 && commonTableInsertionEnd >= 0
  ? canvasWorkspace.slice(commonTableInsertionStart, commonTableInsertionEnd)
  : '';
if (!normalizeWordDocument.includes('borderEncodingVersion: source.borderEncodingVersion === 2 ? 2 : undefined')) failures.push('document.ts: Word border encoding version must survive persisted document normalization');
if (!normalizeWordDocument.includes('normalizeWordTableBlock')) failures.push('document.ts: Word table normalization must retain table-level border encoding');
if (!commonTableInsertion.includes('? { ...wordDocument, blocks: [...wordDocument.blocks, table] }')) failures.push('CanvasSheetWorkspace.tsx: adding a v2 table to an old document must not upgrade the document border encoding');
if (commonTableInsertion.includes('wordDocument, borderEncodingVersion: 2')) failures.push('CanvasSheetWorkspace.tsx: adding a v2 table must not force an old document to use v2 borders');
if (!legacyWordRenderer.includes('(block.borderEncodingVersion ?? wordDocument.borderEncodingVersion) !== 2')) failures.push('CanvasSheetWorkspace.tsx: each Word table must prefer its own border encoding before falling back to the document version');
if (!canvasWorkspace.includes('shouldRenderWordTableOuterBorder')) failures.push('CanvasSheetWorkspace.tsx: Word table outer borders must honor explicit no-border edges');
if (legacyWordRenderer.includes("borderBottom: '1px solid #111827'")) failures.push('CanvasSheetWorkspace.tsx: Word table container must not force a bottom border over explicit no-border cells');
const freeCanvasDeleteHandlerBlock = canvasWorkspace.match(/const handleFreeCanvasDeleteKeyDown = \(event: KeyboardEvent\) => \{[\s\S]*?\n    \};/)?.[0] ?? '';
const toolbarColorButtonBlock = canvasToolbar.match(/function ToolbarColorButton\([\s\S]*?\n}\n\nfunction toBooleanTextDecoration/)?.[0] ?? '';
const staticImageThumbnailBranch = pageThumbnails.match(/\{\s*node\.type === 'static-image'\s*\?\s*\([\s\S]*?\)\s*:\s*String\(node\.type === 'static-text'/)?.[0] ?? '';
if (!/const nodes\s*=\s*\[\s*\.\.\.buildWordParagraphNodes\(blocks, contentWidth\),\s*\.\.\.buildWordImageNodes\(images, medias\),?\s*\]/.test(docxPageImporter)) failures.push('importWord.ts: DOCX paragraph and image components must be combined into the persisted canvas node array');
const docxWordDocumentAssignment = /const wordDocument\s*=\s*blocksToWordDocument\(blocks, contentWidth\);/.test(docxPageImporter);
const docxCanvasPageStart = docxPageImporter.indexOf('return createImportedCanvasPage({');
const docxGridStart = docxPageImporter.indexOf('grid:', docxCanvasPageStart);
const docxWordDocumentProperty = docxPageImporter.indexOf('wordDocument,', docxCanvasPageStart);
if (!docxWordDocumentAssignment || (docxPageImporter.match(/blocksToWordDocument\(/g) ?? []).length !== 1 || docxWordDocumentProperty < docxCanvasPageStart || docxWordDocumentProperty > docxGridStart) {
  failures.push('importWord.ts: importDocxToCanvasPage must persist only the blocksToWordDocument(blocks, contentWidth) result as wordDocument');
}
if (!docxPageImporter.includes('    nodes,')) failures.push('importWord.ts: DOCX paragraph components must be persisted on the imported canvas page');
if (wordParagraphNodeBuilderStart < 0 || wordParagraphNodeBuilderEnd <= wordParagraphNodeBuilderStart || !wordParagraphNodeBuilder.trim()) {
  failures.push('importWord.ts: missing a bounded buildWordParagraphNodes helper');
} else {
  if (!wordParagraphNodeBuilder.includes('splitWordParagraphComponents(block.text, fontSize)')) failures.push('importWord.ts: buildWordParagraphNodes must derive static-text content from block.text');
  if (!/nodes\.push\(\{[\s\S]*?type:\s*'static-text'[\s\S]*?props:\s*\{[\s\S]*?text:\s*segment\.text/.test(wordParagraphNodeBuilder)) failures.push('importWord.ts: buildWordParagraphNodes must persist each paragraph segment as static-text props');
  if (!/style:\s*\{[\s\S]*?compLeft:[\s\S]*?layout\.left[\s\S]*?compTop:\s*layout\.top[\s\S]*?compWidth:[\s\S]*?compHeight:\s*layout\.height[\s\S]*?\.\.\.block\.style/.test(wordParagraphNodeBuilder)) failures.push('importWord.ts: buildWordParagraphNodes must persist block layout and style on static-text nodes');
}
if (wordImageNodeBuilderStart < 0 || wordImageNodeBuilderEnd <= wordImageNodeBuilderStart || !wordImageNodeBuilder.trim()) {
  failures.push('importWord.ts: missing a bounded buildWordImageNodes helper before blocksToWordDocument');
} else {
  if (!wordImageNodeBuilder.includes("type: 'static-image'")) failures.push('importWord.ts: DOCX images must use the standard static-image type');
  if (!wordImageNodeBuilder.includes('new Map(medias.map((media) => [media.id, media.src]))')) failures.push('importWord.ts: DOCX image components must map mediaId to the imported media src');
  if (!wordImageNodeBuilder.includes('const src = mediaSrcById.get(image.mediaId)')) failures.push('importWord.ts: DOCX image components must resolve their source from mediaId');
  if (!/props:\s*\{[\s\S]*?\bsrc\s*,/.test(wordImageNodeBuilder)) failures.push('importWord.ts: DOCX image components must persist the resolved src in static-image props');
  if (!/compLeft:\s*image\.layout\.left/.test(wordImageNodeBuilder)) failures.push('importWord.ts: DOCX image components must map image left to compLeft');
  if (!/compTop:\s*image\.layout\.top/.test(wordImageNodeBuilder)) failures.push('importWord.ts: DOCX image components must map image top to compTop');
  if (!/compWidth:\s*image\.layout\.width/.test(wordImageNodeBuilder)) failures.push('importWord.ts: DOCX image components must map image width to compWidth');
  if (!/compHeight:\s*image\.layout\.height/.test(wordImageNodeBuilder)) failures.push('importWord.ts: DOCX image components must map image height to compHeight');
}
if (wordDocumentBuilderStart < 0 || wordDocumentBuilderEnd <= wordDocumentBuilderStart || !wordDocumentBuilder.trim()) {
  failures.push('importWord.ts: unable to locate a non-empty blocksToWordDocument helper');
} else {
  if (!/blocks\.forEach\(\(block\) => \{/.test(wordDocumentBuilder)) failures.push('importWord.ts: blocksToWordDocument must iterate the parsed DOCX blocks');
  if (!/if \(block\.type === 'paragraph'\) \{[\s\S]*?return;[\s\S]*?\}/.test(wordDocumentBuilder)) failures.push('importWord.ts: blocksToWordDocument must skip paragraph blocks after preserving their layout flow');
  if (!wordDocumentBuilder.includes('block.table.colWidths')) failures.push('importWord.ts: blocksToWordDocument must preserve each input table column width');
  if (!wordDocumentBuilder.includes('block.table.rows.map((row) => row.height)')) failures.push('importWord.ts: blocksToWordDocument must preserve each input table row height');
  if (!wordDocumentBuilder.includes('buildWordTableCells(block.table, tableIndex)')) failures.push('importWord.ts: blocksToWordDocument must convert each input table with buildWordTableCells');
  if (!/wordBlocks\.push\(\{[\s\S]*?type:\s*'table'[\s\S]*?\}\);/.test(wordDocumentBuilder)) failures.push('importWord.ts: blocksToWordDocument must construct and push Word table blocks');
  if (!/return\s*\{[\s\S]*?blocks:\s*wordBlocks/.test(wordDocumentBuilder)) failures.push('importWord.ts: blocksToWordDocument must return its constructed Word table blocks');
  if (/type:\s*'(?:paragraph|image)'/.test(wordDocumentBuilder)) failures.push('importWord.ts: blocksToWordDocument must retain only Word table blocks for newly imported DOCX files');
}
if (!wordImportUtils.includes('resolveWordParagraphLayout')) failures.push('importWord.ts: Word paragraph components must use document-aware layout calculation');
if (!wordImportUtils.includes('paragraphLeftIndent') || !wordImportUtils.includes('paragraphSpaceBefore')) failures.push('importWord.ts: Word paragraph components must retain indentation and spacing');
if (!wordImportUtils.includes('splitWordParagraphComponents')) failures.push('importWord.ts: Word paragraphs with tab stops must be split into independent text components');
if (!wordImportUtils.includes('WORD_PARAGRAPH_COMPONENT_SEPARATOR')) failures.push('importWord.ts: Word paragraph component splitting must preserve tab and wide-space separators');
if (!wordImportUtils.includes('segment.offset')) failures.push('importWord.ts: split Word paragraph components must retain their horizontal offsets');
if (wordImportUtils.includes('compLeft: 0,\n          compTop: top,\n          compWidth: contentWidth')) failures.push('importWord.ts: Word paragraph components must not force every paragraph to the whole-page frame');
if (documentUtils.includes('migrateWordParagraphBlocks')) failures.push('document.ts: saved Word paragraph blocks must remain in wordDocument.blocks');
if (documentUtils.includes('estimateMigratedParagraphFrame')) failures.push('document.ts: saved Word paragraphs must not be converted into text component frames');
if (!normalizeWordDocument.includes('blocks,')) failures.push('document.ts: saved wordDocument blocks must remain available to the legacy renderer');
if (!legacyWordRenderer.includes('wordDocument.blocks.map((block) => {')) failures.push('CanvasSheetWorkspace.tsx: saved wordDocument blocks must continue through the legacy rendering layer');
if (!legacyWordRenderer.includes("if (block.type === 'paragraph')") || !legacyWordRenderer.includes('data-word-block="paragraph"')) failures.push('CanvasSheetWorkspace.tsx: saved Word paragraph blocks must continue through legacy rendering');
if (!legacyWordRenderer.includes('const src = mediaSrcMap.get(block.mediaId);') || !legacyWordRenderer.includes('data-word-block="image"')) failures.push('CanvasSheetWorkspace.tsx: saved Word image blocks must continue through legacy rendering');
if (!renderer.includes('data-canvas-node-resize-handle')) failures.push('CanvasNodeRenderer.tsx: absolute components must expose resize handles');
if (!renderer.includes('updateNodeStyle(node.id')) failures.push('CanvasNodeRenderer.tsx: component drag and resize must persist through updateNodeStyle');
if (renderer.includes('data-canvas-node-drag-handle="true"')) failures.push('CanvasNodeRenderer.tsx: text components must not render the obsolete top-left drag handle');
if (!renderer.includes('tabIndex={absolute ? -1 : undefined}')) failures.push('CanvasNodeRenderer.tsx: absolute components must be programmatically focusable for keyboard deletion');
if (!renderer.includes('event.currentTarget.focus({ preventScroll: true });')) failures.push('CanvasNodeRenderer.tsx: selecting an absolute component must focus its keyboard delete boundary');
if (!componentRegistry.includes('contentEditable')) failures.push('componentRegistry.tsx: static text components must support direct content editing');
if (!componentRegistry.includes("border: selected\n          ? '1px solid #1677ff'")) failures.push('componentRegistry.tsx: selected text components must use the unified blue outline');
if (!componentRegistry.includes("bgcolor: backgroundColor || 'transparent'")) failures.push('componentRegistry.tsx: static text components must use a transparent background by default');
if (!freeCanvasBodyBlock.includes('clearSelection()')) failures.push('CanvasSheetWorkspace.tsx: free canvas blank area must clear component selection');
if (!freeCanvasFocusInteractionBlock.includes('tabIndex={0}')) failures.push('CanvasSheetWorkspace.tsx: free canvas interaction container must be keyboard focusable');
if (!freeCanvasPointerFocusHandlerBlock.trim()) {
  failures.push('CanvasSheetWorkspace.tsx: unable to locate the free-canvas pointer focus handler');
} else {
  const pointerTargetIndex = freeCanvasPointerFocusHandlerBlock.indexOf('const target = event.target instanceof Element ? event.target : null;');
  const pointerEditingGuard = "if (!target || target.closest('[contenteditable=\"true\"], input, textarea, select')) return;";
  const pointerEditingGuardIndex = freeCanvasPointerFocusHandlerBlock.indexOf(pointerEditingGuard);
  const pointerFocusIndex = freeCanvasPointerFocusHandlerBlock.indexOf('freeCanvasBodyRef.current?.focus({ preventScroll: true })');
  if (pointerTargetIndex < 0 || pointerEditingGuardIndex < 0 || pointerFocusIndex < 0 || pointerTargetIndex >= pointerEditingGuardIndex || pointerEditingGuardIndex >= pointerFocusIndex) {
    failures.push('CanvasSheetWorkspace.tsx: free canvas pointer focus must return for non-elements and editing controls before focusing its keyboard delete boundary');
  }
}
if (!renderer.includes('onNodeSelect?: () => void')) failures.push('CanvasNodeRenderer.tsx: canvas node selection must support a cross-component selection callback');
if (!renderer.includes('onNodeSelect?.();')) failures.push('CanvasNodeRenderer.tsx: selecting a canvas node must notify the workspace before changing selection');
if (!canvasWorkspace.includes('onNodeSelect={() => {\n                          setSelectedWordTableBlockId(null);\n                          setWordTableCellRange(null);')) failures.push('CanvasSheetWorkspace.tsx: selecting another canvas component must clear the selected Word table and cell range');
if (!freeCanvasDeleteHandlerBlock.trim()) {
  failures.push('CanvasSheetWorkspace.tsx: unable to locate the free-canvas keyboard delete handler');
} else {
  const targetIndex = freeCanvasDeleteHandlerBlock.indexOf('const target = event.target instanceof Element ? event.target : null;');
  const boundaryIndex = freeCanvasDeleteHandlerBlock.indexOf('if (!target || !freeCanvasBodyRef.current?.contains(target)) return;');
  const textEditorGuard = "if (target?.closest('[contenteditable=\"true\"], input, textarea, select')) return;";
  const textEditorGuardIndex = freeCanvasDeleteHandlerBlock.indexOf(textEditorGuard);
  const wordTableDeleteIndex = freeCanvasDeleteHandlerBlock.indexOf('deleteSelectedWordTable();');
  const nodeDeleteIndex = freeCanvasDeleteHandlerBlock.indexOf('removeNode(selectedNodeId);');
  const firstDeleteIndex = Math.min(
    wordTableDeleteIndex < 0 ? Number.POSITIVE_INFINITY : wordTableDeleteIndex,
    nodeDeleteIndex < 0 ? Number.POSITIVE_INFINITY : nodeDeleteIndex,
  );
  if (!freeCanvasDeleteHandlerBlock.includes("event.key !== 'Backspace' && event.key !== 'Delete'")) failures.push('CanvasSheetWorkspace.tsx: free-canvas keyboard delete must handle Backspace and Delete');
  if (targetIndex < 0 || boundaryIndex < 0 || boundaryIndex <= targetIndex || boundaryIndex >= firstDeleteIndex) failures.push('CanvasSheetWorkspace.tsx: free-canvas keyboard delete must check its body boundary before deleting a selected component');
  if (textEditorGuardIndex < 0 || textEditorGuardIndex <= boundaryIndex || textEditorGuardIndex >= firstDeleteIndex) failures.push('CanvasSheetWorkspace.tsx: free-canvas keyboard delete must return from text and form-field editing before deleting');
  if (wordTableDeleteIndex < 0) failures.push('CanvasSheetWorkspace.tsx: keyboard delete must remove the selected Word table component');
  if (nodeDeleteIndex < 0) failures.push('CanvasSheetWorkspace.tsx: keyboard delete must remove the selected free-canvas component');
}
if (!canvasToolbar.includes('isTextComponent')) failures.push('CanvasDesignerToolbar.tsx: toolbar must detect selected text components');
if (!canvasToolbar.includes('updateNodeStyle(selectedNode.id, patch)')) failures.push('CanvasDesignerToolbar.tsx: toolbar must apply text formatting to selected text components');
if (!toolbarColorButtonBlock.trim()) {
  failures.push('CanvasDesignerToolbar.tsx: unable to locate the color-picker component');
} else {
  if (!toolbarColorButtonBlock.includes('const commitDraftColorRef = useRef')) failures.push('CanvasDesignerToolbar.tsx: color picker must retain its latest commit callback in a stable ref');
  if (!toolbarColorButtonBlock.includes('commitDraftColorRef.current = commitDraftColor;')) failures.push('CanvasDesignerToolbar.tsx: color picker must refresh the stable commit ref after each render');
  if (!toolbarColorButtonBlock.includes('useEffect(() => () => commitDraftColorRef.current(), [])')) failures.push('CanvasDesignerToolbar.tsx: color picker must flush its latest draft only from the unmount cleanup');
  if ((toolbarColorButtonBlock.match(/commitDraftColorRef\.current\(\)/g) ?? []).length !== 1) failures.push('CanvasDesignerToolbar.tsx: color picker must not add another ref-based draft commit outside its empty-dependency unmount cleanup');
  const directCommitDraftColorCleanupPatterns = [
    /useEffect\s*\(\s*\(\s*\)\s*=>\s*\(\s*\)\s*=>\s*commitDraftColor\s*\(\s*\)\s*,\s*\[[^\]]*\]\s*\)/,
    /useEffect\s*\(\s*\(\s*\)\s*=>\s*\{\s*return\s*\(\s*\)\s*=>\s*(?:\{\s*)?commitDraftColor\s*\(\s*\)\s*;?\s*\}?\s*;?\s*\}\s*,\s*\[[^\]]*\]\s*\)/,
    /useEffect\s*\(\s*\(\s*\)\s*=>\s*\{\s*return\s+commitDraftColor\s*;?\s*\}\s*,\s*\[[^\]]*\]\s*\)/,
    /useEffect\s*\(\s*\(\s*\)\s*=>\s*commitDraftColor\s*,\s*\[[^\]]*\]\s*\)/,
  ];
  if (directCommitDraftColorCleanupPatterns.some((pattern) => pattern.test(toolbarColorButtonBlock))) failures.push('CanvasDesignerToolbar.tsx: color picker cleanup must not directly use commitDraftColor because rerenders would commit drafts early');
}
if (!staticImageThumbnailBranch || !(staticImageThumbnailBranch.includes('component="img"') || /<img\b/.test(staticImageThumbnailBranch)) || !/src=\{(?:String\()?node\.props\.src(?: \?\? '')?\)?\}/.test(staticImageThumbnailBranch)) failures.push('CanvasPageThumbnails.tsx: thumbnail static-image branch must render node.props.src as an image');
if (!canvasWorkspace.includes('beginWordTableDrag')) failures.push('CanvasSheetWorkspace.tsx: imported Word tables must have a dedicated drag handler');
if (!canvasWorkspace.includes('data-word-table-draggable="true"')) failures.push('CanvasSheetWorkspace.tsx: imported Word tables must expose a draggable component marker');
if (!canvasWorkspace.includes('data-word-table-drag-handle="true"')) failures.push('CanvasSheetWorkspace.tsx: imported Word tables must provide a drag handle outside editable cells');
if (!canvasWorkspace.includes('data-word-table-drag-handle-layer="true"')) failures.push('CanvasSheetWorkspace.tsx: Word table drag controls must render in the top free-canvas interaction layer');
if (!canvasWorkspace.includes('zIndex: 30')) failures.push('CanvasSheetWorkspace.tsx: Word table drag controls must stack above overlapping text components');
const canvasNodeRendererIndex = canvasWorkspace.indexOf('<CanvasNodeRenderer');
const wordTableDragHandleLayerIndex = canvasWorkspace.indexOf('{renderWordTableDragHandleLayer()}');
if (wordTableDragHandleLayerIndex <= canvasNodeRendererIndex) failures.push('CanvasSheetWorkspace.tsx: Word table drag controls must render after static canvas nodes');
if (!canvasWorkspace.includes('event.stopPropagation();\n            beginWordTableDrag(event, selectedTable);')) failures.push('CanvasSheetWorkspace.tsx: Word table drag handle must stop bubbling before beginning the drag');
if (canvasWorkspace.includes('data-word-table-draggable="true"\n                onPointerDown')) failures.push('CanvasSheetWorkspace.tsx: editable Word table cells must not start table dragging from the parent container');
if (!canvasWorkspace.includes('updateWordTableLayout')) failures.push('CanvasSheetWorkspace.tsx: Word table drag must persist its layout position');
if (!canvasWorkspace.includes('beginWordTableResize')) failures.push('CanvasSheetWorkspace.tsx: imported Word tables must support row and column boundary resizing');
if (!canvasWorkspace.includes('data-word-table-column-resize-handle="true"')) failures.push('CanvasSheetWorkspace.tsx: Word table column boundaries must expose resize handles');
if (!canvasWorkspace.includes('data-word-table-outer-column-resize-handle="true"')) failures.push('CanvasSheetWorkspace.tsx: Word tables must expose a right outer-column resize handle');
if (!canvasWorkspace.includes('beginWordTableOuterColumnResize')) failures.push('CanvasSheetWorkspace.tsx: Word tables must resize the final column and total width from the right edge');
const outerColumnResizeStart = canvasWorkspace.indexOf('const beginWordTableOuterColumnResize = (');
const outerColumnResizeEnd = canvasWorkspace.indexOf('\n  const beginWordTableOuterRowResize = (', outerColumnResizeStart);
const outerColumnResize = outerColumnResizeStart >= 0 && outerColumnResizeEnd > outerColumnResizeStart
  ? canvasWorkspace.slice(outerColumnResizeStart, outerColumnResizeEnd)
  : '';
if (!outerColumnResize.includes("ownerDocument.addEventListener('pointermove', handlePointerMove, true);")) failures.push('CanvasSheetWorkspace.tsx: right outer-column resizing must keep receiving pointer moves after the pointer leaves the 2px handle');
if (!outerColumnResize.includes('getWordTableEffectiveLayout(block, paperWorkingWidth)')) failures.push('CanvasSheetWorkspace.tsx: right outer-column resizing must constrain against the rendered table position');
if (!canvasWorkspace.includes('data-word-table-row-resize-handle="true"')) failures.push('CanvasSheetWorkspace.tsx: Word table row boundaries must expose resize handles');
if (!canvasWorkspace.includes('resolveWordTableCellBorder')) failures.push('CanvasSheetWorkspace.tsx: Word table cells must consolidate shared grid borders');
if (!canvasWorkspace.includes('data-word-table-outer-right-border="true"')) failures.push('CanvasSheetWorkspace.tsx: Word tables must render a dedicated right outer border above editable cells');
if (!wordImportUtils.includes('parseCellDiagonalBorders')) failures.push('importWord.ts: Word table import must parse diagonal cell borders');
if (!wordImportUtils.includes('diagonalTopLeftToBottomRight')) failures.push('importWord.ts: Word table import must preserve top-left to bottom-right cell borders');
if (!wordImportUtils.includes('parseWordCellBorderEdge')) failures.push('importWord.ts: Word table import must preserve unspecified cell border edges for table-grid inheritance');
if (!canvasWorkspace.includes('shouldRenderWordTableCellBorder')) failures.push('CanvasSheetWorkspace.tsx: Word tables must restore exposed right and bottom merged-cell borders');
if (!canvasWorkspace.includes('data-word-table-diagonal=')) failures.push('CanvasSheetWorkspace.tsx: Word tables must render imported diagonal borders');
if (!canvasWorkspace.includes('WordTableCellRange')) failures.push('CanvasSheetWorkspace.tsx: Word tables must retain an independent multi-cell selection range');
if (!canvasWorkspace.includes('beginWordTableCellSelection')) failures.push('CanvasSheetWorkspace.tsx: Word tables must support pointer-driven multi-cell selection');
if (!canvasWorkspace.includes('data-word-table-cell-id=')) failures.push('CanvasSheetWorkspace.tsx: Word table cells must expose stable selection targets');
if (!canvasWorkspace.includes('isWordTableCellInRange')) failures.push('CanvasSheetWorkspace.tsx: Word table cells must render rectangular multi-cell selections');
if (!canvasToolbar.includes('useWordTableCellStyle')) failures.push('CanvasDesignerToolbar.tsx: toolbar must read the active Word table cell style target');
if (!canvasToolbar.includes('updateWordTableCellStyle(patch)')) failures.push('CanvasDesignerToolbar.tsx: toolbar must apply typography changes to the active Word table cell range');
if (!canvasToolbar.includes("| { type: 'word-table'; target: WordTableCellStyleTarget };")) failures.push('CanvasDesignerToolbar.tsx: delayed color commits must snapshot the active Word table cell range');
if (!canvasToolbar.includes("return { type: 'word-table', target: wordTableCellStyleTarget };")) failures.push('CanvasDesignerToolbar.tsx: Word table color commits must capture the current cell-range target');
if (!canvasToolbar.includes('updateWordTableCellStyleAtTarget(target.target, patch)')) failures.push('CanvasDesignerToolbar.tsx: delayed Word table color commits must use the captured target instead of the current selection');
if (!canvasWorkspace.includes('setWordTableCellStyleTarget')) failures.push('CanvasSheetWorkspace.tsx: Word table cell selection must publish its active range to the toolbar');
if (!canvasWorkspace.includes('Focusing a new editable cell must replace any previous cell-range highlight.')) failures.push('CanvasSheetWorkspace.tsx: focusing a Word table cell must replace the active toolbar style target');
if (!canvasWorkspace.includes('if (event.shiftKey) {\n      event.preventDefault();')) failures.push('CanvasSheetWorkspace.tsx: Shift-click cell selection must suppress native text expansion');
if (!canvasWorkspace.includes("addEventListener('selectstart', handleSelectStart, true)")) failures.push('CanvasSheetWorkspace.tsx: pointer range selection must suppress native text selection only while active');
if (!canvasWorkspace.includes('function isPointerOnWordTableText(')) failures.push('CanvasSheetWorkspace.tsx: editable Word table cells must distinguish actual text from blank cell space');
if (!canvasWorkspace.includes('range.getClientRects()')) failures.push('CanvasSheetWorkspace.tsx: editable Word table text hit testing must use rendered text bounds');
if (!canvasWorkspace.includes('isPointerOnWordTableText(event.target, event.clientX, event.clientY)')) failures.push('CanvasSheetWorkspace.tsx: Word table pointer routing must use actual text hit testing');
if (!canvasWorkspace.includes('const beginWordTableTextOrCellSelection = (')) failures.push('CanvasSheetWorkspace.tsx: Word tables must keep native text selection until a text-originated drag crosses a cell boundary');
if (!canvasWorkspace.includes('if (!hasCrossedCellBoundary && nextCell.id === cell.id) return;')) failures.push('CanvasSheetWorkspace.tsx: text-originated drags must remain native while they stay inside the starting cell');
if (!canvasWorkspace.includes('ownerDocument.getSelection()?.removeAllRanges();\n        selectWordTable(block.id, true);\n        setWordTableCellRange({')) failures.push('CanvasSheetWorkspace.tsx: text-originated cross-cell drags must clear characters before selecting cells');
if (!canvasWorkspace.includes('beginWordTableTextOrCellSelection(event, block, cell);')) failures.push('CanvasSheetWorkspace.tsx: text-originated drags must switch to the hybrid text-or-cell selection controller');
if (!canvasWorkspace.includes('data-word-table-context-menu="true"')) failures.push('CanvasSheetWorkspace.tsx: Word table right-click actions must expose a stable context-menu marker');
const paperCanvasReturn = canvasWorkspace.match(/if \(currentPage\.sheet\.canvasMode === 'paper'\) \{[\s\S]*?\n  \}\n\n  return \(/)?.[0] ?? '';
if (!paperCanvasReturn.includes('{renderWordTableContextMenu()}')) failures.push('CanvasSheetWorkspace.tsx: paper canvas mode must render the Word table right-click menu');
if (!canvasWorkspace.includes('const closeWordTableContextMenuOnOutsidePointerDown = (event: PointerEvent) =>')) failures.push('CanvasSheetWorkspace.tsx: Word table right-click menu must handle outside primary pointer presses');
if (!canvasWorkspace.includes("target.closest('[data-word-table-context-menu=\"true\"]')")) failures.push('CanvasSheetWorkspace.tsx: Word table right-click menu must retain clicks inside its own surface');
const wordTableContextMenuLifecycle = canvasWorkspace.match(/useEffect\(\(\) => \{\n    if \(!wordTableContextMenu\) return undefined;[\s\S]*?\n  \}, \[wordTableContextMenu\]\);/)?.[0] ?? '';
if (!canvasWorkspace.includes('const wordTableContextMenuRef = useRef<HTMLDivElement | null>(null);')) failures.push('CanvasSheetWorkspace.tsx: Word table context menu must retain a stable focus ref');
if (!wordTableContextMenuLifecycle.includes('wordTableContextMenuRef.current?.focus({ preventScroll: true });')) failures.push('CanvasSheetWorkspace.tsx: Word table context menu must receive focus after opening');
if (!/const handleWordTableContextMenuKeyDown = \(event: KeyboardEvent\) => \{\n      if \(event\.key !== 'Escape'\) return;\n      event\.preventDefault\(\);\n      event\.stopPropagation\(\);\n      setWordTableContextMenu\(null\);/.test(wordTableContextMenuLifecycle)) failures.push('CanvasSheetWorkspace.tsx: Word table context menu Escape handler must prevent propagation and close the menu');
if (!wordTableContextMenuLifecycle.includes("document.addEventListener('keydown', handleWordTableContextMenuKeyDown)")) failures.push('CanvasSheetWorkspace.tsx: Word table context menu must register an Escape listener while open');
if (!wordTableContextMenuLifecycle.includes("document.removeEventListener('keydown', handleWordTableContextMenuKeyDown)")) failures.push('CanvasSheetWorkspace.tsx: Word table context menu must clean up its Escape listener');
const wordTableContextMenuOutsidePointerHandler = wordTableContextMenuLifecycle.match(/const closeWordTableContextMenuOnOutsidePointerDown = \(event: PointerEvent\) => \{[\s\S]*?\n    \};/)?.[0] ?? '';
if (wordTableContextMenuOutsidePointerHandler.includes('event.button')) failures.push('CanvasSheetWorkspace.tsx: Word table context menu outside close must not be limited to the primary pointer button');
if (!/if \(target instanceof Element && target\.closest\('\[data-word-table-context-menu="true"\]'\)\) return;\n      setWordTableContextMenu\(null\);/.test(wordTableContextMenuOutsidePointerHandler)) failures.push('CanvasSheetWorkspace.tsx: Word table context menu outside pointer handler must close every non-menu target');
if (!canvasWorkspace.includes("position: 'fixed'")) failures.push('CanvasSheetWorkspace.tsx: Word table right-click menu must use a fixed canvas overlay instead of a click-away modal');
const wordTableContextMenuRenderer = canvasWorkspace.match(/const renderWordTableContextMenu = \(\) => \{[\s\S]*?\n  \};\n\n  const renderPageBreakMarkers/)?.[0] ?? '';
if (wordTableContextMenuRenderer.includes('anchorReference="anchorPosition"')) failures.push('CanvasSheetWorkspace.tsx: Word table right-click menu must not depend on MUI anchor-position modal behavior');
if (!wordTableContextMenuRenderer.includes('ref={wordTableContextMenuRef}')) failures.push('CanvasSheetWorkspace.tsx: Word table context menu surface must bind its focus ref');
if (!wordTableContextMenuRenderer.includes('tabIndex={-1}')) failures.push('CanvasSheetWorkspace.tsx: Word table context menu surface must be programmatically focusable');
if (!canvasWorkspace.includes('onContextMenu={(event: ReactMouseEvent<HTMLDivElement>) =>')) failures.push('CanvasSheetWorkspace.tsx: Word table cells must open a dedicated right-click menu');
if (!canvasWorkspace.includes('if (event.button === 2) {\n                          handleWordTableContextMenu(event, block, cell);')) failures.push('CanvasSheetWorkspace.tsx: Word table secondary pointer press must open the custom menu before native contextmenu dispatch');
if (!canvasWorkspace.includes('在左侧插入')) failures.push('CanvasSheetWorkspace.tsx: Word table context menu must support inserting columns on the left');
if (!canvasWorkspace.includes('在右侧插入')) failures.push('CanvasSheetWorkspace.tsx: Word table context menu must support inserting columns on the right');
if (!canvasWorkspace.includes('在上方插入')) failures.push('CanvasSheetWorkspace.tsx: Word table context menu must support inserting rows above');
if (!canvasWorkspace.includes('在下方插入')) failures.push('CanvasSheetWorkspace.tsx: Word table context menu must support inserting rows below');
if (!canvasWorkspace.includes('合并单元格') || !canvasWorkspace.includes('拆分单元格')) failures.push('CanvasSheetWorkspace.tsx: Word table context menu must support merge and split actions');
if (!canvasWorkspace.includes('删除所选列') || !canvasWorkspace.includes('删除所选行') || !canvasWorkspace.includes('删除表格')) failures.push('CanvasSheetWorkspace.tsx: Word table context menu must support delete actions');
if (!canvasWorkspace.includes('wordTableContextMenu')) failures.push('CanvasSheetWorkspace.tsx: Word table context menu must retain the click target and position');
if (!canvasWorkspace.includes('wordTableInsertCount')) failures.push('CanvasSheetWorkspace.tsx: Word table context menu must retain an insert count');
const wordTableCellContentStart = canvasWorkspace.indexOf('data-word-table-cell-content="true"');
const wordTableCellContentEnd = canvasWorkspace.indexOf('</Box>', wordTableCellContentStart);
const wordTableCellContent = wordTableCellContentStart >= 0 && wordTableCellContentEnd > wordTableCellContentStart
  ? canvasWorkspace.slice(wordTableCellContentStart, wordTableCellContentEnd)
  : '';
if (!canvasWorkspace.includes('onFocus={() => {\n                          // Focusing a new editable cell must replace any previous cell-range highlight.\n                          selectWordTable(block.id, true);\n                          setWordTableCellRange({')) failures.push('CanvasSheetWorkspace.tsx: focusing a Word table cell must replace the previous cell-range highlight');
if (wordTableCellContent.includes("'&:focus'")) failures.push('CanvasSheetWorkspace.tsx: focused Word table cells must not render an inner focus frame');
if (!canvasWorkspace.includes('data-word-table-outer-row-resize-handle="true"')) failures.push('CanvasSheetWorkspace.tsx: Word tables must expose a bottom outer resize handle');
if (!canvasWorkspace.includes('getWordTableColumnResizeSegments')) failures.push('CanvasSheetWorkspace.tsx: Word table column resize handles must be segmented by visible borders');
if (!canvasWorkspace.includes('getWordTableRowResizeSegments')) failures.push('CanvasSheetWorkspace.tsx: Word table row resize handles must be segmented by visible borders');
if (!canvasWorkspace.includes('cell.col + cell.colSpan - 1 === boundaryIndex')) failures.push('CanvasSheetWorkspace.tsx: Word table column resize segments must exclude merged-cell interiors');
if (!canvasWorkspace.includes('cell.row + cell.rowSpan - 1 === boundaryIndex')) failures.push('CanvasSheetWorkspace.tsx: Word table row resize segments must exclude merged-cell interiors');
const wordTableResizeControllersStart = canvasWorkspace.indexOf('const beginWordTableResize = (');
const wordTableResizeControllersEnd = canvasWorkspace.indexOf('const selectedSubTableNode', wordTableResizeControllersStart);
const wordTableResizeControllers = wordTableResizeControllersStart >= 0 && wordTableResizeControllersEnd > wordTableResizeControllersStart
  ? canvasWorkspace.slice(wordTableResizeControllersStart, wordTableResizeControllersEnd)
  : '';
if ((wordTableResizeControllers.match(/resizeTarget\.setPointerCapture\(pointerId\)/g) ?? []).length !== 3) failures.push('CanvasSheetWorkspace.tsx: Word table resize controllers must capture the active pointer');
if ((wordTableResizeControllers.match(/resizeTarget\.addEventListener\('pointermove', handlePointerMove\)/g) ?? []).length !== 2) failures.push('CanvasSheetWorkspace.tsx: internal and bottom table resize controllers must receive captured pointer movement directly from the resize handle');
if ((wordTableResizeControllers.match(/resizeTarget\.removeEventListener\('pointermove', handlePointerMove\)/g) ?? []).length !== 2) failures.push('CanvasSheetWorkspace.tsx: internal and bottom table resize controllers must clear their direct pointer movement listener');
if ((wordTableResizeControllers.match(/ownerDocument\.addEventListener\('pointermove', handlePointerMove, true\)/g) ?? []).length !== 1) failures.push('CanvasSheetWorkspace.tsx: the right outer resize controller must keep receiving pointer movement after leaving its 2px handle');
if ((wordTableResizeControllers.match(/ownerDocument\.removeEventListener\('pointermove', handlePointerMove, true\)/g) ?? []).length !== 1) failures.push('CanvasSheetWorkspace.tsx: the right outer resize controller must clear its document pointer listener');
if ((wordTableResizeControllers.match(/moveEvent\.pointerId !== pointerId/g) ?? []).length !== 3) failures.push('CanvasSheetWorkspace.tsx: Word table resize controllers must ignore movement from pointers other than the captured resize pointer');
if (!canvasWorkspace.includes('function redistributeWordTableColumnWidths(')) failures.push('CanvasSheetWorkspace.tsx: Word table column resize must redistribute width across the right-side grid tracks');
if (!canvasWorkspace.includes('Math.max(0, nextWidths[index] - WORD_TABLE_MIN_COLUMN_WIDTH)')) failures.push('CanvasSheetWorkspace.tsx: Word table column resize must consume all available width after the active boundary');
if (!wordTableResizeControllers.includes("axis === 'column'\n        ? redistributeWordTableColumnWidths(startColumnWidths, boundaryIndex, delta)")) failures.push('CanvasSheetWorkspace.tsx: Word table column resize must not be limited by only the immediately adjacent grid track');
const wordTableResizeHandlesStart = canvasWorkspace.indexOf('data-word-table-column-resize-handle="true"');
const wordTableResizeHandlesEnd = canvasWorkspace.indexOf('{block.cells.map((cell) =>', wordTableResizeHandlesStart);
const wordTableResizeHandles = wordTableResizeHandlesStart >= 0 && wordTableResizeHandlesEnd > wordTableResizeHandlesStart
  ? canvasWorkspace.slice(wordTableResizeHandlesStart, wordTableResizeHandlesEnd)
  : '';
if (wordTableResizeHandles.includes('&:hover::after')) failures.push('CanvasSheetWorkspace.tsx: Word table resize guides must not appear on hover');
if ((wordTableResizeHandles.match(/&:active::after/g) ?? []).length !== 4) failures.push('CanvasSheetWorkspace.tsx: Word table resize guides must appear only while a resize handle is pressed');
if (wordTableResizeHandles.includes('width: 10') || wordTableResizeHandles.includes('height: 10')) failures.push('CanvasSheetWorkspace.tsx: Word table resize hit areas must not cover adjacent cells');
if ((wordTableResizeHandles.match(/width: 2/g) ?? []).length !== 2 || (wordTableResizeHandles.match(/height: 2/g) ?? []).length !== 2) failures.push('CanvasSheetWorkspace.tsx: Word table resize hit areas must use a precise 2px border target');
if (!canvasWorkspace.includes('getWordTableEffectiveLayout(block, paperWorkingWidth)')) failures.push('CanvasSheetWorkspace.tsx: Word table dragging must use the rendered column width instead of stale imported layout width');
if (!canvasWorkspace.includes('getWordTableEffectiveLayout(candidate, paperWorkingWidth)')) failures.push('CanvasSheetWorkspace.tsx: Word table alignment targets must use rendered column widths');
const wordDiagonalBackgroundStart = canvasWorkspace.indexOf('function resolveWordTableCellDiagonalBackground(');
const wordDiagonalBackgroundEnd = canvasWorkspace.indexOf('\nexport default function CanvasSheetWorkspace', wordDiagonalBackgroundStart);
const wordDiagonalBackground = wordDiagonalBackgroundStart >= 0 && wordDiagonalBackgroundEnd > wordDiagonalBackgroundStart
  ? canvasWorkspace.slice(wordDiagonalBackgroundStart, wordDiagonalBackgroundEnd)
  : '';
if (!/diagonalTopLeftToBottomRight[\s\S]*?linear-gradient\(to bottom left/.test(wordDiagonalBackground)) failures.push('CanvasSheetWorkspace.tsx: tl2br borders must render from top-left to bottom-right');
if (!/diagonalTopRightToBottomLeft[\s\S]*?linear-gradient\(to bottom right/.test(wordDiagonalBackground)) failures.push('CanvasSheetWorkspace.tsx: tr2bl borders must render from top-right to bottom-left');
if (canvasWorkspace.includes('selectedWordBlockId') || canvasWorkspace.includes('normalizeWordComponentMeta')) failures.push('CanvasSheetWorkspace.tsx: Word import blocks must not be coupled to the common component library');
if (storeFile.includes('selectedWordBlockId') || storeFile.includes('updateWordComponent') || storeFile.includes('removeWordBlock')) failures.push('useTemplateDesignerStore.ts: Word import blocks must not carry component-manager state');
if (!workflowTab.includes('ReactFlow')) failures.push('WorkflowTab.tsx: missing ReactFlow canvas');
if (!workflowTab.includes('addEdge')) failures.push('WorkflowTab.tsx: missing edge creation support');
if (!workflowTab.includes('新增节点')) failures.push('WorkflowTab.tsx: missing add node action');
if (!workflowTab.includes('onNodeClick')) failures.push('WorkflowTab.tsx: missing workflow node selection');
if (!workflowTab.includes('节点名称')) failures.push('WorkflowTab.tsx: missing workflow node inspector');

await verifyExcelImportStyleBehavior();
await verifySubTableGroupRepeatBehavior();
await verifyCommonComponentBehavior();
await verifyWordTableContextMenuOperations();
await verifyWordTableLayoutBehavior();

if (failures.length > 0) {
  console.error('verify-template-designer-react failed');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('verify-template-designer-react passed');
