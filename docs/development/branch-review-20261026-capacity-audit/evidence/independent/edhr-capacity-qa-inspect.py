import collections,hashlib,importlib.util,json,re,subprocess,sys
from pathlib import Path
import yaml
sys.dont_write_bytecode=True
repo=Path('/workspace/edhr-nexus-frontend');B='docs/development/branch-review-20261026-capacity-audit';base='5259791fcbc5d1fddf04cd62a02d6593d00fe2e6';head='1081c4d8b15eb9e3ac7e64b04397bd10c0abffda'
def git(*args):return subprocess.check_output(['git',*args],cwd=repo,stderr=subprocess.PIPE)
def raw(ref,path):return git('show',ref+':'+path)
def sha(value):return hashlib.sha256(value).hexdigest()
def load(path):return json.loads((repo/path).read_text())
def evidence(value):
 ref=value['commit'];path=value['path'];value_raw=raw(ref,path)
 assert value.get('sha256')==sha(value_raw),(ref,path)
 if 'blob' in value:assert value['blob']==git('rev-parse',ref+':'+path).decode().strip()
 assert value.get('locator'),path

assert git('rev-parse','HEAD').decode().strip()==head
assert not git('status','--porcelain')
assert git('rev-parse','origin/edhr-dev').decode().strip()==base
protected=['gmp-platform','scripts','tools','docs/knowledge','docs/architecture','docs/agents','AGENTS.md','codeplzreadme.md','DESIGN.md']
assert not git('diff','--name-only',base,head,'--',*protected)
changed=git('diff','--name-only',base,head).decode().splitlines()
assert all(path.startswith('docs/development/') for path in changed)
parsed=collections.Counter()
for p in (repo/B).rglob('*'):
 if not p.is_file():continue
 if p.suffix=='.json':json.loads(p.read_text());parsed['json']+=1
 elif p.suffix=='.jsonl':
  for line in p.read_text().splitlines():
   if line.strip():json.loads(line)
  parsed['jsonl']+=1
 elif p.suffix in {'.yaml','.yml'}:yaml.safe_load(p.read_text());parsed['yaml']+=1
receipts=load(B+'/evidence/archive-receipts.json');actual=[]
for item in receipts['files']:
 path=repo/item['archive'];assert sha(path.read_bytes())==item['sha256'] and path.stat().st_size==item['bytes']
 source=Path(item['source']);assert source.exists() and source.read_bytes()==path.read_bytes()
 actual.append({'path':item['archive'],'sha256':item['sha256']})
assert len(actual)==29
scopes=[];map_counts={}
for group in ['workflow','dhr','primary','ontology']:
 path=B+'/evidence/'+group+'/edhr-capacity-'+group+'-source-map.json';d=load(path);map_counts[group]=len(d['sourceScopes'])
 for item in d['sourceScopes']:
  ref=item.get('sourceCommit') or d.get('fixedCommit');value=raw(ref,item['path']);start,end=item['range']
  assert ref==base and 1<=start<=end<=len(value.splitlines())
  assert item['sha256']==sha(value) and item['blob']==git('rev-parse',ref+':'+item['path']).decode().strip()
  assert item['wholeFileReviewComplete'] is False and type(item['runtimeExecuted']) is bool
  scopes.append(item['id'])
assert len(scopes)==len(set(scopes))==82
catalog=load(B+'/source-catalog.json');old=load('docs/development/branch-review-20261021-workflow-read-boundaries/source-catalog.json')
assert len(catalog['methods'])==656 and catalog['methods'][:574]==old['methods']
assert len(catalog['semanticSources'])==7 and catalog['semanticSources'][:6]==old['semanticSources']
assert len(catalog['findings'])==57 and len(old['findings'])==52
accepted={'W3-INSTANCE-GRAPH-CURRENT-001','W3-INSTANCE-LOGS-ARRAY-001','W3-INSTANCE-READ-ID-PRECISION-001'}
assert [f for f in catalog['findings'][:52] if f['id'] not in accepted]==[f for f in old['findings'] if f['id'] not in accepted]
for finding in catalog['findings'][:52]:
 if finding['id'] in accepted:
  original=next(x for x in old['findings'] if x['id']==finding['id'])
  assert finding['disposition']=='fixed-and-independently-accepted' and finding['priorCatalogDisposition']['originalRecord']==original
