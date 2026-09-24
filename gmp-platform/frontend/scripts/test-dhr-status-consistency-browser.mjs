import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const user = { id: 1, username: 'status-qa', displayName: '状态验收', permissions: ['records.dhr-list', 'records.dhr-filling', 'production.work-orders'] };
const dhr = {
  id: 'dhr-1', dhrNo: 'DHR-STATUS-QA', productionObjectId: 'object-1', objectNo: 'BATCH-STATUS-QA', objectType: 'BATCH',
  workOrderNo: 'WO-STATUS-QA', productName: '测试产品', productCode: 'PRODUCT-QA', status: 'EARLY_TERMINATED', displayStatus: 'TERMINATED',
  productionStatus: 'EARLY_TERMINATED', summaryStatus: 'NOT_STARTED', createdAt: '2026-09-23T10:00:00',
};
const workOrder = {
  id: 'wo-1', orderNo: 'WO-STATUS-QA', productName: '测试产品', productCode: 'PRODUCT-QA', processVersion: 'V1',
  productionMode: 'MASS', productionForm: 'BATCH', plannedQuantity: 1, status: 'EARLY_TERMINATED', createdAt: '2026-09-23T10:00:00',
};
const queries = [];
const requestedPaths = [];
const browser = await chromium.launch({ headless: true, executablePath: process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' });
try {
  const context = await browser.newContext({ viewport: { width: 1440, height: 960 } });
  await context.addInitScript(({ user }) => {
    localStorage.setItem('token', 'isolated-status-qa');
    localStorage.setItem('user', JSON.stringify(user));
  }, { user });
  await context.route('**/api/v1/**', route => {
    const request = route.request();
    const url = new URL(request.url());
    const path = url.pathname.replace(/^\/api\/v1/, '');
    requestedPaths.push(path);
    let data;
    if (path === '/auth/me') data = user;
    else if (path === '/system/menu-configuration') data = { modules: [], configured: false };
    else if (path.startsWith('/system/settings')) data = { systemName: 'DHR QA', browserTitle: 'DHR QA' };
    else if (path === '/dhr-instances' || path === '/dhr-filling') {
      queries.push({ path, displayStatus: url.searchParams.get('displayStatus'), status: url.searchParams.get('status') });
      data = { content: [dhr], totalElements: 1, totalPages: 1 };
    } else if (path === '/dhr-instances/dhr-1') {
      data = { ...dhr, terminationAt: '2026-09-23T10:00:00', terminationReason: '历史终止原因', terminatedBy: null,
        terminationSnapshotAvailable: false, dhrTemplateName: '测试模板', directorySnapshot: { directories: [] },
        recordsByOrigin: { directory: [], work: [], custom: [] }, evidenceSummary: { itemCount: 0, suppliedItemCount: 0, recordCount: 0, unmappedRecordCount: 0 } };
    } else if (path === '/dhr-filling/dhr-1') {
      data = { objectStatus: 'EARLY_TERMINATED', orderStatus: 'EARLY_TERMINATED', revision: 1,
        directorySnapshot: { directories: [] }, snapshot: { operations: [] }, state: { operations: {} }, availability: {} };
    } else if (path === '/production/work-orders') data = { content: [workOrder], totalElements: 1, totalPages: 1 };
    else if (request.method() === 'GET') data = { content: [], totalElements: 0, totalPages: 0 };
    else throw new Error(`Unexpected write: ${request.method()} ${path}`);
    return route.fulfill({ status: 200, json: { code: 200, message: 'OK', data } });
  });
  const page = await context.newPage();
  const base = process.env.DHR_QA_URL || 'http://localhost:3000';
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));

  for (const [path, apiPath] of [['/dhr-management/list', '/dhr-instances'], ['/dhr-management/filling', '/dhr-filling']]) {
    await page.goto(base + path);
    if (apiPath === '/dhr-filling') {
      await page.locator('tbody tr').filter({ hasText: 'DHR-STATUS-QA' }).waitFor();
      assert.ok(queries.some(query => query.path === apiPath && query.displayStatus === 'FILLING'), 'Filling must focus active records by default');
      await page.getByRole('combobox', { name: 'DHR 状态' }).click();
      await page.getByRole('option', { name: '已终止' }).click();
      await page.getByRole('button', { name: '查询' }).click();
    }
    await page.locator('tbody tr').filter({ hasText: 'DHR-STATUS-QA' }).waitFor({ timeout: 10000 }).catch(async error => {
      throw new Error(`${error.message}\nVisited ${page.url()}\nAPI paths: ${requestedPaths.join(', ')}\nPage: ${(await page.locator('body').innerText()).slice(0, 1500)}\nPage errors: ${errors.join(' | ')}`);
    });
    assert.equal(await page.getByRole('columnheader', { name: '生产对象' }).count(), 1);
    assert.equal(await page.getByRole('columnheader', { name: 'DHR 状态' }).count(), 1);
    const row = page.locator('tbody tr').filter({ hasText: 'DHR-STATUS-QA' });
    assert.match(await row.innerText(), /BATCH-STATUS-QA.*批次/);
    assert.match(await row.innerText(), /已终止/);
    assert.doesNotMatch(await row.innerText(), /收集中|已完工|EARLY_TERMINATED/);
    assert.equal(await row.getByRole('cell').filter({ hasText: '已终止' }).locator('.MuiChip-root').evaluate(element => getComputedStyle(element).backgroundColor), 'rgb(255, 235, 238)');
    const objectCell = row.getByRole('cell').filter({ hasText: 'BATCH-STATUS-QA' });
    assert.equal(await objectCell.evaluate(element => getComputedStyle(element).fontWeight), '400');
    await page.getByRole('combobox', { name: 'DHR 状态' }).click();
    await page.getByRole('option', { name: '已终止' }).click();
    await Promise.all([
      page.waitForResponse(response => {
        const url = new URL(response.url());
        return url.pathname === `/api/v1${apiPath}` && url.searchParams.get('displayStatus') === 'TERMINATED';
      }),
      page.getByRole('button', { name: '查询' }).click(),
    ]);
    assert.ok(queries.some(query => query.path === apiPath && query.displayStatus === 'TERMINATED' && !query.status), `Filter must use displayStatus on ${path}`);
    if (apiPath === '/dhr-instances') {
      await page.getByRole('cell', { name: '查看 DHR-STATUS-QA 详情' }).getByRole('button').click();
      await page.getByText('原操作人：历史记录未留存。', { exact: false }).waitFor();
      await page.getByText('此历史记录缺少终止时证据快照', { exact: false }).waitFor();
      await page.getByRole('button', { name: '关闭 DHR 详情' }).click();
    } else {
      await page.getByRole('button', { name: '查看已终止 DHR DHR-STATUS-QA' }).click();
      await page.getByText('原操作人：历史记录未留存。', { exact: false }).waitFor();
      await page.getByText('此历史记录缺少终止时证据快照', { exact: false }).waitFor();
      await page.getByText('不能据此还原终止时现场', { exact: false }).waitFor();
      await page.getByRole('dialog').getByRole('button', { name: '关闭', exact: true }).last().click();
    }
  }

  for (const [status, displayStatus, summaryStatus, label, background] of [
    ['IN_PROGRESS', 'FILLING', 'NOT_STARTED', '填报中', 'rgb(255, 248, 225)'],
    ['COMPLETED', 'PENDING_SUMMARY', 'NOT_STARTED', '待汇总', 'rgb(227, 242, 253)'],
    ['COMPLETED', 'FINALIZED', 'FORMALIZED', '已完成', 'rgb(232, 245, 233)'],
  ]) {
    dhr.status = status;
    dhr.productionStatus = status;
    dhr.displayStatus = displayStatus;
    dhr.summaryStatus = summaryStatus;
    for (const path of ['/dhr-management/list', '/dhr-management/filling']) {
      await page.goto(base + path);
      const badge = page.locator('tbody tr').filter({ hasText: 'DHR-STATUS-QA' }).getByRole('cell').filter({ hasText: label }).locator('.MuiChip-root');
      await badge.waitFor();
      assert.equal(await badge.innerText(), label);
      assert.equal(await badge.evaluate(element => getComputedStyle(element).backgroundColor), background);
    }
  }

  await page.goto(base + '/production/work-orders');
  const orderRow = page.getByRole('row').filter({ hasText: 'WO-STATUS-QA' });
  await orderRow.waitFor();
  assert.match(await orderRow.innerText(), /提前结束/);
  assert.doesNotMatch(await orderRow.innerText(), /EARLY_TERMINATED/);
  await orderRow.click();
  await page.getByText('信息查看', { exact: true }).waitFor();
  assert.match(await page.getByText('工单状态', { exact: true }).locator('..').innerText(), /提前结束/);
  assert.doesNotMatch(await page.getByText('工单状态', { exact: true }).locator('..').innerText(), /EARLY_TERMINATED/);
  assert.deepEqual(errors, []);
  console.log('PASS DHR lifecycle labels, filling default, historical views, filters, and work-order termination label');
} finally {
  await browser.close();
}
