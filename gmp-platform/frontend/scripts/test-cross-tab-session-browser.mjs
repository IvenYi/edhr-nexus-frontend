import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { build } from 'esbuild';

const root = path.resolve(import.meta.dirname, '..');
const { chromium } = createRequire(import.meta.url)('playwright');
const width = Number(process.env.SESSION_UI_WIDTH || 1280);
assert.ok(Number.isInteger(width) && width >= 320, 'Expected viewport width >= 320');
const baseline = process.env.SESSION_UI_BASELINE_COMMIT;
if (baseline) assert.match(baseline, /^[a-f0-9]{40}$/);
const artifacts = process.env.SESSION_UI_ARTIFACTS || path.join(os.tmpdir(), `edhr-cross-tab-browser-${width}`);
const temporary = await mkdtemp(path.join(os.tmpdir(), 'edhr-cross-tab-host-'));
const head = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim();
const users = Object.fromEntries(['A', 'B', 'C'].map((id, index) => [id, {
  id: ['9007199254740993', '9007199254740992', '9007199254740991'][index],
  username: `audit-${id}`, displayName: `隔离用户${id}`, permissions: ['dashboard'],
}]));
const allCases = ['remote-late-success', 'remote-late-401', 'remote-late-409', 'remote-late-blob',
  'remote-logout', 'remote-clear', 'same-token-new-login', 'remote-aba',
  'profile-refresh', 'keyboard-login-and-reauth', 'same-tab-response-control', 'actual-app-installation'];
const cases = process.env.SESSION_UI_CASES ? process.env.SESSION_UI_CASES.split(',') : allCases;
assert.ok(cases.length > 0 && cases.every(name => allCases.includes(name)), 'Unknown session UI case');
const report = {
  head, baseline: baseline || null, viewport: { width, height: 900 },
  workingTreeStatus: execFileSync('git', ['status', '--porcelain'], { cwd: root, encoding: 'utf8' }).trim(),
  boundary: 'Real shared boundary/AppLayout/React/MUI/router/client/authStore/queryClient; fixture HTTP and synthetic identities. Probe form invokes the real client; actual App installation is separately exercised on /login. Not real backend authentication E2E.',
  results: [],
};
let server, browser;

