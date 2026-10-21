#!/usr/bin/env python3
"""Mechanical PR20 acceptance carry-forward, never a product or semantic review."""
import argparse
import collections
import copy
import hashlib
import importlib.util
import json
import os
from pathlib import Path
import subprocess

import yaml


BASE = 'e8ecc103c8e6825c61c61b39b9cbd12b1474700e'
DELIVERY = 'a23f94c2617f35ba7147b070b341a63a65a23541'
TESTED = 'b8051583f6c85d52260174e6da191f36bb2c1de8'
PRIOR = 'docs/development/branch-review-20261020-w3-write-boundaries'
SOURCE = PRIOR + '/recheck/source-catalog.json'
IDS = {
    'AUD-H009', 'AUD-H010', 'AUD-H012', 'W3-TRANSFER-LOCK-001',
    'QF-W3-TENANT-KNOWLEDGE-001', 'QF-W3-UI-DOC-COUNT-001',
}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--repo', type=Path, default=Path('/workspace/edhr-nexus-frontend'))
    parser.add_argument('--out-prefix', type=Path, default=Path('/tmp/edhr-w3c-baseline'))
    args = parser.parse_args()
    os.chdir(args.repo)
    def git(*command):
        return subprocess.check_output(['git', *command], cwd=args.repo, stderr=subprocess.PIPE)
    def raw(path, ref=BASE):
        return git('show', f'{ref}:{path}')
    def sha(value):
        return hashlib.sha256(value).hexdigest()
    def receipt(path, locator, ref=BASE):
        data = raw(path, ref)
        return {'path': path, 'commit': ref, 'sha256': sha(data), 'locator': locator}
    def save(suffix, data):
        path = Path(str(args.out_prefix) + suffix)
        path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
        return path

    assert git('rev-parse', BASE).decode().strip() == BASE
    prior_bytes = raw(SOURCE)
    old = json.loads(prior_bytes)
    catalog = copy.deepcopy(old)
    assert len(old['methods']) == 314 and len(old['semanticSources']) == 4 and len(old['findings']) == 46
    acceptance_path = PRIOR + '/acceptance.json'
    accepted = json.loads(raw(acceptance_path))
    assert accepted['testedCommit'] == TESTED and accepted['qualityResult'] == 'passed'
    assert accepted['requiredChecks'] == accepted['requiredPassed'] == 24
    assert accepted['allProfessionalInstancesFinal'] is True
    assert {f['id'] for f in accepted['findings']} == IDS
    assert all(f['resolutionStatus'] == 'resolved' for f in accepted['findings'])
    quality_path = PRIOR + '/' + accepted['qualityResultPath']
    quality_bytes = raw(quality_path)
    assert sha(quality_bytes) == accepted['qualityResultSha256']
    quality = yaml.safe_load(quality_bytes)['qualityResult']
    required = [check for check in quality['checks'] if check['required']]
    assert quality['result'] == 'passed' and quality['headCommit'] == TESTED
    assert quality['baseCommit'] == accepted['targetCommit']
    assert quality['workingTreeState']['status'] == 'clean'
    assert len(required) == 24 and all(check['outcome'] == 'passed' for check in required)
    assert not quality['blockingConditions']
    assert all(f['resolutionStatus'] == 'resolved' for f in quality['findings'])
    parents = git('show', '-s', '--format=%P', BASE).decode().strip().split()
    assert len(parents) == 2 and parents[1] == DELIVERY
    merge_subject = git('show', '-s', '--format=%s', BASE).decode().strip()
    assert 'pull request #20' in merge_subject
    merge_tree = git('rev-parse', BASE + '^{tree}').decode().strip()
    delivery_tree = git('rev-parse', DELIVERY + '^{tree}').decode().strip()
    assert merge_tree == delivery_tree
    protected_paths = [
        'gmp-platform', 'scripts', 'docs/knowledge', 'docs/architecture', 'docs/agents',
        'AGENTS.md', 'codeplzreadme.md', 'DESIGN.md', SOURCE, PRIOR + '/recheck/ledger',
        PRIOR + '/source-catalog.json', PRIOR + '/ledger',
    ]
    protected_delta = git('diff', '--name-only', TESTED, BASE, '--', *protected_paths).decode().splitlines()
    assert not protected_delta
    merge_proof = {
        'kind': 'git-commit-and-tree-mechanical-comparison',
        'mergeCommit': BASE, 'mergeParents': parents, 'mergeSubject': merge_subject,
        'deliveryCommit': DELIVERY,
        'mergeTree': merge_tree, 'deliveryTree': delivery_tree, 'treeEqual': True,
        'testedCommit': TESTED, 'unchangedComparedToTestedPaths': protected_paths,
        'changedProtectedPathsComparedToTested': protected_delta,
        'mergeIsNotNewRuntimeAcceptance': True,
    }
    accepted_evidence = [
        receipt(acceptance_path, '/findings; /testedCommit; /requiredChecks'),
        receipt(quality_path, '/qualityResult/result; /qualityResult/checks; /qualityResult/findings; /qualityResult/headCommit'),
        receipt(PRIOR + '/delivery.json', '/pullRequest; /testedCommit; /postAcceptanceChanges'),
    ]
    for index, f in enumerate(catalog['findings']):
        if f['id'] not in IDS:
            continue
        assert f['disposition'] == 'fixed-awaiting-independent-acceptance'
        assert 'priorCatalogDisposition' not in f
        keys = (
            'disposition', 'dispositionQualification', 'resolution', 'limitations',
            'scopeQualification', 'originalStatus', 'originalSourceId', 'relatedKnowledgeId',
            'originalReviewedCommit', 'historicalSourceCommit',
        )
        f['priorCatalogDisposition'] = {
            'catalog': receipt(SOURCE, '/findings/' + str(index)),
            'fields': {key: copy.deepcopy(f[key]) for key in keys if key in f},
        }
        f['disposition'] = 'fixed-and-independently-accepted'
        f['dispositionQualification'] = (
            'The prior batch formal independent b805 result passed24/24 and its acceptance overlay '
            'closed this exact finding. Human PR20 merge e8ecc has the same tree as a23 delivery; '
            'listed product/test/knowledge/contract/catalog paths are byte-unchanged from tested b805. '
            'This carry-forward performs no new product tests, semantic review or whole-W3 acceptance.'
        )
        resolution = f.setdefault('resolution', {})
        for key, value in (
            ('testedCommits', TESTED),
            ('pullRequests', 'https://github.com/IvenYi/edhr-nexus-frontend/pull/20'),
            ('mergeCommits', BASE),
        ):
            values = resolution.setdefault(key, [])
            if value not in values:
                values.append(value)
        f['acceptedDeliveryEvidence'] = copy.deepcopy(merge_proof)
        f['evidence'].extend(copy.deepcopy(accepted_evidence))
        f['limitations'] = [
            'Accepted only for the original finding and listed prior-batch runtime/semantic scope; not whole-file, whole-W3 or whole-branch certification.',
            'Historical original and pending disposition are preserved under priorCatalogDisposition; failed round1 and original semantic records remain unchanged.',
            'The catalog preparation script executed no product tests or new semantic review; new work in the task-command batch requires its own applicable acceptance.',
        ]
        if f['id'] in {'AUD-H009', 'AUD-H010'}:
            f['limitations'].append('The adjacent defaultBranch extra-fields source lead was not adjudicated by the retired top-level-key repair.')
        if f['id'] == 'AUD-H012':
            f['limitations'].append('Generic first-available original parsing evidence differs from ordinary frozen IDs/restricted/config; no historical candidate reconstruction or full tenant-isolation certification.')

    catalog['baselineCommit'] = BASE
    catalog['inheritedCatalog'] = {
        **receipt(SOURCE, '/'),
        'preservedMethodRecords': 314,
        'preservedSemanticReviews': 90,
        'preservedFindingRecords': 46,
        'preservedImportNotes': len(old.get('importNotes', [])),
        'previousInheritedCatalog': copy.deepcopy(old['inheritedCatalog']),
    }
    catalog.setdefault('importNotes', []).append({
        'noteKind': 'independent-acceptance-and-human-merge-carry-forward',
        'id': 'w3c-pr20-six-accepted-scoped-findings',
        'scope': sorted(IDS),
        'reason': 'Only six old dispositions are advanced using actual prior acceptance and matching Git delivery/merge tree; methods, semantic sources and unrelated findings remain exact originals.',
        'mergeProof': copy.deepcopy(merge_proof),
        'evidence': copy.deepcopy(accepted_evidence),
    })
    catalog['policy'].append(
        'PR20 human merge carries forward six accepted scoped findings from actual b805 passed24/24. '
        '314 overlapping source scopes and 90 historical semantic reviews remain unchanged; merge and mechanical classification are not new product or whole-branch acceptance.'
    )
    assert catalog['methods'] == old['methods']
    assert catalog['semanticSources'] == old['semanticSources']
    untouched_old = [f for f in old['findings'] if f['id'] not in IDS]
    untouched_new = [f for f in catalog['findings'] if f['id'] not in IDS]
    assert untouched_new == untouched_old and len(untouched_old) == 40

    # Load the exact fixed Git generator to mechanically recompute carry states.
    # Its data functions inspect Git records; no test or business executable is run.
    generator_path = 'scripts/build-branch-review-ledger.py'
    generator_bytes = raw(generator_path)
    fixed_generator = Path(str(args.out_prefix) + '-fixed-ledger-generator.py')
    fixed_generator.write_bytes(generator_bytes)
    module_spec = importlib.util.spec_from_file_location('edhr_w3c_fixed_ledger', fixed_generator)
    module = importlib.util.module_from_spec(module_spec)
    module_spec.loader.exec_module(module)
    # Its Git wrapper uses cwd; this process changed to the selected --repo above.
    fixed_git = module.Git()
    knowledge = module.knowledge_records(fixed_git, BASE)
    methods = module.reconcile_methods(fixed_git, BASE, catalog['methods'])
    semantics = module.reconcile_semantics(fixed_git, BASE, catalog['semanticSources'], knowledge)
    qualities, syncs, _ = module.report_indexes(fixed_git, BASE)
    for f in catalog['findings']:
        for item in f.get('evidence', []):
            module.evidence(fixed_git, item)
    for note in catalog.get('importNotes', []):
        for item in note.get('evidence', []):
            module.evidence(fixed_git, item)
    assert len(knowledge) == 2546 and len(semantics) == 90
    source_counts = collections.Counter(m['carryStatus'] for m in methods)
    semantic_counts = collections.Counter(s['carryStatus'] for s in semantics)
    tree = fixed_git.tree(BASE)
    source_receipts = [receipt(path, '/') for path in (
        SOURCE, acceptance_path, quality_path, PRIOR + '/delivery.json', generator_path,
        'scripts/build-branch-review-inventory.py', 'AGENTS.md', 'codeplzreadme.md',
        'docs/agents/agent-handoff-contract.md', 'docs/knowledge/schema.yaml',
    )]
    draft_path = save('-catalog-draft.json', catalog)
    supporting = {
        'schema': 'edhr-readonly-baseline-catalog-support/v1',
        'role': 'L0 readonly maintenance support, not quality acceptance',
        'contractBaseline': {
            'sourceCommit': BASE, 'targetBranch': 'edhr-dev', 'targetCommit': BASE,
            'contractReadCommit': BASE, 'uncommittedContractPaths': [],
        },
        'knowledgeVersion': '0.3.25', 'schemaVersion': '1.2.0',
        'sourceCatalog': receipt(SOURCE, '/'),
        'mergeProof': merge_proof,
        'inventory': {'trackedPaths': len(tree), 'currentKnowledgeIds': len(knowledge)},
        'inherited': {
            'methods': len(methods), 'semanticSources': len(catalog['semanticSources']),
            'historicalSemanticRecords': len(semantics), 'findingRecords': len(catalog['findings']),
            'methodsExact': True, 'semanticSourcesExact': True, 'other40FindingsExact': True,
            'sourceCarryStates': dict(source_counts),
            'semanticCarryStates': dict(semantic_counts),
            'semanticRecordRelations': dict(collections.Counter(s['recordRelation'] for s in semantics)),
            'historicalSemanticConclusions': dict(collections.Counter(s['historicalReview']['conclusion'] for s in semantics)),
            'wholeFilesCompleted': 0,
        },
        'dispositions': dict(collections.Counter(f['disposition'] for f in catalog['findings'])),
        'qualityReportIndex': {
            'artifacts': len(qualities),
            'reportedHistoricalResults': dict(collections.Counter(q['reported'].get('result') for q in qualities)),
            'ontologyMaintenanceArtifacts': len(syncs), 'currentRuntimeExecutedByThisTask': False,
        },
        'acceptedPriorFindings': sorted(IDS),
        'draft': {'path': str(draft_path), 'bytes': draft_path.stat().st_size, 'sha256': sha(draft_path.read_bytes())},
        'generator': {'path': generator_path, 'sha256': sha(generator_bytes), 'fixedTemporaryCopy': str(fixed_generator)},
        'productTestsExecuted': [], 'newSemanticReviewsPerformed': 0,
        'repositoryMutations': False, 'wholeBranchAccepted': False,
        'retainedBoundaries': ['W4 H006/H007/H008 pending adjudication', 'two user-deferred DHR highs', 'four old knowledge evidence gaps', 'A12', 'W5-AUDIT-HASH-001 medium/open', 'remaining W2/W3/W4–W7'],
        'generationCommandAfterRootReview': [
            'python3', 'scripts/build-branch-review-ledger.py', '--ref', BASE,
            '--catalog', 'docs/development/branch-review-20261020-w3-task-commands/source-catalog.json',
            '--out', 'docs/development/branch-review-20261020-w3-task-commands/ledger',
        ],
        'limitations': [
            'Current baseline draft has no new task-command source scopes or defect adjudications; root must add actual current work before final candidate generation.',
            'Catalog baselineCommit must equal the selected fixed ledger --ref; later implementation commits require an explicit baseline update and re-evaluation, not a silent current-tree fallback.',
            'Generated inventories and carried histories are not complete source/semantic/runtime acceptance; failed reports remain indexed as historical originals.',
        ],
        'sourceReceipts': source_receipts,
    }
    support_path = save('-support.json', supporting)
    manifest_path = save('-receipts.json', {
        'schema': 'edhr-readonly-catalog-support-originals/v1',
        'files': [
            {'path': str(path), 'bytes': path.stat().st_size, 'sha256': sha(path.read_bytes())}
            for path in (Path(__file__), draft_path, support_path, fixed_generator)
        ],
    })
    print(json.dumps({
        'draft': str(draft_path), 'support': str(support_path), 'receipts': str(manifest_path),
        'trackedPaths': len(tree), 'currentKnowledgeIds': len(knowledge),
        'sourceCarryStates': dict(source_counts), 'semanticCarryStates': dict(semantic_counts),
        'acceptedPriorFindings': len(IDS), 'newProductTests': 0, 'repositoryMutations': False,
    }, ensure_ascii=False))


if __name__ == '__main__':
    main()
