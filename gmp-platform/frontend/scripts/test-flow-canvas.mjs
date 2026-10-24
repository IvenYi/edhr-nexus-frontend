import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import path from 'node:path';
import vm from 'node:vm';
import test from 'node:test';
import { build } from 'esbuild';

const root = path.resolve(import.meta.dirname, '..');
const require = createRequire(import.meta.url);
const output = await build({
  absWorkingDir: root,
  stdin: { contents: `export * from './src/components/route-graph/routeGraph'; export { FlowHistory } from './src/components/flow-designer/useFlowHistory';`, resolveDir: root, loader: 'ts' },
  bundle: true, write: false, platform: 'node', format: 'cjs', packages: 'external', logLevel: 'silent',
});
const module = { exports: {} };
vm.runInNewContext(output.outputFiles[0].text, { module, exports: module.exports, require });
const { FlowHistory, fromRouteGraphResponse, toRouteGraphPayload, presentRouteGraph, getRouteConnectivityErrors, getRouteTopologyErrors, getRouteConnectionError, createRouteQuickConnection, getRouteAnchoredAddPosition } = module.exports;
const plain = value => JSON.parse(JSON.stringify(value));
const fixture = {
  nodes: [
    { nodeKey: '__route_start__', nodeType: 'START', positionX: 100, positionY: 0 },
    { nodeKey: 'assembly-a', operationId: '9223372036854775806', operationCode: 'ASM', operationName: '装配一', nodeType: 'OPERATION', positionX: 0, positionY: 100 },
    { nodeKey: 'assembly-b', operationId: '9223372036854775806', operationCode: 'ASM', operationName: '装配二', nodeType: 'OPERATION', positionX: 240, positionY: 100 },
    { nodeKey: 'inspect', operationId: '903', operationCode: 'QC', operationName: '检验', nodeType: 'OPERATION', positionX: 100, positionY: 240 },
    { nodeKey: 'rework', operationId: '904', operationCode: 'RW', operationName: '返工', nodeType: 'REWORK', positionX: 340, positionY: 240 },
    { nodeKey: '__route_end__', nodeType: 'END', positionX: 100, positionY: 360 },
  ],
  relations: [
    { sourceNodeKey: '__route_start__', targetNodeKey: 'assembly-a', sourceHandle: 'route-handle-left', targetHandle: 'route-handle-top', relationType: 'PARALLEL' },
    { sourceNodeKey: '__route_start__', targetNodeKey: 'assembly-b', sourceHandle: 'route-handle-right', targetHandle: 'route-handle-top', relationType: 'PARALLEL' },
    { sourceNodeKey: 'assembly-a', targetNodeKey: 'inspect', sourceHandle: 'route-handle-right', targetHandle: 'route-handle-left', relationType: 'SEQUENTIAL' },
    { sourceNodeKey: 'assembly-b', targetNodeKey: 'inspect', sourceHandle: 'route-handle-bottom', targetHandle: 'route-handle-right', relationType: 'SEQUENTIAL' },
    { sourceNodeKey: 'inspect', targetNodeKey: '__route_end__', sourceHandle: 'route-handle-bottom', targetHandle: 'route-handle-top', relationType: 'OPTIONAL', ruleExpression: 'retained-as-text', label: '原条件' },
    { sourceNodeKey: 'inspect', targetNodeKey: 'rework', sourceHandle: 'route-handle-right', targetHandle: 'route-handle-left', relationType: 'REWORK' },
  ],
};

test('route conversion preserves occurrence keys, string identities, coordinates and four-way ports', () => {
  const graph = fromRouteGraphResponse(fixture);
  const payload = plain(toRouteGraphPayload(graph.nodes, graph.edges));
  assert.deepEqual(payload.nodes.map(node => node.nodeKey), fixture.nodes.map(node => node.nodeKey));
  assert.equal(payload.nodes[1].operationId, '9223372036854775806');
  assert.equal(payload.nodes[2].operationId, '9223372036854775806');
  assert.notEqual(payload.nodes[1].nodeKey, payload.nodes[2].nodeKey);
  assert.deepEqual(payload.nodes.map(node => [node.positionX, node.positionY]), fixture.nodes.map(node => [node.positionX, node.positionY]));
  assert.deepEqual(payload.relations.map(edge => [edge.sourceHandle, edge.targetHandle]), fixture.relations.map(edge => [edge.sourceHandle, edge.targetHandle]));
  assert.deepEqual(payload.relations.map(edge => edge.priority), [1, 2, 3, 4, 5, 6]);
  assert.equal(payload.relations[4].relationType, 'OPTIONAL');
  assert.equal(payload.relations[4].ruleExpression, 'retained-as-text');
  assert.equal(payload.relations[4].label, '原条件');
  assert.equal(payload.nodes[4].nodeType, 'REWORK');
});

