from pathlib import Path
import subprocess,json,hashlib,yaml,xml.etree.ElementTree as ET
root=Path('/workspace/edhr-nexus-frontend');old='032b83e9d5b8a25bee6d5b59c45d86892f672d00';target='0bd0848bbded6d6954d62a4f924e0b2eec6623ad';head='e9548d5f9d555f78afbe1c1c8ea68f64d45e6c55';feature='ec4857be'
prefix='/tmp/edhr-copy-integration-ontology-'
def out(n):return Path(prefix+n)
def sha(raw):return hashlib.sha256(raw).hexdigest()
def git(*args):return subprocess.check_output(['git',*args],cwd=root,text=True)
assert git('rev-parse','HEAD').strip()==head and git('rev-parse','origin/edhr-dev').strip()==target
package=root/'docs/development/branch-review-20261031-file-consistency/decision-package.yaml';p=yaml.safe_load(package.read_text())['decisionPackage'];assert p['contractBaseline']['sourceCommit']==head and p['contractBaseline']['targetCommit']==target
initial=Path('/tmp/edhr-file-consistency-ontology-review.json');prior=json.loads(initial.read_text());prior_manifest=Path('/tmp/edhr-file-consistency-ontology-manifest.json');pm=json.loads(prior_manifest.read_text())
for f in pm['files']:
 raw=Path(f['path']).read_bytes();assert sha(raw)==f['sha256'] and len(raw)==f['bytes']
knowledge=[]
for path in git('ls-files','docs/knowledge').splitlines():
 raw=(root/path).read_bytes();baseline=subprocess.check_output(['git','show',target+':'+path],cwd=root);assert raw==baseline,path
 knowledge.append({'path':path,'sha256':sha(raw),'bytes':len(raw)})
assert len(knowledge)==330
delta=git('diff','--name-status',old,target,'--','docs/knowledge').splitlines();file_rows=[];id_rows=[];removed_rows=[]
def ids(node,path='$',acc=None):
 if acc is None:acc={}
 if isinstance(node,dict):
  if isinstance(node.get('id'),str):acc[node['id']]={'sourceLocator':path,'record':node}
  for k,v in node.items():ids(v,path+'.'+str(k),acc)
 elif isinstance(node,list):
  for i,v in enumerate(node):ids(v,path+'['+str(i)+']',acc)
 return acc
for line in delta:
 status,path=line.split('\t',1);raw=(root/path).read_bytes();file_rows.append({'path':path,'changeType':status,'reviewStatus':'pending','conclusion':'pending','note':'Full incremental semantic/source/runtime audit not completed by this batch.'})
 if not path.endswith(('.yaml','.yml')):continue
 current=ids(yaml.safe_load(raw));previous={}
 if status!='A':previous=ids(yaml.safe_load(subprocess.check_output(['git','show',old+':'+path],cwd=root)))
 for id,row in current.items():
  before=previous.get(id)
  if before and row['record']==before['record']:continue
  r=row['record'];id_rows.append({'id':id,'sourcePath':path,'sourceLocator':row['sourceLocator'],'changeType':'added' if before is None else 'modified','originalMaturity':r.get('status','not-present'),'reviewStatus':'pending','conclusion':'pending','scope':'Static id-dictionary candidate location within changed files; container and nested records overlap, not a unique reviewed semantic count.'})
 for id,row in previous.items():
  if id not in current:removed_rows.append({'id':id,'sourcePath':path,'sourceLocator':row['sourceLocator'],'sourceCommit':old,'changeType':'removed-from-current-file','reviewStatus':'pending','conclusion':'pending','scope':'Historical/removal-provenance audit pending, not a reopened product question.','contextScreening':'DEC-0091-01 explicitly closes managerial reassignment signature choice; do not restore or re-ask that choice.' if id=='question.record-control-managerial-reassignment-signature' else 'Reconcile exact replacement source before full audit closure.'})
