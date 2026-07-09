import { FIELD_TYPE } from '@gct/runtime';

export interface IModelField {
  /**
   * 字段所属模型key
   */
  model: string;
  /**
   * 字段的key
   */
  field: string;
  /**
   * 主模型里子模型关联字段
   */
  subModelField?: string;
  /**
   * 字段类型
   */
  fieldType: FIELD_TYPE;
}

/**
 * 模型字段分组
 * @export
 * @interface IModelFieldGroup
 */
export interface IModelFieldGroup {
  key: string;
  label: string;
  options: Array<{
    value: string;
    label: string;
  }>;
}
