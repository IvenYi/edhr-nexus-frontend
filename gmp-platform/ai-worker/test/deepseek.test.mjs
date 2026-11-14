import test from 'node:test';
import assert from 'node:assert/strict';
import { DeepSeekAdapter } from '../src/deepseek.mjs';

const input = { messages: [{ role: 'user', content: [{ type: 'text', text: 'blank sample' }] }], tools: [] };
async function collect(adapter) { return Array.fromAsync(adapter.stream(input)); }

test('provider request is reserved first, capped, then settled before exposing tool calls', async () => {
  const operations = [];
  const adapter = new DeepSeekAdapter({ claim: { taskId: 't', runId: 'r', leaseEpoch: 1 }, key: 'test', client: {
    async reserve(_lease, id) { operations.push(['reserve', id]); return { maxOutputTokens: 64, replayed: false }; },
    async settle(_lease, id, micros) { operations.push(['settle', id, micros]); },
  }, async fetchImpl(_url, options) {
    assert.equal(JSON.parse(options.body).max_tokens, 64);
    operations.push(['send']);
    return Response.json({ id: 'p', usage: { prompt_tokens: 10, completion_tokens: 10 }, choices: [{ finish_reason: 'tool_calls', message: {
      tool_calls: [{ id: 'read-1', function: { name: 'read_current_form', arguments: '{}' } }],
    } }] });
  } });
  const events = await collect(adapter);
  assert.deepEqual(operations.map(row => row[0]), ['reserve', 'send', 'settle']);
  assert.equal(operations[0][1], operations[2][1]);
  assert.equal(operations[2][2], 15);
  assert.equal(events[1].block.name, 'read_current_form');
});

test('an unknown response keeps its reservation and replay never resends', async () => {
  let prior, sends = 0;
  const adapter = new DeepSeekAdapter({ claim: { taskId: 't', runId: 'r', leaseEpoch: 1 }, key: 'test', client: {
    async reserve(_lease, id) { const replayed = id === prior; prior = id; return { replayed, maxOutputTokens: 64 }; },
    async settle() { assert.fail('Unknown consumption must remain reserved'); },
  }, async fetchImpl() { sends++; throw new Error('Socket lost'); } });
  await assert.rejects(collect(adapter), /Socket lost/);
  await assert.rejects(collect(adapter), /must be reconciled/);
  assert.equal(sends, 1);
});
