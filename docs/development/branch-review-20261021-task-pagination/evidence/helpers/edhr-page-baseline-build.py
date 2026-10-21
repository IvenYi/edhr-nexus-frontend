#!/usr/bin/env python3
"""L0 fixed-Git PR22 acceptance carry; no new product, source, or semantic validation."""
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

REPO = Path('/workspace/edhr-nexus-frontend')
BASE = '13def47d4def51237d1393eaa7bf2651e98a0cbd'
DELIVERY = '1b80df6298a819efaada9d6ad92ebfbea25a992f'
TESTED = 'aaef52a782327e68da736faf83a249a3217b7228'
CORE = '2ead6de2ed149f9c10a7786a555b0235c86b3186'
BATCH = 'docs/development/branch-review-20261021-signature-payload'
CATALOG = BATCH + '/source-catalog.json'
FINDING = 'W3-SIGNATURE-PAYLOAD-001'
CONTRACTS = ['AGENTS.md', 'codeplzreadme.md', 'docs/agents/agent-handoff-contract.md',
             'docs/agents/quality-verifier.md', 'docs/agents/business-knowledge-modeler.md']
PROTECTED = ['gmp-platform', 'scripts', 'docs/knowledge', 'docs/architecture', 'docs/agents',
             'AGENTS.md', 'codeplzreadme.md', 'DESIGN.md', CATALOG, BATCH + '/ledger']


def git(*args):
    return subprocess.check_output(['git', *args], cwd=REPO, stderr=subprocess.PIPE)


def sha(raw):
    return hashlib.sha256(raw).hexdigest()


def raw(path, ref=BASE):
    return git('show', ref + ':' + path)


def receipt(path, locator, ref=BASE):
    return {'path': path, 'commit': ref, 'sha256': sha(raw(path, ref)), 'locator': locator}


def dump(path, value):
    Path(path).write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')


