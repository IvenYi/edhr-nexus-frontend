<template>
  <a-select v-model:value="propValue" :placeholder="t('sys.chooseText')" size="small">
    <a-select-option :value="1">展开到1级</a-select-option>
    <a-select-option :value="2">展开到2级</a-select-option>
    <a-select-option :value="3">展开到3级</a-select-option>
    <a-select-option :value="4">展开到4级</a-select-option>
    <a-select-option :value="0">全部展开</a-select-option>
  </a-select>
</template>

<script setup name="default-expand-editor" lang="ts">
  import { usePropEditor, props } from '/@page-designer/hooks/usePropEditor';

  import { useI18n } from '/@/hooks/web/useI18n';

  const { t } = useI18n();
  const defProps = defineProps(props);

  const { propValue } = usePropEditor(defProps.propName, defProps.changeCallback);
</script>

<style lang="less" scoped></style>
