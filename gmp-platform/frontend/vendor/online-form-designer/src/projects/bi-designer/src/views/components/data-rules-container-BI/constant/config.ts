import { SEARCH_SEVICE } from '@/enums/designEnum';
import { FIELD_TYPE } from '@/enums/appEnum';
import { cloneDeep, has, isEmpty, merge, omit, pick } from 'lodash-es';
import { getEnumModelFieldPageList } from '/@/apis/gct-apaas/EnumModelFieldController';
import { postModelDataQueryRefData } from '/@/apis/gct-apaas/ModelDataController';
import { postBizServiceByModelKeyByBsKey } from '/@/apis/gct-apaas/BsServiceController';
import { useI18n } from '/@/hooks/web/useI18n';
import { BIFieldTypeEnum } from '/@bi-designer/views/data-set/interface/type';

const { t } = useI18n();

export const Ch_FieldTypeName = {
  [FIELD_TYPE.DATE]: t('sys.webRender.date'),
  [FIELD_TYPE.TIME]: t('sys.webRender.time'),
  [FIELD_TYPE.DATE_TIME]: t('sys.webRender.dateTime'),
  [FIELD_TYPE.ORG]: '',
  [FIELD_TYPE.ORG_MULTI]: '',
  [FIELD_TYPE.USER]: t('sys.webRender.user'),
  [FIELD_TYPE.USER_MULTI]: t('sys.webRender.user'),
};

/** 【人员、部门】系统变量 */
export enum UserSystemEnum {
  /** 当前登录用户 */
  CUR_USER = '__CUR_USER__',
  /** 当前登录用户所在部门人员 */
  CUR_USER_ORG = '__CUR_USER_ORG__',
  /** 当前登录用户所在主部门人员 */
  CUR_USER_MASTER_ORG = '__CUR_USER_MASTER_ORG__',
  /** 当前登录用户所负责部门人员 */
  CUR_USER_PRINCIPAL_ORG = '__CUR_USER_PRINCIPAL_ORG__',
  /** 当前登录用户直属下属 */
  CUR_USER_DIRECT_SUBORDINATE = '__CUR_USER_DIRECT_SUBORDINATE__',
}

/** 【日期、日期时间、时间】系统变量 */
export enum DateSystemEnum {
  /** 系统当前【日期|日期时间|时间 】 */
  NOW = '__NOW__',
  /** 当天  */
  CUR_DAY = '__CUR_DAY__',
  /** 本周  */
  CUR_WEEK = '__CUR_WEEK__',
  /** 本月  */
  CUR_MONTH = '__CUR_MONTH__',
  /** 本年 */
  CUR_YEAR = '__CUR_YEAR__',
}

export const UserSystemKeys = [
  UserSystemEnum.CUR_USER,
  UserSystemEnum.CUR_USER_ORG,
  UserSystemEnum.CUR_USER_MASTER_ORG,
  UserSystemEnum.CUR_USER_PRINCIPAL_ORG,
  UserSystemEnum.CUR_USER_DIRECT_SUBORDINATE,
];

export const DateSystemKeys = [
  DateSystemEnum.NOW,
  DateSystemEnum.CUR_DAY,
  DateSystemEnum.CUR_WEEK,
  DateSystemEnum.CUR_MONTH,
  DateSystemEnum.CUR_YEAR,
];

/** 系统变量对应中文翻译 */
export const Ch_SystemVars = {
  [DateSystemEnum.NOW]: (text) => t('sys.webRender.sysNow', { text: t(text) }),
  [DateSystemEnum.CUR_DAY]: () => t('sys.webRender.curDay'),
  [DateSystemEnum.CUR_WEEK]: () => t('sys.webRender.curWeek'),
  [DateSystemEnum.CUR_MONTH]: () => t('sys.webRender.curMonth'),
  [DateSystemEnum.CUR_YEAR]: () => t('sys.webRender.curYear'),
  [UserSystemEnum.CUR_USER]: () => t('sys.webRender.curUser'),
  [UserSystemEnum.CUR_USER_ORG]: (text) => t('sys.webRender.curUserOrg', { text: text }),
  [UserSystemEnum.CUR_USER_MASTER_ORG]: (text) =>
    t('sys.webRender.curUserMasterOrg', { text: text }),
  [UserSystemEnum.CUR_USER_PRINCIPAL_ORG]: (text) =>
    t('sys.webRender.curUserPrincipalOrg', { text: text }),
  [UserSystemEnum.CUR_USER_DIRECT_SUBORDINATE]: t('sys.webRender.curUserDirectSubordinate'),
};

