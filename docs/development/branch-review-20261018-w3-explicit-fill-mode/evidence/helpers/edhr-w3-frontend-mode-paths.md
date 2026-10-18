# W3 frontend explicit fill mode — read-only source report

- Role: technical source-mapping helper; not independent QA, not ontology maintenance.
- Git baseline: `4b25dc7f29c27cfb39c0f570b547869aa0c2f289` on `audit/edhr-dev-w3-explicit-fill-mode-20261018`.
- Knowledge: `0.3.25`; policy read directly from DEC-0067, DEC-0009, `docs/knowledge/rules/form-fill-settings.yaml`, and original project evidence `docs/knowledge/evidence/form-fill-settings-confirmed.md`.
- Contract: actual `AGENTS.md` and `codeplzreadme.md` read. No repository file, tool configuration, application data, Git history or external application was modified by this helper.
- Evidence type: original-evidence source inspection, plus explicitly identified user-confirmed project policy and engineering recommendations. No test, build, browser, live database, authentication or deployed-flow verification was executed.
- Scope: AUD-H003 missing fill mode inference and publish bypass only. No claim that H004/H009/H010 or whole W3 is resolved.

## Policy boundary

DEC-0067-01/04/05 and the original confirmation require the WORK FORM node and product/product-family operation form bindings to persist an explicit DIRECT or PROCESS mode and preserve it through publication, snapshot and runtime. Missing mode must not be inferred from a dormant process reference, or treated as open DIRECT for old data. The latest MVP instruction removes legacy fallback/backfill/migration requirements. It does not authorize modifying existing historical rows or snapshots.

DEC-0009-01 separately allows incomplete WORK drafts to be saved. Absence of a required publication field must remain an editable incomplete draft rather than silently acquiring a business choice or becoming unreadable. DEC-0009-04 requires temporary node-specific publication feedback, with no error state stored in AST/config/snapshot.

The policy text does not independently specify whether a newly created binding may have an explicit visible initial DIRECT choice, or whether users must click a choice each time. This source audit distinguishes explicit new-write initialization from a read-time fallback; it does not invent a new mandatory-click policy.

## Shared component — confirmed implementation gap

`gmp-platform/frontend/src/components/form-fill-settings/types.ts:26-34` defines optional `fillMode` and `fillMode(value) => value.fillMode ?? 'DIRECT'`. This helper is the frontend inference point. It never inspects `formProcessVersionId`, but it still changes missing mode into effective DIRECT. Unknown non-null JavaScript values are also returned unchecked; a runtime enum guard should recognize only DIRECT/PROCESS if the helper becomes a parser.

`FormFillSettings.tsx:23` reads the fallback. It has no mount effect that persists the apparent default. Therefore an unconfigured value can appear selected DIRECT while the parent state still has no mode. At lines 111-112 a click on the already selected DIRECT ToggleButton gives `next=null` in the exclusive group and is ignored. Clicking DIRECT does not repair this state. Switching PROCESS then DIRECT, or editing direct-mode permissions/actions, does write an explicit mode (`:106`, `:112`, `:129`). This is a real UI-facing distinction between selected presentation and persisted configuration.

Mode-dependent shared-component paths requiring careful handling if mode becomes undefined:

- `:32`: selected process query is enabled only in PROCESS; retain this.
- `:37-38`: current ternaries treat every non-DIRECT state as process settings. Undefined must not obtain a process graph or active PROCESS configuration by accident.
- `:148-155`: current DIRECT-tabs/else-process-summary branch will otherwise show a process heading for missing mode. Show an explicit unconfigured hint instead of either active settings panel.
- `:156-163`: DIRECT editors and PROCESS field-settings controls are already equality-gated; preserve policy/permission behavior.
- `:173-177`: permission-dialog save currently uses a DIRECT/else branch; absent mode must never write process fields or manufacture a default. A missing-mode path should not open/save this dialog.
- `:144-146`, `:164`: existing option/process/form query errors are shown distinctly; do not replace these with a generic mode error or claim all errors are mode-related.

`FormFillSettingsButton.tsx` contains two additional fallback writes:

- `:9-15`: FormFillModeLabel maps all non-PROCESS values to DIRECT wording/icon, so a missing setting is falsely described as configured DIRECT.
- `:25`: opening an undefined saved `value` creates `{fillMode:'DIRECT'}` in dialog draft. Opening `{}` gets displayed DIRECT through the helper. Opening a saved record is not a new-binding command.
- `:30-31`: Apply is enabled for missing mode and persists `fillMode(draft)` as DIRECT, even if the user made no mode selection. Fix this read/edit fallback together with the label/helper. Do not introduce a migration effect on mount.

## Real legal WORK UI path, no fabricated bad JSON

Router `src/router/index.tsx:123` mounts WorkTemplateEditor under production work templates.

New FORM creation commands in `WorkTemplateEditor.tsx`:

1. `addQuickNode` at `:2315`, node creation `:2338-2346`: non-CONDITION config is `{}`.
2. `addConditionBranchNode` at `:2370`, creation `:2431-2439`: non-CONDITION config is `{}`.
3. `addNode` at `:2775`, config `:2785`, node `:2794`: non-CONDITION config is `{}`.

