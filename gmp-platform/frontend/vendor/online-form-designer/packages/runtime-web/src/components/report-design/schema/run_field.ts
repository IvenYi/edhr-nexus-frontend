import { FIELD_TYPE, EntityModelCategoryEnum, SEARCH_SEVICE } from '@gct/runtime';

import {
  SummaryCalculationMethod,
  DateTimeTypeFormattingEnum,
  TimeValueEnum,
  verticalEnum,
  horizontalEnum,
  ReportEnum,
  dimensionEnum,
  emptyValueEnum,
  DateValueEnum,
  DateTimeValueEnum,
  NumberFormattingEnum,
  FormattingEnum,
  NUMBER_FORMAT_TIME_TYPE_ENUM,
  DrillTypeEnum
} from './enum';
import { IReportLinkItem } from '../interface';
export class BaseField {
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
  /**所属表格类型 */
  inReportType: ReportEnum = ReportEnum.CROSS_TABLE;
  /**所属维度 */
  inDimension: dimensionEnum = dimensionEnum.COLUMN;
  /**字段名称 */
  fieldName: string = '';
  /**别名 */
  alias?: string;
  aliasI18n?: string;
  /**水平对齐方式 */
  horizontal: horizontalEnum = horizontalEnum.LEFT;
  /**垂直对齐方式 */
  vertical: verticalEnum = verticalEnum.MIDDLE;
  /**条件格式 */
  Formatting?: Formatting;
  /**冻结列 */
  fixed?: 'left' | 'left';
  /**空值显示 */
  emptyValue: emptyValueEnum = emptyValueEnum.A;
  /**显示格式 */
  format?: DateValueEnum | DateTimeValueEnum | TimeValueEnum;
  /** 数值显示格式 */
  numberFormat?: NumberFormat;
  /** 交叉表 日期时间类型格式 */
  dateTimeTypeFormatting?: DateTimeTypeFormattingEnum;
  /**行总计计算方式 */
  row_function?: SummaryCalculationMethod = SummaryCalculationMethod.SUM;
  /**列总计计算方式 */
  col_function?: SummaryCalculationMethod = SummaryCalculationMethod.SUM;
  /** 聚合方式 */
  polymerization_function?: SummaryCalculationMethod = SummaryCalculationMethod.SUM;
  /**是否显示 */
  visible: boolean = true;
  /** 下钻模式 */
  drillMode?: DrillTypeEnum;
  /** 下钻报表(自定义模式下生效) */
  drillReport?: string;
  /** 下钻字段属性清单(默认下钻生效)，多个属性逗号分割 */
  drillAttrs?: string[];
  /**跳转配置 */
  linkSetting?: IReportLinkItem;
  /**默认查询算子 */
  expId: SEARCH_SEVICE = SEARCH_SEVICE.EQ;
  /**字段原始值 */
  _protoValue_?: any;
  /**字段列索引 */
  _columnIndex_?: number;
  constructor(data: any) {
    this.fieldType = data.fieldType;
    this.id = data.id;
    this.modelKey = data.modelKey;
    this.modelCategory = data.modelCategory;
    this.field = data.key;
  }
}

/**跳转配置 */

/**条件格式 */
class Formatting {
  type: FormattingEnum = FormattingEnum.CTRL_L;
}

/** 数值显示格式 */
export class NumberFormat {
  // 显示格式
  type: NumberFormattingEnum = NumberFormattingEnum.NUMERICAL_VALUE;
  // 小数位数
  precision: number = 0;
  // 时间类型
  timeType: NUMBER_FORMAT_TIME_TYPE_ENUM = NUMBER_FORMAT_TIME_TYPE_ENUM['天 : 时 : 分 : 秒'];
  // 前缀
  prefix: string = '';
  // 后缀
  suffix: string = '';
  // 是否启用千位分隔符
  thousand: boolean = false;
}

/**汇总 */
export class Calculation {
  open: boolean = false;
  totalAlias: string = '总计';
  function: SummaryCalculationMethod = SummaryCalculationMethod.SUM;
  includeNull: boolean = true;
  summaryFields?: string[];
}

