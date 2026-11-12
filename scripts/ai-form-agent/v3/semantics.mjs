// Conservative, source-backed diagnostics. Not a general semantic correctness proof.
export function sourceRequirements(sample) {
  return sample.input.cells.filter(c => /日期/.test(c.text) && !/版本|实施日期|说明|注：|质量控制点/.test(c.text)).map(c => ({
    source: c.address, text: c.text, minimumDates: (c.text.match(/日期/g) ?? []).length,
  }));
}

export function checkSemantics(draft, sample, policies = []) {
  const errors = [], warnings = [], questions = draft.questions ?? [], fields = draft.fields ?? [], bindings = draft.bindings ?? [];
  const issue = (code, message, affectedFields = [], evidence = []) => ({ code, message, affectedFields, evidence });
  for (const requirement of sourceRequirements(sample)) {
    const found = fields.filter(f => f.source === requirement.source && f.type === 'datetime');
    if (found.length < requirement.minimumDates) errors.push(issue('missing-explicit-date', `${requirement.source}原文含${requirement.minimumDates}个日期位置，不能用签署时间替代独立日期输入`, found.map(f => f.key), [requirement.source]));
  }
  for (const f of fields) {
    if (f.type === 'reference' && ['product', 'productionBatch', 'serialNumber'].includes(f.config?.sourceType)) errors.push(issue('legacy-reference-entry', '新配置使用material产品范围或productionObject批次/SN范围', [f.key], ['DEC-0082-15']));
    if (f.type === 'reference' && f.config?.sourceType === 'dictionary' && !f.config.referenceDictionaryId) errors.push(issue('dictionary-scope', '必须指定实际业务字典', [f.key], ['DEC-0082-14']));
    const source = sample.input.cells.find(c => c.address === f.source)?.text ?? '';
    if (f.type === 'signature' && !/签字|签名|复核/.test(source) && !policies.some(p => p.kind === 'signature' && p.fieldKeys?.includes(f.key) && p.status === 'confirmed'))
      errors.push(issue('unconfirmed-signature', '原文仅人员名称，缺少电子签署政策；保留人员引用或查询明确依据，不默认提升为签名要求', [f.key], [f.source]));
  }
  const trace = new Map();
  for (const b of bindings) {
    if (b.modelId === 'formTrace') for (const key of Object.values(b.sources)) {
      if (trace.has(key)) errors.push(issue('multiple-trace-items', '一个字段最多一个追溯项；同一项可在不同字段复用', [key], ['DEC-0077-42']));
      trace.set(key, true);
    }
    if (['production', 'consumption', 'scrap'].includes(b.modelId) && !policies.some(p => p.kind === 'formal-source' && p.modelId === b.modelId && p.status === 'confirmed'))
      errors.push(issue('formal-source-unknown', `${b.modelId}正式来源职责尚无客户实施依据，保留字段并暂缓此用途`, Object.values(b.sources), ['DEC-0077-06']));
    for (const [role, key] of Object.entries(b.sources)) {
      const field = fields.find(f => f.key === key);
      if (!field) { errors.push(issue('missing-binding-field', '用途引用不存在的字段', [key])); continue; }
      const source = sample.input.cells.find(c => c.address === field.source)?.text ?? '';
      if (/materialLotText|supplierLot|lookup_production_batch/.test(role) && field.type !== 'reference' && /批号/.test(source) && !/生产批号|供应商批号|内部物料批号/.test(source) && !policies.some(p => p.kind === 'lot-meaning' && p.fieldKeys?.includes(key) && p.status === 'confirmed'))
        errors.push(issue('lot-meaning-unknown', '批号含义不能仅靠相邻字段推定；查询客户依据或暂缓该追溯/统计来源', [key], [field.source, 'DEC-0077-40']));
    }
  }
  for (const q of questions) {
    const affected = new Set(q.affectedFields ?? []);
    const blockedUses = q.blockedUses ?? [];
    if (bindings.some(b => blockedUses.some(u => u.modelId === b.modelId && Object.entries(b.sources).some(([role, key]) => affected.has(key) && (!u.roles?.length || u.roles.includes(role)))))) errors.push(issue('question-already-bound', '未决问题所影响的具体用途已绑定；仅暂缓这些用途，其他合法角色可保留', [...affected]));
    if (!affected.size || /是否需要.*(新增|增加)|超过.*条|空白区|无标签/.test(q.question)) warnings.push(issue('optional-expansion-question', '可能为可选扩展，不应成为重建原表的必答问题', [...affected]));
  }
  return { errors, warnings, sourceRequirements: sourceRequirements(sample), limitations: ['日期及标签检查为保守启发式，不能证明全表完整或客户业务含义正确', 'confirmed政策只能来自会话外已记录依据，模型不能自行确认'] };
}
