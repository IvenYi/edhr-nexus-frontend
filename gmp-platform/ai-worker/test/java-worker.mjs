import { Context } from '@deepseek-ai/cordis';
import Llm from '@deepseek-ai/dsh-llm';
import Session from '@deepseek-ai/dsh-session';
import Projection from '@deepseek-ai/dsh-session-projection';
import SystemPrompt from '@deepseek-ai/dsh-system-prompt';
import Tools from '@deepseek-ai/dsh-tools';
import * as Native from '@deepseek-ai/dsh-tool-executor-native';
import Agents from '@deepseek-ai/dsh-agent';
import Loop from '@deepseek-ai/dsh-agent-loop';
import * as Persistence from '@deepseek-ai/dsh-session-persistence-jsonl';
import { createWorkerClient } from '../src/client.mjs';
import { runClaimedWorker } from '../src/worker.mjs';
import { driveFixture } from './drive-fixture.mjs';

if (process.env.EDHR_AI_FIXTURE !== 'isolated-java-test') throw new Error('Fixture launcher only');
const ctx = new Context();
try {
  await ctx.plugin(Llm); await ctx.plugin(Session); await ctx.plugin(Projection);
  await ctx.plugin(SystemPrompt, { includeHarnessIdentity: false, includeRuntimeContext: false });
  await ctx.plugin(Tools); await ctx.plugin(Native); await ctx.plugin(Agents);
  await ctx.plugin(Persistence, { root: process.env.EDHR_AI_DIRECTORY + '/sessions', compression: 'none' });
  await ctx.plugin(Loop, { agents: [], maxParallelToolCalls: 1 });
  const client = createWorkerClient({ origin: process.env.EDHR_AI_ORIGIN, key: process.env.EDHR_AI_WORKER_KEY });
  const result = await runClaimedWorker({ ctx, client, directory: process.env.EDHR_AI_DIRECTORY, drive: driveFixture });
  process.stdout.write(JSON.stringify(result) + '\n');
} finally { await ctx.fiber.dispose(); }
