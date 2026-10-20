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

// Real task/production pages, shared MUI dialogs, client and router. All API
// responses are synthetic fixtures; this does not verify backend persistence.
// NODE_PATH=/workspace/.edhr-browser-tools/node_modules CHROME_PATH=/usr/bin/chromium
// W3_RESULT_PATH=/tmp/transfer.json W3_SCREENSHOT_DIR=/tmp/transfer-images node scripts/test-tenant-task-transfer-browser.mjs
const root = path.resolve(import.meta.dirname, '..');
const temporary = await mkdtemp(path.join(os.tmpdir(), 'edhr-w3-transfer-browser-'));
const baseline = process.env.W3_BASELINE_COMMIT;
if (baseline && !/^[0-9a-f]{40}$/.test(baseline)) throw new Error('W3_BASELINE_COMMIT must be a full commit SHA');
const results = [];
const sources = {};
const sourceHead = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim();
const assertionsByScenario = {
  'required-and-keyboard-cancel': ['target and nonblank reason are required', '500-character reason limit', 'selected Chinese personnel label and candidate-retention copy', 'dialog, popup, close and confirmation fit viewport', 'Escape, keyboard cancel and close icon produce no writes'],
  'pending-success': ['single exact transfer POST with current owner/revision only', 'busy fields/actions prevent duplicate submission', 'old page actions disable after success and next generic task resets', 'synthetic returned view keeps field values and original candidates; not backend proof'],
  'post-failure': ['controlled HTTP 409 retains target and untrimmed edit text', 'retry sends identical exact explicit transfer data'],
  'new-query-clears-selection-and-empty': ['new query clears old target while preserving typed input', 'empty search gives localized feedback and no write'],
  'stale-search': ['late or canceled old query cannot replace current query/options'],
  'closed-search': ['closing/reopening the dialog invalidates its old query'],
  'search-failure': ['initial controlled HTTP 503 disables submit and supports retry'],
  'stale-search-failure': ['controlled HTTP 503 clears previously visible personnel and target', 'query and reason edits survive and search can retry'],
  'route-change': ['old task POST cannot annotate or disable a new task route'],
  'route-search-change': ['old task search cannot populate the new task route'],
};
let browser, server;
const target3 = { id: '3', name: '租户内委托员三', username: 'delegate3' };
const target4 = { id: '4', name: '租户内委托员四', username: 'delegate4' };
const viewports = [{ width: 1440, height: 960 }, { width: 390, height: 844 }];
const gate = () => { let release; const promise = new Promise(resolve => { release = resolve; }); return { promise, release }; };
const waitFor = async (test, message) => {
  const end = Date.now() + 15000;
  while (!test()) { if (Date.now() > end) throw new Error(message); await new Promise(resolve => setTimeout(resolve, 20)); }
};
function productionView() {
  const controls = { canAct: true, nodeId: 'review', nodeName: '现场复核', nodeKind: 'APPROVAL',
    buttons: [{ action: 'TRANSFER', label: '转办', style: 'DEFAULT' }], permissions: {} };
  return {
    snapshot: { context: { objectId: '101', objectNo: 'BATCH-101', objectType: 'BATCH', workOrderNo: 'WO-101', productName: '合成检验产品', productCode: 'PRODUCT-101', unit: '件' },
      operations: [{ id: 'a', name: '现场检验', code: 'CHECK', type: 'STANDARD', works: [], documents: [],
        forms: [{ id: 'f', versionId: '702', name: '合成检验记录', code: 'FORM-101', version: 'V1', categoryName: '检验记录',
          model: '{"fields":[]}', canvas: '{}', fields: [], required: true }] }] },
    state: { operations: { a: { status: 'IN_PROGRESS', forms: { f: { status: 'ACTIVE', values: { temperature: 22 },
      instanceNo: 'FR-101', active: ['review'], approvers: { review: ['1'] }, restrictedApprovers: { review: true }, transferAssignees: {} } }, works: {} } }, history: [] },
    availability: { a: { canStart: false, canComplete: false, startIssues: [], completionIssues: ['审批尚未完成'], forms: { f: controls },
      formCopies: { f: { instanceIds: ['f'], status: 'ACTIVE', ended: false, required: true, canAdd: false, canEnd: false, incomplete: [], instances: { f: controls } } } } },
    revision: 7, objectStatus: 'IN_PROGRESS', orderStatus: 'IN_PROGRESS', historicalWithoutExecution: false,
  };
}

