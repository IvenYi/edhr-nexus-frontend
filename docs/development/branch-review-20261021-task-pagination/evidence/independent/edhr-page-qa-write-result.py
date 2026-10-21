from pathlib import Path
import hashlib,json,subprocess
from datetime import datetime
from zoneinfo import ZoneInfo
import yaml
repo=Path('/workspace/edhr-nexus-frontend')
head='9d8269114d8d4645be34b48bf0d0d88b5d245ba1'
base='13def47d4def51237d1393eaa7bf2651e98a0cbd'
core='25e974e03813f6403618ce8a9efc735cafd429a2'
read='080ce5075a902979928d4bc65b133d9a8097c231'
def git(*args):return subprocess.check_output(['git',*args],cwd=repo)
sha=lambda raw:hashlib.sha256(raw).hexdigest()
assert git('rev-parse','HEAD').decode().strip()==head and git('status','--porcelain')==b''
subprocess.run(['git','fetch','origin','refs/heads/edhr-dev:refs/remotes/origin/edhr-dev'],cwd=repo,check=True,stdout=subprocess.PIPE,stderr=subprocess.PIPE)
assert git('rev-parse','origin/edhr-dev').decode().strip()==base
business=json.loads(Path('/tmp/edhr-page-qa-candidate-business-summary.json').read_text())
knowledge=json.loads(Path('/tmp/edhr-page-qa-candidate-knowledge-summary.json').read_text())
red=json.loads(Path('/tmp/edhr-page-qa-baseline-red-summary.json').read_text())
for result,tests in [(business,52),(knowledge,89)]:
    assert result['exit']==0 and result['totals']=={'tests':tests,'failures':0,'errors':0,'skipped':0}
    assert result['observerHead']==head==result['observerHeadAfter'] and not result['observerWorkingTree'] and not result['observerWorkingTreeAfter']
    assert all(row['fresh'] for row in result['suites'])
assert red['exit']==1 and red['totals']=={'tests':28,'failures':22,'errors':0,'skipped':0}
source=json.loads(Path('/tmp/edhr-page-qa-source-review.json').read_text())
assert source['status']=='FINAL' and not source['findings'] and not source['childInstances']
for record in source['sourceEvidence']+source['knowledgeEvidence']:
    raw=git('show',record['sourceCommit']+':'+record['path'])
    assert record['sha256']==sha(raw) and record['blob']==git('rev-parse',record['sourceCommit']+':'+record['path']).decode().strip()
    for start,end in record['actualReadRanges']:assert 1<=start<=end<=len(raw.splitlines())
ledger=json.loads(Path('/tmp/edhr-page-qa-ledger-check.private.log').read_text())
ledger_command='python3 scripts/build-branch-review-ledger.py --ref '+read+' --catalog docs/development/branch-review-20261021-task-pagination/source-catalog.json --out docs/development/branch-review-20261021-task-pagination/ledger --check'
Path('/tmp/edhr-page-qa-ledger-check-summary.json').write_text(json.dumps({'command':ledger_command,'exit':0,'summary':ledger,'newRuntimeOrSemanticReviewPerformedByGenerator':False},ensure_ascii=False,indent=2)+'\n')
checks=[]
def check(id,category,description,method,command,evidence):checks.append({'id':id,'required':True,'category':category,'description':description,'method':method,'command':command,'outcome':'passed','evidence':evidence})
business_command=' '.join(business['command']);knowledge_command=' '.join(knowledge['command']);red_command=' '.join(red['command'])
check('check.pagination-clean-integrated-candidate','requirements','独立核对实时目标、干净最终候选、契约与L2最小范围及决策包。','inspection','git fetch origin edhr-dev; git diff '+base+'..'+head+'; git status --porcelain',[
    'Actual base '+base+', functional/tested candidate '+head+'; target is ancestor and remains unchanged; candidate clean before/after both fresh runs.',
    'AGENTS/unified/quality/codeplz actually read at '+read+'; target/evidence/final contract bytes identical. 080ce507→9d826911 only L0 frozen inventory/progress/docs, protected product/test/knowledge/contract unchanged.',
    '/tmp/edhr-page-qa-evidence-inspection.json'])
