import { readFileSync } from 'node:fs';

const pageContent = readFileSync(new URL('../src/pages/master-data/TemplateModelingPage.tsx', import.meta.url), 'utf8');
const workspaceContent = readFileSync(new URL('../src/pages/master-data/DhrTemplateWorkspaceDialog.tsx', import.meta.url), 'utf8');
const apiContent = readFileSync(new URL('../src/api/template-modeling.ts', import.meta.url), 'utf8');
const packageJson = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
const failures = [];

function mustInclude(content, token, reason) {
  if (!content.includes(token)) failures.push(`missing ${JSON.stringify(token)} (${reason})`);
}

function mustNotInclude(content, token, reason) {
  if (content.includes(token)) failures.push(`unexpected ${JSON.stringify(token)} (${reason})`);
}

function mustIncludeIn(content, startToken, endToken, token, reason) {
  const start = content.indexOf(startToken);
  const end = content.indexOf(endToken, start + startToken.length);
  if (start === -1 || end === -1) {
    failures.push(`missing bounded section ${JSON.stringify(startToken)} -> ${JSON.stringify(endToken)} (${reason})`);
    return;
  }
  const section = content.slice(start, end);
  if (!section.includes(token)) failures.push(`missing ${JSON.stringify(token)} in bounded section (${reason})`);
}

function mustNotIncludeIn(content, startToken, endToken, token, reason) {
  const start = content.indexOf(startToken);
  const end = content.indexOf(endToken, start + startToken.length);
  if (start === -1 || end === -1) return;
  const section = content.slice(start, end);
  if (section.includes(token)) failures.push(`unexpected ${JSON.stringify(token)} in bounded section (${reason})`);
}

mustInclude(pageContent, "DhrTemplateWorkspaceDialog", 'batch-record template page should provide an isolated DHR composition workspace');
mustInclude(pageContent, "setDhrWorkspaceRow", 'design action should open the DHR workspace for the selected template');
mustInclude(pageContent, "{ id: 'currentVersion', label: '版本数量'", 'batch-record template parent rows should show their version count');
mustInclude(pageContent, "const dhrTemplateVersionColumns", 'batch-record template versions should use DHR-specific child columns');
mustInclude(pageContent, 'openDhrVersionDialog(row, null)', 'main-row DHR version creation should open a version dialog for an empty composition');
mustInclude(pageContent, 'openDhrVersionDialog(row, version)', 'DHR version rows should open a version copy dialog for the selected composition');
mustInclude(pageContent, 'saveDhrVersionMutation', 'DHR version creation should save from the dialog without opening the designer');
mustInclude(pageContent, 'label="生效时间"', 'DHR version dialog should capture its effective time');
mustInclude(pageContent, 'label="失效时间"', 'DHR version dialog should capture its expiry time');
mustInclude(pageContent, 'shouldSubmitInitialVersionFields', 'new batch-record templates should submit their initial version fields with the parent template');
mustInclude(pageContent, 'title="版本信息"', 'new batch-record templates should expose version details in the create dialog');
mustInclude(pageContent, 'label="版本状态" value="草稿"', 'the initial batch-record version status should be fixed as a draft');
mustInclude(pageContent, '<TextField required fullWidth size="small" label="版本" value={form.version}', 'the initial batch-record version should be visible and editable');
mustNotInclude(pageContent, 'InputProps={isCreatingDhrTemplate ? { readOnly: true } : undefined}', 'the initial batch-record version must support user customization');
mustInclude(pageContent, 'title="复制版本"', 'DHR version rows should expose a copy action');
mustNotInclude(pageContent, 'setDhrWorkspaceRow({ row, initialVersionId: row.currentVersion?.id })', 'DHR main rows must not expose a design action');
mustInclude(pageContent, "initialVersionId={dhrWorkspaceRow?.initialVersionId}", 'a version-row design action should open that exact DHR version');
mustInclude(apiContent, 'getDhrTemplateWorkspace', 'frontend should load DHR versions from the dedicated API');
mustInclude(apiContent, 'directoryCount?: number', 'batch-record child rows should receive directory counts');
mustInclude(apiContent, 'evidenceCount?: number', 'batch-record child rows should receive evidence counts');
mustInclude(packageJson.scripts.dev, '--config vite.config.ts', 'development server should load the source Vite proxy configuration');
mustNotInclude(workspaceContent, 'variant="filled"', 'workspace feedback must use the system Alert appearance');

