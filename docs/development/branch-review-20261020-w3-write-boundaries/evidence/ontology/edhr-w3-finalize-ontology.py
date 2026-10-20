from pathlib import Path
import hashlib
import importlib.util
import json
import subprocess
import yaml

ROOT=Path('/workspace/edhr-nexus-frontend')
SOURCE='cb2e9eef6cdb50077283c9707d257dcdd56a9e36'
APP='4ce4fefbf736a31cbd8e4779d6b9fb7e65a91fb2'
READ='84c5b6d6af15f4f9d684c99e8eb8d110ae039954'
TARGET='a8285be9b91fb76bcb27ccb16a5258bda1fb5077'
spec=importlib.util.spec_from_file_location('ledger',ROOT/'scripts/build-branch-review-ledger.py')
ledger=importlib.util.module_from_spec(spec);spec.loader.exec_module(ledger)
git=ledger.Git()
before=ledger.knowledge_records(git,READ)
after=ledger.knowledge_records(git,SOURCE)
sem_path=Path('/tmp/edhr-w3-tenant-transfer-semantic-review.jsonl')
semantic=[json.loads(line) for line in sem_path.read_text().splitlines()]
semantic_by_id={row['id']:row for row in semantic}
assert len(semantic)==len(semantic_by_id)==36

def sha(raw): return hashlib.sha256(raw).hexdigest()
def receipt(commit,path):
 raw=git.read(commit,path)
 return {'commit':commit,'path':path,'blob':git.tree(commit)[path]['blob'],'sha256':sha(raw)}
def local(path):
 p=Path(path)
 return {'path':str(p),'bytes':p.stat().st_size,'sha256':sha(p.read_bytes())}

source_receipts={}
for row in semantic:
 expected=after[row['id']]
 assert row['sourceCommit']==SOURCE
 assert all(row[k]==expected[k] for k in ['recordType','sourcePath','sourceLocator','recordSha256'])
 assert row['sourceBlob']==git.tree(SOURCE)[row['sourcePath']]['blob']
 assert row['sourceSha256']==sha(git.read(SOURCE,row['sourcePath']))
 for item in row['implementationEvidence']+row['testAssertionsRead']+[row['evidence']]:
  assert all(item[k]==v for k,v in receipt(item['commit'],item['path']).items())
  source_receipts[(item['commit'],item['path'])]=receipt(item['commit'],item['path'])
 assert row['wholeFileReviewComplete'] is False and row['wholeRecordSemanticPassClaimed'] is False
 assert row['businessRuntimeExecutedByOntologyInstance'] is False

governance=[]
for path in ['AGENTS.md','codeplzreadme.md','docs/agents/business-knowledge-modeler.md','docs/agents/agent-handoff-contract.md']:
 rows=[receipt(commit,path) for commit in [TARGET,READ,SOURCE]]
 assert len({r['blob'] for r in rows})==1
 governance.append({'path':path,'unchangedAcrossActualTargetReadSource':True,'receipts':rows})
assert git.commit('origin/edhr-dev')==TARGET
assert not git.command('diff','--name-only','SOURCE' if False else SOURCE,'--','docs/knowledge','docs/architecture').strip()
assert not git.command('ls-files','--others','--exclude-standard','--','docs/knowledge','docs/architecture').strip()
test=json.loads(Path('/tmp/edhr-w3-tenant-knowledge-final-summary.json').read_text())
assert test['sourceCommit']==SOURCE and test['exit']==0
assert test['totals']=={'tests':89,'failures':0,'errors':0,'skipped':0}
transition=json.loads(Path('/tmp/edhr-w3-tenant-knowledge-transition-summary.json').read_text())
assert transition['headCommit']==SOURCE and transition['uncommittedKnowledgePaths']==[]
assert not transition['removedIds'] and not transition['existingMaturityChanges'] and not transition['existingVisibilityChanges']

proof={'schema':'edhr-finite-ontology-receipt-check/v1','outcome':'passed','sourceCommit':SOURCE,
       'implementationCommit':APP,'targetBranch':'edhr-dev','targetCommit':TARGET,
       'actualContractReadCommit':READ,'uncommittedContractPaths':[],
       'finiteSemanticRecordsVerified':36,'governanceComparison':governance,
       'knowledgeDefinitionsBefore':len(before),'knowledgeDefinitionsAfter':len(after),
       'wholeAssetSemanticAcceptance':False,'businessRuntimeExecutedByOntologyInstance':False,
       'knowledgeWorkingTreeMatchesFixedCommit':True,
       'originalConfirmationsUnchanged':transition['originalConfirmationFilesUnchanged'],
       'note':'Each finite record/path/blob/SHA was checked against real Git objects; this is source/knowledge receipt validation, not business runtime acceptance.'}
proof_path=Path('/tmp/edhr-w3-tenant-transfer-source-receipt-check.json')
proof_path.write_text(json.dumps(proof,ensure_ascii=False,indent=2)+'\n')

