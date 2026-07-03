<template>
  <div class="biz-node-item flex items-center">
    <div
      v-show="!data.disableState"
      class="state"
      :style="{ backgroundColor: data.stateColor || '#48c65c' }"
    ></div>
    <div class="flex-1 ell" :title="data.title">
      {{ data.title }}
    </div>
    <div class="biz-node-item-btns" @click.stop.prevent>
      <slot name="ope" :data="data"></slot>
    </div>
  </div>
</template>
<script setup lang="ts">
  import { NodeItem } from './types';

  defineProps<{
    data: NodeItem;
  }>();
</script>
<style lang="less" scoped>
  .state {
    width: 6px;
    height: 6px;
    // background-color: #48c65c;
    border-radius: 50%;
    margin-right: 8px;
  }

  .biz-node-item-btns {
    display: none;
  }
</style>
