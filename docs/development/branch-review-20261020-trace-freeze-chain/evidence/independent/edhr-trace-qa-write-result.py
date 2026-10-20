from pathlib import Path
import datetime
import hashlib
import json
import subprocess
import yaml

ROOT = Path('/workspace/edhr-nexus-frontend')
BASE = '061d7f1ff71d11084667d08293fd7d5fe0d7680d'
HEAD = 'ba68b03dab051d228c3646a03bbb404f2724f1d4'
CORE = '12e2bc218b3830c18ea74c44108f296d3e04ee3c'
TMP = Path('/tmp')

def read(name):
    return json.loads((TMP / name).read_text())

assert subprocess.check_output(['git', 'rev-parse', 'HEAD'], cwd=ROOT).decode().strip() == HEAD
assert not subprocess.check_output(['git', 'status', '--porcelain=v1', '--untracked-files=all'], cwd=ROOT).strip()
assert read('edhr-trace-qa-remote-baseline.json')['targetCommit'] == BASE
assert read('edhr-trace-qa-ledger-verify.json')['result'] == 'passed'
assert read('edhr-trace-qa-consumer-source-review.json')['newFindings'] == []
assert read('edhr-trace-qa-consumer-source-review.json')['readonlyChild']['status'] == 'FINAL'
tests = read('edhr-trace-qa-test-summary.json')
assert tests['backend']['totals']['tests'] == 72
assert tests['backend']['nativePostgresCount'] == 33
assert tests['knowledge']['totals']['tests'] == 89
browser = read('edhr-trace-qa-browser.json')
assert len(browser['results']) == 22 and all(x['status'] == 'passed' for x in browser['results'])
assert 'ℹ tests 36' in (TMP/'edhr-trace-qa-node.txt').read_text()
assert 'ℹ fail 0' in (TMP/'edhr-trace-qa-node.txt').read_text()
assert read('edhr-trace-qa-baseline-java-summary.json')['totals'] == {'tests': 7, 'failures': 3, 'errors': 0, 'skipped': 0}
assert read('edhr-trace-qa-premium-comparison.json')['entireFindingsArrayByteCanonicalEqual'] is True

backend_command = "PROJECTION_TEST_DATABASE_URL=jdbc:postgresql://localhost:5432/edhr_projection_integration_test bash /workspace/.edhr-cloud-tools/mvn-edhr -C -f gmp-platform/backend/pom.xml -Dexecution.test.driver=org.postgresql.Driver -Dexecution.test.url=jdbc:postgresql://localhost:5432/edhr_execution_trace_test -Dexecution.test.user=edhr -Dexecution.test.dialect=org.hibernate.dialect.PostgreSQLDialect '-Dtest=FormTraceIndexServiceTest,FormTraceIndexPostgresTest,DhrTraceReportPostgresTest,FormProjectionInterpreterTest,FormProjectionPostgresTest,FormFillSnapshotTest,TemplateProjectionAuthorizationTest,TraceReportAuthorizationTest,FormProjectionAuthorizationTest,ProductionExecutionIntegrationTest#executionPersistsSnapshotDraftAndAuditThenCompletesOnlyAfterAllOperations+formInstanceNumbersAreStableSearchableAndUseFrozenSnapshots+firstStartFreezesOneCommittedConfigurationDuringProcessRebinding+earlyTerminationFreezesSavedEvidenceAndLeavesOtherObjectRunning' test"
checks = []

def check(id, category, description, method, command, evidence, required=True, outcome='passed'):
    checks.append(dict(id=id, required=required, category=category, description=description, method=method, command=command, outcome=outcome, evidence=evidence))

