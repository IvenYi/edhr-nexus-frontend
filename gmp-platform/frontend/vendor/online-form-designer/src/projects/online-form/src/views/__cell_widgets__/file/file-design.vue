<template>
  <CellUpload :disabled="disabled" />
</template>

<script setup lang="ts">
  import { CellWidget } from '../../designer/types/cell-widget';
  import CellUpload from '../common/cell-upload/cell-upload.vue';

  defineProps<{
    disabled?: boolean;
    fieldWidget: CellWidget.File;
  }>();
</script>

<style lang="less" scoped></style>
