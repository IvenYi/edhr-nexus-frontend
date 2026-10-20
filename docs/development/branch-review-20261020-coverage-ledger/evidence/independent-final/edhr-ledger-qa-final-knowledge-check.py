from pathlib import Path
import subprocess, json, hashlib, collections, yaml
BASE='1185e6daa3425bb1856df7a6db12b2e939b0afad'
P=Path('docs/development/branch-review-20261020-coverage-ledger')
def git(*args): return subprocess.check_output(['git',*args])
def raw(commit,path): return git('show',commit+':'+path)
def tree(commit):
 out={}
 for row in git('ls-tree','-rz',commit).split(b'\0'):
  if row:
   meta,name=row.split(b'\t',1);out[name.decode()]=meta.decode().split()[2]
 return out
schema=yaml.safe_load(raw(BASE,'docs/knowledge/schema.yaml'))
T=tree(BASE)
cache={}
def records(commit):
 if commit in cache:return cache[commit]
 result={}
 def add(record,kind,path,locator):
  assert record['id'] not in result,record['id']
  result[record['id']]={'record':record,'kind':kind,'path':path,'locator':locator,'hash':hashlib.sha256(json.dumps(record,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode()).hexdigest()}
  # The schema declares nested collections as children of record objects.
  for childkey,childkind in schema['nestedCollectionTypes'].items():
   for i,child in enumerate(record.get(childkey,[]) or []):add(child,childkind,path,locator+'/'+childkey+'/'+str(i))
 for path in tree(commit):
  if path.startswith('docs/knowledge/') and path.endswith(('.yaml','.yml')) and path!='docs/knowledge/schema.yaml':
   data=yaml.safe_load(raw(commit,path))
   if isinstance(data,dict):
    for key,kind in schema['collectionTypes'].items():
     for i,r in enumerate(data.get(key,[]) or []):add(r,kind,path,'/'+key+'/'+str(i))
 cache[commit]=result;return result
now=records(BASE)
output=[json.loads(x) for x in (P/'ledger/knowledge-records.jsonl').read_text().splitlines()]
assert len(now)==2534
assert set(now)=={r['id'] for r in output}
for r in output:
 n=now[r['id']];assert (n['hash'],n['kind'],n['path'],n['locator'])==(r['recordSha256'],r['recordType'],r['sourcePath'],r['sourceLocator'])
 assert not r['currentSemanticPassClaimed'] and not r['newSemanticReviewPerformed']
sem=[json.loads(x) for x in (P/'ledger/semantic-reviews.jsonl').read_text().splitlines()]
original=[json.loads(x) for x in raw(BASE,'docs/development/branch-review-20261015/ontology/semantic-review.jsonl').decode().splitlines()]
assert len(sem)==len(original)==33
origbyid={r['id']:r for r in original}
changed=0;unchanged=0;omissions=[]
for r in sem:
 old=origbyid[r['id']];assert r['historicalReview']==old
 oldrecords=records(old['sourceCommit']); n=oldrecords[old['id']]
 assert n['hash']==old['recordSha256']==now[old['id']]['hash']
 oldtree=tree(old['sourceCommit']);text=json.dumps({k:v for k,v in old.items() if k in ('decisionEvidence','entry','write','historicalRead','testAssertionsRead','implementationEvidence','evidence')},ensure_ascii=False)
 paths={p for p in set(oldtree)|set(T) if p in text}
 
 if paths!={d['path'] for d in r['dependencies']}: omissions.append({'id':r['id'],'missing':[{'path':p,'sourceBlob':oldtree.get(p),'currentBlob':T.get(p),'changed':oldtree.get(p)!=T.get(p)} for p in sorted(paths-{d['path'] for d in r['dependencies']})]})
 delta=False
 for d in r['dependencies']:
  p=d['path'];relation='unresolved' if p not in oldtree else 'removed' if p not in T else 'unchanged' if oldtree[p]==T[p] else 'file-changed'
  assert (d['sourceBlob'],d['currentBlob'],d['relation'])==(oldtree.get(p),T.get(p),relation)
  delta|=relation!='unchanged'
 expected='needs-delta-review' if delta or not paths else 'retained-scoped-evidence'
 assert r['carryStatus']==expected
 assert not r['newSemanticReviewPerformed'] and not r['currentRuntimeExecuted']
 changed+=expected=='needs-delta-review';unchanged+=expected=='retained-scoped-evidence'
assert (changed,unchanged)==(26,7)
conclusions=collections.Counter(r['historicalReview']['conclusion'] for r in sem)
assert dict(conclusions)=={'consistent':28,'superseded':1,'evidence-gap':4}
f=json.loads((P/'ledger/findings.json').read_text());helpers=json.loads((P/'evidence/source-preparation/edhr-ledger-findings-sources.json').read_text())
expected=helpers['records']+helpers['additionalRecords']+helpers['deferredRecords']
assert (len(helpers['records']),len(helpers['additionalRecords']),len(helpers['deferredRecords']))==(21,17,2)
assert len(f)==len({r['id'] for r in f})==40
assert {r['id'] for r in f}=={r['id'] for r in expected}
byid={r['id']:r for r in f}
for originalrow in expected:
 row=byid[originalrow['id']]
 assert row['disposition']==originalrow['currentDisposition']
 assert row.get('aliases',[])==originalrow.get('aliases',[])
 for e in row['evidence']:assert hashlib.sha256(raw(e['commit'],e['path'])).hexdigest()==e['sha256']
 assert not row['newlyAdjudicatedInThisBatch'] and not row['runtimeReverifiedInThisBatch']
for short in ['T001']:
 assert len([r for r in f if short in r['id']])>=2
for h,status in [('AUD-H009','confirmed-pending'),('AUD-H010','confirmed-pending'),('AUD-H012','pending-adjudication')]: assert byid[h]['disposition']==status
for h in ['AUD-H003','AUD-H004']: assert byid[h]['disposition']=='fixed-and-independently-accepted'
assert byid['AUD-H005']['disposition']=='known-fixed-before-audit'
assert len([r for r in f if r['disposition']=='user-deferred'])==2
notes=json.loads((P/'ledger/import-notes.json').read_text());assert len([r for r in notes if r['noteKind']=='historical-knowledge-gap'])==4
assert len([r for r in notes if r['noteKind']=='source-label-erratum'])==1
sync=json.loads((P/'ledger/knowledge-sync-index.json').read_text())
assert len(sync)==26 and all(not r['newlyExecutedInThisBatch'] for r in sync)
assert not omissions, omissions
assert git('rev-parse','HEAD').decode().strip()=='cbf83d0eef9df2c18f6296b8426383775e56b430'
summary={'candidate':'cbf83d0eef9df2c18f6296b8426383775e56b430','independentExtraction':'schema top-level plus typed nested collections, no production generator imported','currentKnowledgeIds':len(now),'canonicalHashesMatched':len(output),'historicalSemanticRows':len(sem),'conclusions':dict(conclusions),'changedDependencyRecords':changed,'unchangedDependencyRecords':unchanged,'findingRows':len(f),'masterAdditionalDeferred':[21,17,2],'preservedKnowledgeGaps':4,'knowledgeSyncProvenanceReports':len(sync),'claimsNewSemanticPass':False,'dependencyOmissions':omissions}
Path('/tmp/edhr-ledger-qa-final-knowledge-findings.json').write_text(json.dumps(summary,ensure_ascii=False,indent=2)+'\n')
print(json.dumps(summary,ensure_ascii=False))
