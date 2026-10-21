import collections,copy,difflib,hashlib,importlib.util,json,subprocess,sys,zipfile
from pathlib import Path
import yaml

REPO=Path('/workspace/edhr-nexus-frontend')
TARGET='d405a9afb4327b859545fa5a12c7eebe1350f418'
MERGE='720ddd03c8ddc1aaac7aecbf78c95a3099c25079'
DELIVERY='9db27dd53820fcdf6479716bfe2428143b7f81f2'
TESTED='9d8269114d8d4645be34b48bf0d0d88b5d245ba1'
CORE='725127d46ca1ae758f7fddeeaf94af1079afe432'
OLD='docs/development/branch-review-20261021-task-pagination'
BATCH='docs/development/branch-review-20261021-workflow-read-boundaries'
OUT=REPO/BATCH
def git(*args):return subprocess.check_output(['git',*args],cwd=REPO)
def raw(ref,path):return git('show',ref+':'+path)
def sha(value):return hashlib.sha256(value).hexdigest()
def dump(path,value):path.parent.mkdir(parents=True,exist_ok=True);path.write_text(json.dumps(value,ensure_ascii=False,indent=2)+'\n')
def receipt(ref,path,locator='/'):return {'path':path,'commit':ref,'sha256':sha(raw(ref,path)),'locator':locator}

assert git('rev-parse','HEAD').decode().strip()==CORE
parents=git('show','-s','--format=%P',MERGE).decode().split()
assert parents==['13def47d4def51237d1393eaa7bf2651e98a0cbd',DELIVERY]
assert git('rev-parse',MERGE+'^{tree}')==git('rev-parse',DELIVERY+'^{tree}')
protected=['gmp-platform','scripts','docs/knowledge','docs/architecture','docs/agents','AGENTS.md','codeplzreadme.md','DESIGN.md',OLD+'/source-catalog.json',OLD+'/ledger']
assert not git('diff','--name-only',TESTED,TARGET,'--',*protected)
docs_delta=git('diff','--name-only',MERGE,TARGET).decode().splitlines()
assert len(docs_delta)==9 and all(p.startswith('docs/development/') for p in docs_delta)
catalog=json.loads(raw(TARGET,OLD+'/source-catalog.json'));original=copy.deepcopy(catalog)
assert (len(catalog['methods']),len(catalog['semanticSources']),len(catalog['findings']))==(545,6,49)
acceptance=json.loads(raw(TARGET,OLD+'/acceptance.json'))
qpath=OLD+'/evidence/independent/edhr-page-qa-qualityResult.yaml';qraw=raw(TARGET,qpath);quality=yaml.safe_load(qraw)['qualityResult']
assert sha(qraw)==acceptance['qualityResult']['sha256']=='0d8017b9d0544e259b670a5b958fe8bd312dd0a8294ae69f97b6d2b01c3d18a5'
required=[r for r in quality['checks'] if r['required']]
assert quality['result']=='passed' and quality['headCommit']==TESTED and len(required)==8 and all(r['outcome']=='passed' for r in required)
fid='W3D-TASK-PAGINATION-001';finding=next(f for f in catalog['findings'] if f['id']==fid)
assert finding['disposition']=='fixed-awaiting-independent-acceptance'
prior=copy.deepcopy(finding);finding['disposition']='fixed-and-independently-accepted'
finding['resolution'].update(testedCommits=[TESTED],pullRequests=['https://github.com/IvenYi/edhr-nexus-frontend/pull/23'],mergeCommits=[MERGE])
finding['priorCatalogDisposition']={'catalog':receipt(TARGET,OLD+'/source-catalog.json'), 'originalRecord':prior}
finding['evidence'] += [receipt(TARGET,OLD+'/acceptance.json'),receipt(TARGET,qpath),receipt(TARGET,OLD+'/delivery.json')]
finding['dispositionQualification']='Only genuine PR23 independent passed8/8 and same-tree human merge are carried; d405 adds development-operation documents only. No new runtime/source/semantic acceptance, deployment or database restoration is performed by this script.'
finding['limitations']=['Original pending record and all limitations remain in priorCatalogDisposition.originalRecord. Acceptance covers the old integer pagination slice only; arbitrary parameter binding, generic policy and broader audit items remain open.']
catalog['baselineCommit']=TARGET
catalog['importNotes'].append({'noteKind':'prior-acceptance-carry-forward','id':'read-pr23-pagination-accepted','scope':fid,'reason':finding['dispositionQualification'],'evidence':[receipt(TARGET,OLD+'/acceptance.json'),receipt(TARGET,qpath)]})
assert [f for f in catalog['findings'] if f['id']!=fid]==[f for f in original['findings'] if f['id']!=fid]
assert catalog['methods']==original['methods'] and catalog['semanticSources']==original['semanticSources']
helpers=OUT/'evidence/helpers';primary=OUT/'evidence/primary';helpers.mkdir(parents=True);primary.mkdir(parents=True)
dump(helpers/'baseline-draft-catalog.json',catalog)
support={'author':'/root','kind':'L0 mechanical carry only','targetCommit':TARGET,'humanMerge':MERGE,'mergeParents':parents,'deliveryCommit':DELIVERY,'sameMergeDeliveryTree':True,'docSuccessorChangedPaths':docs_delta,'protectedComparedToTested':TESTED,'changedProtectedPaths':[],'originalSourceScopes':545,'originalSemanticSources':6,'originalHistoricalSemanticRows':108,'originalFindingRecords':49,'onlyFindingAdvanced':fid,'otherFindingObjectsUnchanged':48,'newRuntimeExecutedByCarry':False,'newSemanticReviewsByCarry':0,'wholeFilesCompleted':0,'wholeBranchAccepted':False}
dump(helpers/'baseline-support.json',support)
archives=[]
def archive(path,group='primary'):
    path=Path(path);value=path.read_bytes();dest=OUT/'evidence'/group/path.name;dest.parent.mkdir(parents=True,exist_ok=True);assert not dest.exists();dest.write_bytes(value)
    archives.append({'source':str(path),'archive':str(dest.relative_to(REPO)),'sha256':sha(value),'bytes':len(value)})
