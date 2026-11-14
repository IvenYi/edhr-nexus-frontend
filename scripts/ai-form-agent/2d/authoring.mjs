import { loadDesigner, range } from '../../ai-form-feasibility/common.mjs';
import { compileLayout, intersects, physicalRect } from '../layout.mjs';
import { sourceRegions } from './source-regions.mjs';

const object = (properties, required = Object.keys(properties)) => ({ type: 'object', properties, required, additionalProperties: false });
const str = { type: 'string' };
const field = object({ slot: str, label: str, type: { enum: ['text', 'number', 'datetime', 'reference', 'signature', 'singleSelect', 'attachment', 'image'] },
  config: { type: 'object' } }, ['slot', 'label', 'type']);
const fields = { type: 'array', items: field, maxItems: 60 };
const trace = object({ item: str, slot: str });

// Compound blank sections have labels and writable space in one merged cell.
// Keep their original words, and allocate controls on the existing footprint.
function placeInline(draft, sample) {
  const placements = [], textMoves = [...(draft.textMoves ?? [])];
  const groups = Map.groupBy(draft.fields, field => field.range === 'inline' ? field.source : '');
  for (const [source, fields] of groups) {
    if (!source) { placements.push(...fields); continue; }
    const original = sample.input.cells.find(cell => cell.address === source);
    if (!original || textMoves.some(move => move.source === source)) throw new Error('inline需要有效且未手动拆分的原标签：' + source);
    const cell = range(source);
    const bounds = sample.page.sheet.rowHeights[cell.t - 1] >= 96
      ? { ...cell, r: sample.page.sheet.columnCount }
      : sample.page.mergedCells.find(merged => cell.t === merged.t && cell.l === merged.l) ?? cell;
    const rect = physicalRect(bounds, null, sample.page);
    if (rect.h >= 96) {
      const header = Math.min(.35, Math.max(.17, 50 / rect.h));
      const height = (1 - header) / fields.length;
      textMoves.push({ source, parts: [{ text: original.text.replace(/\n\s*\n/g, '\n').trim(), range: bounds, box: { x: 0, y: 0, w: 1, h: header } }] });
      placements.push(...fields.map((field, i) => ({ ...field, range: bounds, box: { x: 0, y: header + i * height, w: 1, h: height } })));
    } else {
      const division = .52;
      const width = (1 - division) / fields.length;
      textMoves.push({ source, parts: [{ text: original.text, range: bounds, box: { x: 0, y: 0, w: division, h: 1 } }] });
      placements.push(...fields.map((field, i) => ({ ...field, range: bounds, box: { x: division + i * width, y: 0, w: width, h: 1 } })));
    }
  }
  return { ...draft, fields: placements, textMoves };
}

function foldTable(model, page, draft, designer, originalPage) {
  const children = page.nodes.filter(node => draft.columns.some(column => column.key === node.bindings.fieldId));
  const region = range(draft.region), geometry = physicalRect(region, null, originalPage);
  const boundaries = sizes => sizes.reduce((list, size) => [...list, list.at(-1) + size], [0]);
  const y = boundaries(page.sheet.rowHeights), x = boundaries(page.sheet.columnWidths);
  const index = (axis, value) => axis.findIndex(point => Math.abs(point - value) < .003);
  const native = { t: index(y, geometry.y) + 1, b: index(y, geometry.y + geometry.h), l: index(x, geometry.x) + 1, r: index(x, geometry.x + geometry.w) };
  const repeat = region.b - region.t + 1;
  if (!native.t || !native.l || native.b - native.t + 1 !== repeat || children.some(node => {
    const target = node.style.cellRange;
    return target.t !== native.t || target.b !== native.t || target.l < native.l || target.r > native.r;
  })) throw new Error('子表列必须在明细区域首行占完整单元格');
  const columns = draft.columns.map(column => model.fields.find(item => item.id === column.key));
  model.fields = model.fields.filter(item => !columns.includes(item));
  const parent = { ...designer.getFieldTypeDefinition('subTable').defaultField(draft.label, model.fields.length + 1),
    id: draft.key, code: draft.key, groupId: 'default-group', typeConfig: { columns } };
  model.fields.push(parent);
  const nodeId = 'ai-' + draft.key;
  for (const child of children) {
    child.parentId = nodeId;
    child.bindings = { ...child.bindings, subTableId: draft.key, subTableFieldId: child.bindings.fieldId };
  }
  page.nodes = page.nodes.filter(node => !children.includes(node));
  page.nodes.push({ id: nodeId, type: 'sub-table', children, parentId: null, props: { label: draft.label }, style: { cellRange: native },
    bindings: { fieldId: draft.key, subTableRegion: { id: nodeId, fieldId: draft.key, mode: 'record', ranges: [{ pageId: page.id, range: native, order: 1 }],
      repeat: { type: 'fixed', count: repeat, stride: 1 }, recordTemplate: { direction: 'row', anchor: { row: native.t, col: native.l },
        fields: children.map(child => ({ fieldId: child.bindings.fieldId, rowOffset: 0, colOffset: child.style.cellRange.l - native.l,
          rowSpan: 1, colSpan: child.style.cellRange.r - child.style.cellRange.l + 1 })) },
      presentation: { showHeader: false, showIndex: false, emptyText: '', addEntry: 'bottom' } } } });
}

