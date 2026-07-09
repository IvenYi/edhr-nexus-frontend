<template>
  <workflow-nodes
    ref="WorkflowNodesRef"
    @event="handleEvent"
    @setting="handleSetting"
    :widget-id="widget.id"
    :model-key="widget.props.modelKey"
    :readonly="props.widget.props.readonly"
    :key="widget.id + widget.props.readonly"
  />
  <NodesModal ref="nodesModal" :nodeInfo="nodeInfo" :modalInfo="modalInfo" @ok="handleModelOk" />
</template>

<script setup lang="ts" name="gct-workflow-nodes">
  import { ref, watch, nextTick, reactive } from 'vue';
  import WorkflowNodes from './component/index.vue';
  import { IEmitEventEnum, IEmitEventData, WorkflowNodeTypeEnum } from './component/types';
  // import { getPageEvent } from '/@page-designer/components/widgets/hooks/hooks';
  import NodesModal from './modal/nodes-modal.vue';
  import { LowCodeModal } from '/@/projects/page-designer/src/types/modal-types';
  import { debounce } from 'lodash-es';
  import { message } from 'ant-design-vue';
  import { getRenderDeferMap } from './component/utils/deferred';
  import { getProviderInstance } from './component/utils/provider';
  import { IWorkflowNodesComponentExpose } from '/@/projects/page-designer/src/interface/web';
  import { validateEditable } from './component/utils/validate';
  import { postBizServiceByModelKeyByBsKey } from '/@/apis/gct-apaas/BsServiceController';

  /**
   * 场景1 初始化
   * 场景2 新建 id nodes 置空
   * 场景3 复制 id置空 nodes不变
   * 场景4 编辑/查看
   */

  const props = defineProps<{
    modelValue?: Array<any>;
    widget: any;
    formData: any;
  }>();
  const emit = defineEmits(['update:modelValue', 'selected', 'graphMounted']);

  console.log('workflow:props', props);

  const providerIns = getProviderInstance();
  providerIns.setWidget(props.widget);

  // const Event = getPageEvent();
  const loading = ref(false);
  const modalInfo = ref<LowCodeModal.Modal>();

  const renderGraph = debounce(async () => {
    await nextTick();
    const value = props.modelValue;
    if (value instanceof Array && value.length > 0) {
      WorkflowNodesRef.value.setJson(value);
    } else if (value instanceof Array && value.length === 0) {
      // WorkflowNodesRef.value.initGraph();
    } else {
      emit('update:modelValue', []);
      await nextTick();
      WorkflowNodesRef.value?.initGraph();
    }
  }, 1000);

  const getTableData = async () => {
    loading.value = true;
    const masterId = props.formData.id_;
    if (!masterId) return;
    let res = await postBizServiceByModelKeyByBsKey(
      { bsKey: 'listAll', modelKey: props.widget.props.bindModelKey },
      { query: { 'ref_master_id_.eq': masterId } },
    );
    console.log(res?.data, 'getTableData');
    emit('update:modelValue', res?.data);
    loading.value = false;
  };

  const deferred = reactive(getRenderDeferMap() as any);

  watch(
    () => props.formData.id_,
    () => {
      props.formData.id_ && getTableData();
      props.formData.id_ && deferred.resetDefer();
      props.formData.id_ && deferred.setDeferred(props.formData.id_);
    },
    {
      immediate: true,
    },
  );

  watch(
    () => props.modelValue,
    () => {
      renderGraph();
      providerIns.setModelValue(props.modelValue);
      providerIns.setFormData(props.formData);
      console.log(props.formData, 'formData in workflow');
    },
    {
      immediate: true,
    },
  );

  const WorkflowNodesRef = ref();

  const handleEvent = async (data: IEmitEventData) => {
    if (data.type === IEmitEventEnum.ADD) {
      // eslint-disable-next-line vue/no-mutating-props
      props.modelValue!.push(data.data);
    } else if (data.type === IEmitEventEnum.EDIT) {
      const node = props.modelValue!.find((item) => item.node_id_ === data.data.node_id_);
      if (!node) return;
      Object.assign(node, data.data);
    } else if (data.type === IEmitEventEnum.DELETE) {
      const nodeIndex = props.modelValue!.findIndex((item) => item.node_id_ === data.data.node_id_);
      const node = props.modelValue![nodeIndex];
      if (!node) return;
      if (node.id_) {
        // eslint-disable-next-line vue/no-mutating-props
        props.modelValue![nodeIndex].deleted_ = true;
      } else {
        // eslint-disable-next-line vue/no-mutating-props
        props.modelValue!.splice(nodeIndex, 1);
      }
    } else if (data.type === IEmitEventEnum.SELECTED) {
      emit('selected', data?.data);
    } else if (data.type === IEmitEventEnum.MOUNTED) {
      emit('graphMounted', props.modelValue);
    }
  };

  const nodesModal = ref<InstanceType<typeof NodesModal> | null>(null);
  const nodeInfo = ref();

  /**
   * 编辑节点时重名校验
   * @param data
   */
  const validator = async (data) => {
    const { name_, node_id_ } = data;
    const duplicateName = (WorkflowNodesRef.value.getNodeNames() ?? []).find(
      (n) => n.id !== node_id_ && n.name === name_,
    );
    if (duplicateName) {
      message.error('节点名称不能重复');
      return false;
    }
    const editable = await validateEditable(data);
    if (!editable) {
      return false;
    }
    return true;
  };

  const handleSetting = async (id: string) => {
    if (!id) return;
    const node = props.modelValue?.find((n) => n.node_id_ === id);
    nodeInfo.value = node;
    if (!node) return;
    if (node.type_ === WorkflowNodeTypeEnum.NODE_SPEC) {
      modalInfo.value = props.widget.props.specModalInfo;
    } else if (node.type_ === WorkflowNodeTypeEnum.NODE_WORKFLOW) {
      modalInfo.value = props.widget.props.workflowModalInfo;
    }
    await nextTick();
    nodesModal.value?.open(node, props.modelValue, {
      validator,
    });
  };

  const handleModelOk = (val) => {
    handleEvent({
      type: IEmitEventEnum.EDIT,
      data: val,
    });
    WorkflowNodesRef.value.setNodeName(val.node_id_, val.name_);
    WorkflowNodesRef.value.setNodeData(val.node_id_, val);
  };

  defineExpose<IWorkflowNodesComponentExpose | any>({
    getValue() {
      return props.modelValue;
    },
    getJson() {
      return WorkflowNodesRef.value.getJson();
    },
    restNodesHighlight: async () => {
      await nextTick();
      WorkflowNodesRef.value.restNodesHighlight();
    },
    async setNodeHighlight(nodeId) {
      await nextTick();
      await deferred?.renderDefer?.[props.formData.id_]?.promise;
      WorkflowNodesRef.value.setNodeHighlight(nodeId);
    },
    async setNodesHightLight(nodeIds) {
      await nextTick();
      WorkflowNodesRef.value.setNodesHightLight(nodeIds);
    },
    async setNodeStatus(nodeId, status) {
      await nextTick();
      await deferred?.renderDefer?.[props.formData.id_]?.promise;
      WorkflowNodesRef.value.setNodeStatus(nodeId, status);
    },
    async resetMiniMap() {
      await nextTick();
      WorkflowNodesRef.value.resetMiniMap();
    },

    async getWorkflowData() {
      await nextTick();
      return WorkflowNodesRef.value.workflowData;
    },
  });
</script>

<style lang="less" scoped></style>
