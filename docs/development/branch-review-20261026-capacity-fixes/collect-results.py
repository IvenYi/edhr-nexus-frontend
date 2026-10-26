"""Export safe counts and hashes only; raw logs/XML can contain synthetic credentials."""
import hashlib
import json
import sys
from pathlib import Path
import xml.etree.ElementTree as ET

root = Path(__file__).resolve().parents[3]
names = ['WorkflowQueuePaginationPostgresTest', 'WorkflowTaskControllerTest',
         'WorkflowInstanceAuthorizationIntegrationTest', 'WorkflowTransferPostgresTest',
         'DhrEvidenceBatchPostgresTest', 'DhrReviewServiceTest',
         'DhrReviewLifecycleIntegrationTest', 'DhrSummaryPersistenceTest',
         'DhrSummaryServiceTest', 'ProductionReferenceCapacityObservationTest']
rows = []
for name in names:
    paths = list((root / 'gmp-platform/backend/target/surefire-reports').glob('TEST-*' + name + '.xml'))
    if len(paths) != 1:
        raise SystemExit('Missing or ambiguous report: ' + name)
    path = paths[0]
    suite = ET.parse(path).getroot()
    rows.append({'name': suite.get('name'),
                 **{key: int(suite.get(key)) for key in ['tests', 'failures', 'errors', 'skipped']},
                 'xmlSha256': hashlib.sha256(path.read_bytes()).hexdigest(),
                 'reportMtime': path.stat().st_mtime,
                 'cases': [{'name': case.get('name'), 'passed': all(case.find(k) is None for k in ['failure', 'error', 'skipped'])} for case in suite.findall('testcase')]})
result = {'suites': rows, 'totals': {key: sum(row[key] for row in rows) for key in ['tests', 'failures', 'errors', 'skipped']},
          'qualification': 'Native PostgreSQL: workflow pagination/authorization/delegation and DHR batch. Existing DHR lifecycle/persistence suites use H2; reference observation uses real view/engine with mocked repositories. No browser, full migration or customer SLA claim.'}
Path(sys.argv[1]).write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n')
print(json.dumps(result['totals']))
