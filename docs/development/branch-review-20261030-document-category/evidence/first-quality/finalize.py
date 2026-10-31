from pathlib import Path
import collections, hashlib, json, subprocess
import yaml

P = '/tmp/edhr-document-category-q1-'
BASE = 'd10590bd3fe8f3da4e68bcc087b2102d2c211934'
HEAD = 'ac3a421e42529bdb304e2c72145ceb580ec70618'
ROOT = Path('/workspace/edhr-nexus-frontend')
assert subprocess.check_output(['git','rev-parse','HEAD'],cwd=ROOT,text=True).strip() == HEAD
assert not subprocess.check_output(['git','status','--porcelain=v1'],cwd=ROOT,text=True).strip()
race = json.loads(Path(P+'concurrency-result.json').read_text())
assert race['first']['status'] == race['second']['status'] == 200
assert race['auditRows'] == 2 and race['auditsBySecondActor'] == 0
assert race['firstWriterWaiting'] and race['bothWritersReadAndWaiting']
checks=[]
def check(id, required, category, description, method, command, outcome, evidence):
    checks.append(dict(id=id, required=required, category=category, description=description,
                       method=method, command=command, outcome=outcome, evidence=evidence))
check('q1.baseline-contract-source',True,'documentation','实时目标、候选、祖先关系、契约与实际产品差量核对','inspection',
      'git fetch origin edhr-dev; git status --porcelain=v1; git merge-base --is-ancestor; git diff; source/contract inspection','passed',
      [P+'inspection.json',f'base={BASE}; head=tested candidate={HEAD}; clean; target ancestor; no contract/knowledge delta',
       'backend product 6 additions/12 deletions; frontend product 2 additions/2 deletions; no product/test/fixture edits by verifier'])
check('q1.evidence-provenance',True,'documentation','独立重算原始证据哈希、来源快照、历史规则来源及未变知识资产','command',
      'python3 /tmp/edhr-document-category-q1-inspect.py','passed',
      [P+'inspection.json','119 primary records hash/size matched; 6 source snapshots matched; ontology 9 originals plus manifest; 303 knowledge assets unchanged',
       'DEC0053, original user confirmation, same-commit deletion architecture and DEC0065 archive blobs matched original Git objects'])
check('q1.inventory-and-scope',True,'documentation','重建固定分母和四份盘点原件，不把盘点计入源码审查','command',
      'python3 scripts/build-branch-review-inventory.py --ref '+BASE+' --out /tmp/edhr-document-category-q1-inventory','passed',
      [P+'inventory-build.txt',P+'inventory-check.json','4 files byte identical; 4755 tracked paths and 130 SQL inventory only; source 8 / semantic 12 overlaps are not new unique coverage'])
check('q1.business-rule-sequential-scope',True,'requirements','核对已有删除保护和中文排序差量规则、NULL与同值语义、范围及历史未决项','inspection',
      'Read AGENTS, quality-verifier, handoff contract, batch manual docs/decision package, DEC0053 originals, architecture and master-data write audit contract','passed',
      [P+'inspection.json','Existing referenced-category protection is established policy, not a new deletion-protection fix. Sorting before/after contains only 排序; no fabricated count/description.',
       'NULL exists in canonical sort_order; singletonMap is necessary compatibility rather than excess defensive code. Serial new-reference case does not prove concurrency safety.'])
check('q1.h2-regression',True,'regression','八个既有H2集成类实际执行258条','automated-test',
      'bash /workspace/.edhr-cloud-tools/mvn-edhr -f gmp-platform/backend/pom.xml -Dtest=DocumentWriteBoundaryIntegrationTest,DocumentOrmSchemaIntegrationTest,DocumentReadBoundaryIntegrationTest,DocumentManagementControllerTest,MasterDataBoundaryIntegrationTest,ProcessModelingControllerTest,ProductProcessControllerTest,MaterialImportIntegrationTest -Dedhr.audit.documentReads=true -Dedhr.audit.documentOutput=/tmp/edhr-document-category-q1-h2-read-http.jsonl -Dedhr.audit.documentWriteOutput=/tmp/edhr-document-category-q1-h2-write-http.jsonl test','passed',
      [P+'h2-test.txt',P+'h2-summary.json','258 tests, 0 failures/errors/skipped; 8 saved XML originals; tested '+HEAD])
