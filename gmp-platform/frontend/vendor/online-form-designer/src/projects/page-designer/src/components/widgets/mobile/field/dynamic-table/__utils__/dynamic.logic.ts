import { LowCodeWidget } from '/@page-designer/types/widget-basic-types';
import { DYN_F_TYPE, DYN_DISPLAY_TYPE } from './dynamic.enum';
import { FIELD_TYPE, FieldIconMap } from '/@/enums/appEnum';
import { BindCmpStyleEnum, Platform } from '/@page-designer/enum';
import { cloneDeep, merge, pick } from 'lodash-es';

import inputWidget from '../__schema__/dyn-input';
import inputNumberWidget from '../__schema__/dyn-inputnumber';
import switchWidget from '../__schema__/dyn-switch';
import userWidget from '../__schema__/dyn-userpicker';
import orgWidget from '../__schema__/dyn-department';
import dateWidget from '../__schema__/dyn-datepicker';
import dateTimeWidget from '../__schema__/dyn-datetimepicker';
import imageWidget from '../__schema__/dyn-image';

import { useI18n } from '@mobile/utils/useI18n';

const { t } = useI18n();

const widgets = {
  inputWidget,
  inputNumberWidget,
  switchWidget,
  userWidget,
  orgWidget,
  dateWidget,
  dateTimeWidget,
  imageWidget,
};

export interface IDynConfig {
  /** schema标识 */
  schemaKey: string;
  /** 对应接口属性值的key */
  infValKey: string;
  /** 字段类型 */
  fieldType: FIELD_TYPE;
  /** 寄生在开关组件上 */
  useSwitchComp?: boolean;
  /** 设置schema prop属性值回调方法 */
  setAttrCallback?: Function;
  /** 监听内容属性名 */
  watchs?: string[];
}

type IDynCompUtils = {
  [key in DYN_F_TYPE]: {
    /** schema标识 */
    schemaKey: string[] | string;
    /** 对应接口属性值的key */
    infValKey: string;
    /** 字段类型 */
    fieldType: FIELD_TYPE[] | FIELD_TYPE;
    /** 寄生在开关组件上 */
    useSwitchComp?: boolean;
    /** 设置schema prop属性值回调方法 */
    setAttrCallback?: Function;
    /** 监听内容属性名 */
    watchs?: string[];
  };
};

const watchAttrs = {
  [DYN_F_TYPE.String]: ['regex_'],
  [DYN_F_TYPE.Integer]: ['max_int_', 'min_int_', 'validate_range_'],
  [DYN_F_TYPE.Decimal]: ['max_decimal_', 'min_decimal_', 'digits_', 'validate_range_'],
  [DYN_F_TYPE.Boolean]: ['true_text_', 'false_text_', 'validate_true_'],
  [DYN_F_TYPE.Date]: ['pattern_'],
  [DYN_F_TYPE.Date_time]: ['pattern_'],
};

const DynCompUtils: IDynCompUtils = {
  [DYN_F_TYPE.String]: {
    schemaKey: ['inputWidget', 'switchWidget'],
    infValKey: 'text_value_',
    fieldType: [FIELD_TYPE.TEXT, FIELD_TYPE.BOOLEAN],
    useSwitchComp: true,
  },
  [DYN_F_TYPE.Integer]: {
    schemaKey: ['inputNumberWidget', 'switchWidget'],
    infValKey: 'int_value_',
    fieldType: [FIELD_TYPE.INTEGER, FIELD_TYPE.BOOLEAN],
    useSwitchComp: true,
  },
  [DYN_F_TYPE.Decimal]: {
    schemaKey: ['inputNumberWidget', 'switchWidget'],
    infValKey: 'double_value_',
    fieldType: [FIELD_TYPE.DECIMAL, FIELD_TYPE.BOOLEAN],
    useSwitchComp: true,
  },
  [DYN_F_TYPE.Boolean]: {
    schemaKey: 'switchWidget',
    infValKey: 'bool_value_',
    fieldType: FIELD_TYPE.BOOLEAN,
    setAttrCallback: (widget, showType: DYN_DISPLAY_TYPE) => {
      if (showType === DYN_DISPLAY_TYPE.Switch) {
        widget.props.bindCompStyleType = BindCmpStyleEnum.CMP_BOOLEAN;
      } else if (showType === DYN_DISPLAY_TYPE.Select) {
        widget.props.bindCompStyleType = BindCmpStyleEnum.CMP_SELECT_LIST;
      } else if (showType === DYN_DISPLAY_TYPE.Radio) {
        widget.props.bindCompStyleType = BindCmpStyleEnum.CMP_RADIO;
      }
    },
  },
  [DYN_F_TYPE.User]: {
    schemaKey: 'userWidget',
    infValKey: 'user_value_',
    fieldType: FIELD_TYPE.USER,
  },
  [DYN_F_TYPE.Org]: {
    schemaKey: 'orgWidget',
    infValKey: 'org_value_',
    fieldType: FIELD_TYPE.ORG,
  },
  [DYN_F_TYPE.Date]: {
    schemaKey: 'dateWidget',
    infValKey: 'date_value_',
    fieldType: FIELD_TYPE.DATE,
  },
  [DYN_F_TYPE.Date_time]: {
    schemaKey: 'dateTimeWidget',
    infValKey: 'date_time_value_',
    fieldType: FIELD_TYPE.DATE_TIME,
  },
  [DYN_F_TYPE.Image]: {
    schemaKey: 'imageWidget',
    infValKey: 'image_value_',
    fieldType: FIELD_TYPE.IMAGE,
  },
};
/** 设置状态到下拉列表 */
function setBoolStatus2Select(widget) {
  widget.props.bindCompStyleType = BindCmpStyleEnum.CMP_SELECT_LIST;
}

