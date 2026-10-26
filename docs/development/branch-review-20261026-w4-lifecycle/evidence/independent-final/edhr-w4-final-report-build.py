import hashlib
import json
from pathlib import Path
import yaml

base = 'c49c0c7f98ca5c66eb59eb6876c78af03a07d28b'
head = 'b880440512bc11610ad4b397848438bff09c4ad7'
reg = json.loads(Path('/tmp/edhr-w4-final-regression.json').read_text())
assert reg['pg']['totals'] == {'tests': 121, 'failures': 0, 'errors': 0, 'skipped': 2}
assert reg['h2']['counts'] == {'tests': 7, 'failures': 0, 'errors': 0, 'skipped': 0}
assert reg['knowledge']['counts'] == {'tests': 89, 'failures': 0, 'errors': 0, 'skipped': 0}

def check(id, category, description, method, command, evidence):
    return dict(id=id, required=True, category=category, description=description,
                method=method, command=command, outcome='passed', evidence=evidence)

checks = [
    check('w4.final-baseline', 'documentation', '固定实际候选及实时目标，契约无增量', 'command',
          'git fetch origin edhr-dev; git rev-parse HEAD origin/edhr-dev; git diff base..head -- AGENTS.md codeplzreadme.md docs/agents',
          [f'base={base}; featureHead={head}; testedCandidate={head}', '最终QA独立worktree；产品/测试/知识未修改；仅运行时node_modules环境symlink，现已移除且git status为空']),
    check('w4.final-source-transaction', 'audit', '对象状态变化审计与原执行事件同事务，复用已锁对象', 'inspection',
          'inspect ProductionExecutionService.act/auditObjectStatusChange and ProductionService.startObject/completeObject',
          ['新增产品14行，status相等直接返回；actor/tenant/source沿现上下文；无新查询或新事务；原PRODUCTION_EXECUTION事件保留', '/tmp/edhr-w4-final-inspection.json']),
    check('w4.final-policy', 'ontology', '对照DEC0019-02/04及当前规则，不扩大旧verified契约或改业务政策', 'inspection',
          'inspect DEC-0019, rules/production, evidence/production and execution-contracts diff',
          ['仅3知识文件解释/证据及已修实现差异更新；规则AST和现行状态/权限政策未改', 'execution.production-object-audit-snapshot原controller handler和verified/runtime保持，不认证本次服务为运行知识发布']),
    check('w4.final-lifecycle-api', 'api', '真实状态变化、BATCH/SN及SUBMIT自动完成；普通SAVE、中间工序与陈旧revision不增加状态事件', 'automated-test',
          reg['commands']['pg'], ['新6用例及既有batchCustomFormSurvivesOperationCompletionAndGatesOnlyBatch通过', '对象审计API返回实际两条UPDATE，旧执行事件数量保持', '/tmp/edhr-w4-final-regression.json']),
    check('w4.final-rollback', 'database', '分别注入对象审计和执行审计失败，验证START/最终完成事务整体回滚后可重试', 'automated-test',
          reg['commands']['pg'], ['4个参数化失败用例通过：对象/工单/DHR/执行/新增审计原子性与revision/state恢复', '同一PG121回归中的子集，不作为额外独立覆盖累计']),
    check('w4.final-pg-regression', 'regression', '相邻回归在隔离原生PG和现有单元/授权上下文复验', 'automated-test',
          reg['commands']['pg'], ['clean 121项：119通过、2原browser fixture条件跳过、0失败/错误；其中Integration83通过/2跳过，其他36通过', '跳过为formRecordsBrowserFixture与browserEvidenceFixture，未增加skip或降低断言', '/tmp/edhr-w4-final-regression.json']),
    check('w4.final-h2-fixture', 'integration', '默认H2复验初轮夹具兼容失败，保留所有内容和身份断言', 'automated-test',
          reg['commands']['h2'], ['同6新例+SUBMIT既有例共7通过，0失败/错误/跳过；byte[]直接按JSON字节解析，PG分支保留', 'H2与PG为同场景跨驱动验证，不宣称新增7个业务覆盖', '/tmp/edhr-w4-final-regression.json']),
    check('w4.final-knowledge-schema', 'ontology', '独立当前知识schema/引用/类型验证', 'automated-test',
          reg['commands']['knowledge'], ['clean 89项全部通过，0失败/错误/跳过；不是全库人工语义审计', '/tmp/edhr-w4-final-regression.json']),
    check('w4.final-evidence-preservation', 'documentation', '初轮failed和旧红证据原样保留，未以新结果覆盖', 'command',
          'SHA256 compare evidence/ontology and evidence/independent-initial receipts',
          ['10份归档原件摘要匹配；初轮qualityResult SHA256=46a2f274ee8e2559ba245caf9d8197b70f74dadf8d111462c3d5b4cc10ca882b', '旧基线PG6红为前一独立实例的历史原件，本最终实例未再次运行旧基线', '/tmp/edhr-w4-final-inspection.json']),
    check('w4.final-scope', 'requirements', '范围、性能风险和结构建议不冒充全量完成；暂缓保持', 'inspection',
          'inspect findings/source-review/scope-review/structure-plan/NEXT and git diff --check',
          ['14源码范围blob与SHA逐条匹配；与本体15语义/9源码有交叉；旧全量台账未回写', 'H006/H008、两性能风险和用户暂缓/旧gap继续开放；性能只source-confirmed，未实施优化/大重构；具体提取方案包含职责、测试与回滚', 'frontend/schema/治理契约/旧execution contract差异为空；git diff --check通过']),
]
result = {'qualityResult': {
    'result': 'passed', 'baseCommit': base, 'headCommit': head,
    'contractBaseline': {'sourceCommit': head, 'targetBranch': 'edhr-dev', 'targetCommit': base,
                         'contractReadCommit': head, 'uncommittedContractPaths': []},
    'workingTreeState': {'status': 'clean', 'includedPaths': [], 'excludedPaths': [], 'untrackedPaths': []},
    'knowledgeBaselineVersion': '0.3.25', 'checks': checks,
    'findings': [{
        'id': 'W4-TEST-AUDIT-JSON-001', 'severity': 'medium', 'scope': 'ProductionExecutionIntegrationTest audit JSON helper',
        'summary': '首轮新增断言把H2 JSON byte[]转成对象标识字符串，现已修正并由全新实例复验',
        'reproductionSteps': ['初轮a970f654默认H2运行lifecycleAudit*及batchCustomFormSurvivesOperationCompletionAndGatesOnlyBatch'],
        'expectedResult': '与PG相同的JSON内容断言可在默认H2解析并通过',
        'actualResult': '初轮独立7error，当前b8804405独立同7全部通过；PG121回归保持119通过/2原条件跳过',
        'evidence': ['docs/development/branch-review-20261026-w4-lifecycle/evidence/independent-initial/edhr-w4-qa-h2.json', '/tmp/edhr-w4-final-regression.json'],
        'resolutionStatus': 'resolved',
        'resolutionEvidence': [{'type': 'commit', 'reference': 'fd89fa808459d3267b51bb314ac9dd4ddd2027ad'}, {'type': 'document', 'reference': '/tmp/edhr-w4-final-regression.json'}]
    }],
    'residualRisks': [
        {'id': 'w4.final-scope-limit', 'description': '本次只认证H007及测试夹具修正和其明确审查证据；H006/H008及W2-W7整体剩余未完成', 'impact': '不能据本结果宣称完整分支/产品族生命周期已通过', 'mitigation': '沿NEXT逐批复现整改；用户暂缓TaskDetail及记录变更作废/DHR依赖保持'},
        {'id': 'w4.final-history-limit', 'description': '历史缺失对象审计不回填，旧AuditEvent JSONB/hash往返及旧签名证据问题未在本批修复', 'impact': '本批不证明全部历史审计或归档完整性', 'mitigation': '保留旧问题及来源，另行处理，禁止推测或伪造历史'},
        {'id': 'w4.final-runtime-limit', 'description': '真实JWT/MockMvc与PG服务事务使用现有合成schema及部分mock；未运行浏览器、完整生产应用或全局审计权限验收', 'impact': '2个原浏览器驻留夹具跳过；不等于真实UI或生产部署认证', 'mitigation': '记录各测试边界；后续相关UI/全链工作单独验证'},
        {'id': 'w4.final-capacity-limit', 'description': '审计日志全量映射、批量拆分重复扫描及此前性能风险保留待讨论，未做本批规模/并发测量', 'impact': '不能据功能回归认证容量或宣布N+1实测结果', 'mitigation': '先多规模查询/内存观察，再讨论保持业务语义的优化；不自动批准分块或批量写策略'}
    ],
    'blockingConditions': [], 'completionState': 'FINAL',
    'independence': '全新最终实例，未参与任何产品/测试/知识修复；无子任务。',
    'runtimeCleanup': {'ownedDatabase': 'edhr_w4_final_test', 'databaseDropped': True,
                       'nodeModulesSymlinkRemoved': True, 'worktreeTrackedAndUntrackedClean': True,
                       'containerRetainedForParent': '219ceeb887856959527d0bbbcc1f0588724fb9b6fb399b01ca2d093ec3208358'}
}}
path=Path('/tmp/edhr-w4-final-qualityResult.yaml')
path.write_text(yaml.safe_dump(result, allow_unicode=True, sort_keys=False))
names=['edhr-w4-final-qualityResult.yaml','edhr-w4-final-regression.json','edhr-w4-final-inspection.json','edhr-w4-final-report-build.py']
manifest={'headCommit':head,'files':[{'path':str(Path('/tmp')/name),'sha256':hashlib.sha256((Path('/tmp')/name).read_bytes()).hexdigest(),'bytes':(Path('/tmp')/name).stat().st_size} for name in names],'rawLogsAndXmlExcluded':True}
Path('/tmp/edhr-w4-final-manifest.json').write_text(json.dumps(manifest,indent=2)+'\n')
print('passed FINAL',len(checks),'required checks',hashlib.sha256(path.read_bytes()).hexdigest())
