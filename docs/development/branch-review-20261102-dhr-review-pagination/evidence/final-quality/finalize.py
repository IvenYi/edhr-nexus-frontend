from pathlib import Path
import json, hashlib, subprocess, yaml
from datetime import datetime
from zoneinfo import ZoneInfo

root=Path('/workspace/edhr-nexus-frontend');base='1ad6300918bd0059049eab3c415ca31162dd5115';head='b07fc1ca5dd7e4a37b2584c19377495b86b5536a'
prefix=Path('/tmp');batch=root/'docs/development/branch-review-20261102-dhr-review-pagination'
def read(s):return json.loads((prefix/('edhr-page-q1-'+s)).read_text())
def git(*args):return subprocess.check_output(['git',*args],cwd=root,text=True).strip()
assert git('rev-parse','HEAD')==head and git('rev-parse','origin/edhr-dev')==base
assert not git('status','--porcelain')
current=read('current-summary.json');knowledge=read('knowledge-summary.json');old=read('old-summary.json');observation=read('observation.json');oldobs=read('old-observation.json');cleanup=read('cleanup.json');meta=read('database-observation.json');provenance=read('provenance.json')
assert current['exit']==0 and current['totals']=={'tests':146,'failures':0,'errors':0,'skipped':0}
assert len(current['suites'])==5 and all(x['xmlFresh'] for x in current['suites'])
assert knowledge=={'exit':0,'tests':89,'failures':0,'errors':0,'skipped':0}
assert old['tests']==1 and old['failures']==1 and old['errors']==0 and old['skipped']==0
assert observation=={'otherTasksAdded':5000,'sqlCalls':1,'rowsTransferred':20,'personalTotal':21}
assert oldobs=={'otherTasksAdded':5000,'sqlCalls':84,'rowsTransferred':5309,'personalTotal':21}
assert cleanup['removedConfirmed'] and cleanup['oldWorktreeRemoved'] and meta['changesets']==11
assert len(meta['indexes'])==2 and all(x['indisvalid'] for x in meta['indexes'])
assert provenance['result']=='passed'
oldcmd=read('old-command.json');assert oldcmd['testSha256']==hashlib.sha256((root/'gmp-platform/backend/src/test/java/com/zencas/edhr/production/service/DhrReviewPaginationPostgresTest.java').read_bytes()).hexdigest()
plans=json.loads((prefix/'edhr-page-q1-index/observations.json').read_text());assert len(plans)==11
assert all(x['sqlCalls']==1 and x['rowsTransferred']<=20 and x['returned']<=20 for x in plans)
indices={}
def collect(node):
    result=[]
    if 'Index Name' in node:result.append(node['Index Name'])
    for child in node.get('Plans',[]):result.extend(collect(child))
    return result
for x in plans:
    data=json.loads((prefix/'edhr-page-q1-index'/x['plan']).read_text());indices[x['plan']]=collect(data[0]['Plan'])
assert 'trial_dhr_pending' in indices['history-pending-index-7-PENDING.plan.json']
assert 'trial_task_done' in indices['history-done-index-99-DONE.plan.json']
assert 'idx_wf_task_assignee' in indices['history-done-index-7-DONE.plan.json']
inspection={'roleState':'FINAL','result':'passed','baseCommit':base,'headCommit':head,'contractReadCommit':head,'knowledgeVersion':'0.3.25','clean':True,
 'authority':'PENDING retains r/t states, unrestricted and nonempty frozen collection priority, empty/scalar fallback, DONE actual assignee+completed/rejected; original detail/act/signer/locks untouched',
 'search':'strip/Locale.ROOT parameter, native ICU root lower and strpos literal substring; finite Unicode matrix passed, no global Unicode/version certification',
 'query':'single MVCC statement; accurate total row on empty/deep pages, long offset, light list projection keeps all project aliases and excludes unused large fields',
 'migrations':'two separately tracked concurrent nontransactional indexes; native Liquibase update/rollback/reapply and three baseline install paths ran; ICU presence HALT; no historical backfill or old-index removal',
 'tests':'four H2 list assertions relocated to PG native oracle and actual full-application return/resubmit/approve list test, existing H2 workflow/signature/frozen evidence assertions retained',
 'nativeReadSlice':'five canonical query tables with original PK/unique/check/index, no claim of all FK/business model validity; full application is separate',
 'nativeIndependentResults':current,'knowledgeIndependentResult':knowledge,'sameFinalClassOldRed':old,'oldTestSha256':oldcmd['testSha256'],
 'indexUses':indices,'indexTrialFormalDefinitionEquivalence':'trial pending uses workflow_instance_id where PENDING_REVIEW; trial done uses assignee_id,id DESC INCLUDE(instance_id,node_id) where COMPLETED/REJECTED, identical to0091 except names and concurrent build options',
 'sourceAndEvidenceAuxiliary':'125 original records,16gzip,9snapshots,r2 25 fingerprints,330unchanged knowledge,4 fixed inventories,14 authored whitespace paths verified by final read-only auxiliary',
 'a23':'six finite engineering judgments; old queues and6changed2added/new0091 preserved; wholeFile0/unique null',
 'limitations':['PG16.15/ICU153.136 only; no production database access','No browser/socket/login/RBAC/all account-state or recipient certification','50k allpending still has JSON/COUNT/offset costs, not all-capacity/SLA/heap proof','PR50 separate OPEN and not included; must re-evaluate actual later integrated target','Two existing DHR high and all old deferrals/666-44-183/W6/W7 remain open']}
