from pathlib import Path
import hashlib, json, subprocess, yaml

ROOT = Path('/tmp/edhr-w4-qa-source')
BASE = 'c49c0c7f98ca5c66eb59eb6876c78af03a07d28b'
HEAD = 'a970f654a07d3bbf2c803fe812e322d332889603'
def git(*args):
    return subprocess.check_output(['git', *args], cwd=ROOT, text=True).strip()
def sha(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()
assert git('rev-parse','HEAD') == HEAD
assert git('rev-parse','origin/edhr-dev') == BASE
assert git('status','--short') == ''
folder = ROOT/'docs/development/branch-review-20261026-w4-lifecycle'
source = json.loads((folder/'source-review.json').read_text())
ontology = json.loads((folder/'evidence/ontology/edhr-w4-ontology-review.json').read_text())
inspection = {
    'baseCommit':BASE,'headCommit':HEAD,'testedCandidate':HEAD,'workingTreeClean':True,
    'contractBaseline':{'sourceCommit':HEAD,'targetBranch':'edhr-dev','targetCommit':BASE,'contractReadCommit':HEAD,'uncommittedContractPaths':[]},
    'knowledgeBaselineVersion':'0.3.25',
    'scope':'L2 AUD-H007 product fix and W4/W5 finite review delivery; not whole branch acceptance',
    'checks':[
        {'scope':'baseline and contracts','outcome':'passed','evidence':'Independent fetch still c49c0c7f; candidate descends target; five project/role/handoff contract files byte-identical to target; previous PR28 delivery tree identical to target.'},
        {'scope':'act and auditObjectStatusChange','outcome':'passed','evidence':'14 added product lines; previous status taken under order/object locks before engine mutations; helper runs in existing REPEATABLE_READ act transaction after execution flush, before original execution audit; status equal -> no event.'},
        {'scope':'ProductionService.startObject/completeObject','outcome':'passed','evidence':'Both join current transaction and operate managed production object; only status is changed as business field on these paths. Work order and DHR updates retain existing orchestration.'},
        {'scope':'metadata and audit query','outcome':'passed','evidence':'Object tenant/id/status diff and AuditContext actor/account/source/IP copied; PRODUCTION_EXECUTION unchanged; native-PG tests retrieve new object events through real AuditController. Full global audit authorization and UI rendering not certified.'},
        {'scope':'knowledge consistency','outcome':'passed','evidence':'DEC0019-02/04 unchanged; production rule condition/result/status/visibility/executionContractId unchanged; only explanations, discrepancy resolution and evidence added. Old verified execution contract not widened.'},
        {'scope':'finite coverage and original evidence','outcome':'passed','evidence':'All 14 source-review commit/blob/SHA values match candidate; all 15 ontology record working-tree file hashes match final candidate; 9 ontology source scopes overlap root. Receipt three original artifact hashes match archives; 3579 baseline paths verified.'},
        {'scope':'H006 residual and performance observations','outcome':'passed','evidence':'Source still uses current member for build and locked-version ownership lookup; H006 remains open. Audit list full materialization and splitBatch repeated reads are source-confirmed, not measured SQL/heap/SLA. No performance implementation or hard DHR 300 limit.'},
        {'scope':'structure and boundary','outcome':'passed','evidence':'Private audit helper reuses context; split/AuditLogQueryService proposals specify ownership, validation, risks and rollback. No UI/schema/migration/contract changes; TaskDetail and record-control deferrals retained.'}
    ],
    'sourceScopeCount':len(source['scopes']),
    'ontologySemanticCount':len(ontology['records']),
    'ontologySourceCount':len(ontology['sourceReview']),
    'ontologyConclusionCounts':{k:sum(r['conclusion']==k for r in ontology['records']) for k in sorted({r['conclusion'] for r in ontology['records']})},
    'unexecuted':['browser/visual verification','full production application/complete masterdata repositories','full schema migration/fresh baseline','load, memory, latency and concurrency capacity benchmark','H006 runtime reproduction','whole W0-W7 coverage'],
    'resources':{'container':'219ceeb887856959527d0bbbcc1f0588724fb9b6fb399b01ca2d093ec3208358','ownedQaDatabases':['edhr_w4_qa_test','edhr_w4_qa_red'],'qaDatabasesDropped':True,'containerCleanupOwner':'root','candidateWorktree':str(ROOT),'legacyWorktree':'/tmp/edhr-w4-qa-red-source','nodeModulesSymlinksRemoved':True,'productFilesModifiedByQa':False,'testFixesByQa':False,'legacyFixture':'unchanged candidate test imported onto old product in isolated worktree only'}
}
Path('/tmp/edhr-w4-qa-inspection.json').write_text(json.dumps(inspection,ensure_ascii=False,indent=2)+'\n')
reg=json.loads(Path('/tmp/edhr-w4-qa-regression.json').read_text())
red=json.loads(Path('/tmp/edhr-w4-qa-red.json').read_text())
h2=json.loads(Path('/tmp/edhr-w4-qa-h2.json').read_text())
assert reg['totals']=={'tests':121,'failures':0,'errors':0,'skipped':2}
assert reg['knowledge']['counts']=={'tests':89,'failures':0,'errors':0,'skipped':0}
assert red['counts']=={'tests':6,'failures':6,'errors':0,'skipped':0}
assert h2['counts']=={'tests':7,'failures':0,'errors':7,'skipped':0}
def check(id,category,description,method,command,evidence):
    return {'id':id,'required':True,'category':category,'description':description,'method':method,'command':command,'outcome':'passed','evidence':evidence}
checks=[
    check('w4.baseline-contract','documentation','独立核对目标、候选与契约版本','command','git fetch origin edhr-dev; git rev-parse HEAD origin/edhr-dev; git diff', [BASE,HEAD,'/tmp/edhr-w4-qa-inspection.json']),
    check('w4.requirements-source','requirements','对象审计身份、状态差异及本批边界','inspection','DEC0019-02/04 -> act -> startObject/completeObject -> object audit query', ['/tmp/edhr-w4-qa-inspection.json']),
    check('w4.atomicity-regression','integration','真实认证HTTP/事务/PG状态与审计回滚、SUBMIT完工','automated-test',reg['command'],['ProductionExecutionIntegrationTest: 85 discovered, 83 passed, 2 original browser fixtures skipped, 0 failures/errors','/tmp/edhr-w4-qa-regression.json']),
    check('w4.neighbor-regression','regression','控制器、状态服务、权限注解与审计投影相邻回归','automated-test',reg['command'],['36 adjacent tests passed; total unique121 discovered/119passed/2skipped','/tmp/edhr-w4-qa-regression.json']),
    check('w4.red-proof','regression','旧产品配同六测试真实失败，候选修复有效','automated-test',red['command'],['old base: 6 assertion failures/0error/skip; same candidate test bytes copied unchanged','/tmp/edhr-w4-qa-red.json']),
    check('w4.knowledge-validation','ontology','知识结构、引用及有限语义同步不提升认证范围','automated-test',reg['knowledgeCommand'],['89/89 passed, 0failure/error/skip','DEC statements and rule AST/maturity unchanged; 15 finite semantic records with 5 H006 needs-fix retained','/tmp/edhr-w4-qa-inspection.json']),
    check('w4.evidence-scope','documentation','原始摘要、有限源码范围与台账不冒充全量完成','inspection','Verify source-review/ontology file hashes, receipts, progress/README/scope-review', ['/tmp/edhr-w4-qa-inspection.json','14 root source scopes overlap ontology9; no addition as full-file coverage']),
    check('w4.diff-safety','audit','无历史回填、schema、UI或业务政策漂移','command','git diff --check c49c0c7f HEAD; git diff --name-only c49c0c7f HEAD', ['/tmp/edhr-w4-qa-inspection.json','One product file + one test file; three knowledge files; remaining audit documentation']),
    check('w4.performance-structure','documentation','性能风险与提取方案保留讨论与实测边界','inspection','Source compare AuditController.list, ProductionService.splitBatch and structure-plan', ['Source-confirmed only; no performance implementation approval inferred','/tmp/edhr-w4-qa-inspection.json'])
]
checks.append({'id':'w4.default-h2-compatibility','required':True,'category':'regression','description':'候选新增审计断言兼容仓库默认H2集成测试配置','method':'automated-test','command':h2['command'],'outcome':'failed','evidence':['7 tests, 7 JsonParseException errors, 0 assertion failures/skips','/tmp/edhr-w4-qa-h2.json']})
result={'qualityResult':{
    'result':'failed','baseCommit':BASE,'headCommit':HEAD,
    'contractBaseline':inspection['contractBaseline'],
    'workingTreeState':{'status':'clean','includedPaths':[],'excludedPaths':[],'untrackedPaths':[]},
    'knowledgeBaselineVersion':'0.3.25','checks':checks,
    'findings':[{'id':'AUD-H007','severity':'medium','scope':'ProductionExecutionService.act object status audit','summary':'执行引发对象生命周期变化在对象审计查询中缺失；本轮补齐同事务status差异事件','reproductionSteps':['On old c49c0c7f import unchanged candidate ProductionExecutionIntegrationTest fixture','Run lifecycleAudit* on isolated PostgreSQL16'], 'expectedResult':'真实状态变化记录一条PRODUCTION_OBJECT UPDATE，失败整体回滚且可重试','actualResult':'旧代码同6例全部失败；候选全部通过，含最终SUBMIT路径既有测试补断言','evidence':['/tmp/edhr-w4-qa-red.json','/tmp/edhr-w4-qa-regression.json'],'resolutionStatus':'resolved','resolutionEvidence':[{'type':'commit','reference':'3281863b0974dc1e4e7b4c343ca9d42a7a4103ac'},{'type':'document','reference':'/tmp/edhr-w4-qa-regression.json'}]}],
    'residualRisks':[
        {'id':'remaining.whole-audit','description':'本次只验收H007有限切片；H006/H008、W2-W7遗漏及旧知识gap继续','impact':'不能宣称全分支审计完成','mitigation':'按NEXT和scope-review继续固定新基线审查'},
        {'id':'remaining.capacity','description':'审计日志全量内存分页、批量拆分重复扫描仅源码风险；旧性能风险继续','impact':'未认证容量、SQL次数、堆峰值或SLA','mitigation':'先隔离多规模测量，再按用户要求讨论实施'},
        {'id':'remaining.old-evidence','description':'历史缺失对象事件不回填；旧AuditEvent hash往返缺口不在本次修复','impact':'历史完整性/摘要认证不可由本批推导','mitigation':'保留原始证据和独立追踪'},
        {'id':'remaining.test-boundary','description':'真实PG集成保留原主数据/状态机/产出mock，2原浏览器驻留夹具跳过；未运行UI/完整应用/迁移','impact':'只证明列明后端事务和API范围','mitigation':'完整领域与W7另取适用独立证据'},
        {'id':'remaining.user-deferred','description':'TaskDetail签名页面、记录变更作废及依赖DHR high/A12保持用户暂缓','impact':'不属于本次H007合并阻断，但仍未完成整体能力','mitigation':'待用户明确恢复与上游实现后继续'}
    ],'blockingConditions':[],'completionState':'FINAL','independence':'Fresh verifier; no fixes to product/tests/knowledge; no child agents; candidate clean and tested directly.'}}
result['qualityResult']['findings'].append({'id':'W4-TEST-AUDIT-JSON-001','severity':'medium','scope':'ProductionExecutionIntegrationTest.assertObjectStatusAudits','summary':'新增审计JSON断言把JDBC byte[]调用toString，导致默认H2同6例及新增SUBMIT断言7项错误','reproductionSteps':['Checkout candidate a970f654 in clean worktree','Run default H2 lifecycleAudit* plus batchCustomFormSurvivesOperationCompletionAndGatesOnlyBatch without execution.test.* overrides'], 'expectedResult':'新增断言能读取默认H2和PG返回的JSON，仍完整比较status前后内容，测试正常通过','actualResult':'7项均JsonParseException: unrecognized token B；H2 queryForList JSON返回byte[]，Object.toString得到[B@...而非JSON','evidence':['/tmp/edhr-w4-qa-h2.json','gmp-platform/backend/src/test/java/com/zencas/edhr/production/controller/ProductionExecutionIntegrationTest.java:259'],'resolutionStatus':'open','resolutionEvidence':[]})
Path('/tmp/edhr-w4-qa-qualityResult.yaml').write_text(yaml.safe_dump(result,allow_unicode=True,sort_keys=False))
manifest=[]
for name in ['edhr-w4-qa-qualityResult.yaml','edhr-w4-qa-inspection.json','edhr-w4-qa-regression.json','edhr-w4-qa-red.json','edhr-w4-qa-h2.json','edhr-w4-qa-report-build.py']:
    p=Path('/tmp')/name;manifest.append({'path':str(p),'sha256':sha(p),'bytes':p.stat().st_size})
Path('/tmp/edhr-w4-qa-manifest.json').write_text(json.dumps({'headCommit':HEAD,'files':manifest,'rawLogsAndXmlExcluded':True},ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'result':'failed','completionState':'FINAL','requiredChecks':len(checks),'qualityResultSha256':sha('/tmp/edhr-w4-qa-qualityResult.yaml')},ensure_ascii=False))
