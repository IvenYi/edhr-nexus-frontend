import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile, unlink, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { validateJsonSchemaValue } from '@deepseek-ai/dsh-tools';
import { WorkerRejection } from './client.mjs';

const design = { type: 'string', maxLength: 2_000_000 };
const fields = { modelDesignJson: design, canvasDesignJson: design, workflowDesignJson: design };
const schema = properties => ({ type: 'object', properties, additionalProperties: false });
const edit = { ...schema({ op: { enum: ['add','replace','remove','test'] }, path: { type:'string',minLength:1,maxLength:500 }, value: {} }), required:['op','path'] };
const patches = schema(Object.fromEntries(Object.keys(fields).map(key=>[key,{type:'array',minItems:1,maxItems:100,items:edit}])));
const definitions = [
  { name: 'read_current_form', description: '读取本任务原生表单的当前内容与修订；保存前必须读取。', parameters: schema({}) },
  { name: 'create_form', description: '在指定分类下创建本任务唯一表单。返回保存回执，不代表任务完成。', parameters: { ...schema({ ...fields, categoryName: { type: 'string', minLength: 1, maxLength: 200 }, name: { type: 'string', maxLength: 200 }, version: { type: 'string', maxLength: 100 } }), required: ['categoryName'] } },
  { name: 'save_form_design', description: '保存本任务刚刚读回的表单设计；必须保留未修改的原生配置。', parameters: { ...schema(fields), required: Object.keys(fields) } },
  { name: 'get_applicable_knowledge', description: '查询本任务授权的固定知识包，返回来源、成熟度、未决范围及续页。内部验证知识不授予业务执行权限。', parameters:{...schema({query:{type:'string',minLength:1,maxLength:500},offset:{type:'integer',minimum:0,maximum:10000}}),required:['query']} },
  { name: 'query_business_relations', description: '按知识ID查概念关系及定义；省略ID返回当前查找统计配置目录。catalog.reference-dictionaries配合query查实际字典，catalog.material-types查物料类型。不是生产实例关系，不能据名称推断真实业务归属。', parameters:schema({id:{type:'string',maxLength:200},query:{type:'string',maxLength:500},offset:{type:'integer',minimum:0,maximum:10000}}) },
  { name: 'patch_form', description: '在刚读回的修订上按JSON Pointer局部修改modelDesignJson/canvasDesignJson/workflowDesignJson，未触及配置原样保留。数组位置来自当前读取，建议先test字段ID；不支持移动、复制和根替换。', parameters:{...schema({expectedRevision:{type:'integer',minimum:0},patches}),required:['expectedRevision','patches']} },
  { name: 'check_form', description: '检查本任务当前保存修订的原生配置及语义约束；不证明原表完整或客户正式来源职责。', parameters:schema({}) },
  { name: 'preview_form', description: '用离线原生组件渲染当前修订，返回真实截图证据及裁切反馈；修改后重新预览，不等于配置完成。', parameters:schema({}) },
];
export const formToolNames = definitions.map(tool=>tool.name).sort();

// A stable operation identity survives lost responses and DSH call replay.
export function operationId(runId, callId) {
  return createHash('sha256').update(JSON.stringify([runId, callId])).digest('hex');
}

