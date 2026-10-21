#!/usr/bin/env python3
"""L0 fixed-Git scoped catalog import; no runtime or new semantic review."""
import argparse
import copy
import hashlib
import importlib.util
import json
import os
from pathlib import Path
import subprocess
import sys

REPO = Path('/workspace/edhr-nexus-frontend')
BATCH = 'docs/development/branch-review-20261021-signature-payload'
TARGET = 'c3343f45bb79f72368937f0d197ae01f989f0390'
CORE = '2ead6de2ed149f9c10a7786a555b0235c86b3186'
KNOWLEDGE = 'c4af50a7d34bafb523992f00b169ee5efb7a8a1e'
DRAFT = Path('/tmp/edhr-sig-baseline-draft-catalog.json')
EXPECTED_DRAFT_SHA = '54b23573fe6700051e85f811aec8ecdfe60395b51d3f0b74a1e9e053f2c4f04c'
MAPS = [
    (BATCH + '/evidence/helpers/edhr-w3d-command-source-map.json', 42,
     'ec25bc87f431964ce072879f28f9554265d84cb648b0fbcd571b2e90984bdbf6'),
    (BATCH + '/evidence/helpers/edhr-w3d-front-action-consumers.json', 19,
     'f3fe6107918d01de5395b73485f348f7df4c85f6c9e167a2c8c95f738d608add'),
    (BATCH + '/evidence/helpers/edhr-w3d-signature-source-map.json', 28,
     'c6ba94b033f9e41d30a5d9b03ed10052b6c7d75c938aa6f5788292baeb1f2c40'),
    (BATCH + '/evidence/primary/source-map.json', None, None),
]


def git(*args):
    return subprocess.check_output(['git', *args], cwd=REPO, stderr=subprocess.PIPE)


def commit(ref):
    return git('rev-parse', '--verify', ref + '^{commit}').decode().strip()


def raw(ref, path):
    if Path(path).is_absolute() or '..' in Path(path).parts:
        raise ValueError('Evidence path must be repository-relative')
    return git('show', ref + ':' + path)


def sha(value):
    return hashlib.sha256(value).hexdigest()


def receipt(ref, path, locator):
    return {'path': path, 'commit': ref, 'sha256': sha(raw(ref, path)), 'locator': locator}


