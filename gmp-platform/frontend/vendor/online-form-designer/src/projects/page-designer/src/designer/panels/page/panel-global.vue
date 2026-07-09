<template>
  <div class="panel-title">{{ t('sys.pageDesigner.globalSetting') }}</div>
  <a-tabs v-model:activeKey="activeKey" centered class="panel-editor-tabs">
    <a-tab-pane key="1" class="tab-wrap">
      <template #tab>
        <span> {{ t('sys.pageDesigner.modal') }} </span>
      </template>
      <global-modal />
    </a-tab-pane>
    <a-tab-pane key="2" class="tab-wrap">
      <template #tab>
        <span> {{ t('sys.pageDesigner.variable') }} </span>
      </template>
      <global-var />
    </a-tab-pane>
    <a-tab-pane key="3" class="tab-wrap">
      <template #tab>
        <span> {{ t('sys.pageDesigner.event') }} </span>
      </template>
      <global-event />
    </a-tab-pane>
  </a-tabs>
</template>

<script lang="ts" setup name="panel-global">
  import { ref, watch } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import GlobalVar from './global/global-var.vue';
  import GlobalEvent from './global/global-event.vue';
  import GlobalModal from './global/global-modal.vue';
  import { useGlobal } from '/@page-designer/hooks/useGlobal';

  const { t } = useI18n();
  const { queryGModal, queryGEvent, queryGVar } = useGlobal();
  const activeKey = ref('1');
  watch(
    activeKey,
    (activeKey) => {
      switch (activeKey) {
        case '1':
          queryGModal();
          break;
        case '2':
          queryGVar();
          break;
        case '3':
          queryGEvent();
          break;
        default:
          break;
      }
    },
    { immediate: true },
  );
</script>
<style lang="less" scoped>
  .panel-title {
    font-weight: bold;
    height: 42px;
    line-height: 42px;
    text-align: center;
    border-bottom: 1px solid @gct-modal-border-color;
  }
  .designer-panel {
    .ant-tabs {
      height: 100%;
      :deep(.ant-tabs-content-holder) {
        overflow-y: auto;
      }
    }
  }
  .panel-editor-tabs {
    & > :deep(.ant-tabs-nav) {
      .ant-tabs-nav-wrap {
        border-bottom: 1px solid @gct-modal-border-color;
      }

      .ant-tabs-nav-list {
        flex: 1;

        .ant-tabs-tab {
          flex: 1;
          justify-content: center;
        }
        .ant-tabs-tab {
          padding: 7px 0;
        }
        .ant-tabs-tab + .ant-tabs-tab {
          margin: 0;
        }
        .ant-tabs-ink-bar {
          background-color: transparent;
        }
        .ant-tabs-tab-active::after {
          content: '';
          height: 2px;
          width: 16px;
          background-color: var(--ant-primary-color);
          position: absolute;
          bottom: 0;
          z-index: 3;
        }
      }

      .ant-tabs-nav-operations {
        display: none !important;
      }
    }
  }
</style>
