import { computed, nextTick, reactive, ref, toRef, watch } from 'vue';
import { getPageEvent } from '/@page-designer/components/widgets/hooks/hooks';
import { formMap } from '/@web-render/render/Event/utils/runGlobalByPage';
import { WorkflowNodeTypeEnum } from '/@page-designer/components/widgets/web/data/workflow-nodes/component/types';
import { postBizServiceByModelKeyByBsKey } from '/@/apis/gct-apaas/BsServiceController';

function getNodeLinkNode(node, type: string) {
  const link = node.link_;
  if (link && typeof link === 'string') {
    const linkInfo = JSON.parse(link);

    if (Object.hasOwn(linkInfo, type)) {
      return linkInfo[type];
    }
    return null;
  }
  return null;
}

/** 是否为主路经节点 */
export function isMainNode(node) {
  if (!node) return false;

  const link = node.link_;
  if (link && typeof link === 'string') {
    const linkInfo = JSON.parse(link);
    const hasPrev = Object.hasOwn(linkInfo, 'prev');
    const hasNext = Object.hasOwn(linkInfo, 'next');
    return hasPrev && hasNext;
  }
  return false;
}

/** 是否为并行节点 */
export function isParallelNode(node) {
  if (!node) return false;

  const link = node.link_;
  if (link && typeof link === 'string') {
    const linkInfo = JSON.parse(link);
    const hasNextParallel = Object.hasOwn(linkInfo, 'nextParallels');
    return hasNextParallel;
  }
  return false;
}

/** 是否为层级的并行节点 */
export function isLayerParallelNode(node, compareNode) {
  if (!node) return false;

  const nodeLinkNode = getNodeLinkNode(node, 'nextParallels');
  const compareNodeLinkNode = getNodeLinkNode(compareNode, 'nextParallels');
  return nodeLinkNode?.[0]?.node_id === compareNodeLinkNode?.[0]?.node_id;
}

