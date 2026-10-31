from pathlib import Path
import json,yaml,hashlib,subprocess
root=Path('/workspace/edhr-nexus-frontend');prefix='/tmp/edhr-file-q1-'
base='ccedd56453c02c5d3acd60aa4351809a3928e83e';head='17f1fad49c863761269c1937b7d5059a5ecfe9e6'
current=json.loads(Path(prefix+'current-summary.json').read_text());old=json.loads(Path(prefix+'old-summary.json').read_text());knowledge=json.loads(Path(prefix+'knowledge-summary.json').read_text())
assert current['totals']=={'tests':29,'failures':0,'errors':0,'skipped':0}
assert old['totals']=={'tests':18,'failures':7,'errors':0,'skipped':0}
assert knowledge=={'tests':89,'failures':0,'errors':0,'skipped':0}
assert not subprocess.check_output(['git','status','--porcelain'],cwd=root).strip()
assert subprocess.check_output(['git','rev-parse','HEAD'],cwd=root,text=True).strip()==head
cmd=json.loads(Path(prefix+'old-command.json').read_text())
for p,h in cmd['testHashes'].items():assert hashlib.sha256((root/p).read_bytes()).hexdigest()==h,p
checks=[]
def check(id,category,description,method,command,evidence):
 checks.append({'id':id,'required':True,'category':category,'description':description,'method':method,'command':command,'outcome':'passed','evidence':evidence})
