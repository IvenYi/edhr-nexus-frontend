import {
  SignatureTypeEnum,
  SignShowTypeEnum,
  SignatureTimeTypeEnum,
  SignatureNumberTypeEnum,
} from '../../constant';
import type { BaseCoreComponent, IBindField } from '../common/base';

export interface ISignProps extends BaseCoreComponent.FieldBasicProps {
  /** 签名格式 */
  signatureType: SignatureTypeEnum;
  /** 签名显示方式 */
  signDisplayStyle: SignShowTypeEnum;
  /** 签名日期配置 */
  signTimeType: SignatureTimeTypeEnum;
  /** 填充新字段数组 */
  populateFields: IBindField[] | undefined;
  /** 签名人数 */
  signatureNumber: SignatureNumberTypeEnum;
}

export interface ISign extends BaseCoreComponent.BasicSchema {
  props: ISignProps;
}
