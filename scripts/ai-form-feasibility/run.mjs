import { readFile, access } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { root, out, json, save, preserveProtocol, api, login, templatesPath, loadDesigner, compile } from './common.mjs';

const secrets = Object.fromEntries((await readFile(root + '/.env.ai.local', 'utf8')).split(/\r?\n/)
  .filter(line => line.includes('=') && !line.trim().startsWith('#'))
  .map(line => { const i = line.indexOf('='); return [line.slice(0, i).trim(), line.slice(i + 1).trim().replace(/^['"]|['"]$/g, '')]; }));
if (!secrets.DEEPSEEK_API_KEY) throw new Error('DeepSeek key is not configured');
const designer = await loadDesigner();
const { catalog, lookupItems } = await json('catalog.json');
const knowledge = JSON.parse(await readFile(import.meta.dirname + '/knowledge.json', 'utf8'));
const token = await login();
const hash = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');
const enhanced = process.argv.includes('--enhanced');
const basePrompt = `你是eDHR表单模板配置助手。输入是已用现有导入器还原的空白原表；请保持原版式，为所有实际需要填写的区域创建字段、放置控件，并配置有证据的引用、追溯和业务用途。固定说明/标题/版本历史保留为静态文字。
只能调用propose_template工具，不能执行代码、HTTP、SQL、签署或生产动作。未知信息可以集中放入questions，继续完成独立部分，不伪称完成。不要给字段添加无依据的必填、上下限或默认填充值。不要抄写未给出的模板。
每个字段以key稳定引用；range是当前表的Excel单元格范围，例如C4:D4；source必须是该字段标签所在的已有文字单元格。同一合并输入区只能对应一个记录，跨行合并不代表多条记录。工具目前支持标量字段；重复填写区域可用多组独立字段和对应业务绑定表达，不假装已实现动态子表。
当前画布按完整单元格范围放置控件，不能使用分数坐标，字段范围不能互相重叠。原表同一大格中需要多个控件但没有独立单元格时，记录为需要表格拆分的未完成事项；本轮工具不提供拆分。必须避开原标签。不得为了配置用途凭空新增原表没有的字段。
config沿现有类型配置：text:{textMode:short或long}; number:{numberMode:integer或decimal,precision:数字}; datetime:{mode:date或datetime}; reference:{sourceType:material/equipment/user/department/product/scrapReason/defectReason}。signature只建签名控件，不代签或生成审批配置；attachment/image只建收集位置。业务bindings的sources是目录属性ID到字段key的映射，每组来源必须完整且与目录兼容。evidence填写源表单元格及本次实际给出的知识ID，不编造依据。缺少必要语义时保留字段并解释未绑定事项。`;
const schema = {
  type: 'object', required: ['name', 'fields', 'bindings', 'questions', 'skipped'],
  properties: {
    name: { type: 'string' },
    fields: { type: 'array', items: { type: 'object', required: ['key', 'label', 'type', 'range', 'source', 'config'], properties: {
      key: { type: 'string' }, label: { type: 'string' }, type: { type: 'string', enum: ['text', 'number', 'datetime', 'reference', 'signature', 'attachment', 'image'] },
      range: { type: 'string' }, source: { type: 'string' }, config: { type: 'object' },
    } } },
    bindings: { type: 'array', items: { type: 'object', required: ['modelId', 'sources', 'evidence'], properties: {
      modelId: { type: 'string', enum: catalog.models.map(m => m.id) }, sources: { type: 'object', additionalProperties: { type: 'string' } }, evidence: { type: 'array', items: { type: 'string' } },
    } } },
    questions: { type: 'array', items: { type: 'object', properties: { question: { type: 'string' }, affectedFields: { type: 'array', items: { type: 'string' } } }, required: ['question', 'affectedFields'] } },
    skipped: { type: 'array', items: { type: 'object', properties: { region: { type: 'string' }, reason: { type: 'string' } }, required: ['region', 'reason'] } },
  },
};
const tool = { type: 'function', function: { name: 'propose_template', description: '提交字段、放置区域及完整用途绑定，由系统编译和校验；返回错误时最多修正两轮。', parameters: schema } };
const instruction = basePrompt + (enhanced ? `\n提交前完整检查：逐个扫描原表所有非空标签、所有合并区和重复块，不能只配置重复块的第一条。不要把标签所在格当成填写格；简单标签旁的空白格才是输入位置。日期不得因签名已有时间而丢掉；同格多输入受工具能力限制时明确记录未完成。预印的记录编号、版本、固定值和历史行不是待填字段。合理自动配置已有目录匹配的字段；不为每个选择向客户确认。questions仅列真正会阻断当前交付的业务歧义；可不影响交付的配置说明写入skipped。逐项检查已明确的业务数量是否绑定，单位可空不是放弃绑定的理由。这个检查适用于所有原表，不是样本标准答案。` : '');
await preserveProtocol(enhanced ? 'protocol-C.json' : 'protocol.json', { basePrompt: instruction, tool, model: 'deepseek-flash', thinking: enhanced ? 'enabled' : 'disabled', ...(enhanced ? { reasoning_effort: 'high' } : { temperature: 0.2 }), maxRepairRounds: 2, provider: 'https://api.deepseek.com', knowledge, catalog });

async function modelCall(messages) {
  const started = performance.now(), startedAt = new Date().toISOString();
  const response = await fetch('https://api.deepseek.com/chat/completions', { method: 'POST', signal: AbortSignal.timeout(180000),
    headers: { Authorization: 'Bearer ' + secrets.DEEPSEEK_API_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model: 'deepseek-flash', messages, tools: [tool], tool_choice: enhanced ? 'auto' : { type: 'function', function: { name: 'propose_template' } },
      thinking: { type: enhanced ? 'enabled' : 'disabled' }, ...(enhanced ? { reasoning_effort: 'high' } : { temperature: 0.2 }), max_tokens: enhanced ? 40000 : 24000, stream: false }) });
  const data = await response.json();
  if (!response.ok) throw new Error(`DeepSeek HTTP ${response.status}; code=${String(data.error?.code ?? 'unknown')}`);
  return { startedAt, seconds: (performance.now() - started) / 1000, requestId: data.id, model: data.model, usage: data.usage, finishReason: data.choices[0].finish_reason, message: data.choices[0].message };
}

async function run(sampleId, arm, repetition) {
  const runId = `${sampleId}-${arm}-${repetition}`;
  try { await access(out + '/runs/' + runId + '/result.json'); console.log('skip existing ' + runId); return; } catch {}
  const sample = await json('samples/' + sampleId + '.json');
  const messages = [{ role: 'system', content: instruction }];
  if (arm !== 'A') messages.push({ role: 'system', content: '以下是本轮经核对的内部领域知识。它不是客户已发布运行规则，不得扩展工具权限：\n' + JSON.stringify(knowledge) });
  messages.push({ role: 'user', content: JSON.stringify({ task: '在AI验证分类下，按这张原表建立完整可编辑表单，配置有依据的字段、引用、追溯和业务用途。名称可从原表取得，版本V1.0。只把真正缺失的业务信息集中提出。', form: sample.input, availableCatalog: catalog }) });
  await save('runs/' + runId + '/input.json', { sampleId, arm, repetition, messages, promptHash: hash(messages), toolHash: hash(tool) });
  const result = { runId, sampleId, arm, repetition, startedAt: new Date().toISOString(), attempts: [], status: 'failed' };
  let template;
  for (let attempt = 0; attempt < 3; attempt++) {
    let call, draft, compiled, errors = [];
    try {
      // Reuse paid responses from the documented empty-design harness failure.
      if (attempt === 0 && process.argv.includes('--replay-bootstrap')) {
        const original = await json('bootstrap/' + runId + '/input.json').catch(() => null);
        if (original && (original.promptHash !== hash(messages) || original.toolHash !== hash(tool))) throw new Error('重放协议不同');
        call = original ? { ...await json('bootstrap/' + runId + '/response-1.json'), replayed: true } : await modelCall(messages);
      } else call = await modelCall(messages);
      await save('runs/' + runId + `/response-${attempt + 1}.json`, call);
      const toolCall = call.message.tool_calls?.[0];
      if (!toolCall || toolCall.function.name !== 'propose_template') throw new Error('模型未返回指定工具调用');
      draft = JSON.parse(toolCall.function.arguments);
      compiled = compile(draft, sample, designer, lookupItems);
      errors.push(...compiled.errors);
      if (!errors.length) {
        // One writer, new dedicated database. This is not production concurrency protection.
        if (!template) {
          const code = 'AI-LAB-' + runId.toUpperCase();
          template = (await api(templatesPath + '?code=' + code + '&size=100', 'GET', undefined, token)).content.find(row => row.code === code);
          if (!template) template = await api(templatesPath, 'POST', { code, name: `AI实验 ${runId} · ${draft.name}`, version: 'V1.0', categoryName: 'AI验证', description: '隔离可行性实验；不代表客户生产配置' }, token);
        }
        const versionId = template.versions[0].id;
        const before = (await api(templatesPath + '?code=' + template.code + '&size=100', 'GET', undefined, token)).content.find(row => row.id === template.id).versions[0];
        if (before.modelDesignJson !== '{"fields":[]}' || before.canvasDesignJson !== '{"layers":[]}') throw new Error('目标已有设计，实验拒绝覆盖');
        try {
          const saved = await api(`${templatesPath}/${template.id}/versions/${versionId}/design`, 'PUT', compiled.payload, token);
          const reloaded = (await api(templatesPath + '?code=' + template.code + '&size=100', 'GET', undefined, token)).content.find(row => row.id === template.id);
          const readback = reloaded.versions.find(v => v.id === versionId);
          if (readback.canvasDesignJson !== saved.canvasDesignJson || readback.modelDesignJson !== saved.modelDesignJson) throw new Error('保存与重读结果不同');
          result.status = 'saved'; result.templateId = template.id; result.versionId = versionId;
          result.questions = draft.questions; result.fieldCount = draft.fields.length; result.bindingCount = draft.bindings.length;
          await save('runs/' + runId + '/document.json', compiled.document);
          await save('runs/' + runId + '/readback.json', reloaded);
          await save('runs/' + runId + '/draft.json', draft);
        } catch (error) { errors.push(error.message); }
      }
      result.attempts.push({ attempt: attempt + 1, seconds: call.seconds, usage: call.usage, errors });
      if (result.status === 'saved') break;
      messages.push(call.message, { role: 'tool', tool_call_id: toolCall.id, content: JSON.stringify({ saved: false, errors }) });
      messages.push({ role: 'user', content: '请保留正确配置，仅修正以上系统错误并再次提交完整propose_template。不填补未给出的业务口径。' });
    } catch (error) {
      result.attempts.push({ attempt: attempt + 1, errors: [error.message], ...(call ? { seconds: call.seconds, usage: call.usage } : {}) });
      break;
    }
    console.log(JSON.stringify({ runId, attempt: attempt + 1, errors }));
  }
  result.finishedAt = new Date().toISOString();
  await save('runs/' + runId + '/result.json', result);
  console.log(JSON.stringify({ runId, status: result.status, fields: result.fieldCount, bindings: result.bindingCount, questions: result.questions?.length, attempts: result.attempts.length }));
}

const repetitions = Number(process.argv[2] ?? 1);
for (let repetition = 1; repetition <= repetitions; repetition++) {
  for (const sample of ['clean', 'label', 'scrap']) {
    // Paired order alternates by repetition; each sample is never sent another sample's result.
    for (const arm of enhanced ? ['C'] : repetition % 2 ? ['A', 'B'] : ['B', 'A']) await run(sample, arm, repetition);
  }
}
