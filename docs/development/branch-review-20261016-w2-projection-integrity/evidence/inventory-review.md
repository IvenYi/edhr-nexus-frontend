# W2 projection integrity — read-only technical inventory and source-navigation map

This is a technical source-reading aid, not an independent quality result. No source, test, repository documentation, database, service, branch, or remote was modified by this helper. No Maven, browser, DB, Actions, merge, deployment, worktree, or historical-data recovery was run. Only this `/tmp` report was written.

## Baseline and actual inventory verification

- Repository: `/workspace/edhr-nexus-frontend`.
- Branch: `audit/edhr-dev-w2-projection-integrity-20261016` (provided by main reviewer); observed HEAD and `origin/edhr-dev` both `400c2dd2b836aa520f7b671c348ad9e79ac33748`.
- Read project contracts: `AGENTS.md`, `codeplzreadme.md`; read current batch decision package `DEC-PACKAGE-20261016-W2-PROJECTION-INTEGRITY` and baseline JSON.
- Knowledge model: `0.3.25`, schema `1.2.0`; read relevant DEC-0077 statements/open-question boundaries through targeted source reads. This is no full ontology audit.
- `contractBaseline.sourceCommit`, target and contract-read commit: `400c2dd2b836aa520f7b671c348ad9e79ac33748`; uncommitted contract paths `[]`.
- Executed a Python read-only comparison of `git ls-tree -r -z 400c2dd2…` with the current batch `coverage.csv`: source 1,820 entries; CSV 1,820 rows and 1,820 unique paths; zero missing paths, extra paths or blob mismatches. Every CSV baseline is the fixed commit, every status `pending`, every depth `inventory-only`.
- Inventory is an exact tracked-path/blob denominator, not semantic or runtime coverage. This helper did not modify the CSV or promote any entry.
- PR11 merged commit tree and approved delivery `2b73e72f2cf32d76ea397e19a8bb435072d04f66` tree both `618662b1b009fbb2abaa1e15fc23ada596f3848b`.
- `git diff --stat 2b73e72f 400c2dd2` empty. Target adds no source, governance, architecture or knowledge-tree delta over the approved delivery. Target advancement consists of the merge commit.
- Observed initial working tree: only untracked current-batch audit directory, belonging to main reviewer; left untouched.

## Historical deduplication

- W2 save acknowledgement defect remains the single `W2-F001-SAVE-ACK`; fixed via PR10, original candidate `6db50c935d81d9601bf0e8e1212c28f0c4499bfa`. No new save acknowledgement finding here.
- `AUD-H002` and `discrepancy.execution-form-plan-count-and-not-applicable-projection` are the same `W2-F002-FORM-AVAILABILITY`, resolved by PR11 on independently tested `518ac6838b3c418fd16aca0c84c0f216b33d17d8`. Do not reopen because the original W0 history table preserves its old `confirmed-current` status; newer finding/acceptance is the applicable result.
- `AUD-H005` reference dependency forwarding was already known fixed. Source navigation work here does not reopen PR5/6.
- `AUD-H003/H004` fill-mode/switch-binding concerns and `AUD-H009/H010` work configuration concerns stay W3. This helper did not reproduce or close them.
- The two old DHR highs and A12 revision/void/notification dependencies remain open and explicitly deferred; tracing a source navigation helper does not close them.
- Historical `NEXT.md` still describes PR11 awaiting merge at the fixed baseline. Main reviewer should append/update current progress to the user-confirmed merge, preserving original per-batch reports rather than rewriting historical tested results.

## Source chain and exact sections read

Paths below are relative to repository root. All line numbers are from the fixed baseline.