try {
  await mkdir(artifacts, { recursive: true });
  await build({
    absWorkingDir: root,
    stdin: { resolveDir: root, loader: 'tsx', contents: `
      import React,{useState} from 'react';import{createRoot}from'react-dom/client';
      import{MemoryRouter,Routes,Route}from'react-router-dom';
      import{ThemeProvider,createTheme,CssBaseline,Box,Button,TextField,Typography}from'@mui/material';
      import{QueryClientProvider,useQuery}from'@tanstack/react-query';
      import App from './src/App';import AppLayout from './src/components/shared/AppLayout';
      import SessionChangeBoundary from './src/components/SessionChangeBoundary';
      import LoginPage from './src/pages/LoginPage';
      import{useAuthStore}from'./src/stores/authStore';
      import{queryClient,getSessionGeneration}from'./src/utils/queryClient';
      import{AUTH_USER_CHANGE_EVENT}from'./src/utils/sessionPolicy';
      import client from'./src/api/client';
      const users=${JSON.stringify(users)};
      const observed={authEvents:0,results:{},storageEvents:[]};
      window.addEventListener(AUTH_USER_CHANGE_EVENT,()=>observed.authEvents++);
      window.addEventListener('storage',e=>observed.storageEvents.push(e.key));
      window.audit={
        login:id=>useAuthStore.getState().login('fixture-token-'+id,users[id]),
        logout:()=>useAuthStore.getState().logout(),clear:()=>localStorage.clear(),
        profile:()=>{localStorage.setItem('user',JSON.stringify({...users.A,displayName:'资料刷新A'}));window.dispatchEvent(new Event(AUTH_USER_CHANGE_EVENT));},
        seedCache:()=>queryClient.setQueryData(['boundary-private'],{owner:'A',value:'A-private-fixture'}),
        startLate:kind=>{void client.get('/audit/'+kind,kind==='late-blob'?{responseType:'blob'}:{}).then(
          ()=>observed.results[kind]={outcome:'accepted'},
          error=>observed.results[kind]={outcome:'rejected',canceled:error.code==='ERR_CANCELED',message:error.message});},
        snapshot:()=>({store:{token:useAuthStore.getState().token,user:useAuthStore.getState().user,isAuthenticated:useAuthStore.getState().isAuthenticated},
          shared:{token:localStorage.getItem('token'),sessionId:localStorage.getItem('authSessionId'),user:JSON.parse(localStorage.getItem('user')||'null')},
          generation:getSessionGeneration(),cache:queryClient.getQueryData(['boundary-private'])||null,...observed}),
      };
      function Probe(){
        const [draft,setDraft]=useState('');const{data}=useQuery({queryKey:['boundary-private'],enabled:false});
        const send=(kind)=>{void client.post('/audit/'+kind,{draft}).then(()=>observed.results[kind]={outcome:'accepted'},error=>observed.results[kind]={outcome:'rejected',message:error.message});};
        return <Box sx={{p:3}} data-testid="private-workspace"><Typography variant="h6">隔离测试工作区</Typography>
          <Typography>合成缓存：{data?JSON.stringify(data):'无'}</Typography>
          <form onSubmit={e=>{e.preventDefault();send('submit');}}><TextField label="工作内容" value={draft} onChange={e=>setDraft(e.target.value)}/>
            <Button type="button" onClick={()=>send('save')}>保存草稿</Button><Button type="submit">提交工作</Button></form></Box>;
      }
      const fixture=<ThemeProvider theme={createTheme()}><CssBaseline/><QueryClientProvider client={queryClient}>
        <SessionChangeBoundary><MemoryRouter initialEntries={[location.pathname]}><Routes>
          <Route path="/login" element={<LoginPage/>}/><Route element={<AppLayout/>}><Route path="/" element={<Probe/>}/></Route>
        </Routes></MemoryRouter></SessionChangeBoundary></QueryClientProvider></ThemeProvider>;
      createRoot(document.getElementById('root')).render(new URLSearchParams(location.search).has('app')?<App/>:fixture);
    ` },
    bundle: true, platform: 'browser', format: 'esm', outfile: path.join(temporary, 'bundle.js'),
    alias: { '@': path.join(root, 'src'), '@mui/icons-material': path.join(root, 'node_modules/@mui/icons-material/esm') },
    loader: { '.css': 'css', '.svg': 'dataurl', '.png': 'dataurl', '.woff2': 'file', '.ttf': 'file' },
    define: { 'process.env.NODE_ENV': '"production"', 'import.meta.hot': 'undefined', 'import.meta.env': '{}' },
    logLevel: 'silent',
    plugins: baseline ? [{ name: 'baseline-shared-session', setup(plugin) {
      plugin.onLoad({ filter: /SessionChangeBoundary\.tsx$/ }, () => ({ contents: "import React from 'react';export default function Boundary({children}){return <>{children}</>;}", loader: 'tsx', resolveDir: root }));
      plugin.onLoad({ filter: /(?:client|sessionPolicy|authStore|AppLayout|App)\.tsx?$/ }, ({ path: filename }) => {
        const relative = path.relative(root, filename);
        if (!['src/api/client.ts', 'src/utils/sessionPolicy.ts', 'src/stores/authStore.ts', 'src/components/shared/AppLayout.tsx', 'src/App.tsx'].includes(relative)) return;
        return { contents: execFileSync('git', ['show', `${baseline}:gmp-platform/frontend/${relative}`], { cwd: root, encoding: 'utf8' }), loader: filename.endsWith('.tsx') ? 'tsx' : 'ts', resolveDir: path.dirname(filename) };
      });
    } }] : [],
  });
  await writeFile(path.join(temporary, 'index.html'), `<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>跨标签会话隔离测试</title><link rel="stylesheet" href="/bundle.css"><div id="root"></div><script>
    if(new URLSearchParams(location.search).get('seed')==='A'&&!sessionStorage.getItem('auditSeeded')){
      localStorage.setItem('token','fixture-token-A');localStorage.setItem('user',JSON.stringify(${JSON.stringify(users.A)}));localStorage.setItem('authSessionId','initial-fixture-session-A');sessionStorage.setItem('auditSeeded','yes');
    }
    </script><script type="module" src="/bundle.js"></script></html>`);
  server = http.createServer(async (request, response) => {
    const filename = new URL(request.url, 'http://localhost').pathname.slice(1);
    const file = ['bundle.js', 'bundle.css'].includes(filename) ? filename : 'index.html';
    response.setHeader('Content-Type', file.endsWith('.js') ? 'text/javascript' : file.endsWith('.css') ? 'text/css' : 'text/html; charset=utf-8');
    try { response.end(await readFile(path.join(temporary, file))); } catch { response.writeHead(404).end(); }
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  browser = await chromium.launch({ headless: true, executablePath: process.env.CHROME_PATH || '/usr/bin/chromium' });
  const url = `http://127.0.0.1:${server.address().port}`;

  for (const scenario of cases) {
    const context = await browser.newContext({ viewport: { width, height: 900 } });
    const requests = [], errors = [];
    let held, promptGeometry;
    await context.route('**/api/v1/**', async route => {
      const request = route.request(), pathname = new URL(request.url()).pathname;
      const authorization = request.headers().authorization || null;
      requests.push({ pathname, method: request.method(), authorization });
      if (pathname.startsWith('/api/v1/audit/late-')) { held = route; return; }
      let data = {};
      if (pathname === '/api/v1/auth/me') data = users[authorization?.slice(-1)] || users.A;
      else if (pathname === '/api/v1/auth/login') data = { token: 'fixture-token-C', user: users.C, idleLogoutMinutes: 300, tokenValidityMinutes: 480 };
      else if (pathname === '/api/v1/system/settings/public') data = { systemName: '隔离会话审计', idleLogoutMinutes: 300, tokenValidityMinutes: 480 };
      else if (pathname === '/api/v1/identity/roles') data = { content: [], totalElements: 0 };
      else if (pathname.includes('menu')) data = { configured: false, modules: [] };
      await route.fulfill({ json: { code: 200, data } });
    });
    const a = await context.newPage(), b = await context.newPage();
    for (const [name, page] of [['A', a], ['B', b]]) {
      page.setDefaultTimeout(5000);
      page.on('pageerror', error => errors.push({ page: name, message: error.message }));
    }
    try {
      const actualApp = scenario === 'actual-app-installation';
      await a.goto(`${url}${actualApp ? '/login?app=1&seed=A' : '/?seed=A'}`);
      if (actualApp) await a.getByLabel('用户名').waitFor();
      else await a.waitForFunction(() => window.audit?.snapshot().authEvents >= 1);
      await b.goto(url);
      await b.waitForFunction(() => window.audit?.snapshot().authEvents >= 1);
      if (!actualApp) await a.getByLabel('工作内容').fill('A-private-unsaved');
      await a.evaluate(() => window.audit.seedCache());
      const before = await a.evaluate(() => window.audit.snapshot());
      const oldUrl = a.url();
      const kind = scenario.includes('401') ? 'late-401' : scenario.includes('409') ? 'late-409' : scenario.includes('blob') ? 'late-blob' : 'late-success';
      if (!['profile-refresh', 'actual-app-installation'].includes(scenario)) {
        await a.evaluate(kind => window.audit.startLate(kind), kind);
        for (let i = 0; i < 100 && !held; i++) await new Promise(resolve => setTimeout(resolve, 20));
        assert.ok(held, 'Old request must be captured before switching sessions');
      }

      if (scenario === 'profile-refresh') {
        await b.evaluate(() => window.audit.profile());
        await a.waitForFunction(() => window.audit.snapshot().store.user?.displayName === '资料刷新A');
        assert.equal(await a.getByLabel('工作内容').inputValue(), 'A-private-unsaved');
        const after = await a.evaluate(() => window.audit.snapshot());
        assert.equal(after.generation, before.generation);
        assert.deepEqual(after.cache, before.cache);
        assert.equal(await a.getByRole('heading', { name: '登录状态已变化' }).count(), 0);
        await a.getByRole('button', { name: '保存草稿', exact: true }).click();
        await a.waitForFunction(() => window.audit.snapshot().results.save?.outcome === 'accepted');
        assert.equal(requests.filter(request => request.pathname === '/api/v1/audit/save').length, 1);
        assert.equal(requests.find(request => request.pathname === '/api/v1/audit/save').authorization, 'Bearer fixture-token-A');
      } else {
        if (scenario === 'same-tab-response-control') await a.evaluate(() => window.audit.login('B'));
        else if (scenario === 'remote-logout') await b.evaluate(() => window.audit.logout());
        else if (scenario === 'remote-clear') await b.evaluate(() => window.audit.clear());
        else if (scenario === 'same-token-new-login') await b.evaluate(() => window.audit.login('A'));
        else if (scenario === 'remote-aba') await b.evaluate(() => { window.audit.login('B'); window.audit.login('A'); });
        else await b.evaluate(() => window.audit.login('B'));
        const writer = scenario === 'same-tab-response-control' ? a : b;
        const shared = await writer.evaluate(() => window.audit.snapshot().shared);
        if (scenario === 'same-tab-response-control') {
          // Cross-document storage events propagate each key separately; settle the complete login before the old response.
          await b.waitForFunction(expected => {
            const shared = window.audit.snapshot().shared;
            return shared.token === expected.token && shared.sessionId === expected.sessionId;
          }, shared);
        }
        if (scenario !== 'same-tab-response-control') {
          await a.getByRole('heading', { name: '登录状态已变化', exact: true }).waitFor();
          assert.equal(await a.getByTestId('private-workspace').count(), 0, 'Old form must be unmounted');
          if (actualApp) assert.equal(await a.getByLabel('用户名').count(), 0, 'Actual App must enforce its installed boundary');
          const blocked = await a.evaluate(() => window.audit.snapshot());
          assert.equal(blocked.store.user, null);
          assert.equal(blocked.store.isAuthenticated, false);
          assert.equal(blocked.cache, null);
          assert.ok(blocked.generation > before.generation);
          assert.deepEqual(blocked.shared, shared, 'Locking A must not change the other tab credentials');
          assert.equal(a.url(), oldUrl, 'Storage notification prompts instead of entering the other account');
          const loginButton = a.getByRole('button', { name: '返回登录页', exact: true });
          assert.equal(await loginButton.isVisible(), true);
          promptGeometry = await loginButton.evaluate(button => {
            const rect = button.getBoundingClientRect();
            return { viewportWidth: innerWidth, viewportHeight: innerHeight,
              scrollWidth: document.documentElement.scrollWidth,
              button: { left: rect.left, top: rect.top, right: rect.right, bottom: rect.bottom } };
          });
          assert.ok(promptGeometry.scrollWidth <= promptGeometry.viewportWidth + 1, 'Session prompt must not overflow horizontally');
          assert.ok(promptGeometry.button.left >= 0 && promptGeometry.button.top >= 0
            && promptGeometry.button.right <= promptGeometry.viewportWidth
            && promptGeometry.button.bottom <= promptGeometry.viewportHeight, 'Login action must remain inside the viewport');
        } else {
          assert.equal(await a.getByRole('heading', { name: '登录状态已变化' }).count(), 0);
          assert.equal((await a.evaluate(() => window.audit.snapshot())).store.user.username, 'audit-B');
        }
        if (held) {
          if (kind === 'late-401' || kind === 'late-409') await held.fulfill({ status: kind === 'late-401' ? 401 : 409, json: { code: kind === 'late-401' ? 401 : 409, message: 'old-A-fixture-rejection', data: {} } });
          else if (kind === 'late-blob') await held.fulfill({ status: 200, contentType: 'application/octet-stream', body: 'old-A-private-file' });
          else await held.fulfill({ json: { code: 200, data: { owner: 'A', value: 'old-A-response' } } });
          await a.waitForFunction(kind => window.audit.snapshot().results[kind]?.outcome === 'rejected', kind);
          assert.equal((await a.evaluate(kind => window.audit.snapshot().results[kind], kind)).canceled, true);
          assert.equal(a.url(), oldUrl, 'A stale response must not redirect');
          assert.deepEqual(await b.evaluate(() => window.audit.snapshot().shared), shared, 'A stale response must not clear the new credentials');
        }
        assert.equal(requests.filter(request => ['/api/v1/audit/save', '/api/v1/audit/submit'].includes(request.pathname)).length, 0);
        if (scenario === 'keyboard-login-and-reauth') {
          const button = a.getByRole('button', { name: '返回登录页', exact: true });
          await button.focus(); await a.keyboard.press('Enter');
          await a.waitForURL('**/login'); await a.getByLabel('用户名').waitFor();
          assert.deepEqual(await b.evaluate(() => window.audit.snapshot().shared), shared);
          await a.getByLabel('用户名').fill('audit-C'); await a.getByLabel('密码').fill('fixture-password-only');
          await a.getByRole('button', { name: '登 录', exact: true }).click();
          await a.getByLabel('工作内容').waitFor();
          assert.equal(await a.getByLabel('工作内容').inputValue(), '');
          assert.equal((await a.evaluate(() => window.audit.snapshot())).store.user.username, 'audit-C');
          assert.equal(requests.filter(request => ['/api/v1/audit/save', '/api/v1/audit/submit'].includes(request.pathname)).length, 0, 'No old draft replay after login');
        }
      }
      assert.deepEqual(errors, []);
      await a.screenshot({ path: path.join(artifacts, `${scenario}.png`), fullPage: true });
      report.results.push({ name: scenario, result: 'passed', promptGeometry, requests });
    } catch (error) {
      await a.screenshot({ path: path.join(artifacts, `${scenario}-failed.png`), fullPage: true });
      report.results.push({ name: scenario, result: 'failed', message: error.message, errors, requests });
    } finally { await context.close(); }
  }
} finally {
  if (browser) await browser.close();
  if (server) await new Promise(resolve => server.close(resolve));
  await rm(temporary, { recursive: true, force: true });
}
await writeFile(path.join(artifacts, 'results.json'), JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify(report, null, 2));
if (report.results.some(result => result.result !== 'passed')) process.exitCode = 1;