for name in ['edhr-read-baseline-summary.json','edhr-read-baseline-utf8-summary.json','edhr-read-fixed-summary.json','edhr-read-run.py','edhr-read-browser-baseline.json','edhr-read-browser-fixed.json','edhr-read-evidence.py']:
    archive(Path('/tmp')/name)
for phase in ['baseline','fixed']:
    document=json.loads((Path('/tmp')/('edhr-read-browser-'+phase+'.json')).read_text())
    assert document['tests']==16 and document['skipped']==0
    for case in document['results']:
        for file in case['screenshots']:archive(file,'browser-'+phase)
assert json.loads((primary/'edhr-read-browser-baseline.json').read_text())['failed']==12
assert json.loads((primary/'edhr-read-browser-fixed.json').read_text())['passed']==16
first=json.loads((primary/'edhr-read-baseline-summary.json').read_text());red=json.loads((primary/'edhr-read-baseline-utf8-summary.json').read_text());green=json.loads((primary/'edhr-read-fixed-summary.json').read_text())
assert first['totals']=={'tests':28,'failures':9,'errors':0,'skipped':0}
assert red['totals']=={'tests':28,'failures':7,'errors':0,'skipped':0}
assert green['exit']==0 and green['totals']=={'tests':53,'failures':0,'errors':0,'skipped':0}
test='gmp-platform/backend/src/test/java/com/zencas/edhr/workflow/controller/WorkflowReadBoundaryPostgresTest.java'
first_fixture=Path('/tmp/edhr-read-baseline-first-fixture.java').read_bytes();final_fixture=raw(CORE,test)
with zipfile.ZipFile(primary/'retained-fixtures.zip','w',zipfile.ZIP_DEFLATED) as z:z.writestr('WorkflowReadBoundaryPostgresTest-before-utf8.java',first_fixture)
dump(primary/'fixture-receipts.json',{'firstFixtureSha256':sha(first_fixture),'finalFixtureCommit':CORE,'finalFixturePath':test,'finalFixtureSha256':sha(final_fixture),'onlyFixtureCorrection':'Explicit UTF8 decoding of MockMvc response; original assertions unchanged. Initial9 failures =7 product graph +2 fixture decoding. Corrected old28=7 product failures/21controls.','diffToFinal':list(difflib.unified_diff(first_fixture.decode().splitlines(),final_fixture.decode().splitlines(),fromfile='first-fixture',tofile='final-fixture'))})
scopes=[]
def scope(path,name,ref=CORE,token=None,start=None,end=None,runtime=False,conclusion='Finite source inspection only; no whole-file or independent acceptance'):
    value=raw(ref,path);lines=value.decode().splitlines()
    if start is None:
        matches=[i for i,line in enumerate(lines) if (token or ' '+name+'(') in line];assert len(matches)==1,(path,name,matches)
        start=matches[0]+1
        if path.endswith('.java'):end=next(i+1 for i in range(start,len(lines)) if lines[i]=='    }')
        elif '/api/' in path:end=start+1
        else:end=len(lines)
    assert 1<=start<=end<=len(lines),(path,name,start,end,len(lines))
    scopes.append({'id':'w3-read-primary:'+str(len(scopes)+1).zfill(3),'path':path,'method':name,'sourceCommit':ref,'range':[start,end],'blob':git('rev-parse',ref+':'+path).decode().strip(),'sha256':sha(value),'readDepth':'primary-finite-source-and-runtime' if runtime else 'primary-finite-source-inspection','conclusion':conclusion,'wholeFileReviewComplete':False,'runtimeExecuted':runtime})
