import type { CellWidget } from '/@online-form/views/designer/types/cell-widget';
import { CellWidgetCategory } from '/@online-form/views/designer/enums';
import { FIELD_TYPE } from '@gct/runtime';

export type FieldConfig = CellWidget.AttachField;

/**
 * 单个字段的差异
 * @export
 * @interface FieldDiff
 */
export interface FieldDiff {
  /** 字段翻译名称 */
  fieldName: string;
  /** 字段类型 */
  fieldType: FIELD_TYPE;
  /** 字段标识 */
  fieldKey: string;

  /** 字段类型 */
  type: FieldDiffType;
  /** 旧配置 */
  old?: FieldConfig;
  /** 新配置 */
  new?: FieldConfig;
  /** 所属单元格信息 */
  cellInfo: any;
}

/**
 * 版本差异
 * @export
 * @interface VersionDiff
 */
export interface VersionDiff {
  /** 新增字段 */
  addFields: FieldDiff[];
  /** 删除字段 */
  removeFields: FieldDiff[];
  /** 更新字段 */
  updateFields: FieldDiff[];
}

/**
 * 字段差异类型
 * @export
 * @enum {number}
 */
export enum FieldDiffType {
  /** 新增字段 */
  ADD = 'ADD',
  /** 删除字段 */
  REMOVE = 'REMOVE',
  /** 修改字段 */
  UPDATE = 'UPDATE',
}

/**  */
export const FieldWidgetProperties: Record<CellWidgetCategory, string[]> = {
  [CellWidgetCategory.Text]: ['required', 'disabled', 'maxlength', 'minlength'],
  [CellWidgetCategory.Integer]: [
    'required',
    'disabled',
    'enableRangeValidate',
    'maxValidateMode',
    'minValidateMode',
    'max',
    'maxExpr',
    'maxExprEcho',
    'min',
    'minExpr',
    'minExprEcho',
  ],
};

export const DiffedAttrMaps = {
  inputAttr: ['required', 'disabled'],
  lengthRange: ['maxlength', 'minlength'],
  upperLimits: ['enableRangeValidate', 'maxValidateMode', 'max', 'maxExpr', 'maxExprEcho'],
  lowerLimits: ['enableRangeValidate', 'minValidateMode', 'min', 'minExpr', 'minExprEcho'],
  // upperAndLowerLimits: [
  //   'enableRangeValidate',
  //   'maxValidateMode',
  //   'minValidateMode',
  //   'max',
  //   'min',
  //   'maxExpr',
  //   'minExpr',
  //   'maxExprEcho',
  //   'minExprEcho',
  // ],
  expression: ['exprEcho', 'expr'],
  signNum: ['signatureNumber'],
  signMode: ['signatureType'],
};

export enum DiffedAttrCompsEnum {
  inputAttr = 'inputAttr',
  lengthRange = 'lengthRange',
  upperLimits = 'upperLimits',
  lowerLimits = 'lowerLimits',
  // upperAndLowerLimits = 'upperAndLowerLimits',
  expression = 'attrItem',
  signNum = 'attrItem',
  signMode = 'attrItem',
}

export const NeedI18nAttrs = ['signNum', 'signMode'];
