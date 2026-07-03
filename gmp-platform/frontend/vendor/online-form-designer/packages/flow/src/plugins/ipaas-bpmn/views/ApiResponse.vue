<template>
  <div class="gf__node" @click="onNodeClick(node)">
    <NodeTools :node="node" />
    <NodeTooltips :node="node" />
    <NodeInstStatus :node="node" />
    <NodeInfoPopover :node="node" :config-data="node?.data?.bizData?.nodeConfig">
      <div
        class="gct-flow__node gct-flow__node--app flex items-center"
        :class="[
          nodeInstStatusMap[node.id]?.status,
          {
            selected: !isInstMode && nodeSelectedId === node.id,
            'inst-mode': isInstMode,
          },
        ]"
      >
        <div class="gct-flow__node-icon">
          <icon-park type="api-app" />
        </div>
        <div class="gct-flow__node-content">
          <div class="overflow-hidden">
            <!-- ApiResponse -->
            <div>
              <span class="text-[#797A7D] mr8px">N{{ gctFlowDataMap[node.id].idx + 1 }}.</span>
              <span class="text-[#212528] font-500">ApiResponse</span>
            </div>
          </div>
        </div>
      </div>
    </NodeInfoPopover>
  </div>
</template>

<script setup lang="ts">
  import { useGctFlow } from '@gct/flow';
  import { GctBpmnNode, NodeDataSchema } from '../types';
  import { IconPark } from '@icon-park/vue-next/es/all';
  import NodeTools from '../../../comps/NodeTools.vue';
  import NodeTooltips from '../../../comps/NodeTooltips.vue';
  import NodeInstStatus from '../comps/node-inst-status.vue';
  import { computed } from 'vue';
  import NodeInfoPopover from '../comps/node-info-popover/index.vue';

  const props = defineProps<{
    node: GctBpmnNode.BpmnApiResponse;
  }>();
  const { gctFlowDataMap, onNodeClick, nodeSelectedId, isInstMode, nodeInstStatusMap } =
    useGctFlow();

  const nodeData = computed<NodeDataSchema.Base | undefined>(() => {
    return props.node.data;
  });
</script>

<style lang="less" scoped>
  // .gct-flow__node.inst-finished {
  //   border-color: #309c41;
  //   border-width: 2px;
  // }
</style>