controller='gmp-platform/backend/src/main/java/com/zencas/edhr/workflow/controller/WorkflowInstanceController.java'
for name in ['list','getById','graph','logs']:
    scope(controller,name,runtime=True,conclusion='Actual HTTP/PG read scope in primary53; graph exact IDs and selected version, existing read contract and DHR boundary only.')
scope(controller,'terminate',conclusion='Existing optional signatureId passed to engine; no mandatory or authenticity policy inferred.')
log='gmp-platform/backend/src/main/java/com/zencas/edhr/workflow/controller/WorkflowLogController.java'
for name in ['list','getById','protect']:scope(log,name,ref=TARGET,runtime=True,conclusion='Actual native HTTP list/object DHR exclusion; no broader read-policy acceptance.')
task='gmp-platform/backend/src/main/java/com/zencas/edhr/workflow/controller/WorkflowTaskController.java'
for name in ['getById','approve','reject','submit']:scope(task,name,ref=TARGET,conclusion='Read/source/action signature DTO mapping only; generic action matrix and signing policy remain unresolved, no action runtime claim here.')
engine='gmp-platform/backend/src/main/java/com/zencas/edhr/workflow/engine/WorkflowEngine.java'
scope(engine,'private completeTask signature storage',ref=TARGET,token='private void completeTask(')
scope(engine,'terminateInstance',ref=TARGET,conclusion='Signature parameter not used in existing termination body; no unified signature requirement inferred.')
for name in ['graphMarksOnlyWholeCurrentIdsInTheInstanceVersion','dhrEvidenceCannotBeReadThroughGenericObjectEndpoints','genericListCountsAndContentExcludeDhrBeforePagination','instanceLogsUseAnArrayAndOnlyTheRequestedInstanceInChronologicalOrder','everyReadStillRequiresAuthentication','longInstanceIdsRemainDistinctAcrossReadEndpoints','missingObjectsKeepExistingErrorContracts']:
    scope(test,name,runtime=True,conclusion='Named actual primary HTTP/JWT/nativePG behavior in clean53; no password login or whole workflow acceptance.')
