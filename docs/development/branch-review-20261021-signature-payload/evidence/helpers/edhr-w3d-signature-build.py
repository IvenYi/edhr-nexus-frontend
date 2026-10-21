from pathlib import Path
import hashlib,json,subprocess

repo=Path('/workspace/edhr-nexus-frontend')
ref='c3343f45bb79f72368937f0d197ae01f989f0390'
base='gmp-platform/backend/src/main/java/com/zencas/edhr/'
def git(*args):return subprocess.check_output(['git',*args],cwd=repo)
def receipt(path):
    raw=git('show',ref+':'+path)
    return {'path':path,'sourceCommit':ref,'blob':git('rev-parse',ref+':'+path).decode().strip(),'sha256':hashlib.sha256(raw).hexdigest()}
items=[
('production/service/ExecutionAccess.java','authenticateButtonSigner',202,221,'Button signer authenticates active/unlocked account, independent signature password/current profile certification; strict username admin exception uses login password. This is not field-signature policy.'),
('production/service/ExecutionAccess.java','sign',223,225,'Production button signer delegates to signTarget with PRODUCTION_EXECUTION target.'),
('production/service/ExecutionAccess.java','signTarget',227,246,'Raw mapper JSON string is hashed as UTF8 SHA256, then stored as Signature.snapshotData; no canonicalization or preserved raw-text field in this method.'),
('production/service/ExecutionAccess.java','signField',248,283,'Current-session field signer validates current certification/password/image and embeds exact content evidence; raw mapper JSON string is hashed and saved under PRODUCTION_EXECUTION.'),
('compliance/entity/Signature.java','snapshotHash/snapshotData mapping',10,35,'Signature snapshot_data is JSONB and mapped using JdbcTypeCode(SqlTypes.JSON), while snapshotHash is stored independently.'),
('production/controller/ProductionExecutionController.java','class method authority and act',13,16,'Production execution controller has existing production.execution method authority.'),
('production/controller/ProductionExecutionController.java','act',53,66,'Real production action endpoint invokes transactional execution service; no test-only or dead writer port is needed to reach the producer.'),
('production/service/ProductionExecutionService.java','act',154,253,'Existing transactional action routes SAVE/SUBMIT/APPROVE/RETURN/SIGN_FIELD to real engine, persists execution and audit in the same service transaction.'),
('production/service/ProductionExecutionEngine.java','formAction wrappers',196,210,'Actual formAction delegates to formActionInternal; supplement wrapper is separate.'),
('production/service/ProductionExecutionEngine.java','formActionInternal guards/signing-identity prefix',212,245,'Existing form-instance/node/allowed-button and signer handling guards precede signing; only this finite prefix is reviewed, not entire engine.'),
('production/service/ProductionExecutionEngine.java','formActionInternal signing branches',272,315,'Real SIGN_FIELD calls access.signField and ordinary signed buttons call access.sign, recording signature IDs into form state. This finite branch is not a complete form-action acceptance.'),
('production/controller/DhrReviewController.java','class existing authority',18,23,'DHR review remains a dedicated permission-scoped controller.'),
('production/controller/DhrReviewController.java','act',54,56,'Actual DHR approval HTTP endpoint requires review menu and dhr.reviews.act then invokes DhrReviewService.act.'),
('production/service/DhrReviewService.java','act',86,151,'DHR approval validates current task/actor/frozen evidence and configured signature requirement, then signTarget(DHR_SUMMARY) and completeDhrTask with its signature ID.'),
('production/controller/DhrArchiveController.java','export',22,40,'Actual export HTTP endpoint requires dhr.instances.view and dhr.summaries.export and invokes archive service before streaming ZIP.'),
('production/service/DhrArchiveService.java','export',49,205,'Frozen explicit version export reaches source/review signature consumers before SELECTED payload removal. Source calls only FULL or selected form records; review calls always. Failure deletes temp ZIP and propagates, so normal export can be blocked.'),
('production/service/DhrArchiveService.java','auditsFor/sourceAuditEvents',212,245,'Inspected audit export branches project stored digest and payload metadata without rehashing; distinct from signature verification.'),
('production/service/DhrArchiveService.java','sourceSignatures',247,265,'Reads JDBC snapshot_data string and rehashes raw UTF8; mismatch stops source signature export for object-scoped signatures up to submit cutoff.'),
('production/service/DhrArchiveService.java','signaturesFor',267,289,'Reads joined workflow task signature data and rehashes JDBC string as raw UTF8; mismatch stops review signature export.'),
('identity/controller/AuthController.java','createPersonalSignature',309,396,'Own-profile certification verifies login password/evidence files, hashes raw JSON snapshotData, stores USER_PROFILE signature and returns its hash. USER_PROFILE is not selected by DhrArchive sourceSignatures.'),
('identity/controller/AuthController.java','verifyCurrentUserSignature',399,434,'Inspected own-profile verification checks expiry/signature password/image reference; it does not raw-rehash snapshotData in this method.'),
('identity/controller/AuthController.java','signatureSnapshot body',1040,1066,'Certification evidence contains profile metadata and image/ID-card file snapshots; finite body only.'),
('identity/controller/AuthController.java','extractSignatureImageFileId',1078,1090,'Profile consumer parses JSON tree to obtain signature image reference; semantic JSON read differs from raw-byte rehash.'),
('compliance/controller/SignatureController.java','list/getById',23,45,'Generic read excludes or rejects DHR evidence; no wider read-privacy policy is adjudicated by this scope.'),
('compliance/controller/SignatureController.java','create/update/delete and protectExecutionSignature',47,80,'Generic writes block both incoming and existing protected target types DHR_SUMMARY, PRODUCTION_EXECUTION and USER_PROFILE. No claim arbitrary generic signatureId satisfies domain signing.'),
('compliance/repository/SignatureRepository.java','findNonDhr/latest certification',13,16,'Repository methods support DHR exclusion and per-target latest certification lookup; only finite declarations reviewed.')]
scopes=[]
for i,(p,m,a,b,c) in enumerate(items,1):
    path=base+p;raw=git('show',ref+':'+path);assert 1<=a<=b<=len(raw.decode().splitlines())
    scopes.append({'id':'w3d-signature-source:%03d'%i,**receipt(path),'method':m,'range':[a,b],'readDepth':'actual selected source method or explicitly finite branch inspection; not whole-file acceptance','conclusion':c,'wholeFileReviewComplete':False,'runtimeExecuted':False})
