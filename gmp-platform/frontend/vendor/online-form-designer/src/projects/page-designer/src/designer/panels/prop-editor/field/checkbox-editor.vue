<template>
  <a-checkbox v-model:checked="propValue">{{
    t(`sys.pageDesigner.${defProps.propName}`)
  }}</a-checkbox>
</template>

<script setup lang="ts" name="checkbox-editor">
  import { props, usePropEditor } from '/@page-designer/hooks/usePropEditor';
  import { useI18n } from '/@/hooks/web/useI18n';

  const { t } = useI18n();
  const defProps = defineProps(props);
  const { propValue } = usePropEditor(defProps.propName, defProps.changeCallback);
</script>

<style lang="less" scoped></style>
