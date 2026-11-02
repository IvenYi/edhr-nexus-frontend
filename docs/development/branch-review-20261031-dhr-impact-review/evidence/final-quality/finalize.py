from pathlib import Path
import hashlib, json, subprocess, datetime, zoneinfo, yaml

root=Path('/workspace/edhr-nexus-frontend')
base='1ad6300918bd0059049eab3c415ca31162dd5115'
head='977287f6da3ba1cb78c4eb2842f3ace69bb1f43b'
batch=root/'docs/development/branch-review-20261031-dhr-impact-review'
prefix=Path('/tmp')
def git(*args):return subprocess.check_output(['git',*args],cwd=root,text=True).strip()
assert git('rev-parse','HEAD')==head
assert git('rev-parse','origin/edhr-dev')==base
assert not git('status','--porcelain')
assert not git('diff','--name-only',base,head,'--','gmp-platform/backend/src/main','gmp-platform/frontend/src','docs/knowledge','AGENTS.md','codeplzreadme.md','docs/agents')
current=json.loads((prefix/'edhr-dhr-q1-current-summary.json').read_text())
knowledge=json.loads((prefix/'edhr-dhr-q1-knowledge-summary.json').read_text())
runtime=json.loads((prefix/'edhr-dhr-q1-runtime-observation.json').read_text())
provenance=json.loads((prefix/'edhr-dhr-q1-provenance.json').read_text())
cleanup=json.loads((prefix/'edhr-dhr-q1-cleanup.json').read_text())
assert current['totals']==dict(tests=52,failures=0,errors=0,skipped=0) and current['exit']==0
assert knowledge['totals']==dict(tests=89,failures=0,errors=0,skipped=0) and knowledge['exit']==0
assert runtime['httpResponseCount']==39 and runtime['allExpectedStatusesMatched']
assert provenance['result']=='passed' and cleanup['removedConfirmed']
rows=[json.loads(x) for x in (prefix/'edhr-dhr-q1-capacity.txt').read_text().splitlines() if x.startswith('{')]
assert len(rows)==3
for row,total,calls in zip(rows,[21,521,5021],[2,10,80]):
    assert row['allTasks']==total and row['taskRowsLoaded']==total and row['returned']==20 and row['personalTotal']==21 and row['listSqlCallsIncludingEmptyTerminator']==calls

