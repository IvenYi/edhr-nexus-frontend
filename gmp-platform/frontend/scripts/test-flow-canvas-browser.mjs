import assert from 'node:assert/strict';
import { mkdtemp, readFile, mkdir, rm, writeFile } from 'node:fs/promises';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { build } from 'esbuild';
import { chromium } from 'playwright';

// Actual editors and preview in Chromium, with isolated HTTP data. Never writes a real database.
const root = path.resolve(import.meta.dirname, '..');
const output = path.resolve(root, process.env.FLOW_OUTPUT_DIR || '../../output/playwright/route-topology-20261025');
const temp = await mkdtemp(path.join(os.tmpdir(), 'edhr-flow-canvas-'));
const results = [];
let server;
let browser;
let referenceVisual;
let visualComparison;
const graph = {
  nodes: [
    { nodeKey: '__route_start__', nodeType: 'START', positionX: 180, positionY: 20 },
    { nodeKey: 'a', operationId: '901', operationCode: 'ASM', operationName: '装配', nodeType: 'OPERATION', positionX: 40, positionY: 130 },
    { nodeKey: 'b', operationId: '902', operationCode: 'QC', operationName: '检验', nodeType: 'OPERATION', positionX: 310, positionY: 130 },
    { nodeKey: 'c', operationId: '903', operationCode: 'PACK', operationName: '包装', nodeType: 'OPERATION', positionX: 180, positionY: 270 },
    { nodeKey: 'r', operationId: '904', operationCode: 'RW', operationName: '返工', nodeType: 'REWORK', positionX: 440, positionY: 270 },
    { nodeKey: '__route_end__', nodeType: 'END', positionX: 180, positionY: 400 },
  ],
  relations: [
    ['__route_start__', 'a', 'left', 'top', 'PARALLEL'],
    ['__route_start__', 'b', 'right', 'top', 'PARALLEL'],
    ['a', 'c', 'right', 'left', 'SEQUENTIAL'],
    ['b', 'c', 'bottom', 'right', 'SEQUENTIAL'],
    ['c', '__route_end__', 'bottom', 'top', 'SEQUENTIAL'],
    ['c', 'r', 'right', 'left', 'REWORK'],
  ].map(([sourceNodeKey, targetNodeKey, source, target, relationType]) => ({ sourceNodeKey, targetNodeKey, sourceHandle: `route-handle-${source}`, targetHandle: `route-handle-${target}`, relationType })),
};
const target = {
  id: '701', version: 'V1.0', productionMode: '量产', productionForm: '批次', status: 'ACTIVE',
  routeVersionId: '301', routeName: '样例路线', routeVersion: 'V1.0', dhrTemplateVersionId: '501', dhrTemplateName: '样例批记录', dhrReviewMode: 'NONE',
  operations: graph.nodes.filter(node => node.nodeType === 'OPERATION').map((node, index) => ({ routeNodeKey: node.nodeKey, operationId: node.operationId, operationName: node.operationName, operationCode: node.operationCode, finalOutput: node.nodeKey === 'c', sortOrder: index + 1, forms: [], documents: [] })),
};
const options = {
  routes: [{ id: '301', routeId: '201', routeName: '样例路线', version: 'V1.0', versionCode: 'RT-1', status: 'ACTIVE' }],
  dhrTemplates: [{ id: '501', templateId: '401', name: '样例批记录', version: 'V1.0', code: 'DHR-1', status: 'ACTIVE' }],
  formTemplates: [], documents: [], dhrDirectories: [],
};

function workflowVersion(surface, status = 'DRAFT') {
  const type = surface === 'work' ? 'workNode' : 'formProcessNode';
  const kind = surface === 'work' ? 'CONFIRMATION' : 'APPROVAL';
  const nodes = [
    { id: 'start', type, position: { x: 360, y: 40 }, data: { kind: 'START', label: '开始', config: {} } },
    { id: 'step', type, position: { x: 360, y: 230 }, data: { kind, label: '原节点', config: {} } },
    { id: 'end', type, position: { x: 360, y: 470 }, data: { kind: 'END', label: '结束', config: {} } },
  ];
  const edges = [['start', 'step'], ['step', 'end']].map(([source, target]) => ({ id: `${source}-${target}`, source, target, sourceHandle: 'source-bottom', targetHandle: 'target-top', type: 'smoothstep' }));
  return { id: status === 'DRAFT' ? '601' : '602', versionNumber: status === 'DRAFT' ? 2 : 1, status, isCurrent: status === 'PUBLISHED', nodesJson: JSON.stringify(nodes), edgesJson: JSON.stringify(edges) };
}

