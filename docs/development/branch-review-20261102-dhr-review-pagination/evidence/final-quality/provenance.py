from pathlib import Path
import subprocess,json,hashlib,gzip,yaml,collections,datetime

root=Path('/workspace/edhr-nexus-frontend');batch=root/'docs/development/branch-review-20261102-dhr-review-pagination'
base='1ad6300918bd0059049eab3c415ca31162dd5115';head='b07fc1ca5dd7e4a37b2584c19377495b86b5536a'
def cmd(*args):return subprocess.check_output(args,cwd=root,text=True).strip()
def sha(raw):return hashlib.sha256(raw).hexdigest()
assert cmd('git','rev-parse','HEAD')==head
assert cmd('git','rev-parse','origin/edhr-dev')==base
assert not cmd('git','status','--porcelain')
subprocess.run(['git','merge-base','--is-ancestor',base,head],cwd=root,check=True)
pv=json.loads((batch/'evidence/primary-verification.json').read_text())
assert len(pv['files'])==108 and len(pv['ontologyOriginals'])==17 and len(pv['sourceSnapshot'])==9
originals=[]
for item in pv['files']+pv['ontologyOriginals']:
    dest=root/item['path'];stored=dest.read_bytes()
    assert len(stored)==item['storedBytes'] and sha(stored)==item['storedSha256'],item['path']
    raw=gzip.decompress(stored) if item['encoding']=='gzip' else stored
    assert len(raw)==item['bytes'] and sha(raw)==item['sha256'],item['path']
    src=Path(item['source']);assert src.read_bytes()==raw,str(src)
    originals.append({'path':item['path'],'source':item['source'],'encoding':item['encoding'],'bytes':len(raw),'sha256':sha(raw),'matched':True})
for item in pv['sourceSnapshot']:
    raw=(root/item['path']).read_bytes();assert len(raw)==item['bytes'] and sha(raw)==item['sha256'],item['path']
onto=batch/'evidence/ontology'
r1=json.loads((onto/'edhr-page-ontology/manifest.json').read_text())
r2=json.loads((onto/'edhr-page-ontology-r2/manifest.json').read_text())
assert r1['roleState']=='FINAL' and r2['roleState']=='FINAL' and r2['ontologyResult']=='not-applicable'
package_sha=sha((batch/'decision-package.yaml').read_bytes())
assert r2['packageSha256']==package_sha and r1['packageSha256']!=package_sha
fp=json.loads((onto/'edhr-page-ontology-r2/source-fingerprints.json').read_text())
assert len(fp['files'])==25 and fp['packageSha256']==package_sha
for item in fp['files']:
    raw=(root/item['path']).read_bytes();assert len(raw)==item['bytes'] and sha(raw)==item['sha256'],item['path']
assert sha((onto/'edhr-page-ontology/manifest.json').read_bytes())==fp['originalManifestSha256']
knowledge=json.loads((onto/'edhr-page-ontology/knowledge-inventory.json').read_text())['files']
assert len(knowledge)==330
for item in knowledge:
    raw=(root/item['path']).read_bytes();assert len(raw)==item['bytes'] and sha(raw)==item['sha256'],item['path']
    old=subprocess.check_output(['git','show',base+':'+item['path']],cwd=root);assert raw==old,item['path']
