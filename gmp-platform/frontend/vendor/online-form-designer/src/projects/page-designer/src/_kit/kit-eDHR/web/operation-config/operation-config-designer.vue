<template>
  <div>
    <WorkflowNodesRender
      v-if="refRoutingOperationField"
      ref="WorkflowNodesRef"
      v-model:model-value="workflowModelValue"
      :widget="_workflowWidget"
      :form-data="{ id_: computedWorkflowId }"
    />
  </div>

  <div class="operation-config-title font-bold">{{ currentOperation + '工序配置' }}</div>

  <div class="operation-config-triggers my-4">
    <a-checkbox class="pr-12" v-if="computedSnEnabled" v-model:checked="formValue.split_sn_enabled_"
      >从此道工序开始后续工序均以SN进行流转
    </a-checkbox>
    <a-checkbox v-model:checked="formValue.trigger_txn_enabled_">开启工序事件触发事务</a-checkbox>
  </div>

  <step-menu
    :tabs="stepOptions"
    v-model:model-current="currentStep"
    @update:model-current="currentStep = $event"
  />

  <template v-for="(subWidget, i) in computedChild">
    <slot
      v-if="i === currentStep"
      :parentWidget="widget"
      :widget="subWidget"
      :children="computedChild"
      :index="i"
      :config="{
        direction: 'horizontal',
        isDrop: true,
        isDrag: true,
        isDelete: true,
        mode: 'move',
      }"
    ></slot>
  </template>
</template>

<script setup lang="ts">
  import { computed, ref, reactive } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { IOperationConfig } from './schema';
  import { formMap } from '/@web-render/render/Event/utils/runGlobalByPage';
  import WorkflowNodesRender from '/@/projects/page-designer/src/components/widgets/web/data/workflow-nodes/workflow-nodes-render.vue';
  import StepMenu from './step-menu/step-menu.vue';

  const props = defineProps<{
    widget: IOperationConfig;
  }>();

  const { refRoutingForm, refRoutingOperationField, workflowWidget } = reactive(props.widget.props);

  const { t } = useI18n();

  const computedChild = computed(() => {
    return props.widget.children || [];
  });

  const currentStep = ref(0);

  const stepOptions = [
    {
      title: '步骤1',
      description: t('sys.kit.edhr.process.form_entries_'),
      content: 'form_entries_',
      entryKey: 'form_entries_',
      status: 'process',
    },
    {
      title: '步骤2',
      description: t('sys.kit.edhr.process.document_entries_'),
      content: 'document_entries_',
      entryKey: 'form_entries_',
      status: 'process',
    },
    {
      title: '步骤3',
      description: t('sys.kit.edhr.process.trigger_txn_entries_'),
      content: 'trigger_txn_entries_',
      entryKey: 'trigger_txn_entries_',
      status: 'process',
    },
  ];

  const computedWorkflowId = computed(() => {
    const id = formMap.value[refRoutingForm]?.[refRoutingOperationField] ?? '';
    return id.includes(':') ? id.split(':')[1] : id;
  });

  const _workflowWidget = computed(() => {
    return Object.assign(workflowWidget, {
      bindModelKey: 'em_routing_operation',
      modelKey: 'em_routing',
    });
  });
  const WorkflowNodesRef = ref();
  const workflowModelValue = ref();

  const computedSnEnabled = computed(() => {
    return props.widget.props.snSplitEnabled;
  });

  const currentOperation = ref('B');

  const formValue = ref({
    operation_id_: null,
    split_sn_enabled_: false, // 是否拆分SN
    trigger_txn_enabled_: false, // 开启事务触发
    report_enabled_: null, // 是否需要报工
    form_entries_: [], // 表单配置
    document_entries_: [], // SOP配置
    trigger_txn_entries_: [], // 事务事件
  });
</script>

<style lang="less" scoped>
  :deep(.ant-steps-item) {
    padding-bottom: 12px;
  }
</style>
