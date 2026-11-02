from pathlib import Path
import json,hashlib,subprocess,yaml
ROOT=Path('/workspace/edhr-nexus-frontend')
P='/tmp/edhr-copy-q2-'
BASE='0bd0848bbded6d6954d62a4f924e0b2eec6623ad'
HEAD='2bdea59bc591fcec6ba9a4c8cbc4374cc65da1ab'
inspection=json.loads(Path(P+'inspection.json').read_text())
current=json.loads(Path(P+'current-summary.json').read_text())
knowledge=json.loads(Path(P+'knowledge-summary.json').read_text())
latest=json.loads(Path(P+'latest-old-summary.json').read_text())
pre=json.loads(Path(P+'pre-copy-fix-summary.json').read_text())
cleanup=json.loads(Path(P+'cleanup.json').read_text())
assert current['totals']=={'tests':37,'failures':0,'errors':0,'skipped':0}
assert knowledge=={'tests':89,'failures':0,'errors':0,'skipped':0}
assert latest['totals']=={'tests':17,'failures':7,'errors':0,'skipped':0}
assert pre['totals']=={'tests':17,'failures':1,'errors':0,'skipped':0}
assert latest['testSha256']==pre['testSha256']
for name,digest in latest['testSha256'].items():
    source=ROOT/'gmp-platform/backend/src/test/java/com/zencas/edhr/compliance/controller'/f'{name}.java'
    assert hashlib.sha256(source.read_bytes()).hexdigest()==digest
assert all(x['absent'] and x['exit']==0 and not x['statusBeforeRemoval'] for x in cleanup['worktrees'])
assert subprocess.check_output(['git','rev-parse','HEAD'],cwd=ROOT,text=True).strip()==HEAD
assert subprocess.check_output(['git','rev-parse','origin/edhr-dev'],cwd=ROOT,text=True).strip()==BASE
assert not subprocess.check_output(['git','status','--porcelain'],cwd=ROOT,text=True).strip()
pending=json.loads((ROOT/'docs/development/branch-review-20261031-file-consistency/evidence/integration-validation/integration-ontology-pending-increment.json').read_text())
assert len(pending['files'])==44 and len(pending['changedIdCandidateLocations'])==183
assert all(x['reviewStatus']=='pending' and x['conclusion']=='pending' for x in pending['files']+pending['changedIdCandidateLocations'])
commands={
    'current':['bash','/workspace/.edhr-cloud-tools/mvn-edhr','-f','gmp-platform/backend/pom.xml','-Dtest=FileCopyOwnershipTest,FileHttpBoundaryTest,FileUploadResourceTest,FileControllerTest,DhrFormFilesTest','test'],
    'knowledge':['bash','/workspace/.edhr-cloud-tools/mvn-edhr','-f','tools/knowledge-model/pom.xml','test']}
for name,cmd in commands.items():
    Path(P+name+'-command.json').write_text(json.dumps({'command':cmd,'cwd':str(ROOT),'testedCommit':HEAD,'exit':0},indent=2)+'\n')
checks=[]
def check(id,category,description,method,command,evidence):
    checks.append({'id':'q2.'+id,'required':True,'category':category,'description':description,'method':method,'command':command,'outcome':'passed','evidence':evidence})
