from pathlib import Path
import hashlib,json,subprocess,zipfile

repo=Path('/workspace/edhr-nexus-frontend')
batch=repo/'docs/development/branch-review-20261020-w3-task-commands'
out=batch/'evidence/primary';out.mkdir(parents=True,exist_ok=True)
sha=lambda b:hashlib.sha256(b).hexdigest()
receipts=[]
for name in ['baseline-valid-summary.json','fixed-authorization-summary.json','focused-regression-summary.json','auth-first-fixture-summary.json','run-tests.py','archive-primary.py']:
    src=Path('/tmp/edhr-w3c-'+name)
    data=src.read_bytes();dest=out/src.name;dest.write_bytes(data)
    receipts.append({'path':str(dest.relative_to(batch)),'source':str(src),'bytes':len(data),'sha256':sha(data)})
fixture=Path('/tmp/edhr-w3c-auth-first-fixture.java').read_bytes()
with zipfile.ZipFile(out/'first-fixture.zip','w',zipfile.ZIP_DEFLATED) as z:
    info=zipfile.ZipInfo('WorkflowInstanceAuthorizationIntegrationTest.first-fixture.java',(2026,10,20,0,0,0));info.compress_type=zipfile.ZIP_DEFLATED
    z.writestr(info,fixture)
(out/'first-fixture-member.json').write_text(json.dumps({'path':'first-fixture.zip','member':'WorkflowInstanceAuthorizationIntegrationTest.first-fixture.java','sha256':sha(fixture),'bytes':len(fixture),'meaning':'22 setup transaction errors, not a product defect or authorization red proof; retained original. Corrected fixture uses Spring Data repository transaction proxies.'},ensure_ascii=False,indent=2)+'\n')
def git(*args):return subprocess.check_output(['git',*args],cwd=repo)
core='fc0980035d717fd1790ac72c907f940390540c4d'
paths=['gmp-platform/backend/src/main/java/com/zencas/edhr/workflow/controller/WorkflowInstanceController.java','gmp-platform/backend/src/test/java/com/zencas/edhr/workflow/controller/WorkflowInstanceAuthorizationIntegrationTest.java']
proof=[]
for path in paths:
    raw=git('show',core+':'+path)
    assert (repo/path).read_bytes()==raw
    proof.append({'path':path,'fixedCommit':core,'blob':git('rev-parse',core+':'+path).decode().strip(),'sha256':sha(raw),'currentBytesEqualFixedCommit':True})
summary=json.loads((out/'edhr-w3c-focused-regression-summary.json').read_text())
assert summary['exit']==0 and len(summary['suites'])==9
assert all(s['freshReport'] and s['failures']==s['errors']==s['skipped']=='0' for s in summary['suites'])
total=sum(int(s['tests']) for s in summary['suites']);assert total==89
validation={'level':'L2','coreCommit':core,'targetCommit':'e8ecc103c8e6825c61c61b39b9cbd12b1474700e','productScope':'three existing workflow.intervene method guards only','runtime':{'uniqueTestsInLastGroup':89,'failures':0,'errors':0,'skipped':0,'nativePostgresTests':45,'nativePostgresSuites':['WorkflowInstanceAuthorizationIntegrationTest:22','WorkflowTransferPostgresTest:23'],'h2CompatibilitySuites':['DhrReviewLifecycleIntegrationTest:5'],'countsDoNotAddRepeatedRuns':True},'runBaselineQualification':'Runner sourceCommit is HEAD at execution time (e8ecc); fixed runs had the three permission annotations in the working tree, then committed unchanged as coreCommit. Independent QA will test a clean fixed candidate. No source HEAD is relabeled.','actualFixedSourceReceipts':proof,'baselineValid':{'tests':22,'failedUnauthorizedExpected403Actual200':9,'passedControls':13,'errors':0,'skipped':0},'firstFixtureErrors':{'tests':22,'errors':22,'productFailure':False,'originalRetained':True},'notExecuted':['browser/visual/frontend build: no UI/frontend changes','migration: no migration/schema changes','whole-branch or full semantic acceptance','GitHub Actions lookup or execution','Signature JSONB/archive native PG reproduction'],'temporaryDatabase':{'containerId':'b08c0fd89d8764b7f9809668b6d0e7bbb1b52bf56f2d38e0071c0471909e595e','publish':'127.0.0.1:55432','syntheticOnly':True,'cleanup':'pending independent QA FINAL'},'excluded':['raw Maven log','Surefire XML','JWT output','settings/env/secrets']}
(out/'validation-summary.json').write_text(json.dumps(validation,ensure_ascii=False,indent=2)+'\n')
(out/'receipts.json').write_text(json.dumps(receipts,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'archivedFiles':len(receipts)+4,'runtime':validation['runtime']}))
