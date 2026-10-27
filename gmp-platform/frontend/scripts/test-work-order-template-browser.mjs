import assert from 'node:assert/strict';
import { mkdtemp, readFile, writeFile, rm, mkdir } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';
import { build } from 'esbuild';
import ExcelJS from 'exceljs';
const { chromium } = createRequire(import.meta.url)('playwright');

// Real WorkOrderPage, React Query, HTTP client, XLSX download and import in Chromium.
// HTTP responses are isolated fixtures; this does not verify backend authorization/persistence.
const root = path.resolve(import.meta.dirname, '..');
const temp = await mkdtemp(path.join(os.tmpdir(), 'edhr-work-order-template-'));
const artifacts = process.env.W4_BROWSER_ARTIFACTS;
const baseline = process.env.W4_BASELINE_COMMIT;
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
      import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
      import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
      import { SnackbarProvider } from './src/components/SnackbarProvider';
      import Page from './src/pages/production/WorkOrderPage';
      const client = new QueryClient({defaultOptions:{queries:{retry:false}}});
      createRoot(document.getElementById('root')).render(<ThemeProvider theme={createTheme()}><CssBaseline />
        <QueryClientProvider client={client}><SnackbarProvider><Page /></SnackbarProvider></QueryClientProvider>
      </ThemeProvider>);` },
    bundle: true, platform: 'browser', format: 'esm', outfile: path.join(temp, 'bundle.js'),
    alias: { '@': path.join(root, 'src') }, define: { 'process.env.NODE_ENV': '"production"' },
    plugins: baseline ? [{ name: 'baseline-page', setup(plugin) {
      plugin.onLoad({ filter: /\/WorkOrderPage\.tsx$/ }, ({ path: filename }) => ({
        contents: execFileSync('git', ['show', `${baseline}:gmp-platform/frontend/src/pages/production/WorkOrderPage.tsx`], { cwd: root, encoding: 'utf8' }),
        loader: 'tsx', resolveDir: path.dirname(filename),
      }));
    } }] : [],
  });
  await writeFile(path.join(temp, 'index.html'), '<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><body><div id="root"></div><script type="module" src="/bundle.js"></script></body></html>');
  server = http.createServer(async (request, response) => {
    const file = request.url === '/' ? 'index.html' : request.url.slice(1);
    if (!['index.html', 'bundle.js'].includes(file)) { response.writeHead(404).end(); return; }
    response.setHeader('Content-Type', file.endsWith('.js') ? 'text/javascript' : 'text/html; charset=utf-8');
    response.end(await readFile(path.join(temp, file)));
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  browser = await chromium.launch({ headless: true, executablePath: process.env.CHROME_PATH });
  for (const [form, width] of [['SN', 1440], ['BATCH', 1440], ['SN', 390], ['BATCH', 390]]) {
    const name = `${form}-${width}`;
    const context = await browser.newContext({ viewport: { width, height: 960 } });
    const page = await context.newPage();
    const errors = [], posted = [];
    let objects = [];
    page.on('pageerror', error => errors.push(error.message));
    const order = { id: '100', orderNo: 'QA-WO-100', productId: '1', productName: '隔离验收产品', productCode: 'QA-1', productionMode: '量产', productionForm: form, status: 'CREATED', plannedQuantity: 10, allocatedQuantity: 0, hasObjects: false };
    await context.route('**/api/v1/**', async route => {
      const request = route.request(), pathname = new URL(request.url()).pathname;
      let data;
      if (request.method() === 'GET' && pathname === '/api/v1/production/work-orders') data = { content: [order], totalElements: 1, totalPages: 1 };
      else if (request.method() === 'GET' && pathname.endsWith('/process-options')) data = [{ id: '12', version: 'A1', productionMode: '量产', productionForm: form }];
      else if (request.method() === 'GET' && pathname.endsWith('/objects')) data = objects;
      else if (request.method() === 'GET' && pathname === '/api/v1/master-data/product-modeling/products') data = { content: [], totalElements: 0, totalPages: 0 };
      else if (request.method() === 'POST' && pathname === '/api/v1/production/work-orders/100/objects/batch') {
        const body = request.postDataJSON(); posted.push(body);
        data = body.items.map((item, index) => ({ ...item, id: String(200 + index), objectType: form, status: 'CREATED', processVersion: 'A1' }));
        objects = data;
      } else { errors.push(`Unexpected HTTP ${request.method()} ${pathname}`); await route.abort(); return; }
      await route.fulfill({ json: { code: 200, data } });
    });
    try {
      await page.goto(`http://127.0.0.1:${server.address().port}`);
      await page.getByRole('button', { name: '生产对象', exact: true }).click();
      const dialog = page.getByRole('dialog');
      const assertLayout = async (stage) => {
        const geometry = await dialog.evaluate(element => {
          const content = element.querySelector('.MuiDialogContent-root');
          const rect = content.getBoundingClientRect();
          return { overflow: content.scrollWidth - content.clientWidth, left: rect.left, right: rect.right };
        });
        assert.ok(geometry.overflow <= 1, `${name} ${stage}: dialog content overflows horizontally by ${geometry.overflow}px`);
        const button = await dialog.getByRole('button', { name: '下载导入模板' }).boundingBox();
        assert.ok(button && button.x >= geometry.left && button.x + button.width <= geometry.right + 1,
          `${name} ${stage}: download action must fit inside dialog content`);
        return { stage, horizontalOverflow: geometry.overflow };
      };
      const layoutChecks = [];
      await dialog.getByRole('combobox', { name: '本次添加使用的制程' }).click();
      await page.getByRole('option').filter({ hasText: 'A1' }).click();
      await dialog.getByRole('tab', { name: '导入' }).click();
      layoutChecks.push(await assertLayout('empty'));
      const downloadButton = dialog.getByRole('button', { name: '下载导入模板' });
      await downloadButton.focus();
      const downloaded = page.waitForEvent('download');
      await page.keyboard.press('Enter');
      const download = await downloaded;
      assert.equal(download.suggestedFilename(), form === 'SN' ? '生产SN导入模板.xlsx' : '生产批次导入模板.xlsx');
      const file = path.join(temp, `${name}.xlsx`);
      await download.saveAs(file);
      if (artifacts) await page.screenshot({ path: path.join(artifacts, `${name}-download.png`), fullPage: true });
      const workbook = new ExcelJS.Workbook(); await workbook.xlsx.readFile(file);
      const sheet = workbook.worksheets[0];
      const headers = form === 'SN' ? ['SN编号', '计划开始时间', '计划结束时间'] : ['批次号', '数量', '计划开始时间', '计划结束时间', '备注'];
      assert.deepEqual(sheet.getRow(5).values.slice(1), headers);
      assert.equal(sheet.getRow(6).cellCount, headers.length);
      assert.equal(sheet.columnCount, headers.length);
      assert.equal(String(sheet.getCell('A3').value).includes('备注'), form === 'BATCH');
      await dialog.locator('input[type=file]').setInputFiles(file);
      await page.getByText('已导入 1 条待添加记录', { exact: true }).waitFor();
      await dialog.getByRole('button', { name: '提交待添加（1）' }).waitFor();
      const upload = async (csv, message) => {
        await dialog.locator('input[type=file]').setInputFiles({ name: 'compat.csv', mimeType: 'text/csv', buffer: Buffer.from('\ufeff' + csv) });
        await page.getByText(message, { exact: true }).waitFor();
      };
      if (form === 'SN') {
        await upload('SN编号,数量\nINVALID,2', '导入失败：SN生产形态第 2 行数量必须为1');
        await upload('SN编号\nSN-001', '导入失败：第 2 行SN编号重复');
        await upload('SN编号,计划开始时间,计划结束时间\nBAD-DATE,2026-08-30 08:00,2026-08-29 08:00', '导入失败：第 2 行计划结束时间早于开始时间');
        await upload('SN编号,计划开始时间,计划结束时间,备注\nLEGACY,,,保留旧备注', '已导入 1 条待添加记录');
      } else {
        await upload('批次号,数量\nEXCESS,11', '导入失败：导入数量合计 11 超出剩余可分配数量 9');
      }
      const count = form === 'SN' ? 2 : 1;
      layoutChecks.push(await assertLayout('staged'));
      if (artifacts) await page.screenshot({ path: path.join(artifacts, `${name}.png`), fullPage: true });
      await dialog.getByRole('button', { name: `提交待添加（${count}）` }).click();
      await page.waitForFunction(() => [...document.querySelectorAll('button')].some(button => button.textContent === '提交待添加（0）'));
      assert.equal(posted.length, 1);
      assert.equal(posted[0].items.length, count);
      assert.equal(posted[0].items[0].targetQuantity, 1);
      assert.equal(posted[0].items[0].plannedStartAt, '2026-08-29T08:00:00');
      if (form === 'SN') assert.equal(posted[0].items[1].remark, '保留旧备注');
      await dialog.locator('[data-record-id]').first().waitFor();
      layoutChecks.push(await assertLayout('saved'));
      if (width === 390) {
        const table = dialog.getByRole('region', { name: '已拆分生产对象表' });
        await table.focus();
        await table.press('ArrowRight');
        await page.waitForFunction(() => document.querySelector('[aria-label="已拆分生产对象表"]').scrollLeft > 0);
        layoutChecks.push(await assertLayout('table-keyboard-scroll'));
      }
      assert.deepEqual(errors, []);
      if (artifacts) await page.screenshot({ path: path.join(artifacts, `${name}-saved.png`), fullPage: true });
      results.push({ name, result: 'passed', layoutChecks, checks: 'dialog geometry; keyboard download/local table scroll; XLSX columns/example/help; import; negative validations; staged submit; console' });
    } catch (error) {
      results.push({ name, result: 'failed', message: error.message, pageErrors: errors });
    } finally { await context.close(); }
  }
} finally {
  if (browser) await browser.close();
  if (server) await new Promise(resolve => server.close(resolve));
  await rm(temp, { recursive: true, force: true });
}
console.log(JSON.stringify({ boundary: 'real Chromium UI, fixture HTTP; no real backend writes', baseline: baseline || null, results }, null, 2));
if (results.some(result => result.result !== 'passed')) process.exitCode = 1;
