import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import { test } from 'node:test';
import vm from 'node:vm';
import { build } from 'esbuild';
import ts from 'typescript';
import { QueryClient, QueryObserver } from '@tanstack/react-query';

const root = resolve(import.meta.dirname, '..');
const require = createRequire(import.meta.url);
const plain = (value) => JSON.parse(JSON.stringify(value));
const read = (path) => readFileSync(resolve(root, path), 'utf8');

async function load(source, globals = {}) {
  const output = await build({
    absWorkingDir: root,
    stdin: { contents: source, resolveDir: root, loader: 'ts' },
    bundle: true, write: false, platform: 'node', format: 'cjs', packages: 'external',
    define: { 'import.meta.hot': 'undefined' },
    plugins: [{ name: 'no-ui-notifications', setup(plugin) {
      plugin.onResolve({ filter: /deletionProtection$/ }, () => ({ path: 'notification', namespace: 'test' }));
      plugin.onLoad({ filter: /.*/, namespace: 'test' }, () => ({ contents: 'export const showDeletionProtection = () => {};' }));
    } }],
  });
  const module = { exports: {} };
  vm.runInNewContext(output.outputFiles[0].text, { module, exports: module.exports, require, console, Event, ...globals });
  return module.exports;
}

function authEnvironment() {
  const storage = new Map();
  const localStorage = {
    getItem: (key) => storage.get(key) ?? null,
    setItem: (key, value) => storage.set(key, String(value)),
    removeItem: (key) => storage.delete(key),
  };
  const window = Object.assign(new EventTarget(), { location: { href: '' } });
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
  const setItem = auth.localStorage.setItem;
  auth.localStorage.setItem = (key, value) => {
    assert.equal(auth.queryClient.getQueryCache().getAll().length, 0);
    setItem(key, value);
  };
  const submit = pageCallback('src/pages/LoginPage.tsx', 'handleSubmit', {
    username: 'B', password: 'test-only',
    client: { post: async () => ({ data: { data: { token: 'B-token', user: { id: 2 } } } }) },
    setError: () => {}, setLoading: () => {},
    useAuthStore: auth.useAuthStore,
    clearSessionQueryCache: auth.clearSessionQueryCache, localStorage: auth.localStorage,
    storeSessionPolicy: () => {}, navigate: (...args) => navigations.push(args),
  });
  await submit({ preventDefault() {} });
  assert.equal(auth.localStorage.getItem('token'), 'B-token');
  assert.equal(auth.useAuthStore.getState().user?.id, 2);
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
  assert.equal(auth.useAuthStore.getState().user.id, 2);
  // A current-session 401 must still log out.
  const current = auth.client.get('/current-authorization').catch((error) => error);
  await new Promise(setImmediate);
  pending[2].reject({ config: pending[2].config, response: { status: 401, data: {} } });
  await current;
  assert.equal(auth.localStorage.getItem('token'), null);
  assert.equal(auth.useAuthStore.getState().user, null);
  assert.equal(auth.window.location.href, '/login');
});

test('HOME-IDENTITY: A to B to A updates memory and announces the installed identity', async () => {
  const auth = await loadAuth();
  const observed = [];
  auth.window.addEventListener(auth.AUTH_USER_CHANGE_EVENT, () => {
    observed.push([auth.useAuthStore.getState().user?.id, JSON.parse(auth.localStorage.getItem('user')).id]);
  });
  for (const id of [1, 2, 1]) {
    auth.useAuthStore.getState().login(`token-${id}`, { id, username: `user-${id}`, permissions: [] });
    assert.equal(auth.useAuthStore.getState().user.id, id);
    assert.equal(auth.useAuthStore.getState().token, `token-${id}`);
  }
  assert.deepEqual(observed, [[1, 1], [2, 2], [1, 1]]);
});

test('HOME-IDENTITY: shared clear path removes memory identity as well as storage', async () => {
  const auth = await loadAuth();
  auth.useAuthStore.getState().login('A-token', { id: 1, permissions: ['old'] });
  auth.clearAuthStorage();
  assert.equal(auth.useAuthStore.getState().user, null);
  assert.equal(auth.useAuthStore.getState().token, null);
  assert.equal(auth.useAuthStore.getState().isAuthenticated, false);
  assert.equal(auth.useAuthStore.getState().hasPermission('old'), false);
});

