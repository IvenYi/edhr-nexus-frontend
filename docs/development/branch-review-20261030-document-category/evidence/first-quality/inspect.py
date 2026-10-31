from pathlib import Path
import hashlib,json,subprocess,csv

r=Path('/workspace/edhr-nexus-frontend');b=r/'docs/development/branch-review-20261030-document-category';base='d10590bd3fe8f3da4e68bcc087b2102d2c211934';head='ac3a421e42529bdb304e2c72145ceb580ec70618'
def git(*args):return subprocess.check_output(['git',*args],cwd=r)
def sha(d):return hashlib.sha256(d).hexdigest()
p=json.loads((b/'evidence/primary-verification.json').read_text())
checked=[]
for f in p['files']:
 d=(r/f['path']).read_bytes();assert sha(d)==f['sha256'] and len(d)==f['bytes'],f['path'];checked.append(f['path'])
sources=[]
for f in p['sourceSnapshot']:
 d=(r/f['path']).read_bytes();assert sha(d)==f['sha256'] and len(d)==f['bytes'],f['path'];assert git('show',head+':'+f['path'])==d;sources.append(f['path'])
o=json.loads((b/'evidence/ontology-manifest.json').read_text());mapping={x.get('origin'):x['path'] for x in p['files'] if x.get('origin')}
for f in o['files']:
 d=(r/mapping[f['path']]).read_bytes();assert sha(d)==f['sha256'] and len(d)==f['bytes']
history=[]
for f in o['historyOriginals']:
 d=git('show',f['revision']+':'+f['sourcePath']);assert sha(d)==f['sha256'] and d==(r/mapping[f['raw']]).read_bytes();history.append(f['sourcePath'])
for f in o['knowledgeSnapshotFiles']:
 d=(r/f['path']).read_bytes();assert sha(d)==f['sha256'] and len(d)==f['bytes'];assert git('show',base+':'+f['path'])==d
protected=['AGENTS.md','codeplzreadme.md','docs/agents','docs/knowledge','docs/architecture','tools/knowledge-model']
assert not git('diff','--name-only',base,head,'--',*protected).strip()
manual=[x for x in git('diff','--name-only',base,head).decode().splitlines() if '/evidence/' not in x and not x.endswith('.csv')]
check=subprocess.run(['git','diff','--check',base,head,'--',*manual],cwd=r,capture_output=True,text=True)
Path('/tmp/edhr-document-category-q1-whitespace-handwritten.txt').write_text(check.stdout+check.stderr);assert check.returncode==0
allcheck=subprocess.run(['git','diff','--check',base,head],cwd=r,capture_output=True,text=True)
Path('/tmp/edhr-document-category-q1-whitespace-all.txt').write_text(allcheck.stdout+allcheck.stderr)
result={'baseCommit':base,'headCommit':head,'workingTree':git('status','--short').decode(),'primaryFileRecords':len(checked),'sourceSnapshotFiles':len(sources),'ontologyFiles':len(o['files']),'ontologyManifestVerifiedInPrimary':str(b/'evidence/ontology-manifest.json') in [str(r/x) for x in checked],'historyOriginalsMatched':history,'knowledgeFilesUnchanged':len(o['knowledgeSnapshotFiles']),'contractKnowledgeDelta':[],'productNumstat':git('diff','--numstat',base,head,'--','gmp-platform/backend/src/main','gmp-platform/frontend/src').decode(),'manualWhitespace':{'paths':manual,'exit':check.returncode},'allRawWhitespaceExit':allcheck.returncode,'sourceSnapshots':sources}
Path('/tmp/edhr-document-category-q1-inspection.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n');print({k:result[k] for k in ['primaryFileRecords','sourceSnapshotFiles','ontologyFiles','knowledgeFilesUnchanged','productNumstat','allRawWhitespaceExit']})
