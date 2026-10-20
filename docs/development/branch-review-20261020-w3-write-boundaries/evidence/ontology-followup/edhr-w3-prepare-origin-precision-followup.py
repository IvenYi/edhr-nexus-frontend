from pathlib import Path
import difflib
import hashlib
import json
import subprocess
import yaml

ROOT=Path('/workspace/edhr-nexus-frontend')
BASE='266a1635cc95870cd7907c574eb676db7f560d4f'
def git(*args): return subprocess.check_output(['git',*args],cwd=ROOT)
def sha(raw): return hashlib.sha256(raw).hexdigest()
assert git('rev-parse','HEAD').decode().strip()==BASE
assert not git('status','--porcelain').strip()
changes={}
def replace(path,old,new):
 text=changes.get(path,(ROOT/path).read_text())
 assert text.count(old)==1,(path,old)
 changes[path]=text.replace(old,new)

decision='docs/knowledge/decisions/DEC-0081-tenant-scoped-task-delegation.yaml'
replace(decision,
 '原创建或节点到达时的候选解析结果、主体命中来源及未解析主体作为来源证据保留，不随组织关系变化重算，也不因显式委托被覆盖。当前受让人单独记录；',
 '两条路径按各自已有证据机制保留原候选来源，不随组织关系变化重算已有候选，也不因显式委托被覆盖。通用工作流保留已有候选解析原件，其中包含候选用户、逐用户主体命中来源及未解析主体；普通生产表单保留节点到达时冻结的候选用户ID、审批范围限制标记及执行快照中的原节点主体配置，不将这些记录表述为已保存逐用户主体命中来源或未解析主体原件。本决策不要求本轮新增普通表单来源采集或重建历史缺失。当前受让人单独记录；')
replace(decision,
 'then: 允许委托，目标成为唯一当前处理人；原来源保留，节点、表单内容和审批结果不变',
 'then: 允许委托，目标成为唯一当前处理人；按DEC-0081-02各自既有机制保存的原候选证据保持，节点、表单内容和审批结果不变')
replace(decision,
 'given: 任务已成功委托且仍可处理，原候选来源已保留',
 'given: 通用任务或普通表单审批节点已成功委托且仍可处理，按各自既有机制保存的原候选证据仍可获得')
replace(decision,
 'then: 同一原来源完整保留，前任及原候选不再可处理，只有新受让人继续处理，节点及审批结果不变',
 'then: 重复转办不覆盖通用任务首次保存的原解析原件；普通表单的冻结候选ID、限制标记及冻结节点主体配置保持。前任及原候选不再可处理，只有新受让人继续处理，节点及审批结果不变')
replace(decision,
 'evidenceRequirements: [首次与重复转办原件保持, 待办SQL与动作授权一致, 单逻辑任务回归]',
 'evidenceRequirements: [通用任务首次与重复转办原解析文本保持, 普通表单候选ID和限制标记及冻结配置保持, 待办SQL与动作授权一致, 单逻辑任务回归]')

replace('docs/knowledge/README.md',
 '创建/到达时的候选解析来源保留，当前受让人单独记录；',
 '原候选来源按各自已有机制保留：通用任务保留含命中来源和未解析主体的解析原件，普通生产表单保留冻结候选ID、限制标记及执行快照中的原节点主体配置，不宣称已有逐用户解析来源原件；当前受让人单独记录；')
arch='docs/architecture/business-knowledge-model.md'
replace(arch,
 '原解析来源保留而当前受让人单独记录，转后仅目标可处理，节点/数据/审批结果不变并记录原因及身份/时间。',
 '原候选来源按各自既有机制保留：通用任务保存含逐用户命中来源和未解析主体的解析原件，普通生产表单保存冻结候选ID、限制标记及执行快照中的原节点主体配置，不宣称已有逐用户解析来源原件；当前受让人单独记录，转后仅目标可处理，节点/数据/审批结果不变并记录原因及身份/时间。')
replace(arch,
 '原候选来源保留而当前受让人另存，再次转办仍按同租户范围，退回重建时清除旧转办投影。通用工作流同样区分原创建来源和当前责任，保持一个逻辑任务。',
 '节点到达时的approvers候选ID、restrictedApprovers限制标记及执行冻结快照中的原节点主体配置保留，当前受让人另存，再次转办仍按同租户范围，退回重建时清除旧转办投影。普通表单不据此宣称已有逐用户主体命中来源或未解析主体原件。通用工作流另外保留含sources/unresolvedSubjects的原解析文本originSnapshot，并与当前责任分开，保持一个逻辑任务；两条路径均不重建历史缺失来源。')

doc='docs/knowledge/evidence/tenant-task-delegation-2026-10-20.md'
replace(doc,
 '## 工程选择和历史边界\n\n',
 '## 工程选择和历史边界\n\n原候选证据按各自既有机制保存，不能把两条路径概括为相同的解析原件：\n\n| 路径 | 实际保留的原候选证据 | 当前责任 |\n| --- | --- | --- |\n| 通用工作流 | `resolveAssignees`创建的`userIds/sources/unresolvedSubjects`解析原件；转办以`originSnapshot`保存首次可获得的原文本并在重复转办时保持。 | 当前单人`userIds/assigneeId`，原件中的旧候选不继续授权。 |\n| 普通生产表单 | `ExecutionAccess.captureApprovers`只保存节点到达时的`approvers`候选ID和`restrictedApprovers`限制标记；`ExecutionSnapshotBuilder.attachFillSettings`将原节点主体配置随`form.flow.nodes`冻结于执行快照。 | `transferAssignees`单独保存受让人，原候选ID及冻结节点配置不因转办改变。 |\n\n普通表单的`resolve`只消费公共解析器返回的用户ID；上述记录不等于已有逐用户命中来源或未解析主体原件。本轮不新增这类采集或回填历史。独立核对指出DEC-0081-02曾把通用解析原件的细节泛化到两条路径，现按实际源码作记录精度纠正；用户的租户内委托、保留原候选来源、当前目标独占处理与DHR保持规则没有改变。首轮本体/语义原件及旧候选QA记录各自保留，新纠正提交由后续原件引用，不覆盖原结果。\n\n')
