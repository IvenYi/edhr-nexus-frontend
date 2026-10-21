#!/usr/bin/env python3
"""L0 fixed-Git catalog import only; never product tests or new semantic review."""
import argparse
import copy
import hashlib
import importlib.util
import json
import os
from pathlib import Path
import subprocess

REPO = Path('/workspace/edhr-nexus-frontend')
BATCH = 'docs/development/branch-review-20261020-w3-task-commands'
CORE = 'fc0980035d717fd1790ac72c907f940390540c4d'
TARGET = 'e8ecc103c8e6825c61c61b39b9cbd12b1474700e'
DRAFT = Path('/tmp/edhr-w3c-baseline-catalog-draft.json')
MAPS = [
    BATCH + '/evidence/helpers/edhr-w3c-command-source-map.json',
    BATCH + '/evidence/helpers/edhr-w3c-command-front-consumers.json',
    BATCH + '/evidence/primary/source-map.json',
]


def git(*args):
    return subprocess.check_output(['git', *args], cwd=REPO, stderr=subprocess.PIPE)


def commit(ref):
    return git('rev-parse', '--verify', ref + '^{commit}').decode().strip()


def raw(ref, path):
    if Path(path).is_absolute() or '..' in Path(path).parts:
        raise ValueError('Evidence paths must be repository-relative')
    return git('show', ref + ':' + path)


def sha(data):
    return hashlib.sha256(data).hexdigest()


def receipt(ref, path, locator):
    return {'path': path, 'commit': ref, 'sha256': sha(raw(ref, path)), 'locator': locator}


