import hashlib,json,subprocess
from pathlib import Path
import yaml
repo=Path('/workspace/edhr-nexus-frontend')
batch='docs/development/branch-review-20261021-task-pagination'
prior='docs/development/branch-review-20261021-signature-payload'
target='13def47d4def51237d1393eaa7bf2651e98a0cbd'
head='9d8269114d8d4645be34b48bf0d0d88b5d245ba1'
evidence='080ce5075a902979928d4bc65b133d9a8097c231'
core='25e974e03813f6403618ce8a9efc735cafd429a2'
sha=lambda raw:hashlib.sha256(raw).hexdigest()
def git(*args):return subprocess.check_output(['git',*args],cwd=repo)
def raw(commit,path):return git('show',commit+':'+path)
def doc(commit,path):return json.loads(raw(commit,path))
assert git('rev-parse','HEAD').decode().strip()==head
assert git('status','--porcelain')==b''
assert git('rev-parse','origin/edhr-dev').decode().strip()==target
assert subprocess.run(['git','merge-base','--is-ancestor',target,head],cwd=repo).returncode==0
contracts=['AGENTS.md','codeplzreadme.md','docs/agents/agent-handoff-contract.md','docs/agents/quality-verifier.md']
contract_receipts=[]
for path in contracts:
    assert raw(target,path)==raw(evidence,path)==raw(head,path)
    contract_receipts.append({'path':path,'readCommit':evidence,'sha256':sha(raw(evidence,path)),'targetAndFinalIdentical':True})
product_changes=git('diff','--name-only',target,head,'--','gmp-platform','scripts','docs/knowledge','docs/architecture','docs/agents','AGENTS.md','codeplzreadme.md','DESIGN.md').decode().splitlines()
expected=['gmp-platform/backend/src/main/java/com/zencas/edhr/workflow/controller/WorkflowTaskController.java','gmp-platform/backend/src/test/java/com/zencas/edhr/workflow/controller/WorkflowTaskPaginationPostgresTest.java']
assert product_changes==expected
assert git('diff','--name-only',evidence,head,'--','gmp-platform','scripts','docs/knowledge','docs/architecture','docs/agents','AGENTS.md','codeplzreadme.md','DESIGN.md')==b''
archive=doc(head,batch+'/evidence/archive-receipts.json')
originals=[]
for row in archive['files']:
    data=raw(head,row['archive'])
    assert sha(data)==row['sha256'] and len(data)==row['bytes']
    originals.append({'path':row['archive'],'sha256':sha(data)})
old=doc(target,prior+'/source-catalog.json')
draft=doc(head,batch+'/evidence/helpers/edhr-page-baseline-draft-catalog.json')
catalog=doc(head,batch+'/source-catalog.json')
assert old['methods']==draft['methods']==catalog['methods'][:485]
assert old['semanticSources']==draft['semanticSources']==catalog['semanticSources']
assert len(old['semanticSources'])==6
old_by={row['id']:row for row in old['findings']};draft_by={row['id']:row for row in draft['findings']}
advanced=[key for key in old_by if old_by[key]!=draft_by[key]]
assert advanced==['W3-SIGNATURE-PAYLOAD-001']
assert draft['findings']==catalog['findings'][:48]
assert len(catalog['findings'])==49 and catalog['findings'][-1]['id']=='W3D-TASK-PAGINATION-001'
assert catalog['findings'][-1]['severity']=='medium' and catalog['findings'][-1]['disposition']=='fixed-awaiting-independent-acceptance'
accept=doc(target,prior+'/acceptance.json')
q=yaml.safe_load(raw(target,prior+'/evidence/independent/edhr-sig-qa-qualityResult.yaml'))['qualityResult']
required=[c for c in q['checks'] if c['required']]
assert q['result']=='passed' and all(c['outcome']=='passed' for c in required) and len(required)==8
assert accept['qualityResult']['sha256']==sha(raw(target,prior+'/evidence/independent/edhr-sig-qa-qualityResult.yaml'))
assert git('rev-parse',target+'^{tree}').decode().strip()==git('rev-parse','1b80df6298a819efaada9d6ad92ebfbea25a992f^{tree}').decode().strip()
imports=[];finite=[]
for path,count in [(batch+'/evidence/helpers/edhr-page-source-map.json',53),(batch+'/evidence/primary/source-map.json',7)]:
    mapping=doc(head,path);assert len(mapping['sourceScopes'])==count
    for row in mapping['sourceScopes']:
        ref=row.get('sourceCommit') or mapping['fixedCommit'];data=raw(ref,row['path'])
        assert row['blob']==git('rev-parse',ref+':'+row['path']).decode().strip()
        assert row['sha256']==sha(data)
        start,end=row['range'];assert 1<=start<=end<=len(data.splitlines())
        assert row['wholeFileReviewComplete'] is False and type(row['runtimeExecuted']) is bool
        imports.append(row['id'])
        finite.append({'id':row['id'],'path':row['path'],'range':[start,end],'sourceCommit':ref,'sha256':sha(data),'reportedRuntime':row['runtimeExecuted']})
