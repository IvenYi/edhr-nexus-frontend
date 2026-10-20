#!/usr/bin/env python3
"""Independent read-only ledger/provenance checks; all output is under /tmp.

This script deliberately does not import either repository ledger generator.
No application tests, database operations or Git mutations are performed.
"""
import collections
import csv
import hashlib
import io
import json
import pathlib
import re
import subprocess
import traceback
import zipfile
from functools import lru_cache

import yaml

R = pathlib.Path('/workspace/edhr-nexus-frontend')
B = '061d7f1ff71d11084667d08293fd7d5fe0d7680d'
C = '12e2bc218b3830c18ea74c44108f296d3e04ee3c'
H = 'ba68b03dab051d228c3646a03bbb404f2724f1d4'
P = 'docs/development/branch-review-20261020-trace-freeze-chain'
OLD = 'docs/development/branch-review-20261020-coverage-ledger'
OUT = pathlib.Path('/tmp/edhr-trace-qa-ledger-verify')
stats = collections.Counter()
checks = []

def sha(data):
    return hashlib.sha256(data).hexdigest()

def canonical(v):
    return json.dumps(v, ensure_ascii=False, sort_keys=True, separators=(',', ':')).encode()

def git(*args):
    return subprocess.check_output(['git', *args], cwd=R)

@lru_cache(None)
def tree(commit):
    result = {}
    for row in git('ls-tree', '-rz', '--full-tree', commit).split(b'\0'):
        if row:
            header, path = row.split(b'\t', 1)
            mode, kind, oid = header.split()
            assert kind == b'blob', ('non-blob tracked entry', commit, path)
            result[path.decode()] = oid.decode()
    return result

objects = subprocess.Popen(['git', 'cat-file', '--batch'], cwd=R,
                           stdin=subprocess.PIPE, stdout=subprocess.PIPE)

@lru_cache(None)
def blob(oid):
    objects.stdin.write(oid.encode() + b'\n')
    objects.stdin.flush()
    header = objects.stdout.readline().split()
    assert len(header) == 3 and header[1] == b'blob', ('bad blob', oid)
    raw = objects.stdout.read(int(header[2]))
    assert objects.stdout.read(1) == b'\n'
    return raw

def raw(commit, path):
    return blob(tree(commit)[path])

def local(path):
    return (R / path).read_bytes()

def load(path):
    return json.loads(local(path))

def lines(path):
    return [json.loads(line) for line in local(path).splitlines() if line.strip()]

def pointer(doc, loc):
    assert loc.startswith('/'), ('not a JSON pointer', loc)
    for key in loc[1:].split('/'):
        key = key.replace('~1', '/').replace('~0', '~')
        doc = doc[int(key)] if isinstance(doc, list) else doc[key]
    return doc

def run(name, fn):
    try:
        detail = fn()
        checks.append({'id': name, 'outcome': 'passed', 'details': detail})
    except Exception as exc:
        checks.append({'id': name, 'outcome': 'failed',
                       'error': str(exc), 'traceback': traceback.format_exc()})

def receipt(r, directory=None):
    assert re.fullmatch('[0-9a-f]{64}', r['sha256']), 'invalid receipt SHA'
    commit = r.get('commit') or r.get('sourceCommit')
    path = r['path']
    if commit:
        assert re.fullmatch('[0-9a-f]{40}', commit), ('unfixed receipt commit', path)
        data = raw(commit, path)
        if 'blob' in r:
            assert tree(commit)[path] == r['blob'], ('receipt blob', path)
        stats['gitReceiptsVerified'] += 1
    else:
        assert directory is not None, ('missing receipt root', path)
        # Absolute /tmp originals are additionally compared with their archived copy.
        archive = directory / pathlib.Path(path).name if path.startswith('/tmp/') else directory / path
        data = archive.read_bytes()
        if path.startswith('/tmp/') and pathlib.Path(path).exists():
            assert pathlib.Path(path).read_bytes() == data, ('original/archive mismatch', path)
            stats['tmpOriginalArchiveByteComparisons'] += 1
        stats['archivedFileReceiptsVerified'] += 1
    assert sha(data) == r['sha256'], ('receipt SHA mismatch', path)
    if 'bytes' in r:
        assert len(data) == r['bytes'], ('receipt bytes mismatch', path)
    return data