assert not cmd('git','diff','--name-only',base,head,'--','docs/knowledge','docs/architecture/business-knowledge-model.md','AGENTS.md','codeplzreadme.md','docs/agents')
semantic=json.loads((onto/'edhr-page-ontology/semantic-review.json').read_text())
assert len(semantic['records'])==14 and semantic['wholeFileCompletion']==0 and semantic['uniqueSemanticIncrement'] is None
review=json.loads((batch/'source-review.json').read_text());a23=review['a23']
assert review['wholeFileCompletion']==0 and review['historicalUniqueIncrement'] is None and len(review['records'])==4
assert len(a23['records'])==6 and a23['historicalLanguageQueue']==856 and a23['previousFeatureAddedPending']==1
assert a23['historicalSqlQueue']==130 and a23['newMigrationQueuePrevious']==4 and a23['currentAddedMigrationCount']==1
changed=cmd('git','diff','--name-status',base,head).splitlines()
source=[line.split('\t') for line in changed if '\tgmp-platform/backend/src/' in line]
actual_paths={cols[-1] for cols in source}
pkg=yaml.safe_load((batch/'decision-package.yaml').read_text())['decisionPackage']
assert {p['path'] for p in pkg['affectedFiles']}==actual_paths and len(actual_paths)==8
assert {cols[-1] for cols in source if cols[0]=='M'}==set(a23['currentChangedPending']) and len(a23['currentChangedPending'])==6
assert {cols[-1] for cols in source if cols[0]=='A'}==set(a23['currentAddedPending']) and len(a23['currentAddedPending'])==2
authors=[cols[-1] for line in changed if (cols:=line.split('\t')) and '/evidence/' not in cols[-1] and '/inventory/' not in cols[-1]]
white=subprocess.run(['git','diff','--check',base,head,'--',*authors],cwd=root,capture_output=True,text=True)
Path('/tmp/edhr-page-q1-provenance-whitespace.txt').write_text(white.stdout+white.stderr);assert white.returncode==0
out=Path('/tmp/edhr-page-q1-inventory')
build=subprocess.run(['python3','scripts/build-branch-review-inventory.py','--ref',base,'--out',str(out)],cwd=root,capture_output=True,text=True)
Path('/tmp/edhr-page-q1-provenance-inventory-build.txt').write_text(build.stdout+build.stderr);assert build.returncode==0
inv_files=[]
for p in sorted((batch/'inventory').iterdir()):
    raw=p.read_bytes();assert raw==(out/p.name).read_bytes(),p.name
    inv_files.append({'name':p.name,'bytes':len(raw),'sha256':sha(raw)})
inv=json.loads((out/'inventory-summary.json').read_text());assert inv['trackedPaths']==6017 and inv['migrationFiles']==134
assert inv['entrypointCandidates']['http-annotation']==464 and inv['entrypointCandidates']['frontend-route-candidate']==216
assert not inv['semanticReviewComplete']
for p in [batch/'README.md',root/'docs/development/branch-review-20261015/NEXT.md']:
    txt=p.read_text();assert 'W6' in txt and 'W7' in txt and '666/44/183' in txt and 'high' in txt
assert cmd('git','rev-parse','HEAD')==head and not cmd('git','status','--porcelain')
result={'roleState':'FINAL','result':'passed','scope':'auxiliary read-only provenance/inventory check; not runtime or whole-audit certification',
 'baseCommit':base,'headCommit':head,'contractReadCommit':head,'workingTreeClean':True,
 'primaryOriginals':108,'ontologyOriginals':17,'gzipOriginals':sum(r['encoding']=='gzip' for r in originals),'originalRecords':originals,
 'sourceSnapshotsMatched':9,'r2SourceFingerprintsMatched':25,'knowledgeFilesUnchanged':330,
 'currentPackageSha256':package_sha,'r1PackageShaHistorical':r1['packageSha256'],'r1ManifestPreserved':fp['originalManifestSha256'],
 'affectedSourcePaths':sorted(actual_paths),'sourceChanges':source,'authoredWhitespacePaths':authors,'authoredWhitespaceExit':white.returncode,
 'inventory':inv,'inventoryFiles':inv_files,'limitedSourceGroups':4,'limitedA23Judgments':6,'oldLanguageQueue':856,'oldFeatureQueue':1,'oldSqlQueue':130,'previousAddedMigrationQueue':4,'currentAddedMigrationQueue':1,'currentChangedPending':6,'currentAddedPending':2,
 'wholeFileCompletion':0,'uniqueSemanticIncrement':None,'semanticRecords':14,'findings':[],
 'limits':['Only byte/hash/provenance and fixed inventory; primary execution logs are not independent runtime pass','No Maven/browser/DB/CI/merge/deploy run; no repository edits','r1 package hash is historical; r2 used for current package','Known previous high and all old audit overlays remain open/pending']}
Path('/tmp/edhr-page-q1-provenance.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
Path('/tmp/edhr-page-q1-provenance-diff.json').write_text(json.dumps({'base':base,'head':head,'changed':changed,'authors':authors},ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'result':'passed','originals':len(originals),'sourceSnapshots':9,'r2Fingerprints':25,'knowledge':330,'inventoryFiles':len(inv_files),'authoredWhitespacePaths':len(authors)}))
