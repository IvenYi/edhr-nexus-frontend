from pathlib import Path
import hashlib
import json
import subprocess
import yaml

root = Path('/workspace/edhr-nexus-frontend')
report_path = Path('/tmp/edhr-designer-cancel-rule-review-20261028.json')
report = json.loads(report_path.read_text())
package = yaml.safe_load((root / 'docs/development/branch-review-20261028-designer-cancel/decision-package.yaml').read_text())['decisionPackage']
ontology = yaml.safe_load(Path('/tmp/edhr-designer-cancel-ontology-20261028.yaml').read_text())['ontologyResult']
required = ['id', 'scope', 'knowledgeBaselineVersion', 'contractBaseline', 'summary', 'confirmed', 'inferred', 'unresolved', 'replacementScopes', 'impactAnalysis', 'extensionStrategy', 'affectedFiles', 'acceptanceScenarios']
assert all(key in package for key in required)
assert package['impactAnalysis']['level'] == 'L2'
assert package['knowledgeBaselineVersion'] == '0.3.25'
head = subprocess.check_output(['git', 'rev-parse', 'HEAD'], cwd=root, text=True).strip()
target = subprocess.check_output(['git', 'rev-parse', 'origin/edhr-dev'], cwd=root, text=True).strip()
assert head == target == report['contractBaseline']['sourceCommit']
assert all((root / item['path']).exists() for item in package['affectedFiles'])
assert len(report['reviews']) == len({row['id'] for row in report['reviews']}) == 7
assert sum(row['conclusion'] == 'consistent' for row in report['reviews']) == 6
assert sum(row['conclusion'] == 'evidence-gap' for row in report['reviews']) == 1
for row in report['reviews']:
    source = root / row['path'].split(':')[0]
    assert source.exists()
    assert ('id: ' + row['id']) in source.read_text()
    for ref in row['sources']:
        assert (root / ref.split(':')[0]).exists(), ref
assert ontology['result'] == 'not-applicable'
assert ontology['changedArtifacts'] == ontology['knowledgeSync'] == ontology['conflicts'] == ontology['questions'] == []
assert ontology['contractBaseline'] == report['contractBaseline']
knowledge_delta = subprocess.check_output(['git', 'diff', '--name-only', '--', 'docs/knowledge', 'docs/architecture', 'AGENTS.md', 'docs/agents'], cwd=root, text=True).strip()
assert not knowledge_delta
hashes = {file: hashlib.sha256((root / file).read_bytes()).hexdigest() for file in report['workingTreeEvidence']['productHashes']}
assert hashes == report['workingTreeEvidence']['productHashes']
result = {
    'outcome': 'passed',
    'headCommit': head,
    'targetCommit': target,
    'knowledgeBaselineVersion': package['knowledgeBaselineVersion'],
    'knowledgeIdsChecked': 7,
    'consistentWithinStatedScope': 6,
    'retainedEvidenceGap': 1,
    'productWorkingTreeHashes': hashes,
    'knowledgeOrContractDelta': [],
    'boundary': 'Local result/package shape and referenced IDs/paths only; no browser, backend, build or full-knowledge Maven validation.'
}
Path('/tmp/edhr-designer-cancel-ontology-validation-20261028.json').write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n')
print(json.dumps(result, ensure_ascii=False))