test('shared presentation computes parallel/merge/rework markers without changing saved graph data', () => {
  const graph = fromRouteGraphResponse(fixture);
  const before = plain(graph);
  const presented = presentRouteGraph(graph.nodes, graph.edges, true, 'inspect');
  const byId = new Map(presented.nodes.map(node => [node.id, node]));
  assert.deepEqual(plain(byId.get('assembly-a').data.parallelBadges), ['并1']);
  assert.deepEqual(plain(byId.get('assembly-b').data.parallelBadges), ['并1']);
  assert.deepEqual(plain(byId.get('inspect').data.mergeBadges), ['合1']);
  assert.deepEqual(plain(byId.get('rework').data.reworkBadges), ['返1']);
  assert.equal(byId.get('inspect').data.showConnectableHandles, true);
  assert.equal(byId.get('__route_start__').data.showConnectableHandles, false);
  assert.ok(byId.get('inspect').data.connectedHandleIds.includes('route-handle-right'));
  assert.equal(presented.edges.at(-1).style.strokeDasharray, '6 4');
  assert.equal(presented.edges.at(-1).label, '返工');
  assert.deepEqual(plain(graph), before);
  assert.deepEqual(plain(toRouteGraphPayload(presented.nodes, presented.edges)), plain(toRouteGraphPayload(graph.nodes, graph.edges)));
});

test('missing ports keep the existing geometry fallback and boundary nodes remain protected', () => {
  const graph = fromRouteGraphResponse({ nodes: fixture.nodes, relations: [{ sourceNodeKey: 'assembly-a', targetNodeKey: 'assembly-b', relationType: 'SEQUENTIAL' }] });
  assert.equal(graph.edges[0].sourceHandle, 'route-handle-right');
  assert.equal(graph.edges[0].targetHandle, 'route-handle-left');
  assert.equal(graph.nodes[0].deletable, false);
  assert.equal(graph.nodes.at(-1).deletable, false);
  const empty = fromRouteGraphResponse({ nodes: [], relations: [] });
  assert.deepEqual(plain(empty.nodes.map(node => node.id)), ['__route_start__', '__route_end__']);
});

test('branch save and reload preserve explicit relationship types, rules and rework markings', () => {
  const explicit = ['REWORK', 'OPTIONAL', 'ALTERNATIVE', 'SEQUENTIAL'].map((relationType, index) => ({
    sourceNodeKey: '__route_start__', targetNodeKey: ['assembly-a', 'assembly-b', 'inspect', 'rework'][index],
    relationType, ruleExpression: `original-rule-${index}`, sourceHandle: 'route-handle-bottom', targetHandle: 'route-handle-top',
  }));
  const loaded = fromRouteGraphResponse({ ...fixture, relations: [...fixture.relations.filter(edge => edge.sourceNodeKey !== '__route_start__'), ...explicit] });
  const payload = plain(toRouteGraphPayload(loaded.nodes, loaded.edges));
  assert.deepEqual(payload.relations.slice(-4).map(edge => [edge.relationType, edge.ruleExpression]), explicit.map(edge => [edge.relationType, edge.ruleExpression]));
  const reloaded = fromRouteGraphResponse(payload);
  const presented = presentRouteGraph(reloaded.nodes, reloaded.edges);
  assert.equal(presented.edges.find(edge => edge.source === '__route_start__' && edge.target === 'assembly-a').label, '返工');
  assert.deepEqual(plain(toRouteGraphPayload(presented.nodes, presented.edges)), payload);
});

