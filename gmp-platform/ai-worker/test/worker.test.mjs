import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { runClaimedWorker, workerBaseline } from '../src/worker.mjs';

const claim = { taskId: '11111111-1111-4111-8111-111111111111', runId: '22222222-2222-4222-8222-222222222222', leaseEpoch: 1, state: 'RUNNING', config: workerBaseline };
test('renewal failure aborts drive and never yields a successful result', async t => {
  const directory = await mkdtemp(join(tmpdir(), 'edhr-renew-'));
  t.after(() => rm(directory, { recursive: true, force: true }));
  let renewals = 0, disposed = false, yielded = false;
  const client = { claim: async () => claim, renew: async () => { if (++renewals > 1) throw new Error('revoked'); }, yieldRun: async () => { yielded = true; } };
  const ctx = { plugin: async () => ({ dispose: async () => { disposed = true; } }) };
  await assert.rejects(runClaimedWorker({ ctx, client, directory, heartbeatMs: 5, drive: async ({ signal }) => {
    await new Promise((_resolve, reject) => signal.addEventListener('abort', () => reject(signal.reason), { once: true }));
  } }), /revoked/);
  assert.equal(disposed, true);assert.equal(yielded, false);assert.equal(renewals, 2);
});
test('incompatible baseline is rejected before tools are mounted', async () => {
  await assert.rejects(runClaimedWorker({ client: { claim: async () => ({ ...claim, config: { ...workerBaseline, toolProtocol: 'old' } }) } }), /configuration/);
});
