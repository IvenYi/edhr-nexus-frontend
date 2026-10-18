import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { build } from 'esbuild';
const { chromium } = createRequire(import.meta.url)('playwright');
const root = path.resolve(import.meta.dirname, '..');
const temporary = await mkdtemp(path.join(os.tmpdir(), 'edhr-w3-mode-browser-'));
const artifactDir = process.env.W3_BROWSER_ARTIFACT_DIR;
const results = [];
let server, browser;
try {
  if (artifactDir) await mkdir(artifactDir, { recursive: true });
  await build({ absWorkingDir: root, stdin: { resolveDir: root, loader: 'tsx', contents: `
    import React, { useState } from 'react';
    import { createRoot } from 'react-dom/client';
    import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
    import { createTheme, ThemeProvider, CssBaseline, Box } from '@mui/material';
    import { MemoryRouter, Routes, Route } from 'react-router-dom';
    import { SnackbarProvider } from './src/components/SnackbarProvider';
    import Settings from './src/components/form-fill-settings/FormFillSettings';
    import SettingsButton, { FormFillModeLabel } from './src/components/form-fill-settings/FormFillSettingsButton';
    import WorkTemplateEditor from './src/pages/workflow-center/WorkTemplateEditor';
    const query = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    function Fixture() {
      const [value, setValue] = useState({});
      const update = next => { window.__changes.push(next); setValue(next); };
      const form = { id: '702', templateId: '501', name: '检验表' };
      return <Box sx={{ p: 2, maxWidth: 600 }}>
        {location.search.includes('dialog') ? <><FormFillModeLabel value={value} /><SettingsButton value={value} form={form} onChange={update} /></>
          : <Settings value={value} form={form} editable onChange={update} />}
      </Box>;
    }
    window.__changes = [];
    createRoot(document.getElementById('root')).render(<ThemeProvider theme={createTheme()}><CssBaseline />
      <QueryClientProvider client={query}><SnackbarProvider>
        {location.search.includes('work') ? <MemoryRouter initialEntries={['/work/101']}><Routes><Route path="/work/:id" element={<WorkTemplateEditor />} /></Routes></MemoryRouter> : <Fixture />}
      </SnackbarProvider></QueryClientProvider></ThemeProvider>);
  ` }, bundle: true, platform: 'browser', format: 'esm', outfile: path.join(temporary, 'bundle.js'),
  alias: { '@': path.join(root, 'src'), '@mui/icons-material': path.join(root, 'node_modules/@mui/icons-material/esm') },
  loader: { '.css': 'css', '.svg': 'dataurl', '.png': 'dataurl', '.woff2': 'file', '.ttf': 'file' },
  define: { 'process.env.NODE_ENV': '"development"' }, logLevel: 'silent' });
  await writeFile(path.join(temporary, 'index.html'), '<!doctype html><html lang="zh-CN"><meta charset="UTF-8"><title>显式填报方式验收</title><link rel="stylesheet" href="/bundle.css"><style>html,body,#root{height:100%;margin:0}</style><div id="root"></div><script type="module" src="/bundle.js"></script></html>');
  server = http.createServer(async (request, response) => {
    const name = new URL(request.url, 'http://localhost').pathname.slice(1) || 'index.html';
    if (!['index.html', 'bundle.js', 'bundle.css'].includes(name)) { response.writeHead(404); response.end(); return; }
    response.setHeader('Content-Type', name.endsWith('.js') ? 'text/javascript' : name.endsWith('.css') ? 'text/css' : 'text/html; charset=utf-8');
    response.end(await readFile(path.join(temporary, name)));
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  browser = await chromium.launch({ headless: true, executablePath: process.env.CHROME_PATH });
  const processOption = { id: '801', versionId: '901', name: '审批', versionNumber: 1, nodesJson: '[{"id":"start","data":{"kind":"START"}}]', edgesJson: '[]' };
  async function run(surface, viewport) {
    const name = `${surface}-${viewport.width}`;
    const context = await browser.newContext({ viewport });
    const calls = [], writes = [], errors = [], consoleErrors = [];
    const nodes = ['START', 'FORM', 'END'].map((kind, index) => ({ id: ['start', 'form', 'end'][index], type: 'workNode', position: { x: 200, y: 100 + index * 170 }, data: { kind, label: kind === 'FORM' ? '检验' : kind === 'START' ? '开始' : '结束', ...(kind === 'FORM' ? { config: { formTemplateVersionId: '702', formTemplateName: '检验表' } } : {}) } }));
    let version = { id: '201', versionNumber: 1, status: 'DRAFT', isCurrent: false, nodesJson: JSON.stringify(nodes), edgesJson: JSON.stringify([{ id: 'a', source: 'start', target: 'form' }, { id: 'b', source: 'form', target: 'end' }]) };
    await context.route('**/api/v1/**', async route => {
      const request = route.request(), url = new URL(request.url()).pathname.replace('/api/v1', '');
      calls.push({ method: request.method(), path: url });
      let data;
      if (request.method() === 'PUT' && url.endsWith('/201/graph')) {
        const payload = request.postDataJSON(); writes.push(payload);
        version = { ...version, nodesJson: JSON.stringify(payload.nodes), edgesJson: JSON.stringify(payload.edges) }; data = version;
      } else {
        assert.equal(request.method(), 'GET', `unexpected business write ${url}`);
        if (url.endsWith('/form-fill-settings/processes')) data = [processOption];
        else if (url.endsWith('/form-fill-settings/processes/901')) data = processOption;
        else if (url.endsWith('/form-templates/501/versions/702')) data = { id: '702', version: 'V1', status: 'ACTIVE', modelDesignJson: '{"fields":[]}', canvasDesignJson: '{}' };
        else if (url.endsWith('/form-templates')) data = { content: [{ id: '501', name: '检验表', versions: [{ id: '702', version: 'V1', status: 'ACTIVE' }] }], totalPages: 1 };
        else if (url.endsWith('/work-templates/101')) data = { id: '101', name: '检验作业', code: 'W01' };
        else if (url.endsWith('/101/versions')) data = [version];
        else if (url.endsWith('/101/versions/201')) data = version;
        else if (url.endsWith('/form-process-references') || url.endsWith('/applicability-rules')) data = [];
        else if (url.endsWith('/form-processes')) data = { content: [] };
        else throw new Error(`unconfigured API fixture ${url}`);
      }
      await route.fulfill({ status: 200, json: { code: 200, data } });
    });
    const page = await context.newPage(); page.setDefaultTimeout(15000);
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', message => { if (message.type() === 'error') consoleErrors.push(message.text()); });
    const modeButton = label => page.getByRole('button', { name: label, exact: true });
    async function noSelection() {
      assert.equal(await modeButton('直接填报').getAttribute('aria-pressed'), 'false');
      assert.equal(await modeButton('按流程填报').getAttribute('aria-pressed'), 'false');
      assert.deepEqual(await page.evaluate(() => window.__changes), []);
      if (artifactDir) await page.screenshot({ path: path.join(artifactDir, `${name}-unconfigured.png`), fullPage: true, animations: 'disabled' });
    }
    try {
      await page.goto(`http://127.0.0.1:${server.address().port}/?${surface}`);
      if (surface === 'dialog') {
        await page.getByText('待配置', { exact: true }).waitFor();
        await page.getByRole('button', { name: '填报设置 检验表' }).click();
        await noSelection();
        assert.equal(await modeButton('应用').isDisabled(), true);
        await modeButton('取消').click();
        assert.deepEqual(await page.evaluate(() => window.__changes), []);
        await page.getByRole('button', { name: '填报设置 检验表' }).click();
        await modeButton('直接填报').focus(); await page.keyboard.press('Space');
        await modeButton('应用').click();
        await page.getByRole('dialog').waitFor({ state: 'hidden' });
        assert.equal((await page.evaluate(() => window.__changes)).at(-1).fillMode, 'DIRECT');
        await page.getByRole('button', { name: '填报设置 检验表' }).click();
        await modeButton('按流程填报').click();
        assert.equal(await modeButton('应用').isDisabled(), true);
        await page.getByRole('combobox', { name: '表单流程' }).click();
        await page.getByRole('option', { name: /审批/ }).click();
        await modeButton('应用').click();
        await page.getByRole('dialog').waitFor({ state: 'hidden' });
        assert.equal((await page.evaluate(() => window.__changes)).at(-1).fillMode, 'PROCESS');
      } else if (surface === 'inline') {
        await page.getByText('请选择填报方式后配置填报要求。').waitFor(); await noSelection();
        await modeButton('直接填报').focus(); await page.keyboard.press('Space');
        await page.getByRole('tab', { name: '填报人员', exact: true }).waitFor();
        assert.equal((await page.evaluate(() => window.__changes)).at(-1).fillMode, 'DIRECT');
        await modeButton('按流程填报').click();
        await page.getByRole('combobox', { name: '表单流程' }).click();
        await page.getByRole('option', { name: /审批/ }).click();
        await modeButton('直接填报').click();
        assert.equal((await page.evaluate(() => window.__changes)).at(-1).formProcessVersionId, '901', 'inactive process choice is retained');
      } else {
        await page.locator('.react-flow__node[data-id="form"]').click();
        await page.getByText('请选择填报方式后配置填报要求。').waitFor(); await noSelection();
        await modeButton('发布').click();
        await page.getByRole('dialog', { name: '发布流程' }).getByRole('button', { name: '发布', exact: true }).click();
        await page.getByText('请选择填报方式', { exact: true }).first().waitFor();
        assert.equal(calls.some(call => call.path.endsWith('/publish')), false, 'actual page validation prevents publishing an unconfigured mode');
        await modeButton('直接填报').click();
        await modeButton('保存草稿').click();
        await page.waitForFunction(() => [...document.querySelectorAll('button')].some(button => button.textContent.trim() === '保存草稿' && button.disabled));
        assert.equal(writes.length, 1);
        assert.equal(writes[0].nodes.find(node => node.id === 'form').data.config.fillMode, 'DIRECT');
        await page.reload();
        await page.locator('.react-flow__node[data-id="form"]').click();
        assert.equal(await modeButton('直接填报').getAttribute('aria-pressed'), 'true');
      }
      assert.deepEqual(errors, []); assert.deepEqual(consoleErrors, []);
      if (artifactDir) await page.screenshot({ path: path.join(artifactDir, `${name}.png`), fullPage: true, animations: 'disabled' });
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1);
      assert.equal(overflow, false, 'no page-level horizontal overflow');
      results.push({ name, status: 'passed', viewport, calls, writes: writes.length, errors, consoleErrors, overflow });
    } catch (error) {
      results.push({ name, status: 'failed', viewport, message: error.message, errors, consoleErrors, calls });
      throw new Error(`${error.message}\n${(await page.locator('body').innerText()).slice(0, 2500)}`);
    } finally { await context.close(); }
  }
  for (const width of [1440, 390]) for (const surface of ['inline', 'dialog']) await run(surface, { width, height: 960 });
  await run('work', { width: 1440, height: 960 });
  console.log(JSON.stringify({ scope: 'Actual React/MUI shared components and WorkTemplateEditor; controlled API fixtures; no backend/database or production writes.', results }, null, 2));
} finally {
  if (artifactDir) await writeFile(path.join(artifactDir, 'browser-results.json'), JSON.stringify({ results }, null, 2) + '\n');
  await browser?.close();
  if (server) await new Promise(resolve => server.close(resolve));
  await rm(temporary, { recursive: true, force: true });
}
