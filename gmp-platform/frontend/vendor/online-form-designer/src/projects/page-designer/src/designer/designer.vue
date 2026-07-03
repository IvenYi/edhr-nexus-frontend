<template>
  <div
    :class="[
      'paas-designer',
      !isNewDesigner && viewMsgClose === false ? 'is-show-view-message' : '',
    ]"
  >
    <designer-header class="paas-designer-header" />
    <div v-if="!isNewDesigner && viewMsgClose === false" class="view-message">
      <a-alert
        :message="$t('sys.pageDesigner.convertNewDesignerMsg')"
        banner
        closable
        @close="handleMsgClose"
      />
      <div class="convert-btn">
        <a-button type="link" @click="convertNewDesigner">
          {{ $t('sys.pageDesigner.convert') }}
        </a-button>
      </div>
    </div>
    <div class="paas-designer-content">
      <Vue3DndItemPreview />
      <designer-nav class="paas-designer-nav" />
      <designer-toolkit class="paas-designer-toolkit" />
      <designer-stage class="paas-designer-stage" />
      <designer-panel class="paas-designer-panel" />
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { onMounted, onBeforeUnmount, watch, provide, ref } from 'vue';
  import DesignerHeader from './header/header.vue';
  import DesignerNav from './nav/nav.vue';
  import DesignerToolkit from './toolkits/toolkit.vue';
  import DesignerStage from './stage/stage.vue';
  import DesignerPanel from './panels/panel.vue';
  import { loadPageInfo } from '../hooks/usePage';
  // import { loadPageOccupyInfo, destoryOccupyTimer } from '../hooks/usePageOccupy';
  import { useMitt } from '/@page-designer/hooks/useMitt';
  import { useScope } from '../hooks/useScope';
  import { initMethodMap } from '/@/utils/transform-js';
  import { useDesigner } from '../hooks/useDesigner';
  import { DesignerController } from './designer.controller';
  import { Vue3DndItemPreview } from './components/vue3-dnd-item-preview/vue3-dnd-item-preview';
  import { initSchema } from '../schema';
  import { useAppInst } from '@gct/runtime';

  initSchema();

  const controller = new DesignerController();

  const viewMsgClose = ref<boolean>(false);

  provide('designer', controller);

  const { mitt } = useMitt();
  const { scopeJs } = useScope();
  const { methodMap, modalInfo, isNewDesigner } = useDesigner();
  loadPageInfo(useAppInst());
  //在模态框设计切换时 要重新初始化当前作用域的methodMap
  watch(
    () => modalInfo.value.id,
    () => {
      methodMap.value = initMethodMap(scopeJs.value);
    },
  );
  // loadPageOccupyInfo();
  onMounted(() => {
    mitt.on('get-schema-code', () => {
      methodMap.value = initMethodMap(scopeJs.value);
    });
  });
  onBeforeUnmount(() => {
    mitt.off('get-schema-code');
    // destoryOccupyTimer();
  });

  function handleMsgClose(): void {
    viewMsgClose.value = true;
  }

  function convertNewDesigner(): void {
    isNewDesigner.value = true;
  }
</script>

<style lang="less" scoped>
  .designer.is-show-view-message {
    .designer-content {
      height: calc(100% - 54px - 38px);
    }
  }

  .paas-designer {
    width: 100%;
    height: 100%;
    background-color: #f2f4f7;
    color: #333;

    &-header {
      height: 54px;
    }

    &-content {
      display: flex;
      height: calc(100% - 54px);
    }

    .view-message {
      position: relative;
      height: 38px;

      :deep(.ant-alert) {
        height: 38px;
        padding: 7px 13px;
        background-color: #fff7f2;
        border-bottom-color: #ff792e;

        .ant-alert-icon {
          color: #ff792e;
        }

        .ant-alert-message {
          font-size: 14px;
          color: #666666;
        }
      }
    }

    .convert-btn {
      position: absolute;
      left: 670px;
      top: 3px;
      font-size: 14px;
      z-index: 1;
    }

    &-nav {
      flex: none;
      width: 48px;
      border-right: 2px solid @gct-modal-border-color;
      background-color: #e6e9ef;
    }

    &-toolkit {
      flex: none;
      width: 248px;
      border-right: 1px solid @gct-modal-border-color;
    }

    &-stage {
      flex: 1;
      width: 10px;
    }

    &-panel {
      flex: none;
      width: 249px;
      border-left: 1px solid @gct-modal-border-color;
      background: #fff;
    }
  }
  :deep(.vxe-table--filter-option .vxe-checkbox--icon),
  :deep(.vxe-checkbox .vxe-checkbox--icon),
  :deep(.vxe-export--panel-column-option .vxe-checkbox--icon),
  :deep(.vxe-table--render-default .vxe-cell--checkbox .vxe-checkbox--icon),
  :deep(.vxe-custom--checkbox-option .vxe-checkbox--icon) {
    font-weight: 100;
  }
  :deep(.vxe-table--render-default .is--indeterminate.vxe-cell--checkbox .vxe-checkbox--icon),
  :deep(.vxe-table--render-default .is--checked.vxe-cell--checkbox .vxe-checkbox--icon),
  :deep(
    .vxe-table--render-default .vxe-cell--checkbox:not(.is--disabled):hover .vxe-checkbox--icon
  ),
  :deep(.is--checked.vxe-table--filter-option),
  :deep(.is--checked.vxe-export--panel-column-option),
  :deep(.is--indeterminate.vxe-checkbox),
  :deep(.is--indeterminate.vxe-custom--checkbox-option),
  :deep(.vxe-table--render-default .is--indeterminate.vxe-cell--checkbox),
  :deep(.is--indeterminate.vxe-export--panel-column-option),
  :deep(.is--indeterminate.vxe-table--filter-option),
  :deep(.is--checked.vxe-checkbox),
  :deep(.is--checked.vxe-custom--checkbox-option),
  :deep(.vxe-table--render-default .is--checked.vxe-cell--checkbox),
  :deep(.vxe-table--render-default .is--checked.vxe-cell--radio .vxe-radio--icon) {
    color: var(--ant-primary-color);
  }
</style>
