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

mustInclude(pageContent, "DhrTemplateWorkspaceDialog", 'batch-record template page should provide an isolated DHR composition workspace');
mustInclude(pageContent, "setDhrWorkspaceRow", 'design action should open the DHR workspace for the selected template');
mustInclude(apiContent, 'getDhrTemplateWorkspace', 'frontend should load DHR versions from the dedicated API');
mustInclude(apiContent, 'publishDhrTemplateVersion', 'frontend should publish a frozen DHR directory snapshot');
mustInclude(packageJson.scripts.dev, '--config vite.config.ts', 'development server should load the source Vite proxy configuration');
mustNotInclude(workspaceContent, 'variant="filled"', 'workspace feedback must use the system Alert appearance');

const versionRefreshBeforeSelection = workspaceContent.indexOf('await invalidateWorkspace();\n      setSelectedVersionId(response.data.data.id);');
if (versionRefreshBeforeSelection === -1) {
  failures.push('new DHR version selection must wait for the refreshed version list');
}

if (failures.length) {
  console.error('verify-dhr-template-workspace failed');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('verify-dhr-template-workspace passed');