check('q1.postgres-native-regression',True,'database','自有PostgreSQL双数据库、完整现行canonical schema和真实Aspect/FK，实际执行140条','automated-test',
      'python3 /tmp/edhr-document-category-q1-run-pg.py','passed',
      [P+'pg-test.txt',P+'pg-summary.json',P+'pg-version.txt',P+'schema-setup.txt',
       'PostgreSQL 16.15, datcollate/datctype=en_US.utf8; complete current 0001 fresh schema; ddl-auto none; no historical SQL replay.',
       'DocumentCategoryAuditPostgresTest 14 + DocumentReadPerformancePostgresTest 71 + DocumentWriteBoundaryPostgresTest 55 = 140; 0 failures/errors/skipped.',
       'Together H2/PG = 398 executions across engines, not 398 unique scenarios; final test expects internal failure HTTP500 and preserves five-table/all-audit rollback.',
       '14 category tests cover sequential audit, NULL, same-value no-op, invalid-ID compatibility, system/tenant/auth boundaries, FK reference protection and rollback, but omit the reproduced race.'])
check('q1.concurrent-sort-audit-integrity',True,'audit','真实两个排序请求在共同旧前值下排队，已提交恢复排序是否完整审计','query',
      'Run /tmp/EdhrCategoryConcurrencyProbe.java with JDK21 and existing native test runtime classpath on owned canonical DB; exact runtime context saved in q1-java-context.json','failed',
      [P+'concurrency-result.json',P+'concurrency-probe.txt','/tmp/EdhrCategoryConcurrencyProbe.java',P+'java-context.json',
       'External JDBC row lock + pg_stat_activity Lock barrier; real controller HTTP/JWT/transactions. Both requests 200; qa-A produces 2 changes; qa-B restores both values and produces 0 audit rows.',
       'DocumentManagementController.java:140-160 reads unlocked before-values before writer locks and uses stale previousOrder to suppress qa-B audit.'])
check('q1.browser-current',True,'e2e','真实页面与共享弹窗/通知组件，受控API的两宽度运行验证','browser',
      'NODE_PATH=/workspace/.edhr-browser-tools/node_modules CHROME_PATH=/usr/bin/chromium CATEGORY_ARTIFACTS=/tmp/edhr-document-category-q1-browser-current node scripts/test-document-category-delete-browser.mjs','passed',
      [P+'browser-current.txt',P+'browser-current/result.json','10/10 executions passed at widths390/1440; five scenario families repeated at two widths, not20unique; API is controlled, not browser-to-native DB.'])
check('q1.browser-old-red',True,'regression','同脚本旧UI运行确认真实旧错误文案及相邻正向行为','browser',
      'NODE_PATH=/workspace/.edhr-browser-tools/node_modules CHROME_PATH=/usr/bin/chromium CATEGORY_ARTIFACTS=/tmp/edhr-document-category-q1-browser-old CATEGORY_BASELINE_COMMIT='+BASE+' node scripts/test-document-category-delete-browser.mjs','passed',
      [P+'browser-old.txt',P+'browser-old/result.json','Expected baseline red: 4 real copy failures, 6 positive cases; current10/10. Does not substitute for old native14, which was not run by this instance.'])
check('q1.frontend-build',True,'regression','实际tsc-b与Vite构建','command','npm run build','passed',[P+'build.txt','exit0'])
check('q1.frontend-generic-ui',True,'regression','实际共享UI测试','automated-test','npm run test:generic-ui','passed',[P+'generic-ui.txt','14 passed'])
check('q1.frontend-table-contract',True,'documentation','实际列表表格规范校验','command','npm run verify:list-table-style','passed',[P+'table-verifier.txt','exit0'])
check('q1.knowledge-runtime',True,'ontology','知识模型89条实际运行','automated-test',
      'bash /workspace/.edhr-cloud-tools/mvn-edhr -f tools/knowledge-model/pom.xml test','passed',
      [P+'knowledge-test.txt',P+'knowledge-junit.xml',P+'knowledge-summary.json','89 tests passed; not semantic certification of the whole repository; no knowledge version/maturity promotion.'])
