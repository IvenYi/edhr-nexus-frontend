from pathlib import Path
import subprocess,json,hashlib,yaml
root=Path('/workspace/edhr-nexus-frontend');batch=root/'docs/development/branch-review-20261031-upload-transactions';base='a98e60792554f7753d22406d02b274fd50ea2e6c';head='22a96503ce0eb7d40343453c28e3e6c174f5907b'
def sha(raw):return hashlib.sha256(raw).hexdigest()
assert subprocess.check_output(['git','rev-parse','HEAD'],cwd=root,text=True).strip()==head
assert subprocess.check_output(['git','rev-parse','origin/edhr-dev'],cwd=root,text=True).strip()==base
assert not subprocess.check_output(['git','status','--porcelain'],cwd=root,text=True).strip()
subprocess.run(['git','merge-base','--is-ancestor',base,head],cwd=root,check=True)
primary=json.loads((batch/'evidence/primary-verification.json').read_text())
for item in primary['files']+primary['sourceSnapshot']:
 raw=(root/item['path']).read_bytes();assert len(raw)==item['bytes'] and sha(raw)==item['sha256'],item['path']
ontology=json.loads((batch/'evidence/ontology-review.json').read_text())
for item in ontology['sourceSnapshot']+ontology['knowledgeFiles']:
 raw=(root/item['path']).read_bytes();assert len(raw)==item['bytes'] and sha(raw)==item['sha256'],item['path']
for item in ontology['knowledgeFiles']:
 raw=subprocess.check_output(['git','show',base+':'+item['path']],cwd=root);assert sha(raw)==item['sha256']
manifest=json.loads((batch/'evidence/ontology-manifest.json').read_text());assert manifest['roleState']=='FINAL' and manifest['ontologyResult']=='not-applicable'
for item in manifest['files']:
 raw=Path(item['path']).read_bytes();assert len(raw)==item['bytes'] and sha(raw)==item['sha256']
assert manifest['packageSha256']==sha((batch/'decision-package.yaml').read_bytes())
assert not subprocess.check_output(['git','diff','--name-only',base,head,'--','AGENTS.md','codeplzreadme.md','docs/agents','docs/knowledge','docs/architecture'],cwd=root,text=True).strip()
inventory_dir=Path('/tmp/edhr-upload-q1-inventory')
cmd=['python3','scripts/build-branch-review-inventory.py','--ref',base,'--out',str(inventory_dir)]
result=subprocess.run(cmd,cwd=root,text=True,capture_output=True);Path('/tmp/edhr-upload-q1-inventory-build.txt').write_text(result.stdout+result.stderr);assert result.returncode==0
for p in (batch/'inventory').iterdir():assert p.read_bytes()==(inventory_dir/p.name).read_bytes(),p.name
inv=json.loads((inventory_dir/'inventory-summary.json').read_text());assert inv['trackedPaths']==5927 and inv['migrationFiles']==134
review=json.loads((batch/'source-review.json').read_text());assert len(review['records'])==5 and review['wholeFileCompletion']==0 and review['historicalUniqueIncrement'] is None
a23=review['a23'];assert len(a23['records'])==5 and len(a23['currentChangedPending'])==6 and len(a23['currentAddedPending'])==4
assert a23['historicalLanguageQueue']==856 and a23['historicalSqlQueue']==130 and a23['newMigrationQueue']==4
paths=subprocess.check_output(['git','diff','--name-only',base,head],cwd=root,text=True).splitlines()
authored=[p for p in paths if '/evidence/' not in p and '/inventory/' not in p]
whitespace=subprocess.run(['git','diff','--check',base,head,'--',*authored],cwd=root,text=True,capture_output=True);Path('/tmp/edhr-upload-q1-whitespace.txt').write_text(whitespace.stdout+whitespace.stderr);assert whitespace.returncode==0
changed_product=[p for p in paths if '/src/main/' in p];assert changed_product==['gmp-platform/backend/src/main/java/com/zencas/edhr/compliance/controller/FileController.java']
out={'baseCommit':base,'headCommit':head,'contractReadCommit':head,'clean':True,'primaryOriginals':len(primary['files']),'sourceSnapshots':len(primary['sourceSnapshot']),'ontologySourceSnapshots':len(ontology['sourceSnapshot']),'ontologyOriginalsIncludingManifest':7,'knowledgeFiles':len(ontology['knowledgeFiles']),'knowledgeChangedFiles':0,'currentInventory':inv,'limitedSourceGroups':5,'limitedSemanticIds':8,'wholeFileCompletion':0,'newUniqueIncrement':None,'a23MethodRecords':5,'a23OldLanguage':856,'a23OldFeaturePending':1,'a23OldSql':130,'a23NewMigrationDelta':4,'currentChangedPending':6,'currentAddedPending':4,'productChangedPaths':changed_product,'authoredWhitespacePaths':len(authored),'authoredWhitespaceExit':whitespace.returncode,'primaryRunBoundary':'actual60 plus actual3 in two commands, not one63','invalidInitialFixtureArtifactsRetained':primary['fixtureFailureHistory'],'scope':'666 target path increment/44knowledge/183ID candidates remain pending from previous integration, not source review completion.'}
Path('/tmp/edhr-upload-q1-inspection.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n');print(json.dumps(out,ensure_ascii=False))
