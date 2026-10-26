import hashlib,json,subprocess
from pathlib import Path

REPO=Path('/workspace/edhr-nexus-frontend')
REF='5259791fcbc5d1fddf04cd62a02d6593d00fe2e6'
PREFIX='gmp-platform/backend/src/main/java/com/zencas/edhr/production/'
def git(*args):return subprocess.check_output(['git',*args],cwd=REPO)
def source(path):return git('show',REF+':'+path)
def sha(data):return hashlib.sha256(data).hexdigest()
def dump(path,data):Path(path).write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')

scopes=[]
def add(path,name,start,end,conclusion):
    raw=source(path)
    assert 1<=start<=end<=len(raw.splitlines())
    scopes.append({'id':'capacity-dhr-source:'+str(len(scopes)+1).zfill(3),
       'path':path,'method':name,'sourceCommit':REF,'range':[start,end],
       'blob':git('rev-parse',REF+':'+path).decode().strip(),'sha256':sha(raw),
       'readDepth':'auxiliary-source-only-capacity-inspection','conclusion':conclusion,
       'wholeFileReviewComplete':False,'runtimeExecuted':False})

add(PREFIX+'controller/DhrInstanceController.java','list/by-production-object/detail HTTP delegation',22,43,'Existing authorized actual HTTP entrypoints only; no runtime or whole controller certification.')
add(PREFIX+'controller/DhrFillingController.java','list/detail/audit HTTP delegation',21,33,'Existing filling readers route to instance/detail/audit services; no action or UI acceptance.')
add(PREFIX+'controller/DhrSummaryController.java','summary list/workspace/detail/version/audit HTTP delegation',28,55,'Explicit frozen version and current evidence routes are separate; no runtime execution.')
add(PREFIX+'controller/DhrReviewController.java','authorized review detail and audit delegation',19,40,'Review and audit call service.detail, which resolves task authorization before evidence reads; no bypass suggestion.')
add(PREFIX+'controller/DhrReviewController.java','authorized attachment-download detail prefix',42,52,'Attachment download also calls service.detail for task/version scope; entire download pipeline not audited.')
add(PREFIX+'service/DhrInstanceService.java','list SQL bounded page',184,227,'COUNT plus LIMIT/OFFSET, size1..200; mapper has no per-row JDBC. Correlated subqueries are not application N+1; query plans unmeasured.')
add(PREFIX+'service/DhrInstanceService.java','findByProductionObjectId/header',229,241,'Single object/header query with scalar SQL subqueries; version reader uses header rather than live detail.')
add(PREFIX+'service/DhrInstanceService.java','detail current complete evidence assembly',243,318,'One bulk object evidence query, no JDBC inside record mapping/grouping; full snapshots/values and serialization scale with F and bytes, no measurements.')
add(PREFIX+'service/DhrInstanceService.java','production/display/termination scalar SQL expressions',320,339,'Correlated scalar expressions emitted within SQL; do not count each expression as client network query; EXPLAIN pending.')
add(PREFIX+'service/DhrInstanceService.java','summary ResultSet projection',400,420,'Summary row mapper does not issue JDBC. SELECT* still selects wide context/directory columns not consumed by summary; width impact unmeasured.')
add(PREFIX+'service/DhrInstanceService.java','detailRow snapshot projection',422,433,'Current context/directory JSON parsed for detail only, not used to replace frozen summary body.')
add(PREFIX+'service/DhrInstanceService.java','evidenceRow',451,467,'Each evidence row parses snapshot and values, without another DB call; complete instance identities retained.')
add(PREFIX+'service/DhrArchiveLayoutReader.java','read metadata branches',13,45,'State-dependent bounded count of metadata/bulk-reference queries; not one query per evidence row; full placements/ref arrays scale with membership.')
add(PREFIX+'service/DhrSummaryService.java','workspace current candidates/version metadata',43,78,'Bulk version/review metadata, detail and candidates reused as JsonNode references; no claim that workspace body is bounded by list page.')
add(PREFIX+'service/DhrSummaryService.java','version explicit frozen read and changes',80,126,'After valid frozen verification, impacts.changes is unconditional. Fixed version direct JDBC call model F+10, not runtime query count; placement and historical identity preserved.')
add(PREFIX+'service/DhrSummaryService.java','versionHeader',128,139,'Response header uses selected frozen baseDirectory and preserves current lifecycle metadata; cannot feed projected response into raw digest verification.')
add(PREFIX+'service/DhrSummaryService.java','audit current detail preflight',141,154,'Audit page preflight calls full current detail; necessary auth/integrity purpose must be checked before any replacement. Capacity followup, no new finding in this slice.')
add(PREFIX+'service/DhrSummaryService.java','versionAudit/auditPage bounded event query',156,185,'COUNT plus LIMIT50/OFFSET for events does not prove upstream preflight cost bounded; no runtime plan measured.')
add(PREFIX+'service/DhrSummaryService.java','candidates reference aggregation',438,444,'Adds existing by-origin JsonNodes; no DB and no per-candidate deepCopy in this helper.')
add(PREFIX+'service/DhrFrozenEvidenceIntegrity.java','verify complete candidate/source-row consistency',26,54,'One bulk evidence query and in-memory per-member hash/JSON compare; loop is not JDBC N+1; complete membership checks cannot be dropped for speed.')
add(PREFIX+'service/DhrFrozenEvidenceIntegrity.java','verifyVersionDigest',56,91,'Second version query plus complete digest construction; linear full-content integrity work, not removable correctness overhead.')
add(PREFIX+'service/DhrEvidenceImpactService.java','changes direct JDBC/attachment comparison',25,76,'Valid-version direct JdbcTemplate model F+4; per-record current query, nested attachment lookup and whole-file readAllBytes hashing. Static confirmed path, runtime pending.')
add(PREFIX+'service/DhrReviewService.java','detail repeated read-only impact projection',74,84,'Authorized detail calls summaries.version (which computes changes) then evidenceChanges again and overwrites same field; two impact computations on valid read branch.')
add(PREFIX+'service/DhrReviewService.java','evidenceChanges delegate',148,151,'Direct impacts.changes delegate; no method/request cache observed in these call sites.')
add(PREFIX+'service/DhrReviewService.java','act locked fresh-comparison prefix',86,119,'Only action prefix read: workflow/object/DHR locks, eligibility and fresh lock=true comparison retained as optimization constraint; no full action/matrix acceptance.')
add('gmp-platform/backend/src/main/resources/db/changelog/baseline/0001-current-schema.sql','dhr_instance context/directory column definitions',205,245,'Current text snapshot columns substantiate wide-row dimension. No migration/index/execution-plan validation performed.')

