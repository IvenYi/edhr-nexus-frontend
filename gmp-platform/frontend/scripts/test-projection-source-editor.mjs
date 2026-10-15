import assert from 'node:assert/strict';
import { test } from 'node:test';
import { build } from 'esbuild';
import { createRequire } from 'node:module';
import { mkdtemp, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const tempDir = await mkdtemp(path.join(os.tmpdir(), 'projection-source-editor-'));
const outfile = path.join(tempDir, 'editor.cjs');
await build({ stdin: { contents: `
  import React from 'react';
  import { renderToStaticMarkup } from 'react-dom/server';
  import ProjectionSourceEditor from './src/pages/master-data/template-designer-react/components/ProjectionSourceEditor';
  import StatisticsProjectionConfig from './src/pages/master-data/template-designer-react/components/StatisticsProjectionConfig';
  import FieldProjectionConfig from './src/pages/master-data/template-designer-react/components/FieldProjectionConfig';
  import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
  export { acceptsProjectionAttribute, projectionConfigurationProblems, projectionBindingLabel, projectionSourceRoles, projectionSourceCandidates } from './src/pages/master-data/template-designer-react/utils/projectionConfiguration';
  import { useTemplateDesignerStore as store } from './src/pages/master-data/template-designer-react/store/useTemplateDesignerStore';
  export function renderEditor(model, binding, definition, showErrors = false) {
    store.getState().setDocument({ meta: {}, model, canvas: { pages: [] }, workflow: { nodes: [], edges: [], config: {} } });
    // SSR must read the loaded document rather than the store's empty creation snapshot.
    store.getInitialState().document = store.getState().document;
    const changes = [];
    const html = renderToStaticMarkup(React.createElement(ProjectionSourceEditor, { binding, definition, showErrors, onChange: patch => changes.push(patch) }));
    return { html, changes };
  }
  export function renderPanel(model, catalog, field, tableId) {
    store.getState().setDocument({ meta: {}, model, canvas: { pages: [] }, workflow: { nodes: [], edges: [], config: {} } });
    store.getInitialState().document = store.getState().document;
    const query = new QueryClient(); query.setQueryData(['form-projection-catalog'], catalog);
    const panel = field ? React.createElement(FieldProjectionConfig, {field, tableId}) : React.createElement(StatisticsProjectionConfig, {tableId});
    return renderToStaticMarkup(React.createElement(QueryClientProvider, {client: query}, panel));
  }
`, resolveDir: fileURLToPath(new URL('..', import.meta.url)), loader: 'tsx' }, outfile, bundle: true, format: 'cjs', platform: 'node', mainFields: ['module', 'main'], logLevel: 'silent',
  alias: { '@': fileURLToPath(new URL('../src', import.meta.url)), '@mui/icons-material': fileURLToPath(new URL('../node_modules/@mui/icons-material/esm', import.meta.url)) } });
const { renderEditor, renderPanel, acceptsProjectionAttribute, projectionConfigurationProblems, projectionBindingLabel, projectionSourceRoles, projectionSourceCandidates } = createRequire(import.meta.url)(outfile);
await rm(tempDir, { recursive: true, force: true });

const lot = { id: 'lot', name: '供应商批号输入', type: 'text', typeConfig: {} };
const model = { groups: [], fields: [lot, { id: 'equipment', name: '设备编号输入', type: 'text', typeConfig: {} }] };
const definition = { id: 'formTrace', name: '追溯', attributes: [
  { id: 'supplierLot', name: '供应商批号（外部）', type: 'text' },
  { id: 'equipment', name: '设备编号', type: 'text' },
  { id: 'order', name: '工单编号', type: 'text' },
] };

test('trace source editor shows its assigned meaning without expanding unrelated catalog entries', () => {
  const { html, changes } = renderEditor(model, { id: 'trace', modelId: 'formTrace', enabled: true, sources: { supplierLot: 'lot' } }, definition);
  assert.ok(html.includes('供应商批号（外部）'));
  assert.ok(html.includes('添加追溯项'));
  assert.ok(!html.includes('设备编号'));
  assert.ok(!html.includes('工单编号'));
  assert.deepEqual(changes, [], 'rendering must not rewrite existing mappings');
});

test('output source may share one quality field without conflating good and rejected quantities', () => {
  const qty = { id: 'qty', name: '本次产出', type: 'number', typeConfig: {} };
  const model = { fields: [qty], projection: { bindings: [] } };
  const definition = { id: 'production', attributes: ['outputQuantity', 'goodQuantity', 'ngQuantity'].map(id => ({ id, name: id, type: 'number' })) };
  const binding = { id: 'p', enabled: true, modelId: 'production', sources: { goodQuantity: 'qty' } };
  assert.equal(projectionSourceCandidates(model, binding, definition.attributes[0]).length, 1);
  assert.equal(projectionSourceCandidates(model, binding, definition.attributes[2]).length, 0);
  binding.sources.outputQuantity = 'qty';
  assert.deepEqual(projectionConfigurationProblems(model, binding, definition), []);
  binding.sources.ngQuantity = 'qty';
  assert.ok(projectionConfigurationProblems(model, binding, definition).some(problem => problem.message.includes('不能使用同一个')));
});

test('report roles accept only compatible temporal and person sources, with manually supplied hours', () => {
  const date = {id: 'date', type: 'datetime', typeConfig: {mode: 'date'}};
  const period = {...date, typeConfig: {mode: 'datetime'}};
  assert.equal(acceptsProjectionAttribute(date, {id: 'productionDate', type: 'date'}), true);
  assert.equal(acceptsProjectionAttribute(period, {id: 'productionDate', type: 'date'}), false);
  assert.equal(acceptsProjectionAttribute(period, {id: 'reportStartTime', type: 'datetime'}), true);
  assert.equal(acceptsProjectionAttribute({...date, typeConfig: {mode: 'time'}}, {id: 'reportStartTime', type: 'datetime'}), false);
  const reporter = {id: 'reporter', type: 'text', referenceSources: ['user']};
  assert.equal(acceptsProjectionAttribute({type: 'reference', typeConfig: {sourceType: 'user'}}, reporter), true);
  assert.equal(acceptsProjectionAttribute({type: 'reference', typeConfig: {sourceType: 'equipment'}}, reporter), false);
  assert.equal(acceptsProjectionAttribute({type: 'signature'}, reporter), true);
  assert.equal(acceptsProjectionAttribute({type: 'text'}, reporter), false);
  assert.equal(acceptsProjectionAttribute({type: 'singleSelect'}, reporter), false);
  assert.equal(acceptsProjectionAttribute({type: 'signature', status: 'disabled'}, reporter), false);
  const hours = {id: 'workHours', name: '投入工时（人时）', type: 'number'};
  const qty = {id: 'goodQuantity', name: '良品数量', type: 'number'};
  const fields = [{id: 'n', name: '数量', type: 'number', typeConfig: {}}, {id: 'h', name: '人时', type: 'number', typeConfig: {}}];
  const binding = {id: 'p', modelId: 'production', sources: {goodQuantity: 'n', workHours: 'h'}};
  const {html} = renderEditor({fields}, binding, {id: 'production', attributes: [qty, hours, {id: 'productionDate', name: '生产日期', type: 'date'}]});
  assert.ok(html.includes('投入工时（人时）'));
  assert.ok(!html.includes('由填报人员填写，不自动计算'));
  assert.ok(!html.includes('报工信息（可选）'));
  assert.ok(!html.includes('生产日期'));
  assert.ok(html.includes('更多业务字段'));
  assert.equal((html.match(/role="combobox"/g) ?? []).length, 2, 'configured hours stay visible while the unconfigured date is collapsed');
  assert.equal(acceptsProjectionAttribute(date, hours), false);
});

test('a removed trace definition keeps its original source visible and removable', () => {
  const { html, changes } = renderEditor(model, { id: 'trace', modelId: 'formTrace', enabled: false, sources: { removedMeaning: 'lot' } }, definition);
  assert.ok(html.includes('追溯项或业务信息已失效'));
  assert.ok(html.includes('供应商批号输入'));
  assert.ok(html.includes('移除'));
  assert.deepEqual(changes, [], 'an unknown meaning must not be remapped automatically');
});

test('a removed field keeps its assigned meaning and explicit invalid-source warning', () => {
  const { html, changes } = renderEditor(model, { id: 'trace', modelId: 'formTrace', enabled: false, sources: { supplierLot: 'deletedField' } }, definition);
  assert.ok(html.includes('供应商批号（外部）'));
  assert.ok(html.includes('来源已失效，请重新选择'));
  assert.ok(html.includes('的来源已失效，请重新选择'));
  assert.deepEqual(changes, []);
});

const consumption = { id: 'consumption', name: '实际物料消耗', attributes: [
  { id: 'material', name: '物料', type: 'reference' }, { id: 'quantity', name: '数量', type: 'number' },
  { id: 'unit', name: '单位', type: 'text' }, { id: 'materialLotText', name: '物料批号', type: 'text' },
] };
const material = { id: 'material', name: '投料物料', type: 'reference', typeConfig: {sourceType: 'material'} };
const quantity = { id: 'qty', name: '实际投料量', type: 'number', typeConfig: {} };
const usage = { id: 'use', modelId: 'consumption', enabled: false, sources: {} };

test('save feedback identifies and marks each required source, including an unfinished usage', () => {
  const model = {fields: [material, quantity]};
  assert.deepEqual(projectionConfigurationProblems(model, usage, consumption).map(p => p.attributeId), ['material', 'quantity']);
  const {html} = renderEditor(model, usage, consumption, true);
  assert.ok(html.includes('请选择“物料”的来源字段'));
  assert.ok(html.includes('请选择“数量”的来源字段'));
  assert.equal((html.match(/aria-invalid="true"/g) ?? []).length, 2);
  assert.deepEqual(projectionConfigurationProblems(model, {...usage, sources: {material: 'material', quantity: 'qty'}}, consumption), []);
});

test('repeat quantities identify the source while different models and shared dimensions stay allowed', () => {
  const first = {...usage, sources: {material: 'material', quantity: 'qty'}};
  const second = {...first, id: 'second'};
  const model = {fields: [material, quantity], projection: {bindings: [first, second]}};
  assert.ok(projectionConfigurationProblems(model, first, consumption).some(p => p.attributeId === 'quantity' && p.message.includes('实际投料量')));
  second.modelId = 'scrap';
  assert.deepEqual(projectionConfigurationProblems(model, first, consumption), []);
  second.modelId = 'consumption'; second.sources = {material: 'material', quantity: 'otherQty'};
  model.fields.push({...quantity, id: 'otherQty'});
  assert.deepEqual(projectionConfigurationProblems(model, first, consumption), [], 'material dimension may be shared by two independent quantities');
});

test('same field cannot fill two roles inside one business and invalid optional sources remain locatable', () => {
  const binding = {...usage, sources: {material: 'material', quantity: 'qty', unit: 'lot', materialLotText: 'lot'}};
  const problems = projectionConfigurationProblems({fields: [material, quantity, lot]}, binding, consumption);
  assert.equal(problems.filter(p => p.message.includes('同一个来源')).length, 2);
  binding.sources.unit = 'removed';
  assert.ok(projectionConfigurationProblems({fields: [material, quantity, lot]}, binding, consumption).some(p => p.attributeId === 'unit' && p.message.includes('单位')));
});

test('collapsed business cards and each trace assignment expose consistent removal icons', () => {
  const model = {fields: [lot], projection: {bindings: [usage]}};
  const html = renderPanel(model, {models: [consumption]}, null);
  assert.ok(html.includes('业务统计 · 主表'));
  assert.ok(html.includes('aria-label="移除消耗明细 1配置"'));
  assert.ok(html.includes('DeleteOutlinedIcon'));
  assert.ok(!html.includes('移除这项用途'));
  const traceModel = {...definition, attributes: definition.attributes.slice(0, 2)};
  model.projection.bindings = [
    {id: 'one', modelId: 'formTrace', enabled: true, sources: {supplierLot: 'lot'}},
    {id: 'two', modelId: 'formTrace', enabled: true, sources: {equipment: 'lot'}},
  ];
  const traceHtml = renderPanel(model, {models: [traceModel]}, lot);
  assert.ok(traceHtml.includes('aria-label="移除供应商批号（外部）关联"'));
  assert.ok(traceHtml.includes('aria-label="移除设备编号关联"'));
});

test('main details identify each source role and selected-field participation without changing mappings', () => {
  const first = {...usage, sources: {material: material.id, quantity: quantity.id}};
  const secondQuantity = {...quantity, id: 'qty2', name: '第二份实际用量'};
  const second = {...usage, id: 'use2', sources: {material: material.id, quantity: secondQuantity.id}};
  const model = {fields: [material, quantity, secondQuantity, lot], projection: {bindings: [first, second]}};
  const before = JSON.stringify(model);
  assert.equal(projectionBindingLabel(model, first, consumption), '消耗明细 1');
  assert.equal(projectionBindingLabel(model, second, consumption), '消耗明细 2');
  assert.deepEqual(projectionSourceRoles(model, second, consumption), [
    {id: 'material', role: '物料', field: '投料物料'}, {id: 'quantity', role: '数量', field: '第二份实际用量'},
  ]);
  const html = renderPanel(model, {models: [consumption]}, quantity);
  assert.ok(html.includes('当前字段作为数量'));
  assert.ok(html.includes('消耗明细 2'), 'field view shows the same existing main-form configurations');
  assert.equal((html.match(/当前字段作为/g) ?? []).length, 1, 'participation is marked only on the corresponding record');
  assert.ok(!html.includes('配置主表业务统计'));
  const main = renderPanel(model, {models: [consumption]}, null);
  assert.ok(main.includes('添加消耗明细'));
  assert.ok(!main.includes('role="combobox"'), 'same-purpose detail does not require selecting the purpose again');
  assert.equal(JSON.stringify(model), before);
});

test('main field directly offers statistical purposes without a separate configuration panel', () => {
  const model = {fields: [material, quantity, lot], projection: {bindings: []}};
  const before = JSON.stringify(model);
  const html = renderPanel(model, {models: [consumption, definition]}, lot);
  assert.ok(html.includes('关联追溯项（可选）'));
  assert.ok(html.includes('业务统计 · 主表'));
  assert.ok(html.includes('主表统计什么'));
  assert.ok(!html.includes('当前字段尚未参与统计'));
  assert.ok(!html.includes('配置主表业务统计'));
  assert.equal(JSON.stringify(model), before, 'showing purposes must not bind the selected field');
});

test('subtable column keeps the whole-table configuration entry instead of inline main statistics', () => {
  const model = {fields: [{id: 'table', name: '上料明细', type: 'subTable', typeConfig: {columns: [material, quantity]}}],
    projection: {bindings: [{...usage, tableId: 'table', sources: {material: material.id, quantity: quantity.id}}]}};
  const html = renderPanel(model, {models: [consumption]}, material, 'table');
  assert.ok(html.includes('整张子表的业务统计'));
  assert.ok(html.includes('本列作为物料'));
  assert.ok(!html.includes('业务统计 · 主表'));
  assert.ok(!html.includes('主表统计什么'));
});

test('configured subtable preserves multiple existing purposes but defers adding others', () => {
  const first = {...usage, tableId: 'table', sources: {material: material.id, quantity: quantity.id}};
  const scrap = {...consumption, id: 'scrap', name: '报废记录'};
  const model = {fields: [{id: 'table', name: '清线明细', type: 'subTable', typeConfig: {columns: [material, quantity]}}],
    projection: {bindings: [first, {...first, id: 'scrap', modelId: 'scrap'}]}};
  const before = JSON.stringify(model);
  const html = renderPanel(model, {models: [consumption, scrap]}, null, 'table');
  assert.ok(html.includes('实际物料消耗'));
  assert.ok(html.includes('报废记录'));
  assert.ok(html.includes('其他统计用途'));
  assert.ok(!html.includes('role="combobox"'), 'configured table has no always-visible add-purpose selector');
  assert.equal(JSON.stringify(model), before, 'simplifying entry points must preserve every existing mapping');
});

test('configured report fields stay visible while empty optional fields are collapsed, preserving mappings', () => {
  const definition = {...consumption, attributes: [...consumption.attributes, {id: 'reason', name: '原因', type: 'text'}]};
  const binding = {...usage, sources: {material: 'material', quantity: 'qty', reason: 'lot'}};
  const fields = [material, quantity, lot];
  const {html, changes} = renderEditor({fields}, binding, definition);
  assert.ok(!html.includes('补充信息（可选）'));
  assert.ok(html.includes('原因'));
  assert.ok(html.includes('更多业务字段'));
  assert.ok(html.includes('aria-expanded="false"'));
  assert.ok(!html.includes('物料批号'));
  assert.equal((html.match(/role="combobox"/g) ?? []).length, 3, 'required sources and the configured reason are visible');
  assert.deepEqual(changes, []);
  const invalid = renderEditor({fields}, {...binding, sources: {...binding.sources, reason: 'removed'}}, definition, true).html;
  assert.ok(invalid.includes('“原因”的来源已失效'));
  assert.ok(invalid.includes('aria-invalid="true"'));
});

test('production instructions describe quantities rather than material lots, and add belongs to the purpose heading', () => {
  const production = {id: 'production', name: '生产报工', attributes: [
    {id: 'goodQuantity', name: '良品数量', type: 'number'}, {id: 'ngQuantity', name: '不良品数量', type: 'number'},
    {id: 'unit', name: '单位', type: 'text'}, {id: 'teamText', name: '责任班组', type: 'text'},
  ]};
  const binding = {id: 'p', modelId: 'production', enabled: true, sources: {goodQuantity: 'qty'}};
  const {html} = renderEditor({fields: [quantity]}, binding, production);
  assert.ok(html.includes('aria-label="来源配置说明"'));
  assert.ok(!html.includes('明细中另外显示'));
  assert.ok(!html.includes('明细展示字段说明'));
  assert.equal((html.match(/role="combobox"/g) ?? []).length, 2, 'both alternative quantity sources remain visible');
  assert.ok(!html.includes('单位可不填'));
  assert.ok(!html.includes('物料批号'));
  assert.ok(!html.includes('添加原因、分类'));
  const panel = renderPanel({fields: [quantity], projection: {bindings: [binding]}}, {version: 1, models: [production]});
  assert.ok(panel.includes('aria-label="添加报工记录"'));
  assert.match(panel, /aria-expanded="true"[^>]*>[\s\S]*?生产报工/);
  assert.ok(panel.indexOf('aria-label="添加报工记录"') < panel.indexOf('移除报工记录 1配置'));
});

test('canvas and dropdown candidates share type, region, disabled and occupied-role constraints', () => {
  const local = {fields: [material, quantity, lot, {...quantity, id:'disabled', status:'disabled'},
    {id:'table', type:'subTable', typeConfig:{columns:[{...quantity,id:'column'}]}}]};
  const quantityAttribute = consumption.attributes.find(item => item.id === 'quantity');
  assert.deepEqual(projectionSourceCandidates(local, usage, quantityAttribute).map(f=>f.id), [quantity.id]);
  assert.deepEqual(projectionSourceCandidates(local, {...usage, sources:{other:quantity.id}}, quantityAttribute), []);
  assert.deepEqual(projectionSourceCandidates(local, {...usage, tableId:'table'}, quantityAttribute).map(f=>f.id), ['column']);
  assert.deepEqual(projectionSourceCandidates(local, usage, consumption.attributes.find(item=>item.id==='material')).map(f=>f.id), [material.id]);
});

test('business-specific labels count records within each business without changing identities', () => {
  const a={...usage,id:'a'}, b={...usage,id:'b',modelId:'scrap'}, c={...usage,id:'c',modelId:'production'}, d={...usage,id:'d'};
  const model={fields:[],projection:{bindings:[a,b,c,d]}};
  assert.equal(projectionBindingLabel(model,a,consumption),'消耗明细 1');
  assert.equal(projectionBindingLabel(model,b,{id:'scrap',name:'报废记录'}),'报废明细 1');
  assert.equal(projectionBindingLabel(model,c,{id:'production',name:'生产报工'}),'报工记录 1');
  assert.equal(projectionBindingLabel(model,d,consumption),'消耗明细 2');
  assert.deepEqual(model.projection.bindings.map(item=>item.id),['a','b','c','d']);
});

test('trace editor offers no additional meaning when every compatible source is already used', () => {
  const { html, changes } = renderEditor({ groups: [], fields: [lot] }, { id: 'trace', modelId: 'formTrace', enabled: true, sources: { supplierLot: 'lot' } }, definition);
  assert.ok(!html.includes('添加追溯项'));
  assert.ok(html.includes('供应商批号（外部）'));
  assert.deepEqual(changes, []);
});

test('trace accepts compatible native sources while statistics and unrelated meanings keep their boundaries', () => {
  const batch = { id: 'batch', name: '生产批次选择', type: 'reference', typeConfig: { sourceType: 'productionBatch' } };
  const meaning = { id: 'lookup_production_batch', name: '生产批次号', type: 'text', referenceSources: ['productionBatch'] };
  assert.equal(acceptsProjectionAttribute(batch, meaning), true);
  assert.equal(acceptsProjectionAttribute(lot, meaning), true);
  assert.equal(acceptsProjectionAttribute(batch, { ...meaning, referenceSources: ['material'] }), false);
  assert.equal(acceptsProjectionAttribute(batch, { id: 'custom', type: 'text' }), false);
  assert.equal(acceptsProjectionAttribute(batch, { id: 'quantity', type: 'number' }), false);
  assert.equal(acceptsProjectionAttribute(batch, { id: 'material', type: 'reference' }), false);
  const { html, changes } = renderEditor({ fields: [batch] }, { id: 'trace', modelId: 'formTrace', enabled: true, sources: { lookup_production_batch: 'batch' } }, { id: 'formTrace', attributes: [meaning] });
  assert.ok(html.includes('生产批次选择'));
  assert.ok(!html.includes('类型不匹配'));
  assert.deepEqual(changes, []);
});

test('typed custom trace meanings offer only matching number or date sources', () => {
  const reading = {id: 'reading', name: '实测温度', type: 'number', typeConfig: {}};
  const day = {id: 'day', name: '检验日期', type: 'datetime', typeConfig: {mode: 'date'}};
  const period = {...day, id: 'period', typeConfig: {mode: 'datetime'}};
  const attributes = [
    {id: 'lookup_reading', name: '检测值', type: 'number'},
    {id: 'lookup_day', name: '检测日期', type: 'date'},
  ];
  const local = {groups: [], fields: [reading, day, period, lot]};
  const binding = {id: 'trace', modelId: 'formTrace', enabled: true, sources: {}};
  assert.deepEqual(projectionSourceCandidates(local, binding, attributes[0]).map(field => field.id), ['reading']);
  assert.deepEqual(projectionSourceCandidates(local, binding, attributes[1]).map(field => field.id), ['day']);
  assert.equal(acceptsProjectionAttribute({type: 'reference', typeConfig: {sourceType: 'serialNumber'}}, {id: 'lookup_custom', type: 'text'}), false);
  const html = renderPanel(local, {models: [{id: 'formTrace', name: '追溯', attributes}]}, day);
  assert.ok(html.includes('关联追溯项'));
  assert.ok(!html.includes('暂无适合此字段类型的追溯项'));
});

test('whole-table statistics keeps optional sources collapsed without a manual row identity or extra display selector', () => {
  const columns = [lot, { id: 'qty', name: '实际用量', type: 'number', typeConfig: {} },
    { id: 'material', name: '物料', type: 'reference', typeConfig: { sourceType: 'material' } }];
  const definition = { id: 'consumption', name: '实际物料消耗', attributes: [
    { id: 'material', name: '物料', type: 'reference' }, { id: 'quantity', name: '数量', type: 'number' },
    { id: 'materialLotText', name: '物料批号', type: 'text' }, { id: 'unit', name: '单位', type: 'text' },
  ] };
  const { html, changes } = renderEditor({ fields: [{ id: 'table', name: '上料明细', type: 'subTable', typeConfig: { columns } }] },
    { id: 'c', modelId: 'consumption', tableId: 'table', enabled: true, sources: { material: 'material', quantity: 'qty' } }, definition);
  assert.ok(!html.includes('每行唯一字段'));
  assert.ok(!html.includes('启用此用途'));
  assert.ok(!html.includes('待配置'));
  assert.ok(!html.includes('明细中另外显示'));
  assert.ok(html.includes('更多业务字段'));
  assert.equal((html.match(/role="combobox"/g) ?? []).length, 2);
  assert.deepEqual(changes, []);
  assert.equal(acceptsProjectionAttribute({ type: 'reference', typeConfig: { sourceType: 'dictionary' } }, { id: 'unit', type: 'text' }), true);
});

test('removing the extra display selector preserves valid saved columns and keeps invalid ones explicitly repairable', () => {
  const fields = [material, quantity, lot];
  const binding = {...usage, sources: {material: material.id, quantity: quantity.id}, detailFieldIds: [lot.id]};
  const before = JSON.stringify(binding);
  const valid = renderEditor({fields}, binding, consumption);
  assert.ok(!valid.html.includes('明细中另外显示'));
  assert.ok(!valid.html.includes('移除失效的补充展示配置'));
  assert.deepEqual(valid.changes, []);
  assert.equal(JSON.stringify(binding), before);
  for (const showErrors of [false, true]) {
    const invalid = renderEditor({fields}, {...binding, detailFieldIds: ['deleted']}, consumption, showErrors);
    assert.ok(invalid.html.includes('aria-label="移除失效的补充展示配置"'));
    assert.ok(invalid.html.includes('请移除失效的配置'));
    assert.deepEqual(invalid.changes, [], 'a stale mapping needs an explicit user action');
  }
});
