import type { ExecutionView } from '@/api/production-execution';

export function executionForms(view: ExecutionView | null, operationId: string) {
  return view?.snapshot.operations.flatMap(op => op.forms.filter(form => op.id === operationId || form.scope === 'BATCH')) ?? [];
}

export function formOwner(view: ExecutionView | null, operationId: string, formId: string) {
  return view?.snapshot.operations.find(op => op.forms.some(form => form.id === formId && (op.id === operationId || form.scope === 'BATCH')))?.id ?? operationId;
}

export function visibleFormCopies(view: ExecutionView | null, operationId: string) {
  return Object.fromEntries(executionForms(view, operationId).flatMap(form => {
    const group = view?.availability[formOwner(view, operationId, form.id)]?.formCopies?.[form.id];
    return group ? [[form.id, group]] : [];
  }));
}
