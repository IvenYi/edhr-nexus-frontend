<template>
  <div class="design-modal-canvas">
    <div class="modal-mask"> </div>
    <div class="modal-canvas" :style="modalStyle" :class="isSelected ? 'is-modal-selected' : null">
      <a-button class="close-btn" @click.stop="closeModalDesign">
        <template #icon>
          <close-outlined />
        </template>
      </a-button>
      <div class="modal-header" @click.stop="setSelectRoot">
        {{ wfNodesInfo?.props.modalTitle }}
      </div>
      <!-- 弹窗BODY -->
      <div class="modal-body" :style="modalBodyStyle" role="gct-design-modal">
        <div v-if="!isNewDesigner" style="height: 100%; min-height: inherit">
          <widget-drag
            :widgets="modalBody!.children"
            group="gct-sub-table-modal"
            @add="
              ({ evt: { newIndex } }) => handleAddDrag(newIndex, modalBody!.children, SCOPE.MODAL)
            "
            @update="emitCache"
            @move="checkWidgetMove"
          >
            <template #default="slotProps">
              <!-- widget-wrapper -->
              <widget-wrapper
                :widget="slotProps.element"
                :parent-list="modalBody!.children"
                :index-of-parent-list="slotProps.index"
              >
                <!-- widget-entry -->
                <component :is="widgetEntry" :widget="slotProps.element" v-slot="slotData">
                  <!-- widget -->
                  <component
                    :is="getAsyncWidget(slotProps.element)"
                    :widget="slotProps.element"
                    v-bind="slotData || {}"
                  />
                </component>
              </widget-wrapper>
            </template>
          </widget-drag>
        </div>
        <StageDesignContent
          v-if="isNewDesigner"
          :style="modalBodyStyle"
          :parent-widget="modalBody!.children[0]"
          :widgets="modalBody!.children[0].children"
          :config="{ mode: 'move', type: 'workflow-modal' }"
        />
      </div>
      <!-- 弹窗FOOTER -->
      <div class="modal-footer">
        <!-- <drag-widget-group :parent-drag-widgets="modalFooter!.children" /> -->
        <a-button>{{ t('sys.cancel') }}</a-button>
        <a-button type="primary" style="margin-left: 12px">{{ t('sys.okText') }}</a-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { useDesigner } from '/@page-designer/hooks/useDesigner';
  import { CloseOutlined } from '@ant-design/icons-vue';
  import { BuiltinType, SCOPE, WidgetInScopeEnum } from '/@page-designer/enum';
  import { useSelectedWidget } from '/@page-designer/hooks/useSelectedWidget';
  import { computed, provide } from 'vue';
  import WidgetDrag from '/@page-designer/components/widget-drag/widget-drag.vue';
  import WidgetWrapper from '/@page-designer/components/widgets/widget-wrapper.vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { pick, get } from 'lodash-es';
  import { useStyle } from '/@page-designer/hooks/useStyle';
  import { StageDesignContent } from './stage-design-content';

  const { t } = useI18n();
  provide('scope', SCOPE.MODAL);
  provide('widgetInScope', WidgetInScopeEnum.GCT_SUB_TABLE_MODAL);
  const {
    wfNodesModalBody: modalBody,
    emitCache,
    handleAddDrag,
    checkWidgetMove,
    widgetEntry,
    getAsyncWidget,
    isNewDesigner,
    wfNodesInfo,
    setWfNodesModalDesignState,
  } = useDesigner();
  const { resetSelectedWidget, setSelectedModal, resetSelectedModal, selectedRef } =
    useSelectedWidget();
  // console.log(wfNodesInfo, modalBody);
  const { wrapperStyle } = useStyle(wfNodesInfo.value);

  const modalStyle = computed(() => {
    const unitType = get(wfNodesInfo.value, 'props.unitType', 'px');
    return {
      width: `${wfNodesInfo.value.props.modalWidth || 800}${unitType}`,
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
    // resetSelectedWidget(SCOPE.PAGE);
    setWfNodesModalDesignState(false);
  };
  const isSelected = computed(() => {
    return selectedRef.value.type === BuiltinType.MODAL;
  });

  const setSelectRoot = () => {
    setSelectedModal(wfNodesInfo.value);
  };

  defineExpose({ setSelectRoot });
</script>

<style lang="less" scoped>
  .is-modal-selected {
    border: 3px solid yellowgreen !important;
  }

  .design-modal-canvas {
    display: flex;
    position: absolute;
    z-index: 999;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;

    .modal-mask {
      position: absolute;
      inset: 0;
      background-color: #00000073;
    }

    .modal-canvas {
      position: relative;
      z-index: 1;
      // height: 420px;
      border: 0;
      border-radius: 2px;
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
        min-height: 300px;
        max-height: 70vh;
        overflow: auto;
      }

      .modal-footer {
        min-height: 50px;
        padding: 16px;
        border-top: 1px solid #f0f0f0;
        border-radius: 0 0 2px 2px;
        background: transparent;
        text-align: right;
      }
    }
  }
</style>
