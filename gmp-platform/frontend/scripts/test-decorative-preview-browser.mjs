import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { build } from 'esbuild';
const { chromium } = createRequire(import.meta.url)('playwright');
const root = path.resolve(import.meta.dirname, '..');
const temporary = await mkdtemp(path.join(os.tmpdir(), 'edhr-preview-semantics-'));
const baseline = process.env.PREVIEW_BASELINE_COMMIT;
if (baseline && !/^[a-f0-9]{40}$/.test(baseline)) throw new Error('Expected full baseline SHA');
const artifacts = process.env.PREVIEW_ARTIFACTS;
const results = [];
let server, browser;
try {
  if (artifacts) await mkdir(artifacts, { recursive: true });
  await writeFile(path.join(temporary, 'bundle.css'), '');
  await build({ absWorkingDir: root, stdin: { resolveDir: root, loader: 'tsx', contents: `
    import React, { useState } from 'react';
    import { createRoot } from 'react-dom/client';
    import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
    import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
    import { SnackbarProvider } from './src/components/SnackbarProvider';
    import { WorkflowActionConfig, defaultWorkflowButtons } from './src/components/flow-designer/WorkflowActionConfig';
    import CanvasTab from './src/pages/master-data/template-designer-react/tabs/canvas/CanvasTab';
    import { useTemplateDesignerStore as store } from './src/pages/master-data/template-designer-react/store/useTemplateDesignerStore';
    import { createEmptyTemplateDesignerDocument } from './src/pages/master-data/template-designer-react/utils/document';
    store.getState().setDocument(createEmptyTemplateDesignerDocument({schema:'edhr-template-designer-react',version:1,
      templateId:'preview-test',versionId:'version-test',templateName:'预览语义验收',versionLabel:'V1'}));
    const field = store.getState().addField('text','温度验收');
    store.getState().setActiveCanvasRail('fields');
    window.__store = store; window.__fieldId = field.id; window.__changes = [];
    function App() {
      const [config, setConfig] = useState({buttons:defaultWorkflowButtons('START'),buttonEvents:[]});
      return new URLSearchParams(location.search).get('case') === 'designer'
        ? <div style={{height:850}}><CanvasTab /></div>
        : <WorkflowActionConfig kind="START" editable buttons={config.buttons} events={config.buttonEvents}
            onChange={patch => { window.__changes.push(patch); setConfig(patch); }} />;
    }
    createRoot(document.getElementById('root')).render(<ThemeProvider theme={createTheme()}><CssBaseline />
      <QueryClientProvider client={new QueryClient({defaultOptions:{queries:{retry:false}}})}>
        <SnackbarProvider><App /></SnackbarProvider>
      </QueryClientProvider></ThemeProvider>);
  ` }, bundle: true, platform: 'browser', format: 'esm', outfile: path.join(temporary, 'bundle.js'),
    alias: { '@': path.join(root, 'src'), '@mui/icons-material': path.join(root, 'node_modules/@mui/icons-material/esm') },
    loader: { '.css': 'css', '.svg': 'dataurl', '.png': 'dataurl', '.woff2': 'file', '.ttf': 'file' },
    define: { 'process.env.NODE_ENV': '"production"' }, logLevel: 'silent',
    plugins: baseline ? [{ name: 'baseline-previews', setup(plugin) {
      plugin.onLoad({ filter: /(?:WorkflowActionConfig|DesignerSidebar)\.tsx$/ }, ({ path: filename }) => ({
        contents: execFileSync('git', ['show', baseline + ':gmp-platform/frontend/' + path.relative(root, filename)], {cwd:root,encoding:'utf8'}),
        loader: 'tsx', resolveDir: path.dirname(filename),
      }));
    } }] : [],
  });
  await writeFile(path.join(temporary, 'index.html'), '<!doctype html><html lang="zh-CN"><meta charset="utf-8"><title>装饰预览隔离验收</title><link rel="stylesheet" href="/bundle.css"><div id="root"></div><script type="module" src="/bundle.js"></script></html>');
  server = http.createServer(async (request,response) => {
    const pathname = new URL(request.url,'http://localhost').pathname;
    const file = pathname === '/' ? 'index.html' : pathname.slice(1);
    if (!['index.html','bundle.js','bundle.css'].includes(file)) { response.writeHead(404).end(); return; }
    response.setHeader('Content-Type',file.endsWith('.js')?'text/javascript':file.endsWith('.css')?'text/css':'text/html; charset=utf-8');
    response.end(await readFile(path.join(temporary,file)));
  });
  await new Promise(resolve => server.listen(0,'127.0.0.1',resolve));
  browser = await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH});
  for (const name of ['workflow','designer']) {
    const page = await browser.newPage({viewport:{width:1440,height:1000}});
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    try {
      await page.goto('http://127.0.0.1:'+server.address().port+'/?case='+name);
      if (name === 'workflow') {
        const preview = page.getByText('用户操作预览',{exact:true}).locator('../..');
        await preview.waitFor();
        assert.equal(await preview.locator('button,[role="button"]').count(),0,'decorative workflow previews must not advertise a button action');
        await page.getByRole('textbox',{name:'显示名称'}).nth(1).fill('自定义提交');
        await preview.getByText('自定义提交',{exact:true}).waitFor();
        assert.equal(await page.evaluate(() => window.__changes.at(-1).buttons[1].label),'自定义提交');
        for (let i=0;i<16;i++) {
          await page.keyboard.press('Tab');
          assert.equal(await preview.evaluate(element => element.contains(document.activeElement)),false,'Tab skips decorative preview');
        }
      } else {
        const source = page.locator('[data-canvas-field-card="true"]').first();
        await source.waitFor();
        const from = await source.boundingBox();
        const cell = page.locator('[data-canvas-field-drop-cell="true"][data-sheet-cell-row="2"][data-sheet-cell-col="2"]').first();
        await cell.waitFor();
        const to = await cell.boundingBox();
        await page.mouse.move(from.x+from.width/2,from.y+from.height/2);
        await page.mouse.down();
        await page.mouse.move(from.x+from.width/2+15,from.y+from.height/2+10,{steps:3});
        const ghost = page.locator('[data-canvas-field-drag-preview="true"]');
        await ghost.waitFor();
        assert.equal(await ghost.evaluate(element => element.tagName),'SPAN');
        assert.equal(await ghost.getAttribute('role'),'presentation');
        assert.equal(await ghost.evaluate(element => element.tabIndex),-1);
        await page.mouse.move(to.x+to.width/2,to.y+to.height/2,{steps:8});
        await page.mouse.up();
        await page.waitForFunction(() => window.__store.getState().document.canvas.pages[0].nodes.some(node=>node.bindings?.fieldId===window.__fieldId));
        assert.equal(await ghost.count(),0,'drag preview cleans up after actual placement');
        assert.ok(await page.evaluate(() => window.__store.getState().undoStack.length)>0,'actual placement retains undo history');
      }
      assert.deepEqual(errors,[]);
      if (artifacts) await page.screenshot({path:path.join(artifacts,name+'.png'),fullPage:true});
      results.push({name,result:'passed'});
    } catch (error) {
      results.push({name,result:'failed',message:error.message,pageErrors:errors});
      if (artifacts) await page.screenshot({path:path.join(artifacts,name+'-failed.png'),fullPage:true});
    } finally { await page.close(); }
  }
} finally {
  if (browser) await browser.close();
  if (server) await new Promise(resolve=>server.close(resolve));
  await rm(temporary,{recursive:true,force:true});
}
console.log(JSON.stringify({baseline:baseline||null,boundary:'real components, CanvasTab and Zustand in Chromium; fixture document, no backend writes',results},null,2));
if (results.some(result=>result.result!=='passed')) process.exitCode=1;