try {
  await mkdir(output, { recursive: true });
  await build({
    absWorkingDir: root,
    stdin: { resolveDir: root, loader: 'tsx', contents: `
      import React, { useState } from 'react';
      import { createRoot } from 'react-dom/client';
      import { MemoryRouter, Routes, Route } from 'react-router-dom';
      import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
      import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
      import Preview from './src/components/route-graph/RouteGraphPreview';
      import Product from './src/pages/master-data/components/ProductProcessVersionEditorDialog';
      import Workspace from './src/pages/master-data/ProductModelingWorkspacePage';
      import Process from './src/pages/master-data/ProcessModelingPage';
      import Work from './src/pages/workflow-center/WorkTemplateEditor';
      import Review from './src/pages/workflow-center/ReviewTemplateEditor';
      import Form from './src/pages/workflow-center/FormProcessEditor';
      import { SnackbarProvider } from './src/components/SnackbarProvider';
      import { useAuthStore } from './src/stores/authStore';
      const fixture = window.__fixture;
      useAuthStore.setState({ user: { id: '1', username: 'qa', displayName: 'QA', permissions: ['workflow.review-templates', 'workflow.template.edit', 'workflow.template.publish'] } });
      const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
      function App() {
        const [selected, setSelected] = useState('a');
        if (fixture.surface === 'preview') return <div style={{ height: '90vh' }}><Preview graph={fixture.graph} selectedNodeKey={selected} onSelectNode={key => { setSelected(key); window.__selected = key; }} /></div>;
        if (fixture.surface === 'product') return <Product open productId="101" productName="验收产品" productCode="QA" mode="edit" target={fixture.target} versions={[fixture.target]} loadOptions={async () => fixture.options} onClose={() => {}} onSubmit={payload => { window.__submitted = payload; }} />;
        if (fixture.surface === 'workspace') return <Workspace />;
        if (fixture.surface === 'route') return <div style={{ height: '100vh' }}><Process pageKey="routes" /></div>;
        return fixture.surface === 'work' ? <Work /> : fixture.surface === 'review' ? <Review /> : <Form />;
      }
      const entry = '/qa/101' + (fixture.surface === 'workspace' ? '?intent=configure&versionId=701' : '');
      createRoot(document.getElementById('root')).render(<ThemeProvider theme={createTheme({ palette: { primary: { main: '#1890ff' } } })}><CssBaseline /><QueryClientProvider client={client}><SnackbarProvider><MemoryRouter initialEntries={[entry]}><Routes><Route path={fixture.surface === 'workspace' ? '/qa/:productVersionId' : '/qa/:id'} element={<App />} /></Routes></MemoryRouter></SnackbarProvider></QueryClientProvider></ThemeProvider>);
    ` },
    bundle: true, platform: 'browser', format: 'esm', outfile: path.join(temp, 'bundle.js'),
    alias: { '@': path.join(root, 'src') }, loader: { '.css': 'css', '.svg': 'dataurl', '.png': 'dataurl', '.woff2': 'file', '.ttf': 'file' },
    define: { 'process.env.NODE_ENV': '"production"' }, logLevel: 'silent',
  });
  await writeFile(path.join(temp, 'index.html'), '<!doctype html><html lang="zh-CN"><meta charset="utf-8"><title>流程画布隔离验收</title><link rel="stylesheet" href="/bundle.css"><div id="root"></div><script type="module" src="/bundle.js"></script></html>');
  server = http.createServer(async (request, response) => {
    const name = request.url === '/' ? 'index.html' : request.url.slice(1);
    if (!['index.html', 'bundle.js', 'bundle.css'].includes(name)) { response.writeHead(404); response.end(); return; }
    response.setHeader('Content-Type', name.endsWith('.js') ? 'text/javascript' : name.endsWith('.css') ? 'text/css' : 'text/html; charset=utf-8');
    response.end(await readFile(path.join(temp, name)));
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  browser = await chromium.launch({ headless: true, executablePath: process.env.CHROME_PATH });
  async function run(name, surface, check, extra = {}, viewport = { width: 1440, height: 960 }) {
    if (process.env.FLOW_CASE_FILTER && !name.includes(process.env.FLOW_CASE_FILTER)) return;
    const context = await browser.newContext({ viewport });
    await context.addInitScript(fixture => { window.__fixture = fixture; }, { surface, graph, target, options, ...extra });
    const writes = [];
    let savedRouteGraph = extra.graph ?? graph;
    let operationAttempts = 0;
    const version = workflowVersion(surface, extra.status);
    const publishedVersion = workflowVersion(surface, 'PUBLISHED');
    await context.route('**/api/v1/**', async route => {
      const request = route.request();
      const pathname = new URL(request.url()).pathname;
      if (pathname.endsWith('/operations') && extra.failOperationsOnce && operationAttempts++ === 0) {
        await route.fulfill({ status: 500, json: { message: '模拟工序加载失败' } }); return;
      }
      let data = { content: [], totalElements: 0, totalPages: 0 };
      if (request.method() !== 'GET') {
        writes.push({ pathname, method: request.method(), body: request.postDataJSON() });
        if (pathname.endsWith('/graph')) {
          if (surface === 'route') { savedRouteGraph = { ...savedRouteGraph, ...request.postDataJSON() }; data = savedRouteGraph; }
          else { const body = request.postDataJSON(); Object.assign(version, { nodesJson: JSON.stringify(body.nodes), edgesJson: JSON.stringify(body.edges) }); data = version; }
        } else data = { id: '301', routeId: '201', version: 'V1.0', code: 'RT-1', ...request.postDataJSON() };
      } else if (pathname.endsWith('/graph')) data = savedRouteGraph;
      else if (pathname.includes('/workflow/') && pathname.endsWith('/form-process-references')) data = [];
      else if (/\/workflow\/[^/]+\/101\/versions\/\d+$/.test(pathname)) data = extra.multipleVersions && pathname.endsWith('/602') ? publishedVersion : version;
      else if (/\/workflow\/[^/]+\/101\/versions$/.test(pathname)) data = extra.multipleVersions ? [version, publishedVersion] : [version];
      else if (/\/workflow\/[^/]+\/101$/.test(pathname)) data = { id: '101', name: '隔离流程', code: 'QA-FLOW' };
      else if (pathname.endsWith('/options')) data = options;
      else if (pathname.endsWith('/products/101')) data = { product: { id: '101', name: '验收产品', code: 'QA' }, model: { id: '401', versions: [target] } };
      else if (pathname.endsWith('/routes')) data = { content: [{ id: '201', name: '样例路线', versionCount: 1, status: 'ACTIVE', versions: [{ id: '301', routeId: '201', version: 'V1.0', code: 'RT-1', effectiveDate: '2020-01-01T00:00:00', versionStatus: 'ACTIVE' }] }], totalElements: 1, totalPages: 1 };
      else if (pathname.endsWith('/operations')) data = { content: [{ id: '905', name: '新增工序', code: 'NEW', status: 'ACTIVE' }, { id: '906', name: '长名称工序：无菌器械包装完整性与标签信息逐项复核', code: 'LONG-OP-906', operationCategory: '包装', status: 'ACTIVE' }], totalElements: 2, totalPages: 1 };
      else if (pathname.endsWith('/operation-categories')) data = [];
      await route.fulfill({ status: 200, json: { code: 200, message: 'OK', data } });
    });
    const page = await context.newPage();
    page.setDefaultTimeout(12000);
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    try {
      await page.goto(`http://127.0.0.1:${server.address().port}`);
      await check(page, writes);
      assert.deepEqual(errors, []);
      await page.screenshot({ path: path.join(output, `${name}.png`), fullPage: true, animations: 'disabled' });
      results.push({ name, status: 'passed', viewport, writes: writes.map(write => ({ method: write.method, pathname: write.pathname })) });
      console.log(`${name}: passed`);
    } catch (error) {
      await page.screenshot({ path: path.join(output, `${name}-failed.png`), fullPage: true, animations: 'disabled' });
      await writeFile(path.join(output, `${name}-failed.txt`), await page.locator('body').innerText());
      results.push({ name, status: 'failed', error: error.message, stack: error.stack, errors });
      console.log(`${name}: failed: ${error.message}`);
    } finally { await context.close(); }
  }
  async function openRoute(page) {
    await page.getByText('样例路线', { exact: true }).first().waitFor();
    await page.locator('tr[data-record-id="201"]').click();
    await page.locator('tr[data-record-id="301"]').getByRole('button', { name: /编辑/ }).click();
    await page.locator('[data-process-route-node]').first().waitFor();
    await stableDialog(page);
  }
  async function openQuick(page, id, direction = 'bottom') {
    const node = page.locator('.react-flow__node[data-id="' + id + '"]');
    await node.hover();
    await node.getByRole('button', { name: '向' + direction + '连接或添加节点', exact: true }).click();
    const panel = page.getByRole('dialog', { name: '快速添加工序', exact: true });
    await panel.waitFor();
    return panel;
  }
  async function connectExisting(page, id, direction, label) {
    const panel = await openQuick(page, id, direction);
    await panel.getByRole('tab', { name: '连接已有节点' }).click();
    await panel.getByRole('button', { name: new RegExp(label) }).click();
    await panel.waitFor({ state: 'hidden' });
  }
  async function dragConnection(page, source, sourcePort, target, targetPort) {
    const from = await page.locator('.react-flow__node[data-id="' + source + '"] .source[data-handleid="route-handle-' + sourcePort + '"]').boundingBox();
    const to = await page.locator('.react-flow__node[data-id="' + target + '"] .target[data-handleid="route-handle-' + targetPort + '"]').boundingBox();
    await page.mouse.move(from.x + from.width / 2, from.y + from.height / 2);
    await page.mouse.down();
    await page.mouse.move(to.x + to.width / 2, to.y + to.height / 2, { steps: 16 });
    await page.mouse.up();
  }
  async function stableDialog(page) {
    await page.waitForFunction(() => [...document.querySelectorAll('.MuiDialog-container')].some(el => getComputedStyle(el).opacity === '1'));
  }
  async function canvasVisual(page, start, operation, end) {
    const nodeStyle = async selector => page.locator(selector).evaluate(root => {
      const node = root.matches('[data-flow-standard-node]') ? root : root.querySelector('[data-flow-standard-node]');
      const css = getComputedStyle(node), label = getComputedStyle(node.querySelector('.MuiTypography-root'));
      const handle = getComputedStyle(node.querySelector('.react-flow__handle'));
      return { width: css.width, height: css.height, background: css.backgroundColor, radius: css.borderRadius, fontSize: label.fontSize, fontWeight: label.fontWeight, color: label.color, handleWidth: handle.width, handleBackground: handle.backgroundColor, handleBorder: handle.border };
    });
    const controls = await page.locator('.flow-canvas-controls').evaluate(el => ({ bottomLeft: el.classList.contains('bottom') && el.classList.contains('left'), buttons: [...el.querySelectorAll('button')].map(b => b.getAttribute('aria-label')).filter(Boolean) }));
    assert.equal(controls.bottomLeft, true);
    return { start: await nodeStyle(start), operation: await nodeStyle(operation), end: await nodeStyle(end), controls };
  }
  async function expectRoute(page) {
    await page.locator('[data-process-route-node]').first().waitFor();
    await page.waitForFunction(() => document.querySelectorAll('.react-flow__edge-path').length === 6);
    assert.equal(await page.locator('[data-process-route-node]').count(), 6);
    assert.equal(await page.locator('[data-process-route-parallel-badge]').count(), 2);
    assert.equal(await page.locator('[data-process-route-merge-badge]').count(), 1);
    assert.equal(await page.locator('[data-process-route-rework-badge]').count(), 1);
    assert.equal(await page.locator('[data-record-id="a"] .source[data-handleid="route-handle-right"]').count(), 1);
  }
  async function expectPreviewControls(page, writes) {
    const preview = page.locator('[data-route-graph-preview]');
    const controls = preview.locator('.flow-canvas-controls');
    await controls.waitFor();
    assert.equal(await controls.locator('button').count(), 3);
    assert.equal(await controls.locator('.react-flow__controls-interactive').count(), 0);
    const graphBefore = await preview.locator('.react-flow__node').evaluateAll(nodes => nodes.map(node => [node.dataset.id, node.style.transform]));
    const zoom = () => preview.locator('.react-flow__viewport').evaluate(el => new DOMMatrix(getComputedStyle(el).transform).a);
    const before = await zoom();
    await controls.locator('.react-flow__controls-zoomin').click();
    assert.ok(await zoom() > before);
    await controls.locator('.react-flow__controls-zoomout').click();
    assert.ok(Math.abs(await zoom() - before) < 0.001);
    const bounds = await preview.boundingBox();
    const viewportTransform = () => preview.locator('.react-flow__viewport').evaluate(el => el.style.transform);
    const beforePan = await viewportTransform();
    await page.mouse.move(bounds.x + bounds.width - 10, bounds.y + 10);
    await page.mouse.down();
    await page.mouse.move(bounds.x + bounds.width - 110, bounds.y + 90, { steps: 5 });
    await page.mouse.up();
    const afterPan = await viewportTransform();
    assert.notEqual(afterPan, beforePan);
    await controls.locator('.react-flow__controls-fitview').click();
    await page.waitForFunction(previous => document.querySelector('[data-route-graph-preview] .react-flow__viewport').style.transform !== previous, afterPan);
    assert.notEqual(await viewportTransform(), afterPan);
    assert.ok(await zoom() > 0);
    for (const node of await preview.locator('.react-flow__node').all()) {
      const box = await node.boundingBox();
      assert.ok(box.x >= bounds.x && box.y >= bounds.y && box.x + box.width <= bounds.x + bounds.width && box.y + box.height <= bounds.y + bounds.height, '适应画布后所有节点可见');
    }
    assert.deepEqual(await preview.locator('.react-flow__node').evaluateAll(nodes => nodes.map(node => [node.dataset.id, node.style.transform])), graphBefore);
    assert.equal(await preview.getByRole('button', { name: /连接或添加节点|撤销|重做|框选工具/ }).count(), 0);
    assert.deepEqual(writes, []);
  }
  await run('preview-desktop', 'preview', async (page, writes) => {
    await expectRoute(page);
    await expectPreviewControls(page, writes);
    await page.locator('[data-record-id="b"][data-process-route-node]').click();
    await page.waitForFunction(() => window.__selected === 'b');
    assert.equal(await page.locator('.react-flow__node[data-id="b"]').evaluate(node => node.classList.contains('selected')), true);
    const position = await page.locator('.react-flow__node[data-id="b"]').evaluate(node => node.style.transform);
    await page.keyboard.press('Delete');
    const box = await page.locator('[data-record-id="b"][data-process-route-node]').boundingBox();
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down(); await page.mouse.move(box.x + 60, box.y + 60, { steps: 5 }); await page.mouse.up();
    assert.equal(await page.locator('.react-flow__node[data-id="b"]').evaluate(node => node.style.transform), position);
    assert.equal(await page.locator('[data-process-route-node]').count(), 6);
    assert.deepEqual(writes, []);
  });
  await run('preview-narrow', 'preview', async (page, writes) => {
    await expectRoute(page);
    await expectPreviewControls(page, writes);
  }, {}, { width: 390, height: 844 });
  await run('product-selection-and-save', 'product', async (page, writes) => {
    await expectRoute(page);
    await expectPreviewControls(page, writes);
    await page.locator('[data-record-id="c"][data-process-route-node]').click();
    await page.getByText('当前工序', { exact: true }).waitFor();
    assert.equal(await page.locator('.react-flow__node[data-id="c"]').evaluate(node => node.classList.contains('selected')), true);
    await page.getByRole('button', { name: '保存', exact: true }).click();
    await page.waitForFunction(() => window.__submitted);
    const submitted = await page.evaluate(() => window.__submitted);
    assert.equal(submitted.routeVersionId, '301');
    assert.deepEqual(submitted.operationBindings.map(binding => [binding.routeNodeKey, binding.finalOutput]), [['a', false], ['b', false], ['c', true]]);
    assert.deepEqual(writes, []);
  });
  await run('workspace-selection-and-save', 'workspace', async (page, writes) => {
    await expectRoute(page);
    await expectPreviewControls(page, writes);
    await page.locator('[data-record-id="c"][data-process-route-node]').click();
    assert.equal(await page.locator('.react-flow__node[data-id="c"]').evaluate(node => node.classList.contains('selected')), true);
    await page.screenshot({ path: path.join(output, 'workspace-preview-controls.png'), fullPage: true, animations: 'disabled' });
    const saved = page.waitForResponse(response => response.request().method() === 'PUT');
    await page.getByRole('button', { name: '保存', exact: true }).click();
    await saved;
    const payload = writes.find(write => write.method === 'PUT').body;
    assert.equal(payload.routeVersionId, '301');
    assert.deepEqual(payload.operationBindings.map(binding => [binding.routeNodeKey, binding.finalOutput]), [['a', false], ['b', false], ['c', true]]);
  });
  for (const surface of ['form', 'review', 'work']) {
    await run(`${surface}-history-and-save`, surface, async (page, writes) => {
      await page.locator('.react-flow__node[data-id="step"]').waitFor();
      if (surface === 'review') {
        await stableDialog(page);
        referenceVisual = await canvasVisual(page, '.react-flow__node[data-id="start"]', '.react-flow__node[data-id="step"]', '.react-flow__node[data-id="end"]');
        await page.screenshot({ path: path.join(output, 'approval-editor-open.png'), fullPage: true, animations: 'disabled' });
      }
      await page.locator('.react-flow__node[data-id="step"]').click();
      const field = page.getByLabel('节点名称', { exact: true });
      await field.fill('修改后');
      await page.getByRole('button', { name: '撤销', exact: true }).click();
      await page.locator('.react-flow__node[data-id="step"]').click();
      assert.equal(await field.inputValue(), '原节点');
      await page.getByRole('button', { name: '重做', exact: true }).click();
      await page.locator('.react-flow__node[data-id="step"]').click();
      assert.equal(await field.inputValue(), '修改后');
      const node = page.locator('.react-flow__node[data-id="step"]');
      const beforeDrag = await node.evaluate(node => node.style.transform);
      const bounds = await node.boundingBox();
      await page.mouse.move(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2);
      await page.mouse.down();
      await page.mouse.move(bounds.x + bounds.width / 2 + 45, bounds.y + bounds.height / 2 + 30, { steps: 5 });
      await page.mouse.up();
      const afterDrag = await node.evaluate(node => node.style.transform);
      assert.notEqual(afterDrag, beforeDrag);
      await page.getByRole('button', { name: '撤销', exact: true }).click();
      assert.equal(await node.evaluate(node => node.style.transform), beforeDrag);
      await page.getByRole('button', { name: '重做', exact: true }).click();
      assert.equal(await node.evaluate(node => node.style.transform), afterDrag);
      const save = page.getByRole('button', { name: /保存草稿|^保存$/ }).first();
      const saved = page.waitForResponse(response => response.url().endsWith('/graph') && response.request().method() === 'PUT');
      await save.click();
      await saved;
      assert.equal(writes.filter(write => write.pathname.endsWith('/graph')).length, 1);
      const payload = writes.find(write => write.pathname.endsWith('/graph')).body;
      assert.equal(payload.nodes.find(node => node.id === 'step').data.label, '修改后');
      assert.deepEqual(payload.edges.map(edge => [edge.source, edge.target]), [['start', 'step'], ['step', 'end']]);
      assert.equal(writes.some(write => write.pathname.endsWith('/publish')), false);
    });
    await run(`${surface}-published-readonly`, surface, async (page, writes) => {
      await page.locator('.react-flow__node[data-id="step"]').waitFor();
      assert.equal(await page.locator('.react-flow__controls-interactive').count(), 0);
      const undo = page.getByRole('button', { name: '撤销', exact: true });
      if (await undo.count()) assert.equal(await undo.isDisabled(), true);
      await page.locator('.react-flow__node[data-id="step"]').click();
      assert.equal(await page.getByLabel('节点名称', { exact: true }).isDisabled(), true);
      assert.deepEqual(writes, []);
    }, { status: 'PUBLISHED' });
    await run(`${surface}-version-history-reset`, surface, async (page, writes) => {
      await page.locator('.react-flow__node[data-id="step"]').waitFor();
      await page.locator('.react-flow__node[data-id="step"]').click();
      await page.getByLabel('节点名称', { exact: true }).fill('未保存修改');
      await page.getByRole('button', { name: /^流程 V2/ }).click();
      await page.getByText('流程 V1', { exact: true }).click();
      await page.getByRole('button', { name: '放弃修改并切换', exact: true }).click();
      await page.getByRole('button', { name: /^流程 V1/ }).waitFor();
      await page.getByRole('button', { name: /^流程 V1/ }).click();
      await page.getByText('流程 V2', { exact: true }).click();
      await page.getByRole('button', { name: /^流程 V2/ }).waitFor();
      await page.locator('.react-flow__node[data-id="step"]').click();
      assert.equal(await page.getByLabel('节点名称', { exact: true }).inputValue(), '原节点');
      assert.equal(await page.getByRole('button', { name: '撤销', exact: true }).isDisabled(), true);
      assert.equal(await page.getByRole('button', { name: '重做', exact: true }).isDisabled(), true);
      assert.deepEqual(writes, []);
    }, { multipleVersions: true });
  }
  await run('route-edit-save', 'route', async (page, writes) => {
    await page.getByText('样例路线', { exact: true }).first().waitFor();
    await page.locator('tr[data-record-id="201"]').click();
    await page.locator('tr[data-record-id="301"]').getByRole('button', { name: /编辑/ }).click();
    await expectRoute(page);
    await stableDialog(page);
    const actual = await canvasVisual(page, '[data-record-id="__route_start__"]', '[data-record-id="a"]', '[data-record-id="__route_end__"]');
    if (referenceVisual) {
      for (const role of ['start', 'operation', 'end']) assert.deepEqual(actual[role], referenceVisual[role], `shared ${role} visual`);
      for (const action of ['手形工具', '框选工具', '撤销', '重做', '显示缩略地图']) assert.ok(actual.controls.buttons.includes(action) && referenceVisual.controls.buttons.includes(action), action);
      visualComparison = { reference: referenceVisual, route: actual, status: 'passed' };
    }
    assert.equal(await page.getByRole('button', { name: '撤销', exact: true }).isDisabled(), true);
    await page.getByRole('button', { name: '框选工具', exact: true }).click();
    assert.equal(await page.getByRole('button', { name: '框选工具', exact: true }).getAttribute('aria-pressed'), 'true');
    await page.getByRole('button', { name: '手形工具', exact: true }).click();
    await page.getByRole('button', { name: '显示缩略地图', exact: true }).click();
    assert.equal(await page.getByLabel('流程缩略地图').count(), 1);
    await page.getByRole('button', { name: '隐藏缩略地图', exact: true }).click();
    await page.screenshot({ path: path.join(output, 'route-editor-open.png'), fullPage: true, animations: 'disabled' });
    await page.getByText('新增工序', { exact: true }).dblclick();
    await page.waitForFunction(() => document.querySelectorAll('[data-process-route-node]').length === 7);
    await page.getByRole('button', { name: '撤销', exact: true }).click();
    await page.waitForFunction(() => document.querySelectorAll('[data-process-route-node]').length === 6);
    await page.getByRole('button', { name: '重做', exact: true }).click();
    await page.waitForFunction(() => document.querySelectorAll('[data-process-route-node]').length === 7);
    await page.keyboard.press('Control+z');
    await page.waitForFunction(() => document.querySelectorAll('[data-process-route-node]').length === 6);
    await page.keyboard.press('Control+Shift+z');
    await page.waitForFunction(() => document.querySelectorAll('[data-process-route-node]').length === 7);
    const operation = page.locator('.react-flow__node[data-id="a"]');
    const before = await operation.evaluate(node => node.style.transform);
    const bounds = await operation.boundingBox();
    await page.mouse.move(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2);
    await page.mouse.down(); await page.mouse.move(bounds.x + bounds.width / 2 + 70, bounds.y + bounds.height / 2 + 70, { steps: 8 }); await page.mouse.up();
    assert.notEqual(await operation.evaluate(node => node.style.transform), before);
    await page.getByRole('button', { name: '撤销', exact: true }).click();
    assert.equal(await operation.evaluate(node => node.style.transform), before);
    await operation.click();
    await page.keyboard.press('Delete');
    await page.waitForFunction(() => document.querySelectorAll('[data-process-route-node]').length === 6);
    await page.getByRole('button', { name: '撤销', exact: true }).click();
    await page.waitForFunction(() => document.querySelectorAll('[data-process-route-node]').length === 7);
    const sourceHandle = await page.locator('.react-flow__node[data-id="a"] .source[data-handleid="route-handle-bottom"]').boundingBox();
    const targetHandle = await page.locator('.react-flow__node[data-id="b"] .target[data-handleid="route-handle-left"]').boundingBox();
    await page.mouse.move(sourceHandle.x + sourceHandle.width / 2, sourceHandle.y + sourceHandle.height / 2);
    await page.mouse.down();
    await page.mouse.move(targetHandle.x + targetHandle.width / 2, targetHandle.y + targetHandle.height / 2, { steps: 14 });
    await page.mouse.up();
    await page.waitForFunction(() => document.querySelectorAll('.react-flow__edge-path').length === 7);
    await page.getByRole('button', { name: '撤销', exact: true }).click();
    await page.waitForFunction(() => document.querySelectorAll('.react-flow__edge-path').length === 6);

    const addedId = await page.locator('.react-flow__node[data-id^="operation-905-"]').getAttribute('data-id');
    await connectExisting(page, addedId, 'top', '开始');
    await connectExisting(page, addedId, 'bottom', '结束');
    const saved = page.waitForResponse(response => response.url().endsWith('/graph') && response.request().method() === 'PUT');
    await page.getByRole('button', { name: '保存', exact: true }).click();
    await saved;
    const graphWrite = writes.find(write => write.pathname.endsWith('/graph'));
    assert.ok(graphWrite);
    assert.deepEqual(graphWrite.body.nodes.slice(0, 6).map(node => node.nodeKey), graph.nodes.map(node => node.nodeKey));
    assert.equal(graphWrite.body.nodes.at(-1).operationId, '905');
    assert.deepEqual(graphWrite.body.nodes.slice(0, 5).map(node => [node.positionX, node.positionY]), graph.nodes.slice(0, 5).map(node => [node.positionX, node.positionY]));
    // Quick-add still moves END down to leave room, now using the common 60px node height.
    assert.deepEqual([graphWrite.body.nodes[5].positionX, graphWrite.body.nodes[5].positionY], [180, 502]);
    assert.deepEqual(graphWrite.body.relations.slice(0, 6).map(edge => [edge.sourceHandle, edge.targetHandle]), graph.relations.map(edge => [edge.sourceHandle, edge.targetHandle]));
  });
  await run('route-reopen-history-reset', 'route', async page => {
    await page.getByText('样例路线', { exact: true }).first().waitFor();
    await page.locator('tr[data-record-id="201"]').click();
    await page.locator('tr[data-record-id="301"]').getByRole('button', { name: /编辑/ }).click();
    await expectRoute(page);
    await page.getByText('新增工序', { exact: true }).dblclick();
    await page.waitForFunction(() => document.querySelectorAll('[data-process-route-node]').length === 7);
    await page.getByRole('button', { name: '取消', exact: true }).click();
    await page.getByRole('dialog').waitFor({ state: 'hidden' });
    await page.locator('tr[data-record-id="301"]').getByRole('button', { name: /编辑/ }).click();
    await expectRoute(page);
    assert.equal(await page.getByRole('button', { name: '撤销', exact: true }).isDisabled(), true);
    assert.equal(await page.getByRole('button', { name: '重做', exact: true }).isDisabled(), true);
  });
  await run('route-quick-panel-add-connect-save', 'route', async (page, writes) => {
    await openRoute(page);
    let panel = await openQuick(page, '__route_start__', 'right');
    await panel.getByLabel('搜索工序名称或编码').fill('不存在的工序');
    await panel.getByText('没有匹配项，请调整搜索或分类').waitFor();
    await panel.getByRole('button', { name: '清空工序搜索' }).click();
    await panel.getByRole('combobox', { name: '工序分类' }).click();
    await page.getByRole('option', { name: '包装', exact: true }).click();
    await panel.getByText('长名称工序：无菌器械包装完整性与标签信息逐项复核', { exact: true }).waitFor();
    await page.screenshot({ path: path.join(output, 'quick-operation-panel-open.png'), animations: 'disabled', fullPage: true });
    await panel.getByLabel('搜索工序名称或编码').fill('LONG-OP');
    await panel.getByRole('button', { name: /长名称工序/ }).click();
    await page.waitForFunction(() => document.querySelectorAll('[data-process-route-node]').length === 7 && document.querySelectorAll('.react-flow__edge-path').length === 7);
    await page.getByRole('button', { name: '撤销', exact: true }).click();
    await expectRoute(page);
    await page.getByRole('button', { name: '重做', exact: true }).click();
    await page.waitForFunction(() => document.querySelectorAll('[data-process-route-node]').length === 7);
    const addedId = await page.locator('.react-flow__node[data-id^="operation-906-"]').getAttribute('data-id');
    await connectExisting(page, addedId, 'bottom', '结束');
    const saved = page.waitForResponse(response => response.url().endsWith('/graph') && response.request().method() === 'PUT');
    await page.getByRole('button', { name: '保存', exact: true }).click();
    await saved;
    const body = writes.find(write => write.pathname.endsWith('/graph')).body;
    assert.deepEqual(body.nodes.slice(0, 6).map(n => [n.nodeKey, n.positionX, n.positionY]), graph.nodes.map(n => [n.nodeKey, n.positionX, n.positionY]));
    assert.equal(body.nodes.at(-1).operationId, '906');
    assert.equal(body.relations.length, 8);
  });
  await run('route-disconnected-save-block-and-repair', 'route', async (page, writes) => {
    await openRoute(page);
    await page.getByRole('button', { name: '保存', exact: true }).click();
    await page.getByText('路线校验未通过，请修正红框节点后保存。', { exact: true }).waitFor();
    assert.deepEqual(writes, [], 'invalid route must not update version metadata or graph');
    assert.ok(await page.getByText('该工序未连接到开始节点', { exact: true }).count() > 0);
    await page.screenshot({ path: path.join(output, 'route-connectivity-errors.png'), animations: 'disabled', fullPage: true });
    await connectExisting(page, '__route_start__', 'left', '装配 ASM');
    await connectExisting(page, '__route_start__', 'right', '检验 QC');
    await connectExisting(page, 'c', 'bottom', '结束');
    const saved = page.waitForResponse(response => response.url().endsWith('/graph') && response.request().method() === 'PUT');
    await page.getByRole('button', { name: '保存', exact: true }).click(); await saved;
    assert.ok(writes.find(write => write.pathname.endsWith('/graph')));
  }, { graph: { ...graph, relations: graph.relations.filter(e => !e.sourceNodeKey.startsWith('__route_') && !e.targetNodeKey.startsWith('__route_')) } });
  await run('route-quick-panel-retry-keyboard', 'route', async (page) => {
    await openRoute(page);
    const panel = await openQuick(page, '__route_start__');
    await panel.getByText('工序加载失败', { exact: true }).waitFor();
    await panel.getByRole('button', { name: '重试', exact: true }).click();
    await panel.getByRole('button', { name: /新增工序/ }).waitFor();
    await panel.getByLabel('搜索工序名称或编码').fill('NEW');
    await page.keyboard.press('Escape');
    await panel.waitFor({ state: 'hidden' });
    assert.equal(await page.evaluate(() => document.activeElement?.getAttribute('aria-label')), '向bottom连接或添加节点');
    await page.keyboard.press('Enter');
    await panel.waitFor();
    await panel.getByRole('button', { name: /新增工序/ }).focus(); await page.keyboard.press('Enter');
    await page.waitForFunction(() => document.querySelectorAll('[data-process-route-node]').length === 7);
  }, { failOperationsOnce: true });
  await run('route-quick-panel-narrow', 'route', async page => {
    await openRoute(page);
    const panel = await openQuick(page, '__route_start__');
    const bounds = await panel.boundingBox(), viewport = page.viewportSize();
    assert.ok(bounds.x >= 0 && bounds.x + bounds.width <= viewport.width && bounds.y >= 0 && bounds.y + bounds.height <= viewport.height);
    await page.screenshot({ path: path.join(output, 'quick-operation-panel-narrow.png'), animations: 'disabled', fullPage: true });
  }, {}, { width: 390, height: 900 });
  await run('route-quick-distinguishes-production-and-rework', 'route', async (page, writes) => {
    await openRoute(page);
    await page.locator('.react-flow__node[data-id="a"]').click({ button: 'right' });
    await page.getByText('复制为返工工序', { exact: true }).click();
    await page.waitForFunction(() => document.querySelectorAll('[data-process-route-node]').length === 7);
    const panel = await openQuick(page, '__route_end__', 'top');
    await panel.getByRole('tab', { name: '连接已有节点' }).click();
    await panel.getByLabel('搜索已有节点').fill('ASM');
    const production = panel.getByRole('button', { name: /装配 ASM 生产工序/ });
    const rework = panel.getByRole('button', { name: /装配 ASM 返工工序/ });
    assert.equal(await production.count(), 1); assert.equal(await rework.count(), 1);
    const reworkId = await rework.getAttribute('data-route-connect-node-id');
    assert.notEqual(reworkId, 'a');
    await page.screenshot({ path: path.join(output, 'quick-existing-node-types.png'), animations: 'disabled', fullPage: true });
    await rework.click();
    const saved = page.waitForResponse(response => response.url().endsWith('/graph') && response.request().method() === 'PUT');
    await page.getByRole('button', { name: '保存', exact: true }).click(); await saved;
    const body = writes.find(write => write.pathname.endsWith('/graph')).body;
    assert.ok(body.relations.some(edge => edge.sourceNodeKey === reworkId && edge.targetNodeKey === '__route_end__'));
    assert.equal(body.nodes.find(node => node.nodeKey === reworkId).nodeType, 'REWORK');
  });
  await run('route-quick-distinguishes-repeated-rework', 'route', async (page, writes) => {
    await openRoute(page);
    for (let index = 0; index < 2; index++) {
      await page.locator('.react-flow__node[data-id="a"]').click({ button: 'right' });
      await page.getByText('复制为返工工序', { exact: true }).click();
      await page.waitForFunction(count => document.querySelectorAll('[data-process-route-node]').length === count, 7 + index);
    }
    const panel = await openQuick(page, '__route_end__', 'top');
    await panel.getByRole('tab', { name: '连接已有节点' }).click();
    await panel.getByLabel('搜索已有节点').fill('ASM');
    const copies = panel.getByRole('button', { name: /装配 ASM 返工工序/ });
    assert.equal(await copies.count(), 2);
    const labels = await copies.allTextContents(); assert.notEqual(labels[0], labels[1]);
    for (let index = 0; index < 2; index++) {
      const item = copies.nth(index), id = await item.getAttribute('data-route-connect-node-id');
      const badge = await page.locator('[data-process-route-node][data-record-id="' + id + '"] [data-process-route-rework-badge]').textContent();
      assert.ok((await item.innerText()).includes(badge), 'picker must use the same rework number as the canvas');
    }
    const selectedId = await copies.nth(1).getAttribute('data-route-connect-node-id');
    await page.screenshot({ path: path.join(output, 'quick-existing-rework-occurrences.png'), animations: 'disabled', fullPage: true });
    await copies.nth(1).click();
    const saved = page.waitForResponse(response => response.url().endsWith('/graph') && response.request().method() === 'PUT');
    await page.getByRole('button', { name: '保存', exact: true }).click(); await saved;
    assert.ok(writes.find(write => write.pathname.endsWith('/graph')).body.relations.some(edge => edge.sourceNodeKey === selectedId && edge.targetNodeKey === '__route_end__'));
  });
  await run('route-quick-duplicate-occurrence-identity', 'route', async (page, writes) => {
    await openRoute(page);
    const panel = await openQuick(page, '__route_end__', 'top');
    await panel.getByRole('tab', { name: '连接已有节点' }).click();
    await panel.getByLabel('搜索已有节点').fill('ASM');
    for (const [id, number] of [['a', '节点 1'], ['b', '节点 2']]) {
      await panel.locator('[data-route-connect-node-id="' + id + '"]').getByText(number, { exact: true }).waitFor();
      assert.equal(await page.locator('[data-record-id="' + id + '"] [data-process-route-occurrence-badge]').textContent(), number);
    }
    await panel.getByLabel('搜索已有节点').fill('装配');
    await page.screenshot({ path: path.join(output, 'quick-existing-production-occurrences.png'), animations: 'disabled', fullPage: true });
    await panel.locator('[data-route-connect-node-id="b"]').click();
    const saved = page.waitForResponse(response => response.url().endsWith('/graph') && response.request().method() === 'PUT');
    await page.getByRole('button', { name: '保存', exact: true }).click(); await saved;
    assert.ok(writes.find(write => write.pathname.endsWith('/graph')).body.relations.some(edge => edge.sourceNodeKey === 'b' && edge.targetNodeKey === '__route_end__'));
  }, { graph: { ...graph, nodes: graph.nodes.map(node => node.nodeKey === 'b' ? { ...node, operationId: '901', operationName: '装配', operationCode: 'ASM' } : node) } });
  await run('route-manual-rejects-duplicate-and-cycle', 'route', async (page, writes) => {
    await openRoute(page);
    await dragConnection(page, 'a', 'bottom', 'c', 'right');
    await page.getByText('同一对节点之间不能重复连线', { exact: true }).waitFor();
    assert.equal(await page.locator('.react-flow__edge-path').count(), 6);
    await dragConnection(page, 'c', 'right', 'a', 'left');
    await page.getByText('普通生产工序不能形成循环', { exact: true }).waitFor();
    assert.equal(await page.locator('.react-flow__edge-path').count(), 6);
    await dragConnection(page, 'a', 'left', 'a', 'top');
    assert.equal(await page.locator('.react-flow__edge-path').count(), 6);
    assert.equal(await page.getByRole('button', { name: '撤销', exact: true }).isDisabled(), true);
    assert.deepEqual(writes, []);
  });
  await run('route-quick-excludes-ancestors-and-duplicate-targets', 'route', async (page) => {
    await openRoute(page);
    let panel = await openQuick(page, 'c', 'bottom');
    await panel.getByRole('tab', { name: '连接已有节点' }).click();
    assert.equal(await panel.locator('[data-route-connect-node-id="a"], [data-route-connect-node-id="b"], [data-route-connect-node-id="c"], [data-route-connect-node-id="__route_end__"]').count(), 0);
    await panel.getByRole('button', { name: '关闭快速添加' }).click();
    panel = await openQuick(page, 'a', 'bottom');
    await panel.getByRole('tab', { name: '连接已有节点' }).click();
    assert.equal(await panel.locator('[data-route-connect-node-id="c"]').count(), 0);
    await panel.locator('[data-route-connect-node-id="b"]').waitFor();
  });
  await run('route-reconnect-rejects-duplicate-and-cycle', 'route', async (page, writes) => {
    await openRoute(page);
    for (const [edgeId, targetId, port, message] of [
      ['__route_start__-b-1', 'a', 'top', '同一对节点之间不能重复连线'],
      ['c-r-5', 'a', 'left', '普通生产工序不能形成循环'],
    ]) {
      const edge = page.locator('.react-flow__edge[data-id="' + edgeId + '"]');
      const point = await edge.locator('.react-flow__edge-path').evaluate(el => {
        const point = el.getPointAtLength(el.getTotalLength() / 2).matrixTransform(el.getScreenCTM());
        return { x: point.x, y: point.y };
      });
      await page.mouse.click(point.x, point.y);
      await page.waitForFunction(id => document.querySelector('.react-flow__edge[data-id="' + id + '"]').classList.contains('selected'), edgeId);
      const from = await edge.locator('.react-flow__edgeupdater-target').boundingBox();
      const to = await page.locator('.react-flow__node[data-id="' + targetId + '"] .target[data-handleid="route-handle-' + port + '"]').boundingBox();
      await page.mouse.move(from.x + from.width / 2, from.y + from.height / 2);
      await page.mouse.down(); await page.mouse.move(to.x + to.width / 2, to.y + to.height / 2, { steps: 16 });
      await page.mouse.up();
      await page.getByText(message, { exact: true }).waitFor();
      await edge.waitFor();
      assert.equal(await page.locator('.react-flow__edge-path').count(), 6);
    }
    assert.equal(await page.getByRole('button', { name: '撤销', exact: true }).isDisabled(), true);
    assert.deepEqual(writes, []);
  });
  for (const [name, sourceNodeKey, targetNodeKey, message] of [
    ['duplicate', 'a', 'c', '同一对节点之间不能重复连线'],
    ['cycle', 'c', 'a', '普通生产工序不能形成循环'],
    ['self', 'a', 'a', '节点不能连接自身'],
  ]) await run('route-save-rejects-' + name, 'route', async (page, writes) => {
    await openRoute(page);
    await page.getByRole('button', { name: '保存', exact: true }).click();
    await page.getByText('路线校验未通过，请修正红框节点后保存。', { exact: true }).waitFor();
    await page.getByText(message, { exact: true }).first().waitFor();
    assert.deepEqual(writes, [], 'invalid topology must not update version metadata or graph');
  }, { graph: { ...graph, relations: [...graph.relations, { sourceNodeKey, targetNodeKey, sourceHandle: 'route-handle-bottom', targetHandle: 'route-handle-right', relationType: 'SEQUENTIAL' }] } });
  await run('route-rework-lines-are-explicitly-marked', 'route', async (page) => {
    await openRoute(page);
    const reworkEdge = page.locator('.react-flow__edge[data-id="c-r-5"]');
    await reworkEdge.getByText('返工', { exact: true }).waitFor();
    assert.equal(await reworkEdge.locator('.react-flow__edge-path').evaluate(el => getComputedStyle(el).strokeDasharray), '6px, 4px');
    const panel = await openQuick(page, 'r', 'bottom');
    await panel.getByRole('tab', { name: '连接已有节点' }).click();
    await panel.locator('[data-route-connect-node-id="c"]').click();
    await page.waitForFunction(() => document.querySelectorAll('.react-flow__edge-path').length === 7);
    assert.equal(await page.locator('.react-flow__edge-text').filter({ hasText: '返工' }).count(), 2);
    await page.locator('.react-flow__node[data-id="r"]').click({ button: 'right' });
    await page.getByText('设为生产工序', { exact: true }).click();
    await page.getByText('普通生产工序不能形成循环', { exact: true }).waitFor();
    assert.equal(await page.locator('[data-process-route-node][data-record-id="r"]').getAttribute('data-process-route-node-type'), 'REWORK');
    await page.getByRole('button', { name: '撤销', exact: true }).click();
    await page.waitForFunction(() => document.querySelectorAll('.react-flow__edge-path').length === 6);
  });
  await run('route-branch-save-reload-preserves-explicit-rework', 'route', async (page, writes) => {
    await openRoute(page);
    await page.locator('.react-flow__edge[data-id="a-b-1"]').getByText('返工', { exact: true }).waitFor();
    const saved = page.waitForResponse(response => response.url().endsWith('/graph') && response.request().method() === 'PUT');
    await page.getByRole('button', { name: '保存', exact: true }).click(); await saved;
    await page.getByRole('dialog').waitFor({ state: 'hidden' });
    const relations = writes.find(write => write.pathname.endsWith('/graph')).body.relations;
    const rework = relations.find(edge => edge.sourceNodeKey === 'a' && edge.targetNodeKey === 'b');
    assert.equal(rework.relationType, 'REWORK');
    assert.equal(rework.ruleExpression, 'original-rework-rule');
    assert.equal(relations.find(edge => edge.sourceNodeKey === 'a' && edge.targetNodeKey === 'c').relationType, 'PARALLEL');
    await page.locator('tr[data-record-id="301"]').getByRole('button', { name: /编辑/ }).click();
    await stableDialog(page);
    const reloaded = page.locator('.react-flow__edge[data-id="a-b-1"]');
    await reloaded.getByText('返工', { exact: true }).waitFor();
    assert.equal(await reloaded.locator('.react-flow__edge-path').evaluate(el => getComputedStyle(el).strokeDasharray), '6px, 4px');
  }, { graph: { ...graph, relations: [
    ['__route_start__', 'a', 'SEQUENTIAL'], ['a', 'b', 'REWORK'], ['a', 'c', 'SEQUENTIAL'],
    ['b', '__route_end__', 'SEQUENTIAL'], ['c', '__route_end__', 'SEQUENTIAL'], ['c', 'r', 'REWORK'],
  ].map(([sourceNodeKey, targetNodeKey, relationType]) => ({ sourceNodeKey, targetNodeKey, relationType,
    sourceHandle: 'route-handle-bottom', targetHandle: 'route-handle-top', ruleExpression: relationType === 'REWORK' ? 'original-rework-rule' : null })) } });
  if (visualComparison) await writeFile(path.join(output, 'visual-comparison.json'), JSON.stringify(visualComparison, null, 2));
  await writeFile(path.join(output, 'results.json'), JSON.stringify({ scope: 'actual components with isolated HTTP; no real backend or database integration', results }, null, 2));
  console.log(JSON.stringify({ tests: results.length, failures: results.filter(result => result.status === 'failed').length, results, output }, null, 2));
  if (results.some(result => result.status === 'failed')) process.exitCode = 1;
} finally {
  if (browser) await browser.close();
  if (server) await new Promise(resolve => server.close(resolve));
  await rm(temp, { recursive: true, force: true });
}
