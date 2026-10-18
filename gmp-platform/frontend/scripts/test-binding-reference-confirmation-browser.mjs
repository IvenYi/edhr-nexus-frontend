import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { build } from 'esbuild';
const { chromium } = createRequire(import.meta.url)('playwright');
const root = path.resolve(import.meta.dirname, '..');
const temporary = await mkdtemp(path.join(os.tmpdir(), 'edhr-w3b-reference-browser-'));
const baseline = process.env.W3B_BASELINE_COMMIT;
const artifacts = process.env.W3B_BROWSER_ARTIFACT_DIR;
if (baseline && !/^[0-9a-f]{40}$/.test(baseline)) throw new Error('W3B_BASELINE_COMMIT must be a full SHA');
const results = [];
let server, browser;
try {
  if (artifacts) await mkdir(artifacts, { recursive: true });
  await build({ absWorkingDir: root, stdin: { resolveDir: root, loader: 'tsx', contents: `
    import React, { useState } from 'react';
    import { createRoot } from 'react-dom/client';
    import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
    import { createTheme, ThemeProvider, CssBaseline, Box } from '@mui/material';
    import Settings from './src/components/form-fill-settings/FormFillSettings';
    const mode = new URLSearchParams(location.search).get('mode');
    const configuration = {
      permissionGroupRules: [{ id: 'current', subjects: [{ type: 'USER', id: '1', nameSnapshot: '操作员' }], defaultPermission: 'READ_ONLY' }],
      buttons: [{ id: 'submit', action: 'SUBMIT', label: '提交' }],
      buttonEvents: [{ id: 'sign', action: 'SUBMIT', event: 'BEFORE', builtin: 'FILL_SIGN_FIELD', signatureMethod: 'ACCOUNT_PASSWORD' }],
      fieldPermissions: { 'start:current': { defaultPermission: 'READ_ONLY', editableFieldIds: ['keep', 'removed'], readOnlyFieldIds: ['read'] },
        'start:removed': { editableFieldIds: ['removed'] } },
      eventBindings: { 'entry:sign': { fieldId: 'signature' }, 'entry:removed': { fieldId: 'removed' } }
    };
    const dormant = { fieldPermissions: { 'dormant:removed': { editableFieldIds: ['removed'] } }, eventBindings: { 'dormant:removed': { fieldId: 'removed' } } };
    const initial = mode === 'DIRECT' ? { ...dormant, fillMode: mode, directFillConfig: configuration }
      : { ...configuration, fillMode: mode, formProcessVersionId: '901', directFillConfig: dormant };
    window.__initial = structuredClone(initial); window.__changes = [];
    function App() {
      const [value, setValue] = useState(initial);
      return <Box sx={{ p: 2, maxWidth: 600 }}><Settings value={value} editable form={{ id: '702', templateId: '501', name: '检验表' }}
        onChange={next => { window.__changes.push(next); setValue(next); }} /></Box>;
    }
    createRoot(document.getElementById('root')).render(<ThemeProvider theme={createTheme()}><CssBaseline />
      <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}><App /></QueryClientProvider>
    </ThemeProvider>);
  ` }, bundle: true, platform: 'browser', format: 'esm', outfile: path.join(temporary, 'bundle.js'),
  alias: { '@': path.join(root, 'src'), '@mui/icons-material': path.join(root, 'node_modules/@mui/icons-material/esm') },
  loader: { '.css': 'css', '.svg': 'dataurl', '.png': 'dataurl', '.woff2': 'file', '.ttf': 'file' },
  define: { 'process.env.NODE_ENV': '"development"' },
  plugins: baseline ? [{ name: 'original-binding-confirmation', setup(plugin) {
    plugin.onLoad({ filter: /\/form-fill-settings\/FormFillSettings\.tsx$/ }, args => ({
      contents: execFileSync('git', ['show', `${baseline}:gmp-platform/frontend/src/components/form-fill-settings/FormFillSettings.tsx`], { cwd: root, encoding: 'utf8' }),
      loader: 'tsx', resolveDir: path.dirname(args.path),
    }));
  } }] : [], logLevel: 'silent' });
  await writeFile(path.join(temporary, 'index.html'), '<!doctype html><html lang="zh-CN"><meta charset="UTF-8"><title>绑定引用确认验收</title><link rel="stylesheet" href="/bundle.css"><div id="root"></div><script type="module" src="/bundle.js"></script></html>');
  server = http.createServer(async (request, response) => {
    const name = new URL(request.url, 'http://localhost').pathname.slice(1) || 'index.html';
    if (!['index.html', 'bundle.js', 'bundle.css'].includes(name)) { response.writeHead(404); response.end(); return; }
    response.setHeader('Content-Type', name.endsWith('.js') ? 'text/javascript' : name.endsWith('.css') ? 'text/css' : 'text/html; charset=utf-8');
    response.end(await readFile(path.join(temporary, name)));
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  browser = await chromium.launch({ headless: true, executablePath: process.env.CHROME_PATH });
  const processOption = { id: '801', versionId: '901', name: '审批', versionNumber: 1,
    nodesJson: JSON.stringify([{ id: 'entry', data: { kind: 'START', config: {
      permissionGroupRules: [{ id: 'current', subjects: [{ type: 'USER', id: '1', nameSnapshot: '操作员' }], defaultPermission: 'READ_ONLY' }],
      buttonEvents: [{ id: 'sign', action: 'SUBMIT', event: 'BEFORE', builtin: 'FILL_SIGN_FIELD' }],
    } } }]), edgesJson: '[]' };
  async function run(mode, width, scenario = 'confirm') {
    const name = `${mode.toLowerCase()}-${width}-${scenario}`;
    const context = await browser.newContext({ viewport: { width, height: 960 } });
    let releaseMetadata;
    const metadataGate = new Promise(resolve => { releaseMetadata = resolve; });
    const calls = [], errors = [], consoleErrors = [];
    await context.route('**/api/v1/**', async route => {
      const request = route.request(), url = new URL(request.url()).pathname;
      assert.equal(request.method(), 'GET', 'component verification never writes business data'); calls.push(url);
      if (scenario === 'delayed' && url.endsWith('/processes/901')) await metadataGate;
      if (scenario === 'failure' && url.endsWith('/versions/702')) {
        await route.fulfill({ status: 503, json: { code: 503, message: '受控元数据失败' } }); return;
      }
      let data;
      if (url.endsWith('/form-fill-settings/processes')) data = [{ id: processOption.id, versionId: processOption.versionId, name: processOption.name, versionNumber: 1 }];
      else if (url.endsWith('/form-fill-settings/processes/901')) data = processOption;
      else if (url.endsWith('/identity/users')) data = { content: [{ id: '1', username: 'operator', displayName: '操作员', departmentIds: [] }], totalPages: 1 };
      else if (url.endsWith('/form-templates/501/versions/702')) data = { id: '702', version: 'V2', status: 'ACTIVE',
        modelDesignJson: JSON.stringify({ fields: [{ id: 'keep', name: '保留字段', type: 'text' }, { id: 'read', name: '只读字段', type: 'text' }, { id: 'signature', name: '签名', type: 'signature' }] }), canvasDesignJson: '{}' };
      else throw new Error(`unconfigured API fixture ${url}`);
      await route.fulfill({ status: 200, json: { code: 200, data } });
    });
    const page = await context.newPage(); page.setDefaultTimeout(15000);
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', message => { if (message.type() === 'error') consoleErrors.push(message.text()); });
    const changes = () => page.evaluate(() => window.__changes);
    try {
      await page.goto(`http://127.0.0.1:${server.address().port}/?mode=${mode}`);
      if (mode === 'DIRECT') await page.getByRole('tab', { name: '字段权限与绑定', exact: true }).click();
      const configure = page.getByRole('button', { name: '字段权限设置', exact: true });
      await configure.waitFor();
      if (scenario === 'failure') {
        await page.getByText('表单字段加载失败', { exact: true }).waitFor();
        assert.equal(await configure.isDisabled(), true); assert.deepEqual(await changes(), []);
        assert.equal(consoleErrors.length, 1); assert.match(consoleErrors[0], /503/);
      } else {
        if (scenario === 'delayed') {
          assert.equal(await configure.isDisabled(), true); assert.deepEqual(await changes(), []); releaseMetadata();
        }
        await page.waitForFunction(() => [...document.querySelectorAll('button')].some(button => button.textContent.trim() === '字段权限设置' && !button.disabled));
        assert.deepEqual(await changes(), [], 'opening or fetching metadata does not rewrite settings');
        await configure.click();
        await page.getByRole('button', { name: '取消', exact: true }).click();
        assert.deepEqual(await changes(), [], 'cancel retains invalid and valid draft entries');
        await configure.click();
        if (artifacts) await page.screenshot({ path: path.join(artifacts, `${name}-before-confirm.png`), fullPage: true, animations: 'disabled' });
        await page.getByRole('button', { name: '保存配置', exact: true }).click();
        await page.waitForFunction(() => window.__changes.length === 1);
        const saved = (await changes())[0], initial = await page.evaluate(() => window.__initial);
        const active = mode === 'DIRECT' ? saved.directFillConfig : saved;
        assert.deepEqual(Object.keys(active.fieldPermissions), ['start:current']);
        assert.deepEqual(active.fieldPermissions['start:current'], { defaultPermission: 'READ_ONLY', editableFieldIds: ['keep'], readOnlyFieldIds: ['read'] });
        assert.deepEqual(active.eventBindings, { 'entry:sign': { fieldId: 'signature' } });
        if (mode === 'DIRECT') { assert.deepEqual(saved.fieldPermissions, initial.fieldPermissions); assert.deepEqual(saved.eventBindings, initial.eventBindings); }
        else assert.deepEqual(saved.directFillConfig, initial.directFillConfig);
        assert.deepEqual(consoleErrors, []);
      }
      assert.deepEqual(errors, []);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false);
      if (artifacts) await page.screenshot({ path: path.join(artifacts, `${name}.png`), fullPage: true, animations: 'disabled' });
      results.push({ name, mode, width, scenario, status: 'passed', changes: await changes(), calls, errors, consoleErrors,
        scope: 'Actual shared React/MUI field-configuration confirmation; post-switch input fixture and controlled metadata API; no backend/database write.' });
    } catch (error) {
      results.push({ name, status: 'failed', message: error.message, calls, errors, consoleErrors });
      throw new Error(`${error.message}\n${(await page.locator('body').innerText()).slice(0, 1800)}`);
    } finally { releaseMetadata(); await context.close(); }
  }
  for (const width of [1440, 390]) for (const mode of ['DIRECT', 'PROCESS']) await run(mode, width);
  await run('PROCESS', 1440, 'delayed'); await run('DIRECT', 1440, 'failure');
  console.log(JSON.stringify({ results }, null, 2));
} finally {
  if (artifacts) await writeFile(path.join(artifacts, 'browser-results.json'), JSON.stringify({ results }, null, 2) + '\n');
  await browser?.close(); if (server) await new Promise(resolve => server.close(resolve));
  await rm(temporary, { recursive: true, force: true });
}
