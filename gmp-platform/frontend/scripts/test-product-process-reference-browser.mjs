import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import http from 'node:http';
import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';
import os from 'node:os';
import path from 'node:path';
import { build } from 'esbuild';
const { chromium } = createRequire(import.meta.url)('playwright');

// Real editor in Chromium; only its options/HTTP boundary is a fixture.
// No development database, credentials or business data are used.
const root = path.resolve(import.meta.dirname, '..');
const output = await mkdtemp(path.join(os.tmpdir(), 'edhr-f004-browser-'));
const baseline = process.env.F004_BASELINE_COMMIT;
if (baseline && !/^[0-9a-f]{40}$/.test(baseline)) throw new Error('F004_BASELINE_COMMIT must be a full commit SHA');
const results = [];
let server;
let browser;

try {
  await build({
    absWorkingDir: root,
    stdin: {
      resolveDir: root,
      loader: 'tsx',
      contents: `
        import React from 'react';
        import { createRoot } from 'react-dom/client';
        import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
        import { createTheme, ThemeProvider, CssBaseline } from '@mui/material';
        import Editor from './src/pages/master-data/components/ProductProcessVersionEditorDialog';
        const fixture = window.__fixture;
        const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
        const loadOptions = async () => {
          if (fixture.delay) await new Promise(resolve => setTimeout(resolve, fixture.delay));
          if (fixture.fail) throw new Error('isolated options failure');
          return fixture.options;
        };
        const theme = createTheme({ palette: { primary: { main: '#1890ff' } }, typography: { fontFamily: 'Arial, sans-serif' } });
        createRoot(document.getElementById('root')).render(<ThemeProvider theme={theme}><CssBaseline />
          <QueryClientProvider client={client}><Editor open productId="101" productName="引用验收产品" productCode="QA-101"
            mode={fixture.mode || 'edit'} target={fixture.target} versions={fixture.target ? [fixture.target] : []}
            loadOptions={loadOptions} onClose={() => { window.__closed = true; }}
            onSubmit={payload => { window.__submitted = payload; }} /></QueryClientProvider>
        </ThemeProvider>);
      `,
    },
    bundle: true,
    platform: 'browser',
    format: 'esm',
    outfile: path.join(output, 'bundle.js'),
    alias: { '@': path.join(root, 'src') },
    loader: { '.css': 'css', '.svg': 'dataurl', '.png': 'dataurl', '.woff2': 'file', '.ttf': 'file' },
    define: { 'process.env.NODE_ENV': '"production"' },
    plugins: baseline ? [{ name: 'read-original-editor', setup(plugin) {
      plugin.onLoad({ filter: /ProductProcessVersionEditorDialog\.tsx$/ }, args => ({
        contents: execFileSync('git', ['show', `${baseline}:gmp-platform/frontend/src/pages/master-data/components/ProductProcessVersionEditorDialog.tsx`], { cwd: root, encoding: 'utf8' }),
        loader: 'tsx', resolveDir: path.dirname(args.path),
      }));
    } }] : [],
    logLevel: 'silent',
  });
  await writeFile(path.join(output, 'index.html'), '<!doctype html><html lang="zh-CN"><meta charset="UTF-8"><title>制程引用隔离验收</title><link rel="stylesheet" href="/bundle.css"><div id="root"></div><script type="module" src="/bundle.js"></script></html>');
  server = http.createServer(async (request, response) => {
    const pathname = new URL(request.url, 'http://localhost').pathname;
    const name = pathname === '/' ? 'index.html' : pathname.slice(1);
    if (!['index.html', 'bundle.js', 'bundle.css'].includes(name)) { response.writeHead(404); response.end(); return; }
    response.setHeader('Content-Type', name.endsWith('.js') ? 'text/javascript' : name.endsWith('.css') ? 'text/css' : 'text/html; charset=utf-8');
    response.end(await readFile(path.join(output, name)));
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  browser = await chromium.launch({ headless: true, executablePath: process.env.CHROME_PATH });
  const options = {
    routes: [{ id: '301', routeId: '201', routeName: '当前路线', version: 'V2.0', versionCode: 'RT-2', status: 'ACTIVE' }],
    dhrTemplates: [{ id: '501', templateId: '401', name: '当前批记录', version: 'V2.0', code: 'DHR-2', status: 'ACTIVE' }],
    formTemplates: [], documents: [], dhrDirectories: [],
  };
  const target = {
    id: '701', version: 'V1.0', productionMode: '量产', productionForm: '批次',
    routeVersionId: '301', routeName: '当前路线', routeVersion: 'V2.0',
    dhrTemplateVersionId: '502', dhrTemplateName: '原批记录', dhrTemplateCode: 'DHR-OLD', dhrTemplateVersion: 'V0.9',
    dhrReviewMode: 'NONE', status: 'ACTIVE', operations: [],
  };
  async function run(name, fixture, check, viewport = { width: 1440, height: 960 }) {
    if (process.env.F004_CASE_FILTER && !name.includes(process.env.F004_CASE_FILTER)) return;
    const context = await browser.newContext({ viewport });
    await context.addInitScript(value => { window.__fixture = value; }, fixture);
    let graphAttempts = 0;
    await context.route('**/api/v1/**', async route => {
      const request = route.request();
      assert.equal(request.method(), 'GET', 'fixture must not write through an API');
      const pathname = new URL(request.url()).pathname;
      let data;
      if (pathname.endsWith('/graph')) {
        graphAttempts += 1;
        if (graphAttempts <= (fixture.graphFailures || 0)) {
          await route.fulfill({ status: 500, json: { code: 500, message: 'isolated graph failure' } });
          return;
        }
        if (fixture.graphDelay) await new Promise(resolve => setTimeout(resolve, fixture.graphDelay));
        data = fixture.graph || { nodes: [], relations: [] };
      }
      else if (pathname.includes('/workflow-templates')) data = { content: [], totalElements: 0 };
      else data = { content: [], totalElements: 0 };
      await route.fulfill({ status: 200, json: { code: 200, message: 'OK', data } });
    });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    try {
      await page.goto(base);
      await check(page);
      assert.deepEqual(errors, [], 'no browser runtime errors');
      results.push({ name, status: 'passed', viewport });
    } finally { await context.close(); }
  }
  const dhrField = page => page.getByRole('textbox', { name: '批记录模板版本' });
  const routeField = page => page.getByRole('textbox', { name: '工艺路线版本' });
  const save = page => page.getByRole('button', { name: '保存', exact: true });
  const waitForSave = page => page.waitForFunction(() => [...document.querySelectorAll('button')].some(button => button.textContent === '保存' && !button.disabled));
  async function choose(page, field) {
    await field.click();
    const version = page.getByRole('button', { name: /V2\.0 版本编码/ });
    await version.waitFor();
    await version.focus();
    await page.keyboard.press('Enter');
  }

  await run('saved DHR reference remains visible without becoming a candidate', { options, target }, async page => {
    await dhrField(page).waitFor();
    if (process.env.F004_SCREENSHOT_DIR) await page.screenshot({ path: path.join(process.env.F004_SCREENSHOT_DIR, 'f004-desktop.png'), fullPage: true });
    assert.equal(await dhrField(page).inputValue(), '原批记录 / V0.9');
    await page.getByText('批记录：DHR-OLD / 原批记录 / V0.9', { exact: true }).waitFor();
    await page.getByText('已保存的引用不在当前可选范围，请选择生效版本后保存。', { exact: true }).waitFor();
    assert.equal(await save(page).isEnabled(), false);
    await dhrField(page).click();
    assert.equal(await page.getByRole('button', { name: /V0\.9/ }).count(), 0);
    assert.equal(await page.getByRole('button', { name: /V2\.0 版本编码/ }).count(), 0); // DHR fixture has no version code.
    await page.getByRole('button', { name: 'V2.0', exact: true }).focus();
    await page.keyboard.press('Enter');
    assert.equal(await dhrField(page).inputValue(), '当前批记录 / V2.0');
    await waitForSave(page);
    assert.equal(await save(page).isEnabled(), true);
    await save(page).click();
    const payload = await page.evaluate(() => window.__submitted);
    assert.equal(payload.dhrTemplateVersionId, '501');
    assert.equal(payload.routeVersionId, '301');
  });

  await run('saved route identity is shown without inferred expiry or deletion', { options, target: { ...target, routeVersionId: '302', routeName: '原路线', routeVersion: 'V0.8', dhrTemplateVersionId: '501' } }, async page => {
    await routeField(page).waitFor();
    assert.equal(await routeField(page).inputValue(), '原路线 / V0.8');
    assert.equal(await save(page).isEnabled(), false);
    assert.equal(await page.getByText('已删除', { exact: false }).count(), 0);
    await choose(page, routeField(page));
    assert.equal(await routeField(page).inputValue(), '当前路线 / V2.0');
  });

  await run('missing display metadata retains the saved ID', { options, target: { ...target, dhrTemplateName: null, dhrTemplateCode: null, dhrTemplateVersion: null } }, async page => {
    await dhrField(page).waitFor();
    assert.equal(await dhrField(page).inputValue(), '已保存版本 #502 / -');
    assert.equal(await save(page).isEnabled(), false);
  });

  await run('copy keeps inherited reference visible until an explicit replacement', { options, mode: 'copy', target }, async page => {
    await dhrField(page).waitFor();
    assert.equal(await dhrField(page).inputValue(), '原批记录 / V0.9');
    assert.equal(await save(page).isEnabled(), false);
    assert.equal(await page.getByRole('textbox', { name: '制程版本' }).inputValue(), 'V2.0');
  });

  await run('new configuration has no invented saved reference', { options, mode: 'create' }, async page => {
    await dhrField(page).waitFor();
    assert.equal(await dhrField(page).inputValue(), '');
    assert.equal(await routeField(page).inputValue(), '');
    assert.equal(await page.getByText('已保存的引用不在当前可选范围，请选择生效版本后保存。', { exact: true }).count(), 0);
    assert.equal(await save(page).isEnabled(), false);
  });

  await run('an empty candidate set still displays both saved references', { options: { ...options, routes: [], dhrTemplates: [] }, target }, async page => {
    await dhrField(page).waitFor();
    assert.equal(await dhrField(page).inputValue(), '原批记录 / V0.9');
    assert.equal(await routeField(page).inputValue(), '当前路线 / V2.0');
    assert.equal(await save(page).isEnabled(), false);
    assert.equal(await page.getByText('已保存的引用不在当前可选范围，请选择生效版本后保存。', { exact: true }).count(), 2);
    assert.equal(await page.evaluate(() => window.__fixture.target.dhrTemplateVersionId), '502');
  });

  await run('eligible saved identities remain unchanged on submit', { options, target: { ...target, dhrTemplateVersionId: '501' } }, async page => {
    await dhrField(page).waitFor();
    assert.equal(await dhrField(page).inputValue(), '当前批记录 / V2.0');
    assert.equal(await routeField(page).inputValue(), '当前路线 / V2.0');
    await waitForSave(page);
    assert.equal(await save(page).isEnabled(), true);
    await save(page).click();
    const payload = await page.evaluate(() => window.__submitted);
    assert.equal(payload.dhrTemplateVersionId, '501');
    assert.equal(payload.routeVersionId, '301');
  });

  await run('slow graph never submits an empty replacement for saved operation bindings', {
    options, graphDelay: 1000,
    target: { ...target, dhrTemplateVersionId: '501', operations: [{ routeNodeKey: 'op-1', operationName: '灌装', finalOutput: true, forms: [], documents: [] }] },
    graph: { nodes: [{ nodeKey: 'op-1', nodeType: 'OPERATION', operationName: '灌装', operationCode: 'OP-1', sortOrder: 1, positionX: 0, positionY: 0 }], relations: [] },
  }, async page => {
    await dhrField(page).waitFor();
    if (await save(page).isEnabled()) {
      await save(page).click();
      const early = await page.evaluate(() => window.__submitted);
      assert.equal(early.operationBindings.length, 1, 'unloaded graph must never emit empty replacement bindings');
      assert.fail('save must remain disabled until saved operation bindings initialize');
    }
    await waitForSave(page);
    await save(page).click();
    const payload = await page.evaluate(() => window.__submitted);
    assert.equal(payload.operationBindings.length, 1);
    assert.equal(payload.operationBindings[0].routeNodeKey, 'op-1');
    assert.equal(payload.operationBindings[0].finalOutput, true);
  });

  await run('failed graph load and retry preserve saved operation bindings', {
    options, graphFailures: 1,
    target: { ...target, dhrTemplateVersionId: '501', operations: [{ routeNodeKey: 'op-1', operationName: '灌装', finalOutput: true, forms: [], documents: [] }] },
    graph: { nodes: [{ nodeKey: 'op-1', nodeType: 'OPERATION', operationName: '灌装', operationCode: 'OP-1', sortOrder: 1, positionX: 0, positionY: 0 }], relations: [] },
  }, async page => {
    await page.getByRole('alert').getByText('工艺路线配置加载失败，无法保存；已保存配置未更改。', { exact: true }).waitFor();
    assert.equal(await save(page).isEnabled(), false);
    assert.equal(await page.evaluate(() => window.__submitted), undefined);
    await page.getByRole('button', { name: '重新加载路线配置', exact: true }).click();
    await waitForSave(page);
    await save(page).click();
    const payload = await page.evaluate(() => window.__submitted);
    assert.equal(payload.operationBindings.length, 1);
    assert.equal(payload.operationBindings[0].routeNodeKey, 'op-1');
    assert.equal(payload.operationBindings[0].finalOutput, true);
  });

  await run('loading cannot submit before options are known', { options, target, delay: 500 }, async page => {
    await page.getByRole('progressbar').first().waitFor();
    assert.equal(await save(page).isEnabled(), false);
    await dhrField(page).waitFor();
    assert.equal(await dhrField(page).inputValue(), '原批记录 / V0.9');
  });

  await run('failed option load preserves failure and blocks submission', { options, target, fail: true }, async page => {
    await page.getByText('制程配置选项加载失败', { exact: true }).waitFor();
    assert.equal(await save(page).isEnabled(), false);
    assert.equal(await page.evaluate(() => window.__submitted), undefined);
  });

  await run('narrow viewport exposes the saved label and its correction hint', { options, target }, async page => {
    await dhrField(page).waitFor();
    assert.equal(await dhrField(page).inputValue(), '原批记录 / V0.9');
    await dhrField(page).scrollIntoViewIfNeeded();
    assert.equal(await dhrField(page).isVisible(), true);
    await page.getByText('已保存的引用不在当前可选范围，请选择生效版本后保存。', { exact: true }).waitFor();
    if (process.env.F004_SCREENSHOT_DIR) await page.screenshot({ path: path.join(process.env.F004_SCREENSHOT_DIR, 'f004-narrow.png'), fullPage: true });
  }, { width: 390, height: 844 });

  const result = { tests: results.length, failures: 0, results, scope: 'real Chromium/component; fixture options and HTTP; no real backend or database integration' };
  if (process.env.F004_RESULT_PATH) await writeFile(process.env.F004_RESULT_PATH, JSON.stringify(result, null, 2) + '\n');
  console.log(JSON.stringify(result, null, 2));
} finally {
  if (browser) await browser.close();
  if (server) await new Promise(resolve => server.close(resolve));
  await rm(output, { recursive: true, force: true });
}
