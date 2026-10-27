import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdtemp, writeFile, readFile, mkdir, rm } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import http from 'node:http';
import path from 'node:path';
import os from 'node:os';
const root='/workspace/edhr-nexus-frontend/gmp-platform/frontend';
const require=createRequire(path.join(root,'package.json'));
const {build}=require('esbuild');const{chromium}=require('playwright');
const temporary=await mkdtemp(path.join(os.tmpdir(),'edhr-session-boundary-'));
const artifacts='/tmp/edhr-session-boundary-artifacts';await mkdir(artifacts,{recursive:true});
const baseline=execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim();
const users={A:{id:'9007199254740993',username:'audit-A',displayName:'隔离用户A',permissions:['dashboard']},B:{id:'9007199254740992',username:'audit-B',displayName:'隔离用户B',permissions:['dashboard']}};
const report={role:'read-only source/runtime helper, not formal independent quality acceptance',baseline,boundary:'Real AppLayout, React/MUI/router/authStore/queryClient/sessionPolicy/api client in two pages of one Chromium context; fixture HTTP and synthetic users/tokens; no real backend; fixture buttons only invoke actual auth store methods.',results:[],pageErrors:[]};
let server,browser;
try{
await build({absWorkingDir:root,stdin:{resolveDir:root,loader:'tsx',contents:`
 import React from 'react';import{createRoot}from'react-dom/client';import{MemoryRouter,Routes,Route}from'react-router-dom';
 import{ThemeProvider,createTheme,CssBaseline,Typography,Box}from'@mui/material';import{QueryClientProvider,useQuery}from'@tanstack/react-query';
 import AppLayout from './src/components/shared/AppLayout';
 import{useAuthStore}from'./src/stores/authStore';import{queryClient,getSessionGeneration}from'./src/utils/queryClient';import{clearAuthStorage,AUTH_USER_CHANGE_EVENT}from'./src/utils/sessionPolicy';import client from'./src/api/client';
 const users=${JSON.stringify(users)};const observed={storageEvents:[],authEvents:0,lastResults:{}};
 window.addEventListener('storage',event=>observed.storageEvents.push({key:event.key,area:event.storageArea===localStorage?'localStorage':'other'}));
 window.addEventListener(AUTH_USER_CHANGE_EVENT,()=>observed.authEvents++);
 window.audit={
  login:id=>useAuthStore.getState().login('fixture-token-'+id,users[id]),
  logout:()=>useAuthStore.getState().logout(),
  seedCache:()=>queryClient.setQueryData(['boundary-private'],{owner:'A',value:'A-private-fixture'}),
  startLate:kind=>{void client.get('/audit/'+kind).then(response=>{observed.lastResults[kind]={outcome:'accepted',data:response.data.data};},error=>{observed.lastResults[kind]={outcome:'rejected',message:error.message,canceled:error.code==='ERR_CANCELED'};});return true;},
  current:async()=>{const response=await client.get('/audit/current');return response.data.data;},
  snapshot:()=>({store:{token:useAuthStore.getState().token,user:useAuthStore.getState().user,isAuthenticated:useAuthStore.getState().isAuthenticated},shared:{token:localStorage.getItem('token'),user:JSON.parse(localStorage.getItem('user')||'null')},generation:getSessionGeneration(),cache:queryClient.getQueryData(['boundary-private'])||null,...observed}),
 };
 function Probe(){const user=useAuthStore(state=>state.user);const {data}=useQuery({queryKey:['boundary-private'],enabled:false});return <Box sx={{p:3}}><Typography variant="h6">会话边界隔离观察宿主</Typography><Typography>实际authStore用户：{user?.displayName||'未登录'}</Typography><Typography>实际query缓存：{data?JSON.stringify(data):'无'}</Typography><Typography>上述观察区是测试宿主，外层为真实AppLayout。所有身份/数据均为合成夹具。</Typography></Box>}
 createRoot(document.getElementById('root')).render(<ThemeProvider theme={createTheme()}><CssBaseline/><QueryClientProvider client={queryClient}><MemoryRouter initialEntries={['/']}><Routes><Route element={<AppLayout/>}><Route path="/" element={<Probe/>}/></Route></Routes></MemoryRouter></QueryClientProvider></ThemeProvider>);
 `},bundle:true,platform:'browser',format:'esm',outfile:path.join(temporary,'bundle.js'),alias:{'@':path.join(root,'src'),'@mui/icons-material':path.join(root,'node_modules/@mui/icons-material/esm')},define:{'process.env.NODE_ENV':'"production"','import.meta.hot':'undefined'},logLevel:'silent'});
await writeFile(path.join(temporary,'index.html'),`<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><div id="root"></div><script>if(new URLSearchParams(location.search).get('seed')==='A'&&!sessionStorage.getItem('auditSeeded')){localStorage.setItem('token','fixture-token-A');localStorage.setItem('user',JSON.stringify(${JSON.stringify(users.A)}));sessionStorage.setItem('auditSeeded','yes');}</script><script type="module" src="/bundle.js"></script></html>`);
server=http.createServer(async(req,res)=>{const file=new URL(req.url,'http://localhost').pathname==='/bundle.js'?'bundle.js':'index.html';res.setHeader('Content-Type',file==='bundle.js'?'text/javascript':'text/html; charset=utf-8');res.end(await readFile(path.join(temporary,file)));});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH||'/usr/bin/chromium'});
for(const scenario of ['same-tab-switch-control','cross-tab-switch-late-success','cross-tab-switch-late-401','cross-tab-logout-late-success']){
 const context=await browser.newContext({viewport:{width:1400,height:960}});let held,requests=[];
 await context.route('**/api/v1/**',async route=>{
  const pathname=new URL(route.request().url()).pathname;const auth=route.request().headers().authorization||null;requests.push({pathname,auth});
  if(pathname.startsWith('/api/v1/audit/late-')){held=route;return;}
  let data={};
  if(pathname==='/api/v1/auth/me')data=auth==='Bearer fixture-token-B'?users.B:users.A;
  else if(pathname==='/api/v1/system/settings/public')data={systemName:'隔离会话审计',idleLogoutMinutes:300,tokenValidityMinutes:480};
  else if(pathname==='/api/v1/identity/roles')data={content:[],totalElements:0};
  else if(pathname.includes('menu'))data={configured:false,modules:[]};
  else if(pathname==='/api/v1/audit/current')data={authorization:auth};
  await route.fulfill({json:{code:200,data}});
 });
 const a=await context.newPage();a.on('pageerror',error=>report.pageErrors.push({scenario,page:'A',message:error.message}));
 const b=await context.newPage();b.on('pageerror',error=>report.pageErrors.push({scenario,page:'B',message:error.message}));
 const url='http://127.0.0.1:'+server.address().port;
 try{
  await a.goto(url+'/?seed=A');await a.waitForFunction(()=>window.audit?.snapshot().authEvents>=1);
  await b.goto(url+'/');await b.waitForFunction(()=>window.audit?.snapshot().authEvents>=1);
  await a.evaluate(()=>window.audit.seedCache());
  const before=await a.evaluate(()=>window.audit.snapshot());
  const kind=scenario.includes('401')?'late-401':'late-success';
  await a.evaluate(kind=>window.audit.startLate(kind),kind);
  for(let i=0;i<100&&!held;i++)await new Promise(resolve=>setTimeout(resolve,20));assert.ok(held,'old A request must be captured');
  if(scenario==='same-tab-switch-control')await a.evaluate(()=>window.audit.login('B'));
  else if(scenario.includes('logout'))await b.evaluate(()=>window.audit.logout());
  else await b.evaluate(()=>window.audit.login('B'));
  if(scenario!=='same-tab-switch-control')await a.waitForFunction(previous=>window.audit.snapshot().storageEvents.length>previous,before.storageEvents.length);
  if(!scenario.includes('logout'))await a.getByText('隔离用户B',{exact:true}).first().waitFor();
  const afterIdentity=await a.evaluate(()=>window.audit.snapshot());
  const newRequest=await a.evaluate(()=>window.audit.current());
  await a.screenshot({path:path.join(artifacts,scenario+'-before-old-response.png'),fullPage:true});
  const oldUrl=a.url();
  if(kind==='late-401')await held.fulfill({status:401,json:{code:401,message:'A-old-fixture-unauthorized'}});
  else await held.fulfill({json:{code:200,data:{owner:'A',value:'A-old-response-fixture'}}});
  if(kind==='late-401')await a.waitForURL('**/login');
  else await a.waitForFunction(kind=>!!window.audit.snapshot().lastResults[kind],kind);
  const afterResponse=await a.evaluate(()=>window.audit.snapshot());
  const sharedB=await b.evaluate(()=>({token:localStorage.getItem('token'),user:JSON.parse(localStorage.getItem('user')||'null')}));
  let checks;
  if(scenario==='same-tab-switch-control')checks={generationAdvanced:afterIdentity.generation>before.generation,storeB:afterIdentity.store.user?.username==='audit-B',oldCacheCleared:afterIdentity.cache===null,oldResponseRejected:afterResponse.lastResults[kind]?.outcome==='rejected'};
  else if(kind==='late-401')checks={generationUnchangedOnRemoteSwitch:afterIdentity.generation===before.generation,storeStillA:afterIdentity.store.user?.username==='audit-A',sharedAlreadyB:afterIdentity.shared.user?.username==='audit-B',newRequestUsesB:newRequest.authorization==='Bearer fixture-token-B',old401RemovedBToken:sharedB.token===null,navigatedToLogin:a.url()!==oldUrl};
  else checks={generationUnchangedOnRemoteSwitch:afterIdentity.generation===before.generation,storeStillA:afterIdentity.store.user?.username==='audit-A',oldCacheRemains:afterIdentity.cache?.owner==='A',newRequestUsesSharedToken:newRequest.authorization===(scenario.includes('logout')?null:'Bearer fixture-token-B'),oldAResponseAccepted:afterResponse.lastResults[kind]?.outcome==='accepted'};
  assert.ok(Object.values(checks).every(Boolean),JSON.stringify(checks));
  report.results.push({scenario,status:scenario==='same-tab-switch-control'?'control-passed':'observed-gap',before,afterIdentity,newRequest,afterResponse,sharedB,checks,requests,screenshot:path.join(artifacts,scenario+'-before-old-response.png')});
 }catch(error){report.results.push({scenario,status:'observation-error',message:error.message,requests});}
 finally{await context.close();}
}
}finally{if(browser)await browser.close();if(server)await new Promise(resolve=>server.close(resolve));await rm(temporary,{recursive:true,force:true});}
await writeFile('/tmp/edhr-session-boundary-source-runtime.json',JSON.stringify(report,null,2));
console.log(JSON.stringify({baseline,results:report.results.map(({scenario,status,message})=>({scenario,status,message})),pageErrors:report.pageErrors},null,2));
if(report.results.some(result=>result.status==='observation-error')||report.pageErrors.length)process.exitCode=2;
else if(report.results.some(result=>result.status==='observed-gap'))process.exitCode=1;
