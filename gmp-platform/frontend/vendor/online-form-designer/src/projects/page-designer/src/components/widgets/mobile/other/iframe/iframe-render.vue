<template>
  <div v-if="iframeUrl" :class="prefixCls" :style="getWrapStyle">
    <iframe
      :src="showIframeUrl"
      :class="`${prefixCls}__main`"
      ref="frameRef"
      @load="hideLoading"
    ></iframe>
  </div>
</template>

<script setup lang="ts" name="gct-iframe">
  import type { CSSProperties } from 'vue';
  import { computed, toRefs, unref, ref, watch } from 'vue';
  import { Iframe } from '/@page-designer/types/web';

  const props = defineProps<{ modelValue?: string; widget: Iframe; rowReadonly?: boolean }>();
  const { iframeUrl } = toRefs(props.widget.props);

  const loading = ref(true);
  const heightRef = ref(120);
  const frameHeight = ref();
  const frameRef = ref();
  const prefixCls = 'mobile-iframe-render';

  const getWrapStyle = computed((): CSSProperties => {
    return {
      '--iframe-height': `${frameHeight.value}px`,
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
  @prefix-cls: ~'mobile-iframe-render';

  .@{prefix-cls} {
    height: var(--iframe-height) !important;
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
    }
  }
</style>
