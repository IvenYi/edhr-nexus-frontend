<template>
  <div class="design-modal-canvas">
    <div class="modal-mask"> </div>
    <div
      ref="subtableModalRef"
      class="sub-table-modal-canvas"
      :style="modalStyle"
      :class="isSelected ? 'is-modal-selected' : null"
    >
      <a-button class="close-btn" @click.stop="selectParentWidget">
        <template #icon>
          <close-outlined />
        </template>
      </a-button>
      <div class="modal-header" @click.stop="setSelectRoot">
        {{ modalTitle }}
      </div>
      <!-- 模态框BODY -->
      <div
        class="modal-body root"
        :style="!isNewDesigner ? modalBodyStyle : {}"
        role="gct-design-modal"
      >
        <div v-if="!isNewDesigner" style="height: 100%; min-height: inherit">
          <widget-wrapper
            :widget="subTableModalBody!.children[0]"
            :parent-widget="subTableModalInfo"
            :actionTypes="['parent']"
            class="sub-table-modal-canvas-form-wrapper"
          >
            <component :is="widgetEntry" :widget="subTableModalBody!.children[0]" v-slot="slotData">
              <component
                :is="getAsyncWidget(subTableModalBody!.children[0])"
                :widget="subTableModalBody!.children[0]"
                class="sub-table-modal-canvas-form"
                v-bind="slotData || {}"
              />
            </component>
          </widget-wrapper>
        </div>
        <StageDesignContent
          v-if="isNewDesigner"
          :style="modalBodyStyle"
          :widgets="subTableModalBody!.children"
          :config="{
            type: 'mobile-sub-table-modal',
            isDrag: false,
            isDrop: false,
            isDelete: false,
          }"
        />
      </div>
      <!-- 模态框FOOTER -->
      <div class="modal-footer">
        <a-button>{{ t('sys.cancel') }}</a-button>
        <a-button type="primary" style="margin-left: 12px">{{ t('sys.okText') }}</a-button>
      </div>
      <suspension
        v-if="isSelected"
        :rootRef="subtableRef"
        :layout="['upper']"
        @upper="selectParentWidget"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
  import { useDesigner } from '/@page-designer/hooks/useDesigner';
  import { CloseOutlined } from '@ant-design/icons-vue';
  import { BuiltinType, WidgetInScopeEnum, SCOPE } from '/@page-designer/enum';
  import { useSelectedWidget } from '/@page-designer/hooks/useSelectedWidget';
  import { computed, provide, ref } from 'vue';
  import WidgetWrapper from '/@page-designer/components/widgets/widget-wrapper.vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useStyle } from '/@page-designer/hooks/useStyle';
  import { pick, get, has } from 'lodash-es';
  import suspension from '/@page-designer/components/widget-drag/suspension.vue';
  import { StageDesignContent } from './stage-design-content';

  const { t } = useI18n();

  provide('widgetInScope', WidgetInScopeEnum.GCT_SUB_TABLE_MODAL);

  const {
    modalDesignState,
    setSubTableModalDesignState,
    widgetEntry,
    getAsyncWidget,
    subTableInfo,
    isNewDesigner,
  } = useDesigner();
  const { selectedRef, setSelectedWidget } = useSelectedWidget();

  provide('scope', modalDesignState.value ? SCOPE.MODAL : SCOPE.PAGE);

  const subtableModalRef = ref();
  const subtableRef = computed(() => {
    return subtableModalRef;
  });

  const subTableModalInfo = computed(() => {
    return subTableInfo.value.children.find((d) => d.type === BuiltinType.MODAL);
  });

  const subTableModalBody = computed(() => {
    return subTableModalInfo.value.children.find((d) => d.type === BuiltinType.MODAL_BODY)!;
  });

  const { wrapperStyle } = useStyle(subTableModalInfo.value);

  const modalProps = computed(() => {
    return subTableModalInfo.value.props;
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

  const modalTitle = computed(() => {
    if (subTableModalInfo.value?.props.isSubTableModal) {
      return `${subTableModalInfo.value?.props.createModalTitle}/${subTableModalInfo.value?.props.editModalTitle}`;
    }
    return subTableModalInfo.value?.props.modalTitle;
  });

  const isSelected = computed(() => {
    return selectedRef.value.type === BuiltinType.MODAL;
  });

  const selectParentWidget = () => {
    setSelectedWidget(subTableInfo.value, modalDesignState.value ? SCOPE.MODAL : SCOPE.PAGE);
    setSubTableModalDesignState(false);
  };

  const setSelectRoot = () => {
    setSelectedWidget(subTableModalInfo.value);
  };

  defineExpose({ setSelectRoot });
</script>
<style lang="less" scoped>
  .is-modal-selected {
    border: 1px solid var(--ant-primary-color) !important;
  }

  .design-modal-canvas {
    .modal-mask {
      position: absolute;
      z-index: 999;
      inset: 0;
      background-color: #00000073;
    }

    .sub-table-modal-canvas {
      display: flex;
      position: absolute;
      z-index: 999;
      flex-direction: column;
      max-width: 100%;
      max-height: 100%;
      border: 0;
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
        flex: 1;
        // padding-top: 24px;
        padding: 1px;
        overflow: auto;

        .sub-table-modal-canvas-form-wrapper {
          height: 100%;
          min-height: inherit;

          :deep(> div:first-child) {
            height: 100%;
            min-height: inherit;
          }
        }

        .sub-table-modal-canvas-form {
          height: 100%;
          min-height: inherit;
        }
      }

      .modal-footer {
        min-height: 30px;
        max-height: 80px;
        padding: 16px 16px 24px;
        overflow: auto;
        border-top: 1px solid #f0f0f0;
        border-radius: 0 0 2px 2px;
        background: transparent;
        text-align: right;
      }

      .modal-action {
        display: flex;
        position: absolute;
        z-index: 11;
        top: 1px;
        right: 0;
        // bottom: 0;
        align-items: center;
        height: 20px;
        padding: 0 4px;
        background-color: var(--ant-primary-color-deprecated-f-12);
        line-height: 20px;

        .opt-icon {
          margin: 4px;
          color: var(--ant-primary-color);
          font-size: 14px;
          cursor: pointer;
        }
      }
    }
  }
</style>
