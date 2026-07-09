import { CreateType, FIELD_TYPE, IModalData } from '@gct/runtime';
import { IFieldContextItem, IReportField, ITableReportField } from '../interface';
import { DateTimeTypeFormattingEnum, dimensionEnum, SummaryCalculationMethod } from '../schema';
import { NumberDisplayFormatModel } from '../components';
import { ReportViewController } from '../controller';
import {
  DATE_FORMAT_ENUM,
  DATE_FORMAT_Q_ENUM,
  DATE_FORMAT_Y_ENUM,
  DATE_FORMAT_Y_M_D_ENUM,
  DATE_FORMAT_Y_M_D_H_M_ENUM,
  DATE_FORMAT_Y_M_D_H_M_S_ENUM,
  DATE_FORMAT_Y_M_ENUM,
  DATE_FORMAT_Y_Q_ENUM,
  DATE_TIME_FORMAT_ENUM,
  TIME_FORMAT_ENUM,
} from '../constants';
import { DataSetReturnTypeEnum } from '/@/components/Expression';

/**
 * 过滤报表可用字段
 *
 * @export
 * @param {IObject[]} fields
 * @param {(field: IObject) => boolean} filter
 * @returns {*}  {IObject[]}
 */
export function filterReportFields(fields: IObject[]): IObject[] {
  return fields.filter((field) => {
    switch (field.createType) {
      case CreateType.SYSTEM:
      case CreateType.BUILTIN:
      case CreateType.USER_DEFINED:
      case CreateType.CUSTOM:
      default:
    }
    // 文本、长文本、整数、长整数、小数、精度小数、布尔
    // 日期、时间、日期时间、序列号、图片、人员关联、人员多选、部门关联、部门多选
    // 枚举关联、枚举多选、模型关联、模型多选、版本模型关联
    // 公式、汇总、标签模板、单据模板、打印机、消息模板、在线表单模板、eDHR板、事务字段
    // 签名
    switch (field.type) {
      case FIELD_TYPE.TEXT:
      case FIELD_TYPE.LONG_TEXT:
      case FIELD_TYPE.INTEGER:
      case FIELD_TYPE.LONG:
      case FIELD_TYPE.DOUBLE:
      case FIELD_TYPE.DECIMAL:
      case FIELD_TYPE.BOOLEAN:
      case FIELD_TYPE.DATE:
      case FIELD_TYPE.TIME:
      case FIELD_TYPE.DATE_TIME:
      case FIELD_TYPE.SERIAL:
      case FIELD_TYPE.USER:
      case FIELD_TYPE.USER_MULTI:
      case FIELD_TYPE.ORG:
      case FIELD_TYPE.ORG_MULTI:
      case FIELD_TYPE.ENUM:
      case FIELD_TYPE.ENUM_MULTI:
      case FIELD_TYPE.REF:
      case FIELD_TYPE.REF_MULTI:
      case FIELD_TYPE.RDO_REF:
      case FIELD_TYPE.EXPRESSION:
      case FIELD_TYPE.AGG:
      case FIELD_TYPE.LABEL_TEMPLATE_REF:
      case FIELD_TYPE.DOCUMENT_TEMPLATE:
      case FIELD_TYPE.PRINTER:
      case FIELD_TYPE.MESSAGE_TMPL:
      case FIELD_TYPE.ONLINE_FORM_TEMPLATE:
      case FIELD_TYPE.E_DHR_TEMPLATE:
      case FIELD_TYPE.TRANSACTION:
      case FIELD_TYPE.MATERIAL_NO:
      case FIELD_TYPE.RELATED_LOT_NO:
      case FIELD_TYPE.PRODUCT:
      case FIELD_TYPE.DEVICE:
      case FIELD_TYPE.MFG_ORDER:
      case FIELD_TYPE.RECORD_NO:
      case FIELD_TYPE.ORDER_NO:
      case FIELD_TYPE.TRACE_DATE:
      case FIELD_TYPE.ROUTING_OPERATION:
      case FIELD_TYPE.GOOD_QTY:
      case FIELD_TYPE.NOT_GOOD_QTY:
      case FIELD_TYPE.REPORT_START_TIME:
      case FIELD_TYPE.REPORT_END_TIME:
      case FIELD_TYPE.PRODUCTION_DATE:
      case FIELD_TYPE.WORK_HOURS:
      case FIELD_TYPE.NOT_GOOD_REASON:
      case FIELD_TYPE.NOT_GOOD_GROUP:
      case FIELD_TYPE.SCRAP_REASON:
      case FIELD_TYPE.SCRAP_GROUP:
      case FIELD_TYPE.SCRAP_QTY:
      case FIELD_TYPE.SCRAP_MATERIAL:
      case FIELD_TYPE.SCRAP_MATERIAL_NO:
      case FIELD_TYPE.DESTRUCTIVE_TEST_QTY:
      case FIELD_TYPE.PRODUCT_CHECK_QTY:
      case FIELD_TYPE.MATERIAL_CHECK_QTY:
      case FIELD_TYPE.DEVICE_REF:
      case FIELD_TYPE.DEVICE_REF_MULTI:
      case FIELD_TYPE.FUNCTION:
        return true;
      case FIELD_TYPE.REPORTER:
      case FIELD_TYPE.SIGNATURE:
      case FIELD_TYPE.IMAGE:
      case FIELD_TYPE.WAREHOUSE_MANAGER:
        if (field.inDimension === dimensionEnum.INDICATOR) {
          return false;
        } else {
          return true;
        }
      default:
        return false;
    }
  });
}