observations={
 'roleState':'FINAL','headCommit':head,'baseCommit':base,'contractReadCommit':head,
 'workingTreeClean':True,'independence':'No product, test, fixture, knowledge or contract changes; new QA instance. Internal provenance helper read-only and FINAL.',
 'productChangedPaths':[],
 'sourceInspection':[
  {'path':'gmp-platform/backend/src/main/java/com/zencas/edhr/production/service/DhrReviewService.java','symbols':['list','detail','act','eligible','handled'],'conclusion':'menu and action controller requirements separate from task identity; handled reader gets frozen version; stale sources/manual checks/locks stay; list batches64 but traverses all tasks'},
  {'path':'gmp-platform/backend/src/main/java/com/zencas/edhr/production/controller/DhrReviewController.java','symbols':['list','detail','audit','act'],'conclusion':'class requires menu; act explicitly menu AND action; detail/audit resolve personal task, does not infer privilege from submitter'},
  {'path':'gmp-platform/backend/src/main/java/com/zencas/edhr/production/service/DhrSummaryService.java','symbols':['version','submit','validateFrozenFormFiles'],'conclusion':'freeze actual evidence plus manual review; submitted_by_id actual audit identity; version reads frozen values; full digest verified; no automatic quality interpretation'},
  {'path':'gmp-platform/backend/src/main/java/com/zencas/edhr/production/service/DhrFrozenEvidenceIntegrity.java','symbols':['verify','verifyVersionDigest'],'conclusion':'member/source/hash and full reconstructed version digest includes checkResult'},
  {'path':'gmp-platform/backend/src/main/java/com/zencas/edhr/production/service/DhrEvidenceImpactService.java','symbols':['requireRecordControlAllowed','requireNoPendingApplications','sourceEffective','changes'],'conclusion':'bilateral in-review guard, real result event impact, recipient IDs and frozen source JSON/status/revision/member/attachment comparisons'},
  {'path':'gmp-platform/backend/src/main/java/com/zencas/edhr/production/service/DhrImpactNotificationService.java','symbols':['list','read'],'conclusion':'actor recipient ID plus default tenant, long offset; notice read does not grant DHR page rights'},
  {'path':'gmp-platform/backend/src/main/java/com/zencas/edhr/recordcontrol/service/RecordControlService.java','symbols':['submit','applyResult','applyChange','applyObsolete','updateExecution','lockSource'],'conclusion':'approved source and current contribution switch plus impact/notice share result transaction, work-order/object/execution/record locks; no history restore'},
  {'path':'gmp-platform/backend/src/main/java/com/zencas/edhr/identity/security/JwtAuthenticationFilter.java','symbols':['doFilterInternal'],'conclusion':'actual filter validates JWT claims; new tests do not exercise login/RBAC issuance, disabled/locked/revoked-user policy, or current DB-state recheck. No new policy inferred.'}
 ],
 'semanticAnchorsIndependentlyRead':['DEC-0063-04','DEC-0063-05','DEC-0063-14','DEC-0068-05','DEC-0068-06','DEC-0068-07','DEC-0068-11','DEC-0068-12','DEC-0068-13','DEC-0068-14','DEC-0087-02','DEC-0087-05','docs/knowledge/evidence/dhr-summary-user-confirmed.md:107-119'],
 'ontologyLedgerBoundary':'24 existing IDs =18 consistent +6 evidence-gap in ontology ledger; checked provenance/status and affected policy subset, not 24 new unique semantic audit completions',
 'runtime':current,'knowledge':knowledge,'http':runtime,'capacity':rows,
 'migrationBoundary':'Fresh owned PostgreSQL actual application Liquibase applied 9 changesets from canonical schema/seed and 0087-0090. Inventory134 is historical file count, not all134 migration replay.',
 'a23Boundary':'Five finite method judgments inspected; wholeFile0, unique null; historical856+feature1, SQL130+4new, all overlays and666/44/183 pending; concrete extraction proposals are future boundaries, not implemented refactor.',
 'knownHighsRemainOpen':['discrepancy.dhr-review-complete-evidence-impact-gap','discrepancy.dhr-review-effective-source-integration'],
 'cleanup':cleanup,
 'excluded':['browser/UI and real socket HTTP','all account states/recipients/attachment permissions','independent authoritative external quality facts contract','production SLA/PG plan/heap peak','full system release or whole audit completion','CI/Actions queries and triggers']}
(prefix/'edhr-dhr-q1-inspection.json').write_text(json.dumps(observations,ensure_ascii=False,indent=2)+'\n')

def check(id,category,description,method,command,evidence):
 return dict(id=id,required=True,category=category,description=description,method=method,command=command,outcome='passed',evidence=evidence)
