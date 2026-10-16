# W2 availability technical inventory review

Role: technical review helper; not independent QA; no repository edits or runtime verification.

## Baseline and inventory

- Source / target / contract-read commit: `41f19bca31a6232ae568dde073ef366c5d894e86`; target `edhr-dev`.
- Read `AGENTS.md`, `codeplzreadme.md`, current batch `decision-package.yaml` and `baseline.json`.
- Knowledge baseline: `0.3.25`. A version number does not replace the Git baseline.
- `git ls-tree -r -z` yields exactly **1780 paths, all blobs**.
- Current batch `coverage.csv` has **1780 rows**, unique UTF-8 paths, exact source blob and baseline match for every row, no missing/extra paths. Every row was `pending` / `inventory-only` when checked. This is inventory coverage, not semantic or code-review completion.
- Coverage SHA-256 at check: `3fba547c186632f1a5e5085093e668678baa53b1894c0f0d7242ce47600ddd2d`.
- Baseline JSON SHA-256 at check: `1813fd80ba6c7c8cfcd5f5b1206d31ff740dcb3c813f36125681088dd68bd5c9`.

## PR10 delivery to latest target delta

Compared `b95ec46b1ab1cf85ab9f71daf20c8485f8be5aa2` to `41f19bca31a6232ae568dde073ef366c5d894e86`: **153 changed paths**.

| Category | Paths |
| --- | ---: |
| Production source, backend Java / frontend TS/TSX/CSS | 15 |
| Backend tests / frontend test script | 5 |
| Knowledge and architecture | 16 |
| Development documentation | 22 |
| Output evidence | 95 |

The four previous save-ack fix files are byte-identical across these commits:

| Path under frontend | Git blob at both commits |
| --- | --- |
| `src/pages/master-data/template-designer-react/TemplateDesignerReactShell.tsx` | `b6046ecbf54e221018f0b43209a228a29374de41` |
| `src/pages/master-data/template-designer-react/store/useTemplateDesignerStore.ts` | `12b4dd33af9e2d692207423b9f6cb6cee07ad95f` |
| `scripts/test-designer-save-state.mjs` | `2843312a9b929290f2e1502cc5e49c2b836be1b4` |
| `scripts/test-designer-save-browser.mjs` | `876f9d64e68f68eaf9c96a09ecfc0422b165f465` |

`AGENTS.md`, `codeplzreadme.md`, unified handoff, both professional role contracts, and open questions have no delta. Architecture, knowledge README and current quantity policies do have a delta and must be read at the latest baseline.

The 15 source paths comprise 7 backend classes (batch/object controllers, execution/output/quality summary services) and 8 frontend paths (2 API files, 2 components, 4 production page/style files). `ProductionExecutionService.view` adds `processQuality` creation and per-operation `ExecutionQualitySummary.project`; frontend `ExecutionView` adds its optional type. Neither change replaces form-availability logic. Existing quantity behavior must be preserved by a local availability fix.

Current new policy is DEC-0079: final-operation formal good/NG, all-operation explicitly identified batch-product scrap, missing versus explicit zero, unit/material separation, successful formal projection versus saved reference. The saved total includes effective values and is not added to the effective total. Batch-shared forms do not become owned by a currently displayed operation. No backfill or lifecycle change. DEC-0079-06 is specified/internal and refines the popover display, not these counting rules. No fresh runtime verification was performed by this helper.

## Historical deduplication and source mapping

The two current leads are **one existing historical item**: `AUD-H002` → `discrepancy.execution-form-plan-count-and-not-applicable-projection` → DEC-0047. Original index is `docs/development/branch-review-20261015/history/history-dedup.json`, record `AUD-H002`; current authority is `docs/knowledge/decisions/DEC-0047-execution-form-selector.yaml`, statement `DEC-0047-01` and the existing medium/open implementation discrepancy. Do not count the frontend count and backend ordering as two unrelated newly discovered historical defects. Prior `confirmed-current` was explicitly qualified as static triage, not a final quality result or legal runtime reproduction.

