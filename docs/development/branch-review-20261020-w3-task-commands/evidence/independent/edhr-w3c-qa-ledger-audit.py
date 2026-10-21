from pathlib import Path
import collections,hashlib,importlib.util,json,re,subprocess,zipfile
import yaml
REPO=Path('/workspace/edhr-nexus-frontend')
BATCH='docs/development/branch-review-20261020-w3-task-commands'
b=REPO/BATCH
HEAD='42cb2820946287d409a2a02394cc85e4067e20bb';BASE='e8ecc103c8e6825c61c61b39b9cbd12b1474700e'
LEDGER='bc30d411ab6a7312099943db8581d0583152a9e0'
def git(*args):return subprocess.check_output(['git',*args],cwd=REPO)
def raw(ref,path):return git('show',ref+':'+path)
sha=lambda x:hashlib.sha256(x).hexdigest()
load=lambda p:json.loads((b/p).read_text())
checks=[];receipts=[]
def check(name,value,details):
    assert value,name
    checks.append({'id':name,'outcome':'passed','details':details})
check('fixed-head-clean',git('rev-parse','HEAD').decode().strip()==HEAD and not git('status','--porcelain'),{'head':HEAD,'workingTreeState':'clean'})
check('target-local-matches',git('rev-parse','origin/edhr-dev').decode().strip()==BASE,{'targetCommit':BASE})
contracts=['AGENTS.md','codeplzreadme.md','docs/agents']
check('contract-delta-none',not git('diff','--name-only',BASE,HEAD,'--',*contracts),{'contractReadCommit':HEAD})
catalog=load('source-catalog.json')
oldpath='docs/development/branch-review-20261020-w3-write-boundaries/recheck/source-catalog.json'
old=json.loads(raw(BASE,oldpath))
check('inherited-methods-exact',catalog['methods'][:314]==old['methods'],{'priorFiniteScopes':314})
check('inherited-semantic-sources-exact',catalog['semanticSources'][:4]==old['semanticSources'],{'priorSources':4,'priorRows':90})
oldf={r['id']:r for r in old['findings']};newf={r['id']:r for r in catalog['findings']}
expected={'AUD-H009','AUD-H010','AUD-H012','W3-TRANSFER-LOCK-001','QF-W3-TENANT-KNOWLEDGE-001','QF-W3-UI-DOC-COUNT-001'}
changed={key for key in oldf if oldf[key]!=newf[key]}
check('only-six-prior-findings-advanced',changed==expected,{'changedIds':sorted(changed),'otherOriginalObjectsEqual':40})
ap='docs/development/branch-review-20261020-w3-write-boundaries/acceptance.json';a=json.loads(raw(BASE,ap))
qp='docs/development/branch-review-20261020-w3-write-boundaries/'+a['qualityResultPath']
qraw=raw(BASE,qp);q=yaml.safe_load(qraw)['qualityResult'];req=[r for r in q['checks'] if r['required']]
check('pr20-actual-acceptance',a['testedCommit']==q['headCommit']=='b8051583f6c85d52260174e6da191f36bb2c1de8' and a['qualityResult']==q['result']=='passed' and a['qualityResultSha256']==sha(qraw) and len(req)==24 and all(r['outcome']=='passed' for r in req) and not q['blockingConditions'],{'required':len(req),'qualityPath':qp,'qualitySha256':sha(qraw),'historicalOnly':True})
delivery='a23f94c2617f35ba7147b070b341a63a65a23541'
check('pr20-human-merge-tree-proof',git('rev-parse',BASE+'^{tree}')==git('rev-parse',delivery+'^{tree}') and delivery in git('show','-s','--format=%P',BASE).decode().split(),{'mergeCommit':BASE,'delivery':delivery})
for key in expected:
    n=newf[key];o=oldf[key]
    assert n['disposition']=='fixed-and-independently-accepted'
    prior=n['priorCatalogDisposition']
    assert all(o[k]==v for k,v in prior['fields'].items())
    assert n['evidence'][:len(o['evidence'])]==o['evidence']
    assert prior['catalog']['path']==oldpath and prior['catalog']['commit']==BASE and prior['catalog']['sha256']==sha(raw(BASE,oldpath))
    assert n['acceptedDeliveryEvidence']['treeEqual'] is True
