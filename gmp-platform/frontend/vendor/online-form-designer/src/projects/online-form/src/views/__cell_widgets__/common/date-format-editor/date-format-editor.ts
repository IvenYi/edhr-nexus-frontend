import { Ref, computed, watch } from 'vue';
import { CellWidget } from '../../../designer/types/cell-widget';
import { FIELD_TYPE } from '/@/enums/appEnum';

type DateFormatTemplate = {
  value: string;
  /**
   * 支持的字段类型集合
   * @author lingxiaoming
   * @date 2024-05-23 05:29:44
   * @type {string[]}
   */
  supportFieldTypes: string[];
};

/**
 * 日期格式分隔符
 * @author lingxiaoming
 * @date 2024-05-13 04:11:01
 * @export
 */
export const DateFormatSeparators = ['-', '/', '.'];

/**
 * 日期格式模版集合
 * @author lingxiaoming
 * @date 2024-05-13 04:11:01
 * @export
 */
export const DateFormatTemplates: DateFormatTemplate[] = [
  { value: 'YYYY', supportFieldTypes: [FIELD_TYPE.DATE, FIELD_TYPE.WAREHOUSE_RECEIPT_DATE] },
  {
    value: 'YYYY${sep}MM',
    supportFieldTypes: [FIELD_TYPE.DATE, FIELD_TYPE.WAREHOUSE_RECEIPT_DATE],
  },
  {
    value: 'YYYY${sep}MM${sep}DD',
    supportFieldTypes: [FIELD_TYPE.DATE, FIELD_TYPE.WAREHOUSE_RECEIPT_DATE],
  },
  { value: 'YYYY${sep}MM${sep}DD HH', supportFieldTypes: [FIELD_TYPE.DATE_TIME] },
  {
    value: 'YYYY${sep}MM${sep}DD HH:mm',
    supportFieldTypes: [FIELD_TYPE.DATE_TIME],
  },
  {
    value: 'YYYY${sep}MM${sep}DD HH:mm:ss',
    supportFieldTypes: [FIELD_TYPE.DATE_TIME],
  },
  { value: 'HH', supportFieldTypes: [FIELD_TYPE.TIME] },
  { value: 'HH:mm', supportFieldTypes: [FIELD_TYPE.TIME] },
  { value: 'HH:mm:ss', supportFieldTypes: [FIELD_TYPE.TIME] },
];

/**
 * 计算获得最终的format
 * @author lingxiaoming
 * @date 2024-05-13 04:32:04
 * @export
 * @param {string} templateStr
 * @param {DateFormatSeparator} separator
 * @return {*}  {string}
 */
export function calcFinalFormat(template: string, separator: string): string {
  return template.replace(/\${sep}/g, separator);
}

/**
 * 设置日期格式配置的默认值
 * @author lingxiaoming
 * @date 2024-05-23 03:40:13
 * @export
 * @param {CellWidget.DateTime} widget
 * @param {string} type
 */
export function setWidgetDefault(widget: CellWidget.DateTime, type: string) {
  // 初始化设置默认值
  if (!widget.customFormat && !widget.format) {
    if (!widget.formatSeparator) {
      widget.formatSeparator = DateFormatSeparators[0];
    }
    if (!widget.formatTemplate) {
      let defaultFormatTemplate: string;
      switch (type) {
        case FIELD_TYPE.TIME:
          defaultFormatTemplate = 'HH:mm:ss';
          break;
        case FIELD_TYPE.DATE_TIME:
          defaultFormatTemplate = 'YYYY${sep}MM${sep}DD HH:mm:ss';
          break;
        case FIELD_TYPE.DATE:
        case FIELD_TYPE.WAREHOUSE_RECEIPT_DATE:
        default:
          defaultFormatTemplate = 'YYYY${sep}MM${sep}DD';
      }
      widget.formatTemplate = defaultFormatTemplate;
    }
    if (!widget.format) {
      widget.format = calcFinalFormat(widget.formatTemplate, widget.formatSeparator);
    }
  }
}

export function useDateFormatEditor(
  formState: Ref<CellWidget.DateTime>,
  fieldType: Ref<FIELD_TYPE>,
) {
  watch(
    formState,
    () => {
      setWidgetDefault(formState.value, fieldType.value);
    },
    { immediate: true },
  );

  const setCustom = (isCustom: boolean) => {
    // 没变不做处理
    if (isCustom === formState.value.customFormat) {
      return;
    }
    formState.value.customFormat = isCustom;
    if (isCustom) {
      // *不清空分隔符和模版
      // formState.value.formatTemplate = undefined;
      // formState.value.formatSeparator = undefined;
      formState.value.format = undefined;
    } else {
      formState.value.format = undefined;
    }
  };

  const calcAndSetFormat = () => {
    if (formState.value.formatSeparator && formState.value.formatTemplate) {
      formState.value.format = calcFinalFormat(
        formState.value.formatTemplate,
        formState.value.formatSeparator,
      );
    }
  };

  const separatorValue = computed({
    get() {
      return formState.value.formatSeparator;
    },
    set(v) {
      setCustom(false);
      formState.value.formatSeparator = v;
      calcAndSetFormat();
    },
  });

  const templateValue = computed({
    get() {
      return formState.value.formatTemplate;
    },
    set(v) {
      setCustom(false);
      formState.value.formatTemplate = v;
      calcAndSetFormat();
    },
  });

  const customFormat = computed({
    get() {
      return !!formState.value.customFormat;
    },
    set(v) {
      if (v) {
        setCustom(true);
      } else {
        setCustom(false);
      }
    },
  });

  const templateOptions = computed(() => {
    if (!separatorValue.value) {
      return [];
    }
    return DateFormatTemplates.filter((item) =>
      item.supportFieldTypes.includes(fieldType.value),
    ).map((item) => {
      return {
        label: calcFinalFormat(item.value, separatorValue.value!),
        value: item.value,
      };
    });
  });

  const separatorOptions = DateFormatSeparators.map((separator) => ({
    label: separator,
    value: separator,
  }));

  return {
    separatorValue,
    templateValue,
    separatorOptions,
    templateOptions,
    customFormat,
  };
}