check('trace.qa.contract-and-candidate', 'documentation', '独立读取当前项目/角色/交接/设计及业务契约，核对实时目标和实际候选。', 'command', 'git ls-remote origin refs/heads/edhr-dev; git rev-parse HEAD; git status --porcelain=v1 --untracked-files=all; independent Git blob comparison', [f'实际目标 base={BASE}，功能/被测候选 head={HEAD}，候选已包含目标。', '/tmp/edhr-trace-qa-remote-baseline.json', '/tmp/edhr-trace-qa-candidate-scope.json', '契约 sourceCommit/contractReadCommit 均为实际亲读 HEAD；6份治理/设计契约与061基线字节一致，working tree clean，目标树等于PR18交付c118。'])
check('trace.qa.scope-impact-and-policy', 'requirements', '亲读完整L2 impactAnalysis/extensionStrategy并核对最小修复、实际源码和用户授权，未发生任务漂移。', 'inspection', 'git diff 061d7f1ff71d11084667d08293fd7d5fe0d7680d..ba68b03dab051d228c3646a03bbb404f2724f1d4; read decision-package and DEC-0077-20/33/38/42', ['/tmp/edhr-trace-qa-candidate-scope.json', '/tmp/edhr-trace-qa-consumer-source-review.json', '/tmp/edhr-trace-qa-frozen-source-review.md', '恰为3个生产文件；extract两处isBlank，前端遗漏消费点复用既有projectionTableId；非空白ID不trim，配置原拼写、旧多绑解释、来源/权限/签署/hash/快照/审计不变。', '未恢复历史、回填旧索引、运行真实库清理、查/触发Actions、合并或部署；本批不扩展到新功能或全系统审查。'])
check('trace.qa.causal-baseline-counterfactual', 'regression', '实际基线源码加同一当前回归夹具复现两缺陷，正对照保留；预期红结果不能当候选失败。', 'automated-test', 'git archive 061d7f1ff71d11084667d08293fd7d5fe0d7680d into /tmp; overlay candidate regression fixtures only; focused Maven test + node --test scripts/test-projection-preview.mjs; W2_BASELINE_COMMIT=061d7f1ff71d11084667d08293fd7d5fe0d7680d W2_CASE_FILTER="trace region overview" node scripts/test-designer-save-browser.mjs', ['/tmp/edhr-trace-qa-baseline-java-summary.json', '/tmp/edhr-trace-qa-node-baseline-summary.json', '/tmp/edhr-trace-qa-browser-baseline-summary.json', 'Java7中恰3个预期失败（空白主表unit、保存索引PG、终止DHR冻结反查PG）；其余4正对照通过。Node6中1个预期失败/5通过。真实1440浏览器看到假失效子表1≠0，首失败后未运行390基线；这些红执行不计入候选通过数。'])
check('trace.qa.unit-and-interpreter', 'unit', '主表空白集合、精确非空白ID/实际行、旧多绑及既有解释器规则回归。', 'automated-test', backend_command, ['/tmp/edhr-trace-qa-test-summary.json', 'FormTraceIndexServiceTest 5 + FormProjectionInterpreterTest 23 = 28，failure/error/skip均0；是72个Java子集，不额外累计。'])
check('trace.qa.saved-trace-postgres', 'database', '真实PostgreSQL保存—索引—反查—替换刷新及事务失败回滚。', 'automated-test', backend_command, ['/tmp/edhr-trace-qa-test-summary.json', '/tmp/edhr-trace-qa-test-environment.json', 'FormTraceIndexPostgresTest 11项全过：新空白主表保存立即命中、旧值被替换、主/子表实际行不串配、snapshot字节不变且不生成正式统计；现有回滚/租户/阶段/来源用例保留。'])
check('trace.qa.frozen-dhr-postgres', 'database', '冻结DHR成员的空白主表反查、跨表过滤、分页及冻结原字节保持。', 'automated-test', backend_command, ['/tmp/edhr-trace-qa-test-summary.json', '/tmp/edhr-trace-qa-frozen-source-review.md', 'DhrTraceReportPostgresTest 5项全过，真实报告SQL/提取器；reader是Mockito mock，不能声称此用例执行真实hash校验或全DHR生命周期。真实controller边界另项记录。'])
check('trace.qa.formal-projection-and-snapshots', 'integration', '正式投影持久化、重试/事务/幂等/来源快照，以及流程/直接填写快照相邻回归。', 'automated-test', backend_command, ['/tmp/edhr-trace-qa-test-summary.json', 'FormProjectionPostgresTest 13 + FormFillSnapshotTest 3 =16，全过；保存追溯与最终统计分离，正式完成/失败重试沿自己的冻结来源，不把trace作正式统计。'])
check('trace.qa.native-postgres-lifecycle', 'integration', '实际controller首次START并发配置冻结、保存审计、实例号/历史读取和提前终止。', 'automated-test', backend_command, ['/tmp/edhr-trace-qa-test-summary.json', '/tmp/edhr-trace-qa-test-environment.json', 'ProductionExecutionIntegrationTest指定4项实际PostgreSQL全部passed，首次START并发无skip。实际冻结/hash生成及改live后读取冻结值边界已运行；不含hash篡改负向断言，不外推完整制造/所有DHR状态。', '本次72个不同Java测试中33个使用原生PG（11+5+13+4）；历史H2 3过1skip不累计、不替代本次。'])
check('trace.qa.source-and-report-authorization', 'security', '保留模板用途写权限、表单/生产/DHR联合权限及来源权限边界。', 'automated-test', backend_command, ['/tmp/edhr-trace-qa-test-summary.json', 'TemplateProjectionAuthorizationTest 1 + TraceReportAuthorizationTest 3 + FormProjectionAuthorizationTest 4 =8全过；不声称全角色渗透或生产授权配置已审计。'])
check('trace.qa.knowledge-schema-and-reference', 'ontology', '当前候选正式知识schema、全局ID、引用、类型及投影约束检查。', 'automated-test', 'bash /workspace/.edhr-cloud-tools/mvn-edhr -C -f tools/knowledge-model/pom.xml test', ['/tmp/edhr-trace-qa-test-summary.json', 'BusinessKnowledgeModelTest 89项，failure/error/skip均0；知识0.3.25/schema1.2.0，不能将结构校验称为全知识语义或业务运行通过。'])
check('trace.qa.finite-semantics-and-maturity', 'ontology', '独立核对12条有限语义原件、5份知识差异及全schema定义变化。', 'inspection', 'python3 /tmp/edhr-trace-qa-ledger-verify.py; inspect original ontologyResult and new knowledge artifacts against Git base/head', ['/tmp/edhr-trace-qa-ledger-verify.json', '/tmp/edhr-trace-qa-consumer-source-review.json', '2534→2535只新增evidence.trace-region-consumption-20261020；规则/锚点仅追加证据，原ID/成熟度/visibility/业务政策保留。12条实际ID/记录摘要/Git blob原件一致，wholeRecordSemanticPass和wholeAsset均不升级。', 'relation.form-field-has-trace-item只是辅助列表笔误，实际亲读relation.form-field-associated-trace-item，无知识ID重命名。四旧gap、两暂缓high及A12保持。'])
check('trace.qa.frontend-node', 'unit', '前端模拟root值、精确区域身份、绑定/选项/用途编辑及既有侧栏回归。', 'automated-test', 'cd gmp-platform/frontend && node --test scripts/test-projection-preview.mjs scripts/test-projection-source-editor.mjs scripts/test-projection-panel.mjs', ['/tmp/edhr-trace-qa-node.txt', '实际36项passed，fail/cancel/skip/todo均0；原四个preview用例及其断言保持，新空白/非空白正反用例未弱化。'])
check('trace.qa.frontend-build-and-designer-static', 'regression', 'TypeScript和生产构建、既有设计器静态约束。', 'command', 'cd gmp-platform/frontend && npm run build; node scripts/verify-template-designer-react.mjs', ['/tmp/edhr-trace-qa-build.txt', '/tmp/edhr-trace-qa-designer-static.txt', '两个实际命令exit0；构建既有chunk体积警告保留，不以构建替代ESLint或真实后端持久化。'])
check('trace.qa.actual-browser-shell', 'e2e', '真实Shell/Canvas/MUI/Zustand完整交互回归与1440/390新总览/预览场景。', 'browser', 'cd gmp-platform/frontend && NODE_PATH=/workspace/.edhr-browser-tools/node_modules CHROME_PATH=/usr/bin/chromium W2_RESULT_PATH=/tmp/edhr-trace-qa-browser.json W2_SCREENSHOT_DIR=/tmp/edhr-trace-qa-screenshots node scripts/test-designer-save-browser.mjs', ['/tmp/edhr-trace-qa-browser.json', '完整22项passed，包括两新视口；检查无假失效子表、模拟POST根级值、tableId原拼写/整document不变、dirty=false、无save callback及页脚键盘关闭。', '实际浏览器运行了真实产品组件；catalog/preview POST为合成受控API夹具，既有save callback也受控，不冒充全栈浏览器持久化。'])
check('trace.qa.visual-two-viewports', 'visual', '实际独立截图亲视核对中文内容、主表/结果归属和对话框可达性。', 'inspection', 'view_image /tmp/edhr-trace-qa-screenshots/trace-main-region-preview-1440.png and trace-main-region-preview-390.png', ['/tmp/edhr-trace-qa-screenshots/trace-main-region-preview-1440.png', '/tmp/edhr-trace-qa-screenshots/trace-main-region-preview-390.png', '1440×960和390×844均可读，主表字段和一条追溯主表结果一致，页脚关闭/校验并预览可见。沿原MUI/FormDialog，无新交互体系；只接受所截图场景。'])
check('trace.qa.original-migrations-isolated', 'database', '0116/0117原字节保持，隔离pg_temp事务回滚脚本兼容回归。', 'automated-test', 'PATH=/tmp/edhr-trace-test-bin:$PATH python3 gmp-platform/backend/scripts/test-trace-single-binding-migration.py', ['/tmp/edhr-trace-qa-migration.txt', '/tmp/edhr-trace-qa-test-environment.json', '/tmp/edhr-trace-qa-ledger-verify.json', '实际exit0，覆盖主/子表与空白主表、wrapped/plain JSON、完整冲突删除、同项复用、统计/证据保持、乐观版本及幂等；126迁移路径未改。只在合成DB pg_temp/ROLLBACK，不是已执行真实配置清理。'])
check('trace.qa.fixed-ledger-and-coverage', 'audit', '重现固定树台账并独立重算scope、有限语义、父子finding及历史质量原状态。', 'command', 'python3 scripts/build-branch-review-ledger.py --ref 12e2bc218b3830c18ea74c44108f296d3e04ee3c --catalog docs/development/branch-review-20261020-trace-freeze-chain/source-catalog.json --out docs/development/branch-review-20261020-trace-freeze-chain/ledger --check; python3 /tmp/edhr-trace-qa-ledger-verify.py', ['/tmp/edhr-trace-qa-ledger-reproduction.json', '/tmp/edhr-trace-qa-ledger-verify.json', '完整--check实际exit0。2382路径/216有限重叠scope（162继承+47辅助+7主审，wholeFile0）；45语义（33旧+12新/4旧gap保持）；42父子finding（40原记录+2本批修复等待本次验收）；70历史质量49passed/20failed/1blocked原状态保持。', f'台账固定树是{CORE}，不含自身后续生成物和本正式QA；generator本身执行数0与progress实际72/36/22明确分开。本两项正式验收应L0单独登记，不改受测冻结快照或70历史报告。'])
check('trace.qa.original-evidence-and-safety', 'audit', '原件/失败ZIP递归SHA、历史保护及独立角色只读边界。', 'inspection', 'python3 /tmp/edhr-trace-qa-ledger-verify.py; inspect original failure archive and candidate source receipt manifests', ['/tmp/edhr-trace-qa-ledger-verify.json', '/tmp/edhr-trace-qa-consumer-source-review.json', '54归档原件及726次Git receipt核验，失败ZIP5成员size/SHA全一致；914历史开发路径字节未变。两次夹具失败保留，修复目录缓存/页脚关闭定位未弱化断言。', '本实例和两个只读辅助及其子辅助均未参与修复/修改仓库；全部辅助已正式FINAL，无Actions或真实库访问。仅/tmp安全白名单可归档，raw Maven/MockMVC/JWT XML/环境/settings不交付。'])
check('trace.qa.strict-ui-no-new-findings', 'regression', '使用原官方premium脚本独立导出061基线并对比完整strict findings数组。', 'command', 'python3 /tmp/edhr-trace-premium/audit_project.py /tmp/edhr-trace-qa-premium-base --mode strict --output /tmp/edhr-trace-qa-premium-baseline.json; python3 /tmp/edhr-trace-premium/audit_project.py /workspace/edhr-nexus-frontend --mode strict --output /tmp/edhr-trace-qa-premium-candidate.json; compare full findings arrays', ['/tmp/edhr-trace-qa-premium-comparison.json', '/tmp/edhr-trace-qa-premium-baseline.json', '/tmp/edhr-trace-qa-premium-candidate.json', '实际baseline84/candidate84完整findings数组精确相同，new0/removed0；此项只判本批无新增，全局strict两次实际exit2，另列非必需失败检查和残余，绝不称strict通过。'])
check('trace.qa.global-premium-strict', 'visual', '全局premium strict原有静态问题仍存在。', 'command', 'python3 /tmp/edhr-trace-premium/audit_project.py /workspace/edhr-nexus-frontend --mode strict --output /tmp/edhr-trace-qa-premium-candidate.json', ['/tmp/edhr-trace-qa-premium-candidate.json', '/tmp/edhr-trace-qa-premium-comparison.json', '实际exit2，84 errors（71 violations/13 unresolved）；与061基线完整集合相同。本局部一致性修复不引入新项，也不以局部passed关闭全局限制。'], required=False, outcome='failed')
check('trace.qa.global-eslint-configuration', 'regression', '全局ESLint因既有缺少配置不能执行规则检查。', 'command', 'cd gmp-platform/frontend && npm run lint', ['/tmp/edhr-trace-qa-eslint.txt', '实际exit2：ESLint8.57.1未找到配置；基线到候选未新增/删除lint配置或变更依赖。未降标准、未创建跳过配置，不将其称通过。'], required=False, outcome='failed')

