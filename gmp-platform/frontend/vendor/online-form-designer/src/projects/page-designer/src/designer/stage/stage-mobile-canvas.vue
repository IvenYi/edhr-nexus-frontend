<template>
  <div class="designer-canvas" :key="pageJson.key">
    <div
      ref="rootRef"
      class="mobile-canvas relative overflow-hidden"
      :class="'mobile-canvas-phone'"
      @click="clickCanvas"
      id="designerRootRef"
    >
      <div
        :class="{
          'mobile-container-phone': true,
        }"
      >
        <div class="mobile-container-phone-header">
          <div class="left">
            <span class="time">{{ time }}</span>
          </div>
          <div class="right">
            <span class="signal">
              <i class="iconfont icon-xinhao_signal"></i>
            </span>
            <span class="wifi">
              <i class="iconfont icon-wuxianwangluo_wifi"></i>
            </span>
            <span class="battery">
              <i class="iconfont icon-dianchi"></i>
            </span>
          </div>
        </div>
      </div>

      <div
        :class="{
          'mobile-header-wrap': true,
          'enable-bg-color': pageJson.style?.enableHeaderBGColor,
        }"
      >
        <i><left-outlined /></i>
        <div class="mobile-header-title gct-text-overflow ml4px mr4px">
          {{ pageTitle }}
        </div>
        <i><close-outlined /></i>
      </div>
      <drag-widget-group
        v-if="isNewDesigner !== true"
        role="gct-design-modal"
        class="mobile-stage"
        ref="mobileStageRef"
        :parent-drag-widgets="pageJson.widgets"
        :style="pageStyle"
      >
        <template #modal>
          <stage-mobile-sub-table-modal-canvas v-if="subTableModalState" ref="subTableModalRef" />
          <stage-mobile-modal-canvas v-if="modalDesignState" ref="basicModalRef" />
        </template>
      </drag-widget-group>
      <div v-if="isNewDesigner === true" class="mobile-stage root" ref="mobileStageRef">
        <StageDesignContent :pageStyle="pageStyle" :widgets="pageJson.widgets" />
        <stage-mobile-sub-table-modal-canvas v-if="subTableModalState" ref="subTableModalRef" />
        <stage-mobile-modal-canvas v-if="modalDesignState" ref="basicModalRef" />
      </div>
      <div
        v-if="bottomWidget && !modalDesignState && !subTableModalState"
        v-show="hasFooter"
        class="widget-wrapper-bottom-button-container"
      >
        <widget-wrapper
          v-if="isNewDesigner !== true"
          :widget="bottomWidget"
          :parent-list="pageJson.widgets"
          :parentWidget="{}"
          :actionTypes="['parent']"
        >
          <!-- widget-entry -->
          <component :is="widgetEntry" :widget="bottomWidget">
            <!-- widget -->
            <component :is="getAsyncWidget('bottom-button-container')" :widget="bottomWidget" />
          </component>
        </widget-wrapper>
        <StageDesignContent
          v-if="isNewDesigner === true"
          :parent-widget="bottomWidget"
          :widgets="bottomWidget!.children"
          :config="{ mode: 'move', isDrag: false, isDrop: false, isDelete: false }"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import dayjs from 'dayjs';
  import WidgetWrapper from '/@page-designer/components/widgets/widget-wrapper.vue';
  import DragWidgetGroup from './drag/drag-widget-group.vue';
  import StageMobileModalCanvas from '/@page-designer/designer/stage/stage-mobile-modal-canvas.vue';
  import StageMobileSubTableModalCanvas from '/@page-designer/designer/stage/stage-mobile-sub-table-modal-canvas.vue';
  import { useDesigner, isNewDesigner } from '/@page-designer/hooks/useDesigner';
  import { WidgetInScopeEnum, PanelEnum, SCOPE } from '/@page-designer/enum';
  import { provide, ref, toRef, computed, watch } from 'vue';
  import { togglePanel, pageInfo } from '/@page-designer/hooks/usePage';
  import { useSelectedWidget } from '/@page-designer/hooks/useSelectedWidget';
  import { propsToStyle } from '/@page-designer/hooks/useStyle';
  import { StageDesignContent } from './stage-design-content';

  provide('scope', SCOPE.PAGE);
  provide('widgetInScope', WidgetInScopeEnum.GCT);
  const { modalDesignState, subTableModalState, pageJson, getAsyncWidget, widgetEntry } =
    useDesigner();
  // mitt.on('switch-stage', (type: any) => {
  //   stage.value = type;
  // });
  const { resetSelectedWidget } = useSelectedWidget();

  const rootRef = ref<HTMLElement>();
  const mobileStageRef = ref();
  const basicModalRef = ref();
  const subTableModalRef = ref();

  const pageTitle = computed(() => {
    // if (pageJson.pageConfig.i18n && pageJson.pageConfig.i18n.key) {
    //   return t(pageJson.pageConfig.i18n.key);
    // }
    return pageJson.pageConfig.title || pageInfo.value.name;
  });

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
    if (subTableModalState.value && mobileStageRef.value) {
      mobileStageRef.value?.$ref?.scrollTo(0, 0);
    }
  });

  const time = ref<string>(dayjs().format('HH:mm'));

  const bottomWidget = computed(() => {
    return pageJson?.widgets?.find((item) => item.type === 'bottom-button-container') || null;
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

    .mobile-canvas {
      display: flex;
      flex-direction: column;
      margin-top: 24px;

      .mobile-header-wrap {
        display: flex;
        box-sizing: border-box;
        height: 52px;
        padding: 0 18px;
        font-size: 16px;
        line-height: 52px;

        .mobile-header-title {
          flex: 1;
          text-align: center;
        }
      }

      .mobile-header-wrap.enable-bg-color {
        background-color: var(--ant-primary-color, #fff);
        color: #fff;
      }

      .mobile-stage {
        position: relative;
        flex: 1;
        overflow: auto;
      }
    }

    .mobile-canvas-phone {
      width: 375px;
      height: 812px;
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

  .mobile-container-phone-header {
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
  :deep(.van-cell__value) {
    text-align: left;
  }
</style>