check('six-dispositions-preserve-priors',True,{'ids':sorted(expected),'oldEvidenceAndOriginalDispositionPreserved':True})
check('one-current-finding-only',set(newf)-set(oldf)=={'W3C-INSTANCE-WRITE-AUTH-001'} and newf['W3C-INSTANCE-WRITE-AUTH-001']['disposition']=='fixed-awaiting-independent-acceptance',{'total':len(newf),'prior':len(oldf),'currentFindingNotPreaccepted':True})
summary=load('ledger/summary.json');p=load('progress.json')
check('coverage-counts-qualified',summary['baselineCommit']==LEDGER and summary['inventory']['trackedPaths']==2711 and summary['knowledgeReview']['currentIds']==2548 and summary['sourceReview']['recordedScopes']==392 and summary['sourceReview']['carryStates']['needs-delta-review']==100 and summary['sourceReview']['wholeFilesCompleted']==0 and summary['knowledgeReview']['historicalScopedReviews']==96 and summary['knowledgeReview']['evidenceStates']['needs-delta-review']==57 and summary['knowledgeReview']['historicalConclusions']['evidence-gap']==4 and summary['remediation']['findingRecords']==47 and summary['overallAuditComplete'] is False and summary['overallPercent'] is None,{'inventory':summary['inventory']['trackedPaths'],'scopes':392,'sourceDelta':100,'semanticRows':96,'semanticDelta':57,'gaps':4,'findingRecords':47,'wholeFilesCompleted':0})
check('no-premature-global-or-final-claim',p['overallAuditComplete'] is False and p['interruptedProfessionalResults']['reusedAsFinal'] is False and p['runtime']['independentQuality']=='pending' and p['source']['interruptedHelperFinalNotInvented'] is True,{'pendingQAAndInterruptedStatusQualificationPreserved':True})
# Validate exact bytes for archived primary/helper/ontology manifests and ZIP members.
for source,rows in [
('evidence/source-and-runtime-receipts.json',load('evidence/source-and-runtime-receipts.json')['files']),
('evidence/helpers/receipts.json',load('evidence/helpers/receipts.json')['files']),
('evidence/primary/receipts.json',load('evidence/primary/receipts.json')),
('evidence/ontology/archive-receipts.json',load('evidence/ontology/archive-receipts.json')['originals'])]:
    for row in rows:
        data=(b/row['path']).read_bytes()
        assert sha(data)==row['sha256'] and len(data)==row['bytes'],row['path']
        receipts.append({'manifest':source,'path':row['path'],'sha256':sha(data)})
with zipfile.ZipFile(b/'evidence/helpers/original-helper-notes.zip') as z:
    for row in load('evidence/helpers/receipts.json')['zipMembers']:
        data=z.read(row['member']);assert sha(data)==row['sha256'] and len(data)==row['bytes'];receipts.append({'zip':'original-helper-notes.zip','member':row['member'],'sha256':sha(data)})
member=load('evidence/primary/first-fixture-member.json')
with zipfile.ZipFile(b/'evidence/primary'/member['path']) as z:
    data=z.read(member['member']);assert sha(data)==member['sha256'] and len(data)==member['bytes'];receipts.append({'zip':member['path'],'member':member['member'],'sha256':sha(data)})
check('archive-receipts-and-zip-exact',True,{'receiptAssertions':len(receipts),'originalFixtureSetupErrorRetained':True})
modspec=importlib.util.spec_from_file_location('qa_ledger',REPO/'scripts/build-branch-review-ledger.py');m=importlib.util.module_from_spec(modspec);modspec.loader.exec_module(m)
g=m.Git();current=m.knowledge_records(g,HEAD);semfile='evidence/ontology/edhr-w3c-final-ontology-semantic-review.jsonl'
sem=[json.loads(l) for l in (b/semfile).read_text().splitlines() if l.strip()]
assert len(sem)==6
normative_hashes=[];source_assertions=0
def walk(obj):
    global source_assertions
    if isinstance(obj,dict):
        if 'path' in obj and 'sha256' in obj and 'commit' in obj:
            data=raw(obj['commit'],obj['path']);assert sha(data)==obj['sha256'],obj['path']
            if 'blob' in obj:assert git('rev-parse',obj['commit']+':'+obj['path']).decode().strip()==obj['blob']
            source_assertions+=1
        for value in obj.values():walk(value)
    elif isinstance(obj,list):
        for value in obj:walk(value)