changed_ids=sorted(key for key in after if key not in before or before[key]['recordSha256']!=after[key]['recordSha256'])
changed_paths=git.command('diff','--name-only',READ,SOURCE,'--','docs/knowledge','docs/architecture').decode().splitlines()
artifacts=[{'path':path,'changeType':'update' if path in git.tree(READ) else 'create',
            'ids':[key for key in changed_ids if after[key]['sourcePath']==path]} for path in changed_paths]
assert len(artifacts)==21
fallback={
 'DEC-0010':'仅同步H009实现差异和本轮证据；现行取消完成条件政策不变。',
 'DEC-0011':'仅同步H010顶层四旧键新写差异；其他条件/runtime未覆盖。',
 'DEC-0031':'现行解释增加显式委托例外并关闭本轮来源覆盖缺陷；单逻辑任务和创建来源保留不变。',
 'DEC-0055':'现行目标边界局部替代，保留原因/数据/节点/结果/审计/历史纠偏。',
 'DEC-0081':'本轮新用户确认的两路径租户内委托；specified/internal，精确替代DEC0031-03和DEC0055-02，DHR保持。',
 'scenario.form-approval-transfer-current-task':'目标可来自原候选集合外；仅当前目标继续，原候选来源保留。',
 'scenario.workflow-task-any-candidate-completes':'明确任一原候选处理适用于未显式委托任务。',
 'scenario.workflow-task-non-candidate-blocked':'明确合法显式委托受让人和原开放任务例外，其他非候选阻断。',
 'evidence.form-approval-transfer-user-confirmed':'仅证据索引说明历史确认的目标限制与本轮新政策区分；原始MD字节不改。'}
sync=[]
for key in changed_ids:
 row=semantic_by_id.get(key)
 scope=row['reviewedScope'] if row else fallback.get(key)
 assert scope,key
 sync.append({'id':key,'disposition':'retained' if key=='question.multi-tenant-workflow-isolation' else 'updated',
              'scope':scope,'sourceReferences':[after[key]['sourcePath'],
                 'docs/knowledge/evidence/work-template-write-shape-audit-2026-10-20.md' if 'production-work-' in key or key in ['DEC-0010','DEC-0011'] else 'docs/knowledge/evidence/tenant-task-delegation-2026-10-20.md']})
sync.extend([
 {'id':'DEC-0031-01','disposition':'retained','scope':'单逻辑任务规范保留，不按候选人数创建多条任务。','sourceReferences':['docs/knowledge/decisions/DEC-0031-workflow-task-multi-candidate-runtime.yaml']},
 {'id':'DEC-0055-01','disposition':'retained','scope':'普通审批节点按钮显示/样式/签名边界保留；未扩展记录控制运行时。','sourceReferences':['docs/knowledge/decisions/DEC-0055-form-approval-transfer.yaml']},
 {'id':'DEC-0055-03','disposition':'retained','scope':'转办目标/原因必填且不推进节点、不改表单值或产生审批结果。','sourceReferences':['docs/knowledge/decisions/DEC-0055-form-approval-transfer.yaml']},
 {'id':'DEC-0055-04','disposition':'retained','scope':'原生产执行事务、结构化历史、不可变审计及待办投影保留。','sourceReferences':['docs/knowledge/decisions/DEC-0055-form-approval-transfer.yaml']},
 {'id':'DEC-0055-05','disposition':'retained','scope':'早期共同遗漏的真实时间线纠偏保留，与本轮新目标范围政策区分。','sourceReferences':['docs/knowledge/decisions/DEC-0055-form-approval-transfer.yaml']},
 {'id':'evidence.workflow-task-multi-candidate-user-confirmed','disposition':'historical','scope':'原始用户确认MD字节不改，不回填为早已同意本轮委托例外。','sourceReferences':['docs/knowledge/evidence/workflow-task-multi-candidate-user-confirmed.md']}
])
result={'ontologyResult':{
 'result':'updated','baselineBefore':'0.3.25','baselineAfter':'0.3.25',
 'contractBaseline':{'sourceCommit':SOURCE,'targetBranch':'edhr-dev','targetCommit':TARGET,'contractReadCommit':READ,'uncommittedContractPaths':[]},
 'reason':'本轮新用户确认以DEC0081作声明级局部替代，当前词典/规则/事实/来源/锚点及阅读说明已同步；H009/H010及H012只按固定源码与有限证据更新。原始确认和历史已丢来源边界保留。仅36条有限语义，不宣称整体W3/全库或业务运行通过。',
 'changedArtifacts':artifacts,'knowledgeSync':sync,'conflicts':[],'questions':[],
 'validationEvidence':[
  {'id':'validation.w3-tenant-knowledge-formal','checkType':'schema','command':test['command'],'outcome':'passed',
   'evidence':['/tmp/edhr-w3-tenant-knowledge-final-summary.json','固定cb2e9eef6cdb50077283c9707d257dcdd56a9e36实际89/89；0fail/0error/0skip；不归为业务运行。']},
  {'id':'validation.w3-tenant-knowledge-transition','checkType':'status-transition','command':'python /tmp/edhr-w3-tenant-knowledge-transition.py','outcome':'passed',
   'evidence':['/tmp/edhr-w3-tenant-knowledge-transition-summary.json','2535→2546，新增11；无ID删除、既有成熟度/可见性晋升，三项implementationDiscrepancy有限resolved不等于知识阶段升级。']},
  {'id':'validation.w3-tenant-finite-source-receipts','checkType':'evidence-path','command':'python /tmp/edhr-w3-finalize-ontology.py','outcome':'passed',
   'evidence':[str(proof_path),str(sem_path),'36条真实ID、记录摘要与知识Git blob、实际实现提交源码及已读测试断言逐条核对；非文件存在即可语义通过。']}],
 'roadmapProgress':{'stage':'P0','status':'in-progress','exitCriteriaEvidence':[],'deferredStages':['P1','P2','P3']}}}
