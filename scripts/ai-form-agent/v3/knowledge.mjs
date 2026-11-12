// Query-time retrieval from authority records. No form IDs or sample-specific answers.
export function applicableKnowledge(knowledge, query, conceptIds = []) {
  const terms = query.toLowerCase().split(/[\s,，;；]+/).filter(Boolean);
  const hits = [...knowledge.records.values()].map(r => ({ r, matches: terms.filter(t => JSON.stringify(r.data).toLowerCase().includes(t)).length }))
    .filter(x => x.matches).sort((a, b) => (b.matches * 10 + (b.r.id.startsWith('rule.') ? 6 : 0)) - (a.matches * 10 + (a.r.id.startsWith('rule.') ? 6 : 0)) || a.r.id.localeCompare(b.r.id)).slice(0, 12).map(x => x.r);
  const direct = new Set([...conceptIds, ...hits.map(h => h.id)]);
  const edges = knowledge.edges.filter(e => direct.has(e.from) || direct.has(e.to));
  const candidates = new Set([...direct, ...edges.flatMap(e => [e.from, e.to])]);
  const rank = record => (record.id.startsWith('rule.') ? 100 : record.id.startsWith('question.') ? 65 : /^DEC-\d+-\d+$/.test(record.id) ? 50 : 0) + (direct.has(record.id) ? 30 : 0);
  const selected = [...candidates].map(id => knowledge.records.get(id)).filter(Boolean)
    .sort((a, b) => rank(b) - rank(a) || a.id.localeCompare(b.id)).slice(0, 16);
  return {
    query, scope: 'internal-research-only; maturity unchanged; retrieved relevance is not a production execution authorization',
    records: selected, relationships: edges.filter(e => selected.some(r => r.id === e.from || r.id === e.to)).slice(0, 35),
    unresolved: selected.filter(r => r.id.startsWith('question.')).map(r => ({ id: r.id, question: r.data.question, context: r.data.context })),
    interpretation: '按当前rule解释其声明级依据；历史决策保留，不按日期或整个supersedes决定全部失效。返回context中的已确认部分不要再次问客户。需要更多原文用read_knowledge。',
  };
}
