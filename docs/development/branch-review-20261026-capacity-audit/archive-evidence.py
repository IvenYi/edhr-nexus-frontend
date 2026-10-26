import hashlib,json,subprocess
from pathlib import Path
repo=Path('/workspace/edhr-nexus-frontend');out=repo/'docs/development/branch-review-20261026-capacity-audit';receipts=[]
def sha(raw):return hashlib.sha256(raw).hexdigest()
def archive(path,group):
 path=Path(path);raw=path.read_bytes();dest=out/'evidence'/group/path.name
 assert '.private.' not in path.name and path.suffix not in {'.log','.xml'}
 dest.parent.mkdir(parents=True,exist_ok=True)
 if dest.exists():assert dest.read_bytes()==raw
 else:dest.write_bytes(raw)
 receipts.append({'source':str(path),'archive':str(dest.relative_to(repo)),'sha256':sha(raw),'bytes':len(raw)})
for group,prefix in [('workflow','edhr-capacity-workflow'),('dhr','edhr-capacity-dhr'),('ontology','edhr-capacity-ontology')]:
 manifest=Path('/tmp')/(prefix+'-manifest.json');d=json.loads(manifest.read_text());assert d.get('status','FINAL')=='FINAL'
 for item in d['files']:
  path=Path(item.get('path') or item.get('sourcePath'));assert sha(path.read_bytes())==item['sha256'];archive(path,group)
 archive(manifest,group)
for name in ['edhr-capacity-primary-source.py','edhr-capacity-primary-source-map.json','edhr-capacity-primary-review.md']:archive(Path('/tmp')/name,'primary')
scopes=[]
for path in (out/'evidence').glob('*/*source-map.json'):
 document=json.loads(path.read_text())
 for row in document['sourceScopes']:
  ref=row.get('sourceCommit') or document.get('fixedCommit');value=subprocess.check_output(['git','show',ref+':'+row['path']],cwd=repo)
  assert row['sha256']==sha(value)
  assert row['blob']==subprocess.check_output(['git','rev-parse',ref+':'+row['path']],cwd=repo,text=True).strip()
  a,b=row['range'];assert 1<=a<=b<=len(value.splitlines())
  assert row['wholeFileReviewComplete'] is False
  scopes.append(row['id'])
assert len(scopes)==len(set(scopes))
record={'author':'/root L0 exact-byte archive and range validation only','files':receipts,'originalsUnchanged':True,'runtimeExecutedByArchive':False,'rawLogsXmlTokensNotArchived':True,'finiteSourceScopes':len(scopes),'sourceScopeRecordsMayOverlap':True}
(out/'evidence/archive-receipts.json').write_text(json.dumps(record,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'originals':len(receipts),'finiteSourceScopes':len(scopes),'rawLogsArchived':False}))
