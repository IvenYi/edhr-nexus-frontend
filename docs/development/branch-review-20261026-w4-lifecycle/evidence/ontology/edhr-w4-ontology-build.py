import hashlib, json, subprocess, xml.etree.ElementTree as ET
from pathlib import Path
import yaml

root = Path('/workspace/edhr-nexus-frontend')
base = 'c49c0c7f98ca5c66eb59eb6876c78af03a07d28b'
source = '3281863b0974dc1e4e7b4c343ca9d42a7a4103ac'
def git(*args):
    return subprocess.check_output(['git', '-C', str(root), *args], text=True).strip()
def digest(data): return hashlib.sha256(data).hexdigest()
def record_by_id(value, identifier):
    if isinstance(value, dict):
        if value.get('id') == identifier: return value
        for child in value.values():
            found = record_by_id(child, identifier)
            if found is not None: return found
    if isinstance(value, list):
        for child in value:
            found = record_by_id(child, identifier)
            if found is not None: return found
    return None
def provenance(path):
    data=(root/path).read_bytes()
    return {'path':path, 'gitCommit':source, 'gitBlobAtCommit':git('rev-parse', source+':'+path), 'workingTreeSha256':digest(data), 'matchesCommit':data==subprocess.check_output(['git','-C',str(root),'show',source+':'+path])}

