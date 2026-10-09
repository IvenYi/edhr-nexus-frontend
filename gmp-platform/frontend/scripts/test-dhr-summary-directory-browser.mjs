// Isolated browser regression for the current archive/source navigation and draft guard.
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_PACKAGE || 'playwright');
const user = { id: 1, username: 'dhr-qa', displayName: 'DHR 隔离测试', permissions: ['records.dhr-summary', 'dhr.summaries.edit', 'dhr.summaries.submit', 'dhr.instances.view'] };
const record = (id, originKind, title, snapshot) => ({
  id, instanceNo: `FR-QA-${id}`, templateId: '700', templateVersionId: '701', templateName: title,
  templateVersion: 'V1', originKind, status: 'COMPLETED', operationId: 'op-1', operationName: '工序一',
  formId: `${originKind}-${id}`, copyId: `${originKind}-${id}`, snapshot: { name: title, fields: [], ...snapshot }, fieldValues: {},
});
const directoryRecord = record('101', 'DIRECTORY', '目录记录', { dhrItemId: '201' });
const workRecord = record('102', 'WORK', '作业记录', { workId: '11', workNodeId: 'node-A' });
const customRecord = record('103', 'CUSTOM', '自定义记录', { sourceType: 'CUSTOM' });
const records = [directoryRecord, workRecord, customRecord];
const dhr = {
  id: '1', dhrNo: 'DHR-ISOLATED-TREE', objectNo: 'QA-BATCH', objectType: 'BATCH', workOrderNo: 'QA-ORDER',
  productCode: 'QA', productName: '隔离测试产品', status: 'COMPLETED', summaryStatus: 'DRAFT', dhrReviewMode: 'NONE',
  completedAt: '2026-09-23T00:00:00', directorySnapshot: { directories: [{ id: '11', parentId: null, name: '生产记录', items: [
    { id: '201', displayName: '目录记录', required: true, records: [directoryRecord] },
  ] }] },
};
let draft = { id: '10', revision: 1, overlayDirectories: [], placements: [] };
let saveCount = 0;
const browser = await chromium.launch({ headless: true, executablePath: process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' });
try {
  const context = await browser.newContext({ viewport: { width: 1600, height: 960 } });
  context.setDefaultTimeout(15000);
  await context.addInitScript((currentUser) => {
    localStorage.setItem('token', 'isolated-qa');
    localStorage.setItem('user', JSON.stringify(currentUser));
  }, user);
  await context.route('**/api/v1/**', async (route) => {
    const path = new URL(route.request().url()).pathname.replace(/^\/api\/v1/, '');
    let data;
    if (path === '/auth/me') data = user;
    else if (path === '/system/menu-configuration') data = { modules: [], configured: false };
    else if (path.startsWith('/system/settings')) data = { systemName: 'DHR 隔离测试', browserTitle: 'DHR QA' };
    else if (path === '/dhr-instances/summary-list') data = { content: [dhr], totalElements: 1, totalPages: 1, page: 0, size: 20 };
    else if (path === '/dhr-instances/1/summary' && route.request().method() === 'GET') {
      data = { dhr, draft, candidates: records, attachments: [], versions: [], sourceScopeHash: 'isolated-scope' };
    } else if (path === '/dhr-instances/1/summary/draft' && route.request().method() === 'PUT') {
      const command = route.request().postDataJSON();
      assert.equal(command.expectedScopeHash, 'isolated-scope');
      assert.equal(command.revision, draft.revision);
      draft = { id: draft.id, revision: draft.revision + 1, overlayDirectories: command.overlayDirectories, placements: command.placements };
      saveCount++;
      data = { id: draft.id, revision: draft.revision };
    } else {
      assert.equal(route.request().method(), 'GET', `Unexpected business write: ${path}`);
      data = { content: [], totalElements: 0, totalPages: 0 };
    }
    await route.fulfill({ status: 200, json: { code: 200, message: 'OK', data } });
  });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto(process.env.DHR_QA_URL || 'http://[::1]:3000/dhr-management/summary');
  const open = () => page.getByRole('button', { name: '进入汇总 DHR-ISOLATED-TREE' }).click();
  await open();
  await page.getByRole('button', { name: '收起汇总概览' }).click();
  await page.getByRole('button', { name: '展开汇总概览' }).click();
  assert.equal(await page.getByRole('button', { name: '档案目录', exact: true }).getAttribute('aria-pressed'), 'true');
  await page.getByRole('button', { name: '按来源' }).click();
  await page.getByRole('tab', { name: '作业表单' }).click();
  await page.getByRole('button', { name: '查看表单 作业记录' }).waitFor();
  await page.getByRole('tab', { name: '自定义表单' }).click();
  await page.getByRole('button', { name: '查看表单 自定义记录' }).waitFor();
  await page.getByRole('button', { name: '档案目录', exact: true }).click();
  await page.getByRole('button', { name: '查看表单 目录记录' }).waitFor();

  await page.getByRole('button', { name: '整理目录' }).click();
  await page.locator('[data-summary-sources]').waitFor();
  await page.getByRole('button', { name: '新增根目录' }).click();
  await page.getByRole('textbox', { name: '目录名称' }).fill('附录');
  await page.getByRole('button', { name: '确定', exact: true }).click();
  await page.locator('[data-summary-directory]').getByText('附录', { exact: true }).waitFor();
  await page.getByRole('dialog', { name: '新增汇总目录' }).waitFor({ state: 'hidden' });
  assert.equal(draft.overlayDirectories.length, 0, 'a new directory remains local before saving');
  await page.getByRole('button', { name: '关闭', exact: true }).focus();
  await page.keyboard.press('Enter');
  await page.getByText('放弃未保存的汇总调整？').waitFor();
  await page.getByRole('button', { name: '继续整理' }).click();
  await page.locator('[data-summary-directory]').getByText('附录', { exact: true }).waitFor();
  await page.getByRole('button', { name: '保存草稿', exact: true }).click();
  await page.getByText('汇总草稿已保存').waitFor();
  assert.equal(saveCount, 1);
  assert.equal(draft.overlayDirectories.find((entry) => entry.name === '附录')?.parentKey, null);
  await page.getByRole('button', { name: '关闭', exact: true }).focus();
  await page.keyboard.press('Enter');
  await page.getByRole('button', { name: '进入汇总 DHR-ISOLATED-TREE' }).waitFor();
  await open();
  await page.getByRole('button', { name: '整理目录' }).click();
  await page.locator('[data-summary-directory]').getByText('附录', { exact: true }).waitFor();
  const appendix = draft.overlayDirectories.find((entry) => entry.name === '附录').key;
  const appendixTarget = page.locator('[data-summary-directory]').getByRole('button', { name: '附录', exact: true });
  await page.locator('[data-source-key]').filter({ hasText: '作业记录' }).locator('[data-source-drag]').dragTo(appendixTarget);
  await page.getByRole('button', { name: '自定义 · 1 项' }).click();
  await page.locator('[data-source-key]').filter({ hasText: '自定义记录' }).locator('[data-source-drag]').dragTo(appendixTarget);
  await page.locator('[data-summary-record="102"]').waitFor();
  await page.locator('[data-summary-record="103"]').dragTo(page.locator('[data-summary-record="102"]'), {
    targetPosition: { x: 12, y: 4 },
  });
  await page.getByRole('button', { name: '重命名汇总 作业记录' }).click();
  await page.getByRole('textbox', { name: '文档名称' }).fill('作业归档记录');
  await page.getByRole('dialog', { name: '重命名汇总文档' }).getByRole('button', { name: '确定' }).click();
  await page.getByRole('button', { name: '保存草稿', exact: true }).click();
  await page.getByText('汇总草稿已保存').waitFor();
  assert.deepEqual(draft.placements.filter((entry) => entry.targetNodeKey === appendix).map((entry) => entry.recordId), ['103', '102']);
  assert.equal(draft.placements.find((entry) => entry.recordId === '102')?.displayName, '作业归档记录');
  await page.getByRole('button', { name: '关闭', exact: true }).focus();
  await page.keyboard.press('Enter');
  await open();
  await page.getByRole('button', { name: '整理目录' }).click();
  await page.locator('[data-summary-directory]').getByText('作业归档记录', { exact: true }).waitFor();
  const archiveOrder = await page.locator('[data-summary-record="103"], [data-summary-record="102"]').evaluateAll((nodes) => nodes.map((node) => node.getAttribute('data-summary-record')));
  assert.deepEqual(archiveOrder, ['103', '102']);
  assert.equal(errors.length, 0, errors.join('\n'));
  console.log('PASS archive/source navigation, unsaved guard, drag placement, row ordering, rename persistence, reopen');
} finally {
  await browser.close();
}
