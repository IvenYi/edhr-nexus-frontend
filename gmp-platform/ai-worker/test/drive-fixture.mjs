import assert from 'node:assert/strict';
import { LlmAdapter, ToolCallId, createUserMessage } from '@deepseek-ai/dsh-llm';
import { SessionId } from '@deepseek-ai/dsh-session';

// Deterministic model replacement, never a production provider or natural-language parser.
export async function driveFixture({ ctx, claim, signal }) {
  assert.equal(claim.config.modelConfig, 'fixture-no-model');
  const expected = ['create_form', 'read_current_form', 'save_form_design'];
  class Fixture extends LlmAdapter {
    index = 0;
    async resolveModel(provider, id) { return { provider, id, name: id }; }
    async *stream(input) {
      assert.deepEqual(input.tools.map(t => t.name).sort(), expected);
      const steps = claim.templateId ? ['read_current_form', 'save_form_design'] : ['create_form', 'read_current_form', 'save_form_design'];
      const name = steps[this.index++];
      let args = {};
      if (name === 'create_form') args = { categoryName: 'AI隔离验证', modelDesignJson: '{}', canvasDesignJson: '{}', workflowDesignJson: '{}' };
      if (name === 'save_form_design') {
        // DSH tool message names differ by provider projection; fixture values remain synthetic.
        args = { modelDesignJson: '{}', canvasDesignJson: '{}', workflowDesignJson: '{}' };
      }
      const block = name ? { type: 'tool-call', id: ToolCallId('fixture-' + claim.leaseEpoch + '-' + this.index), name, arguments: JSON.stringify(args) } : { type: 'text', text: 'fixture ended; no business success claim' };
      yield { type: 'block-start', index: 0, blockType: block.type };
      yield { type: 'block-end', index: 0, block };
      yield { type: 'finish', reason: { kind: name ? 'tool-calls' : 'stop' } };
    }
  }
  const unregister = ctx.llm.registerAdapter(['fixture'], new Fixture());
  const selection = { provider: 'fixture', model: 'scripted' };
  const agent = claim.leaseEpoch > 1
    ? (await ctx.agents.resume({ resumeSessionId: SessionId(claim.runId), agentOptions: selection })).agent
    : await ctx.agentLoop.create(SessionId(claim.runId), selection);
  const abort = () => agent.cancel({ kind: 'user' });
  signal.addEventListener('abort', abort, { once: true });
  try {
    signal.throwIfAborted();
    agent.followup(createUserMessage({ content: [{ type: 'text', text: 'Execute the isolated fixture.' }], source: { kind: 'user' } }));
    await agent.whenIdle();
    await ctx.sessions.flush(agent.session);
    const errors = agent.session.snapshotEvents().filter(e => e.type === 'tool/result' && e.data.isError);
    assert.equal(errors.length, 0);
  } finally { signal.removeEventListener('abort', abort); unregister(); }
}
