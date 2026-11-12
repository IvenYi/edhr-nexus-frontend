import { secrets } from './common.mjs';

export const configurations = {
  deepseek: { model: 'deepseek-flash', endpoint: 'https://api.deepseek.com/chat/completions', effort: 'high', maxOutputTokens: 20000 },
  openai: { model: 'gpt-6.1-sol', endpoint: 'https://api.openai.com/v1/responses', effort: 'high', maxOutputTokens: 20000 },
};
export function estimatedCost(provider, usage) {
  if (!usage) return 0;
  if (provider === 'deepseek') return ((usage.prompt_cache_hit_tokens ?? 0) * 0.006 + (usage.prompt_cache_miss_tokens ?? usage.prompt_tokens ?? 0) * 0.3 + (usage.completion_tokens ?? 0) * 1.2) / 1e6;
  // Conservative uncached input estimate includes the cache-write rate, not an invoice.
  return ((usage.input_tokens ?? 0) * 2.5 + (usage.output_tokens ?? 0) * 10) / 1e6;
}
export async function createProvider(provider, instructions, tools, task) {
  const configuration = configurations[provider], keys = await secrets();
  const key = keys[provider === 'openai' ? 'OPENAI_API_KEY' : 'DEEPSEEK_API_KEY'];
  if (!key) throw new Error('缺少 ' + provider + ' API key');
  const history = provider === 'openai' ? [{ role: 'user', content: task }] : [{ role: 'system', content: instructions }, { role: 'user', content: task }];
  return { history,
    async call(signal) {
      const request = provider === 'openai'
        ? { model: configuration.model, instructions, input: history, tools: tools.map(t => ({ ...t, type: 'function', strict: false })),
          reasoning: { effort: configuration.effort }, include: ['reasoning.encrypted_content'], max_output_tokens: configuration.maxOutputTokens, store: false, parallel_tool_calls: true }
        : { model: configuration.model, messages: history, tools: tools.map(t => ({ type: 'function', function: { ...t, strict: false } })),
          thinking: { type: 'enabled' }, reasoning_effort: configuration.effort, max_tokens: configuration.maxOutputTokens, stream: false };
      const started = performance.now(), at = new Date().toISOString();
      const timeout = AbortSignal.timeout(240000);
      const response = await fetch(configuration.endpoint, { method: 'POST', signal: signal ? AbortSignal.any([signal, timeout]) : timeout,
        headers: { Authorization: 'Bearer ' + key, 'Content-Type': 'application/json' }, body: JSON.stringify(request) });
      const data = await response.json();
      if (!response.ok) throw new Error(provider + ' HTTP ' + response.status + '; code=' + String(data.error?.code ?? 'unknown') + '; message=' + String(data.error?.message ?? '').replaceAll(key, '[redacted]').slice(0, 350));
      const calls = provider === 'openai' ? (data.output ?? []).filter(x => x.type === 'function_call').map(x => ({ id: x.call_id, name: x.name, arguments: x.arguments }))
        : (data.choices?.[0]?.message?.tool_calls ?? []).map(x => ({ id: x.id, name: x.function.name, arguments: x.function.arguments }));
      if (provider === 'openai') history.push(...data.output ?? []); else history.push(data.choices[0].message);
      return { at, seconds: (performance.now() - started) / 1000, requestId: data.id, model: data.model, usage: data.usage,
        status: data.status ?? data.choices?.[0]?.finish_reason, calls, raw: data, estimatedCostUsd: estimatedCost(provider, data.usage) };
    },
    result(call, result) {
      history.push(provider === 'openai' ? { type: 'function_call_output', call_id: call.id, output: JSON.stringify(result) }
        : { role: 'tool', tool_call_id: call.id, content: JSON.stringify(result) });
    },
    user(content) { history.push({ role: 'user', content }); },
  };
}
