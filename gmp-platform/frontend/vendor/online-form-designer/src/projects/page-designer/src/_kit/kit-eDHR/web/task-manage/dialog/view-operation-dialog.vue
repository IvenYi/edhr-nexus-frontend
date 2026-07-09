<!-- 工艺路线详情 -->
<template>
  <a-modal
    v-model:visible="visible"
    title="当前工序"
    :width="1040"
    :body-style="{ paddingBottom: '80px' }"
    :footer-style="{ textAlign: 'right' }"
    destroyOnClose
    @close="onClose"
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

  const handleUpdateWorkflow = () => {
    const node = (workflowModelValue.value ?? []).find(
      (n) => n.id_ === highlightWorkflowNode.value,
    );
    if (!node || !node.node_id_) return;
    workflowNodesRef.value.setNodeHighlight(node.node_id_);
  };

  defineExpose({
    onOpen,
    onClose,
  });
</script>
