/**所属维度 */
export enum dimensionEnum {
  /**行 */
  ROW = 'row',
  /**列 */
  COLUMN = 'column',
  /**指标 */
  INDICATOR = 'indicator',
}

/**空值显示 */
export enum emptyValueEnum {
  /**显示-- */
  A = 'a',
  /**显示（空） */
  B = 'b',
  /**显示null*/
  C = 'c',
  /**显示‘’*/
  D = 'd',
  /**显示自定义*/
  E = 'e',
}

/**
 * 属性上下文菜单行为标识
 *
 * @export
 * @enum {number}
 */
export enum MENU_ACTION {
  /**
   * 删除
   */
  DELETE = 'delete',
  /**
   * 修改名称
   */
  CHANGE_NAME = 'change-name',
  EDIT = 'edit',
}

/**排序 */
export enum sortTypeEnum {
  /**不排序 */
  NO = 'no',
  /**升序 */
  ASC = 'asc',
  /**降序 */
  DESC = 'desc',
  /**自定义 */
  CUSTOM = 'custom',
}

/**BI复合字段类型 */
export enum fieldTypeEnum {
  /**维度文本 */
  DIMTEXT = 'dim_text',
  /**维度数字 */
  DIMNUMBER = 'dim_number',
  /**维度日期 */
  DIMDATE = 'dim_date',
  /**维度日期 */
  DIMIMG = 'dim_img',
  /**度量文本 */
  MEASTEXT = 'meas_text',
  /**度量数字 */
  MEASNUMBER = 'meas_number',
  /**度量日期 */
  MEASDATE = 'meas_date',
}

/**
 * BI的基础字段类型
 *
 * @export
 * @enum {number}
 */
export enum BIFieldTypeEnum {
  TEXT = 'text',
  NUMBER = 'number',
  DATE = 'date',
  IMG = 'img',
}

export interface DataSetColType {
  colName: string;
  fieldName: string;
  fieldType: fieldTypeEnum;
  key?: string;
  type: 'dim' | 'meas';
  emptyValue?: emptyValueEnum;
  emptyStr?: string;
  sortType?: sortTypeEnum;
  customSortArr?: any[];
  alias?: string;
  fieldSql?: string;
  formula?: string;
  originKey?: string;
  isAggFunc?: boolean;
}

/**
 * API数据源步骤
 *
 * @export
 * @enum {number}
 */
export enum APIDataSetStep {
  /**
   * 字段配置
   */
  FIELD_CONFIG = 'field-config',
  /**
   * 数据集配置
   */
  DATASET_CONFIG = 'dataset-config',
}
