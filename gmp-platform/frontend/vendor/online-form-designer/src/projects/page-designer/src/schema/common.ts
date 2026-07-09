import { FormComponents } from '/@page-designer/enum';
import { FIELD_TYPE } from '@/enums/appEnum';
import { SEARCH_SEVICE } from '@/enums/designEnum';

export const DatepickerTypes = {
  [FormComponents.Datepicker]: [
    { label: 'yyyy', value: 'YYYY' },
    { label: 'yyyy-MM', value: 'YYYY-MM' },
    { label: 'yyyy-MM-dd', value: 'YYYY-MM-DD' },
  ],
  [FormComponents.DateTimepicker]: [
    { label: 'yyyy-MM-dd HH', value: 'YYYY-MM-DD HH' },
    { label: 'yyyy-MM-dd HH:mm', value: 'YYYY-MM-DD HH:mm' },
    { label: 'yyyy-MM-dd HH:mm:ss', value: 'YYYY-MM-DD HH:mm:ss' },
  ],
  [FormComponents.Timepicker]: [
    { label: 'HH', value: 'HH' },
    { label: 'HH:mm', value: 'HH:mm' },
    { label: 'HH:mm:ss', value: 'HH:mm:ss' },
  ],
};

interface SearchType {
  [key: string | 'more']: {
    filter?: SEARCH_SEVICE[];
    contain?: string[];
    default?: SEARCH_SEVICE[];
    noRangDefaultExp?: SEARCH_SEVICE;
  };
}