check('check.pagination-independent-old-native-red','api','隔离Git导出中独立复现旧整数分页错误并保留真实失败。','automated-test',red_command,[
    'Exported immutable '+base+' to /tmp/edhr-page-qa-baseline-source; only byte-identical core28 fixture added. Shared repository source/tests not changed.',
    'Expected Maven exit1:28 tests,22 assertion failures,6 positive controls,0 errors/skip. Includes HTTP500, unexpected200 for nonpositive values, and positive wraparound to first page. These are assertion failures, not fixture setup errors.',
    '/tmp/edhr-page-qa-baseline-export.json','/tmp/edhr-page-qa-baseline-red-summary.json'])
check('check.pagination-fresh-clean52','regression','对干净固定候选独立一次完整clean52，实际PG50与Mockito2分列。','automated-test',business_command,[
    'Fresh clean '+head+':52/52,0 failures,0 errors,0 skipped; WorkflowTaskPaginationPostgresTest28 + WorkflowInstanceAuthorizationIntegrationTest22 + WorkflowTaskControllerTest2.',
    'W3_COMMAND_DATABASE_URL explicitly points to owned PG16 loopback55432/edhr_w3_command_test; native50 ran with no H2 fallback or condition skip. Old controller2 uses Mockito.',
    '/tmp/edhr-page-qa-candidate-business-summary.json'])
check('check.pagination-http-membership-and-read-integrity','integration','真实JWT/filter/MockMvc/PG校验边界、成功结构、身份范围与读取不变。','automated-test',business_command,[
    'New28 covers nonpositive/INT_MIN page or size→400; negative multiplication overflow, positive wrap to0, positive-start end overflow and distant positive pages→empty array; INT_MAX legitimate first-page size allowed; normal/default/last/empty queues preserved.',
    'Synthetic signed JWT uses real product filter and JPA/native queue queries; not password-login or browser E2E. Spoofed assigneeId does not replace principal; candidate/unrestricted/status and DHR/other-user filtering/order exercised; anonymous remains401.',
    'New28 compare task/instance/action-log/audit row snapshots before/after queue reads; existing22 separately exercise controlled writes/authorization, not a claim all52 only read.',
    '/tmp/edhr-page-qa-candidate-business-summary.json'])
check('check.pagination-source-arithmetic-and-fixed-contracts','security','有限源码独立复核long边界和既有权限/队列契约未变，无迁移或UI改变。','inspection','git diff '+base+'..'+core+' -- gmp-platform; fixed Git source/blob checks',[
    '/tmp/edhr-page-qa-source-review.json:source-only child FINAL,6 finite checks, no child instances or repairs/runtime.',
    'Only production delta is todo/done positive validation before query, long offset/end and bounded int cast. Maximum positive-int end <= INT_MAX squared < Long.MAX_VALUE. Other controller bodies, SQL, auth, membership, DHR exclusion/order/defaults/array/permissions/actions unchanged; no arbitrary size cap.',
    'New28 fixture added; all prior tests/configuration unchanged; no assertions weakened or new tests skipped in actual run. No database schema/migration, frontend UI or full frontend build requirement. Maven build:dhr-print is only existing build prerequisite.'])
check('check.pagination-ontology-applicability-and-knowledge89','ontology','核对技术分页不触发业务语义同步，独立正式知识结构89通过且不冒称全库语义。','automated-test',knowledge_command,[
    'Fresh '+head+':BusinessKnowledgeModelTest89/89,0 failures/errors/skip; knowledge0.3.25/schema1.2.0 unchanged.',
    'Actually read knowledge README/open questions, relevant DEC0031/0033/0081 and affected architecture/current definitions; knowledge/architecture/assets have no diff. Technical integer input/index repair changes no business candidate/action/lifecycle/audit/frozen policy, so ontology not-applicable is consistent. No formal ontology role or new semantic record claimed.',
    '/tmp/edhr-page-qa-candidate-knowledge-summary.json','/tmp/edhr-page-qa-source-review.json'])
