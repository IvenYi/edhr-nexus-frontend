<template>
  <div>
    <a-form ref="formRef" :model="formState" autocomplete="off" layout="vertical">
      <a-form-item :label="$t('sys.integration.callFuncName')" :rules="[{ required: true }]">
        <a-input
          v-model:value="formState.functionName"
          :disabled="readonly"
          :placeholder="$t('sys.inputText')"
        />
      </a-form-item>
      <ParamsConfigButton :readonly="readonly" :form="formState" />
      <DebugButton v-show="!readonly" :nodeId="nodeData.bizData.nodeId" :disabled="readonly" />
    </a-form>
  </div>
</template>
<script setup lang="ts">
  import { GctFlowNode } from '@gct/flow';
  import type { NodeBizDataSchema, NodeDataSchema } from '@gct/flow/src/plugins/ipaas-bpmn/types';
  import { computed } from 'vue';
  import DebugButton from '../__comps__/debug-button.vue';
  import ParamsConfigButton from '../__comps__/rfc/rfc-params-config-button.vue';

  const props = defineProps<{
    node: GctFlowNode.Basic;
    nodeData: NodeDataSchema.Connector;
    readonly: boolean;
  }>();

  const formState = computed<NodeBizDataSchema.Platform['nodeConfig']>({
    get() {
      return props.nodeData.bizData.nodeConfig as any;
    },
    set(value) {
      // eslint-disable-next-line vue/no-mutating-props
      props.nodeData.bizData.nodeConfig = value;
    },
  });
</script>
<style lang="less" scoped></style>