/**
 * 获取聚合方式菜单
 *
 * @export
 * @param {IReportField} data
 * @returns {*}  {IFieldContextItem[]}
 */
export function getPolymerizationMethodMenus(data: IReportField): IFieldContextItem | null {
  // [整数、长整数、小数、精度小数、汇总、公式（返回值 整数、长整数、精度小数）、自建公式（返回数值）]走这里
  switch (data.fieldType) {
    case FIELD_TYPE.INTEGER:
    case FIELD_TYPE.LONG:
    case FIELD_TYPE.DOUBLE:
    case FIELD_TYPE.DECIMAL:
    case FIELD_TYPE.AGG:
    case FIELD_TYPE.EXPRESSION:
    case FIELD_TYPE.FUNCTION:
      const isTrue = () => {
        if (data.fieldType === FIELD_TYPE.EXPRESSION) {
          switch (data.mappingType) {
            case FIELD_TYPE.INTEGER:
            case FIELD_TYPE.LONG:
            case FIELD_TYPE.DECIMAL:
              return true;
            default:
              return false;
          }
        }
        // 汇总（日期、时间、日期时间），不走这里
        if (data.fieldType === FIELD_TYPE.AGG) {
          switch (data.mappingType) {
            case FIELD_TYPE.DATE:
            case FIELD_TYPE.TIME:
            case FIELD_TYPE.DATE_TIME:
              return false;
            default:
              return true;
          }
        }
        // 自建公式（返回数值）
        if (data.fieldType === FIELD_TYPE.FUNCTION) {
          switch (data.mappingType) {
            case DataSetReturnTypeEnum.Double:
              return true;
            default:
              return false;
          }
        }
        return true;
      };
      if (isTrue()) {
        return {
          mode: 'select',
          label: '聚合方式',
          name: 'polymerization_function',
          fieldKey: 'polymerization_function',
          children: [
            {
              mode: 'select-item',
              label: '求和',
              name: 'SUM',
              value: SummaryCalculationMethod.SUM,
            },
            {
              mode: 'select-item',
              label: '计数',
              name: 'COUNT',
              value: SummaryCalculationMethod.COUNT,
            },
            {
              mode: 'select-item',
              label: '去重计数',
              name: 'NO_REPEAT_COUNT',
              value: SummaryCalculationMethod.NO_REPEAT_COUNT,
            },
            {
              mode: 'select-item',
              label: '平均值',
              name: 'AVG',
              value: SummaryCalculationMethod.AVG,
            },
            {
              mode: 'select-item',
              label: '最大值',
              name: 'MAX',
              value: SummaryCalculationMethod.MAX,
            },
            {
              mode: 'select-item',
              label: '最小值',
              name: 'MIN',
              value: SummaryCalculationMethod.MIN,
            },
          ],
        };
      }
  }
  // 文本、长文本、序列号、公式（返回值 文本、长文本、布尔）、图片、日期、时间、日期时间、布尔、人员关联、人员多选、部门关联、部门多选、枚举关联、枚举多选、模型关联、模型多选、版本模型关联、标签模板、单据模板、打印机、消息模板、在线表单模板、eDHR模板、事务字段、自建公式（返回字符串）
  switch (data.fieldType) {
    case FIELD_TYPE.TEXT:
    case FIELD_TYPE.LONG_TEXT:
    case FIELD_TYPE.SERIAL:
    case FIELD_TYPE.EXPRESSION:
    case FIELD_TYPE.BOOLEAN:
    case FIELD_TYPE.USER:
    case FIELD_TYPE.USER_MULTI:
    case FIELD_TYPE.ORG:
    case FIELD_TYPE.ORG_MULTI:
    case FIELD_TYPE.ENUM:
    case FIELD_TYPE.ENUM_MULTI:
    case FIELD_TYPE.REF:
    case FIELD_TYPE.REF_MULTI:
    case FIELD_TYPE.RDO_REF:
    case FIELD_TYPE.LABEL_TEMPLATE_REF:
    case FIELD_TYPE.DOCUMENT_TEMPLATE:
    case FIELD_TYPE.PRINTER:
    case FIELD_TYPE.MESSAGE_TMPL:
    case FIELD_TYPE.ONLINE_FORM_TEMPLATE:
    case FIELD_TYPE.E_DHR_TEMPLATE:
    case FIELD_TYPE.TRANSACTION:
    case FIELD_TYPE.IMAGE:
    case FIELD_TYPE.DATE:
    case FIELD_TYPE.TIME:
    case FIELD_TYPE.DATE_TIME:
    case FIELD_TYPE.AGG:
    case FIELD_TYPE.SIGNATURE:
    case FIELD_TYPE.FUNCTION:
      const isTrue = () => {
        if (data.fieldType === FIELD_TYPE.EXPRESSION) {
          switch (data.mappingType) {
            case FIELD_TYPE.TEXT:
            case FIELD_TYPE.LONG_TEXT:
            case FIELD_TYPE.BOOLEAN:
              return true;
            default:
              return false;
          }
        }
        // 汇总（日期、时间、日期时间），不走这里
        if (data.fieldType === FIELD_TYPE.AGG) {
          switch (data.mappingType) {
            case FIELD_TYPE.DATE:
            case FIELD_TYPE.TIME:
            case FIELD_TYPE.DATE_TIME:
              return true;
            default:
              return false;
          }
        }
        // 自建公式（返回字符串）
        if (data.fieldType === FIELD_TYPE.FUNCTION) {
          switch (data.mappingType) {
            case DataSetReturnTypeEnum.String:
              return true;
            default:
              return false;
          }
        }
        return true;
      };
      if (isTrue()) {
        return {
          mode: 'select',
          label: '聚合方式',
          name: 'polymerization_function',
          fieldKey: 'polymerization_function',
          children: [
            {
              mode: 'select-item',
              label: '计数',
              name: 'COUNT',
              value: SummaryCalculationMethod.COUNT,
            },
            {
              mode: 'select-item',
              label: '去重计数',
              name: 'NO_REPEAT_COUNT',
              value: SummaryCalculationMethod.NO_REPEAT_COUNT,
            },
          ],
        };
      }
      break;
    default:
  }
  return null;
}

