from pathlib import Path
import hashlib, json, subprocess, yaml, xml.etree.ElementTree as ET
from datetime import datetime, timezone

root=Path('/workspace/edhr-nexus-frontend')
prefix='/tmp/edhr-delete-qa-'
base='6ec9812f1bb1f7980654510f53c5fa568cfd83fb'
head='bd71f6cfb05f211863fcca4382d74445003aa26c'
def read(name): return json.loads(Path(prefix+name+'.json').read_text())
def save(name,data): Path(prefix+name+'.json').write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
def git(*args): return subprocess.check_output(['git',*args],cwd=root,text=True).strip()
current,old,knowledge,cleanup=map(read,['current-summary','old-summary','knowledge-summary','cleanup'])
assert current['exit']==0 and current['totals']=={'tests':84,'failures':0,'errors':0,'skipped':0}
assert old['exit']!=0 and old['totals']=={'tests':21,'failures':13,'errors':0,'skipped':0}
assert knowledge['exit']==0 and knowledge['totals']=={'tests':89,'failures':0,'errors':0,'skipped':0}
assert cleanup['oldTreeRemoved'] and cleanup['containerRemoved'] and cleanup['oldTreeCleanBeforeRemove']
assert cleanup['mainStatus']=='' and cleanup['mainHead']==head
assert git('rev-parse','HEAD')==head and git('rev-parse','origin/edhr-dev')==base and git('status','--porcelain')==''
Path(prefix+'source.diff').write_bytes(subprocess.check_output(['git','diff',base,head,'--','gmp-platform'],cwd=root))
source_path='gmp-platform/backend/src/main/java/com/zencas/edhr/compliance/controller/FileController.java'
source=(root/source_path).read_text()
baseline=subprocess.check_output(['git','show',base+':'+source_path],cwd=root,text=True)
guards=['if ("PRODUCTION_EXECUTION".equals(fileObject.getTargetType()))','if ("SIGNATURE_EVIDENCE".equals(fileObject.getTargetType()))']
assert all(g in source and g in baseline for g in guards)
assert source[source.index('    private void registerUploadedFile'):]==baseline[baseline.index('    private void registerUploadedFile'):]
assert source[:source.index('    // ======================== Delete')].replace('import java.io.UncheckedIOException;\n','')==baseline[:baseline.index('    // ======================== Delete')]
snapshot=read('evidence-check')
assert snapshot['status']=='FINAL'
cases=[]
for cls in ['FileDeleteTransactionIntegrationTest','FileDeleteTransactionPostgresTest','FileDeleteTransactionFailureTest']:
    for label in ['current','old']:
        e=ET.parse(prefix+label+'-'+cls+'.xml').getroot()
        for case in e.findall('testcase'):
            failures=case.findall('failure');errors=case.findall('error')
            cases.append({'run':label,'class':cls,'name':case.get('name'),'failed':bool(failures),'errored':bool(errors),'failureType':failures[0].get('type') if failures else None})
save('source-inspection',{'status':'FINAL','baseCommit':base,'headCommit':head,'readContractCommit':head,'productChange':'Only FileController.delete transaction orchestration and UncheckedIOException import','guardsTextPreserved':True,'uploadHelperByteTextUnchanged':True,'readUploadPrefixUnchangedExceptImport':True,'currentTests':current['totals'],'oldControl':old['totals'],'cases':cases,'a23Review':{'transactionRequired':'Real failure red cases demonstrate need; REQUIRED joins outer transaction rather than independent delete commit','unknownRetention':'Actual synchronization lifecycle test, synthetic doCommit failure; no guessing rollback','cleanupError':'Real nonempty directory IO error; propagated 500 after database already committed','noSpeculativeFramework':True,'performance':'Single ID lookup and deletion using existing PK and current persistence context; no newly introduced collection query, SQL loop, N+1, in-memory paging or index requirement; no measured SLA claim','extraction':'FileDeletionService owns transaction/guards/completion; FileReadService resource reads; registration owns upload; shared policy awaits ACL decisions; no broad refactor done'},'ontologyReview':{'version':'0.3.25','schema':'1.2.0','result':'not-applicable','finiteExistingIds':9,'wholeFile':0,'newUnique':None,'sourceOnlyGuard':'SIGNATURE_EVIDENCE retained from code, not newly user-confirmed policy','DhrUnlink':'Separate active-flag/reason/audit flow preserves originals; no generic blanket-policy inference'},'excluded':'No complete concurrent binding/ACL/runtime browser/full migration certification; old queues remain open'})

