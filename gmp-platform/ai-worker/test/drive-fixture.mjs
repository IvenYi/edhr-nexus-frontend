import assert from 'node:assert/strict';
import { LlmAdapter, ToolCallId, createUserMessage } from '@deepseek-ai/dsh-llm';
import { SessionId } from '@deepseek-ai/dsh-session';
import { formToolNames } from '../src/form-plugin.mjs';
import { nativeFixture } from './native-fixture.mjs';

// Deterministic model replacement, never a production provider or natural-language parser.
export async function driveFixture({ ctx, claim, signal }) {
  assert.equal(claim.config.modelConfig, 'fixture-no-model');
  const expected = formToolNames;
  let finished=false;
  class Fixture extends LlmAdapter {
    index = 0;
    async resolveModel(provider, id) { return { provider, id, name: id }; }
    async *stream(input) {
      assert.deepEqual(input.tools.map(t => t.name).sort(), expected);
      assert.equal(input.messages.filter(message=>message.role==='tool' && message.isError && String(message.toolCallId).startsWith('fixture-'+claim.leaseEpoch+'-')).length,0,'Fixture must stop on current-epoch tool failure');
      const workbench=process.env.EDHR_AI_WORKBENCH==='1';
      const steps = workbench ? ['get_applicable_knowledge','query_business_relations','create_form','read_current_form','patch_form','read_current_form','check_form','preview_form']
        : claim.templateId ? ['read_current_form', 'save_form_design'] : ['create_form', 'read_current_form', 'save_form_design'];
      const name = steps[this.index++];
      let args = {};
      if (name === 'create_form') args = { categoryName: 'AI隔离验证', modelDesignJson: '{}', canvasDesignJson: '{}', workflowDesignJson: '{}' };
      if(workbench && name==='create_form')args={categoryName:'AI隔离验证',...nativeFixture()};
      if(name==='get_applicable_knowledge')args={query:'追溯'};
      if(name==='query_business_relations')args={id:'concept.form-template-field'};
      if(name==='patch_form') {
        const reads=input.messages.filter(message=>message.role==='tool').flatMap(message=>message.content)
          .filter(block=>block.type==='text').map(block=>{try{return JSON.parse(block.text);}catch{return null;}}).filter(result=>result?.version);
        assert.ok(reads.length,'Current read must be projected to the model');
        args={expectedRevision:reads.at(-1).version.revision,patches:{modelDesignJson:[{op:'test',path:'/payload/fields/0/id',value:'date'},{op:'replace',path:'/payload/fields/0/name',value:'生产日期'}]}};
      }
      if (name === 'save_form_design') {
        // DSH tool message names differ by provider projection; fixture values remain synthetic.
        args = { modelDesignJson: '{}', canvasDesignJson: '{}', workflowDesignJson: '{}' };
      }
      const block = name ? { type: 'tool-call', id: ToolCallId('fixture-' + claim.leaseEpoch + '-' + this.index), name, arguments: JSON.stringify(args) } : { type: 'text', text: 'fixture ended; no business success claim' };
      if(!name)finished=true;
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
    assert.ok(finished,'Fixture did not reach the final step');
    await ctx.sessions.flush(agent.session);
    const errors = agent.session.snapshotEvents().filter(e => e.type === 'tool/result' && e.data.isError);
    assert.equal(errors.length, 0);
  } finally { signal.removeEventListener('abort', abort); unregister(); }
}
