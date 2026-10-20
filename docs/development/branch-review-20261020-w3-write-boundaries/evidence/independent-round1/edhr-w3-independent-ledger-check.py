from pathlib import Path
import subprocess,json,hashlib,yaml,collections,zipfile
repo=Path('/workspace/edhr-nexus-frontend');batch='docs/development/branch-review-20261020-w3-write-boundaries'
base='a8285be9b91fb76bcb27ccb16a5258bda1fb5077';head='266a1635cc95870cd7907c574eb676db7f560d4f';fixed='df6ea28a6388a89611786116700836c6bf7f4819'
cache={};receipt_cache={};errors=[];checks=[]
def git(*a):return subprocess.check_output(['git',*a],cwd=repo,stderr=subprocess.PIPE)
def raw(ref,path):
 k=(ref,path)
 if k not in cache:cache[k]=git('show',ref+':'+path)
 return cache[k]
def digest(b):return hashlib.sha256(b).hexdigest()
def canonical(o):return json.dumps(o,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode()
def doc(ref,path):return yaml.safe_load(raw(ref,path))
def paths(ref):return git('ls-tree','-r','--name-only','-z',ref).decode().split('\0')[:-1]
def check(name,condition,detail=None):
 checks.append({'id':name,'outcome':'passed' if condition else 'failed','detail':detail})
 if not condition:errors.append(name)
def records(ref):
 schema=doc(ref,'docs/knowledge/schema.yaml');tops=schema['collectionTypes'];nested=schema['nestedCollectionTypes'];out={}
 def add(o,typ,path,loc):
  i=o['id'];assert i not in out,(ref,i);out[i]={'record':o,'type':typ,'path':path,'locator':loc,'recordSha256':digest(canonical(o))}
 def visit(o,path,loc):
  if isinstance(o,dict):
   for k,v in o.items():
    l=loc+'/'+k.replace('~','~0').replace('/','~1')
    if k in nested and isinstance(v,list):
     for j,r in enumerate(v):add(r,nested[k],path,l+'/'+str(j))
    visit(v,path,l)
  elif isinstance(o,list):
   for j,v in enumerate(o):visit(v,path,loc+'/'+str(j))
 for p in paths(ref):
  if p.startswith('docs/knowledge/') and p.endswith(('.yaml','.yml')) and p!='docs/knowledge/schema.yaml':
   d=doc(ref,p)
   if isinstance(d,dict):
    for c,t in tops.items():
     for j,o in enumerate(d.get(c,[]) or []):add(o,t,p,'/'+c+'/'+str(j));visit(o,p,'/'+c+'/'+str(j))
 return out
old,new=records(base),records(head)
added=sorted(set(new)-set(old));removed=sorted(set(old)-set(new));maturity=[];discrepancy_lifecycle=[]
for k in old.keys()&new.keys():
 a,b=old[k]['record'],new[k]['record']
 for f in ('status','visibility'):
  if a.get(f)!=b.get(f):
   row={'id':k,'recordType':old[k]['type'],'field':f,'before':a.get(f),'after':b.get(f)}
   if f=='status' and old[k]['type']=='implementationDiscrepancy':discrepancy_lifecycle.append(row)
   else:maturity.append(row)
check('knowledge-id-transition',len(old)==2535 and len(new)==2546 and len(added)==11 and not removed,{'before':len(old),'after':len(new),'added':added,'removed':removed})
check('no-existing-maturity-or-visibility-changes',not maturity,maturity)
check('discrepancy-lifecycle-closure-is-explicit-scoped-fix-only',len(discrepancy_lifecycle)==3 and all(x['before']=='open' and x['after']=='resolved' for x in discrepancy_lifecycle),discrepancy_lifecycle)
def receipt(v):
 k=(v['commit'],v['path'],v['sha256'])
 if k in receipt_cache:return
 b=raw(v['commit'],v['path']);assert digest(b)==v['sha256'],('receiptSHA',v)
 if 'blob' in v:assert git('rev-parse',v['commit']+':'+v['path']).decode().strip()==v['blob'],('receiptBlob',v)
 receipt_cache[k]=len(b)
def walk_receipts(o):
 if isinstance(o,dict):
  if {'path','commit','sha256'}<=o.keys():receipt(o)
  for v in o.values():walk_receipts(v)
 elif isinstance(o,list):
  for v in o:walk_receipts(v)
semantic_path=batch+'/evidence/ontology/edhr-w3-tenant-transfer-semantic-review.jsonl'
semantics=[json.loads(l) for l in raw(head,semantic_path).decode().splitlines() if l.strip()]
seen=set()
for r in semantics:
 assert r['id'] not in seen;seen.add(r['id']);known=records(r['sourceCommit']) if r['sourceCommit'] not in [head,'cb2e9eef6cdb50077283c9707d257dcdd56a9e36'] else new
 s=known[r['id']];b=raw(r['sourceCommit'],r['sourcePath'])
 assert (s['recordSha256'],s['path'],s['locator'],s['type'])==(r['recordSha256'],r['sourcePath'],r['sourceLocator'],r['recordType'])
 assert digest(b)==r['sourceSha256'] and git('rev-parse',r['sourceCommit']+':'+r['sourcePath']).decode().strip()==r['sourceBlob']
 assert not r['wholeFileReviewComplete'] and not r['wholeRecordSemanticPassClaimed'] and not r['businessRuntimeExecutedByOntologyInstance']
 walk_receipts(r)
check('36-finite-semantic-source-record-and-nested-receipts',len(semantics)==36,{'records':len(semantics),'uniqueReceiptAssertions':len(receipt_cache)})
ontology=doc(head,batch+'/evidence/ontology/edhr-w3-tenant-transfer-ontology-result.yaml')['ontologyResult']
check('ontology-result-shape-and-scope',ontology['result']=='updated' and len(ontology['knowledgeSync'])==49 and not ontology['questions'] and not ontology['conflicts'] and ontology['roadmapProgress']['status']=='in-progress' and all(v['outcome']=='passed' for v in ontology['validationEvidence']),{'sync':len(ontology['knowledgeSync']),'baselineBefore':ontology['baselineBefore'],'baselineAfter':ontology['baselineAfter']})
catalog=json.loads(raw(head,batch+'/source-catalog.json'));prior=json.loads(raw(base,'docs/development/branch-review-20261020-trace-freeze-chain/source-catalog.json'))
check('inherited-method-and-semantic-records-byte-equivalent',catalog['methods'][:216]==prior['methods'] and catalog['semanticSources'][:2]==prior['semanticSources'])
check('catalog-counts',len(catalog['methods'])==314 and len(catalog['findings'])==44 and catalog['baselineCommit']==fixed,{'methods':len(catalog['methods']),'findings':len(catalog['findings'])})
walk_receipts(catalog)
for m in catalog['methods']:
 b=raw(m['reviewedCommit'],m['path']);assert digest(b)==m['sourceSha256'];assert git('rev-parse',m['reviewedCommit']+':'+m['path']).decode().strip()==m['sourceBlob'];assert m['wholeFileReviewComplete'] is False
byid={f['id']:f for f in catalog['findings']}
fixids=['AUD-H009','AUD-H010','AUD-H012','W3-TRANSFER-LOCK-001']
check('four-current-fixes-await-independent-acceptance',all(byid[i]['disposition']=='fixed-awaiting-independent-acceptance' for i in fixids),{i:byid[i]['disposition'] for i in fixids})
check('W5-preexisting-medium-open',byid['W5-AUDIT-HASH-001']['disposition']=='preexisting-medium-open' and byid['W5-AUDIT-HASH-001']['severity']=='medium')
unchanged=set(f['id'] for f in prior['findings'])-{'AUD-H009','AUD-H010','AUD-H012','W2-TRACE-REGION-001','W2-TRACE-REGION-002'}
check('unrelated-prior-finding-records-retained',all(byid[f['id']]==f for f in prior['findings'] if f['id'] in unchanged),{'unrelatedRecords':len(unchanged)})
for id in ['W2-TRACE-REGION-001','W2-TRACE-REGION-002']:
 check(id+'-scoped-prior-independent-acceptance',byid[id]['disposition']=='fixed-and-independently-accepted',byid[id]['resolution'])
check('old-review-documents-not-overwritten',not git('diff','--name-only',base,head,'--','docs/development/branch-review-20261020-trace-freeze-chain').strip())
summary=json.loads(raw(head,batch+'/ledger/summary.json'))
check('fixed-path-count',len(paths(fixed))==2524==summary['inventory']['trackedPaths'])
check('ledger-delta-states-not-upgraded',summary['sourceReview']['carryStates']['needs-delta-review']==93 and summary['knowledgeReview']['evidenceStates']['needs-delta-review']==26 and summary['knowledgeReview']['historicalConclusions']['evidence-gap']==4 and summary['sourceReview']['wholeFilesCompleted']==0)
check('ledger-no-whole-audit-or-runtime-claim',summary['overallAuditComplete'] is False and summary['overallPercent'] is None and summary['knowledgeReview']['newSemanticReviews']==0 and summary['runtime']['businessChecksExecutedInThisBatch']==[])
archived=[]
for p in paths(head):
 if p.startswith(batch+'/evidence/') and p.endswith('.json'):
  d=json.loads(raw(head,p))
  # Explicit copy receipts and two ontology/source manifest record lists.
  for key in ('files','originals'):
   for x in d.get(key,[]) if isinstance(d,dict) else []:
    if not isinstance(x,dict) or not {'path','sha256'}<=x.keys():continue
    path=x['path']
    if path.startswith('/tmp/'):
     candidates=[q for q in paths(head) if q.startswith(batch+'/evidence/') and Path(q).name==Path(path).name]
     if not candidates:continue
     q=candidates[0]
    elif path.startswith(batch+'/'):q=path
    else:continue
    b=raw(head,q);assert digest(b)==x['sha256'],('archive receipt SHA',p,q)
    if 'bytes' in x:assert len(b)==x['bytes'],('archive receipt bytes',p,q)
    assert (repo/q).read_bytes()==b
    archived.append({'manifest':p,'path':q,'sha256':digest(b),'bytes':len(b)})
  if isinstance(d,dict) and d.get('members'):
   zipname='original-reports.zip' if '/helpers/' in p else 'failed-probe-fixtures.zip'
   zp=str(Path(p).parent/zipname)
   with zipfile.ZipFile(repo/zp) as z:
    for x in d['members']:
     b=z.read(x['member']);assert digest(b)==x['sha256'] and len(b)==x['bytes'];archived.append({'zip':zp,'member':x['member'],'sha256':digest(b),'bytes':len(b)})
check('archive-manifests-exact-git-local-bytes-and-zip-members',True,{'archiveAssertions':len(archived),'gitEvidenceAssertions':len(receipt_cache)})
check('working-tree-remains-clean',not git('status','--porcelain').strip())
out={'schema':'edhr-independent-ledger-knowledge-verification/v1','role':'fresh independent QA readonly support','baseCommit':base,'headCommit':head,'contractReadCommit':head,'knowledgeModelVersion':'0.3.25','schemaVersion':'1.2.0','checks':checks,'errors':errors,'knowledgeRecordTransition':{'added':added,'removed':removed,'maturityVisibilityChanges':maturity,'discrepancyLifecycleChanges':discrepancy_lifecycle},'initialProbeQualification':'Initial generic status check over-counted open-to-resolved implementationDiscrepancy lifecycle as asset maturity; initial result retained. Corrected classification preserves all three lifecycle transitions and still forbids any existing asset maturity/visibility change. No repository/test product modification.','gitEvidenceReceipts':[{'commit':k[0],'path':k[1],'sha256':k[2],'bytes':v} for k,v in sorted(receipt_cache.items())],'archiveAssertions':archived,'limits':['Finite implementation and source-receipt scope, not full knowledge semantic audit','No Maven/database/browser executed by this sub-instance','No business/test/knowledge/repository writes','Formal qualityResult is owned by parent independent QA']}
p=Path('/tmp/edhr-w3-independent-ledger-check-result.json');p.write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n');print(json.dumps({'checks':len(checks),'errors':errors,'gitEvidenceReceipts':len(receipt_cache),'archiveAssertions':len(archived),'result':str(p)}))
raise SystemExit(bool(errors))