checks=[
 check('check.baseline-and-test-only-delta','documentation','实际候选包含最新目标，干净且产品/知识/契约无改','command','git fetch origin edhr-dev; git rev-parse HEAD origin/edhr-dev; git diff --name-only base head', ['/tmp/edhr-dhr-q1-inspection.json',f'base={base}; tested head={head}; clean']),
 check('check.confirmed-quality-boundary','requirements','人工检查凭证与客观来源变化分界，无新增自动质量或放行政策','inspection','Read DEC0063-04/05/14, DEC0068-05/06/07/11/12/13/14, DEC0087-02/05 and original user confirmation against source symbols', ['/tmp/edhr-dhr-q1-inspection.json','docs/knowledge/evidence/dhr-summary-user-confirmed.md:107-119']),
 check('check.ontology-and-original-provenance','ontology','本体NA/FINAL、有限ID及330知识和原件指纹保持','command','python3 /tmp/edhr-dhr-q1-provenance.py', ['/tmp/edhr-dhr-q1-provenance.json','17 primary originals;10 ontology including manifest;330 unchanged knowledge;24 IDs18consistent6gap']),
 check('check.task-authority-and-frozen-source-inspection','security','源码核个人任务/已办、通知ID隔离、原冻结及双向阻断','inspection','Read controller annotations and DhrReviewService/DhrSummaryService/DhrFrozenEvidenceIntegrity/DhrEvidenceImpactService/RecordControlService/DhrImpactNotificationService affected methods', ['/tmp/edhr-dhr-q1-inspection.json','No product fix claimed; no full account-state certification']),
 check('check.native-postgres-and-adjacent-regression','integration','独立PG完整应用及相邻DHR测试一次52全过','automated-test','bash /workspace/.edhr-cloud-tools/mvn-edhr -f gmp-platform/backend/pom.xml -Dtest=RecordControlPostgresIntegrationTest,DhrReviewServiceTest,DhrReviewLifecycleIntegrationTest -Dedhr.audit.dhrHttpOutput=/tmp/edhr-dhr-q1-http.jsonl test', ['/tmp/edhr-dhr-q1-current-summary.json','/tmp/edhr-dhr-q1-current-command.json','/tmp/edhr-dhr-q1-current-test.txt','/tmp/edhr-dhr-q1-database-observation.txt','34 PG includes9 new +12 service+6 lifecycle=52; 0 failure/error/skip; fresh Liquibase9 changesets, not all134 historical files']),
 check('check.ordinary-jwt-mvc-matrix','api','7组权限身份及2条提醒/冻结历史链实际39响应全部匹配','automated-test','Inspect actual JSONL emitted by unchanged full application MockMvc/JWT tests and JUnit assertions', ['/tmp/edhr-dhr-q1-http.jsonl','/tmp/edhr-dhr-q1-runtime-observation.json','39 responses:17x200,1x400,5x401,16x403;9 new test executions; active ordinary accounts and JWT claims, not login/browser/socket']),
 check('check.knowledge-validation','ontology','独立运行知识89全过，不代替全量语义审计','automated-test','bash /workspace/.edhr-cloud-tools/mvn-edhr -f tools/knowledge-model/pom.xml test', ['/tmp/edhr-dhr-q1-knowledge-summary.json','/tmp/edhr-dhr-q1-knowledge-test.txt','89 tests,0failure/error/skip;0.3.25 unchanged']),
 check('check.fixed-inventory-rebuilt','documentation','四份固定目标清单逐字节重建一致，仅盘点','command','python3 scripts/build-branch-review-inventory.py --ref '+base+' --out /tmp/edhr-dhr-q1-inventory', ['/tmp/edhr-dhr-q1-provenance.json','/tmp/edhr-dhr-q1-inventory/inventory-summary.json','6017 paths/134 migrations/464 HTTP annotations/216 route candidates, no coverage certification']),
 check('check.capacity-mechanism-observation','regression','独立复现64分批但全量遍历的增长机制，未优化','command','Compile exact archived EdhrDhrReviewCapacityProbe.java outside repository and invoke actual list using H2 test configuration', ['/tmp/edhr-dhr-q1-capacity-command.json','/tmp/edhr-dhr-q1-capacity.txt','personal21/page20:21,521,5021 loaded rows and2,10,80 SQL including empty terminator; controlled same-version H2 only']),
 check('check.a23-and-progress-boundary','documentation','具体抽取方案与过防御判断有限，旧high/覆盖/队列不虚假关闭','inspection','Read source-review.json/review-notes.md/NEXT.md and compare pending ledgers with previous batch', ['/tmp/edhr-dhr-q1-inspection.json','/tmp/edhr-dhr-q1-provenance.json','five A23 method judgments,wholeFile0,unique null;666/44/183 and all historical W6/W7 overlays remain pending']),
 check('check.authored-whitespace','documentation','六手写路径空白检查通过，原始XML/log不清洗','command','git diff --check '+base+' '+head+' -- <six authored paths outside evidence/inventory>', ['/tmp/edhr-dhr-q1-inventory/whitespace.txt','/tmp/edhr-dhr-q1-provenance.json']),
 check('check.qa-owned-resource-cleanup','database','只清理本质量实例PG并确认不存在','command','docker stop <owned container>; docker inspect <owned container>', ['/tmp/edhr-dhr-q1-db.json','/tmp/edhr-dhr-q1-cleanup.json','Owned container removed, no temporary worktree created; no shared DB/container touched'])
]
risks=[
 dict(id='risk.known-dhr-highs-not-closed',description='两项既有DHR high仍open：完整质量事实/变化比较及全部普通权限UI、账号状态和收件人矩阵。本批只补有限测试证据。',impact='本批通过不能作为DHR全链、合规放行或全项目发布认证。',mitigation='按真实权威事实与剩余矩阵继续分批审查；不从人工checkResult发明自动质判。'),
 dict(id='risk.list-global-scan',description='个人DHR页仍遍历全部任务，容量机制独立复现；detail重复影响读取、附件/逐版本投递容量候选继续。',impact='历史任务增多使SQL往返、读取和CPU增长；未测生产时延、PG计划或堆峰值。',mitigation='先讨论等价DB筛选/计数/分页，明确授权后优化并证明权限、关键词和排序等价；本批不实施。'),
 dict(id='risk.identity-and-ui-coverage',description='新测试用真实JWT claims+MockMvc及ACTIVE账号，不包含登录/RBAC签发、停用锁定撤销、多租户及完整浏览器/所有附件权限。',impact='不能外推为完整账号即时状态或UI验收；JWTFilter仅claim验证是后续审查入口，不擅定撤销政策。',mitigation='后续定位已确认身份契约并补独立矩阵，保留任务签署页朋友负责范围。'),
 dict(id='risk.global-audit-and-deferred-work',description='6017盘点非已审；wholeFile0/unique未知，666/44/183、W2余项、全部W6/A23旧已审复核及W7增量、ACL三问、DELETE/UNKNOWN/DHR附件回调、A12及四gap仍待审/待决。',impact='不能声称整体审计结束或全部业务一致。',mitigation='继续版本化台账，每次fetch核新代码增量，已暂缓生产弹窗/朋友任务签署页不私自修改。')]
