import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { requireFrontend, save, loadDesigner, login, api } from './common.mjs';

const ExcelJS = requireFrontend('exceljs');
const files = process.argv.slice(2);
if (files.length !== 3) throw new Error('请依次提供清洁表、标签领用表、报废处理单的三个原始Excel路径');
const designer = await loadDesigner();
const manifest = [];
const ids = ['clean', 'label', 'scrap'];
const sanitize = value => value.replace(/CX\d{2}-[A-Z0-9-]+/g, 'SAMPLE-DOC').replace(/安速康/g, '样本企业');
for (const [i, source] of files.entries()) {
  const bytes = await readFile(source), workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(bytes);
  const sheet = workbook.worksheets[0];
  sheet.eachRow(row => row.eachCell(cell => {
    if (cell.address === cell.master.address && cell.text) cell.value = sanitize(cell.text);
  }));
  // Only the tabular blank template is needed; images/comments and workbook identity are not sent.
  sheet._media = [];
  workbook.creator = ''; workbook.lastModifiedBy = '';
  const buffer = await workbook.xlsx.writeBuffer();
  const page = await designer.importExcelToCanvasPage(new File([buffer], ids[i] + '.xlsx'), { pageId: 'page-1', pageName: '原表' });
  page.nodes = page.nodes.filter(n => n.type !== 'image');
  const cells = Object.entries(page.cells).filter(([, cell]) => String(cell.value ?? '').trim()).map(([key, cell]) => {
    const [row, col] = key.split(':').map(Number);
    const address = sheet.getCell(row, col).address;
    return { address, text: sanitize(String(cell.value)) };
  });
  const input = { id: ids[i], sheet: sheet.name, rowCount: page.sheet.rowCount, columnCount: page.sheet.columnCount,
    rowHeights: page.sheet.rowHeights, columnWidths: page.sheet.columnWidths, cells, mergedCells: page.mergedCells,
    note: '这是空白模板的本地确定性导入结果。未列出的格为空白；只依据本文档，不读取其他文件。' };
  await save('samples/' + ids[i] + '.json', { page, input });
  manifest.push({ id: ids[i], sourceFileName: source.split('/').at(-1), sourceSha256: createHash('sha256').update(bytes).digest('hex'),
    importedRows: page.sheet.rowCount, importedColumns: page.sheet.columnCount, textCells: cells.length,
    sourcePrivacy: 'blank template; document code and company token masked; no image/comment/author transmitted' });
}
const token = await login();
const lookup = await api('/form-lookup-items', 'GET', undefined, token);
const catalog = await api('/master-data/template-modeling/projection-catalog', 'GET', undefined, token);
const lookupItems = Object.fromEntries(lookup.map(item => [item.id, { name: item.name, type: item.type, revision: item.revision }]));
await save('catalog.json', { catalog, lookupItems });
await save('samples/manifest.json', manifest);
console.log(JSON.stringify({ prepared: manifest, catalogModels: catalog.models.map(m => m.id) }, null, 2));
