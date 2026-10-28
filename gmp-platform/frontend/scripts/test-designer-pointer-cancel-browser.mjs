import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { build } from 'esbuild';

// Actual CanvasTab, Sidebar, Workspace and store. Mouse gestures activate the
// drag; a synthetic PointerEvent delivers pointercancel to the real listeners.
// This tests the browser event contract, not a physical touch device or OS interruption.
const { chromium } = createRequire(import.meta.url)('playwright');
const root = path.resolve(import.meta.dirname, '..');
const baseline = process.env.DESIGNER_BASELINE_COMMIT;
if (baseline && !/^[0-9a-f]{40}$/.test(baseline)) throw new Error('DESIGNER_BASELINE_COMMIT must be a full SHA');
const width = Number(process.env.DESIGNER_WIDTH ?? 1440);
const artifacts = process.env.DESIGNER_ARTIFACTS ?? path.join(os.tmpdir(), `edhr-pointer-cancel-${width}`);
await mkdir(artifacts, { recursive: true });
const temporary = await mkdtemp(path.join(os.tmpdir(), 'edhr-pointer-cancel-host-'));
const head = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim();
const workingTreeState = execFileSync('git', ['status', '--porcelain=v1'], { cwd: root, encoding: 'utf8' });
const hash = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');
const results = [];
let server, browser;
const cases = [
  { name: 'grid-cancel', kind: 'grid', cancel: true },
  { name: 'merged-cancel', kind: 'merged', cancel: true },
  { name: 'word-new-cancel', kind: 'word', cancel: true },
  { name: 'subfield-cancel', kind: 'subfield', cancel: true },
  { name: 'word-inline-move-cancel', kind: 'inline', cancel: true },
  { name: 'cancel-before-threshold', kind: 'grid', cancel: true, threshold: false },
  { name: 'unrelated-pointer-cancel', kind: 'grid', unrelated: true },
  { name: 'normal-grid-drop', kind: 'grid' },
  { name: 'normal-word-drop', kind: 'word' },
  { name: 'normal-subfield-drop', kind: 'subfield' },
  { name: 'normal-word-inline-move', kind: 'inline' },
  { name: 'release-outside-canvas', kind: 'grid', outside: true },
];

const snapshot = page => page.evaluate(() => {
  const state = window.__store.getState();
  return { document: state.document, undo: state.undoStack, redo: state.redoStack };
});
const summary = state => ({
  documentSha256: hash(state.document), undoSha256: hash(state.undo), redoSha256: hash(state.redo),
  undoLength: state.undo.length, redoLength: state.redo.length,
  nodes: state.document.canvas.pages[0].nodes.map(node => ({ id: node.id, type: node.type, bindings: node.bindings, style: node.style })),
  cells: state.document.canvas.pages[0].cells,
  wordCells: state.document.canvas.pages[0].wordDocument?.blocks.flatMap(block => block.cells ?? []),
});
const frame = page => page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));

async function visiblePoint(locator) {
  await locator.scrollIntoViewIfNeeded();
  const point = await locator.evaluate(element => {
    const rect = element.getBoundingClientRect();
    let left = Math.max(rect.left, 0), right = Math.min(rect.right, innerWidth);
    let top = Math.max(rect.top, 0), bottom = Math.min(rect.bottom, innerHeight);
    for (let parent = element.parentElement; parent; parent = parent.parentElement) {
      const style = getComputedStyle(parent), box = parent.getBoundingClientRect();
      if (/(auto|scroll|hidden|clip)/.test(style.overflowX)) { left = Math.max(left, box.left); right = Math.min(right, box.right); }
      if (/(auto|scroll|hidden|clip)/.test(style.overflowY)) { top = Math.max(top, box.top); bottom = Math.min(bottom, box.bottom); }
    }
    return { x: (left + right) / 2, y: (top + bottom) / 2, width: right - left, height: bottom - top };
  });
  assert.ok(point.width > 4 && point.height > 4, `fixture target must have an actual visible pointer area: ${JSON.stringify(point)}`);
  return point;
}

async function cancelAt(page, source, point, unrelated = false) {
  await source.evaluate((element, { point, unrelated }) => {
    const pointerId = window.__lastPointerId + (unrelated ? 100 : 0);
    element.dispatchEvent(new PointerEvent('pointercancel', { bubbles: true, pointerId, pointerType: 'mouse',
      isPrimary: true, clientX: point.x, clientY: point.y, button: 0, buttons: 0 }));
  }, { point, unrelated });
  await frame(page);
}

