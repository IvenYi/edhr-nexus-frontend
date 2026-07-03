<template>
  <field-unique-key
    v-if="!isDataModel && !hideUniqueKey"
    v-show="!isCustom"
    :is-tree-model="boolSupportTree"
    :is-disabled="isEdit"
    v-model:type="formData.uniqueConstraint.type"
    v-model:fieldKeys="formData.uniqueConstraint.fieldKeys"
  />
  <a-form-item
    :label="`${t('sys.model.decimalDigits')}`"
    :name="['specificConfig', 'digits']"
    :rules="[{ required: true }]"
  >
    <a-input-number
      v-model:value="formData.specificConfig.digits"
      :min="configDigits"
      :precision="0"
      :max="8"
      :placeholder="t('sys.inputText')"
    />
  </a-form-item>
  <a-form-item
    v-if="isInOnlineForm"
    :label="`${t('sys.model.rulesForRounding')}`"
    :name="['specificConfig', 'rulesForRounding']"
  >
    <a-radio-group v-model:value="formData.specificConfig.rulesForRounding">
      <a-radio :value="1">截取</a-radio>
      <a-radio :value="4">四舍五入</a-radio>
      <a-radio :value="6">
        四舍六入
        <a-popover placement="top">
          <template #content>
            <div class="w550px">
              <div class="font-600 text-[#1A1D23] mb8px">释义</div>
              <div class="text-[#8B8B8B]">
                “四舍六入五成双”数值修约规则，目的是减少传统“四舍五入”因只入不舍带来的累计误差，让修约结果更客观、更适合高精度计算场景（如GMP
                合规的检验数据、统计分析、财务核算等）
              </div>
              <div class="font-600 text-[#1A1D23] my8px">与传统“四舍五入”的差异对比</div>
              <a-table :data-source="exampleData" :pagination="false" size="middle">
                <a-table-column title="原始数据" data-index="origin" width="60" />
                <a-table-column title="四舍五入（保留 1 位小数）" data-index="rule1" width="100" />
                <a-table-column
                  title="四舍六入五成双（保留 1 位小数）"
                  data-index="rule2"
                  width="120"
                />
                <template #summary>
                  <a-table-summary-row>
                    <a-table-summary-cell>平均值</a-table-summary-cell>
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
  </a-form-item>
  <template v-if="!isInOnlineForm">
    <a-form-item
      :label="`${t('sys.model.valueLimit')}`"
      name="range"
      :rules="[
        {
          validator: (rule, value) => validateLengthRange(rule, value, formData),
          message: t('sys.model.numMaxGTMin'),
        },
      ]"
    >
      <number-range
        v-model:range-min="formData.specificConfig.minValue"
        v-model:range-max="formData.specificConfig.maxValue"
        :disabled="isEdit"
        :precision="formData.specificConfig.digits"
        :placeholderType="t('sys.model.num')"
        @change="handleRangeChange"
        :maxObj="{ start: 9999999, end: 9999999 }"
      />
    </a-form-item>
    <a-form-item
      :label="`${t('sys.defaultValue')}`"
      :name="['defaultValue', 'type']"
      v-show="false"
    >
      <a-input :value="formData.defaultValue.type" />
    </a-form-item>
    <a-form-item
      v-show="!isCustom"
      :label="`${t('sys.defaultValue')}`"
      :name="['defaultValue', 'value']"
      :rules="[{ validator: (rule, value) => validateFieldDefaultForValue(rule, value, formData) }]"
    >
      <a-input-number
        v-model:value="formData.defaultValue.value"
        :precision="formData.specificConfig.digits"
        :placeholder="t('sys.inputText')"
        :max="9999999"
      />
    </a-form-item>
  </template>
</template>

<script setup lang="ts" name="decimal">
  import { PropType, reactive, watch, inject } from 'vue';
  import { FieldFormState } from '../../../types/entity.d';
  import { NumberRange } from '/@/components/NumberRange';
  import { FieldDefaultValueTypeEnum } from '@/projects/app-designer/src/enum';
  import { useI18n } from '/@/hooks/web/useI18n';
  import FieldUniqueKey from '../components/field-unique-key.vue';
  import { FormInstance } from 'ant-design-vue';
  import {
    validateLengthRange,
    validateFieldDefaultForValue,
  } from '/@app-designer/views/model-desginer/utils/validate';

  const isInOnlineForm = inject<boolean>('isInOnlineForm', false);

  const { t } = useI18n();

  const emit = defineEmits(['update:formState']);
  const props = defineProps({
    formState: { type: Object as PropType<FieldFormState>, default: {} },
    isEdit: { type: Boolean, default: false },
    boolSupportTree: { type: Boolean, default: false },
    formRef: { type: Object as PropType<FormInstance>, default: null },
    // 是否是自定义字段，设计器-表单中使用
    isCustom: { type: Boolean, default: false },
    isDataModel: { type: Boolean, default: false },
    hideUniqueKey: { type: Boolean, default: false },
  });
  const formData = reactive<FieldFormState>(props.formState);
  formData.specificConfig = {
    ...formData.specificConfig,
    rulesForRounding: formData.specificConfig.rulesForRounding ?? (props.isEdit ? 1 : 6),
  };
  const configDigits = props.isEdit ? formData.specificConfig.digits : 0;

  const exampleData = [
    {
      origin: '1.15',
      rule1: '1.2',
      rule2: '1.2（保留位 1 是奇数，进 1）',
    },
    {
      origin: '1.25',
      rule1: '1.3',
      rule2: '1.2（保留位 2 是偶数，舍去）',
    },
    {
      origin: '1.35',
      rule1: '1.4',
      rule2: '1.4（保留位 3 是奇数，进 1）',
    },
    {
      origin: '1.45',
      rule1: '1.5',
      rule2: '1.4（保留位 4 是偶数，舍去）',
    },
  ];

  const initData = () => {
    return {
      specificConfig: {
        digits: 0,
        rulesForRounding: 6,
      },
    };
  };

  watch(
    () => formData,
    (val) => {
      emit('update:formState', val);
    },
    { deep: true },
  );

  watch(
    () => formData.defaultValue.value,
    (value) => {
      if (value === null || value === undefined) {
        formData.defaultValue.type = FieldDefaultValueTypeEnum.NONE;
      } else {
        formData.defaultValue.type = FieldDefaultValueTypeEnum.FIXED;
      }
    },
  );

  const handleRangeChange = () => {
    props.formRef.validateFields(['range', ['defaultValue', 'value']]);
  };

  defineExpose({
    initData,
  });
</script>

<style lang="less" scoped></style>
