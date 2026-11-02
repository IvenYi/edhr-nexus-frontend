from pathlib import Path
import subprocess,json,hashlib,yaml
from datetime import datetime
from zoneinfo import ZoneInfo

root=Path('/workspace/edhr-nexus-frontend');prefix=Path('/tmp/edhr-pr51-q1-')
head='775d8bb664211b77a7172db0436a9b31715a5439';base='54c9a7ccfbb2a2a420f6f0e2f41636f4805cf67f'
prior='63f2244adcce90d944785c9e83617fff872e19c2'
def p(name):return Path(str(prefix)+name)
def read(name):return json.loads(p(name).read_text())
def git(*args):return subprocess.check_output(['git',*args],cwd=root,text=True).strip()
assert git('rev-parse','HEAD')==head and git('rev-parse','origin/edhr-dev')==base
assert not git('status','--porcelain')
native=read('current-summary.json');knowledge=read('knowledge-summary.json');prov=read('provenance.json')
assert native['exit']==0 and native['totals']=={'tests':155,'failures':0,'errors':0,'skipped':0}
assert len(native['suites'])==5 and all(s['freshXml'] for s in native['suites'])
assert knowledge=={'exit':0,'tests':89,'failures':0,'errors':0,'skipped':0}
assert prov['roleState']=='FINAL' and prov['result']=='passed' and prov['headCommit']==head
capacity=read('capacity.json');assert capacity['sqlCalls']==1 and capacity['rowsTransferred']==20 and capacity['personalTotal']==21
database=read('database-observation.json');assert database['changeSets']==11 and len(database['indexes'])==2 and all(i['indisvalid'] for i in database['indexes'])
cleanup=read('cleanup.json');assert cleanup['removed'] and cleanup['inspectExit']!=0
rows=[json.loads(line) for line in p('http.jsonl').read_text().splitlines()]
assert len(rows)==39 and all(row['actualStatus']==row['expectedStatus'] for row in rows)
status={}
for row in rows:status[str(row['actualStatus'])]=status.get(str(row['actualStatus']),0)+1
runtime={'headCommit':head,'targetCommit':base,'clean':True,'httpResponses':len(rows),'allHttpStatusesExpected':True,'statusCounts':status,'capacity':capacity,'database':database,'reusedEvidenceBoundary':'Prior large index plans and old-source red control are not rerun; all backend src/main/migrations unchanged from prior PR51 is independently proven.'}
p('runtime-observation.json').write_text(json.dumps(runtime,ensure_ascii=False,indent=2)+'\n')
inspection={'headCommit':head,'targetCommit':base,'priorPr51':prior,'knowledgeBaselineVersion':'0.3.25','role':'Independent final QA, uninvolved in conflict resolution or any repairs',
 'sourceRead':['DhrReviewService.list/detail/act and SELECT/LIST_SELECT/FROM','DhrReviewController authority annotations and route adapters','RecordControlPostgresIntegrationTest personalDhrListsFollowActualReturnResubmitAndApproval and three ordinaryHttp/ordinaryHandled methods','DhrReviewPaginationPostgresTest compare/page capacity and Liquibase update/rollback/reapply','0091 concurrent indexes, ICU precondition and master inclusion','NEXT current integration overlay and both retained history blocks'],
 'semanticBoundary':'Pure integration does not trigger new ontology modeling; primary NA is appropriate under unchanged src/main, migrations, contracts and knowledge. Prior ontology result is limited prior evidence, not fresh whole-knowledge audit.',
 'coverageBoundary':'Actual new combined155 replaces neither old146 nor old52 originals; tests and parent assertions are retained, not weakened. Historical inventory1ad remains historical; no new global denominator claimed.',
 'notPerformed':['browser','socket HTTP','login/RBAC issuance certification','all account states/recipients','production database validation','new old-source red control','new large-scale index plans','new all-branch audit inventory','CI/Actions query or trigger','repository mutation or fixes','merge/push/deploy/history restore']}
p('inspection.json').write_text(json.dumps(inspection,ensure_ascii=False,indent=2)+'\n')
checks=[]
def check(id,category,description,method,command,evidence):
 checks.append({'id':id,'required':True,'category':category,'description':description,'method':method,'command':command,'outcome':'passed','evidence':evidence})