def fixed_scope():
    assert git('rev-parse', 'HEAD').decode().strip() == H, 'HEAD drift'
    assert not git('status', '--porcelain'), 'working tree dirty'
    subprocess.run(['git', 'merge-base', '--is-ancestor', B, H], cwd=R, check=True)
    assert len(tree(B)) == 2352
    assert len(tree(C)) == 2382
    contracts = load(P + '/baseline.json')['contracts']
    for r in contracts:
        assert tree(B)[r['path']] == r['blob'] == tree(H)[r['path']], ('contract delta', r['path'])
    changed = set(git('diff', '--name-only', '-z', B, H).decode().strip('\0').split('\0'))
    expected_prod = {
        'gmp-platform/backend/src/main/java/com/zencas/edhr/production/service/FormTraceIndexService.java',
        'gmp-platform/frontend/src/pages/master-data/template-designer-react/components/ProjectionDialog.tsx',
        'gmp-platform/frontend/src/pages/master-data/template-designer-react/utils/projectionPreview.ts'}
    expected_tests = {
        'gmp-platform/backend/src/test/java/com/zencas/edhr/production/service/DhrTraceReportPostgresTest.java',
        'gmp-platform/backend/src/test/java/com/zencas/edhr/production/service/FormTraceIndexPostgresTest.java',
        'gmp-platform/backend/src/test/java/com/zencas/edhr/production/service/FormTraceIndexServiceTest.java',
        'gmp-platform/frontend/scripts/test-designer-save-browser.mjs',
        'gmp-platform/frontend/scripts/test-projection-preview.mjs'}
    expected_knowledge = {'docs/knowledge/' + p for p in [
        'README.md', 'evidence/trace-region-consumption-2026-10-20.md',
        'evidence/trace-region-consumption-2026-10-20.yaml',
        'implementation-anchors/form-projection.yaml', 'rules/form-trace-field-binding.yaml']}
    extras = changed - expected_prod - expected_tests - expected_knowledge - {
        'docs/development/branch-review-20261015/NEXT.md'}
    assert all(p.startswith(P + '/') for p in extras), ('scope expansion', sorted(extras))
    assert expected_prod | expected_tests | expected_knowledge <= changed
    migrations = [p for p in tree(B) if '/db/changelog/' in p]
    assert all(tree(B)[p] == tree(H).get(p) for p in migrations), 'migration delta'
    historical = [p for p in tree(B) if p.startswith('docs/development/') and not p.endswith('/NEXT.md')]
    assert all(tree(B)[p] == tree(H).get(p) for p in historical), 'historical evidence changed'
    assert tree(B)['scripts/build-branch-review-ledger.py'] == tree(H)['scripts/build-branch-review-ledger.py']
    assert tree(B)['scripts/build-branch-review-inventory.py'] == tree(H)['scripts/build-branch-review-inventory.py']
    stats.update(changedPaths=len(changed), productionFiles=3, testFiles=5, knowledgeFiles=5,
                 fixedTreePaths=2382, baseTreePaths=2352,
                 unchangedHistoricalDevelopmentPaths=len(historical), unchangedMigrationPaths=len(migrations))
    return {'contractsUnchanged': len(contracts), 'changedPaths': len(changed),
            'historicalEvidenceUnchanged': len(historical), 'migrationPathsUnchanged': len(migrations)}

catalog = load(P + '/source-catalog.json')
summary = load(P + '/ledger/summary.json')

