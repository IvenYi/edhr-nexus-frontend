from pathlib import Path
import hashlib,json,subprocess,yaml

repo=Path('/workspace/edhr-nexus-frontend')
batch=Path('docs/development/branch-review-20261021-signature-payload')
base='c3343f45bb79f72368937f0d197ae01f989f0390'
fixed='aaef52a782327e68da736faf83a249a3217b7228'
frozen='c062c2f99e143e7fd06b410c7ffdf4d47cf8bd49'
def git(*args): return subprocess.check_output(['git',*args],cwd=repo)
def sha(value): return hashlib.sha256(value).hexdigest()
def load(path): return json.loads((repo/path).read_text())
def raw(commit,path): return git('show',commit+':'+str(path))
assert git('rev-parse','HEAD').decode().strip()==fixed
assert not git('status','--porcelain')
assert git('rev-parse','origin/edhr-dev').decode().strip()==base
assert not git('diff','--name-only',frozen,fixed,'--','gmp-platform','scripts','docs/knowledge','AGENTS.md','codeplzreadme.md','docs/agents','docs/architecture')

archive=load(batch/'evidence/archive-receipts.json'); receipts=[]
for item in archive['files']:
    content=raw(frozen,batch/item['path'])
    assert sha(content)==item['sha256'] and len(content)==item['bytes']
    assert content==(repo/batch/item['path']).read_bytes()
    receipts.append({'path':str(batch/item['path']),'commit':frozen,'sha256':sha(content)})
assert len(receipts)==37

catalog=load(batch/'source-catalog.json')
prior=load(batch/'evidence/helpers/edhr-sig-baseline-draft-catalog.json')
old=json.loads(raw(base,'docs/development/branch-review-20261020-w3-task-commands/source-catalog.json'))
assert len(catalog['methods'])==485 and len(catalog['findings'])==48 and len(catalog['semanticSources'])==6
assert catalog['methods'][:392]==prior['methods']==old['methods']
assert catalog['semanticSources'][:5]==prior['semanticSources']==old['semanticSources']
assert catalog['findings'][:47]==prior['findings']
changed_prior=[a['id'] for a,b in zip(prior['findings'],old['findings']) if a!=b]
assert changed_prior==['W3C-INSTANCE-WRITE-AUTH-001']
excluded='w3d-signature-source:028'
assert excluded not in [m['id'] for m in catalog['methods']]
assert excluded in json.dumps(catalog['importNotes'])

scope_receipts=[]
for row in catalog['methods'][392:]:
    source=raw(row['reviewedCommit'],row['path'])
    assert row['sourceBlob']==git('rev-parse',row['reviewedCommit']+':'+row['path']).decode().strip()
    assert row['sourceSha256']==sha(source)
    start,end=row['pathScope']
    assert 1<=start<=end<=len(source.splitlines())
    assert row['wholeFileReviewComplete'] is False
    evidence=row['evidence']
    assert sha(raw(evidence['commit'],evidence['path']))==evidence['sha256']
    scope_receipts.append({'id':row['id'],'reviewedCommit':row['reviewedCommit'],'path':row['path'],'range':[start,end]})
assert len(scope_receipts)==93

