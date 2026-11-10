import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { build } from 'esbuild';

const { chromium } = createRequire(import.meta.url)('playwright');
const root = path.resolve(process.env.RECORD_CHANGE_ROOT || path.resolve(import.meta.dirname, '..'));
const temporary = await mkdtemp(path.join(os.tmpdir(), 'record-change-async-'));
const artifacts = process.env.RECORD_CHANGE_ARTIFACTS;
const selected = process.env.RECORD_CHANGE_CASES?.split(',');
const cases = ['lookup-success', 'lookup-error', 'lookup-loading', 'candidate-success', 'candidate-error',
  'candidate-source', 'candidate-empty', 'candidate-current-error', 'refresh-success', 'refresh-error',
  'discard-cancel', 'discard-confirm', 'ime'];
const results = [];
let browser, server;

const source = number => ({ id: number, instance_no: number, object_id: 'object-' + number,
  status: 'COMPLETED', current_revision_id: 'revision-' + number, revision_no: '1',
  template_name: '合成表单 ' + number, template_code: number, version_number: '1',
  fieldValues: { measurement: '原值-' + number },
  snapshot: { id: 'form', versionId: 'form-version', name: '合成表单',
    fields: [{ id: 'measurement', name: '检测值', type: 'text', typeConfig: {} }] },
  active_request_id: null, active_request_no: null, active_request_type: null });
const candidates = type => [{ workflowDefinitionId: 'definition-' + type, workflowVersionId: 'version-' + type,
  versionNumber: 1, templateName: type + '审批', businessType: type, status: 'PUBLISHED' }];