def inventories():
    inv = load(P + '/ledger/inventory-summary.json')
    assert inv['sourceCommit'] == C
    assert inv['tree'] == git('rev-parse', C + '^{tree}').decode().strip()
    assert inv['coverageSha256'] == sha(local(P + '/ledger/coverage.csv'))
    rows = list(csv.DictReader(io.StringIO(local(P + '/ledger/coverage.csv').decode())))
    assert len(rows) == len({r['path'] for r in rows}) == 2382
    assert {r['path'] for r in rows} == set(tree(C)), 'coverage path denominator'
    for r in rows:
        assert r['baseline_commit'] == C and r['source_blob'] == tree(C)[r['path']], ('inventory source', r['path'])
        assert r['domain'] and r['work_package'] and r['asset_type'] and r['in_scope'] == 'true'
        assert r['whole_file_review_complete'] == 'false'
    packages = dict(collections.Counter(r['work_package'] for r in rows))
    assert packages == summary['inventory']['workPackages'] == inv['workPackages']
    mig = list(csv.DictReader(io.StringIO(local(P + '/ledger/migrations.csv').decode())))
    assert len(mig) == 126 and len({r['path'] for r in mig}) == 126
    assert all(r['blob'] == tree(C)[r['path']] and r['status'] == 'inventory-only' for r in mig)
    assert summary['catalogSha256'] == sha(canonical(catalog)), 'canonical catalog SHA'
    assert summary['generatorSha256'] == sha(local('scripts/build-branch-review-ledger.py'))
    assert summary['inventoryGeneratorSha256'] == sha(local('scripts/build-branch-review-inventory.py'))
    assert not summary['overallAuditComplete'] and summary['overallPercent'] is None
    return {'paths': len(rows), 'workPackages': packages, 'wholeFilePassClaims': 0, 'migrationInventory': len(mig)}

def archived_receipts():
    root = R / P
    visited = []
    for path in sorted(root.rglob('*receipts.json')):
        payload = json.loads(path.read_bytes())
        records = payload if isinstance(payload, list) else payload.get('sources', [])
        for r in records:
            if isinstance(r, dict) and 'path' in r and 'sha256' in r:
                receipt(r, path.parent)
        visited.append(str(path.relative_to(root)))
    members = load(P + '/evidence/primary/raw-failure-member-receipts.json')
    with zipfile.ZipFile(root / 'evidence/primary/failing-runs.zip') as archive:
        assert set(archive.namelist()) == {r['member'] for r in members}, 'unexpected ZIP members'
        for r in members:
            data = archive.read(r['member'])
            assert len(data) == r['bytes'] and sha(data) == r['sha256'], ('ZIP member SHA', r['member'])
            assert not re.search(rb'-----BEGIN [A-Z ]*PRIVATE KEY-----|\bgh[pousr]_[A-Za-z0-9]{30,}|\bAKIA[A-Z0-9]{16}\b', data)
            stats['zipMembersVerified'] += 1
    assert not [p for p in tree(H) if p.startswith(P + '/') and (p.endswith('.xml') or 'settings' in p.lower())]
    return {'receiptManifests': len(visited), 'zipMembers': len(members),
            'archivedReceipts': stats['archivedFileReceiptsVerified'], 'gitReceipts': stats['gitReceiptsVerified']}

