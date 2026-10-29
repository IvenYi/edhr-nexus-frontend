import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { build } from '/workspace/edhr-nexus-frontend/gmp-platform/frontend/node_modules/esbuild/lib/main.js';

// Real Shell, CanvasTab, store and useProjectionCatalog/HTTP. The host controls
// version/open props and save callback completion; it is not the production
// parent's TanStack mutation and does not certify its URL or toast behavior.
const { chromium } = createRequire('/workspace/edhr-nexus-frontend/gmp-platform/frontend/package.json')('playwright');
const root = '/workspace/edhr-nexus-frontend/gmp-platform/frontend';
const baseline = process.env.SAVE_CONTEXT_BASELINE_COMMIT;
if (baseline && !/^[0-9a-f]{40}$/.test(baseline)) throw new Error('SAVE_CONTEXT_BASELINE_COMMIT must be a full SHA');
const width = Number(process.env.SAVE_CONTEXT_WIDTH ?? 1440);
const artifacts = process.env.SAVE_CONTEXT_ARTIFACTS ?? path.join(os.tmpdir(), `edhr-save-context-${width}`);
await mkdir(artifacts, { recursive: true });
const temporary = await mkdtemp(path.join(os.tmpdir(), 'edhr-save-context-host-'));
await writeFile(path.join(artifacts, 'host.json'), JSON.stringify({ temporary }) + '\n');
const head = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim();
const workingTreeState = execFileSync('git', ['status', '--porcelain=v1'], { cwd: root, encoding: 'utf8' });
const hash = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');
const results = [];
const cases = ['catalog-version-switch', 'catalog-switch-back', 'catalog-close-reopen', 'catalog-stale-error', 'same-context-latest-edit',
  'catalog-failure-retry', 'invalid-config-blocks', 'old-completion-keeps-new-busy', 'late-ack-after-reopen',
  'normal-save-clean', 'edit-after-send-remains-dirty', 'same-event-double-click', 'cancel-close-prompt'];
const catalog = { version: 'form-projection-v1', models: [{ id: 'formTrace', name: '追溯',
  attributes: [{ id: 'lookup_fixture', name: '检验标识', type: 'text' }] }], notice: '' };
const frame = page => page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
const save = page => page.getByRole('button', { name: '保存', exact: true });
const snapshot = page => page.evaluate(() => {
  const s = window.__store.getState();
  return { document: s.document, savedSnapshot: s.savedSnapshot, undo: s.undoStack, redo: s.redoStack,
    dirty: s.isDirty(), activeTab: s.activeTab };
});
const summary = s => ({ documentSha256: hash(s.document), savedSnapshotSha256: hash(s.savedSnapshot),
  undoSha256: hash(s.undo), redoSha256: hash(s.redo), dirty: s.dirty, activeTab: s.activeTab,
  versionId: s.document.meta.versionId, text: s.document.canvas.pages[0].cells['1:1']?.value });
async function edit(page, value) {
  const close = page.getByRole('button', { name: '关闭侧边栏', exact: true });
  if (await close.count()) await close.click();
  const cell = page.locator('[data-projection-canvas="true"] [data-sheet-cell-row="1"][data-sheet-cell-col="1"]').first();
  await cell.click(); await cell.press('F2');
  await page.locator('[data-sheet-cell-editor="true"] textarea:visible').fill(value);
  await page.getByRole('button', { name: '表单设计', exact: true }).click();
  await page.waitForFunction(v => window.__store.getState().document.canvas.pages[0].cells['1:1']?.value === v, value);
}
async function switchTo(page, key) {
  await page.getByRole('button', { name: `宿主切换${key}`, exact: true }).click();
  await page.waitForFunction(key => window.__store.getState().document.meta.versionId === 'version-' + key, key);
  await frame(page);
}
async function closeAndReopen(page) {
  await page.getByRole('button', { name: '关闭', exact: true }).click();
  const discard = page.getByRole('button', { name: '放弃并关闭', exact: true });
  if (await discard.count()) await discard.click();
  await page.getByText('设计器已关闭', { exact: true }).waitFor();
  await page.getByRole('button', { name: '宿主打开A', exact: true }).click();
  await page.waitForFunction(() => window.__store.getState().document.meta.versionId === 'version-A' && !window.__store.getState().isDirty());
  await frame(page);
}
async function waitDone(page, id) { await page.waitForFunction(id => window.__saveDone.includes(id), id); await frame(page); }
async function settleSave(page, index = 0) {
  await page.evaluate(index => window.__saves[index].resolve(), index);
  await frame(page);
}
function payloadText(request) { return JSON.parse(request.payload.canvasDesignJson).payload.pages[0].cells['1:1']?.value; }

