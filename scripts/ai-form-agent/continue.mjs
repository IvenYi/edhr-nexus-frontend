// Separate continuation probe on a copy; original scored templates and evidence stay unchanged.
import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import { out, read, save, api, login, templates, loadDesigner, hash } from './common.mjs';
import { loadKnowledge } from './knowledge.mjs';
import { createProvider } from './providers.mjs';
import { createSession, tools } from './tools.mjs';

const token = await login(), designer = await loadDesigner(), knowledge = await loadKnowledge();
for (const provider of ['deepseek', 'openai']) {
  const sourceId = 'clean-' + provider + '-1', runId = sourceId + '-continuation' + (process.argv.includes('--retest') ? '-retest' : '');
  try { await access(out + '/runs/' + runId + '/continuation.json'); console.log('skip ' + runId); continue; } catch {}
  const source = await read('runs/' + sourceId + '/result.json'), original = await read('runs/' + sourceId + '/readback.json'), draft = await read('runs/' + sourceId + '/draft.json');
  const version = original.versions.find(v => v.id === source.versionId);
  const before = { modelDesignJson: version.modelDesignJson, canvasDesignJson: version.canvasDesignJson, workflowDesignJson: version.workflowDesignJson };
  const target = await api(templates, token, 'POST', { code: 'AGENT-V2-' + runId.toUpperCase(), name: original.name + ' · 连续编辑副本', version: 'V1.0', categoryName: 'AI验证' });
  const saved = await api(`${templates}/${target.id}/versions/${target.versions[0].id}/design`, token, 'PUT', before);
  const session = createSession({ knowledge, sample: {}, designer, token, runId });
  Object.assign(session.state, { template: target, draft, payload: { modelDesignJson: saved.modelDesignJson, canvasDesignJson: saved.canvasDesignJson, workflowDesignJson: saved.workflowDesignJson } });
  const task = '继续编辑刚建立表单的实验副本：把“NCR编号”字段名称改为“不合格报告编号”。其他字段、位置、业务用途和未决业务口径全部保持，不用再询问。请先读取现有配置，完成后读回检查。';
  const selectedTools = tools.filter(t => ['inspect_template', 'rename_field', 'finish_task', 'query_business'].includes(t.name));
  const model = await createProvider(provider, '你是eDHR表单Agent。操作目标已绑定本会话副本，只执行用户本次修改；使用工具读、改、读回，不虚构成功。', selectedTools, task);
  const codeHashes = Object.fromEntries(await Promise.all(['continue.mjs', 'tools.mjs', 'providers.mjs'].map(async file => [file, hash(await readFile(import.meta.dirname + '/' + file, 'utf8'))])));
  await save('runs/' + runId + '/continuation-input.json', { sourceId, sourceTemplateId: original.id, targetTemplateId: target.id, task, before, tools: selectedTools, codeHashes, maxRounds: 6 }, true);
  const responses = [];
  let failure;
  try {
    for (let round = 1; round <= 6; round++) {
      const response = await model.call(); responses.push({ requestId: response.requestId, seconds: response.seconds, usage: response.usage, estimatedCostUsd: response.estimatedCostUsd });
      await save('runs/' + runId + '/response-' + round + '.json', response, true);
      for (const call of response.calls) model.result(call, await session.execute(call.name, JSON.parse(call.arguments)));
      if (session.state.finished) break;
    }
    assert.ok(session.state.finished, 'agent did not finish');
    const actual = session.state.readback.versions.find(v => v.id === target.versions[0].id);
    const m = JSON.parse(actual.modelDesignJson), c = JSON.parse(actual.canvasDesignJson), old = JSON.parse(before.modelDesignJson);
    const field = old.payload.fields.find(f => f.name === 'NCR编号'); assert.ok(field);
    assert.equal(m.payload.fields.find(f => f.id === field.id).name, '不合格报告编号');
    m.payload.fields.find(f => f.id === field.id).name = field.name;
    for (const p of c.payload.pages) for (const n of p.nodes) if (n.bindings?.fieldId === field.id) n.props.label = field.name;
    assert.deepEqual(m, old); assert.deepEqual(c, JSON.parse(before.canvasDesignJson)); assert.equal(actual.workflowDesignJson, before.workflowDesignJson);
  } catch (error) { failure = error.message; }
  await save('runs/' + runId + '/continuation.json', { provider, sourceId, targetTemplateId: target.id, status: failure ? 'failed' : 'passed', failure, responses, finish: session.state.finished }, true);
  console.log(JSON.stringify({ runId, status: failure ? 'failed' : 'passed', failure }));
}
