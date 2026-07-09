<template>
  <div></div>
</template>

<script setup lang="ts" name="wacom-button">
  import { toRefs } from 'vue';
  import { LowCodeWidget } from '/@page-designer/types/widget-basic-types';

  const props = defineProps<{ widget: LowCodeWidget.BasicSchema }>();
</script>

<style scoped lang="less"></style>