assert len(set(imports))==60 and [row['id'] for row in catalog['methods'][485:]]==imports
assert len(catalog['methods'])==545 and not any(row['id']=='w3d-signature-source:028' for row in catalog['methods'])
assert any(row.get('id')=='sig-rejected-range-028' for row in catalog['importNotes'])
semantic_rows=[json.loads(line) for line in raw(head,batch+'/ledger/semantic-reviews.jsonl').decode().splitlines()]
assert len(semantic_rows)==108
summary=doc(head,batch+'/ledger/summary.json');progress=doc(head,batch+'/progress.json')
assert summary['inventory']['trackedPaths']==2864 and summary['knowledgeReview']['currentIds']==2552
assert summary['sourceReview']['recordedScopes']==545 and summary['sourceReview']['carryStates']=={'needs-delta-review':123,'retained-scoped-evidence':422}
assert summary['knowledgeReview']['evidenceStates']=={'retained-scoped-evidence':45,'needs-delta-review':63}
assert summary['knowledgeReview']['historicalConclusions']['evidence-gap']==4
assert summary['sourceReview']['wholeFilesCompleted']==0 and summary['overallAuditComplete'] is False and summary['overallPercent'] is None
assert progress['ontology']['result']=='not-applicable' and progress['ontology']['formalRoleDispatched'] is False
assert progress['semantic']['newFormalRows']==0
primary=doc(head,batch+'/evidence/primary/validation-summary.json')
fixture=primary['fixturePath'];assert primary['fixtureSha256']==sha(raw(core,fixture))
baseline=doc(head,batch+'/evidence/primary/edhr-page-baseline-summary.json');fixed=doc(head,batch+'/evidence/primary/edhr-page-fixed-summary.json')
assert baseline['totals']=={'tests':28,'failures':22,'errors':0,'skipped':0} and baseline['exit']==1
assert fixed['totals']=={'tests':52,'failures':0,'errors':0,'skipped':0} and fixed['exit']==0
assert baseline['sourceCommitAtRun']==target and fixed['sourceCommitAtRun']==target
assert all(row['freshReport'] for row in baseline['suites']+fixed['suites'])
out={'author':'/root/pagination_independent','headCommit':head,'targetCommit':target,'contractReadCommit':evidence,'contracts':contract_receipts,'workingTreeBeforeInspection':'clean','actualProductChanges':product_changes,'postEvidenceProtectedDelta':[],'verifiedOriginals':originals,'originalCount':len(originals),'inheritedMethodsUnchanged':485,'inheritedSemanticSourcesUnchanged':6,'historicalSemanticRows':108,'newSemanticReviews':0,'priorFindingObjectsUnchangedExcept':advanced,'priorQualityRequiredPassed':len(required),'newFiniteRanges':finite,'newFiniteRangeCount':len(finite),'newUniqueRangeIds':len(set(imports)),'findingRecords':49,'counts':{'trackedPaths':2864,'knowledgeIds':2552,'sourceScopes':545,'sourceNeedsDelta':123,'sourceRetained':422,'semanticNeedsDelta':63,'semanticRetained':45,'historicalEvidenceGaps':4,'wholeFilesCompleted':0},'primaryRuntimeQualificationVerified':True,'ontologyNotApplicableConsistentWithUnchangedAssetsAndTechnicalScope':True,'overallAuditComplete':False,'runtimeExecutedByThisInspection':False,'repositoryMutations':False}
dest=Path('/tmp/edhr-page-qa-evidence-inspection.json');dest.write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'output':str(dest),'sha256':sha(dest.read_bytes()),'originals':len(originals),'newRanges':len(finite),'inheritanceAndCounts':'passed','newSemanticReviews':0}))
