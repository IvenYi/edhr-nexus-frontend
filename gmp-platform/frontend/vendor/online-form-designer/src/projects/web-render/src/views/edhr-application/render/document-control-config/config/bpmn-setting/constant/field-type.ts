import { CaseValueType, CaseOperatorEnum } from '@gct/flow/src/plugins/bpmn/enums';
import { FIELD_TYPE } from '/@/enums/appEnum';

/**
 * 基础操作符
 */
export const BasicOperators = [CaseOperatorEnum.IS_NULL, CaseOperatorEnum.IS_NOT_NULL];

export const NoRightOperators = [
  CaseOperatorEnum.IS_NULL,
  CaseOperatorEnum.IS_NOT_NULL,
  CaseOperatorEnum.IS_EMPTY,
  CaseOperatorEnum.IS_NOT_EMPTY,
];

/**
 * 字符串操作符
 */
export const StringOperators = [
  CaseOperatorEnum.EQ,
  CaseOperatorEnum.NE,
  CaseOperatorEnum.CONTAINS,
  CaseOperatorEnum.NOT_CONTAINS,
  ...BasicOperators,
];

/**
 * 枚举多选操作符
 */
export const EnumMultiOperators = [
  CaseOperatorEnum.CONTAINS,
  CaseOperatorEnum.NOT_CONTAINS,
  ...BasicOperators,
];

/**
 * 数字操作符
 */
const NumberOperators = [
  CaseOperatorEnum.EQ,
  CaseOperatorEnum.GT,
  CaseOperatorEnum.GE,
  CaseOperatorEnum.LT,
  CaseOperatorEnum.LE,
  CaseOperatorEnum.NE,
  ...BasicOperators,
];

/**
 * 时间操作符
 */
const TimeOperators = [
  CaseOperatorEnum.EQ,
  CaseOperatorEnum.GE,
  CaseOperatorEnum.LE,
  CaseOperatorEnum.NE,
  ...BasicOperators,
];

/**
 * 布尔操作符
 */
const BooleanOperators = [CaseOperatorEnum.EQ, CaseOperatorEnum.NE, ...BasicOperators];

/**
 * 模型字段 类型操作符配置映射
 */
export const FieldTypeSettingMap: Record<
  FIELD_TYPE,
  { type: CaseValueType; operators: CaseOperatorEnum[] }
