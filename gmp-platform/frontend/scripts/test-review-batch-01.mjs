import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import { test } from 'node:test';
import vm from 'node:vm';
import { build } from 'esbuild';
import ts from 'typescript';

const root = resolve(import.meta.dirname, '..');
const require = createRequire(import.meta.url);
const plain = (value) => JSON.parse(JSON.stringify(value));
const read = (path) => readFileSync(resolve(root, path), 'utf8');

async function load(source, globals = {}) {
  const output = await build({
    absWorkingDir: root,
    stdin: { contents: source, resolveDir: root, loader: 'ts' },
    bundle: true, write: false, platform: 'node', format: 'cjs', packages: 'external',
    plugins: [{ name: 'no-ui-notifications', setup(plugin) {
      plugin.onResolve({ filter: /deletionProtection$/ }, () => ({ path: 'notification', namespace: 'test' }));
      plugin.onLoad({ filter: /.*/, namespace: 'test' }, () => ({ contents: 'export const showDeletionProtection = () => {};' }));
    } }],
  });
  const module = { exports: {} };
  vm.runInNewContext(output.outputFiles[0].text, { module, exports: module.exports, require, console, ...globals });
  return module.exports;
}

function authEnvironment() {
  const storage = new Map();
  const localStorage = {
    getItem: (key) => storage.get(key) ?? null,
    setItem: (key, value) => storage.set(key, String(value)),
    removeItem: (key) => storage.delete(key),
  };
  const window = { location: { href: '' } };
  return { storage, localStorage, window };
}

async function loadAuth() {
  const env = authEnvironment();
  const api = await load(`
    export * from './src/utils/queryClient';
    export * from './src/utils/sessionPolicy';
    export { useAuthStore } from './src/stores/authStore';
    export { default as client } from './src/api/client';
  `, env);
  return { ...env, ...api };
}