def check(id,category,description,method,command,evidence):
    return {'id':id,'required':True,'category':category,'description':description,'method':method,'command':command,'outcome':'passed','evidence':evidence}
checks=[
check('check.baseline-contract','documentation','实际base/head、clean候选与已读契约无差异','inspection','git rev-parse; git status; git diff base head -- AGENTS.md docs/agents codeplzreadme.md',[prefix+'evidence-check.json',prefix+'source-inspection.json','target='+base+'; feature head=tested candidate='+head+'; no uncommitted contracts']),
check('check.scope-business-boundary','requirements','决策包L2影响与实现相符，无新增删除资格/ACL/历史恢复','inspection','Read decision package, source diff and applicable DEC0058/0063/0074',[prefix+'source-inspection.json','Existing target guards and separate DHR unlink retained; technical sequencing is inference']),
check('check.source-a23','regression','有限方法、事务生命周期、错误传播、A23及具体拆分方案核验','inspection','Review FileController.delete, actual transaction synchronization and unchanged upload/read helpers',[prefix+'source.diff',prefix+'source-inspection.json','Single-id bounded path, no new N+1/paging/SQL loop or schema/index; no global robustness claim']),
check('check.current84','integration','独立单次十二类84项，包括21删除执行及63既有回归','automated-test',' '.join(read('current-command')['cmd']),[prefix+'current-command.json',prefix+'current-summary.json',prefix+'current-test.txt','84 tests, 0 failures/errors/skips; fresh twelve XML; actual H2 and native PostgreSQL']),
check('check.native-commit','database','原生PG真实COMMIT延迟约束拒绝保留记录/原件','automated-test','FileDeleteTransactionPostgresTest.deferredForeignKeyFailureAtActualCommitPreservesOriginal',[prefix+'current-FileDeleteTransactionPostgresTest.xml',prefix+'current-database.json','Canonical file_object DDL/PK plus test-only FK injection, not production FK policy or full migrations']),
check('check.http-protection-outcome','api','真实JWT/filter/MVC与磁盘，原保护保留，提交后清理失败500且DB已删','automated-test','FileDeleteTransactionIntegrationTest + FileHttpBoundaryTest',[prefix+'current-FileDeleteTransactionIntegrationTest.xml',prefix+'current-FileHttpBoundaryTest.xml','Not browser, socket/server or complete object/RBAC/tenant ACL certification']),
check('check.synthetic-unknown','unit','启动不可用及合成提交UNKNOWN下原件保留','automated-test','FileDeleteTransactionFailureTest',[prefix+'current-FileDeleteTransactionFailureTest.xml','Actual AbstractPlatformTransactionManager synchronization lifecycle; not real network disconnect or crash recovery']),
check('check.old-counterfactual','regression','同源最终三类21执行旧源控制为13断言红8正，无环境error/skip','automated-test',' '.join(read('old-command')['cmd']),[prefix+'old-source.json',prefix+'old-command.json',prefix+'old-summary.json',prefix+'old-test.txt','Tests copied verbatim from tested head to actual old '+base+'; previous vite failure retained separately and not counted as red']),
check('check.knowledge89','ontology','独立实际知识89项结构/引用等校验通过','automated-test',' '.join(read('knowledge-command')['cmd']),[prefix+'knowledge-command.json',prefix+'knowledge-summary.json',prefix+'knowledge-test.txt','89 tests, 0 failures/errors/skips; not all-ID semantics']),
check('check.limited-ontology','ontology','9既有ID有限保留边界与本体NA/FINAL核验、330知识不变','inspection','Review ontology result/finite semantic record against cited original decisions and source',[prefix+'source-inspection.json',prefix+'evidence-check.json','9 finite re-reviewed IDs; wholeFile0, newUnique unknown; SIGNATURE_EVIDENCE code evidence only; maturity/P0 unchanged']),
check('check.original-evidence','documentation','59归档原件raw/stored、6源码快照、本体12+manifest及24源指纹一致','command','Independent artifact hashes, decompression and source fingerprint comparison',[prefix+'evidence-check.json','Subordinate read-only evidence verifier FINAL passed; 1453 boolean checks passed']),
check('check.fixed-inventory','documentation','固定base重建四份盘点逐字节一致','command','python3 scripts/build-branch-review-inventory.py --ref '+base+' --out /tmp/edhr-delete-qa-evidence-inventory',[prefix+'evidence-check.json','6370 paths/135 SQL/464 HTTP/216 routes are inventory, not whole-file audit coverage']),
check('check.resource-cleanup','documentation','仅自有PG和旧worktree已清理，主树clean；失败编排原件保留','inspection','docker inspect own resource; git worktree remove own clean tree; git status',[prefix+'cleanup.json',prefix+'attempt1-failure.json',prefix+'attempt1-removal-observation.json',prefix+'run2-output.txt',prefix+'attempt2-cleanup.json',prefix+'attempt3-old-test.txt',prefix+'attempt3-cleanup.json','First two DB metadata/readiness probes and old vite dependency failure occurred before product assertions, not product red; no CI/Actions queried or triggered'])
]
findings=[
{'id':'QF-FILE-DELETE-ORIGINAL-LOSS','severity':'high','scope':'FileController.delete database failure and outer transaction outcome','summary':'旧源在数据库拒绝或回滚前已不可逆删除磁盘原件；当前仅确认提交后清理','reproductionSteps':['Use canonical file_object row plus actual original','Refuse DELETE by SQL or deferred COMMIT FK, inject beforeCommit failure, or roll back outer transaction','Inspect row and exact original bytes after final transaction outcome'],'expectedResult':'Database rollback/refusal retains registered original; deletion in outer transaction waits for actual commit','actualResult':'Old source13 total red includes these lost-original assertions; fixed current same21 all pass','evidence':[prefix+'old-summary.json',prefix+'old-test.txt',prefix+'current-summary.json',prefix+'source-inspection.json'],'resolutionStatus':'resolved','resolutionEvidence':[{'type':'commit','reference':head},{'type':'command','reference':prefix+'current-summary.json'},{'type':'document','reference':prefix+'source-inspection.json'}]},
{'id':'QF-FILE-DELETE-FALSE-SUCCESS','severity':'medium','scope':'FileController.delete post-commit filesystem cleanup result','summary':'旧源吞磁盘IO异常仍返回200；当前明确500并记录ID/path，此时DB已提交','reproductionSteps':['Replace registered original with a nonempty directory to force real delete IOException','Issue authenticated DELETE through actual JWT/filter/MVC','Check HTTP response, remaining directory bytes and committed row count'],'expectedResult':'No false HTTP success on cleanup failure; disclose committed DB and retained physical original','actualResult':'Old H2/PG return200 and fail assertions; current HTTP500, row0 and original child retained','evidence':[prefix+'old-FileDeleteTransactionIntegrationTest.xml',prefix+'current-FileDeleteTransactionIntegrationTest.xml'],'resolutionStatus':'resolved','resolutionEvidence':[{'type':'commit','reference':head},{'type':'command','reference':prefix+'current-summary.json'}]}
]
residual=[
{'id':'risk.cross-resource-cleanup','description':'AfterCommit IO failure or process crash may leave original without metadata; HTTP500 does not undo committed DB and retry may404.','impact':'No atomic DB/filesystem outcome or durable cleanup guarantee.','mitigation':'Preserve id/path logs and discuss explicit persistent reconciliation/outbox separately; no automatic history restore or orphan deletion.'},
{'id':'risk.shared-reference-acl','description':'Concurrent rebind/shared physical paths and three shared-file ACL questions remain separate audit/decision scopes.','impact':'Current passed result does not certify complete reference-safe deletion or object/tenant authorization.','mitigation':'Do not infer rules from targetType; continue dedicated source/runtime audit and user decisions.'},
{'id':'risk.adjacent-dhr-callback','description':'DhrAttachmentService adjacent UNKNOWN cleanup/IO behavior remains a separate source candidate.','impact':'This generic DELETE fix cannot close that service consistency scope.','mitigation':'Next independent finite audit/reproduction before deterministic fix; no speculative modification.'},
{'id':'risk.limited-runtime','description':'Native canonical-single-table slice and JWT/MVC/filesystem only; no full application schema/migrations, real network disconnect, crash recovery, browser, full RBAC/UI/recipient certification.','impact':'Do not expand tests into complete production acceptance.','mitigation':'Keep explicit evidence bounds and continue applicable W5-W7 validation.'},
{'id':'risk.audit-remaining','description':'Whole audit W3/W4/W5 crossing, W2 remainder and W6 old-reviewed A23/W7 increments; 666 paths/44knowledge/183ID, old two DHR highs/A12/four gaps and paused friend signature page/production dialog remain open.','impact':'Local finding closure does not finish full audit or resolve old blockers.','mitigation':'Continue ledger queues and latest-target incremental audit; finite nine IDs/wholeFile0/newUnique unknown.'}
]
quality={'qualityResult':{'result':'passed','baseCommit':base,'headCommit':head,'contractBaseline':{'sourceCommit':head,'targetBranch':'edhr-dev','targetCommit':base,'contractReadCommit':head,'uncommittedContractPaths':[]},'workingTreeState':{'status':'clean','includedPaths':[],'excludedPaths':[],'untrackedPaths':[]},'knowledgeBaselineVersion':'0.3.25','checks':checks,'findings':findings,'residualRisks':residual,'blockingConditions':[]}}
Path(prefix+'qualityResult.yaml').write_text(yaml.safe_dump(quality,allow_unicode=True,sort_keys=False))
Path(prefix+'report.md').write_text(f'''# FINAL 独立复验：通用文件删除事务结果

结论 passed。实际 target/base `{base}`，clean feature/tested candidate `{head}`。本实例及只读证据子任务未参与任何产品/测试/夹具修复，未修改主工作树；只在自有旧工作树原字节移植三类测试。项目/交接/质量契约实际读自受测 HEAD，与目标无差异。知识0.3.25/schema1.2.0及P0保持。

实际单次十二类84/84、知识89/89通过，均0 failure/error/skip。84包含21删除执行及63既有上传/读取/生产保护回归；不能相加或把运行次数当唯一语义覆盖。同源最终三类21移植实际旧6ec为13个 assertion red、8个正向、0error/skip，测试SHA及copySHA一致。旧产品源码没有改动。canonical file_object原DDL/PK与test-only FK用于故障注入，不是新增产品FK删除政策；PG另实证DELETE已flush/事务内0行后，实际COMMIT延迟约束拒绝，记录及原件仍在。UNKNOWN由实际同步生命周期和合成commit故障验证，不叫真实断网。

源码只FileController.delete及必要import改动。REQUIRED事务包住读取/原guard/登记删除，仅afterCommit清理；UNKNOWN/回滚不清理。原件路径在DB删除前解析。成功日志在实际清理后，IOException向既有全局映射传播HTTP500；真实非空目录故障下DB已提交删除且原件保留，不能描述成回滚或跨资源原子。两个原target guard、上传助手与读取前缀保持，ExecutionAccessTest只补实际H2经理，原保护断言与never-delete断言不降。

有限A23审查认可该事务/完成回调由实际红例证明必要；未新增吞错、猜测默认、备份、重试状态或磁盘事务框架。单ID/PK查询，无新增全量列表、N+1/循环SQL/内存分页；复用已读实体，不宣称已测出生产SLA或SQL数量。具体后续拆分边界为FileDeletionService掌管事务/guard/completion、FileReadService掌管资源读取、registration掌管上传登记；FileAccessPolicy待ACL确认。本批不大重构、不加索引。

本体NA/FINAL及9既有ID有限保留边界核验，无新增规则/成熟度。SIGNATURE_EVIDENCE仅原实现证据，不能升成用户确认政策；DHR解除关联保留原件是独立受控路径，不能推导通用文件全禁删。330资产与base字节路径不变。证据子任务已FINAL：59原件raw/stored、6source snapshots、本体12+manifest、24源指纹核验一致，1453布尔检查全过。固定base四清单重建字节相同：6370/135SQL/464HTTP/216routes仅盘点，wholeFile0/newUnique未知。

QA编排失败如实保留：首次元数据SHOW lc_collate不支持；第二次socket readiness命中初始化临时server、随后关闭；第三次当前84已过，但旧树node_modules误链接根目录导致vite missing、没有测试XML。改自己/tmp探针为catalog/TCP、仅工具依赖链接正确frontend目录后，旧21实际执行。前三项不是产品断言红；当前84不因工具失败重复认证或冒称首轮全过。首次未重定向，失败JSON是从session50271原始工具响应记录，原始响应在工具历史；run2/run3/run4输出及原失败日志、cleanup都保留。

自有PG容器与自有旧worktree均已清理，主树仍clean且HEAD不变。没有访问/触发CI/Actions、合并、部署、历史恢复或孤儿扫删。持久清理/崩溃、共享引用并发/ACL、DHR相邻回调及全审历史队列/两个DHR旧high/A12/四gap保持残余；没有浏览器/完整RBAC或完整迁移认证。当前批次可进入主审最终漂移检查与PR流程，不能声称整体审计完成。
''')
files=[]
for p in sorted(Path('/tmp').glob('edhr-delete-qa-*')):
    if p.is_file() and p.name!='edhr-delete-qa-manifest.json': files.append(p)
    elif p.is_dir() and p.name=='edhr-delete-qa-evidence-inventory': files.extend(sorted(x for x in p.rglob('*') if x.is_file()))
manifest={'status':'FINAL','baseCommit':base,'headCommit':head,'generatedAt':datetime.now(timezone.utc).isoformat(),'independence':'No participation in fixes; source/test unchanged; one read-only evidence subordinate FINAL','sourceSnapshot':[{'path':str(p.relative_to(root)),'bytes':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()} for p in [root/source_path,*[root/'gmp-platform/backend/src/test/java/com/zencas/edhr/compliance/controller'/(c+'.java') for c in ['FileDeleteTransactionIntegrationTest','FileDeleteTransactionPostgresTest','FileDeleteTransactionFailureTest']],root/'gmp-platform/backend/src/test/java/com/zencas/edhr/production/service/ExecutionAccessTest.java']],'files':[{'path':str(p),'bytes':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()} for p in files],'manifestSelfExcluded':True,'firstAttemptEvidenceNote':'Initial unredirected tool response session50271 is original in tool history; failure.json records observed command/status/message, not a claimed captured raw stream.'}
save('manifest',manifest)
print(json.dumps({'status':'FINAL','result':'passed','checks':len(checks),'artifacts':len(files),'manifestSha256':hashlib.sha256(Path(prefix+'manifest.json').read_bytes()).hexdigest(),'head':head}))
