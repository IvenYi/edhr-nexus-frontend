<template>
  <basic-page-render :class="[ns.b()]">
    <EdhrUseHeader @do-action="executeAction" @search="onSearch" />
    <EdhrUseTable
      :data="tableData"
      v-model:pagination="pagination"
      @load="load"
      @do-action="executeAction"
    />
  </basic-page-render>
</template>

<script setup lang="ts">
  import { useNamespace } from '@gct/runtime';
  import EdhrUseHeader from './components/edhr-use-header.vue';
  import { UseEdhrUse } from './logic/use-edhr-use';
  import EdhrUseTable from './components/edhr-use-table.vue';
  import { onMounted } from 'vue';

  const ns = useNamespace('edhr-use-index');

  const { tableData, pagination, searchParams, load, executeAction } = UseEdhrUse();

  const onSearch = (params: IParams) => {
    Object.assign(searchParams.value, params);
    load(true);
  };

  onMounted(() => {
    load();
  });
</script>

<style lang="scss" scoped>
  $edhr-use-index: ();

  @include b(edhr-use-index) {
    @include set-component-css-var(edhr-use-index, $edhr-use-index);
    :deep(.basic-page-render__body) {
      padding: 16px;
    }
  }
</style>
