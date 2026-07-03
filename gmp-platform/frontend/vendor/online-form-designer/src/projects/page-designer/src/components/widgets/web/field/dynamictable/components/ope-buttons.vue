<template>
  <RenderTableColunmButtons
    :buttons="buttonOptions"
    :visibleButtons="visibleButtons"
    :tableForm="tableForm"
    isRow
  />
</template>
<script setup lang="ts">
  import { OperateButton } from '/@page-designer/types/web';
  import { RenderTableColunmButtons } from '/@page-designer/components/widgets/web/data/data-table/component/vxeRenderTable';

  defineProps<{
    buttonOptions: OperateButton[];
    visibleButtons: number;
    rowDisabled: boolean;
    tableForm: object;
  }>();
</script>
<style scoped lang="less"></style>
