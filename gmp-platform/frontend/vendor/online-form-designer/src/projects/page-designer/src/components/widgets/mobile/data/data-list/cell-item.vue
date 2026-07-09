<template>
  <div>
    {{ label }}
  </div>
</template>

<script name="gct-data-list-item" setup lang="ts">
  import { ref, reactive } from 'vue';
  import { insetDep } from '/@web-render/render/Event/Dependency/controller';

  const props = defineProps({
    row: {
      type: Object,
    },
    showFieldExp: {
      type: Boolean,
      default: false,
    },
    showField: {
      type: String,
      default: '',
    },
    showFieldExpVal: {
      type: String,
      default: '',
    },
  });

  const { row, showFieldExp, showField, showFieldExpVal } = reactive(props);

  const label = ref('');

  if (showFieldExp) {
    insetDep({ expression: showFieldExpVal, rowData: row }, (val) => {
      label.value = val;
    });
  } else {
    label.value = row._DICT?.[showField] || row[showField];
  }
</script>
<style lang="scss" scoped></style>
