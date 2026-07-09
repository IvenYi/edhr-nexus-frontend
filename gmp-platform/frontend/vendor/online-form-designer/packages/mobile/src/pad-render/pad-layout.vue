<template>
  <div v-if="!notHeader" class="preview-layout">
    <div class="preview-layout-title"> {{ pageTitle }} </div>
    <div class="preview-layout-content" ref="LayoutRef" id="gctPageLayout">
      <slot></slot>
    </div>
  </div>
  <slot v-else> </slot>
</template>

<script setup lang="ts">
  import { ref, onMounted, watchEffect, computed } from 'vue';
  import { useRoute } from 'vue-router';

  defineProps<{
    pageTitle: string;
  }>();
  const LayoutRef = ref();
  const route = useRoute();

  const notHeader = computed(() => {
    return route.query.header == 'false';
  });
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
    const element = LayoutRef.value as HTMLElement;
    const currentWidth = element.offsetWidth;
    const calculatedHeight = calculateHeight(currentWidth);
    // 限制最大高度
    const finalHeight = Math.min(calculatedHeight, 740);
    element.style.height = `${finalHeight}px`;
  };
  onMounted(async () => {
    await nextTick();
    updatePadHeight();
    // 使用ResizeObserver监听宽度变化
    resizeObserver.observe(LayoutRef.value);
  });
</script>
<style scoped lang="scss">
  .preview-layout {
    height: 100%;
    overflow: auto;
    background-color: rgb(232 235 240);
    background-image: radial-gradient(circle, rgb(216 219 227) 1px, transparent 1px);
    background-size: 20px 20px;

    &-title {
      height: 64px;
      margin-bottom: 40px;
      padding-left: 24px;
      background-color: #fff;
      color: #1a1d23;
      font-size: 16px;
      font-weight: 600;
      line-height: 64px;
    }

    &-content {
      width: calc(100% - 80px);
      max-width: 1136px;
      max-height: 740px;
      margin: auto;
      margin-bottom: 40px;
      background-color: #fff;
    }
  }

  #gctPageLayout {
    overflow: hidden;
    transform: translate(0);
  }
</style>
