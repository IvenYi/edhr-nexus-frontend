<template>
  <div :class="'c-flow__node--' + node.type">
    <div
      class="c-flow__node--view flex items-center"
      :class="[nodeData?.id === node.id && 'selected-node']"
      @click="nodeClick(node)"
    >
      <div class="icon-box">
        <!-- <icon-park type="api-app" />÷ -->
        <i class="iconfont icon-jieshu"></i>
        <!-- <i class="iconfont icon-"></i> -->
      </div>
      <div class="c-flow__node--view--main">
        <div>{{$t('sys.ipaas.end')}}</div>
        <component
          v-if="nodeContentRenderDescMap[node.type]"
          :is="nodeContentRenderDescMap[node.type]"
          v-bind="$props"
        />
        <div v-else>---</div>
      </div>
      <div class="node-tools">
        <NodeTools :node="node" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import type { GctFlowNode } from '../types';
  import { useGctFlow } from '../hooks/useGctFlow';
  import NodeTools from '../comps/NodeTools.vue';
  import { inject } from 'vue';
  // import NodeBasic from './NodeBasic.vue';

  defineProps<{
    node: GctFlowNode.End;
  }>();

  const uniqueFlowKey: string = inject('uniqueFlowKey')!;
  const { nodeClick, nodeData } = useGctFlow(uniqueFlowKey);
</script>

<style lang="less" scoped></style>
