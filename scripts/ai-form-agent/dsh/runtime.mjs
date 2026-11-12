import { Context } from '@deepseek-ai/cordis';
import Llm, { createUserMessage } from '@deepseek-ai/dsh-llm';
import Session, { SessionId } from '@deepseek-ai/dsh-session';
import Projection from '@deepseek-ai/dsh-session-projection';
import * as Persistence from '@deepseek-ai/dsh-session-persistence-jsonl';
import Attachment from '@deepseek-ai/dsh-attachment-local';
import SystemPrompt from '@deepseek-ai/dsh-system-prompt';
import Tools from '@deepseek-ai/dsh-tools';
import * as NativeExecutor from '@deepseek-ai/dsh-tool-executor-native';
import Agents from '@deepseek-ai/dsh-agent';
import AgentLoop from '@deepseek-ai/dsh-agent-loop';

export async function mountRuntime(home, instructions) {
  const ctx = new Context();
  // Compose the published DSH kernel explicitly. No CLI, default profile or bundled tools.
  await ctx.plugin(Llm);
  await ctx.plugin(Session);
  await ctx.plugin(Projection);
  await ctx.plugin(SystemPrompt, { personaPrefix: instructions, includeHarnessIdentity: false, includeRuntimeContext: false });
  await ctx.plugin(Tools);
  await ctx.plugin(NativeExecutor);
  await ctx.plugin(Agents);
  await ctx.plugin(Attachment, { dshHome: home });
  await ctx.plugin(Persistence, { root: home + '/sessions', compression: 'none' });
  await ctx.plugin(AgentLoop, { agents: [], maxParallelToolCalls: 1 });
  return ctx;
}

export async function openAgent(ctx, id, selection, resume = false) {
  const sessionId = SessionId(id);
  return resume
    ? (await ctx.agents.resume({ resumeSessionId: sessionId, agentOptions: selection })).agent
    : ctx.agentLoop.create(sessionId, selection);
}

export async function turn(ctx, agent, text) {
  agent.followup(createUserMessage({ content: [{ type: 'text', text }], source: { kind: 'user' } }));
  await agent.whenIdle();
  await ctx.sessions.flush(agent.session);
  return agent.session.snapshotEvents().filter(event => event.type === 'turn/end').at(-1)?.data.reason;
}
