<template>
  <data-table-render
    ref="table"
    :widget="widget"
    :tableParamsData="refParamsData"
    :refTableId="refId"
  />
</template>

<script setup lang="ts" name="gct-ref-data-table">
  import { toRef, watch, ref, onMounted, nextTick } from 'vue';
  import dataTableRender from '../data-table/data-table-render.vue';
  import type { RefDataTable } from '/@page-designer/types/web';
  import { formMap } from '/@web-render/render/Event/utils/runGlobalByPage';
  import { watchDebounced } from '@vueuse/core';

  const table = ref<InstanceType<typeof dataTableRender>>();
  const props = defineProps<{ widget: RefDataTable }>();
  const { refForm, refField, initializeLoad } = props.widget.props;
  props.widget.props.initializeLoad = false;
  const refId = toRef(() => formMap.value[refForm]?.id_);
  const refParamsData = toRef(() => ({ [refField]: refId.value }));
  watchDebounced(
    refId,
    async () => {
      await nextTick();
      refId.value ? table.value?.reload() : table.value?.setDataSource([]);
    },
    {
      debounce: 100,
      immediate: initializeLoad,
    },
  );
  onMounted(() => {
    for (let i in table.value) {
      exposedMethods[i] = table.value[i];
    }
  });
  const exposedMethods = {};
  defineExpose(exposedMethods);
</script>
<style scoped lang="less"></style>