test('HOME-IDENTITY: string Snowflake identities survive login and same-session refresh exactly', async () => {
  const auth = await loadAuth();
  // These neighboring IDs collide if they are coerced to JavaScript Number.
  for (const id of ['9007199254740993', '9007199254740992', '9007199254740993']) {
    auth.useAuthStore.getState().login(`test-token-${id}`, { id, permissions: [] });
    const key = ['tasks', 'done', id, 1];
    auth.queryClient.setQueryData(key, { ownerId: id });
    assert.equal(auth.useAuthStore.getState().user.id, id);
    assert.equal(JSON.parse(auth.localStorage.getItem('user')).id, id);
    auth.localStorage.setItem('user', JSON.stringify({ id, displayName: 'refreshed', permissions: [] }));
    auth.window.dispatchEvent(new Event(auth.AUTH_USER_CHANGE_EVENT));
    assert.equal(auth.useAuthStore.getState().user.id, id);
    assert.deepEqual(auth.queryClient.getQueryData(key), { ownerId: id });
  }
  auth.clearAuthStorage();
});

test('HOME-IDENTITY: profile refresh uses the existing event without clearing session work', async () => {
  const auth = await loadAuth();
  auth.useAuthStore.getState().login('A-token', { id: 1, displayName: 'old', permissions: [] });
  auth.queryClient.setQueryData(['work'], { draft: 'keep' });
  const generation = auth.getSessionGeneration();
  auth.localStorage.setItem('user', JSON.stringify({ id: 1, displayName: 'new', permissions: ['read'] }));
  auth.window.dispatchEvent(new Event(auth.AUTH_USER_CHANGE_EVENT));
  assert.equal(auth.useAuthStore.getState().user.displayName, 'new');
  assert.equal(auth.useAuthStore.getState().hasPermission('read'), true);
  assert.equal(auth.localStorage.getItem('token'), 'A-token');
  assert.equal(auth.getSessionGeneration(), generation);
  assert.deepEqual(auth.queryClient.getQueryData(['work']), { draft: 'keep' });
  auth.clearAuthStorage();
});

test('HOME-IDENTITY: malformed display cache cannot preserve the previous identity', async () => {
  const auth = await loadAuth();
  auth.useAuthStore.getState().login('A-token', { id: 1, permissions: [] });
  auth.localStorage.setItem('user', '{broken');
  assert.doesNotThrow(() => auth.window.dispatchEvent(new Event(auth.AUTH_USER_CHANGE_EVENT)));
  assert.equal(auth.useAuthStore.getState().user, null);
  assert.equal(auth.useAuthStore.getState().token, 'A-token');
  auth.clearAuthStorage();
});

test('HOME-IDENTITY: failed LoginPage authentication does not install a requested user', async () => {
  const auth = await loadAuth();
  auth.useAuthStore.getState().login('A-token', { id: 1, permissions: [] });
  const errors = [], navigations = [];
  const submit = pageCallback('src/pages/LoginPage.tsx', 'handleSubmit', {
    username: 'B', password: 'test-only',
    client: { post: async () => { throw new Error('denied'); } },
    setError: (value) => errors.push(value), setLoading() {}, useAuthStore: auth.useAuthStore,
    storeSessionPolicy() {}, navigate: (...args) => navigations.push(args),
  });
  await submit({ preventDefault() {} });
  assert.equal(auth.useAuthStore.getState().user.id, 1);
  assert.equal(auth.localStorage.getItem('token'), 'A-token');
  assert.equal(navigations.length, 0);
  assert.equal(errors.length, 2);
  auth.clearAuthStorage();
});

