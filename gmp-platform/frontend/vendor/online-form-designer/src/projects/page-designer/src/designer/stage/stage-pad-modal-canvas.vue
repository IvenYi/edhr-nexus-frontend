<template>
  <div class="design-modal-canvas">
    <div
      class="drawer-mask"
      :class="{
        'modal-mask': true,
      }"
    >
    </div>
    <suspension v-if="isSelected" :rootRef="rootRef2" :layout="['upper']" @upper="backToPage" />
    <div
      ref="rootRef"
      role="gct-design-modal"
      class="drawer-canvas"
      :class="{
        'is-modal-selected': isSelected,
      }"
      :style="modalStyle"
    >
      <a-button class="close-btn" type="text" @click.stop="closeModalDesign">
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
          class="root"
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
        v-if="bottomWidget && !isNewDesigner"
        v-show="hasFooter"
        :widget="bottomWidget"
        :parent-list="modalInfo?.value?.children"
        :parentWidget="modalInfo"
        :actionTypes="['parent']"
      >
        <!-- widget-entry -->
        <component :is="widgetEntry" :widget="bottomWidget">
          <!-- widget -->
          <component
            :is="getAsyncWidget('bottom-button-container')"
            :widget="bottomWidget"
            :parentWidget="modalInfo"
          />
        </component>
      </widget-wrapper>
      <StageDesignContent
        v-if="isNewDesigner === true && hasFooter"
        class="modal-footer"
        :selectParent="setSelectRoot"
        :parentWidget="bottomWidget"
        :widgets="bottomWidget!.children"
        :config="{ mode: 'move', isDrag: false, isDrop: false, isDelete: false }"
      />
      <!-- 弹窗FOOTER -->
      <div class="modal-footer" v-else-if="modalFooter?.children?.length">
        <drag-widget-group
          v-if="isNewDesigner !== true"
          :parent-drag-widgets="modalFooter!.children"
          :parentWidget="modalInfo"
        />
        <StageDesignContent
          v-if="isNewDesigner === true"
          :selectParent="setSelectRoot"
          :parentWidget="modalInfo"
          :widgets="modalFooter!.children"
          :config="{ mode: 'move', isDrag: false, isDrop: false, isDelete: false }"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import {
    useDesigner,
    isNewDesigner,
    useDesignerController,
  } from '/@page-designer/hooks/useDesigner';
  import { CloseOutlined } from '@ant-design/icons-vue';
  import dragWidgetGroup from './drag/drag-widget-group.vue';
  import suspension from '/@page-designer/components/widget-drag/suspension.vue';
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
  import { computed, provide, watch, ref, onUnmounted } from 'vue';
  import { pick, get } from 'lodash-es';
  import { buildRunJs } from '/@/utils/transform-js';
  import { useStyle } from '/@page-designer/hooks/useStyle';
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
  } = useDesigner();
  const { resetSelectedWidget, setSelectedModal, resetSelectedModal, selectedRef } =
    useSelectedWidget();
  const { updateInfo, gModal } = useGlobal();

  const rootRef = ref();
  const rootRef2 = computed(() => {
    return rootRef;
  });

  const { wrapperStyle } = useStyle(modalInfo.value);

  const modalStyle = computed(() => {
    const unitType = get(modalInfo.value, 'props.unitType', 'px');
    return {
      width: `${modalInfo.value.props.modalWidth || 800}${unitType}`,
    };
  });

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
  .is-modal-selected {
    border: 2px solid var(--ant-primary-color) !important;
  }

  .design-modal-canvas {
    .modal-mask {
      position: absolute;
      z-index: 994;
      inset: 0;
      background-color: #00000073;
    }

    .drawer-mask {
      background-color: rgba(0, 0, 0, 0.3);
    }

    .modal-actions {
      position: absolute;
      z-index: 998;
      top: -15px;
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
      position: absolute;
      z-index: 996;
      top: 100px;
      right: 0;
      left: 0;
      max-width: 100%;
      max-height: 100%;
      margin: auto;
      border: 0;
      border-radius: 2px;
      background-clip: padding-box;
      background-color: #fff;
      box-shadow:
        0 3px 6px -4px #0000001f,
        0 6px 16px #00000014,
        0 9px 28px 8px #0000000d;
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
        min-height: 300px;
        max-height: 60vh;
        padding: 1px;
        padding-top: 24px;
        overflow-y: auto;
      }

      .modal-footer {
        height: auto;
        min-height: 50px;
        padding: 16px;
        border-top: 1px solid #f0f0f0;
        border-radius: 0 0 2px 2px;
        background: transparent;
      }
    }

    .modal-footer {
      height: auto;
    }

    .drawer-canvas {
      position: absolute;
      z-index: 996;
      top: 0;
      right: 0;
      max-width: 100%;
      height: 100%;
      margin: auto;
      border: 0;
      border-radius: 2px;
      background-clip: padding-box;
      background-color: #fff;
      box-shadow: -10px 0 60px rgba(0, 0, 0, 0.2);
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
        height: calc(100% - 115px);
        padding: 1px;
        padding-top: 24px;
        overflow-y: auto;
      }
    }
  }
</style>
