import type { BaseCoreComponent, IBindField } from '../common/base';

export interface IPowerProps extends BaseCoreComponent.FieldBasicProps {
  /** 基数 */
  baseValueField?: IBindField;
  /** 指数 */
  exponentValueField?: IBindField;
  /** 真实值 */
  valueField?: IBindField;
}

export interface IPower extends BaseCoreComponent.BasicSchema {
  props: IPowerProps;
}
