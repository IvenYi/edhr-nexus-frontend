<template>
  <div class="design-modal-canvas">
    <div class="modal-mask"> </div>
    <div
      role="gct-design-modal"
      class="modal-canvas"
      :style="modalStyle"
      :class="isSelected ? 'is-modal-selected' : null"
    >
      <!-- 浮动 Actions 工具栏 -->
      <div v-if="isSelected" class="modal-actions" @click.stop>
        <div class="modal-actions-mask"></div>
        <span class="modal-actions-item" @click="backToPage">
          <i class="iconfont icon-fuzujian" title="返回页面"></i>
        </span>
      </div>
      <a-button class="close-btn" @click.stop="closeModalDesign">
        <template #icon>
          <close-outlined />
        </template>
      </a-button>
      <div class="modal-header" @click.stop="setSelectRoot">
        {{ modalInfo?.props.modalTitle }}
      </div>
      <!-- 弹窗BODY -->
      <div class="modal-body" :style="modalBodyStyle">
        <drag-widget-group
          v-if="!isNewDesigner"
          :parent-drag-widgets="modalBody!.children"
          :parentWidget="modalInfo"
        />
        <StageDesignContent
          v-if="isNewDesigner === true"
          class="root"
          rootTag="modal_root"
          :selectParent="setSelectRoot"
          :widgets="modalBody!.children"
        />
      </div>

      <widget-wrapper
        v-if="!isNewDesigner && bottomWidget"
        v-show="hasFooter"
        :widget="bottomWidget"
        :parent-list="modalInfo?.value?.children"
        :parentWidget="modalInfo"
        :actionTypes="['parent']"
      >
        <!-- widget-entry -->
        <component :is="widgetEntry" :widget="bottomWidget">
          <!-- widget -->
          <component :is="getAsyncWidget('bottom-button-container')" :widget="bottomWidget" />
        </component>
      </widget-wrapper>
      <StageDesignContent
        v-if="isNewDesigner && bottomWidget"
        class="bottom-button-container"
        :parent-widget="bottomWidget"
        :widgets="bottomWidget!.children"
        :config="{ mode: 'move', isDrag: false, isDrop: false, isDelete: false }"
        :selectParent="setSelectRoot"
      />

      <!-- 弹窗FOOTER -->
      <div class="modal-footer" v-else-if="modalFooter?.children?.length">
        <drag-widget-group
          v-if="!isNewDesigner"
          :parent-drag-widgets="modalFooter!.children"
          :parentWidget="modalInfo"
        />
        <StageDesignContent
          v-if="isNewDesigner"
          :parentWidget="modalInfo"
          :widgets="modalFooter!.children"
          :config="{ mode: 'move', isDrag: false, isDrop: false, isDelete: false }"
          :selectParent="setSelectRoot"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { useDesigner, useDesignerController } from '/@page-designer/hooks/useDesigner';
  import { CloseOutlined } from '@ant-design/icons-vue';
  import dragWidgetGroup from './drag/drag-widget-group.vue';
  import {
    BuiltinType,
    WidgetInScopeEnum,
    SCOPE,
    PanelEnum,
    FormComponents,
  } from '/@page-designer/enum';
  import { useSelectedWidget } from '/@page-designer/hooks/useSelectedWidget';
  import { useGlobal } from '/@page-designer/hooks/useGlobal';
  import { togglePanel } from '/@page-designer/hooks/usePage';
  import { computed, provide, watch, onUnmounted } from 'vue';
  import { buildRunJs } from '/@/utils/transform-js';
  import { useStyle } from '/@page-designer/hooks/useStyle';
  import { pick, get, has } from 'lodash-es';
  import { createWidgetByType } from '/@page-designer/schema/utils';
  import WidgetWrapper from '/@page-designer/components/widgets/widget-wrapper.vue';
  import { StageDesignContent } from './stage-design-content';

  provide('scope', SCOPE.MODAL);
  provide('widgetInScope', WidgetInScopeEnum.GCT_MODAL);

  const c = useDesignerController();

  const {
    modalInfo,
    modalBody,
    modalFooter,
    setModalDesignState,
    isGlobalModal,
    widgetEntry,
    getAsyncWidget,
    isNewDesigner,
  } = useDesigner();
  const { resetSelectedWidget, setSelectedModal, resetSelectedModal, selectedRef } =
    useSelectedWidget();
  const { updateInfo, gModal } = useGlobal();

  const { wrapperStyle } = useStyle(modalInfo.value);

  const modalBodyStyle = computed(() => {
    return pick(wrapperStyle.value, [
      'backgroundColor',
      'paddingTop',
      'paddingRight',
      'paddingBottom',
      'paddingLeft',
    ]);
  });

  const closeModalDesign = async () => {
    if (isGlobalModal.value) {
      //TODO:保存远程模态框 并且转换runJs 非远程的在保存的时候转换
      const modal = gModal.value.find((modal) => {
        return modal.key === modalInfo.value.id;
      });

      if (!modalInfo.value?.props?.hasFooter) {
        modalInfo.value.children = modalInfo.value?.children.filter((n) => {
          return n.type !== 'bottom-button-container';
        });
      }
      if (
        modalInfo.value?.props?.hasFooter &&
        modalInfo.value?.children?.some((n) => n.type === 'modalFooter')
      ) {
        modalInfo.value.children = modalInfo.value.children.filter((n) => {
          return n.type !== 'modalFooter';
        });
      }

      modalInfo.value.runJs = buildRunJs(modalInfo.value.js);
      await updateInfo(modal?.id, { configJson: JSON.stringify(modalInfo.value) });
    }
    setModalDesignState(false);
    resetSelectedWidget(SCOPE.PAGE);
    resetSelectedModal();
    togglePanel(PanelEnum.PAGE);
  };

  const backToPage = () => {
    setModalDesignState(false);
    resetSelectedWidget(SCOPE.PAGE);
    resetSelectedModal();
    togglePanel(PanelEnum.PAGE);
  };

  const isSelected = computed(() => {
    return selectedRef.value.type === BuiltinType.MODAL;
  });
  const modalProps = computed(() => {
    return modalInfo.value.props;
  });
  const modalStyle = computed(() => {
    const mUnitType = get(modalProps.value, 'mUnitType', '%');
    let height;
    if (!has(modalProps.value, 'mModalWidth')) {
      height = get(modalProps.value, 'modalWidthPercent', 70);
    } else {
      height = get(modalProps.value, 'mModalWidth', 60);
    }

    return {
      bottom: 0,
      left: 0,
      height: `${height}${mUnitType}`,
      width: '100%',
    };
  });

  const hasFooter = computed(() => {
    return modalInfo.value?.props?.hasFooter;
  });

  const bottomWidget = computed(() => {
    return (
      modalInfo?.value?.children?.find((item) => item.type === 'bottom-button-container') || null
    );
  });

  const setSelectRoot = () => {
    setSelectedModal(modalInfo.value);
  };

  function onSetSelect(_, key) {
    if (key === modalInfo.value.id) {
      setSelectRoot();
      return;
    }
  }

  c.hooks.setSelect.tap(onSetSelect);
  onUnmounted(() => {
    c.hooks.setSelect.removeTap(onSetSelect);
  });

  watch(
    hasFooter,
    (val) => {
      if (val && !bottomWidget.value) {
        const bottomBtnWidget = createWidgetByType(FormComponents.BottomButtonContainer);
        modalInfo?.value?.children.push(bottomBtnWidget);
      }
    },
    {
      immediate: true,
    },
  );

  defineExpose({ setSelectRoot });
