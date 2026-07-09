<template>
  <div class="toolbar-hook-wrapper">
    <toolbar />
  </div>
</template>

<script setup lang="ts" name="toolbar-hook">
  import Toolbar from './toolbar.vue';
</script>

<style scoped lang="less">
  .toolbar-hook-wrapper {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 9px 16px;
    background-color: #fff;

    &::after {
      content: '';
      position: absolute;
      width: 100%;
      height: 1px;
      background-color: #e8ebf0;
      left: 0;
      right: 0;
      bottom: 0;
    }

    :deep(.designer__toolbar) {
      padding: 0;
      border-bottom: 0;
      background-color: transparent;
      flex-wrap: wrap;
    }
  }
</style>
