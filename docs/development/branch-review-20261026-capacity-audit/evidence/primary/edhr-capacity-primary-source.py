import hashlib,json,subprocess
from pathlib import Path
repo=Path('/workspace/edhr-nexus-frontend');ref='5259791fcbc5d1fddf04cd62a02d6593d00fe2e6';rows=[]
def add(path,name,start,end,conclusion):
 raw=subprocess.check_output(['git','show',ref+':'+path],cwd=repo)
 assert 1<=start<=end<=len(raw.splitlines())
 rows.append({'id':'capacity-primary-source:'+str(len(rows)+1).zfill(3),'path':path,'method':name,'sourceCommit':ref,'range':[start,end],'blob':subprocess.check_output(['git','rev-parse',ref+':'+path],cwd=repo,text=True).strip(),'sha256':hashlib.sha256(raw).hexdigest(),'readDepth':'primary-finite-source-capacity-inspection','conclusion':conclusion,'wholeFileReviewComplete':False,'runtimeExecuted':False})
p='gmp-platform/backend/src/main/java/com/zencas/edhr/template/service/FormReferenceLookup.java'
for name,start,end,why in [
 ('source and configured source fields',18,54,'Existing whitelisted source SQL; user department subqueries are in one statement, not proof of application N+1.'),
 ('query predicate construction',56,111,'Bound parameters/whitelisted columns and dependent condition lookup inspected; no SQL timing/plan measured.'),
 ('appendScope',113,143,'Material-type validation is a deliberate extra query; scope/tenant qualifications must survive optimization.'),
 ('conditionValue',145,156,'Reference attributes are resolved server-side; client context metadata is not automatically trusted or sufficiently fresh.'),
 ('search',181,205,'Counterevidence: SQL LIMIT100 or bounded pageSize<=100 plus1 with OFFSET. Candidate application results are bounded; LIKE/offset database scan cost not measured.'),
 ('find',207,213,'Lookup depends on config/source/range/condition values, not ID alone. No claim ID-only caching is correct.'),
 ('validate',241,268,'Metadata/source/current qualification and reason FOR UPDATE are meaningful checks; not removed for fewer queries.')]:add(p,name,start,end,why)
add('gmp-platform/backend/src/main/java/com/zencas/edhr/template/controller/FormReferenceController.java','template reference HTTP query',12,32,'Authorized template query delegates bounded search with explicit dictionary scope; backend source inspection only.')
add('gmp-platform/backend/src/main/java/com/zencas/edhr/production/controller/ProductionExecutionController.java','execution reference routes',40,43,'GET actual route to execution context resolution; no browser/backend run.')
add('gmp-platform/backend/src/main/java/com/zencas/edhr/production/controller/ProductionExecutionController.java','paged reference POST',68,72,'POST forwards values/page/size to execution service; no new API or pagination implementation.')
add('gmp-platform/backend/src/main/java/com/zencas/edhr/production/service/ExecutionAccess.java','references and contextReference',38,52,'Same lookup used for frozen runtime candidates; only scoped context reuse can be evaluated.')
p='gmp-platform/backend/src/main/java/com/zencas/edhr/production/service/ProductionExecutionService.java'
add(p,'references overloads',99,119,'Each execution reference request calls full get(id) before selecting the frozen field and bounded candidate query.')
add(p,'get execution view',137,141,'Loads object/order/execution then constructs complete view; source-only growth analysis.')
raw=subprocess.check_output(['git','show',ref+':'+p],cwd=repo,text=True).splitlines()
end=next(i for i,line in enumerate(raw) if line.startswith('    private void disableForm('))
add(p,'view full projection',264,end,'Full snapshot/state, creation metadata, creator-name map cache, formal output, operation and form-copy controls are computed. Creator map is explicit reuse counterevidence; no per-request elapsed/heap measured.')
p='gmp-platform/backend/src/main/java/com/zencas/edhr/production/service/ProductionOutputService.java'
add(p,'object formal output',23,26,'Object-level formal summary delegates full committed source read; no aggregate cache assumption.')
add(p,'read full formal source',56,79,'One JDBC statement aggregates source batches and records/JSON. Single statement is not zero cost and not client N+1; no plan/scale measurement.')
d={'author':'/root','fixedCommit':ref,'sourceScopes':rows,'sourceScopeRecordsMayOverlap':True,'newSemanticRows':0,'runtimeTestsExecuted':0,'wholeFileReviewComplete':False,'riskIds':['PERF-EXECUTION-REFERENCE-VIEW-001'],'riskDisposition':'pending-discussion','sourceOnly':True}
Path('/tmp/edhr-capacity-primary-source-map.json').write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'finiteScopes':len(rows),'sourceOnly':True,'productChanges':0}))
