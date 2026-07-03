<template>
  <CellUpload :disabled="disabled" :class="ns.b()" />
</template>

<script setup lang="ts">
  import { useNamespace } from '@gct/runtime';
  import type { CellWidget } from '/@online-form/views/designer/types/cell-widget';
  import CellUpload from '../common/cell-upload/cell-upload.vue';

  const ns = useNamespace('image-design');

  defineProps<{
    disabled?: boolean;
    fieldWidget: CellWidget.Image;
  }>();
</script>

<style lang="scss" scoped></style>
