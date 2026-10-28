import assert from 'node:assert/strict';
import { mkdtemp, readFile, writeFile, rm, mkdir } from 'node:fs/promises';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';
import { build } from 'esbuild';

const { chromium } = createRequire(import.meta.url)('playwright');
const root = path.resolve(import.meta.dirname, '..');
const temp = await mkdtemp(path.join(os.tmpdir(), 'edhr-designer-save-host-'));
const artifacts = process.env.SAVE_HOST_ARTIFACTS;
const results = [];
let server, browser;

// Deliberately replace only the designer child, not its real parent, Query mutations or API client.
// This isolates actual host URL/payload/pending/feedback, not Shell validation or server persistence.
const child = `import React from 'react';
  export default function DesignerHostProbe(props) {
    const submit = async (kind) => {
      const source = { templateId: props.row.id, versionId: props.version.id, kind };
      const payload = Object.fromEntries(['modelDesignJson','canvasDesignJson','workflowDesignJson'].map(key => [key, JSON.stringify({ ...source, key })]));
      let outcome = 'success';
      try { await (kind === 'main' ? props.onSave(payload) : props.onAutoSave(payload)); }
      catch { outcome = 'error'; }
      finally { window.qaHostCompletions.push({ ...source, outcome }); }
    };
    return <div data-host-probe data-template-id={props.row.id} data-version-id={props.version.id} data-pending={String(props.saving)} style={{position:'fixed',inset:'80px 40px auto',zIndex:1400,background:'#fff',padding:20,border:'1px solid #aaa'}}>
      <p>受控子组件：实际保存宿主 {props.row.id}/{props.version.id}</p>
      <button disabled={props.saving} onClick={() => submit('main')}>probe-main-save</button>
      <button disabled={props.saving} onClick={() => submit('field')}>probe-field-save</button>
      <button onClick={props.onClose}>probe-close</button>
    </div>;
  }`;

