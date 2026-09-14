import http from 'node:http';
import fs from 'node:fs';

// This gateway only targets the disposable integration-test service, never the development database.
const fixture = JSON.parse(fs.readFileSync('/tmp/production-execution-browser.json', 'utf8'));
const html = `<!doctype html><html lang="zh-CN"><head><meta charset="UTF-8"><title>生产执行 · 隔离验收</title></head><body style="margin:0"><div id="root" style="height:100vh"></div>
<script type="module">
import RefreshRuntime from '/@react-refresh'; RefreshRuntime.injectIntoGlobalHook(window); window.$RefreshReg$ = () => {}; window.$RefreshSig$ = () => (type) => type; window.__vite_plugin_react_preamble_installed__ = true;
</script><script type="module" src="/scripts/production-execution-qa.tsx"></script></body></html>`;
const server = http.createServer((request, response) => {
  if (['/', '/execution-qa', '/execution-away'].includes(new URL(request.url, 'http://localhost').pathname)) { response.setHeader('Content-Type', 'text/html; charset=utf-8'); response.end(html); return; }
  const api = request.url.startsWith('/api/');
  const headers = { ...request.headers, host: api ? `localhost:${fixture.port}` : 'localhost:3000' };
  if (api) headers.authorization = `Bearer ${fixture.token}`;
  const proxy = http.request({ hostname: 'localhost', port: api ? fixture.port : 3000, path: request.url, method: request.method, headers }, (upstream) => {
    response.writeHead(upstream.statusCode, upstream.headers); upstream.pipe(response);
  });
  proxy.on('error', () => { response.writeHead(502); response.end('Isolated test service unavailable'); });
  request.pipe(proxy);
});
server.listen(13000, '127.0.0.1', () => console.log('Isolated execution QA: http://127.0.0.1:13000/execution-qa'));
