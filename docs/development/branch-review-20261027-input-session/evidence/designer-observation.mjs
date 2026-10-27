import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, writeFile, rm } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import os from 'node:os';
import http from 'node:http';
const root='/workspace/edhr-nexus-frontend/gmp-platform/frontend';
const require=createRequire(path.join(root,'package.json'));
const {build}=require('esbuild');const {chromium}=require('playwright');
const temporary=await mkdtemp(path.join(os.tmpdir(),'edhr-nondrag-host-'));
const artifacts='/tmp/edhr-nondrag-runtime-artifacts';await mkdir(artifacts,{recursive:true});
const head=execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim();
const results=[];let server,browser;
const snapshot=page=>page.evaluate(()=>{
 const s=window.__store.getState(),d=s.document,a=document.activeElement;
 return {fields:d.model.fields.map(f=>({id:f.id,type:f.type,name:f.name})),nodes:d.canvas.pages.flatMap(p=>p.nodes).map(n=>({id:n.id,type:n.type,bindings:n.bindings,props:n.props,style:n.style})),undo:s.undoStack.length,redo:s.redoStack.length,focus:{tag:a?.tagName,text:a?.textContent?.slice(0,100),label:a?.getAttribute('aria-label'),row:a?.getAttribute('data-sheet-cell-row'),col:a?.getAttribute('data-sheet-cell-col')},menus:[...document.querySelectorAll('[data-sheet-menu-action]')].map(e=>({action:e.getAttribute('data-sheet-menu-action'),text:e.textContent}))};
});
const cell=(page,r=2,c=2)=>page.locator(`[data-canvas-field-drop-cell="true"][data-sheet-cell-row="${r}"][data-sheet-cell-col="${c}"]`).first();
async function frame(page){await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));}
async function settleMenu(page){if(await page.getByRole('menu').count())await page.waitForFunction(()=>{const el=document.querySelector('[role="menu"]')?.parentElement;return el&&Number(getComputedStyle(el).opacity)===1;});}
async function selectRectangle(page){const a=await cell(page,2,2).boundingBox(),b=await cell(page,3,3).boundingBox();assert.ok(a&&b);await page.mouse.move(a.x+a.width/2,a.y+a.height/2);await page.mouse.down();await page.mouse.move(b.x+b.width/2,b.y+b.height/2,{steps:5});await page.mouse.up();await frame(page);}
async function reachByTab(page,locator){for(let i=0;i<150;i++){await page.keyboard.press('Tab');if(await locator.evaluate(e=>e===document.activeElement))return i+1;}return null;}
try{
 await build({absWorkingDir:root,stdin:{resolveDir:root,loader:'tsx',contents:`
 import React from 'react';import {createRoot} from 'react-dom/client';
 import {ThemeProvider,createTheme,CssBaseline} from '@mui/material';
 import {QueryClient,QueryClientProvider} from '@tanstack/react-query';
 import {SnackbarProvider} from './src/components/SnackbarProvider';
 import CanvasTab from './src/pages/master-data/template-designer-react/tabs/canvas/CanvasTab';
 import {useTemplateDesignerStore as store} from './src/pages/master-data/template-designer-react/store/useTemplateDesignerStore';
 import {createEmptyTemplateDesignerDocument} from './src/pages/master-data/template-designer-react/utils/document';
 const name=new URLSearchParams(location.search).get('case');
 store.getState().setDocument(createEmptyTemplateDesignerDocument({schema:'edhr-template-designer-react',version:1,templateId:'nondrag-audit',versionId:'fixture-version',templateName:'非拖动只读观察',versionLabel:'V1'}));
 window.__fieldId=store.getState().addField('text','普通字段观察').id;
 if(name==='subtable-menu'){const table=store.getState().addField('subTable','已有明细观察');window.__tableId=table.id;store.getState().addSubTableFields(table.id,[{name:'明细文本',type:'text',description:''}]);}
 store.getState().setActiveCanvasRail('fields');window.__store=store;
 createRoot(document.getElementById('root')).render(<ThemeProvider theme={createTheme()}><CssBaseline/><QueryClientProvider client={new QueryClient({defaultOptions:{queries:{retry:false}}})}><SnackbarProvider><div style={{height:900}}><CanvasTab/></div></SnackbarProvider></QueryClientProvider></ThemeProvider>);
 `},bundle:true,platform:'browser',format:'esm',outfile:path.join(temporary,'bundle.js'),alias:{'@':path.join(root,'src'),'@mui/icons-material':path.join(root,'node_modules/@mui/icons-material/esm')},loader:{'.css':'css','.svg':'dataurl','.png':'dataurl','.woff2':'file','.ttf':'file'},define:{'process.env.NODE_ENV':'"production"'},logLevel:'silent'});
 await writeFile(path.join(temporary,'index.html'),'<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>非拖动只读观察</title><link rel="stylesheet" href="/bundle.css"><div id="root"></div><script type="module" src="/bundle.js"></script></html>');
 server=http.createServer(async(req,res)=>{const pathname=new URL(req.url,'http://localhost').pathname;const file=pathname==='/'?'index.html':pathname.slice(1);if(!['index.html','bundle.js','bundle.css'].includes(file)){res.writeHead(404).end();return;}res.setHeader('Content-Type',file.endsWith('.js')?'text/javascript':file.endsWith('.css')?'text/css':'text/html; charset=utf-8');try{res.end(await readFile(path.join(temporary,file)));}catch{res.writeHead(404).end();}});
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH||'/usr/bin/chromium'});
 const cases=process.env.NONDRAG_CASES?process.env.NONDRAG_CASES.split(','):['ordinary-keyboard','ordinary-pointer-control','keyboard-context-menu','display-click','display-keyboard','subtable-menu','quick-add-model-only'];
 for(const name of cases){
  const page=await browser.newPage({viewport:{width:1440,height:1050}}),errors=[],requests=[];const steps=[];
  page.on('pageerror',e=>errors.push(e.message));await page.route('**/api/**',async route=>{requests.push(route.request().url());await route.abort();});
  try{
   await page.goto(`http://127.0.0.1:${server.address().port}/?case=${name}`);await cell(page).waitFor();const card=page.locator('[data-canvas-field-card="true"]').filter({hasText:'普通字段观察'}).first();await card.waitFor();steps.push({operation:'fixture ready, no placement API called',snapshot:await snapshot(page)});
   if(name==='ordinary-keyboard'){
    await cell(page).click();const tabs=await reachByTab(page,card);steps.push({operation:'Tab to ordinary field card',tabPresses:tabs,snapshot:await snapshot(page)});assert.ok(tabs,'field card must be reachable for meaningful keyboard observation');
    for(const key of ['Enter','Space']){await page.keyboard.press(key);await frame(page);steps.push({operation:`ordinary card ${key}`,snapshot:await snapshot(page)});}
    await card.click();await frame(page);steps.push({operation:'ordinary card click without drag',snapshot:await snapshot(page)});
    assert.equal(steps.at(-1).snapshot.nodes.length,0,'observation sanity: existing field card does not bind on keyboard/click in this host');
   }else if(name==='ordinary-pointer-control'){
    const a=await card.boundingBox(),b=await cell(page).boundingBox();await page.mouse.move(a.x+a.width/2,a.y+a.height/2);await page.mouse.down();await page.mouse.move(a.x+a.width/2+15,a.y+a.height/2+8,{steps:3});await page.mouse.move(b.x+b.width/2,b.y+b.height/2,{steps:8});await page.mouse.up();await page.waitForFunction(()=>window.__store.getState().document.canvas.pages[0].nodes.some(n=>n.bindings?.fieldId===window.__fieldId));steps.push({operation:'ordinary field actual pointer drag control',snapshot:await snapshot(page)});
    await page.getByRole('button',{name:'撤销',exact:true}).click();await frame(page);steps.push({operation:'toolbar undo',snapshot:await snapshot(page)});assert.equal(steps.at(-1).snapshot.nodes.length,0);
    await page.getByRole('button',{name:'重做',exact:true}).click();await frame(page);steps.push({operation:'toolbar redo',snapshot:await snapshot(page)});assert.equal(steps.at(-1).snapshot.nodes.length,1);
   }else if(name==='keyboard-context-menu'){
    for(const key of ['Shift+F10','ContextMenu']){await cell(page).click();await page.keyboard.press(key);await frame(page);steps.push({operation:`focused cell ${key}`,snapshot:await snapshot(page)});await settleMenu(page);await page.screenshot({path:path.join(artifacts,`keyboard-${key.replace('+','-')}.png`),fullPage:true});await page.keyboard.press('Escape');}
    await cell(page).click({button:'right'});await page.locator('[data-sheet-menu-action="quick-add-fields"]').waitFor();steps.push({operation:'right-click same cell positive control',snapshot:await snapshot(page)});
   }else if(name==='display-click'||name==='display-keyboard'){
    await cell(page).click();const rail=page.getByRole('button',{name:'组件管理',exact:true});
    if(name==='display-keyboard'){const tabs=await reachByTab(page,rail);assert.ok(tabs);await page.keyboard.press('Enter');}else await rail.click();
    const text=page.locator('[data-common-component-card="text"]');await text.waitFor();
    if(name==='display-keyboard'){const tabs=await reachByTab(page,text);assert.ok(tabs);await page.keyboard.press('Enter');}else await text.click();
    await page.waitForFunction(()=>window.__store.getState().document.canvas.pages[0].nodes.length>0);steps.push({operation:`display text actual ${name==='display-click'?'click':'Tab/Enter'}`,snapshot:await snapshot(page)});assert.equal(steps.at(-1).snapshot.fields.length,1);assert.equal(steps.at(-1).snapshot.nodes.filter(n=>n.bindings?.fieldId).length,0);
   }else if(name==='subtable-menu'){
    await selectRectangle(page);await cell(page).click({button:'right'});await page.locator('[data-sheet-menu-action="set-sub-table"]').waitFor();steps.push({operation:'UI multi-cell selection and context menu',snapshot:await snapshot(page)});await page.locator('[data-sheet-menu-action="set-sub-table"]').click();await page.waitForFunction(()=>window.__store.getState().document.canvas.pages[0].nodes.some(n=>n.bindings?.fieldId===window.__tableId));steps.push({operation:'existing subtable menu binding',snapshot:await snapshot(page)});await page.getByRole('button',{name:'撤销',exact:true}).click();await frame(page);steps.push({operation:'toolbar undo subtable placement',snapshot:await snapshot(page)});assert.equal(steps.at(-1).snapshot.nodes.length,0);
   }else if(name==='quick-add-model-only'){
    await cell(page).click({button:'right'});await page.locator('[data-sheet-menu-action="quick-add-fields"]').click();const row=page.locator('[data-quick-add-field-row="true"]').first();await row.waitFor();await row.locator('input').first().fill('快速模型字段观察');await page.getByRole('button',{name:'确认添加',exact:true}).click();await page.waitForFunction(()=>window.__store.getState().document.model.fields.length===2);steps.push({operation:'quick add confirm from real cell menu/dialog',snapshot:await snapshot(page)});assert.equal(steps.at(-1).snapshot.nodes.length,0);
   }
   assert.deepEqual(errors,[]);assert.deepEqual(requests,[]);await settleMenu(page);await page.screenshot({path:path.join(artifacts,name+'.png'),fullPage:true});results.push({name,status:'observed',steps,pageErrors:errors,unexpectedApiRequests:requests});
  }catch(e){await page.screenshot({path:path.join(artifacts,name+'-fixture-failed.png'),fullPage:true});results.push({name,status:'observation-blocked',message:e.message,steps,pageErrors:errors,unexpectedApiRequests:requests});}
  finally{await page.close();}
 }
}finally{if(browser)await browser.close();if(server)await new Promise(resolve=>server.close(resolve));await rm(temporary,{recursive:true,force:true});}
const output={role:'read-only runtime helper, not formal independent quality acceptance',sourceCommit:head,knowledgeBaselineVersion:'0.3.25 (scope context, no ontology semantic audit)',boundary:'Real CanvasTab/Sidebar/Workspace and Zustand in Chromium. Store APIs only construct initial blank document and fields; placement/selection/menus/undo use actual user UI. No server/backend writes; 1440x1050 only.',artifacts,results};
await writeFile('/tmp/edhr-nondrag-runtime.json',JSON.stringify(output,null,2)+'\n');console.log(JSON.stringify({sourceCommit:head,results:results.map(({name,status,message,steps})=>({name,status,message,steps:steps.length}))},null,2));
if(results.some(r=>r.status==='observation-blocked'))process.exitCode=1;