try {
  for (const file of ['src/pages/workflow-center/TaskDetail.tsx', 'src/pages/production/ProductionExecutionPage.tsx', 'src/App.tsx']) {
    const bytes = baseline && !file.endsWith('App.tsx')
      ? execFileSync('git', ['show', `${baseline}:gmp-platform/frontend/${file}`], { cwd: root }) : await readFile(path.join(root, file));
    sources[file] = createHash('sha256').update(bytes).digest('hex');
  }
  const app = await readFile(path.join(root, 'src/App.tsx'), 'utf8');
  const themeStart = app.indexOf('const theme = createTheme(');
  const themeEnd = app.indexOf('\n});', themeStart);
  assert.ok(themeStart >= 0 && themeEnd > themeStart, 'maintained App theme expression is available');
  const theme = app.slice(themeStart, themeEnd + 4);
  await build({ absWorkingDir: root, stdin: { resolveDir: root, loader: 'tsx', contents: `
    import React from 'react';
    import { createRoot } from 'react-dom/client';
    import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
    import { ThemeProvider, CssBaseline } from '@mui/material';
    import { MemoryRouter, Routes, Route, useNavigate } from 'react-router-dom';
    import { SnackbarProvider } from './src/components/SnackbarProvider';
    import TaskDetail from './src/pages/workflow-center/TaskDetail';
    import ProductionExecutionPage from './src/pages/production/ProductionExecutionPage';
    import theme from 'actual-maintained-app-theme';
    import './src/index.css';
    const kind = new URLSearchParams(location.search).get('kind') || 'generic';
    const entry = kind === 'production' ? '/production/execution?barcode=BATCH-101&autoScan=1&operationId=a&formId=f&copyId=f' : '/workflow/tasks/10';
    function Pages() {
      window.__navigate = useNavigate();
      return <Routes><Route path='/workflow/tasks/:id' element={<TaskDetail />} /><Route path='/production/execution' element={<ProductionExecutionPage />} /></Routes>;
    }
    createRoot(document.getElementById('root')).render(<ThemeProvider theme={theme}><CssBaseline />
      <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
        <SnackbarProvider><MemoryRouter initialEntries={[entry]}><Pages /></MemoryRouter></SnackbarProvider>
      </QueryClientProvider></ThemeProvider>);
  ` }, bundle: true, platform: 'browser', format: 'esm', outfile: path.join(temporary, 'bundle.js'),
    alias: { '@': path.join(root, 'src'), '@mui/icons-material': path.join(root, 'node_modules/@mui/icons-material/esm') },
    loader: { '.css': 'css', '.svg': 'dataurl', '.png': 'dataurl', '.woff2': 'file', '.ttf': 'file' },
    define: { 'process.env.NODE_ENV': '"development"', 'import.meta.env': '{"DEV":true,"PROD":false}' },
    plugins: [{ name: 'actual-app-theme-and-optional-baseline', setup(plugin) {
      plugin.onResolve({ filter: /^actual-maintained-app-theme$/ }, () => ({ path: 'theme', namespace: 'actual-app-theme' }));
      plugin.onLoad({ filter: /.*/, namespace: 'actual-app-theme' }, () => ({ contents: `import { createTheme } from '@mui/material/styles'; import { listTableHeaderCellStyle } from './src/components/listTableStyles'; ${theme}\nexport default theme;`, loader: 'tsx', resolveDir: root }));
      if (baseline) plugin.onLoad({ filter: /(?:TaskDetail|ProductionExecutionPage)\.tsx$/ }, args => ({ contents: execFileSync('git', ['show', `${baseline}:gmp-platform/frontend/${path.relative(root, args.path).split(path.sep).join('/')}`], { cwd: root, encoding: 'utf8' }), loader: 'tsx', resolveDir: path.dirname(args.path) }));
    } }], logLevel: 'silent' });
  await writeFile(path.join(temporary, 'index.html'), '<!doctype html><html lang="zh-CN"><meta charset="UTF-8"><title>租户内转办交互验收</title><link rel="stylesheet" href="/bundle.css"><style>html,body,#root{min-height:100%;margin:0}#root{padding:16px}</style><div id="root"></div><script type="module" src="/bundle.js"></script></html>');
  server = http.createServer(async (request, response) => {
    const name = new URL(request.url, 'http://localhost').pathname.slice(1) || 'index.html';
    if (!['index.html', 'bundle.js', 'bundle.css'].includes(name)) { response.writeHead(404); response.end(); return; }
    response.setHeader('Content-Type', name.endsWith('.js') ? 'text/javascript' : name.endsWith('.css') ? 'text/css' : 'text/html; charset=utf-8');
    response.end(await readFile(path.join(temporary, name)));
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  browser = await chromium.launch({ headless: true, executablePath: process.env.CHROME_PATH });

  async function run(kind, scenario, viewport, check) {
    const name = `${kind}-${scenario}-${viewport.width}`;
    if (process.env.W3_CASE_FILTER && !name.includes(process.env.W3_CASE_FILTER)) return;
    const context = await browser.newContext({ viewport });
    const calls = [], mutations = [], errors = [], consoleErrors = [], fixtures = [], screenshots = [], networkSettled = [];
    const oldSearch = gate(), mutation = gate();
    let searchFailures = 0, postFailures = 0, closing = false;
    const original = productionView();
    let current = structuredClone(original);
    const fulfill = async (route, options) => {
      try { await route.fulfill(options); }
      catch (error) { if (!closing && !/closed|canceled|cancelled|Invalid InterceptionId|already handled/i.test(error.message)) throw error; }
    };
    await context.route('**/api/v1/**', async route => {
      const request = route.request(), url = new URL(request.url()), endpoint = url.pathname;
      calls.push({ method: request.method(), endpoint, keyword: url.searchParams.get('keyword') || '', query: Object.fromEntries(url.searchParams) });
      const ok = data => fulfill(route, { status: 200, json: { code: 200, data } });
      if (request.method() === 'GET' && endpoint.endsWith('/transfer-targets')) {
        const keyword = url.searchParams.get('keyword') || '';
        if (kind === 'production') {
          assert.equal(endpoint, '/api/v1/production/execution/101/transfer-targets');
          assert.deepEqual(Object.fromEntries(url.searchParams), { operationId: 'a', formId: 'f', instanceId: 'f', keyword }, 'target search uses only the current production form instance');
        } else assert.match(endpoint, /^\/api\/v1\/workflow\/tasks\/(10|11)\/transfer-targets$/);
        if (['stale-search', 'closed-search', 'route-search-change'].includes(scenario) && keyword === 'old') { await oldSearch.promise; return ok([target3]); }
        if ((scenario === 'search-failure' || scenario === 'stale-search-failure' && keyword === 'error') && searchFailures++ === 0) return fulfill(route, { status: 503, json: { code: 503, message: '合成人员服务暂时不可用，请重试' } });
        if (keyword === 'missing') return ok([]);
        if (keyword === 'new') return ok([target4]);
        return ok([target3, target4]);
      }
      if (kind === 'production' && request.method() === 'GET' && (endpoint.endsWith('/scan') || endpoint === '/api/v1/production/execution/101')) return ok(current);
      if (kind === 'production' && endpoint.endsWith('/presence') && ['GET', 'POST'].includes(request.method())) return ok({});
      const expectedMutation = kind === 'generic' ? /^\/api\/v1\/workflow\/tasks\/\d+\/transfer$/ : /^\/api\/v1\/production\/execution\/101\/actions$/;
      if (request.method() === 'POST' && expectedMutation.test(endpoint)) {
        const body = request.postDataJSON(); mutations.push({ endpoint, body });
        if (scenario === 'pending-success' || scenario === 'route-change') await mutation.promise;
        if (scenario === 'post-failure' && postFailures++ === 0) return fulfill(route, { status: 409, json: { code: 409, message: '目标人员状态已变化，请重新选择或重试' } });
        if (kind === 'generic') return ok({ taskId: endpoint.split('/').at(-2), action: 'TRANSFER', result: 'ok' });
        assert.equal(body.action, 'TRANSFER', 'only explicit transfer writes are allowed');
        current = structuredClone(original); current.revision = 8;
        current.state.operations.a.forms.f.transferAssignees.review = body.targetUserId;
        current.availability.a.forms.f.canAct = false;
        current.availability.a.formCopies.f.instances.f.canAct = false;
        fixtures.push({ beforeValues: original.state.operations.a.forms.f.values, afterValues: current.state.operations.a.forms.f.values,
          beforeApprovers: original.state.operations.a.forms.f.approvers, afterApprovers: current.state.operations.a.forms.f.approvers });
        return ok(current);
      }
      throw new Error(`unconfigured synthetic API ${request.method()} ${endpoint}`);
    });
    const page = await context.newPage(); page.setDefaultTimeout(15000);
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', message => { if (message.type() === 'error') consoleErrors.push(message.text()); });
    for (const outcome of ['requestfinished', 'requestfailed']) page.on(outcome, request => {
      const url = new URL(request.url());
      if (url.pathname.startsWith('/api/v1/')) networkSettled.push({ method: request.method(), endpoint: url.pathname, keyword: url.searchParams.get('keyword') || '', outcome });
    });
    const settleOldSearch = async () => {
      oldSearch.release();
      await waitFor(() => networkSettled.some(request => request.endpoint.endsWith('/transfer-targets') && request.keyword === 'old'), 'old query response arrives or is actually canceled');
      await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    };
    const settleOldMutation = async () => {
      mutation.release();
      await waitFor(() => networkSettled.some(request => request.method === 'POST' && request.endpoint === '/api/v1/workflow/tasks/10/transfer'), 'old mutation response arrives or is actually canceled');
      await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    };
    const dialog = () => page.getByRole('dialog', { name: kind === 'generic' ? '转办任务' : '转办审批', exact: true });
    const target = () => dialog().getByRole('combobox', { name: '转办给' });
    const reason = () => dialog().getByRole('textbox', { name: '转办原因' });
    const confirm = () => dialog().getByRole('button', { name: '确认转办', exact: true });
    const open = async () => {
      await page.getByRole('button', { name: '转办', exact: true }).click();
      await dialog().waitFor();
    };
    const select = async (which = target3) => {
      await target().click(); await target().press('ArrowDown');
      await page.getByRole('option', { name: `${which.name}（${which.username}）`, exact: true }).click();
      assert.equal(await target().inputValue(), `${which.name}（${which.username}）`);
    };
    const ready = async () => { await open(); await select(); await reason().fill('  委托当班人员继续处理  '); };
    const screenshot = async suffix => {
      if (!process.env.W3_SCREENSHOT_DIR) return;
      await mkdir(process.env.W3_SCREENSHOT_DIR, { recursive: true });
      const file = path.join(process.env.W3_SCREENSHOT_DIR, `${name}-${suffix}.png`);
      await page.screenshot({ path: file, animations: 'disabled' }); screenshots.push(file);
    };
    try {
      await page.goto(`http://127.0.0.1:${server.address().port}/?kind=${kind}`);
      await page.getByRole('button', { name: '转办', exact: true }).waitFor();
      await check({ page, calls, mutations, original, fixtures, oldSearch, mutation, settleOldSearch, settleOldMutation, dialog, target, reason, confirm, open, select, ready, screenshot });
      assert.deepEqual(errors, [], 'no browser runtime errors');
      const expectedStatus = ['search-failure', 'stale-search-failure'].includes(scenario) ? '503' : scenario === 'post-failure' ? '409' : null;
      if (expectedStatus) {
        assert.equal(consoleErrors.length, 1, 'one controlled failed HTTP response');
        assert.match(consoleErrors[0], new RegExp(expectedStatus));
      } else assert.deepEqual(consoleErrors, [], 'no browser console errors or React warnings');
      results.push({ name, status: 'passed', viewport, assertionScope: assertionsByScenario[scenario], calls, mutations, networkSettled, screenshots, fixtureBoundary: 'controlled API responses; no backend persistence claim' });
    } catch (error) {
      await screenshot('failed');
      results.push({ name, status: 'failed', viewport, assertionScope: assertionsByScenario[scenario], message: error.message, errors, consoleErrors, calls, mutations, networkSettled, screenshots,
        pageText: (await page.locator('body').innerText().catch(() => '')).slice(0, 2500) });
    } finally {
      closing = true; oldSearch.release(); mutation.release(); await context.close();
    }
  }

  for (const kind of ['generic', 'production']) for (const viewport of viewports) {
    await run(kind, 'required-and-keyboard-cancel', viewport, async ({ page, mutations, dialog, target, reason, confirm, open, select, screenshot }) => {
      await open(); assert.equal(await confirm().isDisabled(), true);
      await select(); assert.equal(await confirm().isDisabled(), true);
      await reason().fill('   '); assert.equal(await confirm().isDisabled(), true, 'whitespace is not a transfer reason');
      await reason().fill('填写明确委托原因'); assert.equal(await confirm().isEnabled(), true);
      assert.equal(await target().getAttribute('required'), ''); assert.equal(await reason().getAttribute('required'), '');
      assert.match(await dialog().innerText(), /本租户/); assert.match(await dialog().innerText(), /原.*候选.*保留/);
      const bounds = await dialog().boundingBox(), button = await confirm().boundingBox();
      assert.ok(bounds.x >= 0 && bounds.y >= 0 && bounds.x + bounds.width <= viewport.width + 1 && bounds.y + bounds.height <= viewport.height + 1, 'dialog stays inside viewport');
      assert.ok(button.y + button.height <= viewport.height && button.x + button.width <= viewport.width, 'confirmation action is reachable');
      assert.equal(await reason().getAttribute('maxlength'), '500');
      const close = dialog().getByRole('button', { name: '关闭', exact: true });
      const closeBounds = await close.boundingBox();
      assert.ok(closeBounds.x >= 0 && closeBounds.y >= 0 && closeBounds.x + closeBounds.width <= viewport.width && closeBounds.y + closeBounds.height <= viewport.height, 'close action is reachable');
      await screenshot('filled');
      await target().click(); await target().press('ArrowDown');
      const popup = page.getByRole('listbox'); await popup.waitFor();
      const popupBounds = await popup.boundingBox();
      assert.ok(popupBounds.x >= 0 && popupBounds.x + popupBounds.width <= viewport.width + 1, 'opened personnel popup fits viewport');
      await screenshot('popup');
      await target().press('Escape'); assert.equal(await dialog().isVisible(), true, 'first Escape closes only popup');
      await dialog().getByRole('button', { name: '取消', exact: true }).press('Enter');
      await dialog().waitFor({ state: 'hidden' });
      await open(); assert.equal(await target().inputValue(), ''); assert.equal(await reason().inputValue(), '');
      await dialog().getByRole('button', { name: '关闭', exact: true }).click(); await dialog().waitFor({ state: 'hidden' });
      await open(); await dialog().press('Escape'); await dialog().waitFor({ state: 'hidden' });
      assert.deepEqual(mutations, [], 'cancel/close/Escape perform no transfer');
    });
    await run(kind, 'pending-success', viewport, async ({ page, mutations, fixtures, dialog, target, reason, confirm, ready, mutation }) => {
      await ready(); await confirm().click(); await waitFor(() => mutations.length === 1, 'transfer request starts');
      const busy = dialog().getByRole('button', { name: '正在转办…', exact: true });
      assert.equal(await busy.isDisabled(), true); assert.equal(await reason().isDisabled(), true);
      assert.equal(await target().isDisabled(), true); assert.equal(await dialog().getByRole('button', { name: '取消', exact: true }).isDisabled(), true);
      assert.equal(await dialog().getByRole('button', { name: '关闭', exact: true }).count(), 0);
      await busy.dispatchEvent('click'); assert.equal(mutations.length, 1, 'busy control cannot duplicate request');
      mutation.release(); await dialog().waitFor({ state: 'hidden' });
      if (kind === 'generic') {
        assert.deepEqual(mutations[0], { endpoint: '/api/v1/workflow/tasks/10/transfer', body: { newAssigneeId: '3', reason: '委托当班人员继续处理' } });
        await page.getByText('任务已转办给租户内委托员三，由受让人继续处理。', { exact: true }).waitFor();
        assert.equal(await page.getByRole('button', { name: '审批通过', exact: true }).isDisabled(), true);
        await page.evaluate(() => window.__navigate('/workflow/tasks/11'));
        await page.getByText('任务编号: #11', { exact: true }).waitFor();
        assert.equal(await page.getByRole('button', { name: '转办', exact: true }).isEnabled(), true);
      } else {
        assert.deepEqual(mutations[0], { endpoint: '/api/v1/production/execution/101/actions', body: { action: 'TRANSFER', formId: 'f', instanceId: 'f', targetUserId: '3', reason: '委托当班人员继续处理', revision: 7, operationId: 'a' } });
        assert.deepEqual(fixtures[0].beforeValues, fixtures[0].afterValues); assert.deepEqual(fixtures[0].beforeApprovers, fixtures[0].afterApprovers);
        assert.equal(await page.getByRole('button', { name: '转办', exact: true }).isEnabled(), false);
      }
      assert.equal(mutations.length, 1);
    });
    await run(kind, 'post-failure', viewport, async ({ mutations, dialog, target, reason, confirm, ready }) => {
      await ready(); await confirm().click();
      await dialog().getByText('目标人员状态已变化，请重新选择或重试', { exact: true }).waitFor();
      assert.equal(await target().inputValue(), `${target3.name}（${target3.username}）`);
      assert.equal(await reason().inputValue(), '  委托当班人员继续处理  ');
      assert.equal(await confirm().isEnabled(), true); await confirm().click(); await dialog().waitFor({ state: 'hidden' });
      assert.equal(mutations.length, 2); assert.deepEqual(mutations[0].body, mutations[1].body, 'retry keeps explicit target/reason and no invented values');
    });
    await run(kind, 'new-query-clears-selection-and-empty', viewport, async ({ page, mutations, target, reason, confirm, open, select }) => {
      await open(); await select(); await reason().fill('明确原因');
      assert.equal(await confirm().isEnabled(), true); await target().fill('missing');
      assert.equal(await target().inputValue(), 'missing', 'typed query is preserved when old selection clears');
      assert.equal(await confirm().isDisabled(), true);
      await page.getByText(kind === 'generic' ? '没有找到匹配的可转办人员' : '没有找到匹配的可转办用户', { exact: true }).waitFor();
      assert.deepEqual(mutations, []);
    });
    await run(kind, 'stale-search', viewport, async ({ page, calls, target, open, settleOldSearch }) => {
      await open(); await target().fill('old');
      await waitFor(() => calls.some(call => call.keyword === 'old'), 'old search starts');
      await target().fill('new');
      await page.getByRole('option', { name: `${target4.name}（${target4.username}）`, exact: true }).waitFor();
      await settleOldSearch();
      assert.equal(await target().inputValue(), 'new');
      assert.equal(await page.getByRole('option', { name: `${target3.name}（${target3.username}）`, exact: true }).count(), 0, 'late old search cannot replace current options');
    });
    await run(kind, 'search-failure', viewport, async ({ page, dialog, target, confirm, open, select }) => {
      await open(); await dialog().getByText('合成人员服务暂时不可用，请重试', { exact: true }).waitFor();
      assert.equal(await confirm().isDisabled(), true);
      if (kind === 'generic') await dialog().getByRole('button', { name: '重新加载人员', exact: true }).click();
      else await target().fill('retry');
      await select();
      assert.equal(await target().inputValue(), `${target3.name}（${target3.username}）`);
      assert.equal(await page.getByRole('option').count(), 0);
    });
    await run(kind, 'stale-search-failure', viewport, async ({ page, dialog, target, reason, confirm, open, select }) => {
      await open(); await select(); await reason().fill('人员查询失败时保留本次说明');
      await target().click(); await target().press('ArrowDown');
      await page.getByRole('option', { name: `${target3.name}（${target3.username}）`, exact: true }).waitFor();
      await target().fill('error');
      await dialog().getByText('合成人员服务暂时不可用，请重试', { exact: true }).waitFor();
      assert.equal(await target().inputValue(), 'error'); assert.equal(await confirm().isDisabled(), true);
      assert.equal(await reason().inputValue(), '人员查询失败时保留本次说明');
      assert.equal(await page.getByRole('option').count(), 0, 'failed query clears stale selectable people');
      if (kind === 'generic') await dialog().getByRole('button', { name: '重新加载人员', exact: true }).click();
      else await target().fill('retry');
      await select(); assert.equal(await confirm().isEnabled(), true);
    });
    await run(kind, 'closed-search', viewport, async ({ page, calls, dialog, target, open, settleOldSearch }) => {
      await open(); await target().fill('old');
      await waitFor(() => calls.some(call => call.keyword === 'old'), 'old dialog search starts');
      await dialog().getByRole('button', { name: '取消', exact: true }).click(); await dialog().waitFor({ state: 'hidden' });
      await open(); await target().fill('new');
      await page.getByRole('option', { name: `${target4.name}（${target4.username}）`, exact: true }).waitFor();
      await settleOldSearch();
      assert.equal(await target().inputValue(), 'new');
      assert.equal(await page.getByRole('option', { name: `${target3.name}（${target3.username}）`, exact: true }).count(), 0);
    });
  }
  for (const viewport of viewports) await run('generic', 'route-change', viewport, async ({ page, mutations, dialog, ready, confirm, settleOldMutation }) => {
    await ready(); await confirm().click(); await waitFor(() => mutations.length === 1, 'old task POST starts');
    await page.evaluate(() => window.__navigate('/workflow/tasks/11'));
    await page.getByText('任务编号: #11', { exact: true }).waitFor();
    await dialog().waitFor({ state: 'hidden' }); await settleOldMutation();
    assert.equal(await page.getByText(/任务已转办给/).count(), 0, 'old task result does not disable or annotate new task');
    assert.equal(await page.getByRole('button', { name: '转办', exact: true }).isEnabled(), true);
  });
  for (const viewport of viewports) await run('generic', 'route-search-change', viewport, async ({ page, calls, dialog, target, open, settleOldSearch }) => {
    await open(); await target().fill('old');
    await waitFor(() => calls.some(call => call.keyword === 'old'), 'old task search starts');
    await page.evaluate(() => window.__navigate('/workflow/tasks/11'));
    await page.getByText('任务编号: #11', { exact: true }).waitFor(); await dialog().waitFor({ state: 'hidden' });
    await open(); await target().fill('new');
    await page.getByRole('option', { name: `${target4.name}（${target4.username}）`, exact: true }).waitFor();
    assert.ok(calls.some(call => call.endpoint === '/api/v1/workflow/tasks/11/transfer-targets' && call.keyword === 'new'));
    await settleOldSearch();
    assert.equal(await target().inputValue(), 'new');
    assert.equal(await page.getByRole('option', { name: `${target3.name}（${target3.username}）`, exact: true }).count(), 0);
  });
  assert.ok(results.length > 0, 'W3_CASE_FILTER must select at least one actual case');
} finally {
  await browser?.close(); if (server) await new Promise(resolve => server.close(resolve));
  await rm(temporary, { recursive: true, force: true });
  const report = { scope: 'real UI components and maintained theme with controlled synthetic APIs; no backend/DB acceptance',
    sourceHead, baselineCommit: baseline || null, sourceSha256: sources, passed: results.filter(result => result.status === 'passed').length,
    failed: results.filter(result => result.status === 'failed').length, results };
  if (process.env.W3_RESULT_PATH) await writeFile(process.env.W3_RESULT_PATH, JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify(report));
}
if (results.some(result => result.status === 'failed')) process.exitCode = 1;
