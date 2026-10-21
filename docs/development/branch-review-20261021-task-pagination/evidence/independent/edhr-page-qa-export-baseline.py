from pathlib import Path
import hashlib,json,subprocess,tarfile,io
repo=Path('/workspace/edhr-nexus-frontend')
base='13def47d4def51237d1393eaa7bf2651e98a0cbd'
core='25e974e03813f6403618ce8a9efc735cafd429a2'
dest=Path('/tmp/edhr-page-qa-baseline-source')
dest.mkdir()
raw=subprocess.check_output(['git','archive',base,'gmp-platform'],cwd=repo)
with tarfile.open(fileobj=io.BytesIO(raw),mode='r:') as archive:
    archive.extractall(dest,filter='data')
fixture='gmp-platform/backend/src/test/java/com/zencas/edhr/workflow/controller/WorkflowTaskPaginationPostgresTest.java'
fixture_raw=subprocess.check_output(['git','show',core+':'+fixture],cwd=repo)
(dest/fixture).write_bytes(fixture_raw)
cache=repo/'gmp-platform/frontend/node_modules'
assert cache.is_dir()
(dest/'gmp-platform/frontend/node_modules').symlink_to(cache,target_is_directory=True)
receipt={'baseCommit':base,'fixtureCommit':core,'fixturePath':fixture,'fixtureSha256':hashlib.sha256(fixture_raw).hexdigest(),'sourceDirectory':str(dest),'onlyExtraTrackedSource':fixture,'sharedRepositoryMutations':False,'frontendNodeModules':'symlink to existing reusable dependencies only'}
Path('/tmp/edhr-page-qa-baseline-export.json').write_text(json.dumps(receipt,ensure_ascii=False,indent=2)+'\n')
print(json.dumps(receipt,ensure_ascii=False))
