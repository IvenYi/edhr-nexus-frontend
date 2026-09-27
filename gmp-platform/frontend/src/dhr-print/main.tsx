import { createRoot } from 'react-dom/client';
import { flushSync } from 'react-dom';
import { ThemeProvider, createTheme } from '@mui/material';
import FormDocumentPreview from '@/pages/master-data/template-designer-react/components/form-preview/FormDocumentPreview';
import { parseReactTemplateDesignerDocument } from '@/pages/master-data/template-designer-react/utils/document';
import { archiveNavigation } from '@/pages/dhr-management/dhrSourceNavigation';
import type { DhrDirectory, DhrEvidenceRecord, DhrSummaryDirectoryOverlay, DhrSummaryPlacement } from '@/api/dhr-instances';

const root = createRoot(document.getElementById('root')!);
const theme = createTheme({ typography: { fontFamily: '"Noto Sans CJK SC", "PingFang SC", sans-serif' } });
const css = document.createElement('style');
css.textContent = `html,body{margin:0;padding:0;background:#fff;font-family:"Noto Sans CJK SC","PingFang SC",sans-serif;color:#20252b}*{box-sizing:border-box;-webkit-print-color-adjust:exact;print-color-adjust:exact}
[data-form-document-preview]{padding:0!important;overflow:visible!important;background:#fff!important}
[data-form-document-preview]>.MuiStack-root{display:block!important;min-width:0!important}
[data-mock-fill-page-paper],[data-word-preview-page]{box-shadow:none!important;border:0!important;margin:0!important}
[data-mock-fill-runtime]>*,[data-word-preview-table]>*{break-inside:avoid}
.MuiInputBase-root{background:transparent!important}.MuiOutlinedInput-notchedOutline{border:0!important}input,textarea{color:#20252b!important;-webkit-text-fill-color:#20252b!important}input::placeholder,textarea::placeholder{color:transparent!important;-webkit-text-fill-color:transparent!important}
button,.MuiButton-root,input[type=file]{display:none!important}.index{padding:32px;font-size:13px}.index h1{font-size:22px}.index table{width:100%;border-collapse:collapse}.index td,.index th{padding:8px;border:1px solid #aeb7c2;text-align:left;overflow-wrap:anywhere}.index tr{break-inside:avoid}.index small{color:#596579}`;
document.head.appendChild(css);