export function getDynCompConfig(field: string, type: DYN_F_TYPE, showType: DYN_DISPLAY_TYPE) {
  const type2Index = !showType || showType === DYN_DISPLAY_TYPE.Input ? 0 : 1;

  const config: IDynConfig =
    DynCompUtils[type ?? DYN_F_TYPE.String] &&
    Object.entries(DynCompUtils[type ?? DYN_F_TYPE.String])
      ? Object.fromEntries(
          Object.entries(DynCompUtils[type ?? DYN_F_TYPE.String]).map(([key, item]) => {
            return [key, Array.isArray(item) ? item[type2Index] : item];
          }),
        )
      : {
          schemaKey: '',
          infValKey: '',
          fieldType: FIELD_TYPE.TEXT,
        };

  const cloneConfig: IDynConfig = cloneDeep(config);

  if (!type) {
    return cloneConfig;
  }

  cloneConfig.watchs = field === 'value_' ? ['required_'] : [];

  const watchs = watchAttrs[type];

  if (watchs) {
    cloneConfig.watchs = cloneConfig.watchs.concat(...watchs);
  }

  if (cloneConfig.useSwitchComp && type2Index === 1) {
    cloneConfig.setAttrCallback = setBoolStatus2Select;
    cloneConfig.watchs.push('options_');
  }

  // console.log('end ==> getDynCompConfig', cloneConfig);
  return cloneConfig;
}

export function getDynCompParams(
  data: { [key: string]: any },
  type: DYN_F_TYPE,
  showType: DYN_DISPLAY_TYPE,
) {
  const config = getDynCompConfig(data.field, type, showType);

  // 这里clone一下，不污染组件的基础配置
  const cloneData = cloneDeep(data);

  const basic = {
    id: cloneData.id,
    platform: Platform.MOBILE,
    name: `sys.pageDesigner.fieldCmp.${config.fieldType}`,
    icon: FieldIconMap[config.fieldType],
    alias: cloneData.fieldName,
    isField: true,
    materialType: cloneData.materialType,
    preLocation: cloneData.preLocation,
  };

  const cmp = cloneDeep(widgets[config.schemaKey]);

  if (config.setAttrCallback && typeof config.setAttrCallback === 'function') {
    config.setAttrCallback(cmp, showType);
  }

  merge(cmp.props, {
    ...pick(cloneData, [
      'displayLabelText',
      'field',
      'fieldId',
      'fieldName',
      'modelKey',
      'bindModelKey',
      'readonly',
      'required',
    ]),
    fieldType: config.fieldType,
    fieldCodeChain: '', // 字段链路
    isFieldModel: false, // 是否是模型字段
    isCustomField: false, // 表单-自定义显示字段
    label: null,
    uniqueConstraintType: '',
  });

  transformI18n(cmp.props);

  const widget = merge(cmp, basic);
  // console.log('end ===> widget', widget);

  return {
    widget,
    config,
  };
}

/**
 * 初始化国际化处理
 * @param props
 */
function transformI18n(props: LowCodeWidget.BasicSchema['props']) {
  const reg = /^\$\{(\S+)\}$/;
  for (const key in props) {
    const value = props[key];
    if (reg.test(value)) {
      props[key] = t(value.match(reg)?.[1]);
    }
  }
}