check('q1.baseline-contract','documentation','实时目标/干净候选/实际契约及祖先关系','command','git fetch origin edhr-dev; git status --porcelain; git rev-parse; git merge-base --is-ancestor',[prefix+'inspection.json',f'base={base}; head=tested={head}; contractRead={head}; clean'])
check('q1.rules-and-scope','requirements','工程修复与现有公开用途/文件完整性边界一致','inspection','Read actual FileController, SecurityConfig, FileObject, DhrFormFiles, API wrapper, DEC0063-10/11 and original user confirmation; compare diff',[prefix+'product-diff.txt',prefix+'inspection.json','No new format/size/ACL/deletion/migration policy; common150MiB/MD5 is separate from controlled DHR50MiB/SHA256.'])
check('q1.provenance','documentation','原始证据、本体结果和当前源码哈希','command','python3 /tmp/edhr-file-q1-inspect.py',[prefix+'inspection.json','18 primary records and3source snapshots; ontology6raw+self manifest;303knowledge unchanged; historical MockitoBean compile failure retained separately.'])
check('q1.inventory-a23','documentation','固定盘点、有限范围和A23未完队列核对','command','python3 scripts/build-branch-review-inventory.py --ref '+base+' --out /tmp/edhr-file-q1-inventory',[prefix+'inspection.json',prefix+'inventory-build.txt','Four files byte identical;5109paths/130SQL inventory only;6limitedsource/6existingsemantic overlap;whole-file0/unique null;A23five method records,1changed2added,old856+feature1/SQL130 pending.'])
testcmd='bash /workspace/.edhr-cloud-tools/mvn-edhr -f gmp-platform/backend/pom.xml -Dtest=FileUploadResourceTest,FileHttpBoundaryTest,FileControllerTest,DhrFormFilesTest test'
check('q1.upload-resource-regression','regression','实际流关闭/read-close失败/原件摘要回归9','automated-test',testcmd,[prefix+'current-test.txt',prefix+'current-FileUploadResourceTest.xml','9 passed; real disk bytes and observed owned stream lifecycle, mock repository; read1/close1/read2/close2 propagate and never save; first-stage failures leave no disk file.'])
check('q1.http-security-boundaries','api','实际JWT/filter/MVC公开引用与登录边界9','automated-test',testcmd,[prefix+'current-FileHttpBoundaryTest.xml','9 passed: NULL public request400 not500; four targets require real-reference mock result; private read anonymous401 before repository then valid JWT text bytes; anonymous mutation/list rejected. MockMvc, not TCP server or object ACL certification.'])
check('q1.adjacent-regression','regression','既有控制器及冻结原件检查相邻11回归','automated-test',testcmd,[prefix+'current-FileControllerTest.xml',prefix+'current-DhrFormFilesTest.xml',prefix+'current-summary.json','9existingcontroller+2DhrFormFiles allpass; total29 actual executions, no DB/SQL integration claim.'])
check('q1.actual-old-red','regression','同最终18在实际旧目标识别真实缺陷','automated-test','python3 /tmp/edhr-file-q1-run-old.py',[prefix+'old-command.json',prefix+'old-summary.json',prefix+'old-test.txt','18executions:7realassertionfailures/11positive,0error/skip; same finaltest hashes, copied unchanged; node_modules existing dependency symlink only.'])
check('q1.knowledge89','ontology','独立实际知识89及本体FINAL核对','automated-test','bash /workspace/.edhr-cloud-tools/mvn-edhr -f tools/knowledge-model/pom.xml test',[prefix+'knowledge-test.txt',prefix+'knowledge-junit.xml',prefix+'knowledge-summary.json','89 passed,0failure/error/skip; ontology FINAL/not-applicable, no maturity/newunique uplift.'])
check('q1.authored-whitespace','documentation','本批手工源码/测试/文档差量空白','command','git diff --check '+base+' '+head+' -- <authored paths excluding immutable evidence and fixed inventory>',[prefix+'whitespace.txt',prefix+'inspection.json'])
check('q1.owned-cleanup','documentation','隔离旧工作树正常清理且候选未修改','command','Remove only copied new test files and own dependency symlink; git worktree remove exact owned path; git status --porcelain',[prefix+'cleanup.json',prefix+'inspection.json','No containers started; no other worktree prune or historical cleanup.'])
findings=[
 {'id':'AUD-W5-FILE-UPLOAD-STREAM-001','severity':'medium','scope':'FileController.upload/computeMd5','summary':'上传流未关闭和摘要IO被吞成伪成功已修复。','reproductionSteps':['Run unchanged finalFileUploadResourceTest at actualbase; success/close failures/read1 swallowed and read2 streams left open are genuine assertion failures.','Run same test at currentcandidate.'],'expectedResult':'每次打开的输入流成功或失败均关闭；摘要读取/关闭失败不写盘不注册，复制读取/关闭失败不注册成功。','actualResult':'Currentresource9pass; first-stagefailure nofiles, allopenedstreams closed, no save; successful bytes and expected MD5 preserved. Copy partial-file compensation remains separate.','evidence':[prefix+'old-FileUploadResourceTest.xml',prefix+'current-FileUploadResourceTest.xml'],'resolutionStatus':'resolved','resolutionEvidence':[{'type':'commit','reference':head},{'type':'command','reference':prefix+'current-test.txt'}]},
 {'id':'AUD-W3-FILE-PUBLIC-NULL-TARGET-001','severity':'medium','scope':'FileController.publicPreview/canPublicPreview','summary':'可选用途null公开预览原500已恢复既有拒绝响应400。','reproductionSteps':['FileObject targetType null; anonymous GET /api/v1/files/77/public-preview.','OldsameHTTPtest expected400 but got500; current400 and existing message.'],'expectedResult':'未声明公开用途沿既有GENERAL003拒绝，四公开用途仍要求实际引用。','actualResult':'CurrentHTTP9pass and unitnullcasepass; oldHTTP1realassertfail; no extra public access granted.','evidence':[prefix+'old-FileHttpBoundaryTest.xml',prefix+'current-FileHttpBoundaryTest.xml'],'resolutionStatus':'resolved','resolutionEvidence':[{'type':'commit','reference':head},{'type':'command','reference':prefix+'current-test.txt'}]}
]
risks=[
 {'id':'risk.file-object-access','description':'通用私有文件仅要求登录；对象权限、实际业务归属与list路径暴露尚待完整核对。','impact':'本批不能认证共享文件ACL、跨对象保密或多租户。','mitigation':'沿已登记CAND-W3-FILE-OBJECT-ACCESS-001优先核实际文档/生产/签名引用及未绑定上传边界，不信任客户端targetType/targetId。'},
 {'id':'risk.cross-storage','description':'copy失败可能留下部分文件、DB失败孤儿、delete跨磁盘/DB顺序仍未整改。','impact':'流释放和摘要失败不等于跨介质原子提交。','mitigation':'后续真实事务/引用/磁盘故障注入及补偿方案，不自动删历史。'},
 {'id':'risk.capacity-and-related-paths','description':'PDF渲染/前端blob/DHR完整原件和签名Base64容量、AuthController相邻流与uploader system仍为候选。','impact':'无堆GC/SLA、所有上传路径或身份审计完成保证。','mitigation':'逐路径核实并量化；性能变更先讨论。'},
 {'id':'risk.runtime-scope','description':'仓储mock，HTTP为MockMvc和text原件，非真实DB/TCP浏览器/全部文件格式测试。MD5算法缺失分支仅静态核对。','impact':'不认证数据库迁移、PDF渲染、生产E2E或所有异常提供者。','mitigation':'按后续对应风险增量验证；无需为当前局部流修复假造广泛运行通过。'},
 {'id':'risk.global-audit-and-tools','description':'W2–W4余项、W5–W7与A23旧已审全量/SQL仍未完；既有strict19/lint缺配置/process旧SQL路径非绿，本实例未重跑。','impact':'局部passed不是整体审计或全局工具通过。','mitigation':'保持固定清单与下一步队列，后续增量审查；原TaskDetail友方/生产弹窗/记录控制DHRhigh-A12/四gap/缺文件政策保持。'}
]
quality={'qualityResult':{'result':'passed','baseCommit':base,'headCommit':head,'contractBaseline':{'sourceCommit':head,'targetBranch':'edhr-dev','targetCommit':base,'contractReadCommit':head,'uncommittedContractPaths':[]},'workingTreeState':{'status':'clean','includedPaths':[],'excludedPaths':[],'untrackedPaths':[]},'knowledgeBaselineVersion':'0.3.25','checks':checks,'findings':findings,'residualRisks':risks,'blockingConditions':[]}}
Path(prefix+'quality-result.yaml').write_text(yaml.safe_dump(quality,allow_unicode=True,sort_keys=False))
report=f'''# 独立质量复验 FINAL — passed

L2，新实例file_final_quality_20261031，未参与任何修复。实际base={base}，clean受测/审查head={head}，契约读取=head，知识0.3.25。11项必需检查全通过。未修改产品、测试、夹具、知识或验收文档，未查询CI、合并、部署或恢复历史数据。

实际当前29/29：新资源9、新HTTP9、原控制器9、DhrFormFiles2；知识89/89另实际运行。旧真实目标ccedd564原样最终18为7真实断言失败/11正向，0error/skip；其测试源sha与当前一致。旧资源6红分别覆盖未释放、吞掉读/关闭失败及null用途；旧HTTP1红为期望400实际500，不把编译或环境错误当产品反证。主侧首次MockitoBean编译失败原件保持，独立本次没有该启动失败。

实际文件与MD5一致，成功和四种read/close故障均关闭本次打开的流；第一阶段故障无磁盘文件、所有故障无仓储save。复制失败的部分文件及DB/磁盘补偿仍未认证。MD5缺算法为内部失败分支，标准算法未人为卸载，仅静态核对。public-preview的实体由orElseThrow确保存在，targetType才是真实可空值；明确null拒绝替代原错位防御。四公开用途仍检查实际引用，匿名私有读和写/列表在仓储前401，有效JWT读取测试text字节；这些是实际filter/MVC/响应层，仓储mock、不等于对象ACL或原生数据库。

规则核对确认通用150MiB/MD5和DHR受控50MiB/SHA256属于不同链；DEC0063-10/11、两条附件/导出规则与两项文件实现证据有限核对，不扩大业务能力或成熟度。下载Resource由框架消费，未提前关闭。未新增权限映射、迁移、历史回填、格式或大小政策。没有UI源码变动，未执行浏览器/前端构建/静态UI；既有strict19、lint配置及process旧SQL路径限制继续非绿，未借上批通过当本次执行。

独立校验主侧18原件/3源码、ontology6原件加manifest、303知识字节；四盘点按实际base重建完全相同。5109路径/130SQL只是盘点，6有限源码与6既有ID有历史重叠、whole-file0/unique null。A23五方法/1改2增不关闭旧856+feature1或130SQL，也不表示W2–W7全部完成。原缺陷两项在本批resolved；共享文件对象授权、跨介质一致性、uploader system、相邻签名上传、PDF/导出容量候选及原暂缓继续，优先级不能因局部passed下降。

独立自有旧工作树已正常移除，仅移除了复制的两个测试与自己的依赖链接，未prune其他工作树；没有启动数据库容器。最终源码工作树仍clean同head。此报告仅建议当前局部修复交付，不授权自动合并，也不认证整个文件子系统。
'''
Path(prefix+'quality-review.md').write_text(report)
raw=[]
for p in sorted(Path('/tmp').glob('edhr-file-q1-*')):
 candidates=[p] if p.is_file() else list(p.rglob('*')) if p.is_dir() else []
 for f in sorted(candidates):
  if f.is_file() and f.name!='edhr-file-q1-independent-evidence.json':raw.append({'path':str(f),'sha256':hashlib.sha256(f.read_bytes()).hexdigest(),'bytes':f.stat().st_size})
manifest={'roleState':'FINAL','qualityResult':'passed','agent':'file_final_quality_20261031','baseCommit':base,'headCommit':head,'contractReadCommit':head,'requiredPassed':len(checks),'requiredTotal':len(checks),'backendTests':current['totals'],'knowledgeTests':knowledge,'oldTests':old['totals'],'oldPositiveControls':11,'rawFiles':raw,'notRun':['native database and migration','browser and full frontend build','global premium/lint/process verifiers','load/heapGC/productionSLA','complete object ACL and cross-storage compensation'],'independence':'No product/test/fixture/knowledge changes; only byte-identical tests copied into owned actual-old worktree.'}
Path(prefix+'independent-evidence.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'result':'passed','checks':len(checks),'rawFiles':len(raw),'withManifest':len(raw)+1}))
