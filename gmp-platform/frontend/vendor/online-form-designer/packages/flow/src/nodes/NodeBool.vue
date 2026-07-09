<template>
  <!-- <div> -->
  <div :class="'c-flow__node--' + node.type">
    <div
      class="c-flow__node--view flex items-center relative"
      :class="[nodeData?.id === node.id && 'selected-node']"
      @click="nodeClick(node)"
    >
      <div class="icon-box">
        <!-- <icon-park type="api-app" /> -->
        <i class="iconfont icon-panduan"></i>
        <!-- <i class="iconfont icon-"></i> -->
      </div>
      <div class="c-flow__node--view--main">
        <div>N{{ gctFlowDataMap[node.id].idx + 1 }}.判断</div>
        <component
          v-if="nodeContentRenderDescMap[node.type]"
          :is="nodeContentRenderDescMap[node.type]"
          v-bind="$props"
        />
        <div v-else>{{ node.id }}</div>
      </div>
      <div class="node-tools">
        <NodeTools :node="node" />
      </div>
      <!-- <template v-if="false">
        <Tooptip :messageList="['提示信息', '提示信息']" />
      </template> -->
    </div>

    <!-- <div :id="node.id + '__start'"></div> -->
    <div class="group1">
      <!-- <div class="add-flow" @click="add">添加分支</div> -->
      <div class="line1"></div>
    </div>
    <div class="flows">
      <div :key="item.id" v-for="(item, index) in node.children" class="flow">
        <div class="flow-before">
          <span v-if="index === 0" class="bool bool__y">
            <span>{{$t('sys.true')}}</span>
            <span>(</span>
            <span>Y</span>
            <span>)</span>
          </span>
          <span v-else class="bool bool__n">
            <span>{{$t('sys.false')}}</span>
            <span>(</span>
            <span>N</span>
            <span>)</span>
          </span>
        </div>
        <LineActions :list="item.children" isFlowStart />
        <LineArrow v-if="item.children.length > 0" />
        <NodeFlow
          :node="node"
          :flow="item"
          :parent-id="item.id"
          :flow-index="index"
          :flow-size="node.children.length"
        />
        <div class="line-pad"></div>
        <div class="flow-after"></div>
      </div>
    </div>
    <!-- <div :id="node.id + '__end'"></div> -->
  </div>
</template>

<script setup lang="ts">
  import type { GctFlowNode } from '../types';
  // import NodeGroup from './NodeGroup.vue';
  import { FlowNodeTypeEnum } from '../enums';
  // import NodeBasic from './NodeBasic.vue';
  // import NodeEntry from './NodeEntry.vue';
  import NodeFlow from './NodeFlow.vue';
  import LineActions from '../comps/LineActions.vue';
  import LineArrow from '../comps/LineArrow.vue';
  import { useGctFlow } from '../hooks/useGctFlow';
  // import Tooptip from '../comps/Tooltip.vue';
  import NodeTools from '../comps/NodeTools.vue';

  import { inject, onMounted } from 'vue';

  const props = defineProps<{
    node: GctFlowNode.Bool;
  }>();

  const uniqueFlowKey: string = inject('uniqueFlowKey')!;
  const { nodeClick, gctFlowDataMap, nodeData, nodeContentRenderDescMap } =
    useGctFlow(uniqueFlowKey);

  onMounted(() => {
    // props.
  });
</script>

<style lang="less" scoped></style>