> = {
  [FIELD_TYPE.PRIMARY_KEY]: {
    type: CaseValueType.String,
    operators: BasicOperators,
  },
  [FIELD_TYPE.ASSOCIATED_PRIMARY_KEY]: {
    type: CaseValueType.String,
    operators: BasicOperators,
  },
  [FIELD_TYPE.TEXT]: {
    type: CaseValueType.String,
    operators: StringOperators,
  },
  [FIELD_TYPE.LONG_TEXT]: {
    type: CaseValueType.String,
    operators: StringOperators,
  },
  [FIELD_TYPE.INTEGER]: {
    type: CaseValueType.Integer,
    operators: NumberOperators,
  },
  [FIELD_TYPE.LONG]: {
    type: CaseValueType.Integer,
    operators: NumberOperators,
  },
  [FIELD_TYPE.DOUBLE]: {
    type: CaseValueType.Double,
    operators: NumberOperators,
  },
  [FIELD_TYPE.DECIMAL]: {
    type: CaseValueType.Double,
    operators: NumberOperators,
  },
  [FIELD_TYPE.BOOLEAN]: {
    type: CaseValueType.Boolean,
    operators: BooleanOperators,
  },
  [FIELD_TYPE.DATE]: {
    type: CaseValueType.Date,
    operators: TimeOperators,
  },
  [FIELD_TYPE.TIME]: {
    type: CaseValueType.Time,
    operators: TimeOperators,
  },
  [FIELD_TYPE.DATE_TIME]: {
    type: CaseValueType.DateTime,
    operators: TimeOperators,
  },
  [FIELD_TYPE.IMAGE]: {
    type: CaseValueType.String,
    operators: BasicOperators,
  },
  [FIELD_TYPE.ATTACHMENT]: {
    type: CaseValueType.String,
    operators: BasicOperators,
  },
  [FIELD_TYPE.SERIAL]: {
    type: CaseValueType.String,
    operators: BasicOperators,
  },
  [FIELD_TYPE.MASTERSLAVE]: {
    type: CaseValueType.String,
    operators: [CaseOperatorEnum.IS_EMPTY, CaseOperatorEnum.IS_NOT_EMPTY],
  },
  [FIELD_TYPE.USER]: {
    type: CaseValueType.String,
    operators: BasicOperators,
  },
  [FIELD_TYPE.USER_MULTI]: {
    type: CaseValueType.String,
    operators: BasicOperators,
  },
  [FIELD_TYPE.ORG]: {
    type: CaseValueType.String,
    operators: BasicOperators,
  },
  [FIELD_TYPE.ORG_MULTI]: {
    type: CaseValueType.String,
    operators: BasicOperators,
  },
  [FIELD_TYPE.ENUM]: {
    type: CaseValueType.String,
    operators: StringOperators,
  },
  [FIELD_TYPE.ENUM_MULTI]: {
    type: CaseValueType.String,
    operators: StringOperators,
  },
  [FIELD_TYPE.OPTION]: {
    type: CaseValueType.String,
    operators: StringOperators,
  },
  [FIELD_TYPE.OPTION_MULTI]: {
    type: CaseValueType.String,
    operators: EnumMultiOperators,
  },
  [FIELD_TYPE.REF]: {
    type: CaseValueType.String,
    operators: BasicOperators,
  },
  [FIELD_TYPE.REF_MULTI]: {
    type: CaseValueType.String,
    operators: BasicOperators,
  },
  [FIELD_TYPE.RDO_REF]: {
    type: CaseValueType.String,
    operators: BasicOperators,
  },
  [FIELD_TYPE.EXPRESSION]: {
    type: CaseValueType.String,
    operators: BasicOperators,
  },
  [FIELD_TYPE.AGG]: {
    type: CaseValueType.String,
    operators: [],
  },
  [FIELD_TYPE.ESOP]: {
    type: CaseValueType.String,
    operators: [],
  },
  [FIELD_TYPE.TRANSACTION]: {
    type: CaseValueType.String,
    operators: [],
  },
  [FIELD_TYPE.LABEL_TEMPLATE]: {
    type: CaseValueType.String,
    operators: [],
  },
  [FIELD_TYPE.LABEL_TEMPLATE_REF]: {
    type: CaseValueType.String,
    operators: [],
  },
  [FIELD_TYPE.DOCUMENT_TEMPLATE]: {
    type: CaseValueType.String,
    operators: [],
  },
  [FIELD_TYPE.SERIALRULE]: {
    type: CaseValueType.String,
    operators: [],
  },
  [FIELD_TYPE.PRINTER]: {
    type: CaseValueType.String,
    operators: [],
  },
  [FIELD_TYPE.MESSAGE_TMPL]: {
    type: CaseValueType.String,
    operators: [],
  },
  [FIELD_TYPE.RANGE_USER]: {
    type: CaseValueType.String,
    operators: [],
  },
  [FIELD_TYPE.SIGNATURE]: {
    type: CaseValueType.String,
    operators: BasicOperators,
  },
  [FIELD_TYPE.ONLINE_FORM_TEMPLATE]: {
    type: CaseValueType.String,
    operators: [],
  },
  [FIELD_TYPE.E_DHR_TEMPLATE]: {
    type: CaseValueType.String,
    operators: [],
  },
  [FIELD_TYPE.WAREHOUSE_RECEIPT_NO]: {
    type: CaseValueType.String,
    operators: StringOperators,
  },
  [FIELD_TYPE.WAREHOUSE_RECEIPT_DATE]: {
    type: CaseValueType.Date,
    operators: TimeOperators,
  },
  [FIELD_TYPE.WAREHOUSE_MANAGER]: {
    type: CaseValueType.String,
    operators: BasicOperators,
  },
  [FIELD_TYPE.QTY_REQUIRED]: {
    type: CaseValueType.Double,
    operators: NumberOperators,
  },
  [FIELD_TYPE.QTY_CONSUMED]: {
    type: CaseValueType.Double,
    operators: NumberOperators,
  },
  [FIELD_TYPE.QTY]: {
    type: CaseValueType.Double,
    operators: NumberOperators,
  },
  // [FIELD_TYPE.ONLINE_FORM]: {
  //   type: CaseValueType.String,
  //   operators: [],
  // },
};

export const TypeToFieldTypeMap: Record<CaseValueType, FIELD_TYPE[]> = Object.keys(
  FieldTypeSettingMap,
).reduce((total, item) => {
  const type = FieldTypeSettingMap[item].type;
  if (total[type]) {
    total[type].push(item);
  } else {
    total[type] = [item];
  }
  return total;
}, {}) as any;