def method_sources():
    inherited = json.loads(receipt(catalog['inheritedCatalog']))
    assert catalog['methods'][:162] == inherited['methods']
    assert catalog['findings'][:40] == inherited['findings']
    assert catalog['semanticSources'][:1] == inherited['semanticSources']
    assert len(catalog['methods']) == 216
    assert len({r['id'] for r in catalog['methods']}) == 216
    rendered = {r['id']: r for r in lines(P + '/ledger/method-reviews.jsonl')}
    assert set(rendered) == {r['id'] for r in catalog['methods']}
    carries = collections.Counter()
    for r in catalog['methods']:
        commit, path = r['reviewedCommit'], r['path']
        data = raw(commit, path)
        assert tree(commit)[path] == r['sourceBlob'], ('method source blob', r['id'])
        assert sha(data) == r['sourceSha256'], ('method source SHA', r['id'])
        assert not r['wholeFileReviewComplete'] and r['scope']
        evidence = r['evidence']
        edata = receipt(evidence)
        assert evidence.get('locator'), ('method source locator', r['id'])
        if evidence['locator'].startswith('/'):
            selected = pointer(json.loads(edata), evidence['locator'])
            assert selected, ('empty locator', r['id'])
        for other in r.get('additionalEvidence', []):
            receipt(other)
            assert other.get('locator')
        now = rendered[r['id']]
        relation = 'unchanged' if tree(C).get(path) == r['sourceBlob'] else 'file-changed'
        carry = 'retained-scoped-evidence' if relation == 'unchanged' else 'needs-delta-review'
        assert now['sourceRelation'] == relation and now['carryStatus'] == carry, ('method carry', r['id'])
        assert now['currentBlob'] == tree(C).get(path)
        assert not now['wholeFileReviewComplete'] and not now['currentRuntimeExecuted']
        carries[carry] += 1
    assert carries == summary['sourceReview']['carryStates']
    assert [r['id'] for r in catalog['methods'][162:190]] == [f'trace-history-scope-{i:03}' for i in range(1,29)]
    assert [r['id'] for r in catalog['methods'][190:209]] == [f'trace-design-read-{i:02}' for i in range(1,20)]
    assert [r['id'] for r in catalog['methods'][209:]] == [f'trace-primary-scope-{i:02}' for i in range(1,8)]
    stats.update(methodScopeRecords=216, inheritedMethodRecords=162, newHelperMethodRecords=47, newPrimaryMethodRecords=7)
    return {'records':216, 'inheritedPreserved':162, 'newHelper':47, 'newPrimary':7,
            'carryStates':dict(carries), 'wholeFilePassClaims':0}

@lru_cache(None)
def definitions(commit):
    schema = yaml.safe_load(raw(commit, 'docs/knowledge/schema.yaml'))
    result = {}
    def add(row, kind, path, loc):
        assert isinstance(row, dict) and isinstance(row.get('id'), str), ('invalid record definition', path,loc)
        assert row['id'] not in result, ('duplicate definition', row['id'])
        result[row['id']] = {'record': row, 'type': kind, 'path': path, 'loc':loc, 'sha':sha(canonical(row))}
    # Only schema-declared definition collections count; reference objects and enums do not.
    for path in sorted(tree(commit)):
        if not (path.startswith('docs/knowledge/') and path.endswith(('.yaml','.yml'))) or path.endswith('/schema.yaml'):
            continue
        doc = yaml.safe_load(raw(commit, path))
        if not isinstance(doc, dict):
            continue
        queue = []
        for collection, kind in schema['collectionTypes'].items():
            for index, row in enumerate(doc.get(collection, []) or []):
                loc = '/' + collection + '/' + str(index)
                add(row, kind, path, loc)
                queue.append((row,loc))
        while queue:
            value, loc = queue.pop(0)
            if isinstance(value, dict):
                for key, child in value.items():
                    childloc = loc + '/' + key.replace('~','~0').replace('/','~1')
                    if key in schema['nestedCollectionTypes'] and isinstance(child,list):
                        for index,row in enumerate(child):
                            add(row,schema['nestedCollectionTypes'][key],path,childloc+'/'+str(index))
                    queue.append((child, childloc))
            elif isinstance(value,list):
                queue.extend((child,loc+'/'+str(i)) for i,child in enumerate(value))
    return result

