<template>
  <basic-page-render :class="[ns.b()]">
    <ProductFamilyHeader @do-action="executeAction" @search="onSearch" />
    <ProductFamilyTable
      :data="tableData"
      v-model:pagination="pagination"
      @load="load"
      @do-action="executeAction"
    />
  </basic-page-render>
</template>

<script setup lang="ts">
  import { useNamespace } from '@gct/runtime';
  import { UseProductFamily } from './logic/use-product-family';
  import ProductFamilyHeader from './components/product-family-header.vue';
  import ProductFamilyTable from './components/product-family-table.vue';
  import { onMounted } from 'vue';

  const ns = useNamespace('product-family-index');

  const { tableData, pagination, searchParams, load, executeAction } = UseProductFamily();

  const onSearch = (params: IParams) => {
    Object.assign(searchParams.value, params);
    load(true);
  };

  onMounted(() => {
    load();
  });
</script>

<style lang="scss" scoped>
  $product-family-index: ();

  @include b(product-family-index) {
    @include set-component-css-var(product-family-index, $product-family-index);
    :deep(.basic-page-render__body) {
      padding: 16px;
    }
  }
</style>
