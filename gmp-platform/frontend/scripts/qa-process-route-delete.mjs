import { readFileSync } from 'node:fs';

const pageContent = readFileSync(new URL('../src/pages/master-data/ProcessModelingPage.tsx', import.meta.url), 'utf8');
const failures = [];

function mustInclude(content, token, reason) {
  if (!content.includes(token)) failures.push(`missing ${JSON.stringify(token)} (${reason})`);
}

function mustNotInclude(content, token, reason) {
  if (content.includes(token)) failures.push(`unexpected ${JSON.stringify(token)} (${reason})`);
}

const exactRouteId = '344382032089759744';
const browserNumber = Number(exactRouteId);
const browserRouteId = String(browserNumber);

if (browserRouteId === exactRouteId) {
  failures.push('expected browser Number conversion to lose precision for Snowflake route ids');
}

mustInclude(pageContent, 'const resolveDeleteRowId = async (row: ProcessModelingRecord) => {', 'route delete should resolve the latest id before deletion');
mustInclude(pageContent, "if (pageKey === 'routes' && row.code) {", 'route delete should resolve by route code for any stale id shape');
mustInclude(pageContent, "getProcessRoutes({ page: 1, size: 1, keyword: row.code })", 'route delete should reload the route by code before deleting');
mustInclude(pageContent, "return latestRoute?.id ?? row.id;", 'route delete should use the reloaded backend id when available');
mustInclude(pageContent, 'return config.remove(await resolveDeleteRowId(row));', 'delete mutation should use the resolved id');
mustNotInclude(pageContent, "pageKey === 'routes' && typeof row.id === 'number' && row.code", 'route delete should not only handle numeric stale ids');

if (failures.length > 0) {
  console.error('Process route delete QA failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('Process route delete QA passed.');
