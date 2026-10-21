from pathlib import Path
import hashlib,io,json,subprocess,tarfile,zipfile

repo=Path('/workspace/edhr-nexus-frontend')
base='c3343f45bb79f72368937f0d197ae01f989f0390'
destination=Path('/tmp/edhr-sig-qa-baseline-source')
assert not destination.exists(), 'Preserve prior baseline exports'
destination.mkdir()
archive=subprocess.check_output(['git','archive',base,'gmp-platform/backend','gmp-platform/frontend'],cwd=repo)
with tarfile.open(fileobj=io.BytesIO(archive)) as source:
    source.extractall(destination,filter='data')
fixture_archive=repo/'docs/development/branch-review-20261021-signature-payload/evidence/primary/retained-fixtures.zip'
with zipfile.ZipFile(fixture_archive) as source:
    fixture=source.read('edhr-sig-baseline-seven-fixture.java')
assert hashlib.sha256(fixture).hexdigest()=='c472a785b250334b5159cf01ebf0496f4131ef34480c68ec96075d84f8dfd242'
test=destination/'gmp-platform/backend/src/test/java/com/zencas/edhr/production/service/SignatureSnapshotPostgresTest.java'
assert not test.exists()
test.write_bytes(fixture)
(destination/'gmp-platform/frontend/node_modules').symlink_to(repo/'gmp-platform/frontend/node_modules',target_is_directory=True)
receipt={'author':'/root/signature_payload_independent','sourceCommit':base,'gitArchiveSha256':hashlib.sha256(archive).hexdigest(),'fixtureSha256':hashlib.sha256(fixture).hexdigest(),'destination':str(destination),'fixtureOnlyAddedToImmutableGitExport':True,'repositoryUntouched':True,'nodeModules':'symlink to existing dependencies only; no sources overwritten'}
Path('/tmp/edhr-sig-qa-baseline-export.json').write_text(json.dumps(receipt,indent=2)+'\n')
print(json.dumps(receipt))