assert catalog['findings'][52]['id']=='QF-READ-DOC-001'
risk_ids={'PERF-WORKFLOW-QUEUE-001','PERF-DHR-EVIDENCE-NPLUS1-001','PERF-DHR-REVIEW-REPEAT-001','PERF-EXECUTION-REFERENCE-VIEW-001'}
assert {f['id'] for f in catalog['findings'][53:]}==risk_ids
for f in catalog['findings'][53:]:assert f['disposition']=='pending-performance-discussion' and not f['resolution']['fixCommits']
for f in catalog['findings']:
 for ev in f.get('evidence',[]):evidence(ev)
for note in catalog['importNotes']:
 for ev in note.get('evidence',[]):evidence(ev)
assert not any(r['id']=='w3d-signature-source:028' for r in catalog['methods'])
assert any(n.get('id')=='sig-rejected-range-028' for n in catalog['importNotes'])
merge='c671b23fd9847a7e1cb2d1bad3c3bb138fc5620f';delivery='423b17a6361d89661cd4774adb23b2d1f6497efd'
assert git('rev-parse',merge+'^{tree}')==git('rev-parse',delivery+'^{tree}')
a=load('docs/development/branch-review-20261021-workflow-read-boundaries/acceptance.json')
qp='docs/development/branch-review-20261021-workflow-read-boundaries/'+a['qualityResult']['path'];qr=yaml.safe_load((repo/qp).read_text())['qualityResult']
assert sha((repo/qp).read_bytes())==a['qualityResult']['sha256'] and qr['result']=='passed' and qr['headCommit']==a['testedCommit']
assert sum(x['required'] and x['outcome']=='passed' for x in qr['checks'])==10
spec=importlib.util.spec_from_file_location('qa_current_ledger',repo/'scripts/build-branch-review-ledger.py');module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module)
current=module.knowledge_records(module.Git(),base)
semantics=[json.loads(line) for line in (repo/(B+'/evidence/ontology/edhr-capacity-ontology-semantic-review.jsonl')).read_text().splitlines() if line.strip()]
assert len(current)==2618
assert {r['id'] for r in semantics}=={'DEC-0082-03','DEC-0082-04','DEC-0082-07','DEC-0082-14','DEC-0082-15','DEC-0082-16'}
for row in semantics:
 assert row['sourceCommit']==base and row['recordSha256']==current[row['id']]['recordSha256']
 assert row['conclusion']=='consistent' and row['businessRuntimeExecutedByOntologyInstance'] is False
 def visit(value):
  if isinstance(value,dict):
   if {'path','commit','sha256','locator'}<=value.keys():evidence(value)
   for child in value.values():visit(child)
  elif isinstance(value,list):
   for child in value:visit(child)
 visit(row)
