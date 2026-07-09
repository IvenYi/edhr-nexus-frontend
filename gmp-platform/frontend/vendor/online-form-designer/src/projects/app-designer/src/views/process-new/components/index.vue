<template>
  <basic-page-render class="gct-process-designer-layout">
    <list-layout :module="moduleType" />
  </basic-page-render>
</template>

<script setup lang="ts">
  import listLayout from './list-layout.vue';
  import { ProcessTypeEnum } from '/@/layouts/tree-sider-page/enum';

  defineProps<{
    moduleType: ProcessTypeEnum;
  }>();
</script>

<style lang="less" scoped>
  .gct-process-designer-layout {
    padding-top: 16px !important;
  }
</style>
