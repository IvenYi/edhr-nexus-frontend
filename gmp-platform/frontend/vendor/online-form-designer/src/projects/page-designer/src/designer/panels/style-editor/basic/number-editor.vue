<template>
  <!-- <a-input v-model:value="styleValue" suffix="px" type="number" size="small" /> -->
  <a-input-number
    v-model:value="styleValue"
    :max="max"
    :min="min"
    :placeholder="$t('sys.inputText')"
    :precision="0"
    size="small"
    addonAfter="px"
    @change="handleChange"
  />
</template>

<script setup lang="ts" name="number-editor">
  import { useStyleEditor, props } from '/@page-designer/hooks/useStyleEditor';

  const defProps = defineProps(props);
  const { styleValue } = useStyleEditor(defProps.editor);
  const max = defProps.propConfig.max;
  const min = defProps.propConfig.min;
  const handleChange = (val) => {
    if (!val) styleValue.value = '';
    else styleValue.value = String(val);
  };
</script>

<style lang="less" scoped></style>
