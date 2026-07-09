<template>
  <data-table-design :widget="$attrs.widget">
    <template #default="args">
      <slot v-bind="args"></slot>
    </template>
  </data-table-design>
</template>

<script setup lang="ts" name="gct-ref-data-table">
  import dataTableDesign from '../data-table/data-table-design.vue';
</script>
<style scoped lang="less"></style>
