// Deterministic adapter-only replay on a new copy: never count it as a new model sample.
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { root, read, save, api, login, templates, loadDesigner, hash } from './common.mjs';
import { compileLayout } from './layout.mjs';

const token = await login(), designer = await loadDesigner();
for (const id of ['label-openai-1', 'scrap-openai-1']) {
  const sampleId = id.split('-')[0], draft = await read('runs/' + id + '/draft.json');
  const sample = JSON.parse(await readFile(root + '/output/ai-form-builder-v1-20261112/experiments/samples/' + sampleId + '.json', 'utf8'));
  const original = await read('runs/' + id + '/readback.json'), originalModel = JSON.parse(original.versions[0].modelDesignJson).payload;
  const compiled = compileLayout(draft, sample, designer, originalModel.projection.lookupItems);
  assert.deepEqual(compiled.errors, []); assert.deepEqual(compiled.document.model, originalModel, 'layout repair must not change model/business bindings');
  const target = await api(templates, token, 'POST', { code: 'AGENT-V2-' + id.toUpperCase() + '-LAYOUT-REPLAY', name: draft.name + ' · 布局适配复验', version: 'V1.0', categoryName: 'AI验证' });
  const saved = await api(`${templates}/${target.id}/versions/${target.versions[0].id}/design`, token, 'PUT', compiled.payload);
  const row = (await api(templates + '?code=' + target.code + '&size=100', token)).content.find(r => r.id === target.id);
  assert.equal(row.versions[0].canvasDesignJson, saved.canvasDesignJson); assert.equal(row.versions[0].modelDesignJson, saved.modelDesignJson);
  await save('replay/' + id + '.json', { scope: 'adapter-only copy; no additional model generation', sourceId: id, draftHash: hash(draft), adapterHash: hash(await readFile(import.meta.dirname + '/layout.mjs', 'utf8')), target, readback: row, geometry: compiled.geometry }, true);
  console.log(JSON.stringify({ id, target: target.id, modelUnchanged: true, nativeReadback: true }));
}