def knowledge():
    before, current, head = definitions(B), definitions(C), definitions(H)
    assert len(before)==2534 and len(current)==len(head)==2535
    assert current==head, 'post-core knowledge definition drift'
    assert set(current)-set(before)=={'evidence.trace-region-consumption-20261020'}
    assert not set(before)-set(current)
    for key, old in before.items():
        now=current[key]
        for field in ['status','visibility']:
            assert old['record'].get(field)==now['record'].get(field), ('maturity/visibility change',key,field)
    altered={key for key in before if before[key]['sha']!=current[key]['sha']}
    assert altered=={'anchor.form-projection.saved-content-trace','rule.form-projection.trace-field-single-binding'}
    output=lines(P+'/ledger/knowledge-records.jsonl')
    assert len(output)==2535 and {r['id'] for r in output}==set(current)
    for r in output:
        d=current[r['id']]
        assert r['recordSha256']==d['sha'] and r['recordType']==d['type']
        assert r['sourcePath']==d['path'] and r['sourceLocator']==d['loc']
        assert r['assetStatus']==d['record'].get('status') and r['visibility']==d['record'].get('visibility')
        assert not r['currentSemanticPassClaimed'] and not r['newSemanticReviewPerformed']
    # Baseline source-record receipts are original records, not current code acceptance.
    rr=load(P+'/evidence/ontology/edhr-trace-region-record-receipts.json')
    for r in rr['records']:
        if r.get('found'):
            d=definitions(r['sourceCommit'])[r['id']]
            assert r['record']==d['record'] and r['recordSha256']==d['sha']
            assert r['sourceBlob']==tree(r['sourceCommit'])[r['sourcePath']]
            assert r['sourceSha256']==sha(raw(r['sourceCommit'],r['sourcePath']))
            assert r['originalStatus']==d['record'].get('status') and r['originalVisibility']==d['record'].get('visibility')
    stats.update(knowledgeDefinitionsBefore=2534, knowledgeDefinitionsAfter=2535, newKnowledgeDefinitions=1,
                 maturityChanges=0, visibilityChanges=0)
    return {'definitionsBefore':2534,'definitionsAfter':2535,'addedId':'evidence.trace-region-consumption-20261020',
            'changedExistingRecords':sorted(altered),'maturityChanges':0,'visibilityChanges':0,'wholeAssetPassClaims':0}

def semantics():
    records=[]
    for source in catalog['semanticSources']:
        records.extend(json.loads(line) for line in receipt(source).splitlines() if line.strip())
    assert len(records)==45
    imported=lines(P+'/ledger/semantic-reviews.jsonl')
    keyed={(r['id'],r['reviewedCommit'],r['historicalReview']['recordSha256']):r for r in imported}
    assert len(keyed)==45
    carries=collections.Counter()
    for r in records:
        d=definitions(r['sourceCommit'])[r['id']]
        assert d['sha']==r['recordSha256'] and r['sourcePath']==d['path'] and r['sourceLocator']==d['loc']
        out=keyed[(r['id'],r['sourceCommit'],r['recordSha256'])]
        assert out['historicalReview']==r, ('semantic original changed',r['id'])
        assert definitions(C)[r['id']]['sha']==d['sha'] and out['recordRelation']=='unchanged'
        stable=True
        for dep in out['dependencies']:
            before=tree(r['sourceCommit']).get(dep['path']); after=tree(C).get(dep['path'])
            relation='unresolved' if before is None else 'removed' if after is None else 'unchanged' if before==after else 'file-changed'
            assert dep['sourceBlob']==before and dep['currentBlob']==after and dep['relation']==relation
            stable=stable and relation=='unchanged'
        expected='retained-scoped-evidence' if stable and out['dependencies'] else 'needs-delta-review'
        assert out['carryStatus']==expected
        assert not out['newSemanticReviewPerformed'] and not out['currentRuntimeExecuted']
        carries[expected]+=1
    new=records[33:]
    assert len(new)==12 and all(r['sourceCommit']==C for r in new)
    for r in new:
        d=definitions(C)[r['id']]
        assert r['sourceBlob']==tree(C)[r['sourcePath']] and r['sourceSha256']==sha(raw(C,r['sourcePath']))
        assert r['originalMaturity']==d['record'].get('status') and r['visibility']==d['record'].get('visibility')
        assert r['wholeFileReviewComplete'] is False and r['wholeRecordSemanticPassClaimed'] is False
        assert r['businessRuntimeExecutedByOntologyInstance'] is False and r['reviewedScope'] and r['limitations']
        receipt(r['evidence'])
        for e in r['implementationEvidence']:
            receipt(e)
    conclusions=dict(collections.Counter(r['conclusion'] for r in records))
    assert conclusions=={'consistent':40,'superseded':1,'evidence-gap':4}
    assert dict(carries)==summary['knowledgeReview']['evidenceStates']
    old=json.loads(raw(B,OLD+'/source-catalog.json'))
    oldrecords=[json.loads(x) for x in receipt(old['semanticSources'][0]).splitlines() if x.strip()]
    assert records[:33]==oldrecords
    stats.update(semanticScopeRecords=45,newRoleSemanticScopeRecords=12,preservedKnowledgeGaps=4)
    return {'historicalRecords':33,'newFiniteRoleRecords':12,'conclusions':conclusions,
            'carryStates':dict(carries),'newIds':[r['id'] for r in new], 'wholeRecordPassClaims':0}

