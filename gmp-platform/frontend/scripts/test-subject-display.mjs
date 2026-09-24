import test from 'node:test';
import assert from 'node:assert/strict';
import ts from 'typescript';
import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('../src/components/identity/subjectDisplay.ts', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext } }).outputText;
const { subjectDisplayName } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`);

test('missing snapshot resolves by ID without mutating the permission subject', () => {
  const subject = Object.freeze({ type: 'ROLE', id: '3' });
  assert.equal(subjectDisplayName(subject, [{ id: '3', name: '生产操作员' }]), '生产操作员');
  assert.deepEqual(subject, { type: 'ROLE', id: '3' });
});
test('existing snapshot remains stable even after identity rename', () => {
  assert.equal(subjectDisplayName({ type: 'USER', id: '3', nameSnapshot: '原名' }, [{ id: '3', name: '新名' }]), '原名');
});
test('unavailable or blank names retain type and ID rather than undefined', () => {
  for (const type of ['USER', 'ROLE', 'DEPARTMENT', 'LEGACY']) {
    const result = subjectDisplayName({ type, id: '42', nameSnapshot: ' ' });
    assert.match(result, /#42（名称不可用）/);
    assert.ok(!result.includes('undefined'));
  }
});
test('an unrelated candidate cannot supply the display name', () => {
  assert.match(subjectDisplayName({ type: 'ROLE', id: '3' }, [{ id: '4', name: '其他角色' }]), /角色 #3/);
});
