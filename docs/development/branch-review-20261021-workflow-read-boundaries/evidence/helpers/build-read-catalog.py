#!/usr/bin/env python3
"""L0 finite-map importer only; not a source/runtime/semantic acceptance tool."""
import argparse
import copy
import hashlib
import json
from pathlib import Path
import subprocess

REPO = Path('/workspace/edhr-nexus-frontend')
TARGET = 'd405a9afb4327b859545fa5a12c7eebe1350f418'
BATCH = 'docs/development/branch-review-20261021-workflow-read-boundaries'
DRAFT = BATCH + '/evidence/helpers/baseline-draft-catalog.json'
MAP = BATCH + '/evidence/primary/source-map.json'
DRAFT_SHA = 'c8bd6a664e5bbc9edeee9cd106f279ae4e1fbd79aee2af1f89cb95ef90e9df88'
FINDINGS = [
    ('W3-INSTANCE-GRAPH-CURRENT-001', 'Exact stored CSV node IDs must match as whole identifiers in the instance version, not by substring.', ['gmp-platform/backend/src/main/java/com/zencas/edhr/workflow/controller/WorkflowInstanceController.java']),
    ('W3-INSTANCE-LOGS-ARRAY-001', 'The maintained logs page must consume the existing ordered array and paginate that array rather than silently treating it as a PageResult.', ['gmp-platform/frontend/src/pages/workflow-center/InstanceLogs.tsx']),
    ('W3-INSTANCE-READ-ID-PRECISION-001', 'Instance detail/log route IDs must survive GET construction without Number rounding beyond JavaScript safe integers.', ['gmp-platform/frontend/src/pages/workflow-center/InstanceDetail.tsx', 'gmp-platform/frontend/src/pages/workflow-center/InstanceLogs.tsx', 'gmp-platform/frontend/src/api/workflow-instances.ts', 'gmp-platform/frontend/src/api/workflow-logs.ts']),
]


def git(*args):
    return subprocess.check_output(['git', *args], cwd=REPO, stderr=subprocess.PIPE)


def raw(ref, path):
    assert not Path(path).is_absolute() and '..' not in Path(path).parts
    return git('show', ref + ':' + path)


def sha(value):
    return hashlib.sha256(value).hexdigest()


