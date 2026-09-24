// Isolated browser regression: all business API requests are intercepted.
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_PACKAGE || 'playwright');

const baseId = '377634999500804097';
const user = { id: 1, username: 'dhr-qa', displayName: 'DHR 隔离测试', permissions: ['records.dhr-summary', 'dhr.summaries.edit', 'dhr.summaries.submit', 'dhr.instances.view'] };
const record = (id, originKind, formId, copyId, title, extra = {}) => ({
  id, instanceNo: `FR-QA-${id}`, templateId: '700', templateVersionId: '701', templateName: title,
  templateVersion: 'V1', originKind, status: 'COMPLETED', operationId: 'op-1', operationName: '工序一',
  formId, copyId, snapshot: { name: title, fields: [], ...extra }, fieldValues: {},
});
const records = [
  record('101', 'DIRECTORY', 'dir-201', 'dir-201', '目录表格2', { dhrItemId: '201' }),
  record('102', 'DIRECTORY', 'dir-202', 'dir-202', '目录表格', { dhrItemId: '202' }),
  record('103', 'WORK', 'work-11-node-A', 'work-11-node-A', '作业表单', { workId: '11', workNodeId: 'node-A' }),
  record('105', 'WORK', 'work-11-node-A', 'work-11-node-A:copy:2', '作业表单', { workId: '11', workNodeId: 'node-A' }),
  record('106', 'WORK', 'work-11-node-B', 'work-11-node-B', '作业表单', { workId: '11', workNodeId: 'node-B' }),
  record('109', 'WORK', 'work-11-node-C', 'work-11-node-C', '作业表单', { workId: '11', workNodeId: 'node-C' }),
  { ...record('110', 'WORK', 'work-11-node-C', 'work-11-node-C:copy:2', '作业表单', { workId: '11', workNodeId: 'node-C' }), status: 'ACTIVE' },
  record('107', 'CUSTOM', 'custom-77', 'custom-77', '自定义表单', { sourceType: 'CUSTOM' }),
  record('108', 'CUSTOM', 'custom-77', 'custom-77:copy:2', '自定义表单', { sourceType: 'CUSTOM' }),
  record('111', 'CUSTOM', 'custom-78', 'custom-78', '自定义表单', { sourceType: 'CUSTOM' }),
];
const dhr = {
  id: '1', dhrNo: 'DHR-ISOLATED-TREE', objectNo: 'QA-BATCH', objectType: 'BATCH', workOrderNo: 'QA-ORDER',
  productCode: 'QA', productName: '隔离测试产品', status: 'COMPLETED', summaryStatus: 'DRAFT', dhrReviewMode: 'NONE',
  completedAt: '2026-09-23T00:00:00', directorySnapshot: { directories: [{ id: baseId, parentId: null, name: '生产记录', items: [
    { id: '201', displayName: '目录表格2', required: true, records: [records[0]] },
    { id: '202', displayName: '目录表格', required: true, records: [records[1]] },
  ] }] },
};
let draft = { id: '10', revision: 1, overlayDirectories: [], placements: [] };
let frozenVersion = null;
let debugPage;
const browser = await chromium.launch({ headless: true, executablePath: process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' });
try {
  const context = await browser.newContext({ viewport: { width: 1600, height: 1000 } });
  context.setDefaultTimeout(15000);
  await context.addInitScript((currentUser) => {
    localStorage.setItem('token', 'isolated-qa');
    localStorage.setItem('user', JSON.stringify(currentUser));
  }, user);
  await context.route('**/api/v1/**', async (route) => {
    const url = new URL(route.request().url());
    const path = url.pathname.replace(/^\/api\/v1/, '');
    let data;
    if (path === '/auth/me') data = user;
    else if (path === '/system/menu-configuration') data = { modules: [], configured: false };
    else if (path.startsWith('/system/settings')) data = { systemName: 'DHR 隔离测试', browserTitle: 'DHR QA' };
    else if (path === '/dhr-instances/summary-list') data = { content: [dhr], totalElements: 1, totalPages: 1, page: 0, size: 20 };
    else if (path === '/dhr-instances/1/summary' && route.request().method() === 'GET') data = { dhr, draft, candidates: records, versions: frozenVersion ? [frozenVersion.version] : [] };
    else if (path === '/dhr-instances/1/summary/versions/20' && route.request().method() === 'GET') data = frozenVersion;
    else if (path === '/dhr-instances/1/summary/draft' && route.request().method() === 'PUT') {
      const command = route.request().postDataJSON();
      assert.equal(command.revision, draft.revision);
      draft = { ...command, id: '10', revision: draft.revision + 1 };
      data = { id: draft.id, revision: draft.revision };
    } else {
      assert.equal(route.request().method(), 'GET', `Unexpected business write: ${path}`);
      data = { content: [], totalElements: 0, totalPages: 0 };
    }
    await route.fulfill({ status: 200, json: { code: 200, message: 'OK', data } });
  });
  const page = await context.newPage();
  debugPage = page;
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto(process.env.DHR_QA_URL || 'http://localhost:3000/dhr-management/summary');
  await page.getByRole('button', { name: '进入汇总 DHR-ISOLATED-TREE' }).click();
  await page.getByRole('button', { name: '收起汇总概览' }).click();
  await page.getByRole('button', { name: '展开汇总概览' }).click();
  assert.equal(await page.getByRole('button', { name: '打开作业表单来源' }).getAttribute('aria-pressed'), 'false', 'source switch is visible before opening');
  assert(await page.getByRole('button', { name: '打开作业表单来源' }).isVisible(), 'closed source rail remains visibly actionable');
  assert.equal(await page.locator('[data-summary-preview]').getByRole('button', { name: '打开作业表单来源' }).count(), 0, 'source actions do not belong to preview header');
  await page.getByRole('button', { name: '打开作业表单来源' }).click();
  const workA = page.locator('[data-source-key]').filter({ hasText: '作业节点 node-A' });
  const workB = page.locator('[data-source-key]').filter({ hasText: '作业节点 node-B' });
  const workC = page.locator('[data-source-key]').filter({ hasText: '作业节点 node-C' });
  await workA.waitFor();
  assert.equal(await workA.count(), 1, 'two copies of one work node render as one source card');
  assert.equal(await workB.count(), 1, 'same template from a different node remains separate');
  assert.equal(await page.locator('[draggable="true"]').filter({ hasText: '作业节点 node-C' }).count(), 0, 'mixed-status group cannot be dragged');
  await page.getByText('含未完成实例，请展开后逐份处理。').waitFor();
  await workA.getByRole('button', { name: '展开实例 作业表单' }).click();
  await workA.getByRole('button', { name: '预览实例 FR-QA-105' }).waitFor();
  for (const instance of ['103', '105']) {
    await workA.getByRole('button', { name: `预览实例 FR-QA-${instance}` }).click();
    const previewDialog = page.getByRole('dialog').last();
    await previewDialog.getByText(`FR-QA-${instance} · V1`, { exact: true }).waitFor();
    await previewDialog.getByRole('button', { name: '关闭', exact: true }).click();
    await workA.getByText('未纳入', { exact: true }).first().waitFor();
  }
  await workB.getByRole('button', { name: '展开实例 作业表单' }).click();
  await workB.getByRole('button', { name: '预览实例 FR-QA-106' }).click();
  await page.getByRole('dialog').last().getByText('FR-QA-106 · V1', { exact: true }).waitFor();
  await page.getByRole('dialog').last().getByRole('button', { name: '关闭', exact: true }).click();
  await workB.getByRole('button', { name: '收起实例 作业表单' }).click();
  assert.equal(draft.placements.length, 0, 'previewing candidates does not place them or save a draft');

  const directoryTree = page.locator('[data-summary-directory]');
  const directList = directoryTree.getByRole('button', { name: '实例列表 目录表格2', exact: true });
  await page.mouse.move(900, 900);
  await page.waitForFunction(() => getComputedStyle(document.querySelector('button[aria-label="实例列表 目录表格2"]')).opacity === '0');
  await directoryTree.getByRole('button', { name: '目录表单 目录表格2' }).hover();
  await page.waitForFunction(() => getComputedStyle(document.querySelector('button[aria-label="实例列表 目录表格2"]')).opacity === '1');
  const renameBounds = await directoryTree.getByRole('button', { name: '重命名汇总 目录表格2', exact: true }).boundingBox();
  const listBounds = await directList.boundingBox();
  assert(Math.abs(listBounds.x - renameBounds.x - renameBounds.width) < 1, 'no empty delete slot between rename and instance list');
  assert.equal(await directList.getAttribute('aria-expanded'), 'false', 'single-instance lists start collapsed');
  await page.getByRole('button', { name: '目录表单 目录表格2' }).click();
  await page.locator('[data-summary-preview]').getByText(/FR-QA-101/).waitFor();
  await directList.click();
  await page.getByRole('button', { name: '查看实例 FR-QA-101' }).waitFor();
  const instances = page.locator('[data-summary-instances]');
  assert.equal(await directoryTree.getByRole('button', { name: '查看实例 FR-QA-101' }).count(), 0, 'instances are not children of directory tree');
  await page.waitForTimeout(300);
  const treeBounds = await directoryTree.boundingBox();
  const panelBounds = await instances.boundingBox();
  const previewBounds = await page.locator('[data-summary-preview]').boundingBox();
  assert(panelBounds.x >= treeBounds.x + treeBounds.width && panelBounds.x + panelBounds.width <= previewBounds.x, 'instance panel sits between directory and preview');
  assert(panelBounds.width <= 260, 'instance panel is narrow');
  if (process.env.DHR_SCREENSHOT_DIR) await page.screenshot({ path: `${process.env.DHR_SCREENSHOT_DIR}/summary-instance-panel.png` });
  await page.getByRole('button', { name: '目录表单 目录表格', exact: true }).click();
  await instances.getByRole('button', { name: '查看实例 FR-QA-102' }).waitFor();
  await page.getByRole('button', { name: '目录表单 目录表格2', exact: true }).click();
  await directList.click();
  const sourceBounds = await workB.locator('[data-source-drag]').boundingBox();
  const targetBounds = await page.getByRole('button', { name: '目录表单 目录表格2' }).boundingBox();
  await page.mouse.move(sourceBounds.x + 15, sourceBounds.y + 15);
  await page.mouse.down();
  await page.mouse.move(targetBounds.x + 25, targetBounds.y + 8, { steps: 12 });
  await page.mouse.move(targetBounds.x + 26, targetBounds.y + 8);
  await page.locator('[data-summary-insertion-active="true"]').waitFor();
  assert.equal(await page.locator('[data-summary-insertion-active="true"]').count(), 1, 'exactly one insertion slot is active');
  assert.equal(await directoryTree.locator('*').evaluateAll((elements) => elements.filter((element) => {
    const style = getComputedStyle(element);
    return style.borderTopColor === 'rgb(24, 144, 255)' && parseFloat(style.borderTopWidth) > 0;
  }).length), 0, 'rows do not paint a second insertion border');
  await page.mouse.up();

  // Users release on the visible row, not on a 10px insertion slot.
  await workB.locator('[data-source-drag]').dragTo(page.getByRole('button', { name: '目录表单 目录表格2' }), { targetPosition: { x: 24, y: 8 } });
  await page.getByRole('button', { name: '保存草稿', exact: true }).click();
  await page.getByText('汇总草稿已保存').waitFor();
  assert.equal(draft.placements.find((placement) => placement.recordId === '106')?.beforeNodeKey, 'base-item-201', 'dropping on a visible item row inserts before it');
  await page.locator('[data-summary-record="106"]').locator('..').hover();
  await page.locator('[data-summary-record="106"]').locator('..').getByRole('button', { name: '重命名汇总 作业表单' }).click();
  await page.getByRole('textbox', { name: '文档名称' }).fill('汇总检验文档');
  await page.getByRole('button', { name: '确定', exact: true }).click();
  await page.getByRole('button', { name: '保存草稿', exact: true }).click();
  await page.getByText('汇总草稿已保存').waitFor();
  assert.equal(draft.placements.find((placement) => placement.recordId === '106')?.displayName, '汇总检验文档', 'renamed archive title is saved per instance');
  await page.locator('[data-summary-record="106"]').dragTo(page.getByRole('button', { name: '目录表单 目录表格2' }), { targetPosition: { x: 24, y: 30 } });
  await page.getByRole('button', { name: '保存草稿', exact: true }).click();
  await page.getByText('汇总草稿已保存').waitFor();
  assert.equal(draft.placements.find((placement) => placement.recordId === '106')?.beforeNodeKey, 'base-item-202', 'lower half of the row inserts after it');
  await page.mouse.move(100, 900);
  await page.locator('.MuiSnackbar-root').waitFor({ state: 'hidden', timeout: 6000 });
  await page.getByRole('button', { name: '关闭', exact: true }).click();
  await page.getByRole('button', { name: '进入汇总 DHR-ISOLATED-TREE' }).click();
  await page.locator('[data-summary-record="106"]').waitFor();
  assert.equal(draft.placements.find((placement) => placement.recordId === '106')?.beforeNodeKey, 'base-item-202', 'row reorder survives reopening');
  await page.locator('[data-summary-directory]').getByText('汇总检验文档').waitFor();
  await page.locator('[data-summary-record="106"]').dragTo(page.getByRole('button', { name: '目录表单 目录表格2' }), { targetPosition: { x: 24, y: 8 } });
  await page.getByRole('button', { name: '保存草稿', exact: true }).click();
  await page.getByText('汇总草稿已保存').waitFor();
  assert.equal(draft.placements.find((placement) => placement.recordId === '106')?.beforeNodeKey, 'base-item-201', 'already placed source can move back before the row');
  await page.getByRole('button', { name: '移出汇总 作业表单' }).click();
  await page.getByRole('button', { name: '保存草稿', exact: true }).click();
  await page.getByText('汇总草稿已保存').waitFor();
  await page.getByRole('button', { name: '打开作业表单来源' }).click();

  await workA.locator('[data-source-drag]').dragTo(page.getByLabel('插入到 base-item-201 之前', { exact: true }));
  await page.getByRole('button', { name: '来源表单 作业表单 2 份' }).waitFor();
  await page.locator('[data-summary-record="103"]').locator('..').getByRole('button', { name: '实例列表 作业表单' }).click();
  await instances.waitFor();
  await page.getByRole('button', { name: '查看实例 FR-QA-103' }).waitFor();
  await page.getByRole('button', { name: '查看实例 FR-QA-105' }).waitFor();
  await page.getByRole('button', { name: '查看实例 FR-QA-105' }).dragTo(page.getByRole('button', { name: '查看实例 FR-QA-103' }), { targetPosition: { x: 24, y: 8 } });
  await page.locator('[data-summary-record="105"]').waitFor();
  assert.equal(await page.locator('[data-summary-record="105"]').locator('..').getByRole('button', { name: '实例列表 作业表单' }).getAttribute('aria-expanded'), 'true', 'reordering preserves expanded state');
  await page.locator('[data-summary-record="105"]').locator('..').getByRole('button', { name: '实例列表 作业表单' }).click();
  await instances.waitFor({ state: 'hidden' });
  await page.locator('[data-summary-record="105"]').locator('..').getByRole('button', { name: '实例列表 作业表单' }).click();
  await instances.waitFor();
  await page.getByRole('button', { name: '查看实例 FR-QA-103' }).dragTo(page.getByRole('button', { name: '查看实例 FR-QA-105' }), { targetPosition: { x: 24, y: 8 } });
  await page.locator('[data-summary-record="103"]').waitFor();
  await workB.locator('[data-source-drag]').dragTo(page.getByLabel('插入到 base-item-201 之前', { exact: true }));
  await page.getByRole('button', { name: '来源表单 作业表单 1 份' }).waitFor();

  await page.getByRole('button', { name: '打开自定义表单来源' }).click();
  const custom = page.locator('[data-source-key]').filter({ hasText: '自定义创建项 custom-77' });
  assert.equal(await custom.count(), 1, 'copies of one custom creation render as one card');
  assert.equal(await page.locator('[draggable="true"]').filter({ hasText: '自定义创建项 custom-78' }).count(), 1, 'another creation of same template remains separate');
  await custom.locator('[data-source-drag]').dragTo(page.getByRole('button', { name: '生产记录', exact: true }));
  await page.getByRole('button', { name: '来源表单 自定义表单 2 份' }).waitFor();

  await page.getByRole('button', { name: '保存草稿', exact: true }).click();
  await page.getByText('汇总草稿已保存').waitFor();
  assert.deepEqual(new Map(draft.placements.map((placement) => [placement.recordId, placement.targetNodeKey])), new Map([
    ['103', `base-dir-${baseId}`], ['105', `base-dir-${baseId}`], ['106', `base-dir-${baseId}`],
    ['107', `base-dir-${baseId}`], ['108', `base-dir-${baseId}`],
  ]));
  assert.deepEqual(draft.placements.filter((placement) => ['103', '105'].includes(placement.recordId)).map((placement) => placement.displayOrder), [0, 1]);
  // Interleaved instances must keep the actual order in editable and frozen views.
  draft.placements.find((placement) => placement.recordId === '105').displayOrder = 2;
  draft.placements.find((placement) => placement.recordId === '106').displayOrder = 1;
  await page.mouse.move(100, 900);
  await page.locator('.MuiSnackbar-root').waitFor({ state: 'hidden', timeout: 6000 });
  await page.getByRole('button', { name: '关闭', exact: true }).click();
  await page.getByRole('button', { name: '进入汇总 DHR-ISOLATED-TREE' }).click();
  await page.locator('[data-summary-record="105"]').waitFor();
  assert.deepEqual(await page.locator('[data-summary-record]').evaluateAll((buttons) => buttons.map((button) => button.getAttribute('data-summary-record'))),
    ['103', '106', '105', '107'], 'editing must not group away interleaved positions');
  await page.getByRole('button', { name: '打开作业表单来源' }).click();
  await workA.locator('[data-source-drag]').dragTo(page.getByLabel('插入到 base-item-201 之前', { exact: true }));
  await page.getByRole('button', { name: '保存草稿', exact: true }).click();
  await page.getByText('汇总草稿已保存').waitFor();
  assert.deepEqual(draft.placements.filter((placement) => ['103', '105'].includes(placement.recordId)).map((placement) => placement.displayOrder), [1, 2]);
  await page.getByRole('button', { name: '新增一级目录' }).click();
  await page.getByLabel('目录名称', { exact: true }).fill('附录一');
  await page.getByRole('button', { name: '确定', exact: true }).click();
  await page.getByRole('button', { name: '附录一', exact: true }).waitFor();
  assert.equal(draft.overlayDirectories.length, 0, 'new directory remains local until the draft is saved');
  await page.getByRole('button', { name: '打开自定义表单来源' }).click();
  await custom.locator('[data-source-drag]').dragTo(page.getByRole('button', { name: '附录一', exact: true }));
  await page.getByRole('button', { name: '保存草稿', exact: true }).click();
  await page.getByText('汇总草稿已保存').waitFor();
  const annexKey = draft.overlayDirectories.find((item) => item.name === '附录一').key;
  assert.deepEqual(draft.placements.filter((placement) => ['107', '108'].includes(placement.recordId)).map((placement) => placement.targetNodeKey), [annexKey, annexKey]);
  await page.getByRole('button', { name: '附录一', exact: true }).hover();
  await page.getByRole('button', { name: '新增子目录 附录一' }).click();
  await page.getByLabel('目录名称', { exact: true }).fill('子目录');
  await page.getByRole('button', { name: '确定', exact: true }).click();
  await page.getByRole('button', { name: '保存草稿', exact: true }).click();
  await page.getByText('汇总草稿已保存').waitFor();
  assert.equal(draft.overlayDirectories.find((item) => item.name === '子目录')?.parentKey, annexKey, 'row action creates a child of that directory');
  await page.getByRole('button', { name: '删除目录 附录一' }).click();
  await page.getByRole('button', { name: '删除目录', exact: true }).click();
  await page.getByRole('button', { name: '保存草稿', exact: true }).click();
  await page.getByText('汇总草稿已保存').waitFor();
  assert.equal(draft.placements.some((placement) => ['107', '108'].includes(placement.recordId)), false, 'deleting overlay restores the whole source to unassigned');
  await page.getByRole('button', { name: '来源表单 作业表单 2 份' }).locator('..').getByRole('button', { name: '移出汇总 作业表单' }).click();
  await page.getByRole('button', { name: '保存草稿', exact: true }).click();
  await page.getByText('汇总草稿已保存').waitFor();
  assert.equal(draft.placements.some((placement) => ['103', '105'].includes(placement.recordId)), false, 'removing a source removes all its copies');
  assert.equal(draft.placements.some((placement) => placement.recordId === '106'), true, 'different node is unaffected');
  // Explicit instance selection: no automatic skipping in mixed groups.
  await page.getByRole('button', { name: '打开作业表单来源' }).click();
  await workC.getByRole('button', { name: '展开实例 作业表单' }).click();
  assert.equal(await workC.getByRole('combobox', { name: '实例归入目录 FR-QA-110' }).getAttribute('aria-disabled'), 'true');
  await workC.getByRole('combobox', { name: '实例归入目录 FR-QA-109' }).click();
  await page.getByRole('option', { name: '生产记录', exact: true }).click();
  await workC.getByText('部分纳入 1/2', { exact: true }).first().waitFor();
  await page.getByRole('button', { name: '保存草稿', exact: true }).click();
  await page.getByText('汇总草稿已保存').waitFor();
  assert.equal(draft.placements.some((placement) => placement.recordId === '109'), true);
  assert.equal(draft.placements.some((placement) => placement.recordId === '110'), false);
  // Move the placed run without adding the unselected/incomplete sibling.
  await page.locator('[data-summary-record="109"]').dragTo(page.getByLabel('插入到 base-item-202 之前', { exact: true }));
  await page.getByRole('button', { name: '保存草稿', exact: true }).click();
  await page.getByText('汇总草稿已保存').waitFor();
  assert.equal(draft.placements.find((placement) => placement.recordId === '109').beforeNodeKey, 'base-item-202');
  assert.equal(draft.placements.some((placement) => placement.recordId === '110'), false);
  // Whole group remains the default, but individual removal leaves an explicit partial state.
  await workA.locator('[data-source-drag]').dragTo(page.getByLabel('插入到 base-item-201 之前', { exact: true }));
  await page.locator('[data-summary-record="103"]').locator('..').getByRole('button', { name: '实例列表 作业表单' }).click();
  await page.getByRole('button', { name: '移出实例 FR-QA-105' }).click();
  await workA.getByText('部分纳入 1/2', { exact: true }).first().waitFor();
  // Drag a single expanded candidate, not its enclosing draggable source card.
  if (await workA.getByRole('button', { name: '展开实例 作业表单' }).count()) await workA.getByRole('button', { name: '展开实例 作业表单' }).click();
  await workA.locator('.MuiCollapse-entered').waitFor();
  await workA.locator('[data-source-instance="105"] [data-instance-drag]').dragTo(page.getByLabel('插入到 base-item-202 之前', { exact: true }));
  await page.getByRole('button', { name: '保存草稿', exact: true }).click();
  await page.getByText('汇总草稿已保存').waitFor();
  assert.equal(draft.placements.find((placement) => placement.recordId === '103').beforeNodeKey, 'base-item-201');
  assert.equal(draft.placements.find((placement) => placement.recordId === '105').beforeNodeKey, 'base-item-202');
  // Custom creation groups support the same explicit single-instance choice.
  await page.getByRole('button', { name: '打开自定义表单来源' }).click();
  await custom.getByRole('button', { name: '展开实例 自定义表单' }).click();
  await custom.getByRole('combobox', { name: '实例归入目录 FR-QA-107' }).click();
  await page.getByRole('option', { name: '生产记录', exact: true }).click();
  await custom.getByText('部分纳入 1/2', { exact: true }).first().waitFor();
  await page.getByRole('button', { name: '保存草稿', exact: true }).click();
  await page.getByText('汇总草稿已保存').waitFor();
  assert.equal(draft.placements.some((placement) => placement.recordId === '107'), true);
  assert.equal(draft.placements.some((placement) => placement.recordId === '108'), false);
  const savedPartial = structuredClone(draft.placements);
  await page.mouse.move(100, 900);
  await page.locator('.MuiSnackbar-root').waitFor({ state: 'hidden', timeout: 6000 });
  await page.getByRole('button', { name: '关闭', exact: true }).click();
  await page.getByRole('button', { name: '进入汇总 DHR-ISOLATED-TREE' }).click();
  await page.getByRole('button', { name: '打开自定义表单来源' }).click();
  await custom.getByText('部分纳入 1/2', { exact: true }).first().waitFor();
  await page.getByRole('button', { name: '保存草稿', exact: true }).click();
  await page.getByText('汇总草稿已保存').waitFor();
  assert.deepEqual(draft.placements, savedPartial, 'partial membership and instance order survive reopen');
  await directoryTree.getByRole('button', { name: '目录表单 目录表格2' }).hover();
  await directoryTree.getByRole('button', { name: '重命名汇总 目录表格2' }).click();
  await page.getByRole('textbox', { name: '文档名称' }).fill('基础记录归档名称');
  await page.getByRole('button', { name: '确定', exact: true }).click();
  await page.getByRole('button', { name: '保存草稿', exact: true }).click();
  await page.getByText('汇总草稿已保存').waitFor();
  assert.equal(draft.placements.find((placement) => placement.recordId === '101')?.displayName, '基础记录归档名称');
  assert.equal(draft.placements.find((placement) => placement.recordId === '101')?.targetNodeKey, 'base-item-201');
  const instanceButtons = await directoryTree.getByRole('button', { name: /^实例列表 / }).evaluateAll((buttons) => buttons.map((button) => button.getBoundingClientRect().right));
  assert(instanceButtons.every((right) => Math.abs(right - instanceButtons[0]) < 1), 'all form instance-list controls align on the same right edge');
  await page.mouse.move(100, 900);
  await page.locator('.MuiSnackbar-root').waitFor({ state: 'hidden', timeout: 6000 });
  await page.getByRole('button', { name: '关闭', exact: true }).click();
  await page.getByRole('button', { name: '进入汇总 DHR-ISOLATED-TREE' }).click();
  await directoryTree.getByText('基础记录归档名称', { exact: true }).waitFor();
  await page.getByRole('button', { name: '打开自定义表单来源' }).click();
  if (process.env.DHR_SCREENSHOT_DIR) {
    await custom.getByRole('button', { name: '展开实例 自定义表单' }).click();
    await page.mouse.move(100, 900);
    await page.locator('.MuiSnackbar-root').waitFor({ state: 'hidden', timeout: 6000 });
    await page.screenshot({ path: `${process.env.DHR_SCREENSHOT_DIR}/summary-source-open.png` });
    await page.getByRole('button', { name: '收起候选表单' }).click();
    await page.getByRole('button', { name: '打开自定义表单来源' }).getAttribute('aria-pressed');
    await page.screenshot({ path: `${process.env.DHR_SCREENSHOT_DIR}/summary-source-closed.png`, animations: 'disabled' });
  }
  dhr.summaryStatus = 'FORMALIZED';
  frozenVersion = {
    dhr,
    version: { id: '20', versionNo: 1, status: 'FORMALIZED', reviewMode: 'NONE', baseDirectory: dhr.directorySnapshot,
      overlayDirectories: [], candidates: records },
    placements: [{ recordId: '101', targetNodeKey: 'base-item-201', displayName: '基础记录归档名称' }, ...['103', '106', '105'].map((recordId, displayOrder) => ({ recordId, targetNodeKey: `base-dir-${baseId}`, displayOrder, ...(recordId === '106' ? { displayName: '汇总检验文档' } : {}) }))],
  };
  const frozenPage = await context.newPage();
  frozenPage.on('pageerror', (error) => errors.push(error.message));
  await frozenPage.goto(process.env.DHR_QA_URL || 'http://localhost:3000/dhr-management/summary');
  await frozenPage.getByRole('combobox', { name: '汇总状态' }).click();
  await frozenPage.getByRole('option', { name: '已提交' }).click();
  await frozenPage.getByRole('button', { name: '查看冻结版本 DHR-ISOLATED-TREE' }).click();
  await frozenPage.locator('[data-summary-record="103"]').waitFor();
  const frozenTree = frozenPage.locator('[data-summary-directory]');
  assert.deepEqual(await frozenTree.locator('[data-summary-record]').evaluateAll((buttons) => buttons.map((button) => button.getAttribute('data-summary-record'))),
    ['103', '106', '105'], 'historical frozen order remains instance-accurate');
  assert.equal(await frozenTree.getByRole('button', { name: /移出/ }).count(), 0, 'frozen evidence is read-only');
  await frozenTree.getByText('汇总检验文档').waitFor();
  await frozenTree.getByText('基础记录归档名称', { exact: true }).waitFor();
  assert.equal(await frozenTree.getByRole('button', { name: /重命名/ }).count(), 0, 'frozen title is immutable');
  await frozenPage.setViewportSize({ width: 390, height: 844 });
  const railBounds = await frozenPage.locator('[data-summary-source-rail]').boundingBox();
  assert(railBounds && railBounds.x >= 0 && railBounds.x + railBounds.width <= 390, 'narrow viewport keeps the source rail in view');
  for (const origin of ['作业', '自定义']) {
    const button = frozenPage.getByRole('button', { name: `打开${origin}表单来源` });
    const bounds = await button.boundingBox();
    assert(bounds && bounds.x >= railBounds.x && bounds.x + bounds.width <= railBounds.x + railBounds.width + 1,
      `${origin} source button stays inside the dedicated rail on a narrow viewport`);
    await button.click();
    await frozenPage.getByRole('button', { name: '收起候选表单' }).click();
  }
  assert.equal(errors.length, 0, errors.join('\n'));
  console.log('PASS grouped defaults, explicit instance placement/removal, mixed-state safeguards, custom/work isolation, partial reopen, interleaved/frozen order and read-only');
} catch (error) {
  if (debugPage && process.env.DHR_SCREENSHOT_DIR) await debugPage.screenshot({ path: `${process.env.DHR_SCREENSHOT_DIR}/summary-test-failure.png` });
  throw error;
} finally {
  await browser.close();
}