for (const securityFlag of ['forcePasswordChange', 'forceSignatureVerification']) {
  test(`HOME-IDENTITY: ${securityFlag} sends the new session to account security`, async () => {
    const auth = await loadAuth();
    auth.useAuthStore.getState().login('A-token', { id: 1, permissions: ['old'] });
    auth.queryClient.setQueryData(['personal'], 'A-only');
    const payload = { token: 'B-token', user: { id: 2, permissions: ['new'] }, [securityFlag]: true };
    const policies = [], navigations = [], errors = [];
    const submit = pageCallback('src/pages/LoginPage.tsx', 'handleSubmit', {
      username: 'B', password: 'test-only',
      client: { post: async (path, data) => {
        assert.equal(path, '/auth/login');
        assert.deepEqual(plain(data), { username: 'B', password: 'test-only' });
        return { data: { data: payload } };
      } },
      setError: (value) => errors.push(value), setLoading() {}, useAuthStore: auth.useAuthStore,
      storeSessionPolicy: (value) => policies.push(value),
      navigate: (...args) => navigations.push(args),
    });
    await submit({ preventDefault() {} });
    assert.deepEqual(errors, ['']);
    assert.equal(auth.useAuthStore.getState().user.id, 2);
    assert.equal(auth.useAuthStore.getState().token, 'B-token');
    assert.equal(auth.useAuthStore.getState().hasPermission('old'), false);
    assert.equal(auth.useAuthStore.getState().hasPermission('new'), true);
    assert.equal(auth.queryClient.getQueryData(['personal']), undefined);
    assert.deepEqual(policies, [payload]);
    assert.deepEqual(plain(navigations), [['/account/settings', { replace: true }]]);
    auth.clearAuthStorage();
  });
}

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
function workspaceHarness({ versions = [{ id: 'B', version: 'B' }], requested = 'A', draftId = 'B', status = 'success', workspaceFlags = {}, draftDirectories = [] } = {}) {
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
  const effects = [], stateUpdates = new Map();
  const composition = (id) => ({ version: { id, version: id }, directories: draftDirectories, items: [] });
  Object.assign(globals, {
    resolveDhrWorkspaceVersion,
    __state: (name, initial) => [name === 'compositionDraft' ? composition(draftId) : name === 'hasChanges' ? true : typeof initial === 'function' ? initial() : initial, (value) => stateUpdates.set(name, value)],
    useMemo: (fn) => fn(), useEffect: (callback, dependencies) => effects.push({ callback, dependencies }), useRecordLocationAction: () => {},
    useQueryClient: () => ({ invalidateQueries: async () => {} }),
    useQuery: (options) => {
      queries.push(options);
      const workspace = options.queryKey[0] === 'dhr-template-workspace';
      return { isSuccess: workspace ? status === 'success' : true, isLoading: workspace && status === 'pending', isError: workspace && status === 'error', dataUpdatedAt: 1,
        isFetchedAfterMount: status !== 'pending', isFetching: status === 'pending',
        ...(workspace ? workspaceFlags : {}),
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
  return { queries, mutations, saves, tree, effects, stateUpdates, wrapper: module.exports.default, props };
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

function renderedText(node) {
  if (node == null || typeof node === 'boolean') return '';
  if (Array.isArray(node)) return node.map(renderedText).join(' ');
  return typeof node === 'object' ? renderedText(node.props?.children) : String(node);
}

test('F-003 defensive boundary: empty versions without an explicit target is not loading or empty design', async () => {
  const empty = workspaceHarness({ requested: null, versions: [] });
  assert.match(renderedText(empty.tree), /当前模板没有版本/);
  assert.doesNotMatch(renderedText(empty.tree), /未找到所选|正在重新核实/);
  assert.equal(empty.queries.find((q) => q.queryKey?.[0] === 'dhr-template-composition').enabled, false);
  await assert.rejects(empty.mutations[0].mutationFn());
  assert.equal(empty.saves.length, 0);
  const checking = workspaceHarness({ requested: null, versions: [], workspaceFlags: { isFetchedAfterMount: false, isFetching: true } });
  assert.match(renderedText(checking.tree), /正在重新核实/);
  assert.doesNotMatch(renderedText(checking.tree), /当前模板没有版本/);
  const emptyDesign = workspaceHarness({ requested: 'B', draftId: 'B', draftDirectories: [] });
  await emptyDesign.mutations[0].mutationFn();
  assert.equal(emptyDesign.saves[0][1], 'B');
  assert.deepEqual(plain(emptyDesign.saves[0][2].directories), []);
});

function runChangedEffects(previous, next) {
  assert.equal(previous.effects.length, next.effects.length);
  next.effects.forEach((effect, index) => {
    const before = previous.effects[index].dependencies;
    if (!before || !effect.dependencies || effect.dependencies.some((value, i) => !Object.is(value, before[i]))) effect.callback();
  });
}

test('F-003 recovery: a fresh workspace cache still revalidates on opening', async () => {
  const client = new QueryClient({ defaultOptions: { queries: { staleTime: 30000, retry: false, gcTime: Infinity } } });
  const options = workspaceHarness().queries.find((query) => query.queryKey?.[0] === 'dhr-template-workspace');
  client.setQueryData(options.queryKey, { versions: [{ id: 'B' }] });
  let release, calls = 0;
  const observer = new QueryObserver(client, { ...options, queryFn: () => { calls += 1; return new Promise((done) => { release = done; }); } });
  const unsubscribe = observer.subscribe(() => {});
  try {
    assert.equal(calls, 1, 'opening must fetch even within the 30-second freshness window');
    const latest = { versions: [{ id: 'A' }, { id: 'B' }] };
    release(latest);
    await new Promise(setImmediate);
    assert.deepEqual(observer.getCurrentResult().data, latest);
  } finally { unsubscribe(); client.clear(); }
});

test('F-003 recovery: missing cached target is checking, not confirmed missing, until revalidation finishes', async () => {
  const checking = workspaceHarness({ workspaceFlags: { isFetchedAfterMount: false, isFetching: true } });
  assert.match(renderedText(checking.tree), /正在重新核实/);
  assert.doesNotMatch(renderedText(checking.tree), /未找到所选|不存在或已不可用/);
  assert.equal(checking.queries.find((q) => q.queryKey?.[0] === 'dhr-template-composition').enabled, false);
  await assert.rejects(checking.mutations[0].mutationFn());
  const missing = workspaceHarness();
  assert.match(renderedText(missing.tree), /未找到所选批记录版本/);
  await assert.rejects(missing.mutations[0].mutationFn());
});

test('F-003 recovery: background error and retry preserve the dirty target and close confirmation', async () => {
  const options = { requested: 'B', draftId: 'B', draftDirectories: [{ id: 'directory', name: 'unsaved', sortOrder: 10 }] };
  const before = workspaceHarness(options);
  const failed = workspaceHarness({ ...options, status: 'error' });
  runChangedEffects(before, failed);
  assert.equal(failed.stateUpdates.has('compositionDraft'), false, 'a query error must not reset the draft');
  assert.notEqual(failed.stateUpdates.get('hasChanges'), false, 'a query error must not clear the dirty flag');
  assert.match(renderedText(failed.tree), /当前草稿已保留/);
  failed.tree.props.onClose();
  assert.equal(failed.stateUpdates.get('discardConfirm'), true);
  await assert.rejects(failed.mutations[0].mutationFn());
  const recovered = workspaceHarness(options);
  runChangedEffects(failed, recovered);
  assert.equal(recovered.stateUpdates.has('compositionDraft'), false, 'retry must not overwrite dirty content');
  await recovered.mutations[0].mutationFn();
  assert.equal(recovered.saves[0][1], 'B');
  assert.equal(recovered.saves[0][2].directories[0].name, 'unsaved');
});

test('F-003 recovery: saves wait for revalidation, but expired existing targets remain editable', async () => {
  for (const workspaceFlags of [{ isFetchedAfterMount: false }, { isFetching: true }]) {
    const waiting = workspaceHarness({ requested: 'B', workspaceFlags });
    await assert.rejects(waiting.mutations[0].mutationFn());
    assert.equal(waiting.saves.length, 0);
  }
  const expired = workspaceHarness({ requested: 'B', versions: [{ id: 'newer', status: 'ACTIVE' }, { id: 'B', status: 'EXPIRED' }] });
  await expired.mutations[0].mutationFn();
  assert.equal(expired.saves[0][1], 'B');
});

test('F-003 recovery: version creation/copy/edit invalidates only its owning workspace', async () => {
  const client = new QueryClient();
  const globals = { queryClient: client, useMutation: (options) => options, showMessage() {},
    config: { queryKey: 'list', auditQueryKey: 'audit' }, defaultEffectiveFromValue: () => '',
  };
  for (const name of ['setDhrVersionDialog', 'setDhrVersionLabel', 'setDhrVersionCode', 'setDhrVersionOfflineVersion', 'setDhrVersionDescription', 'setDhrVersionEffectiveFrom', 'setDhrVersionEffectiveTo']) globals[name] = () => {};
  const mutation = pageCallback('src/pages/master-data/TemplateModelingPage.tsx', 'saveDhrVersionMutation', globals);
  try {
    for (const mode of ['create', 'copy', 'edit']) {
      client.setQueryData(['dhr-template-workspace', 'T'], { versions: [] });
      client.setQueryData(['dhr-template-workspace', 'other'], { versions: [] });
      await mutation.onSuccess(undefined, { row: { id: 'T' }, mode });
      assert.equal(client.getQueryState(['dhr-template-workspace', 'T']).isInvalidated, true, mode);
      assert.equal(client.getQueryState(['dhr-template-workspace', 'other']).isInvalidated, false, mode);
    }
  } finally { client.clear(); }
});

test('F-003 recovery: deleting a DHR version invalidates its workspace, not form-template caches', async () => {
  const client = new QueryClient();
  const globals = { queryClient: client, useMutation: (options) => options, showMessage() {}, setDeleteVersionTarget() {},
    pageKey: 'batchRecordTemplates', config: { queryKey: 'list', auditQueryKey: 'audit', categoryQueryKey: 'categories' },
  };
  const mutation = pageCallback('src/pages/master-data/TemplateModelingPage.tsx', 'deleteVersionMutation', globals);
  try {
    client.setQueryData(['dhr-template-workspace', 'T'], { versions: [] });
    await mutation.onSuccess(undefined, { row: { id: 'T' } });
    assert.equal(client.getQueryState(['dhr-template-workspace', 'T']).isInvalidated, true);
    client.setQueryData(['dhr-template-workspace', 'T'], { versions: [] });
    globals.pageKey = 'formTemplates';
    await mutation.onSuccess(undefined, { row: { id: 'T' } });
    assert.equal(client.getQueryState(['dhr-template-workspace', 'T']).isInvalidated, false);
  } finally { client.clear(); }
});
