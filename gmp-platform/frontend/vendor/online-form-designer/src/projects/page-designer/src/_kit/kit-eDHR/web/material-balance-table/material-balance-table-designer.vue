<template>
  <div> 物料平衡表格占位 </div>
</template>

<script setup lang="ts" name="gct-material-balance-table">
  import { IMaterialBalanceTable } from './schema';

  defineProps<{
    widget: IMaterialBalanceTable;
  }>();
</script>

<style scoped lang="less"></style>
