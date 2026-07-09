<template>
  <a-select
    :disabled="bpmnReadonly"
    :value="buttonKey"
    @select="handleButtonChange"
    :bordered="false"
    size="small"
  >
    <a-select-option v-for="ele in buttons" :key="ele.type" :value="ele.type">{{
      t('sys.bpmn.button.' + ele.type)
    }}</a-select-option>
  </a-select>
</template>

<script setup lang="ts">
  import { computed, inject, Ref } from 'vue';
  import { useGctFlow } from '@gct/flow';
  import { useI18n } from '/@/hooks/web/useI18n';
  import type { IGctBpmnNode } from '@gct/flow/src/plugins/bpmn/types';

  const props = defineProps<{
    nodeId?: string;
    buttonKey?: string;
  }>();

  const emit = defineEmits(['update:buttonKey']);

  const bpmnReadonly: Ref<boolean> = inject('bpmnReadonly', false) as any;
  const { gctFlowDataMap } = useGctFlow();
  const { t } = useI18n();

  const buttons = computed(() => {
    if (!props.nodeId) return [];
    return (gctFlowDataMap.value[props.nodeId].node as IGctBpmnNode).data.buttonConfig ?? [];
  });

  const handleButtonChange: any = (value: string) => {
    emit('update:buttonKey', value);
  };
</script>

<style></style>
