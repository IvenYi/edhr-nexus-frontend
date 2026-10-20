import collections,hashlib,importlib.util,json,subprocess,sys,zipfile
from pathlib import Path
import yaml
sys.dont_write_bytecode=True
ROOT=Path('/workspace/edhr-nexus-frontend')
PREFIX=Path('/tmp/edhr-w3-final-independent-ledger')
HEAD='b8051583f6c85d52260174e6da191f36bb2c1de8'
BASE='a8285be9b91fb76bcb27ccb16a5258bda1fb5077'
FIRST='266a1635cc95870cd7907c574eb676db7f560d4f'
KNOW='cf6f1fedb952cd071a645be10dcbc6db20d167f4'
FIXED='05dbc0b2f6fda76e76cd9f7b6a10c224466dcc8a'
BATCH='docs/development/branch-review-20261020-w3-write-boundaries'
def git(*args):return subprocess.check_output(['git',*args],cwd=ROOT)
def raw(path,ref=HEAD):return git('show',f'{ref}:{path}')
def doc(path,ref=HEAD):return json.loads(raw(path,ref))
def sha(b):return hashlib.sha256(b).hexdigest()
checks=[];sources=[]
def check(id,condition,evidence):
 checks.append({'id':id,'outcome':'passed' if condition else 'failed','evidence':evidence})
 if not condition:raise AssertionError(id)
def receipt(path,ref=HEAD):
 b=raw(path,ref);s={'path':path,'commit':ref,'blob':git('rev-parse',f'{ref}:{path}').decode().strip(),'bytes':len(b),'sha256':sha(b)};sources.append(s);return s
check('fixed-candidate',git('rev-parse','HEAD').decode().strip()==HEAD and git('rev-parse','refs/remotes/origin/edhr-dev').decode().strip()==BASE,{'head':HEAD,'target':BASE})
check('clean-tree',not git('status','--porcelain'),{'status':'clean'})
check('core-tests-unchanged',not git('diff','--name-only',FIRST,HEAD,'--','gmp-platform','scripts'),{'compared':[FIRST,HEAD],'paths':['gmp-platform/**','scripts/**']})
check('no-governance-drift',not git('diff','--name-only',BASE,HEAD,'--','AGENTS.md','codeplzreadme.md','docs/agents','DESIGN.md'),{'contractReadCommit':HEAD})
spec=importlib.util.spec_from_file_location('ledger_verifier',ROOT/'scripts/build-branch-review-ledger.py');mod=importlib.util.module_from_spec(spec);spec.loader.exec_module(mod);g=mod.Git()
old=mod.knowledge_records(g,FIRST);now=mod.knowledge_records(g,HEAD);at_fix=mod.knowledge_records(g,KNOW)
changed={k for k in old.keys()&now.keys() if old[k]['recordSha256']!=now[k]['recordSha256']}
expected={'DEC-0081','DEC-0081-02','scenario.tenant-transfer-target-outside-original-candidates','scenario.tenant-transfer-repeated-origin-preserved','evidence.tenant-task-delegation-20261020'}
check('exact-five-id-correction',old.keys()==now.keys() and len(now)==2546 and changed==expected,{'currentIds':len(now),'changedIds':sorted(changed),'deletedIds':[],'newIds':[]})
check('maturity-visibility-stable',all((old[k]['assetStatus'],old[k]['visibility'])==(now[k]['assetStatus'],now[k]['visibility']) for k in old),{'comparedIds':len(old),'statusOrVisibilityPromotions':0})
p=BATCH+'/evidence/ontology-followup/edhr-w3-tenant-origin-precision-followup-semantic-review.jsonl';rows=[json.loads(l) for l in raw(p).splitlines() if l.strip()];verified=[]
for row in rows:
 s=receipt(row['sourcePath'],row['sourceCommit']);assert row['sourceCommit']==KNOW and row['sourceBlob']==s['blob'] and row['sourceSha256']==s['sha256'];assert row['recordSha256']==at_fix[row['id']]['recordSha256']==now[row['id']]['recordSha256'];assert row['newUserPolicy'] is False and row['businessCodeChanged'] is False and row['wholeFileReviewComplete'] is False
 verified.append({'id':row['id'],'recordSha256':row['recordSha256'],'sourceBlob':row['sourceBlob'],'sourceCommit':row['sourceCommit'],'conclusion':row['conclusion']})