def main():
    os.chdir(REPO)
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument('--evidence-commit', required=True)
    p.add_argument('--baseline', required=True)
    p.add_argument('--ontology', required=True, help='Repository-relative archived formal semantic JSONL')
    p.add_argument('--out', type=Path, required=True)
    args = p.parse_args()
    evidence_commit, baseline = commit(args.evidence_commit), commit(args.baseline)
    subprocess.run(['git', 'merge-base', '--is-ancestor', evidence_commit, baseline], cwd=REPO, check=True)
    inherited = json.loads(DRAFT.read_bytes())
    assert inherited['baselineCommit'] == TARGET
    assert len(inherited['methods']) == 314 and len(inherited['semanticSources']) == 4 and len(inherited['findings']) == 46
    catalog = copy.deepcopy(inherited)
    catalog['baselineCommit'] = baseline
    ids = {row['id'] for row in catalog['methods']}
    added = []
    for map_path in MAPS:
        document = json.loads(raw(evidence_commit, map_path))
        scopes = document['sourceScopes']
        assert scopes, 'Cannot import an empty source map'
        for index, source in enumerate(scopes):
            assert source['id'] not in ids, 'Method record identity collision'
            assert source['wholeFileReviewComplete'] is False
            reviewed = commit(source.get('sourceCommit', document.get('fixedCommit', '')))
            source_raw = raw(reviewed, source['path'])
            blob = git('rev-parse', reviewed + ':' + source['path']).decode().strip()
            assert source['blob'] == blob and source['sha256'] == sha(source_raw)
            start, end = source['range']
            assert isinstance(start, int) and isinstance(end, int)
            assert 1 <= start <= end <= len(source_raw.splitlines())
            record = {
                'id': source['id'], 'path': source['path'],
                'scope': source['method'], 'pathScope': [start, end],
                'reviewedCommit': reviewed, 'sourceBlob': blob,
                'sourceSha256': sha(source_raw), 'depth': source['readDepth'],
                'wholeFileReviewComplete': False,
                'recordedOutcome': source['conclusion'],
                'evidence': receipt(evidence_commit, map_path, '/sourceScopes/' + str(index)),
                'additionalEvidence': [],
                'reviewedCommitBasis': 'Source-map original lists this finite range and exact Git blob; mechanical import is not a new source reread or formal QA.',
            }
            ids.add(source['id']); catalog['methods'].append(record)
        added.append({'path': map_path, 'records': len(scopes)})
        catalog.setdefault('importNotes', []).append({
            'noteKind': 'source-map-qualification', 'id': 'w3c-import-' + Path(map_path).stem,
            'scope': [source['id'] for source in scopes],
            'reason': 'Only listed overlapping finite source ranges are imported. Historical helper artifacts and interrupted role-status uncertainty are retained; this mechanical import establishes neither author FINAL, independent QA, runtime checks, whole-file review nor whole-W3 completion.',
            'evidence': [receipt(evidence_commit, map_path, '/sourceScopes')],
        })
    semantic_raw = raw(evidence_commit, args.ontology)
    semantic_rows = [json.loads(line) for line in semantic_raw.decode().splitlines() if line.strip()]
    assert semantic_rows
    assert len({(row['id'], row['sourceCommit'], row['recordSha256']) for row in semantic_rows}) == len(semantic_rows)
    catalog['semanticSources'].append(receipt(evidence_commit, args.ontology, 'all finite formal ontology records; no whole-knowledge acceptance'))
    catalog['findings'].append({
        'id': 'W3C-INSTANCE-WRITE-AUTH-001', 'recordKind': 'product-authorization-defect',
        'severity': 'high', 'workPackage': 'W3', 'originalStatus': 'confirmed-by-source-and-real-jwt-postgres-baseline',
        'originalReviewedCommit': TARGET, 'aliases': [],
        'description': 'WorkflowInstance create/update/delete omitted the existing workflow.intervene method guard and allowed ordinary authenticated users to replace controlled instance writes.',
        'affectedPaths': ['gmp-platform/backend/src/main/java/com/zencas/edhr/workflow/controller/WorkflowInstanceController.java'],
        'disposition': 'fixed-awaiting-independent-acceptance',
        'resolution': {'fixCommits': [CORE], 'testedCommits': [], 'pullRequests': [], 'mergeCommits': []},
        'limitations': [
            'Primary red/green and regression evidence is not final independent acceptance; only the three authorization omissions are fixed.',
            'Authorized raw CRUD content policy, ordinary candidate/read permissions, DHR rules, deferred record-control integration, full tenant isolation and W5 digest algorithms are not redefined or accepted by this repair.',
            'Nine baseline cases stop on unexpected HTTP200 before their zero-write assertion; no claim those later assertions executed. First fixture setup errors are separately retained.',
        ],
        'evidence': [
            receipt(evidence_commit, BATCH + '/findings.md', 'W3C-INSTANCE-WRITE-AUTH-001 root cause and scope'),
            receipt(evidence_commit, BATCH + '/evidence/primary/validation-summary.json', '/baselineValid; /runtime; /actualFixedSourceReceipts'),
            receipt(evidence_commit, BATCH + '/evidence/primary/edhr-w3c-baseline-valid-summary.json', '/suites/0/cases'),
        ],
    })
    catalog['importNotes'].append({
        'noteKind': 'current-batch-scoped-import', 'id': 'w3c-three-instance-write-guards',
        'scope': 'Current W3 authorization slice only',
        'reason': 'Prior314 method objects, four prior semantic sources, all46 prior finding objects and historical originals are unchanged from mechanically accepted PR20 draft. New original semantic rows belong to their formal ontology author and fixed commits, not this importer. Adjacent source leads are not added as adjudicated product defects.',
        'evidence': [receipt(evidence_commit, args.ontology, 'all actual finite records')],
    })
    catalog['policy'].append('W3C only adds finite source evidence, formal scoped semantic receipts and one fixed-awaiting-independent-acceptance authorization finding. Mechanical generation executes no product or semantic checks and cannot close whole W3 or W0-W7.')
    assert catalog['methods'][:314] == inherited['methods']
    assert catalog['semanticSources'][:4] == inherited['semanticSources']
    assert catalog['findings'][:46] == inherited['findings']
    # Reuse fixed repository verifier for receipt/source/semantic identity validation only.
    spec = importlib.util.spec_from_file_location('edhr_ledger_catalog_validation', REPO/'scripts/build-branch-review-ledger.py')
    module = importlib.util.module_from_spec(spec); spec.loader.exec_module(module)
    fixed_git = module.Git()
    module.reconcile_methods(fixed_git, baseline, catalog['methods'])
    current_knowledge = module.knowledge_records(fixed_git, baseline)
    semantics = module.reconcile_semantics(fixed_git, baseline, catalog['semanticSources'], current_knowledge)
    for finding in catalog['findings']:
        for item in finding['evidence']: module.evidence(fixed_git, item)
    for note in catalog['importNotes']:
        for item in note.get('evidence', []): module.evidence(fixed_git, item)
    if args.out.exists(): raise ValueError('Output already exists; preserve historical catalog')
    args.out.parent.mkdir(parents=True, exist_ok=True)
    args.out.write_text(json.dumps(catalog, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')
    print(json.dumps({'output':str(args.out),'sha256':sha(args.out.read_bytes()),'baselineCommit':baseline,'evidenceCommit':evidence_commit,'methods':len(catalog['methods']),'addedMaps':added,'semanticSources':len(catalog['semanticSources']),'historicalSemanticRecords':len(semantics),'newFormalScopedSemanticRows':len(semantic_rows),'findings':len(catalog['findings']),'runtimeTestsExecuted':False,'newSemanticReviewsByImporter':0,'wholeBranchAccepted':False},ensure_ascii=False))


if __name__ == '__main__':
    main()