check('q1.handwritten-whitespace',True,'documentation','14个手工路径空白检查，原始输出独立保留','command','git diff --check '+BASE+'..'+HEAD+' -- <14 exact handwritten paths in q1-inspection.json>','passed',
      [P+'whitespace-handwritten.txt',P+'inspection.json','Handwritten exit0; full raw interval exit2 retained in q1-whitespace-all.txt (logs/XML/frozen CSV), not cleansed.'])
check('q1.process-verifier-existing-path-block',False,'regression','实际执行既有制程规范脚本，记录断言前失效路径','command','npm run verify:process-modeling','blocked',
      [P+'process-verifier.txt','ENOENT main/resources/db/changelog/0014-process-modeling-permissions.sql before assertions; no unrelated repair.'])
check('q1.lint-existing-tool-failure',False,'regression','实际执行lint，记录缺失配置','command','npm run lint','failed',[P+'lint.txt','exit2; no ESLint configuration, not a product assertion failure.'])
check('q1.owned-resource-cleanup',True,'documentation','自建资源按owner精确清理并确认源码未改','inspection','docker inspect/stop exact owned container; git status/rev-parse','passed',
      [P+'cleanup.json','Own container535d32d654d4c88ecb3a39a2bd1f2283fb685c758192e70bc5976ca545b7301c absent; no old worktree created; shared dependencies untouched; probe context closed; candidate clean.'])

findings=[dict(id='AUD-W4-DOCUMENT-CATEGORY-ORDER-AUDIT-001',severity='medium',scope='document-category reorder / concurrent transaction audit',
 summary='顺序路径已补齐审计，但并发排序读取旧前值，后提交者恢复已变更排序却不产生审计；本家族仍未关闭。',
 reproductionSteps=[
  '在自有完整canonical PostgreSQL数据库创建分类201=30、202=40；用外部JDBC事务SELECT id FROM document_category WHERE id=201 FOR UPDATE。',
  '以qa-A真实HTTP PUT /api/v1/master-data/documents/categories/order，ids=[202,201]；pg_stat_activity确认一个分类写事务等待Lock。',
  '以qa-B真实HTTP PUT同一接口，ids=[201,202]；确认两个写事务均等待Lock后释放外部事务。',
  '读取两次HTTP响应、最终sort_order和audit_event；原件及可执行Java探针全部保留。'],
 expectedResult='每次成功提交且实际改变持久化排序的事务，必须基于其写入前的新鲜持久化状态生成完整before/after与操作者审计；必要的串行化不得改变既有排序、权限或兼容语义。',
 actualResult='两请求均HTTP200；qa-A将201/202改为40/30，qa-B恢复为30/40；最终只有qa-A的2条UPDATE审计，qa-B为0。无版本冲突响应，qa-B的真实已提交变更没有审计。',
 evidence=[P+'concurrency-result.json',P+'concurrency-probe.txt','/tmp/EdhrCategoryConcurrencyProbe.java','gmp-platform/backend/src/main/java/com/zencas/edhr/masterdata/controller/DocumentManagementController.java:140'],
 resolutionStatus='open',resolutionEvidence=[]),
 dict(id='AUD-W4-DOCUMENT-CATEGORY-DELETE-PROMISE-001',severity='low',scope='document category delete confirmation and success feedback',
 summary='确认及成功反馈错误承诺自动迁移文档的两处文案，在当前候选已消除；既有引用保护保持。',
 reproductionSteps=['相同浏览器脚本分别加载基线和当前文档页；390/1440宽运行确认、成功、引用阻断、预检重试、迟到取消。','对比旧版本4项文案失败与当前10/10通过，结合当前native14的真实删除保护验证。'],
 expectedResult='引用存在时禁止删除；空分类可删除；文案不得声称把文档自动转为未分类。',
 actualResult='当前10/10通过，旧版4项错误文案红、6相邻正向通过；当前native guard/FK与单DELETEaudit通过。旧有引用409原已有效，不把它记作本批新修复。',
 evidence=[P+'browser-current/result.json',P+'browser-old/result.json',P+'pg-DocumentCategoryAuditPostgresTest.xml'],
 resolutionStatus='resolved',resolutionEvidence=[dict(type='commit',reference=HEAD),dict(type='command',reference=P+'browser-current.txt'),dict(type='command',reference=P+'browser-old.txt'),dict(type='audit-record',reference=P+'pg-category-http.jsonl')])]

