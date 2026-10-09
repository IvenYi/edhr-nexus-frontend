import type { FieldPermissions } from './types';

export function permissionSummary(
  subject: { id: string; defaultPermission: 'EDIT' | 'READ_ONLY' },
  permissions: FieldPermissions | undefined,
  fields: { id: string; name: string }[],
) {
  const rule = permissions?.[subject.id];
  const permission = rule?.defaultPermission ?? subject.defaultPermission;
  const ids = [...new Set((permission === 'EDIT' ? rule?.readOnlyFieldIds : rule?.editableFieldIds) ?? [])];
  const names = ids.map(id => fields.find(field => field.id === id)?.name || `字段 #${id}`);
  const defaultLabel = permission === 'EDIT' ? '默认可编辑' : '默认只读';
  const exceptionLabel = permission === 'EDIT' ? '只读例外' : '可编辑例外';
  return { defaultLabel, exceptionLabel, names, text: `${defaultLabel} · ${names.length ? `${names.length} 个${exceptionLabel}字段` : '无例外字段'}` };
}

export function signatureBindingSummary(
  events: { key: string }[],
  bindings: Record<string, { fieldId?: string }> | undefined,
) {
  const pending = events.filter(event => !bindings?.[event.key]?.fieldId?.trim()).length;
  return { pending, bound: events.length - pending };
}
