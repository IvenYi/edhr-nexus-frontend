"""Build finite ontology source receipts only after real implementation/knowledge commits exist."""
from pathlib import Path
import hashlib
import importlib.util
import json
import subprocess
import sys

ROOT = Path('/workspace/edhr-nexus-frontend')
sys.path.insert(0, str(ROOT / 'scripts'))
spec = importlib.util.spec_from_file_location('ledger', ROOT / 'scripts/build-branch-review-ledger.py')
ledger = importlib.util.module_from_spec(spec)
spec.loader.exec_module(ledger)
git = ledger.Git()
APP, KNOWLEDGE = (git.commit(value) for value in sys.argv[1:3])
TARGET = 'a8285be9b91fb76bcb27ccb16a5258bda1fb5077'
READ = '84c5b6d6af15f4f9d684c99e8eb8d110ae039954'
records = ledger.knowledge_records(git, KNOWLEDGE)
baseline = ledger.knowledge_records(git, READ)
PREFIX = 'gmp-platform/backend/src/'
MAIN = PREFIX + 'main/java/com/zencas/edhr/'
TEST = PREFIX + 'test/java/com/zencas/edhr/'

def receipt(commit, path):
    raw = git.read(commit, path)
    return {'commit': commit, 'path': path, 'blob': git.tree(commit)[path]['blob'],
            'sha256': hashlib.sha256(raw).hexdigest()}

groups = {
 'guard': {
  'files': [MAIN+'workflow/controller/WorkTemplateController.java'],
  'tests': [TEST+'workflow/controller/WorkTemplateWriteBoundaryTest.java', TEST+'workflow/controller/WorkTemplateWritePostgresTest.java'],
  'testScope': '已读取消字段presence/null逐键与各写入口拒绝、正常不完整草稿、历史源/引用/审计不变断言；执行属于主侧/正式QA。',
  'evidence': 'docs/knowledge/evidence/work-template-write-shape-audit-2026-10-20.md',
  'decisions': ['DEC-0010-02','DEC-0011-05']},
 'generic': {
  'files': [MAIN+'workflow/engine/WorkflowEngine.java', MAIN+'workflow/controller/WorkflowTaskController.java', MAIN+'identity/service/TenantTransferTargets.java', MAIN+'workflow/repository/WorkflowTaskRepository.java'],
  'tests': [TEST+'workflow/engine/WorkflowEngineTest.java', TEST+'workflow/engine/WorkflowTransferPostgresTest.java'],
  'testScope': '已读首次/重复来源原件、同租户集合外目标、当前目标独占待办/完成、负向零写、审计失败回滚、真实锁等待两并发断言及认证actor断言；执行属于主侧/正式QA。',
  'evidence': 'docs/knowledge/evidence/tenant-task-delegation-2026-10-20.md',
  'decisions': ['DEC-0031-02','DEC-0031-03','DEC-0031-04','DEC-0081-01','DEC-0081-02','DEC-0081-03']},
 'ordinary': {
  'files': [MAIN+'production/service/ExecutionAccess.java', MAIN+'production/service/ProductionExecutionEngine.java', MAIN+'production/service/ProductionExecutionService.java', MAIN+'production/service/FormWorklistService.java', MAIN+'identity/service/TenantTransferTargets.java'],
  'tests': [TEST+'production/service/ExecutionAccessTest.java', TEST+'production/controller/ProductionExecutionIntegrationTest.java'],
  'testScope': '已读共享人员搜索/执行资格和普通生产表单当前处理/集合外委托/重复委托/原来源、数据、节点、结果保持断言；执行属于主侧/正式QA。',
  'evidence': 'docs/knowledge/evidence/tenant-task-delegation-2026-10-20.md',
  'decisions': ['DEC-0055-02','DEC-0055-03','DEC-0055-04','DEC-0055-05','DEC-0081-01','DEC-0081-03']},
 'dhr': {
  'files': [MAIN+'production/service/DhrReviewService.java', MAIN+'workflow/engine/WorkflowEngine.java'],
  'tests': [TEST+'workflow/engine/WorkflowTransferPostgresTest.java'],
  'testScope': '已读通用DHR目标查询/转办/待办拒绝断言，专属DhrReviewService.buttons/action源码；不重审全部DHR能力或关闭旧high。',
  'evidence': 'docs/knowledge/evidence/tenant-task-delegation-2026-10-20.md',
  'decisions': ['DEC-0081-04']}}

