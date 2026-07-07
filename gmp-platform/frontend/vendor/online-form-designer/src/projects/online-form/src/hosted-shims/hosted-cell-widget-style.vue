<template>
  <div class="hosted-cell-widget-style">
    <CompSizeEditor
      :fieldType="fieldMeta?.fieldType"
      :widget="fieldWidget"
      :disabled="disabled || disabledCellSize"
      v-model:compHeight="compHeightValue"
      v-model:compWidth="compWidthValue"
    />
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import CompSizeEditor from '/@online-form/views/__cell_widgets__/common/comp-size-editor/comp-size-editor.vue';

  const props = defineProps<{
    fieldMeta: Record<string, any>;
    fieldWidget: Record<string, any>;
    disabled: boolean;
    disabledCellSize: boolean;
  }>();

  const compHeightValue = computed({
    get: () => props.fieldWidget?.compHeight,
    set: (value) => {
      props.fieldWidget.compHeight = value ?? undefined;
    },
  });

  const compWidthValue = computed({
    get: () => props.fieldWidget?.compWidth,
    set: (value) => {
      props.fieldWidget.compWidth = value ?? undefined;
    },
  });
</script>

<style lang="less" scoped>
  .hosted-cell-widget-style {
    :deep(.ant-input-number) {
      font-size: 12px;
    }
  }
</style>
