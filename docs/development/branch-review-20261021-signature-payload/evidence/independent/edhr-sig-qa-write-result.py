from pathlib import Path
from datetime import datetime
from zoneinfo import ZoneInfo
import hashlib,json,subprocess,yaml

repo=Path('/workspace/edhr-nexus-frontend')
base='c3343f45bb79f72368937f0d197ae01f989f0390'
head='aaef52a782327e68da736faf83a249a3217b7228'
read='c062c2f99e143e7fd06b410c7ffdf4d47cf8bd49'
core='2ead6de2ed149f9c10a7786a555b0235c86b3186'
prefix=Path('/tmp')
def load(name): return json.loads((prefix/name).read_text())
def git(*args): return subprocess.check_output(['git',*args],cwd=repo,text=True).strip()
def sha(path): return hashlib.sha256(path.read_bytes()).hexdigest()
assert git('rev-parse','HEAD')==head and git('rev-parse','origin/edhr-dev')==base
assert not git('status','--porcelain')
business=load('edhr-sig-qa-candidate-business-summary.json')
knowledge=load('edhr-sig-qa-candidate-knowledge-summary.json')
red=load('edhr-sig-qa-baseline-red-summary.json')
inspection=load('edhr-sig-qa-evidence-inspection.json')
assert business['counts']==dict(tests=104,failures=0,errors=0,skipped=0)
assert knowledge['counts']==dict(tests=89,failures=0,errors=0,skipped=0)
assert red['counts']==dict(tests=7,failures=1,errors=3,skipped=0)
assert all(c['problemType']=='com.zencas.edhr.common.exception.BusinessException' for s in red['suites'] for c in s['cases'] if c['status']=='error')
assert all(r['sourceCommit']==head and r['cleanAtStart'] and r['after']=={'commit':head,'status':''} and r['commandExit']==0 for r in [business,knowledge])
native=[s for s in business['suites'] if s['name'].endswith(('SignatureSnapshotPostgresTest','SignatureSnapshotMigrationPostgresTest'))]
assert len(native)==2 and sum(s['counts']['tests'] for s in native)==18
for r in [business,knowledge]:
    assert all(s['fresh'] for s in r['suites'])
    assert all(s['counts']['failures']==s['counts']['errors']==s['counts']['skipped']==0 for s in r['suites'])

business_command=' '.join(business['command'])
knowledge_command=' '.join(knowledge['command'])
ledger_command='python3 scripts/build-branch-review-ledger.py --ref '+read+' --catalog docs/development/branch-review-20261021-signature-payload/source-catalog.json --out docs/development/branch-review-20261021-signature-payload/ledger --check'
checks=[]
def check(id,category,description,method,command,evidence):
    checks.append(dict(id=id,required=True,category=category,description=description,method=method,command=command,outcome='passed',evidence=evidence))
check('check.signature-clean-integrated-candidate','requirements','独立获取edhr-dev并核对实际目标、受测候选与契约，L2范围及最小修复与决策包一致。','inspection','git fetch origin edhr-dev; git diff c3343f45..aaef52a7; git status --porcelain',[
    'Actual base '+base+', functional/tested candidate '+head+', clean before and after both fresh runs; base is an ancestor and target remains unchanged.',
    'Contract read at '+read+'; AGENTS/quality/unified/codeplz bytes identical in target and final candidate. c062→aaef only frozen L0 audit inventory/documentation.',
    '/tmp/edhr-sig-qa-evidence-inspection.json'])
check('check.signature-independent-native-red','database','在隔离Git导出中独立复现旧JSONB导致的原文和归档摘要错误，保留真实红证。','automated-test',' '.join(red['command']),[
    'Exported immutable '+base+' to /tmp/edhr-sig-qa-baseline-source; only retained unchanged seven-case fixture added; shared repository source and tests not modified.',
    'Expected Maven exit1:7 tests,1 original-text assertion failure,3 actual archive BusinessException errors,3 passing controls,0 skipped. Product errors are not fixture setup failures.',
    '/tmp/edhr-sig-qa-baseline-export.json','/tmp/edhr-sig-qa-baseline-red-summary.json'])
