import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { assessDraft } from '../../ai-form-feasibility/assess.mjs';
import { sourceRegions } from './source-regions.mjs';

const hash = value => createHash('sha256').update(value).digest('hex');
const json = async path => JSON.parse(await readFile(path, 'utf8'));
const normalize = text => String(text).replace(/\s+/g, '');
const lineSlots = [
  ['A3', ['text', 'reference']], ['F3', ['text', 'reference']],
  ...Array.from({ length: 8 }, (_, i) => ['B' + (5 + i), ['singleSelect', 'multiSelect']]),
  ...['A14', 'F14', 'A35', 'F35'].map(source => [source, ['signature']]),
  ...'ABCDEFGH'.split('').map((col, i) => [col + '17', i < 3 ? ['text', 'reference'] : ['number']]),
];

export async function assessRun(batch, sampleId) {
  const dir = join(batch, sampleId);
  const sample = await json(join(batch, sampleId + '.json'));
  const native = await json(join(dir, 'native-evidence.json'));
  const modelRun = await json(join(dir, 'model-result.json'));
  const history = join(dir, 'harness', 'sessions', '_no-cwd', native.task.runId, 'session.v4.jsonl');
  const events = (await readFile(history, 'utf8')).trim().split('\n').map(line => JSON.parse(line));
  const calls = new Map(events.filter(e => e.type === 'tool/call').map(e => [e.data.callId, e.data]));
  const results = events.filter(e => e.type === 'tool/result').map(e => {
    const message = e.data.message;
    const text = message.content.find(block => block.type === 'text')?.text ?? '';
    const call = calls.get(message.toolCallId);
    let result;
    try { result = JSON.parse(text); } catch { result = { error: text }; }
    return { name: call?.name, arguments: call?.arguments, id: message.toolCallId, result };
  });
  const completed = native.events.filter(e => e.action === 'TOOL_COMMITTED').map(e => e.detail);
  const reserved = native.events.filter(e => e.action === 'REQUEST_RESERVED').map(e => e.detail);
  const settled = native.events.filter(e => e.action === 'REQUEST_SETTLED').map(e => e.detail);
  const row = { sampleId, sourceSha256: sample.sourceSha256, state: native.task.state, reason: native.task.reason, exit: native.exit,
    requests: modelRun.requests.length, estimatedMicros: settled.reduce((n, entry) => n + entry.actualMicros, 0),
    budgetLedgerMatches: modelRun.requests.every(request => reserved.some(e => e.requestId === request.requestId)
      && settled.some(e => e.requestId === request.requestId && e.actualMicros === request.micros)),
    toolCounts: Object.fromEntries([...new Set(completed.map(e => e.tool))].map(tool => [tool, completed.filter(e => e.tool === tool).length])),
    toolErrors: results.filter(e => e.result.error).map(e => ({ tool: e.name, error: e.result.error })), answer: modelRun.answer,
  };
  if (!native.nativeReadback) return row;
  const saved = native.nativeReadback, revision = saved.revision;
  const model = JSON.parse(saved.modelDesignJson).payload;
  const canvas = JSON.parse(saved.canvasDesignJson).payload;
  const bindings = model.projection?.bindings ?? [];
  const fields = model.fields.flatMap(field => field.type === 'subTable' ? field.typeConfig.columns : [field]);
  const create = results.find(e => e.name === 'create_form' && e.result.receipt);
  const draft = JSON.parse(create.arguments);
  const regions = new Map(sourceRegions(sample).map(region => [region.slot, region]));
  const placed = draft.fields[0]?.slot ? draft.fields.map(field => ({ ...field, ...regions.get(field.slot), key: field.slot }))
    : [...draft.fields, ...(draft.tables ?? []).flatMap(table => table.columns)];
  const persisted = placed.filter(field => fields.some(current => current.id === field.key));
  const typed = persisted.map(field => ({ ...field, type: fields.find(current => current.id === field.key).type, range: field.range === 'inline' ? field.source : field.range }));
  const score = sampleId === 'line-clearance' ? {
    coreSlots: lineSlots.length,
    matchedSlots: lineSlots.filter(([source, types]) => typed.some(field => field.source === source && types.includes(field.type))).length,
  } : assessDraft({ fields: typed, bindings: [], questions: [] }, sampleId, sample);
  const previewEvents = completed.filter(e => e.tool === 'preview_form').map(e => e.evidence);
  const previews = previewEvents.filter(e => e.revision === revision);
  const checks = completed.filter(e => e.tool === 'check_form').map(e => e.evidence).filter(e => e.revision === revision);
  const nativeText = canvas.pages.flatMap(page => Object.values(page.cells)).map(cell => normalize(cell.value ?? '')).join('|');
  const receipts = native.receipts.map(value => JSON.parse(value));
  const artifacts = [];
  const previewsDir = join(dir, native.task.taskId, 'previews');
  for (const entry of await readdir(previewsDir).catch(error => error.code === 'ENOENT' ? [] : Promise.reject(error))) {
    const manifest = await json(join(previewsDir, entry, 'manifest.json'));
    const image = join(previewsDir, entry, 'preview.png');
    artifacts.push({ revision: manifest.revision, image, fieldControls: manifest.fieldControls, issues: manifest.issues,
      verified: previewEvents.some(e => e.revision === manifest.revision && e.artifactHash === hash(JSON.stringify(manifest))) && manifest.imageHash === hash(await readFile(image)) });
  }
  return { ...row, revision, fields: fields.length, coreSlots: score.coreSlots, matchedSlots: score.matchedSlots, missingSlots: score.missing,
    tableRepeats: canvas.pages.flatMap(page => page.nodes).filter(node => node.type === 'sub-table').map(node => node.bindings.subTableRegion.repeat.count),
    originalTextPreserved: sample.input.cells.every(cell => nativeText.includes(normalize(cell.text))),
    trace: bindings.filter(b => b.modelId === 'formTrace'), formalBindings: bindings.filter(b => b.enabled && b.modelId !== 'formTrace'),
    receiptMatches: receipts.at(-1)?.revision === revision && receipts.at(-1)?.versionId === saved.id,
    currentCheck: checks.at(-1) ?? null, currentPreview: previews.at(-1) ?? null, artifacts };
}

if (process.argv[1] === import.meta.filename) {
  const batch = process.argv[2];
  const rows = await Promise.all(['clean', 'scrap', 'line-clearance'].map(id => assessRun(batch, id)));
  console.log(JSON.stringify(rows, null, 2));
}
