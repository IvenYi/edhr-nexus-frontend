from pathlib import Path
import csv,hashlib,json,re,subprocess
ROOT=Path('/workspace/edhr-nexus-frontend')
B=ROOT/'docs/development/branch-review-20261030-document-write'
BASE='2e24711aad1124bb28674161ef8f3dbaf00b569a'
HEAD='fd1e80d9abb01e75b60d8d40e9f2c39587c420a1'
def git(*args): return subprocess.check_output(['git',*args],cwd=ROOT,text=True).strip()
def raw_git(revision,path): return subprocess.check_output(['git','show',revision+':'+path],cwd=ROOT)
def sha(data): return hashlib.sha256(data).hexdigest()
assert git('rev-parse','HEAD')==HEAD and git('rev-parse','origin/edhr-dev')==BASE
assert git('status','--short')==''
subprocess.run(['git','merge-base','--is-ancestor',BASE,HEAD],cwd=ROOT,check=True)
primary=json.loads((B/'evidence/primary-verification.json').read_text())
checks=[]
for item in primary['files']:
 p=ROOT/item['path']; d=p.read_bytes()
 assert sha(d)==item['sha256'] and len(d)==item['bytes'],p
 checks.append({'kind':'primary-original','path':item['path'],'sha256':sha(d),'bytes':len(d)})
assert len(checks)==37
for item in primary['sourceSnapshot']:
 d=(ROOT/item['path']).read_bytes()
 assert sha(d)==item['sha256'] and len(d)==item['bytes']
 checks.append({'kind':'primary-source-snapshot','path':item['path'],'sha256':sha(d),'bytes':len(d)})
assert len(primary['sourceSnapshot'])==6
ontology=json.loads((B/'evidence/ontology-manifest.json').read_text())
assert ontology['roleState']=='FINAL' and ontology['ontologyResult']=='not-applicable'
assert sha((B/'decision-package.yaml').read_bytes())==ontology['decisionPackageSha256']
for item in ontology['sourceSnapshot']:
 d=(ROOT/item['path']).read_bytes()
 assert sha(d)==item['actualSha256'] and len(d)==item['bytes'],item['path']
for item in ontology['knowledgeSnapshotFiles']:
 d=(ROOT/item['path']).read_bytes()
 assert sha(d)==item['sha256'] and len(d)==item['bytes'],item['path']
assert len(ontology['knowledgeSnapshotFiles'])==303
for item in ontology['historyOriginals']:
 d=raw_git(item['revision'],item['sourcePath'])
 assert sha(d)==item['sha256'] and len(d)==item['bytes']
 archive=B/'evidence'/Path(item['raw']).name.removeprefix('edhr-document-write-')
 assert archive.read_bytes()==d
checks.append({'kind':'ontology-history-and-snapshot','knowledge':303,'history':2,'sourceSnapshot':len(ontology['sourceSnapshot'])})
assert git('diff','--name-only',BASE,HEAD,'--','docs/knowledge','docs/architecture','docs/agents','AGENTS.md','codeplzreadme.md','tools/knowledge-model')==''
for f in ['DocumentManagementController.java','SopDocument.java']:
 path='gmp-platform/backend/src/main/java/com/zencas/edhr/masterdata/'+('controller/' if f.startswith('DocumentManagement') else 'entity/')+f
 assert raw_git(BASE,path)!=raw_git(HEAD,path)
product_diff=subprocess.check_output(['git','diff',BASE,HEAD,'--','gmp-platform/backend/src/main'],cwd=ROOT)
Path('/tmp/edhr-document-write-q1-product-diff.txt').write_bytes(product_diff)
controller=(ROOT/'gmp-platform/backend/src/main/java/com/zencas/edhr/masterdata/controller/DocumentManagementController.java').read_text()
assert len(re.findall(r'^\s*@(Get|Post|Put|Delete)Mapping',controller,re.M))==13
assert '@PreAuthorize("hasAuthority(\'master-data.documents\')")' in controller
assert '@Order(1000)' in (ROOT/'gmp-platform/backend/src/main/java/com/zencas/edhr/masterdata/deletion/DeletionProtectionAspect.java').read_text()
config=(ROOT/'gmp-platform/backend/src/main/java/com/zencas/edhr/common/config/SecurityConfig.java').read_text()
assert '@EnableMethodSecurity' in config
assert 'ddl-auto: none' in (ROOT/'gmp-platform/backend/src/main/resources/application.yml').read_text()
assert 'ALTER TABLE sop_document ALTER COLUMN code DROP NOT NULL' not in (ROOT/'gmp-platform/backend/src/test/java/com/zencas/edhr/masterdata/controller/DocumentReadBoundaryIntegrationTest.java').read_text()
inventory=json.loads((B/'inventory/inventory-summary.json').read_text())
assert inventory['sourceCommit']==BASE and inventory['trackedPaths']==4650 and inventory['migrationFiles']==130 and not inventory['semanticReviewComplete']
assert len(git('ls-tree','-r','--name-only',BASE).splitlines())==4650
csv_counts={}
for file in (B/'inventory').glob('*.csv'):
 with file.open(newline='') as fh: rows=list(csv.DictReader(fh))
 csv_counts[file.name]=len(rows)
assert csv_counts=={'coverage.csv':4650,'entrypoints.csv':649,'migrations.csv':130},csv_counts
recheck=ROOT/'docs/development/branch-review-20261030-document-read'
a23=[]
for name in ['a23-recheck.csv','a23-sql-recheck.csv']:
 with (recheck/name).open(newline='') as fh: rows=list(csv.DictReader(fh))
 a23.append({'path':str((recheck/name).relative_to(ROOT)),'rows':len(rows),'sha256':sha((recheck/name).read_bytes())})
assert [item['rows'] for item in a23]==[856,130]
summary={'actualBaseCommit':BASE,'actualHeadCommit':HEAD,'actualTestedCommit':HEAD,'workingTreeState':'clean','contractReadCommit':HEAD,'knowledgeVersion':'0.3.25','unchangedKnowledgeFiles':303,'primaryManifestRecords':37,'primarySourceSnapshotPaths':6,'ontologyOriginals':8,'ontologyHistoryOriginals':2,'limitedKnowledgeIds':8,'limitedSourceGroups':8,'httpMappings':13,'inventoryCounts':csv_counts,'fixedInventoryOnly':True,'a23HistoricalPendingQueues':a23,'a23DeltaChanged':3,'a23DeltaAdded':3,'wholeFileCompletion':0,'newHistoricalUniqueIncrement':None,'preservedNotRun':['browser/visual','complete frontend build/strict/lint','production migrations/full deletion graph/multi-tenant/file bytes','new performance optimization or capacity SLA'],'checks':checks}
Path('/tmp/edhr-document-write-q1-inspection.json').write_text(json.dumps(summary,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({k:summary[k] for k in ['primaryManifestRecords','primarySourceSnapshotPaths','unchangedKnowledgeFiles','httpMappings','inventoryCounts']}))
