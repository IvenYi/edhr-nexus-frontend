<template>
  <baseButton v-bind="widget.props" :loading="loading" @click="onclick" v-if="!hideBtn" />
  <a-modal v-model:visible="workflowModalOpen" title="查看工作流" width="80%" :footer="null">
    <WorkflowNodesRender
      v-if="computedWorkflowId"
      ref="WorkflowNodesRef"
      v-model:model-value="workflowModelValue"
      :widget="_workflowWidget"
      :form-data="{ id_: computedWorkflowId }"
    />
  </a-modal>
</template>

<script setup lang="ts" name="gct-custom-button">
  import baseButton from '/@page-designer/components/widgets/web/__components__/base_button.vue';
  import { message } from 'ant-design-vue';
  import { computed, ref, reactive, nextTick } from 'vue';
  import { getPageEvent } from '/@page-designer/components/widgets/hooks/hooks';
  import { Button } from '/@page-designer/types/web';
  import { formMap } from '/@web-render/render/Event/utils/runGlobalByPage';
  import WorkflowNodesRender from '/@page-designer/components/widgets/web/data/workflow-nodes/workflow-nodes-render.vue';

  const props = defineProps<{ widget: Button; formData?: object; rowIndex: number }>();
  const { refContainerForm, refContainerField, workflowWidget, hideBtn } = reactive(
    props.widget.props,
  );

  const Event = getPageEvent();
  const loading = ref(false);

  const workflowModelValue = ref();
  const workflowModalOpen = ref<boolean>(false);
  const highlightWorkflowNode = ref();
  const WorkflowNodesRef = ref();
  const _workflowWidget = ref();

  const computedWorkflowId = computed(() => {
    const id = formMap.value[refContainerForm]?.[refContainerField] ?? '';
    return id.includes(':') ? id.split(':')[1] : id;
  });

  async function onclick() {
    if (!computedWorkflowId.value) {
      message.error('未找到对应工作流，请确认后再试');
      return;
    }
    if (workflowWidget && computedWorkflowId.value) {
      _workflowWidget.value = workflowWidget;
      _workflowWidget.value.props.readonly = true;
      _workflowWidget.value.props.bindModelKey = 'em_workflow_step';
      _workflowWidget.value.props.modelKey = 'em_workflow';
    }
    try {
      loading.value = true;
      await Event.runEventByName(
        'beforeClick',
        props.widget.events,
        props.formData,
        props.rowIndex,
      );
      await Event.runEventByName('onClick', props.widget.events, props.formData, props.rowIndex);
      workflowModalOpen.value = true;
      await nextTick();
      if (highlightWorkflowNode.value) {
        WorkflowNodesRef.value.setNodeHighlight(highlightWorkflowNode.value);
      } else {
        WorkflowNodesRef.value.restNodesHighlight();
      }
      await Event.runEventByName('afterClick', props.widget.events, props.formData, props.rowIndex);
    } catch (error) {
      console.error(error);
    }
    loading.value = false;
  }

  defineExpose({
    restNodesHighlight: async () => {
      highlightWorkflowNode.value = null;
    },
    async setNodeHighlight(nodeId) {
      highlightWorkflowNode.value = nodeId;
    },
    showWorkflow: async () => {
      if (!computedWorkflowId.value) {
        message.error('未找到对应工作流，请确认后再试');
        return;
      }
      if (workflowWidget && computedWorkflowId.value) {
        _workflowWidget.value = workflowWidget;
        _workflowWidget.value.props.readonly = true;
        _workflowWidget.value.props.bindModelKey = 'em_workflow_step';
        _workflowWidget.value.props.modelKey = 'em_workflow';
      }
      workflowModalOpen.value = true;
      await nextTick();
      if (highlightWorkflowNode.value) {
        WorkflowNodesRef.value.setNodeHighlight(highlightWorkflowNode.value);
      } else {
        WorkflowNodesRef.value.restNodesHighlight();
      }
    },
  });
</script>
<style scoped lang="less"></style>
