import { RangeValidateMode, DecimalDisplayMode, BindCmpStyleEnum } from '../../constant';
import type { BaseCoreComponent } from '../common/base';

export interface IInputNumberProps extends BaseCoreComponent.FieldBasicProps {
  /** 精度位数 */
  precision: number;

  /** 是否开启计数器 */
  enableStepCounter?: boolean;
  /** 计数器步数 */
  stepCounter?: number;

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
  /** 组件类型 */
  bindCompStyleType: BindCmpStyleEnum;
  /** 下拉内容 */
  optionString?: string;
  /** 显示方式 */
  displayMode?: DecimalDisplayMode;
}

export interface IInputNumber extends BaseCoreComponent.BasicSchema {
  props: IInputNumberProps;
}
