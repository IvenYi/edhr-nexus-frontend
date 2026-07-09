export type MedthodType = 'GET' | 'POST' | 'DELETE' | 'PUT';

export interface ServiceInfo {
  name: string;
  key: string;
  method: MedthodType;
  type: string;
  description: string;
  serviceKey?: '';
  modelKey?: string;
  modelName?: string;
  authMethod?: string;
  i18nConfig?: string;
  mutex?: boolean;
}

export interface TableDataType {
  key: string;
  name: string;
  method: MedthodType;
  type: string;
  description: string;
}
