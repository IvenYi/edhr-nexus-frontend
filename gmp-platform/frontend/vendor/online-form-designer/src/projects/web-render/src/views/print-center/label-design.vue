<template>
  <PrintDesign :moduleType="PrintTypeEnum.LABEL" :isFrontPrint="true" />
</template>
<script setup lang="ts">
  import { PrintTypeEnum } from '/@/layouts/tree-sider-page/enum';
  import PrintDesign from '/@app-designer/views/print-designer-new/component/index.vue';
</script>
<style lang="less" scoped></style>
