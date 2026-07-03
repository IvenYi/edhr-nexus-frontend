<template>
  <RangeLimitDesign v-bind="$props" />
</template>

<script setup lang="ts">
  import RangeLimitDesign from './rangelimit-design.vue';
  import type { PaperWidget } from '/@online-form/views/types/paper-widget';

  defineProps<{
    widget: PaperWidget.RangeLimit;
    isInCell?: boolean;
  }>();
</script>

<style></style>
