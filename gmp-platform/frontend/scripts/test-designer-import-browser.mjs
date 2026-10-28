import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { build } from 'esbuild';

// Actual Shell, CanvasTab, store and Excel/Word parsers. Only file-read timing
// and the host's props/open state are controlled; no parser result is mocked.
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const XLSX = require('xlsx');
const JSZip = require('jszip');
const root = path.resolve(import.meta.dirname, '..');
const baseline = process.env.IMPORT_BASELINE_COMMIT;
if (baseline && !/^[0-9a-f]{40}$/.test(baseline)) throw new Error('IMPORT_BASELINE_COMMIT must be a full SHA');
const width = Number(process.env.IMPORT_WIDTH ?? 1440);
const artifacts = process.env.IMPORT_ARTIFACTS ?? path.join(os.tmpdir(), `edhr-designer-import-${width}`);
await mkdir(artifacts, { recursive: true });
const temporary = await mkdtemp(path.join(os.tmpdir(), 'edhr-designer-import-host-'));
const head = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim();
const workingTreeState = execFileSync('git', ['status', '--porcelain=v1'], { cwd: root, encoding: 'utf8' });
const hash = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');
const results = [];
let server, browser;
const cases = ['normal-xlsx', 'normal-docx', 'blank-docx', 'malformed-document-xml', 'malformed-rels-xml', 'page-switch', 'page-switch-back', 'version-switch', 'close-reopen',
  'edit-during-read', 'newer-finishes-first', 'stale-error-after-new-selection', 'current-error-and-retry',
  'close-prompt-cancel', 'empty-selection'];
const workbook = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet([['导入新内容', '规格'], ['记录', 'A']]), '导入');
const xlsxBytes = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
const zip = new JSZip();
zip.file('word/document.xml', '<?xml version="1.0"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body><w:p><w:r><w:t>Word导入新内容 parsererror</w:t></w:r></w:p></w:body></w:document>');
const docxBytes = await zip.generateAsync({ type: 'nodebuffer' });
const malformedDocumentZip = new JSZip();
malformedDocumentZip.file('word/document.xml', '<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body><w:p>');
const malformedDocumentBytes = await malformedDocumentZip.generateAsync({ type: 'nodebuffer' });
const malformedRelsZip = new JSZip();
malformedRelsZip.file('word/document.xml', zip.file('word/document.xml').async('string'));
malformedRelsZip.file('word/_rels/document.xml.rels', '<Relationships><Relationship');
const malformedRelsBytes = await malformedRelsZip.generateAsync({ type: 'nodebuffer' });
const blankZip = new JSZip();
blankZip.file('word/document.xml', '<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body/></w:document>');
const blankDocxBytes = await blankZip.generateAsync({ type: 'nodebuffer' });
const snapshot = page => page.evaluate(() => {
  const state = window.__store.getState();
  return { document: state.document, undo: state.undoStack, redo: state.redoStack,
    dirty: state.isDirty(), activeTab: state.activeTab, saves: window.__saves.length };
});
const summary = state => ({ documentSha256: hash(state.document), undoSha256: hash(state.undo), redoSha256: hash(state.redo),
  undoLength: state.undo.length, redoLength: state.redo.length, dirty: state.dirty, activeTab: state.activeTab, saves: state.saves,
  meta: state.document?.meta, currentPageId: state.document?.canvas.currentPageId,
  pages: state.document?.canvas.pages.map(page => ({ id: page.id, name: page.name, cells: page.cells,
    wordText: page.nodes.map(node => node.props?.text ?? '').join('|') })) });
