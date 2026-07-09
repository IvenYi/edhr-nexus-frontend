<template>
  <component :is="tag" :widget="columns" />
</template>

<script setup lang="ts">
  import { ColumnTable, FormulaTable } from '/@page-designer/types/web';
  import { FormComponents } from '/@page-designer/enum';
  import field from './field.vue';
  import formula from './formula.vue';

  const props = defineProps<{
    columns: ColumnTable | FormulaTable;
  }>();

  const tag = field;
  // const tag = props.columns.type === FormComponents.DataTableFormula ? formula : field;
</script>
<style scoped lang="less"></style>
