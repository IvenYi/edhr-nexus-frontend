<template>
  <div class="ks-row-middle">
    <span class="mr5px">{{ $t('sys.pageDesigner.content') }}</span>
    <a-input-number
      v-model:value="propValue"
      :max="5"
      :min="1"
      :precision="0"
      :defaultValue="1"
      size="small"
      class="ks-col"
    />
    <span class="ml5px">{{ $t('sys.pageDesigner.maxRowsShow') }}</span>
  </div>
</template>

<script setup lang="ts" name="max-rows-editor">
  import { props, usePropEditor } from '/@page-designer/hooks/usePropEditor';

  const defProps = defineProps(props);
  const { propValue } = usePropEditor(defProps.propName, defProps.changeCallback);
</script>

<style scoped></style>
