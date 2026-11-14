export class WorkerRejection extends Error {
  constructor(status) { super('Worker request rejected: HTTP ' + status); }
}

// The endpoint and credential belong to deployment, never to model arguments.
export function createWorkerClient({ origin, key, fetchImpl = fetch }) {
  const base = new URL(origin);
  if (base.username || base.password || base.pathname !== '/' || base.search || base.hash ||
      !(base.protocol === 'https:' || (base.protocol === 'http:' && ['localhost', '127.0.0.1', '[::1]'].includes(base.hostname)))) {
    throw new Error('Worker origin requires HTTPS (loopback HTTP is allowed)');
  }
  if (typeof key !== 'string' || key.length < 32) throw new Error('Worker key requires 32 characters');
  async function request(path, body, signal) {
    const response = await fetchImpl(new URL('/api/v1/ai/internal/' + path, base), {
      method: body === undefined ? 'GET' : 'POST', redirect: 'error',
      headers: { 'Content-Type': 'application/json', 'X-EDHR-AI-Worker-Key': key },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: signal ? AbortSignal.any([signal, AbortSignal.timeout(30_000)]) : AbortSignal.timeout(30_000),
    });
    // Do not echo server bodies, credentials or native design into exception logs.
    if (!response.ok) {
      const error = await response.json().catch(() => null);
      // Only a recognized application envelope can prove rejection. Conflict with
      // an earlier operation identity still requires receipt reconciliation.
      if ([400, 401, 403, 404, 409, 422].includes(response.status) && error?.code === response.status &&
          typeof error.message === 'string' && error.message !== 'IDEMPOTENCY_CONFLICT') {
        throw new WorkerRejection(response.status);
      }
      throw new Error('Worker request rejected: HTTP ' + response.status);
    }
    const result = await response.json();
    if (result.code !== 200) throw new Error('Worker response rejected');
    return result.data;
  }
  return Object.freeze({
    claim: signal => request('claim', {}, signal),
    renew: (lease, signal) => request('renew', lease, signal),
    reserve: (lease, requestId, signal) => request('reserve', { ...lease, requestId }, signal),
    settle: (lease, requestId, actualMicros, signal) => request('settle', { ...lease, requestId, actualMicros }, signal),
    fail: (lease, signal) => request('fail', lease, signal),
    yieldRun: (lease, signal) => request('yield', lease, signal),
    reconcile: (lease, operationId, signal) => request('forms/reconcile', { ...lease, operationId }, signal),
    toolEvent: (lease, callId, tool, phase, signal) => request('tool-events', { ...lease, callId, tool, phase }, signal),
    read: (lease, signal) => request('forms/read', lease, signal),
    patch: (lease, operationId, expectedRevision, patches, signal) => request('forms/patch', { ...lease, operationId, expectedRevision, patches }, signal),
    query: (lease, callId, tool, args, signal) => request('workbench/query', { ...lease, callId, tool, query: '', id: '', offset: 0, ...args }, signal),
    inspect: (lease, callId, tool, expectedRevision, signal) => request('workbench/inspect', { ...lease, callId, tool, expectedRevision }, signal),
    previewFeedback: (lease, callId, evidence, signal) => request('workbench/preview-feedback', { ...lease, callId, ...evidence }, signal),
    write: (lease, operationId, action, form, signal) => request('forms/write', { ...lease, operationId, action, form }, signal),
    receipt: (taskId, operationId, signal) => request('forms/receipt?' + new URLSearchParams({ taskId, operationId }), undefined, signal),
  });
}