assert len(checks) == 21 and sum(c['required'] for c in checks) == 19
findings = [
    dict(id='W2-TRACE-REGION-001', severity='high', scope='saved-trace-index-and-frozen-dhr-main-region-consumer', summary='合法Java空白tableId被extract误当子表，漏保存索引及冻结DHR主表反查；候选按既定主表身份修复。', reproductionSteps=['固定061基线源码，覆盖本候选相同回归夹具。', '运行空白主表unit、savedBlankMainRegionIsImmediatelyTraceableAndRefreshKeepsFrozenBytes和terminatedBlankMainRegionMatchesFrozenEvidenceWithoutRewritingIt。', '再运行本候选完整指定72个Java回归。'], expectedResult='合法主表根字段和值可查；主表定位仍空串/form/-1，非空白子表ID、真实行及冻结原件不变。', actualResult='基线7中3预期失败，候选72全过（33PG）；空白提取、保存索引与终止冻结反查新用例全过，snapshot/config字节断言保留。', evidence=['/tmp/edhr-trace-qa-baseline-java-summary.json','/tmp/edhr-trace-qa-test-summary.json','/tmp/edhr-trace-qa-consumer-source-review.json'], resolutionStatus='resolved', resolutionEvidence=[dict(type='commit',reference=CORE),dict(type='command',reference='/tmp/edhr-trace-qa-test-summary.json: FormTraceIndexServiceTest 5/5, FormTraceIndexPostgresTest 11/11, DhrTraceReportPostgresTest 5/5, ProductionExecutionIntegrationTest 4/4'),dict(type='audit-record',reference='/tmp/edhr-trace-qa-baseline-java-summary.json'),dict(type='document',reference='/tmp/edhr-trace-qa-frozen-source-review.md')]),
    dict(id='W2-TRACE-REGION-002', severity='medium', scope='designer-projection-overview-and-simulation-region-consumers', summary='总览/模拟按原始空白tableId造假失效子表并嵌套主表模拟值；候选在消费点复用既有projectionTableId。', reproductionSteps=['对061固定源码运行当前Node六项preview夹具和真实总览浏览器1440场景。', '基线出现区域键空白而非空串、总览失效子表计数1。', '对本候选运行36Node及22真实浏览器回归，并亲视1440/390截图。'], expectedResult='合法主表绑定归主表，预览请求值在根对象；原tableId、整document、dirty/save状态及非空白子表身份保持。', actualResult='基线Node6中1预期失败及浏览器1440假失效1≠0；候选36Node/22浏览器全过、两新视口均过，截图符合已定MUI规范。', evidence=['/tmp/edhr-trace-qa-node-baseline-summary.json','/tmp/edhr-trace-qa-browser-baseline-summary.json','/tmp/edhr-trace-qa-node.txt','/tmp/edhr-trace-qa-browser.json'], resolutionStatus='resolved', resolutionEvidence=[dict(type='commit',reference=CORE),dict(type='command',reference='/tmp/edhr-trace-qa-node.txt: 36 passed, 0 failed/skipped'),dict(type='command',reference='/tmp/edhr-trace-qa-browser.json: 22 passed incl 1440/390 overview/simulation'),dict(type='screenshot',reference='/tmp/edhr-trace-qa-screenshots/trace-main-region-preview-1440.png'),dict(type='screenshot',reference='/tmp/edhr-trace-qa-screenshots/trace-main-region-preview-390.png')]),
]
risks = [
    dict(id='trace.residual.global-static-ui', description='全局premium strict仍84项且exit2；ESLint仍因缺既有配置exit2。', impact='本批仅证实与061基线完整集合相同、新增0；未取得全局静态质量通过，不得声明全分支可发布或旧限制已关闭。', mitigation='后续按独立既有基线治理安排处理；本批保持实际失败证据，不能扩大业务修复以造绿。'),
    dict(id='trace.residual.historical-live-index', description='旧代码已漏建的实时索引不会因本修复自动补齐。', impact='未再次合法保存的普通已保存记录/依赖live index的候选筛选仍可能漏查；终止冻结反查直接取冻结原件的已测路径已修复。', mitigation='后续合法保存仍原事务refresh；如需全量索引恢复须单独明确范围和数据依据，本批不回填、不恢复历史。'),
    dict(id='trace.residual.deferred-audit-work', description='两项用户暂缓DHR high、四旧知识gap、A12及H009/H010/H012保留；W3-W7和未审范围未完成。', impact='本次passed仅覆盖本两个消费者缺陷及邻接回归，不是完整分支/DHR生命周期/知识全库语义验收。', mitigation='保持原台账状态与历史原件；本链收尾后继续W3新写入口矩阵，真正政策歧义再问用户，不关闭既有暂缓项。'),
    dict(id='trace.residual.fixture-and-runtime-boundaries', description='浏览器preview/catalog POST和save callback受控；DHR报告PG reader为mock；4controller实际生命周期不含空白fixture或hash篡改负向。', impact='已证明真实UI与请求形状、实际保存/索引/PG报告、真实首次START/终止冻结边界，不能据此推断全制造、全HTTP、所有权限或hash攻击场景。', mitigation='按实际范围保留不同证据层级；源码明确真实reader先核原件hash，此次未改该reader，不将未执行场景称通过。'),
    dict(id='trace.residual.integration-head-and-settings', description='本结论固定061目标及ba68候选，未核验GitHub branch protection/ruleset或任何Actions。', impact='后续来源/目标/契约或生产代码变化须增量评估；当前静态契约和本地通过不能证明线上强制门禁已启用。', mitigation='主侧PR前核最新目标；只追加L0验收原件不得改写受测冻结台账，若影响代码/知识含义须按风险重新验证，人工合并/部署仍由用户决定。'),
]

