<template>
  <div class="design-modal-canvas" @click.stop>
    <div class="modal-mask"> </div>
    <div class="modal-canvas" :style="modalStyle" :class="isSelected ? 'is-modal-selected' : null">
      <a-button class="close-btn" @click.stop="closeModalDesign">
        <template #icon>
          <close-outlined />
        </template>
      </a-button>
      <div class="modal-header" @click.stop="setSelectRoot">
        {{ workflowInfo?.props.modalTitle }}
      </div>
      <!-- 弹窗BODY -->
      <div
        class="modal-body"
        :style="!isNewDesigner ? modalBodyStyle : null"
        role="gct-design-modal"
      >
        <a-form
          v-if="!isNewDesigner"
          :layout="modalBody!.children[0].props.layout"
          :class="['gct-form-widget', 'relative']"
          :data-placeholder="t('sys.pageDesigner.selectCmpFieldTip')"
        >
          <drag-widget-group
            :parent-drag-widgets="modalBody!.children[0].children"
            showPlaceholder
            :placeholderText="$t('sys.pageDesigner.dragFieldHere')"
            :parentWidget="workflowInfo"
          />
        </a-form>
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
  import { BuiltinType, WidgetInScopeEnum, SCOPE } from '/@page-designer/enum';
  import { useSelectedWidget } from '/@page-designer/hooks/useSelectedWidget';
  import { computed, provide } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import DragWidgetGroup from '/@page-designer/designer/stage/drag/drag-widget-group.vue';
  import { pick, get } from 'lodash-es';
  import { useStyle } from '/@page-designer/hooks/useStyle';
  import { StageDesignContent } from './stage-design-content';

  const { t } = useI18n();
  provide('scope', SCOPE.MODAL);
  provide('widgetInScope', WidgetInScopeEnum.GCT_MODAL);
  const {
    workflowInfo,
    workflowModalBody: modalBody,
    setWorkflowNodesModalDesignState,
    isNewDesigner,
  } = useDesigner();
  // console.log(workflowInfo, modalBody);
  const { resetSelectedWidget, setSelectedModal, resetSelectedModal, selectedRef } =
    useSelectedWidget();

  const { wrapperStyle } = useStyle(workflowInfo.value);

  const modalStyle = computed(() => {
    const unitType = get(workflowInfo.value, 'props.unitType', 'px');
    return {
      width: `${workflowInfo.value.props.modalWidth || 800}${unitType}`,
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
    setWorkflowNodesModalDesignState(false);
    // resetSelectedModal();
  };
  const isSelected = computed(() => {
    return selectedRef.value.type === BuiltinType.MODAL;
  });

  provide('inFormId', workflowInfo.value?.id);

  const setSelectRoot = () => {
    setSelectedModal(workflowInfo.value);
  };

  defineExpose({ setSelectRoot });
</script>

<style lang="less" scoped>
  :deep(.gct-stage-design-content) {
    > .gct-vue3-dnd-item {
      height: 100%;
      min-height: inherit;

      > .ant-form {
        height: 100%;
        min-height: inherit;

        .ant-form-item {
          pointer-events: none;
        }
      }
    }
  }

  .is-modal-selected {
    border: 3px solid yellowgreen !important;
  }

  .gct-form-widget {
    min-height: inherit;
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
