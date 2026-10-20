import os,subprocess,time,json,hashlib,xml.etree.ElementTree as ET
from pathlib import Path
R=Path('/workspace/edhr-nexus-frontend')
P=Path('/tmp/edhr-w3-final-independent')
BASE='a8285be9b91fb76bcb27ccb16a5258bda1fb5077'
HEAD='b8051583f6c85d52260174e6da191f36bb2c1de8'
git=lambda *args:subprocess.check_output(['git',*args],cwd=R,text=True).strip()
classes=['WorkTemplateWriteBoundaryTest','WorkTemplateControllerTest','WorkTemplateWritePostgresTest','WorkflowTransferPostgresTest','WorkflowEngineTest','WorkflowTaskControllerTest','ExecutionAccessTest','ExecutionSubjectScopeTest','ProductionExecutionEngineTest','ProductionExecutionIntegrationTest','DhrReviewLifecycleIntegrationTest','DhrReviewServiceTest','AuditEventTest','FormFillSettingsServiceTest','BusinessKnowledgeModelTest']
tests=','.join(classes[:9]+['ProductionExecutionIntegrationTest#formApprovalTransferMovesPendingTaskWithoutAdvancingTheFlow+transferProjectionIsNodeScopedAndReassignmentIsClearedByReturn+tenantDelegationOutsideFrozenCandidatesPreservesSourceAndMovesOnlyCurrentResponsibility+transferRechecksTheSelectedTenantUserWhenTheirAccountBecomesLocked']+classes[10:])
paths=set(git('diff','--name-only',BASE,HEAD).splitlines())
paths.update(['AGENTS.md','codeplzreadme.md','DESIGN.md','docs/agents/quality-verifier.md','docs/agents/agent-handoff-contract.md','docs/knowledge/schema.yaml'])
paths=sorted(p for p in paths if (R/p).is_file())
def snap():
 return {'head':git('rev-parse','HEAD'),'target':git('rev-parse','refs/remotes/origin/edhr-dev'),'workingTree':git('status','--porcelain'),'files':[{'path':p,'blob':git('rev-parse',HEAD+':'+p),'bytes':(R/p).stat().st_size,'sha256':hashlib.sha256((R/p).read_bytes()).hexdigest()} for p in paths]}
before=snap();assert before['head']==HEAD and not before['workingTree']
Path(str(P)+'-source-before.json').write_text(json.dumps(before,indent=2)+'\n')
cmd=['bash','/workspace/.edhr-cloud-tools/mvn-edhr','-C','-f','gmp-platform/backend/pom.xml','-Dexecution.test.driver=org.postgresql.Driver','-Dexecution.test.url=jdbc:postgresql://localhost:55432/edhr_w3_execution_test','-Dexecution.test.user=edhr','-Dexecution.test.dialect=org.hibernate.dialect.PostgreSQLDialect','-Dtest='+tests,'test']
env=dict(os.environ,W3_TEST_DATABASE_URL='jdbc:postgresql://localhost:55432/edhr_w3_write_test',W3_TRANSFER_DATABASE_URL='jdbc:postgresql://localhost:55432/edhr_w3_transfer_test')
started=time.time()
with Path(str(P)+'-backend.raw.log').open('w') as out:
 result=subprocess.run(cmd,cwd=R,env=env,stdout=out,stderr=subprocess.STDOUT)
reports=R/'gmp-platform/backend/target/surefire-reports';suites=[]
for name in classes:
 matches=list(reports.glob('TEST-*.'+name+'.xml'))
 if len(matches)!=1:
  suites.append({'class':name,'reportMissingOrAmbiguous':True});continue
 p=matches[0];tree=ET.parse(p).getroot();a=tree.attrib
 suites.append({'class':name,'suite':{k:a[k] for k in ['name','tests','failures','errors','skipped']},'fresh':p.stat().st_mtime>=started,'xmlMtimeEpoch':p.stat().st_mtime,'xmlSha256':hashlib.sha256(p.read_bytes()).hexdigest(),'cases':[{'name':t.attrib['name'],'status':'failed' if t.find('failure') is not None else 'error' if t.find('error') is not None else 'skipped' if t.find('skipped') is not None else 'passed'} for t in tree.findall('testcase')]})
after=snap();Path(str(P)+'-source-after.json').write_text(json.dumps(after,indent=2)+'\n')
totals={k:sum(int(s['suite'][k]) for s in suites if 'suite'in s) for k in ['tests','failures','errors','skipped']}
d={'role':'fresh independent final quality; no repair participation','baseCommit':BASE,'testedCommit':HEAD,'contractReadCommit':HEAD,'knowledgeVersion':'0.3.25','command':cmd,'explicitSyntheticDatabaseParameters':{'W3_TEST_DATABASE_URL':env['W3_TEST_DATABASE_URL'],'W3_TRANSFER_DATABASE_URL':env['W3_TRANSFER_DATABASE_URL']},'startedEpoch':started,'finishedEpoch':time.time(),'exit':result.returncode,'totals':totals,'all15ReportsFresh':len(suites)==15 and all(s.get('fresh') for s in suites),'nativePostgresTests':sum(int(s['suite']['tests']) for s in suites if s['class']in ['WorkTemplateWritePostgresTest','WorkflowTransferPostgresTest','ProductionExecutionIntegrationTest']),'sourceBeforeAfterExact':before==after,'suites':suites,'excludedRawLog':str(P)+'-backend.raw.log','limits':['Only synthetic local test databases; no production or historical-data restoration','DHR lifecycle five tests use existing H2 compatibility mode','Audit hash roundtrip extra failing probe is not part of this suite','Original baseline red tests not rerun because no product/test source changed since independently verified first round']}
Path(str(P)+'-backend-summary.json').write_text(json.dumps(d,indent=2)+'\n')
print(json.dumps({k:d[k] for k in ['exit','totals','all15ReportsFresh','nativePostgresTests','sourceBeforeAfterExact']}))
raise SystemExit(result.returncode)
