import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';
import vm from 'node:vm';
import { build } from 'esbuild';

const require = createRequire(import.meta.url);
const compiled = await build({
  entryPoints: [fileURLToPath(new URL('../src/pages/production/ExecutionQuickPanel.tsx', import.meta.url))],
  bundle: true, write: false, platform: 'node', format: 'cjs', packages: 'external',
  plugins: [{ name: 'interaction-boundaries', setup(plugin) {
    const stubs = {
      react: 'export const useRef = v => hooks.ref(v); export const useEffect = (f,d) => hooks.effect(f,d); export const useId = () => "peek";',
      '@mui/material': 'export const Box="Box", Button="Button", IconButton="IconButton", Portal="Portal", Typography="Typography";',
      '@mui/icons-material': 'export const CloseRounded="Close", EditNoteRounded="Edit";',
    };
    plugin.onResolve({ filter: /.*/ }, ({ path }) => path in stubs ? { path, namespace: 'stub' } : undefined);
    plugin.onLoad({ filter: /.*/, namespace: 'stub' }, ({ path }) => ({ contents: stubs[path], loader: 'js' }));
  } }],
});

function fixture(sidebarRail = false, stickySection = false) {
  let cursor = 0, effectCursor = 0, active = null, tree;
  let section = stickySection ? null : undefined;
  const refs = [], effects = [], pending = [], timers = new Map(), listeners = new Map();
  let timerId = 0;
  const document = { activeElement: null,
    addEventListener: (type, handler) => { const set = listeners.get(type) ?? new Set(); set.add(handler); listeners.set(type, set); },
    removeEventListener: (type, handler) => listeners.get(type)?.delete(handler),
  };
  class Element {
    constructor(area = '') { this.area = area; this.isConnected = true; }
    closest(selector) { return selector === '.execution-page' ? this.area === 'page' : this.area === 'portal'; }
    contains(target) { return this === target; }
    focus() { document.activeElement = this; }
    querySelectorAll() { return []; }
  }
  const input = new Element('page'); document.activeElement = input;
  const hooks = {
    ref(value) { const index = cursor++; return refs[index] ??= { current: index < 4 ? new Element() : value }; },
    effect(callback, deps) {
      const index = effectCursor++, previous = effects[index];
      if (!previous || deps.some((value, i) => value !== previous.deps[i])) pending.push(() => { previous?.cleanup?.(); effects[index] = { deps, cleanup: callback() }; });
    },
  };
  const sandbox = { module: { exports: {} }, require, hooks, document, Element,
    setTimeout: (callback, delay) => { timers.set(++timerId, { callback, delay }); return timerId; },
    clearTimeout: (id) => timers.delete(id),
  };
  sandbox.exports = sandbox.module.exports;
  vm.runInNewContext(compiled.outputFiles[0].text, sandbox);
  const Component = sandbox.module.exports.default;
  const onChange = value => { active = value; };
  const form = { draft: '37' };
  const render = (suspended = false) => {
    cursor = 0; effectCursor = 0;
    tree = Component({ active, onChange, suspended, section, onSectionChange: stickySection ? next => { section = next; } : undefined, railContainer: sidebarRail ? input : null, context: 'B01', children: form,
      panels: ['sop', 'works', 'history'].map(id => ({ id, label: id, title: id, content: id })) });
    pending.splice(0).forEach(callback => callback());
  };
  const flatten = node => !node ? [] : Array.isArray(node) ? node.flatMap(flatten) : [node, ...flatten(node.props?.children)];
  const button = id => flatten(tree).find(node => node.props?.['aria-label'] === `查看${id}`).props;
  const fire = (type, target, key) => {
    const event = { target, key, prevented: false, stopped: false, preventDefault() { this.prevented = true; }, stopPropagation() { this.stopped = true; } };
    [...(listeners.get(type) ?? [])].forEach(handler => handler(event)); return event;
  };
  render();
  return { render, button, fire, Element, refs, input, document, timers, form, get active() { return active; },
    get portal() { return flatten(tree).find(node => node.type === 'Portal').props; },
    get home() { return flatten(tree).find(node => node.props?.['aria-label'] === '返回填报').props; },
    advance(ms) { for (const [id, timer] of timers) if (timer.delay <= ms) { timers.delete(id); timer.callback(); } },
    open(id) { button(id).onClick(); render(); },
    openItem(id) { active = id; render(); },
    closeExternally() { active = null; render(); },
    unmount() { effects.forEach(effect => effect.cleanup?.()); },
  };
}

