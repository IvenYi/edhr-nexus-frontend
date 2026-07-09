import { FIELD_TYPE, IEditorBasic } from '@gct-paas/core';
import { EditorType } from '../../../constants';

export interface IModelFieldSelectEditor extends IEditorBasic {
  readonly type: EditorType.FORM_MODEL_FIELD_SELECT;

  /**
   * 排除的字段类型
   *
   * @type {FIELD_TYPE[]}
   */
  excludeFieldType?: FIELD_TYPE[];

  /**
   * 排除的字段键
   *
   * @type {string[]}
   */
  excludeFieldKey?: string[];
}
