<template>
  <PrintDesign :moduleType="PrintTypeEnum.RECEIPT" :isFrontPrint="true" />
</template>
<script setup lang="ts">
  import { PrintTypeEnum } from '/@/layouts/tree-sider-page/enum';
  // import PrintDesigner from '/@app-designer/views/print-designer-new/print-designer.vue';
  import PrintDesign from '/@app-designer/views/print-designer-new/component/index.vue';
  //  <PrintDesigner :moduleType="PrintTypeEnum.RECEIPT" />
</script>
<style lang="less" scoped></style>
