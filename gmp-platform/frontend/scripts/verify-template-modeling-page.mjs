import { readFileSync } from 'node:fs';

const pageContent = readFileSync(new URL('../src/pages/master-data/TemplateModelingPage.tsx', import.meta.url), 'utf8');
const packageContent = readFileSync(new URL('../package.json', import.meta.url), 'utf8');
const standardContent = readFileSync(new URL('../../../docs/design-audit/organization-management-ui-standard.md', import.meta.url), 'utf8');
const failures = [];

function mustInclude(content, token, reason) {
  if (!content.includes(token)) failures.push(`missing ${JSON.stringify(token)} (${reason})`);
}

function mustNotInclude(content, token, reason) {
  if (content.includes(token)) failures.push(`unexpected ${JSON.stringify(token)} (${reason})`);
}

function mustMatch(content, pattern, reason) {
  if (!pattern.test(content)) failures.push(`missing pattern ${pattern} (${reason})`);
}

const formColumnsMatch = pageContent.match(/const formTemplateColumns: TemplateColumn\[] = \[([\s\S]*?)\];/);
const formColumns = formColumnsMatch?.[1] ?? '';

mustInclude(packageContent, '"verify:template-modeling": "node scripts/verify-template-modeling-page.mjs"', 'template modeling verification should be runnable from npm scripts');
mustInclude(standardContent, '主子表列表的父行点击默认用于展开或收起子数据行；父行中承载详情入口的核心业务名称列必须使用蓝色可点击文字样式，点击后打开当前父行详情抽屉，并阻止事件冒泡，避免同时触发展开或收起。', 'UI standard should document parent-row expand and name-link drawer behavior for master-detail tables');
mustInclude(formColumns, "{ id: 'currentVersion', label: '版本数量'", 'form-template parent table should label currentVersion as version count');
mustNotInclude(formColumns, "id: 'effectiveFrom'", 'form-template parent table should not expose effective time');
mustNotInclude(formColumns, "id: 'effectiveTo'", 'form-template parent table should not expose expiry time');
mustInclude(pageContent, 'function getTemplateVersionCount(row: TemplateModelingRecord)', 'form-template parent rows should derive a version count');
mustInclude(pageContent, "if (columnId === 'currentVersion') return String(getTemplateVersionCount(row));", 'form-template parent table should render version count');
mustInclude(pageContent, 'const shouldSubmitInitialVersionFields = !editingRow && !creatingVersionFrom;', 'initial version fields should be submitted only while creating a template');
mustInclude(pageContent, 'const shouldRenderVersionSection = !editingRow;', 'parent edit should hide version information section');
mustMatch(pageContent, /versionDescription: \(shouldSubmitVersionFields \|\| shouldSubmitInitialVersionFields\) \? form\.versionDescription\.trim\(\) \|\| null : undefined,[\s\S]*version: shouldSubmitVersionFields \? form\.version\.trim\(\) : undefined,[\s\S]*effectiveFrom: \(shouldSubmitVersionFields \|\| shouldSubmitInitialVersionFields\) \? effectiveFrom \|\| null : undefined,[\s\S]*effectiveTo: \(shouldSubmitVersionFields \|\| shouldSubmitInitialVersionFields\) \? effectiveTo \|\| null : undefined,/, 'parent edit payload should omit hidden version date fields while preserving each template type\'s initial-version behavior');
mustInclude(pageContent, "['版本数量', drawerRow ? getTemplateVersionCount(drawerRow) : '-'],", 'parent drawer should align with parent version-count semantics');
mustNotInclude(pageContent, "['当前版本', drawerRow?.currentVersion?.version]", 'parent drawer should not show current version');
mustNotInclude(pageContent, "['生效时间', formatDateTime(drawerRow?.currentVersion?.effectiveFrom)]", 'parent drawer should not show parent effective time');
mustNotInclude(pageContent, "['失效时间', formatDateTime(drawerRow?.currentVersion?.effectiveTo)]", 'parent drawer should not show parent expiry time');
mustInclude(pageContent, 'data-template-name-link', 'form-template parent row name should expose a dedicated clickable drawer trigger');
mustInclude(pageContent, "onClick={(event) => {\n        event.stopPropagation();\n        openTemplateDrawer(row);\n      }}", 'form-template parent row name click should open the drawer without toggling the row');
mustInclude(pageContent, '<TableRow key={row.id} hover onClick={() => expandTemplateGroup(row.id)}', 'form-template parent row click should expand or collapse child rows');
mustNotInclude(pageContent, '<TableRow key={row.id} hover onClick={() => openTemplateDrawer(row)} sx={{ cursor: \'pointer\' }}>\n          {visibleColumns.map((column, index)', 'form-template parent row click should not open the drawer');
mustInclude(pageContent, "const shouldFallbackToParentCreateAudit = pageKey === 'batchRecordTemplates'", 'initial DHR versions should identify whether a legacy audit fallback is applicable');
mustInclude(pageContent, "drawerVersionRow?.version === 'V1.0'", 'only the initial DHR version should use the parent audit fallback');
mustInclude(pageContent, "action: 'CREATE'", 'legacy initial-version fallback should only display the actual parent creation audit');
mustInclude(pageContent, 'versionAuditEvents.length > 0', 'version-specific audit events should take precedence over the legacy fallback');
mustInclude(pageContent, 'auditSnapshotFields', 'structured audit fields should be identified before rendering');
mustInclude(pageContent, '审计快照', 'structured audit content should be viewable in a dedicated dialog');
mustInclude(pageContent, 'DataObjectOutlined', 'structured audit content should use a compact snapshot-view action');
mustInclude(pageContent, "directoryCount: '目录数'", 'DHR version audit fields should not expose raw directoryCount keys');
mustInclude(pageContent, "evidenceCount: '表单证据数'", 'DHR version audit fields should not expose raw evidenceCount keys');
mustInclude(pageContent, "isCurrent: '当前生效版本'", 'DHR version audit fields should not expose raw isCurrent keys');
mustInclude(pageContent, 'function formatModelingChangeValue(value: unknown): string', 'DHR modeling changes should render a human-readable audit summary');
mustInclude(pageContent, "field === 'modelingChange'", 'DHR modeling-change audits should not be hidden behind an opaque snapshot label');
mustInclude(pageContent, 'event.actionLabel || getAuditActionLabel(event.action)', 'audit rows should use the same generic action labels as other data-audit drawers');
mustNotInclude(pageContent, 'event.functionName || event.actionLabel', 'audit row summaries should not require per-function action labels');
mustInclude(pageContent, '查看${field.label}详情', 'structured audit rows should expose an explicit detail action');
mustInclude(pageContent, 'const TEMPLATE_ACTION_COLUMN_WIDTH = 160;', 'the action column must fit all batch-record version operations');
mustInclude(pageContent, 'data-template-version-link', 'child versions should provide an explicit detail and audit entry point');
mustInclude(pageContent, '查看版本详情及审计', 'the child-version detail entry should name its audit behavior');

if (failures.length) {
  console.error('verify-template-modeling-page failed');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('verify-template-modeling-page passed');
