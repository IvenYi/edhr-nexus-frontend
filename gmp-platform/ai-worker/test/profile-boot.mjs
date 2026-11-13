import { createWorkerClient } from '../src/client.mjs';
import { runClaimedWorker } from '../src/worker.mjs';
import { driveFixture } from './drive-fixture.mjs';

export const inject = ['llm', 'sessions', 'tools', 'agents', 'agentLoop'];
export function apply(ctx) {
  if (process.env.EDHR_AI_FIXTURE !== 'isolated-java-test') throw new Error('Fixture only');
  const client = createWorkerClient({ origin: process.env.EDHR_AI_ORIGIN, key: process.env.EDHR_AI_WORKER_KEY });
  const write = client.write;
  const transport = process.env.EDHR_AI_CRASH_AFTER_WRITE === '1' ? { ...client, async write(...args) {
    await write(...args);
    process.stdout.write('WRITE_COMMITTED_AWAITING_RESPONSE\n');
    const signal = args.at(-1);
    await new Promise((_resolve, reject) => signal.addEventListener('abort', () => reject(signal.reason), { once: true }));
  } } : client;
  // The CLI profile owns startup; this finite test plugin has no model/network tools.
  setImmediate(async () => {
    try {
      const result = await runClaimedWorker({ ctx, client: transport, directory: process.env.EDHR_AI_DIRECTORY, drive: driveFixture });
      process.stdout.write(JSON.stringify(result) + '\n');
      await ctx.root.fiber.dispose();
      process.exit(0);
    } catch (error) { process.stderr.write('FIXTURE_FAILED: ' + error.message + '\n'); process.exit(1); }
  });
}