// 根据字段类型，返回可用的聚合方式清单
export function getPolymerizationMethodByFieldType(data: IReportField): SummaryCalculationMethod[] {
  // 整数、长整数、小数、精度小数、汇总（返回值：日期、日期时间、时间）、公式(返回值: 整数、长整数、精度小数):求和、计数去重计数、平均值、最大值、最小值、无
  // 其余字段:计数、去重计数、无
  const methods: SummaryCalculationMethod[] = [
    SummaryCalculationMethod.COUNT,
    SummaryCalculationMethod.NO_REPEAT_COUNT,
    SummaryCalculationMethod.NONE,
  ];
  switch (data.fieldType) {
    case FIELD_TYPE.AGG:
      // 汇总返回值类型：日期、时间、日期时间，则返回默认可选项
      if (
        [FIELD_TYPE.DATE, FIELD_TYPE.TIME, FIELD_TYPE.DATE_TIME].includes(
          data.mappingType as FIELD_TYPE,
        )
      ) {
        return methods;
      }
      break;
    case FIELD_TYPE.EXPRESSION:
      // 公式返回值类型不是：整数、长整数、精度小数，则返回默认可选项
      if (
        ![FIELD_TYPE.INTEGER, FIELD_TYPE.LONG, FIELD_TYPE.DECIMAL].includes(
          data.mappingType as FIELD_TYPE,
        )
      ) {
        return methods;
      }
      break;
    case FIELD_TYPE.FUNCTION:
      // 自建显示字段返回数值类型
      if (![DataSetReturnTypeEnum.Double].includes(data.mappingType as FIELD_TYPE)) {
        return methods;
      } else {
        return [
          SummaryCalculationMethod.SUM,
          SummaryCalculationMethod.COUNT,
          SummaryCalculationMethod.NO_REPEAT_COUNT,
          SummaryCalculationMethod.AVG,
          SummaryCalculationMethod.MAX,
          SummaryCalculationMethod.MIN,
          SummaryCalculationMethod.NONE,
        ];
      }
      break;
    case FIELD_TYPE.INTEGER:
    case FIELD_TYPE.LONG:
    case FIELD_TYPE.DOUBLE:
    case FIELD_TYPE.DECIMAL:
      return [
        SummaryCalculationMethod.SUM,
        SummaryCalculationMethod.COUNT,
        SummaryCalculationMethod.NO_REPEAT_COUNT,
        SummaryCalculationMethod.AVG,
        SummaryCalculationMethod.MAX,
        SummaryCalculationMethod.MIN,
        SummaryCalculationMethod.NONE,
      ];
  }
  return methods;
}

