import { computed, watch } from 'vue';
import { DYN_F_TYPE } from '/@web-render/views/edhr-application/enums/index';

/** 显示方式类型枚举 */
export enum DYN_DISPLAY_TYPE {
  /** 单行文本 */
  Input = 'input',
  /** 多选 */
  Checkbox = 'checkbox',
  /** 单选 */
  Radio = 'radio',
  /** 下拉选择 */
  Select = 'select',
}

type IDynCompUtils = {
  [key in DYN_F_TYPE]: {
    /** 对应接口属性值的key */
    infValKey: string;
    /** 类型对应的配置项 */
    attrs?: string[];
    /** 监听内容属性名 */
    watchs?: string[];
  };
};

const beforeAttrs = ['required_'];
const afterAttrs = ['tip_text_'];

const useComp2Attrs = {
  switch: ['validate_range_', 'validate_true_', 'validate_false_', 'required_'],
  inputNumber: ['max_int_', 'min_int_', 'max_decimal_', 'min_decimal_', 'digits_'],
  input: ['true_text_', 'false_text_', 'pattern_', 'regex_', 'tip_text_'],
  option: ['options_'],
};

export function useDynamicItem(formState) {
  /** 显示方式枚举 */
  const DYN_DISPLAY_OPTS = {
    [DYN_F_TYPE.Boolean]: [
      DYN_DISPLAY_TYPE.Checkbox,
      DYN_DISPLAY_TYPE.Radio,
      DYN_DISPLAY_TYPE.Select,
    ],
    [DYN_F_TYPE.Decimal]: [DYN_DISPLAY_TYPE.Input, DYN_DISPLAY_TYPE.Select],
    [DYN_F_TYPE.Integer]: [DYN_DISPLAY_TYPE.Input, DYN_DISPLAY_TYPE.Select],
    [DYN_F_TYPE.String]: [DYN_DISPLAY_TYPE.Input, DYN_DISPLAY_TYPE.Select],
  };

  const DynCompUtils: IDynCompUtils = {
    [DYN_F_TYPE.String]: {
      infValKey: 'text_value_',
      attrs: ['regex_'],
    },
    [DYN_F_TYPE.Integer]: {
      infValKey: 'int_value_',
      attrs: ['validate_range_', 'max_int_', 'min_int_'],
    },
    [DYN_F_TYPE.Decimal]: {
      infValKey: 'double_value_',
      attrs: ['validate_range_', 'max_decimal_', 'min_decimal_', 'digits_'],
    },
    [DYN_F_TYPE.Boolean]: {
      infValKey: 'bool_value_',
      attrs: ['true_text_', 'false_text_', 'validate_true_', 'validate_false_'],
    },
    [DYN_F_TYPE.User]: {
      infValKey: 'user_value_',
    },
    [DYN_F_TYPE.Org]: {
      infValKey: 'org_value_',
    },
    [DYN_F_TYPE.Date]: {
      infValKey: 'date_value_',
      attrs: ['pattern_'],
    },
    [DYN_F_TYPE.Date_time]: {
      infValKey: 'date_time_value_',
      attrs: ['pattern_'],
    },
    [DYN_F_TYPE.Image]: {
      infValKey: 'image_value_',
      attrs: [],
    },
  };

  const typeOptions = Object.values(DYN_F_TYPE).map((key) => {
    return {
      label: $t(`sys.pageDesigner.dynamicFormType.${key}`),
      value: key,
    };
  });

  const showTypeOptions = computed(() => {
    return (DYN_DISPLAY_OPTS[formState.type_ ?? ''] ?? []).map((key) => {
      return {
        label: $t(`sys.pageDesigner.dnyDisplay.${key}`),
        value: key,
      };
    });
  });

  const attrList = computed(() => {
    if (!formState.type_) return [];
    return beforeAttrs.concat(
      DynCompUtils[formState.type_ ?? DYN_F_TYPE.String]?.attrs ?? [],
      afterAttrs,
      formState.show_type_ === DYN_DISPLAY_TYPE.Select && formState.type_ !== DYN_F_TYPE.Boolean
        ? ['options_']
        : [],
    );
  });

  const getInputNumberAttr = (key) => {
    if (key === 'max_int_' || key === 'max_decimal_') {
      if (formState.type_ === DYN_F_TYPE.Integer) {
        return {
          min: formState.min_int_,
          precision: 0,
        };
      }
      if (formState.type_ === DYN_F_TYPE.Decimal) {
        return {
          min: formState.min_decimal_,
          precision: formState.digits_ ?? 0,
        };
      }
    } else if (key === 'min_int_' || key === 'min_decimal_') {
      if (formState.type_ === DYN_F_TYPE.Integer) {
        return {
          max: formState.max_int_,
          precision: 0,
        };
      }
      if (formState.type_ === DYN_F_TYPE.Decimal) {
        return {
          max: formState.max_decimal_,
          precision: formState.digits_ ?? 0,
        };
      }
    }
  };

  return {
    typeOptions,
    showTypeOptions,
    attrList,
    useComp2Attrs,
    getInputNumberAttr,
  };
}
