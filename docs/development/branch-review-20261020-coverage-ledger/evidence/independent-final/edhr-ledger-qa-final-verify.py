import collections,csv,hashlib,json,re,subprocess
from pathlib import Path
import yaml

BASE='1185e6daa3425bb1856df7a6db12b2e939b0afad'
HEAD='cbf83d0eef9df2c18f6296b8426383775e56b430'
P=Path('docs/development/branch-review-20261020-coverage-ledger')
L=P/'ledger'
def git(*a): return subprocess.check_output(['git',*a])
def sha(raw): return hashlib.sha256(raw).hexdigest()
cache={}
def blob(ref,path):
 k=(ref,path)
 if k not in cache: cache[k]=git('show',ref+':'+path)
 return cache[k]
def tree(ref):
 out={}
 for part in git('ls-tree','-rz',ref).split(b'\0'):
  if part:
   meta,path=part.split(b'\t',1); out[path.decode()]=meta.decode().split()[2]
 return out
t=tree(BASE); rows=list(csv.DictReader((L/'coverage.csv').open(newline='')))
assert len(rows)==len(t)==2293 and {r['path'] for r in rows}==set(t)
for row in rows:
 assert row['source_blob']==t[row['path']] and row['baseline_commit']==BASE
 assert row['domain'] and row['asset_type'] and row['work_package'] and row['in_scope']=='true'
 assert row['whole_file_review_complete']=='false' and row['review_status'] in ('pending','partial-reviewed')
 assert row['tested_commit']==''
entries=list(csv.DictReader((L/'entrypoints.csv').open(newline='')))
for r in entries:
 assert r['baseline_commit']==BASE and r['path'] in t
 assert blob(BASE,r['path']).decode().splitlines()[int(r['line'])-1].strip()==r['source']
 assert r['status']=='candidate-needs-call-chain-review'
assert collections.Counter(r['kind'] for r in entries)=={'http-annotation':437,'frontend-route-candidate':191,'state-definition-candidate':8,'background-candidate':1}
migrations=list(csv.DictReader((L/'migrations.csv').open(newline='')))
assert len(migrations)==126 and {r['path'] for r in migrations}=={p for p in t if '/db/changelog/' in p}
assert all(r['blob']==t[r['path']] and r['status']=='inventory-only' for r in migrations)

receipt_count=0
def receipt(r):
 global receipt_count
 assert sha(blob(r['commit'],r['path']))==r['sha256'] and r['locator']; receipt_count+=1
catalog=json.loads((P/'source-catalog.json').read_text())
methods=[json.loads(s) for s in (L/'method-reviews.jsonl').read_text().splitlines()]
assert len(methods)==162 and len({m['id'] for m in methods})==162
expected={m['id']:m for m in catalog['methods']}
scopes=collections.Counter(); paths=set(); delta=set(); oldtrees={}
for m in methods:
 source=expected[m['id']]
 for key,value in source.items(): assert m[key]==value,(m['id'],key)
 receipt(m['evidence'])
 for r in m.get('additionalEvidence',[]): receipt(r)
 ref=m['reviewedCommit']; path=m['path']
 if ref not in oldtrees: oldtrees[ref]=tree(ref)
 assert m['sourceBlob']==oldtrees[ref][path] and m['sourceSha256']==sha(blob(ref,path))
 assert m['currentBlob']==t.get(path) and m['currentRuntimeExecuted'] is False and m['wholeFileReviewComplete'] is False
 relation='removed' if path not in t else 'unchanged' if t[path]==oldtrees[ref][path] else 'file-changed'
 status='retained-scoped-evidence' if relation=='unchanged' else 'needs-delta-review'
 assert (m['sourceRelation'],m['carryStatus'])==(relation,status)
 scopes[status]+=1; paths.add(path)
 if status=='needs-delta-review': delta.add(path)