check('check.live-baseline-and-history','documentation','实际最新target、clean候选、merge双父和包含关系保持','command','git fetch origin edhr-dev; git rev-parse HEAD origin/edhr-dev; verify merge parents and ancestor relationships',[str(p('provenance.json')),str(p('inspection.json')),'target54c9a7cc;tested clean775d8bb6;merge b0c329c6 parents63f2244a/54c9a7cc'])
check('check.conflict-ledger-and-auto-test-merge','integration','NEXT双方记录完整保留、测试自动合并整文件相同且无冲突标记','command','git merge-file -p <prior> <common> <target>; compare bytes and retained NEXT top blocks',[str(p('provenance.json')),'72 target-added files preserved;4 combined test method definitions retained exactly once'])
check('check.unchanged-product-and-semantic-scope','ontology','业务/迁移/知识/契约字节保持，本次NA与既有原件有限复用边界正确','inspection','Compare all backend src/main, contracts, knowledge against prior63f; read integration decision and relevant DEC0068',[str(p('provenance.json')),str(p('inspection.json')),'No new business rule, knowledge replacement, maturity or global coverage claim'])
check('check.primary-raw-originals','documentation','15主侧原件raw/stored与原/tmp三方哈希匹配，旧报告未改写','command','Decode gzip when present and verify raw bytes/SHA256 plus stored bytes/SHA256',[str(p('provenance.json')),str(p('provenance-manifest.json'))])
check('check.combined-native-and-regression-155','integration','双独立PG库实际单次155全部通过，XML均本次fresh','automated-test','bash /workspace/.edhr-cloud-tools/mvn-edhr -f gmp-platform/backend/pom.xml -Dtest=DhrReviewPaginationPostgresTest,DhrReviewServiceTest,DhrReviewLifecycleIntegrationTest,RecordControlPostgresIntegrationTest,CurrentDatabaseBaselinePostgresTest -Dedhr.audit.dhrHttpOutput=/tmp/edhr-pr51-q1-http.jsonl -Dedhr.audit.dhrPageOutput=/tmp/edhr-pr51-q1-capacity.json test',[str(p('current-command.json')),str(p('current-summary.json')),str(p('current-test.txt')),'99 native+35 full application+12 service+6 lifecycle+3 baseline=155;0failure/error/skip'])
check('check.ordinary-jwt-http-and-page-bounds','api','39普通JWT/MVC响应符合预期，个人权限与冻结历史/当前页边界共存','automated-test','Inspect actual emitted JSONL and native capacity output from unchanged combined tests',[str(p('http.jsonl')),str(p('capacity.json')),str(p('runtime-observation.json')),'17x200,1x400,5x401,16x403;capacity1 SQL/20 rows/total21'])
check('check.migration-and-install-composition','database','索引升级/回滚/重放与新库/重复/旧基线升级在新组合通过','automated-test','Actual native Liquibase and CurrentDatabaseBaselinePostgresTest within single155; query pg_index and databasechangelog',[str(p('database-observation.json')),str(p('current-summary.json')),'11 changesets;two new indexes indisvalid=true;PG16.15/ICU153.136;not all historical SQL replay'])
check('check.knowledge-89','ontology','独立实际知识89项通过，不替代语义全盘审查','automated-test','bash /workspace/.edhr-cloud-tools/mvn-edhr -f tools/knowledge-model/pom.xml test',[str(p('knowledge-command.json')),str(p('knowledge-summary.json')),str(p('knowledge-test.txt'))])
check('check.authored-whitespace-and-history-boundaries','documentation','五个适用手写/自动合并路径空白检查通过，旧清单与残余不虚假关闭','command','git diff --check for five integration authored/merged paths; inspect historical inventory refs',[str(p('provenance.json')),str(p('provenance-whitespace.txt')),'Old inventory source1ad remains explicitly historical;whole-audit/high/ICU/scale and all deferred items retained'])
check('check.qa-owned-cleanup','database','只清理本质量实例的PG容器并确认absent','command','docker stop <owned container>;docker inspect <owned container>',[str(p('db.json')),str(p('cleanup.json')),'No worktree created by runtime QA;read-only auxiliary used and removed only its tmp merge-file inputs'])
risks=[
 {'id':'risk.scope-is-integration-only','description':'旧两DHR high、完整账号/UI/接收人、外部质量事实、A12/四gap及全审W6/W7仍未完成。','impact':'本次passed只认证已确认的合并候选，不构成整体发布或合规放行认证。','mitigation':'保留原台账及后续分批审查，不把155或知识89当全局唯一覆盖。'},
 {'id':'risk.scale-and-runtime-prerequisites','description':'原PR51大活跃JSON/COUNT/深页/关键词、共享索引写入/空间、ICU部署前置及并发索引失败恢复边界保留。','impact':'一条SQL和本次普通任务测试不能保证全部生产规模或目标生产库能力。','mitigation':'依据不变src/main字节有限复用原计划/红控，本轮不冒称重跑或生产DB核验；部署前满足ICU要求。'},
 {'id':'risk.http-is-jwt-mvc','description':'39实际响应使用真实JWT过滤器和MockMvc，未认证浏览器、网络socket、登录/RBAC签发、全部停用锁定账号和所有接收人。','impact':'不能外推为完整用户矩阵或UI验收。','mitigation':'按原明确范围继续补验，朋友任务签署页/生产弹窗、ACL三问及文件一致性暂缓不自动关闭。'},
 {'id':'risk.target-can-change','description':'本结果固定target54c9a7cc/head775d8bb6，未查询CI/Actions或强制状态检查配置。','impact':'后续目标或功能代码改变后原结果不自动覆盖新组合。','mitigation':'推送前再次fetch并核受影响范围，后续仅L0归档则按路径/字节校验说明复用。'}]
