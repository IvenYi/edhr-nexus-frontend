import type { BaseCoreComponent, IBindField } from '../common/base';

export interface IRangeLimitProps extends BaseCoreComponent.FieldBasicProps {
  /** 上限值｜上公差 */
  upperLimit?: IBindField;
  /** 下限值｜下公差 */
  lowerLimit?: IBindField;
  /** 标准值 */
  standardValue?: IBindField;
  /** 显示样式 */
  showType?: IBindField;

  /** 上限值文案 */
  upperLimitText?: string;
  /** 上公差文案 */
  upperToleranceText?: string;
  /** 下限值文案 */
  lowerLimitText?: string;
  /** 下公差文案 */
  lowerToleranceText?: string;
  /** 标准值文案 */
  standardValueText?: string;
}

export interface IRangeLimit extends BaseCoreComponent.BasicSchema {
  props: IRangeLimitProps;
}
