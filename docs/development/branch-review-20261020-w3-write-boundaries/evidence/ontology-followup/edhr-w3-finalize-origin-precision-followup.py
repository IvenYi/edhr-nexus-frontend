"""Emit NEW finite followup originals; never rewrite first-round ontology/semantic artifacts."""
from pathlib import Path
import hashlib
import importlib.util
import json
import subprocess
import sys
import yaml

ROOT=Path('/workspace/edhr-nexus-frontend')
BASE='266a1635cc95870cd7907c574eb676db7f560d4f'
APP='4ce4fefbf736a31cbd8e4779d6b9fb7e65a91fb2'
TARGET='a8285be9b91fb76bcb27ccb16a5258bda1fb5077'
READ='84c5b6d6af15f4f9d684c99e8eb8d110ae039954'
spec=importlib.util.spec_from_file_location('ledger',ROOT/'scripts/build-branch-review-ledger.py')
ledger=importlib.util.module_from_spec(spec);spec.loader.exec_module(ledger)
git=ledger.Git();SOURCE=git.commit(sys.argv[1])
scope=json.loads(Path('/tmp/edhr-w3-tenant-origin-precision-followup-scope.json').read_text())
before=ledger.knowledge_records(git,BASE);after=ledger.knowledge_records(git,SOURCE)
def sha(raw):return hashlib.sha256(raw).hexdigest()
def receipt(commit,path):
 return {'commit':commit,'path':path,'blob':git.tree(commit)[path]['blob'],'sha256':sha(git.read(commit,path))}
def local(path):
 p=Path(path);return {'path':str(p),'bytes':p.stat().st_size,'sha256':sha(p.read_bytes())}
assert before.keys()==after.keys() and len(after)==2546
changed=sorted(k for k in after if after[k]['recordSha256']!=before[k]['recordSha256'])
assert set(changed)==set(scope['changedIds']),changed
assert not [(k,before[k].get('assetStatus'),after[k].get('assetStatus')) for k in after if before[k].get('assetStatus')!=after[k].get('assetStatus')]
assert not [k for k in after if before[k]['visibility']!=after[k]['visibility']]
paths=git.command('diff','--name-only',BASE,SOURCE,'--','docs/knowledge','docs/architecture').decode().splitlines()
assert set(paths)=={row['path'] for row in scope['proposedFiles']}
for row in scope['proposedFiles']:
 assert sha(git.read(SOURCE,row['path']))==row['proposedSha256'],row['path']
for row in scope['firstRoundOriginals']:
 assert sha(Path(row['path']).read_bytes())==row['sha256'],row['path']
for path in ['docs/knowledge/evidence/workflow-task-multi-candidate-user-confirmed.md','docs/knowledge/evidence/form-approval-transfer-user-confirmed.md']:
 assert git.read(BASE,path)==git.read(SOURCE,path)
assert not git.command('diff','--name-only',SOURCE,'--','docs/knowledge','docs/architecture').strip()
assert git.commit('origin/edhr-dev')==TARGET
contracts=[]
for path in ['AGENTS.md','codeplzreadme.md','docs/agents/business-knowledge-modeler.md','docs/agents/agent-handoff-contract.md']:
 r=[receipt(commit,path) for commit in [TARGET,READ,BASE,SOURCE]]
 assert len({x['blob'] for x in r})==1
 contracts.append({'path':path,'unchangedAcrossTargetReadAndFollowupBaselines':True,'receipts':r})
for row in scope['sourceEvidence']:
 assert git.read(BASE,row['path'])==git.read(SOURCE,row['path'])
 assert git.read(APP,row['path'])==git.read(SOURCE,row['path'])
test_path=Path('/tmp/edhr-w3-tenant-origin-precision-followup-knowledge-summary.json')
test=json.loads(test_path.read_text())
assert test['sourceCommit']==SOURCE and test['exit']==0
assert test['totals']=={'tests':89,'failures':0,'errors':0,'skipped':0}
code=[receipt(BASE,row['path']) for row in scope['sourceEvidence']]
test_paths=[
 'gmp-platform/backend/src/test/java/com/zencas/edhr/production/controller/ProductionExecutionIntegrationTest.java',
 'gmp-platform/backend/src/test/java/com/zencas/edhr/workflow/engine/WorkflowTransferPostgresTest.java']
