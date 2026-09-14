import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';
import vm from 'node:vm';
import { build } from 'esbuild';

const require = createRequire(import.meta.url);
const compiled = await build({
  entryPoints: [fileURLToPath(new URL('../src/pages/production/ExecutionOperationDrawer.tsx', import.meta.url))],
  bundle: true, write: false, platform: 'node', format: 'cjs', packages: 'external',
  plugins: [{ name: 'drawer-boundaries', setup(plugin) {
    const stubs = {
      react: 'export const useRef = v => hooks.ref(v); export const useEffect = (f,d) => hooks.effect(f,d); export const useId = () => "operations";',
      '@mui/material': 'export const Box="Box", Button="Button", Drawer="Drawer", IconButton="IconButton", Typography="Typography";',
      '@mui/icons-material': 'export const CloseRounded="Close", SwapHorizRounded="Swap";',
    };
    plugin.onResolve({ filter: /.*/ }, ({ path }) => path in stubs ? { path, namespace: 'stub' } : undefined);
    plugin.onLoad({ filter: /.*/, namespace: 'stub' }, ({ path }) => ({ contents: stubs[path], loader: 'js' }));
  } }],
});

function fixture() {
  let refIndex = 0, effectIndex = 0, open = false, tree, now = 1000, timerId = 0;
  const refs = [], effects = [], pending = [], timers = new Map();
  const hooks = {
    ref(value) { return refs[refIndex++] ??= { current: value }; },
    effect(callback, deps) {
      const index = effectIndex++, previous = effects[index];
      if (!previous || deps.some((v, i) => v !== previous.deps[i])) pending.push(() => { previous?.cleanup?.(); effects[index] = { deps, cleanup: callback() }; });
    },
  };
  const sandbox = { module: { exports: {} }, require, hooks, Date: { now: () => now },
    requestAnimationFrame: callback => { callback(); return 1; }, cancelAnimationFrame: () => {},
    setTimeout: (callback, delay) => { timers.set(++timerId, { callback, at: now + delay }); return timerId; }, clearTimeout: id => timers.delete(id),
  };
  sandbox.exports = sandbox.module.exports; vm.runInNewContext(compiled.outputFiles[0].text, sandbox);
  const render = (disabled = false) => {
    refIndex = effectIndex = 0;
    tree = sandbox.module.exports.default({ open, disabled, onOpen: () => { open = true; }, onClose: () => { open = false; }, currentName: '装配', currentStatus: '待开工', container: () => null, children: 'route' });
    pending.splice(0).forEach(callback => callback());
  };
  render();
  return { render, get open() { return open; }, get panel() { return tree.props.children[0].props; }, get trigger() { return tree.props.children[0].props.children[1].props; },
    attachFocus(callback) { tree.props.children[0].props.children[1].ref.current = { focus: callback }; },
    advance(ms) { now += ms; for (const [id, timer] of timers) if (timer.at <= now) { timers.delete(id); timer.callback(); } },
    close() { open = false; render(); }, unmount() { effects.forEach(effect => effect.cleanup?.()); },
  };
}
const mouse = { pointerType: 'mouse', buttons: 0 };
test('hovering over the information panel or switch button never opens the drawer', () => {
  const f = fixture(); f.panel.onPointerEnter?.(mouse); f.trigger.onPointerEnter?.(mouse);
  f.advance(1000); assert.equal(f.open, false); f.unmount();
});
test('the information panel has no click action and busy state disables the switch button', () => {
  const f = fixture();
  assert.equal(f.panel.onClick, undefined); assert.equal(f.panel.children[0].props.onClick, undefined);
  f.render(true); assert.equal(f.trigger.disabled, true); assert.equal(f.open, false); f.unmount();
});
test('clicking the switch button opens immediately with accessible expanded state', () => {
  const f = fixture(); assert.equal(f.trigger['aria-expanded'], false);
  f.trigger.onClick(); assert.equal(f.open, true); f.render();
  assert.equal(f.trigger['aria-expanded'], true); assert.equal(f.trigger['aria-haspopup'], 'dialog'); f.unmount();
});
test('closing returns focus to the switch button without reopening on hover', () => {
  const f = fixture(); let focused = false; f.attachFocus(() => { focused = true; });
  f.trigger.onClick(); f.render(); f.close(); assert.equal(focused, true);
  f.trigger.onPointerEnter?.(mouse); f.advance(1000); assert.equal(f.open, false); f.unmount();
});
test('the drawer can be reopened immediately by clicking after closing', () => {
  const f = fixture(); f.trigger.onClick(); f.render(); f.close(); f.trigger.onClick(); assert.equal(f.open, true);
  f.unmount();
});
