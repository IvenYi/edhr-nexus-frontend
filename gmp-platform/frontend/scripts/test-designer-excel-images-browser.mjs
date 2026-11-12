import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {mkdtemp,mkdir,readFile,writeFile,rm} from 'node:fs/promises';
import http from 'node:http';
import path from 'node:path';
import os from 'node:os';
import {build} from 'esbuild';

const root=path.resolve(import.meta.dirname,'..'),require=createRequire(import.meta.url),ExcelJS=require('exceljs');
const{chromium}=require('playwright'),width=Number(process.env.EXCEL_IMAGES_WIDTH??1440);
const artifacts=process.env.EXCEL_IMAGES_ARTIFACTS??path.join(os.tmpdir(),`edhr-excel-images-${width}`);
const baseline=process.env.EXCEL_IMAGES_BASELINE_COMMIT;
if(baseline&&!/^[0-9a-f]{40}$/.test(baseline))throw new Error('baseline must be a complete SHA');
await mkdir(artifacts,{recursive:true});const temporary=await mkdtemp(path.join(os.tmpdir(),'edhr-excel-browser-'));
const png=await readFile(path.join(root,'scripts/fixtures/template-designer-react/sample-badge.png'));
const hash=value=>createHash('sha256').update(JSON.stringify(value)).digest('hex');
const frame=page=>page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
const snapshot=page=>page.evaluate(()=>{const s=window.__store.getState();return{document:s.document,undo:s.undoStack,redo:s.redoStack,dirty:s.isDirty(),saves:window.__saves};});
const cases=['one-cell','two-cell','shared-media','saved-reopen'],results=[];let server,browser;
try {
  await build({absWorkingDir:root,stdin:{resolveDir:root,loader:'tsx',contents:`
    import React,{useState}from'react';import{createRoot}from'react-dom/client';
    import{ThemeProvider,createTheme,CssBaseline}from'@mui/material';import{QueryClient,QueryClientProvider}from'@tanstack/react-query';
    import Shell from './src/pages/master-data/template-designer-react/TemplateDesignerReactShell';
    import{SnackbarProvider}from'./src/components/SnackbarProvider';
    import{useTemplateDesignerStore as store}from'./src/pages/master-data/template-designer-react/store/useTemplateDesignerStore';
    import{createEmptyTemplateDesignerDocument as createDoc,serializeTemplateDesignerDocument as serialize}from'./src/pages/master-data/template-designer-react/utils/document';
    const row={id:'image-template',name:'图片导入核对'};const d=createDoc({schema:'edhr-template-designer-react',version:1,templateId:row.id,versionId:'image-version',templateName:row.name,versionLabel:'V2'});
    d.canvas.pages[0].name='目标原页';d.canvas.pages.push({...structuredClone(d.canvas.pages[0]),id:'other-page',name:'保留另页'});
    d.workflow.config={description:'保留流程'};store.getState().setDocument(d);store.getState().addField('text','保留模型');
    const initial={id:'image-version',version:'V2',...serialize(store.getState().document)};window.__store=store;window.__saves=[];
    function App(){const[v,setV]=useState(initial);return <><nav><button onClick={()=>setV({...initial,...window.__saves.at(-1)})}>重新打开刚保存的设计</button></nav>
      <div style={{height:'calc(100vh - 24px)'}}><Shell row={row} version={v} saving={false} onClose={()=>{}}
        onSave={async payload=>{window.__saves.push(payload)}}/></div></>;}
    createRoot(document.getElementById('root')).render(<ThemeProvider theme={createTheme()}><CssBaseline/>
      <QueryClientProvider client={new QueryClient({defaultOptions:{queries:{retry:false}}})}><SnackbarProvider><App/></SnackbarProvider></QueryClientProvider></ThemeProvider>);
  `},outfile:path.join(temporary,'bundle.js'),bundle:true,platform:'browser',format:'esm',logLevel:'silent',
    alias:{'@':path.join(root,'src'),'@mui/icons-material':path.join(root,'node_modules/@mui/icons-material/esm')},
    loader:{'.css':'css','.svg':'dataurl','.png':'dataurl','.woff2':'file','.ttf':'file'},define:{'process.env.NODE_ENV':'"production"'},
    plugins:baseline?[{name:'old-excel-adapter-only',setup(plugin){plugin.onLoad({filter:/\/utils\/importExcel\.ts$/},args=>({
      contents:execFileSync('git',['show',baseline+':gmp-platform/frontend/'+path.relative(root,args.path)],{cwd:root,encoding:'utf8'}),loader:'ts',resolveDir:path.dirname(args.path)}));}}]:[]});
  await writeFile(path.join(temporary,'index.html'),'<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/bundle.css"><body style="margin:0"><div id="root"></div><script type="module" src="/bundle.js"></script></body></html>');
  server=http.createServer(async(req,res)=>{const file=new URL(req.url,'http://localhost').pathname.slice(1)||'index.html';
    if(!['index.html','bundle.js','bundle.css'].includes(file)){res.writeHead(404).end();return;}
    res.setHeader('Content-Type',file.endsWith('.js')?'text/javascript':file.endsWith('.css')?'text/css':'text/html; charset=utf-8');
    try{res.end(await readFile(path.join(temporary,file)));}catch{res.writeHead(404).end();}});
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH??'/usr/bin/chromium'});
  for(const name of cases){const context=await browser.newContext({viewport:{width,height:1000}}),page=await context.newPage();page.setDefaultTimeout(10000);
    const errors=[],record={case:name,width};page.on('pageerror',e=>errors.push(e.message));
    await context.route('**/api/**',async route=>{assert.equal(route.request().method(),'GET');await route.fulfill({status:200,json:{code:200,data:{version:'form-projection-v1',models:[],notice:''}}});});
    try {
      const wb=new ExcelJS.Workbook(),ws=wb.addWorksheet('导入图片');ws.pageSetup.orientation='portrait';ws.columns=Array.from({length:6},()=>({width:12}));
      ws.getCell('A1').value='图示';ws.getCell('F10').value=0;const id=wb.addImage({buffer:png,extension:'png'});
      ws.addImage(id,{tl:{col:1,row:2},...(name==='two-cell'?{br:{col:3,row:5}}:{ext:{width:180,height:72}})});
      if(name==='shared-media')ws.addImage(id,{tl:{col:2,row:4},ext:{width:90,height:36}});
      const bytes=Buffer.from(await wb.xlsx.writeBuffer());await writeFile(path.join(artifacts,name+'.xlsx'),bytes);
      await page.goto('http://127.0.0.1:'+server.address().port);await page.waitForFunction(()=>window.__store.getState().document?.meta.versionId==='image-version'&&!window.__store.getState().isDirty());
      const before=await snapshot(page);record.before=before;
      await page.locator('input[type="file"]').setInputFiles({name:name+'.xlsx',mimeType:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',buffer:bytes});
      await page.waitForFunction(()=>window.__store.getState().document.canvas.pages[0].images.length>0);await frame(page);
      const after=await snapshot(page),p=after.document.canvas.pages[0];record.after=after;
      assert.equal(after.saves.length,0);assert.equal(after.undo.length,before.undo.length+1);assert.equal(after.dirty,true);
      assert.deepEqual(after.document.model,before.document.model);assert.deepEqual(after.document.workflow,before.document.workflow);assert.deepEqual(after.document.canvas.pages[1],before.document.canvas.pages[1]);
      assert.equal(p.id,before.document.canvas.pages[0].id);assert.equal(p.name,'目标原页');assert.equal(p.medias.length,1);
      const expected=name==='two-cell'?[[250,108]]:name==='shared-media'?[[180,72],[90,36]]:[[180,72]];
      record.expected=expected;record.actual=p.images.map(i=>[i.layout.width,i.layout.height]);
      const images=page.locator('[data-projection-canvas="true"] img');await images.first().waitFor();
      if(width<768){const close=page.getByRole('button',{name:'关闭侧边栏',exact:true});if(await close.count())await close.click();await images.first().scrollIntoViewIfNeeded();await frame(page);}
      record.rendered=await images.evaluateAll(elements=>elements.map(img=>({width:parseFloat(getComputedStyle(img).width),height:parseFloat(getComputedStyle(img).height),loaded:img.complete&&img.naturalWidth>0,bounds:img.getBoundingClientRect().toJSON()})));
      await page.screenshot({path:path.join(artifacts,name+'.png'),fullPage:true});
      assert.deepEqual(record.actual,expected);assert.equal(record.rendered.length,expected.length);assert.ok(record.rendered.every(i=>i.loaded));
      assert.deepEqual(record.rendered.map(i=>[i.width,i.height]),expected);
      assert.ok(record.rendered[0].bounds.left<width&&record.rendered[0].bounds.right>0,'first image is reachable in the current viewport');
      await page.getByRole('button',{name:'撤销',exact:true}).click();assert.equal(hash((await snapshot(page)).document),hash(before.document));
      await page.getByRole('button',{name:'重做',exact:true}).click();assert.equal(hash((await snapshot(page)).document),hash(after.document));
      if(name==='saved-reopen'){
        await page.getByRole('button',{name:'保存',exact:true}).click();await page.waitForFunction(()=>window.__saves.length===1&&!window.__store.getState().isDirty());
        const payload=await page.evaluate(()=>window.__saves[0]);assert.equal(JSON.parse(payload.canvasDesignJson).payload.pages[0].images[0].layout.width,180);
        await page.getByRole('button',{name:'重新打开刚保存的设计',exact:true}).focus();await page.keyboard.press('Enter');await frame(page);
        const reopened=await snapshot(page);record.reopened=reopened;assert.deepEqual(reopened.document.canvas.pages[0].images,p.images);assert.equal(reopened.dirty,false);
        assert.equal(reopened.saves.length,1);await page.screenshot({path:path.join(artifacts,name+'-reopened.png'),fullPage:true});
      }
      assert.deepEqual(errors,[]);record.outcome='passed';
    }catch(error){record.outcome='failed';record.failure=String(error);await page.screenshot({path:path.join(artifacts,name+'-failure.png'),fullPage:true}).catch(()=>{});}
    record.errors=errors;results.push(record);await context.close();
  }
}finally{await browser?.close();await new Promise(resolve=>server?server.close(resolve):resolve());await rm(temporary,{recursive:true,force:true});}
const sourcePath='src/pages/master-data/template-designer-react/utils/importExcel.ts';
const source=baseline?execFileSync('git',['show',baseline+':gmp-platform/frontend/'+sourcePath],{cwd:root,encoding:'utf8'}):await readFile(path.join(root,sourcePath),'utf8');
await writeFile(path.join(artifacts,'result.json'),JSON.stringify({head:execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim(),baseline:baseline??null,width,
  adapterSha256:createHash('sha256').update(source).digest('hex'),scope:'Actual Shell,store,Canvas and importExcel;real workbook bytes;only host/API callbacks controlled;no product handler observation or replacement.',results},null,2)+'\n');
console.log(JSON.stringify({total:results.length,passed:results.filter(i=>i.outcome==='passed').length,failed:results.filter(i=>i.outcome==='failed').length,artifacts}));
assert.ok(results.length===4&&results.every(i=>i.outcome==='passed'),'Excel image browser assertions failed');