quality = dict(result='passed', baseCommit=BASE, headCommit=HEAD,
    contractBaseline=dict(sourceCommit=HEAD,targetBranch='edhr-dev',targetCommit=BASE,contractReadCommit=HEAD,uncommittedContractPaths=[]),
    workingTreeState=dict(status='clean',includedPaths=[],excludedPaths=[],untrackedPaths=[]),
    knowledgeBaselineVersion='0.3.25', checks=checks, findings=findings, residualRisks=risks, blockingConditions=[])
assert all(c['outcome']=='passed' for c in checks if c['required'])
assert all(f['resolutionStatus']=='resolved' and f['resolutionEvidence'] for f in findings)
out = TMP/'edhr-trace-independent-quality-result.yaml'
out.write_text(yaml.safe_dump({'qualityResult':quality}, allow_unicode=True, sort_keys=False, width=110))

review = f'''# PR前本批独立质量复验

正式结论：**qualityResult.passed**，19/19必需检查通过；两个明确原缺陷已由全新、未参与修复的本质量实例复验为resolved，无新增可复现问题，无本批blockingConditions。两项全局非必需检查仍实际失败：premium strict 84项/exit2、ESLint缺配置/exit2，均明确保留。

固定目标 `{BASE}`，实际功能/受测候选 `{HEAD}`，核心实现 `{CORE}`。实时 `git ls-remote` 独立核对目标仍是061；候选包含目标，PR18合并树等于c118交付。工作树始终clean，契约按实际候选亲读，与061治理/设计契约字节相同。知识0.3.25/schema1.2.0。

## 实际运行

| 检查 | 独立结果 |
| --- | --- |
| Java聚焦及实际生命周期 | 72 passed，failure/error/skip均0；其中33原生PostgreSQL |
| controller生命周期 | 上述72中的4项：首次START并发、保存审计、冻结历史/实例号、提前终止；全部PG无skip |
| 正式知识校验 | 89 passed，failure/error/skip均0 |
| Node三脚本 | 36 passed，0 fail/skip |
| 实际完整浏览器 | 22 passed，含1440×960/390×844新场景 |
| 两实际新截图 | 亲视中文、根主表结果、页脚与对话框可达性；符合既有MUI/FormDialog |
| TypeScript/生产构建、设计器静态 | 实际exit0/exit0；既有构建chunk警告保留 |
| 0116/0117隔离兼容脚本 | 实际exit0，仅合成DB pg_temp及ROLLBACK，126迁移路径未改 |
| 台账完整--check | 实际exit0，独立重算原件/范围通过 |
| 全局premium strict | 基线与候选均实际exit2，完整84个finding数组精确相同/new0 |
| 全局ESLint | 实际exit2，既有缺配置，未降低标准 |

219个不同自动用例（72+89+36+22），不重复累加旧H2或重跑。迁移/静态/源码/视觉另按检查记录。所有Java计数取本次fresh Surefire testcase及属性，安全摘要含mtime/SHA，不归档raw XML或Maven/MockMVC/JWT/环境/settings。

## 两个问题与实际因果

`W2-TRACE-REGION-001 high`：既定Java空白主表绑定的配置/根值正确，但extract的isEmpty把它当子表而跳过。候选仅两处isBlank，对齐原解释器；主表输出空串/form/-1，非空白精确ID及真实行不动。不改snapshot/source/hash/权限/签署/审计。当前unit、实际保存索引PG和冻结DHR报告PG回归全部通过。

`W2-TRACE-REGION-002 medium`：前端raw tableId造假失效子表并把模拟主表值放错嵌套位置。候选在总览定位/分组/结果标题及模拟键/字段集复用原projectionTableId，不写回模型。Node和真实Shell两视口证实根POST值、原tableId/整document不变、dirty=false、无保存回调及键盘关闭。

本实例额外从Git独立导出061源码到/tmp，只覆盖相同当前回归夹具：Java7中恰3个预期失败（unit1+PG2），其余4个正对照过；Node6中空白主表1个失败、其余5过；真实1440总览在“子表来源已失效”计数1≠0失败，首失败后未运行390基线。候选同项及邻接回归全绿。故缺陷及修复因果不是只相信主侧摘要。原5失败ZIP成员size/SHA另已复核，夹具中间失败保留，未弱化断言。

## 台账、知识与任务边界

完整读L2 decision-package的impactAnalysis/extensionStrategy，核DEC-0077-20/33/38/42、规则、DESIGN和open-questions。3个生产文件/5个测试文件/5个知识文件，余为证据及台账；无新业务政策、模块大重构、历史恢复、真实库迁移、合并或部署。12有限语义定位到真实ID与源blob；2534→2535仅一个新证据ID，原成熟度和visibility不变，不升P0。

台账固定核心12e树2382路径；216个有限、可交叉scope（162旧+47辅助+7主审），不是216个唯一方法/整文件；wholeFile0。45有限语义（33旧+12新，四旧gap保留），42父子finding（40旧+2新）；70历史质量原状态49passed/20failed/1blocked不重写。54归档原件/726次Git receipt/5 ZIP成员核验，914历史开发路径和126迁移路径保持。生成器执行数零只表示导入器本身未运行审查，progress明确本批实际72/36/22。冻结台账中两项等待独立验收状态保持，主侧可另行L0登记本正式passed，不回写受测快照。

主审任务无漂移：本轮是既有W2保存—冻结—历史读取链的两个遗漏消费者一致性修复，不是重新收尾PR5/6，不是新功能或全分支审查完成。后续应继续既定W3新写入口矩阵，H009/H010并独立裁定H012，再推进W4-W7。

## 必须保留的限制

- 旧漏实时索引不会自动补齐；后续合法保存才按原事务refresh。本批未回填或清理真实库，不能宣称存量已修复。
- 两项用户暂缓DHR high、四旧gap、A12、H009/H010/H012和未审范围都保留，不能用本次passed关闭。
- 浏览器为真实UI加受控catalog/preview POST及save callback，不是全栈持久化；DHR报告PG reader为mock，真实reader先核SHA由源码及4真实controller生命周期作邻接证据。4项不含空白fixture或hash篡改负向，不外推全制造/全DHR/全授权。
- premium strict全局仍84项、ESLint仍缺配置。只证明无新增，不称全局通过。
- 未查或触发Actions、未核验线上branch protection/ruleset，未合并/部署。目标或实现变化后须按影响重评。

## 独立性和可归档原件

正式质量实例 `/root/trace_region_independent_quality` 未参与修复，仅运行验证及输出/tmp。两个只读辅助ledger_source_verify、consumer_source_verify和后者frozen_boundary子辅助均已正式FINAL，无新增finding，也未修改仓库或参与修复。它们的源码/原件核对支持本结论，运行验收全部由本正式实例实际执行。

完整机器结果：`/tmp/edhr-trace-independent-quality-result.yaml`。安全白名单和SHA：`/tmp/edhr-trace-independent-receipts.json`；安全归档边界：`/tmp/edhr-trace-independent-safety-summary.json`。仅白名单原件可复制，禁止带raw Maven/MockMVC/JWT XML、环境、settings、凭据或临时基线构建目录。
'''
(TMP/'edhr-trace-independent-review.md').write_text(review)

