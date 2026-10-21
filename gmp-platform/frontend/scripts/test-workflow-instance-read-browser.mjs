import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { build } from 'esbuild';
const { chromium } = createRequire(import.meta.url)('playwright');

// Actual routed pages, maintained theme/client and controlled API arrays.
// Not a password-login, live backend or whole-app E2E test.
const root = path.resolve(import.meta.dirname, '..');
const temporary = await mkdtemp(path.join(os.tmpdir(), 'edhr-workflow-read-browser-'));
const baseline = process.env.W3_READ_BASELINE_COMMIT;
if (baseline && !/^[0-9a-f]{40}$/.test(baseline)) throw new Error('Use a full fixed Git commit');
const files = ['src/pages/workflow-center/InstanceLogs.tsx', 'src/pages/workflow-center/InstanceDetail.tsx',
  'src/api/workflow-instances.ts', 'src/api/workflow-logs.ts'];
const source = async file => baseline && files.includes(file)
  ? execFileSync('git', ['show', `${baseline}:gmp-platform/frontend/${file}`], { cwd: root }) : readFile(path.join(root, file));
const sourceReceipts = {};
for (const file of [...files, 'src/App.tsx', 'src/router/index.tsx']) sourceReceipts[file] = createHash('sha256').update(await source(file)).digest('hex');
const results = [];
const longId = '700000000000000001';
let browser, server;
const gate = () => { let release; const promise = new Promise(resolve => { release = resolve; }); return { promise, release }; };
const waitFor = async predicate => {
  const deadline = Date.now() + 4000;
  while (!predicate()) { assert.ok(Date.now() < deadline, 'expected request settled'); await new Promise(resolve => setTimeout(resolve, 10)); }
};
try {
  const app = await readFile(path.join(root, 'src/App.tsx'), 'utf8');
  const start = app.indexOf('const theme = createTheme('), end = app.indexOf('\n});', start);
  assert.ok(start >= 0 && end > start);
  const theme = app.slice(start, end + 4);
  await build({ absWorkingDir: root, stdin: { resolveDir: root, loader: 'tsx', contents: `
    import React from 'react'; import { createRoot } from 'react-dom/client';
    import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
    import { ThemeProvider, CssBaseline } from '@mui/material';
    import { MemoryRouter, Routes, Route, useNavigate } from 'react-router-dom';
    import { SnackbarProvider } from './src/components/SnackbarProvider';
    import InstanceLogs from './src/pages/workflow-center/InstanceLogs';
    import InstanceDetail from './src/pages/workflow-center/InstanceDetail';
    import theme from 'maintained-read-theme'; import './src/index.css';
    function Pages() { window.__readNavigate = useNavigate(); return <Routes>
      <Route path='/workflow/instances/:id/logs' element={<InstanceLogs />} />
      <Route path='/workflow/instances/:id' element={<InstanceDetail />} />
    </Routes>; }
    createRoot(document.getElementById('root')).render(<ThemeProvider theme={theme}><CssBaseline />
      <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
        <SnackbarProvider><MemoryRouter initialEntries={['/workflow/instances/10/logs']}><Pages /></MemoryRouter></SnackbarProvider>
      </QueryClientProvider></ThemeProvider>);
  ` }, bundle: true, platform: 'browser', format: 'esm', outfile: path.join(temporary, 'bundle.js'),
    alias: { '@': path.join(root, 'src'), '@mui/icons-material': path.join(root, 'node_modules/@mui/icons-material/esm') },
    loader: { '.css': 'css', '.svg': 'dataurl', '.png': 'dataurl', '.woff2': 'file', '.ttf': 'file' },
    define: { 'process.env.NODE_ENV': '"development"', 'import.meta.env': '{"DEV":true,"PROD":false}' },
    plugins: [{ name: 'maintained-theme-and-fixed-baseline', setup(plugin) {
      plugin.onResolve({ filter: /^maintained-read-theme$/ }, () => ({ path: 'theme', namespace: 'read-theme' }));
      plugin.onLoad({ filter: /.*/, namespace: 'read-theme' }, () => ({ contents: `import { createTheme } from '@mui/material/styles'; import { listTableHeaderCellStyle } from './src/components/listTableStyles'; ${theme}\nexport default theme;`, loader: 'tsx', resolveDir: root }));
      if (baseline) plugin.onLoad({ filter: /(?:InstanceLogs|InstanceDetail)\.tsx$|workflow-(?:instances|logs)\.ts$/ }, async args => ({ contents: (await source(path.relative(root, args.path).split(path.sep).join('/'))).toString(), loader: args.path.endsWith('.tsx') ? 'tsx' : 'ts', resolveDir: path.dirname(args.path) }));
    } }], logLevel: 'silent' });
  await writeFile(path.join(temporary, 'index.html'), '<!doctype html><html lang="zh-CN"><meta charset="UTF-8"><title>流程读取回归</title><link rel="stylesheet" href="/bundle.css"><style>html,body,#root{min-height:100%;margin:0}#root{padding:16px}</style><div id="root"></div><script type="module" src="/bundle.js"></script></html>');
  server = http.createServer(async (request, response) => {
    const name = new URL(request.url, 'http://localhost').pathname === '/' ? 'index.html' : decodeURIComponent(new URL(request.url, 'http://localhost').pathname.slice(1));
    const file = path.resolve(temporary, name);
    if (!file.startsWith(temporary + path.sep)) { response.writeHead(404); response.end(); return; }
    try { response.setHeader('Content-Type', name.endsWith('.js') ? 'text/javascript' : name.endsWith('.css') ? 'text/css' : name.endsWith('.html') ? 'text/html; charset=utf-8' : 'application/octet-stream'); response.end(await readFile(file)); }
    catch { response.writeHead(404); response.end(); }
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  browser = await chromium.launch({ headless: true, executablePath: process.env.CHROME_PATH || '/usr/bin/chromium' });
  for (const viewport of [{ width: 1440, height: 960 }, { width: 390, height: 844 }]) {
    for (const scenario of ['data-pagination', 'empty', 'error', 'loading', 'route-change', 'late-route', 'long-id-logs', 'long-id-detail']) {
      const context = await browser.newContext({ viewport });
      const page = await context.newPage(); page.setDefaultTimeout(4000);
      const delayed = gate(), calls = [], settled = [], errors = [], screenshots = [];
      let closing = false;
      page.on('pageerror', error => errors.push(error.message));
      for (const event of ['requestfinished', 'requestfailed']) page.on(event, request => settled.push(new URL(request.url()).pathname));
      await context.route('**/api/v1/**', async route => {
        try {
          const request = route.request(), endpoint = new URL(request.url()).pathname;
          calls.push({ method: request.method(), endpoint, query: Object.fromEntries(new URL(request.url()).searchParams) });
          assert.equal(request.method(), 'GET', 'this page issues no writes');
          const match = endpoint.match(/^\/api\/v1\/workflow\/instances\/([^/]+)(\/logs)?$/);
          const id = match?.[1];
          if (!['10', '20', longId].includes(id)) return await route.fulfill({ status: 404, json: { code: 404, message: '合成记录不存在' } });
          if (id === '10' && ['loading', 'late-route'].includes(scenario)) await delayed.promise;
          if (scenario === 'error' && id === '10') return await route.fulfill({ status: 503, json: { code: 503, message: '合成读取故障' } });
          const count = scenario === 'empty' ? 0 : id === '10' ? 25 : 2;
          const data = match[2] ? Array.from({ length: count }, (_, index) => ({ id: String(1000 + index), instanceId: id,
            nodeId: '101', action: 'INSTANCE_START', operatorId: '1', operatorName: '合成读取人',
            comment: `合成日志-${id}-${String(index + 1).padStart(2, '0')}`, createdAt: `2026-01-01T00:${String(index).padStart(2, '0')}:00` }))
            : { id, definitionId: '50', versionId: '51', businessType: 'SYNTHETIC_CASE', businessId: `fixture-${id}`, status: 'RUNNING', initiatorId: '1', startedAt: '2026-01-01T00:00:00' };
          await route.fulfill({ status: 200, json: { code: 200, data } });
        } catch (error) { if (!closing) errors.push(error.message); }
      });
      const row = (id, number) => page.getByText(`合成日志-${id}-${String(number).padStart(2, '0')}`, { exact: true });
      const numberButton = number => page.locator('.MuiPagination-root button').filter({ hasText: new RegExp(`^${number}$`) });
      const outcome = { scenario, viewport, calls, screenshots, status: 'passed' };
      try {
        await page.goto(`http://127.0.0.1:${server.address().port}/`);
        await page.waitForFunction(() => typeof window.__readNavigate === 'function');
        if (scenario === 'empty') { await page.getByText('暂无日志', { exact: true }).waitFor(); assert.equal(await page.locator('.MuiPagination-root').count(), 0); }
        else if (scenario === 'error') { await page.getByText('加载失败', { exact: true }).waitFor(); assert.equal(await page.locator('.MuiPagination-root').count(), 0); }
        else if (scenario === 'loading') { await page.getByRole('progressbar').waitFor(); assert.equal(await page.locator('tbody td').getAttribute('colspan'), '7'); delayed.release(); await row('10', 1).waitFor(); }
        else if (scenario === 'late-route') {
          await waitFor(() => calls.some(call => call.endpoint.endsWith('/10/logs')));
          await page.evaluate(() => window.__readNavigate('/workflow/instances/20/logs')); await row('20', 1).waitFor();
          delayed.release(); await waitFor(() => settled.includes('/api/v1/workflow/instances/10/logs'));
          await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
          assert.equal(await row('10', 1).count(), 0); await row('20', 1).waitFor();
        } else if (scenario.startsWith('long-id')) {
          const suffix = scenario === 'long-id-logs' ? '/logs' : '';
          await page.evaluate(url => window.__readNavigate(url), `/workflow/instances/${longId}${suffix}`);
          await row(longId, 1).waitFor();
          assert.ok(calls.some(call => call.endpoint === `/api/v1/workflow/instances/${longId}/logs`));
          if (!suffix) assert.ok(calls.some(call => call.endpoint === `/api/v1/workflow/instances/${longId}`));
          assert.ok(!calls.some(call => call.endpoint.includes('700000000000000000')));
        } else {
          await row('10', 1).waitFor(); assert.equal(await page.locator('tbody tr').count(), 10);
          assert.equal(await row('10', 11).count(), 0);
          await numberButton(2).click(); await row('10', 11).waitFor(); assert.equal(await page.locator('tbody tr').count(), 10);
          await numberButton(3).click(); await row('10', 21).waitFor(); assert.equal(await page.locator('tbody tr').count(), 5);
          assert.equal(calls.filter(call => call.endpoint.endsWith('/10/logs')).length, 1, 'array API is loaded once; pages are sliced locally');
          if (scenario === 'route-change') {
            await page.evaluate(() => window.__readNavigate('/workflow/instances/20/logs')); await row('20', 1).waitFor();
            assert.equal(await page.locator('tbody tr').count(), 2); assert.equal(await page.locator('.MuiPagination-root').count(), 0);
          }
        }
        assert.deepEqual(errors, []);
      } catch (error) { outcome.status = 'failed'; outcome.message = error.message.split('\n').slice(0, 4).join('\n'); }
      finally {
        delayed.release();
        if (process.env.W3_READ_SCREENSHOT_DIR) {
          await mkdir(process.env.W3_READ_SCREENSHOT_DIR, { recursive: true });
          const destination = path.join(process.env.W3_READ_SCREENSHOT_DIR, `${scenario}-${viewport.width}.png`);
          try { await page.screenshot({ path: destination, fullPage: true }); screenshots.push(destination); } catch { /* Original assertion remains authoritative. */ }
        }
        closing = true; await context.close();
      }
      results.push(outcome);
    }
  }
} finally {
  if (browser) await browser.close();
  if (server) await new Promise(resolve => server.close(resolve));
  await rm(temporary, { recursive: true, force: true });
}
const summary = { sourceHead: execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim(), selectedBaseline: baseline || null,
  sourceReceipts, qualification: 'Actual maintained pages/theme/client with controlled synthetic API arrays; not full app login, backend persistence or complete instance-detail projection acceptance.',
  tests: results.length, passed: results.filter(row => row.status === 'passed').length, failed: results.filter(row => row.status === 'failed').length, skipped: 0, results };
if (process.env.W3_READ_RESULT_PATH) await writeFile(process.env.W3_READ_RESULT_PATH, JSON.stringify(summary, null, 2) + '\n');
process.stdout.write(JSON.stringify({ tests: summary.tests, passed: summary.passed, failed: summary.failed, skipped: 0, summary: process.env.W3_READ_RESULT_PATH || null }) + '\n');
if (summary.failed) process.exitCode = 1;