def receipt(ref, path, locator):
    return {'path': path, 'commit': ref, 'sha256': sha(raw(ref, path)), 'locator': locator}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--ref', required=True)
    parser.add_argument('--out', type=Path, required=True)
    args = parser.parse_args()
    baseline = git('rev-parse', '--verify', args.ref + '^{commit}').decode().strip()
    subprocess.run(['git', 'merge-base', '--is-ancestor', TARGET, baseline], cwd=REPO, check=True)
    assert not args.out.exists(), 'Do not overwrite historical output'
    draft_raw = raw(baseline, DRAFT)
    assert sha(draft_raw) == DRAFT_SHA
    inherited = json.loads(draft_raw)
    assert inherited['baselineCommit'] == TARGET
    assert (len(inherited['methods']), len(inherited['semanticSources']), len(inherited['findings'])) == (545, 6, 49)
    assert not any(row['id'] == 'w3d-signature-source:028' for row in inherited['methods'])
    catalog = copy.deepcopy(inherited)
    catalog['baselineCommit'] = baseline
    scopes = json.loads(raw(baseline, MAP))['sourceScopes']
    assert len(scopes) == 29
    seen = {row['id'] for row in catalog['methods']}
    for index, scope in enumerate(scopes):
        assert scope['id'] not in seen and scope['wholeFileReviewComplete'] is False
        assert type(scope['runtimeExecuted']) is bool
        ref = scope['sourceCommit']
        assert git('rev-parse', '--verify', ref + '^{commit}').decode().strip() == ref
        subprocess.run(['git', 'merge-base', '--is-ancestor', ref, baseline], cwd=REPO, check=True)
        value = raw(ref, scope['path'])
        blob = git('rev-parse', ref + ':' + scope['path']).decode().strip()
        assert scope['sha256'] == sha(value) and scope['blob'] == blob
        start, end = scope['range']
        assert type(start) is int and type(end) is int and 1 <= start <= end <= len(value.splitlines())
        catalog['methods'].append({
            'id': scope['id'], 'path': scope['path'], 'scope': scope['method'], 'pathScope': [start, end],
            'reviewedCommit': ref, 'sourceBlob': blob, 'sourceSha256': sha(value), 'depth': scope['readDepth'],
            'wholeFileReviewComplete': False, 'recordedOutcome': scope['conclusion'],
            'evidence': receipt(baseline, MAP, '/sourceScopes/' + str(index)), 'additionalEvidence': [],
            'runtimeExecutionAsReportedBySourceMap': scope['runtimeExecuted'],
            'reviewedCommitBasis': 'Original finite range and Git blob only. Import does not execute source/runtime/semantic acceptance, and a primary runtime marker is not formal independent acceptance.'
        })
        seen.add(scope['id'])
    validation_path = BATCH + '/evidence/primary/validation-summary.json'
    primary = json.loads(raw(baseline, validation_path))
    core = primary['coreCommit']
    assert primary['targetCommit'] == TARGET
    subprocess.run(['git', 'merge-base', '--is-ancestor', core, baseline], cwd=REPO, check=True)
    findings_path = BATCH + '/findings.md'
    for finding_id, description, paths in FINDINGS:
        assert finding_id in raw(baseline, findings_path).decode()
        assert not any(row['id'] == finding_id for row in catalog['findings'])
        catalog['findings'].append({
            'id': finding_id, 'recordKind': 'product-defect', 'severity': 'medium', 'workPackage': 'W3',
            'originalStatus': 'primary-implementation-evidence-awaiting-independent-acceptance',
            'originalReviewedCommit': TARGET, 'aliases': [], 'description': description, 'affectedPaths': paths,
            'disposition': 'fixed-awaiting-independent-acceptance',
            'resolution': {'fixCommits': [core], 'testedCommits': [], 'pullRequests': [], 'mergeCommits': []},
            'limitations': [
                'Actual primary red/green originals are separate from this mechanical importer. Fresh clean-candidate independent acceptance is still required.',
                'Only existing read representation/identity is repaired. Authoritative state, actions, candidate/delegation, DHR, authentication policy, signatures, snapshots and audit are unchanged.',
                'Controlled API browser16 is not full app/login/backend E2E. Existing detail/log projections and style limitations remain; no whole-file/W3/branch completion.',
                'Prior545 finite scopes, six sources/108 historical semantic rows and49 finding objects remain unchanged. Rejected028, four gaps, generic policy questions and all user-deferred/history limits remain.'
            ],
            'evidence': [receipt(baseline, findings_path, finding_id + ' root cause, scope and limitations'), receipt(baseline, validation_path, '/; primary actual evidence, not importer execution')]
        })
    catalog['importNotes'].append({
        'noteKind': 'source-map-qualification', 'id': 'workflow-read-finite-import', 'scope': [row['id'] for row in scopes],
        'reason': 'Only29 overlapping primary finite ranges and three technical medium pending findings are appended. Zero new semantic rows; no runtime/source acceptance by import, no whole-file or branch completion.',
        'evidence': [receipt(baseline, MAP, '/sourceScopes'), receipt(baseline, validation_path, '/')]
    })
    catalog['policy'].append('Workflow-read batch preserves inherited545 scopes, six semantic sources/108 historical rows and49 finding objects; appends29 finite primary scopes and three pending technical medium findings. No new formal semantic review or whole-file/branch acceptance. Carry counts must be recalculated for this fixed baseline.')
    assert catalog['methods'][:545] == inherited['methods']
    assert catalog['semanticSources'] == inherited['semanticSources']
    assert catalog['findings'][:49] == inherited['findings']
    assert len(catalog['findings']) == 52 and len(catalog['methods']) == 574
    args.out.parent.mkdir(parents=True, exist_ok=True)
    args.out.write_text(json.dumps(catalog, ensure_ascii=False, indent=2) + '\n')
    print(json.dumps({'baselineCommit': baseline, 'outputSha256': sha(args.out.read_bytes()), 'sourceScopes': 574, 'newFiniteScopes': 29, 'findings': 52, 'semanticSources': 6, 'newSemanticRows': 0, 'runtimeExecutedByImporter': False, 'wholeBranchAccepted': False}))


if __name__ == '__main__':
    main()