dec19='docs/knowledge/decisions/DEC-0019-production-batch-management-list-and-row-audit.yaml'
prod='docs/knowledge/rules/production.yaml'
dec2='docs/knowledge/decisions/DEC-0002-product-family-process-modeling.yaml'
rules2='docs/knowledge/rules/product-process.yaml'
dec12='docs/knowledge/decisions/DEC-0012-production-work-order-and-production-object.yaml'
dec62='docs/knowledge/decisions/DEC-0062-dhr-instance-management-phase1.yaml'
service='gmp-platform/backend/src/main/java/com/zencas/edhr/production/service/ProductionExecutionService.java'
production='gmp-platform/backend/src/main/java/com/zencas/edhr/production/service/ProductionService.java'
snapshot='gmp-platform/backend/src/main/java/com/zencas/edhr/production/service/ExecutionSnapshotBuilder.java'
resolution='gmp-platform/backend/src/main/java/com/zencas/edhr/masterdata/service/ProductProcessResolutionService.java'
controller='gmp-platform/backend/src/main/java/com/zencas/edhr/production/controller/ProductionObjectController.java'
test='gmp-platform/backend/src/test/java/com/zencas/edhr/production/controller/ProductionExecutionIntegrationTest.java'
audit='gmp-platform/backend/src/main/java/com/zencas/edhr/compliance/controller/AuditController.java'
records=[]
def add(identifier, path, kind, conclusion, scope, evidence):
    obj=record_by_id(yaml.safe_load((root/path).read_text()),identifier)
    assert obj is not None, identifier
    records.append({'id':identifier,'recordType':kind,**provenance(path),'sourceLocator':identifier,'originalMaturity':obj.get('status','not-applicable'),'reviewStatus':'reviewed','conclusion':conclusion,'scope':scope,'evidenceReferences':evidence,'recordSha256':digest(json.dumps(obj,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode()),'runtimeExecutedByOntology':False})
add('DEC-0019-02',dec19,'decision-statement','consistent','仅核对PRODUCTION_OBJECT查询身份及新增/修改动作；新状态事件使用既有查询，不认证整页视觉交互。',[audit,controller,service])
add('DEC-0019-04',dec19,'decision-statement','consistent','对象生命周期UPDATE只记录真实字段变化；act当前对象仅status变化，创建/批量创建原控制器语义保留。',[controller,production,service,test])
add('rule.production.batch-management-row-detail-and-audit-entry',prod,'rule','consistent','现行解释同步执行服务状态事件及控制器创建/取消/提前结束职责，PRODUCTION_OBJECT读取协议保持。',[controller,service,audit])
add('rule.production.production-object-audit-change-snapshot',prod,'rule','consistent','状态差异写入与执行事件并存；同事务、无变化无对象事件、不回填；规则AST未改。',[service,test])
add('discrepancy.production-object-execution-lifecycle-audit-projection',dec19,'implementation-discrepancy','consistent','仅关闭H007的缺失对象状态事件；根侧6红/6绿和119通过/2原夹具跳过是主侧证据，独立质量另记。',[service,test,'docs/development/branch-review-20261026-w4-lifecycle/evidence/primary-red.json','docs/development/branch-review-20261026-w4-lifecycle/evidence/primary-focused-green.json','docs/development/branch-review-20261026-w4-lifecycle/evidence/primary-regression.json'])
add('execution.production-object-audit-snapshot','docs/knowledge/execution-contracts.yaml','execution-contract','consistent','保留历史verified/runtime的ProductionObjectController.writeAudit范围；未把新act补丁纳入该旧认证。',[controller,prod])
add('relation.production-batch-management-opens-row-audit','docs/knowledge/ontology.yaml','relationship','consistent','一对零或多审计事件及对象查询身份保持；新增真实状态事件不新增关系定义。',[audit,service])
add('concept.audit-change-snapshot','docs/knowledge/ontology.yaml','concept','consistent','业务前后值证据概念保持，不将完整执行JSON混进对象变化字段。',[controller,service])
add('DEC-0002-10',dec2,'decision-statement','needs-fix','已存在对象不因成员转移重算身份是明确规范；当前未开工对象首次START仍读当前成员关系。本轮只核对未修复，不用后来的START冻结覆盖旧身份保护。',[production,snapshot,dec62])
add('rule.product-family.member-transfer-future-only',rules2,'rule','needs-fix','保留existingProductionObjectsUnchanged；创建时未存独立产品簇身份，跨时点实现差异仍开放。',[production,snapshot])
add('rule.product-process.freeze-batch-execution-snapshot',rules2,'rule','needs-fix','配置在START冻结与创建对象身份保护须区分；不推断已有独立productFamilyId，也不提前整体配置冻结或补造历史。',[production,snapshot,service])
add('DEC-0012-02',dec12,'decision-statement','needs-fix','仅复核CREATED/IN_PROCESS旧工单在余量内继续拆分并沿用锁定制程；当前成员转移可使锁定版归属校验拒绝，其他状态分支非本轮语义覆盖。',[production,resolution])
add('DEC-0012-04',dec12,'decision-statement','needs-fix','首次拆分锁定后不得更换版本；findVersionForProduct重查当前簇关系可阻断旧锁定工单。转移后新对象身份与旧制程组合需方案显式说明，不反推制程owner就是对象独立成员身份。',[production,resolution,dec2])
add('DEC-0062-01',dec62,'decision-statement','consistent','仅核对首次合法START同事务创建DHR与生产启动的调用位置；新增审计不提前创建DHR。',[service,production])
add('DEC-0062-03',dec62,'decision-statement','consistent','仅核对DHR创建时冻结契约没有声明替代既有对象的产品簇身份保护；本轮不重验完整DHR快照。',[service,snapshot,dec2])

source_specs=[
 (service,'act: previousObjectStatus capture, lifecycle transitions, saveAndFlush, auditObjectStatusChange, PRODUCTION_EXECUTION save','状态变化及事件事务边界'),
 (service,'auditObjectStatusChange','完整新方法：差异、租户/对象/真实操作者、reason及时间'),
 (production,'split / requireProcessVersion / processOptions / startObject / completeObject','创建引用、锁定版本校验及状态服务返回；非整个服务'),
 (snapshot,'build: current product_family_member read and rules matching','当前成员身份与作业匹配范围'),
 (resolution,'findVersionForProduct','所选版本产品/当前产品簇归属判断；非resolve全场景'),
 (controller,'split / splitBatch / start / complete / writeChangedAudit / writeAudit','对象创建、旁路阻断及差异审计写入职责'),
 (audit,'list / resolveProjectedAction / resolveActionLabel','对象实体筛选及CREATE/UPDATE投影；同时观察全量读取风险但不据源码冒称性能实测'),
 (test,'lifecycleAudit* / assertObjectStatusAudits / batchCustomFormSurvivesOperationCompletionAndGatesOnlyBatch','测试源及主侧安全摘要核对；本体不执行业务测试'),
 ('gmp-platform/backend/src/main/java/com/zencas/edhr/masterdata/service/ProductFamilyMembershipService.java','transferMember','成员删除/新建/三方审计；未验证并发与数据库执行'),
]
source_records=[{**provenance(p),'sourceLocator':loc,'scope':scope,'wholeFileCompleted':False,'runtimeExecutedByOntology':False} for p,loc,scope in source_specs]
xml=root/'tools/knowledge-model/target/surefire-reports/TEST-com.zencas.edhr.knowledge.BusinessKnowledgeModelTest.xml'
suite=ET.parse(xml).getroot()
validation={'command':'bash /workspace/.edhr-cloud-tools/mvn-edhr -q -f tools/knowledge-model/pom.xml test','exitCode':0,'counts':{k:int(suite.attrib[k]) for k in ['tests','failures','errors','skipped']},'rawXmlSha256':digest(xml.read_bytes()),'attempts':[{'command':'/workspace/.edhr-cloud-tools/mvn-edhr -q -f tools/knowledge-model/pom.xml test','exitCode':126,'result':'wrapper lacks executable bit; no tests executed; preserved private log'},{'command':'bash /workspace/.edhr-cloud-tools/mvn-edhr -q -f tools/knowledge-model/pom.xml test','exitCode':0,'result':'89 passed, 0 failures/errors/skips; no wrapper edit'}]}
review={'role':'business-knowledge-modeler','status':'FINAL','baseCommit':base,'sourceCommit':source,'knowledgeBaselineVersion':'0.3.25','records':records,'sourceReview':source_records,'knowledgeValidation':validation,'counts':{'finiteSemanticRecords':len(records),'finiteSourceScopes':len(source_records),'wholeFilesCertified':0,'businessTestsExecutedByOntology':0},'remaining':['H006保持needs-fix，旧对象不能补造历史簇身份；新对象与旧工单锁定制程组合在下一切片设计中显式说明','H008未纳入本轮重新裁定','TaskDetail、记录控制变更/作废与其依赖保持用户暂缓','完整分支/全知识/浏览器及性能容量认证未完成']}
Path('/tmp/edhr-w4-ontology-review.json').write_text(json.dumps(review,ensure_ascii=False,indent=2)+'\n')
changed=[dec19,'docs/knowledge/evidence/production.yaml',prod]
result={'ontologyResult':{'result':'updated','baselineBefore':'0.3.25','baselineAfter':'0.3.25','contractBaseline':{'sourceCommit':source,'targetBranch':'edhr-dev','targetCommit':base,'contractReadCommit':base,'uncommittedContractPaths':[]},'reason':'按DEC0019既有对象状态差异审计规范同步H007修复及有限证据，未改变业务政策、规则AST、概念/关系或知识成熟度；H006仅只读核对继续开放，不构成本次H007交付阻塞。','changedArtifacts':[{'path':p,'changeType':'update','ids':([ 'DEC-0019','discrepancy.production-object-execution-lifecycle-audit-projection','scenario.production-object-update-audit-diff'] if p==dec19 else ['evidence.production-object-execution-status-audit-source','evidence.production-object-execution-status-audit-tests'] if p.endswith('evidence/production.yaml') else ['rule.production.batch-management-row-detail-and-audit-entry','rule.production.production-object-audit-change-snapshot'])} for p in changed],'knowledgeSync':[{'id':i,'disposition':disp,'scope':scope,'sourceReferences':refs} for i,disp,scope,refs in [
 ('DEC-0019-04','retained','对象UPDATE只记实际变化字段，未新增政策',[dec19]),
 ('discrepancy.production-object-execution-lifecycle-audit-projection','updated','新对象状态事件由act同事务补齐，旧执行事件保留；历史事件不补造',[service,test]),
 ('rule.production.batch-management-row-detail-and-audit-entry','updated','解释控制器与执行服务各自事件写入职责，查询身份保持',[prod,audit]),
 ('rule.production.production-object-audit-change-snapshot','updated','精确说明status比较、非命令名判定及旧verified契约范围',[prod,service]),
 ('execution.production-object-audit-snapshot','retained','旧verified/runtime只保留controller handler范围，不扩认证到新服务',[ 'docs/knowledge/execution-contracts.yaml']),
 ('discrepancy.product-family-transfer-unstarted-object-context','retained','两个跨时点实现差异仍开放；本轮未修复，创建时身份与START配置冻结不混同',[dec2,dec12,dec62])]],'conflicts':[],'questions':[],'validationEvidence':[{'id':'w4.knowledge-schema-reference','checkType':'schema','command':validation['command'],'outcome':'passed','evidence':['BusinessKnowledgeModelTest: 89 tests, 0 failures/errors/skips',validation['rawXmlSha256']]},{'id':'w4.finite-semantic-review','checkType':'evidence-path','command':'源码、决策、规则、执行契约和主侧安全摘要人工核对','outcome':'passed','evidence':['/tmp/edhr-w4-ontology-review.json','15有限语义范围，9源码范围，0全文件完成；H006五条范围needs-fix不是一致通过']},{'id':'w4.knowledge-diff','checkType':'projection','command':'git diff --check; git diff -- docs/knowledge','outcome':'passed','evidence':['仅3知识文件解释/证据变更；未改规则AST、概念、关系、execution handler或任何status/visibility成熟度（实现差异open→resolved除外）']}],'roadmapProgress':{'stage':'P0','status':'in-progress','exitCriteriaEvidence':[],'deferredStages':['P1','P2','P3']},'workingTreeState':{'status':'dirty','includedPaths':[provenance(p) for p in changed],'excludedPaths':['root-owned docs/development/branch-review-20261026-w4-lifecycle/']},'completionState':'FINAL'}}
Path('/tmp/edhr-w4-ontology-result.yaml').write_text(yaml.safe_dump(result,allow_unicode=True,sort_keys=False))
print(json.dumps({'result':'updated','semanticRecords':len(records),'sourceScopes':len(source_records),'knowledgeTests':validation['counts'],'resultSha256':digest(Path('/tmp/edhr-w4-ontology-result.yaml').read_bytes()),'reviewSha256':digest(Path('/tmp/edhr-w4-ontology-review.json').read_bytes())},ensure_ascii=False))