try {
  const app = await readFile(path.join(root, 'src/App.tsx'), 'utf8');
  const start = app.indexOf('const theme = createTheme('), end = app.indexOf('\n});', start);
  assert.ok(start >= 0 && end > start);
  await build({ absWorkingDir: root, stdin: { resolveDir: root, loader: 'tsx', contents: `
    import React from 'react'; import { createRoot } from 'react-dom/client';
    import './src/index.css';
    import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
    import { ThemeProvider, CssBaseline } from '@mui/material';
    import { MemoryRouter, Routes, Route, Link } from 'react-router-dom';
    import { SnackbarProvider } from './src/components/SnackbarProvider';
    import RecordChangePage from './src/pages/record-control/RecordChangePage';
    import theme from 'record-test-theme';
    createRoot(document.getElementById('root')).render(<ThemeProvider theme={theme}><CssBaseline />
      <QueryClientProvider client={new QueryClient({defaultOptions:{queries:{retry:false}}})}>
        <SnackbarProvider><MemoryRouter initialEntries={['/records/change']}>
          <Routes><Route path='/records/change' element={<RecordChangePage />} />
            <Route path='/records/requests/:id' element={<Link to='/records/change'>返回记录变更</Link>} />
          </Routes>
        </MemoryRouter></SnackbarProvider>
      </QueryClientProvider></ThemeProvider>);
  ` }, bundle: true, platform: 'browser', format: 'esm', outfile: path.join(temporary, 'bundle.js'),
    alias: { '@': path.join(root, 'src'), '@mui/icons-material': path.join(root, 'node_modules/@mui/icons-material/esm') },
    loader: { '.css': 'css', '.svg': 'dataurl', '.png': 'dataurl', '.woff2': 'file', '.ttf': 'file' },
    define: { 'process.env.NODE_ENV': '"development"', 'import.meta.env': '{"DEV":true,"PROD":false}' },
    plugins: [{ name: 'record-test-theme', setup(plugin) {
      plugin.onResolve({ filter: /^record-test-theme$/ }, () => ({ path: 'theme', namespace: 'theme' }));
      plugin.onLoad({ filter: /.*/, namespace: 'theme' }, () => ({ contents:
        `import { createTheme } from '@mui/material/styles'; import { listTableHeaderCellStyle } from './src/components/listTableStyles'; ${app.slice(start, end + 4)}\nexport default theme;`,
        loader: 'tsx', resolveDir: root }));
    } }], logLevel: 'silent' });
  await writeFile(path.join(temporary, 'index.html'), '<html lang="zh-CN"><meta charset="UTF-8"><link rel="stylesheet" href="/bundle.css"><style>html,body,#root{height:100%;margin:0}#root{padding:16px;box-sizing:border-box}</style><div id="root"></div><script type="module" src="/bundle.js"></script></html>');
  server = http.createServer(async (request, response) => {
    const name = new URL(request.url, 'http://localhost').pathname.slice(1) || 'index.html';
    if (!['index.html', 'bundle.js', 'bundle.css'].includes(name)) { response.writeHead(404); return response.end(); }
    response.setHeader('Content-Type', name.endsWith('.js') ? 'text/javascript' : name.endsWith('.css') ? 'text/css' : 'text/html; charset=utf-8');
    response.end(await readFile(path.join(temporary, name)));
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  browser = await chromium.launch({ headless: true, executablePath: process.env.CHROME_PATH || '/usr/bin/chromium' });
  if (artifacts) await mkdir(artifacts, { recursive: true });
  for (const width of [1440, 390]) for (const scenario of cases.filter(name => !selected || selected.includes(name))) {
    const context = await browser.newContext({ viewport: { width, height: 960 }, reducedMotion: 'reduce' });
    await context.addInitScript(() => {
      localStorage.setItem('token', 'synthetic-test-token');
      localStorage.setItem('user', JSON.stringify({ id: 'ui-test', username: 'ui-test', permissions: [] }));
    });
    const page = await context.newPage(); page.setDefaultTimeout(5000);
    const calls = [], pending = [], writes = [], errors = [], nativeDialogs = [];
    let submitted = false;
    page.on('pageerror', error => errors.push(error.message));
    page.on('dialog', async dialog => { nativeDialogs.push(dialog.message()); await dialog.dismiss(); });
    await context.route('**/api/v1/**', route => {
      const request = route.request(), url = new URL(request.url());
      const call = { method: request.method(), path: url.pathname, number: url.searchParams.get('instanceNo'),
        type: url.searchParams.get('businessType') };
      calls.push(call);
      if (call.method === 'POST' && call.path === '/api/v1/record-control/requests') {
        writes.push(request.postDataJSON()); submitted = true;
        return route.fulfill({ json: { code: 200, data: { id: 'request-A' } } });
      }
      assert.equal(call.method, 'GET', 'all writes are intercepted synthetic requests');
      if (call.path === '/api/v1/record-control/records/by-number' || call.path === '/api/v1/workflow/record-control/candidates') {
        pending.push({ ...call, route }); return;
      }
      throw new Error('Unexpected API fixture ' + JSON.stringify(call));
    });
    const input = page.getByRole('textbox', { name: '表单实例编号', exact: true });
    const query = page.getByRole('button', { name: '查询', exact: true });
    const waitPending = async (kind, value) => {
      const match = item => kind === 'record' ? item.number === value : item.type === value;
      await page.waitForFunction(() => document.readyState === 'complete');
      await assertEventually(() => pending.some(match), 'expected pending ' + kind + ':' + value);
      const index = pending.findIndex(match); return pending.splice(index, 1)[0];
    };
    const respond = async (item, data, status = 200) => {
      const response = page.waitForResponse(r => r.request().url() === item.route.request().url());
      await item.route.fulfill({ status, json: { code: status, data, message: status === 200 ? '' : '合成当前请求失败' } });
      await (await response).finished();
      await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    };
    const lookup = async (number, complete = true) => {
      await input.fill(number); await input.press('Enter');
      const item = await waitPending('record', number);
      if (complete) { await respond(item, source(number)); await page.getByText('合成表单 ' + number, { exact: true }).waitFor(); }
      return item;
    };
    const startMode = async type => {
      await page.getByRole('button', { name: type === 'CHANGE' ? '表单变更' : '表单作废', exact: true }).click();
      return waitPending('candidate', type);
    };
    const cancelMode = () => page.getByRole('button', { name: '取消', exact: true }).click();
    const openSubmit = async () => {
      await page.getByRole('button', { name: '提交作废审批', exact: true }).click();
      await page.getByRole('textbox', { name: '作废原因' }).fill('合成当前上下文验证');
    };
    const selectObsolete = async () => {
      await page.getByRole('combobox', { name: '审批流程版本' }).click();
      const options = await page.getByRole('option').allTextContents();
      assert.deepEqual(options, ['OBSOLETE审批 · V1'], 'only current business type candidates are selectable');
      await page.getByRole('option', { name: 'OBSOLETE审批 · V1', exact: true }).click();
    };
    const sign = async () => {
      await page.getByRole('textbox', { name: '签署人用户名', exact: true }).fill('synthetic-signer');
      await page.getByRole('textbox', { name: '电子签名密码', exact: true }).fill('synthetic-only');
      await page.getByRole('button', { name: '签署并确认提交', exact: true }).click();
      const fresh = await waitPending('record', 'FR-A');
      assert.equal(writes.length, 1); assert.equal(writes[0].requestType, 'OBSOLETE');
      assert.equal(writes[0].instanceNo, 'FR-A'); assert.equal(writes[0].sourceRevisionId, 'revision-FR-A');
      assert.equal(writes[0].workflowVersionId, 'version-OBSOLETE');
      return fresh;
    };
    try {
      await page.goto(`http://127.0.0.1:${server.address().port}/`);
      if (scenario.startsWith('lookup-')) {
        const old = await lookup('FR-A', false), current = await lookup('FR-B', false);
        if (scenario === 'lookup-loading') {
          await respond(old, source('FR-A'));
          assert.ok(await query.isDisabled(), 'old finally must not clear current loading');
          await respond(current, source('FR-B'));
        } else {
          await respond(current, source('FR-B'));
          await respond(old, scenario === 'lookup-error' ? null : source('FR-A'), scenario === 'lookup-error' ? 503 : 200);
        }
        assert.equal(await page.getByText('合成表单 FR-B', { exact: true }).count(), 1, 'latest source must remain displayed');
        assert.equal(await page.getByText('合成当前请求失败', { exact: true }).count(), 0, 'superseded errors must not replace current state');
      } else if (scenario.startsWith('candidate-')) {
        await lookup('FR-A');
        if (['candidate-empty', 'candidate-current-error'].includes(scenario)) {
          const current = await startMode('OBSOLETE'); await openSubmit();
          assert.equal(await page.getByText('暂无可用的已发布审批流程。', { exact: true }).count(), 0, 'pending is not empty');
          await respond(current, scenario === 'candidate-empty' ? [] : null, scenario === 'candidate-empty' ? 200 : 503);
          if (scenario === 'candidate-current-error') await page.getByText('合成当前请求失败', { exact: true }).waitFor();
          else await page.getByText('暂无可用的已发布审批流程。', { exact: true }).waitFor();
          assert.ok(await page.getByRole('button', { name: '签署并确认提交', exact: true }).isDisabled());
        } else {
          const old = await startMode('CHANGE');
          if (scenario === 'candidate-source') await lookup('FR-B'); else await cancelMode();
          const current = await startMode('OBSOLETE');
          await respond(current, candidates('OBSOLETE'));
          await respond(old, scenario === 'candidate-error' ? null : candidates('CHANGE'), scenario === 'candidate-error' ? 503 : 200);
          assert.equal(await page.getByText('合成当前请求失败', { exact: true }).count(), 0);
          await openSubmit(); await selectObsolete();
        }
      } else if (scenario.startsWith('refresh-')) {
        await lookup('FR-A'); await respond(await startMode('OBSOLETE'), candidates('OBSOLETE'));
        await openSubmit(); await selectObsolete(); const refresh = await sign();
        await lookup('FR-B');
        await respond(refresh, scenario === 'refresh-error' ? null : { ...source('FR-A'), active_request_id: 'request-A' }, scenario === 'refresh-error' ? 503 : 200);
        assert.equal(await page.getByText('合成表单 FR-B', { exact: true }).count(), 1);
        assert.equal(await page.getByText('合成当前请求失败', { exact: true }).count(), 0);
      } else if (scenario.startsWith('discard-')) {
        await lookup('FR-A'); await respond(await startMode('CHANGE'), candidates('CHANGE'));
        await page.getByRole('textbox').filter({ visible: true }).nth(1).fill('保留的未提交拟数据');
        await input.fill('FR-B'); await input.press('Enter');
        const guard = page.getByRole('dialog', { name: '重新查询表单' }); await guard.waitFor();
        await assertEventually(() => guard.getByRole('button', { name: '取消', exact: true }).evaluate(el => el === document.activeElement), 'discard confirmation initially focuses cancel');
        assert.equal(calls.filter(call => call.number === 'FR-B').length, 0);
        if (scenario === 'discard-cancel') {
          await page.keyboard.press('Escape');
          assert.equal(await page.getByRole('textbox').nth(1).inputValue(), '保留的未提交拟数据');
          assert.equal(await page.getByText('合成表单 FR-A', { exact: true }).count(), 1);
        } else {
          await guard.getByRole('button', { name: '放弃修改并查询', exact: true }).click();
          await respond(await waitPending('record', 'FR-B'), source('FR-B'));
          await page.getByText('合成表单 FR-B', { exact: true }).waitFor();
          await page.getByRole('button', { name: '表单变更', exact: true }).waitFor();
          assert.equal(await page.getByRole('button', { name: '表单变更', exact: true }).count(), 1);
        }
      } else {
        await input.fill('FR-B'); await input.dispatchEvent('keydown', { key: 'Enter', code: 'Enter', isComposing: true });
        await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
        assert.equal(calls.length, 0, 'composition Enter must not query');
        await input.press('Enter'); await respond(await waitPending('record', 'FR-B'), source('FR-B'));
        await page.getByText('合成表单 FR-B', { exact: true }).waitFor();
      }
      assert.deepEqual(errors, []); assert.deepEqual(nativeDialogs, [], 'use maintained app confirmation, not window.confirm');
      assert.equal(writes.length, scenario.startsWith('refresh-') ? 1 : 0);
      if (artifacts) await page.screenshot({ path: path.join(artifacts, `${scenario}-${width}.png`), fullPage: true });
      results.push({ scenario, width, passed: true, calls, writeCount: writes.length, submitted });
    } catch (error) {
      if (artifacts) await page.screenshot({ path: path.join(artifacts, `${scenario}-${width}-failed.png`), fullPage: true });
      results.push({ scenario, width, passed: false, error: error.stack, calls, writeCount: writes.length, nativeDialogs, pageErrors: errors });
    } finally { await context.close(); }
  }
  const report = { qualification: 'Actual maintained RecordChangePage and API client with deferred synthetic API; no live business writes',
    tests: results.length, passed: results.filter(r => r.passed).length, failed: results.filter(r => !r.passed).length, results };
  if (artifacts) await writeFile(path.join(artifacts, 'result.json'), JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify(report));
  if (report.failed) process.exitCode = 1;
} finally {
  await browser?.close();
  if (server) await new Promise(resolve => server.close(resolve));
  await rm(temporary, { recursive: true, force: true });
}

async function assertEventually(check, message) {
  for (let tries = 0; tries < 100; tries++) {
    if (await check()) return;
    await new Promise(resolve => setTimeout(resolve, 20));
  }
  assert.fail(message);
}
