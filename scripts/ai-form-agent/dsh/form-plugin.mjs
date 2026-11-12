import { readFile, writeFile, rename, unlink } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { validateJsonSchemaValue } from '@deepseek-ai/dsh-tools';
import { api, out } from '../common.mjs';
import { createControlledSession, tools } from '../v3/tools.mjs';
import { nativePreview } from '../v3/preview.mjs';

const writes = new Set(['save_template', 'patch_template']);
const render = (_args, result) => [{ type: 'text', text: JSON.stringify(result) }];

// A task-local adapter, with a stable scope decided by the host, not by model arguments.
export async function createFormPlugin({ directory, runId, getGrant, resume, onWrite, beforeCheckpoint, ...options }) {
  const checkpointPath = directory + '/checkpoint.json', pendingPath = directory + '/write-pending.json';
  if (existsSync(pendingPath)) throw new Error('Prior write outcome unknown. Reconcile the native template before resuming.');
  const checkpoint = resume ? JSON.parse(await readFile(checkpointPath, 'utf8')) : undefined;
  if (checkpoint) {
    const logs = out + '/runs/' + runId;
    if (existsSync(logs + '/controlled-tool-' + (checkpoint.extra.calls.length + 1) + '.json') ||
        existsSync(logs + '/tool-' + (checkpoint.base.state.calls.length + 1) + '.json')) {
      throw new Error('Tool log is ahead of the checkpoint. Reconcile the task before resuming.');
    }
  }
  const authorized = name => {
    const grant = getGrant();
    return grant.enabled && grant.entitled && grant.canRead && (!writes.has(name) || grant.canWrite);
  };
  let active = false, operation;
  const session = createControlledSession({ ...options, runId, checkpoint, codePrefix: 'AGENT-DSH-',
    preview: input => nativePreview({ ...input, runId: 'dsh-' + input.runId }),
    async write(route, token, method, body) {
      operation.signal.throwIfAborted();
      if (!active || !authorized(operation.name)) throw new Error('Form capability write authorization revoked');
      if (!operation.started) {
        await writeFile(pendingPath, JSON.stringify({ callId: operation.callId, method, route, templateCode: 'AGENT-DSH-' + runId.toUpperCase() }), { flag: 'wx', mode: 0o600, flush: true });
        operation.started = true;
      }
      operation.signal.throwIfAborted();
      if (!active || !authorized(operation.name)) throw new Error('Form capability write authorization revoked');
      const result = await api(route, token, method, body);
      await onWrite?.(method, result);
      return result;
    } });

  const plugin = {
    name: 'edhr-form-builder',
    inject: ['tools', 'attachments'],
    apply(ctx) {
      active = true;
      ctx.effect(() => () => { active = false; });
      for (const tool of tools) ctx.tools.register({ ...tool, output: { schema: {}, render },
        async execute(args, exec) {
          if (!active || exec.agent?.session.id !== runId || !authorized(tool.name)) throw new Error('Form capability denied for this task');
          if (existsSync(pendingPath)) throw new Error('Prior write outcome unknown. Stop and reconcile.');
          exec.signal.throwIfAborted();
          const errors = validateJsonSchemaValue(tool.parameters, args);
          if (errors.length) throw new Error(errors.join('; '));
          operation = { name: tool.name, callId: exec.callId, signal: exec.signal, started: false };
          try {
            const result = await session.execute(tool.name, args);
            if (operation.started && !result.saved) throw new Error('Native write outcome requires reconciliation: ' + (result.error ?? 'unknown'));
            await beforeCheckpoint?.(tool.name);
            await writeFile(checkpointPath + '.tmp', JSON.stringify(session.checkpoint()), { mode: 0o600, flush: true });
            await rename(checkpointPath + '.tmp', checkpointPath);
            if (operation.started) await unlink(pendingPath);
            if (result.finished) exec.concludeTurn();
            if (!result.images?.length) return JSON.parse(JSON.stringify(result));
            const attachments = await ctx.attachments.saveImages(await Promise.all(result.images.map(async file => ({ data: await readFile(file), mediaType: 'image/png' }))));
            const { images: _paths, evidenceDirectory: _local, ...visible } = result;
            return { ...visible, attachments };
          } finally { operation = undefined; }
        },
      }, { when: ({ agent }) => active && agent.session.id === runId && authorized(tool.name) });
    },
  };
  return { plugin, session };
}
