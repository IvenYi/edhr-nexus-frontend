import client from './client';
import type { ReferenceValue, ReferencePageRequest } from '@/components/form-renderer/referenceConfig';

export interface ReferenceDictionary { id: string; code: string; name: string; status: string }
export interface ReferenceMaterialType { id: string; code: string; name: string }
export const getReferenceMaterialTypes = async (): Promise<ReferenceMaterialType[]> =>
  (await client.get('/master-data/template-modeling/reference-options/material-types')).data.data;
export const getReferenceDictionaries = async (params: { keyword?: string; id?: string }): Promise<ReferenceDictionary[]> =>
  (await client.get('/master-data/template-modeling/reference-options/dictionaries', { params })).data.data;

export const getPreviewReferences = async (config: Record<string, unknown>, keyword: string, values: Record<string, unknown>, paging?: ReferencePageRequest): Promise<ReferenceValue[]> =>
  (await client.post('/master-data/template-modeling/reference-options', { config, keyword, values, ...paging })).data.data;
