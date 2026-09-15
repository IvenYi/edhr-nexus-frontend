import assert from 'node:assert/strict';
import { test } from 'node:test';
import vm from 'node:vm';
import { build } from 'esbuild';
const compiled = await build({ entryPoints: ['src/pages/production/useExecutionPresence.ts'], bundle: true, write: false, platform: 'node', format: 'cjs',
  plugins: [{ name: 'boundaries', setup(plugin) {
    plugin.onResolve({ filter: /^(react|@\/api\/production-execution)$/ }, ({ path }) => ({ path, namespace: 'stub' }));
    plugin.onLoad({ filter: /.*/, namespace: 'stub' }, ({ path }) => ({ contents: path === 'react' ?
      'export const useEffect=f=>effects.push(f); export const useRef=v=>({current:v}); export const useState=v=>[v,()=>{}];' :
      'export const getExecutionEditors=()=>Promise.resolve({}); export const updateExecutionEditor=(id,op,command)=>send(id,op,command);' }));
  } }] });
const flush = async () => { for (let i = 0; i < 12; i++) await Promise.resolve(); };
function fixture(editable = true) {
  const calls = [], effects = [], timers = new Map(), listeners = new Map(); let now = 1000, timerId = 0;
  const sandbox = { module: { exports: {} }, effects, Date: { now: () => now }, crypto: { randomUUID: () => 'session-1' },
    send: async (id, operationId, command) => { calls.push({ id, operationId, ...command }); return {}; },
    document: { visibilityState: 'visible', hasFocus: () => true, addEventListener: (n, f) => listeners.set(n, f), removeEventListener: n => listeners.delete(n) },
    window: { setInterval: f => { timers.set(++timerId, f); return timerId; }, clearInterval: id => timers.delete(id), addEventListener: (n, f) => listeners.set(n, f), removeEventListener: n => listeners.delete(n) } };
  sandbox.exports = sandbox.module.exports; vm.runInNewContext(compiled.outputFiles[0].text, sandbox);
  const hook = sandbox.module.exports.default('object', 'op', 'form', 'copy1', editable, false);
  const cleanup = effects.map(f => f());
  return { calls, mark: hook.markEditing, blur: () => listeners.get('blur')(), advance: async ms => { now += ms; timers.forEach(f => f()); await flush(); }, unmount: () => cleanup.forEach(f => f?.()) };
}
test('merely opening an editable or read-only form never registers an editor', async () => {
  const f = fixture(); await f.advance(30_000); assert.equal(f.calls.length, 0); f.unmount();
  const readonly = fixture(false); readonly.mark(); await readonly.advance(30_000); assert.equal(readonly.calls.length, 0); readonly.unmount();
});
test('editing registers once, renews, and blur immediately releases the session', async () => {
  const f = fixture(); f.mark(); f.mark(); await flush(); assert.equal(f.calls.length, 1); assert.equal(f.calls[0].editing, true);
  await f.advance(15_000); assert.equal(f.calls.length, 2);
  f.blur(); await flush(); assert.equal(f.calls[2].editing, false); f.unmount();
});
test('idle timeout and unmount release only the original session after outstanding heartbeats', async () => {
  const f = fixture(); f.mark(); f.unmount(); await flush();
  assert.deepEqual(f.calls.map(c => c.editing), [true, false]);
  assert.equal(f.calls[0].sessionId, f.calls[1].sessionId);
  const idle = fixture(); idle.mark(); await flush(); await idle.advance(60_000);
  assert.deepEqual(idle.calls.map(c => c.editing), [true, false]); idle.unmount();
});
