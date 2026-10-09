type NamedSubject = { type: string; id: string; nameSnapshot?: string };

export function subjectDisplayName(subject: NamedSubject, options: { id: string; name: string }[] = []): string {
  const name = subject.nameSnapshot?.trim() || options.find(item => String(item.id) === String(subject.id))?.name;
  const kind = ({ USER: '用户', ROLE: '角色', DEPARTMENT: '部门', LEGACY: '历史主体' } as Record<string, string>)[subject.type] ?? '主体';
  return name || `${kind} #${subject.id}（名称不可用）`;
}