/**
 * 获取聚合方式默认值
 *
 * @export
 * @param {IReportField} data
 * @returns {*}  {(SummaryCalculationMethod | null)}
 */
export function getPolymerizationMethodDefValue(
  data: IReportField,
): SummaryCalculationMethod | null {
  // [整数、长整数、小数、精度小数、汇总、公式（返回值 整数、长整数、精度小数）、自建公式（返回数值）]走这里
  switch (data.fieldType) {
    case FIELD_TYPE.INTEGER:
    case FIELD_TYPE.LONG:
    case FIELD_TYPE.DOUBLE:
    case FIELD_TYPE.DECIMAL:
    case FIELD_TYPE.AGG:
    case FIELD_TYPE.EXPRESSION:
    case FIELD_TYPE.FUNCTION:
      const isTrue = () => {
        if (data.fieldType === FIELD_TYPE.EXPRESSION) {
          switch (data.mappingType) {
            case FIELD_TYPE.INTEGER:
            case FIELD_TYPE.LONG:
            case FIELD_TYPE.DECIMAL:
              return true;
            default:
              return false;
          }
        }
        // 汇总（日期、时间、日期时间），不走这里
        if (data.fieldType === FIELD_TYPE.AGG) {
          switch (data.mappingType) {
            case FIELD_TYPE.DATE:
            case FIELD_TYPE.TIME:
            case FIELD_TYPE.DATE_TIME:
              return false;
            default:
              return true;
          }
        }
        /** 自定义公式字段 */
        if (data.fieldType === FIELD_TYPE.FUNCTION) {
          switch (data.mappingType) {
            case DataSetReturnTypeEnum.Double:
              return true;
            default:
              return false;
          }
        }
        return true;
      };
      if (isTrue()) {
        return SummaryCalculationMethod.SUM;
      }
  }
  // 文本、长文本、序列号、公式（返回值 文本、长文本、布尔）、图片、日期、时间、日期时间、布尔、人员关联、人员多选、部门关联、部门多选、枚举关联、枚举多选、模型关联、模型多选、版本模型关联、标签模板、单据模板、打印机、消息模板、在线表单模板、eDHR模板、事务字段、自建公式（返回字符串）
  switch (data.fieldType) {
    case FIELD_TYPE.TEXT:
    case FIELD_TYPE.LONG_TEXT:
    case FIELD_TYPE.SERIAL:
    case FIELD_TYPE.EXPRESSION:
    case FIELD_TYPE.BOOLEAN:
    case FIELD_TYPE.USER:
    case FIELD_TYPE.USER_MULTI:
    case FIELD_TYPE.ORG:
    case FIELD_TYPE.ORG_MULTI:
    case FIELD_TYPE.ENUM:
    case FIELD_TYPE.ENUM_MULTI:
    case FIELD_TYPE.REF:
    case FIELD_TYPE.REF_MULTI:
    case FIELD_TYPE.RDO_REF:
    case FIELD_TYPE.LABEL_TEMPLATE_REF:
    case FIELD_TYPE.DOCUMENT_TEMPLATE:
    case FIELD_TYPE.PRINTER:
    case FIELD_TYPE.MESSAGE_TMPL:
    case FIELD_TYPE.ONLINE_FORM_TEMPLATE:
    case FIELD_TYPE.E_DHR_TEMPLATE:
    case FIELD_TYPE.TRANSACTION:
    case FIELD_TYPE.IMAGE:
    case FIELD_TYPE.DATE:
    case FIELD_TYPE.TIME:
    case FIELD_TYPE.DATE_TIME:
    case FIELD_TYPE.AGG:
    case FIELD_TYPE.FUNCTION:
      const isTrue = () => {
        if (data.fieldType === FIELD_TYPE.EXPRESSION) {
          switch (data.mappingType) {
            case FIELD_TYPE.TEXT:
            case FIELD_TYPE.LONG_TEXT:
            case FIELD_TYPE.BOOLEAN:
              return true;
            default:
              return false;
          }
        }
        // 汇总（日期、时间、日期时间），走这里
        if (data.fieldType === FIELD_TYPE.AGG) {
          switch (data.mappingType) {
            case FIELD_TYPE.DATE:
            case FIELD_TYPE.TIME:
            case FIELD_TYPE.DATE_TIME:
              return true;
            default:
              return false;
          }
        }
        /** 自定义公式字段 */
        if (data.fieldType === FIELD_TYPE.FUNCTION) {
          switch (data.mappingType) {
            case DataSetReturnTypeEnum.String:
              return true;
            default:
              return false;
          }
        }
        return true;
      };
      if (isTrue()) {
        return SummaryCalculationMethod.COUNT;
      }
      break;
    default:
      break;
  }

  return null;
}