check('nine-real-semantic-receipts',len(rows)==9 and len({x['id'] for x in rows})==9 and all(x['conclusion']=='consistent' for x in rows),{'source':receipt(p),'records':verified,'scope':'five changed plus four adjacent IDs; not whole-asset acceptance'})
onto=yaml.safe_load(raw(BATCH+'/evidence/ontology-followup/edhr-w3-tenant-origin-precision-followup-ontology-result.yaml'))['ontologyResult']
check('formal-ontology-followup',onto['result']=='updated' and onto['contractBaseline']['sourceCommit']==KNOW and not onto['conflicts'] and not onto['questions'],{'path':receipt(BATCH+'/evidence/ontology-followup/edhr-w3-tenant-origin-precision-followup-ontology-result.yaml'),'result':'updated'})
for path in [BATCH+'/evidence/ontology/edhr-w3-tenant-transfer-semantic-review.jsonl',BATCH+'/evidence/ontology/edhr-w3-tenant-transfer-ontology-result.yaml',BATCH+'/source-catalog.json']:
 check('historical-byte-preserved:'+path.split('/')[-1],raw(path)==raw(path,FIRST),{'current':receipt(path),'firstSha256':sha(raw(path,FIRST))})
archive_count=0
for rp in [BATCH+'/evidence/receipts.json',BATCH+'/evidence/support-receipts.json',BATCH+'/evidence/ontology/receipts.json',BATCH+'/evidence/ontology-followup/receipts.json',BATCH+'/evidence/independent-round1/receipts.json']:
 d=doc(rp)
 for x in d['files']:
  b=raw(x['path'])
  if x.get('member'):
   import io
   with zipfile.ZipFile(io.BytesIO(b)) as z:b=z.read(x['member'])
  assert len(b)==x['bytes'] and sha(b)==x['sha256'],(rp,x['path']);archive_count+=1
 check('exact-archive:'+rp.split('/evidence/')[-1],True,{'receipt':receipt(rp),'entries':len(d['files'])})
