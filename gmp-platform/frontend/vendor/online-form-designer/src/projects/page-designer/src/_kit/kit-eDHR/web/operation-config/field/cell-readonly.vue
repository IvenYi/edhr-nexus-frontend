<template>
  <div class="readonly-widget"> {{ fieldValue }} </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue';

  const defProps = defineProps<{
    fieldKey: string;
    rowValue: any;
    dict: any;
  }>();

  const fieldValue = computed(() => {
    const fieldValue = defProps.rowValue?.[defProps.fieldKey];
    const dictValue = defProps.dict?.[defProps.fieldKey]?.[fieldValue];
    return dictValue || fieldValue;
  });
</script>
