import { createRequire } from 'node:module';
import { readFile, writeFile } from 'node:fs/promises';
import http from 'node:http';
import path from 'node:path';
const root = '/Users/ivenwang/Documents/edhr-nexus/gmp-platform/frontend';
const artifacts = import.meta.dirname;
const require = createRequire(path.join(root, 'package.json'));
const { build } = require('esbuild');
const { chromium } = require('playwright');
await build({ absWorkingDir: root, stdin: { resolveDir: root, loader: 'tsx', contents: `
import React from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material';
import { SnackbarProvider } from './src/components/SnackbarProvider';
import Icons from './src/pages/system/IconManagementPage';
const client = new QueryClient({defaultOptions:{queries:{retry:false}}});
createRoot(document.getElementById('root')).render(<ThemeProvider theme={createTheme()}><MemoryRouter><QueryClientProvider client={client}><SnackbarProvider><Icons /></SnackbarProvider></QueryClientProvider></MemoryRouter></ThemeProvider>);`
}, bundle: true, platform: 'browser', format: 'esm', outfile: path.join(artifacts, 'icon-context.bundle.js'), alias: { '@': path.join(root, 'src') }, define: {'process.env.NODE_ENV': '"production"'} });
const server = http.createServer(async (req, res) => {
  if (req.url === '/bundle.js') { res.setHeader('Content-Type', 'text/javascript'); res.end(await readFile(path.join(artifacts, 'icon-context.bundle.js'))); }
  else res.end('<html><meta charset="utf-8"><div id="root"></div><script type="module" src="/bundle.js"></script></html>');
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const browser = await chromium.launch({headless:true, executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
const page = await browser.newPage({viewport:{width:1440,height:1000}});
const writes = [], requests = [], errors = [];
page.on('pageerror', error => errors.push(error.message));
await page.route('**/api/v1/**', async route => {
  const url = new URL(route.request().url());
  requests.push({path:url.pathname,group:url.searchParams.get('groupId'),method:route.request().method()});
  if (route.request().method() !== 'GET') { writes.push({path:url.pathname,body:route.request().postDataJSON()}); await route.fulfill({json:{code:200,data:[]}}); return; }
  if (url.pathname.endsWith('/icon-groups')) { await route.fulfill({json:{code:200,data:[{id:'101',name:'组A',sortOrder:1,iconCount:2},{id:'102',name:'组B',sortOrder:2,iconCount:0}]}}); return; }
  if (url.pathname.endsWith('/icons')) {
    const group = url.searchParams.get('groupId');
    if (group === '102') await new Promise(resolve => setTimeout(resolve, 2500));
    const rows = group === '102' ? [] : ['201','202'].map((id,index)=>({id,name:'A图标'+(index+1),groupId:'101',format:'SVG',svgContent:'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10"><path d="M1 1h8v8H1z"/></svg>'}));
    await route.fulfill({json:{code:200,data:{content:rows,totalPages:1,totalElements:rows.length}}}); return;
  }
  await route.abort();
});
let evidence;
try {
  await page.goto(`http://127.0.0.1:${server.address().port}/`);
  await page.getByRole('button',{name:'组A',exact:true}).click();
  await page.waitForTimeout(200);
  await page.getByText('A图标1',{exact:true}).waitFor();
  await page.getByRole('button',{name:'组B',exact:true}).click();
  await page.waitForTimeout(200);
  const staleVisible = await page.getByText('A图标1',{exact:true}).isVisible();
  if (staleVisible) {
    const drag = page.locator('[draggable="true"]').filter({has:page.getByText('A图标1',{exact:true})});
    const drop = page.locator('[draggable="true"]').filter({has:page.getByText('A图标2',{exact:true})});
    const transfer = await page.evaluateHandle(() => new DataTransfer());
    await drag.dispatchEvent('dragstart',{dataTransfer:transfer});
    await drop.dispatchEvent('drop',{dataTransfer:transfer});
    await page.waitForTimeout(200);
  }
  await page.screenshot({path:path.join(artifacts,'icon-context-repro.png'),fullPage:true});
  evidence={result:writes.some(w=>w.path.endsWith('/icons/order')&&w.body.groupId==='102')?'reproduced':'not-reproduced',staleVisible,writes,requests,errors,boundary:'All HTTP intercepted. No backend or database write.'};
} finally {
  await writeFile(path.join(artifacts,'icon-context-repro.json'),JSON.stringify(evidence,null,2));
  await browser.close();
  await new Promise(resolve=>server.close(resolve));
}
console.log(JSON.stringify(evidence,null,2));
