import { RangeValidateMode, DecimalDisplayMode } from '../../constant';
import type { BaseCoreComponent } from '../common/base';

export interface IInputDoubleProps extends BaseCoreComponent.FieldBasicProps {
  /** 精度位数 */
  precision: number;

  /** 是否开启上下限 */
  enableRangeValidate?: boolean;
  /** 上限校验模式 */
  maxValidateMode?: RangeValidateMode;
  /** 下限校验模式 */
  minValidateMode?: RangeValidateMode;

  /** 最小值 */
  minValue?: number;
  /** 最小值公式表达式 */
  minFormulaExpr?: string;
  /**最大值 */
  maxValue?: number;
  /**最大值公式表达式 */
  maxFormulaExpr?: string;
  /** 上角标 */
  upSup?: number;
  /** 下角标 */
  downSub?: number;
  /** 公式 */
  formulaExpr?: string;
  /** 显示方式 */
  displayMode?: DecimalDisplayMode;
}

export interface IInputDouble extends BaseCoreComponent.BasicSchema {
  props: IInputDoubleProps;
}
