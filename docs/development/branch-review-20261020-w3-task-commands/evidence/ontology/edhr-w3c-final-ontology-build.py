from pathlib import Path
import hashlib,importlib.util,json,os,subprocess,xml.etree.ElementTree as ET
import yaml

repo=Path('/workspace/edhr-nexus-frontend');os.chdir(repo)
fixed='684db88a5a25168cc7df301b947fd7528285ad46'
target='e8ecc103c8e6825c61c61b39b9cbd12b1474700e'
prefix=Path('/tmp/edhr-w3c-final-ontology-')
def git(*args):return subprocess.check_output(['git',*args],stderr=subprocess.PIPE)
def digest(raw):return hashlib.sha256(raw).hexdigest()
def raw(path,ref=fixed):return git('show',ref+':'+path)
def receipt(path,scope,ref=fixed):
    value=raw(path,ref)
    return {'path':path,'commit':ref,'blob':git('rev-parse',ref+':'+path).decode().strip(),'sha256':digest(value),'reviewedScope':scope}
def save(name,data):
    path=Path(str(prefix)+name)
    path.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n');return path
contract={'sourceCommit':fixed,'targetBranch':'edhr-dev','targetCommit':target,'contractReadCommit':'fc0980035d717fd1790ac72c907f940390540c4d','uncommittedContractPaths':[]}
assert git('rev-parse','origin/edhr-dev').decode().strip()==target
assert not git('diff','--name-only',target,fixed,'--','AGENTS.md','codeplzreadme.md','docs/agents').strip()
generator='scripts/build-branch-review-ledger.py'
assert (repo/generator).read_bytes()==raw(generator)
spec=importlib.util.spec_from_file_location('w3c_ontology_receipts',repo/generator)
module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module)
fixedgit=module.Git()
records=module.knowledge_records(fixedgit,fixed)
before=module.knowledge_records(fixedgit,target)
new=set(records)-set(before)
assert new=={'evidence.workflow-instance-administrative-write-authorization','evidence.workflow-instance-administrative-write-authorization-test'}
assert all(records[k]['recordSha256']==before[k]['recordSha256'] for k in before)
assert len(before)==2546 and len(records)==2548
control='gmp-platform/backend/src/main/java/com/zencas/edhr/workflow/controller/WorkflowInstanceController.java'
task='gmp-platform/backend/src/main/java/com/zencas/edhr/workflow/controller/WorkflowTaskController.java'
engine='gmp-platform/backend/src/main/java/com/zencas/edhr/workflow/engine/WorkflowEngine.java'
test='gmp-platform/backend/src/test/java/com/zencas/edhr/workflow/controller/WorkflowInstanceAuthorizationIntegrationTest.java'
security='gmp-platform/backend/src/main/java/com/zencas/edhr/common/config/SecurityConfig.java'
seed='gmp-platform/backend/src/main/resources/db/changelog/0002-seed-data.sql'
note='docs/knowledge/evidence/workflow-instance-write-authorization-2026-10-21.md'
codeEvidence=[receipt(control,'create/update/delete:61-84; terminate:135-145; permission annotations only'),receipt(task,'administrative create/update/delete:58-81'),receipt(security,'EnableMethodSecurity and anyRequest authenticated:26-61'),receipt(seed,'existing workflow.intervene permission:52')]
testEvidence=[receipt(test,'all22 declared cases, real JWT/method-security/JPA fixture and database boundary; source assertions read only, no business test run by ontology')]
rows=[]
scopes={
 'evidence.workflow-instance-administrative-write-authorization':'实现证据只登记三HTTP管理入口复用已有权限的技术纠漏；不把inferred工程选择变成新用户政策，不认证管理员裸CRUD内容治理。',
 'evidence.workflow-instance-administrative-write-authorization-test':'只核对22测试源码的实际过滤链/方法安全/持久化和正反对照描述；原生PG与默认H2分开，主侧报告不替代独立验收。',
 'DEC-0031-03':'保留未委托候选范围与DEC-0081当前受让人例外；本次三管理入口注解未给正常候选完成另加全局干预权限。',
 'DEC-0033-02':'仅核对开放审批的既有规范被本批边界保留，未扩大管理CRUD到普通认证用户，也未把管理权限前移到开放任务处理。',
 'DEC-0081-04':'只核对DHR通用防绕过及记录控制/管理员重新分配/完整隔离不在本次实现范围，未声称整个转办和签署链复验通过。',
 'question.multi-tenant-workflow-isolation':'保留非MVP完整隔离未决；既有workflow.intervene授权不被宣传为全域多租户隔离已完成。',
}
for key,scope in scopes.items():
    r=records[key]
    path=r['sourcePath']
    rows.append({**r,'sourceCommit':fixed,'sourceBlob':git('rev-parse',fixed+':'+path).decode().strip(),'sourceSha256':digest(raw(path)),
     'originalMaturity':r.get('assetStatus'),'knowledgeBaselineVersion':'0.3.25','schemaVersion':'1.2.0','contractBaseline':contract,
     'auditScopeClassification':'current-effective-scoped-review','reviewStatus':'reviewed','conclusion':'consistent','reviewedScope':scope,
     'evidence':receipt(note,'finite engineering correction and retained boundaries; not a whole-policy review'),
     'decisionEvidence':[receipt(r['sourcePath'],'exact ID '+key+' at '+r['sourceLocator'])],
     'implementationEvidence':codeEvidence+([receipt(engine,'completeTask:244-300, isUnrestrictedSnapshot:579-586, assertNotDhrInstance:779-785; unchanged from target')] if key not in new else []),
     'testAssertionsRead':testEvidence,'newUserPolicy':False,'wholeFileReviewComplete':False,'wholeRecordSemanticPassClaimed':False,
     'businessRuntimeExecutedByOntologyInstance':False,'validationExecutedByOntologyInstance':'formal knowledge model only; see validation summary',
     'limitations':['Only6 finite ID scopes; not complete current knowledge/whole workflow/whole branch acceptance.','Prior4 evidence gaps,2 deferred DHR high,A12,record-control and W5 runtime leads are retained.','No maturity/version/stage upgrade; no Actions; no production or historical data mutation.']})
