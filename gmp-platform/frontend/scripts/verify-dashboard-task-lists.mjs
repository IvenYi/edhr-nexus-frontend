import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

const require = createRequire(import.meta.url);
const root = fileURLToPath(new URL('..', import.meta.url));
let user = { id: '9007199254740993' };
globalThis.localStorage = { getItem: () => JSON.stringify(user) };
let options;
let queryState;
let request;
const client = { get: async (url, config) => {
  request = { url, ...config };
  return { data: { code: 200, data: queryState.data } };
} };
const bundle = await build({
  stdin: { contents: "export {default as TodoList} from './src/pages/dashboard/TodoList'; export {default as DoneList} from './src/pages/dashboard/DoneList'; export {default as DashboardPage} from './src/pages/dashboard/DashboardPage';", resolveDir: root, loader: 'tsx' },
  bundle: true, write: false, platform: 'node', format: 'cjs', packages: 'external', jsx: 'automatic',
  loader: { '.css': 'empty' },
  alias: { '@': `${root}/src` },
  plugins: [{ name: 'task-boundaries', setup(build) {
    build.onResolve({ filter: /^@\/(api\/client|stores\/authStore)$/ }, args => ({ path: args.path, external: true }));
  } }],
});
const compiled = { exports: {} };
new Function('require', 'module', 'exports', bundle.outputFiles[0].text)((id) => {
  if (id === '@/api/client') return client;
  if (id === '@/stores/authStore') return { useAuthStore: selector => selector({user}) };
  if (id === '@tanstack/react-query') return { useQuery: config => { options = config; return queryState; } };
  if (id === 'react-router-dom') return { Link: React.forwardRef(({ to, children, ...props }, ref) => React.createElement('a', { ...props, href: to, ref }, children)) };
  return require(id);
}, compiled, compiled.exports);

for (const [name, kind] of [['TodoList', 'todo'], ['DoneList', 'done']]) {
  const render = () => renderToStaticMarkup(React.createElement(compiled.exports[name]));
  queryState = { data: [{ id: 1, instanceId: '9007199254740993', taskType: '验收任务', status: 'PENDING', createdAt: '2026-09-14', action: 'APPROVE' }], isLoading: false, isError: false };
  user = { id: '9007199254740993' };
  const html = render();
  assert.match(html, /验收任务/, `${kind}: API array rows must render`);
  assert.match(html, /href="\/workflow\/instances\/9007199254740993"/, `${kind}: rows must link to their source instance without losing ID precision`);
  if (kind === 'todo') assert.match(html, /href="\/workflow\/tasks\/1"/, 'Pending tasks link to the processing page');
  else assert.doesNotMatch(html, /href="\/workflow\/tasks\/1"/, 'Completed tasks must not link back to the processing form');
  await options.queryFn();
  assert.equal(request.url, `/workflow/tasks/${kind}`);
  assert.deepEqual(request.params, { page: 1, size: 5 });
  const firstKey = [...options.queryKey];
  assert.equal(options.enabled, true);
  user = { id: '9007199254740994' };
  render();
  assert.notDeepEqual(options.queryKey, firstKey, 'Users must not share cached task lists');
  user = null;
  render();
  assert.equal(options.enabled, false, 'No request before identity is available');
  assert.doesNotMatch(render(), /验收任务/, 'Do not show cached task rows without identity');
  user = { id: '9007199254740993' };
  queryState = { data: undefined, isLoading: false, isError: true };
  assert.match(render(), /加载失败/, 'Errors must not be presented as empty lists');
  queryState = { data: [], isLoading: false, isError: false };
  assert.match(render(), kind === 'todo' ? /暂无待办任务/ : /暂无已办记录/);
}
console.log('PASS: real task lists render API arrays, scope requests/cache by user, wait for identity, and distinguish errors from empty results');

const homeHtml = renderToStaticMarkup(React.createElement(compiled.exports.DashboardPage));
assert.match(homeHtml, /初始化指南/);
assert.match(homeHtml, /跑通生产流程/);
assert.ok(homeHtml.indexOf('aria-label="日常工作"') < homeHtml.indexOf('aria-label="使用指南"'), 'Daily work precedes the detailed guide');
assert.doesNotMatch(homeHtml, /DHR-2026-001|BP-2026-042|实时数据/, 'Home must not present placeholder statistics or sample activity as real data');
assert.match(homeHtml, /不代表系统配置完成状态/, 'Reading the guide must not imply initialization is complete');
console.log('PASS: homepage prioritizes daily work, exposes both guides, and removes fabricated business activity');
