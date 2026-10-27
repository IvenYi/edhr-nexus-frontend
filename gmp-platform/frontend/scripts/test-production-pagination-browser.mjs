import assert from 'node:assert/strict';
import { mkdtemp, readFile, writeFile, rm, mkdir } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';
import { build } from 'esbuild';
const { chromium } = createRequire(import.meta.url)('playwright');

// Real pages and React Query; delayed fixture HTTP does not write business data.
const root = path.resolve(import.meta.dirname, '..');
const temp = await mkdtemp(path.join(os.tmpdir(), 'edhr-pagination-'));
const artifacts = process.env.PAGINATION_ARTIFACTS;
const baseline = process.env.PAGINATION_BASELINE;
if (baseline && !/^[a-f0-9]{40}$/.test(baseline)) throw new Error('Expected full baseline SHA');
const results = [];
let server, browser;
try {
  if (artifacts) await mkdir(artifacts, { recursive: true });
  await build({
    absWorkingDir: root,
    stdin: { resolveDir: root, loader: 'tsx', contents: `
      import React from 'react';
      import { createRoot } from 'react-dom/client';
      import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
      import { MemoryRouter } from 'react-router-dom';
      import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
      import { SnackbarProvider } from './src/components/SnackbarProvider';
      import Batches from './src/pages/production/BatchManagementPage';
      import Orders from './src/pages/production/WorkOrderPage';
      const client = new QueryClient({defaultOptions:{queries:{retry:false,staleTime:30000}}});
      window.qaQueryClient = client;
      const Page = location.search.includes('orders') ? Orders : Batches;
      createRoot(document.getElementById('root')).render(<ThemeProvider theme={createTheme()}><CssBaseline />
        <MemoryRouter><QueryClientProvider client={client}><SnackbarProvider><Page /></SnackbarProvider></QueryClientProvider></MemoryRouter>
      </ThemeProvider>);` },
    bundle: true, platform: 'browser', format: 'esm', outfile: path.join(temp, 'bundle.js'),
    alias: { '@': path.join(root, 'src') }, define: { 'process.env.NODE_ENV': '"production"' },
    plugins: baseline ? [{ name: 'baseline-pages', setup(plugin) {
      plugin.onLoad({ filter: /\/(BatchManagementPage|WorkOrderPage)\.tsx$/ }, ({ path: filename }) => ({
        contents: execFileSync('git', ['show', `${baseline}:${path.relative(path.resolve(root, '../..'), filename)}`], { cwd: root, encoding: 'utf8' }),
        loader: 'tsx', resolveDir: path.dirname(filename),
      }));
    } }] : [],
  });
  await writeFile(path.join(temp, 'index.html'), '<!doctype html><html lang="zh-CN"><meta charset="utf-8"><body><div id="root"></div><script type="module" src="/bundle.js"></script></body></html>');
  server = http.createServer(async (request, response) => {
    const pathname = new URL(request.url, 'http://localhost').pathname;
    const file = pathname === '/' ? 'index.html' : pathname.slice(1);
    if (!['index.html', 'bundle.js'].includes(file)) { response.writeHead(404).end(); return; }
    response.setHeader('Content-Type', file.endsWith('.js') ? 'text/javascript' : 'text/html; charset=utf-8');
    response.end(await readFile(path.join(temp, file)));
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  browser = await chromium.launch({ headless: true, executablePath: process.env.CHROME_PATH });
  for (const kind of ['batches', 'orders']) {
    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
    const page = await context.newPage();
    page.setDefaultTimeout(8000);
    const requests = [], errors = [];
    let totalPages = 4, failPage = 0;
    page.on('pageerror', error => errors.push(error.message));
    const listPath = `/api/v1/production/${kind === 'orders' ? 'work-orders' : 'batches'}`;
    await context.route('**/api/v1/**', async route => {
      const url = new URL(route.request().url());
      if (url.pathname === listPath) {
        const number = Number(url.searchParams.get('page'));
        requests.push({ page: number, keyword: url.searchParams.get('keyword'), size: url.searchParams.get('size') });
        await new Promise(resolve => setTimeout(resolve, number === 2 ? 450 : 180));
        if (number === failPage) { await route.fulfill({ status: 503, json: { code: 503, message: '分页验收故障' } }); return; }
        const record = { id: String(number), objectNo: `BATCH-PAGE-${number}`, orderNo: `ORDER-PAGE-${number}`, workOrderNo: 'QA-ORDER', workOrderId: '10', productId: '1', productName: '分页验收产品', productCode: 'QA-1', processVersion: 'V1.0', processVersionId: '12', productionForm: 'BATCH', objectType: 'BATCH', status: 'IN_PROGRESS', targetQuantity: 1, plannedQuantity: 80, allocatedQuantity: 1, hasObjects: true };
        await route.fulfill({ json: { code: 200, data: { content: number <= totalPages ? [record] : [], totalPages, totalElements: totalPages * 20 } } });
      } else if (url.pathname === '/api/v1/audit/logs') {
        const processReference = { ownerType: 'PRODUCT', ownerId: '1', ownerName: '历史制程产品', processVersionId: '12', processVersion: 'V1.0' };
        const records = [
          { id: 'start', action: 'UPDATE', operatorDisplayName: '验收员', contentBefore: JSON.stringify({ status: 'CREATED' }), contentAfter: JSON.stringify({ status: 'IN_PROGRESS', processReference, processSnapshot: { processReference, recipe: { marker: 'FROZEN-20261027-A' } }, processFrozenAt: '2026-10-27T10:00:00' }) },
          { id: 'create', action: 'CREATE', operatorDisplayName: '验收员', contentAfter: JSON.stringify({ status: 'CREATED', processReference }) },
        ];
        await route.fulfill({ json: { code: 200, data: { content: records, totalPages: 1, totalElements: 2 } } });
      } else if (url.pathname === '/api/v1/master-data/product-modeling/products') {
        await route.fulfill({ json: { code: 200, data: { content: [], totalPages: 0, totalElements: 0 } } });
      } else { errors.push(`Unexpected HTTP ${url.pathname}`); await route.abort(); }
    });
    const activePage = () => page.locator('button[aria-current]').innerText();
    const go = number => page.getByRole('button', { name: `Go to page ${number}`, exact: true }).click();
    const row = number => page.locator(`tr[data-record-id="${number}"]`).waitFor();
    try {
      await page.goto(`http://127.0.0.1:${server.address().port}/?${kind}`);
      await row(1);
      await go(2);
      await page.waitForTimeout(100);
      assert.equal(await activePage(), '2', 'Uncached page must remain selected while HTTP is pending');
      await row(2);
      assert.equal(await activePage(), '2');
      await go(1); await row(1);
      await go(2); await row(2);
      assert.equal(await activePage(), '2', 'Cached page must remain selected');
      await go(1); await row(1);
      await page.evaluate(() => window.qaQueryClient.removeQueries({ predicate: query => query.queryKey[1] === 2 }));
      await go(2); await go(3); await row(3);
      await page.waitForTimeout(500);
      assert.equal(await activePage(), '3', 'Late response must not replace the selected page');
      failPage = 4;
      await go(4);
      await page.getByText(/数据加载失败/).waitFor();
      assert.equal(await activePage(), '4', 'Failed HTTP must not reset the selected page');
      failPage = 0;
      await go(3); await row(3);
      totalPages = 1;
      await page.evaluate(() => { void window.qaQueryClient.invalidateQueries(); });
      await row(1);
      assert.equal(await activePage(), '1', 'A successful reduced page count must clamp the page');
      totalPages = 4;
      await page.evaluate(() => { void window.qaQueryClient.invalidateQueries(); });
      await page.getByRole('button', { name: 'Go to page 2', exact: true }).waitFor();
      await go(2); await row(2);
      await page.getByRole('textbox').first().fill('新筛选');
      await page.getByRole('button', { name: '查询', exact: true }).click();
      await row(1);
      assert.equal(await activePage(), '1');
      assert(requests.some(request => request.page === 1 && request.keyword === '新筛选'));
      await go(2); await row(2);
      await page.getByRole('combobox', { name: '每页条数' }).click();
      await page.getByRole('option', { name: '50 条/页', exact: true }).click();
      await row(1);
      assert.equal(await activePage(), '1');
      assert(requests.some(request => request.page === 1 && request.size === '50'));
      if (kind === 'batches' && !baseline) {
        await page.locator('tr[data-record-id="1"]').click();
        await page.getByRole('tab', { name: '数据审计', exact: true }).click();
        await page.getByRole('button', { name: /验收员 修改\s*开工/ }).click();
        assert.equal(await page.getByText(/未开工时仅记录制程引用/).count(), 0);
        const details = page.getByRole('button', { name: '查看制程冻结快照', exact: true });
        assert.equal(await details.count(), 1);
        assert.match(await details.locator('..').innerText(), /历史制程产品.*V1.0/);
        await details.click();
        const snapshot = page.getByRole('dialog');
        assert.match(await snapshot.innerText(), /FROZEN-20261027-A/);
        await snapshot.getByText('关闭', { exact: true }).click();
        await page.getByRole('button', { name: /验收员 新增/ }).click();
        const created = page.locator('.MuiAccordion-root').filter({ has: page.getByRole('button', { name: /验收员 新增/ }) });
        assert.equal(await created.getByRole('button', { name: '查看制程冻结快照' }).count(), 0);
      }
      assert.deepEqual(errors, []);
      results.push({ kind, result: 'passed', requests, checks: 'uncached/cached/delayed/racing/failed/shrinking/filter/page-size; batch historical snapshot action and reference details' });
    } catch (error) {
      results.push({ kind, result: 'failed', message: error.message, requests, errors });
    } finally {
      if (artifacts) await page.screenshot({ path: path.join(artifacts, `${kind}.png`), fullPage: true });
      await context.close();
    }
  }
} finally {
  if (browser) await browser.close();
  if (server) await new Promise(resolve => server.close(resolve));
  await rm(temp, { recursive: true, force: true });
}
console.log(JSON.stringify({ baseline: baseline || null, boundary: 'real Chromium pages with delayed fixture HTTP; no backend writes', results }, null, 2));
if (results.some(result => result.result !== 'passed')) process.exitCode = 1;
