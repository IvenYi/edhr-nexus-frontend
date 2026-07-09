<template>
  <div :class="'c-flow__node--' + node.type">
    <div
      class="c-flow__node--view flex items-center relative"
      :class="[nodeData?.id === node.id && 'selected-node']"
      @click="onNodeClick(node)"
    >
      <div class="icon-box">
        <i class="iconfont icon-fenzhi"></i>
      </div>
      <div class="c-flow__node--view--main">
        <div>N{{ gctFlowDataMap[node.id].idx + 1 }}.{{$t('sys.ipaas.branch')}}</div>
        <component
          v-if="nodeContentRenderDescMap[node.type]"
          :is="nodeContentRenderDescMap[node.type]"
          v-bind="$props"
        />
        <div v-else>{{$t('sys.ipaas.addConditionAndExecute')}}</div>
      </div>
      <div class="node-tools">
        <NodeTools :node="node" />
      </div>
      <!-- <template v-if="false">
        <Tooptip :messageList="['提示信息', '提示信息']" />
      </template> -->
    </div>
    <div class="group1">
      <div class="add-flow" @click="addFlow">{{$t('sys.ipaas.addBranchCondition')}}</div>
      <div class="line1"></div>
    </div>
    <div v-if="node.children.length" class="flows">
      <div :key="item.id" v-for="(item, index) in node.children" class="flow">
        <div class="flow-before"></div>
        <LineArrow />
        <NodeFlow
          :node="node"
          :flow="item"
          :flow-index="index"
          :flow-size="node.children.length"
          :parent-id="item.id"
        />
        <div class="line-pad"></div>
        <div class="flow-after"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import type { GctFlowNode } from '../types';
  import { FlowNodeTypeEnum } from '../enums';
  import NodeFlow from './NodeFlow.vue';
  import LineArrow from '../comps/LineArrow.vue';
  import NodeGenerator from '../utils/NodeGenerator';
  import { useGctFlow } from '../hooks/useGctFlow';
  import NodeTools from '../comps/NodeTools.vue';
  import { inject } from 'vue';

  const props = defineProps<{
    node: GctFlowNode.Switch;
  }>();

  const uniqueFlowKey: string = inject('uniqueFlowKey')!;
  const { gctFlowDataMap, onNodeCreate, onNodeClick, nodeData, nodeContentRenderDescMap } =
    useGctFlow(uniqueFlowKey);

  const addFlow = () => {
    const flowIf = NodeGenerator[FlowNodeTypeEnum.Flow]();
    flowIf.children.push(
      NodeGenerator[FlowNodeTypeEnum.Condition](),
      NodeGenerator[FlowNodeTypeEnum.App](),
    );
    // eslint-disable-next-line vue/no-mutating-props
    props.node.children.splice(props.node.children.length - 1, 0, flowIf);
    onNodeCreate(flowIf);
  };
</script>

<style lang="less" scoped></style>