selection = [
 ('DEC-0010-02','guard','已取消FORM.completionCondition只按新写presence拒绝；不前移草稿完整性。'),
 ('DEC-0011-05','guard','CONDITION四个顶层旧键新写拒绝；不概括defaultBranch额外键/全部AST/runtime。'),
 ('discrepancy.production-work-form-completion-condition-passthrough','guard','H009有限修复，保留历史源/不做清理。'),
 ('discrepancy.production-work-legacy-condition-save-publish-asymmetry','guard','H010所有既有新写入口有限修复，不关闭其他旧条件差异。'),
 ('evidence.work-template-write-shape-audit-20261020','guard','仅该MD的固定84c源码与主侧实际红绿证据归属。'),
 ('DEC-0031-02','generic','未委托任一候选，委托后当前目标独占，单任务终态失权保留。'),
 ('DEC-0031-03','generic','原候选规则增加显式租户内委托例外，非整份决策废弃。'),
 ('DEC-0031-04','generic','原候选解析/命中/未解析来源与当前办理集合分开，不随组织变更重算。'),
 ('DEC-0055-02','ordinary','仅替代原候选白名单；同租户正常可用、非本人及当前actor保护保留。'),
 ('DEC-0081-01','generic','本轮新用户确认两类路径租户内显式委托；不回填历史确认。'),
 ('DEC-0081-02','generic','首次可获得原件与当前受让人分离；重复委托不覆盖原件，不重建旧丢失来源。'),
 ('DEC-0081-03','ordinary','原因、身份、节点及时间留痕；普通表单原事务/历史/审计/待办和节点/值/结果边界。'),
 ('DEC-0081-04','dhr','DHR专属动作/防绕过保持；A12、管理员分配和全租户隔离不扩展。'),
 ('term.workflow-transfer-action','ordinary','当前规范覆盖两路径租户内委托，排除记录控制/DHR。'),
 ('term.workflow-task','generic','同一逻辑任务来源/当前责任分离，委托后仅目标处理。'),
 ('term.workflow-task-resolution-snapshot','generic','原创建来源证据不等同于当前办理资格。'),
 ('concept.workflow-task','generic','仅核对所链接任务术语及新增证据与当前资格的归属，不全概念审计。'),
 ('concept.workflow-task-resolution-snapshot','generic','仅核对所链接来源证据术语与当前资格的区分，不全概念审计。'),
 ('relation.workflow-task-has-resolution-snapshot','generic','任务保留原候选来源，关系方向/基数/成熟度不变。'),
 ('rule.workflow.task-creation-freezes-candidate-resolution','generic','冻结的是创建解析来源，委托后的当前资格另存；不新增候选解析器。'),
 ('rule.workflow.task-any-candidate-completes-and-closes-siblings','generic','contains-actor只读当前有效userIds；未委托原候选、委托后当前目标。'),
 ('rule.form-approval-transfer','ordinary','当前actor、可用同租户目标、原因和无节点/数据/结果推进；原来源不授予旧候选继续办理。'),
 ('rule.form-process.approval-any-candidate','ordinary','任一原候选处理只在显式委托前，转后仅当前目标；无其他表单流程全审。'),
 ('fact.catalog.task-candidatemembership','generic','当前有效办理集合归属任务概念，稳定alias不等同原创建来源成员。'),
 ('fact.form-approval-transfer.target-authorized','ordinary','稳定fact ID保留，alias改targetAuthorized；共享搜索/执行资格，不保留旧白名单语义。'),
 ('anchor.form-approval-transfer-runtime','ordinary','有限核对共享目标资格、transferAssignees、原approvers、原事务/历史/待办路径。'),
 ('question.multi-tenant-workflow-isolation','generic','仍open；局部委托目标租户检查不证明全租户数据隔离。'),
 ('discrepancy.workflow-transfer-overwrites-candidate-origin-snapshot','generic','仅关闭本轮来源覆盖缺陷；原文本首次可获得保留，历史已丢失来源不恢复。'),
 ('evidence.tenant-task-delegation-20261020','generic','本轮用户确认为新政策；历史原文保留，工程选择及测试执行者分列。'),
 ('evidence.workflow-task-multi-candidate-runtime-implementation','generic','区分a828来源覆盖事实和本轮来源保留实现，不替历史实现背书。'),
 ('evidence.form-approval-transfer-api','ordinary','当前目标搜索和命令共用同租户有效未锁定资格，当前actor服务端验证。'),
 ('evidence.form-approval-transfer-tests','ordinary','测试源码职责与主侧实际运行证据分开，旧候选限制断言已改新政策。'),
 ('scenario.tenant-transfer-target-outside-original-candidates','ordinary','集合外目标正向，两路径作用范围，不附带新增政策。'),
 ('scenario.tenant-transfer-target-rejected','generic','无权actor/跨租户/停用/锁定/自转/目标或原因缺失，命令拒绝不留部分变更。'),
 ('scenario.tenant-transfer-repeated-origin-preserved','generic','再次委托保持同一原件，仅新目标待办和完成；单逻辑任务。'),
 ('scenario.tenant-transfer-dhr-boundary-kept','dhr','只核对通用入口阻断及专属approve/return映射，不计为全DHR验收。')]

