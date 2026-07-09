<template>
  <a-tabs v-model:activeKey="activeKey">
    <a-tab-pane key="design" :tab="$t('sys.model.label_template')" />
    <a-tab-pane key="btw" :tab="`.btw ${$t('sys.model.label_template_ref')}`" />
  </a-tabs>

  <!-- 标签设计沿用旧组件 -->
  <ListLayoutNew v-if="activeKey === 'design'" v-bind="{ ...props }" />

  <!-- .btw 标签模版 -->
  <ListLabelBtw v-if="activeKey === 'btw'" :isFrontPrint="isFrontPrint" :isEdhr="isEdhr" />
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import ListLayoutNew from './list-layout-new.vue';
  import ListLabelBtw from './list-label-btw.vue';
  import { PrintTypeEnum } from '/@/layouts/tree-sider-page/enum';

  const props = defineProps<{
    module: PrintTypeEnum;
    isFrontPrint: boolean;
    categoryId: string;
    isEdhr?: boolean;
  }>();

  const activeKey = ref<'design' | 'btw'>('design');
</script>

<style scoped>
  :deep(.ant-tabs-nav) {
    margin-bottom: 0 !important;
  }

  :deep(.ant-tabs-tab) {
    padding: 12px 16px;
  }
</style>
