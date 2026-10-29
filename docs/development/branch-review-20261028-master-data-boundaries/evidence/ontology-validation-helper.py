import hashlib
import json
from pathlib import Path
import subprocess
import yaml

root = Path('/workspace/edhr-nexus-frontend')
base = '8784ba87166addae9cb9659d6120aa84f993c7ef'
review = json.loads(Path('/tmp/edhr-boundary-rule-review.json').read_text())
result = yaml.safe_load(Path('/tmp/edhr-boundary-ontology-result.yaml').read_text())['ontologyResult']

def git(*args):
    return subprocess.check_output(['git', *args], cwd=root, text=True).strip()

def find_id(value, identity):
    if isinstance(value, dict):
        if value.get('id') == identity:
            return value
        for nested in value.values():
            found = find_id(nested, identity)
            if found is not None:
                return found
    elif isinstance(value, list):
        for nested in value:
            found = find_id(nested, identity)
            if found is not None:
                return found
    return None

assert git('rev-parse', 'HEAD') == base
assert git('rev-parse', 'origin/edhr-dev') == base
assert git('diff', '--name-only', base, '--', 'docs/knowledge', 'docs/architecture', 'AGENTS.md', 'docs/agents') == ''
assert len(review['records']) == len({row['id'] for row in review['records']}) == 8
sources = set()
for row in review['records']:
    path = root / row['sourcePath']
    document = yaml.safe_load(path.read_text())
    definition = find_id(document, row['id'])
    assert definition is not None, row['id']
    assert definition['status'] == row['originalMaturity'], row['id']
    assert document['knowledgeModelVersion'] == '0.3.25'
    assert row['conclusion'] == 'consistent'
    sources.add(row['sourcePath'])
    for reference in row['originalEvidenceReferences']:
        source = reference.split('#', 1)[0]
        assert (root / source).is_file(), source
        sources.add(source)
    for reference in row['implementationReferences']:
        if reference.startswith('git diff '):
            continue
        source, _, locator = reference.partition('#')
        path = root / source
        assert path.is_file(), source
        if locator:
            for symbol in locator.split('/'):
                assert symbol in path.read_text(), (source, symbol)
        sources.add(source)

assert result['result'] == 'not-applicable'
assert result['baselineBefore'] == result['baselineAfter'] == '0.3.25'
assert result['changedArtifacts'] == result['knowledgeSync'] == result['conflicts'] == result['questions'] == []
assert len(review['incrementalReviews']) == 1
for source in review['incrementalReviews'][0]['actuallyReadPaths']:
    assert (root / source).is_file()
    sources.add(source)
knowledge_log = Path('/tmp/edhr-boundary-ontology-knowledge.txt').read_bytes()
assert b'Tests run: 89, Failures: 0, Errors: 0, Skipped: 0' in knowledge_log
assert b'BUILD SUCCESS' in knowledge_log
inspection = {
    'result': 'passed',
    'baseCommit': base,
    'reviewedRecordCount': 8,
    'uniqueWithinBatch': 8,
    'newUniqueHistoricalCoverage': None,
    'knowledgeVersion': '0.3.25',
    'knowledgeAndContractDiff': [],
    'incrementalPureStyleReviews': 1,
    'knowledgeRunReusedForUnchangedKnowledge': True,
    'knowledgeTests': {'run': 89, 'failures': 0, 'errors': 0, 'skips': 0},
    'knowledgeLogSha256': hashlib.sha256(knowledge_log).hexdigest(),
    'sourceHashes': {source: hashlib.sha256((root / source).read_bytes()).hexdigest() for source in sorted(sources)},
    'qualification': 'ID/path/status and unchanged-knowledge assertions plus structural/reference tests; finite semantic review is recorded separately, not certified by this script.'
}
Path('/tmp/edhr-boundary-ontology-validation.json').write_text(json.dumps(inspection, ensure_ascii=False, indent=2) + '\n')
print(json.dumps({key: value for key, value in inspection.items() if key != 'sourceHashes'}, ensure_ascii=False))