const frame = page => page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
async function selectFile(page, name, bytes = xlsxBytes) {
  await page.locator('input[type="file"]').setInputFiles({ name, mimeType: 'application/octet-stream', buffer: bytes });
  await page.waitForFunction(name => window.__reads.includes(name), name);
}
async function finish(page, name, reject = false) {
  await page.evaluate(({ name, reject }) => {
    const gate = window.__gates[name];
    if (!gate) throw new Error('missing file read gate ' + name);
    reject ? gate.reject(new Error('受控文件读取失败')) : gate.resolve();
  }, { name, reject });
  await page.waitForFunction(name => window.__completed.includes(name), name);
  await frame(page);
}
async function switchPage(page, index) {
  await page.locator('[data-page-thumbnail-active]').nth(index).click();
  await page.waitForFunction(index => window.__store.getState().document.canvas.currentPageId === `page-${index + 1}`, index);
  await frame(page);
}
async function editCell(page, value) {
  const sidebarClose = page.getByRole('button', { name: '关闭侧边栏', exact: true });
  if (await sidebarClose.count()) await sidebarClose.click();
  const cell = page.locator('[data-projection-canvas="true"] [data-sheet-cell-row="1"][data-sheet-cell-col="1"]').first();
  await cell.click(); await cell.press('F2');
  await page.locator('[data-sheet-cell-editor="true"] textarea:visible').fill(value);
  await page.getByRole('button', { name: '表单设计', exact: true }).click();
  await page.waitForFunction(value => window.__store.getState().document.canvas.pages[0].cells['1:1']?.value === value, value);
}
async function assertImported(page, before, kind = 'xlsx') {
  await page.waitForFunction(kind => {
    const p = window.__store.getState().document.canvas.pages[0];
    if(kind === 'xlsx') return p.cells['1:1']?.value === '导入新内容';
    if(kind === 'blank') return p.wordDocument?.source === 'docx' && p.nodes.length === 0 && Object.keys(p.cells).length === 0;
    return p.nodes.some(node => node.props?.text === 'Word导入新内容 parsererror');
  }, kind);
  const after = await snapshot(page);
  assert.equal(hash(after.document.model), hash(before.document.model), 'import retains the shared field model');
  assert.equal(hash(after.document.workflow), hash(before.document.workflow), 'import retains workflow');
  assert.equal(hash(after.document.canvas.pages[1]), hash(before.document.canvas.pages[1]), 'import only replaces its actual target page');
  assert.equal(after.document.canvas.pages[0].id, before.document.canvas.pages[0].id);
  assert.equal(after.document.canvas.pages[0].name, before.document.canvas.pages[0].name);
  assert.equal(after.undo.length, before.undo.length + 1, 'one accepted import is one history entry');
  assert.equal(after.redo.length, 0); assert.equal(after.dirty, true); assert.equal(after.saves, 0, 'import never submits automatically');
  await page.getByRole('button', { name: '撤销', exact: true }).click();
  assert.equal(hash((await snapshot(page)).document), hash(before.document), 'Undo restores the complete document');
  await page.getByRole('button', { name: '重做', exact: true }).click();
  assert.equal(hash((await snapshot(page)).document), hash(after.document), 'Redo restores the complete imported document');
  return after;
}