result={'qualityResult':{'result':'passed','baseCommit':base,'headCommit':head,'contractBaseline':{'sourceCommit':head,'targetBranch':'edhr-dev','targetCommit':base,'contractReadCommit':head,'uncommittedContractPaths':[]},'workingTreeState':{'status':'clean','includedPaths':[],'excludedPaths':[],'untrackedPaths':[]},'knowledgeBaselineVersion':'0.3.25','checks':checks,'findings':[],'residualRisks':risks,'blockingConditions':[]}}
(prefix/'edhr-dhr-q1-quality-result.yaml').write_text(yaml.safe_dump(result,allow_unicode=True,sort_keys=False))
now=datetime.datetime.now(zoneinfo.ZoneInfo('Asia/Shanghai')).isoformat()
text=f'''# 独立最终质量复验

FINAL：passed，12/12必需检查通过。完成时间：{now}（Asia/Shanghai）。受测干净提交 `{head}`，目标 `{base}`。本实例未参与产品、测试或夹具修复；辅助只读证据角色已FINAL，其结果不替代本报告。

本批仅测试和审计证据，产品、知识、契约零改动。可合入本批验收增量；不代表全项目或DHR全链可以发布，也不关闭两项既有DHR high。

独立实际运行单次52项：完整应用PG34（含新增9）、DHR服务12、DHR生命周期6，0失败/错误/跳过。另独立知识89项同样全过，两次命令不合算唯一业务覆盖。39份实际JWT/MVC响应全部匹配：200为17、400为1、401为5、403为16。核菜单/动作/任务身份、同名通知隔离、通知不授页面权限、批准后来源变化而旧冻结值/批准保留及不能重复批准。JWT为真实过滤器和控制器处理的签发claims；没有浏览器、真实网络套接字、登录/RBAC签发、停用锁定账号或全部收件人矩阵认证。

自建PG16.15只发布loopback，真实应用Liquibase运行canonical schema/seed及0087—0090共9changesets；134只是历史SQL盘点，未声称全历史迁移回放。初次启动pg_isready曾命中临时初始化服务、目标库尚未创建；该次未执行测试，改以真实目标库psql成功确认就绪，未改产品/测试。主侧首轮8夹具SQL errors原件保持，不是本轮产品红控，也未编造旧代码红。

本体NA/FINAL原件及330知识指纹相符。逐ID台账24=18有限consistent+6evidence-gap，原始质量人工核查确认及当前来源整值/摘要机制相符；不新增自动质判，不将checkResult确认时间重算比较。两旧high仍open。原件17主侧、10本体含manifest和全部source指纹均按bytes/SHA核对，四清单重建原样相同（6017/134/464/216只盘点），六手写路径空白检查通过；原始XML/log空白没有清洗。

容量探针独立执行实际list：个人total21/page20，系统任务21/521/5021时分别加载21/521/5021行，2/10/80次SQL（含空终止）。确认64分批有界但每次仍全量遍历，未证明全行同时驻留内存；仅H2同一版本合成机制实验，不是PG计划、生产时延或堆峰值。该风险先讨论，未修改实现。

具体拆分责任方案和5项A23判断已核；必要hash/锁/任务身份/人工检查不应当过度防御删除。整文件完成0、unique未知，旧856+feature1/SQL130+4新、666/44/183及全部历史overlay继续W6/W7待审。文件ACL三规则、DELETE/UNKNOWN/相邻DHR回调、A12剩余与四gap、朋友签署页和生产弹窗边界不关闭。全量审计仍在W3/W4/W5交叉推进。

已仅停止本QA拥有的容器并确认不存在，未建立临时工作树，仓库仍干净受测提交。未修改任何仓库路径、未查询/触发CI、未merge/deploy或恢复历史。

正式结果 `/tmp/edhr-dhr-q1-quality-result.yaml`；原始执行和辅助原件见 `/tmp/edhr-dhr-q1-manifest.json`，所有文件均带字节数与SHA256。后续若修改产品/测试/知识或集成目标发生变化，应按受影响范围重新评估，不能直接沿用本结果。
'''
(prefix/'edhr-dhr-q1-quality-review.md').write_text(text)
files=[]
for p in sorted(prefix.glob('edhr-dhr-q1-*')):
 if p.is_file() and p.name!='edhr-dhr-q1-manifest.json': files.append(p)
 elif p.is_dir() and p.name in ['edhr-dhr-q1-inventory','edhr-dhr-q1-capacity-src']:
  files.extend(x for x in sorted(p.rglob('*')) if x.is_file())
manifest={'roleState':'FINAL','qualityResult':'passed','testedCommit':head,'targetCommit':base,'requiredPassed':len(checks),'requiredTotal':len(checks),'capturedAt':now,'artifacts':[{'path':str(p),'bytes':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()} for p in files]}
(prefix/'edhr-dhr-q1-manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'result':'passed','requiredChecks':len(checks),'artifactsExcludingManifest':len(files),'singleRuntime52':current['totals'],'knowledge89':knowledge['totals'],'head':head,'clean':not git('status','--porcelain')},ensure_ascii=False))
