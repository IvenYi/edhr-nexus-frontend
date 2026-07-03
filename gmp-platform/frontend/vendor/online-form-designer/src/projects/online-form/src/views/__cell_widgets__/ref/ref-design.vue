<template>
  <div>
    <a-select
      :disabled="disabled"
      :style="{ width: `${fieldWidget.compWidth ?? 75}px` }"
      :placeholder="fieldWidget.placeholder"
      size="small"
    />
  </div>
</template>

<script setup lang="ts">
  import type { CellWidget } from '/@online-form/views/designer/types/cell-widget';

  defineProps<{
    disabled?: boolean;
    fieldWidget: CellWidget.Ref;
  }>();
</script>

<style></style>
