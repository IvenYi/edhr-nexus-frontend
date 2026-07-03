<template>
  <component :is="tag" :widget="columns" :rowValue="rowValue" :index="index" />
</template>

<script setup lang="ts">
  import { ColumnTable } from '/@page-designer/types/web';
  import { FormComponents } from '/@page-designer/enum';
  import field from './field.vue';
  import formula from './formula.vue';

  const props = defineProps<{
    columns: ColumnTable;
    rowValue: {
      _DICT: object;
      _STYLE: object;
      [key: string]: string | number | undefined | object;
    };
    index: number;
  }>();

  const tag = field;
  // const tag = props.columns.type === FormComponents.DataTableFormula ? formula : field;
</script>
<style scoped lang="less"></style>
