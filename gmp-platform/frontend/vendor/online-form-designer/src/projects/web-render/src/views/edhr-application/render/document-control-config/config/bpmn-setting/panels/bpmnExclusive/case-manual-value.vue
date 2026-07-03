<template>
  <div class="case-manual-value">
    <a-input-number
      v-if="formState.type === CaseValueType.Integer"
      :bordered="false"
      v-model:value="formState.rValue"
      :precision="0"
      placeholder="请输入"
      size="small"
      :disabled="bpmnReadonly"
    />
    <a-input-number
      v-else-if="formState.type === CaseValueType.Double"
      :bordered="false"
      v-model:value="formState.rValue"
      placeholder="请输入"
      size="small"
      :disabled="bpmnReadonly"
    />
    <div
      v-else-if="formState.type === CaseValueType.Boolean"
      class="h-24x flex items-center pl-12px"
    >
      <a-radio-group v-model:value="formState.rValue" :disabled="bpmnReadonly">
        <a-radio :value="true">{{ t('sys.real') }}</a-radio>
        <a-radio :value="false">{{ t('sys.fake') }}</a-radio>
      </a-radio-group>
    </div>
    <a-date-picker
      v-else-if="formState.type === CaseValueType.Date"
      v-model:value="formState.rValue"
      value-format="YYYY-MM-DD"
      :bordered="false"
      placeholder="请选择"
      size="small"
      :disabled="bpmnReadonly"
    />
    <a-date-picker
      v-else-if="formState.type === CaseValueType.DateTime"
      v-model:value="formState.rValue"
      value-format="YYYY-MM-DD HH:mm:ss"
      :show-time="{ format: 'HH:mm:ss' }"
      :bordered="false"
      placeholder="请选择"
      size="small"
      :disabled="bpmnReadonly"
    />
    <a-time-picker
      v-else-if="formState.type === CaseValueType.Time"
      v-model:value="formState.rValue"
      value-format="HH:mm:ss"
      :bordered="false"
      placeholder="请选择"
      size="small"
      :disabled="bpmnReadonly"
    />
    <a-input
      v-else
      :bordered="false"
      v-model:value="formState.rValue"
      placeholder="请输入"
      size="small"
      :disabled="bpmnReadonly"
    />
  </div>
</template>

<script setup lang="ts">
  import { computed, inject, Ref } from 'vue';
  import { useGctFlow } from '@gct/flow';
  import { useI18n } from '/@/hooks/web/useI18n';
  import type { ICondition } from '@gct/flow/src/plugins/bpmn/types';
  import {
    CaseOperatorEnum,
    CaseValueType,
    BpmnNodeTypeEnum,
    ButtonTypeEnum,
    CaseValueSource,
  } from '@gct/flow/src/plugins/bpmn/enums';

  const bpmnReadonly: Ref<boolean> = inject('bpmnReadonly', false) as any;

  const props = defineProps<{
    condition: ICondition;
  }>();

  const formState = computed({
    get() {
      return props.condition;
    },
    set(value) {
      Object.assign(props.condition, value);
    },
  });

  const { t } = useI18n();
</script>

<style lang="less" scoped>
  .case-manual-value > div {
    width: 100%;
  }
</style>
