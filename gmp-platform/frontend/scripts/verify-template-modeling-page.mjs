import { readFileSync } from 'node:fs';

const pageContent = readFileSync(new URL('../src/pages/master-data/TemplateModelingPage.tsx', import.meta.url), 'utf8');
const packageContent = readFileSync(new URL('../package.json', import.meta.url), 'utf8');
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
mustInclude(formColumns, "{ id: 'currentVersion', label: '版本数量'", 'form-template parent table should label currentVersion as version count');
mustNotInclude(formColumns, "id: 'effectiveFrom'", 'form-template parent table should not expose effective time');
mustNotInclude(formColumns, "id: 'effectiveTo'", 'form-template parent table should not expose expiry time');
mustInclude(pageContent, 'function getTemplateVersionCount(row: TemplateModelingRecord)', 'form-template parent rows should derive a version count');
mustInclude(pageContent, "if (columnId === 'currentVersion') return String(getTemplateVersionCount(row));", 'form-template parent table should render version count');
mustInclude(pageContent, "const shouldSubmitVersionFields = pageKey === 'formTemplates' && !editingRow;", 'parent edit should not submit hidden version fields');
mustInclude(pageContent, "const shouldRenderVersionSection = pageKey === 'formTemplates' && !editingRow;", 'parent edit should hide version information section');
mustMatch(pageContent, /versionDescription: shouldSubmitVersionFields \? form\.versionDescription\.trim\(\) \|\| null : undefined,[\s\S]*version: shouldSubmitVersionFields \? form\.version\.trim\(\) : undefined,[\s\S]*effectiveFrom: shouldSubmitVersionFields \? effectiveFrom \|\| null : undefined,[\s\S]*effectiveTo: shouldSubmitVersionFields \? effectiveTo \|\| null : undefined,/, 'parent edit payload should omit version date fields');
mustInclude(pageContent, "['版本数量', drawerRow ? getTemplateVersionCount(drawerRow) : '-'],", 'parent drawer should align with parent version-count semantics');
mustNotInclude(pageContent, "['当前版本', drawerRow?.currentVersion?.version]", 'parent drawer should not show current version');
mustNotInclude(pageContent, "['生效时间', formatDateTime(drawerRow?.currentVersion?.effectiveFrom)]", 'parent drawer should not show parent effective time');
mustNotInclude(pageContent, "['失效时间', formatDateTime(drawerRow?.currentVersion?.effectiveTo)]", 'parent drawer should not show parent expiry time');

if (failures.length) {
  console.error('verify-template-modeling-page failed');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('verify-template-modeling-page passed');
