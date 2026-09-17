import client from './client';
import type { ReferenceValue } from '@/components/form-renderer/referenceConfig';

export const getPreviewReferences = async (config: Record<string, unknown>, keyword: string, values: Record<string, unknown>): Promise<ReferenceValue[]> =>
  (await client.post('/master-data/template-modeling/reference-options', { config, keyword, values })).data.data;
