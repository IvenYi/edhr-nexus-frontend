import { FieldMetaDTO } from '/@/apis/gct-apaas/model';
import { FIELD_TYPE } from '/@/enums/appEnum';

export type FieldPermissionConfig = {
  /** 是否可编辑 */
  edit: boolean;
  /** 是否只读 */
  readonly: boolean;
  /** 字段的key */
  field: string | undefined;
  /** 字段名称 */
  fieldName: string | undefined;
  /** 字段所属模型key */
  modelKey: string | undefined;
  /** 0:主模型 1:子模型 */
  subModel: number;
};

export type FieldPermissionTableRow = FieldPermissionConfig & {
  /** 字段数据类型 */
  type: FIELD_TYPE;
};

export type ModelMeta = {
  /** 模型名称 */
  title: string;
  /** 模型key */
  modelKey: string;
  /** 0:主模型 1:子模型 */
  subModel: number;
  /** 字段列表 */
  fields: FieldMetaDTO[];
};
