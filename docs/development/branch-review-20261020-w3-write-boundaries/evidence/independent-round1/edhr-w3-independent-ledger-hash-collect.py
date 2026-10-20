from pathlib import Path
import hashlib,io,json,subprocess,zipfile

repo=Path('/workspace/edhr-nexus-frontend')
base='a8285be9b91fb76bcb27ccb16a5258bda1fb5077'
head='266a1635cc95870cd7907c574eb676db7f560d4f'
prefix='/tmp/edhr-w3-independent-ledger-hash-'
sha=lambda b:hashlib.sha256(b).hexdigest()
def git(*args):
 return subprocess.check_output(['git',*args],cwd=repo,stderr=subprocess.PIPE)
def raw(ref,path): return git('show',f'{ref}:{path}')
def receipt(path,scope,lines):
 b=raw(head,path)
 exists=subprocess.run(['git','cat-file','-e',f'{base}:{path}'],cwd=repo,capture_output=True).returncode==0
 bb=raw(base,path) if exists else None
 return {'path':path,'scope':scope,'lines':lines,'commit':head,
  'blob':git('rev-parse',f'{head}:{path}').decode().strip(),'sha256':sha(b),'baseCommit':base,
  'baseSha256':sha(bb) if bb is not None else None,'unchangedFromBase':bb==b,
  'sourceRelation':'unchanged' if bb==b else 'new' if bb is None else 'changed','wholeFileCertified':False}
b='gmp-platform/backend/src/main/java/com/zencas/edhr/'
spec=[
 (b+'compliance/entity/AuditEvent.java','JSONB string fields, PrePersist and raw canonical hash payload',[26,112]),
 (b+'compliance/controller/AuditController.java','Stored-hash DTO projection and getById read',[113,142,307,314]),
 (b+'compliance/repository/AuditEventRepository.java','Repository read declarations, no rehash lifecycle hook',[16,39]),
 (b+'production/service/DhrArchiveService.java','Audit ZIP projections; separate signature/attachment/archive digests',[143,168,212,287,291,299]),
 (b+'production/service/DhrFrozenEvidenceIntegrity.java','Frozen summary-version digest enforcement',[56,91]),
 (b+'production/service/DhrReviewService.java','Expected snapshot hash review version identity check',[94,102]),
 ('gmp-platform/frontend/src/api/audit.ts','Stored hash DTO and API wrappers',[1,40]),
 ('gmp-platform/frontend/src/pages/system/AuditLogPage.tsx','Stored fingerprint visual projection only',[768,780,1080,1090]),
 ('gmp-platform/backend/src/main/resources/db/changelog/0001-init-schema.sql','AuditEvent JSONB and timestamp schema',[137,151]),
 ('gmp-platform/backend/src/main/resources/db/changelog/0023-audit-event-snapshot-hash.sql','Nullable stored hash column, no verification trigger',[1,5]),
 (b+'workflow/engine/WorkflowEngine.java','New transfer uses shared preexisting AuditEvent sealing',[705,730]),
 ('gmp-platform/backend/src/test/java/com/zencas/edhr/workflow/engine/WorkflowTransferPostgresTest.java','Stored hash/contents and transaction rollback assertions, not rehash certification',[147,154,266,275]),
]
rows=[receipt(*s) for s in spec]
Path(prefix+'source-receipts.json').write_text(json.dumps({'schema':'edhr-source-receipts/v1','scopes':rows},ensure_ascii=False,indent=2)+'\n')
e='docs/development/branch-review-20261020-w3-write-boundaries/evidence/primary/'
md=json.loads(raw(head,e+'failed-probe-member-receipts.json'));members=[]
with zipfile.ZipFile(io.BytesIO(raw(head,e+'failed-probe-fixtures.zip'))) as z:
 for m in md['members']:
  data=z.read(m['member']);assert len(data)==m['bytes'] and sha(data)==m['sha256']
  r={'member':m['member'],'bytes':len(data),'sha256':sha(data),'matchesArchivedReceipt':True}
  if 'baseline-audit' in m['member']:
   text=data.decode();r['rehashAssertionLines']=[i for i,s in enumerate(text.splitlines(),1) if 'computeSnapshotHash()' in s]
   r['loadsActual0060']='0060-work-template-version-integrity.sql' in text
   r['originalTmpAvailable']=Path(m['source']).exists()
   if r['originalTmpAvailable']:r['originalTmpBytesMatch']=Path(m['source']).read_bytes()==data
  members.append(r)