check('baseline-contract','documentation','实时base、clean候选、祖先及实际契约增量核对','inspection','git fetch origin edhr-dev; git rev-parse; merge-base --is-ancestor; read AGENTS/quality-verifier/handoff', [P+'inspection.json',f'base={BASE}; head/tested/contractRead={HEAD}; target ancestor, clean.'])
check('rules-source-scope','requirements','源码、既有身份及原件保护规则，最新知识边界与限定影响核对','inspection','Read actual product/tests/decision package, DEC0065/0068 sources, ontology integration, current README/open questions/review notes',[P+'inspection.json','createFile owns only new path; output WRITE/transferTo keeps reserved object; real JWT AuditContext ID, no submitted identity; no ACL/deletion-policy expansion.'])
check('provenance','documentation','原18、首failed45、整合41及旧/当前源快照独立逐字节核对','command','python3 /tmp/edhr-copy-q2-inspect.py',[P+'inspection.json','Initial3 source hashes checked at Git ec485; current3 and ontology19 checked against frozen candidate; initial package byte-identical; failed remains failed.'])
check('inventory-increment-a23','documentation','新四盘点重建、旧四清单保留、666路径/44文件/183ID与A23剩余边界','command','python3 scripts/build-branch-review-inventory.py --ref '+BASE+' --out /tmp/edhr-copy-q2-inventory',[P+'inspection.json',P+'inventory-build.txt','5758 paths/134 migrations/464HTTP annotations/216route candidates inventory only; 666 path,44knowledge,183ID candidates pending; 6method groups/10replayedIDs overlap, whole-file0/unique null.'])
check('owned-copy-regression','integration','当前原子路径碰撞/部分复制/open/close/清理故障与保留句柄六项','automated-test',' '.join(commands['current']),[P+'current-test.txt',P+'current-FileCopyOwnershipTest.xml','6 passed: partial copy/open/close clean only owned path; old original preserved; cleanup failure retained suppressed; same reserved FileChannel reads final3bytes.'])
check('http-identity-boundaries','security','真实JWT/filter/MVC两上传者身份和原公开/登录边界','automated-test',' '.join(commands['current']),[P+'current-FileHttpBoundaryTest.xml','11 passed, two real JWT IDs persisted and spoofed uploadedBy ignored; actual text bytes/public reference checks; repositories mocked, not whole object ACL.'])
check('adjacent-regression','regression','既有资源9、控制器9、DhrFormFiles2相邻回归','automated-test',' '.join(commands['current']),[P+'current-summary.json','20 adjacent passed; complete current run37/0failure/error/skip; no native DB or complete DHR export certification.'])
check('latest-target-red','regression','相同最终17在实际最新目标0bd的真实红控','automated-test','python3 /tmp/edhr-copy-q2-run-old.py',[P+'latest-old-command.json',P+'latest-old-summary.json','17=7 real assertion failures/10positive,0error/skip; copy5red+uploader2red; exact same source hashes as current.'])
check('pre-copy-fix-red','regression','相同最终17在实际预补正合并e954的真实红控','automated-test','python3 /tmp/edhr-copy-q2-run-old.py',[P+'pre-copy-fix-command.json',P+'pre-copy-fix-summary.json','17=1 reserved-object assertion failure/16positive,0error/skip; old handle EOF despite current path bytes correct; current direct WRITE passes.'])
check('knowledge89','ontology','当前330知识资产的既有正式89检查实际运行','automated-test',' '.join(commands['knowledge']),[P+'knowledge-test.txt',P+'knowledge-junit.xml',P+'knowledge-summary.json','89/0failure/error/skip; automatic validation does not certify full new semantic audit.'])
check('authored-whitespace','documentation','当前手工代码与文档范围空白检查','command','git diff --check '+BASE+' '+HEAD+' -- authored paths',[P+'whitespace-handwritten.txt',P+'inspection.json','9 authored paths; immutable raw logs/inventory excluded, not reformatted.'])
check('owned-cleanup','documentation','两自有旧worktree精确清理与最终候选状态','command','git worktree remove exact owned paths; git status --porcelain',[P+'cleanup.json','Both detached worktrees removed normally after restoring own copied tests/removing own symlinks; no prune/force, no DB container started.'])
findings=[
 {'id':'AUD-W5-FILE-COPY-OWNERSHIP-001','severity':'medium','scope':'FileController.upload physical path ownership and copy failures','summary':'复制失败残片、旧路径覆盖及首轮替换式复制释放预占缺口已修复并fresh复验。','reproductionSteps':['Actual latest target0bd same17:7failure/10positive.','Actual pre-copy-fix e954 same17:reserved handle reads-1 instead of3;1failure16positive.','Current clean candidate37pass with createFile+WRITE/transferTo and retained FileChannel check.'],'expectedResult':'失败仅清理本次拥有路径，碰撞旧原件不动，成功复制保留同一预占文件对象，清理失败保留原始异常。','actualResult':'Current ownership6pass; latest-old5ownershipassertionsred; e954sameobject1red; current failure cleanup and suppressed error correct.','evidence':[P+'latest-old-summary.json',P+'pre-copy-fix-summary.json',P+'current-FileCopyOwnershipTest.xml'],'resolutionStatus':'resolved','resolutionEvidence':[{'type':'commit','reference':HEAD},{'type':'command','reference':P+'current-test.txt'},{'type':'document','reference':P+'pre-copy-fix-summary.json'}]},
 {'id':'AUD-W4-FILE-UPLOADER-001','severity':'medium','scope':'FileObject.uploadedBy for authenticated upload','summary':'HTTP上传者不再伪记system，复用真实JWT上下文ID。','reproductionSteps':['Actual latest target0bd sameHTTP11:2uploaderassertionsfail, actualsystem.','Current realJWT uploader-A/uploader-B each persist ownID and ignore submitted uploadedBy.'],'expectedResult':'HTTP上传元数据使用真实认证主体ID，不信提交身份、不回填历史。','actualResult':'CurrentHTTP11pass; both actor tests red on real latest target and green current; legacy nonHTTP fallback retained.','evidence':[P+'latest-old-summary.json',P+'current-FileHttpBoundaryTest.xml'],'resolutionStatus':'resolved','resolutionEvidence':[{'type':'commit','reference':HEAD},{'type':'command','reference':P+'current-test.txt'}]}]