check('check.signature-fresh-clean104','regression','对干净固定候选独立完整clean运行八套件104例，排除陈旧编译及旧注解镜像测试。','automated-test',business_command,[
    'Fresh at '+head+':104 tests,0 failures,0 errors,0 skipped; one complete independent run, not a union of retries.',
    'Auth24; ExecutionAccess12; ProductionExecutionEngine22; DhrReviewService10; DhrReviewLifecycleIntegration5(H2); DhrAttachmentAndArchive13; native JPA roundtrip9; native Liquibase migration9.',
    '/tmp/edhr-sig-qa-candidate-business-summary.json'])
check('check.signature-native-migration-and-negative','database','原生PG18实跑覆盖合法签署往返、原文及SHA、两归档消费者、输入边界、历史保留及有损回退拒绝。','automated-test',business_command,[
    'Owned PG16 loopback127.0.0.1:55432, database edhr_signature_test; all18 native cases actually ran,0 skipped.',
    'Real ExecutionAccess.signTarget production/DHR targets and signField→JPA committed/cleared→JDBC archive consumers; USER_PROFILE is entity-only raw-text roundtrip; synthetic authenticated ButtonSigner, not HTTP login E2E.',
    'Original0001 signatureDDL→actual0118 Liquibase; full master in a fresh separately owned temporary DB/public schema; legacy readable text/hashes/metadata unchanged; repeated Liquibase/rawDDL; JSON syntax/range refusals and accepted scalar/array/null/duplicate-key text; historical missing bytes still rejected; digest and payload corruption both rejected; automatic lossy rollback refused with committed new payload unchanged.',
    'Post-run queries:signature_payload_* schemas0; edhr_signature_master_* databases0. Long-lived owned test container retained for parent cleanup after this FINAL.',
    '/tmp/edhr-sig-qa-candidate-business-summary.json'])
check('check.signature-auth-hash-and-audit-boundaries','audit','有限源码复核确认生产者、资格、摘要算法和归档拒绝未改，不重写历史或AuditEvent。','inspection','git diff c3343f45..aaef52a7 -- gmp-platform/backend/src/main docs/knowledge; exact Git blob comparison',[
    '/tmp/edhr-sig-qa-source-review.json:source-only child FINAL; no child instances; six finite checks,125 prior SQL resources byte-unchanged.',
    'Production changes confined to Signature TEXT mapping, new0118 and master append; producer signTarget/signField/AuthController and both consumers unchanged. CHECK parses but does not replace stored text. No history reconstruction, hash rewrite, new policy, role, permission, UI or broad refactor.',
    'Former single reflection test only pinned JSONB annotation; removed rather than rewritten as TEXT mirror;18 native behavioral cases now independently pass.'])
check('check.signature-dhr-pdf-zip-regression','integration','既有DHR归档13例实际生成PDF/ZIP并核对相关输出，保留运行环境边界。','automated-test',business_command,[
    'DhrAttachmentAndArchiveTest13/13 passed in the same clean104 run using default Playwright cache symlinks to actual system Chromium154.0.8037.57; not bundled Chromium145.',
    'Authorization PDF font path points to EdhrTestCJK-Regular.ttf SHA25634fe3b59a729e29ae8a63fbe4f9316d3b72c8645168fd7e2b8531e95e17d011e. Test source/assertions unchanged; no fresh environment workaround applied by QA.',
    'No frontend UI code changed; no new full frontend build, browser UI E2E, PDF manual visual acceptance or production environment claim.',
    '/tmp/edhr-sig-qa-candidate-business-summary.json'])
check('check.signature-knowledge89-and-finite-semantics','ontology','独立知识正式校验和有限语义核对确认4内部证据/既有锚点与规范、实现和历史边界一致。','automated-test',knowledge_command,[
    'Fresh at '+head+':BusinessKnowledgeModelTest89/89,0 failures/errors/skipped;0.3.25/schema1.2.0 unchanged.',
    'Actual ontologyResult updated/FINAL at c4af50a7; child FINAL; original result retained. Independently verified all12 finite ID/source locator/recordSHA/sourceSHA/Gitblob claims and read affected definitions; no new rules/DEC or verified/runtime/stage upgrade.',
    '/tmp/edhr-sig-qa-candidate-knowledge-summary.json','/tmp/edhr-sig-qa-evidence-inspection.json'])