check('check.pagination-ledger-byte-rebuild','documentation','独立从固定Git基线完整重建并比较冻结台账每个字节。','command',ledger_command,[
    'Actual --check exit0 for catalog baseline '+read+'; generator performs no product runtime or new semantic acceptance.',
    '/tmp/edhr-page-qa-ledger-check-summary.json'])
check('check.pagination-original-provenance-and-finite-progress','documentation','额外原件、继承、范围和实际计数核验，待审与暂缓保持。','inspection','python3 /tmp/edhr-page-qa-inspect-evidence.py',[
    '16 archived original file receipts verified; prior485 source and6 semantic source objects preserved;108 historical rows and no new formal semantic records. Exactly one prior finding advanced: signature accepted by genuine PR22 passed8/8 original; other47 unchanged.',
    '53 helper finite ranges +7 primary methods imported once, all60 Git blob/SHA/ranges valid; front child originals not double-imported. Excluded original028 remains excluded with original evidence retained.',
    'Fixed2864 paths/2552 knowledge IDs,545 overlapping scope rows/49 finding records; not unique methods/defects or whole-file coverage.123 source and63 semantic/dependency rows need delta review,4 gaps and whole-file completion0 retained; whole branch not accepted.',
    'Primary red22/6 and green52 original HEAD13def dirty qualification retained, not relabeled committed-run success. No generic action policy, deferred record-control/DHR/A12, AuditEvent or historical signature issue closed here.',
    '/tmp/edhr-page-qa-evidence-inspection.json'])