pending={'oldCommit':old,'targetCommit':target,'knowledgeFileCountBefore':303,'knowledgeFileCountAfter':330,'changedFiles':len(file_rows),'addedFiles':sum(r['changeType']=='A' for r in file_rows),'modifiedFiles':sum(r['changeType']=='M' for r in file_rows),'files':file_rows,'changedIdCandidateLocations':id_rows,'removedIdCandidateLocations':removed_rows,'countingBoundary':'44 changed files including27added17modified;183new/changed dictionary-ID candidates plus removed candidates separately; nested/container overlap and all pending, not full new-ID semantic completion.'}
out('pending-increment.json').write_text(json.dumps(pending,ensure_ascii=False,indent=2)+'\n')
source_paths=[r['path'] for r in prior['sourceSnapshot']]
source_paths+=['gmp-platform/backend/src/main/java/com/zencas/edhr/compliance/controller/SignatureController.java','gmp-platform/backend/src/main/java/com/zencas/edhr/recordcontrol/service/RecordControlService.java','gmp-platform/backend/src/main/java/com/zencas/edhr/workflow/service/WorkflowResponsibilityService.java']
source_paths+=['gmp-platform/backend/src/test/java/com/zencas/edhr/compliance/controller/FileCopyOwnershipTest.java','gmp-platform/backend/src/test/java/com/zencas/edhr/compliance/controller/FileHttpBoundaryTest.java']
snap=[{'path':path,'sha256':sha((root/path).read_bytes()),'bytes':(root/path).stat().st_size,'scope':'limited integration/identity/permission anchors, not whole-file'} for path in source_paths]
protected=['gmp-platform/backend/src/main/java/com/zencas/edhr/compliance/controller/FileController.java','gmp-platform/backend/src/main/java/com/zencas/edhr/common/audit/AuditContext.java','gmp-platform/backend/src/main/java/com/zencas/edhr/identity/security/JwtAuthenticationFilter.java','gmp-platform/backend/src/test/java/com/zencas/edhr/compliance/controller/FileCopyOwnershipTest.java','gmp-platform/backend/src/test/java/com/zencas/edhr/compliance/controller/FileHttpBoundaryTest.java']
assert not git('diff','--name-only',feature,head,'--',*protected).strip()
current_delta=git('diff','--name-only',feature,'--',*protected).splitlines()
assert set(current_delta)=={protected[0],protected[3]},current_delta
controller=(root/protected[0]).read_text();assert 'Files.newOutputStream(targetPath, StandardOpenOption.WRITE)' in controller and 'input.transferTo(output)' in controller and 'StandardCopyOption.REPLACE_EXISTING' not in controller
assert not git('diff','--name-only',old,target,'--','AGENTS.md','codeplzreadme.md','docs/agents').strip()
replayed=[]
for record in prior['records']:
 r=ids(yaml.safe_load((root/record['sourcePath']).read_text()))[record['id']]['record'];statement=r.get('statement',r.get('explanation',r.get('description')));assert statement==record['statement'],record['id']
 replayed.append({**record,'integrationDisposition':'replayed-unchanged-definition','scope':'Existing finite policy meaning rechecked against new baseline; not new unique semantic coverage.'})
tests=ET.parse(out('knowledge-junit.xml')).getroot();counts={k:int(tests.attrib[k]) for k in ['tests','failures','errors','skipped']};assert counts=={'tests':89,'failures':0,'errors':0,'skipped':0}
out('integration-diff.txt').write_text(git('diff','--stat',old,target)+'\n'+git('diff',feature,'--',*protected))
screened=[]
for path in sorted((root/'docs/knowledge/decisions').glob('DEC-00*.yaml')):
 if not any(path.name.startswith('DEC-00'+str(n)) for n in range(86,93)):continue
 d=yaml.safe_load(path.read_text())['decisions'][0];screened.append({'id':d['id'],'path':str(path.relative_to(root)),'scope':'Context/compatibility screening only; full ID-by-ID/source/runtime incremental audit pending','fullSemanticReviewStatus':'pending','maturityRetained':d['status']})