/** 数据类型 */
export enum ValueTypeEnum {
  /** 固定值 */
  FIXED = 'FIXED',
  /** 系统变量 */
  SYS = 'SYS',
  /** 字段*/
  FIELD = 'FIELD',
  /** 变量*/
  VAR = 'VAR',
}

/** 数据类型对应中文翻译 */
export const Ch_ValueType = {
  [ValueTypeEnum.FIXED]: {
    name: t('sys.webRender.fixed'),
    abbr: t('sys.webRender.fixedAbbr'),
  },
  [ValueTypeEnum.SYS]: {
    name: t('sys.webRender.system'),
    abbr: t('sys.webRender.systemAbbr'),
  },
  [ValueTypeEnum.FIELD]: {
    name: t('sys.webRender.field'),
    abbr: t('sys.webRender.fieldAbbr'),
  },
  [ValueTypeEnum.VAR]: {
    name: t('sys.webRender.var'),
    abbr: t('sys.webRender.varAbbr'),
  },
};

/** 组件类型 */
export enum ComponentTypeEnum {
  /** 输入框  */
  INPUT = 'input',
  /** 下拉列表框  */
  SELECT = 'select',
  /** 有接口请求的下拉列表框 */
  REQUEST_SELECT = 'request_select',
  /** 日期选择器 */
  DATEPICKER = 'datePicker',
  /** 自定义 */
  CUSTOM = 'custom',
  /** 树形下拉选择框 */
  REQUEST_TREE_SELECT = 'TreeSelect',
}

/** 组件闭合类型 */
export enum RangTypeEnum {
  /** 单个 */
  Single = 'single',
  /** 组合 */
  Comb = 'comb',
  /** 隐藏 */
  Hidden = 'hidden',
}

export const BoolOptions = [
  {
    label: t('sys.webRender.booleanTrue'),
    value: 'true',
  },
  {
    label: t('sys.webRender.booleanFalse'),
    value: 'false',
  },
];

const getCmpDisplayStatus = (rangType) => {
  if ([SEARCH_SEVICE.ISNOTNULL, SEARCH_SEVICE.ISNULL].includes(rangType)) {
    return RangTypeEnum.Hidden;
  }
  if (
    [
      SEARCH_SEVICE.RANGE,
      SEARCH_SEVICE.ORANGE,
      SEARCH_SEVICE.RORANGE,
      SEARCH_SEVICE.LORANGE,
    ].includes(rangType)
  ) {
    return RangTypeEnum.Comb;
  }
  return RangTypeEnum.Single;
};

const getCompAttrs = ({ fieldType, operatorType, modelKey, fieldKey, bindInfo, refModelType }) => {
  const attrs = {};
  if (fieldType === FIELD_TYPE.DATE) {
    Object.assign(attrs, {
      picker: 'date',
    });
  } else if (fieldType === FIELD_TYPE.TIME) {
    Object.assign(attrs, {
      picker: 'time',
    });
  } else if (fieldType === FIELD_TYPE.DATE_TIME) {
    Object.assign(attrs, {
      showTime: true,
    });
  } else if (
    [FIELD_TYPE.USER, FIELD_TYPE.USER_MULTI, FIELD_TYPE.ORG, FIELD_TYPE.ORG_MULTI].includes(
      fieldType,
    )
  ) {
    Object.assign(attrs, {
      supportModalType: [FIELD_TYPE.ORG_MULTI, FIELD_TYPE.ORG].includes(fieldType)
        ? 'org'
        : [
              SEARCH_SEVICE.CONTAINALL,
              SEARCH_SEVICE.EQ,
              SEARCH_SEVICE.NE,
              SEARCH_SEVICE.IN,
              SEARCH_SEVICE.NOTIN,
            ].includes(operatorType)
          ? 'user'
          : 'user&org',
      mode: [
        SEARCH_SEVICE.CONTAINANY,
        SEARCH_SEVICE.CONTAINALL,
        SEARCH_SEVICE.IN,
        SEARCH_SEVICE.NOTIN,
      ].includes(operatorType)
        ? 'multiple'
        : '',
      pickerCompParams: {
        modelKey: modelKey,
        fieldKey: fieldKey,
        multiple: [
          SEARCH_SEVICE.CONTAINANY,
          SEARCH_SEVICE.CONTAINALL,
          SEARCH_SEVICE.IN,
          SEARCH_SEVICE.NOTIN,
        ].includes(operatorType),
      },
    });
  } else if ([FIELD_TYPE.OPTION, FIELD_TYPE.OPTION_MULTI].includes(fieldType)) {
  } else if (
    [
      FIELD_TYPE.ENUM,
      FIELD_TYPE.ENUM_MULTI,
      FIELD_TYPE.REF,
      FIELD_TYPE.REF_MULTI,
      FIELD_TYPE.RDO_REF,
      FIELD_TYPE.PRIMARY_KEY,
    ].includes(fieldType)
  ) {
    const isSupportMultiple = ![
      SEARCH_SEVICE.EQ,
      SEARCH_SEVICE.NE,
      // SEARCH_SEVICE.CONTAINALL,
    ].includes(operatorType);
    Object.assign(attrs, {
      mode: isSupportMultiple ? 'multiple' : '',
    });

    if (
      [FIELD_TYPE.REF, FIELD_TYPE.REF_MULTI, FIELD_TYPE.RDO_REF, FIELD_TYPE.PRIMARY_KEY].includes(
        fieldType,
      )
    ) {
      Object.assign(attrs, {
        showSearch: true,
        multiple: isSupportMultiple,
        api:
          fieldType === FIELD_TYPE.RDO_REF
            ? postBizServiceByModelKeyByBsKey
            : postModelDataQueryRefData,
        apiParams:
          fieldType === FIELD_TYPE.RDO_REF
            ? {
                action: 'rdoListAll',
                key: bindInfo,
              }
            : {
                modelKey: modelKey,
                fieldKey: fieldKey,
                ...(refModelType !== 'TREE' && {
                  pageNo: 1,
                  pageSize: 30,
                }),
                ...(refModelType === 'TREE' && {
                  searchType: 'ALL',
                }),
              },
      });
    } else {
      Object.assign(attrs, {
        api: getEnumModelFieldPageList,
        apiParams: { pageSize: 99999, enumModelKey: bindInfo },
      });
    }
  }

  return attrs;
};