residual=[
 dict(id='q1.not-run-old-native14',description='本实例没有建立旧目标worktree或执行最终旧native14。确认真实并发阻断后按主侧要求收尾；不借用主侧旧initial14。',impact='没有独立旧native六红八正的运行结论。',mitigation='修复后由全新L2独立实例执行最终候选及byte-identical旧native14对照。'),
 dict(id='q1.not-run-premium-static-replay',description='本实例未重跑official premium脚本旧/current src精确范围；主侧已有原件不替代本实例实跑。',impact='本报告不声称该静态项独立通过，也不把root85当产品缺陷数量。',mitigation='全新验证实例完成旧/current严格src范围、脚本版本与输出对照；不为全局脚本变绿大改。'),
 dict(id='q1.visual-inspection-boundary',description='浏览器断言和PNG原件已真实生成；图片查看调用在恢复时输出截断，不据此宣称完整人工视觉验收。',impact='不提升整页响应式或视觉验收覆盖。',mitigation='后续独立实例实际查看窄屏确认/成功及桌面引用阻断图。'),
 dict(id='q1.concurrent-coverage-boundary',description='本次精确证明两个合法排序事务的审计缺口；未证明所有排序/删除/新增交错均安全。',impact='串行新增引用回归与398执行全绿不能关闭并发问题。',mitigation='主侧负责稳定锁序、新鲜前值与必要并发回归；修复后必须全新独立L2实例复验。'),
 dict(id='q1.full-audit-scope',description='当前仍W3/W4交叉；W2余项、W5-W7未完成，A23历史856+feature1/另130SQL、当前4改2增仍pending。',impact='4755/130是盘点；源码8/语义12有历史重叠，不能宣称全仓完成或新增unique覆盖。',mitigation='继续固定分母与增量台账；性能/长文件方案和过度防御复审按既有计划执行。'),
 dict(id='q1.policy-and-perf-deferrals',description='设备/物料与文档分类计数、详情/版本删除性能仍待讨论；TaskDetail友方、生产弹窗设计、记录控制DHRhigh、A12和四knowledge gap维持既有处置。',impact='本批不改变业务政策、不做无关重构或历史数据恢复；兼容算法回归不等于长期policy新确认。',mitigation='主侧保留具体接口、所有权、保护与回滚方案并按既有讨论边界推进。')]
blocking=[dict(id='q1.process-verifier-old-path',condition='verify:process-modeling在断言前读取已迁移0014旧路径ENOENT。',impact='该脚本本次无法提供有效断言结论；独立真实运行已保存。',requiredAction='独立跟踪脚本路径修复并按影响运行，不纳入本批产品修复。',owner='primary-reviewer'),dict(id='q1.lint-missing-config',condition='npm lint没有ESLint配置而退出2。',impact='无法获得有效lint结论；不宣称通过。',requiredAction='独立跟踪仓库lint配置，不为此展开产品改动。',owner='repository-maintainer')]
q=dict(qualityResult=dict(result='failed',baseCommit=BASE,headCommit=HEAD,
 contractBaseline=dict(sourceCommit=HEAD,targetBranch='edhr-dev',targetCommit=BASE,contractReadCommit=HEAD,uncommittedContractPaths=[]),
 workingTreeState=dict(status='clean',includedPaths=[],excludedPaths=[],untrackedPaths=[]),knowledgeBaselineVersion='0.3.25',checks=checks,findings=findings,residualRisks=residual,blockingConditions=blocking))
