import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';
import { build } from 'esbuild';
const { chromium } = createRequire(import.meta.url)('playwright');
const root=path.resolve(import.meta.dirname,'..');
const temporary=await mkdtemp(path.join(os.tmpdir(),'edhr-login-audit-'));
const baseline=process.env.AUTH_UI_BASELINE_COMMIT;
if(baseline&&!/^[a-f0-9]{40}$/.test(baseline))throw new Error('Expected full baseline SHA');
const artifacts=process.env.AUTH_UI_ARTIFACTS;
const viewportWidth=Number(process.env.AUTH_UI_WIDTH||1280);
assert.ok(Number.isInteger(viewportWidth)&&viewportWidth>=320,'Expected viewport width >= 320');
const results=[];
let server,browser;
try {
  if(artifacts)await mkdir(artifacts,{recursive:true});
  await build({absWorkingDir:root,stdin:{resolveDir:root,loader:'tsx',contents:`
    import React from 'react';import {createRoot} from 'react-dom/client';
    import {MemoryRouter,Routes,Route} from 'react-router-dom';
    import {ThemeProvider,createTheme,CssBaseline} from '@mui/material';
    import {QueryClientProvider} from '@tanstack/react-query';
    import {queryClient} from './src/utils/queryClient';
    import LoginPage from './src/pages/LoginPage';
    import {WorkflowActionConfig} from './src/components/flow-designer/WorkflowActionConfig';
    sessionStorage.setItem('bundleLoads',String(Number(sessionStorage.getItem('bundleLoads')||0)+1));
    const profile=new URLSearchParams(location.search).get('profile');
    createRoot(document.getElementById('root')).render(<ThemeProvider theme={createTheme()}><CssBaseline/>
      <QueryClientProvider client={queryClient}>{profile?
        <WorkflowActionConfig kind="APPROVAL" editable={false} profile={profile} onChange={()=>{}}/>:
        <MemoryRouter initialEntries={['/login']}><Routes><Route path="/login" element={<LoginPage/>}/>
          <Route path="/" element={<div data-destination="home">已登录</div>}/>
          <Route path="/account/settings" element={<div data-destination="security">需要安全操作</div>}/>
        </Routes></MemoryRouter>}
      </QueryClientProvider></ThemeProvider>);
  `},bundle:true,platform:'browser',format:'esm',outfile:path.join(temporary,'bundle.js'),
    alias:{'@':path.join(root,'src'),'@mui/icons-material':path.join(root,'node_modules/@mui/icons-material/esm')},
    define:{'process.env.NODE_ENV':'"production"'},logLevel:'silent',plugins:baseline?[{name:'baseline-auth-ui',setup(plugin){
      plugin.onLoad({filter:/(?:LoginPage|WorkflowActionConfig)\.tsx$/},({path:filename})=>({contents:execFileSync('git',['show',baseline+':gmp-platform/frontend/'+path.relative(root,filename)],{cwd:root,encoding:'utf8'}),loader:'tsx',resolveDir:path.dirname(filename)}));
    }}]:[]});
  await writeFile(path.join(temporary,'index.html'),'<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>登录与委托隔离验收</title><div id="root"></div><script type="module" src="/bundle.js"></script></html>');
  server=http.createServer(async(request,response)=>{
    const file=new URL(request.url,'http://localhost').pathname==='/bundle.js'?'bundle.js':'index.html';
    response.setHeader('Content-Type',file==='bundle.js'?'text/javascript':'text/html; charset=utf-8');
    response.end(await readFile(path.join(temporary,file)));
  });
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH});
  const cases=['native-empty','credential-error','normal-success','password-action','signature-action','branding-retry','ordinary-delegation','record-control-boundary'];
  for(const name of cases){
    const page=await browser.newPage({viewport:{width:viewportWidth,height:900}});
    const pageErrors=[];let loginCalls=0,healthy=name!=='branding-retry';
    page.on('pageerror',error=>pageErrors.push(error.message));
    await page.route('**/api/v1/**',async route=>{
      const pathname=new URL(route.request().url()).pathname;
      if(pathname==='/api/v1/system/settings/public'){
        await route.fulfill({status:healthy?200:503,json:healthy?{code:200,data:{systemName:'隔离审计系统'}}:{code:503,message:'服务暂不可用'}});return;
      }
      if(pathname==='/api/v1/auth/login'){
        loginCalls++;
        if(name==='credential-error'){await route.fulfill({status:401,json:{code:401,message:'用户名或密码错误'}});return;}
        await route.fulfill({json:{code:200,data:{token:'fixture-token',user:{id:'audit-user',username:'audit-user',displayName:'隔离审计',permissions:[]},forcePasswordChange:name==='password-action',forceSignatureVerification:name==='signature-action',idleLogoutMinutes:15,tokenValidityMinutes:30}}});return;
      }
      pageErrors.push('Unexpected API '+pathname);await route.abort();
    });
    try{
      const profile=name==='ordinary-delegation'?'FORM_PROCESS':name==='record-control-boundary'?'RECORD_CONTROL':null;
      await page.goto('http://127.0.0.1:'+server.address().port+'/?case='+name+(profile?'&profile='+profile:''));
      if(profile){
        if(profile==='FORM_PROCESS'){
          await page.getByText(/同租户正常可用/).waitFor();
          assert.equal(await page.getByText(/受当前节点审批主体范围约束/).count(),0);
        }else{
          await page.getByText(/审批动作及显隐由系统固定/).waitFor();
          assert.equal(await page.getByText(/同租户正常可用/).count(),0);
        }
      }else if(name==='branding-retry'){
        await page.getByRole('button',{name:'重新连接'}).waitFor();
        assert.equal(await page.getByLabel('用户名').count(),0);
        healthy=true;await page.getByRole('button',{name:'重新连接'}).click();
        await page.getByLabel('用户名').waitFor();assert.equal(loginCalls,0);
      }else{
        const account=page.getByLabel('用户名');const password=page.getByLabel('密码');
        await account.waitFor();
        if(name==='native-empty'){
          await page.getByRole('button',{name:'登 录',exact:true}).click();
          assert.equal(await account.evaluate(input=>input.validity.valueMissing),true);assert.equal(loginCalls,0);
          await account.fill('audit-user');await account.press('Enter');
          assert.equal(await password.evaluate(input=>input.validity.valueMissing),true);assert.equal(loginCalls,0);
        }else{
          await account.fill('audit-user');await password.fill('fixture-only-password');
          const response=page.waitForResponse(response=>new URL(response.url()).pathname==='/api/v1/auth/login');
          await page.getByRole('button',{name:'登 录',exact:true}).click();await response;
          if(name==='credential-error'){
            await page.waitForLoadState('networkidle');
            assert.equal(await page.evaluate(()=>Number(sessionStorage.getItem('bundleLoads'))),1,'401 must remain on the current login page');
            assert.equal(await account.inputValue(),'audit-user');
            await page.getByRole('alert').filter({hasText:'用户名或密码错误'}).waitFor();
            assert.equal(await page.getByRole('button',{name:'登 录',exact:true}).isEnabled(),true);
          }else{
            await page.locator('[data-destination="'+(name==='normal-success'?'home':'security')+'"]').waitFor();
            assert.equal(await page.evaluate(()=>localStorage.getItem('token')),'fixture-token');
          }
          assert.equal(loginCalls,1);
        }
      }
      assert.deepEqual(pageErrors,[]);
      if(artifacts)await page.screenshot({path:path.join(artifacts,name+'.png'),fullPage:true});
      results.push({name,result:'passed',loginCalls});
    }catch(error){
      results.push({name,result:'failed',message:error.message,pageErrors});
      if(artifacts)await page.screenshot({path:path.join(artifacts,name+'-failed.png'),fullPage:true});
    }
    finally{await page.close();}
  }
}finally{
  if(browser)await browser.close();if(server)await new Promise(resolve=>server.close(resolve));
  await rm(temporary,{recursive:true,force:true});
}
console.log(JSON.stringify({baseline:baseline||null,viewportWidth,boundary:'Real React/MUI/router/auth store/client; fixture HTTP, no real authentication or backend writes',results},null,2));
if(results.some(result=>result.result!=='passed'))process.exitCode=1;