(prefix/'edhr-page-q1-inspection.json').write_text(json.dumps(inspection,ensure_ascii=False,indent=2)+'\n')

checks=[]
def check(id,category,description,method,command,evidence):
    checks.append({'id':id,'required':True,'category':category,'description':description,'method':method,'command':command,'outcome':'passed','evidence':evidence})
check('check.baseline-and-scoped-delta','documentation','最新目标、真实受测clean提交及八项业务/测试影响路径','command','git fetch origin edhr-dev;git rev-parse HEAD origin/edhr-dev;git diff base head',['/tmp/edhr-page-q1-inspection.json','/tmp/edhr-page-q1-provenance-diff.json',f'base={base};tested head={head};clean'])
check('check.requirements-and-ontology','ontology','既有个人权限/冻结边界、本体r2 NA及知识未变','inspection','Read DEC0068-01/07/11,DEC0063 personal/read authority,original confirmations and r2 result/fingerprints',['/tmp/edhr-page-q1-inspection.json','/tmp/edhr-page-q1-provenance.json','14 IDs=12 finite consistent+2old gap;330unchanged;no business policy or maturity change'])
check('check.original-provenance','documentation','125原件raw/stored双哈希、gzip无损及源码指纹','command','python3 /tmp/edhr-page-q1-provenance.py',['/tmp/edhr-page-q1-provenance.json','108primary+17ontology,16gzip;9sourceSnapshot andr2 25fingerprints matched; historicalr1 kept'])
check('check.source-authority-and-query','security','SQL资格/字面搜索/空页总数/MVCC/轻投影符合当前兼容基准','inspection','Inspect DhrReviewService.list/eligible/handled/project and changed controller-consumed projection',['/tmp/edhr-page-q1-inspection.json','No changes to action/signature/evidence/lock methods;one MVCC statement and parameter-bound literal search'])
check('check.native-and-adjacent-146','integration','自有双PG数据库单次146全过，所有XML新生成','automated-test','bash /workspace/.edhr-cloud-tools/mvn-edhr -f gmp-platform/backend/pom.xml -Dtest=DhrReviewPaginationPostgresTest,DhrReviewServiceTest,DhrReviewLifecycleIntegrationTest,RecordControlPostgresIntegrationTest,CurrentDatabaseBaselinePostgresTest -Dedhr.audit.dhrPageOutput=/tmp/edhr-page-q1-observation.json test',['/tmp/edhr-page-q1-current-command.json','/tmp/edhr-page-q1-current-summary.json','/tmp/edhr-page-q1-current-test.txt','99native+12service+6lifecycle+26fullapp+3baseline=146;0fail/error/skip;two distinct URLs'])
check('check.native-page-bounds','api','旧Java过滤oracle及权限/Unicode/页边界原生比较，新增其他人任务不增加往返/传输','automated-test','Execute unchanged native pagination matrix and inspect SQL observation',['/tmp/edhr-page-q1-current-DhrReviewPaginationPostgresTest.xml','/tmp/edhr-page-q1-observation.json','5000other tasks:1SQL/20rows andsame21personal;empty/deep page retains total'])
check('check.migration-and-install','database','真实并发索引升级/回滚/重放及全新/重复/旧基线安装、已有业务表拒绝','automated-test','Execute native Liquibase migration test and CurrentDatabaseBaselinePostgresTest;query public index validity',['/tmp/edhr-page-q1-current-CurrentDatabaseBaselinePostgresTest.xml','/tmp/edhr-page-q1-current-DhrReviewPaginationPostgresTest.xml','/tmp/edhr-page-q1-database-observation.json','11changesets;2indisvalid indexes;ICU root153.136;not all134 historical SQL replay'])
check('check.knowledge-89','ontology','独立实际知识检查89全过','automated-test','bash /workspace/.edhr-cloud-tools/mvn-edhr -f tools/knowledge-model/pom.xml test',['/tmp/edhr-page-q1-knowledge-command.json','/tmp/edhr-page-q1-knowledge-summary.json','/tmp/edhr-page-q1-knowledge.xml'])
check('check.fixed-inventory-and-a23','documentation','四固定清单逐字节重建及A23/覆盖/全审队列有限边界','command','python3 scripts/build-branch-review-inventory.py --ref '+base+' --out /tmp/edhr-page-q1-inventory',['/tmp/edhr-page-q1-provenance.json','/tmp/edhr-page-q1-inventory/inventory-summary.json','6017paths/134migrations/464HTTP/216routes only inventory;6A23/6changed2added;wholeFile0/unique null;old queues retained'])
check('check.exact-final-test-old-control','regression','最终测试整类字节一致移植到真实旧源，单条预期断言红非运行错误','automated-test','Run exact frozen DhrReviewPaginationPostgresTest#unrelatedHistoryDoesNotIncreaseStatementsOrTransferredRows on isolated old '+base,['/tmp/edhr-page-q1-old-command.json','/tmp/edhr-page-q1-old-summary.json','/tmp/edhr-page-q1-old-observation.json','/tmp/edhr-page-q1-old-copied-test.java','1true assertion failure,0error/skip;84SQL/5309rows;personal21;current1SQL/20rows'])
check('check.mixed-index-plans','regression','独立11组原生混合任务计划、实际索引使用和规模边界','command','Compile exact archived EdhrDhrPageIndexProbe.java outside repository and run on QA-owned PG after146',['/tmp/edhr-page-q1-index-command.json','/tmp/edhr-page-q1-index/observations.json','/tmp/edhr-page-q1-index/trial-index-sizes.json','/tmp/edhr-page-q1-inspection.json','50kDHR+100knonDHR pending;pending partial useful,82done existingindex,49900done newordered index;50kallpending still~1.4s observation notSLA'])
check('check.authored-whitespace','documentation','14手写路径空白检查通过，原始XML/log保持不清洗','command','git diff --check base head -- <14 authored paths outside evidence/inventory>',['/tmp/edhr-page-q1-provenance-whitespace.txt','/tmp/edhr-page-q1-provenance.json'])
check('check.owned-resource-cleanup','database','自有PG与隔离旧树已清理确认，不触共享资源','command','docker stop <QA-owned container>;docker inspect <same>;remove own old-worktree artifacts then git worktree remove',['/tmp/edhr-page-q1-cleanup.json','/tmp/edhr-page-q1-old-cleanup.json','RemovedConfirmed=true;noforce;repository remainsclean testedhead'])
quality={'result':'passed','baseCommit':base,'headCommit':head,'contractBaseline':{'sourceCommit':head,'targetBranch':'edhr-dev','targetCommit':base,'contractReadCommit':head,'uncommittedContractPaths':[]},'workingTreeState':{'status':'clean','includedPaths':[],'excludedPaths':[],'untrackedPaths':[]},'knowledgeBaselineVersion':'0.3.25','checks':checks,
 'findings':[{'id':'QF-DHR-PERSONAL-LIST-UNBOUNDED-JAVA-READ','severity':'medium','scope':'DhrReviewService.list','summary':'既有个人页按64条遍历全部DHR任务并在Java计数取页，已通过DB过滤/总数/分页和轻投影有限修复。','reproductionSteps':['Use the exact frozen final native capacity test class with old base '+base,'Seed same309default-tenant original tasks plus5000other tasks;query current-user page20'],'expectedResult':'等价个人结果、当前页20行，一次数据库请求且应用不搬运全部任务。','actualResult':'Old84SQL/5309rows vs tested current1SQL/20rows,personal total21;actualold assertion failure only.','evidence':['/tmp/edhr-page-q1-old-command.json','/tmp/edhr-page-q1-old-observation.json','/tmp/edhr-page-q1-observation.json'],'resolutionStatus':'resolved','resolutionEvidence':[{'type':'commit','reference':head},{'type':'command','reference':'/tmp/edhr-page-q1-current-summary.json'},{'type':'command','reference':'/tmp/edhr-page-q1-old-summary.json'}]}],
 'residualRisks':[{'id':'risk.large-active-count-and-search','description':'5万同时待审仍有JSON候选过滤/准确COUNT开销；深OFFSET和跨表任意子串不被两个索引变成常量工作。','impact':'本轮消除全局Java搬运与往返，不是全规模/生产SLA或堆峰值认证。','mitigation':'按实际活跃量/本人比例/搜索负载继续量化，再讨论规范投影或专用搜索索引，不直接增读模型。'},
 {'id':'risk.runtime-capability','description':'实际验证PG16.15、ICU root153.136；部署目标库未连接，ICU/JDK升级及PG14未执行认证。','impact':'关键词依赖ICU root前置，缺失会HALT；并发建索引仍需IO/事务等待，失败可能留下invalid索引。','mitigation':'部署前核ICU及迁移版本/索引状态；按明确恢复流程处理失败，不用IF NOT EXISTS吞错；版本升级重跑等价矩阵。'},
 {'id':'risk.finite-matrix-and-existing-highs','description':'两旧DHRhigh、全部外部质量事实/普通权限UI/账号状态/接收人及A12/四gap未关闭。新测试是原生SQL/服务和迁移，不含浏览器/socket/login-RBAC或所有Unicode/JSON可能输入。','impact':'本批通过不代表DHR全链、全项目审计或发布认证。','mitigation':'保持既有待审台账，继续按原始规则分批审查，不新增自动质判或权限政策。'},
 {'id':'risk.shared-index-and-global-audit','description':'done部分索引承担所有共享流程符合状态的写入/存储成本；固定6017/134只是盘点，wholeFile0/unique未知，666/44/183、旧A23/W6含旧已审/W7、ACL三问、文件一致性与朋友页/生产弹窗暂缓继续。','impact':'局部代码/计划不能外推全部共享表生产分布或关闭全局待审。','mitigation':'保持所有旧索引和队列，跟随真实数据选择计划；PR50独立未合入及后续目标增量须重新集成验证。'}],
 'blockingConditions':[]}
