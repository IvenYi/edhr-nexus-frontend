<template>
  <div class="gct-flow__flow">
    <NodeWrapper
      v-for="(item, index) in flow.children?.filter((e) => !e.hidden)"
      :key="item.id"
      :node="item"
      :prev="flow.children[index - 1]"
      :next="flow.children[index + 1]"
      :list="flow.children"
      :flow="flow"
      :parent="node"
    >
      <component
        v-if="customNodeViewMap[item.type]"
        :is="customNodeViewMap[item.type]"
        :node="item"
        :prev="flow.children[index - 1]"
        :next="flow.children[index + 1]"
        :list="flow.children"
      />
      <component
        v-else
        :is="nodeMap[item.type]"
        :node="item"
        :prev="flow.children[index - 1]"
        :next="flow.children[index + 1]"
        :list="flow.children"
      />
    </NodeWrapper>
  </div>
</template>

<script setup lang="ts">
  import { inject, provide } from 'vue';
  import type { GctFlowNode } from '../types';
  import { FlowNodeTypeEnum } from '../enums';
  import NodeApp from './NodeApp.vue';
  import NodeBool from './NodeBool.vue';
  import NodeLoop from './NodeLoop.vue';
  import NodeSwitch from './NodeSwitch.vue';
  import NodeCondition from './NodeCondition.vue';
  import NodeEnd from './NodeEnd.vue';

  import NodeWrapper from '../comps/NodeWrapper.vue';
  import { useGctFlow } from '../hooks/useGctFlow';

  const nodeMap = {
    [FlowNodeTypeEnum.App]: NodeApp,
    [FlowNodeTypeEnum.Bool]: NodeBool,
    [FlowNodeTypeEnum.Loop]: NodeLoop,
    [FlowNodeTypeEnum.Switch]: NodeSwitch,
    [FlowNodeTypeEnum.Condition]: NodeCondition,
    [FlowNodeTypeEnum.End]: NodeEnd,
  };

  interface Flow {
    node?: GctFlowNode.Basic;
    flow: GctFlowNode.Flow;
    flowIndex?: number;
    flowSize?: number;
  }

  const props = withDefaults(defineProps<Flow>(), {
    flowIndex: 0,
    flowSize: 1,
  });

  provide('flowData', props);

  const uniqueFlowKey: string = inject('uniqueFlowKey')!;
  const { customNodeViewMap } = useGctFlow(uniqueFlowKey);
</script>

<style lang="less" scoped></style>