check('check.signature-inventory-provenance-and-honest-progress','documentation','独立ledger字节检查和额外原件/继承/范围核对，不用目录计数冒充全盘验收。','command',ledger_command,[
    'Actual --check exited0 with fixed '+read+' catalog baseline; not a new runtime or semantic review by generator.',
    'Fixed inventory2801 tracked paths/2552 knowledge IDs;485 overlapping source rows=392 preserved+88 helper+5 primary;108 historical/current semantic rows=96+12;48 finding records, not distinct product defects.',
    '37 exact original archive receipts verified; prior392 source and5 semantic source objects preserved;47 prior findings preserved from acceptance carry draft, only genuine prior PR21 item advanced; out-of-bounds original w3d-signature-source:028(10–22 of20 lines) retained unchanged and explicitly excluded, never clipped or counted.',
    '101 source rows/57 semantic rows still need delta review;4 historical evidence gaps remain. No whole-file or branch completion/percentage; old W5, record-control,2 deferred DHR high/A12 and generic action policy/pagination leads remain separate.',
    'Primary104 selection independently reconciled:focused103passed+1font failure followed byAuth24 replacing that suite; originals remain, no false primary single-run104 pass or128 unique count.',
    '/tmp/edhr-sig-qa-evidence-inspection.json'])

quality={'result':'passed','baseCommit':base,'headCommit':head,
    'contractBaseline':{'sourceCommit':head,'targetBranch':'edhr-dev','targetCommit':base,'contractReadCommit':read,'uncommittedContractPaths':[]},
    'workingTreeState':{'status':'clean','includedPaths':[],'excludedPaths':[],'untrackedPaths':[]},
    'knowledgeBaselineVersion':'0.3.25','checks':checks,
    'findings':[{'id':'W3-SIGNATURE-PAYLOAD-001','severity':'high','scope':'W3 signing original payload persistence and W1/W5 DHR archive consumers',
        'summary':'旧Signature JSONB规范化签署原文，导致合法签署归档摘要不一致；当前候选已独立复验修复。',
        'reproductionSteps':['Export c3343f45 immutable source; add retained byte-identical seven-case fixture only in /tmp.','Run native SignatureSnapshotPostgresTest against owned PG16 with old JSONB mapping.','Run final clean104 and native18 on '+head+'.'],
        'expectedResult':'原字符串UTF8 SHA与持久化读回相同，合法签署通过归档校验，篡改及原已不可验历史继续拒绝。',
        'actualResult':'旧7例1原文失败+3归档BusinessException、3对照过；最终候选104/104通过，其中原生PG18/18，无失败、错误或跳过。',
        'evidence':['/tmp/edhr-sig-qa-baseline-red-summary.json','/tmp/edhr-sig-qa-candidate-business-summary.json'],
        'resolutionStatus':'resolved','resolutionEvidence':[{'type':'commit','reference':core},{'type':'command','reference':'/tmp/edhr-sig-qa-candidate-business-summary.json at '+head},{'type':'document','reference':'/tmp/edhr-sig-qa-source-review.json'}]}],
    'residualRisks':[
        {'id':'risk.legacy-signature-original-bytes-unrecoverable','description':'JSONB已丢失的历史原文无法由0118恢复；旧摘要不重算，部分旧签名仍可能阻断归档。','impact':'本批修复后续无损持久化，不能宣称所有旧档案已恢复可验。','mitigation':'保留旧可读文本、摘要和元数据并继续拒绝不一致；未来历史处置需独立真实依据和授权。'},
        {'id':'risk.application-migration-pairing','description':'TEXT转回JSONB会破坏新签署字节；旧JSONB映射应用继续写TEXT库也可能再次规范化。','impact':'不能将本批视为旧应用混跑、应用回退或生产迁移验收。','mitigation':'应用与前向迁移配套；有损自动rollback明确拒绝；生产发布/备份恢复及运维实施另行安排。'},
        {'id':'risk.scope-remains-finite','description':'UI/完整HTTP认证到归档链、生产迁移及全W0–W7尚未验收；当前native签署人部分为合成认证上下文。','impact':'独立passed仅覆盖此固定候选的列明存储、迁移、负向及相邻回归。','mitigation':'保留W2/W3余项、W4裁决、W5-AUDIT-HASH-001、W6/W7、4gap、2延期DHR high/A12和记录控制延期；后续小批另验证，不伪造完整覆盖。'}],
    'blockingConditions':[]}

