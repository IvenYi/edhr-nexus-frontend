from pathlib import Path
exec(Path('/tmp/edhr-w3c-qa-run.py').read_text().split('\nsnapshot=')[0])
snapshot=Path('/tmp/edhr-w3c-qa-baseline-tree')
archive=git('archive',base,'gmp-platform/frontend')
with tarfile.open(fileobj=io.BytesIO(archive)) as t:t.extractall(snapshot,filter='data')
(snapshot/'gmp-platform/frontend/node_modules').symlink_to(repo/'gmp-platform/frontend/node_modules',target_is_directory=True)
assert (snapshot/fixture).read_bytes()==(repo/fixture).read_bytes()
repair={'originalRun':'edhr-w3c-qa-baseline-summary.json','originalFreshXmlSuites':0,'productFailure':False,'cause':'Backend generate-resources npm build:dhr-print needs sibling frontend/package.json omitted by backend-only Git archive; npm ENOENT before tests.','environmentOnlyCorrection':'Added exact base Git frontend sources to isolated snapshot; linked existing node_modules, no product/test changes or installs.','base':base,'candidate':head,'rawLogExcluded':True}
Path('/tmp/edhr-w3c-qa-baseline-environment.json').write_text(json.dumps(repair,ensure_ascii=False,indent=2)+'\n')
run('baseline-retry',snapshot,'gmp-platform/backend/pom.xml','WorkflowInstanceAuthorizationIntegrationTest')