test('route save checks all production paths while preserving parallel and rework', () => {
  const graph = fromRouteGraphResponse(fixture);
  assert.deepEqual(plain(getRouteConnectivityErrors(graph.nodes, graph.edges)), {});
  const withoutStart = graph.edges.filter(edge => edge.source !== '__route_start__');
  const errors = getRouteConnectivityErrors(graph.nodes, withoutStart);
  assert.ok(errors.__route_start__ && errors.__route_end__ && errors['assembly-a']);
  const orphan = { ...graph.nodes[1], id: 'orphan' };
  assert.match(getRouteConnectivityErrors([...graph.nodes, orphan], graph.edges).orphan, /未连接到开始/);
  const deadEnd = { ...graph.nodes[1], id: 'dead-end' };
  assert.match(getRouteConnectivityErrors([...graph.nodes, deadEnd], [...graph.edges, { id: 'dead', source: '__route_start__', target: 'dead-end' }])['dead-end'], /无法到达结束/);
});

test('rework cannot stand in for the production path, but an empty connected skeleton is allowed', () => {
  const graph = fromRouteGraphResponse(fixture);
  const boundary = graph.nodes.filter(node => node.data.virtual);
  assert.deepEqual(plain(getRouteConnectivityErrors(boundary, [{ source: '__route_start__', target: '__route_end__' }])), {});
  const rework = graph.nodes.find(node => node.data.nodeType === 'REWORK');
  assert.ok(getRouteConnectivityErrors([...boundary, rework], [{ source: '__route_start__', target: rework.id }, { source: rework.id, target: '__route_end__' }]).__route_start__);
});

test('route save rejects ambiguous keys, dangling references and invalid boundary directions', () => {
  const graph = fromRouteGraphResponse(fixture);
  assert.ok(getRouteConnectivityErrors([...graph.nodes, graph.nodes[1]], graph.edges).__graph__);
  assert.ok(getRouteConnectivityErrors(graph.nodes, [...graph.edges, { source: 'missing', target: 'inspect' }]).__graph__);
  assert.ok(getRouteConnectivityErrors(graph.nodes, [...graph.edges, { source: 'inspect', target: '__route_start__' }]).__route_start__);
  assert.ok(getRouteConnectivityErrors(graph.nodes, [...graph.edges, { source: '__route_end__', target: 'inspect' }]).__route_end__);
});

test('quick connections retain domain port IDs and before/after direction without rewriting existing edges', () => {
  const { nodes } = fromRouteGraphResponse(fixture);
  const anchor = nodes[1], other = nodes[2], end = nodes.find(node => node.data.nodeType === 'END');
  for (const [direction, source, target, sourcePort, targetPort] of [
    ['top', other.id, anchor.id, 'bottom', 'top'], ['right', anchor.id, other.id, 'right', 'left'],
    ['bottom', anchor.id, other.id, 'bottom', 'top'], ['left', anchor.id, other.id, 'left', 'right'],
  ]) {
    const edge = createRouteQuickConnection(anchor, other, direction);
    assert.deepEqual([edge.source, edge.target, edge.sourceHandle, edge.targetHandle], [source, target, `route-handle-${sourcePort}`, `route-handle-${targetPort}`]);
  }
  assert.equal(createRouteQuickConnection(end, other, 'right').target, end.id);
});

test('connection guards reject self links and duplicate node pairs regardless of ports', () => {
  const { nodes, edges } = fromRouteGraphResponse(fixture);
  assert.match(getRouteConnectionError(nodes, edges, { source: 'inspect', target: 'inspect' }), /自身/);
  assert.match(getRouteConnectionError(nodes, edges, { source: 'assembly-a', target: 'inspect' }), /重复连线/);
  assert.equal(getRouteConnectionError(nodes, edges.filter(edge => edge.source !== 'assembly-a'), { source: 'assembly-a', target: 'inspect' }), null);
  assert.match(getRouteConnectivityErrors(nodes, [...edges, { id: 'different-ports', source: 'assembly-a', target: 'inspect', sourceHandle: 'route-handle-bottom' }])['assembly-a'], /重复连线/);
  assert.match(getRouteConnectivityErrors(nodes, [...edges, { id: 'self', source: 'inspect', target: 'inspect' }]).inspect, /自身/);
});

