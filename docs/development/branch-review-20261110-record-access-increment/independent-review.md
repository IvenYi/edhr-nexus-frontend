# Record access increment: fresh independent final QA v2

Final scoped result: **passed** for clean candidate `0f5d4354ed381adb07650548a2ec417969d2416d`, integrated over independently fetched `edhr-dev@07d6d4168a00a265afea8105db9a1a0e2554f683`. L2; this instance did not implement or repair product code, tests, fixtures, configuration, assertions or knowledge. Evidence belongs to this directory. No child agents were created.

## Baseline, scope and independence

Read AGENTS/codeplz, quality-verifier and handoff contracts, decision package, current knowledge entry points, DEC0096, precise DEC0087-09 replacement, DEC0074, DEC0093 and DEC0095 retained boundaries. Contract bytes are unchanged between target and candidate. Knowledge remains0.3.25/schema1.2.0/P0 in-progress. Initial and final independent fetch both returned07d6d416. Candidate differs from target only by54 added decision-package lines and74 added test lines; no prior business assertion was removed. The594a-to0f5 correction is exactly two JSON keys and two relationship assertions.

The merged2dc-to07 increment contains6 product paths (one backend service, API type and four pages),7 backend test paths, one browser script,8 knowledge paths, one architecture path and78 report paths. This is incremental review, not a claim to complete the overall W0-W7 audit. The canonical backend source/runtime, complete frontend and knowledge Git trees are byte-identical at07,594a and0f5.

`source-binding.json` verifies40 actual runner input fingerprints against current worktree, Git candidate and captured source snapshots, plus10 additional reviewed sources. It also binds all353 tracked knowledge files. The only temporary untracked path was our dependency symlink during execution; it was removed. Final detached worktree is clean.

## Previous medium finding is resolved

V1 `QF-RECORD-ACCESS-001` was a test fixture authenticity problem, not a demonstrated product authorization defect. PostgreSQL `jsonb_populate_record` silently ignores unknown`business_key`, leaving original`business_id`. V1 remains formally failed at594a; its original report/proof is preserved under`ui-evidence-reused/` and is not retroactively marked green.

On our own PG16 instance we executed`fixture-proof-v2.sql` inside`BEGIN READ ONLY` and observed only actual`business_id` in the schema, wrong-key output`original-request`, corrected-key output`new-request`, and existing bigint`idx_wf_task_instance`. Current source uses`business_id` for20 target instances andM background instances. Added SQL assertions verify20 target request-to-instance business associations andM background business identities, alongsideM+21 actual tasks. All three0/5000/20000 cases really ran, with no skipped capacity condition.

The20 clones are constraint-consistent synthetic metadata, not20 newly signed applications. Each capacity case first executes one real submit/signature/workflow and probes that real original detail for all four actors. Only raw original business tests establish complete submit/decision/signature behavior. Current fixture preserves late target tasks, unique idempotency keys and unchanged pre-existing assertions.

## Actual executions

`final/run.json` contains exact command, URLs, time and source inputs;9 fresh XML reports agree on127 tests/0 failures/0 errors/0 skipped:

| Suite | Count | Qualification |
|---|---:|---|
| RecordControlPostgresIntegrationTest |69|PG16: original66 business scenarios plus3 capacity cases|
| RecordControlAccessTest |10|Mocked service authorization tests|
| CurrentDatabaseBaselineTest |1|Current schema/seed resource check|
| ProductionControllerAuthorizationTest |5|Controller authorization checks|
| WorkOrderCloseAtomicityTest |5|H2|
| DhrReviewLifecycleIntegrationTest |6|H2|
| ProductFamilyMembershipServiceTest |5|Service unit tests|
| ProductFamilyTransferPostgresTest |23|Separate isolated nativePG database|
| ProductionExecutionIntegrationTest selected3 methods |3|H2/MockMvc; not a network E2E claim|

`knowledge/run.json` and fresh knowledge XML record this instance's actual89/0/0/0. These127 are not all-native-PG, all2144 tests, or a complete production HTTP/browser-to-database matrix. Expected fixture rejection logs exercise negative rollback paths; final surefire results contain no errors.

## Authorization, read-only evidence and A23

`RecordControlService.SYSTEM_SUPER_ADMIN` looks up authenticated actor ID in`user_account`, requiresACTIVE and`LOWER(BTRIM(username))='admin'`. OrdinaryADMIN role, display name and client flags do not grant it. Existing native10-scenario matrix ran for applicant/current candidate/ordinary manager/real admin/fake display/fake role/disabled admin/ended history/reassigned old/reassigned new. List/source projections and real detail outcomes are checked. Super-admin cannot withdraw another applicant's request. Login reader remains separate from actual button signer in the existing native regression.

DEC0096 only locally supersedes in-review detail-read restriction inDEC0087-09. Ended-history reads and ordinary participant restrictions remain. Source inspection confirms task detail still uses workflow's task-specific qualification and generic signature list/CRUD retains`RECORD_CONTROL_REQUEST` isolation. We did not claim to separately rerun the entire generic signature CRUD suite. DEC0074 exact-case signing-credential exception has a different purpose from case-folded protected-account read recognition; no policy unification was inferred. DEC0093 DHR restrictions andDEC0095 complete qualified selection remain, with existing signed reassignment/tenant delegation/qualified later-page native regressions included.

