#!/usr/bin/env python3
"""L0 PR21 acceptance carry-forward only; never product or semantic review."""
import argparse
import collections
import copy
import hashlib
import importlib.util
import json
import os
from pathlib import Path
import subprocess
import sys
import yaml

BASE = 'c3343f45bb79f72368937f0d197ae01f989f0390'
DELIVERY = '360b07adb82e907b4a634db66695350d9e38f765'
TESTED = '42cb2820946287d409a2a02394cc85e4067e20bb'
PRIOR = 'docs/development/branch-review-20261020-w3-task-commands'
SOURCE = PRIOR + '/source-catalog.json'
FINDING = 'W3C-INSTANCE-WRITE-AUTH-001'


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--repo', type=Path, default=Path('/workspace/edhr-nexus-frontend'))
    parser.add_argument('--out-prefix', type=Path, default=Path('/tmp/edhr-sig-baseline'))
    args = parser.parse_args()
    os.chdir(args.repo)
    def git(*args): return subprocess.check_output(['git', *args], stderr=subprocess.PIPE)
    def raw(path, ref=BASE): return git('show', ref + ':' + path)
    def sha(value): return hashlib.sha256(value).hexdigest()
    def receipt(path, locator='/', ref=BASE):
        return {'path': path, 'commit': ref, 'sha256': sha(raw(path, ref)), 'locator': locator}
    def write(suffix, value):
        path = Path(str(args.out_prefix) + suffix)
        path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
        return path

    old = json.loads(raw(SOURCE)); catalog = copy.deepcopy(old)
    assert len(old['methods']) == 392 and len(old['semanticSources']) == 5 and len(old['findings']) == 47
    acceptance_path = PRIOR + '/acceptance.json'
    acceptance = json.loads(raw(acceptance_path))
    assert acceptance['testedCommit'] == TESTED and acceptance['qualityResult'] == 'passed'
    assert acceptance['requiredChecks'] == acceptance['requiredPassed'] == 16
    assert acceptance['currentRequiredProfessionalInstancesFinal'] is True
    assert acceptance['interruptedPreviousSessionsClaimedFinal'] is False
    assert {f['id'] for f in acceptance['findings']} == {FINDING}
    assert all(f['resolutionStatus'] == 'resolved' for f in acceptance['findings'])
    quality_path = PRIOR + '/' + acceptance['qualityResultPath']
    quality_raw = raw(quality_path)
    assert sha(quality_raw) == acceptance['qualityResultSha256']
    quality = yaml.safe_load(quality_raw)['qualityResult']
    required = [c for c in quality['checks'] if c['required']]
    assert quality['result'] == 'passed' and quality['headCommit'] == TESTED
    assert quality['baseCommit'] == acceptance['targetCommit']
    assert quality['workingTreeState']['status'] == 'clean'
    assert len(required) == 16 and all(c['outcome'] == 'passed' for c in required)
    assert not quality['blockingConditions']
    assert {f['id'] for f in quality['findings']} == {FINDING}
    assert all(f['resolutionStatus'] == 'resolved' for f in quality['findings'])
    delivery_path = PRIOR + '/delivery.json'; delivery = json.loads(raw(delivery_path))
    assert delivery['number'] == 21 and delivery['testedCommit'] == TESTED
    parents = git('show', '-s', '--format=%P', BASE).decode().strip().split()
    subject = git('show', '-s', '--format=%s', BASE).decode().strip()
    assert len(parents) == 2 and parents[1] == DELIVERY and 'pull request #21' in subject
    merge_tree = git('rev-parse', BASE + '^{tree}').decode().strip()
    delivery_tree = git('rev-parse', DELIVERY + '^{tree}').decode().strip()
    assert merge_tree == delivery_tree
    protected = ['gmp-platform', 'scripts', 'docs/knowledge', 'docs/architecture', 'docs/agents',
                 'AGENTS.md', 'codeplzreadme.md', 'DESIGN.md', SOURCE, PRIOR + '/ledger']
    delta = git('diff', '--name-only', TESTED, BASE, '--', *protected).decode().splitlines()
    assert not delta
    merge_proof = {'kind': 'git-commit-and-tree-mechanical-comparison',
                   'mergeCommit': BASE, 'mergeParents': parents, 'mergeSubject': subject,
                   'deliveryCommit': DELIVERY, 'mergeTree': merge_tree, 'deliveryTree': delivery_tree,
                   'treeEqual': True, 'testedCommit': TESTED, 'protectedComparedToTested': protected,
                   'changedProtectedPaths': delta, 'mergeIsNotNewRuntimeAcceptance': True}
    accepted_receipts = [receipt(acceptance_path, '/findings; /testedCommit; /requiredChecks'),
                         receipt(quality_path, '/qualityResult/result; /qualityResult/headCommit; /qualityResult/checks; /qualityResult/findings'),
                         receipt(delivery_path, '/pullRequest; /testedCommit; /postAcceptanceChanges')]
    selected = [f for f in catalog['findings'] if f['id'] == FINDING]
    assert len(selected) == 1
    current = selected[0]; index = catalog['findings'].index(current)
    assert current['disposition'] == 'fixed-awaiting-independent-acceptance'
    assert 'priorCatalogDisposition' not in current
    current['priorCatalogDisposition'] = {'catalog': receipt(SOURCE, '/findings/' + str(index)),
                                          'originalRecord': copy.deepcopy(current)}
    current['disposition'] = 'fixed-and-independently-accepted'
    current['dispositionQualification'] = (
        'Only this exact prior finding is carried from formal independent clean42cb passed16/16, '
        'its acceptance overlay and human PR21 merge c334. Merge tree equals final360b delivery; '
        'listed product/test/knowledge/contract/catalog paths equal tested42cb. This mechanical task '
        'performs no new runtime tests, semantic/source reread or whole-W3 acceptance.'
    )
    for key, value in [('testedCommits', TESTED), ('pullRequests', delivery['pullRequest']), ('mergeCommits', BASE)]:
        values = current['resolution'].setdefault(key, [])
        if value not in values: values.append(value)
    current['acceptedDeliveryEvidence'] = copy.deepcopy(merge_proof)
    current['evidence'].extend(copy.deepcopy(accepted_receipts))
    current['limitations'] = [
        'Independent acceptance is limited to the three instance administrative write authorization omissions and original listed regression scope, not administrator rawCRUD content policy or all workflow actions.',
        'Original pending finding, limitations, resolution and evidence are preserved under priorCatalogDisposition.originalRecord; original fixture/environment failures and historical evidence are not rewritten.',
        'Mechanical carry-forward executes no new product tests, source/semantic review, signature digest probe or whole-file/branch acceptance. New signature work requires its own actual evidence and gates.',
    ]
    catalog['baselineCommit'] = BASE
    catalog['inheritedCatalog'] = {**receipt(SOURCE), 'preservedMethodRecords': 392,
                                    'preservedSemanticReviews': 96, 'preservedFindingRecords': 47,
                                    'preservedImportNotes': len(old.get('importNotes', [])),
                                    'previousInheritedCatalog': copy.deepcopy(old.get('inheritedCatalog'))}
    catalog.setdefault('importNotes', []).append({'noteKind': 'independent-acceptance-and-human-merge-carry-forward',
        'id': 'signature-baseline-pr21-one-accepted-finding', 'scope': [FINDING],
        'reason': 'Only one old disposition advances using its actual16/16 acceptance and matching Git delivery/merge tree. All392 methods, five original semantic sources/96 rows and other46 findings are exact originals.',
        'mergeProof': copy.deepcopy(merge_proof), 'evidence': copy.deepcopy(accepted_receipts)})
    catalog['policy'].append('PR21 merge carries forward only W3C-INSTANCE-WRITE-AUTH-001 from actual42cb passed16/16. All scoped methods and semantic originals retain their own fixed commits and limitations; no new signature defect, runtime test or semantic acceptance is inferred.')
    assert catalog['methods'] == old['methods'] and catalog['semanticSources'] == old['semanticSources']
    assert [f for f in catalog['findings'] if f['id'] != FINDING] == [f for f in old['findings'] if f['id'] != FINDING]

    generator_path = 'scripts/build-branch-review-ledger.py'; generator_raw = raw(generator_path)
    fixed_generator = Path(str(args.out_prefix) + '-fixed-ledger-generator.py'); fixed_generator.write_bytes(generator_raw)
    sys.dont_write_bytecode = True
    spec = importlib.util.spec_from_file_location('edhr_sig_baseline_fixed_ledger', fixed_generator)
    module = importlib.util.module_from_spec(spec); spec.loader.exec_module(module)
    fixed_git = module.Git(); tree = fixed_git.tree(BASE)
    knowledge = module.knowledge_records(fixed_git, BASE)
    methods = module.reconcile_methods(fixed_git, BASE, catalog['methods'])
    semantics = module.reconcile_semantics(fixed_git, BASE, catalog['semanticSources'], knowledge)
    assert len(knowledge) == 2548 and len(semantics) == 96
    for finding in catalog['findings']:
        for item in finding['evidence']: module.evidence(fixed_git, item)
    for note in catalog['importNotes']:
        for item in note.get('evidence', []): module.evidence(fixed_git, item)
    qualities, syncs, _ = module.report_indexes(fixed_git, BASE)
    schema = yaml.safe_load(raw('docs/knowledge/schema.yaml'))
    governance = ['AGENTS.md', 'codeplzreadme.md', 'docs/agents/agent-handoff-contract.md']
    source_receipts = [receipt(p) for p in [SOURCE, acceptance_path, quality_path, delivery_path,
                                           generator_path, 'scripts/build-branch-review-inventory.py',
                                           'docs/knowledge/schema.yaml', *governance]]
    draft_path = write('-draft-catalog.json', catalog)
    support = {'schema': 'edhr-readonly-baseline-catalog-support/v1',
        'role': 'L0 read-only mechanical acceptance carry-forward, not formal QA or ontology',
        'contractBaseline': {'sourceCommit': BASE, 'targetBranch': 'edhr-dev', 'targetCommit': BASE,
                             'contractReadCommit': BASE, 'uncommittedContractPaths': []},
        'knowledgeVersion': schema['knowledgeModelVersion'], 'schemaVersion': schema['schemaVersion'],
        'sourceCatalog': receipt(SOURCE), 'mergeProof': merge_proof,
        'inventory': {'trackedPaths': len(tree), 'currentKnowledgeIds': len(knowledge),
                      'classificationIsNotHumanReview': True},
        'inherited': {'methods': len(methods), 'semanticSources': len(catalog['semanticSources']),
            'historicalSemanticRecords': len(semantics), 'findingRecords': len(catalog['findings']),
            'methodsExact': True, 'semanticSourcesExact': True, 'other46FindingsExact': True,
            'sourceCarryStates': dict(collections.Counter(m['carryStatus'] for m in methods)),
            'semanticCarryStates': dict(collections.Counter(s['carryStatus'] for s in semantics)),
            'semanticRecordRelations': dict(collections.Counter(s['recordRelation'] for s in semantics)),
            'historicalSemanticConclusions': dict(collections.Counter(s['historicalReview']['conclusion'] for s in semantics)),
            'wholeFilesCompleted': 0},
        'dispositions': dict(collections.Counter(f['disposition'] for f in catalog['findings'])),
        'qualityReportIndex': {'artifacts': len(qualities), 'reportedHistoricalResults': dict(collections.Counter(q['reported'].get('result') for q in qualities)),
                               'ontologyMaintenanceArtifacts': len(syncs), 'currentRuntimeExecutedByThisTask': False},
        'acceptedPriorFindings': [FINDING],
        'draft': {'path': str(draft_path), 'bytes': draft_path.stat().st_size, 'sha256': sha(draft_path.read_bytes())},
        'generator': {'path': generator_path, 'sha256': sha(generator_raw), 'fixedTemporaryCopy': str(fixed_generator)},
        'sourceReceipts': source_receipts, 'productTestsExecuted': [], 'newSemanticReviewsPerformed': 0,
        'newSourceReviewsPerformed': 0, 'newFindingAdjudications': [], 'repositoryMutations': False,
        'wholeBranchAccepted': False, 'wholeW3Accepted': False,
        'retainedBoundaries': ['remaining W2/W3/W4-W7', 'two user-deferred DHR highs/A12', 'four old knowledge evidence gaps',
                               'W5-AUDIT-HASH-001 medium/open', 'new signature source lead needs its own native PG evidence; not adjudicated here'],
        'limitations': ['Fixed Git only; current mutable signature test/decisionPackage ignored.',
                        'Historical96 scoped rows are not96 distinct current IDs or a complete semantic coverage denominator.',
                        '392 overlapping source scopes are not392 distinct methods or completed files; changed files/dependencies retain delta-review states.',
                        'Future ledger ref must equal explicitly updated catalog baselineCommit; no current-tree fallback.']}
    assert support['knowledgeVersion'] == '0.3.25' and support['schemaVersion'] == '1.2.0'
    support_path = write('-support.json', support)
    manifest_path = write('-receipts.json', {'schema': 'edhr-readonly-catalog-support-originals/v1',
        'files': [{'path': str(p), 'bytes': p.stat().st_size, 'sha256': sha(p.read_bytes())}
                  for p in [Path(__file__), draft_path, support_path, fixed_generator]]})
    print(json.dumps({'draft': str(draft_path), 'support': str(support_path), 'receipts': str(manifest_path),
                      'inventory': support['inventory'], 'inherited': support['inherited']}, ensure_ascii=False))


if __name__ == '__main__': main()
