<template>
  <div class="design-modal-canvas">
    <div
      :class="{
        'modal-mask': true,
        'drawer-mask': isDrawer,
      }"
    >
    </div>

    <div
      ref="subtableModalRef"
      :style="modalStyle"
      :class="{
        'sub-table-modal-canvas': !isDrawer,
        'sub-table-drawer-canvas': isDrawer,
        'is-modal-selected': isSelected,
      }"
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
        <div v-if="!isNewDesigner" class="root" style="height: 100%; min-height: inherit">
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
          :config="{ type: 'sub-table-modal', isDrag: false, isDrop: false, isDelete: false }"
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
  import { computed, provide, onMounted, ref } from 'vue';
  import { StageDesignContent } from './stage-design-content';
  import WidgetWrapper from '/@page-designer/components/widgets/widget-wrapper.vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { pick, get, cloneDeep, throttle } from 'lodash-es';
  import { useStyle } from '/@page-designer/hooks/useStyle';
  import suspension from '/@page-designer/components/widget-drag/suspension.vue';
  import { useScope } from '/@page-designer/hooks/useScope';
  import { flatten } from '/@page-designer/schema/field/form/utils';
  import { useToolkit } from '/@page-designer/hooks/useToolkit';

  const { setFieldToolkit } = useToolkit();
  const { navTagScopeData } = useScope();
  const { t } = useI18n();
  const subtableModalRef = ref();
  const subtableRef = computed(() => {
    return subtableModalRef;
  });

  provide('widgetInScope', WidgetInScopeEnum.GCT_SUB_TABLE_MODAL);
  const {
    modalDesignState,
    setSubTableModalDesignState,
    widgetEntry,
    getAsyncWidget,
    subTableInfo,
    isNewDesigner,
  } = useDesigner();

  provide('scope', modalDesignState.value ? SCOPE.MODAL : SCOPE.PAGE);

  const { selectedRef, setSelectedWidget, setFocusFormContainer } = useSelectedWidget();

  const subTableModalInfo = computed(() => {
    return subTableInfo.value.children.find((d) => d.type === BuiltinType.MODAL);
  });

  const subTableModalBody = computed(() => {
    return subTableModalInfo.value.children.find((d) => d.type === BuiltinType.MODAL_BODY)!;
  });

  const { wrapperStyle } = useStyle(subTableModalInfo.value);

  const modalTitle = computed(() => {
    if (subTableModalInfo.value?.props.isSubTableModal) {
      return `${subTableModalInfo.value?.props.createModalTitle}/${subTableModalInfo.value?.props.editModalTitle}`;
    }
    return subTableModalInfo.value?.props.modalTitle;
  });

  const modalStyle = computed(() => {
    const style = pick(wrapperStyle.value, ['width']);
    if (style.width) {
      return style;
    }
    const unitType = get(subTableModalInfo.value, 'props.unitType', 'px');
    return {
      width: `${subTableModalInfo.value.props.modalWidth || 800}${unitType}`,
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

  const isDrawer = computed(() => {
    return subTableModalInfo.value?.props?.openMode === 'drawer';
  });

  const isSelected = computed(() => {
    return selectedRef.value.type === BuiltinType.MODAL;
  });

  onMounted(() => {
    if (!subTableModalInfo.value?.props?.openMode) {
      subTableModalInfo.value.props.openMode = 'modal';
    }
  });

  const selectParentWidget = () => {
    const cloneDataCenter = cloneDeep(navTagScopeData.value);
    const widgetList = flatten(cloneDataCenter as any, 'board', false);
    const parentFormId = widgetList.find((i) => i.id === subTableInfo.value?.preLocation);
    const pathlist = parentFormId?.path?.split('|') || [];
    const subIndex = pathlist.findIndex((i) => i.startsWith('master_slave_'));
    if (subIndex > 0) {
      const subTableInfo2 = cloneDeep(subTableInfo.value);
      setSubTableModalDesignState(true, pathlist[subIndex]);
      setSelectedWidget(subTableInfo2);
      const formInfo = subTableInfo.value?.children![0].children[0].children[0];
      if (formInfo) {
        //**refParentModelkey 可能为空导致关闭 时候 无法定位字段*/
        setFieldToolkit({
          modelKey: formInfo.props.model,
          formId: formInfo.id,
          childParentModelKey: formInfo.props.refParentModelkey,
        });
      }
    } else {
      setSelectedWidget(subTableInfo.value, modalDesignState.value ? SCOPE.MODAL : SCOPE.PAGE);
      setSubTableModalDesignState(false);
      setFocusFormContainer(subTableInfo.value?.preLocation);
    }
  };

  const setSelectRoot = () => {
    setSelectedWidget(subTableModalInfo.value);
  };

  defineExpose({ setSelectRoot });
</script>

<style lang="less" scoped>
  // .is-modal-selected {
  //   border: 2px solid var(--ant-primary-color) !important;
  // }
  .is-modal-selected::before {
    content: '';
    position: absolute;
    top: 0; /* 向外扩展 */
    left: 0;
    width: 100%;
    height: 100%;
    border: 2px solid var(--ant-primary-color) !important;
  }

  .design-modal-canvas {
    .modal-mask {
      position: absolute;
      z-index: 999;
      inset: 0;
      background-color: #00000073;
    }

    .drawer-mask {
      background-color: #0000;
    }

    .sub-table-modal-canvas {
      position: absolute;
      z-index: 999;
      top: 60px;
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
        max-height: 70vh;
        padding: 1px;
        overflow: auto;

        .sub-table-modal-canvas-form-wrapper {
          height: 100%;
          min-height: inherit;

          :deep(> div:first-child) {
            min-height: inherit;
          }
        }

        .sub-table-modal-canvas-form {
          min-height: inherit;
        }
      }
    }

    .sub-table-drawer-canvas {
      position: absolute;
      z-index: 999;
      top: 0;
      right: 0;
      max-width: 100%;
      height: 100%;
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
        height: calc(100% - 115px);
        padding: 1px;
        padding-top: 24px;
        overflow-y: auto;
      }
    }

    .modal-footer {
      min-height: 50px;
      padding: 16px;
      border-top: 1px solid #f0f0f0;
      border-radius: 0 0 2px 2px;
      background: transparent;
      text-align: right;
    }

    .modal-action {
      display: flex;
      position: absolute;
      z-index: 11;
      top: 0;
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
</style>
