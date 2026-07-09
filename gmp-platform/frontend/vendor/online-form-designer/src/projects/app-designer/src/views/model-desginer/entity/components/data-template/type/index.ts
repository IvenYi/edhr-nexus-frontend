import { ExcelColumnInfo } from '/@/apis/gct-apaas/model';

export enum DataTemplateEnum {
  IMPORT = 'IMPORT',
  EXPORT = 'EXPORT',
}

export enum DuplicateKeyUpdateEnum {
  NEW = 0,
  NEWANDUPDATED = 1,
}

export enum ImportModeEnum {
  NEW = 0,
  UPDATE = 2,
  NEW_UPDATE = 1,
}
export interface DataTemplateType {
  name: string;
  type: DataTemplateEnum;
  key: string;
  description?: string;
  configJson?: object;
}

export interface DataTemplateInfo {
  name: string;
  type: DataTemplateEnum;
  key: string;
  updateUser: string;
  updateTime: string;
}

export interface TemplateSettings {
  notes: string;
  rowHeight: number;
  duplicateKeyUpdate: DuplicateKeyUpdateEnum;
  uniqueColumns: string[];
}

export interface ColumnSettingBasicType {
  aliasName: string;
  columnWidth: number;
  required: boolean;
}

type ValueMapType = {
  comment: string;
  value: string;
};
export interface ColumnSettingType extends ColumnSettingBasicType {
  digits?: number;
  dateFormat?: string;
  relationColumns?: Array<string>;
  valueMap?: ValueMapType[];
  duplicateKeyUpdate?: number;
  treeNodeColumnField?: string;
  dataDelimiter?: string;
  fieldDelimiter?: string;
}

export interface FieldColumnType extends ExcelColumnInfo {
  checked: boolean;
  /** 表头字段列表如果是必填字段需要置灰 */
  fieldDisabled?: boolean;
  /** 列配置如果是必填字段需要置灰 */
  columnDisabled?: boolean;
  name: string;
  regularExpForShow?: string;
  title?: string;
  width: number;
}