result={'qualityResult':{'result':'passed','baseCommit':base,'headCommit':head,'contractBaseline':{'sourceCommit':head,'targetBranch':'edhr-dev','targetCommit':base,'contractReadCommit':head,'uncommittedContractPaths':[]},'workingTreeState':{'status':'clean','includedPaths':[],'excludedPaths':[],'untrackedPaths':[]},'knowledgeBaselineVersion':'0.3.25','checks':checks,'findings':[],'residualRisks':risks,'blockingConditions':[]}}
p('quality-result.yaml').write_text(yaml.safe_dump(result,allow_unicode=True,sort_keys=False))
now=datetime.now(ZoneInfo('Asia/Shanghai')).isoformat()
report=f'''# PR51合并候选独立最终质量复验

FINAL：passed，10/10必需检查通过。完成时间：{now}（Asia/Shanghai）。实际干净受测`{head}`，目标`{base}`，合并保留63f2244a和54c9a7cc两父历史。本实例未参与冲突、产品、测试、夹具或迁移修复；只读辅助已FINAL，其证明不替代运行结果。

唯一文本冲突NEXT已保留双方原顶端区块并增加当前集成说明，无conflict marker。RecordControlPostgresIntegrationTest与独立git merge-file结果整文件逐字节一致，PR50三个方法（7参数场景+2测试）和PR51实际退回/重提/批准列表用例各一份；72个目标新增文件原样保留。全backend src/main（含迁移/配置）、知识与契约相对PR51原63f字节无差。本轮本体NA合理，没有新政策/知识替代；旧本体、计划与红控仅按不变源码有限复用，不称本轮重做。

独立实际单次155/155：99原生PG分页/JSON/Unicode与Liquibase升级回滚重放、35完整应用（含九个PR50执行场景）、12服务、6生命周期、3基线安装/升级保护；0失败/错误/跳过，XML均本次fresh。39份实际JWT/MVC响应匹配：17x200、1x400、5x401、16x403；容量仍1SQL/20行/personal21。另独立知识89/89全过，不加总为唯一业务或全盘语义覆盖。旧146和52的原件保持，不拿它们认证本组合。

QA自有PG16.15双数据库分开承载业务回归与baseline schema重置，均先用TCP真实目标SELECT1确认。记录库实际11changeset，两新索引indisvalid=true，ICU153.136。索引升级/回滚/重放及fresh/repeat/current-baseline-upgrade/reject-existing均在新155中实际通过；不声称所有历史SQL路径已回放。

15主侧原件按raw/stored及原/tmp字节/SHA三方核对，gzip可逆无清洗；5个适用手写/自动合并路径whitespace通过。旧6017/134清单明确仍是1ad历史ref，不冒称54c或新组合全盘覆盖；两旧DHRhigh、规模/ICU/全账号/UI/接收人/A12/四gap及其余历史队列继续。未执行浏览器/socket或生产库验证，未查询/触发CI。

已仅停止本QA容器并确认absent；未创建工作树、未改任何仓库文件、未merge/push/deploy或恢复历史。结束前fetch仍target54c，head775保持干净。可推送并合入当前冲突解决候选；若后续产品/测试/知识/目标变化，应重新评估受影响检查，不能自动延用本结果。

正式结果`{p('quality-result.yaml')}`；全部原件见`{p('manifest.json')}`，每项带bytes/SHA256。冻结后不再修改原件。
'''
p('quality-review.md').write_text(report)
artifacts=[]
for file in sorted(Path('/tmp').glob('edhr-pr51-q1-*')):
 if file.is_file() and file.name!='edhr-pr51-q1-manifest.json':
  raw=file.read_bytes();artifacts.append({'path':str(file),'bytes':len(raw),'sha256':hashlib.sha256(raw).hexdigest()})
manifest={'roleState':'FINAL','qualityResult':'passed','testedCommit':head,'targetCommit':base,'requiredPassed':len(checks),'requiredTotal':len(checks),'capturedAt':now,'artifacts':artifacts}
p('manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
for x in artifacts:
 b=Path(x['path']).read_bytes();assert len(b)==x['bytes'] and hashlib.sha256(b).hexdigest()==x['sha256']
print(json.dumps({'result':'passed','required':len(checks),'originalsIncludingManifest':len(artifacts)+1,'manifestSha256':hashlib.sha256(p('manifest.json').read_bytes()).hexdigest()},ensure_ascii=False))
