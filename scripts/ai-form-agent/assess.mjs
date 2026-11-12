// Independent evaluator: never imported by agent tools or included in model input.
import { readdir, readFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
import { assessDraft } from '../ai-form-feasibility/assess.mjs';
import { out, root, read, save, hash, api, login } from './common.mjs';
import { intersects, physicalRect } from './layout.mjs';

export const acceptance = {
  frozenBeforeRuns: true,
  coverage: 'v1 independent core-slot specification: clean 15, label 67, scrap 17; development diagnostic, not full precision/recall',
  savedArtifact: 'Verify draft field names/types/config and bindings against actual API readback, not proposal alone.',
  layout: 'Actual serialized cellRange physical rectangles must not overlap; original text preserved; native rendered review required for legibility, print bounds and field fit.',
  semantics: 'Clean good/ng independent of header quantity; label actual-use quantity from four matching records; scrap independent from production NG; unresolved dates cannot be silently default-bound.',
  questions: 'Report literal questions and classify by independent review: true business ambiguity, lookup-resolvable, unnecessary, or unsupported tool. Also score unjustified assumptions and omissions.',
  retrieval: 'Must actually read knowledge, traverse explicit graph relations, query live catalog and inspect saved business relationships. Retrieval alone does not prove semantic correctness.',
  complete: 'Saved, read back, all core slots covered, correct core business binding, zero known semantic/layout defects and zero undeclared unfinished items. A successful API save is insufficient.',
};

if (process.argv.includes('--freeze')) {
  await save('acceptance.json', { ...acceptance, evaluatorHash: hash(await readFile(import.meta.filename, 'utf8')), v1EvaluatorHash: hash(await readFile(root + '/scripts/ai-form-feasibility/assess.mjs', 'utf8')) }, true);
  console.log('acceptance frozen before paid form runs');
} else if (process.argv[1] === import.meta.filename) {
  const token = await login(), rows = [];
  for (const id of (await readdir(out + '/runs')).sort()) {
    const r = await read('runs/' + id + '/result.json').catch(() => null);
    if (!r) continue;
    const row = { runId: id, provider: r.provider, sample: r.sampleId, status: r.status, seconds: r.seconds, costEstimateUsd: r.costEstimateUsd, questions: r.questions, failure: r.failure };
    if (r.saved && r.inspected) {
      const draft = await read('runs/' + id + '/draft.json'), stored = await read('runs/' + id + '/readback.json');
      const version = stored.versions.find(v => v.id === r.versionId), model = JSON.parse(version.modelDesignJson).payload, canvas = JSON.parse(version.canvasDesignJson).payload;
      row.persistenceMatches = draft.fields.every(f => model.fields.some(m => m.id === f.key && m.name === f.label && m.type === f.type && Object.entries(f.config).every(([key, value]) => JSON.stringify(m.typeConfig[key]) === JSON.stringify(value))));
      assert.equal(row.persistenceMatches, true, id + ' proposal differs from saved model');
      assert.deepEqual(model.projection.bindings.map(b => ({ modelId: b.modelId, sources: b.sources })), draft.bindings.map(b => ({ modelId: b.modelId, sources: b.sources })));
      const sample = JSON.parse(await readFile(root + '/output/ai-form-builder-v1-20261112/experiments/samples/' + r.sampleId + '.json', 'utf8'));
      const prior = assessDraft(draft, r.sampleId, sample);
      Object.assign(row, { slots: prior.coreSlots, matched: prior.matchedSlots, missing: prior.missing, coreBinding: prior.coreBinding, invented: prior.invented });
      const page = canvas.pages[0], rects = page.nodes.map(n => ({ key: n.bindings.fieldId, rect: physicalRect(n.style.cellRange, null, page) }));
      row.nativeOverlaps = rects.flatMap((a, i) => rects.slice(i + 1).filter(b => intersects(a.rect, b.rect)).map(b => [a.key, b.key]));
      const calls = [];
      for (const file of (await readdir(out + '/runs/' + id)).filter(f => /^tool-\d+\.json$/.test(f))) calls.push(await read('runs/' + id + '/' + file));
      row.retrieval = { readIds: r.knowledgeIdsRead, graphCalls: calls.filter(c => c.name === 'query_knowledge_graph' && !c.result.error).length,
        catalogCalls: calls.filter(c => c.name === 'query_business' && c.args.kind === 'catalog' && !c.result.error).length,
        actualRelationCalls: calls.filter(c => c.name === 'query_business' && c.args.kind === 'template_relations' && c.result.templateId).length };
      // Synthetic projection probes are separate from real candidate authorization and production submissions.
      const values = {};
      for (const f of draft.fields) {
        if (f.type === 'number') values[f.key] = r.sampleId === 'clean' ? ({ D8: 30, D9: 2, H4: 100, D11: 3 }[f.source] ?? 7)
          : r.sampleId === 'label' ? ({ E5: 500, F7: 100, H7: 80, K7: 60, L7: 20 }[f.source] ?? 7) + Math.floor((Number(f.range.match(/\d+/)[0]) - 8) / 4) : 3;
        else if (f.type === 'reference') values[f.key] = { id: '1', sourceType: f.config.sourceType, code: 'SIM-ONLY', name: '仅用于投影函数测试的合成值' };
        else if (f.type === 'datetime') values[f.key] = '2026-11-12';
        else if (f.type === 'text') values[f.key] = 'SIM-' + f.key;
      }
      try {
        const projected = await api('/master-data/template-modeling/projection-preview', token, 'POST', { model, values });
        row.projection = projected.filter(p => p.modelId !== 'formTrace');
        await save('runs/' + id + '/evaluation-projection.json', { scope: 'synthetic pure projection; no production/identity/signature evidence', values, projected }, true);
      } catch (error) { row.projectionError = error.message; }
    }
    rows.push(row);
  }
  await save('assessment.json', { acceptance, rows });
  console.log(JSON.stringify(rows.map(r => ({ run: r.runId, status: r.status, coverage: r.matched + '/' + r.slots, coreBinding: r.coreBinding, questions: r.questions?.length, graph: r.retrieval?.graphCalls, relations: r.retrieval?.actualRelationCalls, overlaps: r.nativeOverlaps?.length, seconds: Math.round(r.seconds), failure: r.failure })), null, 2));
}
