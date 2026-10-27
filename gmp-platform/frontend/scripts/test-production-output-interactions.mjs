import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';
import vm from 'node:vm';
import { build } from 'esbuild';

const compiled = await build({
  entryPoints: [fileURLToPath(new URL('../src/components/ProductionOutput.tsx', import.meta.url))],
  bundle: true, write: false, platform: 'node', format: 'cjs', packages: 'external',
  plugins: [{ name: 'quantity-boundaries', setup(plugin) {
    const stubs = {
      react: 'export const useState=v=>hooks.state(v), useRef=v=>hooks.ref(v), useEffect=(f,d)=>hooks.effect(f,d), useLayoutEffect=useEffect, useId=()=>hooks.id();',
      '@mui/material': ['Box', 'ButtonBase', 'ClickAwayListener', 'IconButton', 'Paper', 'Popper', 'Stack', 'Table', 'TableBody', 'TableCell', 'TableContainer', 'TableHead', 'TablePagination', 'TableRow', 'Typography'].map(name => `export const ${name}="${name}";`).join(''),
      '@mui/icons-material': 'export const CloseRounded="Close";',
    };
    plugin.onResolve({ filter: /.*/ }, ({ path }) => path in stubs ? { path, namespace: 'stub' } : undefined);
    plugin.onLoad({ filter: /.*/, namespace: 'stub' }, ({ path }) => ({ contents: stubs[path] }));
  } }],
});

function fixture() {
  let current, timerId = 0;
  const instances = [], timers = new Map(), listeners = new Map();
  const hooks = {
    state(value) { const instance = current, index = instance.cursor++; if (!(index in instance.slots)) instance.slots[index] = value; return [instance.slots[index], next => { instance.slots[index] = typeof next === 'function' ? next(instance.slots[index]) : next; }]; },
    ref(value) { return current.slots[current.cursor++] ??= { current: value }; },
    effect(callback, deps) { const instance = current, index = instance.effectCursor++, previous = instance.effects[index]; if (!previous || deps.some((value, i) => value !== previous.deps[i])) instance.pending.push(() => { previous?.cleanup?.(); instance.effects[index] = { deps, cleanup: callback() }; }); },
    id: () => current.id,
  };
  const document = {
    addEventListener(type, callback) { if (!listeners.has(type)) listeners.set(type, new Set()); listeners.get(type).add(callback); },
    removeEventListener(type, callback) { listeners.get(type)?.delete(callback); },
  };
  const sandbox = { module: { exports: {} }, require: createRequire(import.meta.url), hooks, document,
    window: { innerHeight: 900, addEventListener() {}, removeEventListener() {} },
    requestAnimationFrame: callback => callback(),
    setTimeout: callback => { timers.set(++timerId, callback); return timerId; }, clearTimeout: id => timers.delete(id),
  };
  sandbox.exports = sandbox.module.exports; vm.runInNewContext(compiled.outputFiles[0].text, sandbox);
  const flatten = node => !node || typeof node !== 'object' ? [] : Array.isArray(node) ? node.flatMap(flatten) : [node, ...flatten(node.props?.children)];
  const add = label => {
    const instance = { id: `quantity-${instances.length}`, cursor: 0, effectCursor: 0, slots: [], effects: [], pending: [], props: { label } };
    instance.node = type => flatten(instance.tree).find(node => node.type === type);
    instance.render = () => {
      current = instance; instance.cursor = instance.effectCursor = 0;
      instance.tree = sandbox.module.exports.ProductionOutputValue(instance.props);
      instance.node('ButtonBase').ref.current = { getBoundingClientRect: () => ({ top: 100, bottom: 120 }), closest: () => null, focus: () => { instance.focused = true; instance.node('ButtonBase').props.onFocus(); } };
      instance.pending.splice(0).forEach(callback => callback());
    };
    instance.unmount = () => instance.effects.forEach(effect => effect.cleanup?.());
    instance.open = () => instance.node('Popper').props.open;
    instance.hover = () => instance.node('ButtonBase').props.onPointerEnter({ pointerType: 'mouse', buttons: 0 });
    instance.click = () => instance.node('ButtonBase').props.onClick({ stopPropagation() {} });
    instances.push(instance); instance.render(); return instance;
  };
  return { add, render: () => instances.forEach(instance => instance.render()),
    advance: () => { for (const [id, callback] of timers) { timers.delete(id); callback(); } },
    escape: () => { for (const callback of [...(listeners.get('keydown') ?? [])]) callback({ key: 'Escape', preventDefault() {}, stopPropagation() {} }); },
    unmount: () => instances.forEach(instance => instance.unmount()), timers,
  };
}

test('hovering another quantity immediately replaces even a pinned preview', () => {
  const f = fixture(), first = f.add('产出'), second = f.add('良品'), third = f.add('不良品');
  first.hover(); first.click(); f.render(); assert.equal(first.open(), true);
  second.hover(); f.render(); assert.equal(first.open(), false); assert.equal(second.open(), true);
  third.hover(); f.render(); assert.equal(second.open(), false); assert.equal(third.open(), true);
  f.unmount();
});

test('switching previews clears pending close timers and keeps the new preview readable', () => {
  const f = fixture(), first = f.add('产出'), second = f.add('良品');
  first.hover(); f.render(); first.node('ButtonBase').props.onPointerLeave(); assert.equal(f.timers.size, 1);
  second.hover(); f.render(); assert.equal(f.timers.size, 0);
  second.node('ButtonBase').props.onPointerLeave(); second.node('Paper').props.onPointerEnter();
  f.advance(); f.render(); assert.equal(first.open(), false); assert.equal(second.open(), true);
  second.node('Paper').props.onPointerLeave(); f.advance(); f.render(); assert.equal(second.open(), false);
  f.unmount();
});

test('focus switches previews without stealing focus; pin, toggle and Escape still work', () => {
  const f = fixture(), first = f.add('产出'), second = f.add('良品');
  first.click(); f.render(); second.node('ButtonBase').props.onFocus(); f.render();
  assert.equal(first.open(), false); assert.equal(first.focused, undefined); assert.equal(second.open(), true);
  second.click(); f.render(); second.node('ButtonBase').props.onPointerLeave(); f.advance(); f.render(); assert.equal(second.open(), true);
  second.click(); f.render(); assert.equal(second.open(), false);
  second.click(); f.render(); f.escape(); f.render(); assert.equal(second.open(), false); assert.equal(second.focused, true);
  f.unmount();
});

test('unmount releases the active preview and touch hover does not take over', () => {
  const f = fixture(), first = f.add('产出'), second = f.add('良品');
  first.hover(); f.render(); second.node('ButtonBase').props.onPointerEnter({ pointerType: 'touch', buttons: 0 }); f.render();
  assert.equal(first.open(), true); assert.equal(second.open(), false);
  first.unmount(); second.hover(); f.render(); assert.equal(second.open(), true); second.unmount();
});