export function useWorkflowNodes({ props, setOperation, initNodesConfigFormData }) {
  const Event = getPageEvent();

  const {
    refRoutingForm,
    refRoutingOperationField,
    workflowWidget,
    bindWorkflowKey,
    readonlyEnabled,
    refTxnForm,
    refTxnField,
    customDataSource,
    datasourceConfig,
  } = reactive(props.widget.props);

  const refTxnFormData = toRef(() => {
    const data: any = {};
    if (!refTxnField) return data;
    refTxnField?.forEach((key) => {
      if (key) {
        data[key] = formMap.value[refTxnForm]?.[key];
      }
    });
    return data;
  });

  const customApi =
    customDataSource && datasourceConfig?.name
      ? (queryData) =>
          Event.runExportByName(
            datasourceConfig?.name,
            queryData,
            refTxnFormData.value,
            datasourceConfig?.extraParams,
          )
      : undefined;

  const workflowNodesRef = ref();
  const workflowModelValue = ref<Array<any> | null>([]);
  const workflowReadonly = ref(!!readonlyEnabled);

  const computedWorkflowId = computed(() => {
    const id = formMap.value[refRoutingForm]?.[refRoutingOperationField] ?? '';
    return id.includes(':') ? id.split(':')[1] : id;
  });
  watch(
    computedWorkflowId,
    () => {
      console.log('computedWorkflowId', computedWorkflowId.value);
      if (!computedWorkflowId.value) {
        workflowModelValue.value = null;
      }
    },
    {
      immediate: true,
    },
  );

  const workflowSchema = computed(() => {
    return Object.assign(workflowWidget, {
      props: {
        ...workflowWidget.props,
        readonly: workflowReadonly.value,
        bindModelKey: 'em_routing_operation',
        modelKey: 'em_routing',
      },
    });
  });

  const workflowComponent = computed(() => {
    if (bindWorkflowKey) {
      const bindWorkflowCom = Event.getComponent(bindWorkflowKey) as any;
      return bindWorkflowCom!;
    }
    return null;
  });

  const workflowData = computed(() => {
    if (workflowComponent.value) {
      return workflowComponent.value.getValue() || workflowComponent.value.getJson()?.cells || [];
    }
    if (workflowSchema.value) {
      return workflowModelValue.value;
    }
    return [];
  });

  /**
   * 获取节点状态
   * 【批次转SN】制程配置开启SN后，后续的节点也需要同步SN的状态
   * 根据状态区分表单配置的数据源
   */
  async function getNodeSnStatus(snNode, node, comRef?) {
    try {
      if (!snNode) return false;

      let workflowGraph: any = null;
      if (workflowComponent.value) {
        workflowGraph = await workflowComponent.value?.getWorkflowData();
      }
      if (comRef) {
        workflowGraph = await comRef?.getWorkflowData();
      }
      const { graph } = workflowGraph ?? {};
      if (!graph) return false;

      const snCell = graph.getCellById(snNode.node_id_);
      const targetCell = graph.getCellById(node.node_id_);

      const isSameCell = snNode.node_id_ === node.node_id_;
      if (isSameCell) return true;

      const isPredecessorNode = graph.isPredecessor(snCell, targetCell);
      if (isPredecessorNode) return false;

      const isSuccessorNode = graph.isSuccessor(snCell, targetCell);
      if (isSuccessorNode) return true;

      // 并行工艺校验逻辑
      const isParallels = targetCell?.data?.link_?.includes('nextParallels');
      if (isParallels) {
        const targetCellSuccessor = graph.getSuccessors(targetCell)?.filter((cell) => {
          const linkInfo = JSON.parse(cell?.data?.link_ ?? '{}');
          return (
            // 获取并行工艺节点后续主路经上的节点
            cell.shape === WorkflowNodeTypeEnum.NODE_SPEC &&
            Object.hasOwn(linkInfo, 'prevParallels') &&
            Object.hasOwn(linkInfo, 'next') &&
            Object.hasOwn(linkInfo, 'prev')
          );
        });
        for (const cell of targetCellSuccessor) {
          const isSuccessor = graph.isSuccessor(snCell, cell);
          console.log('isParallels:isSuccessor', isSuccessor);
          if (isSuccessor) return true;
        }
      }
      return false;
    } catch (error) {
      console.error('获取节点SN状态失败', error);
      return false;
    }
  }

  /** 节点选中事件 */
  async function handleSelectedEvent(nodeData) {
    console.log('handleSelectedEvent', nodeData);
    const { id, label: name_, shape: type_, data } = nodeData;
    if (!id || type_ !== WorkflowNodeTypeEnum.NODE_SPEC) return;

    await nextTick();
    workflowNodesRef.value.setNodeHighlight(id);
    const _nodeData = {
      ...data,
      node_id_: id,
      operation_id_: data?._ref_id_,
      routing_operation_id_: data?.id_,
      id_: id,
      name_: data?.name_ || name_,
    };
    setOperation(_nodeData);
  }

  /**
   * 画布加载完事件
   */
  async function handleGraphMountedEvent() {
    const workflowNodes = workflowNodesRef.value?.getJson()?.cells;
    const nodeSpecList = workflowNodes?.filter((d) => d.shape === WorkflowNodeTypeEnum.NODE_SPEC);
    if (nodeSpecList?.length) {
      console.log(refTxnFormData.value, 'refTxnForm');
      const configsData = await loadProcessData();
      initNodesConfigFormData(configsData ?? []);
      handleSelectedEvent(nodeSpecList[0]);
    }
  }

  async function loadProcessData() {
    const queryData = {};
    Object.keys(refTxnFormData.value).forEach((item) => {
      const fieldKey = removePrefixAndSuffix(item);
      queryData[fieldKey] = refTxnFormData.value[item];
    });
    if (customApi) {
      return (await customApi(queryData)) as any;
    }
    const res = await postBizServiceByModelKeyByBsKey(
      {
        bsKey: 'biz_get',
        modelKey: 'em_product_process',
      },
      {
        query: queryData,
      },
    );
    console.log(res, 'res: PROCESS DATA');

    return res;
  }
  function setWorkflowReadonly(readonly: boolean) {
    workflowReadonly.value = readonly;
  }

  function removePrefixAndSuffix(str: string): string {
    if (!str) return '';
    return str.replace(/^f_(.+?)_[^_]*$/, '$1');
  }

  return {
    workflowNodesRef,
    workflowModelValue,
    computedWorkflowId,
    workflowSchema,
    workflowComponent,
    workflowData,
    getNodeSnStatus,
    isMainNode,
    handleSelectedEvent,
    handleGraphMountedEvent,
    setWorkflowReadonly,
  };
}