def ancestor(older, newer):
    subprocess.run(['git', 'merge-base', '--is-ancestor', older, newer], cwd=REPO, check=True)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--ref', required=True, help='Fixed candidate/inventory commit')
    parser.add_argument('--evidence-commit', required=True, help='Commit already containing all original evidence')
    parser.add_argument('--ontology', required=True, help='Repository-relative archived formal semantic JSONL')
    parser.add_argument('--out', type=Path, required=True)
    args = parser.parse_args()
    os.chdir(REPO)
    baseline, evidence_commit = commit(args.ref), commit(args.evidence_commit)
    for older in [TARGET, CORE, KNOWLEDGE, evidence_commit]: ancestor(commit(older), baseline)
    inherited_raw = DRAFT.read_bytes()
    assert sha(inherited_raw) == EXPECTED_DRAFT_SHA, 'Recreate/review the fixed baseline draft; do not silently substitute a mutable catalog'
    inherited = json.loads(inherited_raw)
    assert inherited['baselineCommit'] == TARGET
    assert len(inherited['methods']) == 392 and len(inherited['semanticSources']) == 5 and len(inherited['findings']) == 47
    catalog = copy.deepcopy(inherited); catalog['baselineCommit'] = baseline
    seen = {row['id'] for row in catalog['methods']}; imported = []; excluded = []
    for map_path, expected_count, expected_sha in MAPS:
        map_raw = raw(evidence_commit, map_path)
        if expected_sha: assert sha(map_raw) == expected_sha, 'Archive must preserve original helper bytes'
        document = json.loads(map_raw); scopes = document['sourceScopes']
        assert scopes and (expected_count is None or len(scopes) == expected_count)
        accepted_count = 0
        for index, scope in enumerate(scopes):
            assert scope['id'] not in seen, 'Duplicate scope identity'
            assert scope['wholeFileReviewComplete'] is False
            if expected_count is not None: assert scope['runtimeExecuted'] is False
            assert isinstance(scope['method'], str) and scope['method'].strip()
            reviewed = commit(scope.get('sourceCommit', document.get('fixedCommit', '')))
            source_raw = raw(reviewed, scope['path'])
            source_blob = git('rev-parse', reviewed + ':' + scope['path']).decode().strip()
            assert scope['blob'] == source_blob and scope['sha256'] == sha(source_raw)
            start, end = scope['range']
            if scope['id'] == 'w3d-signature-source:028':
                assert scope['path'] == 'gmp-platform/backend/src/test/java/com/zencas/edhr/compliance/entity/SignatureTest.java'
                assert reviewed == TARGET and [start, end] == [10, 22] and len(source_raw.splitlines()) == 20
                qualification = {'id': scope['id'], 'claimedRange': [start, end], 'actualFileLines': 20,
                    'reason': 'Original helper range exceeds the fixed source file. Preserve the original evidence; exclude this claim from reviewed methods without silent clipping or replacement review.',
                    'evidence': receipt(evidence_commit, map_path, '/sourceScopes/' + str(index))}
                excluded.append(qualification)
                catalog.setdefault('importNotes', []).append({'noteKind': 'source-range-rejected',
                    'id': 'sig-rejected-range-028', 'scope': scope['id'],
                    'reason': qualification['reason'] + ' Original [10,22], actual file20 lines; no runtime acceptance.',
                    'evidence': [qualification['evidence']]})
                continue
            assert type(start) is int and type(end) is int and 1 <= start <= end <= len(source_raw.splitlines())
            catalog['methods'].append({
                'id': scope['id'], 'path': scope['path'], 'scope': scope['method'], 'pathScope': [start, end],
                'reviewedCommit': reviewed, 'sourceBlob': source_blob, 'sourceSha256': sha(source_raw),
                'depth': scope['readDepth'], 'wholeFileReviewComplete': False, 'recordedOutcome': scope['conclusion'],
                'evidence': receipt(evidence_commit, map_path, '/sourceScopes/' + str(index)), 'additionalEvidence': [],
                'reviewedCommitBasis': 'Only the original named finite range and exact Git blob. Mechanical import is not a new source reread, runtime check or formal QA.',
            })
            seen.add(scope['id'])
            accepted_count += 1
        imported.append({'path': map_path, 'originalScopes': len(scopes), 'acceptedScopes': accepted_count})
        catalog.setdefault('importNotes', []).append({
            'noteKind': 'source-map-qualification', 'id': 'sig-import-' + Path(map_path).stem,
            'scope': [scope['id'] for scope in scopes if scope['id'] in seen],
            'reason': 'Preserve overlapping finite source claims only. Helper source inspection, actual primary runtime and formal ontology/quality remain separate; no whole-file or whole-W3 completion follows.',
            'evidence': [receipt(evidence_commit, map_path, '/sourceScopes')],
        })
    semantic_raw = raw(evidence_commit, args.ontology)
    rows = [json.loads(line) for line in semantic_raw.decode().splitlines() if line.strip()]
    assert len(rows) == 12, 'Expected actual formal12 scoped rows, not inventory or an old report'
    assert len({(r['id'], r['sourceCommit'], r['recordSha256']) for r in rows}) == len(rows)
    catalog['semanticSources'].append(receipt(evidence_commit, args.ontology, 'all12 actual finite formal semantic records; no whole-knowledge acceptance'))
    catalog['findings'].append({
        'id': 'W3-SIGNATURE-PAYLOAD-001', 'recordKind': 'product-defect', 'severity': 'high',
        'workPackage': 'W3', 'relatedWorkPackages': ['W5', 'W1'],
        'originalStatus': 'confirmed-by-native-postgres-signature-roundtrip', 'originalReviewedCommit': TARGET,
        'aliases': [],
        'description': 'Signature.snapshot_data JSONB normalized signed JSON string bytes while existing DHR archive consumers hashed the JDBC read-back string, rejecting legitimate source/review signatures. The repair preserves signed text without changing SHA256 or relaxing verification.',
        'affectedPaths': [
            'gmp-platform/backend/src/main/java/com/zencas/edhr/compliance/entity/Signature.java',
            'gmp-platform/backend/src/main/java/com/zencas/edhr/production/service/ExecutionAccess.java',
            'gmp-platform/backend/src/main/java/com/zencas/edhr/production/service/DhrArchiveService.java',
            'gmp-platform/backend/src/main/resources/db/changelog',
        ],
        'disposition': 'fixed-awaiting-independent-acceptance',
        'resolution': {'fixCommits': [CORE], 'testedCommits': [], 'pullRequests': [], 'mergeCommits': []},
        'limitations': [
            'This importer executes no product tests or semantic review. Primary evidence and the fix commit are not final independent acceptance.',
            'Old nativePG7 had one original-text assertion failure, three real product BusinessException errors and three passing controls. Those product errors must not be relabeled fixture errors. Fixed native suites each9 passed; exact original evidence remains authoritative.',
            'The primary last unique104 is the focused104 with103 passed/one font-environment failure followed by the entire Auth24 suite passing in place of that suite. Repeated Auth runs are not added to claim128 unique tests; initial font failure is retained.',
            'Forward migration preserves already-readable legacy text, stored hashes and metadata; it cannot recover original bytes already lost by JSONB or make those historical signatures verifiable. No history reconstruction, hash recomputation or weakened archive validation is accepted.',
            'Current-task pagination W3D-TASK-PAGINATION-001 is source-confirmed only, unexecuted and not closed here. Generic action-type policy awaits separate user clarification; administrator content governance, AuditEvent W5, deferred record-control/DHR high/A12 and old knowledge gaps are not closed.',
        ],
        'evidence': [
            receipt(evidence_commit, BATCH + '/findings.md', 'W3-SIGNATURE-PAYLOAD-001 root cause, native evidence and exact retained boundaries'),
            receipt(evidence_commit, BATCH + '/evidence/primary/validation-summary.json', 'actual primary native red/green, migration and unique regression/environment qualification'),
        ],
    })
    catalog['importNotes'].append({
        'noteKind': 'current-batch-scoped-import', 'id': 'sig-lossless-payload-only', 'scope': 'W3 signing/consumption with W5/W1 connections',
        'reason': 'Prior392 methods, five semantic sources/96 historical rows and all47 prior finding objects are preserved from the fixed PR21 acceptance carry-forward draft. New formal12 belong to their actual author and fixed commits; this mechanical importer makes no semantic or runtime acceptance.',
        'evidence': [receipt(evidence_commit, args.ontology, 'all12 original finite records')],
    })
    catalog['policy'].append('Signature batch adds only finite source evidence, actual formal12 records and one fixed-awaiting-independent-acceptance signed-payload defect. Pagination/action-policy leads remain separate; no complete W3/W5/W1 or branch acceptance is inferred.')
    assert len(excluded) == 1 and len(catalog['methods']) == 485
    assert catalog['methods'][:392] == inherited['methods']
    assert catalog['semanticSources'][:5] == inherited['semanticSources']
    assert catalog['findings'][:47] == inherited['findings']

    # Load verifier bytes from the selected fixed Git commit, not a mutable working-tree script.
    verifier = Path('/tmp/edhr-sig-catalog-fixed-ledger-generator.py')
    verifier.write_bytes(raw(baseline, 'scripts/build-branch-review-ledger.py'))
    sys.dont_write_bytecode = True
    spec = importlib.util.spec_from_file_location('edhr_sig_fixed_catalog_verifier', verifier)
    module = importlib.util.module_from_spec(spec); spec.loader.exec_module(module)
    fixed_git = module.Git()
    methods = module.reconcile_methods(fixed_git, baseline, catalog['methods'])
    knowledge = module.knowledge_records(fixed_git, baseline)
    semantics = module.reconcile_semantics(fixed_git, baseline, catalog['semanticSources'], knowledge)
    assert len(semantics) == 108
    for finding in catalog['findings']:
        for item in finding['evidence']: module.evidence(fixed_git, item)
    for note in catalog['importNotes']:
        for item in note.get('evidence', []): module.evidence(fixed_git, item)
    if args.out.exists(): raise ValueError('Preserve historical catalog: output already exists')
    args.out.parent.mkdir(parents=True, exist_ok=True)
    args.out.write_text(json.dumps(catalog, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(json.dumps({'output': str(args.out), 'sha256': sha(args.out.read_bytes()), 'baselineCommit': baseline,
        'evidenceCommit': evidence_commit, 'methods': len(methods), 'importedMaps': imported, 'excludedClaims': excluded,
        'semanticSources': len(catalog['semanticSources']), 'historicalScopedSemanticRows': len(semantics),
        'newFormalFiniteRows': len(rows), 'findings': len(catalog['findings']),
        'runtimeTestsExecutedByImporter': False, 'newSemanticReviewsByImporter': 0, 'wholeFileOrBranchAcceptance': False}, ensure_ascii=False))


if __name__ == '__main__': main()
