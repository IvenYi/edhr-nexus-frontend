#!/usr/bin/env python3
"""L0 import of fixed Git finite scopes; executes no product or new semantic checks."""
import argparse
import copy
import hashlib
import importlib.util
import json
from pathlib import Path
import subprocess
import sys

REPO = Path('/workspace/edhr-nexus-frontend')
TARGET = '13def47d4def51237d1393eaa7bf2651e98a0cbd'
BATCH = 'docs/development/branch-review-20261021-task-pagination'
DRAFT_PATH = BATCH + '/evidence/helpers/edhr-page-baseline-draft-catalog.json'
DRAFT_SHA = '1e45436637b16e2ef96dc6a536b9f78616d0ac4153f9f22092439044f1d2ace8'
FINDING_ID = 'W3D-TASK-PAGINATION-001'


def git(*args):
    return subprocess.check_output(['git', *args], cwd=REPO, stderr=subprocess.PIPE)


def commit(ref):
    if not isinstance(ref, str) or not ref:
        raise ValueError('A real fixed Git commit is required')
    return git('rev-parse', '--verify', ref + '^{commit}').decode().strip()


def raw(ref, path):
    if not isinstance(path, str) or Path(path).is_absolute() or '..' in Path(path).parts:
        raise ValueError('Original evidence and source paths must be repository-relative')
    return git('show', ref + ':' + path)


def sha(value):
    return hashlib.sha256(value).hexdigest()


def receipt(ref, path, locator):
    return {'path': path, 'commit': ref, 'sha256': sha(raw(ref, path)), 'locator': locator}


