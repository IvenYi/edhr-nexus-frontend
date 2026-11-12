import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { mkdir, readFile } from 'node:fs/promises';
import { LlmAdapter, ToolCallId } from '@deepseek-ai/dsh-llm';
import { root, out, login, api, templates, loadDesigner, save } from '../common.mjs';
import { loadKnowledge } from '../knowledge.mjs';
import { revisionOf } from '../v3/editing.mjs';
import { mountRuntime, openAgent, turn } from './runtime.mjs';
import { createFormPlugin } from './form-plugin.mjs';

if (!process.env.AI_FORM_AGENT_BATCH?.startsWith('ai-form-agent-dsh-') || process.env.AI_FORM_AGENT_PORT !== '18093') throw new Error('Use the isolated DSH batch and server');
const [mode = 'parent', runId = 'boundary-dsh-' + Date.now()] = process.argv.slice(2);
const directory = out + '/' + runId;
await mkdir(directory, { recursive: true, mode: 0o700 });
const selection = { provider: 'fixture', model: 'scripted' };
const token = await login();
const draft = JSON.parse(await readFile(root + '/output/ai-form-agent-v2-20261112/runs/clean-openai-1/draft.json'));
draft.bindings = []; draft.questions = [];
for (const field of draft.fields) if (field.config.sourceType === 'product') field.config = { sourceType: 'material', referenceMaterialScope: 'product', referenceField: 'code' };
const sample = JSON.parse(await readFile(root + '/output/ai-form-builder-v1-20261112/experiments/samples/clean.json'));
const rows = async id => (await api(templates + '?code=' + encodeURIComponent('AGENT-DSH-' + id.toUpperCase()), token)).content;

class Script extends LlmAdapter {
  constructor(steps) { super(); this.steps = steps; this.index = 0; }
  async resolveModel(provider, id) { return { provider, id, name: id }; }
  async *stream(input) {
    const index = this.index++;
    const calls = await this.steps[index]?.(input) ?? [];
    const blocks = calls.length
      ? calls.map(([name, args], n) => ({ type: 'tool-call', id: ToolCallId('call-' + index + '-' + n + '-' + Date.now()), name, arguments: JSON.stringify(args) }))
      : [{ type: 'text', text: 'fixture turn complete' }];
    for (const [n, block] of blocks.entries()) {
      yield { type: 'block-start', index: n, blockType: block.type };
      yield { type: 'block-end', index: n, block };
    }
    yield { type: 'finish', reason: { kind: calls.length ? 'tool-calls' : 'stop' } };
  }
}

const ctx = await mountRuntime(directory + '/dsh', 'EDHR synthetic boundary probe.');
const grant = { enabled: true, entitled: true, canRead: true, canWrite: true };
const resume = mode.endsWith('resume');
let agent;
const toolNames = input => (input.tools ?? []).map(tool => tool.name);
const setup = [['get_applicable_knowledge', { query: '表单 引用 追溯' }], ['query_business', { kind: 'catalog' }]];
const saveDraft = ['save_template', draft];
const allowed = await createFormPlugin({ directory, runId, getGrant: () => grant, token, sample, resume,
  designer: await loadDesigner(), knowledge: await loadKnowledge(),
  onWrite(method) { if (mode === 'ambiguous' && method === 'POST') process.kill(process.pid, 'SIGKILL'); },
  beforeCheckpoint(name) { if (mode === 'read-gap' && name === 'read_template') process.kill(process.pid, 'SIGKILL'); } });
const { plugin, session } = allowed;
let fiber = ctx.plugin(plugin);
await fiber;
const checks = [];
const check = (label, assertion) => { assertion(); checks.push(label); };
const execute = async (steps, label) => {
  const registration = ctx.llm.registerAdapter(['fixture'], new Script(steps));
  try {
    const reason = await turn(ctx, agent, label);
    assert.equal(reason?.kind, 'completed', JSON.stringify(reason));
  } finally { registration(); }
};

