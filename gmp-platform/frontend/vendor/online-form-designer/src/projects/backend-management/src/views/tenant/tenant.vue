<template>
  <basic-page>
    <tenant-table />
  </basic-page>
</template>

<script lang="ts" setup>
  import TenantTable from './components/tenant-table.vue';
</script>

<style lang="less" scoped>
  .tenant-manager {
    height: calc(100% - 32px);
    margin: 16px;
    background-color: #fff;
  }
</style>
