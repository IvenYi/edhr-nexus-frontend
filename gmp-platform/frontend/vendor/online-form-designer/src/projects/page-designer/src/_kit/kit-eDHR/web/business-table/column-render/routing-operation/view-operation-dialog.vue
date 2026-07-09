<!-- 工艺路线详情 -->
<template>
  <a-modal
    v-model:visible="visible"
    :title="$t('sys.edhr.field.routing')"
    :width="1040"
    :body-style="{ paddingBottom: '80px' }"
    :footer-style="{ textAlign: 'right' }"
    destroyOnClose
    :cancel-button-props="{ style: { display: 'none' } }"
    @ok="onConfirm"
  >
    <WorkflowNodesRender
      ref="workflowNodesRef"
      v-model:model-value="workflowModelValue"
      :widget="defProps.widget"
      :form-data="{ id_: computedWorkflowId }"
      @update:modelValue="handleUpdateWorkflow"
    />
  </a-modal>
</template>

<script lang="ts" setup name="ViewOperationDialog">
  import { ref, computed, nextTick } from 'vue';
  import { FormComponents } from '@gct/runtime';
  import WorkflowNodesRender from '/@page-designer/components/widgets/web/data/workflow-nodes/workflow-nodes-render.vue';
  import { postBizServiceByModelKeyByBsKey } from '/@/apis/gct-apaas/BsServiceController';

  const defProps = defineProps<{
    widget: FormComponents.WorkflowNodes;
  }>();

  const visible = ref<boolean>(false);
  const formRef = ref();
  const workflowModelValue = ref();
  const highlightWorkflowNode = ref();
  const workflowNodesRef = ref();

  const computedWorkflowId = computed(() => {
    return formRef.value?.routing_id__ri_ ?? '';
  });

  const onOpen = async (val, rowData) => {
    visible.value = true;
    formRef.value = rowData;
    await nextTick();
    highlightWorkflowNode.value = val.value;
  };

  const onClose = () => {
    visible.value = false;
  };

  const onConfirm = () => {
    visible.value = false;
  };

  const handleUpdateWorkflow = async () => {
    const node = (workflowModelValue.value ?? []).find(
      (n) => n.id_ === highlightWorkflowNode.value,
    );
    if (node && node.node_id_) {
      workflowNodesRef.value.setNodeHighlight(node.node_id_);
    }

    /**
     * !增加节点状态
     * in_process_: 节点状态
     * 0: 已完成
     * 1: 进行中
     * 2: 未开始
     */
    const res = (await postBizServiceByModelKeyByBsKey(
      {
        modelKey: 'em_routing_operation',
        bsKey: 'biz_getRoutingNodeStatus_bicj',
      },
      {
        container_sn_id_: formRef.value?.id_,
        routing_id_: computedWorkflowId.value,
      },
    )) as any;
    const nodeConfigs = (res ?? []).map((item) => {
      return {
        node_id_: workflowModelValue.value?.find((n) => n.id_ === item.routing_operation_id_)
          ?.node_id_,
        status: item.in_process_,
      };
    });
    nodeConfigs.forEach((config) => {
      workflowNodesRef.value.setNodeStatus(config.node_id_, config.status);
    });
  };

  defineExpose({
    onOpen,
    onClose,
  });
</script>
