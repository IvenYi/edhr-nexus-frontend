<template>
  <van-tabs v-model:active="activeTabKey" :line-width="100">
    <van-tab title="eDHR填报">
      <EdhrFilling />
    </van-tab>
    <van-tab title="表单填报">
      <FormFilling />
    </van-tab>
    <van-tab title="生产放行">
      <ReleaseFilling />
    </van-tab>
  </van-tabs>
</template>
<script setup lang="ts">
  import EdhrFilling from './edhr-filling.vue';
  import FormFilling from './form-filling.vue';
  import ReleaseFilling from './release-filling.vue';
  import { useFilling } from './useFilling';

  defineOptions({
    // eslint-disable-next-line vue/component-definition-name-casing
    name: 'edhr-filling',
  });

  const { activeTabKey } = useFilling();
  console.log('filling setup');
</script>
<style scoped lang="less">
  .van-tabs {
    height: 100%;
    background: #ffffff;

    :deep(.van-tabs__wrap) {
      border-bottom: 1px solid #eceff3;
    }

    :deep(.van-tab) {
      flex: none;
      width: 120px;
    }

    :deep(.van-tabs__content) {
      height: calc(100% - var(--van-tabs-line-height));
      overflow: auto;
    }
    :deep(.van-tab__panel) {
      height: 100%;
    }
  }
</style>