try {
  if (mode !== 'parent') {
    ctx.llm.registerAdapter(['fixture'], new Script(mode === 'resume' ? [
      input => {
        assert.ok(input.messages.some(m => m.role === 'tool' && m.content.some(b => b.text?.includes('"saved":true'))));
        return [['patch_template', { expectedRevision: revisionOf(session.state), fields: [{ key: draft.fields[0].key, label: '恢复后修改' }] }]];
      },
    ] : [
      () => [...setup, saveDraft],
      async () => {
        assert.equal(session.state.saves, 1);
        if (mode === 'read-gap') return [['read_template', {}]];
        await ctx.sessions.flush(agent.session);
        process.kill(process.pid, 'SIGKILL');
      },
    ]));
    agent = await openAgent(ctx, runId, selection, resume);
    await turn(ctx, agent, resume ? 'Resume saved task' : 'Create native template');
    assert.equal(session.state.saves, 2);
    await save(runId + '/resumed.json', { id: session.state.template.id, saves: session.state.saves });
  } else {
    // Cordis removes the already-admitted registration while a model response is outstanding.
    const initialRegistration = ctx.llm.registerAdapter(['fixture'], new Script([]));
    agent = await openAgent(ctx, runId, selection);
    initialRegistration();
    await execute([async input => {
      check('only eDHR tools are visible', () => {
        assert.ok(toolNames(input).includes('save_template'));
        assert.ok(toolNames(input).every(name => /^(get_|query_|read_|search_|save_|patch_|inspect_|check_|preview_|finish_)/.test(name)));
      });
      await fiber.dispose();
      return [saveDraft];
    }], 'unload during model request');
    check('unload removes registered tools and prevents a stale write', () => {
      assert.equal(ctx.tools.get('save_template', agent), undefined);
      assert.equal(session.extra.calls.length, 0);
    });
    fiber = ctx.plugin(plugin); await fiber;
    await execute([input => {
      check('re-enable registers tools in the same runtime', () => assert.ok(toolNames(input).includes('save_template')));
      return setup;
    }, () => { grant.canWrite = false; return [saveDraft]; }], 'revoke between model admission and dispatch');
    check('write permission revoked after tool declaration blocks dispatch', () => assert.equal(session.state.saves, 0));
    grant.canWrite = true; grant.entitled = false;
    await execute([input => {
      check('unlicensed customer receives no tools', () => assert.deepEqual(toolNames(input), []));
      return [saveDraft];
    }], 'unlicensed');
    check('unlicensed or revoked calls create no native row', () => assert.equal(session.state.template, null));
    assert.equal((await rows(runId)).length, 0);
    grant.entitled = true;
    await execute([() => [saveDraft]], 'reauthorized write');
    const native = await rows(runId);
    check('authorized tool writes the existing Java API', () => assert.equal(native[0]?.id, session.state.template.id));
    await assert.rejects(api(templates + '/' + native[0].id + '/versions/' + native[0].versions[0].id + '/design', null, 'PUT', session.state.payload), /API 401/);
    checks.push('native Java design save rejects anonymous request');
    const username = runId + '-reader', password = randomUUID();
    await api('/identity/users', token, 'POST', { username, password, displayName: 'DSH isolated no-role probe', roleIds: [] });
    const loginResponse = await api('/auth/login', null, 'POST', { username, password });
    await assert.rejects(api(templates + '/' + native[0].id + '/versions/' + native[0].versions[0].id + '/design', loginResponse.token ?? loginResponse.accessToken, 'PUT', session.state.payload), /API 403/);
    checks.push('native Java design save rejects an authenticated account without template authority');
    await fiber.dispose();
    check('plugin unload leaves the native template available', () => assert.equal(session.state.saves, 1));
    assert.equal((await rows(runId))[0].id, native[0].id);

    const runChild = (scenario, id) => spawnSync(process.execPath, [import.meta.filename, scenario, id], { encoding: 'utf8', timeout: 45000 });
    const restartId = runId + '-restart';
    const killed = runChild('stop', restartId);
    assert.equal(killed.signal, 'SIGKILL', killed.stderr);
    const before = await rows(restartId);
    assert.equal(before.length, 1);
    const restored = runChild('resume', restartId);
    assert.equal(restored.status, 0, restored.stderr);
    const after = await rows(restartId);
    check('SIGKILL and restart restore DSH session and edit the same native version once', () => {
      assert.equal(after.length, 1);
      assert.equal(after[0].id, before[0].id);
      assert.equal(after[0].versions[0].id, before[0].versions[0].id);
      assert.match(after[0].versions[0].modelDesignJson, /恢复后修改/);
    });
    const ambiguousId = runId + '-ambiguous';
    const ambiguous = runChild('ambiguous', ambiguousId);
    assert.equal(ambiguous.signal, 'SIGKILL', ambiguous.stderr);
    const blocked = runChild('ambiguous-resume', ambiguousId);
    assert.match(blocked.stderr, /Prior write outcome unknown/);
    assert.equal((await rows(ambiguousId)).length, 1);
    checks.push('crash after Java create and before checkpoint blocks automatic replay');
    const readGapId = runId + '-read-gap';
    const readGap = runChild('read-gap', readGapId);
    assert.equal(readGap.signal, 'SIGKILL', readGap.stderr);
    const readGapBefore = await rows(readGapId);
    assert.equal(readGapBefore.length, 1);
    const readGapBlocked = runChild('read-gap-resume', readGapId);
    assert.match(readGapBlocked.stderr, /Tool log is ahead of the checkpoint/);
    assert.deepEqual(await rows(readGapId), readGapBefore);
    checks.push('crash between read tool log and checkpoint blocks conflicting replay');
    await save(runId + '/boundary.json', { checks, nativeTemplateId: native[0].id, recoveredTemplateId: after[0].id }, true);
    console.log(JSON.stringify({ runId, checks }));
  }
} finally { await ctx.fiber.dispose(); }
