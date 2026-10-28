import assert from 'node:assert/strict';
import { mkdtemp, readFile, writeFile, rm, mkdir } from 'node:fs/promises';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';
import { build } from 'esbuild';
const { chromium } = createRequire(import.meta.url)('playwright');
const root = path.resolve(import.meta.dirname, '..');
const temp = await mkdtemp(path.join(os.tmpdir(), 'edhr-shared-pagination-'));
const artifacts = process.env.PAGINATION_ARTIFACTS;
const baseline = process.env.PAGINATION_BASELINE_COMMIT;
if (baseline && !/^[a-f0-9]{40}$/.test(baseline)) throw new Error('Expected full baseline SHA');
const results = [];
let server, browser;
try {
  if (artifacts) await mkdir(artifacts, { recursive: true });
  await build({ absWorkingDir: root, stdin: { resolveDir: root, loader: 'tsx', contents: `
    import React, { useState } from 'react';
    import { createRoot } from 'react-dom/client';
    import { QueryClient, QueryClientProvider, useQuery, keepPreviousData } from '@tanstack/react-query';
    import { MemoryRouter } from 'react-router-dom';
    import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
    import { SnackbarProvider } from './src/components/SnackbarProvider';
    import { FormListPagination } from './src/pages/form-management/formManagementListStyles';
    import Icons from './src/pages/system/IconManagementPage';
    import Equipment from './src/pages/master-data/EquipmentPage';
    const client = new QueryClient({ defaultOptions: { queries: { retry: false, staleTime: 30000 } } });
    window.qaQueryClient = client;
    function Shared() {
      const [page, setPage] = useState(0), [size, setSize] = useState(20);
      const query = useQuery({ queryKey: ['shared-pagination', page, size], placeholderData: keepPreviousData,
        queryFn: async () => { const response = await fetch('/api/v1/qa/paged?page=' + page); if (!response.ok) throw new Error('fixture failure'); return (await response.json()).data; } });
      return <><div>{query.isError ? '请求失败' : query.data?.content[0]?.name}</div><FormListPagination
        dataReady={query.isSuccess && !query.isFetching && !query.isPlaceholderData} page={page} pageSize={size}
        totalElements={query.data?.totalElements ?? 0} totalPages={query.data?.totalPages ?? 0} onPageChange={setPage}
        onPageSizeChange={next => { setSize(next); setPage(0); }} /></>;
    }
    const Page = location.search.includes('icons') ? Icons : location.search.includes('equipment') ? Equipment : Shared;
    createRoot(document.getElementById('root')).render(<ThemeProvider theme={createTheme()}><CssBaseline /><MemoryRouter>
      <QueryClientProvider client={client}><SnackbarProvider><Page /></SnackbarProvider></QueryClientProvider>
    </MemoryRouter></ThemeProvider>);` }, bundle: true, platform: 'browser', format: 'esm', outfile: path.join(temp, 'bundle.js'), alias: { '@': path.join(root, 'src') }, define: { 'process.env.NODE_ENV': '"production"' },
    plugins: baseline ? [{ name: 'baseline-icon-page', setup(plugin) {
      plugin.onLoad({ filter: /\/IconManagementPage\.tsx$/ }, ({ path: filename }) => ({
        contents: execFileSync('git', ['show', `${baseline}:gmp-platform/frontend/src/pages/system/IconManagementPage.tsx`], { cwd: root, encoding: 'utf8' }),
        loader: 'tsx', resolveDir: path.dirname(filename),
      }));
    } }] : [] });
  await writeFile(path.join(temp, 'index.html'), '<!doctype html><html><body><div id="root"></div><script type="module" src="/bundle.js"></script></body></html>');
  server = http.createServer(async (request, response) => {
    const pathname = new URL(request.url, 'http://localhost').pathname;
    const file = pathname === '/' ? 'index.html' : pathname.slice(1);
    if (!['index.html', 'bundle.js'].includes(file)) { response.writeHead(404).end(); return; }
    response.setHeader('Content-Type', file.endsWith('.js') ? 'text/javascript' : 'text/html; charset=utf-8');
    response.end(await readFile(path.join(temp, file)));
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  browser = await chromium.launch({ headless: true, executablePath: process.env.CHROME_PATH });
  for (const kind of ['shared', 'icons', 'equipment']) {
    const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
    const page = await context.newPage(); page.setDefaultTimeout(8000);
    const errors = [], requests = [], writes = [];
    let totalPages = 4, failPage = 0;
    page.on('pageerror', error => errors.push(error.message));
    const listPath = kind === 'shared' ? '/api/v1/qa/paged' : kind === 'icons' ? '/api/v1/system/icons' : '/api/v1/master-data/equipment';
    await context.route('**/api/v1/**', async route => {
      const url = new URL(route.request().url());
      if (route.request().method() !== 'GET') {
        writes.push({ path: url.pathname, body: route.request().postDataJSON() });
        await route.fulfill({ json: { code: 200, data: [] } });
        return;
      }
      if (url.pathname === listPath) {
        const group = url.searchParams.get('groupId');
        const number = Number(url.searchParams.get('page')) + (kind === 'shared' ? 1 : 0);
        requests.push(number);
        await new Promise(resolve => setTimeout(resolve, 400));
        if (number === failPage || group === '103') { await route.fulfill({ status: 503, json: { code: 503, message: '分页验收故障' } }); return; }
        const row = { id: String(number), name: `PAGE-${number}`, code: `PAGE-${number}`, status: 'ACTIVE', format: 'SVG', svgContent: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><path d="M1 1h8v8H1z"/></svg>' };
        const content = group === '101' ? ['201', '202'].map((id, index) => ({ ...row, id, groupId: '101', name: `A图标${index + 1}` })) : group === '102' ? [] : number <= totalPages ? [row] : [];
        await route.fulfill({ json: { code: 200, data: { content, totalPages, totalElements: totalPages * 20 } } });
      } else if (url.pathname === '/api/v1/system/icon-groups') {
        await route.fulfill({ json: { code: 200, data: [{ id: '101', name: '组A' }, { id: '102', name: '组B' }, { id: '103', name: '失败组' }] } });
      } else if (url.pathname === '/api/v1/master-data/equipment/types') {
        await route.fulfill({ json: { code: 200, data: { content: [], totalPages: 0, totalElements: 0 } } });
      } else { errors.push(`Unexpected HTTP ${url.pathname}`); await route.abort(); }
    });
    const active = () => page.locator('button[aria-current]').innerText();
    try {
      await page.goto(`http://127.0.0.1:${server.address().port}/?${kind}`);
      await page.getByRole('button', { name: 'Go to page 2', exact: true }).click();
      await page.waitForTimeout(100);
      assert.equal(await active(), '2', 'Pending HTTP must retain the target page');
      await page.waitForTimeout(450);
      assert.equal(await active(), '2');
      assert(await page.getByRole('button', { name: 'Go to page 4', exact: true }).isVisible());
      failPage = 3;
      await page.getByRole('button', { name: 'Go to page 3', exact: true }).click();
      await page.waitForTimeout(500);
      assert.equal(await active(), '3', 'Failed HTTP must retain the target page');
      failPage = 0;
      await page.getByRole('button', { name: 'Go to page 2', exact: true }).click();
      assert.equal(await active(), '2');
      {
        totalPages = 1;
        await page.evaluate(() => { void window.qaQueryClient.invalidateQueries(); });
        await page.waitForTimeout(100);
        assert.equal(await active(), '2', 'Old range must not clamp the page during refresh');
        await page.waitForFunction(() => document.querySelector('button[aria-current]')?.textContent === '1');
      }
      if (kind === 'icons') {
        await page.getByRole('button', { name: '组A', exact: true }).click();
        await page.getByText('A图标1', { exact: true }).waitFor();
        await page.getByRole('button', { name: '组B', exact: true }).click();
        await page.waitForTimeout(100);
        const oldIcon = page.getByText('A图标1', { exact: true });
        if (await oldIcon.isVisible()) {
          const transfer = await page.evaluateHandle(() => new DataTransfer());
          await page.locator('[draggable="true"]').filter({ has: oldIcon }).dispatchEvent('dragstart', { dataTransfer: transfer });
          await page.locator('[draggable="true"]').filter({ has: page.getByText('A图标2', { exact: true }) }).dispatchEvent('drop', { dataTransfer: transfer });
          await page.waitForTimeout(50);
        }
        assert.deepEqual(writes, [], 'Changing group must not reorder old icons into the new group');
        assert.equal(await oldIcon.count(), 0, 'Pending group response must not display another group’s icons');
        await page.waitForTimeout(450);
        await page.getByRole('button', { name: '组A', exact: true }).click();
        await oldIcon.waitFor();
        await page.getByRole('button', { name: '失败组', exact: true }).click();
        await page.waitForTimeout(100);
        assert.equal(await oldIcon.count(), 0);
        await page.getByText('图标加载失败，请刷新后重试', { exact: true }).waitFor();
        assert.equal(await oldIcon.count(), 0, 'Failed group response must not restore another group’s icons');
      }
      assert.deepEqual(errors, []);
      results.push({ kind, result: 'passed', requests, checks: 'delayed/failed/cached pagination and successful shrink on all three; icon group isolation during delay/failure and no cross-group reorder' });
    } catch (error) { results.push({ kind, result: 'failed', message: error.message, requests, errors }); }
    finally { if (artifacts) await page.screenshot({ path: path.join(artifacts, `${kind}.png`), fullPage: true }); await context.close(); }
  }
} finally {
  if (browser) await browser.close();
  if (server) await new Promise(resolve => server.close(resolve));
  await rm(temp, { recursive: true, force: true });
}
console.log(JSON.stringify({ boundary: 'real shared component and pages; delayed fixture HTTP, no backend writes', results }, null, 2));
if (results.some(result => result.result !== 'passed')) process.exitCode = 1;
