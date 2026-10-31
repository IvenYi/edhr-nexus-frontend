from pathlib import Path
import hashlib,json,subprocess,tarfile,io
R=Path('/workspace/edhr-nexus-frontend');B=R/'docs/development/branch-review-20261030-document-category';P='/tmp/edhr-document-category-q2-';BASE='d10590bd3fe8f3da4e68bcc087b2102d2c211934';HEAD='5d1487b195cec7e994285fc623c55097bde09bf2';FIRST='ac3a421e42529bdb304e2c72145ceb580ec70618'
def git(*args):return subprocess.check_output(['git',*args],cwd=R)
def sha(d):return hashlib.sha256(d).hexdigest()
def verify(f,key='path'):
 d=(R/f[key]).read_bytes();assert sha(d)==f['sha256'] and len(d)==f['bytes'],f[key]
primary=json.loads((B/'evidence/primary-verification.json').read_text())
for f in primary['files']:verify(f)
for f in primary['sourceSnapshot']:
 d=git('show',FIRST+':'+f['path']);assert sha(d)==f['sha256'] and len(d)==f['bytes']
failed=json.loads((B/'evidence/first-quality/archive-map.json').read_text())
for f in failed['files']:verify(f,'archive')
concurrency=json.loads((B/'evidence/concurrency-verification.json').read_text())
for f in concurrency['files']:verify(f)
for f in concurrency['sourceSnapshot']:verify(f);assert (R/f['path']).read_bytes()==git('show',HEAD+':'+f['path'])
o=json.loads((B/'evidence/ontology-manifest.json').read_text());mapping={x.get('origin'):x['path'] for x in primary['files'] if x.get('origin')}
history=[]
for f in o['files']:
 d=(R/mapping[f['path']]).read_bytes();assert sha(d)==f['sha256'] and len(d)==f['bytes']
for f in o['historyOriginals']:
 d=git('show',f['revision']+':'+f['sourcePath']);assert sha(d)==f['sha256'] and d==(R/mapping[f['raw']]).read_bytes();history.append(f['sourcePath'])
for f in o['knowledgeSnapshotFiles']:
 verify(f);assert git('show',BASE+':'+f['path'])==(R/f['path']).read_bytes()
protected=['AGENTS.md','codeplzreadme.md','docs/agents','docs/knowledge','docs/architecture','tools/knowledge-model']
assert not git('diff','--name-only',BASE,HEAD,'--',*protected).strip()
assert (B/'evidence/original-decision-package.yaml').read_bytes()==git('show',FIRST+':docs/development/branch-review-20261030-document-category/decision-package.yaml')
manual=[x for x in git('diff','--name-only',BASE,HEAD).decode().splitlines() if '/evidence/' not in x and not x.endswith('.csv')]
c=subprocess.run(['git','diff','--check',BASE,HEAD,'--',*manual],cwd=R,capture_output=True,text=True);Path(P+'whitespace-handwritten.txt').write_text(c.stdout+c.stderr);assert c.returncode==0
c2=subprocess.run(['git','diff','--check',BASE,HEAD],cwd=R,capture_output=True,text=True);Path(P+'whitespace-all.txt').write_text(c2.stdout+c2.stderr)
subprocess.run(['git','merge-base','--is-ancestor',BASE,HEAD],cwd=R,check=True)
z={'baseCommit':BASE,'headCommit':HEAD,'sourceStatus':git('status','--porcelain=v1').decode(),'primaryOriginals':len(primary['files']),'oldSourceSnapshotsVerifiedAt':FIRST,'oldSourceSnapshotCount':len(primary['sourceSnapshot']),'failedQualityOriginals':len(failed['files']),'concurrencyOriginals':len(concurrency['files']),'currentSourceSnapshots':len(concurrency['sourceSnapshot']),'knowledgeFilesUnchanged':len(o['knowledgeSnapshotFiles']),'historyOriginals':history,'manualWhitespace':{'paths':manual,'exit':c.returncode},'fullRawWhitespaceExit':c2.returncode,'productNumstat':git('diff','--numstat',BASE,HEAD,'--','gmp-platform/backend/src/main','gmp-platform/frontend/src').decode(),'protectedDelta':[]}
Path(P+'inspection.json').write_text(json.dumps(z,ensure_ascii=False,indent=2)+'\n');print(z)
script=B/'evidence/official-premium-audit-project.py';assert sha(script.read_bytes())=='67fd35597c85a2f37dd3c566f0bd79768cbe059114edcf28074fc5afa3e0ce68'
old=Path(P+'premium-old-tree');old.mkdir(exist_ok=False)
with tarfile.open(fileobj=io.BytesIO(git('archive',BASE,'gmp-platform/frontend/src'))) as t:t.extractall(old,filter='data')
codes={}
for label,root in [('current',R/'gmp-platform/frontend/src'),('baseline',old/'gmp-platform/frontend/src')]:
 cmd=['python3',str(script),str(root),'--mode','strict','--output',P+'premium-app-'+label+'.json']
 with Path(P+'premium-app-'+label+'.txt').open('w') as f:codes[label]=subprocess.run(cmd,stdout=f,stderr=subprocess.STDOUT).returncode
current=json.loads(Path(P+'premium-app-current.json').read_text());baseline=json.loads(Path(P+'premium-app-baseline.json').read_text())
assert current['findings']==baseline['findings'];assert len(current['findings'])==19
Path(P+'premium-comparison.json').write_text(json.dumps({'scriptSha256':sha(script.read_bytes()),'exits':codes,'identicalFindings':True,'current':len(current['findings']),'baseline':len(baseline['findings']),'scope':'application src only; full repository85 is separate, not85confirmedbugs'},indent=2)+'\n')
