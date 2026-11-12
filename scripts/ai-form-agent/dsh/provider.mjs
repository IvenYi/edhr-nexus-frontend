import { LlmAdapter, ToolCallId } from '@deepseek-ai/dsh-llm';
import { createProvider, configurations } from '../providers.mjs';
import { save } from '../common.mjs';

export const maxRequests = 26;
export const budgetUsd = 5;

// Translate one DSH model request. Conversation, dispatch and resumption belong to DSH.
export class FormModelAdapter extends LlmAdapter {
  constructor(ctx, provider, runId, session) {
    super();
    Object.assign(this, { ctx, provider, runId, session, requests: [], cost: 0 });
  }

  async resolveModel(provider, id) {
    return { provider, id, name: id, inputModalities: ['text', 'image'], defaultMaxTokens: configurations[provider].maxOutputTokens };
  }

  async *stream({ provider, model, messages, system, tools = [], signal }) {
    const number = this.requests.length + 1;
    if (number > maxRequests) throw new Error('Experiment model-request limit reached');
    const openai = provider === 'openai', history = [], deliveries = [];
    const text = message => message.content.filter(b => b.type === 'text').map(b => b.text).join('\n');
    const push = (role, content) => history.push({ role, content });
    let instructions = system;
    const previewCalls = new Set();
    let pendingImages = [];
    const flushImages = () => {
      if (pendingImages.length) push('user', pendingImages.flat());
      pendingImages = [];
    };
    for (const message of messages) {
      if (message.role !== 'tool') flushImages();
      if (message.role === 'system') instructions = text(message);
      if (message.role === 'user') push('user', text(message));
      if (message.role === 'assistant') {
        const blocks = message.content.filter(b => b.type === 'tool-call');
        for (const b of blocks) if (b.name === 'preview_template') previewCalls.add(b.id);
        const raw = message.source.replayState?.response;
        if (raw) {
          if (openai) history.push(...raw);
          else history.push(raw);
        } else if (text(message)) push('assistant', text(message));
      }
      if (message.role !== 'tool') continue;
      const body = text(message);
      if (openai) history.push({ type: 'function_call_output', call_id: message.toolCallId, output: body });
      else history.push({ role: 'tool', tool_call_id: message.toolCallId, content: body });
      if (!previewCalls.has(message.toolCallId) || message.isError) continue;
      let preview;
      try { preview = JSON.parse(body); } catch { continue; }
      if (!preview.attachments?.length) continue;
      const blocks = [{ type: openai ? 'input_text' : 'text', text: '这是当前已保存版本的原生模拟填报截图。核对版式和裁切。' }];
      for (const ref of preview.attachments) {
        const { data } = await this.ctx.attachments.readImage(ref, signal);
        const url = 'data:image/png;base64,' + Buffer.from(data).toString('base64');
        blocks.push(openai ? { type: 'input_image', image_url: url, detail: 'high' } : { type: 'image_url', image_url: { url, detail: 'high' } });
      }
      deliveries.push({ revision: preview.revision, attachments: preview.attachments });
      pendingImages.push(blocks);
    }
    flushImages();
    if (!openai && instructions) history.unshift({ role: 'system', content: instructions });
    const size = JSON.stringify(history).replace(/data:image\/png;base64,[A-Za-z0-9+/=]+/g, '[image]').length + (instructions?.length ?? 0) + JSON.stringify(tools).length;
    const imageCount = deliveries.reduce((sum, d) => sum + d.attachments.length, 0);
    const estimate = (size + imageCount * 10000) * (openai ? 2.5 : 0.3) / 1e6 + configurations[provider].maxOutputTokens * (openai ? 10 : 1.2) / 1e6;
    if (this.cost + estimate > budgetUsd) throw new Error('Experiment estimated budget stop');
    const client = await createProvider(provider, instructions, tools, '');
    client.history.splice(0, client.history.length, ...history);
    const response = await client.call(signal);
    const { raw, calls, usage } = response;
    const prefix = 'runs/' + this.runId;
    await save(prefix + '/response-' + number + '.json', response, true);
    if (deliveries.length) {
      await save(prefix + '/image-input-' + number + '.json', deliveries, true);
      for (const item of deliveries) this.session.observePreview(item.revision);
    }
    this.requests.push({ requestId: response.requestId, model: response.model, usage, seconds: response.seconds });
    this.cost += response.estimatedCostUsd;
    console.log(JSON.stringify({ run: this.runId, number, model, tools: calls.map(c => c.name), cost: this.cost }));
    const answer = openai ? raw.output.filter(x => x.type === 'message').flatMap(x => x.content).map(x => x.text ?? '').join('') : raw.choices[0].message.content;
    const blocks = [...(answer ? [{ type: 'text', text: answer }] : []),
      ...calls.map(c => ({ type: 'tool-call', id: ToolCallId(c.id), name: c.name, arguments: c.arguments }))];
    for (const [index, block] of blocks.entries()) {
      yield { type: 'block-start', index, blockType: block.type };
      yield { type: 'block-end', index, block };
    }
    if (usage) yield { type: 'usage', usage: { inputTokens: usage.input_tokens ?? usage.prompt_tokens, outputTokens: usage.output_tokens ?? usage.completion_tokens } };
    yield { type: 'finish', reason: { kind: calls.length ? 'tool-calls' : ['incomplete', 'length'].includes(response.status) ? 'max-tokens' : 'stop' },
      replayState: { response: openai ? raw.output : raw.choices[0].message } };
  }
}