def findings_and_reports():
    findings=load(P+'/ledger/findings.json')
    old=json.loads(raw(B,OLD+'/ledger/findings.json'))
    assert len(findings)==42 and len({r['id'] for r in findings})==42
    byid={r['id']:r for r in findings}
    assert all(byid[r['id']]==r for r in old), 'historical finding state changed'
    ids={r['id'] for r in findings}
    for r in findings:
        for e in r['evidence']:
            receipt(e)
            assert e.get('locator')
        if r.get('parentIssueId'):
            assert r['parentIssueId'] in ids, ('missing parent',r['id'])
    specials={r['id']:r for r in findings}
    assert specials['AUD-H009']['disposition']==specials['AUD-H010']['disposition']=='confirmed-pending'
    assert specials['AUD-H012']['disposition']=='pending-adjudication'
    deferred=[r for r in findings if r['disposition']=='user-deferred']
    assert len(deferred)==2 and all(r['severity']=='high' for r in deferred)
    new=[r for r in findings if r['id'] not in {i['id'] for i in old}]
    assert {r['id'] for r in new}=={'W2-TRACE-REGION-001','W2-TRACE-REGION-002'}
    assert all(r['disposition']=='fixed-awaiting-independent-acceptance' for r in new)
    aliases=load(P+'/ledger/finding-aliases.json')
    assert all(set(v)<=ids for v in aliases.values())
    assert aliases==json.loads(raw(B,OLD+'/ledger/finding-aliases.json'))
    reports=load(P+'/ledger/quality-report-index.json')
    sync=load(P+'/ledger/knowledge-sync-index.json')
    for group,root in [(reports,'qualityResult'),(sync,'ontologyResult')]:
        assert len({r['sha256'] for r in group})==len(group)
        for r in group:
            assert r['sourceCommit']==C and r['newlyExecutedInThisBatch'] is False
            for path in r['paths']:
                data=raw(C,path)
                assert sha(data)==r['sha256'], ('reported raw SHA',path)
                original=yaml.safe_load(data)[root]
                for key,value in r['reported'].items():
                    if key in ['checks','findings']:
                        expected=[{k:entry.get(k) for k in ([ 'id','required','category','method','outcome'] if key=='checks' else ['id','severity','resolutionStatus'])} for entry in original.get(key,[])]
                    else:
                        expected=original[key]
                    assert value==expected, ('reported metadata changed',path,key)
                if path in tree(B):
                    assert tree(B)[path]==tree(H)[path], ('old raw report overwritten',path)
    assert len(reports)==70 and len(sync)==26
    dispositions=dict(collections.Counter(r['disposition'] for r in findings))
    assert dispositions==summary['remediation']['dispositions']
    results=dict(collections.Counter(r['reported']['result'] for r in reports))
    assert results==summary['runtime']['reportedResults']
    progress=load(P+'/progress.json')
    assert progress['actualPrimaryValidation']['javaDistinctTestsPassed']==72
    assert progress['actualPrimaryValidation']['nodeTestsPassed']==36
    assert progress['actualPrimaryValidation']['browserScenariosPassed']==22
    assert summary['runtime']['businessChecksExecutedInThisBatch']==[]
    assert summary['knowledgeReview']['newSemanticReviews']==0
    assert not progress['overallAuditComplete'] and progress['overallPercent'] is None
    assert progress['historicalIndexBackfill'] is False
    stats.update(findingRecords=42,preservedFindingRecords=40,userDeferredHigh=2,qualityOriginalReports=70,maintenanceOriginalReports=26)
    return {'findings':42,'originalFindingsByteSemanticsPreserved':40,'userDeferredHigh':2,
            'qualityReports':70,'reportedResults':results,'maintenanceReports':26,
            'historicalPending':['AUD-H009','AUD-H010','AUD-H012'],
            'importerExecutionZerosSeparateFromPrimaryReportedCounts':True}

