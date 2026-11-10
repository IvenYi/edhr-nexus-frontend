import assert from 'node:assert/strict';
import { writeFile } from 'node:fs/promises';

assert.ok(process.env.UAT_PASSWORD, 'Set the existing UAT login password');
const base = process.env.EDHR_API_URL || 'http://localhost:8081/api/v1';
const results = [];
for (const username of ['uat_applicant', 'uat_reviewer', 'uat_manager']) {
  const auth = await fetch(`${base}/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, password: process.env.UAT_PASSWORD }) });
  assert.equal(auth.status, 200);
  const { data: { token, user } } = await auth.json();
  const checks = [];
  async function read(path, body, expected = 200) {
    const response = await fetch(base + path, { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }, ...(body ? { method: 'POST', body: JSON.stringify(body) } : {}) });
    const payload = await response.json();
    assert.equal(response.status, expected, `${username} ${path}`);
    checks.push({ path, status: response.status });
    return payload.data;
  }
  for (const businessType of ['CHANGE', 'OBSOLETE']) await read(`/workflow/record-control/candidates?businessType=${businessType}`);
  const all = await read('/record-control/requests?scope=all&size=200');
  const mine = await read('/record-control/requests?scope=mine&size=200');
  assert.ok(mine.content.every(item => item.applicant_id === String(user.id)));
  for (const request of all.content) {
    const source = await read(`/record-control/records/by-number?instanceNo=${encodeURIComponent(request.instance_no)}`);
    if (source.active_request_id === request.id) assert.equal(source.canViewActiveRequest, request.canViewDetail);
    await read(`/record-control/records/${source.id}/revisions`);
    await read(`/record-control/requests/${request.id}`, null, request.canViewDetail ? 200 : 403);
  }
  const queues = {};
  for (const scope of ['todo', 'done']) {
    const tasks = await read(`/record-control/workflow-tasks?scope=${scope}&size=200`);
    queues[scope] = tasks.content.length;
    const projections = await read('/record-control/requests/for-my-workflow-tasks', [...new Set(tasks.content.map(task => task.instanceId))]);
    assert.ok(tasks.content.every(task => projections.some(request => request.workflow_instance_id === task.instanceId)));
    for (const task of tasks.content) await read(`/workflow/tasks/${task.id}`);
  }
  results.push({ username, queues, checks });
}
await writeFile(new URL('./live-management-results.json', import.meta.url), JSON.stringify({ scope: 'Existing UAT accounts; authenticated read-only queries including POST task metadata projection. No business actions.', results }, null, 2));
console.log(JSON.stringify({ users: results.length, reads: results.reduce((sum, user) => sum + user.checks.length, 0), passed: true }));
