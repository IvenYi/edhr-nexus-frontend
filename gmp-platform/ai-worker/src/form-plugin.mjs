import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile, unlink, readdir } from 'node:fs/promises';
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

export async function createNativeFormPlugin({ client, claim, sessionId, directory, signal: hostSignal }) {
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
      for (const tool of definitions) ctx.tools.register({ ...tool,
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
            if (tool.name === 'read_current_form') {
              const result = await client.read({ ...lease, callId: id }, signal);
              signal.throwIfAborted();
              revision = result.version.revision;
              return result;
            }
            if (tool.name === 'save_form_design' && !Number.isSafeInteger(revision)) throw new Error('Read current form before saving');
            const form = tool.name === 'create_form' ? args : { ...args, expectedRevision: revision };
            // Only identity is journaled; no customer design, credential or model reasoning.
            const marker = { operationId: id, runId: lease.runId };
            await writeFile(pendingFile, JSON.stringify(marker), { flag: 'wx', mode: 0o600, flush: true });
            pending = true;
            revision = undefined;
            signal.throwIfAborted();
            let result;
            try {
              result = await client.write(lease, id, tool.name === 'create_form' ? 'create' : 'save-design', form, signal);
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
