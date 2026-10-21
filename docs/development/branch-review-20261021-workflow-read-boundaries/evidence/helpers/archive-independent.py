"""Archive finished independent originals without changing their bytes."""
from pathlib import Path
import hashlib,json,subprocess
import yaml

repo=Path('/workspace/edhr-nexus-frontend')
batch=repo/'docs/development/branch-review-20261021-workflow-read-boundaries'
candidate='749c9f9b28d2525261976df070e56736323117be'
manifest_path=Path('/tmp/edhr-read-qa-manifest.json')
manifest=json.loads(manifest_path.read_text())
quality_path=Path('/tmp/edhr-read-qa-qualityResult.yaml')
quality=yaml.safe_load(quality_path.read_text())['qualityResult']
assert quality['result']=='passed' and quality['headCommit']==candidate
assert manifest['testedCommit']==candidate
assert quality['workingTreeState']['status']=='clean'
required=[check for check in quality['checks'] if check['required']]
assert required and all(check['outcome']=='passed' for check in required)
assert subprocess.check_output(['git','rev-parse','HEAD'],cwd=repo,text=True).strip()==candidate
status=subprocess.check_output(['git','status','--porcelain'],cwd=repo,text=True).splitlines()
assert all(line.startswith('?? docs/development/branch-review-20261021-workflow-read-boundaries/evidence/independent/') for line in status)
files=[]
for item in manifest['files']:
    path=Path(item['sourcePath']);raw=path.read_bytes()
    assert hashlib.sha256(raw).hexdigest()==item['sha256']
    assert path.suffix not in {'.log','.xml'} and '.private.' not in path.name
    if not path.is_relative_to('/tmp'):
        repo_relative=path.relative_to(repo)
        assert subprocess.check_output(['git','show',candidate+':'+str(repo_relative)],cwd=repo)==raw
    relative=Path(item['archiveRelativePath'])
    assert not relative.is_absolute() and '..' not in relative.parts
    destination=batch/'evidence/independent'/relative
    destination.parent.mkdir(parents=True,exist_ok=True)
    if destination.exists():assert destination.read_bytes()==raw
    else:destination.write_bytes(raw)
    files.append({'source':str(path),'archive':str(destination.relative_to(repo)),'sha256':item['sha256'],'bytes':len(raw)})
destination=batch/'evidence/independent'/manifest_path.name
destination.write_bytes(manifest_path.read_bytes())
files.append({'source':str(manifest_path),'archive':str(destination.relative_to(repo)),'sha256':hashlib.sha256(destination.read_bytes()).hexdigest(),'bytes':destination.stat().st_size})
receipt={'schema':'edhr-original-archive-receipts/v1','author':'/root L0 exact-byte archive only','testedCommit':candidate,'originalAuthor':'/root/workflow_read_independent','files':files,'originalBytesAndOriginalTmpReferencesPreserved':True,'rawLogsXmlTokensNotArchived':True,'newRuntimeOrSemanticAcceptanceByArchive':False}
(batch/'evidence/independent/archive-receipts.json').write_text(json.dumps(receipt,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'archivedOriginals':len(files),'requiredChecksPassed':len(required),'qualitySha256':hashlib.sha256(quality_path.read_bytes()).hexdigest(),'candidate':candidate}))