Path(P+'quality-result.yaml').write_text(yaml.safe_dump(q,allow_unicode=True,sort_keys=False,width=110))
review='''# 独立质量复验 FINAL — failed

候选 `ac3a421e42529bdb304e2c72145ceb580ec70618`，目标 `edhr-dev@d10590bd3fe8f3da4e68bcc087b2102d2c211934`。目标已实际fetch核对且为候选祖先，工作树干净。契约实际读取候选提交；知识0.3.25未改。本实例未参与任何产品、测试、夹具、知识、迁移或主审文档修改。

## 必须修复的真实阻断

`AUD-W4-DOCUMENT-CATEGORY-ORDER-AUDIT-001`（medium）仍open：两个合法并发排序请求可使第二次真实持久化变更无审计。已有顺序用例通过，不能关闭整个排序审计家族。

在自有完整canonical PostgreSQL数据库中，初始分类201=30、202=40。独立JDBC事务锁201，然后发qa-A反序请求，确认写锁等待；再发qa-B原序请求，确认两个写者等待；释放外部锁。两请求都返回HTTP200。qa-A把顺序改为40/30，qa-B随后恢复30/40。最终audit_event只有qa-A的两条排序UPDATE，qa-B没有任何一条记录。

根因位于 `DocumentManagementController.java:140-160`：未锁定的分类读取先形成previousOrder；并发后写事务仍以旧前值决定是否跳过审计。当前实现会写更新时间，因而恢复排序实际提交，但旧前值等于恢复目标导致审计被抑制。真实HTTP、JWT、controller、事务与canonical FK均生效，不是mock，也不是纯SQL模拟产品路径。

原件：`q1-concurrency-result.json`、`q1-concurrency-probe.txt`及`/tmp/EdhrCategoryConcurrencyProbe.java`，完整路径与哈希见独立证据清单。主侧已确认复现，后续主侧处理稳定锁序、新鲜前值与并发回归；本实例不参与修复。L2修复后的最终复验须由全新未参与修复实例完成。

## 已实际完成

- 258条既有H2 + 140条真实PG全部通过，0fail/error/skip；共398跨引擎执行，不能称398unique。8+3 XML和HTTP原始输出保存。
- 自有PostgreSQL16.15/en_US.utf8，两个独立数据库。分类库完整执行未变现行0001 fresh schema，ddl-auto none，真实Aspect、FK RESTRICT和五表回滚；读写回归库独立。未回放历史迁移、未接生产数据库。
- native14顺序审计/NULL/同值/ID兼容/权限/保护/新增引用/注入故障500及完整回滚全部通过。内部存储故障500是正确边界，不改GlobalHandler，也不降低回滚断言。
- 浏览器当前10/10，旧UI同脚本4项错误文案红、6正；两宽390/1440为重复变体。真实页面和共享弹窗/通知配受控API，非浏览器到native DB的整链E2E。PNG全部保留；图片查看调用输出截断，不宣称完成全部人工视觉检查。
- `npm run build`、generic-ui14、list-table-style通过。知识89实际全过。
- 119证据文件hash/size、6源码快照、9本体原件与manifest、303未变知识资产以及4份原始Git来源核对一致。四份inventory独立重建逐字节一致：4755/130仅盘点。
- 14手工路径空白检查通过。全原始区间exit2及原始日志/XML/冻结CSV空白输出保留，未清洗。
- 删除错误承诺文案ID `AUD-W4-DOCUMENT-CATEGORY-DELETE-PROMISE-001` 已独立证实resolved。原有引用409并非本批新增保护；后端只清理当前保护后不可达的自动迁移路径。

## 未执行及既有限制

确认新真实并发阻断后，按主侧明确要求停止补跑成功项并正式failed收尾。本实例未创建旧目标worktree，未执行最终旧native14；未重跑premium精确src旧/current对照。这两项为not-run，不引用主侧原件冒充自身实跑，也不借用旧initial14。

`verify:process-modeling`实际因0014旧路径ENOENT在断言前blocked；lint实际因无ESLint配置exit2。均保存原始输出，不修无关配置，不报通过。本报告足以形成failed结论，不因这些工具问题改报blocked。

既有12项有限ID/本体NA没有被知识89升级为整仓一致；知识版本与成熟度不提升。8源码/12语义含历史重叠，不增加unique。A23历史856+feature1/另130SQL与本轮4改2增仍pending。整体W3/W4交叉，W2余项、W5-W7尚未完成；设备/物料及分类计数、详情/版本删除性能等仍依既有边界讨论，友方TaskDetail、生产弹窗设计、记录控制DHRhigh、A12、四knowledge gap不越权处理。

## 清理与交付

自有唯一容器535d32d654d4c88ecb3a39a2bd1f2283fb685c758192e70bc5976ca545b7301c经owner核验后删除，inspect确认不存在；运行探针Spring/JDBC/executor均关闭。没有旧worktree、测试复制或依赖symlink需回收，共享依赖未动。主候选HEAD与clean状态再次确认。详见q1-cleanup.json。

**不建议合并当前候选。** 需主侧修复同家族并发审计遗漏，补并发回归，重新冻结候选并由全新独立L2实例验收。全部原件逐文件path/sha256/bytes见q1-independent-evidence.json。
'''
Path(P+'quality-review.md').write_text(review)

