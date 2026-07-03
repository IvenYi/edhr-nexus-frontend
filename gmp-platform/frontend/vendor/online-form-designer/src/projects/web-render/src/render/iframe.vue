<template>
  <div :class="prefixCls">
    <Spin :spinning="loading" size="large">
      <iframe
        v-if="frameSrc"
        :src="frameSrc"
        :class="`${prefixCls}__main`"
        ref="frameRef"
        @load="hideLoading"
      ></iframe>
    </Spin>
  </div>
</template>
<script lang="ts" setup>
  import { ref } from 'vue';
  import { Spin } from 'ant-design-vue';
  import { useRouter } from 'vue-router';

  const { currentRoute } = useRouter();

  const frameRef = ref<HTMLFrameElement>();
  const frameSrc = ref<string>(currentRoute.value.meta.frameSrc ?? '');
  const loading = ref(false);

  const prefixCls = 'iframe-page';

  function hideLoading() {
    loading.value = false;
  }
</script>
<style lang="less" scoped>
  @prefix-cls: ~'iframe-page';

  .@{prefix-cls} {
    height: 100%;
    overflow: hidden;
    .ant-spin-nested-loading {
      position: relative;
      height: 100%;

      ::v-deep(.ant-spin-container) {
        width: 100%;
        height: 100%;
      }
    }

    &__main {
      box-sizing: border-box;
      width: 100%;
      height: 100%;
      overflow: hidden;
      border: 0;
    }
  }
</style>
