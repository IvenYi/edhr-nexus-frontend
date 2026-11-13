import { mkdir, writeFile, readFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { spawn } from 'node:child_process';

if (process.env.EDHR_AI_FIXTURE !== 'isolated-java-test' || !process.env.EDHR_DSH_BIN) throw new Error('Explicit fixture DSH binary required');
const installed = JSON.parse(await readFile(join(dirname(process.env.EDHR_DSH_BIN), '..', 'package.json'), 'utf8'));
if (installed.name !== '@deepseek-ai/dsh' || installed.version !== '0.2.2-rc.2') throw new Error('Pinned DSH 0.2.2-rc.2 required');
const home = join(process.env.EDHR_AI_DIRECTORY, 'harness');
const profile = join(home, 'profiles', 'edhr-fixture');
await mkdir(profile, { recursive: true, mode: 0o700 });
await writeFile(join(profile, 'package.json'), JSON.stringify({ name: 'edhr-fixture-profile', private: true, dsh: { profile: { bundles: [] } } }));
const services = ['llm', 'session', 'session-projection', 'system-prompt', 'tools', 'tool-executor-native', 'agent', 'agent-loop', 'session-persistence-jsonl', 'session-checkpoint-policy'];
const rows = services.map(id => ({ id, name: '@deepseek-ai/dsh-' + id }));
rows.find(r => r.id === 'system-prompt').config = { includeHarnessIdentity: false, includeRuntimeContext: false };
rows.find(r => r.id === 'agent-loop').config = { agents: [], maxParallelToolCalls: 1 };
rows.find(r => r.id === 'session-persistence-jsonl').config = { root: join(home, 'sessions'), compression: 'none' };
rows.push({ id: 'edhr-fixture', name: new URL('./profile-boot.mjs', import.meta.url).href });
await writeFile(join(profile, 'cordis.patch.yml'), JSON.stringify([{ insert: rows }]));
const child = spawn(process.execPath, [process.env.EDHR_DSH_BIN, '--profile', 'edhr-fixture', ...(process.argv.includes('--dump') ? ['--dump-config'] : [])], {
  env: { ...process.env, DSH_HOME: home }, stdio: 'inherit',
});
process.on('SIGTERM', () => child.kill('SIGTERM'));
process.on('SIGINT', () => child.kill('SIGINT'));
child.on('exit', code => process.exit(code ?? 1));