files=set()
for p in Path('/tmp').glob('edhr-document-category-q1-*'):
    if p.is_file(): files.add(p)
    elif p.is_dir(): files.update(x for x in p.rglob('*') if x.is_file())
files.add(Path('/tmp/EdhrCategoryConcurrencyProbe.java'))
manifest_path=Path(P+'independent-evidence.json')
files.discard(manifest_path)
records=[dict(path=str(p),sha256=hashlib.sha256(p.read_bytes()).hexdigest(),bytes=p.stat().st_size) for p in sorted(files)]
manifest=dict(status='FINAL',qualityResult='failed',role='independent-quality-verifier',agent='document_category_final_qa_20261030',
 baseCommit=BASE,headCommit=HEAD,testedCommit=HEAD,knowledgeBaselineVersion='0.3.25',independent=True,
 productTestFixtureKnowledgeMigrationOrPrimaryDocsModified=False,
 checksSummary=dict(collections.Counter(x['outcome'] for x in checks)),
 actualRuntime=dict(h2=258,postgres=140,backendExecutions=398,backendUniqueCountClaimed=False,knowledge=89,genericUi=14,
 browserCurrent=dict(passed=10,cases=10),browserOld=dict(passed=6,expectedCopyFailures=4,cases=10),
 concurrency=dict(firstStatus=200,secondStatus=200,auditRows=2,secondActorAuditRows=0,actualDefect=True)),
 notRun=['final old native14 on separate worktree','independent official premium strict-src current/old replay','complete manual visual acceptance'],
 cleanup=json.loads(Path(P+'cleanup.json').read_text()),rawFiles=records,
 manifestSelfHashOmitted=True,rawFileCount=len(records),rawTotalBytes=sum(x['bytes'] for x in records))
manifest_path.write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
assert q['qualityResult']['result']=='failed' and any(x['outcome']=='failed' and x['required'] for x in checks)
assert all({'id','severity','scope','summary','reproductionSteps','expectedResult','actualResult','evidence','resolutionStatus','resolutionEvidence'}<=x.keys() for x in findings)
for r in records:
    p=Path(r['path']); assert p.stat().st_size==r['bytes'] and hashlib.sha256(p.read_bytes()).hexdigest()==r['sha256']
print(json.dumps(dict(result='failed',checks=manifest['checksSummary'],rawFiles=len(records),rawBytes=manifest['rawTotalBytes'],artifacts=[P+'quality-result.yaml',P+'quality-review.md',str(manifest_path)]),ensure_ascii=False,indent=2))