try {
  await build({ absWorkingDir: root, stdin: { resolveDir: root, loader: 'tsx', contents: `
    import React, {useState} from 'react'; import {createRoot} from 'react-dom/client';
    import {ThemeProvider,createTheme,CssBaseline} from '@mui/material';
    import {QueryClient,QueryClientProvider} from '@tanstack/react-query';
    import Shell from './src/pages/master-data/template-designer-react/TemplateDesignerReactShell';
    import {SnackbarProvider} from './src/components/SnackbarProvider';
    import {useTemplateDesignerStore as store} from './src/pages/master-data/template-designer-react/store/useTemplateDesignerStore';
    import {createEmptyTemplateDesignerDocument,serializeTemplateDesignerDocument} from './src/pages/master-data/template-designer-react/utils/document';
    const row={id:'import-audit',name:'导入审计'};
    function makeVersion(id,label){
      const doc=createEmptyTemplateDesignerDocument({schema:'edhr-template-designer-react',version:1,
        templateId:row.id,versionId:id,templateName:row.name,versionLabel:label});
      const p=doc.canvas.pages[0]; p.sheet={...p.sheet,rowCount:6,columnCount:4,rowHeights:Array(6).fill(36),columnWidths:Array(4).fill(84),showRuler:false};
      p.cells={'1:1':{value:'保留旧内容 '+label,style:{color:'#123456'}}};
      const other=structuredClone(p);other.id='page-2';other.name='页面 2';other.cells={'1:1':{value:'另页原文'}};
      doc.canvas.pages.push(other);store.getState().setDocument(doc);store.getState().addField('text','保留模型字段');
      return {id,version:label,...serializeTemplateDesignerDocument(store.getState().document)};
    }
    const versions={A:makeVersion('version-A','V1'),B:makeVersion('version-B','V2')};
    window.__store=store;window.__saves=[];window.__gates={};window.__reads=[];window.__completed=[];
    const originalRead=File.prototype.arrayBuffer;
    File.prototype.arrayBuffer=async function(){
      const name=this.name;window.__reads.push(name);
      if(!window.__gates[name]){const gate={};gate.promise=new Promise((resolve,reject)=>{gate.resolve=resolve;gate.reject=reject});window.__gates[name]=gate;}
      await window.__gates[name].promise;return originalRead.call(this);
    };
    function App(){const [open,setOpen]=useState(true);const [key,setKey]=useState('A');return <>
      <nav><button onClick={()=>setKey('B')}>宿主切换版本</button><button onClick={()=>{setKey('A');setOpen(true)}}>宿主重新打开</button></nav>
      {open?<div style={{height:'calc(100vh - 24px)'}}><Shell row={row} version={versions[key]} saving={false}
        onSave={async payload=>{window.__saves.push(payload)}} onClose={()=>setOpen(false)}/></div>:<div>设计器已关闭</div>}
    </>}
    createRoot(document.getElementById('root')).render(<ThemeProvider theme={createTheme()}><CssBaseline/>
      <QueryClientProvider client={new QueryClient({defaultOptions:{queries:{retry:false}}})}><SnackbarProvider><App/></SnackbarProvider></QueryClientProvider></ThemeProvider>);
  ` }, bundle: true, platform: 'browser', format: 'esm', outfile: path.join(temporary, 'bundle.js'),
  alias: { '@': path.join(root, 'src'), '@mui/icons-material': path.join(root, 'node_modules/@mui/icons-material/esm') },
  loader: { '.css': 'css', '.svg': 'dataurl', '.png': 'dataurl', '.woff2': 'file', '.ttf': 'file' },
  define: { 'process.env.NODE_ENV': '"production"' }, logLevel: 'silent',
  plugins: [{ name: 'original-import-with-completion-observation', setup(plugin) {
    if (baseline) plugin.onLoad({ filter: /(?:TemplateDesignerReactShell\.tsx|\/importWord\.ts)$/ }, args => ({
      contents: execFileSync('git', ['show', baseline + ':gmp-platform/frontend/' + path.relative(root, args.path)], {cwd:root,encoding:'utf8'}),
      loader:args.path.endsWith('.tsx')?'tsx':'ts',resolveDir:path.dirname(args.path),
    }));
    plugin.onLoad({filter:/\/templateImport\.ts$/},async args=>{
      const original=await readFile(args.path,'utf8');
      assert.ok(original.includes('export async function importTemplateToCanvasPage('));
      return {contents:original.replace('export async function importTemplateToCanvasPage(','async function actualImportTemplateToCanvasPage(')+
        '\nexport async function importTemplateToCanvasPage(file:File,currentPage?:CanvasPage|null){try{return await actualImportTemplateToCanvasPage(file,currentPage);}finally{(window as any).__completed.push(file.name);}}',
        loader:'ts',resolveDir:path.dirname(args.path)};
    });
  } }] });
  await writeFile(path.join(temporary, 'index.html'), '<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>导入上下文回归</title><link rel="stylesheet" href="/bundle.css"><style>html,body,#root{height:100%;margin:0}</style><div id="root"></div><script type="module" src="/bundle.js"></script></html>');
  server = http.createServer(async (req, res) => {
    const name = new URL(req.url, 'http://localhost').pathname.slice(1) || 'index.html';
    if (!['index.html','bundle.js','bundle.css'].includes(name)) { res.writeHead(404).end(); return; }
    res.setHeader('Content-Type', name.endsWith('.js')?'text/javascript':name.endsWith('.css')?'text/css':'text/html; charset=utf-8');
    try { res.end(await readFile(path.join(temporary,name))); } catch { res.writeHead(404).end(); }
  });
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH??'/usr/bin/chromium'});
  for(const name of cases){
    if(process.env.IMPORT_CASES&&!process.env.IMPORT_CASES.split(',').includes(name))continue;
    const context=await browser.newContext({viewport:{width,height:1000}}),page=await context.newPage();
    page.setDefaultTimeout(10000);const errors=[],dialogs=[],requests=[],steps=[];let phase='fixture';
    page.on('pageerror',e=>errors.push(e.message));page.on('dialog',async d=>{dialogs.push({type:d.type(),message:d.message()});await d.dismiss()});
    await context.route('**/api/**',async route=>{requests.push({method:route.request().method(),url:route.request().url()});
      assert.equal(route.request().method(),'GET','catalog fixture cannot write');
      await route.fulfill({status:200,json:{code:200,data:{version:'form-projection-v1',models:[],notice:''}}});});
    try{
      await page.goto('http://127.0.0.1:'+server.address().port);await page.locator('[data-shell-template-path]').waitFor();
      await page.waitForFunction(()=>window.__store.getState().document?.meta.versionId==='version-A'&&!window.__store.getState().isDirty());
      const before=await snapshot(page);steps.push({operation:'initial',state:summary(before)});phase='assertion';
      if(name==='empty-selection'){
        await page.locator('input[type="file"]').setInputFiles([]);await frame(page);
        assert.equal(hash(await snapshot(page)),hash(before));assert.deepEqual(await page.evaluate(()=>window.__reads),[]);
      }else if(['normal-xlsx','normal-docx','blank-docx'].includes(name)){
        const isWord=name!=='normal-xlsx',isBlank=name==='blank-docx',file=isWord?(isBlank?'blank.docx':'normal.docx'):'normal.xlsx';
        await selectFile(page,file,isWord?(isBlank?blankDocxBytes:docxBytes):xlsxBytes);assert.equal(hash(await snapshot(page)),hash(before),'pending read does not edit');
        await finish(page,file);await assertImported(page,before,isBlank?'blank':isWord?'docx':'xlsx');
      }else if(name==='malformed-document-xml'||name==='malformed-rels-xml'){
        const bytes=name==='malformed-document-xml'?malformedDocumentBytes:malformedRelsBytes;
        await selectFile(page,'malformed.docx',bytes);await finish(page,'malformed.docx');
        assert.equal(hash(await snapshot(page)),hash(before),'malformed XML must not become an accepted blank or partial import');
        assert.deepEqual(dialogs,[],'XML parse errors use app-owned feedback');await page.getByRole('alert').waitFor();
      }else if(name==='current-error-and-retry'){
        await selectFile(page,'bad.docx',Buffer.from('not-a-zip'));await finish(page,'bad.docx');
        assert.equal(hash(await snapshot(page)),hash(before),'parse failure retains all original data/history');
        assert.deepEqual(dialogs,[],'current import errors use owned feedback, never browser alert');
        await page.getByRole('alert').waitFor();
        await selectFile(page,'retry.xlsx');await finish(page,'retry.xlsx');await assertImported(page,before);
      }else if(name==='close-prompt-cancel'){
        await editCell(page,'导入前已编辑');const dirty=await snapshot(page);
        await selectFile(page,'after-close-cancel.xlsx');await page.getByRole('button',{name:'关闭',exact:true}).click();
        await page.getByRole('button',{name:'继续编辑',exact:true}).click();await finish(page,'after-close-cancel.xlsx');
        await assertImported(page,dirty);
      }else if(name==='newer-finishes-first'){
        await selectFile(page,'older.xlsx');await selectFile(page,'newer.docx',docxBytes);await finish(page,'newer.docx');
        await assertImported(page,before,'docx');const latest=await snapshot(page);
        await page.getByRole('button',{name:'字段设计',exact:true}).click();const modelTab=await snapshot(page);
        await finish(page,'older.xlsx');assert.equal(hash(await snapshot(page)),hash(modelTab),'old success cannot overwrite latest import or change tab');
        assert.equal(latest.saves,0);
      }else if(name==='stale-error-after-new-selection'){
        await selectFile(page,'old-error.docx',Buffer.from('not-zip'));await selectFile(page,'new-pending.xlsx');
        await finish(page,'old-error.docx');assert.equal(hash(await snapshot(page)),hash(before),'stale failure cannot write');
        assert.deepEqual(dialogs,[],'stale error must not show a browser alert');assert.equal(await page.getByRole('alert').count(),0,'stale error is silent');
        await finish(page,'new-pending.xlsx');await assertImported(page,before);
      }else{
        await selectFile(page,'pending.xlsx');
        if(name==='page-switch'||name==='page-switch-back'){await switchPage(page,1);if(name==='page-switch-back')await switchPage(page,0);}
        if(name==='version-switch'){await page.getByRole('button',{name:'宿主切换版本'}).click();await page.waitForFunction(()=>window.__store.getState().document.meta.versionId==='version-B');}
        if(name==='close-reopen'){
          await page.getByRole('button',{name:'关闭',exact:true}).click();await page.getByText('设计器已关闭',{exact:true}).waitFor();
          await page.getByRole('button',{name:'宿主重新打开'}).click();await page.locator('input[type="file"]').waitFor({state:'attached'});
          await page.waitForFunction(()=>window.__store.getState().document.meta.versionId==='version-A'&&!window.__store.getState().isDirty());
        }
        if(name==='edit-during-read')await editCell(page,'解析期间的新修改');
        const changed=await snapshot(page);steps.push({operation:'context-changed',state:summary(changed)});
        await finish(page,'pending.xlsx');assert.equal(hash(await snapshot(page)),hash(changed),'late import cannot replace current context, edit or history');
      }
      assert.deepEqual(dialogs,[],'no browser-owned dialogs');assert.deepEqual(errors,[],'no browser runtime errors');
      assert.equal((await snapshot(page)).saves,0,'no automatic saving');
      steps.push({operation:'completed',state:summary(await snapshot(page))});
      if(['normal-xlsx','current-error-and-retry','edit-during-read'].includes(name))await page.screenshot({path:path.join(artifacts,name+'.png'),fullPage:true});
      results.push({name,status:'passed',steps,dialogs,errors,requests});
    }catch(error){
      await page.screenshot({path:path.join(artifacts,name+'-failed.png'),fullPage:true});
      results.push({name,status:phase==='fixture'?'fixture-blocked':'failed',message:error.message.slice(0,1800),steps,
        actual:await snapshot(page).then(summary).catch(()=>null),dialogs,errors,requests});
    }finally{await context.close()}
  }
}finally{if(browser)await browser.close();if(server)await new Promise(resolve=>server.close(resolve));await rm(temporary,{recursive:true,force:true})}
const output={sourceCommit:head,workingTreeState,baselineSourceCommit:baseline??null,
  baselinePaths:baseline?['TemplateDesignerReactShell.tsx','utils/importWord.ts']:[],viewport:{width,height:1000},
  boundary:'Actual Shell, CanvasTab, store and original XLSX/DOCX parsers; file arrayBuffer promise gates and host props/open state controlled. Transparent parser finally marker only observes completion; no parser result mocks, backend writes, save/reopen persistence or physical-device claim.',results};
await writeFile(path.join(artifacts,'result.json'),JSON.stringify(output,null,2)+'\n');
console.log(JSON.stringify({sourceCommit:head,baselineSourceCommit:baseline??null,width,artifacts,results:results.map(({name,status,message})=>({name,status,message}))},null,2));
if(results.some(result=>result.status!=='passed'))process.exitCode=1;