result_path=Path('/tmp/edhr-w3-tenant-transfer-ontology-result.yaml')
result_path.write_text(yaml.safe_dump(result,allow_unicode=True,sort_keys=False,width=130))

package_path=ROOT/'docs/development/branch-review-20261020-w3-write-boundaries/decision-package.yaml'
package=yaml.safe_load(package_path.read_text())['decisionPackage']
assert package['userConfirmedIncrement']['exactReply']=='通用工作流与普通生产表单都允许租户内委托；DHR 保持'
replacement=package['replacementScopes']
assert replacement[0]['decisionStatementId']=='DEC-0081-01'
assert set(replacement[0]['supersededStatementIds'])=={'DEC-0031-03','DEC-0055-02'}
safe_paths=[str(result_path),str(sem_path),str(proof_path),
 '/tmp/edhr-w3-tenant-transfer-semantic-summary.json',
 '/tmp/edhr-w3-tenant-knowledge-final-summary.json',
 '/tmp/edhr-w3-tenant-knowledge-transition-summary.json',
 '/tmp/edhr-w3-transfer-knowledge-index.json',
 '/tmp/edhr-w3-transfer-knowledge-index.md',
 '/tmp/edhr-w3-tenant-transfer-wording-check.json',
 '/tmp/edhr-w3-build-tenant-semantic.py','/tmp/edhr-w3-tenant-knowledge-transition.py',
 '/tmp/edhr-w3-finalize-ontology.py']
manifest={'schema':'edhr-safe-ontology-original-manifest/v1','role':'formal business knowledge ontology',
 'knowledgeCommit':SOURCE,'implementationCommit':APP,'targetCommit':TARGET,'contractReadCommit':READ,
 'knowledgeVersion':'0.3.25','schemaVersion':'1.2.0','changedFileCount':21,
 'knowledgeInventoryBefore':len(before),'knowledgeInventoryAfter':len(after),'finiteSemanticCount':36,
 'businessRuntimeExecutedByOntologyInstance':False,'wholeAssetSemanticAcceptance':False,
 'ontologyTest':test['totals'],'replacementScopes':replacement,
 'originals':[local(path) for path in safe_paths],
 'changedKnowledgeFileReceipts':[receipt(SOURCE,a['path']) for a in artifacts],
 'sourceEvidenceReceipts':list(source_receipts.values()),
 'originalConfirmationReceipts':transition['originalConfirmationFilesUnchanged'],
 'decisionPackageRead':dict(local(package_path),sourceType='actual uncommitted handoff, no fabricated Git receipt'),
 'helperStatus':[{'task':'tenant_transfer_knowledge_index','status':'FINAL','scope':'readonly index and finite wording check, no business runtime/QA'}],
 'parentRuntimeInputs':[dict(local('/tmp/edhr-w3-final-primary-backend-summary.json'),executionOwner='primary implementation/testing, not ontology'),
                        dict(local('/tmp/edhr-w3-transfer-browser-summary.json'),executionOwner='browser implementation/testing, not independent QA')],
 'notIncluded':['raw Maven output','JWT/HTTP raw response logs','Surefire XML contents','environment/settings/credentials'],
 'limitations':['two old DHR high/four old knowledge gaps/A12 remain','W5 audit JSONB/time round-trip rehash probe remains separate; no algorithm or historic hash rewrite',
                'primary invalid intermediate compile attempt is not acceptance; fixed application bytes remain4ce','no independent qualityResult issued by ontology role']}
manifest_path=Path('/tmp/edhr-w3-tenant-transfer-ontology-safe-originals-manifest.json')
manifest_path.write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'result':'updated','sourceCommit':SOURCE,'changedArtifacts':len(artifacts),'knowledgeSync':len(sync),
                  'finiteSemanticRecords':36,'formalTests':test['totals'],
                  'resultReceipt':local(result_path),'manifestReceipt':local(manifest_path)},ensure_ascii=False))