try {
  if (artifacts) await mkdir(artifacts, { recursive: true });
  await build({
    absWorkingDir: root,
    stdin: { resolveDir: root, loader: 'tsx', contents: `
      import React from 'react';
      import { createRoot } from 'react-dom/client';
      import { MemoryRouter } from 'react-router-dom';
      import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
      import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
      import { SnackbarProvider } from './src/components/SnackbarProvider';
      import Templates from './src/pages/master-data/TemplateModelingPage';
      window.qaHostCompletions = [];
      const client = new QueryClient({ defaultOptions: { queries: { retry:false, staleTime:30000, refetchOnWindowFocus:false } } });
      createRoot(document.getElementById('root')).render(<ThemeProvider theme={createTheme()}><CssBaseline/><MemoryRouter>
        <QueryClientProvider client={client}><SnackbarProvider><Templates pageKey="formTemplates"/></SnackbarProvider></QueryClientProvider>
      </MemoryRouter></ThemeProvider>);` },
    bundle: true, platform: 'browser', format: 'esm', outfile: path.join(temp, 'bundle.js'),
    alias: { '@': path.join(root, 'src'), '@mui/icons-material': path.join(root, 'node_modules/@mui/icons-material/esm') },
    define: { 'process.env.NODE_ENV': '"production"' },
    plugins: [{ name: 'controlled-designer-child-only', setup(plugin) {
      plugin.onLoad({ filter: /\/template-designer-react\/index\.ts$/ }, ({ path: filename }) => ({ contents: child, loader:'tsx', resolveDir:path.dirname(filename) }));
    } }],
  });
  await writeFile(path.join(temp, 'index.html'), '<!doctype html><html lang="zh-CN"><meta charset="utf-8"><body><div id="root"></div><script type="module" src="/bundle.js"></script></body></html>');
  server = http.createServer(async (request, response) => {
    const file = new URL(request.url, 'http://localhost').pathname === '/bundle.js' ? 'bundle.js' : 'index.html';
    response.setHeader('Content-Type', file.endsWith('.js') ? 'text/javascript' : 'text/html; charset=utf-8');
    response.end(await readFile(path.join(temp, file)));
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  browser = await chromium.launch({ headless:true, executablePath:process.env.CHROME_PATH });
  for (const kind of ['main', 'field']) for (const scenario of ['normal', 'reopen-success', 'reopen-error']) {
    const name = `${kind}-${scenario}`;
    const context = await browser.newContext({ viewport:{width:1440,height:1000} });
    const page = await context.newPage();
    page.setDefaultTimeout(7000);
    const errors = [], writes = [], reads = [];
    let release;
    const gate = new Promise(resolve => { release = resolve; });
    const base = '/api/v1/master-data/template-modeling/form-templates';
    const rows = [
      { id:'3001',code:'HOST-A',name:'HOST-A',status:'ACTIVE',versions:[{id:'4001',templateId:'3001',version:'V1',status:'ACTIVE'}] },
      { id:'3002',code:'HOST-B',name:'HOST-B',status:'ACTIVE',versions:[{id:'4002',templateId:'3002',version:'V2',status:'ACTIVE'}] },
    ];
    page.on('pageerror', error => errors.push(error.message));
    await context.route('**/api/v1/**', async route => {
      const request = route.request(), pathname = new URL(request.url()).pathname;
      if (request.method() === 'GET') {
        reads.push(pathname);
        const data = pathname === base ? {content:rows,page:1,size:20,totalPages:1,totalElements:2}
          : pathname === `${base}/categories` ? [] : null;
        if (data === null) { errors.push(`Unexpected GET ${pathname}`); await route.abort(); return; }
        await route.fulfill({json:{code:200,data}});
      } else if (request.method() === 'PUT' && /\/versions\/\d+\/design$/.test(pathname)) {
        writes.push({path:pathname,payload:request.postDataJSON()});
        await gate;
        await route.fulfill(scenario === 'reopen-error'
          ? {status:503,json:{code:503,message:'A会话保存失败'}}
          : {json:{code:200,data:rows[0].versions[0]}});
      } else { errors.push(`Unexpected ${request.method()} ${pathname}`); await route.abort(); }
    });
    const probe = page.locator('[data-host-probe]');
    const open = async (id) => {
      const row = page.locator(`tr[data-record-id="${id}"]`);
      await row.waitFor();
      const versions = row.locator('xpath=following-sibling::tr[1]');
      if (!await versions.getByRole('button', {name:'设计',exact:true}).count()) {
        await row.locator('td').first().getByRole('button').first().click();
      }
      // Select the design action in this row's nested version table, not another expanded template.
      await versions.getByRole('button',{name:'设计',exact:true}).click();
      await page.waitForFunction(id => document.querySelector('[data-host-probe]')?.getAttribute('data-template-id') === id, id);
    };
    try {
      await page.goto(`http://127.0.0.1:${server.address().port}/`);
      await open('3001');
      const sent = page.waitForRequest(request => request.method() === 'PUT' && request.url().endsWith('/design'));
      await page.getByRole('button',{name:`probe-${kind}-save`,exact:true}).click();
      await sent;
      await page.waitForFunction(() => document.querySelector('[data-host-probe]')?.getAttribute('data-pending') === 'true');
      assert.equal(await page.getByRole('button',{name:`probe-${kind}-save`,exact:true}).isDisabled(),true);
      let blockedWhileOldPending = null;
      if (scenario !== 'normal') {
        await page.getByRole('button',{name:'probe-close',exact:true}).click();
        await probe.waitFor({state:'hidden'});
        await open('3002');
        blockedWhileOldPending = await page.getByRole('button',{name:'probe-main-save',exact:true}).isDisabled();
        assert.equal(blockedWhileOldPending,true,'Real host pending is shared with the new editor until the old mutation settles');
      }
      release();
      await page.waitForFunction(() => window.qaHostCompletions.length === 1);
      await page.waitForFunction(() => document.querySelector('[data-host-probe]')?.getAttribute('data-pending') === 'false');
      assert.equal(writes.length,1);
      assert.equal(writes[0].path,`${base}/3001/versions/4001/design`);
      for (const key of ['modelDesignJson','canvasDesignJson','workflowDesignJson']) {
        assert.deepEqual(JSON.parse(writes[0].payload[key]),{templateId:'3001',versionId:'4001',kind,key});
      }
      const completion = await page.evaluate(() => window.qaHostCompletions[0]);
      assert.equal(completion.outcome,scenario === 'reopen-error' ? 'error' : 'success');
      assert.equal(await probe.getAttribute('data-template-id'),scenario === 'normal' ? '3001' : '3002');
      if (scenario === 'normal') await page.getByRole('alert').getByText(kind === 'main' ? '设计已保存' : '字段已保存',{exact:true}).waitFor();
      const feedback = await page.getByRole('alert').allTextContents();
      assert.deepEqual(errors,[]);
      if (artifacts && name === 'main-reopen-success') await page.screenshot({path:path.join(artifacts,'old-main-completion.png')});
      results.push({name,passed:true,writes,reads,completion,blockedWhileOldPending,feedback,
        qualification:'Actual TemplateModelingPage/TanStack/API client and public template design entry; controlled child callbacks and intercepted HTTP. No real canvas validation, server persistence, full autosave/main ordering, mobile or accessibility certification. Late feedback is recorded, not defined as desired policy.'});
    } catch (error) {
      results.push({name,passed:false,error:error.message,writes,reads,errors});
      if (artifacts) await page.screenshot({path:path.join(artifacts,`${name}-failed.png`)});
    } finally { release(); await context.close(); }
  }
} finally {
  if (browser) await browser.close();
  if (server) await new Promise(resolve => server.close(resolve));
  await rm(temp,{recursive:true,force:true});
}
const report = {cases:results.length,passed:results.filter(row=>row.passed).length,results};
if (artifacts) await writeFile(path.join(artifacts,'results.json'),JSON.stringify(report,null,2));
console.log(JSON.stringify(report,null,2));
if (report.passed !== report.cases) process.exitCode=1;
