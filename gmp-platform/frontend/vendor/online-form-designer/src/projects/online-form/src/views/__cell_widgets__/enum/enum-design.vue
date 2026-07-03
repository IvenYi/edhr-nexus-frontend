<template>
  <div>
    <SelectEx
      :disabled="disabled"
      :options="options"
      :value="defaultValue"
      :is-multiple="isMultiple"
      :show-mode="fieldWidget.renderComp === CellWidgetRenderComp.Select ? 'select' : 'icon-label'"
      :icon-type="iconType"
      :direction="fieldWidget.direction"
      :label-position="fieldWidget.labelPosition"
      :style="styleVars"
      size="small"
      :placeholder="fieldWidget.placeholder"
    >
      <template #suffix="{ option }">
        <template v-if="!!getOptionMeta(option.value)?.attachFields">
          <CellWidgetDesign
            v-for="field in getOptionMeta(option.value)!.attachFields"
            :key="field.fieldMeta.field"
            :field-meta="field.fieldMeta"
            :field-widget="field.fieldWidget"
          />
        </template>
      </template>
    </SelectEx>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import type { CellWidget } from '/@online-form/views/designer/types/cell-widget';
  import type { IBindField } from '@gct/nocode-base';
  import { CellWidgetRenderComp } from '/@online-form/views/designer/enums/index';
  import CellWidgetDesign from '/@online-form/views/__cell_widgets__/cell-widget-design.vue';
  import SelectEx from '@/components/SelectEx/select-ex';
  import { FIELD_TYPE } from '/@/enums/appEnum';
  import { isNil } from 'lodash-es';

  const props = defineProps<{
    disabled?: boolean;
    fieldWidget: CellWidget.Enum;
    fieldMeta: IBindField;
  }>();

  const options = computed(() => {
    return props.fieldWidget.options.map((item) => ({
      label: item.text,
      value: item.value,
    }));
  });

  const getOptionMeta = (value) => {
    return props.fieldWidget.options.find((item) => item.value === value);
  };

  const iconType = computed(() => {
    return {
      [CellWidgetRenderComp.Radio]: 'radio',
      [CellWidgetRenderComp.Checkbox]: 'checkbox',
    }[props.fieldWidget.renderComp];
  });

  const isMultiple = computed(() => {
    return (
      props.fieldMeta.fieldType === FIELD_TYPE.ENUM_MULTI ||
      props.fieldMeta.fieldType === FIELD_TYPE.OPTION_MULTI
    );
  });

  const defaultValue = computed(() => {
    if (isMultiple.value) {
      return props.fieldWidget.options
        .filter((item) => item.defaultSelected)
        .map((item) => item.value);
    } else {
      return props.fieldWidget.options.find((item) => item.defaultSelected)?.value;
    }
  });

  const styleVars = computed(() => {
    const result = {};
    if (!isNil(props.fieldWidget.iconLabelSpace)) {
      result['--gct-select-ex-icon-label-space'] = props.fieldWidget.iconLabelSpace + 'px';
    }
    return result;
  });
</script>

<style lang="less" scoped>
  /** 【电子表单】枚举/布尔选项需要预留边距 */
  :deep(.gct-select-ex-option) {
    padding-left: 0;
  }
</style>
