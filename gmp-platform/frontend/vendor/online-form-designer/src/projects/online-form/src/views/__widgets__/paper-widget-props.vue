<template>
  <component
    :is="widgetPropMap[paperWidget.type]"
    :widget="paperWidget"
    :disabled="disabled"
    :is-in-cell="isInCell"
  />
</template>

<script setup lang="ts">
  import type { PaperWidget } from '/@online-form/views/types/paper-widget';
  import { asyncImportWidgetProp } from '/@online-form/views/designer/modules/widget-prop';
  import { provide } from 'vue';

  const props = defineProps<{
    paperWidget: PaperWidget.BasicSchema;
    isInCell?: boolean;
    disabled?: boolean;
  }>();

  provide('isInCell', props.isInCell || false);

  const widgetPropMap = asyncImportWidgetProp();
</script>

<style></style>
