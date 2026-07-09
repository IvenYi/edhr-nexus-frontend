<template>
  <form-item v-if="!readonly" :label="`${t('sys.pageDesigner.fieldPlaceholder')}`" :inline="false">
    <a-input
      size="small"
      v-model:value="formState.placeholder"
      :placeholder="t('sys.inputText')"
      :disabled="disabled"
      show-count
      :maxlength="32"
    />
  </form-item>
  <DateFormatEditor
    v-if="showDateFormatEditor"
    :widget="props.widget"
    :field-type="fieldType"
    :disabled="disabled"
  />
  <form-item v-if="showDefaultValueCheckbox" :label="`${t('sys.defaultValue')}`" :inline="false">
    <a-checkbox v-model:checked="formState.defaultSystemDate" :disabled="disabled">
      {{ t('sys.component.fieldTypeProps.defaultSysDate') }}
    </a-checkbox>
  </form-item>

  <DateRangeEditor
    v-if="showDateRangeEditor"
    :field-meta="fieldMeta"
    :widget="props.widget"
    :field-type="fieldType"
    :readonly="readonly"
    :disabled="disabled"
  />
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import FormItem from '/@online-form/views/designer/modules/base/form-item.vue';
  import DateFormatEditor from '../common/date-format-editor/date-format-editor.vue';
  import DateRangeEditor from '../common/date-range/date-range-editor.vue';
  import { FIELD_TYPE } from '/@/enums/appEnum';
  import type { IBindField } from '@gct/nocode-base';
  import type { CellWidget } from '/@online-form/views/designer/types/cell-widget';

  type Props = {
    fieldMeta: IBindField;
    widget: CellWidget.DateTime;
    fieldType: FIELD_TYPE;
    readonly: boolean;
    disabled: boolean;
  };

  const { t } = useI18n();
  const props = defineProps<Props>();

  const formState = computed({
    get: () => props.widget,
    set: (v) => Object.assign(props.widget, v),
  });

  // 计算属性优化条件判断
  const excludedDateFormatTypes = computed(() => [
    FIELD_TYPE.PRODUCTION_DATE,
    FIELD_TYPE.REPORT_START_TIME,
    FIELD_TYPE.REPORT_END_TIME,
  ]);

  const excludedDefaultValueTypes = computed(() => [
    FIELD_TYPE.REPORT_START_TIME,
    FIELD_TYPE.REPORT_END_TIME,
  ]);

  const dateRangeTypes = computed(() => [
    FIELD_TYPE.DATE,
    FIELD_TYPE.DATE_TIME,
    FIELD_TYPE.REPORT_START_TIME,
    FIELD_TYPE.REPORT_END_TIME,
    FIELD_TYPE.PRODUCTION_DATE,
  ]);

  // 控制组件的显示条件
  const showDateFormatEditor = computed(
    () => !excludedDateFormatTypes.value.includes(props.fieldType),
  );

  const showDefaultValueCheckbox = computed(
    () => !props.readonly && !excludedDefaultValueTypes.value.includes(props.fieldType),
  );

  const showDateRangeEditor = computed(() => dateRangeTypes.value.includes(props.fieldType));
</script>
