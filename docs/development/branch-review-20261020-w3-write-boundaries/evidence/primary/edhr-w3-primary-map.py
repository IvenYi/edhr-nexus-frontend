from pathlib import Path
import subprocess,json,hashlib
repo=Path('/workspace/edhr-nexus-frontend'); ref='cb2e9eef6cdb50077283c9707d257dcdd56a9e36'
backend='gmp-platform/backend/src/main/java/com/zencas/edhr/'
specs=[
 (backend+'workflow/controller/WorkTemplateController.java','saveGraph retired-shape guard before graph setters/reference/audit',183,220),
 (backend+'workflow/controller/WorkTemplateController.java','createDraftVersion explicit inherited new write',223,236),
 (backend+'workflow/controller/WorkTemplateController.java','publishVersion retired shape before current flags and inherited draft',240,270),
 (backend+'workflow/controller/WorkTemplateController.java','copyPublishedVersionToDraft overwrite and missing-draft branches',275,319),
 (backend+'workflow/controller/WorkTemplateController.java','newDraft supported shape before ID allocation/build',406,419),
 (backend+'workflow/controller/WorkTemplateController.java','validateSupportedNodeConfigurations presence-only retired-key boundary',421,441),
 (backend+'workflow/engine/WorkflowEngine.java','completeTask instance/task lock and current status/operator branch only',253,291),
 (backend+'workflow/engine/WorkflowEngine.java','resolveInstanceTenant stored initiator account scope',537,546),
 (backend+'workflow/engine/WorkflowEngine.java','transferTargets active task/current operator and same-tenant search',660,677),
 (backend+'workflow/engine/WorkflowEngine.java','transferTask current handler/reason/origin/current target/audit transaction',679,730),
 (backend+'workflow/engine/WorkflowEngine.java','terminateInstance refreshed lock and DHR/status gate',733,750),
 (backend+'workflow/engine/WorkflowEngine.java','lockInstance and lockTask refresh after pessimistic acquisition',751,766),
 (backend+'workflow/engine/WorkflowEngine.java','isTaskOperator reads current top-level eligibility, not origin text',767,784),
 (backend+'workflow/engine/WorkflowEngine.java','singleUserSnapshot preserves first raw origin and partial-history marker',785,804),
 (backend+'workflow/controller/WorkflowTaskController.java','transfer target and POST authenticated identity/DTO reason',167,193),
 (backend+'identity/service/TenantTransferTargets.java','search SQL eligibility/sort/limit and postfilter',18,37),
 (backend+'identity/service/TenantTransferTargets.java','require stored target canonical identity/tenant/self/availability',39,54),
 (backend+'identity/service/TenantTransferTargets.java','available ACTIVE/unlocked qualification',56,59),
 (backend+'production/service/ExecutionAccess.java','captureApprovers origin frozen and canAct transfer-first eligibility',103,133),
 (backend+'production/service/ExecutionAccess.java','transferTargets/requireTransferTarget and stored operator tenant',135,156),
 (backend+'production/service/ProductionExecutionEngine.java','transferTargets and transferForm accepted canonical target/history without advancing',375,399),
 (backend+'workflow/repository/WorkflowTaskRepository.java','native todo and done current candidates plus DHR exclusion',20,31),
 ('gmp-platform/frontend/src/pages/workflow-center/TaskDetail.tsx','task ID reset, target GET cancellation and stale-result isolation',29,52),
 ('gmp-platform/frontend/src/pages/workflow-center/TaskDetail.tsx','openTransfer and submitTransfer target/reason payload, retry/busy/cancel',54,86),
 ('gmp-platform/frontend/src/pages/workflow-center/TaskDetail.tsx','transfer dialog selection/input state and required controls only',168,197),
 ('gmp-platform/frontend/src/pages/production/ProductionExecutionPage.tsx','target search keyed to actual object/operation/form/copy and stale-result isolation',255,272),
 ('gmp-platform/frontend/src/pages/production/ProductionExecutionPage.tsx','act transfer success/failure and formAction initialization branches only',335,377),
 ('gmp-platform/frontend/src/pages/production/ProductionExecutionPage.tsx','existing approval dialog new tenant copy/controlled selection/busy/error',618,632),
 (backend+'compliance/entity/AuditEvent.java','seal/hash method and raw JSON/time canonical payload prefix; preexisting W5 gap',56,103),
]
records=[]
for i,(path,scope,start,end) in enumerate(specs,1):
 b=subprocess.check_output(['git','show',f'{ref}:{path}'],cwd=repo)
 assert end<=len(b.splitlines()),(path,end,len(b.splitlines()))
 blob=subprocess.check_output(['git','rev-parse',f'{ref}:{path}'],cwd=repo,text=True).strip()
 records.append({'id':f'w3-primary:{i:02d}','path':path,'scope':scope,'lineRange':[start,end], 'reviewedCommit':ref,'sourceBlob':blob,'sourceSha256':hashlib.sha256(b).hexdigest(),'depth':'selected-methods-and-branches','wholeFileReviewComplete':False,'recordedOutcome':'fixed-awaiting-independent-QA' if 'AuditEvent.java' not in path else 'preexisting-W5-followup-open','evidence':'Primary source inspection and actual focused runtime summaries, not full-file certification'})
p=repo/'docs/development/branch-review-20261020-w3-write-boundaries/primary-source-map.json'
p.write_text(json.dumps({'schema':'edhr-primary-finite-source-review/v1','role':'primary-implementer-not-independent-quality','sourceCommit':ref,'targetCommit':'a8285be9b91fb76bcb27ccb16a5258bda1fb5077','wholeFileReviewComplete':False,'scopeRecords':records,'limits':['Ranges overlap old/helper records; count listed review scopes, not unique methods','No whole-file completion','No full W3/W5/branch acceptance','Audit hash probe remains failed, outside transfer assertions']},ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'records':len(records),'paths':len(set(r['path'] for r in records))}))
