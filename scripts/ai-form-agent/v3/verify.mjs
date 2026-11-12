// Live persistence/boundary tests. Preview is deliberately stubbed; model runs test the native browser separately.
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { root, save, login, loadDesigner, api, templates } from '../common.mjs';
import { loadKnowledge } from '../knowledge.mjs';
import { createControlledSession } from './tools.mjs';

if (process.env.AI_FORM_AGENT_PORT !== '18093') throw new Error('Use the isolated v3 server');
const runId = 'boundary-' + Date.now(), token = await login();
const sample = JSON.parse(await readFile(root + '/output/ai-form-builder-v1-20261112/experiments/samples/clean.json'));
const draft = JSON.parse(await readFile(root + '/output/ai-form-agent-v2-20261112/runs/clean-openai-1/draft.json'));
draft.bindings = []; draft.questions = [];
for (const f of draft.fields) if (f.config.sourceType === 'product') f.config = { sourceType: 'material', referenceMaterialScope: 'product', referenceField: 'code' };
let issues = [{ text: 'controlled clipping fixture' }];
const session = createControlledSession({ runId, token, sample, knowledge: await loadKnowledge(), designer: await loadDesigner(),
  preview: async ({ revision }) => ({ revision, issues, images: [], scope: 'stub for completion-gate integration only' }) });
const call = (name, args = {}) => session.execute(name, args);
await call('get_applicable_knowledge', { query: '表单 引用 追溯' });
await call('query_business', { kind: 'catalog' });
const invalidReference = structuredClone(draft);
invalidReference.fields[0].config = { sourceType: 'user', referenceField: 'name' };
assert.ok((await call('save_template', invalidReference)).semanticErrors.some(e => e.code === 'reference-query-rejected'));
assert.equal(session.state.template, null, 'invalid runtime references must be rejected before creating a template');
assert.equal((await call('save_template', draft)).saved, true);
const before = structuredClone(session.state.draft), read = await call('read_template');
assert.match((await call('patch_template', { expectedRevision: 'stale', fields: [{ key: draft.fields[0].key, label: '不应保存' }] })).error, /过期/);
assert.equal((await call('patch_template', { expectedRevision: read.revision, fields: [{ key: draft.fields[0].key, label: '边界验证名称' }] })).saved, true);
const after = structuredClone(session.state.draft); after.fields[0].label = before.fields[0].label; assert.deepEqual(after, before);
await call('check_template'); const preview = await call('preview_template');
const finish = { status: 'complete', summary: 'boundary test', questions: [], incomplete: [], visualIssues: [] };
assert.match((await call('finish_task', finish)).error, /尚未传回模型/);
session.observePreview(preview.revision);
assert.equal((await call('finish_task', finish)).finished, false);
const savedPayload = structuredClone(session.state.payload), external = structuredClone(savedPayload);
const model = JSON.parse(external.modelDesignJson); model.payload.fields[0].name = 'External edit'; external.modelDesignJson = JSON.stringify(model);
const route = `${templates}/${session.state.template.id}/versions/${session.state.template.versions[0].id}/design`;
await api(route, token, 'PUT', external);
assert.match((await call('patch_template', { expectedRevision: preview.revision, fields: [{ key: draft.fields[0].key, label: '不得覆盖' }] })).error, /外部修改/);
await api(route, token, 'PUT', savedPayload);
assert.equal((await call('patch_template', { expectedRevision: preview.revision, fields: [{ key: draft.fields[0].key, label: '最终名称' }] })).saved, true);
assert.match((await call('finish_task', finish)).error, /当前版本/);
await call('check_template'); issues = []; const latest = await call('preview_template'); session.observePreview(latest.revision);
assert.equal((await call('finish_task', finish)).finished, true);
assert.match((await call('read_template')).error, /已结束/);

const pendingDraft = structuredClone(draft);
pendingDraft.questions = [0, 1, 2].map(i => ({ question: '未决业务问题' + i, affectedFields: [draft.fields[i].key], reason: '尚无客户依据', blockedUses: [{ modelId: 'production' }] }));
const pending = createControlledSession({ runId: runId + '-questions', token, sample, knowledge: await loadKnowledge(), designer: await loadDesigner(),
  preview: async ({ revision }) => ({ revision, issues: [], images: [], scope: 'stub for known-question completion tests' }) });
await pending.execute('get_applicable_knowledge', { query: '表单 追溯' });
await pending.execute('query_business', { kind: 'catalog' });
assert.equal((await pending.execute('save_template', pendingDraft)).saved, true);
await pending.execute('check_template', {}); const pendingPreview = await pending.execute('preview_template', {}); pending.observePreview(pendingPreview.revision);
assert.match((await pending.execute('finish_task', finish)).error, /不能覆盖已保存未决问题/);
assert.match((await pending.execute('finish_task', { ...finish, status: 'partial' })).error, /不能覆盖已保存未决问题/);
const { questions: _legacy, ...canonicalFinish } = finish;
assert.match((await pending.execute('finish_task', canonicalFinish)).error, /不能声明complete/);
assert.equal((await pending.execute('finish_task', { ...canonicalFinish, status: 'needs-input', incomplete: ['尚有业务问题'] })).finished, true);
assert.deepEqual(pending.extra.finished.questions, pendingDraft.questions);
const result = { runId, passed: true, assertions: ['invalid live reference blocked before creation', 'stale revision', 'local patch preservation', 'image delivery before finish', 'known clipping blocks completion', 'external edit detection', 'old preview invalidation', 'honest finish', 'closed session', 'finish cannot replace saved questions even for partial', 'complete rejects persisted pending questions', 'needs-input retains canonical questions'],
  templateId: session.state.template.id, scope: 'real isolated API; controlled preview fixture; no atomic concurrency or native visual claim' };
await save(runId + '.json', result, true); console.log(JSON.stringify(result));
