import { readFile, readdir, access } from 'node:fs/promises';
import { root, out, read, save, hash, loadDesigner, login } from './common.mjs';
import { loadKnowledge } from './knowledge.mjs';
import { instructions, tools, createSession } from './tools.mjs';
import { createProvider, configurations } from './providers.mjs';

const knowledge = await loadKnowledge(), designer = await loadDesigner(), token = await login();
const maxRounds = 26, runBudgetUsd = 3;
const sources = {};
for (const file of (await readdir(import.meta.dirname)).filter(f => ['common.mjs', 'knowledge.mjs', 'layout.mjs', 'tools.mjs', 'providers.mjs', 'run.mjs'].includes(f))) sources[file] = hash(await readFile(import.meta.dirname + '/' + file, 'utf8'));
const samples = {};
for (const id of ['clean', 'label', 'scrap']) {
  samples[id] = JSON.parse(await readFile(root + '/output/ai-form-builder-v1-20261112/experiments/samples/' + id + '.json', 'utf8'));
  samples[id].input.note = '空白脱敏模板；未列单元格为空。业务知识和目录请使用工具查询。所有位置保持原表坐标。';
}
const protocol = { scope: 'internal experiment, no published runtime knowledge', instructions, tools, configurations, maxRounds, runBudgetUsd,
  repetitions: 2, sourceCommit: knowledge.sourceCommit, codeHashes: sources, knowledgeManifest: knowledge.manifest,
  sampleHashes: Object.fromEntries(Object.entries(samples).map(([id, sample]) => [id, hash(sample)])),
  evaluation: 'Pre-fixed core slots from v1 plus native geometry/semantic review; no answer key or previous generated form exposed to providers; 2 repeats per sample/provider, all outcomes retained.' };
await save('protocol.json', protocol, true);
await save('knowledge-index-summary.json', { records: knowledge.records.size, edges: knowledge.edges.length, files: knowledge.manifest.length }, true);

async function run(provider, sampleId, repetition) {
  const runId = `${sampleId}-${provider}-${repetition}`, prefix = 'runs/' + runId;
  try { await access(out + '/' + prefix + '/result.json'); console.log('skip completed ' + runId); return; } catch {}
  try { await access(out + '/' + prefix + '/input.json'); throw new Error('未完成实验必须保留；请另开批次，不能覆盖：' + runId); } catch (error) { if (error.code !== 'ENOENT') throw error; }
  const sample = samples[sampleId];
  const task = JSON.stringify({ task: '在AI验证分类下，按这张原表直接建立完整可编辑表单，配置有依据的字段、引用、追溯和业务用途。名称和版本按原表/当前默认规则处理。请自行查询所需知识和关系、实际业务目录，完成后读回自检。只有真正缺失的业务信息才集中提问。', form: sample.input });
  await save(prefix + '/input.json', { provider, sampleId, repetition, task, protocolHash: hash(protocol), sampleHash: hash(sample) }, true);
  const session = createSession({ knowledge, sample, designer, token, runId }), model = await createProvider(provider, instructions, tools, task);
  const result = { runId, provider, sampleId, repetition, startedAt: new Date().toISOString(), status: 'failed', requests: [], costEstimateUsd: 0 };
  const started = performance.now();
  try {
    for (let round = 1; round <= maxRounds; round++) {
      // Reserve worst-case output plus uncached input before a call; never unbounded retries.
      const nextUpper = (JSON.stringify(model.history).length + instructions.length + JSON.stringify(tools).length) * (provider === 'openai' ? 2.5 : 0.3) / 1e6 + 20000 * (provider === 'openai' ? 10 : 1.2) / 1e6;
      if (result.costEstimateUsd + nextUpper > runBudgetUsd) throw new Error('达到单任务实验预算上限');
      const response = await model.call();
      await save(prefix + '/response-' + round + '.json', response, true);
      result.requests.push({ round, requestId: response.requestId, model: response.model, usage: response.usage, seconds: response.seconds, estimatedCostUsd: response.estimatedCostUsd });
      result.costEstimateUsd += response.estimatedCostUsd;
      console.log(JSON.stringify({ runId, round, tools: response.calls.map(c => c.name), seconds: Math.round(response.seconds) }));
      if (!response.calls.length) { model.user('请继续使用工具完成任务；无法完成时明确保留未完成事项，不要只给操作建议。'); continue; }
      for (const call of response.calls) {
        let output;
        try { output = await session.execute(call.name, JSON.parse(call.arguments)); }
        catch (error) { output = { error: error.message }; }
        model.result(call, output);
        if (output.error || output.saved === false) console.log(JSON.stringify({ runId, tool: call.name, error: output.error, errors: output.errors?.slice(0, 4) }));
        if (session.state.finished) break;
      }
      if (session.state.finished) { result.status = 'agent-finished'; break; }
    }
    if (!session.state.finished) result.failure = '未在轮数/预算内完成';
  } catch (error) { result.failure = error.message; }
  const s = session.state;
  Object.assign(result, { finishedAt: new Date().toISOString(), seconds: (performance.now() - started) / 1000,
    saved: !!s.payload, inspected: s.inspected, saves: s.saves, templateId: s.template?.id, versionId: s.template?.versions[0]?.id,
    knowledgeIdsRead: [...s.queriedIds], toolsUsed: s.calls.map(c => c.name), finish: s.finished,
    questions: s.finished?.questions ?? s.draft?.questions ?? [], skipped: s.draft?.skipped ?? [] });
  if (s.draft) await save(prefix + '/draft.json', s.draft, true);
  if (s.readback) await save(prefix + '/readback.json', s.readback, true);
  await save(prefix + '/result.json', result, true);
  console.log(JSON.stringify({ runId, status: result.status, saved: result.saved, questions: result.questions.length, cost: result.costEstimateUsd, failure: result.failure }));
}

const requested = process.argv.slice(2);
for (let repetition = 1; repetition <= 2; repetition++) for (const sample of ['clean', 'label', 'scrap']) {
  for (const provider of repetition % 2 ? ['deepseek', 'openai'] : ['openai', 'deepseek']) {
    const id = `${sample}-${provider}-${repetition}`;
    if (!requested.length || requested.includes(id)) await run(provider, sample, repetition);
  }
}
