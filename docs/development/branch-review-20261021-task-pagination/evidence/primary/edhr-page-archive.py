import hashlib,json,subprocess
from pathlib import Path
repo=Path('/workspace/edhr-nexus-frontend');batch=repo/'docs/development/branch-review-20261021-task-pagination'
target='13def47d4def51237d1393eaa7bf2651e98a0cbd';core='25e974e03813f6403618ce8a9efc735cafd429a2'
def git(*args):return subprocess.check_output(['git',*args],cwd=repo)
sha=lambda raw:hashlib.sha256(raw).hexdigest()
assert git('rev-parse','HEAD').decode().strip()==core
receipts=[]
def archive(path,group):
    path=Path(path);raw=path.read_bytes();dest=batch/'evidence'/group/path.name
    dest.parent.mkdir(parents=True,exist_ok=True);assert not dest.exists();dest.write_bytes(raw)
    receipts.append({'source':str(path),'archive':str(dest.relative_to(repo)),'sha256':sha(raw),'bytes':len(raw)})
for manifest_name in ['edhr-page-baseline-manifest.json','edhr-page-source-manifest.json']:
    manifest_path=Path('/tmp')/manifest_name;document=json.loads(manifest_path.read_text())
    for item in document['files']:
        source=Path(item['path']);assert sha(source.read_bytes())==item['sha256'];archive(source,'helpers')
    archive(manifest_path,'helpers')
archive('/tmp/edhr-page-catalog-build.py','helpers')
for name in ['edhr-page-baseline-summary.json','edhr-page-fixed-summary.json','edhr-page-run.py','edhr-page-archive.py']:
    archive(Path('/tmp')/name,'primary')
primary=batch/'evidence/primary';baseline=json.loads((primary/'edhr-page-baseline-summary.json').read_text());fixed=json.loads((primary/'edhr-page-fixed-summary.json').read_text())
assert baseline['exit']==1 and baseline['totals']=={'tests':28,'failures':22,'errors':0,'skipped':0}
assert fixed['exit']==0 and fixed['totals']=={'tests':52,'failures':0,'errors':0,'skipped':0}
assert all(s['freshReport'] for s in baseline['suites']+fixed['suites'])
controller='gmp-platform/backend/src/main/java/com/zencas/edhr/workflow/controller/WorkflowTaskController.java'
test='gmp-platform/backend/src/test/java/com/zencas/edhr/workflow/controller/WorkflowTaskPaginationPostgresTest.java'
scopes=[]
names=[(controller,'todo','positive page/size, safe long offset and bounded slice; actual main52 pass'),(controller,'done','same done queue boundaries and unchanged selection/order; actual main52 pass')]
for name in ['nonPositivePageOrSizeReturnsBadRequestWithoutChangingRows','positiveDistantPagesReturnEmptyWithoutOverflowOrWrappingToFirstPage','normalPagesPreserveOrderOperatorScopeDhrExclusionAndArrayContract','emptyQueuesKeepValidEmptyResponsesAndStillRejectInvalidPagination','paginationDoesNotBypassAuthentication']:
    names.append((test,name,'Actual named parameterized HTTP/nativePG behavior from primary clean52; not whole-file or independent acceptance'))
for index,(path,name,conclusion) in enumerate(names):
    raw=git('show',core+':'+path);lines=raw.decode().splitlines()
    starts=[i for i,line in enumerate(lines) if (' '+name+'(') in line]
    assert len(starts)==1
    start=starts[0];end=next(i for i in range(start+1,len(lines)) if lines[i]=='    }')
    scopes.append({'id':'page-primary:'+str(index+1).zfill(3),'path':path,'method':name,'sourceCommit':core,'range':[start+1,end+1],'blob':git('rev-parse',core+':'+path).decode().strip(),'sha256':sha(raw),'readDepth':'primary-authored-and-executed-finite-method','conclusion':conclusion,'wholeFileReviewComplete':False,'runtimeExecuted':True})
(primary/'source-map.json').write_text(json.dumps({'author':'/root','fixedCommit':core,'sourceScopes':scopes,'wholeFileReviewComplete':False,'runtimeQualification':'Primary actual28 red and52 green; run-time HEAD target with dirty implementation, later core exact bytes. Not independent acceptance.'},ensure_ascii=False,indent=2)+'\n')
summary={'level':'L2','targetCommit':target,'coreCommit':core,'baseline':baseline['totals'],'fixed':fixed['totals'],'primaryUniqueBusinessTests':52,'nativePostgresSubset':50,'mockControllerSubset':2,'fixturePath':test,'fixtureCommit':core,'fixtureSha256':sha(git('show',core+':'+test)),'fixtureUnchangedBetweenRedAndGreen':True,'sourceRunQualification':'Actual runner HEAD remained13def with new fixture and later production changes uncommitted. Exact test unchanged between runs; identical final controller/test bytes committed25e974e0. Original summaries are not relabeled as committed runs. Fresh independent QA still required.','existingSemanticsChanged':False,'ontologyGate':'not-applicable technical integer input/index only; no knowledge assets changed','database':{'containerId':'38dd46d85414bf0bc8a7387379d5fcc8cf564ca022a6d9d249cf880c8642fc09','name':'edhr-audit-pagination-20261021','version':'PostgreSQL16','loopback':'127.0.0.1:55432','database':'edhr_w3_command_test','syntheticOnly':True,'cleanup':'pending independent FINAL'},'notClaimed':['full HTTP password login/browser UI E2E','all request binding/global exception mapping','whole W3 or branch acceptance','new business policy or formal ontology role execution','GitHub Actions read/trigger, production migration, merge or deploy']}
(primary/'validation-summary.json').write_text(json.dumps(summary,ensure_ascii=False,indent=2)+'\n')
(batch/'evidence/archive-receipts.json').write_text(json.dumps({'roleOriginalsUnchanged':True,'files':receipts},ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'originalFiles':len(receipts),'primaryScopes':len(scopes),'mainTests':52,'nativeSubset':50,'coreCommit':core}))
