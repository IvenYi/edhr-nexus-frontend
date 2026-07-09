<template>
  <div :class="'c-flow__node--' + node.type" @click="onNodeClick(node)">
    <div
      class="c-flow__node--view relative"
      :id="node.id"
      :class="[nodeData?.id === node.id && 'selected-node']"
    >
      <div>
        <span>N{{ gctFlowDataMap[node.id].idx + 1 }}.</span>
        <span v-if="flowData.flowIndex + 1 === flowData.flowSize"> {{$t('sys.ipaas.other')}}</span>
        <span v-else> {{$t('sys.ipaas.condition.index')}}{{ flowData.flowIndex + 1 }}</span>
      </div>
      <component
        v-if="nodeContentRenderDescMap[node.type]"
        :is="nodeContentRenderDescMap[node.type]"
        v-bind="$props"
      />
      <div v-else>{{ node.id }}</div>
      <div class="node-tools">
        <NodeTools :node="node" />
      </div>
      <!-- <template v-if="false">
        <Tooptip :messageList="['提示信息', '提示信息']" />
      </template> -->
    </div>
  </div>
</template>

<script setup lang="ts">
  import type { GctFlowNode } from '../types';
  import { inject, onMounted } from 'vue';
  import { useGctFlow } from '../hooks/useGctFlow';
  // import Tooptip from '../comps/Tooltip.vue';
  import NodeTools from '../comps/NodeTools.vue';

  interface Flow {
    node: GctFlowNode.Flow;
    flowIndex: number;
    flowSize: number;
  }

  const props = defineProps<{
    node: GctFlowNode.Condition;
    list?: GctFlowNode.Basic[];
  }>();

  const uniqueFlowKey: string = inject('uniqueFlowKey')!;
  const {
    connectById,
    disconnectById,
    gctFlowDataMap,
    onNodeClick,
    nodeData,
    nodeContentRenderDescMap,
  } = useGctFlow(uniqueFlowKey);
  const flowData = inject('flowData') as Flow;

  onMounted(() => {
    // connectById(flowData.node.id + '__start', props.node.id);
  });
</script>

<style lang="less" scoped></style>
