import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createNativeFormPlugin, operationId } from '../src/form-plugin.mjs';
import { createWorkerClient, WorkerRejection } from '../src/client.mjs';
import { Context } from '@deepseek-ai/cordis';
import Tools from '@deepseek-ai/dsh-tools';
import SystemPrompt from '@deepseek-ai/dsh-system-prompt';

const claim = { taskId: '11111111-1111-4111-8111-111111111111', runId: '22222222-2222-4222-8222-222222222222', state: 'RUNNING', leaseEpoch: 2 };
const design = { modelDesignJson: '{}', canvasDesignJson: '{}', workflowDesignJson: '{}' };
async function fixture(t, overrides = {}, directory) {
  directory ??= await mkdtemp(join(tmpdir(), 'edhr-worker-'));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const calls = [], registered = new Map(), cleanup = [];
  const client = {
    read: async lease => { calls.push(['read', lease]); return { version: { revision: 7 } }; },
    write: async (lease, id, action, form) => { calls.push(['write', lease, id, action, form]); return { receipt: { operationId: id, taskId: lease.taskId, revision: 8 } }; },
    ...overrides,
  };
  const adapter = await createNativeFormPlugin({ client, claim, sessionId: 'session', directory });
  adapter.plugin.apply({ effect: fn => cleanup.push(fn()), tools: { register: tool => registered.set(tool.name, tool) } });
  const execute = (name, args = {}, extra = {}) => registered.get(name).execute(args, { agent: { session: { id: 'session' } }, callId: 'call-1', signal: new AbortController().signal, ...extra });
  return { ...adapter, execute, calls, directory, dispose: () => cleanup.forEach(fn => fn()) };
}
test('server lease and read revision are bound outside model arguments', async t => {
  const f = await fixture(t);
  await assert.rejects(f.execute('save_form_design', design), /Read current/);
  await f.execute('read_current_form');
  await f.execute('save_form_design', design);
  assert.deepEqual(f.calls[1].slice(1, 4), [{ taskId: claim.taskId, runId: claim.runId, leaseEpoch: 2 }, operationId(claim.runId, 'call-1'), 'save-design']);
  assert.equal(f.calls[1][4].expectedRevision, 7);
  await assert.rejects(f.execute('save_form_design', design), /Read current/);
});
test('model cannot override target, identity, lease or revision', async t => {
  const f = await fixture(t);
  for (const key of ['taskId', 'runId', 'templateId', 'ownerId', 'leaseEpoch', 'expectedRevision']) {
    await assert.rejects(f.execute('create_form', { categoryName: '生产', [key]: 1 }), /Invalid/);
  }
  await assert.rejects(f.execute('read_current_form', {}, { agent: { session: { id: 'other' } } }), /scope/);
  assert.equal(f.calls.length, 0);
});
test('lost write response blocks further calls and restart until matching receipt', async t => {
  const id = operationId(claim.runId, 'call-1');
  const f = await fixture(t, { write: async () => { throw new Error('network lost'); } });
  await assert.rejects(f.execute('create_form', { categoryName: '生产' }), /network lost/);
  await assert.rejects(f.execute('read_current_form'), /unknown/);
  const restored = await fixture(t, { receipt: async () => ({ receipt: { operationId: id, taskId: claim.taskId } }) }, f.directory);
  await assert.rejects(restored.execute('create_form', { categoryName: '生产' }), /unknown/);
  await restored.reconcile();
  await restored.execute('read_current_form');
  assert.equal(restored.calls.length, 1);
});
test('receipt missing or mismatched never clears pending operation', async t => {
  const f = await fixture(t, { write: async () => { throw new Error('lost'); }, receipt: async () => ({ receipt: { operationId: 'wrong' } }) });
  await assert.rejects(f.execute('create_form', { categoryName: '生产' }));
  await assert.rejects(f.reconcile(), /mismatch/);
  await assert.rejects(f.execute('read_current_form'), /unknown/);
});
test('unload prevents dispatch and aborts an in-flight call', async t => {
  let entered;
  const ready = new Promise(resolve => { entered = resolve; });
  const f = await fixture(t, { read: async (_lease, signal) => { entered(); await new Promise((_resolve, reject) => signal.addEventListener('abort', () => reject(signal.reason), { once: true })); } });
  const running = f.execute('read_current_form');
  await ready;
  await assert.rejects(f.execute('read_current_form'), /Concurrent/);
  f.dispose();
  await assert.rejects(running);
  await assert.rejects(f.execute('read_current_form'), /scope/);
});
test('worker transport uses internal routes, no redirects and no server error leakage', async () => {
  const requests = [];
  const client = createWorkerClient({ origin: 'https://edhr.example', key: 'x'.repeat(32), fetchImpl: async (url, options) => { requests.push([url, options]); return { ok: true, json: async () => ({ code: 200, data: { idle: true } }) }; } });
  await client.claim();
  assert.equal(requests[0][0].pathname, '/api/v1/ai/internal/claim');
  assert.equal(requests[0][1].redirect, 'error');
  assert.equal(requests[0][1].headers['X-EDHR-AI-Worker-Key'], 'x'.repeat(32));
  assert.throws(() => createWorkerClient({ origin: 'http://external.example', key: 'x'.repeat(32) }), /HTTPS/);
  const denied = createWorkerClient({ origin: 'http://127.0.0.1:1', key: 'x'.repeat(32), fetchImpl: async () => ({ ok: false, status: 403, json: async () => ({ code: 403, message: 'denied' }) }) });
  await assert.rejects(denied.claim(), { message: 'Worker request rejected: HTTP 403' });
});
test('confirmed rejection allows correction, but identity conflict and malformed errors remain unknown', async t => {
  let attempts = 0;
  const f = await fixture(t, { write: async () => { attempts++; throw new WorkerRejection(400); } });
  await assert.rejects(f.execute('create_form', { categoryName: 'invalid' }), WorkerRejection);
  await assert.rejects(f.execute('create_form', { categoryName: 'corrected' }, { callId: 'call-2' }), WorkerRejection);
  assert.equal(attempts, 2);
  for (const body of [{ code: 409, message: 'IDEMPOTENCY_CONFLICT' }, null]) {
    const client = createWorkerClient({ origin: 'https://example.com', key: 'x'.repeat(32), fetchImpl: async () => ({ ok: false, status: 409, json: async () => body }) });
    await assert.rejects(client.claim(), error => !(error instanceof WorkerRejection));
  }
});
test('real Cordis and DSH registry mount and unload only the three native tools', async t => {
  const directory = await mkdtemp(join(tmpdir(), 'edhr-dsh-'));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const ctx = new Context();
  t.after(() => ctx.fiber.dispose());
  await ctx.plugin(SystemPrompt, { includeHarnessIdentity: false, includeRuntimeContext: false });
  await ctx.plugin(Tools);
  const adapter = await createNativeFormPlugin({ client: {}, claim, sessionId: 's', directory });
  const fork = await ctx.plugin(adapter.plugin);
  assert.deepEqual(ctx.tools.definitions().map(t => t.name).sort(), ['create_form', 'read_current_form', 'save_form_design']);
  await fork.dispose();
  assert.equal(ctx.tools.definitions().length, 0);
});