export async function createNativeFormPlugin({ client, claim, sessionId, directory, signal: hostSignal, preview, authoring }) {
  if (claim.state !== 'RUNNING' || !Number.isSafeInteger(claim.leaseEpoch) || claim.leaseEpoch < 1 ||
      !/^[\da-f-]{36}$/i.test(claim.taskId) || !/^[\da-f-]{36}$/i.test(claim.runId) || !sessionId) throw new Error('Claim required');
  const lease = Object.freeze({ taskId: claim.taskId, runId: claim.runId, leaseEpoch: claim.leaseEpoch });
  const home = join(directory, claim.taskId);
  await mkdir(home, { recursive: true, mode: 0o700 });
  const journal = join(home, 'pending-writes');
  await mkdir(journal, { recursive: true, mode: 0o700 });
  async function pendingWrites() {
    const files = (await readdir(journal)).map(name => join(journal, name));
    files.push(join(home, 'pending-write.json')); // Conservatively recognize the 2A marker.
    const entries = [];
    for (const file of files) {
      try { entries.push({ ...JSON.parse(await readFile(file, 'utf8')), file }); }
      catch (error) { if (error.code !== 'ENOENT') throw error; }
    }
    return entries;
  }
  async function clearMarker(file) {
    try { await unlink(file); } catch (error) { if (error.code !== 'ENOENT') throw error; }
  }
  let active = false, busy = false, revision;
  const lifetime = new AbortController();
  async function reconcile(signal) {
    if (busy) throw new Error('Concurrent form operation denied');
    busy = true;
    try {
      let result = null;
      for (const pending of await pendingWrites()) {
        // Missing receipt is inconclusive: an earlier request may still be committing.
        result = await client.reconcile(lease, pending.operationId, signal);
        if (result?.receipt?.operationId !== pending.operationId || result.receipt.taskId !== lease.taskId) throw new Error('Receipt mismatch');
        await clearMarker(pending.file);
        revision = undefined;
      }
      return result;
    } finally { busy = false; }
  }
  const plugin = {
    name: 'edhr-native-form', inject: ['tools'],
    apply(ctx) {
      active = true;
      ctx.effect(() => () => { active = false; lifetime.abort(); });
      const tools = authoring ? definitions.map(tool => tool.name === 'create_form' ? { ...tool, ...authoring.tool } : tool) : definitions;
      for (const tool of tools) ctx.tools.register({ ...tool,
        output: { schema: {}, render: (_args, result) => [{ type: 'text', text: JSON.stringify(result) }] },
        async execute(args, exec) {
          if (!active || exec.agent?.session.id !== sessionId) throw new Error('Task scope denied');
          if (busy) throw new Error('Concurrent form operation denied');
          const errors = validateJsonSchemaValue(tool.parameters, args);
          if (errors.length) throw new Error('Invalid form arguments');
          const signal = AbortSignal.any([exec.signal, lifetime.signal, ...(hostSignal ? [hostSignal] : [])]);
          signal.throwIfAborted();
          busy = true;
          if (!exec.callId) { busy = false; throw new Error('Stable tool call ID required'); }
          const id = operationId(lease.runId, exec.callId);
          const pendingFile = join(journal, id + '.json');
          let started = false, pending = false;
          try {
            if ((await pendingWrites()).length) throw new Error('Write outcome unknown; host must reconcile receipt');
            await client.toolEvent(lease, id, tool.name, 'STARTED', signal);
            started = true;
            if (['get_applicable_knowledge','query_business_relations'].includes(tool.name))
              return await client.query(lease,id,tool.name,args,signal);
            if (tool.name === 'read_current_form') {
              const result = await client.read({ ...lease, callId: id }, signal);
              signal.throwIfAborted();
              revision = result.version.revision;
              return result;
            }
            if (['check_form','preview_form','patch_form'].includes(tool.name) && !Number.isSafeInteger(revision)) throw new Error('Read current form before inspection or patch');
            if (tool.name === 'check_form') return await client.inspect(lease,id,tool.name,revision,signal);
            if (tool.name === 'preview_form') {
              if (!preview) throw new Error('Native preview renderer unavailable');
              const snapshot = await client.inspect(lease,id,tool.name,revision,signal);
              const observed = await preview({ snapshot: snapshot.snapshot, signal, directory: join(home,'previews',id) });
              signal.throwIfAborted();
              const evidence = await client.previewFeedback(lease,id,{ revision,artifactHash:observed.artifactHash,pages:observed.pages,issueCount:observed.issues.length },signal);
              return { ...observed, artifactId: id + '/preview.png', evidence };
            }
            if (tool.name === 'patch_form' && args.expectedRevision !== revision) throw new Error('Patch revision differs from current read');
            if (tool.name === 'save_form_design' && !Number.isSafeInteger(revision)) throw new Error('Read current form before saving');
            const form = tool.name === 'create_form'
              ? (authoring ? await authoring.compile(args) : args) : { ...args, expectedRevision: revision };
            // Only identity is journaled; no customer design, credential or model reasoning.
            const marker = { operationId: id, runId: lease.runId };
            await writeFile(pendingFile, JSON.stringify(marker), { flag: 'wx', mode: 0o600, flush: true });
            pending = true;
            revision = undefined;
            signal.throwIfAborted();
            let result;
            try {
              result = tool.name === 'patch_form' ? await client.patch(lease,id,form.expectedRevision,args.patches,signal)
                : await client.write(lease, id, tool.name === 'create_form' ? 'create' : 'save-design', form, signal);
            } catch (error) {
              if (error instanceof WorkerRejection) {
                await clearMarker(pendingFile);
                pending = false;
              }
              throw error;
            }
            if (result?.receipt?.operationId !== id || result.receipt.taskId !== lease.taskId) throw new Error('Receipt mismatch');
            await clearMarker(pendingFile);
            pending = false;
            signal.throwIfAborted();
            return result;
          } catch (error) {
            if (started && !signal.aborted) {
              try { await client.toolEvent(lease, id, tool.name, pending ? 'RESULT_UNKNOWN' : 'FAILED', signal); }
              catch { /* The native receipt remains authoritative if reporting also fails. */ }
            }
            throw error;
          } finally { busy = false; }
        },
      }, { when: ({ agent }) => active && agent.session.id === sessionId });
    },
  };
  return { plugin, reconcile };
}
