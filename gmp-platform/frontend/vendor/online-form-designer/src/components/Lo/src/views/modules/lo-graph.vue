<template>
  <div ref="GraphContainerRef" class="lo-graph"></div>
  <TeleportContainer />
</template>

<script lang="ts" setup>
  import { getTeleport } from '@antv/x6-vue-shape';

  const TeleportContainer = getTeleport();
</script>

<style lang="less" scoped>
  .lo-graph {
    height: 100%;
    width: 100%;
  }
</style>
