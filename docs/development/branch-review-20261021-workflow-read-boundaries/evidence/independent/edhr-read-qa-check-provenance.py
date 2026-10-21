from pathlib import Path
import subprocess,json,hashlib,re,yaml,zipfile
r=Path('/workspace/edhr-nexus-frontend'); batch=r/'docs/development/branch-review-20261021-workflow-read-boundaries'; base='d405a9afb4327b859545fa5a12c7eebe1350f418'; head='749c9f9b28d2525261976df070e56736323117be';core='725127d46ca1ae758f7fddeeaf94af1079afe432'
def git(*args):return subprocess.check_output(['git',*args],cwd=r)
def sha(b):return hashlib.sha256(b).hexdigest()
assert git('rev-parse','HEAD').decode().strip()==head and not git('status','--porcelain=v1')
old=json.loads(git('show',base+':docs/development/branch-review-20261021-task-pagination/source-catalog.json'));new=json.loads((batch/'source-catalog.json').read_text());assert len(old['methods'])==545 and len(new['methods'])==574
assert old['semanticSources']==new['semanticSources'];assert len(new['semanticSources'])==6
assert all(x in new['methods'] for x in old['methods'])
bf={x['id']:x for x in old['findings']};nf={x['id']:x for x in new['findings']};changed=[k for k in bf if bf[k]!=nf.get(k)];assert changed==['W3D-TASK-PAGINATION-001'];assert len(nf)==52 and len(bf)==49
assert nf['W3D-TASK-PAGINATION-001']['priorCatalogDisposition']['originalRecord']==bf['W3D-TASK-PAGINATION-001'];assert 'w3d-signature-source:028' not in [x['id'] for x in new['methods']]
accept=yaml.safe_load(git('show',base+':docs/development/branch-review-20261021-task-pagination/evidence/independent/edhr-page-qa-qualityResult.yaml'))['qualityResult'];assert accept['result']=='passed'
delivery=json.loads(git('show',base+':docs/development/branch-review-20261021-task-pagination/delivery.json'))
assert git('rev-parse','720ddd03^{tree}')==git('rev-parse','9db27dd5^{tree}')
source=json.loads((batch/'evidence/primary/source-map.json').read_text());sources=[]
for s in source['sourceScopes']:
 raw=git('show',s['sourceCommit']+':'+s['path']);assert sha(raw)==s['sha256'];assert git('rev-parse',s['sourceCommit']+':'+s['path']).decode().strip()==s['blob'];assert 1<=s['range'][0]<=s['range'][1]<=len(raw.splitlines());assert s['wholeFileReviewComplete'] is False
 sources.append({'id':s['id'],'path':s['path'],'sourceCommit':s['sourceCommit'],'blob':s['blob'],'sha256':s['sha256'],'finiteRange':s['range']})
assert len(sources)==29
archive=json.loads((batch/'evidence/archive-receipts.json').read_text());archiveRows=[]
for s in archive['files']:
 p=r/s['archive'];assert p.is_file() and sha(p.read_bytes())==s['sha256'] and p.stat().st_size==s['bytes']
 original=Path(s['source']);matches=not original.exists() or sha(original.read_bytes())==s['sha256'];assert matches
 archiveRows.append({'path':s['archive'],'sha256':s['sha256'],'bytes':s['bytes'],'sourceStillExists':original.exists(),'sourceMatchesWhenPresent':matches})
for p in batch.rglob('*'):
 if p.is_file() and p.suffix in ['.json','.yaml','.py','.md','.jsonl']:
  assert not re.search(rb'eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+',p.read_bytes()),'JWT-like material in '+str(p)
assert not list(batch.rglob('*.xml')) and not list(batch.rglob('*.log'))
changedPaths=git('diff','--name-only',base,head).decode().splitlines();prod=[x for x in changedPaths if x.startswith('gmp-platform/') and '/src/main/' in x or x.startswith('gmp-platform/frontend/src/')]
assert len(prod)==5
noChanges=['AGENTS.md','codeplzreadme.md','docs/agents/agent-handoff-contract.md','docs/agents/quality-verifier.md','docs/knowledge','DESIGN.md','docs/frontend','gmp-platform/backend/src/main/resources','gmp-platform/backend/src/main/java/com/zencas/edhr/workflow/engine','gmp-platform/frontend/src/App.tsx','gmp-platform/frontend/src/api/client.ts','gmp-platform/frontend/src/router','gmp-platform/frontend/src/index.css']
for path in noChanges:assert not git('diff',base,head,'--',path),path
for path in [x for x in changedPaths if x.startswith('gmp-platform/')]:assert git('rev-parse',core+':'+path)==git('rev-parse',head+':'+path)
summary=json.loads((batch/'ledger/summary.json').read_text());assert summary['overallAuditComplete'] is False and summary['overallPercent'] is None;assert summary['knowledgeReview']['newSemanticReviews']==0 and summary['knowledgeReview']['historicalScopedReviews']==108;assert summary['sourceReview']['wholeFilesCompleted']==0
out={'targetCommit':base,'headCommit':head,'workingTreeClean':True,'coreCommit':core,'allCoreProductAndTestBytesUnchanged':True,'productionChangedPaths':prod,'frozenInventoryBaseline':new['baselineCommit'],'oldScopeRecords':545,'newScopeRecords':574,'appendedFiniteScopes':sources,'semanticSourcesUnchanged':True,'historicalSemanticRows':108,'onlyPriorFindingAdvanced':changed,'other48FindingsExact':True,'newFindingIds':sorted(set(nf)-set(bf)),'newFindingRecordsTotal':52,'originalRejected028StillExcluded':True,'priorPaginationIndependentResult':accept['result'],'pr23MergeDeliveryEqualTrees':True,'archiveRows':archiveRows,'safeArchiveScanPassed':True,'wholeFileOrOverallPassNotClaimed':True,'ledgerCounts':summary}
Path('/tmp/edhr-read-qa-provenance.json').write_text(json.dumps(out,indent=2)+'\n');print(json.dumps({'head':head,'clean':True,'finiteScopeReceipts':len(sources),'archiveReceipts':len(archiveRows),'inherited545And108Exact':True,'other48FindingsExact':True,'onlyPaginationAdvancedAnd3Added':True,'productionChangedFiles':len(prod),'noGovernanceKnowledgeSqlPermissionActionOrSnapshotChanges':True}))
