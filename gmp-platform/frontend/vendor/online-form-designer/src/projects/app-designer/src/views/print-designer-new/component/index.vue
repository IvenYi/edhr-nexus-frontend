<template>
  <basic-page-render
    :class="['gct-print-designer-layout', !isFrontPrint ? 'backend-designer-wrapper' : '']"
  >
    <!-- 包含 标签设计、 .btw 标签模版 -->
    <ListLabel
      v-if="moduleType === PrintTypeEnum.LABEL"
      :module="moduleType"
      :isFrontPrint="isFrontPrint"
      :categoryId="categoryId"
      :isEdhr="isEdhr"
    />

    <!-- 单据设计 -->
    <ListLayoutNew
      v-if="moduleType === PrintTypeEnum.RECEIPT"
      :module="moduleType"
      :isFrontPrint="isFrontPrint"
      :categoryId="categoryId"
    />
  </basic-page-render>
</template>

<script setup lang="ts">
  import ListLabel from './list-label.vue';
  import ListLayoutNew from './list-layout-new.vue';
  import { PrintTypeEnum } from '/@/layouts/tree-sider-page/enum';
  import { useRoute } from 'vue-router';
  import { computed } from 'vue';

  defineProps<{
    moduleType: PrintTypeEnum;
    categoryId: string;
  }>();

  const route = useRoute();

  const isFrontPrint = computed(() => {
    const arr = route.fullPath.split('/');
    const routeName = arr[arr.length - 1];
    return ['LabelDesigner', 'PrintDesigner', 'ReceiptDesigner', 'print-designer-edhr'].includes(
      routeName,
    );
  });

  const isEdhr = computed(() => {
    const arr = route.fullPath.split('/');
    const routeName = arr[arr.length - 1];
    return routeName == 'print-designer-edhr';
  });
</script>
<style lang="less" scoped>
  .gct-print-designer-layout {
    // border: 1px solid #e0e3ea;
    border-left: none;
    border-top-right-radius: 8px;
    border-bottom-right-radius: 8px;

    &.backend-designer-wrapper {
      padding: 0 !important;
      width: calc(100% - 1px);
    }
  }
</style>
