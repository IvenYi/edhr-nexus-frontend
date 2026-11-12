// Held-out diagnostic evaluator: never imported by Agent tools or exposed in model context.
import { readdir, readFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
import { assessDraft } from '../../ai-form-feasibility/assess.mjs';
import { root, out, read, save, hash, login, api, templates } from '../common.mjs';
import { intersects, physicalRect } from '../layout.mjs';

const acceptance = {
  coverage: 'Independent v1 slots: clean15,label67,scrap17; source/role matching is a diagnostic, not full semantic accuracy.',
  persistence: 'Fetch current native API version; compare the exact saved model/canvas/workflow and field configuration; inspect actual native grid overlap.',
  meaning: 'Customer policies absent: defer dependent formal sources and ambiguous lots, keep justified optional trace bindings; no assumption that every form must emit statistics.',
  feedback: 'Current saved revision must have semantic check, native preview, image delivery and honest finish. Count unresolved clipping, incomplete work and failed attempts.',
  questions: 'Separately review actual business ambiguity, lookup-resolvable, optional expansion, tool/visual limitations, and omitted decisions; fewer questions alone is not better.',
  limitations: 'One final run per form/provider is a small diagnostic comparison after OpenAI-only debugging, not a blind population benchmark or commercial acceptance.',
};
if (process.argv.includes('--freeze')) {
  await save('acceptance.json', { acceptance, evaluatorHash: hash(await readFile(import.meta.filename, 'utf8')), slotEvaluatorHash: hash(await readFile(root + '/scripts/ai-form-feasibility/assess.mjs', 'utf8')) }, true);
  console.log('Acceptance frozen before final runs');
} else {
  const token = await login(), rows = [];
  for (const id of (await readdir(out + '/runs')).filter(id => /^(debug|final)-/.test(id)).sort()) {
    const r = await read(`runs/${id}/result.json`).catch(() => null); if (!r) continue;
    const row = { runId: id, phase: r.phase, provider: r.provider, sample: r.sampleId, status: r.status, seconds: r.seconds, costEstimateUsd: r.costEstimateUsd,
      questions: r.questions, incomplete: r.finish?.incomplete, failure: r.failure, saves: r.saves };
    const calls = [];
    for (const file of (await readdir(out + '/runs/' + id)).filter(f => /^controlled-tool-\d+\.json$/.test(f))) calls.push(await read(`runs/${id}/${file}`));
    row.calls = Object.fromEntries([...new Set(calls.map(c => c.name))].map(name => [name, calls.filter(c => c.name === name).length]));
    row.toolErrors = calls.filter(c => c.result.error || c.result.saved === false || c.result.finished === false).map(c => ({ sequence: c.sequence, name: c.name, error: c.result.error, semanticErrors: c.result.semanticErrors, errors: c.result.errors }));
    row.imageDeliveries = (await readdir(out + '/runs/' + id)).filter(f => /^image-input-/.test(f)).length;
    row.clippingProgress = calls.filter(c => c.name === 'preview_template' && c.result.images).sort((a,b) => a.sequence-b.sequence).map(c => c.result.issues.length);
    if (r.saved) {
      const draft = await read(`runs/${id}/draft.json`), lastSave = await read(`runs/${id}/save-${r.saves}.json`);
      const list = await api(templates + '?code=' + encodeURIComponent('AGENT-V3-' + id.toUpperCase()) + '&size=100', token);
      const current = list.content.find(t => t.id === r.templateId), version = current?.versions.find(v => v.id === r.versionId);
      assert.ok(version, id + ' missing live version');
      row.persistenceMatches = ['modelDesignJson', 'canvasDesignJson', 'workflowDesignJson'].every(k => version[k] === lastSave.saved[k]);
      assert.equal(row.persistenceMatches, true, id + ' changed after run');
      const model = JSON.parse(version.modelDesignJson).payload, page = JSON.parse(version.canvasDesignJson).payload.pages[0];
      assert.ok(draft.fields.every(f => model.fields.some(m => m.id === f.key && m.name === f.label && m.type === f.type && Object.entries(f.config).every(([k,v]) => JSON.stringify(m.typeConfig[k]) === JSON.stringify(v)))));
      assert.deepEqual(model.projection.bindings.map(b => ({ modelId: b.modelId, sources: b.sources })), draft.bindings.map(b => ({ modelId: b.modelId, sources: b.sources })));
      const sample = JSON.parse(await readFile(root + '/output/ai-form-builder-v1-20261112/experiments/samples/' + r.sampleId + '.json'));
      const score = assessDraft(draft, r.sampleId, sample);
      Object.assign(row, { slots: score.coreSlots, matched: score.matchedSlots, missing: score.missing, invented: score.invented,
        fields: model.fields.length, bindingModels: model.projection.bindings.map(b => b.modelId), semantics: r.checks, preview: r.preview });
      const rects = page.nodes.map(n => ({ key: n.bindings.fieldId, rect: physicalRect(n.style.cellRange, null, page) }));
      row.overlaps = rects.flatMap((a,i) => rects.slice(i+1).filter(b => intersects(a.rect,b.rect)).map(b => [a.key,b.key]));
      await save(`runs/${id}/evaluation-live-readback.json`, current, true);
    }
    rows.push(row);
  }
  await save('assessment.json', { acceptance, rows });
  console.log(JSON.stringify(rows.map(r => ({ run: r.runId, status: r.status, coverage: `${r.matched}/${r.slots}`, questions: r.questions?.length,
    saves: r.saves, previews: r.clippingProgress, patches: r.calls.patch_template ?? 0, seconds: Math.round(r.seconds), failure: r.failure })), null, 2));
}
