import { readFile, mkdir, readdir } from 'node:fs/promises';
import { root, out, save, hash, loadDesigner, login } from '../common.mjs';
import { loadKnowledge } from '../knowledge.mjs';
import { configurations } from '../providers.mjs';
import { instructions, tools } from '../v3/tools.mjs';
import { mountRuntime, openAgent, turn } from './runtime.mjs';
import { createFormPlugin } from './form-plugin.mjs';
import { FormModelAdapter, maxRequests, budgetUsd } from './provider.mjs';

const [phase, provider, sampleId, attempt = '1'] = process.argv.slice(2);
if (!['debug', 'final'].includes(phase) || !['openai', 'deepseek'].includes(provider) ||
    !['clean', 'label', 'scrap'].includes(sampleId) || !/^\d+$/.test(attempt)) throw new Error('Usage: run.mjs debug|final openai|deepseek clean|label|scrap [attempt]');
if (phase === 'debug' && provider !== 'openai') throw new Error('Use OpenAI for debugging');
if (!process.env.AI_FORM_AGENT_BATCH?.startsWith('ai-form-agent-dsh-') || process.env.AI_FORM_AGENT_PORT !== '18093') throw new Error('Use the isolated DSH batch and 18093 server');

const [knowledge, designer, token] = await Promise.all([loadKnowledge(), loadDesigner(), login()]);
const samples = {};
for (const id of ['clean', 'label', 'scrap']) {
  samples[id] = JSON.parse(await readFile(root + '/output/ai-form-builder-v1-20261112/experiments/samples/' + id + '.json', 'utf8'));
  samples[id].input.note = '空白脱敏表；未列单元格为空。通过工具查询适用知识、业务目录和客户实施依据；不要推测未知客户政策。';
}
const source = {};
for (const folder of ['.', '..', '../v3', '../../ai-form-feasibility']) {
  const path = import.meta.dirname + '/' + folder;
  for (const file of (await readdir(path)).filter(f => f.endsWith('.mjs') || f === 'package-lock.json').sort())
    source[folder + '/' + file] = await readFile(path + '/' + file, 'utf8');
}
const protocol = { phase, runtime: 'DSH 0.2.2-rc.1', instructions, tools, configurations, maxRequests, budgetUsd, sourceCommit: knowledge.sourceCommit,
  codeHashes: Object.fromEntries(Object.entries(source).map(([name, content]) => [name, hash(content)])),
  knowledgeManifest: knowledge.manifest, sampleHashes: Object.fromEntries(Object.entries(samples).map(([id, s]) => [id, hash(s)])), customerPolicies: [] };
const runId = `${phase}-${sampleId}-${provider}-${attempt}`, prefix = 'runs/' + runId, directory = out + '/' + prefix;
await mkdir(out + '/runs', { recursive: true, mode: 0o700 });
await mkdir(directory, { mode: 0o700 });
await save((phase === 'debug' ? runId + '-' : '') + 'protocol.json', protocol, true);
if (phase === 'final') await readFile(out + '/acceptance.json');
const sample = samples[sampleId];
const task = JSON.stringify({ task: '在AI验证分类下，按原件直接构建可编辑模板并配置有依据的引用、追溯及业务用途。自行查适用知识与关系、实际业务上下文，保留原文，覆盖实际填写区域，完成后读回检查并看原生预览修正版式。只把查不到且影响本次结果的业务决策交给用户。以 finish_task 结束。', form: sample.input });
await save(prefix + '/input.json', { phase, provider, sampleId, task, protocolHash: hash(protocol) }, true);

const ctx = await mountRuntime(directory + '/dsh', instructions);
const { plugin, session } = await createFormPlugin({ directory, runId, knowledge, designer, token, sample,
  getGrant: () => ({ enabled: true, entitled: true, canRead: true, canWrite: true }) });
const adapter = new FormModelAdapter(ctx, provider, runId, session);
const start = performance.now();
let reason, failure;
try {
  ctx.llm.registerAdapter([provider], adapter);
  await ctx.plugin(plugin);
  const agent = await openAgent(ctx, runId, { provider, model: configurations[provider].model });
  reason = await turn(ctx, agent, task);
} catch (error) { failure = error.message; }
finally { await ctx.fiber.dispose(); }
const { state, extra } = session;
const result = { runId, phase, provider, sampleId, seconds: (performance.now() - start) / 1000, status: extra.finished?.status ?? 'failed',
  failure: extra.finished ? undefined : failure ?? JSON.stringify(reason ?? 'DSH ended without finish_task'), reason, requests: adapter.requests,
  costEstimateUsd: adapter.cost, saved: !!state.payload, inspected: state.inspected, templateId: state.template?.id, templateCode: state.template?.code,
  versionId: state.template?.versions[0]?.id, finish: extra.finished, questions: state.draft?.questions ?? [],
  knowledgeIdsRead: [...state.queriedIds], applicableQueries: extra.applicableQueries, checks: extra.lastCheck, preview: extra.preview, saves: state.saves };
if (state.draft) await save(prefix + '/draft.json', state.draft, true);
if (state.readback) await save(prefix + '/readback.json', state.readback, true);
await save(prefix + '/result.json', result, true);
console.log(JSON.stringify({ runId, status: result.status, questions: result.questions.length, failure: result.failure, cost: result.costEstimateUsd }));