summary=json.loads(raw(head,e+'edhr-w3-audit-hash-baseline-probe-summary.json'))
assert summary['sourceCommit']==base
assert [int(summary['suite'][k]) for k in ['tests','failures','errors','skipped']]==[2,2,0,0]
calls=subprocess.check_output(['rg','-n','computeSnapshotHash\\(','gmp-platform/backend/src/main'],cwd=repo,text=True).splitlines()
assert len(calls)==2 and all('compliance/entity/AuditEvent.java' in s for s in calls)
assert not git('status','--porcelain').decode()
review={
 'schema':'edhr-independent-source-subcheck/v1','role':'independent-quality-readonly-helper','level':'L2-subcheck','result':'passed',
 'scope':'AuditEvent round-trip hash known issue and listed current read/export consumers only',
 'contractBaseline':{'sourceCommit':head,'targetBranch':'edhr-dev','targetCommit':git('rev-parse','refs/remotes/origin/edhr-dev').decode().strip(),'contractReadCommit':head,'uncommittedContractPaths':[]},
 'knowledgeBaselineVersion':'0.3.25','schemaVersion':'1.2.0','workingTreeClean':True,'repositoryMutations':False,'mavenOrDatabaseRuntimeExecuted':False,
 'runtimeEvidenceQualification':'Archived original probe summary/source receipts checked; this subcheck did not independently execute the probe.',
 'checks':[
  {'id':'hash.preexisting-source','outcome':'passed','evidence':'AuditEvent, both migrations and scoped API/UI/ZIP consumers are byte-identical at base/head; exact Git hashes in source receipts.'},
  {'id':'hash.read-export-consumers','outcome':'passed','evidence':'Main code computeSnapshotHash references are only PrePersist self-call and declaration; scoped API/UI/ZIP audit consumers project stored values without rehash comparisons.'},
  {'id':'hash.distinct-integrity-contracts','outcome':'passed','evidence':'DHR frozen version, expected review version, signature payload, attachment and ZIP-entry digests have distinct source checks.'},
  {'id':'hash.probe-original-integrity','outcome':'passed','evidence':'Both ZIP members match bytes/SHA, baseline probe retains two rehash assertions and actual0060 load; archived summary explicitly 2 failures/0 errors/0 skips.'},
  {'id':'hash.new-transfer-claims','outcome':'passed','evidence':'New transfer uses unchanged shared sealing; test checks stored digest shape, contents and rollback, with no claim of repairing readback rehash.'}],
 'probeSummary':{'sourceCommit':base,'tests':2,'failures':2,'errors':0,'skipped':0,'newRuntimeByThisInstance':False,'sha256':sha(raw(head,e+'edhr-w3-audit-hash-baseline-probe-summary.json'))},
 'zipMembers':members,'mainCodeComputeSnapshotHashReferences':calls,'findings':[],
 'knownOpenIssues':[{'id':'W5-AUDIT-HASH-001','severity':'medium','disposition':'preexisting-medium-open',
  'sourceCause':'PrePersist hashes raw JSON strings and LocalDateTime text; JSONB normalization and timestamp precision do not preserve the same byte/text payload.',
  'currentSliceImpact':'No newly introduced current read/export rejection found in listed consumers. This does not certify audit integrity.',
  'requiredFollowup':'Separately design stable versioned payload/canonicalization and historical compatibility in W5; do not rewrite old stored hashes.'}],
 'limitations':['No new Maven, DB, browser, full application or full repository certification by this helper.',
  'Negative search applies to fixed source and listed consumers only; future consumers need separate review.',
  'Archived runtime metadata is not fresh independent execution; parent QA owns runtime verdict.',
  'Stored hash/atomicity checks do not prove readback hash recomputation or all DHR/signature behavior.'],
 'allChildrenFinal':True}
Path(prefix+'review.json').write_text(json.dumps(review,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'sourceScopes':len(rows),'sourceRelations':{v:sum(x['sourceRelation']==v for x in rows) for v in ['unchanged','changed','new']},'membersChecked':len(members),'newFindings':0,'knownW5Retained':True}))