assert len(checks)==13 and all(x['required'] and x['outcome']=='passed' for x in checks)
(prefix/'edhr-page-q1-quality-result.yaml').write_text(yaml.safe_dump({'qualityResult':quality},allow_unicode=True,sort_keys=False,width=100))
now=datetime.now(ZoneInfo('Asia/Shanghai')).isoformat()
report=f'''# 独立最终质量复验

FINAL：passed，13/13必需检查通过。完成时间：{now}（Asia/Shanghai）。实际干净受测提交`{head}`，最新目标`{base}`。本实例未参与产品、测试、夹具或迁移修复；只读辅助角色已FINAL，其证据不代替本报告。

独立单次146/146通过：native99（真实PG JSONB/Unicode/分页oracle及Liquibase升级→回滚两条→重放）、完整应用26（真实退回→重提→批准后个人列表）、服务12、生命周期6、安装基线3；0失败/错误/跳过，XML时间戳均为本次。另独立知识89/89通过，不合计为唯一语义覆盖。双URL为本QA自有两个隔离库，基线schema清理与业务回归未混库。public实际11changeset、两新索引indisvalid=true，PG16.15/en_US.utf8/ICU153.136。134只是历史SQL盘点，不叫全历史迁移回放。

同一最终测试整类按字节/SHA移植至真实旧目标，只运行capacity方法，1条真实SQL次数断言失败、0error/skip：旧84次SQL/5309行，当前1次SQL/20行，个人总数均21。旧copied-test原件与command含同源hash，旧源文件按实际base保留；不是使用旧报告或编造红控。已知Java全体搬运问题按当前有限范围resolved，无新open发现。

独立重跑11组混合计划：5万DHR历史+10万不关联DHR的共享待办条目。待审小索引使用且buffer1955→1225，单人82已审仍使用原assignee索引；49900已审采用新ID顺序索引，buffer4433→2459。试验体积16KiB与2506752bytes。5万同时待审依然约1.4s的受控观测，不能以一条SQL称数据库没有重复工作或全部规模解决；时延受缓存/统计/并行环境影响，不用作生产SLA或回归阈值。trial与正式索引列/谓词一致，正式CONCURRENTLY/独立changeset及ICU前置实际迁移测试通过。

源码核资格优先级、当前/已办身份、NULL/JSON类型CASE、参数绑定、字面百分号/下划线/反斜线及Unicode、long偏移和空页总数；单语句MVCC使总数与页使用同一次读取快照，轻投影保留project需要的别名，详情/动作/锁/签署/冻结不改。四H2列表断言已迁原生矩阵与真实PG生命周期，原工作流/电子签署/历史冻结断言保留。五表canonical查询夹具不认证全FK/业务模型；完整应用另跑，未冒称浏览器/socket/login-RBAC或全部账号/收件人认证。

125主侧/本体原件（16gzip）的raw/stored双哈希、9snapshot、r2的25指纹及330未改知识通过；r1包SHA保留为历史，r2用于当前。四固定清单重建字节一致，6017paths/134SQL/464HTTP/216route只盘点；14手写路径空白检查通过，XML/log原件不清洗。14既有ID=12有限consistent+2旧gap，本体r2NA/FINAL；两个既有DHRhigh继续open。六项A23必要性与具体拆分边界合理，old856+feature1/SQL130+前4新/本次0091、6改2增及所有历史overlay仍W6全量含旧已审/W7，不报全局唯一覆盖。

当前可合入这批查询与索引优化；不是全量审计完成或发布认证。PR50仍为独立未合入分支，后续集成/目标变化需按实际候选复验。ICU运行前置及版本、共享索引写入/空间、并发建索引失败恢复和大活跃COUNT/搜索边界均需保留。外部质量事实/全部UI/账号/收件人、ACL三问、文件DELETE/UNKNOWN/DHR回调、A12/四gap、朋友签署页/生产弹窗暂缓不自动关闭。

仅清理自有PG容器与明确创建的旧工作树，均确认不存在，没有force或共享资源操作。结束前fetch目标仍原base，仓库干净原受测head；未修改任何仓库路径、未查询/触发CI、未merge/deploy或恢复历史。

正式结果`/tmp/edhr-page-q1-quality-result.yaml`，全部原件见`/tmp/edhr-page-q1-manifest.json`。结果冻结后不再改原件；若业务/测试/知识或集成目标变化，应按受影响范围重新评估。
'''
(prefix/'edhr-page-q1-quality-review.md').write_text(report)
files=[]
for p in sorted(prefix.glob('edhr-page-q1-*')):
    if p.is_file() and p.name!='edhr-page-q1-manifest.json':files.append(p)
    elif p.is_dir() and p.name in ['edhr-page-q1-index','edhr-page-q1-index-source','edhr-page-q1-inventory']:
        files.extend(x for x in sorted(p.rglob('*')) if x.is_file())
manifest={'roleState':'FINAL','qualityResult':'passed','testedCommit':head,'targetCommit':base,'requiredPassed':13,'requiredTotal':13,'capturedAt':now,
 'artifacts':[{'path':str(p),'bytes':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()} for p in files]}
(prefix/'edhr-page-q1-manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
for x in manifest['artifacts']:
    p=Path(x['path']);assert p.stat().st_size==x['bytes'] and hashlib.sha256(p.read_bytes()).hexdigest()==x['sha256']
print(json.dumps({'result':'passed','requiredPassed':13,'originals':len(files),'includingManifest':len(files)+1,'manifestSha256':hashlib.sha256((prefix/'edhr-page-q1-manifest.json').read_bytes()).hexdigest(),'testedCommit':head}))
