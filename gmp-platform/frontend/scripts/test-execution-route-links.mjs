import assert from 'node:assert/strict';
import { test } from 'node:test';
import { build } from 'esbuild';
import { fileURLToPath } from 'node:url';

const bundle = await build({ entryPoints: [fileURLToPath(new URL('../src/pages/production/executionRouteLinks.ts', import.meta.url))], bundle: true, write: false, platform: 'node', format: 'esm' });
const { executionRouteLinks } = await import(`data:text/javascript;base64,${Buffer.from(bundle.outputFiles[0].text).toString('base64')}`);
const snapshot = (ids, edges, nodes = []) => ({ operations: ids.map((id) => ({ id, type: 'OPERATION' })), routeEdges: edges.map(([source, target]) => ({ source, target })), routeNodes: nodes.map((id) => ({ id, type: 'GATEWAY' })) });

test('serial route uses nearest preceding operation, regardless of list order', () => {
  const links = executionRouteLinks(snapshot(['c', 'a', 'b'], [['a', 'b'], ['b', 'c']]));
  assert.deepEqual(links.get('c').before, ['b']);
  assert.deepEqual(links.get('a').after, ['b']);
});
test('fork and join preserve both branches through non-operation nodes', () => {
  const links = executionRouteLinks(snapshot(['a', 'b', 'c', 'd'], [['a','split'],['split','b'],['split','c'],['b','join'],['c','join'],['join','d']], ['split','join']));
  assert.deepEqual(links.get('a').after, ['b','c']);
  assert.deepEqual(links.get('b').before, ['a']);
  assert.deepEqual(links.get('c').before, ['a']);
  assert.deepEqual(links.get('d').before, ['b','c']);
});
test('separate roots are not incorrectly linked by list order', () => {
  const links = executionRouteLinks(snapshot(['a','b','c'], [['a','c'],['b','c']]));
  assert.deepEqual(links.get('b').before, []);
  assert.deepEqual(links.get('c').before, ['a','b']);
});
test('rework does not become a regular prerequisite', () => {
  const input = snapshot(['a','r','b'], [['a','r'],['r','b']]);
  input.operations[1].type = 'REWORK';
  assert.deepEqual(executionRouteLinks(input).get('b').before, []);
});
test('missing snapshot edges and unknown nodes do not fabricate dependencies', () => {
  assert.deepEqual(executionRouteLinks({ operations: [{ id:'a' }] }).get('a'), { before:[],after:[] });
  assert.deepEqual(executionRouteLinks(snapshot(['a','b'], [['a','unknown'],['unknown','b']])).get('b').before, []);
});
test('cycles and duplicate edges terminate without self links or duplicates', () => {
  const links = executionRouteLinks(snapshot(['a','b'], [['a','a'],['a','b'],['a','b'],['g','b'],['g','h'],['h','g']], ['g','h']));
  assert.deepEqual(links.get('a').before, []);
  assert.deepEqual(links.get('b').before, ['a']);
  assert.deepEqual(links.get('a').after, ['b']);
});