assert scopes=={'retained-scoped-evidence':125,'needs-delta-review':37} and len(paths)==66 and len(delta)==12
for row in rows:
 subset=[m for m in methods if m['path']==row['path']]
 for column,status in [('scoped_evidence_ids','retained-scoped-evidence'),('delta_scope_ids','needs-delta-review'),('evidence_gap_ids','evidence-gap')]:
  assert set(json.loads(row[column]))=={m['id'] for m in subset if m['carryStatus']==status}
 assert row['review_status']==('partial-reviewed' if json.loads(row['scoped_evidence_ids']) else 'pending')
assert sum(n.get('noteKind')=='source-map-qualification' for n in catalog['importNotes'])==18
for n in catalog['importNotes']:
 for r in n.get('evidence',[]): receipt(r)
for f in catalog['findings']:
 for r in f['evidence']: receipt(r)
for s in catalog['semanticSources']: receipt(s)

report_results=collections.Counter(); reports=json.loads((L/'quality-report-index.json').read_text())
for r in reports:
 for path in r['paths']:
  raw=blob(BASE,path); assert sha(raw)==r['sha256']; original=yaml.safe_load(raw)['qualityResult']
  assert r['sourceCommit']==BASE and r['newlyExecutedInThisBatch'] is False
  for key,value in r['reported'].items():
   if key in ('checks','findings'): continue
   assert original[key]==value
  assert r['reported']['checks']==[{k:c.get(k) for k in ('id','required','category','method','outcome')} for c in original.get('checks',[])]
  assert r['reported']['findings']==[{k:c.get(k) for k in ('id','severity','resolutionStatus')} for c in original.get('findings',[])]
  assert all('command' not in c and 'evidence' not in c for c in r['reported']['checks'])
 report_results[r['reported']['result']]+=1
assert len(reports)==68 and report_results=={'passed':48,'failed':19,'blocked':1}

allowed=[str(P)+'/', 'scripts/build-branch-review-ledger.py','scripts/test-branch-review-ledger.py','docs/development/branch-review-20261015/NEXT.md']
changed=git('diff','--name-only',BASE,HEAD).decode().splitlines()
assert all(any(p.startswith(a) if a.endswith('/') else p==a for a in allowed) for p in changed)
oldchanged=[p for p in changed if p in t]
assert oldchanged==['docs/development/branch-review-20261015/NEXT.md']
assert not git('diff',BASE,HEAD,'--','AGENTS.md','codeplzreadme.md','docs/agents','docs/architecture','docs/knowledge','gmp-platform','scripts/build-branch-review-inventory.py')
assert git('merge-base',BASE,HEAD).decode().strip()==BASE
for folder in [P/'evidence/source-preparation',P/'evidence/primary',L]:
 for r in json.loads((folder/'receipts.json').read_text()):
  raw=(folder/r['path']).read_bytes(); assert sha(raw)==r['sha256'] and len(raw)==r['bytes']

suspects=[]
patterns=[rb'-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----',rb'\bgh[pousr]_[A-Za-z0-9]{30,}\b',rb'\bsk-[A-Za-z0-9]{32,}\b']
for p in changed:
 if any(re.search(pattern,Path(p).read_bytes()) for pattern in patterns): suspects.append(p)
assert not suspects
summary={'baseline':BASE,'candidate':HEAD,'coveragePaths':len(rows),'entrypointCandidates':dict(collections.Counter(r['kind'] for r in entries)), 'migrations':len(migrations),'methodRecords':len(methods),'methodPaths':len(paths),'deltaPaths':len(delta),'carryStates':dict(scopes),'verifiedEvidenceAssertions':receipt_count,'historicalQualityArtifacts':len(reports),'historicalQualityResults':dict(report_results),'changedPaths':len(changed),'changedHistoricalPaths':oldchanged,'findingsReverifiedSeparately':['QF-LEDGER-001','QF-LEDGER-002','QF-LEDGER-003'],'businessTestsExecuted':[]}
Path('/tmp/edhr-ledger-qa-final-verification.json').write_text(json.dumps(summary,ensure_ascii=False,indent=2)+'\n')
print(json.dumps(summary,ensure_ascii=False))