const getUserDepFilter = ({ operatorType, fieldType }) => {
  const isSingle =
    [FIELD_TYPE.USER, FIELD_TYPE.ORG].includes(fieldType) &&
    [SEARCH_SEVICE.EQ, SEARCH_SEVICE.NE].includes(operatorType);

  return {
    type: operatorType === SEARCH_SEVICE.CONTAINALL || isSingle ? 'contain' : 'exclude',
    // 包含全部 只支持登录用户
    list:
      operatorType === SEARCH_SEVICE.CONTAINALL || isSingle
        ? [
            [FIELD_TYPE.ORG_MULTI, FIELD_TYPE.ORG].includes(fieldType)
              ? UserSystemEnum.CUR_USER_MASTER_ORG
              : UserSystemEnum.CUR_USER,
          ]
        : [FIELD_TYPE.ORG_MULTI, FIELD_TYPE.ORG].includes(fieldType)
          ? [UserSystemEnum.CUR_USER, UserSystemEnum.CUR_USER_DIRECT_SUBORDINATE]
          : [],
  };
};

const getModelComp = ({ refModelType }) => {
  if (refModelType === 'TREE') {
    return ComponentTypeEnum.REQUEST_TREE_SELECT;
  }
  return ComponentTypeEnum.REQUEST_SELECT;
};

const CmpConfig = {
  basicText: {
    isDefault: true, // 默认直接拼接
    comps: ComponentTypeEnum.INPUT,
  },
  [FIELD_TYPE.BOOLEAN]: {
    isDefault: true, // 默认直接拼接
    comps: ComponentTypeEnum.SELECT,
    compAttrs: { options: BoolOptions },
  },
  basicDate: {
    comps: [ComponentTypeEnum.DATEPICKER, ComponentTypeEnum.SELECT],
    compAttrs: [
      getCompAttrs,
      {
        optionsKeys: [...DateSystemKeys],
        filter: {
          type: 'contain',
          list: [DateSystemEnum.NOW],
        },
      },
    ],
  },
  basicUserDep: {
    typeKeys: [ValueTypeEnum.FIXED, ValueTypeEnum.SYS],
    default: ValueTypeEnum.FIXED,
    comps: [ComponentTypeEnum.CUSTOM, ComponentTypeEnum.SELECT],
    compAttrs: [
      getCompAttrs,
      {
        optionsKeys: [...UserSystemKeys],
        filter: getUserDepFilter,
      },
    ],
  },
  basicEnum: {
    isDefault: true, // 默认直接拼接
    comps: ComponentTypeEnum.REQUEST_SELECT,
    compAttrs: getCompAttrs,
  },
  basicModel: {
    isDefault: true, // 默认直接拼接
    comps: getModelComp,
    // comps: ComponentTypeEnum.REQUEST_SELECT,
    compAttrs: getCompAttrs,
  },
};

