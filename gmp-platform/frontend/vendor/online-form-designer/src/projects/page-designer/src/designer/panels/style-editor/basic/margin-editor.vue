<template>
  <padding-and-margin :editor="props.editor" :selectedStyle="selectedStyle" />
</template>

<script setup lang="ts" name="margin-editor">
  import PaddingAndMargin from '../../widget//style-modules/padding-margin-next.vue';
  import { LowCodeWidget } from '/@page-designer/types/widget-basic-types';
  import { useSelectedWidget } from '/@page-designer/hooks/useSelectedWidget';

  const { selectedStyle } = useSelectedWidget();
  const props = defineProps<{
    editor: LowCodeWidget.StyleEditor;
  }>();
</script>

<style lang="less" scoped></style>
