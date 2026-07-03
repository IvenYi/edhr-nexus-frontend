<template>
  <div :class="'c-flow__node--' + node.type">
    <div
      class="c-flow__node--view flex items-center relative"
      :class="[nodeData?.id === node.id && 'selected-node']"
      @click="nodeClick(node)"
    >
      <div class="icon-box">
        <i class="iconfont icon-xunhuan"></i>
      </div>
      <div class="c-flow__node--view--main">
        <div>N{{ gctFlowDataMap[node.id].idx + 1 }}.{{$t('sys.ipaas.loop')}}</div>
        <component
          v-if="nodeContentRenderDescMap[node.type]"
          :is="nodeContentRenderDescMap[node.type]"
          v-bind="$props"
        />
        <div v-else>{{$t('sys.ipaas.loopProcessList')}}</div>
      </div>
      <div class="node-tools">
        <NodeTools :node="node" />
      </div>
      <!-- <template v-if="false">
        <Tooptip :messageList="['提示信息', '提示信息']" />
      </template> -->
    </div>
    <div class="loop-content">
      <div class="group1">
        <LineArrow />
        <span class="node-text">{{$t('sys.ipaas.loopProcess')}}</span>
      </div>
      <div class="flows">
        <div :key="item.id" v-for="(item, index) in node.children" class="flow flow--single">
          <div v-if="!item.children.length" class="h168px ks-column justify-center">
            <LineActions :list="item.children" isFlowStart>
              <a-button type="link">
                <template #icon>
                  <i class="iconfont icon-tianjia mr4px" style="font-size: 14px"></i>
                </template>
                {{$t('sys.ipaas.newStep')}}
              </a-button>
            </LineActions>
          </div>
          <template v-else>
            <div class="flow-before"></div>
            <LineActions :list="item.children" isFlowStart />
            <LineArrow />
            <NodeFlow
              :node="node"
              :flow="item"
              :flow-index="index"
              :flow-size="node.children.length"
              :parent-id="item.id"
            />
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import type { GctFlowNode } from '../types';
  // import { FlowNodeTypeEnum } from '../enum';
  // import NodeBasic from './NodeBasic.vue';
  import NodeFlow from './NodeFlow.vue';
  // import { onMounted } from 'vue';
  import LineArrow from '../comps/LineArrow.vue';
  // import NodeGenerator from '../utils/NodeGenerator';
  import LineActions from '../comps/LineActions.vue';
  import { useGctFlow } from '../hooks/useGctFlow';
  // import Tooptip from '../comps/Tooltip.vue';
  import NodeTools from '../comps/NodeTools.vue';
  import { inject } from 'vue';

  const props = defineProps<{
    node: GctFlowNode.Loop;
  }>();

  const uniqueFlowKey: string = inject('uniqueFlowKey')!;
  const { gctFlowDataMap, nodeClick, nodeData, nodeContentRenderDescMap } =
    useGctFlow(uniqueFlowKey);
</script>

<style lang="less" scoped></style>
