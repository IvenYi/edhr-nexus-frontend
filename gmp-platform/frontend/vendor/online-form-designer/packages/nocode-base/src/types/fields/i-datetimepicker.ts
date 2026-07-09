import { RangeValidateMode } from '../../constant';
import type { BaseCoreComponent } from '../common/base';

export interface IDateTimepickerProps extends BaseCoreComponent.FieldBasicProps {
  /**组件类型 */
  dateType: 'YYYY HH' | 'YYYY-MM HH:mm' | 'YYYY-MM-DD HH:mm:ss';
  /** 分割符 */
  separator: string;
  /** 日期类型 */
  format: string;
  /**是否启用自定义格式化 */
  enableCustomFormat: boolean;
  /** 自定义格式化字符串 */
  customFormat: string;
  /**默认系统日期 */
  defaultSysDate?: boolean;

  /** 是否开启上下限 */
  enableRangeValidate?: boolean;
  /** 上限校验模式 */
  maxDateValidateMode?: RangeValidateMode;
  /** 下限校验模式 */
  minDateValidateMode?: RangeValidateMode;
  /** 最小日期 */
  minDate?: number;
  /** 最小值公式表达式 */
  minDateFormulaExpr?: string;
  /**最大日期 */
  maxDate?: number;
  /**最大值公式表达式 */
  maxDateFormulaExpr?: string;
}

export interface IDateTimepicker extends BaseCoreComponent.BasicSchema {
  props: IDateTimepickerProps;
}
