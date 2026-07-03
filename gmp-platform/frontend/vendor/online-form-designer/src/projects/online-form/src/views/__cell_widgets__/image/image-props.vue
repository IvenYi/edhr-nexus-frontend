<template>
  <FileProps v-bind="$props" />
</template>

<script setup lang="ts">
  import type { CellWidget } from '/@online-form/views/designer/types/cell-widget';
  import FileProps from '../file/file-props.vue';

  defineProps<{
    widget: CellWidget.Image;
  }>();
</script>

<style lang="less" scoped></style>