test('repeated operations have matching occurrence numbers from the whole graph without changing payloads', () => {
  const { nodes, edges } = fromRouteGraphResponse(fixture);
  const presented = presentRouteGraph(nodes, edges);
  assert.equal(presented.nodes.find(node => node.id === 'assembly-a').data.occurrenceBadge, '节点 1');
  assert.equal(presented.nodes.find(node => node.id === 'assembly-b').data.occurrenceBadge, '节点 2');
  assert.equal(presented.nodes.find(node => node.id === 'inspect').data.occurrenceBadge, undefined);
  assert.deepEqual(plain(toRouteGraphPayload(presented.nodes, presented.edges)), plain(toRouteGraphPayload(nodes, edges)));
});

test('normal production rejects two-node and longer cycles while retaining explicit rework and parallel paths', () => {
  const { nodes, edges } = fromRouteGraphResponse(fixture);
  assert.match(getRouteConnectionError(nodes, edges, { source: 'inspect', target: 'assembly-a' }), /循环/);
  assert.match(getRouteConnectivityErrors(nodes, [...edges, { id: 'back', source: 'inspect', target: 'assembly-a', data: { relationType: 'REWORK' } }]).inspect, /循环/);
  const longer = [
    { source: '__route_start__', target: 'assembly-a' }, { source: 'assembly-a', target: 'assembly-b' },
    { source: 'assembly-b', target: 'inspect' }, { source: 'inspect', target: '__route_end__' },
  ];
  assert.match(getRouteConnectionError(nodes, longer, { source: 'inspect', target: 'assembly-a' }), /循环/);
  assert.equal(getRouteConnectionError(nodes, edges, { source: 'rework', target: 'inspect' }), null);
  assert.deepEqual(plain(getRouteConnectivityErrors(nodes, [...edges, { id: 'rework-back', source: 'rework', target: 'inspect' }])), {});
  assert.deepEqual(plain(getRouteTopologyErrors(nodes, [])), {}, 'temporary disconnection remains editable');
  assert.ok(getRouteTopologyErrors(nodes.map(node => node.id === 'inspect' ? { ...node, data: { ...node.data, nodeType: 'BYPASS' } } : node), edges).inspect);
});

test('quick add positions avoid existing nodes in every direction and preserve existing coordinates', () => {
  const { nodes } = fromRouteGraphResponse(fixture);
  const before = plain(nodes), anchor = nodes[1];
  for (const direction of ['top', 'right', 'bottom', 'left']) {
    const point = getRouteAnchoredAddPosition(anchor, nodes, direction);
    assert.ok(Number.isFinite(point.x) && Number.isFinite(point.y));
    if (direction === 'top') assert.ok(point.y < anchor.position.y);
    if (direction === 'bottom') assert.ok(point.y > anchor.position.y);
    if (direction === 'left') assert.ok(point.x < anchor.position.x);
    if (direction === 'right') assert.ok(point.x > anchor.position.x);
  }
  assert.deepEqual(plain(nodes), before);
});

test('history snapshots are isolated, undo/redo are symmetric, and a new edit clears redo', () => {
  const history = new FlowHistory();
  const original = { nodes: [{ id: 'a', data: { label: '原节点' } }], edges: [] };
  history.record(original);
  original.nodes[0].data.label = '外部改动';
  const changed = { nodes: [{ id: 'a', data: { label: '修改后' } }], edges: [] };
  const previous = history.undo(changed);
  assert.equal(previous.nodes[0].data.label, '原节点');
  changed.nodes[0].data.label = '再次外部改动';
  assert.equal(history.redo(previous).nodes[0].data.label, '修改后');
  history.undo(changed);
  history.record(previous);
  assert.equal(history.redo(previous), undefined);
  assert.deepEqual(plain(history.counts), { undo: 1, redo: 0 });
});

test('history retains the existing 50-entry limit, resets at version boundaries and isolates editors', () => {
  const first = new FlowHistory();
  const second = new FlowHistory();
  for (let index = 0; index < 60; index++) first.record({ index });
  assert.deepEqual(plain(first.counts), { undo: 50, redo: 0 });
  for (let index = 59; index >= 10; index--) assert.equal(first.undo({ index: index + 1 }).index, index);
  assert.equal(first.undo({ index: 10 }), undefined);
  assert.deepEqual(plain(second.counts), { undo: 0, redo: 0 });
  first.reset();
  assert.deepEqual(plain(first.counts), { undo: 0, redo: 0 });
  assert.equal(first.redo({ index: 10 }), undefined);
});
