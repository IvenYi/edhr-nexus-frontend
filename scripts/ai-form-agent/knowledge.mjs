import { execFileSync } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { root, requireFrontend, hash } from './common.mjs';
const yaml = requireFrontend('yaml');

// Index source records, not hand-written task answers. Parent metadata remains explicit.
export async function loadKnowledge() {
  const files = execFileSync('git', ['ls-files', 'docs/knowledge'], { cwd: root, encoding: 'utf8' }).trim().split('\n').filter(p => p.endsWith('.yaml') && !p.endsWith('/schema.yaml'));
  const records = new Map(), manifest = [];
  const sourceCommit = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim();
  for (const file of files) {
    const text = await readFile(root + '/' + file, 'utf8');
    const document = yaml.parse(text);
    manifest.push({ file, sha256: hash(text), knowledgeModelVersion: document.knowledgeModelVersion });
    function walk(value, parent, locator) {
      if (!value || typeof value !== 'object') return;
      if (Array.isArray(value)) { value.forEach((v, i) => walk(v, parent, locator + '[' + i + ']')); return; }
      let current = parent;
      if (typeof value.id === 'string') {
        const data = Object.fromEntries(Object.entries(value).filter(([, v]) => !Array.isArray(v) || !v.some(x => x && typeof x === 'object' && x.id)));
        current = { id: value.id, file, locator, sourceCommit, fileHash: hash(text),
          status: value.status ?? (value.id.startsWith('question.') ? 'unresolved' : parent?.status ?? 'unspecified'),
          visibility: value.visibility ?? parent?.visibility ?? 'internal', parentId: parent?.id ?? null,
          parentEvidenceIds: parent?.data.evidenceIds ?? [], data };
        if (records.has(value.id)) throw new Error('重复知识 ID：' + value.id);
        records.set(value.id, current);
      }
      Object.entries(value).forEach(([k, v]) => walk(v, current, locator + '.' + k));
    }
    walk(document, null, '$');
  }
  const edges = [];
  for (const record of records.values()) {
    function refs(value, key) {
      if (typeof value === 'string' && value !== record.id && records.has(value)) edges.push({ from: record.id, to: value, kind: key, evidenceFile: record.file });
      else if (Array.isArray(value)) value.forEach(v => refs(v, key));
      else if (value && typeof value === 'object') Object.entries(value).forEach(([k, v]) => refs(v, key + '.' + k));
    }
    refs(record.data, 'reference');
    if (record.parentId) edges.push({ from: record.id, to: record.parentId, kind: 'parent', evidenceFile: record.file });
    if (record.id.startsWith('relation.')) edges.push({ from: record.data.source, to: record.data.target, kind: record.id, cardinality: record.data.cardinality, evidenceFile: record.file });
  }
  const summarize = r => ({ id: r.id, status: r.status, visibility: r.visibility, file: r.file, sourceCommit: r.sourceCommit, locator: r.locator,
    title: r.data.name ?? r.data.title ?? r.data.term ?? r.data.question ?? r.id,
    excerpt: (r.data.statement ?? r.data.definition ?? r.data.description ?? r.data.explanation ?? r.data.context ?? '').slice(0, 600) });
  return { manifest, records, edges, sourceCommit,
    search(query, limit = 8) {
      const terms = query.toLowerCase().split(/[\s,，;；]+/).filter(Boolean);
      return [...records.values()].map(r => {
        const text = JSON.stringify(r.data).toLowerCase();
        return { r, score: terms.reduce((n, term) => n + (text.includes(term) ? 5 : 0), 0) };
      }).filter(x => x.score).sort((a, b) => b.score - a.score || a.r.id.localeCompare(b.r.id)).slice(0, Math.min(15, Math.max(1, limit))).map(x => summarize(x.r));
    },
    get(ids) { return ids.slice(0, 8).map(id => records.get(id) ?? { id, error: '不存在此知识 ID' }); },
    graph(id, limit = 25) {
      const found = edges.filter(e => e.from === id || e.to === id);
      const selected = found.slice(0, Math.min(60, Math.max(1, limit)));
      return { scope: '概念关系和显式证据引用，不是业务实例关系', total: found.length, edges: selected,
        nodes: [...new Set(selected.flatMap(e => [e.from, e.to]))].map(key => records.get(key)).filter(Boolean).map(summarize) };
    } };
}
