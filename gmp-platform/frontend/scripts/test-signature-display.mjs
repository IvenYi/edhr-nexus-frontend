import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import { test } from 'node:test';
import vm from 'node:vm';
import { build } from 'esbuild';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

const require = createRequire(import.meta.url);
async function load(entry) {
  const result = await build({
    absWorkingDir: resolve(import.meta.dirname, '..'), entryPoints: [entry], bundle: true, write: false,
    platform: 'node', format: 'cjs', packages: 'external',
    plugins: [{ name: 'files', setup(plugin) {
      plugin.onResolve({ filter: /^@\/api\/files$/ }, () => ({ path: 'files', namespace: 'stub' }));
      plugin.onLoad({ filter: /.*/, namespace: 'stub' }, () => ({ contents: 'export const getFilePreviewBlob = () => { throw new Error("No signature API writes in presentation tests"); };' }));
    } }],
  });
  const sandbox = { module: { exports: {} }, require, console };
  sandbox.exports = sandbox.module.exports;
  vm.runInNewContext(result.outputFiles[0].text, sandbox);
  return sandbox.module.exports;
}
const { readSignaturePresentation, formatSignatureTime } = await load('src/components/form-renderer/signaturePresentation.ts');
const { default: SignatureDisplay } = await load('src/components/form-renderer/SignatureDisplay.tsx');
const { FormRuntimeField, FormRuntimeContext, SignatureDisplayModeContext } = await load('src/components/form-renderer/FormRuntimeField.tsx');
const signature = { type: 'signature', signerName: '测试签署人', signatureImageUrl: 'data:image/png;base64,test', signedAt: '2026-09-16T09:08:07.123456' };

test('three configured display modes use the recorded signing time', () => {
  assert.equal(formatSignatureTime(signature.signedAt, 'signatureOnly'), '');
  assert.equal(formatSignatureTime(signature.signedAt, 'signatureDate'), '2026-09-16');
  assert.equal(formatSignatureTime(signature.signedAt, 'signatureDateTime'), '2026-09-16 09:08:07');
  assert.equal(formatSignatureTime('2026-09-16T00:10:00+08:00', 'signatureDate'), '2026-09-16');
  assert.equal(formatSignatureTime(signature.signedAt, undefined), '');
});

test('missing or invalid signing time is never replaced by certification time or today', () => {
  const old = readSignaturePresentation({ ...signature, signedAt: undefined, certifiedAt: '2025-01-01T12:00:00' });
  assert.equal(formatSignatureTime(old.signedAt, 'signatureDate'), '未记录签署时间');
  for (const invalid of ['garbage', '2026-02-30T10:00:00', '2026-09-16T26:00:00', undefined]) {
    assert.equal(formatSignatureTime(invalid, 'signatureDateTime'), '未记录签署时间');
  }
  assert.equal(formatSignatureTime('2026-09-16', 'signatureDateTime'), '未记录签署时间');
});

test('legacy production signature strings retain signer and recorded time without exposing the ID as a date', () => {
  const parsed = readSignaturePresentation('测试 · 签署人 · 2026-09-16T09:08:07.123456789 · 123456789');
  assert.equal(parsed.signerName, '测试 · 签署人');
  assert.equal(formatSignatureTime(parsed.signedAt, 'signatureDateTime'), '2026-09-16 09:08:07');
  assert.equal(readSignaturePresentation('旧签名').signerName, '旧签名');
  assert.equal(readSignaturePresentation(''), null);
});

test('image and date are separate visible elements; signature-only omits the time line', () => {
  const dated = renderToStaticMarkup(React.createElement(SignatureDisplay, { value: signature, displayMode: 'signatureDateTime', imageMarker: 'data-mock-fill-signature-image' }));
  assert.match(dated, /data-mock-fill-signature-image="true"/);
  assert.match(dated, /data-signature-time="true"[^>]*>2026-09-16 09:08:07/);
  assert.match(dated, /title="测试签署人 · 2026-09-16 09:08:07"/);
  assert.doesNotMatch(dated, /2026-09-16T/);
  const dateOnly = renderToStaticMarkup(React.createElement(SignatureDisplay, { value: signature, displayMode: 'signatureDate' }));
  assert.match(dateOnly, /title="测试签署人 · 2026-09-16"/);
  const only = renderToStaticMarkup(React.createElement(SignatureDisplay, { value: signature, displayMode: 'signatureOnly' }));
  assert.doesNotMatch(only, /data-signature-time/);
  assert.match(only, /title="测试签署人"/);
});

function renderRuntime(field, value, modes, props = {}) {
  return renderToStaticMarkup(React.createElement(SignatureDisplayModeContext.Provider, { value: modes },
    React.createElement(FormRuntimeContext.Provider, { value: { values: { [field.id]: value }, onChange: () => assert.fail('Rendering must not mutate form values') } },
      React.createElement(FormRuntimeField, { field, ...props }))));
}
const field = { id: 'signature', name: '签名', type: 'signature', status: 'enabled', typeConfig: {} };
test('runtime canvas override and list context both honor the configured display mode', () => {
  assert.match(renderRuntime(field, signature, { signature: 'signatureDateTime' }), />2026-09-16 09:08:07<\/time>/);
  assert.match(renderRuntime(field, signature, { signature: 'signatureDateTime' }, { signatureDisplayMode: 'signatureDate' }), />2026-09-16<\/time>/);
  assert.match(renderRuntime(field, '测试人 · 2026-09-16T09:08:07 · 123', { signature: 'signatureDate' }), />2026-09-16<\/time>/);
  const empty = renderRuntime(field, '', { signature: 'signatureDate' });
  assert.match(empty, /点击签名/);
  assert.match(empty, /disabled=""/);
});

test('sub-table rows inherit signature display configuration and keep distinct recorded dates', () => {
  const table = { id: 'table', type: 'subTable', name: '签名记录', typeConfig: { columns: [field] } };
  const html = renderRuntime(table, [{ signature }, { signature: { ...signature, signedAt: '2026-09-17T11:22:33' } }], { signature: 'signatureDate' });
  assert.match(html, />2026-09-16<\/time>/);
  assert.match(html, />2026-09-17<\/time>/);
});