const filterOperatorTypes = [
  SEARCH_SEVICE.RANGE,
  SEARCH_SEVICE.ORANGE,
  SEARCH_SEVICE.RORANGE,
  SEARCH_SEVICE.LORANGE,
  SEARCH_SEVICE.IN,
  SEARCH_SEVICE.NOTIN,
  SEARCH_SEVICE.CONTAINANY,
  SEARCH_SEVICE.CONTAINALL,
];

export const getCmpConfig = ({
  fieldType,
  operatorType,
  modelKey,
  fieldKey,
  bindInfo,
  valueType,
  refModelType,
  fieldOptions,
  mainModelKey,
  isPageDesigner,
  varOptions,
}) => {
  let actionKey = '';

  switch (fieldType) {
    case FIELD_TYPE.TEXT:
    case FIELD_TYPE.LONG_TEXT:
    case FIELD_TYPE.SERIAL:
    case FIELD_TYPE.INTEGER:
    case FIELD_TYPE.LONG:
    case FIELD_TYPE.DOUBLE:
    case FIELD_TYPE.DECIMAL:
    case FIELD_TYPE.OPTION:
    case FIELD_TYPE.OPTION_MULTI:
    case BIFieldTypeEnum.TEXT:
    case BIFieldTypeEnum.NUMBER:
      actionKey = 'basicText';
      break;
    case FIELD_TYPE.DATE:
    case FIELD_TYPE.TIME:
    case FIELD_TYPE.DATE_TIME:
    case BIFieldTypeEnum.DATE:
      actionKey = 'basicDate';
      break;

    case FIELD_TYPE.USER:
    case FIELD_TYPE.ORG:
    case FIELD_TYPE.USER_MULTI:
    case FIELD_TYPE.ORG_MULTI:
      actionKey = 'basicUserDep';
      break;

    case FIELD_TYPE.ENUM:
    case FIELD_TYPE.ENUM_MULTI:
      actionKey = 'basicEnum';
      break;
    case FIELD_TYPE.REF:
    case FIELD_TYPE.REF_MULTI:
    case FIELD_TYPE.RDO_REF:
    case FIELD_TYPE.PRIMARY_KEY:
      actionKey = 'basicModel';
      break;
  }

  const cmpRangType = getCmpDisplayStatus(operatorType);

  if (cmpRangType === RangTypeEnum.Hidden) {
    return [{ isHide: true }];
  }

  // const reference = [ValueTypeEnum.FIXED, ValueTypeEnum.SYS];
  let reference;

  const config = cloneDeep(CmpConfig[actionKey || fieldType]);
  const configs: any[] = cmpRangType === RangTypeEnum.Comb ? [config, cloneDeep(config)] : [config];
  const resConfig = configs.map((conf: any, confIndex) => {
    const obj: any = {};
    if (conf?.isDefault) {
      merge(obj, {
        typeKeys: [ValueTypeEnum.FIXED],
        default: ValueTypeEnum.FIXED,
      });
    } else if (has(conf, 'default') && has(conf, 'typeKeys')) {
      merge(obj, pick(conf, ['typeKeys', 'default']));
    } else if (actionKey === 'basicDate') {
      // 日期、日期时间、时间特殊处理
      if (cmpRangType === RangTypeEnum.Single) {
        merge(obj, {
          typeKeys: [ValueTypeEnum.FIXED, ValueTypeEnum.SYS],
          default: ValueTypeEnum.FIXED,
        });
      } else if (cmpRangType === RangTypeEnum.Comb) {
        // leftConfig.optKeys = [ValueTypeEnum.FIXED];
        merge(obj, {
          typeKeys:
            confIndex === 0 && operatorType !== SEARCH_SEVICE.RANGE
              ? [ValueTypeEnum.FIXED]
              : [ValueTypeEnum.FIXED, ValueTypeEnum.SYS],
          default:
            confIndex === 0 && operatorType !== SEARCH_SEVICE.RANGE
              ? ValueTypeEnum.FIXED
              : ValueTypeEnum.FIXED,
        });

        if (operatorType === SEARCH_SEVICE.RANGE && confIndex === 0) {
          if (fieldType === FIELD_TYPE.TIME) {
            Object.assign(obj, {
              typeKeys: [ValueTypeEnum.FIXED],
              default: ValueTypeEnum.FIXED,
            });
          }

          conf.compAttrs[1].filter = {
            type: 'exclude',
            list: [DateSystemEnum.NOW],
          };
        }
      }
    }

    if (
      !filterOperatorTypes.includes(operatorType) &&
      ![FIELD_TYPE.OPTION, FIELD_TYPE.OPTION_MULTI].includes(fieldType)
    ) {
      obj.typeKeys?.push(ValueTypeEnum.FIELD);
    }

    if (isPageDesigner) {
      // obj.typeKeys?.push(ValueTypeEnum.FIELD);
      obj.typeKeys?.push(ValueTypeEnum.VAR);
    }

    merge(obj, {
      valueTypeOptions: obj.typeKeys?.map((key) => {
        return {
          label: t(Ch_ValueType[key].name),
          value: key,
          abbr: t(Ch_ValueType[key].abbr),
        };
      }),
    });

    const _comps = typeof conf?.comps === 'function' ? conf?.comps({ refModelType }) : conf?.comps;
    const complist: any = Array.isArray(_comps) ? _comps : [_comps];
    reference =
      complist.length == 1 ? [ValueTypeEnum.FIXED] : [ValueTypeEnum.FIXED, ValueTypeEnum.SYS];

    if (
      !filterOperatorTypes.includes(operatorType) &&
      ![FIELD_TYPE.OPTION, FIELD_TYPE.OPTION_MULTI].includes(fieldType)
    ) {
      complist.push(ComponentTypeEnum.SELECT);
      reference.push(ValueTypeEnum.FIELD);
    }

    if (isPageDesigner) {
      // complist.push(ComponentTypeEnum.SELECT);
      // reference.push(ValueTypeEnum.FIELD);
      complist.push(ComponentTypeEnum.SELECT);
      reference.push(ValueTypeEnum.VAR);
    }

    complist.forEach((comp, index) => {
      merge(obj, {
        [reference[index]]: {
          cmp: comp,
        },
      });
    });

    if (has(conf, 'compAttrs')) {
      const _compAttrs =
        typeof conf.compAttrs === 'function'
          ? conf.compAttrs({ fieldType, operatorType, modelKey, fieldKey, bindInfo, refModelType })
          : conf.compAttrs;

      (Array.isArray(_compAttrs) ? _compAttrs : [_compAttrs]).forEach((compAttr, index) => {
        const filters: any = {};

        const __compAttr__ =
          typeof compAttr === 'function'
            ? compAttr({ fieldType, operatorType, modelKey, fieldKey, bindInfo })
            : compAttr;

        if (has(__compAttr__, 'filter')) {
          Object.assign(filters, {
            filter:
              typeof __compAttr__.filter === 'function'
                ? __compAttr__.filter({ operatorType, fieldType })
                : __compAttr__.filter,
          });
        }

        const _compAttrs = {};
        if (__compAttr__?.optionsKeys) {
          Object.assign(_compAttrs, {
            options: __compAttr__?.optionsKeys
              ?.filter((kk) => {
                if (!isEmpty(filters?.filter)) {
                  const _filter = filters?.filter;
                  if (_filter.type === 'contain') {
                    return _filter.list.includes(kk);
                  } else if (_filter.type === 'exclude') {
                    return !_filter.list.includes(kk);
                  }
                  return true;
                }
                return true;
              })
              .map((k) => {
                return {
                  label:
                    typeof Ch_SystemVars[k] === 'function'
                      ? Ch_SystemVars[k](Ch_FieldTypeName[fieldType])
                      : Ch_SystemVars[k],
                  value: k,
                };
              }),
          });
        }

        merge(obj, {
          [reference[index]]: {
            ...obj[reference[index]],
            attrs: {
              ...omit(__compAttr__, 'filter'),
              ..._compAttrs,
            },
            ...filters,
          },
        });
      });
    }

    // console.log(obj[ValueTypeEnum.FIELD], obj, fieldOptions, '.obj[ValueTypeEnum.FIELD]')
    if (mainModelKey) {
      obj[ValueTypeEnum.FIELD] = {
        ...obj[ValueTypeEnum.FIELD],
        attrs: {
          options: fieldOptions,
        },
      };
    }

    if (isPageDesigner) {
      obj[ValueTypeEnum.FIELD] = {
        ...obj[ValueTypeEnum.FIELD],
        attrs: {
          options: fieldOptions,
        },
      };
      obj[ValueTypeEnum.VAR] = {
        ...obj[ValueTypeEnum.VAR],
        attrs: {
          options: varOptions,
        },
      };
    }

    return obj;
  });
  if (
    [FIELD_TYPE.DATE, FIELD_TYPE.DATE_TIME].includes(fieldType) &&
    operatorType === SEARCH_SEVICE.RANGE &&
    valueType === ValueTypeEnum.SYS
  ) {
    return resConfig.slice(0, 1);
  }
  return resConfig;
};