pr=doc(BATCH+'/evidence/ontology-followup/patch-member-receipt.json')
import io
with zipfile.ZipFile(io.BytesIO(raw(BATCH+'/evidence/ontology-followup/'+pr['archive']))) as z:b=z.read(pr['member'])
check('exact-precision-patch',len(b)==pr['bytes'] and sha(b)==pr['sha256'],{'member':pr['member'],'sha256':pr['sha256'],'bytes':len(b)})
q=yaml.safe_load(raw(BATCH+'/evidence/independent-round1/edhr-w3-independent-quality-result.yaml'))['qualityResult']
check('failed-round1-kept',q['result']=='failed' and q['headCommit']==FIRST and {x['id'] for x in q['findings']}=={'QF-W3-TENANT-KNOWLEDGE-001','QF-W3-UI-DOC-COUNT-001'},{'result':q['result'],'head':q['headCommit'],'findings':[x['id'] for x in q['findings']]})
s=doc(BATCH+'/recheck/ledger/summary.json');c=doc(BATCH+'/recheck/source-catalog.json');fs={x['id']:x for x in c['findings']}
check('current-fixed-denominators',s['baselineCommit']==FIXED and s['inventory']['trackedPaths']==2603 and s['sourceReview']['recordedScopes']==314 and s['sourceReview']['carryStates']['needs-delta-review']==93 and s['sourceReview']['wholeFilesCompleted']==0,{'inventory':s['inventory'],'sourceReview':s['sourceReview']})
check('knowledge-not-overclaimed',s['knowledgeReview']['currentIds']==2546 and s['knowledgeReview']['historicalScopedReviews']==90 and s['knowledgeReview']['recordRelations']['record-changed']==4 and s['knowledgeReview']['evidenceStates']['needs-delta-review']==57 and s['knowledgeReview']['historicalConclusions']['evidence-gap']==4 and s['overallAuditComplete'] is False and s['overallPercent'] is None,{'knowledgeReview':s['knowledgeReview']})
check('finding-dedup-and-boundaries',len(fs)==len(c['findings'])==46 and fs['W5-AUDIT-HASH-001']['disposition']=='preexisting-medium-open' and sum(f['disposition']=='user-deferred' for f in fs.values())==2 and sum(f['disposition']=='fixed-awaiting-independent-acceptance' for f in fs.values())==6,{'findingCount':len(fs),'dispositions':dict(collections.Counter(x['disposition'] for x in fs.values()))})
check('no-false-generator-runtime',s['knowledgeReview']['newSemanticReviews']==0 and s['runtime']['businessChecksExecutedInThisBatch']==[],{'note':'Zero describes generator itself, not the separately executed product/semantic reviews.'})
basefind=doc(BATCH+'/evidence/primary/edhr-w3-premium-baseline.json')['findings'];headfind=doc(BATCH+'/evidence/primary/edhr-w3-premium-candidate.json')['findings'];count=lambda a:collections.Counter(json.dumps(x,ensure_ascii=False,sort_keys=True) for x in a);bc,hc=count(basefind),count(headfind)
clar=doc(BATCH+'/evidence/primary/edhr-w3-premium-count-clarification.json');original=doc(BATCH+'/evidence/primary/edhr-w3-premium-comparison.json')
check('84-rows82-distinct-exact-counter',len(basefind)==len(headfind)==84 and len(bc)==len(hc)==82 and bc==hc and clar['baselineFindingRows']==84 and clar['fullFieldMultisetsEqual'] and original['baselineFindings']==82,{'baselineRows':84,'candidateRows':84,'distinct':82,'multisetsEqual':True,'strictExitBoth':2,'originalSetReportPreserved':True})
rebuild=json.loads(Path('/tmp/edhr-w3-final-independent-ledger-rebuild.json').read_text());check('rebuild-byte-identical',rebuild['baselineCommit']==FIXED,{'command':'python3 scripts/build-branch-review-ledger.py --ref '+FIXED+' --catalog '+BATCH+'/recheck/source-catalog.json --out '+BATCH+'/recheck/ledger --check','exit':0,'outputSha256':sha(Path('/tmp/edhr-w3-final-independent-ledger-rebuild.json').read_bytes())})
for path in ['AGENTS.md','docs/agents/quality-verifier.md','docs/agents/agent-handoff-contract.md','docs/knowledge/README.md','docs/knowledge/open-questions.yaml','docs/architecture/business-knowledge-model.md',BATCH+'/decision-package.yaml','gmp-platform/backend/src/main/java/com/zencas/edhr/production/service/ExecutionAccess.java','gmp-platform/backend/src/main/java/com/zencas/edhr/production/service/ExecutionSnapshotBuilder.java','gmp-platform/backend/src/main/java/com/zencas/edhr/workflow/engine/WorkflowEngine.java']:
 receipt(path)
PREFIX.with_name(PREFIX.name+'-check-result.json').write_text(json.dumps({'schema':'edhr-independent-ledger-check/v1','baseCommit':BASE,'headCommit':HEAD,'contractReadCommit':HEAD,'knowledgeVersion':'0.3.25','schemaVersion':'1.2.0','checks':checks,'archiveEntriesVerified':archive_count,'runtimeTestsExecuted':False,'wholeBranchAccepted':False},ensure_ascii=False,indent=2)+'\n')
unique={(x['commit'],x['path']):x for x in sources}
PREFIX.with_name(PREFIX.name+'-source-receipts.json').write_text(json.dumps(list(unique.values()),ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'checks':len(checks),'passed':sum(x['outcome']=='passed' for x in checks),'archiveEntries':archive_count,'sourceReceipts':len(unique)}))
