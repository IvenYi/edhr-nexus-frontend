import json,hashlib,subprocess
from pathlib import Path
import yaml
root=Path('/workspace/edhr-nexus-frontend'); base='34f7c9d736ac62961330343c64bc610fab41ad1c'
def sha(data):return hashlib.sha256(data).hexdigest()
def file(path):
 p=root/path; data=p.read_bytes(); blob=subprocess.check_output(['git','rev-parse',base+':'+path],cwd=root,text=True).strip()
 assert subprocess.check_output(['git','show',base+':'+path],cwd=root)==data
 return {'path':path,'gitCommit':base,'gitBlob':blob,'sha256':sha(data)}
controller='gmp-platform/backend/src/main/java/com/zencas/edhr/masterdata/controller/ProcessModelingController.java'
validator='gmp-platform/backend/src/main/java/com/zencas/edhr/masterdata/service/RouteGraphValidator.java'
engine='gmp-platform/backend/src/main/java/com/zencas/edhr/production/service/ProductionExecutionEngine.java'
master='gmp-platform/backend/src/main/resources/db/changelog/db.changelog-master.yaml'
schema='gmp-platform/backend/src/main/resources/db/changelog/baseline/0001-current-schema.sql'
dec83='docs/knowledge/decisions/DEC-0083-route-graph-save-connectivity.yaml';dec84='docs/knowledge/decisions/DEC-0084-route-graph-topology.yaml'
rule='docs/knowledge/rules/route-graph.yaml';fact='docs/knowledge/facts/route-graph.yaml';init='docs/knowledge/evidence/initialization-reference-maintenance-2026-10-21.md'
specs=[(controller,812,844,'saveRouteGraph','归一化和拓扑校验先于删除、保存及审计；原权限和事务注解。'),(controller,1000,1018,'toRouteNode','拒绝null/空键，空类型归一OPERATION，nodeKey和operationId分别保留。'),(controller,1020,1042,'toRouteRelation','null/空端点拒绝、类型白名单和端点trim；端口不构成边身份。'),(validator,14,35,'validate:structure','唯一key、唯一边界、全图自连/重复边拒绝和REWORK端点骨架排除。'),(validator,36,62,'validate:topology/connectivity','非REWORK骨架拓扑排序和正反可达性；允许并行/合流/空骨架直连。'),(validator,65,75,'reachable','迭代可达性含seen集合，不按operationId合并节点。'),(engine,33,61,'startIssues','普通开工拒绝REWORK；现有条件边执行阻断保留。'),(engine,63,69,'validateRoute','递归循环校验跳过REWORK节点，不按relationType跳过。'),(engine,71,82,'collectPredecessors','跳过REWORK节点，不发明返工运行资格。'),(master,1,5,'databaseChangeLog','当前初始化仅schema+seed，不加载历史迁移。'),(schema,640,657,'form_template_version tail','projection_frozen_json列存在，仅结构事实，不推断运行消费。'),(schema,733,752,'material','brand_name可空当前最终列。'),(schema,1133,1155,'signature','snapshot_data text+JSON合法性CHECK；不等同历史摘要恢复。')]
source=[]
for p,start,end,symbol,scope in specs:
 lines=(root/p).read_text().splitlines();assert end<=len(lines)
 source.append({**file(p),'symbol':symbol,'startLine':start,'endLine':end,'scope':scope,'depth':'source-inspected','runtimeExecuted':False,'rangeSha256':sha(('\n'.join(lines[start-1:end])+'\n').encode())})
records=[]
def add(id,path,scope,conclusion='consistent',status='reviewed',evidence=None,excluded=None):
 doc=yaml.safe_load((root/path).read_text()) if path.endswith('.yaml') else None
 rec=None
 def walk(x):
  nonlocal rec
  if isinstance(x,dict):
   if x.get('id')==id:rec=x
   for v in x.values():walk(v)
  elif isinstance(x,list):
   for v in x:walk(v)
 if doc:walk(doc);assert rec is not None
 records.append({'id':id,'recordType':'document' if doc is None else ('fact' if id.startswith('fact.') else 'rule' if id.startswith('rule.') else 'decision-statement'),**file(path),'sourceLocator':id if doc else '当前master/历史SQL/代表列边界','originalMaturity':None if doc is None else rec.get('status','specified'),'reviewStatus':status,'conclusion':conclusion,'scope':scope,'evidenceReferences':evidence or [controller,validator],'excluded':excluded or [],'recordSha256':sha(json.dumps(rec,ensure_ascii=False,sort_keys=True).encode()) if rec else sha((root/path).read_bytes()),'runtimeExecuted':False})
