import assert from 'node:assert/strict';
import { test } from 'node:test';
import { build } from 'esbuild';
import vm from 'node:vm';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const result = await build({ entryPoints: ['src/pages/production/ExecutionFormSelector.tsx'], bundle: true, write: false, format: 'cjs', platform: 'node', packages: 'external',
  plugins: [{ name: 'api-boundary', setup(plugin) { plugin.onResolve({ filter: /^@\/api/ }, () => ({ path: 'api', namespace: 'stub' })); plugin.onLoad({ filter: /.*/, namespace: 'stub' }, () => ({ contents: 'export const getExecutionTemplates=()=>Promise.resolve([])' })); } }] });
const context = { module: { exports: {} }, require }; context.exports = context.module.exports;
vm.runInNewContext(result.outputFiles[0].text, context);
const { formSource, selectableForms } = context.module.exports;
const { EditorAvatars } = context.module.exports;
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const renderEditors = users => renderToStaticMarkup(React.createElement(EditorAvatars, { users, onClick() {} }));
test('no editor indicator is rendered for zero or unknown active editors', () => {
  assert.equal(renderEditors([]), '');
  assert.equal(renderEditors(null), '');
});
test('editor avatars show photos, fall back to names and keep the full count when capped', () => {
  const users = Array.from({ length: 6 }, (_, index) => ({ userId: String(index), name: `王${index}`, sequences: [1], avatarUrl: index === 0 ? '/api/v1/files/123/public-preview' : undefined }));
  const markup = renderEditors(users);
  assert.match(markup, /当前 6 人填写中/);
  assert.match(markup, /src="\/api\/v1\/files\/123\/public-preview"/);
  assert.equal((markup.match(/>王<\/div>/g) ?? []).length, 3);
  assert.match(markup, /execution-form-editor-more/);
  assert.doesNotMatch(renderEditors(users.slice(0, 4)), /execution-form-editor-more/);
});
test('sources distinguish runtime attachment even when template version matches a configured form', () => {
  assert.equal(formSource({ id: 'f1', versionId: 'v' }), 'configured');
  assert.equal(formSource({ id: 'c1', versionId: 'v', sourceType: 'CUSTOM' }), 'custom');
  assert.equal(formSource({ id: 'w1', versionId: 'v', workId: 'w' }), 'work');
});
test('future work nodes and fulfilled aliases are excluded while mounted work forms persist', () => {
  const direct = { id: 'f1' }, custom = { id: 'c1', sourceType: 'CUSTOM' }, work = { id: 'w1', workId: 'w' };
  const forms = [direct, custom, work, { id: 'future', workId: 'w' }, { id: 'alias', fulfilledBy: 'w1' }];
  const actual = selectableForms(forms, { w1: { instanceIds: ['w1'], status: 'COMPLETED' }, future: { instanceIds: [] } });
  assert.deepEqual(Array.from(actual, f => f.id), ['f1', 'c1', 'w1']);
});
