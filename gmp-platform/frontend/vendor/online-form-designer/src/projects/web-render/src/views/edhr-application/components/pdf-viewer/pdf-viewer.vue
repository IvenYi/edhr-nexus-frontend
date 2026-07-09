<template>
  <div :class="[ns.b(), ns.is('full', full)]">
    <!-- 工具栏 -->
    <div :class="ns.e('header')">
      <!-- 页面导航 -->
      <div :class="ns.b('page-turning')">
        <div :class="ns.be('page-turning', 'pre')" @click="prevPage"> <LeftOutlined /> </div>
        <div :class="ns.be('page-turning', 'page')">
          &nbsp;{{ currentPage }}&nbsp;/&nbsp;{{ pageCount }}&nbsp;
        </div>
        <div :class="ns.be('page-turning', 'next')" @click="nextPage">
          <RightOutlined />
        </div>
      </div>

      <!-- 旋转控制 -->
      <div v-if="isRotate" :class="ns.b('rotate')">
        <div :class="ns.be('rotate', 'left')" @click="rotateLeft">
          <RotateLeftOutlined /> &nbsp;
        </div>
        <div :class="ns.be('rotate', 'right')" @click="rotateRight">
          <RotateRightOutlined /> &nbsp;
        </div>
      </div>

      <!-- 缩放控制 -->
      <div v-if="isScale" :class="ns.b('zoom')">
        <div :class="ns.be('zoom', 'reduce')" @click="zoomOut"> <MinusOutlined /> &nbsp; </div>
        <div :class="ns.be('zoom', 'ratio')">{{ Math.round(scale * 100) }}% &nbsp;</div>
        <div :class="ns.be('zoom', 'enlarge')" @click="zoomIn"> <PlusOutlined /> &nbsp; </div>
      </div>

      <!-- 全屏控制 -->
      <div v-if="isFull" :class="ns.b('full')" @click="toggleFullScreen">
        <FullscreenExitOutlined v-if="full" />
        <FullscreenOutlined v-else />
      </div>

      <!-- 关闭按钮 -->
      <div v-if="isClose" :class="ns.b('close')" @click="onClose">
        <CloseOutlined />
      </div>
    </div>

    <!-- PDF 内容区域 -->
    <div ref="pdfContainerRef" :class="ns.e('content')">
      <VuePdfEmbed
        lazyRender
        ref="pdfRef"
        :id="PDF_EMBED_ID"
        :source="source"
        :page="undefined"
        :scale="scale"
        :rotation="rotation"
        :width="width"
        :class="ns.e('embed')"
        @loaded="onPdfLoaded"
        @rendered="onPdfRendered"
        @rendering-failed="onPdfRenderedFailed"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onBeforeUnmount, onMounted, nextTick, computed } from 'vue';
  import { useNamespace } from '@gct/runtime';
  import {
    LeftOutlined,
    RightOutlined,
    MinusOutlined,
    PlusOutlined,
    RotateLeftOutlined,
    RotateRightOutlined,
    FullscreenOutlined,
    FullscreenExitOutlined,
    CloseOutlined,
  } from '@ant-design/icons-vue';
  import VuePdfEmbed from 'vue-pdf-embed';
  import Panzoom, { PanzoomObject } from '@panzoom/panzoom';
  import { debounce } from 'lodash-es';
  import { useObserver, PDF_EMBED_ID } from './useObserver';

  interface Props {
    source: string | object;
    isRotate?: boolean;
    isScale?: boolean;
    isFull?: boolean;
    isClose?: boolean;
    showToolbar?: boolean;
  }

  withDefaults(defineProps<Props>(), {
    isRotate: true,
    isScale: true,
    isFull: true,
    isClose: false,
    showToolbar: true,
  });

  const emit = defineEmits<{
    (e: 'close'): void;
    (e: 'loaded'): void;
    (e: 'rendered'): void;
  }>();

  // 使用命名空间
  const ns = useNamespace('pdf-viewer');

  const {
    pdfRef,
    pdfContainerRef,
    currentPage,
    pageCount,
    intersectionObserver,
    doIntersectionObserver,
    doResizeObserver,
  } = useObserver();

  const scale = ref(1);
  const rotation = ref(0);
  const full = ref(false);

  // const pageList = computed(() => {
  //   return Array.from({ length: pageCount.value }, (_, i) => i + 1);
  // });

  // 处理PDF加载完成事件
  const onPdfLoaded = (pdf: any) => {
    pageCount.value = pdf.numPages;
    emit('loaded');
  };

  // 处理PDF渲染完成事件
  const onPdfRendered = async () => {
    await doIntersectionObserver();
    console.log('PDF 渲染完成，页数：', currentPage.value, intersectionObserver.value);
  };

  // 处理PDF渲染失败事件
  const onPdfRenderedFailed = (error: any) => {
    console.error('PDF 渲染失败：', error);
  };

  // 上一页
  const prevPage = (e: MouseEvent) => {
    e.stopPropagation();
    if (currentPage.value > 1) {
      currentPage.value--;
      jumpToPage(currentPage.value);
    }
  };

  // 下一页
  const nextPage = (e: MouseEvent) => {
    e.stopPropagation();
    if (currentPage.value < pageCount.value) {
      currentPage.value++;
      jumpToPage(currentPage.value);
    }
  };

  // 放大
  const zoomIn = (e: MouseEvent) => {
    e.stopPropagation();
    if (panzoom.value) {
      panzoom.value.zoomIn();
      scale.value = panzoom.value.getScale();
    }
  };

  // 缩小
  const zoomOut = (e: MouseEvent) => {
    e.stopPropagation();
    if (panzoom.value) {
      panzoom.value.zoomOut();
      scale.value = panzoom.value.getScale();
    }
  };

  // 向左旋转
  const rotateLeft = (e: MouseEvent) => {
    e.stopPropagation();
    rotation.value = (rotation.value - 90) % 360;
  };

  // 向右旋转
  const rotateRight = (e: MouseEvent) => {
    e.stopPropagation();
    rotation.value = (rotation.value + 90) % 360;
  };

  // 切换全屏
  const toggleFullScreen = (e: MouseEvent) => {
    e.stopPropagation();
    full.value = !full.value;
  };

  // 关闭组件
  const onClose = (e: MouseEvent) => {
    e.stopPropagation();
    emit('close');
  };

  const jumpToPage = (page: number) => {
    currentPage.value = page;
    const embedEl = pdfRef.value?.$el;
    if (!embedEl) return;
    const targetEl = embedEl.querySelector(`#${PDF_EMBED_ID}-${page}`);
    if (!targetEl) return;
    targetEl.scrollIntoView({
      behavior: 'instant',
    });
  };

  const panzoom = ref<PanzoomObject | null>(null);

  const width = ref(0);
  const updateWidth = debounce((w: number) => {
    width.value = w > 768 ? 768 : w;
  }, 100);

  onMounted(async () => {
    await nextTick();
    // 监听缩放事件
    panzoom.value = Panzoom(pdfRef.value.$el, {
      maxScale: 5,
      minScale: 0.1,
      smoothScroll: false,
      startScale: 1,
      startX: 0,
      startY: 0,
    });
    doResizeObserver((entry) => {
      const width = entry.contentRect.width;
      if (!width) return;
      updateWidth(width);
    });
  });

  onBeforeUnmount(() => {
    panzoom.value?.destroy();
    intersectionObserver.value?.disconnect();
  });

  defineExpose({
    jumpToPage,
    reload() {},
  });
</script>

<style lang="scss">
  @import './pdf-viewer.scss';
</style>
