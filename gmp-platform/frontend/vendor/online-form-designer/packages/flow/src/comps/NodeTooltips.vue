<template>
  <div class="node-tooltip" v-if="node.tooltips && node.tooltips.length">
    <a-tooltip placement="right">
      <template #title>
        <div class="tips-wrap">
          <div v-for="(e, i) in node.tooltips" class="tips-item" :key="i">
            {{ i + 1 }}. {{ e }}
          </div>
        </div>
      </template>
      <i class="iconfont icon-jinggao1 text-[#F54547]"></i>
    </a-tooltip>
  </div>
</template>
<script setup lang="ts">
  import type { GctFlowNode } from '../types';

  defineProps<{
    node: GctFlowNode.Basic;
  }>();
</script>
<style lang="less" scoped>
  .node-tooltip {
    position: absolute;
    right: -24px;
    top: 50%;
    transform: translateY(-50%);
    cursor: pointer;
  }
</style>