risks=[
 {'id':'risk.shared-object-acl','description':'通用FileObject对象ACL三项产品边界仍待用户确认，个人认证证件与冻结签名展示图不同。','impact':'登录/公开真实引用测试不等完整对象访问授权；不能按可伪造targetType直接放行。','mitigation':'按真实业务引用继续核对；未答不选择默认，不一刀切主数据页权。'},
 {'id':'risk.cross-storage-remains','description':'DBsave/commit失败、删除顺序、崩溃及不确定提交未修，仍可能孤儿或跨介质不一致。','impact':'本批只修受控请求复制阶段，不能承诺完整文件/数据库原子性。','mitigation':'后续实际事务故障注入，按明确回滚/不确定结果保留策略；不自动清历史。'},
 {'id':'risk.scope-capacity','description':'合成磁盘/受控故障和仓储mock，仅有限请求及文件对象保持验证。','impact':'不认证全部并发/外部进程任意改盘、PG/多租户、PDF视觉或生产堆GC/SLA。','mitigation':'按风险后续验证；容量量化后讨论优化，保持原件与摘要。'},
 {'id':'risk.increment-pending','description':'新记录控制/DHR/工作流666路径、44知识增改文件及183ID候选待增量审计，当前330知识；10旧有限ID重放不计new unique。','impact':'本批37/89不表示新增全模块或全仓通过；旧记录控制未实现描述需转为已实现待审，旧high/A12/gap不自动关。','mitigation':'按新清单逐项核对，保留全量5758/134盘点和W2–W7/A23待审。'},
 {'id':'risk.ui-tooling-not-run','description':'无本批UI变更，未执行浏览器/全前端构建/静态UI检查；旧strict19/lint/process限制不借用覆盖新目标UI。','impact':'Maven资源构建不是完整前端验收，未核强制CI设置。','mitigation':'相关UI/模块后续独立验证，不查询触发CI。'}]