function calcFieldTypeFormatEnum(data: ITableReportField): Record<string, string> | null {
  const type = data.dateTimeTypeFormatting;
  if (
    data.fieldType === FIELD_TYPE.DATE_TIME ||
    (data.fieldType === FIELD_TYPE.AGG && data.mappingType === FIELD_TYPE.DATE_TIME)
  ) {
    switch (type) {
      case DateTimeTypeFormattingEnum.YEAR_MONTH_DAY_HH_MM:
        return DATE_FORMAT_Y_M_D_H_M_ENUM;
      case DateTimeTypeFormattingEnum.YEAR_MONTH_DAY_HH_SS:
        return DATE_FORMAT_Y_M_D_H_M_S_ENUM;
    }
  }
  switch (type) {
    case DateTimeTypeFormattingEnum.YEAR:
      return DATE_FORMAT_Y_ENUM;
    case DateTimeTypeFormattingEnum.YEAR_QUARTER:
      return DATE_FORMAT_Y_Q_ENUM;
    case DateTimeTypeFormattingEnum.YEAR_MONTH:
      return DATE_FORMAT_Y_M_ENUM;
    case DateTimeTypeFormattingEnum.YEAR_MONTH_DAY:
      return DATE_FORMAT_Y_M_D_ENUM;
    case DateTimeTypeFormattingEnum.QUARTER:
      return DATE_FORMAT_Q_ENUM;
  }
  return null;
}

