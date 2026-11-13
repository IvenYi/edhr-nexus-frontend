import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile, unlink } from 'node:fs/promises';
import { join } from 'node:path';
import { validateJsonSchemaValue } from '@deepseek-ai/dsh-tools';
import { WorkerRejection } from './client.mjs';

const design = { type: 'string', maxLength: 2_000_000 };
const fields = { modelDesignJson: design, canvasDesignJson: design, workflowDesignJson: design };
const schema = properties => ({ type: 'object', properties, additionalProperties: false });
const definitions = [
  { name: 'read_current_form', description: '读取本任务原生表单的当前内容与修订；保存前必须读取。', parameters: schema({}) },
  { name: 'create_form', description: '在指定分类下创建本任务唯一表单。返回保存回执，不代表任务完成。', parameters: { ...schema({ ...fields, categoryName: { type: 'string', minLength: 1, maxLength: 200 }, name: { type: 'string', maxLength: 200 }, version: { type: 'string', maxLength: 100 } }), required: ['categoryName'] } },
  { name: 'save_form_design', description: '保存本任务刚刚读回的表单设计；必须保留未修改的原生配置。', parameters: { ...schema(fields), required: Object.keys(fields) } },
];

// A stable operation identity survives lost responses and DSH call replay.
export function operationId(runId, callId) {
  return createHash('sha256').update(JSON.stringify([runId, callId])).digest('hex');
}

export async function createNativeFormPlugin({ client, claim, sessionId, directory }) {
  if (claim.state !== 'RUNNING' || !Number.isSafeInteger(claim.leaseEpoch) || claim.leaseEpoch < 1 ||
      !/^[\da-f-]{36}$/i.test(claim.taskId) || !/^[\da-f-]{36}$/i.test(claim.runId) || !sessionId) throw new Error('Claim required');
  const lease = Object.freeze({ taskId: claim.taskId, runId: claim.runId, leaseEpoch: claim.leaseEpoch });
  const home = join(directory, claim.taskId);
  await mkdir(home, { recursive: true, mode: 0o700 });
  const pendingFile = join(home, 'pending-write.json');
  let pending;
  try { pending = JSON.parse(await readFile(pendingFile, 'utf8')); }
  catch (error) { if (error.code !== 'ENOENT') throw error; }
  let active = false, busy = false, revision;
  const lifetime = new AbortController();
  async function reconcile(signal) {
    if (busy) throw new Error('Concurrent form operation denied');
    if (!pending) return null;
    busy = true;
    try {
    // Missing receipt is inconclusive: an earlier request may still be committing.
    const result = await client.receipt(lease.taskId, pending.operationId, signal);
    if (result?.receipt?.operationId !== pending.operationId || result.receipt.taskId !== lease.taskId) throw new Error('Receipt mismatch');
    await unlink(pendingFile);
    pending = undefined;
    revision = undefined;
    return result;
    } finally { busy = false; }
  }
  const plugin = {
    name: 'edhr-native-form', inject: ['tools'],
    apply(ctx) {
      active = true;
      ctx.effect(() => () => { active = false; lifetime.abort(); });
      for (const tool of definitions) ctx.tools.register({ ...tool,
        output: { schema: {}, render: (_args, result) => [{ type: 'text', text: JSON.stringify(result) }] },
        async execute(args, exec) {
          if (!active || exec.agent?.session.id !== sessionId) throw new Error('Task scope denied');
          if (busy) throw new Error('Concurrent form operation denied');
          const errors = validateJsonSchemaValue(tool.parameters, args);
          if (errors.length) throw new Error('Invalid form arguments');
          const signal = AbortSignal.any([exec.signal, lifetime.signal]);
          signal.throwIfAborted();
          busy = true;
          try {
            if (pending) throw new Error('Write outcome unknown; host must reconcile receipt');
            if (tool.name === 'read_current_form') {
              const result = await client.read(lease, signal);
              signal.throwIfAborted();
              revision = result.version.revision;
              return result;
            }
            if (!exec.callId) throw new Error('Stable tool call ID required');
            if (tool.name === 'save_form_design' && !Number.isSafeInteger(revision)) throw new Error('Read current form before saving');
            const id = operationId(lease.runId, exec.callId);
            const form = tool.name === 'create_form' ? args : { ...args, expectedRevision: revision };
            // Only identity is journaled; no customer design, credential or model reasoning.
            const marker = { operationId: id, runId: lease.runId };
            await writeFile(pendingFile, JSON.stringify(marker), { flag: 'wx', mode: 0o600, flush: true });
            pending = marker;
            revision = undefined;
            signal.throwIfAborted();
            let result;
            try {
              result = await client.write(lease, id, tool.name === 'create_form' ? 'create' : 'save-design', form, signal);
            } catch (error) {
              if (error instanceof WorkerRejection) {
                await unlink(pendingFile);
                pending = undefined;
              }
              throw error;
            }
            if (result?.receipt?.operationId !== id || result.receipt.taskId !== lease.taskId) throw new Error('Receipt mismatch');
            await unlink(pendingFile);
            pending = undefined;
            signal.throwIfAborted();
            return result;
          } finally { busy = false; }
        },
      }, { when: ({ agent }) => active && agent.session.id === sessionId });
    },
  };
  return { plugin, reconcile };
}
