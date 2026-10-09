import assert from 'node:assert/strict';
import { test } from 'node:test';
import { build } from 'esbuild';
import vm from 'node:vm';
import { createRequire } from 'node:module';

const result = await build({ entryPoints: ['src/pages/production/ExecutionDocumentViewer.tsx'], bundle: true, write: false, format: 'cjs', platform: 'node', packages: 'external',
  plugins: [{ name: 'viewer-boundaries', setup(plugin) {
    const stubs = {
      react: 'export const useState=v=>hooks.state(v), useRef=v=>hooks.ref(v), useEffect=(f,d)=>hooks.effect(f,d);',
      '@mui/material': ['Alert','Box','Button','CircularProgress','IconButton','Tooltip','Typography'].map(x => `export const ${x}="${x}";`).join(''),
      '@mui/icons-material': ['ChevronLeftRounded','ChevronRightRounded','FitScreenRounded','InfoOutlined','RotateRightRounded','ZoomInRounded','ZoomOutRounded'].map(x => `export const ${x}="${x}";`).join(''),
    };
    plugin.onResolve({ filter: /.*/ }, ({ path }) => path in stubs ? { path, namespace: 'stub' } : undefined);
    plugin.onLoad({ filter: /.*/, namespace: 'stub' }, ({ path }) => ({ contents: stubs[path] }));
  } }] });
function fixture(documentKey = 'sop-a:V1:file1', stored = new Map()) {
  let cursor = 0, tree;
  const slots = [], effects = [], changes = [];
  const hooks = {
    state(value) { const i = cursor++; if (!(i in slots)) slots[i] = typeof value === 'function' ? value() : value; return [slots[i], value => { slots[i] = typeof value === 'function' ? value(slots[i]) : value; }]; },
    ref() { const i = cursor++; return slots[i] ??= { current: { clientWidth: 832, scrollTo() {} } }; },
    effect(callback, deps) { const i = cursor++; if (!slots[i] || deps.some((v, j) => v !== slots[i][j])) { slots[i] = deps; effects.push(callback); } },
  };
  const sandbox = { module: { exports: {} }, require: createRequire(import.meta.url), hooks, localStorage: { getItem: key => stored.get(key) ?? null, setItem: (key, value) => stored.set(key, value) }, ResizeObserver: class { constructor(f) { this.f=f; } observe() { this.f(); } disconnect() {} } };
  sandbox.exports=sandbox.module.exports; vm.runInNewContext(result.outputFiles[0].text, sandbox);
  const props = { documentKey, url: 'page1', image: true, name: '操作说明', error: '', emptyMessage: '加载中', page: 1, pages: 7, firstPage: 1, lastPage: 7, onPageChange: p => changes.push(p) };
  const render = () => { cursor=0; tree=sandbox.module.exports.default(props); effects.splice(0).forEach(f=>f()); };
  const nodes = (n=tree) => !n || typeof n!=='object' ? [] : Array.isArray(n) ? n.flatMap(nodes) : [n,...nodes(n.props?.children??null)];
  const find = match => nodes().find(n=>match(n.props??{}, n.type));
  const control = label => find((p,t)=>(t==='Button'||t==='IconButton')&&p['aria-label']===label);
  const click = label => { const node=control(label); assert.equal(node.props.disabled,false); node.props.onClick(); render(); };
  render(); render();
  const load = () => { find((p,t)=>t==='img').props.onLoad({currentTarget:{naturalWidth:1600,naturalHeight:2400}}); render(); };
  return { props, render, find, control, click, load, changes, geometry: sandbox.module.exports.documentGeometry };
}
test('fit width and rotation allocate positive bounds for the entire page', () => {
  const {geometry}=fixture();
  assert.deepEqual(JSON.parse(JSON.stringify(geometry(1600,2400,800,0,null))),{scale:0.5,width:800,height:1200});
  const rotated=geometry(1600,2400,800,90,null);
  assert.equal(rotated.width,800); assert.ok(Math.abs(rotated.height-533.333333)<0.001);
  for(const angle of [0,90,180,270]) { const box=geometry(1600,2400,800,angle,2); assert.equal(box.width*box.height,1600*2400*4); }
});
test('zoom, reset and rotation update actual display ratio without leaving fit mode stale', () => {
  const f=fixture(); f.load();
  const ratio=()=>f.find(p=>p['aria-label']==='页面显示百分比').props.children;
  assert.equal(ratio(),'50%'); f.click('放大'); assert.equal(ratio(),'60%');
  f.click('缩小'); assert.equal(ratio(),'50%');
  f.click('适合窗口宽度'); f.click('顺时针旋转 90°'); assert.equal(ratio(),'33%');
  for(let i=0;i<3;i++) f.click('顺时针旋转 90°'); assert.equal(ratio(),'50%');
});
test('zoom is bounded and disabled before the image is ready', () => {
  const f=fixture(); assert.equal(f.control('放大').props.disabled,true); f.load();
  for(let i=0;i<4;i++) f.click('缩小'); assert.equal(f.control('缩小').props.disabled,true);
  for(let i=0;i<39;i++) f.click('放大'); assert.equal(f.control('放大').props.disabled,true);
});
test('navigation respects allowed pages and waits for the next page response', () => {
  const f=fixture(); f.load(); assert.equal(f.control('上一页').props.disabled,true);
  f.click('下一页'); assert.deepEqual(f.changes,[2]);
  f.props.url=''; f.render(); assert.equal(f.control('下一页').props.disabled,true);
  f.props.url='page7'; f.props.page=7; f.render(); f.load(); assert.equal(f.control('下一页').props.disabled,true);
  f.click('上一页'); assert.deepEqual(f.changes,[2,6]);
});
test('error and non-image previews do not expose nonworking transform controls', () => {
  const f=fixture(); f.load(); f.props.error='预览失败'; f.render(); assert.equal(f.control('放大').props.disabled,true);
  f.props.error=''; f.props.image=false; f.render(); assert.equal(f.control('顺时针旋转 90°').props.disabled,true);
});

test('each SOP version restores its rotation after remounting with a new preview URL', () => {
  const stored = new Map();
  const first = fixture('sop-a:V1:file1', stored); first.load(); first.click('顺时针旋转 90°');
  const second = fixture('sop-b:V1:file2', stored); second.load();
  assert.match(second.find((p,t)=>t==='img').props.style.transform, /rotate\(0deg\)/);
  second.click('顺时针旋转 90°'); second.click('顺时针旋转 90°');
  const reopened = fixture('sop-a:V1:file1', stored); reopened.props.url='fresh-blob'; reopened.render(); reopened.load();
  assert.match(reopened.find((p,t)=>t==='img').props.style.transform, /rotate\(90deg\)/);
  const nextVersion = fixture('sop-a:V2:file3', stored); nextVersion.load();
  assert.match(nextVersion.find((p,t)=>t==='img').props.style.transform, /rotate\(0deg\)/);
  for(let i=0;i<3;i++) reopened.click('顺时针旋转 90°');
  const reset = fixture('sop-a:V1:file1', stored); reset.load();
  assert.match(reset.find((p,t)=>t==='img').props.style.transform, /rotate\(0deg\)/);
});