assert quality['checks'] and all(c['outcome']=='passed' for c in quality['checks'] if c['required'])
assert not quality['blockingConditions']
assert not any(f['resolutionStatus']=='open' and f['severity'] in ['high','critical'] for f in quality['findings'])
quality_path=prefix/'edhr-sig-qa-qualityResult.yaml'
quality_path.write_text(yaml.safe_dump({'qualityResult':quality},allow_unicode=True,sort_keys=False,width=110))
assert yaml.safe_load(quality_path.read_text())['qualityResult']==quality
validation={'author':'/root/signature_payload_independent','status':'FINAL','recordedAt':datetime.now(ZoneInfo('Asia/Shanghai')).isoformat(),'level':'L2','baseCommit':base,'headCommit':head,'contractReadCommit':read,'qualityResult':'passed','independentBusinessTests':business['counts'],'nativePostgresSubset':18,'h2DhrLifecycleSubset':5,'actualDhrPdfZipRegression':13,'independentKnowledgeTests':knowledge['counts'],'baselineRed':{'sourceCommit':base,**red['counts'],'businessErrors':3,'passingControls':3},'ledgerCheck':{'command':ledger_command,'exit':0,'mechanicalOnly':True},'ownedDatabase':{'containerId':'5dd0ccd19fbbd6b367e59c380257cada10e2ed408fe43dab77b97f437ce65858','loopback':'127.0.0.1:55432','database':'edhr_signature_test','leftoverOwnedMigrationSchemas':0,'leftoverOwnedMasterDatabases':0,'containerCleanup':'retained for parent after FINAL'},'children':[{'name':'/root/signature_payload_independent/source_semantic_review','status':'FINAL','findings':[],'runtimeExecuted':False,'repositoryMutations':False}],'allChildInstancesFinal':True,'freshAfterImplementation':True,'participatedInFix':False,'repositoryMutations':False,'wholeBranchAccepted':False,'excluded':['private logs','Surefire XML','credentials','exported full baseline source','font/browser binaries']}
validation_path=prefix/'edhr-sig-qa-validation.json'; validation_path.write_text(json.dumps(validation,ensure_ascii=False,indent=2)+'\n')
files=[quality_path,validation_path,prefix/'edhr-sig-qa-candidate-business-summary.json',prefix/'edhr-sig-qa-candidate-knowledge-summary.json',prefix/'edhr-sig-qa-baseline-red-summary.json',prefix/'edhr-sig-qa-baseline-export.json',prefix/'edhr-sig-qa-evidence-inspection.json',prefix/'edhr-sig-qa-source-review.json',prefix/'edhr-sig-qa-run.py',prefix/'edhr-sig-qa-export-baseline.py',prefix/'edhr-sig-qa-inspect-evidence.py',prefix/'edhr-sig-qa-write-result.py']
manifest={'author':'/root/signature_payload_independent','status':'FINAL','baseCommit':base,'headCommit':head,'allChildInstancesFinal':True,'files':[{'path':str(p),'bytes':p.stat().st_size,'sha256':sha(p)} for p in files],'excluded':validation['excluded']}
manifest_path=prefix/'edhr-sig-qa-manifest.json'; manifest_path.write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'result':'passed','headCommit':head,'qualityResult':{'path':str(quality_path),'sha256':sha(quality_path)},'validation':{'path':str(validation_path),'sha256':sha(validation_path)},'manifest':{'path':str(manifest_path),'sha256':sha(manifest_path)},'business':104,'native':18,'knowledge':89,'childrenFinal':True,'repositoryClean':True},ensure_ascii=False))