export function calcFieldTypeFormatEnumBySchedule(
  data: ITableReportField,
): Record<string, string> | null {
  if (
    data.fieldType === FIELD_TYPE.DATE_TIME ||
    (data.fieldType === FIELD_TYPE.AGG && data.mappingType === FIELD_TYPE.DATE_TIME)
  ) {
    return DATE_TIME_FORMAT_ENUM;
  }
  if (
    data.fieldType === FIELD_TYPE.DATE ||
    (data.fieldType === FIELD_TYPE.AGG && data.mappingType === FIELD_TYPE.DATE)
  ) {
    return DATE_FORMAT_ENUM;
  }
  if (
    data.fieldType === FIELD_TYPE.TIME ||
    (data.fieldType === FIELD_TYPE.AGG && data.mappingType === FIELD_TYPE.TIME)
  ) {
    return TIME_FORMAT_ENUM;
  }
  return null;
}

export function getFieldTypeFormatMenusBySchedule(data: IReportField): IFieldContextItem | null {
  if (
    data.fieldType === FIELD_TYPE.DATE ||
    data.fieldType === FIELD_TYPE.DATE_TIME ||
    data.fieldType === FIELD_TYPE.TIME ||
    data.fieldType === FIELD_TYPE.AGG
  ) {
    // 汇总（日期、时间、日期时间），走这里
    if (data.fieldType === FIELD_TYPE.AGG) {
      if (
        data.mappingType !== FIELD_TYPE.DATE &&
        data.mappingType !== FIELD_TYPE.DATE_TIME &&
        data.mappingType !== FIELD_TYPE.TIME
      ) {
        return null;
      }
    }
    const map = calcFieldTypeFormatEnumBySchedule(data as ITableReportField);
    let label = '';
    if (
      data.fieldType === FIELD_TYPE.DATE ||
      (data.fieldType === FIELD_TYPE.AGG && data.mappingType === FIELD_TYPE.DATE)
    ) {
      label = '日期显示格式';
    } else if (
      data.fieldType === FIELD_TYPE.DATE_TIME ||
      (data.fieldType === FIELD_TYPE.AGG && data.mappingType === FIELD_TYPE.DATE_TIME)
    ) {
      label = '日期时间显示格式';
    } else if (
      data.fieldType === FIELD_TYPE.TIME ||
      (data.fieldType === FIELD_TYPE.AGG && data.mappingType === FIELD_TYPE.TIME)
    ) {
      label = '时间显示格式';
    }
    if (map) {
      const values = Object.keys(map);
      return {
        mode: 'select',
        label,
        name: 'DateDisplayFormat',
        fieldKey: 'format',
        children: values.map((item) => {
          return {
            mode: 'select-item',
            label: map[item],
            name: map[item],
            value: map[item],
          };
        }),
      };
    }
  }
  return null;
}

/**
 * 设置属性类型格式化配置菜单
 *
 * @export
 * @param {IReportField} data
 * @returns {*}  {(IFieldContextItem | null)}
 */
