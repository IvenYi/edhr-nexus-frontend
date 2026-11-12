import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {createRequire} from 'node:module';
import {createHash} from 'node:crypto';
import {mkdtemp,mkdir,readFile,writeFile,rm} from 'node:fs/promises';
import http from 'node:http';
import path from 'node:path';
import os from 'node:os';
import {build} from 'esbuild';
import {paragraph,table,mergedTable,wordPackage} from './fixtures/template-designer-react/word-table-reuse.mjs';

const root=path.resolve(import.meta.dirname,'..'),{chromium}=createRequire(import.meta.url)('playwright');
const width=Number(process.env.WORD_TABLE_WIDTH??1440),artifacts=process.env.WORD_TABLE_ARTIFACTS??path.join(os.tmpdir(),`edhr-word-table-${width}`);
await mkdir(artifacts,{recursive:true});const temporary=await mkdtemp(path.join(os.tmpdir(),'edhr-word-table-host-'));
const hash=value=>createHash('sha256').update(JSON.stringify(value)).digest('hex');
const frame=page=>page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
const snapshot=page=>page.evaluate(()=>{const s=window.__store.getState();return{document:s.document,undo:s.undoStack,redo:s.redoStack,dirty:s.isDirty(),saves:window.__saves};});
const results=[];let server,browser;
try {
  await build({absWorkingDir:root,stdin:{resolveDir:root,loader:'tsx',contents:`
    import React,{useState}from'react';import{createRoot}from'react-dom/client';
    import{ThemeProvider,createTheme,CssBaseline}from'@mui/material';import{QueryClient,QueryClientProvider}from'@tanstack/react-query';
    import Shell from './src/pages/master-data/template-designer-react/TemplateDesignerReactShell';import{SnackbarProvider}from'./src/components/SnackbarProvider';
    import{useTemplateDesignerStore as store}from'./src/pages/master-data/template-designer-react/store/useTemplateDesignerStore';
    import{createEmptyTemplateDesignerDocument as createDoc,serializeTemplateDesignerDocument as serialize}from'./src/pages/master-data/template-designer-react/utils/document';
    const row={id:'word-template',name:'Word表格导入'};const d=createDoc({schema:'edhr-template-designer-react',version:1,templateId:row.id,versionId:'word-version',templateName:row.name,versionLabel:'V2'});
    d.canvas.pages[0].name='目标原页';d.canvas.pages[0].cells={'1:1':{value:'原文'}};d.canvas.pages.push({...structuredClone(d.canvas.pages[0]),id:'other-page',name:'保留另页'});
    d.workflow.config={description:'保留流程'};store.getState().setDocument(d);store.getState().addField('text','保留字段');
    const initial={id:'word-version',version:'V2',...serialize(store.getState().document)};window.__store=store;window.__saves=[];
    function App(){const[v,setV]=useState(initial);return <><nav><button onClick={()=>setV({...initial,...window.__saves.at(-1)})}>重新打开刚保存的设计</button></nav>
      <div style={{height:'calc(100vh - 24px)'}}><Shell row={row} version={v} saving={false} onClose={()=>{}}
        onSave={async payload=>{window.__saves.push(payload)}}/></div></>;}
    createRoot(document.getElementById('root')).render(<ThemeProvider theme={createTheme()}><CssBaseline/>
      <QueryClientProvider client={new QueryClient({defaultOptions:{queries:{retry:false}}})}><SnackbarProvider><App/></SnackbarProvider></QueryClientProvider></ThemeProvider>);
  `},outfile:path.join(temporary,'bundle.js'),bundle:true,platform:'browser',format:'esm',logLevel:'silent',
    alias:{'@':path.join(root,'src'),'@mui/icons-material':path.join(root,'node_modules/@mui/icons-material/esm')},
    loader:{'.css':'css','.svg':'dataurl','.png':'dataurl','.woff2':'file','.ttf':'file'},define:{'process.env.NODE_ENV':'"production"'}});
  await writeFile(path.join(temporary,'index.html'),'<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/bundle.css"><body style="margin:0"><div id="root"></div><script type="module" src="/bundle.js"></script></body></html>');
  server=http.createServer(async(req,res)=>{const file=new URL(req.url,'http://localhost').pathname.slice(1)||'index.html';
    if(!['index.html','bundle.js','bundle.css'].includes(file)){res.writeHead(404).end();return;}
    res.setHeader('Content-Type',file.endsWith('.js')?'text/javascript':file.endsWith('.css')?'text/css':'text/html; charset=utf-8');
    try{res.end(await readFile(path.join(temporary,file)));}catch{res.writeHead(404).end();}});
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH??'/usr/bin/chromium'});
  for(const name of ['history-and-save','same-name-new-file','failure-and-retry']){
    const context=await browser.newContext({viewport:{width,height:1000}}),page=await context.newPage(),record={case:name,width},errors=[];page.setDefaultTimeout(10000);page.on('pageerror',e=>errors.push(e.message));
    await context.route('**/api/**',async route=>{assert.equal(route.request().method(),'GET');await route.fulfill({status:200,json:{code:200,data:{version:'form-projection-v1',models:[],notice:''}}});});
    try {
      await page.goto('http://127.0.0.1:'+server.address().port);await page.waitForFunction(()=>window.__store.getState().document?.meta.versionId==='word-version'&&!window.__store.getState().isDirty());
      const before=await snapshot(page);record.before=before;
      async function upload(bytes){await page.locator('input[type="file"]').setInputFiles({name:'same-name.docx',mimeType:'application/vnd.openxmlformats-officedocument.wordprocessingml.document',buffer:bytes});}
      if(name==='failure-and-retry'){
        await upload(await wordPackage(table(2,1),{malformed:true}));await page.getByRole('alert').waitFor();assert.deepEqual(await snapshot(page),before);
      }
      const bytes=await wordPackage(paragraph('导入说明')+mergedTable()+table(4,3,'新来源A'));await writeFile(path.join(artifacts,name+'.docx'),bytes);await upload(bytes);
      await page.waitForFunction(()=>window.__store.getState().document.canvas.pages[0].wordDocument?.blocks.length===2);await frame(page);
      const after=await snapshot(page),p=after.document.canvas.pages[0];record.after=after;
      assert.equal(after.saves.length,0);assert.equal(after.undo.length,before.undo.length+1);assert.equal(after.dirty,true);
      assert.deepEqual(after.document.model,before.document.model);assert.deepEqual(after.document.workflow,before.document.workflow);assert.deepEqual(after.document.canvas.pages[1],before.document.canvas.pages[1]);
      assert.equal(p.id,before.document.canvas.pages[0].id);assert.equal(p.name,'目标原页');assert.equal(p.nodes.filter(n=>n.type==='static-image').length,5);
      const images=page.locator('[data-projection-canvas="true"] img');await images.first().waitFor();
      if(width<768){const close=page.getByRole('button',{name:'关闭侧边栏',exact:true});if(await close.count())await close.click();await images.first().scrollIntoViewIfNeeded();await frame(page);}
      record.rendered=await images.evaluateAll(items=>items.map(img=>({loaded:img.complete&&img.naturalWidth>0,bounds:img.getBoundingClientRect().toJSON()})));
      assert.equal(record.rendered.length,5);assert.ok(record.rendered.every(i=>i.loaded));assert.ok(record.rendered[0].bounds.left<width&&record.rendered[0].bounds.right>0);
      await page.screenshot({path:path.join(artifacts,name+'.png'),fullPage:true});
      await page.getByRole('button',{name:'撤销',exact:true}).click();assert.equal(hash((await snapshot(page)).document),hash(before.document));
      await page.getByRole('button',{name:'重做',exact:true}).click();assert.equal(hash((await snapshot(page)).document),hash(after.document));
      if(name==='same-name-new-file'){
        await upload(await wordPackage(table(2,1,'不同来源B')));await page.waitForFunction(()=>window.__store.getState().document.canvas.pages[0].wordDocument.blocks[0].cells[0].text==='不同来源B0');
        const next=await snapshot(page);record.next=next;assert.equal(next.undo.length,after.undo.length+1);assert.equal(next.saves.length,0);
        await page.getByRole('button',{name:'撤销',exact:true}).click();assert.equal(hash((await snapshot(page)).document),hash(after.document));
      }
      if(name==='history-and-save'){
        await page.getByRole('button',{name:'保存',exact:true}).click();await page.waitForFunction(()=>window.__saves.length===1&&!window.__store.getState().isDirty());
        const payload=await page.evaluate(()=>window.__saves[0]),persistedPage=JSON.parse(JSON.stringify(p));assert.deepEqual(JSON.parse(payload.canvasDesignJson).payload.pages[0],persistedPage);
        await page.getByRole('button',{name:'重新打开刚保存的设计',exact:true}).focus();await page.keyboard.press('Enter');await frame(page);
        const reopened=await snapshot(page);record.reopened=reopened;assert.deepEqual(JSON.parse(JSON.stringify(reopened.document.canvas.pages[0])),persistedPage);assert.equal(reopened.dirty,false);assert.equal(reopened.saves.length,1);
      }
      assert.deepEqual(errors,[]);record.outcome='passed';
    }catch(error){record.outcome='failed';record.failure=String(error);await page.screenshot({path:path.join(artifacts,name+'-failure.png'),fullPage:true}).catch(()=>{});}
    record.errors=errors;results.push(record);await context.close();
  }
}finally{await browser?.close();await new Promise(resolve=>server?server.close(resolve):resolve());await rm(temporary,{recursive:true,force:true});}
await writeFile(path.join(artifacts,'result.json'),JSON.stringify({head:execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim(),width,
  scope:'Actual Shell/store/Canvas/Word file import;host/GETAPI/save callbacks controlled;no handlers replaced or instrumented',results},null,2)+'\n');
console.log(JSON.stringify({total:results.length,passed:results.filter(r=>r.outcome==='passed').length,failed:results.filter(r=>r.outcome==='failed').length,artifacts}));
assert.ok(results.length===3&&results.every(r=>r.outcome==='passed'),'Word table browser assertions failed');