sem=Path(str(prefix)+'semantic-review.jsonl')
sem.write_text(''.join(json.dumps(r,ensure_ascii=False,sort_keys=True)+'\n' for r in rows))
schema=yaml.safe_load(raw('docs/knowledge/schema.yaml'))
documents=list((repo/'docs/knowledge').rglob('*.yaml'))
assert schema['knowledgeModelVersion']=='0.3.25' and schema['schemaVersion']=='1.2.0'
for path in documents:
    assert path.read_bytes()==raw(str(path.relative_to(repo)))
    assert yaml.safe_load(path.read_bytes())['knowledgeModelVersion']=='0.3.25'
report=repo/'tools/knowledge-model/target/surefire-reports/TEST-com.zencas.edhr.knowledge.BusinessKnowledgeModelTest.xml'
root=ET.parse(report).getroot()
counts={k:int(root.attrib[k]) for k in ['tests','failures','errors','skipped']}
assert counts=={'tests':89,'failures':0,'errors':0,'skipped':0}
validation=save('validation.json',{'sourceCommit':fixed,'targetCommit':target,'contractBaseline':contract,'knowledgeModelVersion':'0.3.25','schemaVersion':'1.2.0',
 'formalCommand':'bash /workspace/.edhr-cloud-tools/mvn-edhr -C -f tools/knowledge-model/pom.xml clean test','commandExit':0,'suite':root.attrib['name'],'counts':counts,
 'xmlSha256':digest(report.read_bytes()),'rawLogAndXmlExcluded':True,'yamlDocumentsParsed':len(documents),'allCurrentKnowledgeFilesEqualFixedCommit':True,
 'inventoryOnly':{'priorKnowledgeIds':2546,'currentKnowledgeIds':2548,'addedEvidenceIds':sorted(new),'changedExistingRecords':0,'notSemanticCoverage':True},
 'semanticReviews':{'actualFiniteIdCount':len(rows),'conclusions':{'consistent':len(rows)},'scope':'new2 evidence IDs and retained4 adjacent exact declarations/question; not whole records/files'},
 'workingTreeQualification':'Parent development ledger edits/untracked artifacts excluded; all knowledge and product bytes fixed. No working-tree Git commit is invented.'})
