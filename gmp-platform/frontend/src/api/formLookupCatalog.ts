import { useQuery } from '@tanstack/react-query';
import client from './client';

export interface FormLookupItem {
  id: string; name: string; description: string; type: 'text' | 'number' | 'date'; builtin: boolean; revision: number;
  createdBy: string | null; createdAt: string; updatedBy: string | null; updatedAt: string;
}
export const formLookupCatalogKey = ['form-lookup-items'];
export function useFormLookupItems(enabled = true) {
  return useQuery({ queryKey: formLookupCatalogKey, queryFn: async () =>
    (await client.get('/form-lookup-items')).data.data as FormLookupItem[], staleTime: 0, enabled });
}
export async function saveFormLookupItem(values: { name: string; description: string; type: FormLookupItem['type'] }, item?: FormLookupItem) {
  return item ? client.put(`/form-lookup-items/${item.id}`, { ...values, revision: item.revision })
    : client.post('/form-lookup-items', values);
}
export interface FormLookupBinding {
  templateId: string; versionId: string; revision: number; bindingId: string; tableId: string; fieldId: string;
  templateName: string; version: string; location: string; fieldName: string;
}
export async function deleteFormLookupItem(item: FormLookupItem) {
  return client.delete(`/form-lookup-items/${item.id}`, { params: { revision: item.revision } });
}
export async function getFormLookupBindings(id: string) {
  return (await client.get(`/form-lookup-items/${id}/bindings`)).data.data as FormLookupBinding[];
}
export async function unlinkFormLookupBindings(id: string, bindings: FormLookupBinding[]) {
  return client.post(`/form-lookup-items/${id}/unlink`, bindings.map(({ versionId, revision, bindingId, fieldId }) => ({ versionId, revision, bindingId, fieldId })));
}
export async function getFormLookupBindingPreview(id: string, binding: FormLookupBinding) {
  return (await client.get(`/form-lookup-items/${id}/bindings/preview`, { params: {
    versionId: binding.versionId, bindingId: binding.bindingId, fieldId: binding.fieldId,
  } })).data.data as { id: string; templateId: string; name: string; version: string; modelDesignJson: string; canvasDesignJson: string };
}
