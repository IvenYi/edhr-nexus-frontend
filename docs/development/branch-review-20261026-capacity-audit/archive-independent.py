"""L0 exact-byte archive after formal independent FINAL; no new runtime acceptance."""
import hashlib,json,subprocess
from pathlib import Path
import yaml
repo=Path('/workspace/edhr-nexus-frontend');b=repo/'docs/development/branch-review-20261026-capacity-audit';candidate='1081c4d8b15eb9e3ac7e64b04397bd10c0abffda'
manifest=Path('/tmp/edhr-capacity-qa-manifest.json');m=json.loads(manifest.read_text());qpath=Path('/tmp/edhr-capacity-qa-qualityResult.yaml');q=yaml.safe_load(qpath.read_text())['qualityResult']
assert q['result']=='passed' and q['headCommit']==candidate and q['workingTreeState']['status']=='clean'
required=[c for c in q['checks'] if c['required']];assert required and all(c['outcome']=='passed' for c in required)
assert subprocess.check_output(['git','rev-parse','HEAD'],cwd=repo,text=True).strip()==candidate
files=[]
def archive(path,relative,expected=None):
 path=Path(path);raw=path.read_bytes();digest=hashlib.sha256(raw).hexdigest()
 assert path.is_relative_to('/tmp') or path.is_relative_to(repo)
 assert '.private.' not in path.name and path.suffix not in {'.xml','.log'}
 if expected:assert digest==expected
 relative=Path(relative);assert not relative.is_absolute() and '..' not in relative.parts
 dest=b/'evidence/independent'/relative;dest.parent.mkdir(parents=True,exist_ok=True)
 if dest.exists():assert dest.read_bytes()==raw
 else:dest.write_bytes(raw)
 files.append({'source':str(path),'archive':str(dest.relative_to(repo)),'sha256':digest,'bytes':len(raw)})
for f in m['files']:
 path=Path(f.get('sourcePath') or f['path']);archive(path,f.get('archiveRelativePath') or path.name,f['sha256'])
archive(manifest,manifest.name)
(b/'evidence/independent/archive-receipts.json').write_text(json.dumps({'author':'/root L0 archive only','testedCommit':candidate,'files':files,'originalsUnchanged':True,'rawLogsXmlTokensNotArchived':True},ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'archivedOriginals':len(files),'qualitySha256':hashlib.sha256(qpath.read_bytes()).hexdigest(),'requiredPassed':len(required),'candidate':candidate}))