normative=[]
for path,start,end,claim in [
 ('docs/knowledge/decisions/DEC-0063-dhr-summary-and-review-configuration.yaml',13,26,'Existing complete actual evidence, shared identity and explicit frozen-version baseline; normative constraint only, no new semantic review.'),
 ('docs/knowledge/decisions/DEC-0063-dhr-summary-and-review-configuration.yaml',45,50,'Existing single attachment50MiB and complete/partial versioned archive boundaries; total-request capacity not specified.'),
 ('docs/knowledge/rules/dhr-summary.yaml',27,44,'Existing immutable whole-version snapshot/membership and history-access constraints; raw digest verification retained.'),
 ('docs/knowledge/evidence/dhr-instance-management-user-confirmed.md',5,11,'User-confirmed first-START context freeze and all real instance identity retained; source evidence not new acceptance.'),
 ('docs/knowledge/evidence/dhr-summary-user-confirmed.md',13,19,'User-confirmed explicit version, complete/selected archive and preserved attachments; not runtime evidence from this agent.')]:
 raw=source(path);assert 1<=start<=end<=len(raw.splitlines())
 normative.append({'path':path,'sourceCommit':REF,'range':[start,end],'blob':git('rev-parse',REF+':'+path).decode().strip(),'sha256':sha(raw),'claim':claim,'newFormalSemanticReview':False})

document={'author':'/root/capacity_dhr_source','role':'read-only finite source auxiliary, not final QA',
 'fixedCommit':REF,'knowledgeBaselineVersion':'0.3.25','schemaVersion':'1.2.0',
 'contractBaseline':{'sourceCommit':'f1a20247e2d49077eac457912d4ac396ee221182','targetBranch':'edhr-dev','targetCommit':REF,'contractReadCommit':'f1a20247e2d49077eac457912d4ac396ee221182','uncommittedContractPaths':[]},
 'sourceScopes':scopes,'normativeEvidence':normative,
 'sourceScopeRecordsMayOverlap':True,'newSemanticRows':0,'runtimeTestsExecuted':0,
 'queryModelQualification':'Application JdbcTemplate call expressions on valid branches only, not measured SQL counts, optimizer internal subplans, latency, customer scale/SLA or peak heap.',
 'riskIds':['PERF-DHR-EVIDENCE-NPLUS1-001','PERF-DHR-REVIEW-REPEAT-001'],
 'riskDisposition':'pending-discussion; no remediation implemented',
 'wholeFileReviewComplete':False,'wholeDhrAccepted':False,'repoWrites':[],'subagents':[]}
dump('/tmp/edhr-capacity-dhr-source-map.json',document)
files=[]
for path in ['/tmp/edhr-capacity-dhr-review.md','/tmp/edhr-capacity-dhr-source-map.json','/tmp/edhr-capacity-dhr-build-evidence.py']:
 p=Path(path);raw=p.read_bytes();files.append({'path':path,'bytes':len(raw),'sha256':sha(raw)})
dump('/tmp/edhr-capacity-dhr-manifest.json',{'author':'/root/capacity_dhr_source','status':'FINAL','sourceCommit':REF,'files':files,'sourceScopes':len(scopes),'runtimeTests':0,'repoWrites':[],'noDatabaseOrMavenOrBrowserUse':True,'noChildren':True})
print(json.dumps({'sourceScopes':len(scopes),'normativeReceipts':len(normative),'runtime':0,'files':files},ensure_ascii=False))
