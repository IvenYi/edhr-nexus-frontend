import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { build } from 'esbuild';
const { chromium } = createRequire(import.meta.url)('playwright');

// Actual Shell, CanvasTab, MUI and Zustand in Chromium. Saving and catalog APIs
// are controlled fixtures; this does not write a real backend or database.
const root = path.resolve(import.meta.dirname, '..');
const temporary = await mkdtemp(path.join(os.tmpdir(), 'edhr-w2-save-browser-'));
const baseline = process.env.W2_BASELINE_COMMIT;
if (baseline && !/^[0-9a-f]{40}$/.test(baseline)) throw new Error('W2_BASELINE_COMMIT must be a full commit SHA');
const results = [];
let server, browser;
try {
  await build({ absWorkingDir: root, stdin: { resolveDir: root, loader: 'tsx', contents: `
    import React, { useState } from 'react';
    import { createRoot } from 'react-dom/client';
    import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
    import { createTheme, ThemeProvider, CssBaseline } from '@mui/material';
    import Shell from './src/pages/master-data/template-designer-react/TemplateDesignerReactShell';
    import { useTemplateDesignerStore as store } from './src/pages/master-data/template-designer-react/store/useTemplateDesignerStore';
    import { createEmptyTemplateDesignerDocument, serializeTemplateDesignerDocument } from './src/pages/master-data/template-designer-react/utils/document';
    import { SnackbarProvider, useSnackbar } from './src/components/SnackbarProvider';
    const row = { id: 'qa-template', name: '保存一致性验收' };
    const initial = createEmptyTemplateDesignerDocument({ schema: 'edhr-template-designer-react', version: 1,
      templateId: row.id, versionId: 'qa-version', templateName: row.name, versionLabel: 'V1.0' });
    const version = { id: 'qa-version', version: 'V1.0', ...serializeTemplateDesignerDocument(initial) };
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    window.__store = store; window.__requests = []; window.__closed = 0;
    function App() {
      const [saving, setSaving] = useState(false);
      const [open, setOpen] = useState(true);
      const { showMessage } = useSnackbar();
      const persist = async payload => {
        setSaving(true);
        try {
          await new Promise((resolve, reject) => window.__requests.push({ payload, resolve, reject }));
          showMessage('设计已保存', 'success');
        } catch (error) { showMessage('设计保存失败', 'error'); throw error; }
        finally { setSaving(false); }
      };
      return open ? <Shell row={row} version={version} saving={saving} onSave={persist} onAutoSave={persist}
        onClose={() => { window.__closed += 1; setOpen(false); }} /> : <div>设计器已关闭</div>;
    }
    createRoot(document.getElementById('root')).render(<ThemeProvider theme={createTheme()}><CssBaseline />
      <QueryClientProvider client={client}><SnackbarProvider><App /></SnackbarProvider></QueryClientProvider>
    </ThemeProvider>);
  ` }, bundle: true, platform: 'browser', format: 'esm', outfile: path.join(temporary, 'bundle.js'),
  // Resolve the installed icons' actual ESM distribution, as Vite does.
  alias: { '@': path.join(root, 'src'), '@mui/icons-material': path.join(root, 'node_modules/@mui/icons-material/esm') },
  loader: { '.css': 'css', '.svg': 'dataurl', '.png': 'dataurl', '.woff2': 'file', '.ttf': 'file' },
  define: { 'process.env.NODE_ENV': '"development"' },
  plugins: baseline ? [{ name: 'original-save-owners', setup(plugin) {
    plugin.onLoad({ filter: /(?:TemplateDesignerReactShell\.tsx|useTemplateDesignerStore\.ts)$/ }, args => ({
      contents: execFileSync('git', ['show', `${baseline}:${path.relative(root, args.path).split(path.sep).join('/')}`.replace(`${baseline}:src/`, `${baseline}:gmp-platform/frontend/src/`)], { cwd: root, encoding: 'utf8' }),
      loader: args.path.endsWith('.tsx') ? 'tsx' : 'ts', resolveDir: path.dirname(args.path),
    }));
  } }] : [], logLevel: 'silent' });
  await writeFile(path.join(temporary, 'index.html'), '<!doctype html><html lang="zh-CN"><meta charset="UTF-8"><title>表单保存隔离验收</title><link rel="stylesheet" href="/bundle.css"><style>html,body,#root{height:100%;margin:0}</style><div id="root"></div><script type="module" src="/bundle.js"></script></html>');
  server = http.createServer(async (request, response) => {
    const name = new URL(request.url, 'http://localhost').pathname === '/' ? 'index.html' : request.url.slice(1);
    if (!['index.html', 'bundle.js', 'bundle.css'].includes(name)) { response.writeHead(404); response.end(); return; }
    response.setHeader('Content-Type', name.endsWith('.js') ? 'text/javascript' : name.endsWith('.css') ? 'text/css' : 'text/html; charset=utf-8');
    response.end(await readFile(path.join(temporary, name)));
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  browser = await chromium.launch({ headless: true, executablePath: process.env.CHROME_PATH });
  const save = page => page.getByRole('button', { name: '保存', exact: true });
  const dirty = page => page.evaluate(() => window.__store.getState().isDirty());
  async function edit(page, value) {
    const cell = page.locator('[data-projection-canvas="true"] [data-sheet-cell-row="1"][data-sheet-cell-col="1"]').first();
    await cell.click();
    await cell.press('F2');
    await page.locator('[data-sheet-cell-editor="true"] textarea:visible').fill(value);
    await page.getByRole('button', { name: '表单设计', exact: true }).click();
    await page.waitForFunction(expected => window.__store.getState().document.canvas.pages[0].cells['1:1']?.value === expected, value);
  }
  async function submit(page, count) {
    await save(page).click();
    await page.waitForFunction(expected => window.__requests.length === expected, count);
    assert.equal(await save(page).isEnabled(), false, 'in-flight save prevents a duplicate main save');
  }
  async function settle(page, index, success = true) {
    await page.evaluate(({ index, success }) => {
      const request = window.__requests[index];
      if (success) request.resolve(); else request.reject(new Error('isolated save failure'));
    }, { index, success });
    await page.waitForFunction(() => [...document.querySelectorAll('button')].some(button => button.textContent.trim() === '保存' && !button.disabled));
    const toast = page.getByRole('alert');
    if (await toast.count()) {
      await toast.getByRole('button').click();
      await toast.waitFor({ state: 'hidden' });
    }
  }
  async function run(name, check, viewport = { width: 1440, height: 960 }) {
    if (process.env.W2_CASE_FILTER && !name.includes(process.env.W2_CASE_FILTER)) return;
    const context = await browser.newContext({ viewport });
    await context.route('**/api/v1/**', async route => {
      assert.equal(route.request().method(), 'GET', 'catalog fixtures cannot write business data');
      await route.fulfill({ status: 200, json: { code: 200, data: { version: 'form-projection-v1', models: [], notice: '' } } });
    });
    const page = await context.newPage();
    page.setDefaultTimeout(15000);
    const errors = []; page.on('pageerror', error => errors.push(error.message));
    page.on('console', message => { if (message.type() === 'error') console.error(message.text()); });
    try {
      await page.goto(`http://127.0.0.1:${server.address().port}`);
      await page.getByRole('button', { name: '关闭侧边栏', exact: true }).click();
      await check(page);
      assert.deepEqual(errors, [], 'no browser runtime errors');
      results.push({ name, status: 'passed', viewport });
    } catch (error) {
      const state = await page.evaluate(() => {
        const current = window.__store?.getState();
        return { selectedCell: current?.selectedCell, sheet: current?.document?.canvas.pages[0].sheet,
          editorMarkup: [...document.querySelectorAll('[data-sheet-cell-editor]')].map(element => element.outerHTML.slice(0,1500)) };
      });
      throw new Error(`${error.message}\nBrowser errors: ${JSON.stringify(errors)}\nState: ${JSON.stringify(state)}\nPage text: ${(await page.locator('body').innerText()).slice(0,2000)}`, { cause: error });
    } finally { await context.close(); }
  }
  await run('edits during save remain unsaved and closing asks for confirmation', async page => {
    await edit(page, '已发送A'); await submit(page, 1);
    await edit(page, '尚未发送B'); await settle(page, 0);
    const payload = await page.evaluate(() => window.__requests[0].payload);
    assert.equal(JSON.parse(payload.canvasDesignJson).payload.pages[0].cells['1:1'].value, '已发送A');
    await page.getByRole('button', { name: '关闭', exact: true }).click();
    assert.equal(await page.evaluate(() => window.__closed), 0, 'unsent B must not close without a warning');
    await page.getByRole('dialog').getByText('当前修改尚未保存', { exact: true }).waitFor();
    if (process.env.W2_SCREENSHOT_DIR) {
      await mkdir(process.env.W2_SCREENSHOT_DIR, { recursive: true });
      await page.screenshot({ path: path.join(process.env.W2_SCREENSHOT_DIR, 'save-in-flight-desktop.png'), animations: 'disabled' });
    }
    await page.getByRole('button', { name: '继续编辑', exact: true }).press('Enter');
    assert.equal(await dirty(page), true);
    await submit(page, 2); await settle(page, 1);
    assert.equal(await dirty(page), false);
    const second = await page.evaluate(() => window.__requests[1].payload);
    assert.equal(JSON.parse(second.canvasDesignJson).payload.pages[0].cells['1:1'].value, '尚未发送B');
    await page.getByRole('button', { name: '关闭', exact: true }).click();
    assert.equal(await page.evaluate(() => window.__closed), 1);
  });
  await run('successful save without later edits allows closing', async page => {
    await edit(page, '本次已保存'); await submit(page, 1); await settle(page, 0);
    assert.equal(await dirty(page), false);
    await page.getByRole('button', { name: '关闭', exact: true }).click();
    assert.equal(await page.evaluate(() => window.__closed), 1);
  });
  await run('failed save preserves unsaved content and retry can save it', async page => {
    await edit(page, '失败后仍保留'); await submit(page, 1); await settle(page, 0, false);
    assert.equal(await dirty(page), true);
    await page.getByRole('button', { name: '关闭', exact: true }).click();
    await page.getByRole('dialog').getByText('当前修改尚未保存', { exact: true }).waitFor();
    await page.getByRole('button', { name: '继续编辑', exact: true }).click();
    await submit(page, 2); await settle(page, 1);
    assert.equal(await dirty(page), false);
  });
  await run('undo and redo retain the correct successful-save boundary', async page => {
    await edit(page, 'A'); await submit(page, 1); await edit(page, 'B'); await settle(page, 0);
    await page.getByRole('button', { name: '撤销', exact: true }).click();
    assert.equal(await dirty(page), false);
    await page.getByRole('button', { name: '重做', exact: true }).click();
    assert.equal(await dirty(page), true);
  });
  await run('narrow viewport retains keyboard access to the unsaved warning', async page => {
    await edit(page, 'A'); await submit(page, 1); await edit(page, 'B'); await settle(page, 0);
    await page.getByRole('button', { name: '关闭', exact: true }).click();
    await page.getByRole('dialog').getByText('当前修改尚未保存', { exact: true }).waitFor();
    const continueEditing = page.getByRole('button', { name: '继续编辑', exact: true });
    await continueEditing.focus();
    const bounds = await continueEditing.boundingBox();
    assert.ok(bounds && bounds.x >= 0 && bounds.x + bounds.width <= 390);
    if (process.env.W2_SCREENSHOT_DIR) await page.screenshot({ path: path.join(process.env.W2_SCREENSHOT_DIR, 'save-in-flight-narrow.png'), animations: 'disabled' });
    await continueEditing.press('Enter');
    assert.equal(await dirty(page), true);
  }, { width: 390, height: 844 });
  const result = { kind: 'actual-shell-and-canvas-with-controlled-save-callback', baseline: baseline ?? null, results };
  if (process.env.W2_RESULT_PATH) await writeFile(process.env.W2_RESULT_PATH, JSON.stringify(result, null, 2) + '\n');
  console.log(JSON.stringify(result, null, 2));
} finally {
  if (browser) await browser.close();
  if (server) await new Promise(resolve => server.close(resolve));
  await rm(temporary, { recursive: true, force: true });
}