| Source | Actual read range / method | Mapping and ownership |
|---|---|---|
| `gmp-platform/backend/src/main/java/com/zencas/edhr/production/controller/FormProjectionController.java` | 1–239 entire file; `query` 51–163, `source` 175–179, `instanceSource` 182–196; retry and DHR routes also read | Class authorization requires both form-instance view and production execution. Formal query uses only SUCCEEDED batches, each record retains binding ID, row key, field sources, frozen context and source batch. It derives rowIndex against frozen model/values, not current saved row order. `/batch/source` returns persisted outbox source JSON. `/instances/id/source` returns the instance frozen snapshot and latest saved values/stage/time. |
| `gmp-platform/backend/src/main/java/com/zencas/edhr/production/service/FormTraceIndexService.java` | 1–225 entire file; `refresh` 30–43, `extract` 46–79, `add` 86–117, query overloads/core 119–208, same-row SQL 211–219 | Saved-only index replacement inside caller transaction; explicit trace bindings only. Actual subtable row identity uses `__rowId` independently of configured business row keys; old pre-identity evidence gets `legacy:<position>` without evidence rewrite. Query hits carry actual table/row/field identity and savedAt metadata. Main conditions may match within one form; detail conditions must match same table and actual row. |
| `gmp-platform/backend/src/main/java/com/zencas/edhr/production/service/FormInstanceRecordService.java` | 1–169 entire file; `saved` 40–95, `savedStage` 98–113 | Save identity is tenant/object/operation/copy; first insert freezes the form snapshot, later writes update values/status/stage. Same save transaction refreshes trace index; only COMPLETED calls formal projection completion. Main reviewer owns transaction/runtime verification. |
| `gmp-platform/backend/src/main/java/com/zencas/edhr/production/service/FormProjectionService.java` | 1–66 entire file | Completion removes trace-only bindings from statistical model, preflights business values, persists deep-copied form/model/values/context in an outbox, and uses unique final-revision conflict guard. Processing reads frozen model/values and writes facts, with separate failed status path. No source query here reads latest configuration. |
| `gmp-platform/backend/src/main/java/com/zencas/edhr/template/service/FormProjectionInterpreter.java` | `model` 86–92; validation portions 94–128 and 167–185; complete `preview` 187–209; `append` beginning 211–230 and ending 270–285; helpers 288–319 | Formal preview uses configured custom key if nonblank, otherwise `__rowId`; text key values are trimmed and duplicate/blank keys rejected. These capabilities are broader than current public design-save output (see boundary below). Not claiming the entire validate/append method reviewed. |
| `gmp-platform/backend/src/main/java/com/zencas/edhr/template/controller/TemplateModelingController.java` | Complete `saveFormTemplateVersionDesign` 227–254 | Normal public design PUT delegates model JSON to catalog.prepareDesign before persisting. |
| `gmp-platform/backend/src/main/java/com/zencas/edhr/template/service/FormLookupCatalogService.java` | 210–261; full `withLookupSnapshot` 221–245 and `prepareDesign` 248–262 | Crucial boundary: prepareDesign forces all persisted bindings enabled and removes rowKeyFieldId before validating and storing. Normal current UI/API does not create custom or blank rowKeyFieldId configurations. |
| `gmp-platform/backend/src/main/java/com/zencas/edhr/production/service/ExecutionSnapshotBuilder.java` | Complete private form-loading method beginning 183–200 read through field normalization setup; this is only a method portion | First-use reads model JSON, validates and deep-copies projection and fields; do not treat later template changes as changing already frozen sources. |
| `gmp-platform/backend/src/main/java/com/zencas/edhr/production/service/ProductionExecutionEngine.java` | Validation portions 544–607; complete `validateNestedEdits` 618–645, `prepareTableRows` 647–665, `requireRowId` 667–673 and `previousRow` 675–681 | Current save generates canonical UUID `__rowId`, requires canonical UUID textual equality, and checks duplicate identities. Space-padded system IDs cannot enter via the normal current save path. |
| `gmp-platform/frontend/src/pages/reports/projectionSourceHighlight.ts` | 1–29 entire file, `sourceHighlight` 11–29 | Main hits highlight their own field IDs. Detail hits ignore stale rowIndex/value and require one unique identity match in displayed source values. It consults matching binding.rowKeyFieldId, falling back only on null/undefined to __rowId. |
| `gmp-platform/frontend/src/pages/reports/FormProjectionReportPage.tsx` | 1–143 and 150–194; navigation/helper call portions fully read, not full page 144–149 | Formal records request batch source; trace records request instance source. The document comes from source.form model/canvas plus source.form frozen fields. `sourceChanged` compares savedAt with selected updatedAt, suppressing stale hit highlighting/details and advising requery. Rendering is disabled/read-only. Source field labels resolve the matching table column or main field in the displayed frozen fields. |
| `gmp-platform/frontend/src/pages/dhr-management/DhrManagementPage.tsx` | 138–262 and 270–282; `DhrEvidenceViewer` source/selection/highlight portions 165–232, 279–280 | Second real caller of the same highlight helper. It consumes traceHits and record.fieldValues from the same DHR detail response, builds document from record.snapshot, selects hit record, and renders read-only. This map does not audit the whole DHR viewer or close old DHR lifecycle concerns. |
| `gmp-platform/frontend/src/pages/reports/DhrTraceReportPage.tsx` | 1–39 entire file | Source action opens DhrEvidenceViewer with request and selected DHR; current/termination source policy stays with DHR detail service. |
| `gmp-platform/frontend/src/pages/master-data/template-designer-react/components/ProjectionSourceEditor.tsx` | 1–90; complete selectSource 41–48 | Changing configured source explicitly removes rowKeyFieldId before sending store patch. No current custom row-key picker was found by full src search. |
| `gmp-platform/frontend/src/pages/master-data/template-designer-react/utils/document.ts` | 1–100 and 148–173; normalizeModelState 156–169 | Parsed model retains projection metadata; source document then replaces fields with frozen fields. |
| `gmp-platform/frontend/src/api/trace-reports.ts` | 1–10 entire file | SourceHit identity reused in trace hits and DHR trace detail; explicit source-evidence-basis typing. |

## Static leads and counterevidence — no newly confirmed defect

### Lead A: custom row key / whitespace mismatch

