<template>
  <div
    class="spread-sheet__paper"
    :class="[]"
    :style="{
      'padding-left': `${paper.padding.l}mm`,
      'padding-right': `${paper.padding.r}mm`,
      'padding-top': `${paper.padding.t}mm`,
      'padding-bottom': `${paper.padding.b}mm`,
      '--paper-header-size': `${paper.padding.t}mm`,
      '--paper-footer-size': `${paper.padding.b}mm`,
    }"
  >
    <TableX />
    <TableY />
    <paper-widget-group position="header" v-if="paper.paperHeader" />
    <paper-content />
    <paper-widget-group position="footer" v-if="paper.paperFooter" />
    <padding-line />
  </div>
</template>

<script setup lang="ts">
  import { useSpreadSheet } from '/@online-form/views/designer/hooks/useSpreadSheet';
  import PaddingLine from '../base/padding-line.vue';
  import PaperContent from './paper-content.vue';
  import PaperWidgetGroup from './paper-widget-group.vue';
  import TableX from './table-x.vue';
  import TableY from './table-y.vue';

  const { paper } = useSpreadSheet();
</script>

<style lang="less" scoped>
  .spread-sheet__paper{
    :deep(.ant-input-number) {
      min-width: 0;
    }
  }

</style>
