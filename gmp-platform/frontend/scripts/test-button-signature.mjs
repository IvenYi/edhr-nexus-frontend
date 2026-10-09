import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import { test } from 'node:test';
import vm from 'node:vm';
import { build } from 'esbuild';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

const require = createRequire(import.meta.url);
async function load(entry, moduleOverrides = {}) {
  const result = await build({ absWorkingDir: resolve(import.meta.dirname, '..'), entryPoints: [entry],
    bundle: true, write: false, platform: 'node', format: 'cjs', packages: 'external' });
  const sandbox = { module: { exports: {} }, require: id => moduleOverrides[id] ?? require(id), console };
  sandbox.exports = sandbox.module.exports;
  vm.runInNewContext(result.outputFiles[0].text, sandbox);
  return sandbox.module.exports.default;
}
const Credentials = await load('src/components/workflow/ButtonSignatureCredentials.tsx');
const Buttons = await load('src/components/workflow/WorkflowActionButtons.tsx');

test('named signer credentials use signature password except internal admin', () => {
  const props = { password: '', onAccountChange() {}, onPasswordChange() {} };
  for (const account of ['', 'reviewer', 'customer-admin', 'ADMIN', 'Admin']) {
    const html = renderToStaticMarkup(React.createElement(Credentials, { ...props, account }));
    assert.match(html, /签署人用户名/);
    assert.match(html, /电子签名密码/);
    assert.doesNotMatch(html, /当前操作人账户|current-password/);
  }
  assert.match(renderToStaticMarkup(React.createElement(Credentials, { ...props, account: 'admin' })), /登录密码/);
});

test('changing signer clears the previous password', () => {
  let account = 'reviewer', password = 'secret';
  const element = Credentials({ account, password, onAccountChange(value) { account = value; }, onPasswordChange(value) { password = value; } });
  element.props.children[0].props.onChange({ target: { value: 'other' } });
  assert.equal(account, 'other');
  assert.equal(password, '');
});

test('shared workstation only enables configured signed buttons, not unsigned actions or SIGN_FIELD', () => {
  function disabled(action, requiresSignature, props = {}) {
    const html = renderToStaticMarkup(React.createElement(Buttons, { buttons: [{ action, requiresSignature, label: action }],
      canAct: false, allowAccountSigning: true, onAction() {}, ...props }));
    return /<button[^>]*disabled=""/.test(html);
  }
  assert.equal(disabled('SUBMIT', true), false);
  assert.equal(disabled('SAVE', false), true);
  assert.equal(disabled('SIGN_FIELD', true), true);
  assert.equal(disabled('APPROVE', true, { busy: true }), true);
  assert.equal(disabled('APPROVE', true, { allowAccountSigning: false }), true);
});

test('DHR confirmation consumes button credentials while preserving field-signature behavior', async () => {
  let states, index, submitted;
  const Dialog = await load('src/pages/dhr-management/DhrActionDialog.tsx', {
    react: { ...React, useEffect() {}, useState() {
      const slot = index++;
      return [states[slot], value => { states[slot] = value; }];
    } },
  });
  for (const action of ['SUBMIT', 'APPROVE', 'SIGN_FIELD']) {
    states = ['reviewer', 'sign-secret', 'review opinion'];
    index = 0;
    const element = Dialog({ button: { action, requiresSignature: true }, busy: false,
      onCancel() {}, onConfirm(value) { submitted = value; } });
    const confirm = element.props.children[2].props.children[1];
    assert.equal(confirm.props.disabled, false);
    confirm.props.onClick();
    assert.equal(submitted.password, 'sign-secret');
    assert.equal(submitted.account, 'reviewer');
    assert.equal(states[0], 'reviewer');
    assert.equal(states[1], action === 'SIGN_FIELD' ? 'sign-secret' : '');
    assert.equal(states[2], 'review opinion');
  }
});
