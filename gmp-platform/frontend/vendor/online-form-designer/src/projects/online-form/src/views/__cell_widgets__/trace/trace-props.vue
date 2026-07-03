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

  <form-item v-if="!readonly && isRecordNo" :label="t('sys.model.fieldAttr')" :inline="false">
    <a-radio-group
      v-model:value="refRecordNo"
      :options="options"
      :disabled="disabled || !canEditDigits"
      @change="onChange"
    />
    <div class="mt-4px">{{
      refRecordNo === 0
        ? $t('sys.onlineForm.traceFieldErrorTip1')
        : $t('sys.onlineForm.traceFieldErrorTip2')
    }}</div>
  </form-item>

  <form-item
    v-if="showParseRule"
    :inline="false"
    :label="$t('sys.edhr.mcTable.parseRule')"
    class="justify-between"
  >
    <AddRuleBtn v-model="formState.parseRuleProps" :subModelKey="fieldMeta.subModelKey" />
  </form-item>

  <DateFormatEditor
    v-if="isTraceDate"
    :widget="props.widget"
    :field-type="fixedFieldType"
    :disabled="disabled"
  />
  <form-item v-if="isTraceDate && !readonly" :label="`${t('sys.defaultValue')}`" :inline="false">
    <a-checkbox v-model:checked="formState.defaultSystemDate" :disabled="disabled">
      {{ `${t('sys.component.fieldTypeProps.defaultSysDate')}` }}</a-checkbox
    >
  </form-item>
  <RefAutofillEditor
    v-if="isRefType"
    :fieldMeta="fieldMeta"
    :disabled="disabled"
    v-model:autofill-rules="autofillRules"
  />
</template>

<script setup lang="ts">
  import FormItem from '/@online-form/views/designer/modules/base/form-item.vue';
  import type { CellWidget } from '/@online-form/views/designer/types/cell-widget';
  import { computed, ref, watch } from 'vue';
  import DateFormatEditor from '../common/date-format-editor/date-format-editor.vue';
  import RefAutofillEditor from '../common/ref-autofill-editor/ref-autofill-editor.vue';
  import { useModelFields } from '/@online-form/views/designer/hooks/useModelFields';
  import { useSpreadSheet } from '../../designer/hooks/useSpreadSheet';
  import { useReverseModeling } from '../../designer/hooks/reverse-modeling';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { FIELD_TYPE } from '@gct/runtime';

  import type { IBindField } from '@gct/nocode-base';
  import AddRuleBtn from '../common/parse-rule/add-rule-btn.vue';

  const { t } = useI18n();

  const refRecordNoOptions = [
    {
      label: $t('sys.onlineForm.uniqueIdentifier'),
      value: 0,
    },
    {
      label: $t('sys.onlineForm.linkIdentifier'),
      value: 1,
    },
  ];

  const { getFieldMeta } = useModelFields();
  const { isEasyEdition } = useSpreadSheet();
  const { setFieldRefRecordNo, isStashedField } = useReverseModeling();

  const props = defineProps<{
    fieldMeta: IBindField;
    widget: CellWidget.DateTime;
    fieldType: FIELD_TYPE;
    /** 打印或者关联模型字段 */
    readonly: boolean;
    disabled: boolean;
  }>();

  const options = computed(() => {
    const isSubModel = props.fieldMeta.subModelKey && props.fieldMeta.subFieldKey;
    return refRecordNoOptions?.map((item: any) => {
      return {
        ...item,
        disabled: isSubModel && item.value === 0 ? true : false,
      };
    });
  });

  const formState = computed({
    get() {
      return props.widget;
    },
    set(v) {
      Object.assign(props.widget, v);
    },
  });

  const autofillRules = computed({
    get() {
      return formState.value.autofillRules ?? [];
    },
    set(v) {
      formState.value.autofillRules = v;
    },
  });

  const isTraceDate = computed(() => props.fieldType === FIELD_TYPE.TRACE_DATE);
  const isRecordNo = computed(() => props.fieldType === FIELD_TYPE.RECORD_NO);
  const fixedFieldType = computed(() => FIELD_TYPE.DATE);
  const isRefType = computed(() =>
    [FIELD_TYPE.PRODUCT, FIELD_TYPE.DEVICE, FIELD_TYPE.MFG_ORDER].includes(props.fieldType),
  );

  const showParseRule = computed(() =>
    [FIELD_TYPE.PRODUCT, FIELD_TYPE.DEVICE].includes(props.fieldType),
  );

  const canEditDigits = computed(() => {
    return (
      isEasyEdition.value &&
      isStashedField({ key: props.fieldMeta.field!, modelKey: props.fieldMeta.model! })
    );
  });

  const _refRecordNo = ref<number | undefined>(undefined);

  const getInitialRefRecordNo = () => {
    const fieldInfo = getFieldMeta(props.fieldMeta);
    const isSubModel = props.fieldMeta.subModelKey && props.fieldMeta.subFieldKey;
    const initRefRecordNo = isSubModel ? 1 : 0;
    return fieldInfo?.specificConfig?.refRecordNo ?? initRefRecordNo;
  };

  watch(
    () => props.fieldMeta,
    () => {
      _refRecordNo.value = undefined;
    },
    { immediate: true },
  );

  const refRecordNo = computed<number>({
    get() {
      const initialValue = getInitialRefRecordNo();
      return canEditDigits.value ? (_refRecordNo.value ?? initialValue) : initialValue;
    },
    set(val) {
      _refRecordNo.value = val;
    },
  });

  const onChange = () => {
    setFieldRefRecordNo({
      modelKey: props.fieldMeta.model!,
      fieldKey: props.fieldMeta.field!,
      refRecordNo: _refRecordNo.value!,
    });

    console.log('onChange', _refRecordNo.value);
  };
</script>

<style></style>
