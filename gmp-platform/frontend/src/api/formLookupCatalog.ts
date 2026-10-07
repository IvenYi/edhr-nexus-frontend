import { useQuery } from '@tanstack/react-query';
import client from './client';

export interface FormLookupItem {
  id: string; name: string; description: string; type: 'text'; builtin: boolean; revision: number;
  createdBy: string | null; createdAt: string; updatedBy: string | null; updatedAt: string;
}
export const formLookupCatalogKey = ['form-lookup-items'];
export function useFormLookupItems() {
  return useQuery({ queryKey: formLookupCatalogKey, queryFn: async () =>
    (await client.get('/form-lookup-items')).data.data as FormLookupItem[], staleTime: 0 });
}
export async function saveFormLookupItem(values: { name: string; description: string }, item?: FormLookupItem) {
  return item ? client.put(`/form-lookup-items/${item.id}`, { ...values, revision: item.revision })
    : client.post('/form-lookup-items', values);
}
