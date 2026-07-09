import { EntityModelCategoryEnum } from '@gct/runtime';
import { IReportField } from '../i-report-field/i-report-field';

/**
 * 报表配置具体schema
 *
 * @export
 * @interface IReportSchema
 */
export interface IReportSchema {
  /**唯一标识 */
  _key: string;
  /**
   * 具体报表类型（table-x、chart-x、等）
   *
   * @type {string}
   */
  reportType: string;
  /**
   * 报表模型
   *
   * @type {string}
   */
  modelKey?: string;
  /**
   * 报表模型名称
   *
   * @type {string}
   */
  modelName?: string;
  /**
   * 表单模型 Id
   */
  formId?: string;
  /**
   * 是否是数据集
   *
   * @type {boolean}
   */
  isDataSet?: boolean;
  /**
   * 报表模型类型
   *
   * @type {EntityModelCategoryEnum}
   */
  modelCategory?: EntityModelCategoryEnum;
  categorySelect?: string;
  /**
   * 报表字段集合
   *
   * @type {{[key: string]: IReportField}}
   */
  fieldMap: { [key: string]: IReportField };
  /**
   * 报表下钻字段集合
   *
   * @type {{[key: string]: IReportField}}
   */
  drillMap: { [key: string]: IReportField };
}
