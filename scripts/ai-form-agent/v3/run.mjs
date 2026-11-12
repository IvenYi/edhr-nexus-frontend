import { readFile, readdir, access } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { root, out, save, hash, loadDesigner, login } from '../common.mjs';
import { loadKnowledge } from '../knowledge.mjs';
import { createProvider, configurations } from '../providers.mjs';
import { createControlledSession, instructions, tools } from './tools.mjs';

const [phase, provider, sampleId, attempt = '1'] = process.argv.slice(2);
if (!['debug', 'final'].includes(phase) || !['openai', 'deepseek'].includes(provider) || !['clean', 'label', 'scrap'].includes(sampleId)) throw new Error('Usage: run.mjs debug|final openai|deepseek clean|label|scrap [attempt]');
if (phase === 'debug' && provider !== 'openai') throw new Error('用户要求调试只使用OpenAI，DeepSeek留给完整验证');
if (!process.env.AI_FORM_AGENT_BATCH?.startsWith('ai-form-agent-v3-') || process.env.AI_FORM_AGENT_PORT !== '18093') throw new Error('须显式设置v3独立batch和18093隔离端口');
const knowledge = await loadKnowledge(), designer = await loadDesigner(), token = await login();
const code = {};
for (const folder of [import.meta.dirname, import.meta.dirname + '/..']) for (const file of (await readdir(folder)).filter(f => f.endsWith('.mjs'))) code[(folder.endsWith('/..') ? '../' : '') + file] = await readFile(folder + '/' + file, 'utf8');
for (const file of ['../../ai-form-feasibility/common.mjs', '../../ai-form-feasibility/assess.mjs']) code[file] = await readFile(import.meta.dirname + '/' + file, 'utf8');
const samples = {};
for (const id of ['clean', 'label', 'scrap']) {
  samples[id] = JSON.parse(await readFile(root + '/output/ai-form-builder-v1-20261112/experiments/samples/' + id + '.json', 'utf8'));
  samples[id].input.note = '空白脱敏表；未列单元格为空。通过工具查询适用知识、业务目录和客户实施依据；不要推测未知客户政策。';
}
const maxRounds = 26, budgetUsd = 5;
const protocol = { phase, instructions, tools, configurations, maxRounds, budgetUsd, sourceCommit: knowledge.sourceCommit,
  codeHashes: Object.fromEntries(Object.entries(code).map(([f, text]) => [f, hash(text)])), knowledgeManifest: knowledge.manifest,
  sampleHashes: Object.fromEntries(Object.entries(samples).map(([id, s]) => [id, hash(s)])), customerPolicies: [],
  scope: 'three deidentified forms; same tools and vision feedback for both providers; no evaluator answers; explicit unknown customer policies; native preview via unchanged UI' };