try {
  await build({ absWorkingDir: root, stdin: { resolveDir: root, loader: 'tsx', contents: `
    import React from 'react'; import { createRoot } from 'react-dom/client';
    import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
    import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
    import { SnackbarProvider } from './src/components/SnackbarProvider';
    import CanvasTab from './src/pages/master-data/template-designer-react/tabs/canvas/CanvasTab';
    import { useTemplateDesignerStore as store } from './src/pages/master-data/template-designer-react/store/useTemplateDesignerStore';
    import { createEmptyTemplateDesignerDocument } from './src/pages/master-data/template-designer-react/utils/document';
    const kind = new URLSearchParams(location.search).get('kind');
    const document = createEmptyTemplateDesignerDocument({ schema:'edhr-template-designer-react', version:1,
      templateId:'pointer-cancel-fixture', versionId:'fixture-v1', templateName:'字段拖动取消回归', versionLabel:'V1' });
    const page = document.canvas.pages[0];
    page.sheet = { ...page.sheet, rowCount:8, columnCount:5, defaultColumnWidth:64,
      columnWidths:Array(5).fill(64), rowHeights:Array(8).fill(36), showRuler:false };
    page.cells['2:1'] = { value:'保留原文', style:{ color:'#234567' } };
    if (kind === 'merged') page.mergedCells = [{t:2,b:2,l:1,r:2}];
    if (kind === 'word' || kind === 'inline') {
      page.sheet.canvasMode = 'paper'; page.sheet.paperMode = 'free';
      page.wordDocument = { source:'docx', contentWidth:240, contentHeight:160, blocks:[{
        id:'word-table',type:'table',borderEncodingVersion:2,layout:{left:0,top:0,width:240,height:160},
        columnWidths:[240],rowHeights:[80,80],cells:[
          {id:'source-cell',row:1,col:1,rowSpan:1,colSpan:1,text:'原位置：'},
          {id:'target-cell',row:2,col:1,rowSpan:1,colSpan:1,text:'目标原文'},
        ],
      }] };
    }
    store.getState().setDocument(document);
    const field = store.getState().addField('text','取消测试字段'); window.__fieldId = field.id;
    if (kind === 'subfield') {
      const table = store.getState().addField('subTable','检验明细');
      const [column] = store.getState().addSubTableFields(table.id,[{name:'待放子字段',type:'text'}]);
      store.getState().addSubTableRegionFromFieldToRange(table.id,{t:2,b:5,l:1,r:3},{left:0,top:36,width:192,height:144});
      const node = store.getState().document.canvas.pages[0].nodes.find(node => node.type === 'sub-table');
      store.getState().setSelectedNodeId(node.id);
      store.getState().updateSelectedSubTableRegion({repeat:{type:'dynamic'}});
      window.__fieldId = column.id; window.__tableId = table.id;
    }
    if (kind === 'inline') {
      store.getState().addNodeFromFieldToWordTableCell(field.id,{left:0,top:0,width:240,height:80,
        wordTableCell:{blockId:'word-table',cellId:'source-cell'},cellText:'原位置：',inlineOffset:4});
      window.__nodeId = store.getState().document.canvas.pages[0].nodes.at(-1).id;
    }
    store.getState().setDocument(structuredClone(store.getState().document));
    // Nonempty redo history proves cancellation also preserves previous history.
    store.getState().updateCurrentPage({name:'临时页面名'}); store.getState().undoCanvasChange();
    store.getState().setActiveCanvasRail('fields'); window.__store = store;
    window.__events = [];
    window.document.addEventListener('pointerdown', event => { window.__lastPointerId = event.pointerId;
      window.__events.push({type:event.type,pointerId:event.pointerId,isTrusted:event.isTrusted}); }, true);
    for(const type of ['pointerup','pointercancel']) window.document.addEventListener(type,event =>
      window.__events.push({type,pointerId:event.pointerId,isTrusted:event.isTrusted}),true);
    createRoot(window.document.getElementById('root')).render(<ThemeProvider theme={createTheme()}><CssBaseline/>
      <QueryClientProvider client={new QueryClient({defaultOptions:{queries:{retry:false}}})}><SnackbarProvider>
        <div style={{height:'100vh'}}><CanvasTab/></div>
      </SnackbarProvider></QueryClientProvider></ThemeProvider>);
  ` }, bundle: true, platform: 'browser', format: 'esm', outfile: path.join(temporary, 'bundle.js'),
  alias: { '@': path.join(root, 'src'), '@mui/icons-material': path.join(root, 'node_modules/@mui/icons-material/esm') },
  loader: { '.css': 'css', '.svg': 'dataurl', '.png': 'dataurl', '.woff2': 'file', '.ttf': 'file' },
  define: { 'process.env.NODE_ENV': '"production"' }, logLevel: 'silent',
  plugins: baseline ? [{ name: 'baseline-drag-owners', setup(plugin) {
    plugin.onLoad({ filter: /(?:DesignerSidebar|CanvasSheetWorkspace)\.tsx$/ }, args => ({
      contents: execFileSync('git', ['show', `${baseline}:gmp-platform/frontend/${path.relative(root, args.path).split(path.sep).join('/')}`], { cwd: root, encoding: 'utf8' }),
      loader: 'tsx', resolveDir: path.dirname(args.path),
    }));
  } }] : [], });
  await writeFile(path.join(temporary, 'index.html'), '<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>字段拖动取消回归</title><link rel="stylesheet" href="/bundle.css"><div id="root"></div><script type="module" src="/bundle.js"></script></html>');
  server = http.createServer(async (request, response) => {
    const pathname = new URL(request.url, 'http://localhost').pathname;
    const name = pathname === '/' ? 'index.html' : pathname.slice(1);
    if (!['index.html', 'bundle.js', 'bundle.css'].includes(name)) { response.writeHead(404).end(); return; }
    response.setHeader('Content-Type', name.endsWith('.js') ? 'text/javascript' : name.endsWith('.css') ? 'text/css' : 'text/html; charset=utf-8');
    try { response.end(await readFile(path.join(temporary, name))); }
    catch { response.writeHead(404).end(); }
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  browser = await chromium.launch({ headless: true, executablePath: process.env.CHROME_PATH ?? '/usr/bin/chromium' });
  for (const test of cases) {
    if (process.env.DESIGNER_CASES && !process.env.DESIGNER_CASES.split(',').includes(test.name)) continue;
    const page = await browser.newPage({ viewport: { width, height: 960 } });
    page.setDefaultTimeout(10000);
    const errors = [], requests = [], steps = [];
    let phase = 'fixture';
    page.on('pageerror', error => errors.push(error.message));
    await page.route('**/api/**', async route => { requests.push(route.request().url()); await route.abort(); });
    try {
      await page.goto(`http://127.0.0.1:${server.address().port}/?kind=${test.kind}`);
      const target = test.kind === 'word' || test.kind === 'inline'
        ? page.locator('[data-word-table-cell-id="target-cell"]')
        : page.locator('[data-canvas-field-drop-cell="true"][data-sheet-cell-row="2"][data-sheet-cell-col="1"]').first();
      await target.waitFor();
      if (test.kind === 'subfield') await target.click();
      const source = test.kind === 'inline' ? page.locator('[data-word-table-field-node-id]').first()
        : page.locator('[data-canvas-field-card="true"]').filter({ hasText: test.kind === 'subfield' ? '待放子字段' : '取消测试字段' }).first();
      await source.waitFor();
      // Scroll only the real existing workspace; do not resize or restyle product UI.
      const end = await visiblePoint(target), start = await visiblePoint(source);
      const before = await snapshot(page); steps.push({ operation:'fixture-ready', state:summary(before), start, end });
      await page.mouse.move(start.x,start.y); await page.mouse.down();
      if (test.threshold !== false) {
        await page.mouse.move(start.x+8,start.y+5,{steps:2}); await page.mouse.move(end.x,end.y,{steps:8});
        await frame(page);
        if (test.kind !== 'inline') await page.locator('[data-canvas-field-drag-preview="true"]').waitFor();
      }
      const afterMove = await snapshot(page);
      assert.equal(hash(afterMove),hash(before),'moving pointer before release must not mutate document/history');
      phase = 'assertion';
      if (test.cancel || test.unrelated) {
        await cancelAt(page, source, test.threshold === false ? start : end, test.unrelated);
        const afterCancel = await snapshot(page); steps.push({operation:'pointercancel',state:summary(afterCancel)});
        assert.equal(hash(afterCancel),hash(before),'pointercancel must preserve the full document and undo/redo history');
        if (test.unrelated) {
          assert.equal(await page.locator('[data-canvas-field-drag-preview="true"]').count(),1,'unrelated pointer cancellation must leave the active drag alive');
        } else {
          assert.equal(await page.locator('[data-canvas-field-drag-preview="true"]').count(),0,'cancel clears the drag preview');
          assert.equal(await page.locator('[data-field-drop-guide="true"]').count(),0,'cancel clears the drop guide');
          if (test.kind !== 'inline') assert.equal(await source.evaluate(el => getComputedStyle(el).opacity),'1','source card becomes visible again');
        }
      }
      if (test.outside) await page.mouse.move(start.x,start.y,{steps:5});
      await page.mouse.up(); await frame(page);
      const after = await snapshot(page); steps.push({operation:'native-pointerup',state:summary(after)});
      if (test.cancel || test.outside) {
        assert.equal(hash(after),hash(before),'late pointerup or outside release must not change the document/history');
      } else {
        assert.notEqual(hash(after.document),hash(before.document),'normal pointerup must commit an actual placement/move');
        assert.equal(after.undo.length,before.undo.length+1,'one release creates exactly one undo entry');
        assert.equal(after.redo.length,0,'a new edit invalidates the previous redo branch');
        const actual = after.document.canvas.pages[0].nodes;
        const id = await page.evaluate(() => window.__fieldId);
        const node = actual.find(node => test.kind === 'subfield' ? node.bindings?.subTableFieldId === id : node.bindings?.fieldId === id);
        assert.ok(node,'the actual requested field is bound');
        if (test.kind === 'word' || test.kind === 'inline') assert.deepEqual(node.style.wordTableCell,{blockId:'word-table',cellId:'target-cell'});
        else assert.deepEqual(node.style.cellRange,{t:2,b:2,l:1,r:1});
        if (test.kind === 'inline') {
          assert.equal(actual.length,before.document.canvas.pages[0].nodes.length,'move must not duplicate the existing node');
          const cells = after.document.canvas.pages[0].wordDocument.blocks[0].cells;
          assert.ok(!cells[0].text.includes(node.id),'source marker removed'); assert.ok(cells[1].text.includes(node.id),'target marker inserted');
        }
        await page.getByRole('button',{name:'撤销',exact:true}).click(); await frame(page);
        assert.equal(hash((await snapshot(page)).document),hash(before.document),'Undo restores the complete original document');
        await page.getByRole('button',{name:'重做',exact:true}).click(); await frame(page);
        assert.equal(hash((await snapshot(page)).document),hash(after.document),'Redo restores the complete committed document');
      }
      assert.deepEqual(errors,[],'no browser runtime errors'); assert.deepEqual(requests,[],'fixture must perform no API calls');
      if (test.name === 'grid-cancel' || test.name === 'word-inline-move-cancel' || test.name === 'normal-word-inline-move') {
        await page.screenshot({ path:path.join(artifacts,`${test.name}.png`),fullPage:true });
      }
      results.push({name:test.name,status:'passed',steps,events:await page.evaluate(() => window.__events),errors,unexpectedApiRequests:requests});
    } catch (error) {
      await page.screenshot({path:path.join(artifacts,`${test.name}-failed.png`),fullPage:true});
      results.push({name:test.name,status:phase === 'fixture' ? 'fixture-blocked' : 'failed',message:error.message.slice(0,1500),steps,
        actual:await snapshot(page).then(summary).catch(() => null),events:await page.evaluate(() => window.__events).catch(() => []),errors,unexpectedApiRequests:requests});
    } finally { await page.close(); }
  }
} finally {
  if (browser) await browser.close();
  if (server) await new Promise(resolve => server.close(resolve));
  await rm(temporary,{recursive:true,force:true});
}
const output = {sourceCommit:head,workingTreeState,baselineSourceCommit:baseline ?? null,baselinePaths:baseline ? ['DesignerSidebar.tsx','CanvasSheetWorkspace.tsx'] : [],
  viewport:{width,height:960},boundary:'Actual CanvasTab/Sidebar/Workspace/MUI/Zustand. Real mouse down/move/up, synthetic pointercancel; no physical touchscreen/OS interruption, backend persistence or save/reopen claim. Store APIs only construct fixtures.',results};
await writeFile(path.join(artifacts,'result.json'),JSON.stringify(output,null,2)+'\n');
console.log(JSON.stringify({sourceCommit:head,baselineSourceCommit:baseline ?? null,width,artifacts,results:results.map(({name,status,message}) => ({name,status,message}))},null,2));
if (results.some(result => result.status !== 'passed')) process.exitCode = 1;
