<template>
  <div :class="[ns.b()]">
    <form-item :label="t('sys.onlineForm.isEnableRangeValidate')">
      <a-switch
        :class="[ns.e('switch')]"
        size="small"
        v-model:checked="formState.enableRangeValidate"
        :disabled="disabled || readonly"
        @change="onEnableChange"
      />
    </form-item>
    <template v-if="formState.enableRangeValidate">
      <form-item :label="t('sys.onlineForm.maxValidateMode')" :inline="false">
        <SelectEx
          show-mode="icon-label"
          icon-type="custom"
          style-type="buttons"
          class="w-full"
          :options="validateModeOptions"
          v-model:value="formState.maxValidateMode"
          :disabled="disabled || readonly"
        />
      </form-item>
      <a-date-picker
        v-if="formState.maxValidateMode === RangeValidateMode.Fixed_Number"
        :class="[ns.e('num')]"
        v-model:value="formState.max"
        :disabled-date="disabledMaxDate"
        :show-time="isDateTime"
        :format="pickerFormat"
        :value-format="valueFormat"
        :placeholder="$t('sys.onlineForm.pleaseSelectUpperDateLimit')"
        size="small"
        :disabled="disabled || readonly"
      />
      <FormulaEditor
        v-if="formState.maxValidateMode === RangeValidateMode.Variable_Validate"
        :class="[ns.e('num')]"
        size="small"
        :modelKey="fieldMeta.model!"
        :disabled="disabled"
        v-model:expr="formState.maxExpr"
        v-model:expr-echo="formState.maxExprEcho"
      />
      <form-item :label="t('sys.onlineForm.minValidateMode')" :inline="false">
        <SelectEx
          show-mode="icon-label"
          icon-type="custom"
          style-type="buttons"
          class="w-full"
          :options="validateModeOptions"
          :disabled="disabled"
          v-model:value="formState.minValidateMode"
        />
      </form-item>
      <a-date-picker
        v-if="formState.minValidateMode === RangeValidateMode.Fixed_Number"
        :class="[ns.e('num')]"
        v-model:value="formState.min"
        :disabled-date="disabledMinDate"
        :show-time="isDateTime"
        :format="pickerFormat"
        :value-format="valueFormat"
        :placeholder="$t('sys.onlineForm.pleaseSelectLowerDateLimit')"
        size="small"
        :disabled="disabled || readonly"
      />
      <FormulaEditor
        v-if="formState.minValidateMode === RangeValidateMode.Variable_Validate"
        :class="[ns.e('num')]"
        size="small"
        :modelKey="fieldMeta.model!"
        :disabled="disabled"
        v-model:expr="formState.minExpr"
        v-model:expr-echo="formState.minExprEcho"
      />
    </template>
  </div>
</template>

<script lang="ts" setup name="date-range-editor">
  import { useNamespace, FIELD_TYPE } from '@gct/runtime';
  import type { CellWidget } from '/@online-form/views/designer/types/cell-widget';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { computed } from 'vue';
  import FormItem from '/@online-form/views/designer/modules/base/form-item.vue';
  import SelectEx from '@/components/SelectEx/select-ex';
  import { FormulaEditor } from '../formula';
  import { RangeValidateMode } from '@gct/nocode-base';
  import { isNil } from 'lodash-es';
  import type { IBindField } from '@gct/nocode-base';

  const { t } = useI18n();

  const ns = useNamespace('date-range-editor');

  const props = withDefaults(
    defineProps<{
      fieldMeta: IBindField;
      widget: CellWidget.DateTime;
      fieldType: FIELD_TYPE;
      /** 打印或者关联模型字段 */
      readonly: boolean;
      disabled: boolean;
    }>(),
    {},
  );

  const formState = computed({
    get() {
      return props.widget;
    },
    set(v) {
      Object.assign(props.widget, v);
    },
  });

  /** 启用变更回调 */
  const onEnableChange = (checked) => {
    if (checked === true) {
      if (isNil(formState.value.maxValidateMode)) {
        formState.value.maxValidateMode = RangeValidateMode.No_Validate;
      }
      if (isNil(formState.value.minValidateMode)) {
        formState.value.minValidateMode = RangeValidateMode.No_Validate;
      }
    }
  };

  const validateModeOptions = Object.values(RangeValidateMode).map((val) => {
    return {
      label: t(`sys.onlineForm.NumberRangeValidateMode.${val}`),
      value: val,
    };
  });

  const isDateTime = computed(() => props.fieldType === FIELD_TYPE.DATE_TIME);

  const pickerFormat = computed(() => (isDateTime.value ? 'YYYY-MM-DD HH:mm:ss' : 'YYYY-MM-DD'));

  const valueFormat = computed(() => (isDateTime.value ? 'YYYY-MM-DD HH:mm:ss' : 'YYYY-MM-DD'));

  function disabledMinDate(current) {
    if (!formState.value.max) return false;
    return current.isAfter(formState.value.max, 'second');
  }

  function disabledMaxDate(current) {
    if (!formState.value.min) return false;
    return current.isBefore(formState.value.min, 'second');
  }
</script>

<style lang="scss" scoped>
  $date-range-editor: (
    height: auto,
  );

  @include b(date-range-editor) {
    @include set-component-css-var(number-range-editor, $date-range-editor);
    height: getCssVar(date-range-editor, height);

    .gct-select-ex {
      #{getCssVarName(select-ex,font-size)}: 12px;
    }

    @include e(switch) {
      float: right;
    }

    @include e(num) {
      margin-top: 4px;
      width: 100%;
    }
  }
</style>