const runId = `${phase}-${sampleId}-${provider}-${attempt}`, prefix = 'runs/' + runId;
await save(`${phase === 'debug' ? runId + '-' : ''}protocol.json`, protocol, true);
await save(`${phase === 'debug' ? runId + '-' : ''}source-snapshot.json`, code, true);
try { await access(out + '/' + prefix + '/input.json'); throw new Error('不得覆盖已有运行，请保留失败并更换attempt或batch'); } catch (e) { if (e.code !== 'ENOENT') throw e; }
const sample = samples[sampleId], task = JSON.stringify({ task: '在AI验证分类下，按原件直接构建可编辑模板并配置有依据的引用、追溯及业务用途。自行查适用知识与关系、实际业务上下文，保留原文，覆盖实际填写区域，完成后读回检查并看原生预览修正版式。只把查不到且影响本次结果的业务决策交给用户。', form: sample.input });
await save(prefix + '/input.json', { phase, provider, sampleId, task, protocolHash: hash(protocol), sampleHash: hash(sample) }, true);
const session = createControlledSession({ knowledge, designer, token, sample, runId }), model = await createProvider(provider, instructions, tools, task);
const result = { runId, phase, provider, sampleId, startedAt: new Date().toISOString(), status: 'failed', requests: [], costEstimateUsd: 0 };
const start = performance.now();
let pendingPreviewRevision;
try {
  for (let round = 1; round <= maxRounds; round++) {
    const history = JSON.stringify(model.history), images = history.match(/data:image\/png;base64,/g)?.length ?? 0;
    const size = history.replace(/data:image\/png;base64,[A-Za-z0-9+/=]+/g, '[image]').length + instructions.length + JSON.stringify(tools).length;
    const next = (size + images * 10000) * (provider === 'openai' ? 2.5 : .3) / 1e6 + 20000 * (provider === 'openai' ? 10 : 1.2) / 1e6;
    if (result.costEstimateUsd + next > budgetUsd) throw new Error('达到保守估算预算停止阈值');
    const response = await model.call(); await save(prefix + `/response-${round}.json`, response, true);
    if (pendingPreviewRevision) { session.observePreview(pendingPreviewRevision); pendingPreviewRevision = null; }
    result.requests.push({ round, requestId: response.requestId, model: response.model, usage: response.usage, seconds: response.seconds, estimatedCostUsd: response.estimatedCostUsd });
    result.costEstimateUsd += response.estimatedCostUsd;
    console.log(JSON.stringify({ runId, round, tools: response.calls.map(c => c.name), cost: result.costEstimateUsd }));
    const screenshots = [];
    for (const call of response.calls) {
      let output;
      try { output = await session.execute(call.name, JSON.parse(call.arguments)); } catch (e) { output = { error: e.message }; }
      model.result(call, output);
      if (call.name === 'preview_template' && output.images) { screenshots.push(...output.images); pendingPreviewRevision = output.revision; }
      if (output.error || output.saved === false || output.finished === false) console.log(JSON.stringify({ tool: call.name, error: output.error, errors: output.semanticErrors ?? output.errors ?? output.defects }));
    }
    if (screenshots.length) {
      const blocks = [{ type: provider === 'openai' ? 'input_text' : 'text', text: '这是preview_template返回的当前已保存版本原生截图。核对裁切、字段大小、重复区与原件；需要时局部修复后重新预览。' }];
      const imageEvidence = [];
      for (const file of screenshots) {
        const bytes = await readFile(file), url = 'data:image/png;base64,' + bytes.toString('base64');
        blocks.push(provider === 'openai' ? { type: 'input_image', image_url: url, detail: 'high' } : { type: 'image_url', image_url: { url, detail: 'high' } });
        imageEvidence.push({ file, sha256: createHash('sha256').update(bytes).digest('hex') });
      }
      model.user(blocks); await save(prefix + `/image-input-${round}.json`, imageEvidence, true);
    }
    if (session.extra.finished) { result.status = session.extra.finished.status; break; }
    if (!response.calls.length) model.user('请使用工具继续完成；无法修复时明确partial，不把建议当执行成功。');
  }
  if (!session.extra.finished) result.failure = '未在轮数或预算内结束';
} catch (e) { result.failure = e.message; }
Object.assign(result, { seconds: (performance.now() - start) / 1000, saved: !!session.state.payload, inspected: session.state.inspected, templateId: session.state.template?.id, versionId: session.state.template?.versions[0]?.id,
  finish: session.extra.finished, questions: session.extra.finished?.questions ?? session.state.draft?.questions ?? [], knowledgeIdsRead: [...session.state.queriedIds], applicableQueries: session.extra.applicableQueries,
  checks: session.extra.lastCheck, preview: session.extra.preview, saves: session.state.saves });
if (session.state.draft) await save(prefix + '/draft.json', session.state.draft, true);
if (session.state.readback) await save(prefix + '/readback.json', session.state.readback, true);
await save(prefix + '/result.json', result, true); console.log(JSON.stringify({ runId, status: result.status, saved: result.saved, questions: result.questions.length, failure: result.failure, cost: result.costEstimateUsd }));
