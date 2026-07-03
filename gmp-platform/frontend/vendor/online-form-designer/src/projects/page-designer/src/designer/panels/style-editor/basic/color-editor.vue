<template>
  <g-color-picker :preset="presetColor" :color="styleValue" @update:color="handleUpdateColor">
    <template #icon>
      <div
        :style="{
          width: '22px',
          height: '22px',
          backgroundColor: styleValue,
          borderRadius: '4px',
        }"
      ></div>
    </template>
  </g-color-picker>
</template>

<script setup lang="ts" name="color-editor">
  import GColorPicker from '/@/components/ColorPicker/src/ColorPicker.vue';
  import { useStyleEditor, props, presetColor } from '/@page-designer/hooks/useStyleEditor';

  const defProps = defineProps(props);
  const { styleValue } = useStyleEditor(defProps.editor);
  const handleUpdateColor = (_e, color) => {
    styleValue.value = color;
  };
</script>

<style lang="less" scoped></style>
