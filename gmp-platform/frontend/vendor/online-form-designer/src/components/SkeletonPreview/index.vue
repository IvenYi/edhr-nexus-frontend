<template>
  <div
    v-if="isMounted"
    class="skeleton-preview-warp"
    :style="{
      '--load-width': containerStyle.loadWidth,
      '--max-height': containerStyle.maxHeight,
    }"
  >
    <!-- :class="
      type === PageTypeEnum.MOBILE || type === PageTypeEnum.PAD ? 'pointer-events-none' : undefined
    " -->
    <div
      v-show="isShowLoading"
      class="skeleton-loading"
      :class="[type !== PageTypeEnum.WEB ? 'mobile-skeleton' : '']"
    >
      <a-skeleton active :paragraph="{ rows: 8 }" />
    </div>
    <div v-show="!isShowLoading && iframeUrl" class="w100% h100% flex justify-center">
      <iframe
        ref="iframeRef"
        :key="iframeKey"
        :src="iframeUrl"
        :class="[type !== PageTypeEnum.WEB ? 'mobile-iframe' : '']"
        :style="{ height: iframeHeight }"
        frameborder="0"
      ></iframe>
    </div>
    <div v-show="!isShowLoading && !iframeUrl" class="w100% h100%">
      <PreviewEmpty />
    </div>
  </div>
</template>

<script setup lang="ts" name="skeleton-preview">
  import { ref, watch, onMounted, onBeforeUnmount, watchEffect, computed, nextTick } from 'vue';
  import PreviewEmpty from '/@/components/Preview/src/preview-empty.vue';
  import { PageTypeEnum } from '/@/layouts/tree-sider-page/enum';
  import { getMobilePageInfo } from '/@/apis/gct-apaas/MobilePageController';
  import { Platform } from "@gct/runtime";

  export interface Props {
    iframeUrl: string;
    iframeKey: string;
    type?: PageTypeEnum;
  }

  const props = defineProps<Props>();
  const isShowLoading = ref<boolean>(true);
  const pageInfo = ref();
  const isMounted = ref(false);
  const iframeRef = ref();
  const iframeHeight = ref('100%');

  const containerStyle = computed(() => {
    const { type } = props;
    const loadWidth =
      type === PageTypeEnum.WEB ? '100%' : type === PageTypeEnum.MOBILE ? '400px' : '1136px';
    const maxHeight =
      type === PageTypeEnum.WEB ? '100%' : type === PageTypeEnum.MOBILE ? '800px' : '740px';
    return { loadWidth, maxHeight };
  });

  watch(
    () => props.iframeKey,
    (val) => {
      isShowLoading.value = true;
      if (val && props.type === PageTypeEnum.MOBILE) {
        isMounted.value = false;
        getMobilePageInfo({ id: val })
          .then((res) => {
            pageInfo.value = res;
          })
          .finally(() => {
            isMounted.value = true;
          });
      } else {
        isMounted.value = true;
      }
    },
    { immediate: true },
  );
  watchEffect(() => {
    // 设置iframe中的元素不可点击
    // if (props.iframeUrl) {
    //   nextTick(() => {
    //     const iframeTag = document.querySelector('iframe') as HTMLIFrameElement;
    //     iframeTag?.addEventListener('load', () => {
    //       setTimeout(() => {
    //         const divTag = iframeTag?.contentWindow?.document.querySelector(
    //           '#app>.p1px',
    //         ) as HTMLElement;
    //         divTag.style.pointerEvents = 'none';
    //       }, 1000);
    //     });
    //   });
    // }
  });

  const handleMessage = (event) => {
    const { cmd, params } = event.data || {};
    switch (cmd) {
      case 'pageMountSuccess':
        // 处理业务逻辑
        if (params.result === 'ok') {
          isShowLoading.value = false;
        }
        break;
    }
  };

  // 动态计算pad模式下的高度
  const resizeObserver: ResizeObserver = new ResizeObserver(() => {
    updatePadHeight();
  });

  const calculateHeight = (width: number): number => {
    return (width * 740) / 1136;
  };
  /**
   * 更新pad容器的高度
   */
  const updatePadHeight = (): void => {
    const element = iframeRef.value as HTMLElement;
    // 元素不存在或被隐藏（offsetWidth === 0）时跳过，避免将高度写成 0px
    if (!element || element.offsetWidth === 0) return;
    const currentWidth = element.offsetWidth;
    const calculatedHeight = calculateHeight(currentWidth);
    // 限制最大高度
    const finalHeight = Math.min(type === Platform.MOBILE ? 740 : calculatedHeight, 740);
    // element.style.height = `${finalHeight}px`;
    iframeHeight.value = `${finalHeight}px`;
  };

  // isMounted 变为 true 时 DOM 已就绪（含异步 MOBILE 场景），此时才建立/重建观察器
  watch(isMounted, async (newVal) => {
    if (newVal) {
      await nextTick();
      if (iframeRef.value) {
        resizeObserver.disconnect(); // 断开旧元素引用，防止重复观察
        resizeObserver.observe(iframeRef.value);
        updatePadHeight();
      }
    }
  });

  onMounted(() => {
    // 接受iframe传过来的状态数据
    window.addEventListener('message', handleMessage);
  });

  onBeforeUnmount(() => {
    window.removeEventListener('message', handleMessage);
    resizeObserver.disconnect();
  });
</script>

<style lang="less" scoped>
  .skeleton-preview-warp {
    display: flex;
    position: relative;
    justify-content: center;
    height: 100%;
    overflow: auto;
    // background: #fbfbfc;

    iframe {
      width: 100%;
      height: 100%;
    }

    .mobile-iframe {
      width: var(--load-width);
      max-width: 1160px;
      max-height: var(--max-height);
      box-shadow: 0 0 12px 0 rgb(0 0 0 / 12%);
    }

    .skeleton-loading {
      // position: absolute;
      // top: 0;
      // left: 24px;
      width: 100%;
      height: 100%;
      padding: 16px;
      background: #fff;
    }

    .mobile-skeleton {
      // position: absolute;
      // top: 0;
      // left: calc(50% - var(--load-width-half) / 2);
      width: var(--load-width);
      max-width: 1160px;
      height: 100%;
      max-height: var(--max-height);
      padding: 16px;
    }
  }

  .mobile-iframe {
    width: var(--load-width);
    max-height: 800px;
    // pointer-events: none;
    // overflow: auto;
  }
</style>
