import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { build } from 'esbuild';
const { chromium } = createRequire(import.meta.url)('playwright');
const root = path.resolve(import.meta.dirname, '..');
const temporary = await mkdtemp(path.join(os.tmpdir(), 'workflow-list-ui-'));
const artifacts = process.env.WORKFLOW_LIST_ARTIFACTS;
const results = [];
let browser, server;
const instanceId = '900000000000000001';
const taskA = '900000000000000101', taskB = '900000000000000102';
try {
  const app = await readFile(path.join(root, 'src/App.tsx'), 'utf8');
  const start = app.indexOf('const theme = createTheme('), end = app.indexOf('\n});', start);
  assert.ok(start >= 0 && end > start);
  await build({ absWorkingDir: root, stdin: { resolveDir: root, loader: 'tsx', contents: `
    import React from 'react'; import { createRoot } from 'react-dom/client';
    import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
    import { ThemeProvider, CssBaseline } from '@mui/material';
    import { MemoryRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
    import { SnackbarProvider } from './src/components/SnackbarProvider';
    import InstanceList from './src/pages/workflow-center/InstanceList';
    import RecordRequestListPage from './src/pages/record-control/RecordRequestListPage';
    import RecordApprovalPage from './src/pages/record-control/RecordApprovalPage';
    import DhrAuditTrail from './src/pages/dhr-management/DhrAuditTrail';
    import { isAuditForForm, toProductionAuditFields } from './src/utils/productionAudit';
    import theme from 'workflow-test-theme'; import './src/index.css';
    function Destination() { return <div data-testid='destination'>{useLocation().pathname}</div>; }
    function Pages() { window.__navigate = useNavigate(); return <Routes>
      <Route path='/workflow/interventions' element={<InstanceList intervention />} />
      <Route path='/workflow/instances' element={<InstanceList />} />
      <Route path='/records/mine' element={<RecordRequestListPage scope='mine' />} />
      <Route path='/records/history' element={<RecordRequestListPage scope='all' />} />
      <Route path='/records/approvals' element={<RecordApprovalPage />} />
      <Route path='/records/requests/:id' element={<Destination />} />
      <Route path='/records/approvals/:taskId/:requestId' element={<Destination />} />
      <Route path='/audit-proof' element={<><DhrAuditTrail source='summary' id='1' /><div data-testid='form-audit-proof'>{toProductionAuditFields(JSON.stringify({previousAssigneeName:'原审批甲',assigneeName:'新审批乙',signatureId:'sig-proof',signerName:'签署管理员',reason:'合成审计原因'})).map(field => <p key={field.key}>{field.label}：{field.value}</p>)}</div></>} />
    </Routes>; }
    window.__auditIdentityProof = [isAuditForForm({action:'REASSIGN',contentAfter:'{"formId":"f","copyId":"copy-1"}'},{formId:'f',copyId:'copy-1'}),isAuditForForm({action:'REASSIGN',contentAfter:'{"formId":"f","copyId":"copy-2"}'},{formId:'f',copyId:'copy-1'}),isAuditForForm({action:'UPDATE',contentAfter:'{}'},{formId:'f',copyId:'copy-1'})];
    createRoot(document.getElementById('root')).render(<ThemeProvider theme={theme}><CssBaseline />
      <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { staleTime: 30000, retry: false, refetchOnWindowFocus: false } } })}>
      <SnackbarProvider><MemoryRouter initialEntries={[new URLSearchParams(location.search).get('route') || '/workflow/interventions']}><Pages /></MemoryRouter></SnackbarProvider>
      </QueryClientProvider></ThemeProvider>);
  ` }, bundle: true, platform: 'browser', format: 'esm', outfile: path.join(temporary, 'bundle.js'),
    alias: { '@': path.join(root, 'src'), '@mui/icons-material': path.join(root, 'node_modules/@mui/icons-material/esm') },
    loader: { '.css': 'css', '.svg': 'dataurl', '.png': 'dataurl', '.woff2': 'file', '.ttf': 'file' },
    define: { 'process.env.NODE_ENV': '"development"', 'import.meta.env': '{"DEV":true,"PROD":false}' },
    plugins: [{ name: 'workflow-test-theme', setup(plugin) {
      plugin.onResolve({ filter: /^workflow-test-theme$/ }, () => ({ path: 'theme', namespace: 'theme' }));
      plugin.onLoad({ filter: /.*/, namespace: 'theme' }, () => ({ contents: `import { createTheme } from '@mui/material/styles'; import { listTableHeaderCellStyle } from './src/components/listTableStyles'; ${app.slice(start, end + 4)}\nexport default theme;`, loader: 'tsx', resolveDir: root }));
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
  for (const width of [1440, 390]) for (const scenario of ['single', 'parallel', 'none', 'ended', 'load-error', 'settings', 'unauthorized', 'unknown', 'empty', 'list-error', 'loading', 'history', 'reopen', 'record-mine', 'record-history', 'record-todo', 'record-done', 'form', 'dhr', 'domain-audit']) {
    const domain = scenario === 'form' || scenario === 'dhr';
    const currentId = scenario === 'form' ? 'form-900000000000000001' : instanceId;
    const currentTask = scenario === 'form' ? currentId + ':review' : taskA;
    const businessKey = scenario === 'form' ? 'FR-UI-001' : scenario === 'dhr' ? 'DHR-UI-001 · V2' : 'RC-UI-CHANGE';
    const businessType = scenario === 'form' ? 'FORM_PROCESS' : scenario === 'dhr' ? 'DHR_SUMMARY' : 'CHANGE';
    const businessLabel = scenario === 'form' ? '普通表单流程' : scenario === 'dhr' ? 'DHR 汇总审批' : '表单变更';
    const context = await browser.newContext({ viewport: { width, height: 960 } });
    await context.addInitScript(({ permitted }) => {
      localStorage.setItem('token', 'synthetic-test-token');
      localStorage.setItem('user', JSON.stringify({ id: 'ui-test-user', username: 'ui-test', displayName: '合成管理员', permissions: permitted ? ['workflow.intervene'] : ['workflow.instances'] }));
    }, { permitted: scenario !== 'unauthorized' });
    const page = await context.newPage(); page.setDefaultTimeout(6000);
    const errors = [], writes = [];
    let attempts = 0, release;
    const delayed = new Promise(resolve => { release = resolve; });
    page.on('pageerror', error => errors.push(error.message));
    await context.route('**/api/v1/**', async route => {
      const request = route.request(), url = new URL(request.url()), endpoint = url.pathname;
      const send = (data, status = 200) => route.fulfill({ status, json: { code: status, data, message: status === 200 ? '' : '合成读取错误' } });
      if (endpoint === '/api/v1/dhr-instances/1/summary/audit') return send({events:[{id:'audit-proof',entityType:'DHR_SUMMARY_REVIEW',action:'REASSIGN',functionName:'重新分配',operator:'签署管理员',at:'2026-11-02T10:00:00',reason:'合成审计原因',before:JSON.stringify({assigneeName:'原审批甲'}),after:JSON.stringify({previousAssigneeName:'原审批甲',assigneeName:'新审批乙',signatureId:'sig-proof',signerName:'签署管理员'})}],total:1,page:0});
      const record = { id: 'record-request', request_no: 'RC-ICON-001', request_type: 'CHANGE', status: 'IN_REVIEW', workflow_instance_id: instanceId, instance_no: 'FR-ICON-001', template_name: '图标验收表单', template_code: 'ICON-001', applicant_name: '合成申请人', submitted_at: '2026-11-02T10:00:00' };
      if (endpoint === '/api/v1/record-control/requests/for-my-workflow-tasks') return send([record]);
      if (endpoint === '/api/v1/record-control/requests') return send({ content: [record], totalElements: 1, totalPages: 1 });
      if (endpoint === '/api/v1/record-control/workflow-tasks') return send({ content: [{ id: taskA, instanceId, status: url.searchParams.get('scope') === 'todo' ? 'PENDING' : 'COMPLETED', createdAt: '2026-11-02T10:00:00', completedAt: '2026-11-02T11:00:00' }], totalElements: 1, totalPages: 1 });
      if (request.method() === 'POST') {
        writes.push({ endpoint, body: request.postDataJSON() });
        return send(null);
      }
      if (endpoint.endsWith('/reassignment-targets')) return send([{ id: 'target', name: '验收乙', username: 'target' }]);
      if (endpoint === '/api/v1/workflow/operations/instances') {
        if (scenario === 'list-error') return send(null, 503);
        const row = { id: currentId, templateName: '同名审批模板', businessKey, businessType: scenario === 'unknown' ? 'LEGACY_TYPE' : businessType, status: 'RUNNING', startUserName: '合成申请人', startTime: '2026-11-02T10:00:00', endTime: null };
        return send({ content: scenario === 'empty' ? [] : [row, { ...row, id: '900000000000000002', businessKey: 'RC-UI-VOID', businessType: scenario === 'unknown' ? null : 'OBSOLETE' }], totalElements: scenario === 'empty' ? 0 : 2, totalPages: 1 });
      }
      if (endpoint.startsWith('/api/v1/workflow/operations/instances/')) {
        attempts++;
        if (scenario === 'load-error' && attempts === 1) return send(null, 503);
        if (scenario === 'loading') await delayed;
        const task = (id, nodeId, status, assigneeName) => ({ id, nodeId, status, assigneeName, taskState: `state-${id}`, signatureId: null, opinion: null, action: null });
        const active = scenario === 'none' || (scenario === 'reopen' && attempts > 1) ? [] : [task(currentTask, 'n1', 'PENDING', '甲审批人'), ...(scenario === 'parallel' ? [task(taskB, 'n2', 'PROCESSING', '乙审批人')] : [])];
        return send({ id: currentId, templateName: '同名审批模板', businessKey, businessType, status: scenario === 'ended' ? 'COMPLETED' : 'RUNNING', startUserName: '合成申请人', startTime: '2026-11-02T10:00:00', endTime: null,
          tasks: [task('old-task', 'old', 'COMPLETED', '已办人'), ...active], logs: [], edges: [],
          nodes: [{ id: 'n1', name: '甲复核', type: 'APPROVAL', positionX: 0, positionY: 0 }, { id: 'n2', name: '乙复核', type: 'APPROVAL', positionX: 200, positionY: 0 }, { id: 'old', name: '已办步骤', type: 'APPROVAL', positionX: 400, positionY: 0 }] });
      }
      throw new Error(`Unexpected fixture endpoint: ${endpoint}`);
    });
    const header = name => page.locator('thead th').filter({ hasText: new RegExp(`^${name}$`) });
    const row = page.getByRole('row').filter({ has: page.getByRole('cell', { name: businessKey, exact: true }) });
    const navigate = url => page.evaluate(url => window.__navigate(url), url);
    const outcome = { scenario, width, passed: false };
    try {
      const recordScenario = scenario.startsWith('record-');
      const recordRoute = scenario === 'record-mine' ? '/records/mine' : scenario === 'record-history' ? '/records/history' : '/records/approvals';
      await page.goto(`http://127.0.0.1:${server.address().port}/${recordScenario ? '?route=' + encodeURIComponent(recordRoute) : scenario === 'domain-audit' ? '?route=%2Faudit-proof' : ''}`);
      if (scenario === 'domain-audit') {
        await page.getByText('重新分配', { exact: true }).waitFor();
        await page.getByText('签署管理员 · 汇总审批', { exact: true }).waitFor();
        await page.getByRole('button', { name: /重新分配/ }).click();
        await page.getByText('新审批乙', { exact: true }).waitFor();
        assert.deepEqual(await page.evaluate(() => window.__auditIdentityProof), [true,false,true]);
        for (const text of ['原处理人：原审批甲','处理人：新审批乙','签名标识：sig-proof','签署人：签署管理员','原因：合成审计原因']) await page.getByTestId('form-audit-proof').getByText(text,{exact:true}).waitFor();
      } else if (recordScenario) {
        if (scenario === 'record-done') await page.getByRole('tab', { name: '已办任务', exact: true }).click();
        const recordRow = page.locator('tbody tr').filter({ has: page.getByRole('cell', { name: 'RC-ICON-001', exact: true }) });
        await recordRow.waitFor();
        const approval = scenario === 'record-todo' || scenario === 'record-done';
        const actionCell = recordRow.locator('td').last();
        assert.equal(await header('操作').evaluate(el => Math.round(el.getBoundingClientRect().width)), approval ? 96 : 64);
        assert.equal(await header('操作').evaluate(el => Math.round(el.getBoundingClientRect().height)), 48);
        assert.equal(await recordRow.evaluate(el => Math.round(el.getBoundingClientRect().height)), 40);
        assert.equal(await actionCell.evaluate(el => getComputedStyle(el).position), 'sticky');
        assert.equal((await actionCell.innerText()).trim(), '', 'list action text belongs in Tooltip and aria-label');
        assert.equal(await actionCell.getByRole('button').count(), scenario === 'record-todo' ? 2 : 1);
        const view = actionCell.getByRole('button', { name: approval ? '查看申请' : '查看详情', exact: true });
        await view.getByTestId('VisibilityOutlinedIcon').waitFor();
        await view.hover(); await page.getByRole('tooltip', { name: approval ? '查看申请' : '查看详情', exact: true }).waitFor();
        if (scenario === 'record-todo') await actionCell.getByRole('button', { name: '审批处理', exact: true }).getByTestId('RateReviewOutlinedIcon').waitFor();
        if (artifacts) await page.screenshot({ path: path.join(artifacts, `${scenario}-${width}-icons.png`), fullPage: true, animations: 'disabled' });
        await view.click(); assert.equal(await page.getByTestId('destination').innerText(), '/records/requests/record-request');
        if (scenario === 'record-todo') {
          await navigate(recordRoute); await recordRow.waitFor();
          await recordRow.getByRole('button', { name: '审批处理', exact: true }).focus(); await page.keyboard.press('Enter');
          assert.equal(await page.getByTestId('destination').innerText(), `/records/approvals/${taskA}/record-request`);
        }
        assert.equal(writes.length, 0, 'icon navigation must not submit a business action');
      } else {
      await header('业务类型').waitFor();
      if (scenario === 'empty' || scenario === 'list-error') {
        await page.getByText(scenario === 'empty' ? '暂无数据' : '加载失败', { exact: false }).waitFor();
        assert.equal(await page.locator('tbody td').getAttribute('colspan'), '8');
      } else {
        await row.waitFor();
        assert.equal(await header('操作').evaluate(el => Math.round(el.getBoundingClientRect().height)), 48);
        assert.equal(await header('操作').evaluate(el => Math.round(el.getBoundingClientRect().width)), 64);
        assert.equal(await row.evaluate(el => Math.round(el.getBoundingClientRect().height)), 40);
        assert.equal(await header('操作').evaluate(el => getComputedStyle(el).position), 'sticky');
        if (scenario !== 'unauthorized') {
          const action = row.getByRole('button', { name: '重新分配', exact: true });
          assert.equal((await action.innerText()).trim(), ''); await action.getByTestId('AssignmentIndOutlinedIcon').waitFor();
        }
        if (scenario === 'settings') {
          await page.getByRole('button', { name: '字段设置', exact: true }).click();
          await page.getByRole('checkbox', { name: '发起人字段显隐' }).uncheck();
          await page.locator('[draggable="true"]').filter({ hasText: '业务编号' }).dragTo(page.locator('[draggable="true"]').filter({ hasText: '业务类型' }));
          await page.keyboard.press('Escape'); assert.equal(await header('发起人').count(), 0);
          assert.equal((await page.getByRole('columnheader').allTextContents())[0], '业务编号');
          await page.locator('input[aria-label="发起人字段显隐"]').waitFor({ state: 'detached' });
          const handle = page.getByLabel('调整流程名称列宽'); await handle.scrollIntoViewIfNeeded(); const box = await handle.boundingBox();
          await page.mouse.move(box.x + 3, box.y + 20); await page.mouse.down(); await page.mouse.move(box.x + 103, box.y + 20); await page.mouse.up();
          await page.waitForFunction(() => JSON.parse(localStorage.getItem('workflow-interventions-list-column-widths:ui-test-user')).templateName > 200);
          await navigate('/workflow/instances'); await header('发起人').waitFor(); assert.equal(await header('操作').count(), 0);
          await navigate('/workflow/interventions'); await row.waitFor(); assert.equal(await header('发起人').count(), 0);
          await page.reload(); await row.waitFor(); assert.equal(await header('发起人').count(), 0);
          await page.evaluate(() => { const user = JSON.parse(localStorage.getItem('user')); user.id = 'another-user'; localStorage.setItem('user', JSON.stringify(user)); window.dispatchEvent(new Event('edhr:auth-user-change')); });
          await header('发起人').waitFor();
        } else if (scenario === 'unauthorized') assert.equal(await row.getByRole('button', { name: '重新分配', exact: true }).count(), 0);
        else if (scenario === 'unknown') { await page.getByRole('cell', { name: '其他业务（LEGACY_TYPE）' }).waitFor(); await page.getByRole('cell', { name: '未标注业务类型' }).waitFor(); }
        else if (scenario === 'history') {
          await row.getByRole('cell', { name: 'RC-UI-CHANGE', exact: true }).click();
          const drawer = page.getByRole('dialog', { name: '流程干预详情' }); await drawer.getByText('业务类型：表单变更', { exact: true }).waitFor();
          assert.equal(await drawer.getByText('已办步骤 · 已办人', { exact: true }).count(), 0);
          await drawer.getByRole('tab', { name: '数据审计', exact: true }).click();
          await drawer.getByText('业务类型：表单变更', { exact: true }).waitFor();
          await drawer.getByText('申请编号：RC-UI-CHANGE', { exact: true }).waitFor();
          await page.getByRole('button', { name: '关闭流程干预详情' }).click(); await navigate('/workflow/instances');
          await row.getByRole('cell', { name: 'RC-UI-CHANGE', exact: true }).click(); await page.getByText('已办步骤 · 已办人', { exact: true }).waitFor();
          const logDrawer = page.getByRole('dialog', { name: '流程日志详情' });
          await logDrawer.getByRole('tab', { name: '数据审计', exact: true }).click();
          await logDrawer.getByText('业务类型：表单变更', { exact: true }).waitFor();
          await logDrawer.getByText('申请编号：RC-UI-CHANGE', { exact: true }).waitFor();
        } else {
          await row.getByRole('button', { name: '重新分配', exact: true }).focus(); await page.keyboard.press('Enter');
          if (scenario === 'loading') { await page.getByRole('progressbar').waitFor(); release(); }
          if (scenario === 'load-error') { await page.getByText('当前任务加载失败', { exact: true }).waitFor(); await page.getByRole('button', { name: '重试', exact: true }).click(); }
          if (scenario === 'none' || scenario === 'ended') await page.getByText(scenario === 'none' ? '暂无可重新分配的当前任务' : '该流程已结束，无法重新分配', { exact: true }).waitFor();
          else {
            if (scenario === 'parallel') { await page.getByRole('button', { name: `选择任务 ${taskB}`, exact: true }).click(); assert.equal(await page.getByRole('button', { name: '选择任务 old-task' }).count(), 0); }
            await page.getByRole('textbox', { name: '电子签名密码', exact: true }).waitFor();
            await page.getByText(`${businessLabel} · ${businessKey}`, { exact: true }).waitFor();
            assert.equal(await page.getByRole('dialog', { name: '流程干预详情' }).count(), 0, 'row action must not bubble into detail drawer');
            const submit = page.getByRole('button', { name: '签署并重新分配', exact: true }); assert.ok(await submit.isDisabled());
            if (scenario === 'reopen') {
              await page.getByRole('button', { name: '取消', exact: true }).click();
              await page.getByRole('dialog', { name: '重新分配', exact: true }).waitFor({ state: 'hidden' });
              await row.getByRole('button', { name: '重新分配', exact: true }).click();
              await page.getByText('暂无可重新分配的当前任务', { exact: true }).waitFor();
              assert.equal(attempts, 2, 'reopen must refresh even within the maintained 30-second query freshness window');
              assert.equal(await page.getByRole('textbox', { name: '电子签名密码', exact: true }).count(), 0);
            }
            if (scenario === 'single' || scenario === 'parallel' || domain) {
              await page.getByRole('combobox', { name: '新处理人' }).click(); await page.getByRole('option', { name: /验收乙/ }).click();
              await page.getByRole('textbox', { name: '重新分配原因' }).fill('合成页面验收原因');
              assert.ok(await submit.isDisabled(), 'signature is required');
              await page.getByRole('textbox', { name: '签署人用户名', exact: true }).fill('synthetic-signer');
              await page.getByRole('textbox', { name: '电子签名密码', exact: true }).fill('synthetic-signature');
              await submit.click(); await page.getByText('重新分配成功', { exact: true }).waitFor();
              assert.equal(writes.length, 1); const expected = scenario === 'parallel' ? taskB : currentTask;
              assert.equal(writes[0].endpoint, `/api/v1/workflow/operations/tasks/${encodeURIComponent(expected)}/reassign`);
              assert.equal(writes[0].body.expectedTaskState, `state-${expected}`); assert.equal(writes[0].body.targetUserId, 'target');
            }
          }
        }
      }
      }
      assert.deepEqual(errors, []); outcome.passed = true;
    } catch (error) { outcome.error = error.stack.split('\n').slice(0, 7).join('\n'); }
    finally {
      release();
      if (artifacts) await page.screenshot({ path: path.join(artifacts, `${scenario}-${width}.png`), fullPage: true, animations: 'disabled' });
      await context.close();
    }
    results.push(outcome);
  }
} finally {
  if (browser) await browser.close();
  if (server) await new Promise(resolve => server.close(resolve));
  await rm(temporary, { recursive: true, force: true });
}
const report = { qualification: 'Actual maintained list/detail/dialog/theme and API client with synthetic intercepted API; no live backend or database mutation.', tests: results.length, passed: results.filter(row => row.passed).length, failed: results.filter(row => !row.passed).length, results };
if (artifacts) await writeFile(path.join(artifacts, 'result.json'), JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify(report));
if (report.failed) process.exitCode = 1;
