import assert from 'node:assert/strict';
import { mkdtemp, readFile, writeFile, mkdir, rm } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { build } from 'esbuild';

const { chromium } = createRequire(import.meta.url)('playwright');
const root = path.resolve(import.meta.dirname, '..');
const baseline = process.env.CATEGORY_BASELINE_COMMIT;
if (baseline && !/^[a-f0-9]{40}$/.test(baseline)) throw new Error('Expected full baseline SHA');
const artifacts = process.env.CATEGORY_ARTIFACTS;
const temp = await mkdtemp(path.join(os.tmpdir(), 'edhr-category-delete-'));
const results = [];
const finishFiniteAnimations = page => page.evaluate(() => Promise.all(document.getAnimations()
  .filter(animation => animation.effect?.getTiming().iterations !== Infinity)
  .map(animation => animation.finished.catch(() => {}))));
let browser, server;
try {
  if (artifacts) await mkdir(artifacts, { recursive: true });
  await build({ absWorkingDir: root, stdin: { resolveDir: root, loader: 'tsx', contents: `
    import React from 'react';import {createRoot} from 'react-dom/client';
    import {ThemeProvider,createTheme,CssBaseline} from '@mui/material';
    import {MemoryRouter} from 'react-router-dom';
    import {QueryClient,QueryClientProvider} from '@tanstack/react-query';
    import {SnackbarProvider} from './src/components/SnackbarProvider';
    import DeletionProtectionDialog from './src/components/DeletionProtectionDialog';
    import DocumentManagementPage from './src/pages/master-data/DocumentManagementPage';
    import {useAuthStore} from './src/stores/authStore';
    useAuthStore.getState().login('synthetic-category-browser-token',{id:'category-browser',username:'category-browser',displayName:'分类验证',email:'',permissions:['master-data.documents']});
    const client=new QueryClient({defaultOptions:{queries:{retry:false,refetchOnWindowFocus:false},mutations:{retry:false}}});
    createRoot(document.getElementById('root')).render(<ThemeProvider theme={createTheme()}><CssBaseline/>
      <MemoryRouter><QueryClientProvider client={client}><SnackbarProvider>
        <DocumentManagementPage/><DeletionProtectionDialog/>
      </SnackbarProvider></QueryClientProvider></MemoryRouter></ThemeProvider>);` },
    bundle: true, platform: 'browser', format: 'esm', outfile: path.join(temp, 'bundle.js'),
    alias: { '@': path.join(root, 'src'), '@mui/icons-material': path.join(root, 'node_modules/@mui/icons-material/esm') },
    loader: { '.css': 'css', '.svg': 'dataurl', '.png': 'dataurl', '.woff2': 'file', '.ttf': 'file' },
    define: { 'process.env.NODE_ENV': '"production"' }, logLevel: 'silent',
    plugins: baseline ? [{ name: 'original-document-page-only', setup(plugin) {
      plugin.onLoad({ filter: /DocumentManagementPage\.tsx$/ }, ({ path: filename }) => ({
        contents: execFileSync('git', ['show', `${baseline}:gmp-platform/frontend/src/pages/master-data/DocumentManagementPage.tsx`], { cwd: root, encoding: 'utf8' }),
        loader: 'tsx', resolveDir: path.dirname(filename),
      }));
    } }] : [],
  });
  const css = await readFile(path.join(temp, 'bundle.css')).then(() => '<link rel="stylesheet" href="/bundle.css">').catch(error => {
    if (error.code === 'ENOENT') return ''; throw error;
  });
  await writeFile(path.join(temp, 'index.html'), `<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">${css}<style>html,body,#root{min-height:100%;margin:0}</style><div id="root"></div><script type="module" src="/bundle.js"></script></html>`);
  server = http.createServer(async (req, res) => {
    const name = new URL(req.url, 'http://localhost').pathname.slice(1) || 'index.html';
    if (!['index.html', 'bundle.js', 'bundle.css'].includes(name)) { res.writeHead(404).end(); return; }
    res.setHeader('Content-Type', name.endsWith('.js') ? 'text/javascript' : name.endsWith('.css') ? 'text/css' : 'text/html;charset=utf-8');
    try { res.end(await readFile(path.join(temp, name))); } catch { res.writeHead(404).end(); }
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  browser = await chromium.launch({ headless: true, executablePath: process.env.CHROME_PATH || '/usr/bin/chromium' });
  for (const width of [390, 1440]) for (const mode of ['confirm-copy-cancel', 'success-feedback', 'referenced', 'precheck-error', 'slow-cancel']) {
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    const errors = [], requests = [];
    let deletes = 0, checks = 0, deleted = false, releaseCheck;
    const delayed = new Promise(resolve => { releaseCheck = resolve; });
    page.on('pageerror', error => errors.push(error.message));
    page.on('dialog', dialog => { errors.push(`native dialog:${dialog.type()}`); void dialog.dismiss(); });
    await page.route('**/api/**', async route => {
      const request = route.request(), url = new URL(request.url()), method = request.method();
      requests.push({ method, path: url.pathname });
      const ok = data => route.fulfill({ json: { code: 200, data } });
      if (url.pathname === '/api/v1/master-data/documents/categories' && method === 'GET') return ok([
        { id: 'ALL', name: '全部', system: true, count: 1, sortOrder: 0 },
        { id: 'UNCATEGORIZED', name: '未分类', system: true, count: 0, sortOrder: 1 },
        { id: '201', name: '引用分类', system: false, count: 1, sortOrder: 30 },
        ...deleted ? [] : [{ id: '202', name: '空分类', system: false, count: 0, sortOrder: 40 }],
      ]);
      if (url.pathname === '/api/v1/master-data/documents' && method === 'GET') return ok({ page: 1, size: 20, totalElements: 1, totalPages: 1, content: [
        { id: '101', title: '关联文档', categoryId: '201', categoryName: '引用分类', versions: [{ id: '301', documentId: '101', version: 'V1', code: 'DOC-101', status: 'ACTIVE' }] },
      ] });
      if (url.pathname.startsWith('/api/v1/master-data/deletion-check/document_category/')) {
        checks++;
        if (mode === 'slow-cancel') { await delayed; try { return await ok({ allowed: true, impact: null }); } catch { return; } }
        if (mode === 'precheck-error' && checks === 1) return route.fulfill({ status: 500, json: { code: 500, message: '检查暂不可用' } });
        if (mode === 'referenced') return ok({ allowed: false, impact: {
          kind: 'DELETION_BLOCKED', targetName: '引用分类', targetCode: '', targetType: 'document_category', targetId: '201', targetModule: '数据 / 工艺建模 / 文档管理',
          groups: [{ key: 'documents', label: '文档', module: '数据 / 工艺建模 / 文档管理', path: '/master-data/documents', guidance: '请先处理文档引用', count: 1, restricted: false, dataType: 'BUSINESS',
            records: [{ id: '101', name: '关联文档', code: '', version: '', status: 'DRAFT', context: '引用分类', location: '引用分类 / 关联文档', path: '/master-data/documents?locateId=101' }] }],
        } });
        return ok({ allowed: true, impact: null });
      }
      if (url.pathname === '/api/v1/master-data/documents/categories/202' && method === 'DELETE') { deletes++; deleted = true; return ok(null); }
      errors.push(`unexpected API:${method} ${url.pathname}`);
      return route.fulfill({ status: 404, json: { code: 404, message: 'Unexpected fixture request' } });
    });
    let dialogBox, screenshot, openScreenshot;
    try {
      await page.goto(`http://127.0.0.1:${server.address().port}/`);
      const target = mode === 'referenced' ? '201' : '202';
      await page.locator(`[data-document-category="${target}"]`).getByRole('button', { name: '删除分类', exact: true }).click();
      let dialog = page.getByRole('dialog');
      if (mode === 'referenced') {
        await dialog.getByText('暂不能删除', { exact: true }).waitFor();
        assert.equal(await dialog.getByRole('button', { name: '删除', exact: true }).count(), 0);
        assert.equal(deletes, 0);
      } else if (mode === 'slow-cancel') {
        await dialog.getByText('正在检查关联', { exact: true }).waitFor();
        assert.equal(await dialog.getByRole('button', { name: '删除', exact: true }).count(), 0);
        await dialog.getByRole('button', { name: '关闭', exact: true }).click();
        await dialog.waitFor({ state: 'hidden' });
        releaseCheck();
        await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
        assert.equal(await page.getByRole('dialog').count(), 0);
        assert.equal(deletes, 0);
      } else {
        if (mode === 'precheck-error') {
          await dialog.getByText('检查暂不可用', { exact: true }).waitFor();
          assert.equal(await dialog.getByRole('button', { name: '删除', exact: true }).count(), 0);
          assert.equal(deletes, 0);
          await dialog.getByRole('button', { name: '重新检查', exact: true }).click();
        }
        await dialog.getByText('删除文档分类', { exact: true }).waitFor();
        await finishFiniteAnimations(page);
        dialogBox = await dialog.boundingBox();
        assert(dialogBox && dialogBox.x >= 0 && dialogBox.x + dialogBox.width <= width + 1);
        assert(dialogBox.y >= 0 && dialogBox.y + dialogBox.height <= 901);
        if (artifacts) { openScreenshot = `${width}-${mode}-open.png`; await page.screenshot({ path: path.join(artifacts, openScreenshot), fullPage: true }); }
        if (mode === 'success-feedback') {
          await dialog.getByRole('button', { name: '删除', exact: true }).click();
          await page.getByRole('alert').filter({ hasText: '文档分类已删除' }).waitFor();
          assert.equal(deletes, 1);
          assert.equal(await page.getByRole('alert').filter({ hasText: '文档分类已删除' }).innerText(), '文档分类已删除');
        } else {
          if (mode === 'confirm-copy-cancel') assert.doesNotMatch(await dialog.innerText(), /转为未分类/);
          await dialog.getByRole('button', { name: '取消', exact: true }).focus();
          await page.keyboard.press('Enter');
          await dialog.waitFor({ state: 'hidden' });
          await page.waitForFunction(() => document.activeElement?.getAttribute('aria-label') === '删除分类');
          assert.equal(deletes, 0);
        }
      }
      assert.deepEqual(errors, []);
      await finishFiniteAnimations(page);
      if (artifacts) { screenshot = `${width}-${mode}.png`; await page.screenshot({ path: path.join(artifacts, screenshot), fullPage: true }); }
      results.push({ width, mode, passed: true, checks, deletes, dialogBox, screenshot, openScreenshot, requests, errors });
    } catch (error) {
      if (artifacts) { screenshot = `${width}-${mode}-failed.png`; await page.screenshot({ path: path.join(artifacts, screenshot), fullPage: true }); }
      results.push({ width, mode, passed: false, error: error.message, checks, deletes, dialogBox, screenshot, openScreenshot, requests, errors });
    } finally { releaseCheck(); await page.close(); }
  }
} finally {
  if (browser) await browser.close();
  if (server) await new Promise(resolve => server.close(resolve));
  await rm(temp, { recursive: true, force: true });
}
const output = { baselineSourceCommit: baseline ?? null, cases: results.length, passed: results.filter(item => item.passed).length,
  qualification: 'Real document page and shared confirmation/protection/snackbar components in Chromium with controlled API; two viewport variants. Native PostgreSQL guard/audit verification is separate, not browser-to-production E2E.', results };
if (artifacts) await writeFile(path.join(artifacts, 'result.json'), JSON.stringify(output, null, 2) + '\n');
console.log(JSON.stringify(output, null, 2));
if (output.passed !== output.cases) process.exitCode = 1;
