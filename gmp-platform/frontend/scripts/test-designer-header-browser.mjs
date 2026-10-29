import assert from 'node:assert/strict';
import { mkdtemp, readFile, writeFile, mkdir, rm } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { build } from 'esbuild';

const { chromium } = createRequire(import.meta.url)('playwright');
const root = path.resolve(import.meta.dirname, '..');
const baseline = process.env.HEADER_BASELINE_COMMIT;
if (baseline && !/^[a-f0-9]{40}$/.test(baseline)) throw new Error('Expected full baseline SHA');
const artifacts = process.env.HEADER_ARTIFACTS;
const temp = await mkdtemp(path.join(os.tmpdir(), 'edhr-designer-header-'));
const results = [];
let browser, server;
try {
  if (artifacts) await mkdir(artifacts, { recursive:true });
  await build({ absWorkingDir:root, stdin:{resolveDir:root,loader:'tsx',contents:`
    import React from 'react';import {createRoot} from 'react-dom/client';
    import {ThemeProvider,createTheme,CssBaseline} from '@mui/material';
    import {QueryClient,QueryClientProvider} from '@tanstack/react-query';
    import {SnackbarProvider} from './src/components/SnackbarProvider';
    import Shell from './src/pages/master-data/template-designer-react/TemplateDesignerReactShell';
    import {useTemplateDesignerStore as store} from './src/pages/master-data/template-designer-react/store/useTemplateDesignerStore';
    window.qaHeaderStore=store;window.qaHeaderSaves=0;
    const client=new QueryClient({defaultOptions:{queries:{retry:false,refetchOnWindowFocus:false}}});
    createRoot(document.getElementById('root')).render(<ThemeProvider theme={createTheme()}><CssBaseline/>
      <QueryClientProvider client={client}><SnackbarProvider><div style={{height:'100vh'}}>
        <Shell row={{id:'header-template',name:'模板上下文'}} version={{id:'header-version',version:'V1'}} saving={false}
          onSave={async()=>{window.qaHeaderSaves++}} onAutoSave={async()=>{window.qaHeaderSaves++}} onClose={()=>{}}/>
      </div></SnackbarProvider></QueryClientProvider></ThemeProvider>);`},
    bundle:true,platform:'browser',format:'esm',outfile:path.join(temp,'bundle.js'),
    alias:{'@':path.join(root,'src'),'@mui/icons-material':path.join(root,'node_modules/@mui/icons-material/esm')},
    loader:{'.css':'css','.svg':'dataurl','.png':'dataurl','.woff2':'file','.ttf':'file'},
    define:{'process.env.NODE_ENV':'"production"'},logLevel:'silent',
    plugins:baseline?[{name:'original-shell-only',setup(plugin){plugin.onLoad({filter:/TemplateDesignerReactShell\.tsx$/},({path:filename})=>({
      contents:execFileSync('git',['show',`${baseline}:gmp-platform/frontend/src/pages/master-data/template-designer-react/TemplateDesignerReactShell.tsx`],{cwd:root,encoding:'utf8'}),loader:'tsx',resolveDir:path.dirname(filename)}));}}]:[],
  });
  const cssLink=await readFile(path.join(temp,'bundle.css')).then(()=>'<link rel="stylesheet" href="/bundle.css">').catch(error=>{
    if(error.code==='ENOENT')return '';throw error;
  });
  await writeFile(path.join(temp,'index.html'),'<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'+cssLink+'<style>html,body,#root{height:100%;margin:0}</style><div id="root"></div><script type="module" src="/bundle.js"></script></html>');
  server=http.createServer(async(req,res)=>{
    const name=new URL(req.url,'http://localhost').pathname.slice(1)||'index.html';
    if(!['index.html','bundle.js','bundle.css'].includes(name)){res.writeHead(404).end();return;}
    res.setHeader('Content-Type',name.endsWith('.js')?'text/javascript':name.endsWith('.css')?'text/css':'text/html;charset=utf-8');
    try{res.end(await readFile(path.join(temp,name)));}catch{res.writeHead(404).end();}
  });
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH});
  for(const width of [390,768,1024,1440]){
    const page=await browser.newPage({viewport:{width,height:1000}});const errors=[],buttons=[];
    page.on('pageerror',e=>errors.push(e.message));
    await page.route('**/api/**',route=>route.fulfill({json:{code:200,data:{version:'form-projection-v1',models:[],notice:''}}}));
    let title;
    try{
      await page.goto(`http://127.0.0.1:${server.address().port}/`);
      await page.waitForFunction(()=>window.qaHeaderStore?.getState().document?.meta.versionId==='header-version');
      await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
      title=await page.locator('[data-shell-template-path]').boundingBox();
      for(const name of ['用途总览','模板导入','模拟填报','保存','关闭','字段设计','表单设计']){
        buttons.push({name,box:await page.getByRole('button',{name,exact:true}).boundingBox()});
      }
      for(const entry of buttons){
        const button=page.getByRole('button',{name:entry.name,exact:true});let trial='passed';
        try{await button.click({trial:true,timeout:1500});}catch(error){trial=error.message.slice(0,1600);}
        entry.trial=trial;
      }
      assert(title&&title.width>0,'template context must remain visible');
      assert.equal(await page.locator('[data-shell-template-path]').isVisible(),true);
      for(const {name,box,trial} of buttons){
        assert(box&&box.x>=0&&box.x+box.width<=width+1,`${name} must fit in the viewport`);
        assert.equal(trial,'passed',`${name} must be reachable without forced clicks`);
      }
      assert.equal(await page.getByRole('button',{name:'流程设计',exact:true}).count(),0,'removed workflow entry stays removed');
      assert.equal(await page.evaluate(()=>window.qaHeaderSaves),0,'trial clicks must not submit');
      assert.deepEqual(errors,[]);
      if(artifacts)await page.screenshot({path:path.join(artifacts,`${width}.png`),fullPage:true});
      results.push({width,passed:true,title,buttons,errors});
    }catch(error){
      if(artifacts)await page.screenshot({path:path.join(artifacts,`${width}-failed.png`),fullPage:true});
      results.push({width,passed:false,error:error.message,title,buttons,errors});
    }finally{await page.close();}
  }
}finally{
  if(browser)await browser.close();if(server)await new Promise(r=>server.close(r));
  await rm(temp,{recursive:true,force:true});
}
const output={baselineSourceCommit:baseline??null,cases:results.length,passed:results.filter(x=>x.passed).length,
  qualification:'Four viewport variants of header visibility and trial actionability; real Shell, controlled callbacks/API. Does not certify full canvas responsiveness or backend persistence.',results};
if(artifacts)await writeFile(path.join(artifacts,'result.json'),JSON.stringify(output,null,2)+'\n');
console.log(JSON.stringify(output,null,2));
if(output.passed!==output.cases)process.exitCode=1;