def deterministic_check():
    reproduction=json.loads(pathlib.Path('/tmp/edhr-trace-qa-ledger-reproduction.json').read_bytes())
    assert reproduction==summary, 'standalone --check summary mismatch'
    return {'command':'python3 scripts/build-branch-review-ledger.py --ref '+C+' --catalog '+P+'/source-catalog.json --out '+P+'/ledger --check',
            'exitCode':0,'summaryEqualsCommitted':True}

for name,fn in [
    ('fixed-scope-contracts-and-preserved-history',fixed_scope),
    ('deterministic-ledger-check',deterministic_check),
    ('independent-tree-inventory',inventories),
    ('recursive-original-receipts-and-failure-zip',archived_receipts),
    ('independent-method-source-provenance',method_sources),
    ('schema-defined-knowledge-and-maturity',knowledge),
    ('finite-semantic-records-and-source-provenance',semantics),
    ('finding-hierarchy-history-and-report-boundaries',findings_and_reports),
]:
    run(name,fn)

assert git('rev-parse','HEAD').decode().strip()==H and not git('status','--porcelain'), 'candidate changed during QA'
objects.stdin.close()
objects.wait()
result={
    'schema':'edhr-independent-read-only-ledger-helper/v1',
    'scope':'ledger/knowledge provenance only; no application acceptance',
    'baseCommit':B,'headCommit':H,'ledgerFixedCommit':C,'workingTreeState':'clean',
    'independentOfRepair':True,'repositoryMutations':False,
    'result':'passed' if all(c['outcome']=='passed' for c in checks) else 'failed',
    'checks':checks,'statistics':dict(stats),
    'findings':[],
    'notExecuted':['Java/Maven/knowledge Maven tests','Node/build/browser/visual validation','database or migrations','GitHub Actions or merge/deployment','whole-system semantic or code audit'],
    'boundaries':['216 overlapping finite source scopes are not distinct methods or whole files',
                  '45 finite semantic reviews preserve four historical gaps and do not pass all knowledge assets',
                  '42 parent/subfinding rows are not distinct production defects',
                  '70 raw historical quality reports keep their original failed/blocked/dirty outcomes',
                  'actual runtime checks are delegated to the parent independent QA instance',
                  'old missing indexes are not automatically backfilled; snapshots and raw history remain unchanged'],
}
OUT.with_suffix('.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
md=['# Independent read-only ledger verification', '',
    f"Result: **{result['result']}** ({sum(c['outcome']=='passed' for c in checks)}/{len(checks)} check groups).",
    '',f'Base `{B}`; candidate `{H}`; frozen ledger tree `{C}`. Working tree remained clean.',
    '', 'This helper verifies provenance and bounded reporting, not application runtime or whole-branch acceptance.', '',
    *[f"- {c['id']}: {c['outcome']}" for c in checks], '',
    'Machine statistics and exact checks are in the sibling JSON. No code, tests, knowledge or documentation were modified.', '',
    'No Maven, Node, browser, database, Actions, merge or deployment was executed by this helper. Parent independent QA owns runtime acceptance.',
    '', 'Residual audit boundaries: the two deferred DHR high findings, four historical semantic gaps, H009/H010/H012, existing static UI/lint limitations and historical index backfill remain outside this slice.']
OUT.with_suffix('.md').write_text('\n'.join(md)+'\n')
print(json.dumps({'result':result['result'],'groups':len(checks),'passed':sum(c['outcome']=='passed' for c in checks),
                  'failed':[{'id':c['id'],'error':c.get('error')} for c in checks if c['outcome']!='passed'],
                  'statistics':dict(stats)},ensure_ascii=False))
