<template>
  <DatePicker
    :class="['cell-trace-datepicker', showRequired && 'is-show-required', realFieldId]"
    v-model:value="currentValue"
    :disabled="showDisabled"
    v-bind="separatorAttr"
  />
</template>

<script setup lang="ts" name="trace-date">
  import { computed, reactive } from 'vue';
  import { DatePicker } from 'ant-design-vue';
  import { DateFormat, useWidgetStaticAttrs } from '@gct/nocode-base';
  import datePickerLocaleCn from 'ant-design-vue/es/date-picker/locale/zh_CN';

  import type { DatePickerProps } from 'ant-design-vue';
  import type { ITrace } from '@gct/nocode-base';

  const props = defineProps<{
    value?: string;
    widget: ITrace;
    realFieldId?: string;
  }>();

  const emit = defineEmits(['update:value']);

  const { dateType, format, enableCustomFormat, customFormat } = reactive(props.widget.props);

  const { placeholder, showRequired, showDisabled } = useWidgetStaticAttrs(props.widget);

  const currentValue = computed({
    get() {
      return props.value;
    },
    set(val) {
      emit('update:value', val);
    },
  });

  const separatorAttr = computed(() => {
    let attr: DatePickerProps = {
      allowClear: true,
      placeholder,
      valueFormat: DateFormat[dateType].valueFormat,
      format: enableCustomFormat ? customFormat : format,
      picker: DateFormat[dateType].picker as DatePickerProps['picker'],
      locale: datePickerLocaleCn,
    };
    return attr;
  });
</script>

<style scoped lang="less">
  .cell-trace-datepicker {
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

    :deep(&.ant-picker-disabled) {
      background: #f5f5f5;
    }

    :deep(&.ant-picker-focused) {
      box-shadow: none;
    }
    :deep(.ant-picker-input > input) {
      font-size: var(--size, 12px);
      height: 22px;
      background-color: transparent;
    }
  }
</style>
