<template>
  <div
    :key="pageJson.key"
    class="designer-canvas"
    :is-modal="subTableModalState || wfNodesModalState || modalDesignState || workflowModalState"
    ref="rootRef"
    @click="clickCanvas"
  >
    <drag-widget-group
      v-if="isNewDesigner !== true"
      role="gct-design-modal"
      class="web-stage root"
      :style="pageStyle"
      :parent-drag-widgets="pageJson.widgets"
      :isPut="isPut"
    />
    <StageDesignContent
      v-if="isNewDesigner === true"
      :pageStyle="pageStyle"
      :widgets="pageJson.widgets"
      class="web-stage root"
    />
    <div
      v-if="bottomWidget && !modalDesignState"
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
    <stage-sub-table-modal-canvas v-if="subTableModalState" ref="subTableModalRef" />
    <stage-wf-nodes-modal-canvas v-if="wfNodesModalState" ref="nodesModalRef" />
    <stage-modal-canvas v-else-if="modalDesignState" ref="basicModalRef" />
    <stage-workflow-modal-canvas v-if="workflowModalState" ref="workflowModalRef" />
  </div>
</template>

<script lang="ts" setup>
  import StageModalCanvas from '/@page-designer/designer/stage/stage-modal-canvas.vue';
  import StageSubTableModalCanvas from '/@page-designer/designer/stage/stage-sub-table-modal-canvas.vue';
  import StageWfNodesModalCanvas from '/@page-designer/designer/stage/stage-wf-nodes-modal-canvas.vue';
  import stageWorkflowModalCanvas from './stage-workflow-modal-canvas.vue';
  import {
    useDesigner,
    useDesignerController,
    isNewDesigner,
  } from '/@page-designer/hooks/useDesigner';
  import { WidgetInScopeEnum, PanelEnum, SCOPE } from '/@page-designer/enum';
  import { provide, toRef, ref, onMounted, computed } from 'vue';
  import { togglePanel } from '/@page-designer/hooks/usePage';
  import { useSelectedWidget } from '/@page-designer/hooks/useSelectedWidget';
  import { propsToStyle } from '/@page-designer/hooks/useStyle';
  import DragWidgetGroup from './drag/drag-widget-group.vue';
  import { StageDesignContent } from './stage-design-content';

  const rootRef = ref<HTMLDivElement>();

  const designer = useDesignerController();

  provide('scope', SCOPE.PAGE);
  provide('widgetInScope', WidgetInScopeEnum.GCT);

  const {
    modalDesignState,
    subTableModalState,
    wfNodesModalState,
    workflowModalState,
    pageJson = {},
    widgetEntry,
    getAsyncWidget,
  } = useDesigner();
  const { resetSelectedWidget } = useSelectedWidget();

  const basicModalRef = ref();
  const subTableModalRef = ref();
  const workflowModalRef = ref();
  const nodesModalRef = ref();

  const pageStyle = toRef(() => propsToStyle(pageJson.style));

  onMounted(() => {
    designer.stageContainer = rootRef.value!;
  });

  const clickCanvas = () => {
    if (subTableModalRef.value) {
      subTableModalRef.value.setSelectRoot();
      return;
    }
    if (basicModalRef.value || workflowModalRef.value || nodesModalRef.value) {
      basicModalRef.value?.setSelectRoot();
      workflowModalRef.value?.setSelectRoot();
      nodesModalRef.value?.setSelectRoot();
      return;
    }
    togglePanel(PanelEnum.PAGE);
    resetSelectedWidget(SCOPE.PAGE);
  };
  const isPut = toRef(() => {
    if (
      subTableModalState.value ||
      wfNodesModalState.value ||
      modalDesignState.value ||
      workflowModalState.value
    ) {
      return () => false;
    }
  });

  const hasFooter = computed(() => {
    return pageJson.pageConfig.hasFooter;
  });

  const bottomWidget = computed(() => {
    return pageJson.widgets?.find((item) => item.type === 'bottom-button-container') || null;
  });
</script>

<style lang="less" scoped>
  .designer-canvas[is-modal='true'] {
    overflow: visible;
  }

  .designer-canvas {
    display: flex;
    position: relative;
    flex-direction: column;
    height: 100%;
    overflow-x: hidden;
    overflow-y: auto;
    background-color: #fff;

    .web-stage {
      position: relative;
      flex: 1;
      overflow: auto;
    }

    .widget-wrapper-bottom-button-container {
      z-index: 100;
      background-color: #fff;
    }

    :deep(.ant-input-affix-wrapper),
    :deep(.ant-input),
    :deep(.ant-input-number),
    :deep(.ant-input-number-handler-wrap),
    :deep(.ant-picker),
    :deep(.ant-select:not(.ant-select-customize-input) .ant-select-selector),
    :deep(.ant-tree) {
      background-color: transparent;
    }
  }
</style>