quality={'qualityResult':{'result':'passed','baseCommit':base,'headCommit':head,'contractBaseline':{'sourceCommit':head,'targetBranch':'edhr-dev','targetCommit':base,'contractReadCommit':read,'uncommittedContractPaths':[]},'workingTreeState':{'status':'clean','includedPaths':[],'excludedPaths':[],'untrackedPaths':[]},'knowledgeBaselineVersion':'0.3.25','checks':checks,'findings':[{'id':'W3D-TASK-PAGINATION-001','severity':'medium','scope':'W3 todo/done integer pagination input and bounded list indexes','summary':'旧整数分页缺少正数约束且int回绕导致错误响应或错误页；当前固定候选已独立验收修复。','reproductionSteps':['Export immutable13def source in /tmp and add unchanged core28 fixture only.','Run native HTTP queue tests through signed JWT/filter against owned PG16; verify22 failures/6 controls.','Run final clean52 on '+head+'.'],'expectedResult':'非正整数分页返回400；正超范围空数组；正常页、成功数组、认证/候选/DHR边界与读取不变。','actualResult':'旧28中22断言失败/6正向通过；最终52/52通过，其中native50，无失败/错误/跳过。','evidence':['/tmp/edhr-page-qa-baseline-red-summary.json','/tmp/edhr-page-qa-candidate-business-summary.json'],'resolutionStatus':'resolved','resolutionEvidence':[{'type':'commit','reference':core},{'type':'command','reference':'/tmp/edhr-page-qa-candidate-business-summary.json at '+head},{'type':'document','reference':'/tmp/edhr-page-qa-source-review.json'}]}],'residualRisks':[{'id':'risk.pagination-general-binding-outside-slice','description':'非整数/超int请求绑定、其他控制器分页及全局异常策略未由此片修复或验收。','impact':'不能宣称所有任意非法参数均已返回400或全站分页问题关闭。','mitigation':'保持当前整数范围验收边界，后续整体审查按真实入口另行复现和小批处理。'},{'id':'risk.pagination-runtime-scope-finite','description':'合成JWT/MockMvc与原生PG验证不包含真实密码登录、浏览器UI、完整多租户或全工作流生命周期。','impact':'本次passed只覆盖固定候选列明读取及相邻授权回归。','mitigation':'无UI/迁移变更相应检查不适用；保留既有未决多租户/动作规则及全W2/W3、W4–W7余项。'},{'id':'risk.existing-deferred-history-retained','description':'记录控制/两项DHR high/A12暂缓、四知识gap、W5-AUDIT-HASH-001及历史签名原文不可恢复继续保留。','impact':'当前局部修复不能视为整体分支或完整DHR生命周期已验收。','mitigation':'持续总账保留旧open/deferred与原件，后续按依赖和真实授权推进。'}],'blockingConditions':[]}}
path=Path('/tmp/edhr-page-qa-qualityResult.yaml');path.write_text(yaml.safe_dump(quality,allow_unicode=True,sort_keys=False,width=110))
validation={'author':'/root/pagination_independent','status':'FINAL','recordedAt':datetime.now(ZoneInfo('Asia/Shanghai')).isoformat(),'level':'L2','baseCommit':base,'headCommit':head,'contractReadCommit':read,'qualityResult':'passed','requiredChecks':len(checks),'independentBusinessTests':business['totals'],'nativePostgresSubset':50,'mockitoSubset':2,'independentKnowledgeTests':knowledge['totals'],'baselineRed':{'sourceCommit':base,**red['totals'],'positiveControls':6},'ledgerCheck':{'command':ledger_command,'exit':0,'mechanicalOnly':True},'ownedDatabase':{'containerId':'38dd46d85414bf0bc8a7387379d5fcc8cf564ca022a6d9d249cf880c8642fc09','loopback':'127.0.0.1:55432','database':'edhr_w3_command_test','containerCleanup':'retained for parent after FINAL'},'children':[{'name':'/root/pagination_independent/source_boundary_review','status':'FINAL','runtimeExecuted':False,'repositoryMutations':False,'findings':[]}],'allChildInstancesFinal':True,'freshAfterImplementation':True,'participatedInFix':False,'repositoryMutations':False,'ontologyGateAssessment':'not-applicable, no formal ontology role/new semantics claimed','wholeBranchAccepted':False,'excluded':['private logs','Surefire XML','JWTs/credentials','exported full baseline source','node_modules caches']}
Path('/tmp/edhr-page-qa-validation.json').write_text(json.dumps(validation,ensure_ascii=False,indent=2)+'\n')
files=['edhr-page-qa-qualityResult.yaml','edhr-page-qa-validation.json','edhr-page-qa-candidate-business-summary.json','edhr-page-qa-candidate-knowledge-summary.json','edhr-page-qa-baseline-red-summary.json','edhr-page-qa-baseline-export.json','edhr-page-qa-ledger-check-summary.json','edhr-page-qa-evidence-inspection.json','edhr-page-qa-source-review.json','edhr-page-qa-run.py','edhr-page-qa-export-baseline.py','edhr-page-qa-inspect-evidence.py','edhr-page-qa-write-result.py']
manifest={'author':'/root/pagination_independent','status':'FINAL','baseCommit':base,'headCommit':head,'allChildInstancesFinal':True,'files':[{'path':str(Path('/tmp')/name),'bytes':(Path('/tmp')/name).stat().st_size,'sha256':sha((Path('/tmp')/name).read_bytes())} for name in files],'excluded':validation['excluded']}
manifest_path=Path('/tmp/edhr-page-qa-manifest.json');manifest_path.write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
assert git('rev-parse','HEAD').decode().strip()==head and git('status','--porcelain')==b''
print(json.dumps({'qualityResult':'passed','qualityPath':str(path),'qualitySha256':sha(path.read_bytes()),'manifestPath':str(manifest_path),'manifestSha256':sha(manifest_path.read_bytes()),'requiredChecks':len(checks),'headCommit':head},ensure_ascii=False))
