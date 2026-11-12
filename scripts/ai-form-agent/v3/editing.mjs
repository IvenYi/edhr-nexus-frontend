import { hash } from '../common.mjs';

export const revisionOf = state => state.payload ? hash(state.payload) : null;
export function applyLocalPatch(draft, patch) {
  const next = structuredClone(draft), touched = [];
  for (const update of patch.fields ?? []) {
    const index = next.fields.findIndex(f => f.key === update.key);
    if (index < 0) {
      if (!update.label || !update.type || !update.source || !update.range) throw new Error('新增字段缺少完整定义：' + update.key);
      next.fields.push({ config: {}, ...update });
    } else {
      next.fields[index] = { ...next.fields[index], ...update, config: update.config === undefined ? next.fields[index].config : update.config };
    }
    touched.push('field:' + update.key);
  }
  for (const key of patch.removeFields ?? []) {
    if (!next.fields.some(f => f.key === key)) throw new Error('删除字段不存在：' + key);
    if (next.bindings.some(b => Object.values(b.sources).includes(key))) throw new Error('先解除用途再删除字段：' + key);
    next.fields = next.fields.filter(f => f.key !== key); touched.push('field:' + key);
  }
  for (const update of patch.textMoves ?? []) {
    const i = next.textMoves.findIndex(m => m.source === update.source);
    if (i < 0) next.textMoves.push(update); else next.textMoves[i] = update;
    touched.push('text:' + update.source);
  }
  if (patch.bindings !== undefined) { next.bindings = patch.bindings; touched.push('bindings'); }
  if (patch.questions !== undefined) { next.questions = patch.questions; touched.push('questions'); }
  if (patch.skipped !== undefined) { next.skipped = patch.skipped; touched.push('skipped'); }
  if (patch.gridAdjustments) {
    next.gridAdjustments = { rows: { ...next.gridAdjustments?.rows, ...patch.gridAdjustments.rows }, columns: { ...next.gridAdjustments?.columns, ...patch.gridAdjustments.columns } };
    touched.push('grid');
  }
  return { draft: next, touched };
}
