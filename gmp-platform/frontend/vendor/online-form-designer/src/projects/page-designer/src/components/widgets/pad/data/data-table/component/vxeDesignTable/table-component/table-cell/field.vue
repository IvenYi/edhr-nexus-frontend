<template>
  <component
    class="design-data-table-field pt4px pb4px"
    :widget="widget"
    :is="defComponet"
    :disabled="widget.props.disabled"
  />
</template>

<script setup lang="ts">
  import { ColumnTable } from '/@page-designer/types/web';
  import { ref, onMounted, watchEffect, toRaw, toRef } from 'vue';
  import { getDesignComponentByType } from '/@page-designer/components/widgets/web/field/index';

  const props = defineProps<{
    widget: ColumnTable;
  }>();
  const defComponet = toRef(() => getDesignComponentByType(props.widget.type));
</script>
<style scoped lang="less">
  .design-data-table-field {
    pointer-events: none;
  }
</style>