`targetConfig` at `:2003` and `:2391` is geometry-only sizing input, not persisted creation config; do not count it as a separate binding creation path. No fourth FORM creation command or FORM-kind conversion command was found in this scoped source inspection.

Legal reproducible interaction to cover in actual browser:

1. Open a new/existing editable WORK draft and add a FORM node through a real command above.
2. Select its effective business form using the existing picker. `:4033-4042` updates only `formTemplateVersionId` and `formTemplateName`; `updateSelectedNode :2930-2948` merges the config and marks dirty/history. It does not create `fillMode`.
3. Shared FormFillSettings is rendered at `:4135` with that config. It visibly shows DIRECT because of the helper, while actual node config lacks the mode. Even clicking the already selected DIRECT is ignored as described above.
4. `saveDraft :4720-4724` obtains the real graph and calls draft save without publication validation (this is correct per DEC-0009). `saveGraph :4508-4520` passes `persistentFlowGraph` to the API; `saveTransientDraft` is the equivalent first-save path.
5. `persistentFlowGraph :366-377` strips only temporary React Flow selected/dragging flags; it does not infer the mode. API `src/api/workflow-work.ts:43-51` PUTs graph data unchanged. The known backend saveGraph fallback then writes DIRECT. This is a real legal new-UI configuration gap, not proof derived only from malformed injected JSON.

Read/reopen path: editor initial nodes at `:1695-1699` use `normalizeFlowGraph :654-705`. FORM config is shallow-copied from stored config at `:701-704`; it does not initialize fillMode. Any change here would be a read-time repair and should be avoided. Preserve missing mode as missing for editable drafts.

Publication: `validateFlowGraphForPublish :454-481` currently checks PROCESS missing reference only when the fallback returns PROCESS, and checks effective form version. It does not require an explicit mode. `confirm :4749-4761` invokes this validator, then either `publish :4551-4562` (save graph then POST publication) or `publishTransientDraft :4605-4613` (create, save, publish). A FORM with valid form reference but missing mode can pass frontend validation; the server must be authoritative for direct API publication as well.

Caption `nodeCaption :776-781` also uses DIRECT/else with fallback; show unconfigured mode distinctly instead of silently DIRECT or '待选流程'. Existing process-reference freshness operations `:1829` and `:2680` are explicitly PROCESS-only; retain that isolation.

## Publication feedback boundary

`validateGraphForPublish :2580-2587` stores per-node errors in React state. Nodes consume `validationErrors` at `:1079`, red border/shadow at `:1176-1184`, and message at `:1477-1493`. Reuse this existing temporary feedback path for a mode-required message, preferably without persisting any `validationError` field into nodes.

`refreshPublishValidation :2590-2611` revalidates after backend errors. `handlePublishError :4542-4548` currently classifies every error whose message contains '表单' as a form-version reference problem. If the new server message says '请选择表单填报方式', a draft with a valid form but missing mode yields `formReferenceError=false` and calls `markFormReferenceErrors`, incorrectly replacing/augmenting errors with '请选择当前生效的表单版本'. Avoid this misleading fallback for new mode errors; keep real server-side form version invalidation handling intact.

The business form picker field error at `:3759-3768` deliberately renders only when no selected form exists; a valid form's missing mode error should appear beside the fill-mode selector or through existing node feedback, not mark the unrelated version selection invalid.

## Product/product-family operation paths

Shared full editor `ProductProcessVersionEditorDialog.tsx`:

- `toOperationDrafts :151-178`, specifically `:164-169`, copies saved `fillSettings` unchanged. No read-time default.
- `addForms :984-989` initializes only **newly added** bindings with `fillSettings:{fillMode:'DIRECT'}`. This is an actual explicit stored field at a write command, distinguishable from missing-mode inference.
- Per-binding settings button at `:1131-1132` replaces just that binding's settings after Apply; label at `:1135-1137` currently lies about absent settings due to shared FormFillModeLabel.
- `toPayload :181-200`, especially `:198`, spreads each binding and changes sort order only; no frontend serialization inference.
- `submit :1011-1032` currently validates version duplication, dates and PDF ranges; it does not validate mode. Backend must prevent missing/invalid operation settings as appropriate, and shared UI must allow fixing old missing settings without manufacturing DIRECT on opening.

Product list entry: `ProductModelingPage.tsx:404` renders this editor; saveVersionMutation `:288-291` calls `updateProductProcessVersion` or `createProductProcessVersion`. API `src/api/product-modeling.ts:194-198` sends body unchanged.

Product-family entry: `ProductFamilyModelingPage.tsx:936-957` renders the same editor with owner-specific option loading; mutation `:497-516` calls `updateProcessOwnerVersion`/`createProcessOwnerVersion` for PRODUCT_FAMILY. This is not a separate fill-settings implementation; test both owner HTTP wiring while reusing shared UI behavior.

There is also an active product workspace route (`router/index.tsx:130`) using `ProductModelingWorkspacePage.tsx`, not the full editor for operation editing:

- `toOperationDrafts :199-215`, specifically `:212`, preserves absent settings from saved bindings.
- Directory form picker `:792-795` initializes newly added bindings to explicit DIRECT, as the full editor does.
- Settings button `:813` and label `:818` reuse the shared components.
- `toPayload :158-178`, especially `:176`, preserves bindings unchanged.
- `saveOperationsMutation :377-383` sends this payload through updateProductProcessVersion. `saveVersionMutation :356-364` sends version-only data without operationBindings, so it must not be mistaken for a new form-binding creation command or force rewriting existing operation bindings just to validate version metadata.

Original backend anchor (secondary for this frontend-helper scope, not a full backend review): ProductProcessOwnerService uses `fillSettingsService.serialize` on supplied form bindings at `:332` and parses saved settings in DTO at `:391`. Removing serialization defaults must account for both actual operation editors and existing copied bindings; no frontend/read-time normalization should conceal failures.

## Existing test evidence limits

Source inventory found no frontend test for the shared fillMode helper, no actual FormFillSettings mode-selection browser scenario, and no actual WORK editor mode-required publication browser scenario. `test-work-editor-default-version.mjs` tests default **workflow version selection**, not fill mode. `test-permission-summary.mjs` covers summary formatting, not mode persistence.

Existing `test-product-process-reference-browser.mjs:11-12,32-45` mounts the real full product editor, but its fixtures at `:75-85` have empty formTemplates/operations in the basic cases, and its scenarios focus route/DHR references and graph loading. These provide a useful app harness pattern; they do not prove mode behavior or product-family owner API wiring. The harness currently rejects non-GET calls (`:93`) and captures onSubmit, so real backend persistence/E2E must be reported separately from such a controlled browser boundary.

Two existing backend tests encode the obsolete inference explicitly and need semantic updates, not retained as compatibility acceptance:

- FormFillSettingsServiceTest `:43-46`: `serialize(null,1L)` expected DIRECT; misleading name 'savesExplicitDefault'. Also tests dormant process ref not interpreted PROCESS.
- WorkTemplateControllerTest `:738-753`: input lacks mode but test expects stored DIRECT; again misleading name 'PersistsExplicitDirectMode'.

Do not treat passing these old assertions as business policy, or merely rename them while keeping fallback behavior.

## Recommended minimal integration and meaningful regressions

These are engineering recommendations, not implementation/QA completion claims:

1. Make shared mode reading return only an actually present valid DIRECT/PROCESS choice. Do not change normalizeFlowGraph/toOperationDrafts into migrations. The value type can remain optional for incomplete drafts; a required TS type alone would not validate stored/API values.
2. Display missing mode explicitly in FormFillSettings, FormFillModeLabel and nodeCaption. Keep both toggles unselected for missing mode so clicking DIRECT immediately emits a real explicit write. Do not mount DIRECT or PROCESS configuration editors until a valid choice exists.
3. Opening an existing missing-settings operation binding should clone an empty draft; Apply stays disabled until a valid choice (and PROCESS reference) exists. It must not fill the mode merely on open/read/Apply. Keep already explicit newly added DIRECT bindings unchanged unless the primary reviewer finds separate user-confirmed evidence forbidding a new-binding default.
4. Work draft save should preserve missing mode and remain readable/reopenable. Publication validator and server publication must require a valid explicit mode for every FORM; PROCESS additionally requires a published process. Updating selected DIRECT must not activate dormant PROCESS configuration, nor vice versa.
5. Use existing transient node error mechanism and isolate mode errors from the reference refresh fallback. Do not persist red-border state to AST or freeze validation presentation in snapshots.
6. Unit tests should cover helper undefined/null/missing/unknown versus explicit modes; draft roundtrip does not add DIRECT; known present mode survives read/write unchanged; dormant process ref alone does not select mode; settings-button open/cancel has no write; Apply requires actual selection. If frontend UI chooses any new-write default, test it only at that creator, separately from missing saved read behavior.
7. Actual WORK browser should exercise a legitimate add FORM command, select a legal form, save incomplete draft and reopen, attempt publication and observe only the relevant node error, then choose DIRECT and verify the next draft/publish payload contains DIRECT. Include PROCESS reference requirement and mode switching with prior direct settings isolated. Test quick-add/branch-add factories by pure creator assertions or additional actual interaction as risk dictates.
8. Actual product and product-family UI should open existing missing settings without auto-write, explicitly choose mode, apply, and inspect saved payload. Also verify new binding initial DIRECT persists through save/reopen if retained. Cover the active product workspace settings entry or prove shared component plus its actual owner wiring; do not silently omit that third screen.
9. Focused server tests must independently reject publication and new snapshot/active runtime execution missing mode, while allowing/readback incomplete draft. A frozen valid execution must still consume its frozen valid settings with permissions/signatures, and existing snapshot content must not be rewritten. These backend requirements belong to the primary reviewer/backend helper for full caller review; frontend passing alone cannot prove them.

No new business question is established by the source evidence in this report. The only policy caution is to avoid equating 'no missing-mode fallback' with an unconfirmed new requirement to click the already explicit new-binding DIRECT choice. Missing saved configurations and new-write initialization are separate cases.
