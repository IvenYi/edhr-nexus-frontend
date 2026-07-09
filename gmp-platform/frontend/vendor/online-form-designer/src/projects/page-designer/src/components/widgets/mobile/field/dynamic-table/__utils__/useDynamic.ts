import { ref } from 'vue';
import { DYN_F_TYPE } from './dynamic.enum';

import { DatepickerTypes } from '/@page-designer/schema/common';
import { isNil } from 'lodash-es';
import { FormComponents } from '/@/projects/page-designer/src/enum';

export default function useDynamic() {
  const validateRange = ref(false);
  const options = ref([]);

  const booleanOpts = ref([
    { label: '真', value: true },
    { label: '假', value: false },
  ]);

  const changePropsHook = (attr, callback) => (value, widget) => callback(widget, attr, value);

  function changePropsValue(widget, attr, value) {
    widget.props[attr] = value;
  }

  const watchCallbacks = {
    /** 自定义下拉选项 */
    options_: (value) => {
      if (value) {
        options.value = value.split(',').map((d) => {
          return {
            label: d,
            value: d,
          };
        });
      }
    },
    /** 布尔真 */
    true_text_: (value) => {
      booleanOpts.value[0].label = value || '真';
    },
    /** 布尔假 */
    false_text_: (value) => {
      booleanOpts.value[1].label = value || '假';
    },
    /** 布尔真校验 */
    validate_true_: changePropsHook('validateTrue', changePropsValue),
    /** 整数上限 */
    max_int_: changePropsHook('maxValue', changePropsValue),
    /** 整数下限 */
    min_int_: changePropsHook('minValue', changePropsValue),
    /** 精度小数上限 */
    max_decimal_: changePropsHook('maxValue', changePropsValue),
    /** 精度小数下限 */
    min_decimal_: changePropsHook('minValue', changePropsValue),
    /** 小数位数 */
    digits_: changePropsHook('precision', changePropsValue),
    /** 上下限校验 */
    validate_range_: (value) => {
      validateRange.value = value;
    },
    /** 日期时间格式化 */
    pattern_: (value, widgets) => {
      const separators = ['-', '.', '/'];
      const dateFormats = DatepickerTypes[widgets.type].map((item) => item.value);
      const lists = dateFormats.flatMap((format) =>
        separators.map((separator) => format.replace(/-/g, separator)),
      );

      const lowerCaseValue = value?.toLowerCase();
      const format = lists.find((item) => item.toLowerCase() === lowerCaseValue);
      if (format) {
        const match = format.match(/[\/\-.]/);
        const separator = match ? match[0] : '';

        widgets.props.separator = separator;
        widgets.props.format = format;
      } else {
        widgets.props.separator = '-';
        if (widgets.type === FormComponents.Datepicker) {
          widgets.props.format = 'YYYY-MM-DD';
        } else if (widgets.type === FormComponents.DateTimepicker) {
          widgets.props.format = 'YYYY-MM-DD HH:mm:ss';
        }
      }
    },
    /** 正则 */
    regex_: changePropsHook('reg', changePropsValue),
    /** 是否必填 */
    required_: changePropsHook('required', changePropsValue),
  };

  function getWatchCallback(type) {
    return watchCallbacks[type];
  }

  /** 值是否正确 */
  function valueCorrect(formData, value) {
    if ([DYN_F_TYPE.Integer, DYN_F_TYPE.Decimal].includes(formData.value.type_)) {
      const isDigits_ =
        formData.value.type_ === DYN_F_TYPE.Decimal &&
        !isNil(formData.value.digits_) &&
        formData.value.digits_ !== '' &&
        formData.value.digits_ !== 0;
      const regex = new RegExp(
        isDigits_ ? `^-?\\d+(\\.\\d{0,${parseInt(formData.value.digits_, 10)}})?$` : /^[0-9]+$/,
      );
      if (!regex.test(value)) {
        return false;
      }

      const intValue = parseInt(value, 10);
      if (formData.value.max_int_ && intValue > formData.value.max_int_) {
        return false;
      }
      if (formData.value.min_int_ && intValue < formData.value.min_int_) {
        return false;
      }

      return true;
    }
    return true;
  }

  return {
    getWatchCallback,
    options,
    booleanOpts,
    validateRange,
    valueCorrect,
  };
}