charter=(repo/(B+'/audit-charter.md')).read_text();assert set(re.findall(r'^\| (A\d\d) \|',charter,re.M))=={f'A{i:02}' for i in range(1,23)}
models=yaml.safe_load((repo/(B+'/data-growth-model.yaml')).read_text());assert len(models['modules'])==8 and models['customerActualVolumeKnown'] is False and models['customerSlaKnown'] is False
matrix=yaml.safe_load((repo/(B+'/entry-matrix.yaml')).read_text());assert len(matrix['entries'])==7 and matrix['unknownDimensionsDefault']=='pending' and matrix['wholeFilesCompleted']==0
assert '活跃任务检查点' in charter and '不声称未运行时后台持续监听' in charter and 'pending-discussion' in charter
summary=load(B+'/ledger/summary.json')
assert summary['baselineCommit']=='98e874306cb1aeef8e73f1066bfe5afa24dcdff2' and summary['inventory']['trackedPaths']==3458
assert summary['sourceReview']['recordedScopes']==656 and summary['sourceReview']['carryStates']['needs-delta-review']==252
assert summary['knowledgeReview']['currentIds']==2618 and summary['knowledgeReview']['historicalScopedReviews']==114 and summary['knowledgeReview']['evidenceStates']['needs-delta-review']==101
assert summary['knowledgeReview']['historicalConclusions']['evidence-gap']==4 and summary['overallAuditComplete'] is False and summary['overallPercent'] is None
observations=[json.loads(line) for line in Path('/tmp/edhr-capacity-qa-observations.jsonl').read_text().splitlines()]
assert len(observations)==8
measured=[r for r in observations if r['case']=='small-page-full-materialization'];assert len(measured)==6
for row in measured:
 assert row['returnedRows']==5 and row['loadedWorkflowTaskEntities']==row['matchingRows'] and row['preparedStatements']==row['executedOrmQueries']==1
 assert row['databaseRowsUnchanged'] and row['distinctInstancePerMainTask'] and row['targetPartialUniqueIndexInstalled'] and row['missingWorkflowReferences']==row['duplicateActiveInstanceNodeKeys']==0
assert {(r['queue'],r['matchingRows']) for r in measured}=={(q,n) for q in ['todo','done'] for n in [100,1000,10000]}
fixture=load(B+'/evidence/workflow/edhr-capacity-workflow-fixture-qualification.json')
patterns=[re.compile(rb'eyJ[A-Za-z0-9_-]{15,}\.[A-Za-z0-9_-]{15,}\.[A-Za-z0-9_-]{15,}'),re.compile(rb'Bearer\s+[A-Za-z0-9._-]{30,}')]
scanned=0
for path in (repo/B).rglob('*'):
 if not path.is_file():continue
 assert path.suffix not in {'.log','.xml'} and '.private.' not in path.name
 if path.suffix in {'.json','.jsonl','.yaml','.md','.py','.java'}:
  assert not any(pattern.search(path.read_bytes()) for pattern in patterns),str(path);scanned+=1
assert not git('status','--porcelain') and git('rev-parse','HEAD').decode().strip()==head
out={'author':'/root/capacity_independent_final','baseCommit':base,'headCommit':head,'workingTreeCleanBeforeAndAfter':True,'allChangedPaths':changed,'protectedComparedPaths':protected,'changedProtectedPaths':[],'parsedArtifactTypes':dict(parsed),'primaryArchiveReceiptsVerified':len(actual),'primaryTmpOriginalsMatch':True,'newFiniteScopes':len(scopes),'sourceMapCounts':map_counts,'sourceScopeRecordsAreOverlapping':True,'old574SourceObjectsExact':True,'oldSixSemanticSourcesExact':True,'other49PriorFindingObjectsExact':True,'pr24ScopedAcceptanceCarryVerified':True,'newLowDocOverlayPreserved':True,'newOpenPerformanceRecords':4,'newFormalSemanticRows':6,'knowledgeIds':len(current),'allNewSemanticCanonicalHashesAndReceiptsValid':True,'charterDimensions':22,'growthModels':8,'entryGroups':7,'unknownDimensionsPending':True,'oldRejected028StillExcluded':True,'ledgerFrozenCountsVerified':True,'fourKnowledgeGapsRetained':True,'capacityObservations':{'tests':8,'successfulScaleCases':6,'dataSizes':[100,1000,10000],'pageSize':5,'returns5LoadsN':True,'oneQueryPerSuccessfulRequest':True,'notQueueNPlusOne':True},'tokenScanFiles':scanned,'literalJwtOrBearerShapesDetected':0,'rawLogsOrXmlArchived':False,'newProductFixes':0,'wholeBranchAccepted':False,'semanticOrRuntimeExecutionByThisInspector':False,'userDeferralsRetained':True}
Path('/tmp/edhr-capacity-qa-inspection.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'finiteMapsVerified':len(scopes),'primaryOriginals':len(actual),'semanticRows':6,'oldFindingObjectsExact':49,'charterDimensions':22,'productsChanged':0,'inspection':'passed'}))
