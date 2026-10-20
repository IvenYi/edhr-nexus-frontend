from pathlib import Path
from collections import Counter
import subprocess,json,hashlib,datetime

repo=Path('/workspace/edhr-nexus-frontend'); prefix='/tmp/edhr-w3-independent-ui-'
head='266a1635cc95870cd7907c574eb676db7f560d4f';base='a8285be9b91fb76bcb27ccb16a5258bda1fb5077'
sha=lambda b:hashlib.sha256(b).hexdigest()
git=lambda *args:subprocess.check_output(['git',*args],cwd=repo)
assert git('rev-parse','HEAD').decode().strip()==head
assert not git('status','--porcelain')
browser=json.loads(Path(prefix+'browser.json').read_text())
assert browser['passed']==36 and browser['failed']==0 and browser['sourceHead']==head
comparison=json.loads(Path(prefix+'premium-comparison.json').read_text())
assert comparison['completeFieldsAndMultiplicityEqual'] and comparison['baseFindings']==84 and comparison['headFindings']==84
rawbase=json.loads(Path(prefix+'premium-base.json').read_text());rawhead=json.loads(Path(prefix+'premium-head.json').read_text())
comparison['baseDistinctFindingFields']=len(set(json.dumps(x,sort_keys=True) for x in rawbase['findings']))
comparison['headDistinctFindingFields']=len(set(json.dumps(x,sort_keys=True) for x in rawhead['findings']))
Path(prefix+'premium-comparison.json').write_text(json.dumps(comparison,indent=2,ensure_ascii=False)+'\n')
paths=[
 'AGENTS.md','docs/agents/quality-verifier.md','docs/agents/agent-handoff-contract.md','DESIGN.md',
 'docs/knowledge/README.md','docs/knowledge/open-questions.yaml','docs/knowledge/decisions/DEC-0081-tenant-scoped-task-delegation.yaml',
 'gmp-platform/frontend/src/pages/workflow-center/TaskDetail.tsx','gmp-platform/frontend/src/pages/production/ProductionExecutionPage.tsx',
 'gmp-platform/frontend/scripts/test-tenant-task-transfer-browser.mjs','gmp-platform/frontend/src/components/AppDialog.tsx',
 'gmp-platform/frontend/src/components/FormDialog.tsx','gmp-platform/frontend/src/components/SnackbarProvider.tsx',
 'gmp-platform/frontend/src/App.tsx','gmp-platform/frontend/src/api/client.ts','gmp-platform/frontend/src/index.css']
receipts=[]
for p in paths:
 b=git('show',head+':'+p);current=(repo/p).read_bytes();assert b==current
 receipts.append({'path':p,'fixedCommit':head,'blob':git('rev-parse',head+':'+p).decode().strip(),'sourceSha256':sha(b),'afterWorkspaceSha256':sha(current),'unchanged':True})
Path(prefix+'source-integrity.json').write_text(json.dumps({'sourceCommit':head,'targetCommit':base,'contractReadCommit':head,'beforeWorkingTree':'clean','afterWorkingTree':'clean','paths':receipts},indent=2)+'\n')
finding={
 'id':'QF-W3-UI-DOC-COUNT-001','severity':'low','scope':'W3 documentation, premium finding counting terminology',
 'summary':'主侧文档未区分84条finding记录与82种不同完整字段集合，字段名易被理解为原数组长度。',
 'reproductionSteps':[
  'Read evidence/primary/edhr-w3-premium-baseline.json and candidate.json; len(findings) is84 in both.',
  'Serialize every finding with sorted keys: distinct set length82; Counter including duplicate multiplicity is equal between independent base/head.',
  'Compare README.md:19 and progress.json:81–82 stating各82/premiumBaselineFindings/premiumCandidateFindings without distinct qualification.'],
 'expectedResult':'明确“base/head各84条记录、82种完整字段集合；含重复次数逐字段完全相同，新增0”；保留原扫描/原对比证据。',
 'actualResult':'初轮set计数82被写入未标distinct的统计字段和说明；并非扫描漏执行，也没有产品新增finding。',
 'evidence':[prefix+'premium-comparison.json',
  'docs/development/branch-review-20261020-w3-write-boundaries/README.md:19',
  'docs/development/branch-review-20261020-w3-write-boundaries/progress.json:81'],
 'resolutionStatus':'open','resolutionEvidence':[],
 'deliveryImpact':'Low-risk counting clarification only; no product/test fix or rerun needed. Parent may correct current delivery narration in L0 without rewriting primary originals.'}
