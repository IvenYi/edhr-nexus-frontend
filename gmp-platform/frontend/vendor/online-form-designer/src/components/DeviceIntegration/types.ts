export interface DeviceRow {
  deviceId: string;
  deviceType: string;
  deviceKey: string;
}

export interface SchemaProperty {
  description?: string;
  type?: string;
  sort?: string | number;
  required?: boolean;
  remark?: string;
  items?: {
    type?: string;
    properties?: Record<string, SchemaProperty>;
  };
}

export interface Schema {
  type?: string;
  properties?: Record<string, SchemaProperty>;
}

export interface FieldConfig {
  field: string;
  label: string;
  type: string;
  required: boolean;
  defaultValue: any;
  sort: number;
  remark: string;
  _hasChecked: boolean;
  children?: FieldConfig[];
  toField?: string;
}
