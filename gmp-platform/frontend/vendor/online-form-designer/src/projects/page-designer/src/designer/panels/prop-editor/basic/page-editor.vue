<template>
  <div class="ks-row-middle">
    <span class="mr5px">{{ $t('sys.pageDesigner.singlePageDisplayData') }}</span>
    <a-select
      v-model:value="propValue"
      :placeholder="$t('sys.chooseText')"
      class="ks-col"
      size="small"
    >
      <a-select-option v-for="i in options" :value="i" :key="i">{{ i }}</a-select-option>
    </a-select>
    <span class="ml5px">{{ $t('sys.pageDesigner.limitpage') }}</span>
  </div>
</template>

<script setup lang="ts" name="page-editor">
  import { props, usePropEditor } from '/@page-designer/hooks/usePropEditor';

  const options = [5, 10, 20, 30, 40, 50];
  const defProps = defineProps(props);
  const { propValue } = usePropEditor(defProps.propName, defProps.changeCallback);
</script>

<style lang="less" scoped></style>
