<template>
  <PowerDesign v-bind="$props" />
</template>

<script setup lang="ts">
  import PowerDesign from './power-design.vue';
  import type { PaperWidget } from '/@online-form/views/types/paper-widget';

  defineProps<{
    widget: PaperWidget.Power;
    isInCell?: boolean;
  }>();
</script>

<style></style>