</script>
<style lang="less" scoped>
  .modal-canvas {
    position: relative;
    border: 2px solid white !important;
  }

  .is-modal-selected {
    border: 2px solid var(--ant-primary-color) !important;
  }

  .bottom-button-container {
    height: 60px;
  }

  .design-modal-canvas {
    .modal-mask {
      position: absolute;
      z-index: 994;
      inset: 0;
      background-color: #00000073;
    }

    .modal-actions {
      position: absolute;
      z-index: 998;
      top: -30px;
      right: 0px;
      height: 30px;
      padding: 5px 8px;
      background-color: var(--ant-primary-color);
      color: #fff;
      display: flex;
      align-items: center;
      border-radius: 2px;
      pointer-events: auto;

      .modal-actions-mask {
        position: absolute;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
        pointer-events: none;
        background-color: rgba(0, 0, 0, 0.16);
      }

      .modal-actions-item {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 20px;
        height: 20px;
        padding-top: 2px;
        border-radius: 2px;
        cursor: pointer;
        z-index: 1;

        &:hover {
          background-color: rgba(255, 255, 255, 0.48);
        }

        i {
          font-size: 12px;
        }
      }
    }

    .modal-canvas {
      display: flex;
      position: absolute;
      z-index: 996;
      flex-direction: column;
      max-width: 100%;
      max-height: 100%;
      border: 0;
      background-clip: padding-box;
      background-color: #fff;
      box-shadow: 0 3px 6px -4px #0000001f, 0 6px 16px #00000014, 0 9px 28px 8px #0000000d;
      pointer-events: auto;

      .close-btn {
        display: block;
        position: absolute;
        z-index: 10;
        top: 11px;
        right: 10px;
        padding: 0;
        transition: color 0.3s;
        border: 0;
        outline: 0;
        background: transparent;
        color: #00000073;
        font-size: 16px;
        font-style: normal;
        font-weight: 700;
        text-align: center;
        text-decoration: none;
        text-rendering: auto;
        text-transform: none;
        cursor: pointer;
      }

      .modal-header {
        padding: 16px;
        border-bottom: 1px solid #f0f0f0;
        border-radius: 2px 2px 0 0;
        background: #fff;
        color: #000000d9;
        cursor: pointer;
      }

      .modal-body {
        flex: 1;
        padding-top: 24px;
        overflow: auto;
      }

      .modal-footer {
        min-height: 30px;
        max-height: 80px;
        padding: 16px 16px 24px;
        overflow: auto;
        border-top: 1px solid #f0f0f0;
        border-radius: 0 0 2px 2px;
        background: transparent;
      }

      .widget-wrapper.is-selected {
        width: calc(100% - 2px);
        margin: 0 0 1px 1px;
      }
    }
  }
</style>
