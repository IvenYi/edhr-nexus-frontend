"""Login and GET-only probes through the normal frontend proxy; no business mutation."""
from pathlib import Path
import json
import subprocess
import urllib.parse
import urllib.request

ROOT = Path('/Users/ivenwang/Documents/edhr-nexus')
OUT = ROOT / 'docs/development/edhr-dev-integration-20261031/evidence/independent'
manifest = json.loads((ROOT / 'docs/development/workflow-dhr-acceptance-20261030/manifest.json').read_text())
cases = {case['code']: case for case in manifest['cases']}
base = 'http://localhost:3000/api/v1'
opener = urllib.request.build_opener(urllib.request.ProxyHandler({}))
tokens = {}
checks = []

def call(method, path, role=None, data=None):
    assert method == 'GET' or (method == 'POST' and path == '/auth/login')
    headers = {'Content-Type': 'application/json'}
    if role:
        headers['Authorization'] = 'Bearer ' + tokens[role]
    request = urllib.request.Request(base + path, method=method, headers=headers,
                                     data=json.dumps(data).encode() if data is not None else None)
    with opener.open(request, timeout=15) as response:
        body = json.load(response)
    assert body['code'] == 200, (path, body.get('message'))
    return body.get('data')

def check(name, valid, details):
    checks.append({'name': name, 'passed': bool(valid), 'details': details})
    assert valid, (name, details)

for role, account in manifest['accounts'].items():
    login = call('POST', '/auth/login', data={'username': account['username'], 'password': 'Uat1030!Pass'})
    tokens[role] = login['token']
    check('login-' + role, bool(tokens[role]), {'username': account['username']})
for case in manifest['cases']:
    row = call('GET', '/record-control/records/by-number?' + urllib.parse.urlencode({'instanceNo': case['instanceNo']}), 'applicant')
    check('source-' + case['code'], str(row['id']) == case['recordId'] and row['status'] == 'COMPLETED',
          {'recordId': str(row['id']), 'status': row['status']})
    if 'requestId' in case:
        detail = call('GET', '/record-control/requests/' + case['requestId'], 'applicant')
        check('request-' + case['code'], detail['status'] == 'IN_REVIEW',
              {'status': detail['status'], 'canWithdraw': detail.get('canWithdraw')})
        if case['code'] in ['WITHDRAW', 'DECIDED']:
            check('withdraw-rule-' + case['code'], detail.get('canWithdraw') == (case['code'] == 'WITHDRAW'),
                  {'canWithdraw': detail.get('canWithdraw')})
case = cases['REASSIGN']
detail = call('GET', '/workflow/operations/instances/' + case['workflowInstanceId'], 'manager')
check('manager-instance-running', detail['status'] == 'RUNNING', {'status': detail['status'], 'taskCount': len(detail['tasks'])})
targets = call('GET', '/workflow/operations/tasks/' + case['taskId'] + '/reassignment-targets', 'manager')
check('reassign-candidate-boundary', any(str(row['id']) == '883010000003' for row in targets)
      and not any(str(row['id']) == '883010000001' for row in targets), {'ids': [str(row['id']) for row in targets]})
case = cases['TRANSFER']
context = call('GET', '/workflow/operations/tasks/' + case['taskId'] + '/transfer-context', 'reviewer')
check('transfer-context-readable', bool(context), {key: value for key, value in context.items() if key not in ['taskState', 'candidateSnapshot']})
for name in ['DHR-REVIEW', 'DHR-PENDING', 'DHR-CHANGE', 'DHR-VOID']:
    case = cases[name]
    data = call('GET', '/dhr-instances/' + case['dhrId'] + '/summary', 'applicant')
    check('dhr-workspace-' + name, bool(data), {'dhrId': case['dhrId'], 'topLevelKeys': sorted(data)})
report = {'candidate': subprocess.check_output(['git', 'rev-parse', 'HEAD'], cwd=ROOT, text=True).strip(),
          'base': base, 'businessActionsSubmitted': False, 'proxyDisabledForLoopback': True,
          'checks': checks, 'passed': all(check['passed'] for check in checks)}
(OUT / 'main-api-readonly.json').write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n')
print(json.dumps({'checks': len(checks), 'passed': report['passed'], 'businessActionsSubmitted': False}))
