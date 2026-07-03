<template>
  <div id="myCanvas"></div>
</template>

<script setup lang="ts" name="gct-wacom">
  import { LowCodeWidget } from '/@page-designer/types/widget-basic-types';

  defineProps<{ widget: LowCodeWidget.BasicSchema }>();
</script>

<style scoped lang="less">
  #myCanvas {
    width: 100%;
    min-height: 500px;
  }
</style>
