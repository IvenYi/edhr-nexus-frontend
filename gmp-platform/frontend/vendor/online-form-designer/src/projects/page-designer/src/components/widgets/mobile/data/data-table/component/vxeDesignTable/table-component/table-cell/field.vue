<template>
  <component class="design-data-table-field" :widget="widget" :is="defComponet" rowReadonly />
</template>

<script setup lang="ts">
  import { ColumnTable } from '/@page-designer/types/web';
  import { ref, onMounted, watchEffect, reactive, toRef } from 'vue';

  import { getDesignComponentByType } from '/@page-designer/components/widgets/mobile/field/design';
  const props = defineProps<{
    widget: ColumnTable;
  }>();
  const defComponet = toRef(() => getDesignComponentByType(props.widget.type));
</script>
<style scoped lang="less"></style>
