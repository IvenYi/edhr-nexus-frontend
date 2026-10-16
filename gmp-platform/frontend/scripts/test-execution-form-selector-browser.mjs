import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { build } from 'esbuild';
const { chromium } = createRequire(import.meta.url)('playwright');

// Actual selector, MUI and application CSS. Read fixtures and selection callbacks
// are controlled; no production service or database is used.
const root = path.resolve(import.meta.dirname, '..');
const temporary = await mkdtemp(path.join(os.tmpdir(), 'edhr-form-selector-browser-'));
const baseline = process.env.W2_BASELINE_COMMIT;
if (baseline && !/^[0-9a-f]{40}$/.test(baseline)) throw new Error('W2_BASELINE_COMMIT must be a full commit SHA');
const results = [];
let server, browser;
try {
  await build({ absWorkingDir: root, stdin: { resolveDir: root, loader: 'tsx', contents: `
    import React, { useState } from 'react';
    import { createRoot } from 'react-dom/client';
    import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
    import Selector from './src/pages/production/ExecutionFormSelector';
    import { ProductionOutputValue } from './src/components/ProductionOutput';
    import './src/pages/production/ProductionExecutionPage.css';
    const form = (id, name, extra = {}) => ({ id, name, code: id.toUpperCase(), version: 'V1.0',
      versionId: 'v1', fields: [], required: true, ...extra });
    const forms = [form('configured', '工序记录'), form('work', '分支记录', { workId: 'w', workNodeId: 'entry' })];
    const works = [{ id: 'w', name: '条件作业', version: '1', nodes: [
      { id: 's', data: { kind: 'START' } }, { id: 'entry', data: { kind: 'FORM' } }, { id: 'e', data: { kind: 'END' } }
    ], edges: [{ source: 's', target: 'entry' }, { source: 'entry', target: 'e' }] }];
    window.__selections = []; window.__attachCalls = 0;
    function App() {
      const [fixture, setFixture] = useState({ operationStatus: 'PENDING', copies: {}, workStates: {}, busy: false });
      const [open, setOpen] = useState(true);
      window.__fixture = setFixture;
      if (new URLSearchParams(location.search).has('quantity')) return <ProductionOutputValue output={{ quantity: null,
        status: 'READY', message: '', groups: [{ quantity: '10', unit: '根' }, { quantity: '12', unit: '件' }] }} />;
      return <Selector open={open} container={() => document.getElementById('root')} onClose={() => setOpen(false)}
        forms={forms} works={works} selectedId="configured" canAttach={false} editors={null} {...fixture}
        onSelect={(id, instanceId) => window.__selections.push(instanceId === undefined ? { id } : { id, instanceId })}
        onAttach={async () => { window.__attachCalls++; return false; }} />;
    }
    createRoot(document.getElementById('root')).render(<ThemeProvider theme={createTheme()}><CssBaseline /><App /></ThemeProvider>);
  ` }, bundle: true, platform: 'browser', format: 'esm', outfile: path.join(temporary, 'bundle.js'),
    alias: { '@': path.join(root, 'src'), '@mui/icons-material': path.join(root, 'node_modules/@mui/icons-material/esm') },
    define: { 'process.env.NODE_ENV': '"development"' },
    plugins: baseline ? [{ name: 'original-selector', setup(plugin) {
      plugin.onLoad({ filter: /ExecutionFormSelector\.tsx$/ }, args => ({
        contents: execFileSync('git', ['show', baseline + ':gmp-platform/frontend/src/pages/production/ExecutionFormSelector.tsx'], { cwd: root, encoding: 'utf8' }),
        loader: 'tsx', resolveDir: path.dirname(args.path),
      }));
    } }] : [], logLevel: 'silent' });
  await writeFile(path.join(temporary, 'index.html'), '<!doctype html><html lang="zh-CN"><meta charset="UTF-8"><title>表单选择隔离验收</title><link rel="stylesheet" href="/bundle.css"><style>html,body,#root{height:100%;margin:0}</style><div id="root"></div><script type="module" src="/bundle.js"></script></html>');
  server = http.createServer(async (request, response) => {
    const name = new URL(request.url, 'http://localhost').pathname === '/' ? 'index.html' : request.url.slice(1);
    if (!['index.html', 'bundle.js', 'bundle.css'].includes(name)) { response.writeHead(404); response.end(); return; }
    response.setHeader('Content-Type', name.endsWith('.js') ? 'text/javascript' : name.endsWith('.css') ? 'text/css' : 'text/html; charset=utf-8');
    response.end(await readFile(path.join(temporary, name)));
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  browser = await chromium.launch({ headless: true, executablePath: process.env.CHROME_PATH });
  const group = (ids, status) => ({ instanceIds: ids, status, required: true, ended: false, canAdd: false, canEnd: false,
    incomplete: [], instances: Object.fromEntries(ids.map(id => [id, { canAct: true, nodeKind: 'FILL', buttons: [] }])) });
  async function fixture(page, values) {
    await page.evaluate(values => window.__fixture({ operationStatus: 'IN_PROGRESS', copies: {}, workStates: {}, busy: false, ...values }), values);
    // Wait for React to commit the fixture, not just for the setter to return.
    await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  }
  async function workStep(page) {
    await page.getByRole('tab', { name: '作业发起 1', exact: true }).click();
    const expand = page.getByRole('button', { name: '展开条件作业的全部表单', exact: true });
    if (await expand.count()) await expand.click();
    return page.locator('.execution-work-step-target');
  }
  async function screenshot(page, name) {
    if (!process.env.W2_SCREENSHOT_DIR) return;
    await mkdir(process.env.W2_SCREENSHOT_DIR, { recursive: true });
    await page.screenshot({ path: path.join(process.env.W2_SCREENSHOT_DIR, name), animations: 'disabled' });
  }
  async function run(name, check, viewport = { width: 1440, height: 960 }, quantity = false) {
    const context = await browser.newContext({ viewport });
    const page = await context.newPage(); const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    try {
      await page.goto('http://127.0.0.1:' + server.address().port + (quantity ? '/?quantity' : ''));
      if (!quantity) await page.getByRole('dialog', { name: '填报表单', exact: true }).waitFor();
      await check(page);
      assert.deepEqual(errors, [], 'no browser runtime errors');
      assert.equal(await page.evaluate(() => window.__attachCalls), 0, 'preview never attaches an instance');
      results.push({ name, status: 'passed', viewport });
    } catch (error) {
      results.push({ name, status: 'failed', message: error.message, viewport });
    } finally { await context.close(); }
  }
  await run('plans have no fabricated instance count in rows or work tooltips and remain previewable', async page => {
    const row = page.locator('.execution-form-selector-target');
    assert.match(await row.innerText(), /待工序开工/);
    assert.doesNotMatch(await row.innerText(), /共\s*0\s*份/);
    await row.click();
    const step = await workStep(page);
    assert.doesNotMatch(await step.getAttribute('title'), /共\s*\d+\s*份/);
    await step.click();
    assert.deepEqual(await page.evaluate(() => window.__selections), [{ id: 'configured' }, { id: 'work' }]);
    await screenshot(page, 'planned-work-desktop.png');
  });
  await run('actual counts and current actionable copy are retained with future work still uninstantiated', async page => {
    await fixture(page, { copies: { configured: group(['configured', 'configured:copy:2'], 'IN_PROGRESS') },
      workStates: { w: { status: 'RUNNING', active: ['s'] } } });
    assert.match(await page.locator('.execution-form-selector-target').innerText(), /共\s*2\s*份/);
    let step = await workStep(page);
    assert.doesNotMatch(await step.getAttribute('title'), /共\s*0\s*份/);
    await fixture(page, { copies: { work: group(['work', 'work:copy:2'], 'IN_PROGRESS') },
      workStates: { w: { status: 'RUNNING', active: ['entry'] } } });
    step = page.locator('.execution-work-step-target');
    assert.match(await step.getAttribute('title'), /共\s*2\s*份/);
    await step.click();
    assert.deepEqual(await page.evaluate(() => window.__selections), [{ id: 'work', instanceId: 'work' }]);
  });
  await run('completed work without a reached copy is not applicable including missing-copy-controls compatibility', async page => {
    await fixture(page, { operationStatus: 'COMPLETED', copies: { work: group([], 'NOT_APPLICABLE') },
      workStates: { w: { status: 'COMPLETED', active: [] } } });
    const step = await workStep(page);
    assert.match(await step.getAttribute('aria-label'), /不适用/);
    await fixture(page, { operationStatus: 'COMPLETED', workStates: { w: { status: 'COMPLETED', active: [] } } });
    assert.match(await step.getAttribute('aria-label'), /不适用/);
    assert.doesNotMatch(await step.getAttribute('title'), /共\s*0\s*份/);
    await screenshot(page, 'not-applicable-work-desktop.png');
  });
  await run('existing unfinished copies remain in progress after operation and work completion', async page => {
    await fixture(page, { operationStatus: 'COMPLETED', copies: { configured: group(['configured'], 'IN_PROGRESS'), work: group(['work'], 'IN_PROGRESS') },
      workStates: { w: { status: 'COMPLETED', active: [] } } });
    assert.match(await page.locator('.execution-form-selector-target').innerText(), /进行中/);
    const step = await workStep(page);
    assert.match(await step.getAttribute('aria-label'), /进行中/);
    assert.match(await step.getAttribute('title'), /共\s*1\s*份/);
  });
  await run('search and keyboard preview work in a narrow viewport while busy blocks selection', async page => {
    await page.getByRole('textbox', { name: '搜索表单', exact: true }).fill('不存在');
    await page.getByText('未找到匹配的表单或作业', { exact: true }).waitFor();
    await page.getByRole('textbox', { name: '搜索表单', exact: true }).fill('工序记录');
    const row = page.locator('.execution-form-selector-target');
    await row.focus(); await row.press('Enter');
    assert.deepEqual(await page.evaluate(() => window.__selections), [{ id: 'configured' }]);
    await fixture(page, { operationStatus: 'PENDING', busy: true });
    assert.equal(await row.isDisabled(), true);
    await fixture(page, { operationStatus: 'PENDING' });
    assert.equal(await row.isEnabled(), true);
    const bounds = await row.boundingBox();
    assert.ok(bounds && bounds.x >= 0 && bounds.x + bounds.width <= 390);
    await screenshot(page, 'planned-form-narrow.png');
  }, { width: 390, height: 844 });
  await run('quantity regression retains separate unit values in the source popover under the current grouped summary', async page => {
    const trigger = page.getByRole('button', { name: '累计产出：2 组（分物料/单位），查看来源明细', exact: true });
    await trigger.click();
    const detail = page.getByRole('dialog', { name: '累计产出明细', exact: true });
    await detail.waitFor();
    assert.match(await detail.innerText(), /10 根/);
    assert.match(await detail.innerText(), /12 件/);
    assert.doesNotMatch(await detail.innerText(), /22/);
    await page.getByRole('button', { name: '关闭数量明细', exact: true }).click();
    await detail.waitFor({ state: 'hidden' });
  }, { width: 1440, height: 960 }, true);
  const result = { kind: 'actual-selector-with-controlled-read-fixtures', baseline: baseline ?? null, results };
  if (process.env.W2_RESULT_PATH) await writeFile(process.env.W2_RESULT_PATH, JSON.stringify(result, null, 2) + '\n');
  console.log(JSON.stringify(result, null, 2));
  if (results.some(result => result.status === 'failed')) process.exitCode = 1;
} finally {
  if (browser) await browser.close();
  if (server) await new Promise(resolve => server.close(resolve));
  await rm(temporary, { recursive: true, force: true });
}
