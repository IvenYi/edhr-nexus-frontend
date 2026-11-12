import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { mkdtemp, mkdir, readFile, writeFile, rm } from 'node:fs/promises';
import http from 'node:http';
import path from 'node:path';
import os from 'node:os';
import { build } from 'esbuild';

const root=path.resolve(import.meta.dirname,'..');
const width=Number(process.env.DOCUMENT_READ_WIDTH??1440);
const artifacts=process.env.DOCUMENT_READ_ARTIFACTS??path.join(os.tmpdir(),`edhr-document-read-${width}`);
const baseline=process.env.DOCUMENT_READ_BASELINE_COMMIT;
if(baseline&&!/^[0-9a-f]{40}$/.test(baseline))throw new Error('baseline must be a complete SHA');
await mkdir(artifacts,{recursive:true});
const temporary=await mkdtemp(path.join(os.tmpdir(),'edhr-document-browser-'));
const {chromium}=createRequire(import.meta.url)('playwright');
const frame=page=>page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
const state=page=>page.evaluate(()=>{const s=window.__store.getState();return{document:s.document,saved:s.savedSnapshot,undo:s.undoStack,redo:s.redoStack,dirty:s.isDirty()};});
const hash=value=>createHash('sha256').update(JSON.stringify(value)).digest('hex');
const sourceFiles=['src/pages/master-data/template-designer-react/TemplateDesignerReactShell.tsx','src/pages/master-data/template-designer-react/utils/document.ts'];
const sources=[];
for(const name of sourceFiles){const text=baseline?execFileSync('git',['show',baseline+':gmp-platform/frontend/'+name],{cwd:root,encoding:'utf8'}):await readFile(path.join(root,name),'utf8');sources.push({path:name,sha256:createHash('sha256').update(text).digest('hex')});}
const cases=['normal-save','empty-initial','workflow-syntax','canvas-shape','future-protocol','same-id-failure','failure-close-and-reopen','held-autosave-after-failure'];
const results=[];let server,browser;
try {
  await build({absWorkingDir:root,stdin:{resolveDir:root,loader:'tsx',contents:`
    import React,{useState} from 'react';import{createRoot}from'react-dom/client';
    import{ThemeProvider,createTheme,CssBaseline}from'@mui/material';
    import{QueryClient,QueryClientProvider}from'@tanstack/react-query';
    import Shell from './src/pages/master-data/template-designer-react/TemplateDesignerReactShell';
    import{useTemplateDesignerStore as store}from'./src/pages/master-data/template-designer-react/store/useTemplateDesignerStore';
    import{createEmptyTemplateDesignerDocument as createDoc,serializeTemplateDesignerDocument as serialize}from'./src/pages/master-data/template-designer-react/utils/document';
    import{SnackbarProvider}from'./src/components/SnackbarProvider';
    const row={id:'read-template',name:'设计读取审查'};const versions={};
    for(const key of ['A','B','C','D']){const doc=createDoc({schema:'edhr-template-designer-react',version:1,templateId:row.id,versionId:'version-'+key,templateName:row.name,versionLabel:key});
      const p=doc.canvas.pages[0];p.sheet={...p.sheet,rowCount:5,columnCount:4,rowHeights:Array(5).fill(36),columnWidths:Array(4).fill(84),showRuler:false};p.cells={'1:1':{value:'原设计'+key}};
      versions[key]={id:'version-'+key,version:key,...serialize(doc)};}
    versions.B.workflowDesignJson='{"nodes":';
    versions.C.canvasDesignJson=JSON.stringify({schema:'edhr-template-designer-react',version:1,payload:{pages:{unreadable:true}}});
    versions.D.canvasDesignJson=JSON.stringify({schema:'edhr-template-designer-react',version:2,payload:{pages:[]}});
    versions.Empty={id:'empty-version',version:'草稿',modelDesignJson:'{"fields":[]}',canvasDesignJson:'{"layers":[]}',workflowDesignJson:'{"nodes":[],"edges":[]}'};
    window.__store=store;window.__writes=[];
    function App(){const[version,setVersion]=useState(versions.A),[open,setOpen]=useState(true);
      const persist=kind=>async payload=>{window.__writes.push({kind,target:version.id,payload});};
      return <><nav>{Object.keys(versions).map(key=><button key={key} onClick={()=>{setVersion(versions[key]);setOpen(true)}}>{'宿主打开'+key}</button>)}
        <button onClick={()=>setVersion({...versions.A,canvasDesignJson:'{"pages":'})}>宿主更新同身份来源</button></nav>
        {open?<div style={{height:'calc(100vh - 32px)'}}><Shell row={row} version={version} saving={false}
          onSave={persist('manual')} onAutoSave={persist('field')} onClose={()=>setOpen(false)}/></div>:<p>设计器已关闭</p>}</>;
    }
    createRoot(document.getElementById('root')).render(<ThemeProvider theme={createTheme()}><CssBaseline/>
      <QueryClientProvider client={new QueryClient({defaultOptions:{queries:{retry:false,refetchOnWindowFocus:false}}})}>
      <SnackbarProvider><App/></SnackbarProvider></QueryClientProvider></ThemeProvider>);
  `},outfile:path.join(temporary,'bundle.js'),bundle:true,platform:'browser',format:'esm',logLevel:'silent',
    alias:{'@':path.join(root,'src'),'@mui/icons-material':path.join(root,'node_modules/@mui/icons-material/esm')},
    loader:{'.css':'css','.svg':'dataurl','.png':'dataurl','.woff2':'file','.ttf':'file'},define:{'process.env.NODE_ENV':'"production"'},
    plugins:[{name:'source-selection-and-callback-observation-only',setup(plugin){
      plugin.onLoad({filter:/(?:TemplateDesignerReactShell\.tsx|\/utils\/document\.ts)$/},async args=>{
        const original=baseline?execFileSync('git',['show',baseline+':gmp-platform/frontend/'+path.relative(root,args.path)],{cwd:root,encoding:'utf8'}):await readFile(args.path,'utf8');
        if(args.path.endsWith('TemplateDesignerReactShell.tsx')){
          const marker='  const closeDesigner = () => {';assert.ok(original.includes(marker));
          return{contents:original.replace(marker,'  (window as any).__currentAutoSave = handleFieldConfirmPersist;\n'+marker),loader:'tsx',resolveDir:path.dirname(args.path)};
        }return{contents:original,loader:'ts',resolveDir:path.dirname(args.path)};
      });
    }}]});
  await writeFile(path.join(temporary,'index.html'),'<!doctype html><html lang="zh-CN"><meta charset="utf-8"><link rel="stylesheet" href="/bundle.css"><body style="margin:0"><div id="root"></div><script type="module" src="/bundle.js"></script></body></html>');
  server=http.createServer(async(req,res)=>{const pathname=new URL(req.url,'http://localhost').pathname;
    if(pathname.startsWith('/api/')){res.setHeader('Content-Type','application/json');res.end(JSON.stringify({code:200,data:{version:'form-projection-v1',models:[],notice:''}}));return;}
    const file=pathname==='/bundle.js'?'bundle.js':pathname==='/bundle.css'?'bundle.css':'index.html';res.setHeader('Content-Type',file.endsWith('.js')?'text/javascript':file.endsWith('.css')?'text/css':'text/html; charset=utf-8');
    try{res.end(await readFile(path.join(temporary,file)));}catch{res.statusCode=404;res.end();}
  });
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH});
  for(const name of cases){const context=await browser.newContext({viewport:{width,height:900}}),page=await context.newPage();page.setDefaultTimeout(6000);
    const errors=[],record={case:name,width,errors};page.on('pageerror',error=>errors.push(error.message));
    try {
      await page.goto('http://127.0.0.1:'+server.address().port);
      await page.waitForFunction(()=>window.__store.getState().document?.meta.versionId==='version-A');await frame(page);
      const before=await state(page);record.before=before;record.beforeSha256=hash(before);
      if(name==='normal-save'||name==='empty-initial'){
        if(name==='empty-initial'){await page.getByRole('button',{name:'宿主打开Empty',exact:true}).click();await frame(page);}
        const save=page.getByRole('button',{name:'保存',exact:true});assert.equal(await save.isEnabled(),true);await save.click();await frame(page);
        record.writes=await page.evaluate(()=>window.__writes);assert.equal(record.writes.length,1);
        assert.equal(record.writes[0].target,name==='empty-initial'?'empty-version':'version-A');assert.equal((await state(page)).dirty,false);
      }else{
        if(name==='held-autosave-after-failure')await page.evaluate(()=>{window.__heldAutoSave=window.__currentAutoSave;});
        const target=name==='canvas-shape'?'C':name==='future-protocol'?'D':'B';
        if(name==='same-id-failure')await page.getByRole('button',{name:'宿主更新同身份来源',exact:true}).click();
        else await page.getByRole('button',{name:'宿主打开'+target,exact:true}).click();
        await frame(page);
        const save=page.getByRole('button',{name:'保存',exact:true});
        record.errorVisible=await page.getByRole('alert').filter({hasText:'表单设计加载失败'}).count()===1;
        if(await save.count())record.saveStyle=await save.evaluate(button=>{const style=getComputedStyle(button);return{color:style.color,background:style.backgroundColor,opacity:style.opacity};});
        record.disabled={};for(const label of ['保存','模板导入','模拟填报','用途总览','字段设计','表单设计']){
          const button=page.getByRole('button',{name:label,exact:true});record.disabled[label]=await button.count()===1&&await button.isDisabled();
        }
        if(await save.count()&&await save.isEnabled()){await save.click();await frame(page);}
        if(name==='held-autosave-after-failure')await page.evaluate(()=>window.__heldAutoSave());
        record.writes=await page.evaluate(()=>window.__writes);record.after=await state(page);record.afterSha256=hash(record.after);
        await page.screenshot({path:path.join(artifacts,name+'.png'),fullPage:true});
        assert.equal(record.errorVisible,true);assert.ok(Object.values(record.disabled).every(Boolean));
        assert.equal(record.writes.length,0);assert.equal(record.afterSha256,record.beforeSha256);assert.deepEqual(errors,[]);
        if(name==='failure-close-and-reopen'){
          const close=page.getByRole('button',{name:'关闭',exact:true});await close.focus();await page.keyboard.press('Enter');
          await page.getByText('设计器已关闭',{exact:true}).waitFor();await page.getByRole('button',{name:'宿主打开A',exact:true}).click();await frame(page);
          assert.equal(await page.getByRole('alert').filter({hasText:'表单设计加载失败'}).count(),0);
          await page.getByRole('button',{name:'保存',exact:true}).click();await frame(page);
          record.recoveryWrites=await page.evaluate(()=>window.__writes);assert.equal(record.recoveryWrites.length,1);assert.equal(record.recoveryWrites[0].target,'version-A');
        }
        const box=await page.getByRole('button',{name:'关闭',exact:true}).boundingBox();assert.ok(box&&box.x>=0&&box.x+box.width<=width+1);
      }
      assert.deepEqual(errors,[]);record.outcome='passed';
    }catch(error){record.outcome='failed';record.failure=String(error);await page.screenshot({path:path.join(artifacts,name+'-failure.png'),fullPage:true}).catch(()=>{});}
    await context.close();results.push(record);
  }
}finally{await browser?.close();await new Promise(resolve=>server?server.close(resolve):resolve());await rm(temporary,{recursive:true,force:true});}
const output={head:execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim(),baseline:baseline??null,width,sourceFingerprints:sources,
  callbackObservation:'Only exposes the existing field-save callback;does not replace any product handler or component. Held callback is a lifecycle stress test,not claimed a currently proven ModelTab async trigger.',results};
await writeFile(path.join(artifacts,'result.json'),JSON.stringify(output,null,2)+'\n');
console.log(JSON.stringify({total:results.length,passed:results.filter(x=>x.outcome==='passed').length,failed:results.filter(x=>x.outcome==='failed').length,artifacts}));
assert.ok(results.length===cases.length&&results.every(x=>x.outcome==='passed'),'document-read browser cases failed');
