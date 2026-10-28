import assert from 'node:assert/strict';
import { mkdtemp, readFile, writeFile, rm, mkdir } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';
import { build } from 'esbuild';

const { chromium } = createRequire(import.meta.url)('playwright');
const root = path.resolve(import.meta.dirname, '..');
const temp = await mkdtemp(path.join(os.tmpdir(), 'edhr-import-boundaries-'));
const artifacts = process.env.IMPORT_ARTIFACTS;
const baseline = process.env.IMPORT_BASELINE_COMMIT;
const width = Number(process.env.IMPORT_WIDTH || 1440);
if (baseline && !/^[a-f0-9]{40}$/.test(baseline)) throw new Error('Expected full baseline SHA');
const results = [];
let browser, server;

try {
  if (artifacts) await mkdir(artifacts, { recursive: true });
  await build({
    absWorkingDir: root,
    stdin: { resolveDir: root, loader: 'tsx', contents: `
      import React from 'react';
      import { createRoot } from 'react-dom/client';
      import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
      import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
      import { SnackbarProvider } from './src/components/SnackbarProvider';
      import Page from './src/pages/production/WorkOrderPage';
      const client = new QueryClient({ defaultOptions: { queries: { retry: false, staleTime: 30000 } } });
      createRoot(document.getElementById('root')).render(<ThemeProvider theme={createTheme()}><CssBaseline />
        <QueryClientProvider client={client}><SnackbarProvider><Page /></SnackbarProvider></QueryClientProvider>
      </ThemeProvider>);` },
    bundle: true, platform: 'browser', format: 'esm', outfile: path.join(temp, 'bundle.js'),
    alias: { '@': path.join(root, 'src') }, define: { 'process.env.NODE_ENV': '"production"' },
    plugins: baseline ? [{ name: 'baseline-page', setup(plugin) {
      plugin.onLoad({ filter: /\/WorkOrderPage\.tsx$/ }, ({ path: filename }) => ({
        contents: execFileSync('git', ['show', `${baseline}:gmp-platform/frontend/src/pages/production/WorkOrderPage.tsx`], { cwd: root, encoding: 'utf8' }),
        loader: 'tsx', resolveDir: path.dirname(filename),
      }));
    } }] : [],
  });
  await writeFile(path.join(temp, 'index.html'), '<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><body><div id="root"></div><script type="module" src="/bundle.js"></script></body></html>');
  server = http.createServer(async (request, response) => {
    const file = request.url === '/' ? 'index.html' : request.url.slice(1);
    if (!['index.html', 'bundle.js'].includes(file)) { response.writeHead(404).end(); return; }
    response.setHeader('Content-Type', file.endsWith('.js') ? 'text/javascript' : 'text/html; charset=utf-8');
    response.end(await readFile(path.join(temp, file)));
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  browser = await chromium.launch({ headless: true, executablePath: process.env.CHROME_PATH });

  const scenarios = [
    'decimal-equality', 'real-over-allocation', 'extra-precision', 'switch-order',
    'reopen-same-order', 'pending-list-change', 'process-change', 'same-context-delay',
    'read-failure-preserves-list', 'newer-import-wins', 'submission-invalidates-import',
  ];
  for (const name of scenarios) {
    const context = await browser.newContext({ viewport: { width, height: 1000 } });
    await context.addInitScript(() => {
      const original = File.prototype.arrayBuffer;
      window.qaHeldFiles = {};
      window.qaFinishedFiles = [];
      File.prototype.arrayBuffer = async function () {
        const bytes = await original.call(this);
        if (this.name.startsWith('held-')) {
          await new Promise((resolve, reject) => {
            window.qaHeldFiles[this.name] = {
              release: () => resolve(), fail: () => reject(new Error('fixture file read failed')),
            };
          });
        }
        return bytes;
      };
      window.qaReleaseImport = (filename, fail = false) => {
        const held = window.qaHeldFiles[filename];
        if (!held) throw new Error('No held file: ' + filename);
        if (fail) held.fail(); else held.release();
        window.qaFinishedFiles.push(filename);
      };
    });
    const page = await context.newPage();
    page.setDefaultTimeout(5000);
    const errors = [], posted = [];
    const plannedQuantity = ['decimal-equality', 'real-over-allocation', 'extra-precision'].includes(name) ? 0.3 : 10;
    const orders = ['100', '101'].map((id, index) => ({
      id, orderNo: `QA-ORDER-${index ? 'B' : 'A'}`, productId: '1', productName: '隔离验收产品', productCode: 'QA-1',
      productionMode: '量产', productionForm: 'BATCH', status: 'CREATED', plannedQuantity, allocatedQuantity: 0, hasObjects: false,
    }));
    const objects = { '100': [], '101': [] };
    page.on('pageerror', error => errors.push(error.message));
    await context.route('**/api/v1/**', async route => {
      const request = route.request(), pathname = new URL(request.url()).pathname;
      let data;
      if (request.method() === 'GET' && pathname === '/api/v1/production/work-orders') data = { content: orders, totalElements: 2, totalPages: 1 };
      else if (request.method() === 'GET' && pathname.endsWith('/process-options')) data = ['12', '13'].map((id, index) => ({
        id, version: `V${index + 1}`, productionMode: '量产', productionForm: 'BATCH',
        processReference: { ownerId: '1', ownerName: '隔离验收产品', ownerType: 'PRODUCT', processVersionId: id, processVersion: `V${index + 1}` },
      }));
      else if (request.method() === 'GET' && /\/work-orders\/(100|101)\/objects$/.test(pathname)) data = objects[pathname.split('/')[5]];
      else if (request.method() === 'GET' && pathname === '/api/v1/master-data/product-modeling/products') data = { content: [], totalElements: 0, totalPages: 0 };
      else if (request.method() === 'POST' && /\/work-orders\/(100|101)\/objects\/batch$/.test(pathname)) {
        const orderId = pathname.split('/')[5], body = request.postDataJSON();
        posted.push({ orderId, body });
        data = body.items.map((item, index) => ({ ...item, id: `${orderId}-${index}`, objectType: 'BATCH', status: 'CREATED', processVersion: item.processVersionId === '13' ? 'V2' : 'V1' }));
        objects[orderId] = data;
      } else { errors.push(`Unexpected HTTP ${request.method()} ${pathname}`); await route.abort(); return; }
      await route.fulfill({ json: { code: 200, data } });
    });

    const dialog = page.getByRole('dialog');
    const chooseProcess = async (version = 'V1') => {
      await dialog.getByRole('combobox', { name: '制程版本' }).click();
      await page.getByRole('option').filter({ hasText: `${version} ·` }).click();
    };
    const open = async (orderNo = 'QA-ORDER-A') => {
      await page.getByRole('row').filter({ has: page.getByText(orderNo, { exact: true }) }).getByRole('button', { name: '生产对象', exact: true }).click();
      await chooseProcess();
      await dialog.getByRole('tab', { name: '导入批次', exact: true }).click();
    };
    const upload = async (filename, csv) => {
      await dialog.getByRole('tab', { name: '导入批次', exact: true }).click();
      await dialog.locator('input[type=file]').setInputFiles({ name: filename, mimeType: 'text/csv', buffer: Buffer.from('\ufeff' + csv) });
      if (filename.startsWith('held-')) await page.waitForFunction(filename => Boolean(window.qaHeldFiles[filename]), filename);
    };
    const release = async (filename, fail = false) => {
      await page.evaluate(({ filename, fail }) => window.qaReleaseImport(filename, fail), { filename, fail });
      await page.waitForTimeout(150);
    };
    const assertPending = async (count, present = [], absent = []) => {
      await dialog.getByRole('tab', { name: `待提交（${count}）`, exact: true }).waitFor();
      await dialog.getByRole('tab', { name: `待提交（${count}）`, exact: true }).click();
      for (const text of present) assert.equal(await dialog.getByRole('cell', { name: text, exact: true }).count(), 1, `${text} must remain staged`);
      for (const text of absent) assert.equal(await dialog.getByRole('cell', { name: text, exact: true }).count(), 0, `${text} must not enter this draft`);
    };
    const manual = async (objectNo, quantity = '1') => {
      await dialog.getByRole('tab', { name: '手动添加', exact: true }).click();
      await dialog.getByRole('spinbutton', { name: '数量' }).fill(quantity);
      await dialog.getByRole('textbox', { name: '批次号（可选）' }).fill(objectNo);
      await dialog.getByRole('button', { name: '加入清单', exact: true }).click();
    };

    try {
      await page.goto(`http://127.0.0.1:${server.address().port}`);
      await open();
      if (name === 'decimal-equality') {
        await upload('decimal.csv', '批次号,数量\nDECIMAL-1,0.1\nDECIMAL-2,0.2');
        await assertPending(2, ['DECIMAL-1', 'DECIMAL-2']);
        await dialog.getByRole('button', { name: '提交批次（2）', exact: true }).click();
        await page.waitForFunction(() => [...document.querySelectorAll('button')].some(button => button.textContent === '提交批次（0）'));
        assert.deepEqual(posted.map(item => item.body.items.map(row => row.targetQuantity)), [[0.1, 0.2]]);
        assert.equal(posted[0].orderId, '100');
      } else if (name === 'real-over-allocation' || name === 'extra-precision') {
        await upload('invalid.csv', `批次号,数量\nINVALID,${name === 'real-over-allocation' ? '0.3001' : '0.10001'}`);
        await page.getByText(/导入失败/).waitFor();
        await assertPending(0, [], ['INVALID']);
        assert.equal(await dialog.getByRole('button', { name: '提交批次（0）', exact: true }).isDisabled(), true);
        assert.deepEqual(posted, []);
      } else if (name === 'switch-order' || name === 'reopen-same-order') {
        await upload('held-old.csv', '批次号,数量\nOLD-A,1');
        await dialog.getByRole('button', { name: '关闭', exact: true }).filter({ hasText: /^关闭$/ }).click();
        await open(name === 'switch-order' ? 'QA-ORDER-B' : 'QA-ORDER-A');
        await release('held-old.csv');
        await assertPending(0, [], ['OLD-A']);
        assert.deepEqual(posted, []);
      } else if (name === 'pending-list-change') {
        await upload('held-pending.csv', '批次号,数量\nOLD-A,1');
        await manual('CURRENT-DRAFT');
        await release('held-pending.csv');
        await assertPending(1, ['CURRENT-DRAFT'], ['OLD-A']);
        assert.deepEqual(posted, []);
      } else if (name === 'process-change') {
        await upload('held-process.csv', '批次号,数量\nOLD-A,1');
        await chooseProcess('V2');
        await release('held-process.csv');
        await assertPending(0, [], ['OLD-A']);
        assert.deepEqual(posted, []);
      } else if (name === 'same-context-delay') {
        await upload('held-current.csv', '批次号,数量\nCURRENT,1');
        await release('held-current.csv');
        await assertPending(1, ['CURRENT']);
        assert.deepEqual(posted, [], 'Import only stages; never automatically submit');
      } else if (name === 'read-failure-preserves-list') {
        await manual('PRESERVED');
        await upload('held-failure.csv', '批次号,数量\nNEVER-ADDED,1');
        await release('held-failure.csv', true);
        await page.getByText('fixture file read failed', { exact: true }).waitFor();
        await assertPending(1, ['PRESERVED'], ['NEVER-ADDED']);
        assert.deepEqual(posted, []);
      } else if (name === 'newer-import-wins') {
        await upload('held-first.csv', '批次号,数量\nOLD-FIRST,1');
        await upload('held-second.csv', '批次号,数量\nNEW-SECOND,1');
        await release('held-second.csv');
        await assertPending(1, ['NEW-SECOND']);
        await release('held-first.csv');
        await assertPending(1, ['NEW-SECOND'], ['OLD-FIRST']);
        assert.deepEqual(posted, []);
      } else if (name === 'submission-invalidates-import') {
        await manual('SUBMITTED-CURRENT');
        await upload('held-submit.csv', '批次号,数量\nOLD-UNSUBMITTED,1');
        await dialog.getByRole('button', { name: '提交批次（1）', exact: true }).click();
        await page.waitForFunction(() => [...document.querySelectorAll('button')].some(button => button.textContent === '提交批次（0）'));
        await release('held-submit.csv');
        await assertPending(0, [], ['OLD-UNSUBMITTED']);
        assert.deepEqual(posted.map(item => item.body.items.map(row => row.objectNo)), [['SUBMITTED-CURRENT']]);
      }
      assert.deepEqual(errors, []);
      results.push({ name, result: 'passed', posted });
    } catch (error) {
      results.push({ name, result: 'failed', message: error.message, errors, posted, pageText: (await page.locator('body').innerText()).slice(-4000) });
    } finally {
      if (artifacts) await page.screenshot({ path: path.join(artifacts, `${name}.png`), fullPage: true });
      await context.close();
    }
  }
} finally {
  if (browser) await browser.close();
  if (server) await new Promise(resolve => server.close(resolve));
  await rm(temp, { recursive: true, force: true });
}
console.log(JSON.stringify({ boundary: 'Real WorkOrderPage/React Query/client/Chromium; delayed File.arrayBuffer and fixture HTTP; no backend persistence', baseline: baseline || null, width, results }, null, 2));
if (results.some(result => result.result !== 'passed')) process.exitCode = 1;
