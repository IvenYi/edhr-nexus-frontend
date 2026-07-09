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
          <i
            v-if="nodeData?.triggerType === TriggerType.Fixed"
            class="iconfont icon-a-webhook1"
          ></i>
          <i
            v-else-if="nodeData?.triggerType === TriggerType.Timed"
            class="iconfont icon-dingshirenwu"
          ></i>
          <icon-park v-else type="api-app" />
        </div>
        <div class="gct-flow__node-content">
          <div class="overflow-hidden">
            <div>
              <span class="text-[#797A7D] mr8px">N{{ gctFlowDataMap[node.id].idx + 1 }}.</span>
              <span
                v-if="nodeData?.bizData.endpointType === EndpointType.webhook"
                class="text-[#212528] font-500"
                >Webhook</span
              >
              <span
                v-else-if="nodeData?.bizData.nodeConfig?.quartzType === QuartzType.CRON"
                class="text-[#212528] font-500"
                >Cron</span
              >
              <span v-else>--</span>
            </div>
            <div class="text-[#5C5C5C] ell mt-4px">
              <template v-if="nodeData?.triggerType === TriggerType.Fixed">{{
                $t('sys.ipaas.fixedTrigger')
              }}</template>
              <template v-else-if="nodeData?.triggerType === TriggerType.Timed">{{
                $t('sys.ipaas.timedTrigger')
              }}</template>
              <template v-else>{{ $t('sys.ipaas.pleaseSelectTrigger') }}</template>
            </div>
          </div>
        </div>
      </div>
    </NodeInfoPopover>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import { useGctFlow } from '@gct/flow';
  import { TriggerType, EndpointType, QuartzType } from '../enums';
  import { GctBpmnNode, NodeDataSchema } from '../types';
  import { IconPark } from '@icon-park/vue-next/es/all';
  import NodeTools from '../../../comps/NodeTools.vue';
  import NodeTooltips from '../../../comps/NodeTooltips.vue';
  import NodeInstStatus from '../comps/node-inst-status.vue';
  import NodeInfoPopover from '../comps/node-info-popover/index.vue';

  const props = defineProps<{
    node: GctBpmnNode.BpmnTrigger;
  }>();

  const { gctFlowDataMap, onNodeClick, nodeSelectedId, isInstMode, nodeInstStatusMap, isReadonly } =
    useGctFlow();

  /**
   * 节点上挂载的数据
   */
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
