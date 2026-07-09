<template>
  <div v-if="iframeUrl" class="iframe-render" :style="getWrapStyle">
    <iframe
      :src="showIframeUrl"
      class="iframe-render__main"
      ref="frameRef"
      @load="hideLoading"
    ></iframe>
  </div>
</template>

<script setup lang="ts" name="gct-iframe">
  import type { CSSProperties } from 'vue';
  import { computed, toRefs, unref, ref, watch } from 'vue';
  import { Iframe } from '/@page-designer/types/web';
  import { IIframeComponentExpose } from '/@/projects/page-designer/src/interface/web';
  // import { useDesign } from '/@/hooks/web/useDesign';

  const props = defineProps<{ modelValue?: string; widget: Iframe; rowReadonly?: boolean }>();
  const { iframeUrl } = toRefs(props.widget.props);

  const loading = ref(true);
  const heightRef = ref(120);
  const frameHeight = ref();
  const frameRef = ref();
  // const { prefixCls } = useDesign('iframe-render');

  const getWrapStyle = computed((): CSSProperties => {
    return {
      '--iframe-height': `${frameHeight.value}px`,
      '--iframe-width': props.widget.style.width ? `${props.widget.style.width}px` : '100%',
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
        heightRef.value = showIframeUrl.value ? window.innerHeight * 0.9 - 55 - 32 : 120;
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
  defineExpose<IIframeComponentExpose>({
    setFrameUrl(url) {
      iframeUrl.value = url;
    },
  });
</script>
<style scoped lang="less">
  @prefix-cls: ~'iframe-render';

  .@{prefix-cls} {
    height: var(--iframe-height) !important;
    width: var(--iframe-width) !important;
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
