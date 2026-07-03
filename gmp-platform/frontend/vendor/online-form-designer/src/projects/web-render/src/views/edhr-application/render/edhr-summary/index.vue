<template>
  <a-spin :spinning="loading" wrapperClassName="summary-loading">
    <div class="ks-column bg-[#fff] h-full">
      <div class="header">
        <LayoutHeader @on-back="onBack" />
      </div>
      <LayoutData />
      <div ref="contentRef" class="ks-col overflow-hidden">
        <LayoutContent :parent-ref="contentRef">
          <template #left>
            <LayoutLeft />
          </template>
          <template #middle>
            <LayoutMiddle />
          </template>
          <template #right>
            <LayoutRight />
          </template>
        </LayoutContent>
      </div>
    </div>
  </a-spin>
</template>
<script setup lang="ts">
  import LayoutHeader from './components/layout-header.vue';
  import LayoutData from './components/layout-data.vue'
  import LayoutContent from './components/layout-content.vue';
  import LayoutLeft from './components/layout-left.vue';
  import LayoutRight from './components/layout-right.vue';
  import LayoutMiddle from './components/layout-middle.vue';
  import { onMounted, ref } from 'vue';
  import { IModal } from '@gct/runtime';
  import { useEdhrSummary } from './hook/useEdhrSummary';

  const props = defineProps<{
    modal: IModal;
    edhrInstId: string;
  }>();

  const contentRef = ref();
  const { init, loading } = useEdhrSummary();

  onMounted(() => {
    init(props.edhrInstId);
  });
  const onBack = (ok = false) => {
    props.modal.dismiss({ ok });
  };
</script>
<style lang="less">
  .summary-loading.ant-spin-nested-loading {
    height: 100%;
    .ant-spin-container {
      height: 100%;
    }
  }
</style>
