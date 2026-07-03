<template>
  <div class="wf-canvas-container">
    <div class="wf-canvas"></div>
    <div class="wf-canvas-minimap"></div>
  </div>
</template>

<script setup lang="ts"></script>

<style lang="less" scoped>
  .wf-canvas-container {
    position: relative;
    width: 100%;
    height: 100%;
  }
  .wf-canvas {
    width: 100%;
    height: 100%;
  }
  .wf-canvas-minimap {
    position: absolute;
    bottom: 10px;
    right: 10px;
    box-shadow: 0 0 6px 0 #1c7ed6;
  }
</style>