index='docs/knowledge/evidence/tenant-task-delegation-20261020.yaml'
replace(index,
 '原候选来源和当前责任区别。新政策不回填早期确认，',
 '原候选来源和当前责任区别。来源按既有路径分列：通用任务有完整解析原件，普通表单为冻结候选ID/限制标记及冻结节点主体配置，不宣称普通表单已有逐用户命中或未解析主体原件；此处为记录精度纠错，不新增业务政策或采集。新政策不回填早期确认，')

patch=[]
files=[]
for path,changed in changes.items():
 original=(ROOT/path).read_text()
 if path.endswith('.yaml'):
  old=yaml.safe_load(original);new=yaml.safe_load(changed)
  assert old['knowledgeModelVersion']==new['knowledgeModelVersion']=='0.3.25'
 patch.extend(difflib.unified_diff(original.splitlines(keepends=True),changed.splitlines(keepends=True),fromfile='a/'+path,tofile='b/'+path))
 files.append({'path':path,'sourceCommit':BASE,'sourceBlob':git('rev-parse',BASE+':'+path).decode().strip(),
               'beforeSha256':sha(original.encode()),'proposedSha256':sha(changed.encode())})
out=Path('/tmp/edhr-w3-tenant-origin-precision-followup.patch')
out.write_text(''.join(patch))
source=[]
for path,scope in [
 ('gmp-platform/backend/src/main/java/com/zencas/edhr/production/service/ExecutionAccess.java','resolve only projects resolution.users to IDs; captureApprovers stores approvers/restrictedApprovers'),
 ('gmp-platform/backend/src/main/java/com/zencas/edhr/production/service/ExecutionSnapshotBuilder.java','attachFillSettings freezes form.flow.nodes/edges and binding configuration'),
 ('gmp-platform/backend/src/main/java/com/zencas/edhr/production/service/ProductionExecutionEngine.java','transferForm writes only current transferAssignees plus history; settleForm captures original approvers'),
 ('gmp-platform/backend/src/main/java/com/zencas/edhr/workflow/engine/WorkflowEngine.java','resolveAssignees full userIds/sources/unresolvedSubjects; singleUserSnapshot preserves first available original text')]:
 source.append({'commit':BASE,'path':path,'blob':git('rev-parse',BASE+':'+path).decode().strip(),
                'sha256':sha(git('show',BASE+':'+path)),'reviewedScope':scope})
originals=[]
for name,expected in [('edhr-w3-tenant-transfer-ontology-result.yaml','43a1f9b8160af50efbbdd400a904cccbc3f147588472518a813c9e393978fb36'),
 ('edhr-w3-tenant-transfer-semantic-review.jsonl','87a2d1386abbd091bf6f694cac6c11200e329376a749a20be53dc7043481f23e'),
 ('edhr-w3-tenant-transfer-ontology-safe-originals-manifest.json','ebf9c9fbca3169268dfede7b9d1154d668c6bfc49c15a11e916ad2d26e7eaf03')]:
 p=Path('/tmp')/name
 assert sha(p.read_bytes())==expected,name
 originals.append({'path':str(p),'sha256':expected,'untouched':True})
scope={'schema':'edhr-ontology-record-precision-followup-scope/v1','baselineCommit':BASE,'targetCommit':git('rev-parse','origin/edhr-dev').decode().strip(),
 'classification':'record-precision-correction; no new user policy or business-code change',
 'finding':'DEC-0081-02 generalized generic full resolution evidence to ordinary production form evidence',
 'proposedFiles':files,
 'changedIds':['DEC-0081','DEC-0081-02','scenario.tenant-transfer-target-outside-original-candidates','scenario.tenant-transfer-repeated-origin-preserved','evidence.tenant-task-delegation-20261020'],
 'necessaryAdjacentIds':['DEC-0055-02','rule.form-approval-transfer','anchor.form-approval-transfer-runtime','term.workflow-task-resolution-snapshot'],
 'sourceEvidence':source,'patch':{'path':str(out),'sha256':sha(out.read_bytes())},
 'firstRoundOriginals':originals,'repositoryMutatedByPreparation':False,
 'preparedOnly':True,'formalOntologyResultIssued':False,'testsExecuted':[],
 'retainedBoundaries':['knowledge0.3.25/schema1.2.0 and existing status/visibility unchanged','original user confirmations unchanged','no history restoration','no ordinary per-user provenance new feature','DHR/A12/W5 and other audit gaps unchanged'],
 'nextStep':'Root applies exact patch only after first-round QA FINAL and commits; ontology role then runs actual final89 and emits new finite semantic/ontologyResult/manifest originals against real new commit.'}
Path('/tmp/edhr-w3-tenant-origin-precision-followup-scope.json').write_text(json.dumps(scope,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'preparedFiles':len(files),'changedIds':len(scope['changedIds']),'adjacentIds':len(scope['necessaryAdjacentIds']),'patch':scope['patch'],'repoMutated':False},ensure_ascii=False))