def ancestor(older, newer):
    subprocess.run(['git', 'merge-base', '--is-ancestor', older, newer], cwd=REPO, check=True)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--ref', required=True, help='Fixed catalog/inventory candidate commit')
    parser.add_argument('--evidence-commit', required=True, help='Commit already containing all original evidence')
    parser.add_argument('--source-map', action='append', required=True, help='Repeat for each repository-relative original source map')
    parser.add_argument('--out', type=Path, required=True)
    args = parser.parse_args()
    baseline, evidence_commit = commit(args.ref), commit(args.evidence_commit)
    ancestor(TARGET, baseline)
    ancestor(evidence_commit, baseline)
    if args.out.exists():
        raise ValueError('Historical output must not be overwritten')
    if len(args.source_map) != len(set(args.source_map)):
        raise ValueError('Do not import the same source map twice')
    draft_raw = raw(evidence_commit, DRAFT_PATH)
    assert sha(draft_raw) == DRAFT_SHA, 'Preserve the fixed PR22 carry draft bytes'
    inherited = json.loads(draft_raw)
    assert inherited['baselineCommit'] == TARGET
    assert len(inherited['methods']) == 485 and len(inherited['semanticSources']) == 6 and len(inherited['findings']) == 48
    assert any(note.get('id') == 'sig-rejected-range-028' for note in inherited['importNotes'])
    assert not any(row['id'] == 'w3d-signature-source:028' for row in inherited['methods'])
    catalog = copy.deepcopy(inherited)
    catalog['baselineCommit'] = baseline
    seen = {row['id'] for row in catalog['methods']}
    imports = []
    for map_index, map_path in enumerate(args.source_map):
        document = json.loads(raw(evidence_commit, map_path))
        scopes = document['sourceScopes']
        assert isinstance(scopes, list) and scopes, 'An actual finite source map is required'
        imported_ids = []
        for index, scope in enumerate(scopes):
            assert isinstance(scope['id'], str) and scope['id'] and scope['id'] not in seen
            assert scope['id'] != 'w3d-signature-source:028', 'Rejected original range must not re-enter reviewed methods'
            assert scope['wholeFileReviewComplete'] is False
            assert type(scope['runtimeExecuted']) is bool, 'Preserve an explicit reported runtime marker; do not infer one'
            for key in ['method', 'readDepth', 'conclusion']:
                assert isinstance(scope[key], str) and scope[key].strip(), 'Named finite scope, depth and conclusion required'
            reviewed = commit(scope.get('sourceCommit') or document.get('fixedCommit'))
            ancestor(reviewed, baseline)
            source_raw = raw(reviewed, scope['path'])
            source_blob = git('rev-parse', reviewed + ':' + scope['path']).decode().strip()
            assert scope['blob'] == source_blob and scope['sha256'] == sha(source_raw)
            start, end = scope['range']
            assert type(start) is int and type(end) is int and 1 <= start <= end <= len(source_raw.splitlines()), 'Reject invalid ranges; never silently clip them'
            catalog['methods'].append({
                'id': scope['id'], 'path': scope['path'], 'scope': scope['method'], 'pathScope': [start, end],
                'reviewedCommit': reviewed, 'sourceBlob': source_blob, 'sourceSha256': sha(source_raw),
                'depth': scope['readDepth'], 'wholeFileReviewComplete': False, 'recordedOutcome': scope['conclusion'],
                'evidence': receipt(evidence_commit, map_path, '/sourceScopes/' + str(index)), 'additionalEvidence': [],
                'runtimeExecutionAsReportedBySourceMap': scope['runtimeExecuted'],
                'reviewedCommitBasis': 'Only the original named finite range and exact Git blob. This importer neither rereads source for acceptance nor executes tests; the reported runtime marker is not current independent quality acceptance.'
            })
            seen.add(scope['id'])
            imported_ids.append(scope['id'])
        imports.append({'path': map_path, 'scopes': len(scopes), 'reportedRuntimeTrueScopes': sum(row['runtimeExecuted'] for row in scopes)})
        catalog['importNotes'].append({'noteKind': 'source-map-qualification',
            'id': 'page-source-import-' + str(map_index + 1), 'scope': imported_ids,
            'reason': 'Preserve original finite source and explicit runtime-marker claims only. Auxiliary source inspection, primary actual runs and formal independent quality are different evidence; no whole-file, workflow or branch completion follows.',
            'evidence': [receipt(evidence_commit, map_path, '/sourceScopes')]})
    primary_path = BATCH + '/evidence/primary/validation-summary.json'
    primary = json.loads(raw(evidence_commit, primary_path))
    assert primary['targetCommit'] == TARGET
    core = commit(primary['coreCommit'])
    ancestor(TARGET, core)
    ancestor(core, baseline)
    findings_path = BATCH + '/findings.md'
    assert FINDING_ID in raw(evidence_commit, findings_path).decode('utf-8')
    assert not any(row['id'] == FINDING_ID for row in catalog['findings'])
    catalog['findings'].append({
        'id': FINDING_ID, 'recordKind': 'product-defect', 'severity': 'medium', 'workPackage': 'W3',
        'originalStatus': 'primary-implementation-evidence-awaiting-independent-acceptance',
        'originalReviewedCommit': TARGET, 'aliases': [],
        'description': 'Workflow todo/done manually sliced lists using unchecked int page/size arithmetic. Nonpositive input, multiplication wraparound and end-index overflow could return HTTP500 or the wrong page. The local repair rejects nonpositive parameters with the existing GENERAL_001 HTTP400 and computes bounded list offsets with long arithmetic without altering queue ownership, selection, order or response shape.',
        'affectedPaths': ['gmp-platform/backend/src/main/java/com/zencas/edhr/workflow/controller/WorkflowTaskController.java'],
        'disposition': 'fixed-awaiting-independent-acceptance',
        'resolution': {'fixCommits': [core], 'testedCommits': [], 'pullRequests': [], 'mergeCommits': []},
        'limitations': [
            'This mechanical importer executes no product tests, source acceptance or new semantic review. Actual primary red/green originals are separately referenced and do not constitute final independent acceptance.',
            'Only todo/done technical parameter and bounded list-index behavior belongs to this repair. No arbitrary maximum page size, database-paging refactor, queue/candidate/authority change, generic action matrix, DHR or delegation policy is introduced.',
            'Prior485 scopes, six semantic sources/108 historical rows and all48 finding objects remain unchanged. The rejected028 original, old101/57 carry states, four knowledge gaps, historical signature limitations, W5 and user-deferred record-control/DHR/A12 items are not closed by this import.',
            'Carry states for the selected new fixed baseline must be recalculated by the ledger; prior101/57 values are historical baseline counts, not hard-coded future results.'
        ],
        'evidence': [receipt(evidence_commit, findings_path, FINDING_ID + ' root cause, exact scope and primary evidence'),
            receipt(evidence_commit, primary_path, 'Actual primary target/core metadata and original red/green qualification; no runtime check executed by importer')]
    })
    catalog['importNotes'].append({'noteKind': 'current-batch-scoped-import', 'id': 'page-technical-parameters-only',
        'scope': FINDING_ID,
        'reason': 'Exact PR22 acceptance carry draft is preserved, then only submitted finite maps and one technical medium pending independent acceptance are appended. Ontology gate is not-applicable for technical input/index handling; no new semantic row is invented.',
        'evidence': [receipt(evidence_commit, DRAFT_PATH, '/; exact fixed PR22 carry draft'), receipt(evidence_commit, primary_path, 'Actual original primary qualification only')]})
    catalog['policy'].append('Task-pagination batch appends only finite submitted source scopes and one technical medium fixed-awaiting-independent-acceptance. Existing485 methods, six semantic sources/108 historical rows and all48 findings are preserved. The generator performs no new runtime/source/semantic acceptance; whole W3 and W0-W7 remain incomplete.')
    assert catalog['methods'][:485] == inherited['methods']
    assert catalog['semanticSources'] == inherited['semanticSources']
    assert catalog['findings'][:48] == inherited['findings']
    assert catalog['importNotes'][:len(inherited['importNotes'])] == inherited['importNotes']
    fixed_verifier = Path('/tmp/edhr-page-catalog-fixed-ledger-generator.py')
    fixed_verifier.write_bytes(raw(baseline, 'scripts/build-branch-review-ledger.py'))
    sys.dont_write_bytecode = True
    spec = importlib.util.spec_from_file_location('edhr_page_fixed_catalog_verifier', fixed_verifier)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    fixed_git = module.Git()
    methods = module.reconcile_methods(fixed_git, baseline, catalog['methods'])
    knowledge = module.knowledge_records(fixed_git, baseline)
    semantics = module.reconcile_semantics(fixed_git, baseline, catalog['semanticSources'], knowledge)
    assert len(semantics) == 108 and len(catalog['findings']) == 49
    for finding in catalog['findings']:
        for item in finding['evidence']: module.evidence(fixed_git, item)
    for note in catalog['importNotes']:
        for item in note.get('evidence', []): module.evidence(fixed_git, item)
    args.out.parent.mkdir(parents=True, exist_ok=True)
    args.out.write_text(json.dumps(catalog, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(json.dumps({'output': str(args.out), 'sha256': sha(args.out.read_bytes()), 'baselineCommit': baseline,
        'evidenceCommit': evidence_commit, 'coreCommit': core, 'methods': len(methods), 'importedMaps': imports,
        'semanticSources': len(catalog['semanticSources']), 'historicalScopedSemanticRows': len(semantics),
        'newFormalSemanticRows': 0, 'findings': len(catalog['findings']), 'runtimeTestsExecutedByImporter': False,
        'newSemanticReviewsByImporter': 0, 'wholeFileOrBranchAcceptance': False}, ensure_ascii=False))


if __name__ == '__main__': main()
