<template>
  <buttonTypeSelect
    v-model:has-icon="propValue.hasIcon"
    v-model:has-text="propValue.hasText"
    v-model:type="propValue.type"
    v-model:danger="propValue.danger"
    @change="handleBtnChange"
    size="small"
  />
</template>
<script setup lang="ts" name="button-type-editor">
  import { props, usePropEditor } from '/@page-designer/hooks/usePropEditor';
  import buttonTypeSelect from '/@page-designer/components/buttonTypeSelect/buttonTypeSelect.vue';

  const defProps = defineProps(props);
  const { propValue } = usePropEditor(defProps.propName, defProps.changeCallback);
  const handleBtnChange = (val) => {
    propValue.value = { ...propValue.value, ...val };
  };
</script>
<style lang="scss" scoped></style>