/**字段对应的算子 */
export const SEARCH_TYPE: SearchType = {
  [FIELD_TYPE.PRIMARY_KEY]: {
    filter: [SEARCH_SEVICE.EQ, SEARCH_SEVICE.NE, SEARCH_SEVICE.IN, SEARCH_SEVICE.NOTIN],
    default: [SEARCH_SEVICE.EQ],
    noRangDefaultExp: SEARCH_SEVICE.EQ,
  },

  [FIELD_TYPE.TEXT]: {
    filter: [
      SEARCH_SEVICE.EQ,
      SEARCH_SEVICE.IEQ,
      SEARCH_SEVICE.NE,
      SEARCH_SEVICE.INE,
      SEARCH_SEVICE.LIKE,
      SEARCH_SEVICE.ILIKE,
      SEARCH_SEVICE.NOTLIKE,
      SEARCH_SEVICE.NOTILIKE,
      SEARCH_SEVICE.LEFTLIKE,
      SEARCH_SEVICE.ILEFTLIKE,
      SEARCH_SEVICE.RIGHTLIKE,
      SEARCH_SEVICE.IRIGHTLIKE,
    ],
    default: [SEARCH_SEVICE.LIKE],
    noRangDefaultExp: SEARCH_SEVICE.LIKE,
  },

  [FIELD_TYPE.LONG_TEXT]: {
    filter: [
      SEARCH_SEVICE.EQ,
      SEARCH_SEVICE.IEQ,
      SEARCH_SEVICE.NE,
      SEARCH_SEVICE.INE,
      SEARCH_SEVICE.LIKE,
      SEARCH_SEVICE.ILIKE,
      SEARCH_SEVICE.NOTLIKE,
      SEARCH_SEVICE.NOTILIKE,
      SEARCH_SEVICE.LEFTLIKE,
      SEARCH_SEVICE.ILEFTLIKE,
      SEARCH_SEVICE.RIGHTLIKE,
      SEARCH_SEVICE.IRIGHTLIKE,
    ],
    default: [SEARCH_SEVICE.LIKE],
    noRangDefaultExp: SEARCH_SEVICE.LIKE,
  },
  [FIELD_TYPE.SERIAL]: {
    filter: [
      SEARCH_SEVICE.EQ,
      SEARCH_SEVICE.IEQ,
      SEARCH_SEVICE.NE,
      SEARCH_SEVICE.INE,
      SEARCH_SEVICE.LIKE,
      SEARCH_SEVICE.ILIKE,
      SEARCH_SEVICE.NOTLIKE,
      SEARCH_SEVICE.NOTILIKE,
      SEARCH_SEVICE.LEFTLIKE,
      SEARCH_SEVICE.ILEFTLIKE,
      SEARCH_SEVICE.RIGHTLIKE,
      SEARCH_SEVICE.IRIGHTLIKE,
    ],
    default: [SEARCH_SEVICE.LIKE],
    noRangDefaultExp: SEARCH_SEVICE.LIKE,
  },
  [FIELD_TYPE.INTEGER]: {
    filter: [
      SEARCH_SEVICE.EQ,
      SEARCH_SEVICE.NE,
      SEARCH_SEVICE.GT,
      SEARCH_SEVICE.GE,
      SEARCH_SEVICE.LT,
      SEARCH_SEVICE.LE,
    ],
    contain: ['rangtype'],
    default: [SEARCH_SEVICE.RANGE],
    noRangDefaultExp: SEARCH_SEVICE.EQ,
  },
  [FIELD_TYPE.LONG]: {
    filter: [
      SEARCH_SEVICE.EQ,
      SEARCH_SEVICE.NE,
      SEARCH_SEVICE.GT,
      SEARCH_SEVICE.GE,
      SEARCH_SEVICE.LT,
      SEARCH_SEVICE.LE,
    ],
    contain: ['rangtype'],
    default: [SEARCH_SEVICE.RANGE],
    noRangDefaultExp: SEARCH_SEVICE.EQ,
  },
  [FIELD_TYPE.DECIMAL]: {
    filter: [
      SEARCH_SEVICE.EQ,
      SEARCH_SEVICE.NE,
      SEARCH_SEVICE.GT,
      SEARCH_SEVICE.GE,
      SEARCH_SEVICE.LT,
      SEARCH_SEVICE.LE,
    ],
    contain: ['rangtype'],
    default: [SEARCH_SEVICE.RANGE],
    noRangDefaultExp: SEARCH_SEVICE.EQ,
  },
  [FIELD_TYPE.DOUBLE]: {
    filter: [
      SEARCH_SEVICE.EQ,
      SEARCH_SEVICE.NE,
      SEARCH_SEVICE.GT,
      SEARCH_SEVICE.GE,
      SEARCH_SEVICE.LT,
      SEARCH_SEVICE.LE,
    ],
    contain: ['rangtype'],
    default: [SEARCH_SEVICE.RANGE],
    noRangDefaultExp: SEARCH_SEVICE.EQ,
  },
  [FIELD_TYPE.BOOLEAN]: {
    filter: [SEARCH_SEVICE.EQ],
    // contain: ['more'],
    default: [SEARCH_SEVICE.EQ],
    noRangDefaultExp: SEARCH_SEVICE.EQ,
  },
  [FIELD_TYPE.DATE]: {
    filter: [
      SEARCH_SEVICE.EQ,
      SEARCH_SEVICE.NE,
      SEARCH_SEVICE.GT,
      SEARCH_SEVICE.GE,
      SEARCH_SEVICE.LT,
      SEARCH_SEVICE.LE,
    ],
    contain: ['rangtype', 'more'],
    default: [SEARCH_SEVICE.RANGE],
    noRangDefaultExp: SEARCH_SEVICE.EQ,
  },
  [FIELD_TYPE.TIME]: {
    filter: [
      SEARCH_SEVICE.EQ,
      SEARCH_SEVICE.NE,
      SEARCH_SEVICE.GT,
      SEARCH_SEVICE.GE,
      SEARCH_SEVICE.LT,
      SEARCH_SEVICE.LE,
    ],
    contain: ['rangtype', 'more'],
    default: [SEARCH_SEVICE.RANGE],
    noRangDefaultExp: SEARCH_SEVICE.EQ,
  },
  [FIELD_TYPE.DATE_TIME]: {
    filter: [
      SEARCH_SEVICE.EQ,
      SEARCH_SEVICE.NE,
      SEARCH_SEVICE.GT,
      SEARCH_SEVICE.GE,
      SEARCH_SEVICE.LT,
      SEARCH_SEVICE.LE,
    ],
    contain: ['rangtype', 'more'],
    default: [SEARCH_SEVICE.RANGE],
    noRangDefaultExp: SEARCH_SEVICE.EQ,
  },
  [FIELD_TYPE.ENUM]: {
    filter: [SEARCH_SEVICE.EQ, SEARCH_SEVICE.NE, SEARCH_SEVICE.IN, SEARCH_SEVICE.NOTIN],
    contain: ['more', 'ignoreCase'],
    default: [SEARCH_SEVICE.EQ],
    noRangDefaultExp: SEARCH_SEVICE.EQ,
  },
  [FIELD_TYPE.ENUM_MULTI]: {
    filter: [SEARCH_SEVICE.CONTAINANY, SEARCH_SEVICE.CONTAINALL],
    contain: ['more', 'ignoreCase'],
    default: [SEARCH_SEVICE.CONTAINANY],
    noRangDefaultExp: SEARCH_SEVICE.CONTAINANY,
  },
  [FIELD_TYPE.OPTION]: {
    filter: [SEARCH_SEVICE.EQ, SEARCH_SEVICE.NE],
    contain: ['more'],
    default: [SEARCH_SEVICE.EQ],
    noRangDefaultExp: SEARCH_SEVICE.EQ,
  },
  [FIELD_TYPE.OPTION_MULTI]: {
    filter: [SEARCH_SEVICE.CONTAINANY, SEARCH_SEVICE.CONTAINALL],
    contain: ['more'],
    default: [SEARCH_SEVICE.CONTAINANY],
    noRangDefaultExp: SEARCH_SEVICE.CONTAINANY,
  },

  [FIELD_TYPE.USER]: {
    filter: [SEARCH_SEVICE.EQ, SEARCH_SEVICE.NE, SEARCH_SEVICE.IN, SEARCH_SEVICE.NOTIN],
    contain: ['more', 'ignoreCase'],
    default: [SEARCH_SEVICE.EQ],
  },
  [FIELD_TYPE.USER_MULTI]: {
    filter: [SEARCH_SEVICE.CONTAINANY, SEARCH_SEVICE.CONTAINALL],
    contain: ['more', 'ignoreCase'],
    default: [SEARCH_SEVICE.CONTAINANY],
    noRangDefaultExp: SEARCH_SEVICE.CONTAINANY,
  },
  [FIELD_TYPE.ORG]: {
    filter: [SEARCH_SEVICE.EQ, SEARCH_SEVICE.NE, SEARCH_SEVICE.IN, SEARCH_SEVICE.NOTIN],
    contain: ['more', 'ignoreCase'],
    default: [SEARCH_SEVICE.EQ],
    noRangDefaultExp: SEARCH_SEVICE.EQ,
  },
  [FIELD_TYPE.ORG_MULTI]: {
    filter: [SEARCH_SEVICE.CONTAINANY, SEARCH_SEVICE.CONTAINALL],
    contain: ['more', 'ignoreCase'],
    default: [SEARCH_SEVICE.CONTAINANY],
    noRangDefaultExp: SEARCH_SEVICE.CONTAINANY,
  },
  [FIELD_TYPE.REF_MULTI]: {
    filter: [SEARCH_SEVICE.CONTAINANY, SEARCH_SEVICE.CONTAINALL],
    contain: ['more', 'ignoreCase'],
    default: [SEARCH_SEVICE.CONTAINANY],
    noRangDefaultExp: SEARCH_SEVICE.CONTAINANY,
  },
  [FIELD_TYPE.ASSOCIATED_PRIMARY_KEY]: {
    filter: [SEARCH_SEVICE.EQ, SEARCH_SEVICE.NE, SEARCH_SEVICE.IN, SEARCH_SEVICE.NOTIN],
    contain: ['more'],
    default: [SEARCH_SEVICE.EQ],
    noRangDefaultExp: SEARCH_SEVICE.EQ,
  },
  [FIELD_TYPE.REF]: {
    filter: [SEARCH_SEVICE.EQ, SEARCH_SEVICE.NE, SEARCH_SEVICE.IN, SEARCH_SEVICE.NOTIN],
    contain: ['more', 'ignoreCase'],
    default: [SEARCH_SEVICE.EQ],
    noRangDefaultExp: SEARCH_SEVICE.EQ,
  },
  [FIELD_TYPE.RDO_REF]: {
    filter: [
      SEARCH_SEVICE.VERSIONEQ,
      SEARCH_SEVICE.VERSIONNE,
      SEARCH_SEVICE.VERSIONIN,
      SEARCH_SEVICE.VERSIONNOTIN,
    ],
    contain: ['more', 'ignoreCase'],
    default: [SEARCH_SEVICE.VERSIONIN],
    noRangDefaultExp: SEARCH_SEVICE.VERSIONIN,
  },
  [FIELD_TYPE.E_DHR_TEMPLATE]: {
    filter: [SEARCH_SEVICE.VERSIONIN],
    contain: ['more'],
    default: [SEARCH_SEVICE.VERSIONIN],
    noRangDefaultExp: SEARCH_SEVICE.VERSIONIN,
  },
  [FIELD_TYPE.ONLINE_FORM_TEMPLATE]: {
    filter: [SEARCH_SEVICE.VERSIONIN],
    contain: ['more'],
    default: [SEARCH_SEVICE.VERSIONIN],
    noRangDefaultExp: SEARCH_SEVICE.VERSIONIN,
  },
  [FIELD_TYPE.TRANSACTION]: {
    filter: [SEARCH_SEVICE.EQ, SEARCH_SEVICE.NE, SEARCH_SEVICE.IN, SEARCH_SEVICE.NOTIN],
    contain: ['more', 'ignoreCase'],
    default: [SEARCH_SEVICE.EQ],
    noRangDefaultExp: SEARCH_SEVICE.EQ,
  },
  [FIELD_TYPE.PRINTER]: {
    filter: [SEARCH_SEVICE.EQ, SEARCH_SEVICE.NE, SEARCH_SEVICE.IN, SEARCH_SEVICE.NOTIN],
    contain: ['more', 'ignoreCase'],
    default: [SEARCH_SEVICE.EQ],
    noRangDefaultExp: SEARCH_SEVICE.EQ,
  },
  [FIELD_TYPE.LABEL_TEMPLATE_REF]: {
    filter: [
      SEARCH_SEVICE.VERSIONEQ,
      SEARCH_SEVICE.VERSIONNE,
      SEARCH_SEVICE.VERSIONIN,
      SEARCH_SEVICE.VERSIONNOTIN,
    ],
    contain: ['more', 'ignoreCase'],
    default: [SEARCH_SEVICE.VERSIONIN],
    noRangDefaultExp: SEARCH_SEVICE.EQ,
  },
  // [FIELD_TYPE.DOCUMENT_TEMPLATE]: {
  ['document_template']: {
    filter: [SEARCH_SEVICE.VERSIONIN],
    contain: ['more', 'ignoreCase'],
    default: [SEARCH_SEVICE.VERSIONIN],
    noRangDefaultExp: SEARCH_SEVICE.EQ,
  },
  [FIELD_TYPE.MESSAGE_TMPL]: {
    filter: [SEARCH_SEVICE.EQ, SEARCH_SEVICE.NE, SEARCH_SEVICE.IN, SEARCH_SEVICE.NOTIN],
    default: [SEARCH_SEVICE.EQ],
    noRangDefaultExp: SEARCH_SEVICE.EQ,
  },
  [FIELD_TYPE.RANGE_USER]: {
    filter: [SEARCH_SEVICE.CONTAINANY, SEARCH_SEVICE.CONTAINALL],
    contain: ['more', 'ignoreCase'],
    default: [SEARCH_SEVICE.CONTAINANY],
    noRangDefaultExp: SEARCH_SEVICE.CONTAINANY,
  },
  more: {
    filter: [SEARCH_SEVICE.ISNULL, SEARCH_SEVICE.ISNOTNULL],
  },
  rangtype: {
    filter: [
      SEARCH_SEVICE.RANGE,
      SEARCH_SEVICE.ORANGE,
      SEARCH_SEVICE.RORANGE,
      SEARCH_SEVICE.LORANGE,
    ],
  },

  [FIELD_TYPE.Biz_Process]: {
    filter: [SEARCH_SEVICE.IN],
    default: [SEARCH_SEVICE.IN],
    noRangDefaultExp: SEARCH_SEVICE.IN,
  },
  ignore: {
    filter: ['ignoreCase'],
  },
};
