import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { loadDesigner, requireFrontend } from '../../ai-form-feasibility/common.mjs';

const ExcelJS = requireFrontend('exceljs');

export async function prepareSample(source, id) {
  const bytes = await readFile(source);
  const book = new ExcelJS.Workbook();
  await book.xlsx.load(bytes);
  const sheet = book.worksheets[0];
  sheet.eachRow(row => row.eachCell(cell => {
    if (cell.address !== cell.master.address) return;
    if (cell.formula || cell.hyperlink || cell.note) throw new Error('Review template formula, link or note before sharing');
    if (cell.text) cell.value = cell.text.replace(/CX\d{2}-[A-Z0-9-]+/g, 'SAMPLE-DOC').replace(/安速康/g, '样本企业');
  }));
  sheet._media = [];
  for (const other of book.worksheets.slice(1)) book.removeWorksheet(other.id);
  sheet.name = '原表';
  book.creator = ''; book.lastModifiedBy = '';
  const designer = await loadDesigner();
  const page = await designer.importExcelToCanvasPage(new File([await book.xlsx.writeBuffer()], 'blank.xlsx'), { pageId: 'page-1', pageName: '原表' });
  const cells = Object.entries(page.cells).flatMap(([key, cell]) => {
    const [row, column] = key.split(':').map(Number);
    return String(cell.value ?? '').trim() ? [{ address: sheet.getCell(row, column).address, text: String(cell.value) }] : [];
  });
  const { rowCount, columnCount, rowHeights, columnWidths } = page.sheet;
  return { id, sourceSha256: createHash('sha256').update(bytes).digest('hex'), page,
    input: { rowCount, columnCount, rowHeights, columnWidths, cells, mergedCells: page.mergedCells } };
}

if (process.argv.length === 5 && new URL(import.meta.url).pathname === process.argv[1]) {
  const [, , id, source, outfile] = process.argv;
  await writeFile(outfile, JSON.stringify(await prepareSample(source, id)), { mode: 0o600 });
}