tests=[dict(receipt(BASE,path),reviewedScope='仅已读断言：ordinary原approvers与snapshot在重复转办后保持；generic originSnapshot原文本保持。未由本体实例执行业务测试。') for path in test_paths]
doc='docs/knowledge/evidence/tenant-task-delegation-2026-10-20.md'
scopes={
 'DEC-0081':'只核对02及两项来源保留场景的路径精度修正；其他政策保持，不认证整份决策或整个工作流。',
 'DEC-0081-02':'记录纠错：generic既有解析原件包含userIds/sources/unresolved；ordinary只有到达时候选ID/restricted与冻结节点主体配置，不新增逐用户来源采集。',
 'scenario.tenant-transfer-target-outside-original-candidates':'集合外委托业务边界不变，来源保持改为DEC0081-02各自既有证据机制，不声称ordinary已有逐来源原件。',
 'scenario.tenant-transfer-repeated-origin-preserved':'重复转办分别核对generic首次原解析文本与ordinary冻结ID/限制标记/节点配置保持，不混用原件内容。',
 'evidence.tenant-task-delegation-20261020':'只核对本轮记录精度纠正段及两路径证据机制，用户原话与旧正式原件保留；不借纠错新增政策。',
 'DEC-0055-02':'必要邻接保留：ordinary同租户可用目标/自转禁止/原候选来源保持；该来源按其现有ID/限制标记/冻结配置理解。',
 'rule.form-approval-transfer':'必要邻接保留：original-frozen-candidates与单独current目标不变，不将结构性保留扩为新逐用户provenance采集。',
 'anchor.form-approval-transfer-runtime':'必要邻接保留：现有anchor已准确定位approvers/restricted/current责任及原事务；不声称新增ordinary解析原件。',
 'term.workflow-task-resolution-snapshot':'必要邻接保留：该术语仅对应generic工作流任务解析原件，不泛化为ordinary审批state已经具备相同内容。'}
assert set(scopes)==set(scope['changedIds']+scope['necessaryAdjacentIds'])
baseline={'sourceCommit':SOURCE,'targetBranch':'edhr-dev','targetCommit':TARGET,'contractReadCommit':READ,'uncommittedContractPaths':[]}
semantic=[]
for key,text in scopes.items():
 row=after[key];file=receipt(SOURCE,row['sourcePath'])
 semantic.append({'id':key,'recordType':row['recordType'],'sourcePath':row['sourcePath'],'sourceLocator':row['sourceLocator'],
  'sourceCommit':SOURCE,'sourceBlob':file['blob'],'sourceSha256':file['sha256'],'recordSha256':row['recordSha256'],
  'originalMaturity':before[key].get('assetStatus'),'visibility':row['visibility'],'reviewStatus':'reviewed','conclusion':'consistent',
  'reviewedScope':text,'followupClassification':'record-precision-correction','newUserPolicy':False,'businessCodeChanged':False,
  'auditScopeClassification':'current-effective-scoped-review','followupOf':scope['firstRoundOriginals'][1],
  'decisionEvidence':['docs/knowledge/decisions/DEC-0081-tenant-scoped-task-delegation.yaml:DEC-0081-02'],
  'implementationEvidence':code,'testAssertionsRead':tests,'evidence':receipt(SOURCE,doc),'contractBaseline':baseline,
  'knowledgeBaselineVersion':'0.3.25','schemaVersion':'1.2.0',
  'validationExecutedByOntologyInstance':'formal knowledge model: 89 passed / 0 failures / 0 errors / 0 skipped',
  'businessRuntimeExecutedByOntologyInstance':False,'wholeFileReviewComplete':False,'wholeRecordSemanticPassClaimed':False,
  'runtimeValidationBoundary':'只执行知识检查及源码/断言核对；原266候选QA与后续新候选独立QA各自签收，本体不执行业务修复/验收。',
  'limitations':['首轮36有限原件未改，不宣称新增ID或全知识重审','不增加ordinary逐用户来源采集或回填历史','DHR/记录控制/A12/W5及其余旧缺口保持原边界']})
sem_path=Path('/tmp/edhr-w3-tenant-origin-precision-followup-semantic-review.jsonl')
sem_path.write_text(''.join(json.dumps(row,ensure_ascii=False,sort_keys=True)+'\n' for row in semantic))
proof={'schema':'edhr-ontology-record-precision-followup-validation/v1','outcome':'passed','sourceCommit':SOURCE,
 'baselineCommit':BASE,'contractReadCommit':READ,'targetCommit':TARGET,'changedKnowledgeFiles':len(paths),
 'changedIds':changed,'necessaryAdjacentIds':scope['necessaryAdjacentIds'],'semanticRecordsVerified':len(semantic),
 'definitionsBefore':len(before),'definitionsAfter':len(after),'newIds':[],'removedIds':[],'maturityChanges':[],'visibilityChanges':[],
 'governanceComparison':contracts,'firstRoundOriginalsUnchanged':scope['firstRoundOriginals'],'originalUserConfirmationFilesUnchanged':True,
 'coreSourceUnchangedFrom4ceAnd266':True,'knowledgeWorkingTreeMatchesFixedCommit':True,'wholeAssetSemanticAcceptance':False,
 'businessRuntimeExecutedByOntologyInstance':False}
