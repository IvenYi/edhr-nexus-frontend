<template>
  <div class="absolute top-0px left-0px h-full w-full serialnumber-area">
    <span>{{ widget.initialValue }}</span>
  </div>
</template>

<script setup lang="ts">
  import type { PaperWidget } from '/@online-form/views/types/paper-widget';

  defineProps<{
    widget: PaperWidget.Serialnumber;
  }>();
</script>

<style lang="less" scoped>
  .serialnumber-area {
    display: flex;
    justify-content: var(--justifyContent);
    align-items: var(--alignItems);
  }
</style>
