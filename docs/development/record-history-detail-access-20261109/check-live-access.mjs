import assert from 'node:assert/strict';
import { writeFile } from 'node:fs/promises';

const base = process.env.EDHR_API_URL || 'http://localhost:8081/api/v1';
assert.ok(process.env.UAT_PASSWORD, 'Set the existing UAT login password');
const results = [];
for (const username of ['uat_applicant', 'uat_reviewer', 'uat_manager']) {
  const login = await fetch(`${base}/auth/login`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password: process.env.UAT_PASSWORD }),
  });
  assert.equal(login.status, 200);
  const { data } = await login.json();
  const headers = { Authorization: `Bearer ${data.token}` };
  const listResponse = await fetch(`${base}/record-control/requests?page=0&size=20`, { headers });
  assert.equal(listResponse.status, 200);
  const list = (await listResponse.json()).data.content;
  assert.ok(list.length > 0);
  const checks = [];
  for (const item of list) {
    const detail = await fetch(`${base}/record-control/requests/${item.id}`, { headers });
    const body = await detail.json();
    assert.equal(detail.status, item.canViewDetail ? 200 : 403, `${username}/${item.id}`);
    if (!item.canViewDetail) assert.equal(body.message, '当前用户无权查看该变更申请');
    checks.push({ requestNo: item.request_no, canViewDetail: item.canViewDetail, status: detail.status });
  }
  results.push({ username, checks });
}
await writeFile(new URL('./live-access-results.json', import.meta.url), JSON.stringify({ scope: 'Existing UAT login and read-only list/detail requests; no business writes', results }, null, 2));
console.log(JSON.stringify({ users: results.length, checkedRequests: results.reduce((n, r) => n + r.checks.length, 0), passed: true }));
