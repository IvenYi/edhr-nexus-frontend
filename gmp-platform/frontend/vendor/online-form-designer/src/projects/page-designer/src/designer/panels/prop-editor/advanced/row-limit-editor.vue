<template>
  <div style="display: flex; align-items: center">
    <div style="width: 50px">{{ t('sys.pageDesigner.limit') }}</div>
    <a-input-number
      :max="20"
      :min="1"
      v-model:value="propValue"
      :placeholder="t('sys.inputText')"
      :precision="0"
      :addonAfter="t('sys.pageDesigner.row')"
      size="small"
    />
  </div>
</template>

<script setup lang="ts" name="row-limit-editor">
  import { useI18n } from '/@/hooks/web/useI18n';
  import { props, usePropEditor } from '/@page-designer/hooks/usePropEditor';

  const defProps = defineProps(props);
  const { propValue } = usePropEditor(defProps.propName, defProps.changeCallback);
  const { t } = useI18n();
</script>

<style lang="less" scoped></style>
