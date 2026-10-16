import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import vm from 'node:vm';
import ts from 'typescript';

function declarations(path, names) {
  const text = readFileSync(new URL(path, import.meta.url), 'utf8');
  const source = ts.createSourceFile(path, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const found = new Map();
  for (const node of source.statements) {
    if (ts.isFunctionDeclaration(node) && names.includes(node.name?.text)) found.set(node.name.text, node.getText(source));
    if (ts.isVariableStatement(node)) {
      for (const declaration of node.declarationList.declarations) {
        if (names.includes(declaration.name.getText(source))) found.set(declaration.name.getText(source), `const ${declaration.getText(source)};`);
      }
    }
  }
  for (const name of names) assert.ok(found.has(name), `missing actual declaration: ${name}`);
  return names.map(name => found.get(name)).join('\n');
}

// Execute the app's route resolver and report registry, without bootstrapping React or auth.
const code = ts.transpileModule([
  declarations('../src/utils/menuManagement.ts', ['PROJECTION_REPORT_PAGES', 'isProjectionReportPath']),
  declarations('../src/components/shared/AppLayout.tsx', ['PERSONAL_SETTINGS_ROUTE', 'isPathSegmentMatch', 'getModuleIdByPath']),
  '({ pages: PROJECTION_REPORT_PAGES, resolve: getModuleIdByPath });',
].join('\n'), { compilerOptions: { target: ts.ScriptTarget.ES2022 } }).outputText;
const { pages, resolve } = vm.runInNewContext(code);

for (const page of pages) {
  test(`${page.label}: registered report belongs to the records module`, () => {
    assert.equal(resolve(page.path), 'records');
  });
}

test('legacy report entry belongs to records before redirecting to form trace', () => {
  assert.equal(resolve('/reports/form-projections'), 'records');
});

test('existing non-report module routes keep their ownership', () => {
  for (const [path, module] of [
    ['/', 'home'], ['/account/settings', 'home'],
    ['/master-data/products/1/modeling', 'data'], ['/production/execution', 'production'],
    ['/workflow/form-processes/1', 'production'], ['/form-management/list', 'records'],
    ['/dhr-management/list', 'records'], ['/system/form-lookup-items', 'system'],
  ]) assert.equal(resolve(path), module);
});

test('unknown paths and similar prefixes do not claim another module', () => {
  for (const path of ['/reports/form-trace-other', '/reports/unknown', '/production-other', '/form-management-other']) {
    assert.equal(resolve(path), 'home');
  }
});