let server, browser;
try {
  await build({ absWorkingDir: root, stdin: { resolveDir: root, loader: 'tsx', contents: `
    import React,{useState} from 'react';import {createRoot} from 'react-dom/client';
    import {ThemeProvider,createTheme,CssBaseline} from '@mui/material';
    import {QueryClient,QueryClientProvider} from '@tanstack/react-query';
    import Shell from './src/pages/master-data/template-designer-react/TemplateDesignerReactShell';
    import {SnackbarProvider} from './src/components/SnackbarProvider';
    import {useTemplateDesignerStore as store} from './src/pages/master-data/template-designer-react/store/useTemplateDesignerStore';
    import {createEmptyTemplateDesignerDocument,serializeTemplateDesignerDocument} from './src/pages/master-data/template-designer-react/utils/document';
    const row={id:'save-context-fixture',name:'保存上下文审查'};
    const versions={};for(const key of ['A','B','C']){
      const doc=createEmptyTemplateDesignerDocument({schema:'edhr-template-designer-react',version:1,templateId:row.id,
        versionId:'version-'+key,templateName:row.name,versionLabel:key});
      const p=doc.canvas.pages[0];p.sheet={...p.sheet,rowCount:5,columnCount:4,rowHeights:Array(5).fill(36),columnWidths:Array(4).fill(84),showRuler:false};
      p.cells={'1:1':{value:'原稿'+key}};store.getState().setDocument(doc);
      const field=store.getState().addField('text','标识字段');
      store.getState().setProjectionBindings([{id:'lookup',modelId:'formTrace',enabled:true,
        sources:{lookup_fixture:key==='C'?'missing-field':field.id}}]);
      versions[key]={id:'version-'+key,version:key,...serializeTemplateDesignerDocument(store.getState().document)};
    }
    const client=new QueryClient({defaultOptions:{queries:{retry:false,refetchOnWindowFocus:false}}});
    window.__store=store;window.__client=client;window.__saves=[];window.__holdSave=false;window.__saveStart=0;window.__saveDone=[];
    function App(){const [key,setKey]=useState('A');const [open,setOpen]=useState(true);
      const persist=async payload=>{const entry={target:'version-'+key,payload};window.__saves.push(entry);
        if(window.__holdSave)await new Promise(resolve=>{entry.resolve=resolve});};
      return <><nav>{['A','B','C'].map(k=><button key={k} onClick={()=>setKey(k)}>宿主切换{k}</button>)}
        <button onClick={()=>{setKey('A');setOpen(true)}}>宿主打开A</button></nav>
        {open?<div style={{height:'calc(100vh - 24px)'}}><Shell row={row} version={versions[key]} saving={false}
          onSave={persist} onAutoSave={persist} onClose={()=>setOpen(false)}/></div>:<div>设计器已关闭</div>}</>}
    createRoot(document.getElementById('root')).render(<ThemeProvider theme={createTheme()}><CssBaseline/>
      <QueryClientProvider client={client}><SnackbarProvider><App/></SnackbarProvider></QueryClientProvider></ThemeProvider>);
  ` }, bundle: true, platform: 'browser', format: 'esm', outfile: path.join(temporary, 'bundle.js'),
  alias: { '@': path.join(root, 'src'), '@mui/icons-material': path.join(root, 'node_modules/@mui/icons-material/esm') },
  loader: { '.css':'css','.svg':'dataurl','.png':'dataurl','.woff2':'file','.ttf':'file' },
  define: { 'process.env.NODE_ENV':'"production"' }, logLevel: 'silent',
  plugins: [{ name: 'original-save-with-completion-observer', setup(plugin) {
    plugin.onLoad({ filter:/TemplateDesignerReactShell\.tsx$/ }, async args => {
      const original = baseline ? execFileSync('git',['show',baseline+':gmp-platform/frontend/'+path.relative(root,args.path)],{cwd:root,encoding:'utf8'}) : await readFile(args.path,'utf8');
      assert.equal(original.split('const handleSave = async () => {').length,2,'transparent observer must locate exactly one handler');
      const observed=original.replace('const handleSave = async () => {','const actualHandleSave = async () => {')
        .replace('  const handleFieldConfirmPersist = async () => {',`  const handleSave = async () => {
          const id=++(window as any).__saveStart;
          try{return await actualHandleSave();}finally{(window as any).__saveDone.push(id);}
        };
        const handleFieldConfirmPersist = async () => {`);
      return {contents:observed,loader:'tsx',resolveDir:path.dirname(args.path)};
    });
  } }] });
  await writeFile(path.join(temporary,'index.html'),'<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>保存上下文回归</title><link rel="stylesheet" href="/bundle.css"><style>html,body,#root{height:100%;margin:0}</style><div id="root"></div><script type="module" src="/bundle.js"></script></html>');
  server=http.createServer(async(req,res)=>{const name=new URL(req.url,'http://localhost').pathname.slice(1)||'index.html';
    if(!['index.html','bundle.js','bundle.css'].includes(name)){res.writeHead(404).end();return;}
    res.setHeader('Content-Type',name.endsWith('.js')?'text/javascript':name.endsWith('.css')?'text/css':'text/html; charset=utf-8');
    try{res.end(await readFile(path.join(temporary,name)))}catch{res.writeHead(404).end()}});
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH??'/usr/bin/chromium'});
  for(const name of cases){
    if(process.env.SAVE_CONTEXT_CASES&&!process.env.SAVE_CONTEXT_CASES.split(',').includes(name))continue;
    const context=await browser.newContext({viewport:{width,height:1000}}),page=await context.newPage();
    page.setDefaultTimeout(10000);const errors=[],dialogs=[],requests=[],pending=[],steps=[];let armed=false,phase='fixture';
    page.on('pageerror',e=>errors.push(e.message));page.on('dialog',async d=>{dialogs.push(d.message());await d.dismiss()});
    await context.route('**/api/**',async route=>{
      requests.push({method:route.request().method(),url:route.request().url()});
      assert.equal(route.request().method(),'GET','host callback does not issue backend writes');
      if(route.request().url().endsWith('/projection-catalog')&&armed){await new Promise(resolve=>pending.push({route,resolve,finished:false}));return;}
      await route.fulfill({status:200,json:{code:200,data:catalog}});
    });
    const releaseCatalog=async(index=0,failure=false)=>{const p=pending[index];assert.ok(p,'real catalog request must be pending');
      if(!p.finished){p.finished=true;await p.route.fulfill({status:failure?500:200,json:failure?{code:500,message:'受控目录失败'}:{code:200,data:catalog}}).catch(()=>{});p.resolve();}};
    const start=async()=>{const index=pending.length,id=await page.evaluate(()=>window.__saveStart+1);
      const received=page.waitForRequest(r=>r.url().endsWith('/projection-catalog')).then(()=>null,error=>error);
      await save(page).click();const requestError=await received;if(requestError)throw requestError;
      await page.waitForFunction(()=>window.__client.isFetching({queryKey:['form-projection-catalog']})>0);
      await frame(page);
      assert.equal(pending.length,index+1,'save starts one actual catalog request');return {index,id};};
    try{
      await page.goto('http://127.0.0.1:'+server.address().port);await page.locator('[data-shell-template-path]').waitFor({state:'attached'});
      await page.waitForFunction(()=>window.__store.getState().document?.meta.versionId==='version-A'&&window.__client.isFetching()===0);
      await frame(page);const before=await snapshot(page);steps.push({operation:'initial',state:summary(before)});const geometry={title:await page.locator('[data-shell-template-path]').boundingBox(),buttons:[]};
      for(const name of ['用途总览','模板导入','模拟填报','保存','关闭']){const b=page.getByRole('button',{name,exact:true});let trial='passed';try{await b.click({trial:true,timeout:1200});}catch(e){trial=e.message.slice(0,1200);}geometry.buttons.push({name,box:await b.boundingBox(),trial});}
      await writeFile(path.join(artifacts,'geometry.json'),JSON.stringify(geometry,null,2));
      phase='assertion';armed=true;
      if(['catalog-version-switch','catalog-switch-back','catalog-close-reopen','catalog-stale-error'].includes(name)){
        const run=await start();
        if(name==='catalog-close-reopen')await closeAndReopen(page);else{await switchTo(page,'B');if(name==='catalog-switch-back')await switchTo(page,'A');}
        const changed=await snapshot(page);await releaseCatalog(run.index,name==='catalog-stale-error');await waitDone(page,run.id);
        assert.equal(await page.evaluate(()=>window.__saves.length),0,'old save intent must not persist in the changed context');
        assert.equal(hash(await snapshot(page)),hash(changed),'late catalog cannot change new document/history/saved baseline');
        if(name==='catalog-stale-error')assert.equal(await page.getByRole('alert').count(),0,'old catalog errors must not appear in the new context');
      }else if(name==='same-context-latest-edit'){
        const run=await start();await edit(page,'目录等待时的新内容');const changed=await snapshot(page);
        await releaseCatalog(run.index);await waitDone(page,run.id);
        const saves=await page.evaluate(()=>window.__saves.map(({target,payload})=>({target,payload})));
        assert.equal(saves.length,1);assert.equal(saves[0].target,'version-A');assert.equal(payloadText(saves[0]),'目录等待时的新内容');
        assert.equal(hash((await snapshot(page)).document),hash(changed.document));assert.equal((await snapshot(page)).dirty,false);
      }else if(name==='catalog-failure-retry'){
        const run=await start();await releaseCatalog(run.index,true);await waitDone(page,run.id);
        assert.equal(hash(await snapshot(page)),hash(before));assert.equal(await page.evaluate(()=>window.__saves.length),0);
        await page.getByRole('alert').getByText('用途目录加载失败，请重试保存',{exact:true}).waitFor();assert.equal(await save(page).isEnabled(),true);
        const alert=page.getByRole('alert');await alert.getByRole('button').click();await alert.waitFor({state:'hidden'});
        const retry=await start();await releaseCatalog(retry.index);await waitDone(page,retry.id);assert.equal(await page.evaluate(()=>window.__saves.length),1);
      }else if(name==='invalid-config-blocks'){
        await switchTo(page,'C');const changed=await snapshot(page),run=await start();await releaseCatalog(run.index);await waitDone(page,run.id);
        await page.getByRole('dialog').filter({hasText:'完善用途配置'}).waitFor();assert.equal(await page.evaluate(()=>window.__saves.length),0);
        assert.equal(hash(await snapshot(page)),hash(changed),'invalid config preserves full state');
      }else if(name==='old-completion-keeps-new-busy'){
        await page.evaluate(()=>{window.__holdSave=true});const old=await start();await releaseCatalog(old.index);
        await page.waitForFunction(()=>window.__saves.length===1);await switchTo(page,'B');
        assert.equal(await save(page).isEnabled(),true,'new context can start its own save without waiting for old context');
        const current=await start();await settleSave(page,0);await waitDone(page,old.id);
        assert.equal(await save(page).isEnabled(),false,'old finally must not unlock the current catalog request');
        await releaseCatalog(current.index);await page.waitForFunction(()=>window.__saves.length===2);await settleSave(page,1);await waitDone(page,current.id);
        assert.equal(await save(page).isEnabled(),true);assert.deepEqual(await page.evaluate(()=>window.__saves.map(s=>s.target)),['version-A','version-B']);
      }else if(name==='late-ack-after-reopen'){
        await edit(page,'已经发送的A稿');await page.evaluate(()=>{window.__holdSave=true});const run=await start();await releaseCatalog(run.index);
        await page.waitForFunction(()=>window.__saves.length===1);await closeAndReopen(page);const reopened=await snapshot(page);
        await settleSave(page);await waitDone(page,run.id);assert.equal(hash(await snapshot(page)),hash(reopened),'late save acknowledgement cannot dirty or acknowledge reopened draft');
      }else if(name==='normal-save-clean'){
        await edit(page,'正常保存内容');const run=await start();await releaseCatalog(run.index);await waitDone(page,run.id);
        assert.equal((await snapshot(page)).dirty,false);assert.equal(await page.evaluate(()=>window.__saves.length),1);assert.equal(await save(page).isEnabled(),true);
      }else if(name==='edit-after-send-remains-dirty'){
        await page.evaluate(()=>{window.__holdSave=true});const run=await start();await releaseCatalog(run.index);await page.waitForFunction(()=>window.__saves.length===1);
        await edit(page,'发送后的新修改');await settleSave(page);await waitDone(page,run.id);assert.equal((await snapshot(page)).dirty,true);
        await page.getByRole('button',{name:'撤销',exact:true}).click();assert.equal((await snapshot(page)).dirty,false);
        await page.getByRole('button',{name:'重做',exact:true}).click();assert.equal((await snapshot(page)).dirty,true);
      }else if(name==='same-event-double-click'){
        const id=await page.evaluate(()=>window.__saveStart+1);await save(page).evaluate(button=>{button.click();button.click()});
        await page.waitForFunction(()=>window.__client.isFetching()>0);assert.equal(pending.length,1);
        await releaseCatalog();await waitDone(page,id);assert.equal(await page.evaluate(()=>window.__saves.length),1,'double activation must not persist twice');
      }else if(name==='cancel-close-prompt'){
        await edit(page,'未保存内容');const run=await start();await page.getByRole('button',{name:'关闭',exact:true}).click();
        await page.getByRole('button',{name:'继续编辑',exact:true}).click();await releaseCatalog(run.index);await waitDone(page,run.id);
        assert.equal(await page.evaluate(()=>window.__saves.length),1,'cancelling close keeps the original save intent');assert.equal((await snapshot(page)).dirty,false);
      }
      assert.deepEqual(errors,[],'no browser runtime errors');assert.deepEqual(dialogs,[],'no native dialogs');
      steps.push({operation:'completed',state:summary(await snapshot(page)),saves:await page.evaluate(()=>window.__saves.map(({target,payload})=>({target,payload})))});
      if(['same-context-latest-edit','catalog-failure-retry','late-ack-after-reopen'].includes(name))await page.screenshot({path:path.join(artifacts,name+'.png'),fullPage:true});
      results.push({name,status:'passed',steps,errors,dialogs,requests});
    }catch(error){await page.screenshot({path:path.join(artifacts,name+'-failed.png'),fullPage:true});
      results.push({name,status:phase==='fixture'?'fixture-blocked':'failed',message:error.message.slice(0,1800),steps,actual:await snapshot(page).then(summary).catch(()=>null),saves:await page.evaluate(()=>window.__saves.map(({target,payload})=>({target,payload}))).catch(()=>[]),errors,dialogs,requests});
    }finally{for(let i=0;i<pending.length;i++)await releaseCatalog(i).catch(()=>{});await context.close()}
  }
}finally{if(browser)await browser.close();if(server)await new Promise(resolve=>server.close(resolve));await rm(temporary,{recursive:true,force:true})}
const output={sourceCommit:head,workingTreeState,baselineSourceCommit:baseline??null,viewport:{width,height:1000},
  boundary:'Actual Shell/CanvasTab/store/useProjectionCatalog and controlled HTTP GET; transparent handleSave finally observer. Host props/open and save callback completion controlled, not actual TemplateModelingPage mutation URLs/toasts, backend persistence or physical-device certification.',results};
await writeFile(path.join(artifacts,'result.json'),JSON.stringify(output,null,2)+'\n');
console.log(JSON.stringify({sourceCommit:head,baselineSourceCommit:baseline??null,width,artifacts,results:results.map(({name,status,message})=>({name,status,message}))},null,2));
if(results.some(r=>r.status!=='passed'))process.exitCode=1;
