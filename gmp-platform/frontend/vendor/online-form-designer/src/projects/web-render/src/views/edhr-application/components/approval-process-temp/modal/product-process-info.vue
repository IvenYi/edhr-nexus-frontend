<template>
  <div class="approval-task-modal">
    <a-spin :spinning="loadingMap.spinning">
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

      <div class="approval-task-modal_config">
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
          @graphMounted="handleGraphMounted"
          @selected="handleNodeSelect"
        />

        <operation-setting
          ref="operationSettingRef"
          :opeType="EOpeType.DETAIL"
          :nodeConfig="routingNodeConfig"
          :stepOptions="operationStepOptions"
          :workflowData="workflowModelValue"
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
  import { computed, ref } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { IModal } from '@gct/runtime';
  import CollapseDetail from '/@app-designer/components/collapse-detail/index.vue';
  import WorkflowNodesRender from '/@/projects/page-designer/src/components/widgets/web/data/workflow-nodes/workflow-nodes-render.vue';
  import OperationSetting from '/@/projects/web-render/src/render/Event/Modal/kit-edhr/rework-configuration/OperationSetting.vue';
  import {
    EOpeType,
    IOperationNodeConfig,
  } from '/@/projects/web-render/src/render/Event/Modal/kit-edhr/types';
  import { WorkflowNodeTypeEnum } from '/@/projects/page-designer/src/components/widgets/web/data/workflow-nodes/component/types';
  import ApprovalStatusTag from '/@/projects/online-form/src/views/web-render/components/approval-status-tag/approval-status-tag.vue';
  import { useApprovalHisInfo } from './composable/useApprovalHisInfo';
  import { convertPreOperationEntries } from '/@/projects/web-render/src/render/Event/Modal/kit-edhr/rework-configuration/composable/useFieldConfig';
  // import { operationEntryColumns } from '/@/projects/web-render/src/render/Event/Modal/kit-edhr/rework-configuration/config';

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

  const workflowNodesRef = ref();
  const operationSettingRef = ref();
  const operationStepOptions = computed(() => {
    return [
      'form_entries_',
      'document_entries_',
      'trigger_txn_entries_',
      'before_txn_check_entries_',
      'operation_advance_execution_entries_',
    ].map((k, i) => {
      return {
        title: 'step' + (i + 1),
        description: t(`sys.kit.edhr.process.${k}`),
        content: k,
        entryKey: k,
      };
    });
  });

  const oldApprovalData = computed<{
    routingOperationList: any[];
    productProcessConfigList: IOperationNodeConfig[];
    subjectInfo: {
      data: Record<string, any>;
      dict: Record<string, any>;
    };
  }>(() => {
    if (processData.value?.old_params_) {
      const oldParams =
        processData.value.old_params_ && typeof processData.value.old_params_ === 'string'
          ? JSON.parse(processData.value.old_params_)
          : {};
      const { routingOperationList, productProcessConfigList, subjectInfo } = oldParams;

      return {
        routingOperationList,
        productProcessConfigList,
        subjectInfo,
      };
    }
    return {
      routingOperationList: [],
      productProcessConfigList: [],
      subjectInfo: {
        data: {},
        dict: {},
      },
    };
  });

  const routingNodeConfig = ref<IOperationNodeConfig>({} as any);
  const workflowModelValue = computed(() => oldApprovalData.value.routingOperationList);
  const productProcessValue = computed(() => oldApprovalData.value.productProcessConfigList);
  const subjectInfoValue = computed(() => oldApprovalData.value.subjectInfo);

  const collapseInfo = computed(() => {
    const { processing_type_ } = subjectInfoValue.value.data || {};

    return [
      {
        label: t('sys.name'),
        name: props.subjectData?.name || '--',
      },
      // 产品
      {
        label: t('sys.edhr.field.product'),
        name: getFieldValueByDict('product_id_') || '--',
        hidden: processing_type_ !== 'product',
      },
      // 产品家族
      {
        label: t('sys.edhr.field.productFamily'),
        name: getFieldValueByDict('product_family_id_') || '--',
        hidden: processing_type_ !== 'product_family',
      },
      // 生产模式
      {
        label: t('sys.edhr.field.productionMode'),
        name: getFieldValueByDict('production_type_') || '--',
      },
      //DHR模板
      {
        label: t('sys.edhr.field.dhrTmpl'),
        name: getFieldValueByDict('edhr_tmpl_id_') || '--',
      },
      // 工艺路线
      {
        label: t('sys.edhr.field.routing'),
        name: getFieldValueByDict('routing_id_') || '--',
      },
      // 放行单
      {
        label: t('sys.edhr.field.releaseTmpl'),
        name: getFieldValueByDict('release_tmpl_id_') || '--',
      },
      // 生产形态
      {
        label: t('sys.edhr.field.productionModality'),
        name: getFieldValueByDict('production_modality_') || '--',
      },
      {
        label: t('sys.edhr.processChoice.effectDate'),
        name: processData.value?.effective_date_ || t('sys.edhr.processChoice.effectType.0'),
      },
      {
        label: t('sys.edhr.processChoice.status'),
        name: processData.value?.status_ || '--',
        useSlot: true,
        slotName: 'approval_status',
        slotData: {
          dhrInstanceList: processData.value?.status_,
        },
      },
      {
        label: t('sys.description'),
        name: props.subjectData?.description || '--',
      },
    ];
  });

  const currentOperationNode = ref<any>(null);

  function handleGraphMounted() {
    const defaultNode = workflowModelValue.value.find(
      (n) => n?.type_ === WorkflowNodeTypeEnum.NODE_SPEC,
    );
    currentOperationNode.value = {
      ...defaultNode,
      nodeRefId: defaultNode.id_,
    };
    handleNodeSelect({
      shape: WorkflowNodeTypeEnum.NODE_SPEC,
      id: defaultNode.node_id_,
      data: {
        id_: defaultNode.id_,
      },
    });
  }

  function handleNodeSelect(node: any) {
    if (!node || node?.shape !== WorkflowNodeTypeEnum.NODE_SPEC) return;
    workflowNodesRef.value.setNodeHighlight(node.id);
    const nodeRefId = node?.data?.id_;
    const routingNodeConfig = productProcessValue.value.find(
      (d) => d.routing_operation_id_ === nodeRefId,
    );

    currentOperationNode.value = {
      ...node,
      nodeRefId: nodeRefId,
    };
    operationSettingRef.value.setFormData({
      ...routingNodeConfig,
      operation_advance_execution_entries_: convertPreOperationEntries(
        routingNodeConfig?.operation_advance_execution_entries_ || [],
        true,
      ),
      node_id_: node.id,
    });
  }

  function getFieldValueByDict(field: string, source = subjectInfoValue.value) {
    const { data, dict } = source;
    const fieldValue = data?.[field];
    return dict?.[field]?.[fieldValue] || '--';
  }
</script>

<style lang="less" scoped>
  .approval-task-modal {
    padding: 16px;
    padding-bottom: 80px;
    height: 100%;
    overflow: auto;

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

    &_config {
      &::before {
        content: '配置信息';
        display: block;
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
      padding: 16px;
      display: flex;
      justify-content: space-between;
      background: #fff;
      box-shadow: 0 -2px 10px 0 rgba(0, 0, 0, 0.06);

      &--right {
        button {
          margin-left: 12px;
        }
      }
    }

    :deep(.x6-port-PATH_REWORK) {
      display: none;
    }

    :deep(.x6-port-PATH_OPTIONAL) {
      display: none;
    }
  }
</style>