schema_path='gmp-platform/backend/src/main/resources/db/changelog/0001-init-schema.sql'
scopes.append({'id':'w3d-signature-source:027',**receipt(schema_path),'method':'initial signature table columns','range':[157,172],'readDepth':'actual finite DDL inspection; not migration execution','conclusion':'Initial schema stores signature.snapshot_data as JSONB and snapshot_hash separately; no raw original JSON string column in this table definition.','wholeFileReviewComplete':False,'runtimeExecuted':False})
test_path='gmp-platform/backend/src/test/java/com/zencas/edhr/compliance/entity/SignatureTest.java'
scopes.append({'id':'w3d-signature-source:028',**receipt(test_path),'method':'snapshotDataUsesJsonJdbcTypeForPostgresJsonbColumn','range':[10,22],'readDepth':'actual finite test-source inspection; test not executed','conclusion':'Test only reflects SqlTypes.JSON annotation, does not execute PostgreSQL or validate signed raw bytes round trip.','wholeFileReviewComplete':False,'runtimeExecuted':False})
child=[]
for name in ['edhr-w3d-signature-policy-tests.json','edhr-w3d-signature-policy-tests.md']:
    p=Path('/tmp')/name;raw=p.read_bytes();child.append({'path':str(p),'bytes':len(raw),'sha256':hashlib.sha256(raw).hexdigest(),'author':'/root/w3d_signature_consumers/signature_policy_tests','status':'FINAL'})
doc={'schema':'edhr-readonly-source-map/v1','role':'read-only source assistance, not formal ontology or QA','fixedCommit':ref,'contractBaseline':{'sourceCommit':ref,'targetBranch':'edhr-dev','targetCommit':ref,'contractReadCommit':ref,'uncommittedContractPaths':[]},'knowledgeModelVersion':'0.3.25','schemaVersion':'1.2.0','sourceScopes':scopes,'findingCandidates':[{'id':'candidate.signature-jsonb-archive-digest','status':'source-control-flow-confirmed-native-pg-reproduction-pending','potentialImpact':'Untampered production or DHR approval signatures may block real DHR ZIP export after JSONB text normalization. Severity and native runtime proof left to primary.','producer':'ExecutionAccess.signTarget/signField','storage':'Signature.snapshotData JSONB','consumer':'DhrArchiveService.sourceSignatures/signaturesFor raw JDBC UTF8 SHA256','notClosedBy':'W5-AUDIT-HASH-001 is AuditEvent-specific; inspected audit export does not rehash.'}],'runtimeChecksExecuted':[],'repositoryMutations':[],'wholeFileOrBranchAcceptance':False,'childFinal':True,'childOriginals':child,'limitations':['No Maven, PG, API, browser, migration or digest runtime check was executed by this source helper or its child.','Old generic signatureId reference is not a blanket mandatory-signature policy and does not bypass real production/DHR writers.','SOURCE signatures are object-scoped up to submit cutoff; SELECTED attachments-only skips source signatures, while review signatures are still checked.','No raw data/hash algorithm was changed and no historical raw bytes were reconstructed.','Finite code scopes may overlap and are not distinct whole methods, files, or a complete branch denominator.']}
doc['governanceAndKnowledgeReceipts']=[]
for path in ['AGENTS.md','docs/agents/agent-handoff-contract.md','docs/architecture/business-knowledge-model.md','docs/knowledge/README.md','docs/knowledge/open-questions.yaml','docs/knowledge/schema.yaml']:
    doc['governanceAndKnowledgeReceipts'].append({**receipt(path),'qualification':'Governance or relevant knowledge baseline/selected sections; not whole-knowledge semantic acceptance'})
out=Path('/tmp/edhr-w3d-signature-source-map.json');out.write_text(json.dumps(doc,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'sourceScopes':len(scopes),'paths':len({s['path'] for s in scopes}),'sha256':hashlib.sha256(out.read_bytes()).hexdigest(),'childFinal':True}))