for path,name,token in [('gmp-platform/frontend/src/api/workflow-instances.ts','getInstance','export const getInstance ='),('gmp-platform/frontend/src/api/workflow-logs.ts','getInstanceLogs','export const getInstanceLogs =')]:scope(path,name,token=token,runtime=True,conclusion='Actual browser16 preserves raw route IDs through existing GET URL; no API shape change.')
scope('gmp-platform/frontend/src/pages/workflow-center/InstanceLogs.tsx','InstanceLogs data/pagination/route state',token='export default function InstanceLogs()',runtime=True,conclusion='Actual maintained page controlled-API browser16; array slicing, route reset, states, long IDs only. Existing metadata/style gaps not accepted as complete UI.')
scope('gmp-platform/frontend/src/pages/workflow-center/InstanceDetail.tsx','instance/detail log queries',start=35,end=62,runtime=True,conclusion='Controlled browser long-ID GET identity only; existing complete detail metadata/node projection not accepted.')
scope('gmp-platform/frontend/src/pages/workflow-center/TaskDetail.tsx','handleAction body',ref=TARGET,start=86,end=97,conclusion='Existing password posted but TaskActionRequest does not consume it; source-only lead, question pending, no new signing policy.')
scope('gmp-platform/frontend/src/pages/workflow-center/TaskDetail.tsx','unwired password field',ref=TARGET,start=123,end=126,conclusion='Existing displayed signature-password field; its disposition separately asked, not fixed/accepted in read slice.')
scope('gmp-platform/frontend/src/router/index.tsx','instance/log page routes',ref=TARGET,start=99,end=103,conclusion='Existing real route mapping; browser harness renders same components through MemoryRouter, not entire app shell.')
browser='gmp-platform/frontend/scripts/test-workflow-instance-read-browser.mjs';lines=raw(CORE,browser).decode().splitlines();start=next(i+1 for i,line in enumerate(lines) if 'for (const viewport of' in line);end=next(i+1 for i,line in enumerate(lines) if 'results.push(outcome)' in line)
scope(browser,'controlled API rendered-page scenarios',start=start,end=end,runtime=True,conclusion='Actual16 cases/2viewports; unchanged maintained theme/client, synthetic array API, no real backend/login E2E.')
dump(primary/'source-map.json',{'author':'/root','sourceScopes':scopes,'scopeRecordsAreOverlapping':True,'wholeFileReviewComplete':False,'newSemanticReviewPerformed':False})
changed=git('diff','--name-only',TARGET,CORE,'--','gmp-platform').decode().splitlines()
dump(primary/'validation-summary.json',{'level':'L2','targetCommit':TARGET,'coreCommit':CORE,'firstNativeRun':first['totals'],'firstNativeQualification':'Seven real graph failures and two test-only default ISO8859 response-decoding failures; original assertions unchanged after UTF8 fixture correction.','correctedOldNativeRun':red['totals'],'correctedOldControls':21,'mainBusinessTests':53,'nativePostgresSubset':50,'h2Subset':3,'businessFailures':0,'businessErrors':0,'businessSkipped':0,'browserOld':{'tests':16,'failed':12,'passed':4,'skipped':0},'browserFixed':{'tests':16,'passed':16,'failed':0,'skipped':0},'frontendBuild':{'command':'npm run build','exit':0,'logSha256':sha(Path('/tmp/edhr-read-frontend-build.private.log').read_bytes()),'rawLogNotArchived':True},'sourceRunQualification':'Primary runtime HEAD remainedd405 with dirty implementation; original summaries are unchanged. Exact final product/test/browser-script bytes committed725127d4, fresh independent clean candidate acceptance still required.','changedCorePaths':changed,'fixedSourceReceipts':[receipt(CORE,p) for p in changed],'ontologyGate':'not-applicable existing read representation only; no business knowledge/state/policy/permission/audit/snapshot change','visualInspection':{'author':'/root','actualImages':['browser-fixed/data-pagination-1440.png','browser-fixed/data-pagination-390.png'],'scope':'Actual pagination output/contained old table at two viewports only','limitations':['No complete UI style acceptance','Existing missing node/status/metadata projections and narrow-screen styles retained']},'database':{'containerId':'aad857ad53018b82a11f337cc5489cf4ae3529043bf0a1782fd473456c3f1122','name':'edhr-audit-workflow-read-20261021','loopback':'127.0.0.1:55432','database':'edhr_w3_command_test','ownedSyntheticOnly':True,'cleanup':'pending independent FINAL'},'notClaimed':['new business or signing policy','full app/login/backend browser E2E','complete detail/log projection or UI conformity','production migration/deploy/restoration','whole W3/W0-W7 acceptance','GitHub Actions read or trigger']})
dump(OUT/'evidence/archive-receipts.json',{'files':archives,'originalsUnchanged':True,'rawLogsXmlTokensNotArchived':True})
print(json.dumps({'carriedFinding':fid,'originals':len(archives),'finiteSourceScopes':len(scopes),'business':53,'browser':16,'coreCommit':CORE,'draftSha256':sha((helpers/'baseline-draft-catalog.json').read_bytes())}))
