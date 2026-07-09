import { EntityModelCategoryEnum } from '@gct/runtime';
import { dimensionEnum } from '../type';
import { fieldTypeEnum } from '../../interface/type';

/**
 * 报表字段
 *
 * @export
 * @interface IReportField
 */
export interface IReportField {
  /**唯一标识 */
  id: string;
  /**字段类型 */
  fieldType: fieldTypeEnum;
  /**字段key */
  field: string;
  /**模型key */
  modelKey: string;
  /**模型大类 */
  modelCategory: EntityModelCategoryEnum;
  /**字段名称 */
  fieldName: string;
  /**公式类型 */
  mappingType: string;
  /**
   * 所属维度
   *
   * @type {dimensionEnum}
   */
  inDimension: dimensionEnum;
  /**别名 */
  colName: string;
  /**别名多语言 */
  aliasI18n?: string;
  type: 'dim' | 'meas';
  fieldSql?: string;
}