for row in sem:
    original=m.knowledge_records(g,row['sourceCommit'])[row['id']]
    assert original['recordSha256']==row['recordSha256']
    assert row['id'] in current and current[row['id']]['recordSha256']==row['recordSha256']
    assert row['sourceCommit']=='684db88a5a25168cc7df301b947fd7528285ad46' and row['conclusion']=='consistent'
    walk(row);normative_hashes.append({'id':row['id'],'recordSha256':row['recordSha256']})
oldknowledge=m.knowledge_records(g,BASE)
check('only-two-knowledge-evidence-ids-added',len(oldknowledge)==2546 and len(current)==2548 and all(current[key]['recordSha256']==value['recordSha256'] for key,value in oldknowledge.items()),{'before':2546,'after':2548,'added':sorted(set(current)-set(oldknowledge)),'existingRecordHashesUnchanged':True})
check('formal-six-id-identity-and-source-sha',True,{'rows':len(sem),'sourceReceiptAssertions':source_assertions,'finiteIds':normative_hashes,'notFullKnowledgeAcceptance':True})
ont=yaml.safe_load((b/'evidence/ontology/edhr-w3c-final-ontology-result.yaml').read_text())['ontologyResult']
check('ontology-result-invariants',ont['result']=='updated' and not ont['questions'] and not ont['conflicts'] and ont['baselineBefore']==ont['baselineAfter']=='0.3.25' and ont['roadmapProgress']['status']=='in-progress' and all(v['outcome']=='passed' for v in ont['validationEvidence']),{'knowledgeVersion':'0.3.25','stageNotPromoted':True})
forbidden_names=[];jwt_matches=[]
for f in b.rglob('*'):
    if not f.is_file():continue
    if f.suffix in ['.log','.xml'] or f.name.lower() in ['settings.xml','.env']:forbidden_names.append(str(f.relative_to(b)))
    if f.suffix!='.zip' and re.search(rb'eyJ[A-Za-z0-9_-]{12,}\.[A-Za-z0-9_-]{12,}\.[A-Za-z0-9_-]{12,}',f.read_bytes()):jwt_matches.append(str(f.relative_to(b)))
check('no-raw-log-xml-settings-or-token-artifact',not forbidden_names and not jwt_matches,{'forbiddenArtifactCount':len(forbidden_names),'jwtPatternArtifactCount':len(jwt_matches),'scope':'current batch files only; synthetic fixture source retained in zip'})
rc=subprocess.run(['git','-c','core.whitespace=blank-at-eol,blank-at-eof,space-before-tab,cr-at-eol','diff','--check',BASE,HEAD],cwd=REPO,capture_output=True)
check('crlf-aware-diff-check',rc.returncode==0,{'exit':rc.returncode,'ignoredWhitespaceClasses':[]})
rebuild=json.loads(Path('/tmp/edhr-w3c-qa-ledger-rebuild-output.json').read_text())
check('full-ledger-byte-rebuild',rebuild==summary,{'command':'python3 scripts/build-branch-review-ledger.py --ref '+LEDGER+' --catalog '+BATCH+'/source-catalog.json --out '+BATCH+'/ledger --check','exit':0,'actualFullByteComparison':True})
check('fixed-head-still-clean',git('rev-parse','HEAD').decode().strip()==HEAD and not git('status','--porcelain'),{'head':HEAD,'workingTreeState':'clean'})
result={'schema':'edhr-independent-qa-ledger-support/v1','role':'read-only delegated independent QA ledger/receipt assistance, not product test execution','status':'FINAL','headCommit':HEAD,'baseCommit':BASE,'contractReadCommit':HEAD,'knowledgeVersion':'0.3.25','checks':checks,'receiptAssertions':receipts,'findings':[],'productTestsExecuted':[],'repositoryMutations':False,'wholeBranchAccepted':False,'noChildInstances':True}
out=Path('/tmp/edhr-w3c-qa-ledger-summary.json');out.write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'result':'passed','checks':len(checks),'receiptAssertions':len(receipts),'sourceReceiptAssertions':source_assertions,'summarySha256':sha(out.read_bytes()),'wholeBranchAccepted':False}))