The main reviewer identified this lead. Interpreter preview uses blank-key fallback and trims text key values. Formal controller location resolver uses any nonnull rowKeyFieldId verbatim and untrimmed row values. Frontend helper similarly uses `??` fallback and untrimmed string conversion. This discrepancy is visible in source.

However, normal public design saving removes rowKeyFieldId, normal UI source edits also remove it, and current system UUIDs cannot contain whitespace. Existing `FormLookupCatalogPostgresTest.prepareDesignMakesCompleteStatisticsActiveWithoutAnotherEnableAction` 503–515 explicitly expects removal. Therefore a direct-service test with custom keys is insufficient to prove a current public-path defect. At present this is a retained old-config/frozen-history compatibility lead, not a current confirmed defect or justification to add new policy/repair old evidence.

### Lead B: hardcoded trace binding ID versus helper custom-key lookup

Trace query hardcodes hits.bindingId=`trace`; extractor always uses system IDs. A frozen binding literally named trace with custom rowKeyFieldId could cause the helper to look at the wrong key column (or even a different row if values collide). Static tests currently examine these two paths separately. The same public design-save normalization prevents new custom-key bindings, so this is also unproven legacy-only compatibility under current scope. Do not promote it into a new business fix without a legitimate authorized trigger.

### Main/source identity boundaries presently visible

- Formal records and sources both derive from frozen outbox data; current row order does not govern formal rowIndex.
- Trace sources intentionally use newest saved values while retaining instance form snapshot. Existing save-time index and UI savedAt guard prevent using unsaved or knowingly changed hits.
- Main source fields and detail row identities are separate; entire actual row highlighting is intentional in current tests.
- Same strings across different trace meanings do not imply ownership; report ownership comes from instance context. No source navigation here assigns new production/DHR relationships.

## Existing tests inspected and useful missing checks

Inspected only; none executed by this helper.

- `frontend/scripts/test-projection-report-navigation.mjs` 1–61 full: menu normalization/permissions, stale-rowIndex ignored after reordering, missing/duplicate identities do not guess, main-group fields stay scoped, explicit custom key fixture supported.
- `frontend/scripts/test-projection-report.mjs` 1–34 full: per-report columns, frozen labels/hours, missing values remain absent, date-filter applicability. It does not render the report page or source drawer.
- `frontend/scripts/test-projection-preview.mjs`: grep-based locator only, not claiming full test read or execution.
- `FormTraceIndexServiceTest.java` 1–69 full: explicit saved supported values; system identity independent of configured business row keys; old-index fallback; frozen reference identity.
- `FormTraceIndexPostgresTest.java` 118–156 and source-assertion references from search: saved draft→updated save, no unsaved values, approval-stage metadata, true owner versus content. Not claiming full class read.
- `FormProjectionPostgresTest.java` 245–294: frozen system-identity row location versus latest order; trace-only completion no outbox; mixed purpose publishes only formal statistics.
- `FormProjectionInterpreterTest.java` 158–190: custom legacy keys stable/unique validation. Not a current full public-design-save path.
- `FormLookupCatalogPostgresTest.java` 493–515: incomplete statistics rejected even if legacy disabled, normal save removes custom rowKeyFieldId and activates complete binding, wrapped document equivalent.

The meaningful frontend missing checks are complete-page/source-drawer consumption rather than more duplicated implementation-only helper assertions: actual formal frozen source after later instance save reordering; trace savedAt changing after query suppressing stale hits/details; canonical system ID reorder with unchanged values; missing/duplicate identity no invented highlight; main field ID versus same string column in another table; disabled renderer does not write.

## Proposed smallest legal reproduction/verification routes

1. Build a new template using the public prepareDesign/design-save path and normal source bindings. Verify returned/stored binding has no rowKeyFieldId. First-use freeze, actual engine save creates canonical IDs, then query actual controller response. Use same IDs when reordering through legal engine save. This proves the applicable path and prevents treating legacy custom-key fixtures as public behavior.
2. For formal-versus-latest source: complete a new isolated form legally and process its outbox; verify query row IDs/index and `/batch/source` values stay frozen. Any later raw DB mutation is a compatibility probe only and must be labelled as such; avoid equating existing raw mutation tests with a legal current lifecycle rewrite.
3. For trace staleness: legal save A, query hits A, legal save B before opening detail, request instance source B. Mount actual report component using those controller-shaped responses; verify savedAt guard, no blue A highlight/details, and visible requery advice. This needs no A12 or historical-data change.
4. For normal row identity: two legal subtable rows can share content and be reordered; hit by actual saved ID, not repeated value or stale index. Actual renderer should highlight exactly the selected row and remain read-only.
5. For an ambiguity about legacy custom-key evidence, preserve as evidence gap and ask only if it actually changes intended current delivery; do not expand this batch into restoration or migration.

## Helper conclusion

Inventory and merge-tree equivalence are verified by actual read-only commands. Source map above is actual source reading. No new runtime defect, test pass, independent QA pass, semantic full-branch pass or production readiness is claimed. Main reviewer continues legal reproduction, code decisions and final independent validation.
