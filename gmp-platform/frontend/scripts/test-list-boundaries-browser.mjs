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
const temp = await mkdtemp(path.join(os.tmpdir(), 'edhr-list-boundaries-'));
const artifacts = process.env.LIST_ARTIFACTS;
const baseline = process.env.LIST_BASELINE_COMMIT;
const width = Number(process.env.LIST_WIDTH || 1440);
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
      import { MemoryRouter } from 'react-router-dom';
      import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
      import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
      import { SnackbarProvider } from './src/components/SnackbarProvider';
      import Dictionaries from './src/pages/system/BusinessDictionaryPage';
      import Processes from './src/pages/master-data/ProcessModelingPage';
      import Templates from './src/pages/master-data/TemplateModelingPage';
      const client = new QueryClient({ defaultOptions: { queries: { retry: false, staleTime: 30000 } } });
      window.qaQueryClient = client;
      const kind = new URLSearchParams(location.search).get('kind');
      const page = kind === 'dictionary' ? <Dictionaries /> : kind === 'operations' ? <Processes pageKey="operations" /> : <Templates pageKey="formTemplates" />;
      createRoot(document.getElementById('root')).render(<ThemeProvider theme={createTheme()}><CssBaseline /><MemoryRouter>
        <QueryClientProvider client={client}><SnackbarProvider>{page}</SnackbarProvider></QueryClientProvider>
      </MemoryRouter></ThemeProvider>);` },
    bundle: true, platform: 'browser', format: 'esm', outfile: path.join(temp, 'bundle.js'),
    alias: { '@': path.join(root, 'src'), '@mui/icons-material': path.join(root, 'node_modules/@mui/icons-material/esm') }, define: { 'process.env.NODE_ENV': '"production"' },
    plugins: baseline ? [{ name: 'fixed-baseline-pages', setup(plugin) {
      plugin.onLoad({ filter: /\/(BusinessDictionaryPage|ProcessModelingPage|TemplateModelingPage)\.tsx$/ }, ({ path: filename }) => ({
        contents: execFileSync('git', ['show', `${baseline}:gmp-platform/frontend/${path.relative(root, filename)}`], { cwd: root, encoding: 'utf8' }),
        loader: 'tsx', resolveDir: path.dirname(filename),
      }));
    } }] : [],
  });
  await writeFile(path.join(temp, 'index.html'), '<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><body><div id="root"></div><script type="module" src="/bundle.js"></script></body></html>');
  server = http.createServer(async (request, response) => {
    const pathname = new URL(request.url, 'http://localhost').pathname;
    const file = pathname === '/' ? 'index.html' : pathname.slice(1);
    if (!['index.html', 'bundle.js'].includes(file)) { response.writeHead(404).end(); return; }
    response.setHeader('Content-Type', file.endsWith('.js') ? 'text/javascript' : 'text/html; charset=utf-8');
    response.end(await readFile(path.join(temp, file)));
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  browser = await chromium.launch({ headless: true, executablePath: process.env.CHROME_PATH });

  const scenarios = [
    ['dictionary', 'parent-delete'], ['dictionary', 'item-delete'], ['dictionary', 'automatic-parent-change'],
    ['operations', 'delete-last-page'], ['templates', 'delete-last-page'],
    ...['dictionary', 'operations', 'templates'].map(kind => [kind, 'pending-error-cache']),
    ...['dictionary', 'operations', 'templates'].map(kind => [kind, 'empty-zero-pages']),
  ];
  const selectedCases = process.env.LIST_CASES?.split(',');
  for (const [kind, scenario] of scenarios) {
    const name = `${kind}-${scenario}`;
    if (selectedCases && !selectedCases.includes(name)) continue;
    const context = await browser.newContext({ viewport: { width, height: 1000 } });
    const page = await context.newPage();
    page.setDefaultTimeout(5000);
    const errors = [], requests = [], writes = [];
    let failPage = 0, delay = 220;
    const empty = scenario === 'empty-zero-pages';
    const dictionaryHasItems = ['item-delete', 'automatic-parent-change'].includes(scenario);
    const dictionaryCount = scenario === 'item-delete' ? 1 : 21;
    let dictionaries = Array.from({ length: empty ? 0 : dictionaryCount }, (_, index) => ({
      id: String(1001 + index), code: `DICT-CODE-${String(index + 1).padStart(2, '0')}`,
      name: index === 20 ? 'DICT-B' : `DICT-${String(index + 1).padStart(2, '0')}`,
      status: 'ACTIVE', builtin: false, itemCount: dictionaryHasItems && [0, 20].includes(index) ? 21 : 0,
    }));
    const children = Object.fromEntries(dictionaries.map(dictionary => [dictionary.id,
      dictionary.itemCount ? Array.from({ length: 21 }, (_, index) => ({
        id: String(Number(dictionary.id) * 100 + index + 1), dictionaryId: dictionary.id,
        dictionaryCode: dictionary.code, dictionaryName: dictionary.name,
        label: `${dictionary.id === '1021' ? 'B' : 'A'}-ITEM-${String(index + 1).padStart(2, '0')}`,
        value: `VALUE-${index + 1}`, status: 'ACTIVE', builtin: false, sortOrder: index,
      })) : [],
    ]));
    const prefix = kind === 'operations' ? 'OPERATION' : 'TEMPLATE';
    let records = Array.from({ length: empty ? 0 : 21 }, (_, index) => ({
      id: String((kind === 'operations' ? 2001 : 3001) + index), name: `${prefix}-${String(index + 1).padStart(2, '0')}`,
      code: `${prefix}-CODE-${index + 1}`, status: 'ACTIVE', versions: [],
      defaultOperationType: 'NORMAL', defaultDurationMinutes: 1,
    }));
    const listPath = kind === 'dictionary' ? '/api/v1/system/business-dictionaries'
      : kind === 'operations' ? '/api/v1/master-data/process-modeling/operations'
        : '/api/v1/master-data/template-modeling/form-templates';
    const paged = (rows, url) => {
      const number = Number(url.searchParams.get('page') || 1), size = Number(url.searchParams.get('size') || 20);
      return { content: rows.slice((number - 1) * size, number * size), totalElements: rows.length, totalPages: Math.ceil(rows.length / size), page: number, size };
    };
    page.on('pageerror', error => errors.push(error.message));
    await context.route('**/api/v1/**', async route => {
      const request = route.request(), url = new URL(request.url()), pathname = url.pathname;
      let data;
      if (request.method() === 'GET') {
        if (pathname === listPath) {
          const number = Number(url.searchParams.get('page') || 1);
          requests.push({ path: pathname, page: number, size: Number(url.searchParams.get('size') || 20) });
          await new Promise(resolve => setTimeout(resolve, delay));
          if (number === failPage) { await route.fulfill({ status: 503, json: { code: 503, message: 'fixture page failure' } }); return; }
          data = paged(kind === 'dictionary' ? dictionaries : records, url);
        } else if (/\/system\/business-dictionaries\/\d+\/items$/.test(pathname)) {
          const dictionaryId = pathname.split('/')[5];
          requests.push({ path: pathname, dictionaryId, page: Number(url.searchParams.get('page') || 1), size: Number(url.searchParams.get('size') || 20) });
          await new Promise(resolve => setTimeout(resolve, delay));
          data = paged(children[dictionaryId] ?? [], url);
        } else if (pathname === `${listPath}/categories`) data = [];
        else if (pathname.startsWith('/api/v1/master-data/deletion-check/')) {
          requests.push({ path: pathname, deletionCheck: true });
          data = { allowed: true };
        } else { errors.push(`Unexpected GET ${pathname}`); await route.abort(); return; }
      } else if (request.method() === 'DELETE') {
        writes.push({ method: 'DELETE', path: pathname });
        const id = pathname.split('/').at(-1);
        if (kind === 'dictionary' && pathname.startsWith(`${listPath}/`)) {
          assert.equal((children[id] ?? []).length, 0, 'Only an empty custom dictionary is eligible in this fixture');
          dictionaries = dictionaries.filter(row => row.id !== id);
        } else if (pathname.startsWith('/api/v1/system/business-dictionary-items/')) {
          for (const dictionaryId of Object.keys(children)) children[dictionaryId] = children[dictionaryId].filter(row => row.id !== id);
        } else if (pathname.startsWith(`${listPath}/`)) records = records.filter(row => row.id !== id);
        else { errors.push(`Unexpected DELETE ${pathname}`); await route.abort(); return; }
        data = null;
      } else { errors.push(`Unexpected HTTP ${request.method()} ${pathname}`); await route.abort(); return; }
      await route.fulfill({ json: { code: 200, data } });
    });

    const nav = (index = 0) => page.locator('.MuiPagination-root').nth(index);
    const table = (index = 0) => page.getByRole('table').nth(index);
    const active = (index = 0) => nav(index).locator('button[aria-current]').innerText();
    const go = (number, index = 0) => nav(index).getByRole('button', { name: `Go to page ${number}`, exact: true }).click();
    const waitActive = async (number, index = 0) => {
      await page.waitForFunction(({ number, index }) => document.querySelectorAll('.MuiPagination-root')[index]?.querySelector('button[aria-current]')?.textContent === String(number), { number, index });
    };
    const cell = (label, index = 0) => table(index).getByRole('cell', { name: label, exact: true });
    const remove = async (label, index = 0) => {
      await table(index).getByRole('row').filter({ has: page.getByRole('cell', { name: label, exact: true }) }).getByRole('button', { name: '删除', exact: true }).click();
      await page.getByRole('dialog').getByRole('button', { name: '删除', exact: true }).click();
      await page.getByRole('dialog').waitFor({ state: 'hidden' });
    };

    try {
      await page.goto(`http://127.0.0.1:${server.address().port}/?kind=${kind}`);
      if (empty) {
        await table().getByText('暂无数据', { exact: true }).waitFor();
        assert.equal(await active(), '1');
        assert.equal(await nav().getByRole('button', { name: 'Go to next page', exact: true }).isDisabled(), true);
        if (kind === 'dictionary') assert.equal(await active(1), '1');
        assert.deepEqual(writes, []);
      } else if (scenario === 'parent-delete') {
        await cell('DICT-01').waitFor();
        await go(2); await cell('DICT-B').waitFor();
        await remove('DICT-B');
        await waitActive(1); await cell('DICT-01').waitFor();
        await page.getByText('共 20 条数据', { exact: true }).waitFor();
        assert.deepEqual(writes, [{ method: 'DELETE', path: `${listPath}/1021` }]);
        assert.equal(requests.filter(row => row.path === listPath).at(-1).page, 1);
      } else if (scenario === 'item-delete') {
        await cell('A-ITEM-01', 1).waitFor();
        await go(2, 1); await cell('A-ITEM-21', 1).waitFor();
        await remove('A-ITEM-21', 1);
        await waitActive(1, 1); await cell('A-ITEM-01', 1).waitFor();
        await page.getByText('共 20 条数据', { exact: true }).waitFor();
        assert.deepEqual(writes, [{ method: 'DELETE', path: '/api/v1/system/business-dictionary-items/100121' }]);
      } else if (scenario === 'automatic-parent-change') {
        await cell('A-ITEM-01', 1).waitFor();
        await go(2); await cell('B-ITEM-01', 1).waitFor();
        await go(2, 1); await cell('B-ITEM-21', 1).waitFor();
        const marker = requests.length;
        await go(1);
        await waitActive(1, 1); await cell('A-ITEM-01', 1).waitFor();
        const newARequests = requests.slice(marker).filter(row => row.dictionaryId === '1001');
        assert.equal(newARequests.some(row => row.page === 2), false, 'Switching the parent must not request its child list with the old parent page');
        assert.deepEqual(writes, []);
      } else if (scenario === 'delete-last-page') {
        await cell(`${prefix}-01`).waitFor();
        await go(2); await cell(`${prefix}-21`).waitFor();
        await remove(`${prefix}-21`);
        await waitActive(1); await cell(`${prefix}-01`).waitFor();
        await page.getByText('共 20 条数据', { exact: true }).waitFor();
        assert.deepEqual(writes, [{ method: 'DELETE', path: `${listPath}/${kind === 'operations' ? '2021' : '3021'}` }]);
        assert(requests.some(row => row.deletionCheck), 'The actual deletion protection check must complete');
      } else if (scenario === 'pending-error-cache') {
        const first = kind === 'dictionary' ? 'DICT-01' : `${prefix}-01`;
        const last = kind === 'dictionary' ? 'DICT-B' : `${prefix}-21`;
        await cell(first).waitFor();
        delay = 400; failPage = 2;
        await go(2);
        assert.equal(await active(), '2', 'The target page must remain selected while HTTP is pending');
        await table().getByText('加载失败', { exact: true }).waitFor();
        assert.equal(await active(), '2', 'Failed HTTP must not clamp the target page');
        failPage = 0;
        await go(1); await cell(first).waitFor();
        assert.equal(await active(), '1', 'Cached successful page remains selected');
        await go(2); await cell(last).waitFor();
        assert.equal(await active(), '2');
        await nav().locator('..').getByRole('combobox').click();
        await page.getByRole('option', { name: '50 条/页', exact: true }).click();
        await waitActive(1); await cell(first).waitFor();
        await page.waitForFunction(() => [...document.querySelectorAll('table')][0]?.querySelectorAll('tbody tr').length === 21);
        assert.equal(requests.filter(row => row.path === listPath).at(-1).size, 50, 'Page-size change must request the new size and reset to page one');
        assert.equal(requests.filter(row => row.path === listPath).at(-1).page, 1);
        assert.deepEqual(writes, []);
      }
      assert.deepEqual(errors, []);
      results.push({ name, kind, scenario, result: 'passed', requests, writes });
    } catch (error) {
      results.push({ name, kind, scenario, result: 'failed', message: error.message, requests, writes, errors, pageText: (await page.locator('body').innerText()).slice(-2600) });
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
console.log(JSON.stringify({ baseline: baseline || null, width, boundary: 'Actual dictionary, operation and form-template pages with React Query/client/Chromium; controlled HTTP and legal custom deletes, no backend persistence', results }, null, 2));
if (results.some(result => result.result !== 'passed')) process.exitCode = 1;
