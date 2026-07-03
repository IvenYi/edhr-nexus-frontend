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
      <a-input-number
        v-if="formState.maxValidateMode === RangeValidateMode.Fixed_Number"
        :class="[ns.e('num')]"
        v-model:value="formState.max"
        :min="maxLimit.lowerLimit"
        :max="maxLimit.upperLimit"
        :precision="precision"
        :placeholder="t('sys.inputTextTip', { name: t('sys.onlineForm.maxNumber') })"
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
      <a-input-number
        v-if="formState.minValidateMode === RangeValidateMode.Fixed_Number"
        :class="[ns.e('num')]"
        v-model:value="formState.min"
        :min="minLimit.lowerLimit"
        :max="minLimit.upperLimit"
        :precision="precision"
        :placeholder="t('sys.inputTextTip', { name: t('sys.onlineForm.minNumber') })"
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

<script lang="ts" setup name="number-range-editor">
  import { useNamespace } from '@gct/runtime';
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

  const ns = useNamespace('number-range-editor');

  const props = withDefaults(
    defineProps<{
      fieldMeta: IBindField;
      widget: CellWidget.Integer | CellWidget.Double | CellWidget.Decimal;
      /** 打印或者关联模型字段 */
      readonly: boolean;
      precision?: number;
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

  const minLimit = computed(() => {
    const lowerLimit = Infinity;
    const upperLimit = isNil(formState.value.max) ? Infinity : formState.value.max;
    return {
      lowerLimit,
      upperLimit,
    };
  });

  const maxLimit = computed(() => {
    const lowerLimit = isNil(formState.value.min) ? Infinity : formState.value.min;
    const upperLimit = Infinity;
    return {
      lowerLimit,
      upperLimit,
    };
  });
</script>

<style lang="scss" scoped>
  $number-range-editor: (
    height: auto,
  );

  @include b(number-range-editor) {
    @include set-component-css-var(number-range-editor, $number-range-editor);
    height: getCssVar(number-range-editor, height);

    .gct-select-ex {
      #{getCssVarName(select-ex,font-size)}: 12px;
    }

    @include e(switch) {
      float: right;
    }

    @include e(num) {
      margin-top: 4px;
    }
  }
</style>
