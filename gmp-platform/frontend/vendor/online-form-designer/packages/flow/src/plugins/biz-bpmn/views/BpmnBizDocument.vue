<template>
  <NodeComp :node="node" :style="{ '--n-color': '#3168ec' }">
    <template #icon>
      <i class="iconfont icon-biaodanjiedian lh-[1em]"></i>
    </template>
  </NodeComp>
</template>

<script setup lang="ts">
  import type { GctBpmnNode } from '../types';
  import NodeComp from './node.vue';

  defineProps<{
    node: GctBpmnNode.BpmnBizDocument;
  }>();
</script>

<style lang="less" scoped>
  .gct-bpmn {
    &__message {
      --color: #3168ec;
      border: 1px solid #e8ebf0;
      background-color: #fff;
      height: 46px;
      width: 120px;
      border-radius: 4px;
      display: flex;
      padding: 0 16px;
      align-items: center;
      justify-content: center;
      color: #212528;

      &.selected {
        border-color: var(--color);
      }

      & > div:first-child {
        height: 20px;
        width: 20px;
        border-radius: 4px;
        margin-right: 8px;
        color: var(--color);
        background-color: rgb(from var(--color) r g b / 10%);
        display: flex;
        align-items: center;
        justify-content: center;
      }
    }
  }
</style>
