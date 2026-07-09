<template>
  <basic-page-render :class="[ns.b()]">
    <ProductHeader @do-action="executeAction" @search="onSearch" />
    <ProductTable
      :data="tableData"
      v-model:pagination="pagination"
      @load="load"
      @do-action="executeAction"
    />
  </basic-page-render>
</template>

<script setup lang="ts">
  import { useNamespace } from '@gct/runtime';
  import ProductHeader from './components/product-header.vue';
  import ProductTable from './components/product-table.vue';
  import { onMounted } from 'vue';
  import { useProduct } from './logic/use-product';

  const ns = useNamespace('product-index');

  const { tableData, pagination, searchParams, load, executeAction } = useProduct();

  const onSearch = (params: IParams) => {
    Object.assign(searchParams.value, params);
    load(true);
  };

  onMounted(() => {
    load();
  });
</script>

<style lang="scss" scoped>
  $product-index: ();

  @include b(product-index) {
    @include set-component-css-var(product-index, $product-index);
    :deep(.basic-page-render__body) {
      padding: 16px;
    }
  }
</style>
