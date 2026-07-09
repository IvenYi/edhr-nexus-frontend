<template>
  <cell-wrapper
    :modelValue="modelValue"
    :widget="widget"
    :formData="formData"
    :callback="readonlyCallback"
    :annotationInfo="annotationInfo"
  >
    <TimePicker
      :class="['cell-basic-timepicker', showRequired && 'is-show-required', realFieldId]"
      v-model:value="value"
      :disabled="showDisabled"
      v-bind="separatorAttr"
      @change="onChange"
      @focus="$attrs.onFocus"
      @blur="$attrs.onBlur"
      style="width: 100%"
    />
  </cell-wrapper>
</template>

<script setup lang="ts" name="online-form-timepicker-render">
  import { reactive, computed } from 'vue';
  import { TimePicker } from 'ant-design-vue';
  import CellWrapper from '../../../_common_/cell-wrapper.vue';
  import { DateFormat, useWidgetStaticAttrs, useNocodeFormWidget } from '@gct/nocode-base';
  import datePickerLocaleCn from 'ant-design-vue/es/date-picker/locale/zh_CN';
  import dayjs from 'dayjs';

  import type { TimePickerProps } from 'ant-design-vue';
  import type { ITimepicker } from '@gct/nocode-base';

  const props = defineProps<{
    modelValue?: string;
    widget: ITimepicker;
    formData: Object;
    /** 子表fieldkey */
    subtableFieldId?: string;
    /** 子表实际行数 */
    realRowIndex?: number;
    /** 子表在分页情况下，当前页面的行数 */
    pageRowIndex?: number;
    /** 二维子表数据行数index */
    childSubTableDataIndex?: number;
  }>();
  const emit = defineEmits(['update:modelValue']);

  const { value, onChange, realFieldId, annotationInfo } = useNocodeFormWidget(props, emit);

  const { format, timeType, enableCustomFormat, customFormat } = reactive(props.widget.props);

  const { placeholder, showRequired, showDisabled } = useWidgetStaticAttrs(props.widget);

  const separatorAttr = computed(() => {
    let attr: TimePickerProps = {
      allowClear: true,
      placeholder,
      valueFormat: DateFormat[timeType].valueFormat,
      format: enableCustomFormat ? customFormat : format,
      locale: datePickerLocaleCn,
    };
    return attr;
  });

  function readonlyCallback(val) {
    if (val) {
      return dayjs('0000-01-01 ' + val).format(enableCustomFormat ? customFormat : format);
    }
  }
</script>

<style scoped lang="less">
  .cell-basic-timepicker {
    width: var(--cmp-width) !important;
    min-width: 30px;
    height: fit-content;
    padding: 2px;
    border-radius: 2px;
    outline: none;
    border-color: var(--required-border-color, #e9e9e9);
    background-color: var(--required-background-color, transparent);
    &:hover {
      border-color: var(--required-border-hover-color, var(--ant-primary-color));
    }
    :deep(&.ant-picker-focused) {
      box-shadow: none;
    }
    :deep(&.ant-picker-disabled) {
      background: #f5f5f5;
    }
    :deep(.ant-picker-input > input) {
      font-size: var(--size, 12px);
      height: 22px;
      background-color: transparent;
    }
  }
</style>
