<template>
  <template v-if="!readonly">
    <form-item :label="`${t('sys.pageDesigner.fieldPlaceholder')}`" :inline="false">
      <a-input
        size="small"
        v-model:value="formState.placeholder"
        :placeholder="t('sys.inputText')"
        show-count
        :maxlength="32"
        :disabled="disabled"
      />
    </form-item>
    <DefaultValueEditor :widget="widget" :precision="digits" :disabled="disabled" />
    <DecimalDisplayMode
      v-if="showConfig"
      v-model:value="formState.displayMode"
      :disabled="disabled"
    />
    <NumberRangeEditor
      :widget="widget"
      :fieldMeta="fieldMeta"
      :readonly="readonly"
      :precision="digits"
      :disabled="disabled"
    />
  </template>

  <a-row v-if="showConfig" :gutter="16">
    <a-col :span="!readonly ? 12 : 24">
      <IndicesEditor
        v-model:is-super-script="formState.isSuperScript"
        v-model:script-value="formState.scriptValue"
        :disabled="disabled"
      />
    </a-col>
    <a-col v-if="!readonly" :span="12">
      <form-item :label="`${t('sys.model.decimalDigits')}`" :inline="false">
        <a-input-number
          :min="0"
          size="small"
          :disabled="disabled || !canEditDigits"
          :placeholder="t('sys.inputText')"
          v-model:value="digits"
          @blur="onBlur"
          :max="8"
        />
      </form-item>
    </a-col>
  </a-row>
  <form-item :label="`${t('sys.model.rulesForRounding')}`" :inline="false">
    <a-radio-group
      v-model:value="rulesForRounding"
      :disabled="disabled || !canEditDigits"
      class="rules-radio"
    >
      <a-radio :value="1">{{ $t('sys.onlineForm.rulesForRoundingOption1') }}</a-radio>
      <a-radio :value="4">{{ $t('sys.onlineForm.rulesForRoundingOption2') }}</a-radio>
      <a-radio :value="6">
        {{ $t('sys.onlineForm.rulesForRoundingOption3') }}
        <a-popover placement="topRight">
          <template #content>
            <div class="w440px text-12px">
              <div class="font-600 text-[#1A1D23] mb8px">{{
                $t('sys.onlineForm.interpretation')
              }}</div>
              <div class="text-[#8B8B8B]">
                {{ $t('sys.onlineForm.rulesForRoundingOption3Tip1') }}
              </div>
              <div class="font-600 text-[#1A1D23] my8px">{{
                $t('sys.onlineForm.rulesForRoundingOption3Tip2')
              }}</div>
              <a-table
                :data-source="exampleData"
                :pagination="false"
                size="middle"
                class="gct-rules-rounding-table"
              >
                <a-table-column
                  :title="$t('sys.onlineForm.originalData')"
                  data-index="origin"
                  width="60"
                />
                <a-table-column
                  :title="$t('sys.onlineForm.rulesForRoundingOption3TableColumn2')"
                  data-index="rule1"
                  width="100"
                />
                <a-table-column
                  :title="$t('sys.onlineForm.rulesForRoundingOption3TableColumn3')"
                  data-index="rule2"
                  width="120"
                />
                <template #summary>
                  <a-table-summary-row>
                    <a-table-summary-cell>{{
                      $t('sys.pageDesigner.average')
                    }}</a-table-summary-cell>
                    <a-table-summary-cell>
                      <a-typography-text>1.35</a-typography-text>
                    </a-table-summary-cell>
                    <a-table-summary-cell>
                      <a-typography-text>1.3</a-typography-text>
                    </a-table-summary-cell>
                  </a-table-summary-row>
                </template>
              </a-table>
            </div>
          </template>
          <question-circle-filled />
        </a-popover>
      </a-radio>
    </a-radio-group>
  </form-item>
</template>

<script setup lang="ts">
  import FormItem from '/@online-form/views/designer/modules/base/form-item.vue';
  import IndicesEditor from '../common/indices-editor/indices-editor.vue';
  import type { CellWidget } from '/@online-form/views/designer/types/cell-widget';
  import NumberRangeEditor from '../common/number-range/number-range-editor.vue';
  import { computed, ref } from 'vue';
  import { FIELD_TYPE } from '@gct/runtime';
  import type { IBindField } from '@gct/nocode-base';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useModelFields } from '/@online-form/views/designer/hooks/useModelFields';
  import { useSpreadSheet } from '../../designer/hooks/useSpreadSheet';
  import { useReverseModeling } from '../../designer/hooks/reverse-modeling';
  import DefaultValueEditor from '../common/default-value-editor/default-value-editor.vue';
  import DecimalDisplayMode from '../common/decimal-display-mode/decimal-display-mode.vue';

  const { t } = useI18n();

  const { getFieldMeta } = useModelFields();
  const { isEasyEdition } = useSpreadSheet();
  const { setFieldDigits, isStashedField, setFieldRoundingRules } = useReverseModeling();

  const props = defineProps<{
    fieldMeta: IBindField;
    widget: CellWidget.Decimal;
    fieldType: FIELD_TYPE;
    /** 打印或者关联模型字段 */
    readonly: boolean;
    disabled: boolean;
  }>();

  const formState = computed({
    get() {
      return props.widget;
    },
    set(v) {
      Object.assign(props.widget, v);
    },
  });

  const fieldDigits = computed(() => {
    const fieldInfo = getFieldMeta(props.fieldMeta);
    return fieldInfo?.specificConfig?.digits ?? 0;
  });

  const canEditDigits = computed(() => {
    return (
      isEasyEdition.value &&
      isStashedField({ key: props.fieldMeta.field!, modelKey: props.fieldMeta.model! })
    );
  });

  const _digits = ref();
  const digits = computed({
    get() {
      return _digits.value !== undefined ? _digits.value : fieldDigits.value;
    },
    set(v) {
      _digits.value = v || 0;
    },
  });

  const rulesForRounding = computed({
    get() {
      const fieldInfo = getFieldMeta(props.fieldMeta);
      return fieldInfo?.specificConfig?.rulesForRounding ?? 1;
    },
    set(v) {
      setFieldRoundingRules({
        modelKey: props.fieldMeta.model!,
        fieldKey: props.fieldMeta.field!,
        rulesForRounding: v,
      });
    },
  });

  const exampleData = [
    {
      origin: '1.15',
      rule1: '1.2',
      rule2: $t('sys.onlineForm.decimalExampleRule1'),
    },
    {
      origin: '1.25',
      rule1: '1.3',
      rule2: $t('sys.onlineForm.decimalExampleRule2'),
    },
    {
      origin: '1.35',
      rule1: '1.4',
      rule2: $t('sys.onlineForm.decimalExampleRule3'),
    },
    {
      origin: '1.45',
      rule1: '1.5',
      rule2: $t('sys.onlineForm.decimalExampleRule4'),
    },
  ];

  const onBlur = (...args) => {
    setFieldDigits({
      modelKey: props.fieldMeta.model!,
      fieldKey: props.fieldMeta.field!,
      digits: _digits.value,
    });
    console.log('onBlur', args, _digits.value);
  };

  const showConfig = computed(() => {
    return ![FIELD_TYPE.WORK_HOURS].includes(props.fieldType);
  });
</script>

<style lang="scss" scoped>
  .rules-radio {
    :deep(.ant-radio-wrapper) {
      font-size: 12px;
      margin: 0;

      .ant-radio-inner {
        width: 12px;
        height: 12px;
      }
    }
  }
</style>
<style>
  .gct-rules-rounding-table .ant-table.ant-table-middle {
    font-size: 12px;
  }
</style>