sync=[{'id':key,'disposition':'updated' if key in new else 'retained','scope':scope,'sourceReferences':[records[key]['sourcePath'],note]} for key,scope in scopes.items()]
result={'ontologyResult':{'result':'updated','baselineBefore':'0.3.25','baselineAfter':'0.3.25','contractBaseline':contract,
 'reason':'Only two implementation evidence IDs and precise human-readable engineering boundary/nav were added. Existing normative records are byte-equivalent; inferred permission omission correction is not promoted to new user policy. No unnecessary anchor to a different concept was created.',
 'changedArtifacts':[{'path':'docs/knowledge/evidence/workflow-instance-write-authorization.yaml','changeType':'create','ids':sorted(new)},
                     {'path':note,'changeType':'create','ids':[]},{'path':'docs/knowledge/README.md','changeType':'update','ids':[]}],
 'knowledgeSync':sync,'conflicts':[],'questions':[],
 'validationEvidence':[{'id':'validation.w3c-formal-knowledge89','checkType':'schema','command':'bash /workspace/.edhr-cloud-tools/mvn-edhr -C -f tools/knowledge-model/pom.xml clean test','outcome':'passed','evidence':[str(validation),f'89 passed,0 failures,0 errors,0 skipped; fixed {fixed}']},
 {'id':'validation.w3c-fixed-id-and-source-receipts','checkType':'evidence-path','command':'python3 /tmp/edhr-w3c-final-ontology-build.py','outcome':'passed','evidence':[str(sem),'Actual6 finite IDs with exact recordSha256/sourceCommit/blob/source receipts; current knowledge files equal fixed Git bytes. Existing2546 records unchanged; only2 evidence IDs added.']}],
 'roadmapProgress':{'stage':'P0','status':'in-progress','exitCriteriaEvidence':[],'deferredStages':['P1','P2','P3']}}}
out=Path(str(prefix)+'result.yaml');out.write_text(yaml.safe_dump(result,sort_keys=False,allow_unicode=True))
save('read-receipts.json',{'contractBaseline':contract,'readPaths':[receipt(p,'mandatory role/context read') for p in ['AGENTS.md','docs/agents/business-knowledge-modeler.md','docs/agents/agent-handoff-contract.md','docs/architecture/business-knowledge-model.md','docs/knowledge/README.md','docs/knowledge/open-questions.yaml']],
 'selectedDomainSources':[receipt(p,'finite related definitions/source assertions') for p in ['docs/knowledge/decisions/DEC-0031-workflow-task-multi-candidate-runtime.yaml','docs/knowledge/decisions/DEC-0033-form-process-optional-subjects-and-open-operation-scope.yaml','docs/knowledge/decisions/DEC-0081-tenant-scoped-task-delegation.yaml','docs/knowledge/rules/identity.yaml','docs/knowledge/evidence/identity-subject-selector.yaml','docs/knowledge/evidence/workflow-task-multi-candidate-user-confirmed.md','docs/knowledge/evidence/tenant-task-delegation-2026-10-20.md']],
 'formalBusinessTestsRun':False,'childrenDispatched':[],'allChildrenFinal':True})
outputs=[Path(str(prefix)+s) for s in ['build.py','semantic-review.jsonl','validation.json','result.yaml','read-receipts.json']]
manifest=save('manifest.json',{'sourceCommit':fixed,'role':'business-knowledge-modeler','result':'updated','allChildrenFinal':True,'files':[{'path':str(p),'bytes':p.stat().st_size,'sha256':digest(p.read_bytes())} for p in outputs],'excluded':['raw Maven log','Surefire XML','tokens/env/settings']})
print(json.dumps({'result':'updated','fixedCommit':fixed,'knowledgeTests':counts,'semanticReviews':len(rows),'manifest':str(manifest)},ensure_ascii=False))
