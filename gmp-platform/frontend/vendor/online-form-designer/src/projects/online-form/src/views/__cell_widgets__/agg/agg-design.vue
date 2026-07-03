<template>
  <div>{{ '${' + fieldName + '}' }}</div>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import { useModelFields } from '/@online-form/views/designer/hooks/useModelFields';
  import type { CellWidget } from '/@online-form/views/designer/types/cell-widget';
  import type { IBindField } from '@gct/nocode-base';

  const props = defineProps<{
    disabled?: boolean;
    fieldWidget: CellWidget.Agg;
    fieldMeta: IBindField;
  }>();

  const { getFieldMeta } = useModelFields();

  const fieldName = computed(() => {
    if (!props.fieldMeta) return '';
    return getFieldMeta(props.fieldMeta).name;
  });
</script>

<style></style>
