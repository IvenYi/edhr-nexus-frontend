<template>
  <DataSourceRouter class="gct-bi-data-source-wrapper" />
</template>

<script setup lang="ts">
  import DataSourceRouter from '/@bi-designer/views/data-source/index.vue';
</script>

<style scoped lang="less">
  .gct-bi-data-source-wrapper {
    :deep(.gct-data-source-list) {
      padding-top: 0;
    }
  }
</style>
