import { FIELD_TYPE } from '/@/enums/appEnum';
import { useI18n } from '/@/hooks/web/useI18n';
import { ColumnsType } from 'ant-design-vue/es/table/Table.d';

const { t } = useI18n();

export enum LinkOperatorEnum {
  /** 等于 */
  EQ = 'eq',
  /** 不等于 */
  NE = 'ne',
  /** 大于 */
  GT = 'gt',
  /** 小于 */
  LT = 'lt',
  /** 大于等于 */
  GE = 'ge',
  /** 小于等于 */
  LE = 'le',
  /** 匹配 */
  LIKE = 'like',
  /** 不匹配 */
  NOTLIKE = 'notLike',
  /** 为空 */
  ISNULL = 'isNull',
  /** 不为空 */
  ISNOTNULL = 'isNotNull',
}

/**
 * 字符串操作符
 */
const StringOperators = [
  LinkOperatorEnum.EQ,
  LinkOperatorEnum.NE,
  LinkOperatorEnum.LIKE,
  LinkOperatorEnum.NOTLIKE,
  LinkOperatorEnum.ISNULL,
  LinkOperatorEnum.ISNOTNULL,
];

/**
 * 数字操作符
 */
const NumberOperators = [
  LinkOperatorEnum.EQ,
  LinkOperatorEnum.GT,
  LinkOperatorEnum.GE,
  LinkOperatorEnum.LT,
  LinkOperatorEnum.LE,
  LinkOperatorEnum.NE,
  LinkOperatorEnum.ISNULL,
  LinkOperatorEnum.ISNOTNULL,
];

/**
 * 时间操作符
 */
const TimeOperators = [
  LinkOperatorEnum.EQ,
  LinkOperatorEnum.NE,
  LinkOperatorEnum.GT,
  LinkOperatorEnum.LT,
  LinkOperatorEnum.ISNULL,
  LinkOperatorEnum.ISNOTNULL,
];

/**
 * 布尔操作符
 */
const BooleanOperators = [
  LinkOperatorEnum.EQ,
  LinkOperatorEnum.NE,
  LinkOperatorEnum.ISNULL,
  LinkOperatorEnum.ISNOTNULL,
];

/** 枚举单选、人员单选、 部门单选、 模型关联、子表关联主键 */
const OptionOperators = [
  LinkOperatorEnum.EQ,
  LinkOperatorEnum.NE,
  LinkOperatorEnum.LIKE,
  LinkOperatorEnum.NOTLIKE,
  LinkOperatorEnum.ISNULL,
  LinkOperatorEnum.ISNOTNULL,
];

/** 枚举多选、人员多选、部门多选、模型多选 */
const OptionsOperators = [
  LinkOperatorEnum.LIKE,
  LinkOperatorEnum.NOTLIKE,
  LinkOperatorEnum.ISNULL,
  LinkOperatorEnum.ISNOTNULL,
];

const DefaultOperators = [LinkOperatorEnum.ISNULL, LinkOperatorEnum.ISNOTNULL];

export const getField2Operators = (fieldType) => {
  if (!fieldType) {
    return [];
  }
  let options;
  switch (fieldType) {
    case FIELD_TYPE.TEXT:
    case FIELD_TYPE.LONG_TEXT:
    case FIELD_TYPE.PRIMARY_KEY:
    case FIELD_TYPE.ASSOCIATED_PRIMARY_KEY:
    case FIELD_TYPE.MATERIAL_NO:
    case FIELD_TYPE.RELATED_LOT_NO:
    case FIELD_TYPE.SCRAP_MATERIAL_NO:
      options = StringOperators.slice();
      break;

    case FIELD_TYPE.INTEGER:
    case FIELD_TYPE.LONG:
    case FIELD_TYPE.DOUBLE:
    case FIELD_TYPE.DECIMAL:
      options = NumberOperators.slice();
      break;

    case FIELD_TYPE.BOOLEAN:
      options = BooleanOperators.slice();
      break;

    case FIELD_TYPE.DATE:
    case FIELD_TYPE.TIME:
    case FIELD_TYPE.DATE_TIME:
      options = TimeOperators.slice();
      break;

    case FIELD_TYPE.OPTION:
    case FIELD_TYPE.USER:
    case FIELD_TYPE.ORG:
    case FIELD_TYPE.ENUM:
    case FIELD_TYPE.REF:
    case FIELD_TYPE.RDO_REF:
      options = OptionOperators.slice();
      break;
    case FIELD_TYPE.OPTION_MULTI:
    case FIELD_TYPE.USER_MULTI:
    case FIELD_TYPE.ORG_MULTI:
    case FIELD_TYPE.ENUM_MULTI:
    case FIELD_TYPE.REF_MULTI:
      options = OptionsOperators.slice();
      break;
    default:
      options = DefaultOperators.slice();
      break;
  }
  return options;
};

export const columns: ColumnsType<any> = [
  {
    title: $t('sys.FieldName'),
    dataIndex: 'fieldName',
  },
  {
    title: $t('sys.dataSet.fieldKey'),
    dataIndex: 'fieldKey',
  },
  {
    title: $t('sys.bi.fieldType'),
    dataIndex: 'fieldType',
    customRender: ({ record }) => {
      return t(`sys.pageDesigner.fieldCmp.${record.fieldType}`);
    },
  },
];

export const modelListColumns: ColumnsType<any> = [
  {
    title: $t('sys.model.modelName'),
    dataIndex: 'name',
  },
  {
    title: '模型/字段类型',
    dataIndex: 'type',
    customRender: ({ record }) => {
      if (record.subModel === 1) {
        return $t('sys.component.dataConnection.modelField.master_slave');
      }
      return $t('sys.edhr.printTypeEnum.FORM');
    },
  },
  {
    title: $t('sys.onlineForm.isMasterDetailTable'),
    dataIndex: 'subModel',
    customRender: ({ record }) => {
      return record.subModel === 1 ? $t('sys.dataSet.subTable') : $t('sys.dataSet.mainTable');
    },
  },
];

export const paramColumns = [
  {
    title: $t('sys.bi.param.name'),
    dataIndex: 'paramName',
  },
  {
    title: $t('sys.onlineForm.paramsKey'),
    dataIndex: 'paramKey',
  },
  {
    title: $t('sys.bi.fieldType'),
    dataIndex: 'fieldType',
    customRender: ({ record }) => {
      return t(`sys.pageDesigner.fieldCmp.${record.fieldType}`);
    },
  },
];

export const builtinFieldColumns = [
  {
    title: $t('sys.FieldName'),
    dataIndex: 'fieldName',
  },
  {
    title: $t('sys.dataSet.fieldKey'),
    dataIndex: 'fieldId',
  },
  {
    title: $t('sys.bi.fieldType'),
    dataIndex: 'fieldType',
    customRender: ({ record }) => {
      return t(`sys.pageDesigner.fieldCmp.${record.fieldType}`);
    },
  },
];
