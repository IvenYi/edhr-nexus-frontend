<template>
  <a-switch v-model:checked="propValue" size="small" />
</template>

<script setup lang="ts" name="switch-editor">
  import { props, usePropEditor } from '/@page-designer/hooks/usePropEditor';

  const defProps = defineProps(props);
  const { propValue } = usePropEditor(defProps.propName, defProps.changeCallback);
</script>

<style lang="less" scoped></style>
