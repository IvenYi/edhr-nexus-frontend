<template>
  <NodeComp :node="node" :style="{ '--n-color': '#3168ec', '--n-width': '150px' }">
    <template #icon>
      <i class="iconfont icon-fangfa lh-[1em]"></i>
    </template>
    <template #extra>
      <div class="tag-mode ell w28px overflow-hidden" :class="[node.data?.interactiveMode === 'async' && 'async']" :title="modeName">
        {{ modeName }}
      </div>
    </template>
  </NodeComp>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import type { GctBpmnNode } from '../types';
  import NodeComp from './node.vue';

  const props = defineProps<{
    node: GctBpmnNode.BpmnTransaction;
  }>();

  const modeName = computed(() => {
    return $t(`sys.ipaas.responseMethod.${props.node?.data?.interactiveMode?.toUpperCase() || 'ASYNC'}`);
  });
</script>

<style lang="less" scoped>
  .gct-bpmn {
    &__message {
      --color: #3168ec;

      display: flex;
      align-items: center;
      justify-content: center;
      width: 120px;
      height: 46px;
      padding: 0 16px;
      border: 1px solid #e8ebf0;
      border-radius: 4px;
      background-color: #fff;
      color: #212528;

      &.selected {
        border-color: var(--color);
      }

      & > div:first-child {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 20px;
        height: 20px;
        margin-right: 8px;
        border-radius: 4px;
        background-color: rgb(from var(--color) r g b / 10%);
        color: var(--color);
      }
    }
  }

  .tag-mode {
    padding: 0 4px;
    border-radius: 4px;
    background-color: #06F;
    color: #fff;
    font-size: 10px;

    &.async {
      background-color: #EFA432;
    }
  }
</style>