export function getFieldTypeFormatMenus(data: IReportField): IFieldContextItem | null {
  if (
    data.fieldType === FIELD_TYPE.DATE ||
    (data.fieldType === FIELD_TYPE.AGG && data.mappingType === FIELD_TYPE.DATE)
  ) {
    const map = calcFieldTypeFormatEnum(data as ITableReportField);
    if (map) {
      const values = Object.keys(map);
      return {
        mode: 'select',
        label: '日期显示格式',
        name: 'DateDisplayFormat',
        fieldKey: 'format',
        children: values.map((item) => {
          return {
            mode: 'select-item',
            label: map[item],
            name: map[item],
            value: map[item],
          };
        }),
      };
    }
  }

  if (
    data.fieldType === FIELD_TYPE.DATE_TIME ||
    (data.fieldType === FIELD_TYPE.AGG && data.mappingType === FIELD_TYPE.DATE_TIME)
  ) {
    const map = calcFieldTypeFormatEnum(data as ITableReportField);
    if (map) {
      const values = Object.keys(map);
      return {
        mode: 'select',
        label: '日期时间显示格式',
        name: 'DateDisplayFormat',
        fieldKey: 'format',
        children: values.map((item) => {
          return {
            mode: 'select-item',
            label: map[item],
            name: map[item],
            value: map[item],
          };
        }),
      };
    }
  }

  if (
    data.fieldType === FIELD_TYPE.TIME ||
    (data.fieldType === FIELD_TYPE.AGG && data.mappingType === FIELD_TYPE.TIME)
  ) {
    const values = Object.keys(TIME_FORMAT_ENUM);
    return {
      mode: 'select',
      label: '时间显示格式',
      name: 'DateDisplayFormat',
      fieldKey: 'format',
      children: values.map((item) => {
        return {
          mode: 'select-item',
          label: TIME_FORMAT_ENUM[item],
          name: TIME_FORMAT_ENUM[item],
          value: TIME_FORMAT_ENUM[item],
        };
      }),
    };
  }
  return null;
}

/**
 * 获取数值显示格式菜单
 *
 * @export
 * @param {IReportField} data
 * @returns {*}  {(IFieldContextItem | null)}
 */
export function getNumberDisplayFormat(
  c: ReportViewController,
  data: IReportField,
): IFieldContextItem | null {
  console.log('data', data, FIELD_TYPE.NUMBER);
  // 整数、长整数、小数、精度小数、汇总（返回值 整数、长整数、精度小数）、公式（返回值 整数、长整数、精度小数）、自建公式（返回数值）
  switch (data.fieldType) {
    case FIELD_TYPE.INTEGER:
    case FIELD_TYPE.LONG:
    case FIELD_TYPE.DOUBLE:
    case FIELD_TYPE.DECIMAL:
    case FIELD_TYPE.AGG:
    case FIELD_TYPE.EXPRESSION:
    case FIELD_TYPE.FUNCTION:
      const isTrue = () => {
        if (data.fieldType === FIELD_TYPE.EXPRESSION || data.fieldType === FIELD_TYPE.AGG) {
          switch (data.mappingType) {
            case FIELD_TYPE.INTEGER:
            case FIELD_TYPE.LONG:
            case FIELD_TYPE.DECIMAL:
              return true;
            default:
              return false;
          }
        }
        // 自建公式（返回数值）
        if (data.fieldType === FIELD_TYPE.FUNCTION) {
          switch (data.mappingType) {
            case DataSetReturnTypeEnum.Double:
              return true;
            default:
              return false;
          }
        }

        return true;
      };
      if (isTrue()) {
        return {
          mode: 'action',
          label: '数值显示格式',
          name: 'NumberDisplayFormat',
          fieldKey: 'format',
          click: async (action, data) => {
            const res = await gct.openUtil.modal<IModalData>(
              NumberDisplayFormatModel,
              { field: data, data: data.numberFormat },
              { width: '640px', height: '370px', okText: '确认' },
            );
            if (res.ok && res.data) {
              data.numberFormat = res.data[0];
              c.updateSchema({});
            }
          },
        };
      }
  }
  return null;
}
