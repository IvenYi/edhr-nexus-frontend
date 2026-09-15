import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';
import vm from 'node:vm';
import { build } from 'esbuild';

const require = createRequire(import.meta.url);
const compiled = await build({
  entryPoints: [fileURLToPath(new URL('../src/pages/production/ExecutionProductDetails.tsx', import.meta.url))],
  bundle: true, write: false, platform: 'node', format: 'cjs', packages: 'external',
  plugins: [{ name: 'product-boundaries', setup(plugin) {
    const stubs = {
      react: 'export const useRef=v=>hooks.ref(v); export const useState=v=>hooks.state(v); export const useEffect=(f,d)=>hooks.effect(f,d); export const useId=()=>"product";',
      '@mui/material': 'export const Box="Box", Button="Button", ClickAwayListener="ClickAway", IconButton="IconButton", Paper="Paper", Popper="Popper", Typography="Typography";',
      '@mui/icons-material': 'export const CloseRounded="Close", InfoOutlined="Info";',
    };
    plugin.onResolve({ filter: /.*/ }, ({ path }) => path in stubs ? { path, namespace: 'stub' } : undefined);
    plugin.onLoad({ filter: /.*/, namespace: 'stub' }, ({ path }) => ({ contents: stubs[path], loader: 'js' }));
  } }],
});

function fixture(context = {}) {
  let cursor = 0, effectCursor = 0, tree, timerId = 0, focused = false;
  const values = [], effects = [], pending = [], timers = new Map(), listeners = new Map();
  const hooks = {
    ref(value) { return values[cursor++] ??= { current: value }; },
    state(value) { const index = cursor++; if (!(index in values)) values[index] = value; return [values[index], next => { values[index] = typeof next === 'function' ? next(values[index]) : next; }]; },
    effect(callback, deps) { const index = effectCursor++, previous = effects[index]; if (!previous || deps.some((v, i) => v !== previous.deps[i])) pending.push(() => { previous?.cleanup?.(); effects[index] = { deps, cleanup: callback() }; }); },
  };
  const sandbox = { module: { exports: {} }, require, hooks,
    document: { addEventListener: (type, handler) => listeners.set(type, handler), removeEventListener: type => listeners.delete(type) },
    setTimeout: (callback, delay) => { timers.set(++timerId, { callback, delay }); return timerId; }, clearTimeout: id => timers.delete(id),
  };
  sandbox.exports = sandbox.module.exports; vm.runInNewContext(compiled.outputFiles[0].text, sandbox);
  const flatten = node => !node ? [] : Array.isArray(node) ? node.flatMap(flatten) : [node, ...flatten(node.props?.children)];
  const node = type => flatten(tree).find(item => item.type === type);
  const container = () => 'fullscreen-root';
  const render = (suspended = false) => {
    cursor = effectCursor = 0;
    tree = sandbox.module.exports.default({ context: { productName: '导管', productCode: 'P01', processVersion: 'V2', productionMode: '量产', routeName: '装配路线', ...context }, container, suspended });
    node('Button').ref.current = { focus: () => { focused = true; } };
    pending.splice(0).forEach(callback => callback());
  };
  render();
  return { render, node, get open() { return node('Popper').props.open; }, get focused() { return focused; },
    advance(ms) { for (const [id, timer] of timers) if (timer.delay <= ms) { timers.delete(id); timer.callback(); } render(); },
    escape() { listeners.get('keydown')?.({ key: 'Escape', preventDefault() {} }); render(); },
    unmount() { effects.forEach(effect => effect.cleanup?.()); }, timers,
  };
}
const mouse = { pointerType: 'mouse', buttons: 0 };
test('hover preview can be entered and closes after leaving both surfaces', () => {
  const f = fixture(); f.node('Button').props.onPointerEnter(mouse); f.render(); assert.equal(f.open, true);
  f.node('Button').props.onPointerLeave(); f.node('Paper').props.onPointerEnter(); f.advance(200); assert.equal(f.open, true);
  f.node('Paper').props.onPointerLeave(); f.advance(150); assert.equal(f.open, false); f.unmount();
});
test('click pins a hover preview until outside click or a second button click', () => {
  const f = fixture(); f.node('Button').props.onPointerEnter(mouse); f.render();
  f.node('Button').props.onClick(); f.render(); f.node('Button').props.onPointerLeave(); f.advance(500); assert.equal(f.open, true);
  f.node('ClickAway').props.onClickAway(); f.render(); assert.equal(f.open, false);
  f.node('Button').props.onClick(); f.render(); f.node('Button').props.onClick(); f.render(); assert.equal(f.open, false); f.unmount();
});
test('Escape closes a pinned preview and returns focus to its trigger', () => {
  const f = fixture(); f.node('Button').props.onClick(); f.render(); f.escape(); assert.equal(f.open, false); assert.equal(f.focused, true); f.unmount();
});
test('touch hover does not open, suspended workflows close, and unmount cancels timers', () => {
  const f = fixture(); f.node('Button').props.onPointerEnter({ pointerType: 'touch', buttons: 0 }); f.render(); assert.equal(f.open, false);
  f.node('Button').props.onClick(); f.render(); f.render(true); assert.equal(f.open, false); assert.equal(f.node('Button').props.disabled, true);
  f.render(); assert.equal(f.open, false); f.node('Button').props.onPointerEnter(mouse); f.render(); f.node('Button').props.onPointerLeave();
  f.unmount(); assert.equal(f.timers.size, 0);
});
test('details use snapshot values and a fullscreen-compatible portal container', () => {
  const f = fixture();
  const rows = f.node('Paper').props.children[1].props.children;
  const details = Object.fromEntries(rows.map(row => row.props.children.map(cell => cell.props.children)));
  assert.equal(details['产品名称'], '导管'); assert.equal(details['产品编码'], 'P01'); assert.equal(details['生产版本'], 'V2');
  assert.equal(details['生产模式'], '量产'); assert.equal(details['工艺路线'], '装配路线'); assert.equal(details['产品规格'], '—');
  assert.equal(f.node('Popper').props.container(), 'fullscreen-root'); f.unmount();
});
