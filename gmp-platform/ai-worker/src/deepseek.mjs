import { createHash } from 'node:crypto';
import { LlmAdapter, ToolCallId, createUserMessage } from '@deepseek-ai/dsh-llm';
import { SessionId } from '@deepseek-ai/dsh-session';

export const deepseekConfig = 'deepseek-flash-chat-2d';
const model = 'deepseek-flash';

// Peak USD micros per million tokens. The Java ledger records an estimate.
function usageMicros(usage) {
  if (![usage?.prompt_tokens, usage?.completion_tokens].every(n => Number.isSafeInteger(n) && n >= 0)) {
    throw new Error('Provider usage unavailable');
  }
  const hit = usage.prompt_cache_hit_tokens ?? 0;
  if (!Number.isSafeInteger(hit) || hit < 0 || hit > usage.prompt_tokens) throw new Error('Invalid cache token count');
  return Math.ceil(hit * .006 + (usage.prompt_tokens - hit) * .3 + usage.completion_tokens * 1.2);
}

export class DeepSeekAdapter extends LlmAdapter {
  constructor({ client, claim, key, signal, observe = () => {}, fetchImpl = fetch }) {
    super();
    if (!key) throw new Error('DeepSeek key unavailable');
    this.client = client;
    this.lease = { taskId: claim.taskId, runId: claim.runId, leaseEpoch: claim.leaseEpoch };
    this.key = key;
    this.signal = signal;
    this.observe = observe;
    this.fetchImpl = fetchImpl;
  }

  async resolveModel(provider, id) { return { provider, id, name: id, inputModalities: ['text'] }; }

  async *stream(input) {
    const signal = AbortSignal.any([this.signal, input.signal, AbortSignal.timeout(120_000)].filter(Boolean));
    const messages = input.system ? [{ role: 'system', content: input.system }] : [];
    for (const message of input.messages) {
      const content = message.content.filter(block => block.type === 'text').map(block => block.text).join('\n');
      if (message.role === 'assistant') {
        const calls = message.content.filter(block => block.type === 'tool-call');
        messages.push({ role: 'assistant', content: content || null, ...(calls.length ? { tool_calls: calls.map(block => ({
          id: block.id, type: 'function', function: { name: block.name, arguments: block.arguments },
        })) } : {}) });
      } else if (message.role === 'tool') {
        messages.push({ role: 'tool', tool_call_id: message.toolCallId, content });
      } else if (['user', 'system'].includes(message.role)) messages.push({ role: message.role, content });
    }
    const tools = input.tools.map(({ name, description, parameters }) => ({ type: 'function', function: { name, description, parameters } }));
    const requestId = createHash('sha256').update(JSON.stringify({ messages, tools })).digest('hex');
    const reservation = await this.client.reserve(this.lease, requestId, signal);
    if (reservation.replayed) throw new Error('Prior provider request outcome must be reconciled');
    if (!Number.isSafeInteger(reservation.maxOutputTokens) || reservation.maxOutputTokens < 1) throw new Error('Invalid output budget');
    const request = { model, messages, tools, max_tokens: reservation.maxOutputTokens, stream: false,
      thinking: { type: 'disabled' }, temperature: 0, parallel_tool_calls: false };
    const started = performance.now();
    const response = await this.fetchImpl('https://api.deepseek.com/chat/completions', {
      method: 'POST', redirect: 'error', signal,
      headers: { Authorization: 'Bearer ' + this.key, 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });
    if (!response.ok) throw new Error('DeepSeek HTTP ' + response.status);
    const data = await response.json();
    const micros = usageMicros(data.usage);
    await this.client.settle(this.lease, requestId, micros, signal);
    const choice = data.choices?.[0];
    if (!choice?.message) throw new Error('DeepSeek response has no assistant message');
    const message = choice.message;
    const calls = message.tool_calls ?? [];
    this.observe({ requestId, providerRequestId: data.id, model: data.model, usage: data.usage,
      micros, milliseconds: Math.round(performance.now() - started), tools: calls.map(call => call.function.name) });
    const blocks = [...(message.content ? [{ type: 'text', text: message.content }] : []), ...calls.map(call => ({
      type: 'tool-call', id: ToolCallId(call.id), name: call.function.name, arguments: call.function.arguments,
    }))];
    for (const [index, block] of blocks.entries()) {
      yield { type: 'block-start', index, blockType: block.type };
      yield { type: 'block-end', index, block };
    }
    yield { type: 'usage', usage: { inputTokens: data.usage.prompt_tokens, outputTokens: data.usage.completion_tokens } };
    yield { type: 'finish', reason: { kind: choice.finish_reason === 'length' ? 'max-tokens' : calls.length ? 'tool-calls' : 'stop' } };
  }
}

export async function driveDeepSeek({ ctx, claim, client, key, prompt, signal, observe }) {
  if (claim.leaseEpoch !== 1 || claim.config.modelConfig !== deepseekConfig) throw new Error('Fresh isolated DeepSeek run required');
  const unregister = ctx.llm.registerAdapter(['edhr-deepseek'], new DeepSeekAdapter({ client, claim, key, signal, observe }));
  try {
    const agent = await ctx.agentLoop.create(SessionId(claim.runId), { provider: 'edhr-deepseek', model });
    const abort = () => agent.cancel({ kind: 'user' });
    signal.addEventListener('abort', abort, { once: true });
    try {
      signal.throwIfAborted();
      agent.followup(createUserMessage({ content: [{ type: 'text', text: prompt }], source: { kind: 'user' } }));
      await agent.whenIdle();
      await ctx.sessions.flush(agent.session);
      const events = agent.session.snapshotEvents();
      const reason = events.filter(event => event.type === 'turn/end').at(-1)?.data.reason;
      if (!reason || ['error', 'aborted', 'max-tokens'].includes(reason.kind)) throw new Error('DeepSeek turn ended: ' + (reason?.kind ?? 'missing'));
      const messages = events.filter(event => event.type === 'assistant/message').map(event => event.data.message);
      return messages.at(-1)?.content.filter(block => block.type === 'text').map(block => block.text).join('\n') ?? '';
    } finally {
      signal.removeEventListener('abort', abort);
    }
  } finally {
    unregister();
  }
}