screens=[]
viewed={'generic-required-and-keyboard-cancel-1440-filled.png','generic-required-and-keyboard-cancel-390-filled.png','production-required-and-keyboard-cancel-1440-filled.png','production-required-and-keyboard-cancel-390-filled.png','generic-required-and-keyboard-cancel-390-popup.png','production-required-and-keyboard-cancel-390-popup.png'}
for p in sorted(Path(prefix+'screenshots').glob('*.png')):
 screens.append({'path':str(p),'sha256':sha(p.read_bytes()),'personallyViewed':p.name in viewed})
summary={
 'role':'fresh independent UI verification child; not implementation and not whole-batch qualityResult',
 'sourceCommit':head,'targetCommit':base,'contractBaseline':{'sourceCommit':head,'targetBranch':'edhr-dev','targetCommit':base,'contractReadCommit':head,'uncommittedContractPaths':[]},
 'knowledgeModelVersion':'0.3.25','schemaVersion':'1.2.0','workingTreeState':'clean',
 'repositoryMutations':[],'policySource':'Explicit user confirmation and DEC-0081; generic/ordinary tenant delegation; DHR unchanged',
 'skillsActuallyRead':['c1/frontend-design','c1/frontend-design-premium','canonical-ui-resolution.md','verification-checklist.md','anti-patterns.md','data-entry-patterns.md'],
 'skillsAvailabilityNote':'Available and read during this child turn; later cloud-skills availability update did not invalidate already-read exact official script.',
 'browser':{'exit':0,'cases':36,'passed':36,'failed':0,'generic':20,'production':16,'viewports':[[1440,960],[390,844]],'sourceHashMatchesFixedGit':True,'controlledApiOnly':True},
 'build':{'command':'npm run build (tsc -b and Vite)','exit':0,'logSha256':sha(Path(prefix+'build.raw.log').read_bytes()),'rawLogNotForArchive':True},
 'premium':comparison,'eslint':{'command':'npm run lint','exit':2,'reason':'ESLint8.57.1 cannot find configuration file; existing project limitation'},
 'inspection':[
  'Task picker input/selected value/query remain separate; new typing clears old selected ID while preserving input.',
  'Generic target GET cancels on query/dialog/task changes and transfer POST is aborted/ignored on route changes; old completion cannot annotate the new task.',
  'Production target GET uses object/owning operation/form/copy and a request generation guard; errors clear stale options and selection.',
  'Both mutations carry only explicit target/reason and appropriate task/form owner; production busyRef and generic disabled controls prevent duplicate dispatch.',
  '409/503 preserve edit text and expose correction/retry; success closes dialog and removes current handling actions based on actual returned view or generic transfer notice.',
  'Canonical MUI Autocomplete, AppDialog/FormDialog, shared theme/Snackbar and actual client reused; no parallel control system or global token/contract change.',
  'Browser fixtures assert exact production object101/operation a/form f/copy f, exact transfer payload and stale network request settlement; fixture state is not backend persistence evidence.',
  'Four filled and two narrow popup screenshots personally inspected: Chinese text/selected account readable and close/cancel/confirm controls stay in viewport.'
 ],
 'findings':[finding],
 'residuals':[
  'Whole-site official strict and ESLint remain unpassed; full finding multiset unchanged, not a global green claim.',
  'Existing ProductionExecutionPage window.confirm beforeunload guard atline221 unchanged from base; outside changed delegation flow.',
  'Remote query timing is immediate in both existing production and generic picker; no full hardware IME, screen-reader, 200% zoom, offline/session or theme matrix was executed.',
  'Real browser with controlled API does not prove authentication, database persistence, server qualification or DHR behavior; parent backend verifier covers those separately.',
  'No whole W3/branch audit conclusion, merge, deployment or historical data action.'
 ],
 'screenshots':screens,'allChildrenFinal':True,'childAgentsSpawned':[],
 'localConclusion':'No newly reproduced blocking UI/product defect; low documentation counting clarification remains open for L0 disposition.'}