Capacity reads run in read-only transactions. Before/after full row JSONB/MD5 digests of8 evidence/business tables are asserted equal: form record, revision, request, workflow instance, workflow task, signature, audit event and DHR summary version. The digest assertions passed; individual before/after digests are not exported as separate row-level raw dumps. Twelve labelled service calls show20 rows each and expected44=false/41=true/42=true/1=true; each label logs exactly2 executed businessSELECTs and0 writes, with SET LOCAL/transactions counted separately.

A23: currentACTIVE database lookup is required for the protected-account exception; a previous client projection cannot replace it. Client disabled controls explain unavailable actions, while backend checks enforce current authorization. These are distinct boundaries, not duplicate defensive layers to remove. No speculative guard or fallback was added. This focused review does not close the full existingA23 queue.

## Actual plan observation, not a production SLA

`actual-plans/` contains24 PG auto_explain plans from the original service invocation (COUNT+page for12 labels), with bind parameters in`final/postgres.log`; no hand-rewrittenEXPLAIN was substituted. All20 target tasks were placed after historical background tasks. Actual page SQL durations in this run:

| Actor |0 background|5000 background|20000 background|
|---|---:|---:|---:|
|44 unrelated|0.119ms|2.105ms|7.627ms|
|41 applicant|0.098ms|0.325ms|0.111ms|
|42 reviewer|0.200ms|15.827ms|61.344ms|
|1 active protected admin|0.095ms|0.211ms|0.117ms|

At20k, reviewer42's task SeqScan ran20 loops, filtering20010 rows per loop, approximately400k inspected rows, not400k queries. Unrelated44 used a hashed alternative and one scan removing20021 rows; applicant41 and admin1 short-circuited with0 task loops. Custom/generic parameterized plan differences are preserved. Two interface queries do not bound internal database work. Source casts bigint`task.instance_id` toVARCHAR; the existing bigint index is not directly used by this predicate in observed plans. These warm/instrumented synthetic timings are not latency guarantees, concurrency measurements, production throughput or a capacity certification.

This is a confirmed retained scaling risk. No productSQL/index change is part of this candidate. A next-batch proposal is to determine the page first, then batch qualification for its20 instance IDs while retaining exact text identity and current task policy; it needs separate review and the user's performance-design decision. A continued audit or merge is not approval to implement that proposal.

## UI evidence reuse and whole-project debt

We independently compared complete frontend/runtime/knowledge tree objects across07/594a/0f5, checked11 original UI source fingerprints and reviewed original commands/results plus representative1440px disabled-tooltip and390px screenshots. We reuse previous uninvolved QA's actual58 maintained-component browser cases and11 personnel selector cases, build, list-style and no-external-font checks. The copied original results/commands/logs/screenshots are under`ui-evidence-reused/`, bound by`ui-reuse-binding.json`. **V2 did not rerun58/11 or the production frontend build**; no changed UI input or new UI risk was found. Those browser tests use synthetic interceptedAPI, not live backend authorization/signature success.

Loaded frontend-design and frontend-design-premium, existingDESIGN and list guidance. Changed entry controls use existingMUI icon/tooltip/focus wrappers and real server errors. The narrow screen retains table scrolling and action visibility; no redesign or paused production-dialog work was performed.

V2 actually ran strict static audit and lint. The official cloud script initially compared with parent's copied file differs only by one harmless extra trailingLF; exact official bytes were then independently fetched and actually rerun. Both outputs are identical. Exact official SHA is67fd35597c85a2f37dd3c566f0bd79768cbe059114edcf28074fc5afa3e0ce68; raw initial mismatch and exact-source rerun are retained. Strict exits2 with86 errors=72 violations+14 unresolved. Baseline2dc has the same finding identities (file/rule/message/category/severity/remediation; line relocation excluded),0 added/removed. Lint exits2 because repositoryESLint configuration is absent. Neither full UI premium compliance nor lint is passed. For a test-only fixture correction these unchanged whole-project checks are optional nonblocking debt; the existing whole-audit UI queue remains open.

## Knowledge and remaining overall work

Independent file/ID recount:353 tracked files=261YAML+92MD. There are2865 literal YAML id mappings including17 schema descriptors/examples; excluding those yields2848 unique asset IDs, including nested/support assets. This denominator is not comparable to the earlier931 subset and supplies no semantic completion percentage. Ontology's final rebinding reports32 finite items=30 consistent/1 precise historical supersession/1 existing nonblocking default-tenant/MVP question. We checked that scope and source anchors; this QA does not claim a second semantic review of all32 or2848. Whole-file completion remains0; historical unique total remainsunknown.

For592-lineRecordControlService, a concrete future split is: a read/query service owning findRecord/revisions/listRequests/requestDetail projections; a shared access-policy helper owning exact actor/protected-account/task predicates; command orchestration retaining submit/withdraw/applyResult and existing write transaction/lock/audit boundaries. This is an extraction proposal, not a required current refactor. It must not move transaction ownership into controllers or cache active privilege across requests.

Overall W2-W7, A12/history, high-risk/comprehensive concurrency and permission matrices, production-scale capacity, UNKNOWN items, previously reviewedA23, full UI debt and user-paused modules remain open. This candidate closes only the scoped increment review/test-evidence correction. No CI queried/triggered, no merge/deploy/restore, no shared DB or8081 access, and no unrelated cleanup. Own PG container and dependency link are removed; detached review worktree remains clean for inspection.