result={'qualityResult':{'result':'passed','baseCommit':BASE,'headCommit':HEAD,'contractBaseline':{'sourceCommit':HEAD,'targetBranch':'edhr-dev','targetCommit':BASE,'contractReadCommit':HEAD,'uncommittedContractPaths':[]},'workingTreeState':{'status':'clean','includedPaths':[],'excludedPaths':[],'untrackedPaths':[]},'knowledgeBaselineVersion':'0.3.25','checks':checks,'findings':findings,'residualRisks':risks,'blockingConditions':[]}}
Path(P+'quality-result.yaml').write_text(yaml.safe_dump(result,allow_unicode=True,sort_keys=False,width=120))
review=f'''# 独立质量复验 FINAL — passed

全新实例file_consistency_final_qa2_20261031，L2，未参与任何修复。实际base={BASE}，clean受测及契约读取head={HEAD}，知识0.3.25。12/12必需检查全部通过，未修改产品/测试/夹具/知识/仓库台账，不查询CI、合并、部署或恢复数据。

当前37/37实际执行：Copy6、HTTP11、旧资源9、原控制器9、DhrFormFiles2；知识89/89另实际运行。完全相同最终Copy6与HTTP11在真实最新目标0bd得7个断言失败/10正向，在预补正合并e954得1个保留句柄断言失败/16正向，均0error/skip，测试sha完全相同。e954预占路径在Files.copy REPLACE_EXISTING中被unlink/recreate，原句柄EOF；当前对原预占文件newOutputStream(WRITE)+transferTo，同句柄读到最终3字节，闭环首轮独立failed同一发现。普通路径字节正确不足以证明保留预占，本次两者均核实。

实际部分复制、第二流open/close失败清理自有路径；碰撞不覆盖旧原件、不进入旧路径清理；cleanup失败保留原IOException及DirectoryNotEmpty suppressed。真实JWT/filter/MVC的两个主体保存正确上传者ID，不接受提交的spoofed uploadedBy，原非HTTP system fallback保留。格式、150MiB/MD5、公开四用途实际引用、原生产/签名删除保护不变，无新ACL/迁移/历史回填。DHR受控附件50MiB/SHA256为不同专属链，不能混同。

仓储mock，真实磁盘字节/故障流/HTTP响应参与，不声称原生数据库、DBsave/commit或delete跨介质原子性、全部文件对象ACL、PDF浏览器或所有并发认证。三ACL未答仍pending，个人证件与生产冻结签名展示图区分，不选择默认；实际DHR任务附件是dhr_attachment专属资格/冻结成员链，不误报通用FileObject已绕过该表。

独立逐字节核原18、firstfailed45、整合41原件；初始3源码对Git ec485，当前3及本体19来源对当前候选，初始包字节保留。330当前知识逐文件匹配最新目标，44变动文件和183ID候选全pending；666路径增量清单与实际Git差异完全一致且全pending。10旧有限ID重放、七新DEC上下文筛查不作完整语义通过。新四盘点5758路径/134迁移、464HTTP/216route按实际base重建字节完全相同，旧5173/130四清单与Git初始版本一致。六有限源码/A23六方法2改1增、旧856语言+feature1/130SQL与新4迁移仍待W6含旧已审/W7增量，不给全仓完成率或新增unique。

记录控制变更/作废与DHR/工作流新实现已存在，转增量待审，不能继续写尚未实现；旧两high、完整A12/四gap/TaskDetail友方和原其他归属不自动关闭。无本批UI产品变动，未跑浏览器/完整前端构建/静态UI；旧工具结果不能覆盖新增目标。9手工路径空白检查通过，immutable原件/盘点未重排。

两个自有detached旧工作树按确切路径正常移除，只恢复自有复制测试/移除自有依赖链接，未prune/force他人工作树；未启动数据库容器。当前工作树仍clean同head，目标仍0bd。此passed只建议本批局部修复交付，不认证整个文件子系统或新增666路径。
'''
Path(P+'quality-review.md').write_text(review)
raws=[]
for file in sorted(Path('/tmp').glob('edhr-copy-q2-*')):
    if file.name=='edhr-copy-q2-independent-evidence.json':continue
    candidates=sorted(file.rglob('*')) if file.is_dir() else [file]
    for item in candidates:
        if item.is_file():
            raw=item.read_bytes();raws.append({'path':str(item),'sha256':hashlib.sha256(raw).hexdigest(),'bytes':len(raw)})
manifest={'roleState':'FINAL','qualityResult':'passed','agent':'file_consistency_final_qa2_20261031','baseCommit':BASE,'headCommit':HEAD,'contractReadCommit':HEAD,'requiredPassed':12,'requiredTotal':12,'backendTests':current['totals'],'knowledgeTests':knowledge,'latestOldTests':latest['totals'],'latestOldPositiveControls':10,'preCopyFixTests':pre['totals'],'preCopyFixPositiveControls':16,'rawFiles':raws,'notRun':['Native DB/DBsave/commit/delete compensation','Full object ACL or all666increment audit','Browser/fullfrontend/staticUI/CI'],'independence':'No product/test/fixture/knowledge/doc edits; exact final test copies only in isolated owned worktrees, restored then removed.'}
Path(P+'independent-evidence.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
for item in raws:
    raw=Path(item['path']).read_bytes();assert hashlib.sha256(raw).hexdigest()==item['sha256'] and len(raw)==item['bytes']
print(json.dumps({'result':'passed','required':len(checks),'rawFiles':len(raws),'withManifest':len(raws)+1}))
