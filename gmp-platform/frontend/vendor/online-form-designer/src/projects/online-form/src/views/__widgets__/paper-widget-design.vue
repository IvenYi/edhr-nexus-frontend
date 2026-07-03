<template>
  <component :is="widgetDesignMap[paperWidget.type]" :widget="paperWidget" :is-in-cell="isInCell" />
</template>

<script setup lang="ts">
  import { asyncImportWidgetDesign } from '/@online-form/views/__widgets__';
  import type { PaperWidget } from '/@online-form/views/types/paper-widget';
  import type { IBindField } from '@gct/nocode-base';

  defineProps<{
    paperWidget: PaperWidget.BasicSchema;
    fieldMeta?: IBindField;
    isInCell?: Boolean;
  }>();

  const widgetDesignMap = asyncImportWidgetDesign();
</script>

<style></style>