export async function createSampleAuthoring(sample) {
  const designer = await loadDesigner();
  const regions = sourceRegions(sample);
  return {
    tool: {
      description: '按空白表单区域建表。每个区域slot最多配置一个字段，选择label、type及可选config。重复明细自动生成子表。追溯项用目录item和字段slot关联。',
      parameters: object({ name: str, fields, trace: { type: 'array', items: trace } }, ['name', 'fields']),
    },
    compile(input) {
      const slots = new Map(regions.map(region => [region.slot, region]));
      const chosen = input.fields.map(field => {
        const region = slots.get(field.slot);
        if (!region) throw new Error('未知原表区域：' + field.slot);
        return { ...field, ...region, key: field.slot };
      });
      const columns = chosen.filter(field => field.table);
      const tables = columns.length ? [{ key: 'material_lines', label: '物料明细', region: 'A18:H32', columns }] : [];
      const draft = placeInline({ ...input, fields: chosen.filter(field => !field.table) }, sample);
      for (const entry of tables) {
        if (!/^[A-Za-z][A-Za-z0-9_]{0,63}$/.test(entry.key) || !entry.columns.length || [...draft.fields, ...entry.columns].some(item => item.key === entry.key)) throw new Error('子表身份或列无效');
        const rect = physicalRect(entry.region, null, sample.page);
        if (draft.fields.some(item => intersects(rect, physicalRect(item.range, item.box, sample.page)))) throw new Error('子表区域覆盖了主表字段');
      }
      const compiled = compileLayout({ ...draft, fields: [...draft.fields, ...tables.flatMap(entry => entry.columns)] }, sample, designer, {});
      if (compiled.errors.length) throw new Error(compiled.errors.slice(0, 8).join('；'));
      const { model, canvas } = compiled.document;
      for (const entry of tables) foldTable(model, canvas.pages[0], entry, designer, sample.page);
      const scopes = new Map();
      for (const entry of draft.trace ?? []) {
        const key = entry.slot;
        const scope = slots.get(key)?.table ?? '';
        const scoped = scope ? model.fields.find(item => item.id === scope && item.type === 'subTable')?.typeConfig.columns : model.fields;
        if (!scoped?.some(item => item.id === key)) throw new Error('追溯字段未配置：' + key);
        if (!scopes.has(scope)) scopes.set(scope, new Map());
        const mapping = scopes.get(scope);
        if (mapping.has(entry.item)) throw new Error('同一范围内查找项重复：' + entry.item);
        mapping.set(entry.item, key);
      }
      model.projection = { version: 'form-projection-v1', bindings: [...scopes].map(([scope, mapping], i) => ({
        id: 'trace-' + (i + 1), enabled: true, modelId: 'formTrace', ...(scope ? { tableId: scope } : {}), sources: Object.fromEntries(mapping),
      })) };
      return { ...designer.serializeTemplateDesignerDocument(compiled.document), name: draft.name, categoryName: 'AI隔离验证' };
    },
  };
}
