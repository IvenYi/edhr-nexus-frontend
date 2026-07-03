<template>
  <div class="approval-task-modal">
    <a-spin class="approval-task-modal_spin" :spinning="loadingMap.spinning">
      <collapse-detail
        class="approval-task-modal_collapse"
        :collapseInfo="collapseInfo"
        :defaultExpand="true"
        :column="2"
        ref="collapseDetailRef"
      >
        <template #approval_status="{ item }">
          <approval-status-tag :value="item.name" />
        </template>
      </collapse-detail>

      <div class="approval-task-modal_workflow">
        <div class="approval-task-modal_workflow--title">{{ $t('sys.detail') }}</div>
        <workflow-nodes-render
          ref="workflowNodesRef"
          v-model:model-value="workflowModelValue"
          :widget="{
            id: `$workflow_nodes_render_${Date.now()}`,
            props: {
              modelKey: 'em_routing',
              readonly: true,
              bindModelKey: 'em_routing_operation',
            },
          }"
          :form-data="{ id_: undefined }"
        />
      </div>
    </a-spin>

    <div class="approval-task-modal_footer">
      <div class="approval-task-modal_footer--left">
        <a-button @click="handleViewProcess">
          {{ t('sys.edhr.approvalProcess') }}
        </a-button>
      </div>
      <div class="approval-task-modal_footer--right" v-if="!props.detailMode">
        <a-button :loading="loadingMap.return" @click="handleReturn">{{
          t('sys.appDesigner.approval.button.Return')
        }}</a-button>
        <a-button :loading="loadingMap.reassign" @click="handleReassign" type="primary">
          {{ t('sys.appDesigner.approval.button.Reassign') }}
        </a-button>
        <a-button :loading="loadingMap.approve" @click="handleApprove" type="primary">
          {{ t('sys.appDesigner.approval.button.Approve') }}
        </a-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { IModal } from '@gct/runtime';
  import CollapseDetail from '/@app-designer/components/collapse-detail/index.vue';
  import WorkflowNodesRender from '/@/projects/page-designer/src/components/widgets/web/data/workflow-nodes/workflow-nodes-render.vue';
  import ApprovalStatusTag from '/@/projects/online-form/src/views/web-render/components/approval-status-tag/approval-status-tag.vue';
  import { useApprovalHisInfo } from './composable/useApprovalHisInfo';

  const props = defineProps<{
    modal: IModal;
    workflowId?: string;
    detailMode: boolean;
    subjectData: {
      name: string;
      code: string;
      description: string;
      businessId: string;
      [key: string]: any;
    };
  }>();

  const { t } = useI18n();

  const {
    loadingMap,
    processData,
    handleViewProcess,
    handleReturn,
    handleReassign,
    handleApprove,
  } = useApprovalHisInfo(props);

  const collapseInfo = computed(() => {
    return [
      {
        label: t('sys.name'),
        name: props.subjectData?.name || '--',
      },
      {
        label: t('sys.platform.code'),
        name: props.subjectData?.code || '--',
      },
      {
        label: t('sys.edhr.processChoice.effectDate'),
        name: processData.value?.effective_date_ || t('sys.edhr.processChoice.effectType.0'),
      },
      {
        label: t('sys.edhr.processChoice.status'),
        name: processData.value?.status_,
        useSlot: true,
        slotName: 'approval_status',
        slotData: {},
      },
      {
        label: t('sys.description'),
        name: props.subjectData?.description || '--',
      },
    ];
  });

  const cacheApprovalData = computed<{
    routingOperationList: any[];
    productProcessConfigList: any[];
  }>(() => {
    if (processData.value?.old_params_) {
      const oldParams =
        processData.value.old_params_ && typeof processData.value.old_params_ === 'string'
          ? JSON.parse(processData.value.old_params_)
          : {};
      const { routingOperationList, productProcessConfigList } = oldParams;
      return {
        routingOperationList,
        productProcessConfigList,
      };
    }
    return {
      routingOperationList: [],
      productProcessConfigList: [],
    };
  });

  const workflowModelValue = computed(() => cacheApprovalData.value.routingOperationList);
</script>

<style lang="less" scoped>
  .approval-task-modal {
    padding: 16px;
    padding-bottom: 80px;
    height: 100%;
    overflow: auto;

    &_spin {
      flex: 1;
      flex-shrink: 0;
      overflow: auto;
    }

    &_collapse {
      :deep(.ant-collapse-arrow) {
        display: none !important;
      }

      :deep(.header) {
        padding-top: 0;
        .header-title {
          display: flex;
          align-items: center;
          font-weight: bold;
          font-size: 14px;
          margin-top: 4px;
          color: #212528;

          &::before {
            content: ' ';
            display: inline-block;
            width: 3px;
            height: 14px;
            background-color: var(--ant-primary-color);
            margin-right: 8px;
            vertical-align: middle;
          }
        }
      }
    }

    &_workflow {
      &--title {
        font-weight: bold;
        line-height: 16px;
        height: 16px;
        margin-bottom: 12px;
        padding-left: 12px;
        border-left: 3px solid var(--ant-primary-color);
      }

      :deep(.x6-port-PATH_REWORK) {
        display: none !important;
      }
      :deep(.x6-port-PATH_OPTIONAL) {
        display: none !important;
      }
    }

    &_footer {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      z-index: 999;
      padding: 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      background-color: #fff;
      box-shadow: 0 -2px 10px 0 rgba(0, 0, 0, 0.06);

      &--right {
        button {
          margin-left: 12px;
        }
      }
    }
  }
</style>