add('DEC-0083-01',dec83,'后端图保存的START→全部OPERATION→END连通；旧图读取或前端交互不据此认证。',excluded=['前端编辑/提示/保存前元数据调用'])
add('DEC-0083-02',dec83,'历史声明中不新增生产环路限制仅被DEC-0084-01替代；返工节点隔离、并行、多出口、版本/冻结保护保留。',evidence=[dec84,validator,controller],excluded=['整个DEC0083未被废弃','不重测历史快照迁移'])
add('DEC-0084-01',dec84,'后端普通骨架有向无环；排除显式REWORK节点关联边，不限制正常节点单出口。')
add('DEC-0084-02',dec84,'后端全图自连/同向对重复边和未知类型拒绝；nodeKey为身份，不按operationId/端口/关系类型去重。',excluded=['前端连线/重连/快捷/转换入口未审'])
add('DEC-0084-03',dec84,'仅支持性核对后端保留nodeKey及operationId；核心画布与候选区分未纳入本批，完整声明保留pending。','pending','pending',evidence=[controller],excluded=['画布及候选视觉/交互','编号呈现与选中目标运行'])
add('DEC-0084-04',dec84,'后端普通开工显式REWORK阻断保持；普通节点之间REWORK关系类型不绕过无环。不推断完整返工执行。',evidence=[engine,validator],excluded=['返工文字/虚线/预览UI未审'])
add('rule.route-graph.save-connectivity',rule,'有效后端保存规则整合DEC83与84精确替代，不把草稿WORK策略迁入路线。',evidence=[dec83,dec84,controller,validator],excluded=['前端行为部分未审'])
add('fact.route-graph.save-valid',fact,'配置请求派生校验事实，只说明validate当前请求，不提升到持久化状态或生产执行资格。',evidence=[validator])
add('document.initialization-reference-maintenance-2026-10-21',init,'当前master只含schema/seed；历史0104/0118等只作test资源；签名TEXT、projection_frozen_json存在、material.brand_name可空三项代表结构与说明一致。',evidence=[master,schema],excluded=['107处全量引用逐项重审','完整schema等价','实际DB/迁移执行由主侧及质量角色负责'])
for p in ['gmp-platform/backend/src/test/resources/db/changelog/0104-dhr-summary-model-reset.sql','gmp-platform/backend/src/test/resources/db/changelog/0118-signature-payload-text.sql']:
 if not (root/p).exists():
  if '0104' in p: assert len(list((root/'gmp-platform/backend/src/test/resources/db/changelog').glob('0104*')))==1
  else:raise AssertionError(p)
readpaths=['AGENTS.md','docs/agents/business-knowledge-modeler.md','docs/agents/agent-handoff-contract.md','docs/architecture/business-knowledge-model.md','docs/knowledge/README.md','docs/knowledge/open-questions.yaml',dec83,dec84,rule,fact,init,'docs/knowledge/evidence/route-graph-save-connectivity-20261025.md','docs/knowledge/evidence/route-graph-topology-20261025.md','docs/knowledge/evidence/route-graph-topology-20261025.yaml']
report={'role':'business-knowledge-modeler','status':'FINAL','baseCommit':base,'knowledgeBaselineVersion':'0.3.25','records':records,'sourceMap':source,'readAssetHashes':[file(p) for p in readpaths],'counts':{'semanticRows':len(records),'reviewedScopedRows':sum(r['reviewStatus']=='reviewed' for r in records),'pendingRows':sum(r['reviewStatus']=='pending' for r in records),'sourceScopes':len(source),'runtimeTests':0,'knowledgeEdits':0},'exclusions':['No frontend UI/visual review','No business/JDBC/Maven execution','No whole-audit completion','No definition maturity upgrade','No live database or historical data changes'],'observations':['Null type validator NPE is not shown HTTP-reachable: controller rejects null payload and defaults empty type before validator.','Engine validateRoute scans routeEdges recursively; performance/growth belongs primary measurement, not a semantic policy defect.']}
Path('/tmp/edhr-growth-ontology-review.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
result={'ontologyResult':{'result':'not-applicable','baselineBefore':'0.3.25','baselineAfter':'0.3.25','contractBaseline':{'sourceCommit':base,'targetBranch':'edhr-dev','targetCommit':base,'contractReadCommit':base,'uncommittedContractPaths':[]},'reason':'本批为有限存量语义审查与只读测量，已核对范围没有确认需要修改的业务定义或知识记录；保留specified/internal。not-applicable仅表示无需知识变更，不表示全库无需审查。9记录中8有限范围reviewed/consistent，DEC0084-03核心UI仍pending；所有涉及UI的其他声明仅认证所列后端子范围。','changedArtifacts':[],'knowledgeSync':[{'id':r['id'],'disposition':'retained' if r['reviewStatus']=='reviewed' else 'deferred','scope':r['scope'],'sourceReferences':r['evidenceReferences']} for r in records],'conflicts':[],'questions':[],'validationEvidence':[{'id':'growth.scope-source-inspection','checkType':'evidence-path','command':'读取固定34f7c9d7原始声明、确认Markdown及13个源码范围；/tmp/edhr-growth-ontology-build.py验证source blob、SHA及行范围','outcome':'passed','evidence':['/tmp/edhr-growth-ontology-review.json','13 source-inspected scopes; no runtime execution']},{'id':'growth.statement-scope','checkType':'reference','command':'Python yaml.safe_load解析当前DEC0083/0084、rule/fact；按ID定位；核对DEC0084-01对DEC0083-02的局部替代','outcome':'passed','evidence':['8 reviewed finite semantic rows; 1 pending UI statement; 0 knowledge edits']}],'roadmapProgress':{'stage':'P0','status':'in-progress','exitCriteriaEvidence':[],'deferredStages':['P1','P2','P3']}}}
Path('/tmp/edhr-growth-ontology.yaml').write_text(yaml.safe_dump(result,allow_unicode=True,sort_keys=False))
print(json.dumps({'counts':report['counts'],'result':'not-applicable','resultSha256':sha(Path('/tmp/edhr-growth-ontology.yaml').read_bytes()),'reviewSha256':sha(Path('/tmp/edhr-growth-ontology-review.json').read_bytes())}))
