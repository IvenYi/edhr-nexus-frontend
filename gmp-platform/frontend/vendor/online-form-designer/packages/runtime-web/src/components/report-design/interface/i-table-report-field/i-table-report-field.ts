import {
  DateTimeTypeFormattingEnum,
  DateTimeValueEnum,
  DateValueEnum,
  emptyValueEnum,
  horizontalEnum,
  SummaryCalculationMethod,
  TimeValueEnum,
  verticalEnum,
} from '../../schema';
import { IReportField } from '../i-report-field/i-report-field';
import { SignatureTypeEnum, SignatureStyleEnum } from '/@/projects/page-designer/src/enum';

/**
 * 表格报表字段
 *
 * @export
 * @interface ITableReportField
 * @extends {IReportField}
 */
export interface ITableReportField extends IReportField {
  /**
   * 水平对齐方式
   *
   * @default horizontalEnum.LEFT
   * @type {horizontalEnum}
   */
  horizontal: horizontalEnum;
  /**
   * 垂直对齐方式
   *
   * @default verticalEnum.MIDDLE
   * @type {verticalEnum}
   */
  vertical: verticalEnum;
  /**
   * 总计计算方式
   *
   * @type {SummaryCalculationMethod}
   */
  function?: SummaryCalculationMethod;
  /**
   * 行总计计算方式
   *
   * @type {SummaryCalculationMethod}
   */
  row_function?: SummaryCalculationMethod;
  /**
   * 列总计计算方式
   *
   * @type {SummaryCalculationMethod}
   */
  col_function?: SummaryCalculationMethod;
  /**
   * 指标汇总计算方式
   *
   * @type {SummaryCalculationMethod}
   */
  polymerization_function?: SummaryCalculationMethod;
  /**
   * 空值显示
   *
   * @type {emptyValueEnum}
   */
  emptyValue?: emptyValueEnum;
  /**
   * 日期格式
   *
   * @type {(DateValueEnum | DateTimeValueEnum | TimeValueEnum)}
   */
  format?: DateValueEnum | DateTimeValueEnum | TimeValueEnum;
  /**
   * 聚合方式
   *
   * @type {SummaryCalculationMethod}
   */
  aggregationMethod: SummaryCalculationMethod;
  /**
   * 日期类型格式
   *
   * @type {DateTimeTypeFormattingEnum}
   */
  dateTimeTypeFormatting?: DateTimeTypeFormattingEnum;
  /**
   * 签名格式
   */
  signatureType?: SignatureTypeEnum;
  /**
   * 签名显示样式
   */
  displayStyle?: SignatureStyleEnum;
}
