<template>
  <form-item :label="t('sys.appDesigner.approval.nodeKey')" is-first>
    <div class="ell w100%" :title="formState!.key">{{ formState!.key }}</div>
  </form-item>
  <form-item
    :label="t('sys.appDesigner.approval.nodeName')"
    name="name"
    :inline="false"
    :rules="[
      {
        required: true,
        message: t('sys.notEmptySth', { sth: t('sys.appDesigner.approval.nodeName') }),
      },
    ]"
  >
    <a-input
      v-model:value="formState!.name"
      size="small"
      :maxlength="32"
      show-count
      :placeholder="t('sys.inputText')"
      :disabled="paasBpmnReadonly"
      @change="validNodeData(formState!.key)"
    />
  </form-item>
  <form-item :label="t('sys.appDesigner.approval.nodeDesc')" :inline="false" name="description">
    <a-textarea
      v-model:value="formState!.description"
      size="small"
      :maxlength="120"
      show-count
      :rows="3"
      :disabled="paasBpmnReadonly"
      :placeholder="t('sys.inputText')"
    />
  </form-item>
</template>
<script setup lang="ts">
  import FormItem from './form-item.vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { computed, inject } from 'vue';
  import type { IGctBpmnNodeDefinition } from '@gct/flow/src/plugins/paas-bpmn/types';
  import { useProcess } from '../hook/useProcess';

  const props = defineProps<{
    data?: IGctBpmnNodeDefinition;
  }>();

  const { t } = useI18n();
  const paasBpmnReadonly = inject('paasBpmnReadonly', false);
  const { validNodeData } = useProcess();

  const formState = computed({
    get() {
      return props.data;
    },
    set(value) {
      Object.assign(props.data ?? {}, value);
    },
  });
</script>
<style lang="less" scoped></style>