def main():
    os.chdir(REPO)
    assert git('rev-parse', BASE + '^{commit}').decode().strip() == BASE
    parents = git('show', '-s', '--format=%P', BASE).decode().split()
    assert parents == ['c3343f45bb79f72368937f0d197ae01f989f0390', DELIVERY]
    merge_tree = git('rev-parse', BASE + '^{tree}').decode().strip()
    delivery_tree = git('rev-parse', DELIVERY + '^{tree}').decode().strip()
    assert merge_tree == delivery_tree
    protected_diff = git('diff', '--name-only', TESTED, BASE, '--', *PROTECTED).decode().splitlines()
    assert not protected_diff
    contract_receipts = []
    for path in CONTRACTS:
        assert raw(path) == raw(path, DELIVERY)
        contract_receipts.append({**receipt(path, 'complete fixed contract bytes'),
            'blob': git('rev-parse', BASE + ':' + path).decode().strip(), 'sameAsDelivery': True})
    original_raw = raw(CATALOG)
    original = json.loads(original_raw)
    assert len(original['methods']) == 485 and len(original['semanticSources']) == 6 and len(original['findings']) == 48
    assert 'w3d-signature-source:028' not in {r['id'] for r in original['methods']}
    assert any(n.get('id') == 'sig-rejected-range-028' for n in original['importNotes'])
    acceptance = json.loads(raw(BATCH + '/acceptance.json'))
    quality_raw = raw(BATCH + '/evidence/independent/edhr-sig-qa-qualityResult.yaml')
    quality = yaml.safe_load(quality_raw)['qualityResult']
    assert sha(quality_raw) == acceptance['qualityResult']['sha256'] == 'f5bd81909e8cd585763b01f73d64f3df64319f464f5654bdc6e77c3b5a569f85'
    assert acceptance['testedCommit'] == TESTED and acceptance['coreCommit'] == CORE
    assert acceptance['qualityResult']['result'] == 'passed' and acceptance['qualityResult']['status'] == 'FINAL'
    assert quality['result'] == 'passed' and quality['headCommit'] == TESTED
    assert quality['workingTreeState']['status'] == 'clean' and quality['blockingConditions'] == []
    required = [r for r in quality['checks'] if r['required']]
    assert len(required) == 8 and all(r['outcome'] == 'passed' for r in required)
    assert any(r['id'] == FINDING and r['resolutionStatus'] == 'resolved' for r in quality['findings'])
    assert acceptance['findings'] == [{'id': FINDING, 'severity': 'high', 'disposition': 'fixed-and-independently-accepted'}]
    delivery = json.loads(raw(BATCH + '/delivery.json'))
    assert delivery['number'] == 22 and delivery['qualityTestedCommit'] == TESTED
    artifact_receipts = [receipt(BATCH + '/acceptance.json', '/findings; /testedCommit; /qualityResult'),
        receipt(BATCH + '/evidence/independent/edhr-sig-qa-qualityResult.yaml', '/qualityResult/result; /qualityResult/checks; /qualityResult/findings'),
        receipt(BATCH + '/delivery.json', '/pullRequest; /qualityTestedCommit; /postTestChanges')]
    catalog = copy.deepcopy(original)
    catalog['baselineCommit'] = BASE
    index = next(i for i, row in enumerate(catalog['findings']) if row['id'] == FINDING)
    current = catalog['findings'][index]
    prior = copy.deepcopy(current)
    assert prior['disposition'] == 'fixed-awaiting-independent-acceptance'
    current['disposition'] = 'fixed-and-independently-accepted'
    current['resolution']['testedCommits'] = [TESTED]
    current['resolution']['pullRequests'] = [delivery['pullRequest']]
    current['resolution']['mergeCommits'] = [BASE]
    current['priorCatalogDisposition'] = {'catalog': receipt(CATALOG, '/findings/' + str(index)), 'originalRecord': prior}
    current['evidence'] += artifact_receipts
    current['limitations'] = [
        'Independent acceptance remains limited to the actual signed-payload storage/migration and adjacent regression scope. Lost historical original bytes, existing invalid signatures, application/migration pairing and lossy rollback restrictions remain.',
        'Original pending finding, limitations, resolution and evidence are preserved in priorCatalogDisposition.originalRecord; primary and independent old red, fixture/environment failures and original results are not rewritten.',
        'This mechanical carry executes no product tests, source reread or new semantic review and does not close all W3/W5/W1 or the whole audit. Pagination is still a separate source-only lead at this baseline; no new finding is added or accepted here.'
    ]
    current['dispositionQualification'] = 'Only this exact previous finding is carried from the real fresh clean aaef52a7 passed8/8, acceptance overlay and human PR22 merge13def47d. The merge tree equals final1b80 delivery, and protected product/test/knowledge/contract/catalog/ledger bytes equal the independently tested candidate. No new runtime or semantic acceptance is performed by this script.'
    current['acceptedDeliveryEvidence'] = {'kind': 'git-commit-and-tree-mechanical-comparison',
        'mergeCommit': BASE, 'mergeParents': parents,
        'mergeSubject': git('show', '-s', '--format=%s', BASE).decode().strip(),
        'deliveryCommit': DELIVERY, 'mergeTree': merge_tree, 'deliveryTree': delivery_tree, 'treeEqual': True,
        'testedCommit': TESTED, 'protectedComparedToTested': PROTECTED, 'changedProtectedPaths': protected_diff,
        'mergeIsNotNewRuntimeAcceptance': True}
    catalog['inheritedCatalog'] = {**receipt(CATALOG, '/'), 'preservedMethodRecords': 485,
        'preservedSemanticReviews': 108, 'preservedFindingRecords': 48,
        'preservedImportNotes': len(original.get('importNotes', [])),
        'previousInheritedCatalog': original.get('inheritedCatalog')}
    catalog['importNotes'].append({'noteKind': 'prior-acceptance-carry-forward', 'id': 'page-pr22-signature-accepted',
        'scope': FINDING, 'reason': current['dispositionQualification'], 'evidence': artifact_receipts})
    catalog['policy'].append('PR22 human merge carries forward only W3-SIGNATURE-PAYLOAD-001 from the real fresh aaef52a7 passed8/8. All485 scoped sources, six semantic sources/108 historical rows and other47 findings retain their original objects. Mechanical generation is not new source, runtime or semantic acceptance; pagination, old gaps and user-deferred items remain unchanged.')
    assert catalog['methods'] == original['methods'] and catalog['semanticSources'] == original['semanticSources']
    assert catalog['importNotes'][:-1] == original['importNotes']
    unchanged = [r for r in catalog['findings'] if r['id'] != FINDING]
    assert unchanged == [r for r in original['findings'] if r['id'] != FINDING] and len(unchanged) == 47
    assert not any(r['id'] == 'W3D-TASK-PAGINATION-001' for r in catalog['findings'])
    fixed_module_path = Path('/tmp/edhr-page-fixed-ledger-generator.py')
    fixed_module_path.write_bytes(raw('scripts/build-branch-review-ledger.py'))
    sys.dont_write_bytecode = True
    spec = importlib.util.spec_from_file_location('edhr_page_fixed_generator', fixed_module_path)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    fixed_git = module.Git()
    methods = module.reconcile_methods(fixed_git, BASE, catalog['methods'])
    knowledge = module.knowledge_records(fixed_git, BASE)
    semantics = module.reconcile_semantics(fixed_git, BASE, catalog['semanticSources'], knowledge)
    assert len(methods) == 485 and len(knowledge) == 2552 and len(semantics) == 108
    for finding in catalog['findings']:
        for item in finding['evidence']: module.evidence(fixed_git, item)
    for note in catalog['importNotes']:
        for item in note.get('evidence', []): module.evidence(fixed_git, item)
    source_carry = dict(collections.Counter(r['carryStatus'] for r in methods))
    semantic_carry = dict(collections.Counter(r['carryStatus'] for r in semantics))
    assert source_carry == {'needs-delta-review': 101, 'retained-scoped-evidence': 384}
    assert semantic_carry == {'retained-scoped-evidence': 51, 'needs-delta-review': 57}
    assert sum(r['historicalReview']['conclusion'] == 'evidence-gap' for r in semantics) == 4
    draft_path = Path('/tmp/edhr-page-baseline-draft-catalog.json')
    dump(draft_path, catalog)
    receipt_list = [receipt(CATALOG, '/'), *artifact_receipts, *contract_receipts,
        receipt('scripts/build-branch-review-ledger.py', 'complete fixed generator bytes')]
    dump('/tmp/edhr-page-baseline-receipts.json', {'baselineCommit': BASE, 'gitEvidence': receipt_list,
        'localGeneratedDraft': {'path': str(draft_path), 'sha256': sha(draft_path.read_bytes())}})
    summary = {'schema': 'edhr-l0-baseline-support/v1', 'author': '/root/pagination_baseline_support', 'status': 'FINAL',
        'baselineCommit': BASE, 'mergeParents': parents, 'mergeTree': merge_tree, 'deliveryCommit': DELIVERY,
        'deliveryTree': delivery_tree, 'treeEqual': True, 'protectedTestedCommit': TESTED,
        'changedProtectedPaths': protected_diff, 'trackedPaths': len(fixed_git.tree(BASE)), 'currentKnowledgeIds': len(knowledge),
        'sourceScopes': len(methods), 'sourceCarryStates': source_carry, 'semanticSources': 6,
        'historicalScopedSemanticRows': len(semantics), 'semanticCarryStates': semantic_carry, 'historicalEvidenceGaps': 4,
        'findingRecords': len(catalog['findings']), 'onlyFindingAdvanced': FINDING,
        'otherFindingObjectsUnchanged': 47, 'excluded028Retained': True, 'newPaginationFindingAdded': False,
        'actualPriorRequiredChecks': len(required), 'newRuntimeExecuted': False, 'newSemanticReviews': 0,
        'newSourceReview': False, 'wholeFilesCompleted': 0, 'overallAuditComplete': False, 'overallPercent': None,
        'repositoryWrites': False,
        'qualification': 'Fixed Git reconciliation and genuine prior acceptance carry only; original unresolved/deferred/open limitations remain. Counts are overlapping scopes and historical rows, not unique methods, IDs or defects.'}
    dump('/tmp/edhr-page-baseline-support.json', summary)
    files = [Path(__file__), draft_path, Path('/tmp/edhr-page-baseline-receipts.json'), Path('/tmp/edhr-page-baseline-support.json')]
    dump('/tmp/edhr-page-baseline-manifest.json', {'author': summary['author'], 'status': 'FINAL',
        'files': [{'path': str(p), 'bytes': p.stat().st_size, 'sha256': sha(p.read_bytes())} for p in files]})
    print(json.dumps(summary, ensure_ascii=False))


if __name__ == '__main__': main()