formal_rows=[json.loads(line) for line in (repo/batch/'evidence/ontology/edhr-sig-ontology-semantic-review.jsonl').read_text().splitlines()]
assert len(formal_rows)==12
semantic_receipts=[]
for row in formal_rows:
    source=raw(row['sourceCommit'],row['sourcePath'])
    assert sha(source)==row['sourceSha256']
    assert git('rev-parse',row['sourceCommit']+':'+row['sourcePath']).decode().strip()==row['sourceBlob']
    record=yaml.safe_load(source)
    for key in row['sourceLocator'].strip('/').split('/'):
        record=record[int(key)] if isinstance(record,list) else record[key]
    assert record['id']==row['id']
    assert sha(json.dumps(record,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode())==row['recordSha256']
    assert row['reviewStatus']=='reviewed' and row['conclusion']=='consistent'
    assert row['wholeFileReviewComplete'] is row['wholeRecordSemanticPassClaimed'] is row['newUserPolicy'] is False
    semantic_receipts.append({key:row[key] for key in ['id','sourceCommit','sourceLocator','recordSha256','reviewedScope']})

primary=load(batch/'evidence/primary/validation-summary.json')
focused=load(batch/'evidence/primary/edhr-sig-focused-final-summary.json')
auth=load(batch/'evidence/primary/edhr-sig-font-identity-final-summary.json')
assert sum(s['tests'] for s in focused['suites'])==104
assert sum(s['failures'] for s in focused['suites'])==1
assert sum(s['errors'] for s in focused['suites'])==0
selected=[s for s in focused['suites'] if not s['name'].endswith('.AuthControllerTest')]+auth['suites']
assert len({s['name'] for s in selected})==8
assert sum(s['tests'] for s in selected)==104
assert all(s['failures']==s['errors']==s['skipped']==0 for s in selected)
assert {s['name']:s['xmlSha256'] for s in selected}=={s['name']:s['xmlSha256'] for s in primary['selectedSuites']}
for item in primary['fixedSourceReceipts']:
    assert sha(raw(item['commit'],item['path']))==item['sha256']
    assert raw(item['commit'],item['path'])==raw(fixed,item['path'])

summary=load(batch/'ledger/summary.json'); progress=load(batch/'progress.json')
assert summary['baselineCommit']==frozen
assert summary['inventory']['trackedPaths']==progress['inventory']['trackedPaths']==len(git('ls-tree','-r','--name-only',frozen).splitlines())==2801
assert summary['knowledgeReview']['currentIds']==2552
assert summary['sourceReview']['recordedScopes']==485
assert summary['sourceReview']['carryStates']['needs-delta-review']==101
assert summary['knowledgeReview']['historicalScopedReviews']==108
assert summary['knowledgeReview']['evidenceStates']['needs-delta-review']==57
assert summary['knowledgeReview']['historicalConclusions']['evidence-gap']==4
assert summary['remediation']['findingRecords']==48
assert summary['overallAuditComplete'] is progress['overallAuditComplete'] is False
assert summary['overallPercent'] is progress['overallPercent'] is None
assert catalog['findings'][-1]['id']=='W3-SIGNATURE-PAYLOAD-001'
assert catalog['findings'][-1]['disposition']=='fixed-awaiting-independent-acceptance'
assert progress['runtime']['independentQuality']=='pending'

contract_paths=['AGENTS.md','codeplzreadme.md','docs/agents/agent-handoff-contract.md','docs/agents/quality-verifier.md']
contract_receipts=[]
for path in contract_paths:
    content=raw(frozen,path)
    assert content==raw(base,path)==raw(fixed,path)
    contract_receipts.append({'path':path,'contractReadCommit':frozen,'sha256':sha(content),'unchangedAcrossTargetAndCandidate':True})
source_review=Path('/tmp/edhr-sig-qa-source-review.json')
assert sha(source_review.read_bytes())=='1d46982a727e551871d4c033b0c52d84d84ea2e2c9f84fe03417529912b6c40e'
result={'author':'/root/signature_payload_independent','baseCommit':base,'headCommit':fixed,'catalogBaseline':frozen,'originalArchiveFilesChecked':receipts,'inheritedScopeRowsPreserved':392,'newFiniteBoundedScopeReceipts':scope_receipts,'excludedOriginalScopeRetainedUnchanged':excluded,'inheritedFindingsPreserved':47,'priorAcceptanceCarryAdvancedOnly':changed_prior,'newFormalFiniteRowsValidated':semantic_receipts,'primaryUnique104SelectionReconciled':True,'primary104SingleRunAllPassClaimed':False,'frozenInventory':{'trackedPaths':2801,'knowledgeIds':2552,'sourceScopeRows':485,'semanticRows':108,'findingRecords':48,'sourceNeedsDelta':101,'semanticNeedsDelta':57,'historicalEvidenceGaps':4},'wholeBranchAccepted':False,'contractReceipts':contract_receipts,'sourceHelper':{'path':str(source_review),'sha256':sha(source_review.read_bytes()),'status':'FINAL','children':[]},'repositoryMutations':False}
out=Path('/tmp/edhr-sig-qa-evidence-inspection.json'); out.write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'output':str(out),'sha256':sha(out.read_bytes()),'originalArchiveFiles':len(receipts),'newBoundedScopes':len(scope_receipts),'formalFiniteRows':len(semantic_receipts),'countsMatch':True,'repositoryMutations':False}))