rows=[]
for key, group, scope in selection:
    record=records[key]
    details=groups[group]
    source=receipt(KNOWLEDGE,record['sourcePath'])
    original=baseline.get(key,record)
    rows.append({
      'id': key, 'recordType': record['recordType'], 'sourcePath': record['sourcePath'],
      'sourceLocator': record['sourceLocator'], 'recordSha256': record['recordSha256'],
      'sourceCommit': KNOWLEDGE, 'sourceBlob': source['blob'], 'sourceSha256': source['sha256'],
      'originalMaturity': original.get('assetStatus'), 'visibility': record['visibility'],
      'reviewStatus':'reviewed','conclusion':'consistent','reviewedScope':scope,
      'auditScopeClassification':'current-effective-scoped-review',
      'decisionEvidence': [records[d]['sourcePath']+':'+d for d in details['decisions']],
      'implementationEvidence':[receipt(APP,p) for p in details['files']],
      'testAssertionsRead':[dict(receipt(APP,p),reviewedScope=details['testScope']) for p in details['tests']],
      'evidence':receipt(KNOWLEDGE,details['evidence']),
      'businessRuntimeExecutedByOntologyInstance':False,
      'wholeFileReviewComplete':False,'wholeRecordSemanticPassClaimed':False,
      'knowledgeBaselineVersion':'0.3.25','schemaVersion':'1.2.0',
      'validationExecutedByOntologyInstance':'formal knowledge model: 89 passed / 0 failures / 0 errors / 0 skipped',
      'runtimeValidationBoundary':'主侧运行及实际未参与修复的正式QA另取原件；本实例只执行知识检查，不以源码或文件存在证明业务运行。',
      'limitations':['不关闭两旧DHR high、四旧知识gap或A12延期','不恢复历史候选来源或改写旧审计hash','W5审计读回摘要不可重算探针仍单列','不计为全库或整个W3语义通过'],
      'contractBaseline':{'sourceCommit':KNOWLEDGE,'targetBranch':'edhr-dev','targetCommit':TARGET,'contractReadCommit':READ,'uncommittedContractPaths':[]}})

out=Path('/tmp/edhr-w3-tenant-transfer-semantic-review.jsonl')
out.write_text(''.join(json.dumps(row,ensure_ascii=False,sort_keys=True)+'\n' for row in rows))
summary={'schema':'edhr-finite-ontology-semantic-review/v1','implementationCommit':APP,'knowledgeCommit':KNOWLEDGE,
         'recordCount':len(rows),'wholeAssetSemanticAcceptance':False,'path':str(out),
         'sha256':hashlib.sha256(out.read_bytes()).hexdigest(),'ids':[row['id'] for row in rows]}
Path('/tmp/edhr-w3-tenant-transfer-semantic-summary.json').write_text(json.dumps(summary,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({k:v for k,v in summary.items() if k!='ids'},ensure_ascii=False))
