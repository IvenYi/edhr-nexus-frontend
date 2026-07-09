<template>
  <div :class="prefixCls" :style="getWrapStyle">
    <div v-if="!iframeUrl" :class="`${prefixCls}__title`" :style="getWrapStyle">{{
      $t('sys.pageDesigner.iframeConPlaceholder')
    }}</div>
    <Spin v-else :spinning="loading" size="large" :style="getWrapStyle">
      <iframe
        :src="showIframeUrl"
        :class="`${prefixCls}__main`"
        ref="frameRef"
        @load="hideLoading"
      ></iframe>
    </Spin>
  </div>
</template>

<script setup lang="ts" name="gct-iframe">
  import type { CSSProperties } from 'vue';
  import { computed, toRefs, unref, ref, watch } from 'vue';
  import { Iframe } from '/@page-designer/types/web';
  import { useDesign } from '/@/hooks/web/useDesign';
  import { Spin } from 'ant-design-vue';

  const props = defineProps<{ modelValue?: string; widget: Iframe; rowReadonly?: boolean }>();
  const { iframeUrl } = toRefs(props.widget.props);

  const loading = ref(true);
  const heightRef = ref(120);
  const frameHeight = ref();
  const frameRef = ref();
  const { prefixCls } = useDesign('iframe-design');

  const getWrapStyle = computed((): CSSProperties => {
    return {
      height: `${frameHeight.value}px`,
    };
  });

  const showIframeUrl = computed(() => {
    const reg = /^http(s)?:\/\/[^\s]+/;
    return reg.test(iframeUrl.value) ? iframeUrl.value : '';
  });

  watch(
    () => [props.widget.style.height, showIframeUrl.value],
    () => {
      if (!props.widget.style.height) {
        heightRef.value = showIframeUrl.value ? window.innerHeight : 120;
      }
      frameHeight.value = props.widget.style.height || heightRef.value;
      hideLoading();
    },
    {
      immediate: true,
    },
  );

  function calcHeight() {
    const iframe = unref(frameRef);
    if (!iframe) return;
    iframe.style.height = `${frameHeight.value}px`;
  }

  function hideLoading() {
    loading.value = false;
    calcHeight();
  }
</script>
<style scoped lang="less">
  @prefix-cls: ~'@{namespace}-iframe-design';

  .@{prefix-cls} {
    &__title {
      background: #fbfbfc;
      line-height: 120px;
      text-align: center;
      color: #c3c3c3;
      border: 2px dashed #dbdbdb;
    }
    .ant-spin-nested-loading {
      position: relative;
      height: 100%;

      .ant-spin-container {
        width: 100%;
        height: 100%;
        padding: 10px;
      }
    }

    &__mask {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
    }

    &__main {
      box-sizing: border-box;
      width: 100%;
      height: 100%;
      overflow: hidden;
      border: 0;
      // background-color: @component-background;
    }
  }
</style>
