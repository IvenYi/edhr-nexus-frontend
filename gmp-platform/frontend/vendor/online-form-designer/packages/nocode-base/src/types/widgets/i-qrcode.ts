import { FIELD_TYPE, CreateType } from '@gct/runtime';
import { PaperWidgeType, PaperWidgeValueType, BwipCodeType } from '../../constant';
import type { BaseCoreComponent } from '../common/base';

export interface IQrcodeProps {
  /** 二维码id */
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
  /** 二维码内容类型 */
  valueType: PaperWidgeValueType;
  /** 二维码内容值 */
  value: string;
  /** 二维码条码类型 */
  codeType: BwipCodeType.QRCode | BwipCodeType.GS1DataMatrix;
  layout: any;
}

/** 表格列的属性 */
export interface IQrcode extends BaseCoreComponent.BasicSchema {
  props: IQrcodeProps;
}
