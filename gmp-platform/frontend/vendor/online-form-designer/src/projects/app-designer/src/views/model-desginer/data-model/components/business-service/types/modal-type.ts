export type MedthodType = 'GET' | 'POST' | 'DELETE' | 'PUT';

export interface ServiceInfo {
  name: string;
  key: string;
  method: MedthodType;
  type: string;
  description: string;
  serviceKey: '';
}

export interface TableDataType {
  key: string;
  name: string;
  method: MedthodType;
  type: string;
  description: string;
}