mustInclude(workspaceContent, 'if (versions.length === 0) return;', 'an explicitly selected DHR version must survive the initial workspace query');
mustInclude(workspaceContent, 'DhrContentTree', 'DHR workspace should present directories and referenced forms in one tree');
mustInclude(workspaceContent, 'FormCanvasPreview', 'selecting a referenced form should render its read-only preview');
mustInclude(workspaceContent, 'aria-label="引用表单"', 'referencing a form should be a directory hover action');
mustInclude(workspaceContent, 'onAddForm={openAddEvidence}', 'the directory action should select its own directory before opening form reference');
mustNotInclude(workspaceContent, '<Button size="small" variant="contained" startIcon={<NoteAddOutlined />}', 'form reference should not be duplicated as a right-pane text button');
mustInclude(workspaceContent, '批量引用表单', 'form reference should support the bulk-reference workspace');
mustInclude(workspaceContent, 'formCategory', 'form reference should filter by category');
mustInclude(workspaceContent, 'expandedFormTemplateIds', 'form reference should show the parent-child RDO tree');
mustInclude(workspaceContent, 'selectedFormReferences', 'form reference should summarize selected template versions in a dedicated panel');
mustInclude(workspaceContent, '确认引用', 'form reference should stage multiple selections before confirmation');
mustNotInclude(workspaceContent, 'const [selectedFormOption,', 'form reference must not retain the obsolete single-choice state');
mustInclude(workspaceContent, 'referenceableVersions.length !== 1', 'parent form rows should not imply a default version when multiple versions are active');
mustInclude(workspaceContent, '请展开选择具体版本', 'parent form rows should prompt users to choose an explicit version');
mustInclude(workspaceContent, 'selected.templateId === templateOption.templateId', 'selecting one form version should replace another version of the same parent template');
mustInclude(workspaceContent, '同一目录不能重复引用同一表单', 'workspace should enforce directory-level form uniqueness before saving');
mustNotInclude(workspaceContent, 'version.isCurrent', 'form reference should not expose a current/default version concept');
mustInclude(workspaceContent, 'basicInfoExpanded', 'workspace version metadata should support expanding more details');
mustInclude(workspaceContent, '基本信息', 'workspace metadata should provide a visible basic-information toggle');
mustIncludeIn(workspaceContent, '当前版本 {selectedVersion?.version ?? \'-\'}', '</Stack>', 'versionStatusLabel(selectedVersion?.status)', 'current version label should include a visible status tag');
mustIncludeIn(workspaceContent, '<Box sx={{ px: 2, py: 1.5', '<Collapse in={basicInfoExpanded}', '模板名称', 'collapsed metadata should prioritize template name');
mustIncludeIn(workspaceContent, '<Box sx={{ px: 2, py: 1.5', '<Collapse in={basicInfoExpanded}', '版本编码', 'collapsed metadata should prioritize the selected version code');
mustIncludeIn(workspaceContent, '<Box sx={{ px: 2, py: 1.5', '<Collapse in={basicInfoExpanded}', '所属分类', 'collapsed metadata should prioritize template category');
mustNotIncludeIn(workspaceContent, '<Box sx={{ px: 2, py: 1.5', '<Collapse in={basicInfoExpanded}', '版本状态', 'collapsed metadata should not spend primary space on version details');
mustNotIncludeIn(workspaceContent, '<Box sx={{ px: 2, py: 1.5', '<Collapse in={basicInfoExpanded}', '生效时间', 'collapsed metadata should not spend primary space on version details');
mustNotIncludeIn(workspaceContent, '<Box sx={{ px: 2, py: 1.5', '<Collapse in={basicInfoExpanded}', '失效时间', 'collapsed metadata should not spend primary space on version details');
mustIncludeIn(workspaceContent, '<Collapse in={basicInfoExpanded}', 'compositionQuery.isLoading', '版本状态', 'expanded metadata should keep version status available');
mustIncludeIn(workspaceContent, '<Collapse in={basicInfoExpanded}', 'compositionQuery.isLoading', '生效时间', 'expanded metadata should keep effective time available');
mustIncludeIn(workspaceContent, '<Collapse in={basicInfoExpanded}', 'compositionQuery.isLoading', '失效时间', 'expanded metadata should keep expiry time available');
mustIncludeIn(workspaceContent, '<Collapse in={basicInfoExpanded}', 'compositionQuery.isLoading', '线下版本', 'expanded metadata should keep offline version available');
mustInclude(workspaceContent, 'directorySearch', 'workspace should keep a directory-tree search keyword');
mustInclude(workspaceContent, 'filterDirectoryTree', 'workspace directory search should retain matching tree branches');
mustInclude(workspaceContent, '搜索目录或表单', 'workspace should provide a visible tree search input');
mustInclude(workspaceContent, '暂无匹配的目录或表单', 'workspace should show an empty search state');
mustInclude(workspaceContent, 'compositionQuery.dataUpdatedAt', 'saved composition refreshes must distinguish fresh server data from stale cache data');
mustInclude(workspaceContent, 'appliedCompositionRevision', 'saved composition should only initialize from the latest query revision');
mustInclude(workspaceContent, 'saveCompositionMutation', 'workspace changes should be staged and saved as one explicit action');
mustInclude(workspaceContent, '放弃未保存的修改', 'closing a modified workspace should confirm discarding changes');
mustInclude(workspaceContent, 'stageEvidence', 'form references should be staged inside their selected directory');
mustInclude(apiContent, 'getFormTemplateVersion', 'DHR form preview should load the referenced form version');
mustInclude(apiContent, 'versions: DhrFormTemplateVersionOption[]', 'the reference API should expose form-template child versions');
mustNotInclude(workspaceContent, '复制为新版本', 'version copy belongs on the batch-record template page, not the designer');
mustNotInclude(workspaceContent, '发布版本', 'version publication belongs on the batch-record template page, not the designer');
mustNotInclude(workspaceContent, '设计版本', 'a designer opens one specific version and should not switch versions in place');
mustNotInclude(workspaceContent, 'evidenceRequired', 'referencing a form must not expose a required-evidence option');
mustNotInclude(workspaceContent, '作为必填证据', 'referencing a form must not expose a required-evidence control');
mustInclude(workspaceContent, '编辑表单', 'referenced form nodes should provide a DHR-specific edit action');
mustInclude(workspaceContent, 'aria-label="编辑表单"', 'form editing should be a direct tree hover action');
mustNotInclude(workspaceContent, 'formActionMenu', 'form editing should not require a popover menu');
mustNotInclude(workspaceContent, 'MoreVertRounded', 'form editing should use the same direct action pattern as directories');
mustInclude(workspaceContent, 'DHR 内表单名称', 'editing a referenced form should only change its name within the DHR');
mustInclude(workspaceContent, 'formDisplayName', 'the DHR-specific form name should be used in the tree and preview');
mustInclude(workspaceContent, 'updateDhrEvidenceItem', 'saving a DHR composition should persist edited form names');
mustInclude(workspaceContent, '表单编码', 'referenced-form edit details should label the source form code separately');
mustInclude(workspaceContent, 'editEvidenceTarget?.formCode ?? \'-\'', 'referenced-form edit details should render the source form code in its own field');
mustNotInclude(workspaceContent, '`${editEvidenceTarget.formCode} · ${editEvidenceTarget.formVersion}`', 'referenced-form edit details should not combine form code and version under one label');
mustInclude(workspaceContent, '<Dialog open={Boolean(editEvidenceTarget)} onClose={() => setEditEvidenceTarget(null)} fullWidth maxWidth="sm">', 'referenced-form edit dialog should provide enough horizontal room for the read-only metadata');
mustInclude(workspaceContent, "gridTemplateColumns: 'minmax(0, 1.4fr) repeat(2, minmax(0, 1fr))'", 'referenced-form metadata should be presented as a horizontal three-column summary');
mustInclude(apiContent, 'displayName?: string | null', 'DHR evidence records should expose an optional local display name');

if (failures.length) {
  console.error('verify-dhr-template-workspace failed');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('verify-dhr-template-workspace passed');
