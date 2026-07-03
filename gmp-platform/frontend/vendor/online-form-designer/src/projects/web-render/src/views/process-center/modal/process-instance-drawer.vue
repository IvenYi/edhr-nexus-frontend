<template>
  <a-drawer
    v-model:visible="visible"
    :title="t('sys.process.approval') + t('sys.appDesigner.log')"
    :maskStyle="{ backgroundColor: 'transparent' }"
    placement="right"
    width="70%"
    :closable="false"
    @close="onClose"
    class="process-instance-drawer"
  >
    <template #extra>
      <close-outlined
        style="font-size: 16px; margin-left: 12px; color: rgba(0, 0, 0, 0.45)"
        class="api-icon"
        @click.stop="onClose"
      />
    </template>
    <a-tabs v-model:activeKey="activeKey">
      <a-tab-pane key="1" :tab="t('sys.pageDesigner.approvalHistory')">
        <div
          class="preview-wrap overflow-auto min-h502px px-16px pb-16px"
          style="max-height: calc(100% - 2px)"
        >
          <approvalHistoryComp :show-title="false" :instance-id="processId" class="pt8px" />
        </div>
      </a-tab-pane>
      <a-tab-pane key="2" :tab="t('sys.pageDesigner.flowDiagram')">
        <div class="preview-wrap p-16px" style="height: calc(100% - 2px)">
          <PaasBpamRuntime :instanceId="processId" />
        </div>
      </a-tab-pane>
    </a-tabs>
  </a-drawer>
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { CustomAction } from '/@/enums/authActionEnum';
  import approvalHistoryComp from '/@/components/PaasBpmnLog/index.vue';
  import PaasBpamRuntime from '/@/components/BpmnRuntime/paas/index.vue';

  const props = defineProps<{
    userActions: { [key in CustomAction]?: boolean };
  }>();

  const { t } = useI18n();
  const visible = ref<boolean>(false);
  const activeKey = ref('1');
  const processId = ref<any>('');

  const onOpen = async (id) => {
    visible.value = true;
    processId.value = id;
  };

  const onClose = () => {
    visible.value = false;
    processId.value = '';
  };

  defineExpose({ onOpen, onClose });
</script>

<style lang="less" scoped>
  :global(.process-instance-drawer .ant-drawer-body) {
    flex: 1;
    display: flex !important;
    flex-direction: column !important;
    padding: 12px 24px;
    background: #f7f8fa;
  }

  :deep(.ant-collapse-content-box) {
    padding: 0 !important;
  }

  .ant-tabs {
    height: 100%;
    :deep(.ant-tabs-nav) {
      margin: 0;
    }
    :deep(.ant-tabs-tab) {
      font-size: 16px;
      padding: 16px 0;
      & + .ant-tabs-tab {
        margin: 0 0 0 24px;
      }
      .ant-tabs-tab-btn {
        padding: 0 16px;
      }
      .ant-tabs-tabpane {
        height: 100%;
      }
    }
    :deep(.ant-tabs-content-holder) {
      height: 100%;
    }
    :deep(.ant-tabs-content) {
      height: 100%;
    }
  }

  .preview-wrap {
    background: #fff;
    border-radius: 4px;
    border: 1px solid #f0f0f0;
    border-top: none;
  }

  :deep(.ant-collapse-header) {
    padding: 12px 0 !important;
    font-size: 16px;
  }

  :deep(.ant-descriptions-item-label) {
    color: #797a7d;
  }

  :deep(.ant-descriptions-item-content) {
    color: #212528;
  }
</style>
