<template>
  <div class="designer-canvas" :key="pageJson.key">
    <div
      ref="rootRef"
      class="pad-canvas relative overflow-hidden"
      :class="'pad-canvas-pad'"
      @click="clickCanvas"
      id="designerRootRef"
    >
      <div class="pad-stage root" ref="padStageRef">
        <StageDesignContent :pageStyle="pageStyle" :widgets="pageJson.widgets" />
        <stage-pad-sub-table-modal-canvas v-if="subTableModalState" ref="subTableModalRef" />
        <stage-pad-modal-canvas v-else-if="modalDesignState" ref="basicModalRef" />
      </div>
      <div
        v-if="bottomWidget && !modalDesignState && !subTableModalState"
        v-show="hasFooter"
        class="widget-wrapper-bottom-button-container"
      >
        <StageDesignContent
          :parent-widget="bottomWidget"
          :widgets="bottomWidget!.children"
          :config="{ mode: 'move', isDrag: false, isDrop: false, isDelete: false }"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import WidgetWrapper from '/@page-designer/components/widgets/widget-wrapper.vue';
  import DragWidgetGroup from './drag/drag-widget-group.vue';
  import StagePadModalCanvas from './stage-pad-modal-canvas.vue';
  import StagePadSubTableModalCanvas from './stage-pad-sub-table-modal-canvas.vue';
  import { useDesigner, isNewDesigner } from '/@page-designer/hooks/useDesigner';
  import { WidgetInScopeEnum, PanelEnum, SCOPE } from '/@page-designer/enum';
  import { provide, ref, toRef, computed, watch, onMounted, onUnmounted, nextTick } from 'vue';
  import { togglePanel } from '/@page-designer/hooks/usePage';
  import { useSelectedWidget } from '/@page-designer/hooks/useSelectedWidget';
  import { propsToStyle } from '/@page-designer/hooks/useStyle';
  import { StageDesignContent } from './stage-design-content';

  provide('scope', SCOPE.PAGE);
  provide('widgetInScope', WidgetInScopeEnum.GCT);
  const { modalDesignState, subTableModalState, pageJson, getAsyncWidget, widgetEntry } =
    useDesigner();
  const { resetSelectedWidget } = useSelectedWidget();

  const rootRef = ref<HTMLElement>();
  const padStageRef = ref();
  const basicModalRef = ref();
  const subTableModalRef = ref();

  const hasFooter = computed(() => {
    return pageJson.pageConfig.hasFooter;
  });

  const clickCanvas = () => {
    if (subTableModalRef.value) {
      subTableModalRef.value.setSelectRoot();
      return;
    }

    if (basicModalRef.value) {
      basicModalRef.value?.setSelectRoot();
      return;
    }

    togglePanel(PanelEnum.PAGE);
    resetSelectedWidget(SCOPE.PAGE);
  };
  const pageStyle = toRef(() => {
    return Object.assign(
      {},
      propsToStyle(pageJson.style),
      (subTableModalState.value || modalDesignState.value) && { overflow: 'hidden' },
    );
  });

  watch(subTableModalState, () => {
    if (subTableModalState.value && padStageRef.value) {
      padStageRef.value?.$ref?.scrollTo(0, 0);
    }
  });

  const bottomWidget = computed(() => {
    return pageJson?.widgets?.find((item) => item.type === 'bottom-button-container') || null;
  });

  // 动态计算pad模式下的高度
  let resizeObserver: ResizeObserver | null = null;

  /**
   * 根据1160:764的比例计算高度
   * @param width 当前宽度
   * @returns 计算后的高度
   */
  const calculateHeight = (width: number): number => {
    return (width * 764) / 1160;
  };

  /**
   * 更新pad容器的高度
   */
  const updatePadHeight = (): void => {
    if (rootRef.value) {
      const element = rootRef.value as HTMLElement;
      const currentWidth = element.offsetWidth;
      const calculatedHeight = calculateHeight(currentWidth);

      // 限制最大高度
      const finalHeight = Math.min(calculatedHeight, 764);
      element.style.height = `${finalHeight}px`;
    }
  };

  onMounted(() => {
    nextTick(() => {
      updatePadHeight();

      // 使用ResizeObserver监听宽度变化
      if (rootRef.value && window.ResizeObserver) {
        resizeObserver = new ResizeObserver(() => {
          updatePadHeight();
        });
        resizeObserver.observe(rootRef.value);
      }
    });
  });

  onUnmounted(() => {
    if (resizeObserver) {
      resizeObserver.disconnect();
      resizeObserver = null;
    }
  });
</script>
<style>
  @import 'vant/lib/index.css';

  :root {
    --van-cell-background: tranparent;
  }
</style>
<style lang="less" scoped>
  .designer-canvas {
    display: flex;
    // align-items: center;
    justify-content: center;
    height: 100%;
    padding: 0;
    overflow: hidden auto;
    background-color: rgb(232 235 240 / 100%);
    background-image: radial-gradient(circle, rgb(216 219 227 / 100%) 10%, transparent 10%);
    background-size: 12px 12px; /* 调整点的大小 */

    .pad-canvas {
      display: flex;
      flex-direction: column;
      margin-top: 24px;

      .pad-header-wrap {
        display: flex;
        box-sizing: border-box;
        height: 52px;
        padding: 0 18px;
        font-size: 16px;
        line-height: 52px;

        .pad-header-title {
          flex: 1;
          text-align: center;
        }
      }

      .pad-header-wrap.enable-bg-color {
        background-color: var(--ant-primary-color, #fff);
        color: #fff;
      }

      .pad-stage {
        position: relative;
        flex: 1;
        overflow: auto;
      }
    }

    .pad-canvas-phone {
      width: 375px;
      height: 812px;
      background-color: #fff;
    }

    .pad-canvas-pad {
      width: calc(100% - 80px);
      max-width: 1136px;
      max-height: 764px;
      margin-top: 40px;
      background-color: #fff;
    }
  }

  ::-webkit-scrollbar {
    display: none;
  }

  .widget-wrapper-bottom-button-container {
    z-index: 100;
    background-color: #fff;
    box-shadow: 0 -2px 10px 0 rgb(0 0 0 / 6%);
  }

  .pad-container-phone-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 44px;
    padding: 0 18px;
    font-size: 16px;
    font-weight: 600;

    .right {
      display: flex;
      gap: 6px;

      .iconfont {
        font-size: 18px;
      }
    }
  }
</style>