| Source / symbol at fixed baseline | Observation and boundary |
| --- | --- |
| Frontend `ExecutionFormSelector.tsx`, `renderForm`, around 145–160 | Uses actual `instanceIds.length` to mark arrived, but metadata always prints `共 0 份` when no instance. Fallback tests operation status before completed work. |
| Same component, expanded work steps, around 218–230 | Tooltip also unconditionally prints `共 0 份`; status label consumes group status. A browser regression must cover this separate rendered path. |
| Frontend `api/production-execution.ts`, `ExecutionForm` | No planned-copy-count field exists. Do not invent a planned quantity or default 1. Preserve selectable preview before arrival. |
| Backend `ProductionExecutionService.get` / `view` / `formAvailabilityStatus`, around 134 / 256 / 355 | Read response builds per-operation `formCopies`. Actual instances have priority. With none, `operation != IN_PROGRESS` currently wins before completed-work `NOT_APPLICABLE`; this is a static observation pending legal trigger reproduction. |
| Backend `ExecutionFormCopies.ids/status` | Existing group ids or legacy single form identify actual instances; all actual copies complete gives COMPLETED, otherwise IN_PROGRESS. Keep legacy behavior and actual-instance precedence. |
| Backend `ProductionExecutionEngine.start`, around 107 | Creates configured forms, initializes work graph, and advances actual nodes. Work forms are not created just because they appear in the snapshot. |
| Same engine `advanceWork` / `conditionOutlet` / `finishNode`, around 752 / 776 / 835 | Conditional branch uses reliable frozen context facts (`sourceType`, `sourceNumber`, etc.), `work-runtime-fields-v1`, condition branch handle `condition-<id>` and fallback id. A branch can legally bypass FORM then end; completing its operation is the relevant service read repro. |

## Existing tests and recommended additions

- `frontend/scripts/test-execution-form-selector.mjs`: 13 existing tests cover source separation, planned selection, graph stages/branches, runtime current node, approval/read-only, work not started/completed, search, multi-work isolation and actionable-copy preference. They do **not** assert actual drawer count text or native work-step tooltip. Add actual component browser checks for pre-start no instance count, future work no count, true multiple-copy count, completed/unreached N/A, actual instances preserving real status, and preview callbacks / busy controls / search. No new helper abstraction merely to make private rendering easy to test.
- `ProductionExecutionEngineTest.skippedUnboundWorkFormDoesNotBlockCompletedConditionalWork` (around 231) uses manually constructed completed-work state; it supports completion behavior but is **not** legal branch execution evidence. Prefer `initialState → start` over a real conditional graph then `complete`, followed by actual service `get/view` assertions. Choose the existing reliable frozen `sourceType=BATCH` fact rather than unsupported facts or direct DB mutation.
- `ExecutionFormCopiesTest.optionalUnfinishedCopiesRequireNoticeAndRemainInProgressAfterCompletion` (around 95) already executes a legal `start → submit first → add copy → save second → complete(true)` sequence. Preserve this true IN_PROGRESS aggregate after operation completion; do not classify an existing unfinished instance as N/A.
- Additional adjacent observation, not yet runtime confirmed here: expanded work-step labels reduce non-current groups to COMPLETED / NOT_APPLICABLE / 未到达; an actual IN_PROGRESS copy outside the current work node would therefore be labeled 未到达. `ExecutionFormCopiesTest.optionalWorkFormEndsOnlyItsNodeWithoutCompletingRemainingWork` (around 122) runs a legal legacy `endForm(true) → confirm → complete(true)` chain retaining the ACTIVE work-form copy. The public service still accepts `END_FORM` (around 213), and DEC-0059-04 preserves existing advancement/completion facts and treats END_FORM compatibility as implementation strategy. Cover actual-instance precedence in the work-step browser path as well as the configured-form row before deciding whether this is part of the current projection fix.
- `ExecutionFormCopiesTest.oldSingleCopyRetainsItsValuesAndCompletedLegacyIsNotReopened` and `oldInProgressCopyFinishesWithOperationWithoutReplacingItsData` cover legacy identity/content behavior.
- Adjacent new quantity checks: `ProductionQualitySummaryTest` (final scope, product/material/unit evidence, missing/zero, completion versus failed projection, actual row identity), `ExecutionOutputSummaryTest`, and `frontend/scripts/test-production-quantity-sources.mjs` (4 tests, formal/saved split, identity deduplication, failed/pending/review source status and zero/missing). These should remain intact; none was run by this helper.

## Explicit deferred boundary

User-confirmed source: `docs/development/branch-review-20261016-w1-review-export/followup-20261016-source-dependency.md` and inherited `findings.yaml`. Record control form change/void is not implemented. Both existing high items remain open:

1. `discrepancy.dhr-review-complete-evidence-impact-gap`: complete effective-source impact, active notification and release-level evidence gap.
2. `discrepancy.dhr-review-effective-source-integration`: actual record-control effective change/void consumer and legal integration.

Deferred are actual effective source interfaces/revision identity/DHR integration and notification/concurrency dependent on them. Existing read-time comparison, legal write guards, frozen evidence and approval blocking may still be reviewed independently. DHR summary revision is not A12 source revision. Form availability is independent and may proceed without inventing an effective-source chain or closing these highs.

## Result qualification

Inventory and historical deduplication are verified; current source observations are mapped. Runtime/browser/Maven/DB tests were not run, no independent quality result is claimed, and no files in the repository were changed by this helper. This report is `/tmp` technical support for the primary reviewer and does not complete W2 or the whole-branch review.
