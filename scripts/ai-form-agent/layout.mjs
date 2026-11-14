import { range } from './common.mjs';
const sum = (a, start, end) => a.slice(start, end).reduce((n, v) => n + v, 0);
const normalizeText = s => String(s).replace(/\s+/g, '');
export const intersects = (a, b) => a.x < b.x + b.w - 0.01 && a.x + a.w > b.x + 0.01 && a.y < b.y + b.h - 0.01 && a.y + a.h > b.y + 0.01;
export function physicalRect(address, box, page) {
  const r = typeof address === 'string' ? range(address) : address;
  if (r.t > r.b || r.l > r.r || r.t < 1 || r.l < 1 || r.b > page.sheet.rowCount || r.r > page.sheet.columnCount) throw new Error('范围超出原表：' + JSON.stringify(address));
  const b = box ?? { x: 0, y: 0, w: 1, h: 1 };
  if (![b.x, b.y, b.w, b.h].every(Number.isFinite) || b.x < 0 || b.y < 0 || b.w <= 0 || b.h <= 0 || b.x + b.w > 1.00001 || b.y + b.h > 1.00001) throw new Error('box必须在0..1范围内');
  const w = sum(page.sheet.columnWidths, r.l - 1, r.r), h = sum(page.sheet.rowHeights, r.t - 1, r.b);
  return { x: sum(page.sheet.columnWidths, 0, r.l - 1) + w * b.x, y: sum(page.sheet.rowHeights, 0, r.t - 1) + h * b.y, w: w * b.w, h: h * b.h };
}

