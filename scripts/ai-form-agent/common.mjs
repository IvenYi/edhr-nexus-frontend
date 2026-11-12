import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import { isDeepStrictEqual } from 'node:util';
export { root, requireFrontend, range, loadDesigner } from '../ai-form-feasibility/common.mjs';
import { root } from '../ai-form-feasibility/common.mjs';

const batch = process.env.AI_FORM_AGENT_BATCH ?? 'ai-form-agent-v2-20261112';
if (!/^[a-z0-9-]+$/.test(batch)) throw new Error('Invalid experiment batch name');
export const out = path.join(root, 'output', batch);
export const base = `http://127.0.0.1:${process.env.AI_FORM_AGENT_PORT ?? '18092'}/api/v1`;
export const templates = '/master-data/template-modeling/form-templates';
export const hash = value => createHash('sha256').update(typeof value === 'string' ? value : JSON.stringify(value)).digest('hex');
export const read = async name => JSON.parse(await readFile(path.join(out, name), 'utf8'));
export async function save(name, value, immutable = false) {
  const file = path.join(out, name);
  await mkdir(path.dirname(file), { recursive: true });
  try { await writeFile(file, JSON.stringify(value, null, 2) + '\n', { flag: immutable ? 'wx' : 'w', mode: 0o600 }); }
  catch (error) {
    if (!immutable || error.code !== 'EEXIST') throw error;
    if (!isDeepStrictEqual(JSON.parse(await readFile(file, 'utf8')), value)) throw new Error('拒绝覆盖已有实验协议/证据：' + name);
  }
}
export async function secrets() {
  return Object.fromEntries((await readFile(root + '/.env.ai.local', 'utf8')).split(/\r?\n/)
    .filter(line => line.includes('=') && !line.trim().startsWith('#'))
    .map(line => { const i = line.indexOf('='); return [line.slice(0, i).trim(), line.slice(i + 1).trim().replace(/^['"]|['"]$/g, '')]; }));
}
export async function api(route, token, method = 'GET', body) {
  if (!route.startsWith('/') || route.startsWith('//')) throw new Error('只允许固定本机 API');
  const response = await fetch(base + route, { method, signal: AbortSignal.timeout(30000),
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: 'Bearer ' + token } : {}) },
    body: body === undefined ? undefined : JSON.stringify(body) });
  const data = await response.json();
  if (!response.ok || ![0, 200].includes(data.code)) throw new Error(`API ${response.status}: ${data.message ?? data.msg ?? data.code}`);
  return data.data;
}
export async function login() {
  const data = await api('/auth/login', null, 'POST', { username: 'admin', password: 'admin123' });
  return data.token ?? data.accessToken;
}
