from pathlib import Path
import hashlib,json,subprocess
repo=Path('/workspace/edhr-nexus-frontend');ref='fc0980035d717fd1790ac72c907f940390540c4d'
def git(*args):return subprocess.check_output(['git',*args],cwd=repo)
base='gmp-platform/backend/src/main/java/com/zencas/edhr/'
items=[
('workflow/controller/WorkflowInstanceController.java','create',62,67,'Added existing intervene authority before unchanged direct save and DHR protection.'),
('workflow/controller/WorkflowInstanceController.java','update',69,76,'Added existing intervene authority before unchanged existing-instance and target DHR guards/direct save.'),
('workflow/controller/WorkflowInstanceController.java','delete',78,84,'Added existing intervene authority before unchanged DHR guard/direct delete.'),
('workflow/controller/WorkflowInstanceController.java','terminate',135,145,'Existing intervention authorization and authenticated operator preserved; no new generic signature policy.'),
('workflow/controller/WorkflowInstanceController.java','protectDhr/currentOperatorId',222,234,'Current and target DHR guards and authenticated principal handling retained.'),
('workflow/controller/WorkflowTaskController.java','create/update/delete',57,83,'Adjacent task management writes already use the same existing authority; content policy not certified.'),
('common/config/SecurityConfig.java','securityFilterChain',39,60,'Method security is enabled at class level; global chain otherwise requires authentication and installs real JWT filter.'),
('workflow/engine/WorkflowEngine.java','completeTask',244,313,'Existing instance/task locks, runtime and candidate checks and DHR-exclusive completion remain; no blanket approval permission added.'),
('workflow/engine/WorkflowEngine.java','terminateInstance',732,750,'Existing running and DHR boundary with task termination/logging preserved; signature parameter does not prove mandatory policy.'),
('workflow/engine/WorkflowEngine.java','lockInstance/lockTask',752,765,'Existing instance-first locking and refresh preserved, no concurrency refactor.'),
('workflow/engine/WorkflowEngine.java','assertNotDhrTask/assertNotDhrInstance',775,784,'Existing DHR exclusive boundary retained.')]
scopes=[]
for i,(path,method,start,end,conclusion) in enumerate(items,1):
    path=base+path;raw=git('show',ref+':'+path)
    assert end<=len(raw.decode().splitlines())
    scopes.append({'id':'w3c-primary-source:%03d'%i,'path':path,'method':method,'range':[start,end],'sourceCommit':ref,'blob':git('rev-parse',ref+':'+path).decode().strip(),'sha256':hashlib.sha256(raw).hexdigest(),'readDepth':'actual finite primary source inspection, not whole-file or branch completion','conclusion':conclusion,'wholeFileReviewComplete':False,'runtimeExecuted':False})
out=repo/'docs/development/branch-review-20261020-w3-task-commands/evidence/primary/source-map.json'
out.write_text(json.dumps({'schema':'edhr-readonly-source-map/v1','role':'primary developer finite source inspection, not independent quality acceptance','fixedCommit':ref,'sourceScopes':scopes,'runtimeEvidenceSeparate':'validation-summary.json','wholeFileOrBranchAcceptance':False},ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'primaryFiniteScopes':len(scopes),'uniquePaths':len({s['path'] for s in scopes})}))