type ArchiveInput = { baseDirectory: { directories: DhrDirectory[] }; overlayDirectories: DhrSummaryDirectoryOverlay[]; placements: DhrSummaryPlacement[]; records: DhrEvidenceRecord[] };
function orderArchive(input: ArchiveInput) {
  const nodes = archiveNavigation(input.baseDirectory.directories, input.records, input.overlayDirectories, input.placements);
  const parents: Array<{ label: string; depth: number }> = [];
  return nodes.flatMap(node => {
    while (parents.length && parents[parents.length - 1].depth >= node.depth) parents.pop();
    if (node.folder) { parents.push(node); return []; }
    return node.recordIds.map(id => ({ id, title: node.label, archivePath: [...parents.map(parent => parent.label), node.label].join(' / ') }));
  });
}
async function settle() {
  await document.fonts.ready;
  await new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
  await Promise.all([...document.images].map(async image => { await image.decode(); if (!image.naturalWidth) throw new Error('图片无法读取'); }));
}
async function renderForm(record: DhrEvidenceRecord, pageIndex: number) {
  if (!record.snapshot.model || !record.snapshot.canvas) throw new Error(`缺少冻结版式：${record.instanceNo}`);
  const frozenCanvas = JSON.parse(record.snapshot.canvas);
  if (!Array.isArray((frozenCanvas.payload ?? frozenCanvas).pages) || !(frozenCanvas.payload ?? frozenCanvas).pages.length) throw new Error(`冻结版式页面不完整：${record.instanceNo}`);
  document.getElementById('root')!.style.zoom = '1';
  const doc = parseReactTemplateDesignerDocument({ id: record.templateId, name: record.templateName || '表单' }, {
    id: record.templateVersionId, version: record.templateVersion || '', modelDesignJson: record.snapshot.model, canvasDesignJson: record.snapshot.canvas,
  });
  doc.model.fields = (record.snapshot.fields ?? []).map((field, index) => ({ ...field, typeConfig: field.typeConfig ?? {}, status: field.status ?? 'enabled', sortOrder: field.sortOrder ?? index })) as typeof doc.model.fields;
  const page = doc.canvas.pages[pageIndex];
  if (!page) throw new Error(`冻结版式没有页面：${record.instanceNo}`);
  const count = doc.canvas.pages.length;
  doc.canvas.pages = [page];
  flushSync(() => root.render(<ThemeProvider theme={theme}><FormDocumentPreview document={doc} runtime={{ values: record.fieldValues, disabled: true, onChange: () => {} }} /></ThemeProvider>));
  await settle();
  const paper = document.querySelector<HTMLElement>('[data-mock-fill-page-paper],[data-word-preview-page]');
  if (!paper) throw new Error(`冻结版式无法渲染：${record.instanceNo}`);
  // The template owns paper size. Do not shrink-to-fit into a hardcoded portrait page.
  const width = paper.getBoundingClientRect().width;
  if (paper.scrollWidth > width + 2) throw new Error(`表单内容超出纸张宽度，请修正版式后重新冻结：${record.instanceNo}`);
  // A screen input can scroll or ellipsize; paper cannot. Never silently export
  // clipped frozen field values as though the printable record were complete.
  for (const element of paper.querySelectorAll<HTMLElement>('input,textarea,[data-form-preview-field],[data-form-preview-field] *')) {
    const style = getComputedStyle(element);
    if (!element.clientWidth || !element.clientHeight || style.visibility === 'hidden' || style.display === 'none') continue;
    if ((element.matches('input,textarea') || ['hidden', 'auto', 'scroll'].includes(style.overflowX) || ['hidden', 'auto', 'scroll'].includes(style.overflowY))
      && (element.scrollWidth > element.clientWidth + 2 || element.scrollHeight > element.clientHeight + 2)) {
      throw new Error(`冻结字段内容超出版式，无法完整打印，请调整来源版式并重新冻结：${record.instanceNo}`);
    }
  }
  const paperWidth = Math.round((page.sheet.paperOrientation === 'landscape' ? 297 : 210) * 96 / 25.4);
  const paperHeight = Math.round((page.sheet.paperOrientation === 'landscape' ? 210 : 297) * 96 / 25.4);
  const scale = Math.min(1, paperWidth / width);
  document.getElementById('root')!.style.zoom = String(scale);
  paper.style.minHeight = `${(paperHeight - 24) / scale}px`;
  if (page.wordDocument) {
    // The screen canvas rounds its height to whole sheets. That creates a blank
    // trailing page once the print footer reserves space; use actual content.
    const word = page.wordDocument;
    const contentHeight = Math.max(word.contentHeight ?? 0, ...word.blocks.map(block => block.layout.top + block.layout.height),
      ...page.nodes.filter(node => !node.style.wordTableCell).map(node => Number(node.style.compTop ?? 0) + Number(node.style.compHeight ?? 32)));
    const margins = (page.sheet.paperMarginTopMm + page.sheet.paperMarginBottomMm) * 96 / 25.4 + (page.sheet.showHeader ? 46 : 0) + (page.sheet.showFooter ? 36 : 0);
    paper.style.height = `${Math.max((paperHeight - 24) / scale, margins + contentHeight)}px`;
  }
  return { count, width: paperWidth, height: paperHeight };
}
type IndexInput = { title: string; subtitle: string; rows: Array<{ name: string; detail: string; path: string }> };
async function renderIndex(input: IndexInput) {
  document.getElementById('root')!.style.zoom = '1';
  flushSync(() => root.render(<section className="index"><h1>{input.title}</h1><p>{input.subtitle}</p><p>附件内容不并入本 PDF，原件见 ZIP 相应目录；电子签署证据及冻结数据见追溯资料。</p><table><thead><tr><th>记录 / 附件</th><th>说明</th><th>ZIP 路径</th></tr></thead><tbody>{input.rows.map((row, index) => <tr key={index}><td>{row.name}</td><td>{row.detail}</td><td>{row.path}</td></tr>)}</tbody></table></section>));
  await settle();
}
Object.assign(window, { dhrPrint: { orderArchive, renderForm, renderIndex } });
