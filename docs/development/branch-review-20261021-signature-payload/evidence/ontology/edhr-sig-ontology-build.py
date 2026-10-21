from pathlib import Path
import hashlib,importlib.util,json,subprocess,sys
import yaml

REPO=Path('/workspace/edhr-nexus-frontend')
BASE='c3343f45bb79f72368937f0d197ae01f989f0390'
FIXED=sys.argv[1]
PREFIX=Path('/tmp/edhr-sig-ontology')
def git(*args): return subprocess.check_output(['git',*args],cwd=REPO)
def raw(ref,path): return git('show',ref+':'+path)
def sha(data): return hashlib.sha256(data).hexdigest()
def receipt(path,scope,ref=FIXED):
    data=raw(ref,path)
    return {'path':path,'commit':ref,'blob':git('rev-parse',ref+':'+path).decode().strip(),'sha256':sha(data),'locator':scope,'reviewedScope':scope}
def write(suffix,value):
    p=Path(str(PREFIX)+'-'+suffix)
    p.write_text(json.dumps(value,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    return p

spec=importlib.util.spec_from_file_location('sig_ontology_ledger',REPO/'scripts/build-branch-review-ledger.py')
module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module)
old=module.knowledge_records(module.Git(),BASE)
now=module.knowledge_records(module.Git(),FIXED)
new_ids=sorted(set(now)-set(old))
changed=sorted(k for k in old.keys() & now.keys() if old[k]['recordSha256']!=now[k]['recordSha256'])
EXPECTED_NEW=[
 'evidence.signature-payload-lossless-storage-source',
 'evidence.signature-payload-lossless-storage-migration',
 'evidence.signature-payload-postgres-roundtrip-test',
 'evidence.signature-payload-postgres-migration-test']
assert new_ids==sorted(EXPECTED_NEW)
assert not (set(old)-set(now))
assert changed==['anchor.dhr-summary-zip-source-trace']
assert old[changed[0]]['assetStatus']==now[changed[0]]['assetStatus']=='specified'
assert old[changed[0]]['visibility']==now[changed[0]]['visibility']=='internal'

source_specs=[
 ('gmp-platform/backend/src/main/java/com/zencas/edhr/compliance/entity/Signature.java','snapshotData TEXT mapping and unchanged surrounding signature fields'),
 ('gmp-platform/backend/src/main/resources/db/changelog/0118-signature-payload-text.sql','complete forward migration and JSON parse CHECK; no digest rewrite or lossy rollback'),
 ('gmp-platform/backend/src/main/java/com/zencas/edhr/production/service/ExecutionAccess.java','sign/signTarget/signField:222-281; existing original-string SHA256 and protected identities only'),
 ('gmp-platform/backend/src/main/java/com/zencas/edhr/production/service/DhrArchiveService.java','export trace branch:155-171; sourceSignatures/signaturesFor:247-288 raw JDBC payload validation; no full archive acceptance'),
 ('gmp-platform/backend/src/main/java/com/zencas/edhr/identity/controller/AuthController.java','personal certification original JSON and hash/write:330-383, not whole auth or runtime API verification'),
 ('gmp-platform/backend/src/main/java/com/zencas/edhr/compliance/controller/SignatureController.java','protected three target types in create/update/delete; source inspected only')]
test_specs=[
 ('gmp-platform/backend/src/test/java/com/zencas/edhr/production/service/SignatureSnapshotPostgresTest.java','declared native JPA/signature/archive-consumer cases and conditional owned database boundary; synthetic ButtonSigner/profile entity, not API or full ZIP E2E'),
 ('gmp-platform/backend/src/test/java/com/zencas/edhr/production/service/SignatureSnapshotMigrationPostgresTest.java','declared legacy preservation/repeat/full master/JSON parse compatibility/missing-original rejection/rollback-refusal cases; source read only'),
 ('gmp-platform/backend/src/test/java/com/zencas/edhr/production/service/DhrAttachmentAndArchiveTest.java','existing H2 with snapshot_data TEXT and FULL/SELECTED signatures/corrupt digest assertions; not native PG proof')]
sources=[receipt(*x) for x in source_specs]
tests=[receipt(*x) for x in test_specs]
unchanged_algorithms=[]
for path,_ in source_specs[2:]:
    assert raw(BASE,path)==raw(FIXED,path)
    unchanged_algorithms.append(path)
knowledge_paths=[p for p in module.Git().tree(FIXED) if p.startswith('docs/knowledge/')]
assert all((REPO/p).read_bytes()==raw(FIXED,p) for p in knowledge_paths)
yaml_paths=[p for p in knowledge_paths if p.endswith(('.yaml','.yml'))]
assert all(yaml.safe_load(raw(FIXED,p)) is not None for p in yaml_paths)
schema=yaml.safe_load(raw(FIXED,'docs/knowledge/schema.yaml'))
assert schema['knowledgeModelVersion']=='0.3.25' and schema['schemaVersion']=='1.2.0'
contract={'sourceCommit':FIXED,'targetBranch':'edhr-dev','targetCommit':BASE,'contractReadCommit':BASE,'uncommittedContractPaths':[]}
for path in ['AGENTS.md','docs/agents/business-knowledge-modeler.md','docs/agents/agent-handoff-contract.md']:
    assert raw(BASE,path)==raw(FIXED,path)

scopes={
 EXPECTED_NEW[0]:'Only the entity lossless TEXT mapping; no inference promoted to user policy, signature qualification or digest algorithm change.',
 EXPECTED_NEW[1]:'Forward migration/current readable legacy text and original hashes, original JSONB input parse compatibility, no missing-byte reconstruction or silent lossy rollback.',
 EXPECTED_NEW[2]:'Only actual native roundtrip test source boundaries; synthetic authenticated signer and USER_PROFILE entity distinguished from full API/login/ZIP execution.',
 EXPECTED_NEW[3]:'Only migration test source and owned schema/database assertions; code existence does not certify production migration or successful runtime.',
 'anchor.dhr-summary-zip-source-trace':'Existing anchor adds signature entity/migration/tests/evidence; old print observations retain historical date context, specified/internal maturity retained.',
 'rule.dhr-summary-zip-source-trace':'Only same frozen source/review signature traceability and FULL/SELECTED representation; no whole rule/runtime verification or release claim.',
 'DEC-0063-05':'Frozen version evidence basis retained; storage correction does not replace source with current draft/live values or rewrite old frozen evidence.',
 'DEC-0063-11':'Only same-version trace data/explicit scope and non-omission boundary retained; complete PDF/ZIP layout and attachments not accepted here.',
 'DEC-0063-15':'Source/review signatures remain traceable; selected content does not change approval scope; missing original bytes are not fabricated.',
 'DEC-0074-04':'Existing current-user SIGN_FIELD qualification and history preserved; no propagation of cross-account button/admin exception.',
 'DEC-0058-02':'Existing content-change invalidation and historical signature retention kept; migration does not recompute old signature digests.',
 'evidence.dhr-summary-attachment-archive-tests':'Existing H2/TEXT source assertions remain finite and are not reused as native JSONB roundtrip proof.'}
rows=[]
doc_path='docs/knowledge/evidence/signature-payload-storage-2026-10-21.md'
for key,scope in scopes.items():
    meta=now[key]
    row={**meta,'baselineCommit':FIXED,'sourceCommit':FIXED,'sourceBlob':git('rev-parse',FIXED+':'+meta['sourcePath']).decode().strip(),'sourceSha256':sha(raw(FIXED,meta['sourcePath'])),'knowledgeBaselineVersion':'0.3.25','schemaVersion':'1.2.0','contractBaseline':contract,'originalMaturity':meta['assetStatus'],'auditScopeClassification':'current-effective-scoped-review','reviewStatus':'reviewed','conclusion':'consistent','reviewedScope':scope,'decisionEvidence':[receipt(meta['sourcePath'],'exact ID '+key+' at '+meta['sourceLocator'])],'implementationEvidence':sources,'testAssertionsRead':tests,'evidence':receipt(doc_path,'current storage correction and legacy/unexecuted runtime limitations only'),'newUserPolicy':False,'businessRuntimeExecutedByOntologyInstance':False,'wholeFileReviewComplete':False,'wholeRecordSemanticPassClaimed':False,'validationExecutedByOntologyInstance':'formal knowledge model only; see validation summary','limitations':['Only12 finite ID scopes and listed source/assertions; not whole files/records/knowledge or full branch acceptance.','Parent business/native PG runs are not ontology execution or independent QA.','Old missing signature bytes may remain blocked; old AuditEvent problem,4 gaps,2 deferred DHR high/A12 and record-control remain.','No maturity/version/stage upgrade or production/history/Actions mutation.']}
    rows.append(row)
p=Path(str(PREFIX)+'-semantic-review.jsonl')
p.write_text(''.join(json.dumps(r,ensure_ascii=False,sort_keys=True)+'\n' for r in rows))
# Run the real ledger reconciler against a transient input stream. Only the JSONL
# stream is virtual; every referenced commit/record/dependency uses the real Git
# tree. The stream will require a tracked evidence receipt when the parent imports
# it into the delivery ledger; this check does not claim that it is committed.
virtual_path='__transient_signature_payload_semantic_review__.jsonl'
class TransientSemanticGit(module.Git):
    def read(self,commit,path):
        return p.read_bytes() if path==virtual_path else super().read(commit,path)
import_rows=module.reconcile_semantics(TransientSemanticGit(),FIXED,[{'commit':FIXED,'path':virtual_path,'sha256':sha(p.read_bytes()),'locator':'all12 finite scopes; transient uncommitted stream for compatibility only'}],now)
assert len(import_rows)==len(rows)
assert all(r['carryStatus']=='retained-scoped-evidence' for r in import_rows)
validation=json.loads(Path(str(PREFIX)+'-formal-test-summary.json').read_text())
assert validation['commandExit']==0 and validation['counts']=={'tests':89,'failures':0,'errors':0,'skipped':0}
validation.update({'knowledgeModelVersion':'0.3.25','schemaVersion':'1.2.0','sourceCommit':FIXED,'targetCommit':BASE,'contractBaseline':contract,'allCurrentKnowledgeFilesEqualFixedCommit':True,'yamlDocumentsParsed':len(yaml_paths),'inventoryOnly':{'priorKnowledgeIds':len(old),'currentKnowledgeIds':len(now),'addedEvidenceIds':new_ids,'changedExistingRecordIds':changed,'notSemanticCoverage':True},'semanticReviews':{'actualFiniteIdCount':len(rows),'conclusions':{'consistent':len(rows)},'notWholeRecordOrFileAcceptance':True},'existingLedgerReconcilerCompatibility':{'function':'scripts/build-branch-review-ledger.py:reconcile_semantics','finiteRows':len(import_rows),'carryStatuses':{'retained-scoped-evidence':len(import_rows)},'input':'transient JSONL stream; all referenced knowledge/source data read from fixed real Git commit','committedSemanticEvidenceClaimed':False},'existingAlgorithmsAndConsumersByteUnchanged':unchanged_algorithms,'businessTestsExecutedByOntology':False})
write('validation.json',validation)
read_receipts={'contractBaseline':contract,'completeRequiredReadFiles':['AGENTS.md','docs/agents/business-knowledge-modeler.md','docs/agents/agent-handoff-contract.md','docs/architecture/business-knowledge-model.md','docs/knowledge/README.md','docs/knowledge/open-questions.yaml'],'startupGitReceipts':[receipt(x,'required startup file read; no whole semantic acceptance',BASE) for x in ['AGENTS.md','docs/agents/business-knowledge-modeler.md','docs/agents/agent-handoff-contract.md','docs/architecture/business-knowledge-model.md','docs/knowledge/README.md','docs/knowledge/open-questions.yaml']],'implementationScopes':sources,'testAssertionScopes':tests,'currentKnowledgeReads':[receipt(x,'changed evidence/anchor/readable explanation only') for x in ['docs/knowledge/evidence/signature-payload-storage.yaml','docs/knowledge/implementation-anchors/dhr-summary.yaml',doc_path]],'businessTestsExecuted':[],'child':{'author':'/root/signature_payload_ontology/existing_signature_evidence','status':'FINAL','scope':'limited29 existing knowledge record lookup; not12 formal review rows or a new quality gate','path':'/tmp/edhr-sig-ontology-existing-evidence.json','sha256':sha(Path('/tmp/edhr-sig-ontology-existing-evidence.json').read_bytes())}}
write('read-receipts.json',read_receipts)
sync=[{'id':key,'disposition':'updated' if key in EXPECTED_NEW or key==changed[0] else 'retained','scope':scope,'sourceReferences':[now[key]['sourcePath'],doc_path]} for key,scope in scopes.items()]
result={'ontologyResult':{'result':'updated','baselineBefore':'0.3.25','baselineAfter':'0.3.25','contractBaseline':contract,'reason':'Four internal implementation evidence IDs and existing exact ZIP trace anchor were synchronized. Normative decisions/rules and maturity preserved; lossless physical storage remains an inferred engineering correction. Legacy lost bytes may remain blocked.','changedArtifacts':[{'path':'docs/knowledge/evidence/signature-payload-storage.yaml','changeType':'create','ids':EXPECTED_NEW},{'path':'docs/knowledge/implementation-anchors/dhr-summary.yaml','changeType':'update','ids':changed},{'path':doc_path,'changeType':'create','ids':[]},{'path':'docs/knowledge/README.md','changeType':'update','ids':[]}],'knowledgeSync':sync,'conflicts':[],'questions':[],'validationEvidence':[{'id':'validation.signature-payload-formal-knowledge89','checkType':'schema','command':validation['command'],'outcome':'passed','evidence':['/tmp/edhr-sig-ontology-validation.json','89 passed,0failures,0errors,0skipped at '+FIXED]},{'id':'validation.signature-payload-finite-id-provenance','checkType':'evidence-path','command':'python3 /tmp/edhr-sig-ontology-build.py '+FIXED,'outcome':'passed','evidence':['/tmp/edhr-sig-ontology-semantic-review.jsonl','Exact record/source/blob/SHA;4 evidence additions and1 anchor changed; no normative/maturity delta.']}],'roadmapProgress':{'stage':'P0','status':'in-progress','exitCriteriaEvidence':[],'deferredStages':['P1','P2','P3']}}}
Path(str(PREFIX)+'-result.yaml').write_text(yaml.safe_dump(result,allow_unicode=True,sort_keys=False,width=100))
files=[]
for suffix in ['result.yaml','semantic-review.jsonl','validation.json','formal-test-summary.json','read-receipts.json','build.py','run-formal.py','existing-evidence.json']:
    f=Path(str(PREFIX)+'-'+suffix)
    files.append({'path':str(f),'bytes':f.stat().st_size,'sha256':sha(f.read_bytes())})
write('manifest.json',{'author':'/root/signature_payload_ontology','status':'FINAL','sourceCommit':FIXED,'files':files,'children':[{'author':'/root/signature_payload_ontology/existing_signature_evidence','status':'FINAL'}],'allChildInstancesFinal':True,'excluded':['raw Maven log','Surefire XML','credentials or env'],'businessTestsExecuted':[]})
print(json.dumps({'result':'updated','sourceCommit':FIXED,'formalKnowledge':validation['counts'],'finiteSemanticRows':len(rows),'newEvidenceIds':len(new_ids),'changedExistingRecords':changed}))
