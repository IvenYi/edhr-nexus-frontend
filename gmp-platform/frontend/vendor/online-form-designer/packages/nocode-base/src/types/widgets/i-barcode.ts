import { FIELD_TYPE, CreateType } from '@gct/runtime';
import { PaperWidgeType, PaperWidgeValueType, BwipCodeType } from '../../constant';

import type { BaseCoreComponent } from '../common/base';

export interface IBarcodeProps {
  /** 条形码id */
  id: string;
  /** 页面组件类型 */
  type: PaperWidgeType;
  /** 字段类型 */
  fieldType?: FIELD_TYPE;
  /** 模型key */
  modelKey?: string;
  /** 字段链路 */
  fieldLink?: string;
  /** 是否是关联模型字段 */
  isFieldModel?: boolean;
  /** 子表模型key */
  subModelKey?: string;
  /** 子表字段key */
  subFieldKey?: string;
  /** 字段来源 */
  createType?: CreateType;
  /** 条形码内容类型 */
  valueType: PaperWidgeValueType;
  /** 条形码内容值 */
  value: string;
  /** 是否显示内容 */
  showValue: boolean;
  /** 条形码条码类型 */
  codeType: BwipCodeType.Code39 | BwipCodeType.Code128;
  layout: any;
  styles: any;
}

/** 表格列的属性 */
export interface IBarcode extends BaseCoreComponent.BasicSchema {
  props: IBarcodeProps;
}
