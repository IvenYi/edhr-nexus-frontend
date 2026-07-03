<template>
  <div>
    <a-switch
      v-model:checked="styleValue"
      v-if="editor._config?.showType === 'switch'"
      size="small"
    />
    <a-checkbox v-model:checked="styleValue" v-if="editor._config?.showType === 'checkbox'">{{
      $t(options?.[0].label)
    }}</a-checkbox>
  </div>
</template>

<script setup lang="ts" name="boolean-editor">
  import { props, useStyleEditor } from '/@page-designer/hooks/useStyleEditor';

  const defProps = defineProps(props);
  const { styleValue } = useStyleEditor(defProps.editor);
  const { options } = defProps.editor._config || {};
</script>

<style lang="less" scoped>
  :deep(.ant-checkbox-wrapper) {
    .ant-checkbox {
      position: relative;
      top: 4px;
    }
    span:not(.ant-checkbox) {
      position: relative;
      top: -2px;
    }
  }
</style>