assert len(screened)==7
review={'roleState':'FINAL','ontologyResult':'not-applicable','baseCommit':target,'headCommit':head,'sourceRevision':'Actual e954 HEAD plus uncommitted direct-output copy fix and extra ownership test; exact sourceSnapshot/diff below','previousOntologySourceCommit':old,'contractReadCommit':head,'knowledgeBaselineVersion':'0.3.25','packageSha256':sha(package.read_bytes()),'knowledgeFiles':knowledge,'knowledgeFilesMatchNewTarget':True,'knowledgeChangedVersusOld':{'files':44,'added':27,'modified':17,'oldCount':303,'newCount':330},'pendingIncrement':'edhr-copy-integration-ontology-pending-increment.json','pendingIdCandidateLocations':len(id_rows),'removedIdCandidateLocations':len(removed_rows),'replayedExistingIds':replayed,'screenedNewDecisions':screened,'sourceSnapshot':snap,'initialMergeProtectedPathsUnchangedFromFeature':protected,'finalUncommittedSourceDelta':current_delta,'contractRoleFilesUnchangedFromOld':True,'knowledgeTests':counts,'knowledgeRuntimeCountThisIntegration':1,'originalOntologyArtifactsPreserved':True,'originalManifestSha256':sha(prior_manifest.read_bytes()),'aclFutureQuestions':prior['futureScopeQuestions'],'changedDeferralMeaning':{'recordControl':'Implementation now present; added record-control/DHR/workflow paths pending incremental audit, not blanket unimplemented.','dhrHighs':'DEC0068 two implementationDiscrepancies stillopen; complete quality-change comparison/fullmatrix not certified by this file batch.','A12':'Current effective-content/contribution switch partially implemented; historical/invalidation views/full A12 remain pending.','archive':'DEC0090 current terminology/minimum policy only; archive/release execution not delivered.','friendTaskDetail':'Old generic signature-password finding requires incremental review against new workflow implementation; cannot treat old source claim as current verified failure or done.'},'remaining':['Shared file ACL three user choices still unanswered, no defaults chosen. Personal identity originals differ from signature images in valid frozen evidence.','DB save/commit and physical delete compensation still open.','New knowledge/source/runtime areas are pending; no high/A12/four-gap closure.'],'wholeFileCompletion':0,'newHistoricalUniqueIncrement':None,'notRun':['business product runtime or PG/browser acceptance','full semantic audit of new44files/allnewIDs','production release/archive/fullmultitenantACL'],'noProductTestKnowledgeEdits':True}
out('review.json').write_text(json.dumps(review,ensure_ascii=False,indent=2)+'\n')
reason='整合新目标0bd0848b后，文件路径所有权/失败清理及JWT上传主体修复仍只是工程纠错，无新增权限政策。初合并关键路径与原feature ec485同blob；独立随后发现copy替换会释放预占，当前FileController已在e954工作树增量改为newOutputStream(WRITE)/transferTo保持同一预占文件，并新增持有句柄对照；实际hash/diff单列，不宣称同旧feature完全未变。现有10项有限知识定义重放一致。当前知识330文件，较旧303有27新增17修改，44文件及新增/修改ID候选全量语义待审，不能声称旧303全不变。记录控制/DHR生效联动/流程签署已有新实现，转待增量审计；两DHRhigh、完整A12、四gap不自动关闭，三ACL选择未答不选默认。'
result={'ontologyResult':{'result':'not-applicable','baselineBefore':'0.3.25','baselineAfter':'0.3.25','contractBaseline':{'sourceCommit':head,'targetBranch':'edhr-dev','targetCommit':target,'contractReadCommit':head,'uncommittedContractPaths':[]},'reason':reason,'changedArtifacts':[],'knowledgeSync':[],'conflicts':[],'questions':[],'validationEvidence':[{'id':'validation.copy-integration.current-source-policy','checkType':'evidence-path','command':'Read current package, knowledge README/openquestions, DEC0086-0092, current DHR/signature/recordcontrol scope and protected source delta','outcome':'passed','evidence':[str(out('review.json')),str(out('review.md')),str(out('integration-diff.txt'))]},{'id':'validation.copy-integration.knowledge89','checkType':'schema','command':'bash /workspace/.edhr-cloud-tools/mvn-edhr -f tools/knowledge-model/pom.xml test','outcome':'passed','evidence':[str(out('knowledge-test.txt')),str(out('knowledge-junit.xml')),'89 actual tests, zero failures/errors/skips']},{'id':'validation.copy-integration.pending-provenance','checkType':'reference','command':'Hash330current knowledge files against0bd; inventory44changed files and dictionary-ID candidate locations as pending; preserve original ontology originals','outcome':'passed','evidence':[str(out('pending-increment.json')),str(out('review.json'))]}],'roadmapProgress':{'stage':'P0','status':'in-progress','exitCriteriaEvidence':[],'deferredStages':['P1','P2','P3']}}}
out('result.yaml').write_text(yaml.safe_dump(result,allow_unicode=True,sort_keys=False))
md=f'''# 整合后本体增量 FINAL — not-applicable

实际候选{head}，目标{target}，原文件批feature ec4857be。当前包已更新真实来源/目标，契约在候选重新核对；AGENTS及角色/交接文件相对旧032不变，知识/架构内容则已更新，当前读取0.3.25不能替代提交基线。

初合并时FileController、AuditContext、JWT和本批测试与原feature同blob，随后独立发现Files.copy(REPLACE_EXISTING)会unlink/recreate释放预占。当前实际工作树增量改为对已预占文件newOutputStream(WRITE)/transferTo，保持同一预占对象，双流释放及cleanup原异常/suppressed保持；新增持有句柄对照测试。源hash/diff捕捉这一实际补正，不能继续笼统称当前产品与旧feature完全不变。所有权及认证上传者贯通仍为工程修正，无新业务政策。10既有知识ID在新目标定义逐条重放相同，不新增unique或成熟度；新DEC0086–0092已读取并做上下文兼容筛查，不把该阅读计作其全部声明/实现/运行语义完成。

新知识实际330文件，较原303新增27、修改17，共44变动文件。原“303全部未变”只属于旧验证时点。已另存44文件及{len(id_rows)}个新增/修改字典ID候选位置pending清单，另{len(removed_rows)}个移除ID候选等待历史/替代核对；父容器/嵌套记录可能重叠，不能把候选数当unique或已审数。文件逐字节匹配当前目标，新89知识测试已亲自实际执行全过（0fail/error/skip），只是本次整合实际一次，最终copy增量未改知识/工具因此适用而不冒称再次跑；原本体原件/原包hash保持，不回写。

记录控制V1、生效结果消费、DHR双向在审检查/影响/账号提醒/当前贡献切换及流程干预签名有新实现与既有聚焦证据，不能继续描述为“记录控制未实现”。当前DEC0068两个high仍open，剩余完整质量变化比较和全面矩阵未由本文件切片认证；A12当前切换已部分接入，失效历史/完整视图继续pending。DEC0090只确定归档名称和后续最小范围，归档/放行执行仍未交付。新流程签署代码也要求对旧TaskDetail发现做增量核对，旧缺陷原位置不能直接继承为当前事实，更不能自动标done。

ACL依旧从真实业务关联解释：DEC0065主数据页面权限不能机械覆盖生产SOP；DHR受控附件使用独立dhr_attachment及任务/冻结版本成员授权，通用file_object不是它；个人身份证认证原件与已签署后合法冻结签名图片不可混同。未绑定仅上传者、多引用任一路径、个人原件仅本人三问题尚未答，未选择默认，作为独立后续范围不阻断现有工程纠错。新记录控制与WORKFLOW_INTERVENTION通用签名保护不得被误用为全部FileObject全局ACL已完成。

本角色未修产品/测试/知识、未执行本批业务/PG/浏览器验收；不关闭旧两high、完整A12、四gap、跨介质save/commit/delete、容量或全分支审计。后续先对新增来源按pending清单做增量审计，原证据仅在相同blob/范围内承接。
'''
out('review.md').write_text(md)
files=[out(n) for n in ['result.yaml','review.json','review.md','pending-increment.json','integration-diff.txt','knowledge-test.txt','knowledge-junit.xml']]
manifest={'roleState':'FINAL','ontologyResult':'not-applicable','sourceCommit':head,'targetCommit':target,'packageSha256':sha(package.read_bytes()),'limitedReplayedExistingIds':10,'screenedNewDecisionContainers':7,'newUniqueIncrement':None,'knowledgeFileCount':330,'knowledgeChangedFiles':44,'pendingIdCandidateLocations':len(id_rows),'knowledgeTests':counts,'originalOntologyManifestSha256':sha(prior_manifest.read_bytes()),'files':[{'path':str(f),'sha256':sha(f.read_bytes()),'bytes':f.stat().st_size} for f in files]}
out('manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'roleState':'FINAL','result':'not-applicable','knowledgeFiles':330,'knowledgeDelta':44,'idCandidatesPending':len(id_rows),'knowledgeTests':counts,'originalFilesPlusManifest':8,'packageSha256':manifest['packageSha256']}))
