import { createNativeFormPlugin } from './form-plugin.mjs';

export const workerBaseline = Object.freeze({ pluginVersion: 'form-worker-2b', toolProtocol: 'ai-task-v2', knowledgePackage: 'unpublished', modelConfig: 'fixture-no-model' });

// A single claimed run. DSH owns the agent loop; Java owns execution eligibility.
export async function runClaimedWorker({ ctx, client, directory, drive, signal, heartbeatMs = 5000 }) {
  const claim = await client.claim(signal);
  if (claim.idle) return claim;
  if (Object.entries(workerBaseline).some(([key, value]) => claim.config?.[key] !== value)) throw new Error('Worker configuration unavailable');
  const lease = { taskId: claim.taskId, runId: claim.runId, leaseEpoch: claim.leaseEpoch };
  const controller = new AbortController();
  const running = signal ? AbortSignal.any([signal, controller.signal]) : controller.signal;
  let timer, renewal, fork;
  const renew = () => {
    renewal = client.renew(lease, running).catch(error => controller.abort(error)).finally(() => {
      if (!running.aborted) timer = setTimeout(renew, heartbeatMs);
    });
  };
  try {
    await client.renew(lease, running);
    timer = setTimeout(renew, heartbeatMs);
    const adapter = await createNativeFormPlugin({ client, claim, directory, sessionId: claim.runId, signal: running });
    // A pending write is never replayed before checking the persisted Java receipt.
    await adapter.reconcile(running);
    fork = await ctx.plugin(adapter.plugin);
    await drive({ ctx, claim, signal: running });
    running.throwIfAborted();
    await client.yieldRun(lease, running);
    return { taskId: claim.taskId, runId: claim.runId, yielded: true };
  } finally {
    controller.abort();
    clearTimeout(timer);
    await renewal;
    await fork?.dispose();
  }
}