// Fractional placement is materialized as real native rows/columns; renderer sees cellRange only.
export function compileLayout(draft, sample, designer, lookupItems) {
  const original = structuredClone(sample.page), errors = [], keys = new Set();
  for (const [axis, property] of [['rows', 'rowHeights'], ['columns', 'columnWidths']]) {
    for (const [index, size] of Object.entries(draft.gridAdjustments?.[axis] ?? {})) {
      if (!/^[1-9]\d*$/.test(index) || Number(index) > original.sheet[property].length || !Number.isFinite(size) || size < 20 || size > 2000) errors.push('非法网格尺寸：' + axis + '/' + index);
      else original.sheet[property][Number(index) - 1] = size;
    }
  }
  const moves = new Map((draft.textMoves ?? []).map(m => [m.source, m.parts]));
  if (moves.size !== (draft.textMoves ?? []).length) errors.push('同一原文只能拆分一次');
  const sourceText = new Map(sample.input.cells.map(c => [c.address, c.text]));
  const texts = [], fields = [], fieldRects = [];
  for (const source of moves.keys()) if (!sourceText.has(source)) errors.push('未知原文来源：' + source);
  for (const cell of sample.input.cells) {
    const point = range(cell.address);
    const merged = original.mergedCells.find(m => point.t >= m.t && point.t <= m.b && point.l >= m.l && point.l <= m.r) ?? point;
    const parts = moves.get(cell.address);
    if (parts && normalizeText(parts.map(p => p.text).join('')) !== normalizeText(cell.text)) errors.push(cell.address + ': 拆分后必须完整保留原文字及顺序');
    for (const part of parts ?? [{ text: cell.text, range: merged }]) {
      try { texts.push({ source: cell.address, text: part.text, rect: physicalRect(part.range, part.box, original) }); }
      catch (e) { errors.push(e.message); }
    }
  }
  const allowed = ['text', 'number', 'datetime', 'reference', 'signature', 'attachment', 'image', 'singleSelect'];
  for (const [i, a] of texts.entries()) for (const b of texts.slice(i + 1)) if (intersects(a.rect, b.rect)) errors.push('原文位置重叠：' + a.source + '/' + b.source);
  for (const [index, f] of (draft.fields ?? []).entries()) {
    if (!/^[A-Za-z][A-Za-z0-9_]{0,63}$/.test(f.key) || keys.has(f.key)) { errors.push('字段key无效或重复：' + f.key); continue; }
    keys.add(f.key);
    if (!allowed.includes(f.type)) { errors.push('不支持类型：' + f.type); continue; }
    if (!sourceText.has(f.source)) errors.push(f.key + ': source不是原表标签');
    try {
      const rect = physicalRect(f.range, f.box, original);
      if (rect.w < 24 || rect.h < 20) errors.push(f.key + ': 输入位置过小（最小24×20像素）');
      for (const other of fieldRects) if (intersects(rect, other.rect)) errors.push(f.key + ': 与字段 ' + other.key + ' 重叠');
      for (const label of texts) if (intersects(rect, label.rect)) errors.push(f.key + ': 与原文 ' + label.source + ' 重叠；请换位置或textMoves保留原文后拆分');
      fieldRects.push({ key: f.key, rect });
      const def = designer.getFieldTypeDefinition(f.type), field = def.defaultField(f.label, index + 1);
      Object.assign(field, { id: f.key, code: f.key, groupId: 'default-group', typeConfig: { ...field.typeConfig, ...(f.config ?? {}) } });
      fields.push(field);
    } catch (e) { errors.push(e.message); }
  }
  if (!fields.length) errors.push('未生成字段');
  const bindings = (draft.bindings ?? []).map((b, i) => {
    for (const key of Object.values(b.sources ?? {})) if (!keys.has(key)) errors.push('用途引用不存在字段：' + key);
    return { id: 'binding-' + (i + 1), enabled: true, modelId: b.modelId, sources: b.sources };
  });
  if (errors.length) return { errors: [...new Set(errors)] };
  const boundaries = sizes => { const a = [0]; sizes.forEach(v => a.push(a.at(-1) + v)); return a; };
  const x = boundaries(original.sheet.columnWidths), y = boundaries(original.sheet.rowHeights);
  for (const { rect: r } of [...texts, ...fieldRects]) { x.push(r.x, r.x + r.w); y.push(r.y, r.y + r.h); }
  const unique = a => [...new Set(a.map(v => Math.round(v * 1000) / 1000))].sort((a, b) => a - b);
  const xs = unique(x), ys = unique(y);
  const at = (a, v) => a.findIndex(n => Math.abs(n - v) < 0.002);
  const nativeRange = r => ({ l: at(xs, r.x) + 1, r: at(xs, r.x + r.w), t: at(ys, r.y) + 1, b: at(ys, r.y + r.h) });
  const page = structuredClone(original);
  page.sheet.columnWidths = xs.slice(1).map((v, i) => v - xs[i]); page.sheet.columnCount = xs.length - 1;
  page.sheet.rowHeights = ys.slice(1).map((v, i) => v - ys[i]); page.sheet.rowCount = ys.length - 1;
  page.cells = {}; page.mergedCells = []; page.nodes = [];
  // Transfer styles and outer borders without retaining an obstructing original merge.
  for (const [key, cell] of Object.entries(original.cells)) {
    const [row, col] = key.split(':').map(Number), r = nativeRange(physicalRect({ t: row, b: row, l: col, r: col }, null, original));
    for (let t = r.t; t <= r.b; t++) for (let l = r.l; l <= r.r; l++) {
      const next = structuredClone(cell); delete next.value;
      if (next.border) {
        if (t !== r.t) delete next.border.top;
        if (t !== r.b) delete next.border.bottom;
        if (l !== r.l) delete next.border.left;
        if (l !== r.r) delete next.border.right;
      }
      page.cells[t + ':' + l] = next;
    }
  }
  const merge = r => { if (r.l !== r.r || r.t !== r.b) page.mergedCells.push(r); };
  for (const originalMerge of original.mergedCells) {
    const rect = physicalRect(originalMerge, null, original);
    if (![...texts, ...fieldRects].some(item => intersects(item.rect, rect))) merge(nativeRange(rect));
  }
  for (const item of texts) {
    const r = nativeRange(item.rect), key = r.t + ':' + r.l;
    page.cells[key] = { ...page.cells[key], value: item.text }; merge(r);
  }
  for (const f of fields) {
    const rect = fieldRects.find(r => r.key === f.id).rect, r = nativeRange(rect), def = designer.getFieldTypeDefinition(f.type);
    merge(r);
    page.nodes.push({ id: 'ai-' + f.id, type: def.defaultComponentType, props: { label: f.name }, parentId: null, children: [],
      bindings: { fieldId: f.id, required: false, readonly: false, hidden: false, widgetConfig: {} },
      style: { position: 'absolute', cellRange: r, compLeft: rect.x, compTop: rect.y, compWidth: rect.w, compHeight: rect.h } });
  }
  // Keep untouched blank cells visually intact when other regions add global grid lines.
  const occupied = new Set();
  const occupy = r => { for (let t = r.t; t <= r.b; t++) for (let l = r.l; l <= r.r; l++) occupied.add(t + ':' + l); };
  page.mergedCells.forEach(occupy);
  [...texts, ...fieldRects].forEach(item => occupy(nativeRange(item.rect)));
  for (let row = 1; row <= original.sheet.rowCount; row++) for (let col = 1; col <= original.sheet.columnCount; col++) {
    const r = nativeRange(physicalRect({ t: row, b: row, l: col, r: col }, null, original));
    let free = true;
    for (let t = r.t; t <= r.b; t++) for (let l = r.l; l <= r.r; l++) if (occupied.has(t + ':' + l)) free = false;
    if (free) { merge(r); occupy(r); }
  }
  const document = designer.createEmptyTemplateDesignerDocument({ schema: 'edhr-template-designer-react', version: 1, templateId: 'agent-experiment', versionId: 'agent-experiment', templateName: draft.name, versionLabel: 'V1.0' },
    { model: { groups: [{ id: 'default-group', name: '默认分组' }], fields, projection: { version: 'form-projection-v1', bindings, lookupItems } }, canvas: { pages: [page] } });
  return { document, payload: designer.serializeTemplateDesignerDocument(document), errors, geometry: { fields: fieldRects, texts } };
}
