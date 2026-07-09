import { EntityModelCategoryEnum, FIELD_TYPE } from "@gct/runtime";
import { dimensionEnum, DrillTypeEnum } from "../../schema";

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
  fieldType: FIELD_TYPE;
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
  alias?: string;
  /**别名多语言 */
  aliasI18n?: string;
  /** 下钻模式 */
  drillMode?: DrillTypeEnum;
  /** 下钻报表(自定义模式下生效) */
  drillReport?: string;
  drillReportType?: string;
  drillReportName?: string;
  /** 下钻字段属性清单(默认下钻生效)，多个属性逗号分割 */
  drillAttrs?: string;
}