// Execute an actual page callback, not a separately reimplemented test function.
function pageCallback(path, name, globals) {
  const source = ts.createSourceFile(path, read(path), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const matches = [];
  function visit(node) {
    if (ts.isVariableDeclaration(node) && node.name.getText(source) === name && node.initializer) matches.push(node.initializer.getText(source));
    ts.forEachChild(node, visit);
  }
  visit(source);
  assert.equal(matches.length, 1, `expected exactly one ${name} callback in ${path}`);
  const code = ts.transpileModule(`const callback = ${matches[0]}; callback;`, {
    compilerOptions: { target: ts.ScriptTarget.ES2022 },
  }).outputText;
  return vm.runInNewContext(code, globals);
}

test('F-001: logout removes queries, mutations and authentication storage', async () => {
  const auth = await loadAuth();
  auth.queryClient.setQueryData(['form-filling-worklist'], [{ instanceNo: 'A-private' }]);
  auth.queryClient.getMutationCache().build(auth.queryClient, { mutationKey: ['A-action'] });
  for (const key of ['token', 'user', ...Object.values(auth.SESSION_STORAGE_KEYS)]) auth.localStorage.setItem(key, 'A');
  auth.clearAuthStorage();
  assert.equal(auth.queryClient.getQueryCache().getAll().length, 0);
  assert.equal(auth.queryClient.getMutationCache().getAll().length, 0);
  assert.equal(auth.storage.size, 0);
});

test('F-001: a late A query cannot repopulate the cache used by B', async () => {
  const auth = await loadAuth();
  const key = ['form-filling-worklist', 'FILLABLE', 1, 20, {}];
  let finishA;
  const oldResult = auth.queryClient.fetchQuery({ queryKey: key, queryFn: () => new Promise((done) => { finishA = done; }) }).catch((error) => error);
  auth.clearAuthStorage();
  auth.useAuthStore.getState().login('B-token', { id: 2, username: 'B', permissions: [] });
  assert.equal(auth.queryClient.getQueryData(key), undefined);
  let finishB;
  const newResult = auth.queryClient.fetchQuery({ queryKey: key, queryFn: () => new Promise((done) => { finishB = done; }) });
  finishA([{ instanceNo: 'A-private' }]);
  await oldResult;
  assert.equal(auth.queryClient.getQueryData(key), undefined);
  finishB([{ instanceNo: 'B-private' }]);
  await newResult;
  assert.deepEqual(auth.queryClient.getQueryData(key), [{ instanceNo: 'B-private' }]);
  auth.clearAuthStorage();
});

test('F-001: LoginPage clears stale cache before installing the successful identity', async () => {
  const auth = await loadAuth();
  auth.queryClient.setQueryData(['personal'], 'A');
  const navigations = [];
  const submit = pageCallback('src/pages/LoginPage.tsx', 'handleSubmit', {
    username: 'B', password: 'test-only',
    client: { post: async () => ({ data: { data: { token: 'B-token', user: { id: 2 } } } }) },
    setError: () => {}, setLoading: () => {},
    clearSessionQueryCache: auth.clearSessionQueryCache,
    localStorage: { ...auth.localStorage, setItem(key, value) {
      assert.equal(auth.queryClient.getQueryCache().getAll().length, 0);
      auth.localStorage.setItem(key, value);
    } },
    storeSessionPolicy: () => {}, navigate: (...args) => navigations.push(args),
  });
  await submit({ preventDefault() {} });
  assert.equal(auth.localStorage.getItem('token'), 'B-token');
  assert.equal(navigations[0][0], '/');
});

test('F-001: old HTTP successes and old 401 responses cannot affect the new session', async () => {
  const auth = await loadAuth();
  const pending = [];
  auth.client.defaults.adapter = (config) => new Promise((resolve, reject) => pending.push({ config, resolve, reject }));
  const successful = auth.client.get('/old-data').catch((error) => error);
  const unauthorized = auth.client.get('/old-authorization').catch((error) => error);
  await new Promise(setImmediate);
  auth.useAuthStore.getState().login('B-token', { id: 2, username: 'B', permissions: [] });
  pending[0].resolve({ config: pending[0].config, data: { code: 200, data: 'A-private' }, status: 200 });
  pending[1].reject({ config: pending[1].config, response: { status: 401, data: {} } });
  assert.equal((await successful).code, 'ERR_CANCELED');
  assert.equal((await unauthorized).code, 'ERR_CANCELED');
  assert.equal(auth.localStorage.getItem('token'), 'B-token');
  assert.equal(auth.window.location.href, '');
  // A current-session 401 must still log out.
  const current = auth.client.get('/current-authorization').catch((error) => error);
  await new Promise(setImmediate);
  pending[2].reject({ config: pending[2].config, response: { status: 401, data: {} } });
  await current;
  assert.equal(auth.localStorage.getItem('token'), null);
  assert.equal(auth.window.location.href, '/login');
});

test('F-001: same-session requests and signature verification preserve cached work', async () => {
  const auth = await loadAuth();
  auth.queryClient.setQueryData(['personal'], 'A');
  auth.client.defaults.adapter = async (config) => ({ config, data: { code: 200, data: 'verified' }, status: 200 });
  assert.equal((await auth.client.post('/signature-verification', {}, { skipAuthRedirect: true })).data.data, 'verified');
  assert.equal(auth.queryClient.getQueryData(['personal']), 'A');
  auth.clearAuthStorage();
});

test('F-001: a request binds its identity before an immediate session switch', async () => {
  const auth = await loadAuth();
  auth.localStorage.setItem('token', 'A-token');
  let sent;
  auth.client.defaults.adapter = (config) => new Promise((resolve) => { sent = { config, resolve }; });
  const response = auth.client.get('/started-by-A').catch((error) => error);
  auth.useAuthStore.getState().login('B-token', { id: 2, username: 'B', permissions: [] });
  assert.equal(sent.config.headers.Authorization, 'Bearer A-token');
  sent.resolve({ config: sent.config, data: { code: 200, data: 'A-private' }, status: 200 });
  assert.equal((await response).code, 'ERR_CANCELED');
});

for (const page of ['FormFillingPage', 'FormReviewPage']) {
  test(`F-002: ${page} forwards each row's dependencies unchanged and handles no identity`, async () => {
    const calls = [];
    const identity = { productionObjectId: 'object', operationId: 'operation', formId: 'form' };
    const globals = { identity, getExecutionReferences: (...args) => { calls.push(args); return Promise.resolve([]); } };
    const callback = pageCallback(`src/pages/form-management/${page}.tsx`, 'references', globals);
    for (const dependencies of [{ main: 'batch', material: 'row-one' }, { main: 'batch', material: 'row-two' }, { material: '' }, {}]) {
      await callback('reference', 'keyword', dependencies);
      assert.deepEqual(calls.at(-1).slice(0, 5), ['object', 'operation', 'form', 'reference', 'keyword']);
      assert.equal(calls.at(-1)[5], dependencies);
    }
    globals.identity = null;
    assert.deepEqual(plain(await callback('reference', '', {})), []);
    assert.equal(calls.length, 4);
  });
}

const { resolveDhrWorkspaceVersion } = await load("export * from './src/pages/master-data/dhrWorkspaceVersion';");

test('F-003: resolution distinguishes pending, missing, empty, explicit and default selection', () => {
  const versions = [{ id: 'newer' }, { id: 10 }];
  assert.deepEqual(plain(resolveDhrWorkspaceVersion(undefined, 10)), { status: 'loading', versionId: null });
  for (const list of [[], versions]) assert.deepEqual(plain(resolveDhrWorkspaceVersion(list, 'missing', 'newer')), { status: 'missing', versionId: null });
  assert.equal(resolveDhrWorkspaceVersion(versions, '10').versionId, '10');
  assert.equal(resolveDhrWorkspaceVersion(versions, 10).versionId, '10');
  assert.equal(resolveDhrWorkspaceVersion([{ id: 0 }], 0).versionId, '0');
  assert.equal(resolveDhrWorkspaceVersion(versions).versionId, 'newer');
  assert.equal(resolveDhrWorkspaceVersion(versions, null, '10').versionId, '10');
  assert.deepEqual(plain(resolveDhrWorkspaceVersion([])), { status: 'empty', versionId: null });
});

// Render the actual workspace function with hook/API boundaries, before effects.
// This catches the dangerous frame where old state exists after a target changes.
function workspaceHarness({ versions = [{ id: 'B', version: 'B' }], requested = 'A', draftId = 'B', status = 'success' } = {}) {
  const path = 'src/pages/master-data/DhrTemplateWorkspaceDialog.tsx';
  const text = read(path);
  const source = ts.createSourceFile(path, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const globals = {};
  for (const node of source.statements) if (ts.isImportDeclaration(node)) {
    if (node.importClause?.name) globals[node.importClause.name.text] = () => ({});
    const bindings = node.importClause?.namedBindings;
    if (bindings && ts.isNamedImports(bindings)) for (const item of bindings.elements) globals[item.name.text] = () => ({});
  }
  const queries = [], mutations = [], saves = [];
  const composition = (id) => ({ version: { id, version: id }, directories: [], items: [] });
  Object.assign(globals, {
    resolveDhrWorkspaceVersion,
    __state: (name, initial) => [name === 'compositionDraft' ? composition(draftId) : name === 'hasChanges' ? true : typeof initial === 'function' ? initial() : initial, () => {}],
    useMemo: (fn) => fn(), useEffect: () => {}, useRecordLocationAction: () => {},
    useQueryClient: () => ({ invalidateQueries: async () => {} }),
    useQuery: (options) => {
      queries.push(options);
      const workspace = options.queryKey[0] === 'dhr-template-workspace';
      return { isSuccess: workspace ? status === 'success' : true, isLoading: workspace && status === 'pending', isError: workspace && status === 'error', dataUpdatedAt: 1,
        data: workspace ? { versions } : options.queryKey[0] === 'dhr-template-composition' ? composition(options.queryKey[2]) : [] };
    },
    useMutation: (options) => { mutations.push(options); return { isPending: false, mutate() {} }; },
    getDhrTemplateComposition: async (...args) => { queries.push({ readTarget: args }); return { data: { data: composition(args[1]) } }; },
    saveDhrTemplateComposition: async (...args) => { saves.push(args); },
  });
  const withoutImports = source.statements.filter((node) => !ts.isImportDeclaration(node))
    .map((node) => node.getFullText(source)).join('\n');
  const code = ts.transpileModule(`${withoutImports}\nexport { DhrTemplateWorkspace };`, {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX },
    transformers: { before: [(context) => {
      function visit(node) {
        if (ts.isImportDeclaration(node)) return undefined;
        if (ts.isVariableDeclaration(node) && ts.isArrayBindingPattern(node.name) &&
            node.initializer && ts.isCallExpression(node.initializer) && node.initializer.expression.getText() === 'useState') {
          const name = node.name.elements[0].name.getText();
          return context.factory.updateVariableDeclaration(node, node.name, node.exclamationToken, node.type,
            context.factory.createCallExpression(context.factory.createIdentifier('__state'), undefined,
              [context.factory.createStringLiteral(name), ...node.initializer.arguments]));
        }
        return ts.visitEachChild(node, visit, context);
      }
      return (node) => ts.visitNode(node, visit);
    }] },
  }).outputText;
  const module = { exports: {} };
  vm.runInNewContext(code, { module, exports: module.exports, require, console, ...globals });
  const props = { open: true, template: { id: 'template' }, initialVersionId: requested, onClose() {} };
  const tree = module.exports.DhrTemplateWorkspace(props);
  return { queries, mutations, saves, tree, wrapper: module.exports.default, props };
}

test('F-003: missing target never reads a fallback and refuses saving an old draft', async () => {
  const harness = workspaceHarness();
  const query = harness.queries.find((entry) => entry.queryKey?.[0] === 'dhr-template-composition');
  assert.equal(query.enabled, false);
  assert.equal(query.queryKey[2], null);
  await assert.rejects(harness.mutations[0].mutationFn(), /上下文缺失|版本/);
  assert.equal(harness.saves.length, 0);
});

test('F-003: valid target reads and saves only itself; mismatched draft is rejected', async () => {
  const harness = workspaceHarness({ requested: 'B', draftId: 'B' });
  const query = harness.queries.find((entry) => entry.queryKey?.[0] === 'dhr-template-composition');
  assert.equal(query.enabled, true);
  await query.queryFn();
  await harness.mutations[0].mutationFn();
  assert.deepEqual(plain(harness.queries.find((entry) => entry.readTarget).readTarget), ['template', 'B']);
  assert.deepEqual(plain(harness.saves[0].slice(0, 2)), ['template', 'B']);
  const stale = workspaceHarness({ requested: 'B', draftId: 'A' });
  await assert.rejects(stale.mutations[0].mutationFn(), /草稿版本不匹配/);
  assert.equal(stale.saves.length, 0);
});

test('F-003: pending/error/empty version lists cannot write cached composition', async () => {
  for (const options of [{ status: 'pending' }, { status: 'error' }, { versions: [] }]) {
    const harness = workspaceHarness(options);
    assert.equal(harness.queries.find((entry) => entry.queryKey?.[0] === 'dhr-template-composition').enabled, false);
    await assert.rejects(harness.mutations[0].mutationFn());
    assert.equal(harness.saves.length, 0);
  }
});

test('F-003: target changes and close/reopen create a distinct workspace state boundary', () => {
  const { wrapper, props } = workspaceHarness();
  const key = wrapper(props).key;
  assert.notEqual(wrapper({ ...props, template: { id: 'other-template' } }).key, key);
  assert.notEqual(wrapper({ ...props, initialVersionId: 'B' }).key, key);
  assert.notEqual(wrapper({ ...props, open: false }).key, key);
  assert.equal(wrapper({ ...props }).key, key);
});