Path(prefix+'summary.json').write_text(json.dumps(summary,indent=2,ensure_ascii=False)+'\n')
report='''# 独立 UI 复验

受测来源固定 `266a1635cc95870cd7907c574eb676db7f560d4f`，目标 `a8285be9b91fb76bcb27ccb16a5258bda1fb5077`；前后工作树干净，未修改仓库文件。角色/交接/设计契约实际读取于266a，知识0.3.25/schema1.2.0。

实际重跑36浏览器（20通用、16普通生产表单）全部通过，tsc/Vite构建通过。脚本使用真实两个页面、MUI共享组件、App主题、Router、QueryClient、Snackbar和真实client；合成API严格检查请求路径、生产真实所属操作/表单份及POST字段，旧GET/POST需实际settled/canceled后才断言无污染。没有把合成返回视图当数据库读回。409失败重试、503清空旧候选、输入保留、空结果、连续搜索、取消/关闭、路由切换、忙碌防重及两视口均在实际运行中覆盖。

四张填写态及两张390宽候选弹层已亲视：中文和目标姓名清楚，关闭/取消/确认可达，弹层未超出视口。沿用既有AppDialog/FormDialog及MUI Autocomplete，没有引入独立控件体系或改DESIGN。通用工作流的新目标/原因和成功责任提示与DEC0081一致；普通表单的新租户范围文字明确，DHR不由本UI脚本认证。

本实例重新从官方skill URI实际读取audit_project.py，原字节SHA67fd35597c85a2f37dd3c566f0bd79768cbe059114edcf28074fc5afa3e0ce68；对独立git archive导出的a828及真实候选运行strict，均exit2，各84条finding记录（82种不同字段集合），Counter按所有字段和重复次数完全相同，新增/移除0。npm lint实际exit2，原有ESLint配置缺失；这些只能作为无新增及既有限制披露，不能称全站严格静态检查通过。

发现QF-W3-UI-DOC-COUNT-001（low）：当前README:19/progress:81–82写各82而未说明distinct集合口径。主侧原始JSON数组实际84条，原对比用set计数82。建议L0交付说明明确84条/82种，保留所有主侧原件。这不涉及产品逻辑或测试标准，也不阻断当前代码切片；本实例未修改任何内容，交由主侧处置。

局部结论：未复现新的阻断性UI缺陷。受控API不等于全栈；没有运行真实后端、数据库、权限或DHR，也未认证完整IME/屏幕阅读器/200%缩放/离线会话/主题矩阵。原有window.confirm离页保护及全站strict/lint限制继续保留。不据此签收完整W3或整个分支；整批正式qualityResult由父质量实例汇总。
'''
Path(prefix+'review.md').write_text(report)
allow=['browser.json','browser.log','summary.json','review.md','source-integrity.json','official-audit.py','premium-base.json','premium-head.json','premium-comparison.json','premium-base.log','premium-head.log','lint.log','finalize.py']
files=[]
for suffix in allow:
 p=Path(prefix+suffix);assert p.exists();files.append({'path':str(p),'bytes':p.stat().st_size,'sha256':sha(p.read_bytes())})
for s in screens:
 p=Path(s['path']);files.append({'path':str(p),'bytes':p.stat().st_size,'sha256':s['sha256']})
Path(prefix+'safe-originals-manifest.json').write_text(json.dumps({'schema':'edhr-safe-independent-ui-original-manifest/v1','sourceCommit':head,'files':files,'excluded':['/tmp/edhr-w3-independent-ui-build.raw.log (raw build log not required; SHA in safe summary)'],'repositoryMutations':[]},indent=2)+'\n')
print(json.dumps({'cases':36,'passed':36,'buildExit':0,'strictBaseHeadEntries':[84,84],'distinct':[82,82],'newFindingRecords':0,'docFinding':finding['id'],'safeFiles':len(files)},ensure_ascii=False))
