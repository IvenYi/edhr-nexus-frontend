from pathlib import Path
import json,subprocess,hashlib,yaml
root=Path('/workspace/edhr-nexus-frontend');batch=root/'docs/development/branch-review-20261031-file-boundaries'
base='ccedd56453c02c5d3acd60aa4351809a3928e83e';head='17f1fad49c863761269c1937b7d5059a5ecfe9e6'
def git(*args):return subprocess.check_output(['git',*args],cwd=root)
def sha(raw):return hashlib.sha256(raw).hexdigest()
assert git('rev-parse','HEAD').decode().strip()==head
assert git('rev-parse','origin/edhr-dev').decode().strip()==base
assert not git('status','--porcelain').strip()
primary=json.loads((batch/'evidence/primary-verification.json').read_text())
for group in ['files','sourceSnapshot']:
 for item in primary[group]:
  raw=(root/item['path']).read_bytes();assert len(raw)==item['bytes'] and sha(raw)==item['sha256'],item['path']
ontology=json.loads((batch/'evidence/ontology-manifest.json').read_text())
assert ontology['roleState']=='FINAL' and ontology['ontologyResult']=='not-applicable'
assert ontology['packageSha256']==sha((batch/'decision-package.yaml').read_bytes())
for item in ontology['files']:
 p=batch/'evidence'/Path(item['path']).name.removeprefix('edhr-file-');raw=p.read_bytes();assert sha(raw)==item['sha256'] and len(raw)==item['bytes']
knowledge=git('ls-files','docs/knowledge').decode().splitlines()
for name in knowledge:assert (root/name).read_bytes()==git('show',base+':'+name),name
protected=git('diff','--name-only',base,head,'--','AGENTS.md','codeplzreadme.md','docs/agents','docs/knowledge','docs/architecture','tools','scripts').decode().splitlines();assert not protected
inventory=Path('/tmp/edhr-file-q1-inventory')
with open('/tmp/edhr-file-q1-inventory-build.txt','w') as log:
 subprocess.run(['python3','scripts/build-branch-review-inventory.py','--ref',base,'--out',str(inventory)],cwd=root,stdout=log,stderr=subprocess.STDOUT,check=True)
inventory_results=[]
for p in sorted((batch/'inventory').iterdir()):
 other=inventory/p.name;assert p.read_bytes()==other.read_bytes(),p.name
 inventory_results.append({'name':p.name,'sha256':sha(p.read_bytes()),'bytes':p.stat().st_size})
source=json.loads((batch/'source-review.json').read_text());assert len(source['records'])==6 and source['wholeFileCompletion']==0 and source['historicalUniqueIncrement'] is None
assert len(source['a23']['records'])==5 and source['a23']['historicalLanguageQueue']==856 and source['a23']['separateSqlQueue']==130 and source['a23']['sqlChecked']==0
product=git('diff',base,head,'--','gmp-platform/backend/src/main').decode();Path('/tmp/edhr-file-q1-product-diff.txt').write_text(product)
manual=[p for p in git('diff','--name-only',base,head).decode().splitlines() if '/evidence/' not in p and '/inventory/' not in p]
check=subprocess.run(['git','diff','--check',base,head,'--',*manual],cwd=root,stdout=subprocess.PIPE,stderr=subprocess.STDOUT,text=True)
Path('/tmp/edhr-file-q1-whitespace.txt').write_text(check.stdout);assert check.returncode==0
out={'baseCommit':base,'headCommit':head,'contractReadCommit':head,'workingTree':'clean','targetAncestor':True,'contractKnowledgeToolDelta':protected,'primaryOriginalsVerified':len(primary['files']),'sourceSnapshotsVerified':len(primary['sourceSnapshot']),'ontologyRawFilesVerified':len(ontology['files']),'ontologyManifestVerifiedByPrimary':True,'knowledgeFilesUnchanged':len(knowledge),'inventoryFiles':inventory_results,'inventorySummary':json.loads((inventory/'inventory-summary.json').read_text()),'limitedSourceGroups':6,'limitedExistingKnowledgeIds':6,'wholeFileCompletion':0,'historicalUniqueIncrement':None,'a23MethodRecords':5,'a23ChangedPending':1,'a23AddedPending':2,'authScope':'Real JWT/filter/MVC login and public-reference guard; controlled repositories, no object ACL or database validation','whitespaceAuthoredPaths':len(manual),'whitespaceExit':check.returncode,'reviewedSource':['FileController upload/computeMd5/canPublicPreview and response Resource ownership','SecurityConfig permitAll/authenticated and real JWT path','FileObject optional target and persisted MD5 shape','DhrFormFiles validate/resolve digest and file-size checks','DEC0063-10/11 separate controlled attachment and frozen original rules'],'scopeLimits':['No browser or frontend build/static rerun: no UI source delta','No SQL/native DB/production migration/heapGC/load validation','Cross-storage cleanup/object ACL/uploader placeholder/related AuthController upload streams remain candidates','No algorithm-provider failure injection: Java required MD5 assumption, branch static reviewed']}
Path('/tmp/edhr-file-q1-inspection.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'originals':out['primaryOriginalsVerified'],'sources':3,'knowledge':len(knowledge),'inventoryFiles':len(inventory_results),'whitespace':check.returncode}))