test('sidebar shortcuts keep their portal target, outside-click exemption and keyboard focus cycle', () => {
  const f = fixture(true);
  assert.equal(f.portal.container, f.input);
  assert.equal(f.portal.disablePortal, false);
  f.open('sop');
  f.fire('pointerdown', f.refs[1].current);
  assert.equal(f.active, 'sop');
  const shortcut = new f.Element(), panelButton = new f.Element();
  shortcut.getClientRects = panelButton.getClientRects = () => [{}];
  f.refs[1].current.querySelectorAll = () => [shortcut];
  f.refs[0].current.querySelectorAll = () => [panelButton];
  panelButton.focus();
  assert.equal(f.fire('keydown', panelButton, 'Tab').prevented, true);
  assert.equal(f.document.activeElement, shortcut);
  f.unmount();
});

test('closing the reader retains the sidebar category until the user selects filling', () => {
  const f = fixture(true, true); f.open('sop');
  assert.equal(f.button('sop')['aria-pressed'], true);
  f.openItem('sop'); assert.equal(f.active, 'sop');
  f.closeExternally();
  assert.equal(f.active, null); assert.equal(f.button('sop')['aria-pressed'], true);
  assert.equal(f.home['aria-pressed'], false);
  f.home.onClick(); f.render(); assert.equal(f.home['aria-pressed'], true);
  f.unmount();
});

test('sidebar categories only select their list and close any existing reader', () => {
  const f = fixture(true, true);
  for (const id of ['sop', 'works', 'history']) {
    f.open(id);
    assert.equal(f.active, null);
    assert.equal(f.button(id)['aria-pressed'], true);
    assert.equal(f.button(id)['aria-expanded'], false);
    f.open(id); assert.equal(f.active, null);
    f.openItem(id); assert.equal(f.active, id);
  }
  f.home.onClick(); f.render();
  assert.equal(f.active, null); assert.equal(f.home['aria-pressed'], true);
  assert.equal(f.form.draft, '37');
  f.unmount();
});

test('hovering any shortcut never opens or switches a panel', () => {
  const f = fixture();
  for (const id of ['sop', 'works', 'history']) {
    f.button(id).onPointerEnter?.({ pointerType: 'mouse', buttons: 0 });
    f.advance(1000); assert.equal(f.active, null);
  }
  f.open('sop');
  f.button('works').onPointerEnter?.({ pointerType: 'mouse', buttons: 0 });
  f.advance(1000); assert.equal(f.active, 'sop');
  assert.equal(f.timers.size, 0);
  f.unmount();
});
test('touch and dragging never hover-open; click opens immediately and toggles closed', () => {
  const f = fixture();
  for (const event of [{ pointerType: 'touch', buttons: 0 }, { pointerType: 'mouse', buttons: 1 }]) f.button('sop').onPointerEnter?.(event);
  f.advance(300); assert.equal(f.active, null);
  f.open('sop'); assert.equal(f.active, 'sop');
  f.button('sop').onClick(); assert.equal(f.active, null); f.unmount();
});
test('outside dismissal consumes its click even after the closed panel rerenders', () => {
  const f = fixture(); f.open('sop');
  const target = new f.Element('page');
  assert.equal(f.fire('pointerdown', target).prevented, true); assert.equal(f.active, null);
  f.render(); assert.equal(f.fire('click', target).stopped, true);
  f.fire('pointerdown', target); assert.equal(f.fire('click', target).prevented, false); f.unmount();
});
test('panel and portalled controls do not dismiss; Escape restores prior focus', () => {
  const f = fixture(); f.open('sop');
  f.fire('pointerdown', f.refs[2].current); f.fire('pointerdown', new f.Element('portal'));
  assert.equal(f.active, 'sop');
  assert.equal(f.fire('keydown', f.refs[3].current, 'Escape').prevented, true);
  assert.equal(f.active, null); assert.equal(f.document.activeElement, f.input); f.unmount();
});
test('clicking between panels retains initial return focus', () => {
  const f = fixture(); f.open('sop');
  f.open('works');
  f.open('history'); f.advance(300); assert.equal(f.active, 'history');
  f.fire('keydown', f.refs[3].current, 'Escape'); assert.equal(f.document.activeElement, f.input); f.unmount();
});
test('a nested confirmation suspends outer Escape handling', () => {
  const f = fixture(); f.open('works'); f.render(true);
  assert.equal(f.fire('keydown', f.refs[3].current, 'Escape').prevented, false);
  f.render(false); f.fire('keydown', f.refs[3].current, 'Escape'); assert.equal(f.active, null); f.unmount();
});
test('unmount removes document listeners', () => {
  const f = fixture(); f.open('sop'); f.unmount();
  assert.equal(f.fire('keydown', f.refs[3].current, 'Escape').prevented, false);
  assert.equal(f.active, 'sop');
});
test('returning to a form from panel content restores focus after its button is hidden', () => {
  const f = fixture(); f.open('works'); f.closeExternally();
  assert.equal(f.document.activeElement, f.input); f.unmount();
});