proof_path=Path('/tmp/edhr-w3-tenant-origin-precision-followup-validation.json')
proof_path.write_text(json.dumps(proof,ensure_ascii=False,indent=2)+'\n')
result={'ontologyResult':{'result':'updated','baselineBefore':'0.3.25','baselineAfter':'0.3.25','contractBaseline':baseline,
 'reason':'修正DEC0081-02把generic完整来源原件泛化到ordinary的知识记录精度；用户租户内委托和原候选来源保留规则不变。按两条既有机制同步5文件，仅5变动ID+4必要邻接，不新增采集/恢复历史/业务代码，不覆盖首轮正式原件。',
 'changedArtifacts':[{'path':path,'changeType':'update','ids':[key for key in changed if after[key]['sourcePath']==path]} for path in paths],
 'knowledgeSync':[{'id':key,'disposition':'updated' if key in changed else 'retained','scope':text,
  'sourceReferences':[after[key]['sourcePath'],doc]} for key,text in scopes.items()],
 'conflicts':[],'questions':[],
 'validationEvidence':[
  {'id':'validation.w3-origin-precision-followup-knowledge','checkType':'schema','command':test['command'],'outcome':'passed',
   'evidence':[str(test_path),'本体实例在新固定知识候选实际89/89，0fail/0error/0skip；不是业务运行验收。']},
  {'id':'validation.w3-origin-precision-followup-record-transition','checkType':'status-transition','command':'python /tmp/edhr-w3-finalize-origin-precision-followup.py '+SOURCE,'outcome':'passed',
   'evidence':[str(proof_path),'2546→2546，无新增/删除ID或既有成熟度/可见性变化，原始用户确认及首轮正式原件字节保持。']},
  {'id':'validation.w3-origin-precision-followup-source-receipts','checkType':'evidence-path','command':'python /tmp/edhr-w3-finalize-origin-precision-followup.py '+SOURCE,'outcome':'passed',
   'evidence':[str(proof_path),str(sem_path),'9条有限真实记录/path/blob/SHA，分别核对generic来源原件与ordinary ID/限制/冻结配置；不是全库或首轮36重审。']}],
 'roadmapProgress':{'stage':'P0','status':'in-progress','exitCriteriaEvidence':[],'deferredStages':['P1','P2','P3']}}}
result_path=Path('/tmp/edhr-w3-tenant-origin-precision-followup-ontology-result.yaml')
result_path.write_text(yaml.safe_dump(result,allow_unicode=True,sort_keys=False,width=130))
safe=[str(sem_path),str(proof_path),str(result_path),str(test_path),
 '/tmp/edhr-w3-tenant-origin-precision-followup-scope.json','/tmp/edhr-w3-tenant-origin-precision-followup.patch',
 '/tmp/edhr-w3-tenant-origin-precision-readonly-followup.json','/tmp/edhr-w3-prepare-origin-precision-followup.py',
 '/tmp/edhr-w3-finalize-origin-precision-followup.py']
manifest={'schema':'edhr-safe-ontology-origin-precision-followup-originals/v1','sourceCommit':SOURCE,'baselineCommit':BASE,'implementationBytesCommit':APP,
 'classification':'record-precision-correction','newUserPolicy':False,'businessCodeChanged':False,'knowledgeBaselineVersion':'0.3.25','schemaVersion':'1.2.0',
 'changedFileCount':len(paths),'changedIds':changed,'necessaryAdjacentIds':scope['necessaryAdjacentIds'],'finiteSemanticCount':len(semantic),
 'knowledgeTests':test['totals'],'firstRoundOriginalsUnchanged':scope['firstRoundOriginals'],
 'originals':[local(path) for path in safe],'changedKnowledgeFileReceipts':[receipt(SOURCE,path) for path in paths],
 'sourceEvidence':code,'helperStatus':[{'task':'tenant_transfer_knowledge_index','status':'FINAL','scope':'readonly finite precision check'}],
 'replacementDisposition':'仅纠正已有记录精度；DEC0081既有声明级政策替代范围不变，本次不新增替代决策。',
 'businessRuntimeExecutedByOntologyInstance':False,'wholeAssetSemanticAcceptance':False,
 'excluded':['raw Maven/Surefire XML/JWT logs','settings/environment/credentials','business-code fix or independent qualityResult']}
manifest_path=Path('/tmp/edhr-w3-tenant-origin-precision-followup-safe-originals-manifest.json')
manifest_path.write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'result':'updated','sourceCommit':SOURCE,'changedFiles':len(paths),'changedIds':len(changed),'finiteSemantic':len(semantic),
                  'formalKnowledgeTests':test['totals'],'resultReceipt':local(result_path),'manifestReceipt':local(manifest_path)},ensure_ascii=False))
