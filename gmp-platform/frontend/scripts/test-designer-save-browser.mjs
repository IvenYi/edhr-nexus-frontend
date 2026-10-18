import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { build } from 'esbuild';
const { chromium } = createRequire(import.meta.url)('playwright');

// Actual Shell, CanvasTab, MUI and Zustand in Chromium. Saving and catalog APIs
// are controlled fixtures; this does not write a real backend or database.
const root = path.resolve(import.meta.dirname, '..');
const temporary = await mkdtemp(path.join(os.tmpdir(), 'edhr-w2-save-browser-'));
const baseline = process.env.W2_BASELINE_COMMIT;
if (baseline && !/^[0-9a-f]{40}$/.test(baseline)) throw new Error('W2_BASELINE_COMMIT must be a full commit SHA');
const results = [];
let server, browser;
try {
  await build({ absWorkingDir: root, stdin: { resolveDir: root, loader: 'tsx', contents: `
    import React, { useState } from 'react';
    import { createRoot } from 'react-dom/client';
    import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
    import { createTheme, ThemeProvider, CssBaseline } from '@mui/material';
    import Shell from './src/pages/master-data/template-designer-react/TemplateDesignerReactShell';
    import { useTemplateDesignerStore as store } from './src/pages/master-data/template-designer-react/store/useTemplateDesignerStore';
    import { createEmptyTemplateDesignerDocument, serializeTemplateDesignerDocument } from './src/pages/master-data/template-designer-react/utils/document';
    import { SnackbarProvider, useSnackbar } from './src/components/SnackbarProvider';
    import FormDocumentPreview from './src/pages/master-data/template-designer-react/components/form-preview/FormDocumentPreview';
    const row = { id: 'qa-template', name: '保存一致性验收' };
    const initial = createEmptyTemplateDesignerDocument({ schema: 'edhr-template-designer-react', version: 1,
      templateId: row.id, versionId: 'qa-version', templateName: row.name, versionLabel: 'V1.0' });
    const version = { id: 'qa-version', version: 'V1.0', ...serializeTemplateDesignerDocument(initial) };
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    window.__store = store; window.__requests = []; window.__closed = 0;
    function App() {
      const [saving, setSaving] = useState(false);
      const [open, setOpen] = useState(true);
      const [runtimeDocument, setRuntimeDocument] = useState(null);
      const [runtimeValues, setRuntimeValues] = useState({});
      window.__openRuntime = () => { setRuntimeDocument(structuredClone(store.getState().document)); setRuntimeValues({}); window.__runtimeValues = {}; };
      const { showMessage } = useSnackbar();
      const persist = async payload => {
        setSaving(true);
        try {
          await new Promise((resolve, reject) => window.__requests.push({ payload, resolve, reject }));
          showMessage('设计已保存', 'success');
        } catch (error) { showMessage('设计保存失败', 'error'); throw error; }
        finally { setSaving(false); }
      };
      if (runtimeDocument) return <div data-runtime-fixture="true"><FormDocumentPreview document={runtimeDocument}
        runtime={{ values: runtimeValues, onChange: (id, value) => setRuntimeValues(current => {
          const next = { ...current, [id]: value }; window.__runtimeValues = next; return next;
        }) }} /></div>;
      return open ? <Shell row={row} version={version} saving={saving} onSave={persist} onAutoSave={persist}
        onClose={() => { window.__closed += 1; setOpen(false); }} /> : <div>设计器已关闭</div>;
    }
    createRoot(document.getElementById('root')).render(<ThemeProvider theme={createTheme()}><CssBaseline />
      <QueryClientProvider client={client}><SnackbarProvider><App /></SnackbarProvider></QueryClientProvider>
    </ThemeProvider>);
  ` }, bundle: true, platform: 'browser', format: 'esm', outfile: path.join(temporary, 'bundle.js'),
  // Resolve the installed icons' actual ESM distribution, as Vite does.
  alias: { '@': path.join(root, 'src'), '@mui/icons-material': path.join(root, 'node_modules/@mui/icons-material/esm') },
  loader: { '.css': 'css', '.svg': 'dataurl', '.png': 'dataurl', '.woff2': 'file', '.ttf': 'file' },
  define: { 'process.env.NODE_ENV': '"development"' },
  plugins: baseline ? [{ name: 'original-save-owners', setup(plugin) {
    plugin.onLoad({ filter: /(?:TemplateDesignerReactShell\.tsx|DesignerInspector\.tsx|useTemplateDesignerStore\.ts|fieldRegistry\.ts)$/ }, args => ({
      contents: execFileSync('git', ['show', `${baseline}:${path.relative(root, args.path).split(path.sep).join('/')}`.replace(`${baseline}:src/`, `${baseline}:gmp-platform/frontend/src/`)], { cwd: root, encoding: 'utf8' }),
      loader: args.path.endsWith('.tsx') ? 'tsx' : 'ts', resolveDir: path.dirname(args.path),
    }));
  } }] : [], logLevel: 'silent' });
  await writeFile(path.join(temporary, 'index.html'), '<!doctype html><html lang="zh-CN"><meta charset="UTF-8"><title>表单保存隔离验收</title><link rel="stylesheet" href="/bundle.css"><style>html,body,#root{height:100%;margin:0}</style><div id="root"></div><script type="module" src="/bundle.js"></script></html>');
  server = http.createServer(async (request, response) => {
    const name = new URL(request.url, 'http://localhost').pathname === '/' ? 'index.html' : request.url.slice(1);
    if (!['index.html', 'bundle.js', 'bundle.css'].includes(name)) { response.writeHead(404); response.end(); return; }
    response.setHeader('Content-Type', name.endsWith('.js') ? 'text/javascript' : name.endsWith('.css') ? 'text/css' : 'text/html; charset=utf-8');
    response.end(await readFile(path.join(temporary, name)));
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  browser = await chromium.launch({ headless: true, executablePath: process.env.CHROME_PATH });
  const save = page => page.getByRole('button', { name: '保存', exact: true });
  const dirty = page => page.evaluate(() => window.__store.getState().isDirty());
  async function edit(page, value) {
    const cell = page.locator('[data-projection-canvas="true"] [data-sheet-cell-row="1"][data-sheet-cell-col="1"]').first();
    await cell.click();
    await cell.press('F2');
    await page.locator('[data-sheet-cell-editor="true"] textarea:visible').fill(value);
    await page.getByRole('button', { name: '表单设计', exact: true }).click();
    await page.waitForFunction(expected => window.__store.getState().document.canvas.pages[0].cells['1:1']?.value === expected, value);
  }
  async function submit(page, count) {
    await save(page).click();
    await page.waitForFunction(expected => window.__requests.length === expected, count);
    assert.equal(await save(page).isEnabled(), false, 'in-flight save prevents a duplicate main save');
  }
  async function settle(page, index, success = true) {
    await page.evaluate(({ index, success }) => {
      const request = window.__requests[index];
      if (success) request.resolve(); else request.reject(new Error('isolated save failure'));
    }, { index, success });
    await page.waitForFunction(() => [...document.querySelectorAll('button')].some(button => button.textContent.trim() === '保存' && !button.disabled));
    const toast = page.getByRole('alert');
    if (await toast.count()) {
      await toast.getByRole('button').click();
      await toast.waitFor({ state: 'hidden' });
    }
  }
  async function run(name, check, viewport = { width: 1440, height: 960 }) {
    if (process.env.W2_CASE_FILTER && !name.includes(process.env.W2_CASE_FILTER)) return;
    const context = await browser.newContext({ viewport });
    await context.route('**/api/v1/**', async route => {
      assert.equal(route.request().method(), 'GET', 'catalog fixtures cannot write business data');
      await route.fulfill({ status: 200, json: { code: 200, data: { version: 'form-projection-v1', models: [], notice: '' } } });
    });
    const page = await context.newPage();
    page.setDefaultTimeout(15000);
    const errors = []; page.on('pageerror', error => errors.push(error.message));
    const consoleErrors = [];
    page.on('console', message => { if (message.type() === 'error') { consoleErrors.push(message.text()); console.error(message.text()); } });
    try {
      await page.goto(`http://127.0.0.1:${server.address().port}`);
      await page.getByRole('button', { name: '关闭侧边栏', exact: true }).click();
      await check(page);
      assert.deepEqual(errors, [], 'no browser runtime errors');
      assert.deepEqual(consoleErrors, [], 'no browser console errors or React identity warnings');
      results.push({ name, status: 'passed', viewport });
    } catch (error) {
      const state = await page.evaluate(() => {
        const current = window.__store?.getState();
        return { selectedCell: current?.selectedCell, sheet: current?.document?.canvas.pages[0].sheet,
          editorMarkup: [...document.querySelectorAll('[data-sheet-cell-editor]')].map(element => element.outerHTML.slice(0,1500)) };
      });
      throw new Error(`${error.message}\nBrowser errors: ${JSON.stringify(errors)}\nState: ${JSON.stringify(state)}\nPage text: ${(await page.locator('body').innerText()).slice(0,2000)}`, { cause: error });
    } finally { await context.close(); }
  }
  await run('edits during save remain unsaved and closing asks for confirmation', async page => {
    await edit(page, '已发送A'); await submit(page, 1);
    await edit(page, '尚未发送B'); await settle(page, 0);
    const payload = await page.evaluate(() => window.__requests[0].payload);
    assert.equal(JSON.parse(payload.canvasDesignJson).payload.pages[0].cells['1:1'].value, '已发送A');
    await page.getByRole('button', { name: '关闭', exact: true }).click();
    assert.equal(await page.evaluate(() => window.__closed), 0, 'unsent B must not close without a warning');
    await page.getByRole('dialog').getByText('当前修改尚未保存', { exact: true }).waitFor();
    if (process.env.W2_SCREENSHOT_DIR) {
      await mkdir(process.env.W2_SCREENSHOT_DIR, { recursive: true });
      await page.screenshot({ path: path.join(process.env.W2_SCREENSHOT_DIR, 'save-in-flight-desktop.png'), animations: 'disabled' });
    }
    await page.getByRole('button', { name: '继续编辑', exact: true }).press('Enter');
    assert.equal(await dirty(page), true);
    await submit(page, 2); await settle(page, 1);
    assert.equal(await dirty(page), false);
    const second = await page.evaluate(() => window.__requests[1].payload);
    assert.equal(JSON.parse(second.canvasDesignJson).payload.pages[0].cells['1:1'].value, '尚未发送B');
    await page.getByRole('button', { name: '关闭', exact: true }).click();
    assert.equal(await page.evaluate(() => window.__closed), 1);
  });
  await run('successful save without later edits allows closing', async page => {
    await edit(page, '本次已保存'); await submit(page, 1); await settle(page, 0);
    assert.equal(await dirty(page), false);
    await page.getByRole('button', { name: '关闭', exact: true }).click();
    assert.equal(await page.evaluate(() => window.__closed), 1);
  });
  await run('failed save preserves unsaved content and retry can save it', async page => {
    await edit(page, '失败后仍保留'); await submit(page, 1); await settle(page, 0, false);
    assert.equal(await dirty(page), true);
    await page.getByRole('button', { name: '关闭', exact: true }).click();
    await page.getByRole('dialog').getByText('当前修改尚未保存', { exact: true }).waitFor();
    await page.getByRole('button', { name: '继续编辑', exact: true }).click();
    await submit(page, 2); await settle(page, 1);
    assert.equal(await dirty(page), false);
  });
  await run('undo and redo retain the correct successful-save boundary', async page => {
    await edit(page, 'A'); await submit(page, 1); await edit(page, 'B'); await settle(page, 0);
    await page.getByRole('button', { name: '撤销', exact: true }).click();
    assert.equal(await dirty(page), false);
    await page.getByRole('button', { name: '重做', exact: true }).click();
    assert.equal(await dirty(page), true);
  });
  await run('narrow viewport retains keyboard access to the unsaved warning', async page => {
    await edit(page, 'A'); await submit(page, 1); await edit(page, 'B'); await settle(page, 0);
    await page.getByRole('button', { name: '关闭', exact: true }).click();
    await page.getByRole('dialog').getByText('当前修改尚未保存', { exact: true }).waitFor();
    const continueEditing = page.getByRole('button', { name: '继续编辑', exact: true });
    await continueEditing.focus();
    const bounds = await continueEditing.boundingBox();
    assert.ok(bounds && bounds.x >= 0 && bounds.x + bounds.width <= 390);
    if (process.env.W2_SCREENSHOT_DIR) await page.screenshot({ path: path.join(process.env.W2_SCREENSHOT_DIR, 'save-in-flight-narrow.png'), animations: 'disabled' });
    await continueEditing.press('Enter');
    assert.equal(await dirty(page), true);
  }, { width: 390, height: 844 });
  for (const viewport of [{ width: 1440, height: 960 }, { width: 390, height: 844 }]) {
    await run(`column insertion keeps the same field aligned and undoable at ${viewport.width}px`, async page => {
      const seeded = await page.evaluate(() => {
        const state = window.__store.getState();
        const field = state.addField('text', '设备编号');
        state.addNodeFromFieldToCell(field.id, { range: { t: 2, b: 2, l: 3, r: 3 }, left: 196, top: 36, width: 98, height: 36 });
        state.updateSheetCellValue(3, 3, '设备标签');
        state.setProjectionBindings([{ id: 'trace', modelId: 'formTrace', enabled: true, sources: { equipmentText: field.id } }]);
        const document = window.__store.getState().document;
        window.__store.getState().setDocument(document);
        window.__store.getState().setCanvasSidebarVisible(false);
        window.__store.getState().markSaved();
        return { fieldId: field.id, before: JSON.stringify(document), columns: document.canvas.pages[0].sheet.columnCount };
      });
      const header = page.locator('[data-sheet-column-ruler="true"] [data-sheet-column-active]').nth(2);
      await header.click({ button: 'right' });
      const insert = page.getByRole('menuitem').filter({ hasText: '左侧新增列' });
      await insert.focus();
      await page.keyboard.press('Enter');
      await page.waitForFunction(columns => window.__store.getState().document.canvas.pages[0].sheet.columnCount === columns + 1, seeded.columns);
      const snapshot = await page.evaluate(fieldId => {
        const state = window.__store.getState();
        const page = state.document.canvas.pages[0];
        return { node: page.nodes.find(node => node.bindings?.fieldId === fieldId), source: state.document.model.projection.bindings[0].sources.equipmentText,
          label: page.cells['3:4']?.value, history: state.undoStack.length };
      }, seeded.fieldId);
      assert.equal(snapshot.node.style.cellRange.l, 4);
      assert.equal(snapshot.node.style.cellRange.r, 4);
      assert.equal(snapshot.source, seeded.fieldId);
      assert.equal(snapshot.label, '设备标签');
      assert.equal(snapshot.history, 1);
      const closeSidebar = page.getByRole('button', { name: '关闭侧边栏', exact: true });
      if (await closeSidebar.isVisible()) await closeSidebar.click();
      const rendered = page.locator(`[data-canvas-node="true"][data-projection-field-id="${seeded.fieldId}"]`).first();
      await rendered.scrollIntoViewIfNeeded();
      const nodeBox = await rendered.boundingBox();
      const cellBox = await page.locator('[data-projection-canvas="true"] [data-sheet-cell-row="2"][data-sheet-cell-col="4"]').first().boundingBox();
      assert.ok(nodeBox && cellBox && Math.abs(nodeBox.x - cellBox.x - 3) <= 1, 'the actual rendered control follows the destination cell');
      assert.ok(nodeBox.x >= 0 && nodeBox.x + nodeBox.width <= viewport.width, 'the destination control is reachable in the viewport');
      if (process.env.W2_SCREENSHOT_DIR) {
        await mkdir(process.env.W2_SCREENSHOT_DIR, { recursive: true });
        await page.screenshot({ path: path.join(process.env.W2_SCREENSHOT_DIR, `column-insertion-${viewport.width}.png`), animations: 'disabled' });
      }
      await page.getByRole('button', { name: '撤销', exact: true }).click();
      assert.equal(await page.evaluate(() => JSON.stringify(window.__store.getState().document)), seeded.before);
      assert.equal(await dirty(page), false);
      await page.getByRole('button', { name: '重做', exact: true }).click();
      assert.equal(await page.evaluate(fieldId => window.__store.getState().document.canvas.pages[0].nodes.find(node => node.bindings?.fieldId === fieldId).style.cellRange.l, seeded.fieldId), 4);
      assert.equal(await dirty(page), true);
    }, viewport);
  }
  for (const viewport of [{ width: 1440, height: 960 }, { width: 390, height: 844 }]) {
    await run(`subfield edit updates the placed control and saved definition at ${viewport.width}px`, async page => {
      const seeded = await page.evaluate(() => {
        const state = window.__store.getState();
        const table = state.addField('subTable', '检验明细');
        const [field] = state.addSubTableFields(table.id, [{ name: '旧编号', type: 'text' }]);
        state.addSubTableRegionFromFieldToRange(table.id, { t: 2, b: 5, l: 2, r: 5 }, { left: 98, top: 36, width: 392, height: 144 });
        state.addNodeFromSubTableFieldToCell(table.id, field, { range: { t: 3, b: 3, l: 3, r: 4 }, left: 196, top: 72, width: 196, height: 36 });
        const document = window.__store.getState().document;
        window.__store.getState().setDocument(document);
        window.__store.getState().markSaved();
        return { tableId: table.id, fieldId: field.id, before: JSON.stringify(document) };
      });
      await page.getByRole('button', { name: '字段设计', exact: true }).click();
      await page.locator('[data-field-name-with-usage="true"]').getByText('检验明细', { exact: true }).hover();
      await page.getByRole('button', { name: '设计子表', exact: true }).click();
      await page.locator('[data-field-name-with-usage="true"]').getByText('旧编号', { exact: true }).hover();
      await page.getByRole('button', { name: '编辑字段', exact: true }).click();
      const editor = page.locator('[data-field-create-dialog="true"]');
      await editor.getByLabel('字段名称', { exact: true }).fill('新数量');
      await editor.getByText('文本', { exact: true }).click();
      await page.getByRole('option', { name: '数字', exact: true }).click();
      await editor.getByRole('button', { name: '保存修改', exact: true }).press('Enter');
      await editor.waitFor({ state: 'hidden' });
      await page.getByRole('button', { name: '返回上一层', exact: true }).click();
      await page.getByRole('button', { name: '表单设计', exact: true }).click();
      await page.getByRole('button', { name: '模拟填报', exact: true }).click();
      const mock = page.locator('[data-mock-fill-dialog="true"]');
      await mock.waitFor({ state: 'visible' });
      if (process.env.W2_SCREENSHOT_DIR) {
        await mkdir(process.env.W2_SCREENSHOT_DIR, { recursive: true });
        await page.screenshot({ path: path.join(process.env.W2_SCREENSHOT_DIR, `subfield-edit-${viewport.width}.png`), animations: 'disabled' });
      }
      const placeholders = await mock.locator('input[placeholder]').evaluateAll(inputs => inputs.map(input => input.getAttribute('placeholder')));
      assert.ok(placeholders.includes('新数量'), 'actual mock paper uses the edited column name');
      assert.ok(!placeholders.includes('旧编号'), 'actual mock paper cannot retain the former name');
      const control = mock.getByPlaceholder('新数量', { exact: true }).first();
      assert.equal(await control.getAttribute('inputmode'), 'decimal');
      await control.fill('42');
      assert.equal(await control.inputValue(), '42');
      await mock.getByRole('button', { name: '关闭模拟填报', exact: true }).press('Enter');
      await page.getByRole('button', { name: '撤销', exact: true }).click();
      assert.equal(await page.evaluate(() => JSON.stringify(window.__store.getState().document)), seeded.before);
      await page.getByRole('button', { name: '重做', exact: true }).click();
      await submit(page, 1); await settle(page, 0);
      const saved = await page.evaluate(({ tableId, fieldId }) => {
        const payload = window.__requests[0].payload;
        const model = JSON.parse(payload.modelDesignJson).payload;
        const canvas = JSON.parse(payload.canvasDesignJson).payload;
        return { column: model.fields.find(field => field.id === tableId).typeConfig.columns.find(field => field.id === fieldId),
          node: canvas.pages[0].nodes.find(node => node.bindings?.subTableFieldId === fieldId) };
      }, seeded);
      assert.equal(saved.column.name, '新数量');
      assert.equal(saved.node.bindings.subTableField.name, saved.column.name);
      assert.equal(saved.node.bindings.subTableField.type, 'number');
      assert.equal(saved.node.bindings.subTableFieldId, seeded.fieldId);
    }, viewport);
  }
  for (const viewport of [{ width: 1440, height: 960 }, { width: 390, height: 844 }]) {
    await run(`choice options share their definition, actual default and new runtime rows at ${viewport.width}px`, async page => {
      const seeded = await page.evaluate(() => {
        const state = window.__store.getState();
        const table = state.addField('subTable', '检验明细');
        const [field] = state.addSubTableFields(table.id, [{ name: '检验结果', type: 'singleSelect' }]);
        state.addSubTableRegionFromFieldToRange(table.id, { t: 2, b: 6, l: 2, r: 5 }, { left: 98, top: 36, width: 392, height: 180 });
        const tableNode = window.__store.getState().document.canvas.pages[0].nodes.find(node => node.type === 'sub-table');
        state.setSelectedNodeId(tableNode.id);
        state.updateSelectedSubTableRegion({ repeat: { type: 'dynamic' } });
        for (const row of [3, 5]) state.addNodeFromSubTableFieldToCell(table.id, field,
          { range: { t: row, b: row, l: 3, r: 4 }, left: 196, top: (row - 1) * 36, width: 196, height: 36 });
        const document = window.__store.getState().document;
        state.setDocument(document); state.markSaved();
        const selected = document.canvas.pages[0].nodes.find(node => node.bindings?.subTableFieldId === field.id);
        state.setSelectedNodeId(selected.id); state.setActiveCanvasRail('config');
        return { tableId: table.id, fieldId: field.id, nodeId: selected.id, before: JSON.stringify(document) };
      });
      const rows = page.locator('[data-option-list-editor="true"] [data-option-row="true"]');
      await rows.first().locator('input').fill('合格:pass');
      const edited = await page.evaluate(({ tableId, fieldId }) => {
        const document = window.__store.getState().document;
        return { options: document.model.fields.find(field => field.id === tableId).typeConfig.columns.find(field => field.id === fieldId).typeConfig.options,
          lists: document.canvas.pages[0].nodes.filter(node => node.bindings?.subTableFieldId === fieldId).map(node => node.bindings.widgetConfig.optionList) };
      }, seeded);
      assert.equal(edited.options[0]?.value, 'pass', 'actual Inspector editing updates the canonical option value');
      assert.deepEqual(edited.lists, ['合格:pass\n选项2', '合格:pass\n选项2']);
      await page.getByRole('button', { name: '撤销', exact: true }).click();
      assert.equal(await page.evaluate(() => JSON.stringify(window.__store.getState().document)), seeded.before);
      await page.getByRole('button', { name: '重做', exact: true }).click();
      await page.evaluate(nodeId => {
        window.__store.getState().setSelectedNodeId(nodeId);
        window.__store.getState().setActiveCanvasRail('config');
      }, seeded.nodeId);
      await rows.nth(1).locator('input').fill('不合格:fail');
      await rows.first().hover();
      await rows.first().getByRole('button', { name: '设为默认值', exact: true }).click();
      assert.equal(await page.evaluate(nodeId => window.__store.getState().document.canvas.pages[0].nodes.find(node => node.id === nodeId).bindings.defaultValue, seeded.nodeId), 'pass');
      assert.equal(await rows.first().locator('[data-option-default-active="true"]').count(), 1);
      if (process.env.W2_SCREENSHOT_DIR) {
        await mkdir(process.env.W2_SCREENSHOT_DIR, { recursive: true });
        await page.screenshot({ path: path.join(process.env.W2_SCREENSHOT_DIR, `choice-inspector-${viewport.width}.png`), animations: 'disabled' });
      }
      await submit(page, 1); await settle(page, 0);
      const payload = await page.evaluate(() => window.__requests[0].payload);
      const column = JSON.parse(payload.modelDesignJson).payload.fields.find(field => field.id === seeded.tableId).typeConfig.columns.find(field => field.id === seeded.fieldId);
      assert.deepEqual(column.typeConfig.options.map(({ label, value }) => ({ label, value })), [{ label: '合格', value: 'pass' }, { label: '不合格', value: 'fail' }]);
      await page.evaluate(() => window.__openRuntime());
      await page.locator('[data-runtime-fixture="true"]').waitFor();
      await page.getByRole('button', { name: '新增行', exact: true }).click();
      const values = await page.evaluate(() => window.__runtimeValues);
      assert.equal(values[seeded.tableId].length, 2);
      assert.ok(values[seeded.tableId].every(row => row[seeded.fieldId] === 'pass'), 'new real runtime rows persist the selected canonical default');
      assert.notEqual(values[seeded.tableId][0].__rowId, values[seeded.tableId][1].__rowId);
      assert.ok((await page.locator('[data-runtime-fixture="true"]').innerText()).includes('合格'));
      assert.equal(await page.locator(`[data-form-preview-field="${seeded.fieldId}"]`).count(), 4, 'two placements of the same field render independently in each of two actual rows');
      await page.getByRole('button', { name: '删除行', exact: true }).click();
      assert.equal(await page.locator(`[data-form-preview-field="${seeded.fieldId}"]`).count(), 2);
      assert.equal(await page.evaluate(tableId => window.__runtimeValues[tableId][0].__rowId, seeded.tableId), values[seeded.tableId][0].__rowId);
      const firstControl = page.locator(`[data-form-preview-field="${seeded.fieldId}"]`).first();
      await firstControl.scrollIntoViewIfNeeded();
      const controlBox = await firstControl.boundingBox();
      assert.ok(controlBox && controlBox.x >= 0 && controlBox.x + controlBox.width <= viewport.width, 'the selected choice control remains reachable after removing a row');
      if (process.env.W2_SCREENSHOT_DIR) await page.screenshot({ path: path.join(process.env.W2_SCREENSHOT_DIR, `choice-runtime-${viewport.width}.png`), animations: 'disabled' });
      if (process.env.W2_CHOICE_DESIGN_PATH) await writeFile(process.env.W2_CHOICE_DESIGN_PATH, JSON.stringify({
        provenance: 'actual Inspector edit and controlled Shell save callback, followed by actual FormDocumentPreview add-row interaction',
        design: payload, tableId: seeded.tableId, fieldId: seeded.fieldId, values,
      }, null, 2) + '\n');
    }, viewport);
  }
  for (const viewport of [{ width: 1440, height: 960 }, { width: 390, height: 844 }]) {
    await run(`multi-select Inspector defaults toggle parsed values independently at ${viewport.width}px`, async page => {
      const seeded = await page.evaluate(() => {
        const state = window.__store.getState();
        const field = state.addField('multiSelect', '多选结果');
        state.addNodeFromFieldToCell(field.id, { range: { t: 3, b: 3, l: 3, r: 4 }, left: 196, top: 72, width: 196, height: 36 });
        const node = window.__store.getState().document.canvas.pages[0].nodes.find(item => item.bindings?.fieldId === field.id);
        state.setSelectedNodeId(node.id); state.setActiveCanvasRail('config');
        return { fieldId: field.id, nodeId: node.id };
      });
      const rows = page.locator('[data-option-list-editor="true"] [data-option-row="true"]');
      await rows.first().locator('input').fill('合格:pass');
      await rows.nth(1).locator('input').fill('不合格:fail');
      for (const row of [rows.first(), rows.nth(1)]) {
        await row.hover();
        await row.getByRole('button', { name: '设为默认值', exact: true }).click();
      }
      const defaults = () => page.evaluate(nodeId => window.__store.getState().document.canvas.pages[0].nodes.find(node => node.id === nodeId).bindings.defaultValue, seeded.nodeId);
      assert.deepEqual(await defaults(), ['pass', 'fail']);
      assert.equal(await rows.locator('[data-option-default-active="true"]').count(), 2);
      await rows.first().hover();
      await rows.first().getByRole('button', { name: '设为默认值', exact: true }).click();
      assert.deepEqual(await defaults(), ['fail']);
      assert.equal(await rows.locator('[data-option-default-active="true"]').count(), 1);
      await submit(page, 1); await settle(page, 0);
      const saved = await page.evaluate(({ fieldId, nodeId }) => {
        const payload = window.__requests[0].payload;
        return { field: JSON.parse(payload.modelDesignJson).payload.fields.find(field => field.id === fieldId),
          node: JSON.parse(payload.canvasDesignJson).payload.pages[0].nodes.find(node => node.id === nodeId) };
      }, seeded);
      assert.deepEqual(saved.field.typeConfig.options.map(option => option.value), ['pass', 'fail']);
      assert.deepEqual(saved.node.bindings.defaultValue, ['fail']);
      if (process.env.W2_SCREENSHOT_DIR) await page.screenshot({ path: path.join(process.env.W2_SCREENSHOT_DIR, `multi-choice-inspector-${viewport.width}.png`), animations: 'disabled' });
    }, viewport);
  }
  for (const viewport of [{ width: 1440, height: 960 }, { width: 390, height: 844 }]) {
    await run(`ModelTab child creation and type conversion persist presets before default selection at ${viewport.width}px`, async page => {
      await page.getByRole('button', { name: '字段设计', exact: true }).click();
      const seeded = await page.evaluate(() => {
        const state = window.__store.getState();
        const table = state.addField('subTable', '模型入口子表');
        const [field] = state.addSubTableFields(table.id, [{ name: '待改型子列', type: 'text' }]);
        return { tableId: table.id, convertedId: field.id };
      });
      await page.locator('[data-field-name-with-usage="true"]').filter({ hasText: '模型入口子表' }).hover();
      await page.getByRole('button', { name: '设计子表', exact: true }).click();
      await page.getByRole('button', { name: '新增字段', exact: true }).click();
      const dialog = page.locator('[data-field-create-dialog="true"]');
      await dialog.getByLabel('字段名称', { exact: true }).fill('实际新增单选');
      await dialog.getByLabel('字段类型', { exact: true }).click();
      await page.getByRole('option', { name: '单选', exact: true }).click();
      await dialog.getByRole('button', { name: '确认', exact: true }).click();
      await dialog.waitFor({ state: 'hidden' });
      await page.waitForFunction(() => window.__requests.length === 1);
      const createdId = await page.evaluate(tableId => {
        const field = window.__store.getState().document.model.fields.find(item => item.id === tableId).typeConfig.columns.find(item => item.name === '实际新增单选');
        return field.id;
      }, seeded.tableId);
      const savedColumns = await page.evaluate(() => JSON.parse(window.__requests[0].payload.modelDesignJson).payload.fields[0].typeConfig.columns);
      assert.deepEqual(savedColumns.find(field => field.id === createdId).typeConfig.options.map(option => option.value), ['选项1', '选项2'], 'actual ModelTab creation saves canonical presets before Inspector edits');
      await page.evaluate(() => window.__requests[0].resolve());
      // Child-design view has its own header and no global 保存 button.
      await page.waitForFunction(() => !window.__store.getState().isDirty());
      const card = page.locator('[data-field-name-with-usage="true"]').filter({ hasText: '待改型子列' }).locator('xpath=ancestor::*[contains(@class,"MuiPaper-root")][1]');
      await card.hover();
      await card.getByRole('button', { name: '编辑字段', exact: true }).click();
      await dialog.getByLabel('字段类型', { exact: true }).click();
      await page.getByRole('option', { name: '单选', exact: true }).click();
      await dialog.getByRole('button', { name: '保存修改', exact: true }).click();
      await dialog.waitFor({ state: 'hidden' });
      const columns = await page.evaluate(tableId => window.__store.getState().document.model.fields.find(item => item.id === tableId).typeConfig.columns, seeded.tableId);
      assert.ok(columns.every(field => field.type === 'singleSelect' && field.typeConfig.options.length === 2));
      assert.ok(columns.some(field => field.id === seeded.convertedId), 'type conversion preserves child identity');
      await page.getByRole('button', { name: '返回上一层', exact: true }).click();
      await page.getByRole('button', { name: '表单设计', exact: true }).click();
      const placements = await page.evaluate(tableId => {
        const state = window.__store.getState();
        const table = state.document.model.fields.find(field => field.id === tableId);
        state.addSubTableRegionFromFieldToRange(table.id, { t: 2, b: 6, l: 2, r: 6 }, { left: 98, top: 36, width: 490, height: 180 });
        const region = window.__store.getState().document.canvas.pages[0].nodes.find(node => node.type === 'sub-table');
        state.setSelectedNodeId(region.id); state.updateSelectedSubTableRegion({ repeat: { type: 'dynamic' } });
        table.typeConfig.columns.forEach((field, index) => state.addNodeFromSubTableFieldToCell(table.id, field,
          { range: { t: 3 + index * 2, b: 3 + index * 2, l: 3, r: 4 }, left: 196, top: 72 + index * 72, width: 196, height: 36 }));
        return window.__store.getState().document.canvas.pages[0].nodes.filter(node => node.bindings?.subTableFieldId).map(node => ({ id: node.id, fieldId: node.bindings.subTableFieldId }));
      }, seeded.tableId);
      for (const node of placements) {
        await page.evaluate(id => { window.__store.getState().setSelectedNodeId(id); window.__store.getState().setActiveCanvasRail('config'); }, node.id);
        const first = page.locator('[data-option-list-editor="true"] [data-option-row="true"]').first();
        await first.hover(); await first.getByRole('button', { name: '设为默认值', exact: true }).click();
      }
      await submit(page, 2); await settle(page, 1);
      if (process.env.W2_SCREENSHOT_DIR) await page.screenshot({ path: path.join(process.env.W2_SCREENSHOT_DIR, `modeltab-choice-inspector-${viewport.width}.png`), animations: 'disabled' });
      await page.evaluate(() => window.__openRuntime());
      await page.getByRole('button', { name: '新增行', exact: true }).click();
      const values = await page.evaluate(tableId => window.__runtimeValues[tableId], seeded.tableId);
      assert.equal(values.length, 2);
      assert.ok(values.every(row => placements.every(node => row[node.fieldId] === '选项1')), 'both actual ModelTab creation and type conversion yield real row defaults without option text edits');
    }, viewport);
  }
  const result = { kind: 'actual-shell-and-canvas-with-controlled-save-callback', baseline: baseline ?? null, results };
  if (process.env.W2_RESULT_PATH) await writeFile(process.env.W2_RESULT_PATH, JSON.stringify(result, null, 2) + '\n');
  console.log(JSON.stringify(result, null, 2));
} finally {
  if (browser) await browser.close();
  if (server) await new Promise(resolve => server.close(resolve));
  await rm(temporary, { recursive: true, force: true });
}