allowed = [
 'edhr-trace-independent-quality-result.yaml','edhr-trace-independent-review.md',
 'edhr-trace-qa-write-result.py','edhr-trace-qa-candidate-scope.json','edhr-trace-qa-remote-baseline.json',
 'edhr-trace-qa-test-summary.json','edhr-trace-qa-test-environment.json','edhr-trace-qa-baseline-java-summary.json',
 'edhr-trace-qa-node-baseline-summary.json','edhr-trace-qa-browser-baseline-summary.json',
 'edhr-trace-qa-node.txt','edhr-trace-qa-node-baseline-final.txt','edhr-trace-qa-browser.json',
 'edhr-trace-qa-build.txt','edhr-trace-qa-designer-static.txt','edhr-trace-qa-migration.txt','edhr-trace-qa-eslint.txt',
 'edhr-trace-qa-premium-baseline.json','edhr-trace-qa-premium-candidate.json','edhr-trace-qa-premium-comparison.json',
 'edhr-trace-qa-ledger-verify.py','edhr-trace-qa-ledger-verify.json','edhr-trace-qa-ledger-verify.md','edhr-trace-qa-ledger-reproduction.json',
 'edhr-trace-qa-consumer-source-review.md','edhr-trace-qa-consumer-source-review.json','edhr-trace-qa-frozen-source-review.md',
 'edhr-trace-qa-screenshots/trace-main-region-preview-1440.png','edhr-trace-qa-screenshots/trace-main-region-preview-390.png',
]
safety = {'schema':'edhr-independent-quality-safe-delivery/v1','headCommit':HEAD,'independentOfRepair':True,'repositoryMutations':False,'allReadonlyChildrenFinal':True,'testDatabase':'parent-created isolated synthetic PostgreSQL; no business DB','actionsAccessedOrTriggered':False,'mergedOrDeployed':False,'result':'passed','requiredChecks':19,'requiredPassed':19,'optionalFailed':2,'distinctCandidateCounts':{'java':72,'nativePgSubset':33,'knowledge':89,'node':36,'browser':22},'whitelist':allowed,'forbiddenToArchive':['raw Maven logs','raw MockMVC output','raw Surefire XML/JWT','environment dumps','Maven settings','credentials','temporary baseline source/build tree'],'scopeCaveats':['partial source/semantic scopes only','global strict84/lint configuration residual unchanged','historical index backfill not performed','deferred old high/gaps not closed']}
(TMP/'edhr-trace-independent-safety-summary.json').write_text(json.dumps(safety,ensure_ascii=False,indent=2)+'\n')
allowed.append('edhr-trace-independent-safety-summary.json')
receipts = {'schema':'edhr-independent-quality-receipts/v1','createdAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'baseCommit':BASE,'headCommit':HEAD,'wholeFileOrBranchAcceptance':False,'files':[]}
for name in allowed:
    path=TMP/name
    data=path.read_bytes()
    receipts['files'].append({'path':str(path),'bytes':len(data),'sha256':hashlib.sha256(data).hexdigest()})
(TMP/'edhr-trace-independent-receipts.json').write_text(json.dumps(receipts,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'result':'passed','requiredPassed':19,'requiredTotal':19,'optionalFailed':2,'candidate':HEAD,'safeReceiptFiles':len(receipts['files']),'checks':len(checks)},ensure_ascii=False))
