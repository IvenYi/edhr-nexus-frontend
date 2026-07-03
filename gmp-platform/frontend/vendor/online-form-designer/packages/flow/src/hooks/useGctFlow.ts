import type { GctFlowNode, IGctFlowOptions, NodeInstStatusMap } from '../types';
import { ref, computed, shallowRef } from 'vue';
import NodeGenerator, { randomId } from '../utils/NodeGenerator';
import { FlowNodeTypeEnum } from '../enums';

const gctflowMap = new Map<string, any>();

function newGctFlow() {
  /**
   * 流程参数
   */
  const gctFlowOpts = ref<IGctFlowOptions>({});

  const _init_data_ = (): GctFlowNode.Flow => {
    return {
      id: FlowNodeTypeEnum.Flow + randomId(),
      type: FlowNodeTypeEnum.Flow,
      children: [],
    };
  };
  /**
   * 流程数据
   */
  const gctFlowData = ref<GctFlowNode.Flow>(_init_data_());
  const gctFlowDataLastNode = computed<GctFlowNode.Basic | null>(() => {
    const len = gctFlowData.value?.children?.length;
    return len === 0 ? null : gctFlowData.value.children[len - 1];
  });
  function setGctFlowData(data: GctFlowNode.Flow) {
    if (data) gctFlowData.value = data;
  }

  /**
   * 节点 map
   */
  const gctFlowDataMap = computed<
    Record<
      string,
      {
        idx: number;
        pIds: string[];
        prev?: string;
        next?: string;
        node: GctFlowNode.Basic;
        mainFlowNode: boolean; // 流程主线的节点
      }
    >
  >(() => {
    const map = {};
    if (!gctFlowData.value) return map;
    let nIdx = 0;
    // ignoreIdx：忽略下标的计算，ipaas并行分支的flow节点不需要计算下标
    const traverse = (nodes: any[], pIds: string[] = [], ignoreIdx?) => {
      nodes.forEach((n, index) => {
        const data = {
          idx: ignoreIdx ? undefined : nIdx++,
          pIds: [...pIds],
          prev: index === 0 ? undefined : nodes[index + 1]?.id,
          next: index === nodes.length - 1 ? undefined : nodes[index - 1]?.id,
          node: n,
          mainFlowNode: pIds.length === 0,
        };
        map[n.id] = data;
        n.children && traverse(n.children, [...pIds, n.id], n.type === 'parallel');
      });
    };
    traverse(gctFlowData.value.children);
    return map;
  });

  /**
   * 只读状态
   */
  const isReadonly = computed(() => {
    return !!gctFlowOpts.value?.readonly;
  });
  /**
   * 设置只读
   * @param readonly
   */
  function setReadonly(readonly: boolean) {
    gctFlowOpts.value.readonly = readonly;
  }

  /**
   * 选中节点
   * 选中节点下级的 flowId
   */
  const nodeSelectedId = ref<string | undefined>();
  const flowSelectedId = ref<string | undefined>();
  function setNodeSelected(id?: string) {
    nodeSelectedId.value = id;
  }
  function setFlowSelected(id?: string) {
    flowSelectedId.value = id;
  }
  const nodeSelectedData = computed(() => {
    if (!nodeSelectedId.value) {
      return undefined;
    }
    return gctFlowDataMap.value[nodeSelectedId.value]?.node;
  });

  /**
   * 自定义节点渲染
   */
  const nodeRenderMap = shallowRef({});
  function registerNodeRender(render: { [key in FlowNodeTypeEnum]?: any }) {
    Object.assign(nodeRenderMap.value, render);
  }

  const customNodeViewMap = shallowRef({});
  function registerCustomNode(type: string, options: { generator: Function; nodeView: any }) {
    NodeGenerator[type] = options.generator;
    customNodeViewMap.value[type] = options.nodeView;
  }

  /**
   * 显示比例
   */
  const displayScale = ref<number>(100);
  const displayScaleText = computed<string>(() => {
    return displayScale.value + '%';
  });
  const displayScaleRange: [number, number] = [25, 200];
  const changeDisplayScale = (step: -1 | 1) => {
    if (displayScale.value <= displayScaleRange[0] && step === -1) return;
    if (displayScale.value >= displayScaleRange[1] && step === 1) return;
    displayScale.value = displayScale.value + step * 25;
  };

  /**
   * 节点实例状态
   */
  const nodeInstStatusMap = ref<NodeInstStatusMap>({});
  const isInstMode = computed(() => {
    return !!gctFlowOpts.value?.instMode;
  });
  function setInstMode(val: boolean) {
    gctFlowOpts.value.instMode = val;
  }
  function setNodeInstStatusMap(data: NodeInstStatusMap) {
    nodeInstStatusMap.value = data;
  }

  /**
   * 重置
   */
  function reset() {
    gctFlowOpts.value = {};
    gctFlowData.value = _init_data_();
    nodeSelectedId.value = '';
    flowSelectedId.value = '';
    displayScale.value = 100;
    nodeInstStatusMap.value = {};
  }

  function useFlow() {
    /**
     * 初始化
     * @param options
     * @param contentRender 自定义节点内容渲染
     */
    function init(options: IGctFlowOptions) {
      gctFlowOpts.value = options;
      gctFlowData.value = _init_data_();
    }

    function resetGctFlowData() {
      gctFlowData.value = _init_data_();
    }

    /**
     * 添加节点
     * @param type
     * @param data
     */
    function addNode(
      type: FlowNodeTypeEnum | string,
      payload?: Partial<GctFlowNode.Basic>,
      afterAdd?: Function,
    ): GctFlowNode.Basic {
      const generator = NodeGenerator[type];
      const node = generator
        ? generator(payload)
        : {
            ...payload,
            id: type + randomId(),
            type,
          };
      if (afterAdd && typeof afterAdd === 'function') {
        afterAdd(node);
      }
      gctFlowData.value?.children.push(node);
      return node;
    }

    /**
     * 添加下一个节点
     * @param id
     * @param type
     * @param payload
     */
    function addNextNode(
      id: string,
      type: FlowNodeTypeEnum | string,
      payload?: Partial<GctFlowNode.Basic>,
      front?: boolean,
    ): GctFlowNode.Basic {
      const generator = NodeGenerator[type];
      const node = generator
        ? generator(payload)
        : {
            ...payload,
            id: type + randomId(),
            type,
          };
      function traverse(nodes: GctFlowNode.Basic[]) {
        const targetIndex = nodes.findIndex((item) => item.id === id);
        if (targetIndex > -1) {
          nodes.splice(front ? targetIndex : targetIndex + 1, 0, node);
        } else {
          nodes.forEach((item: any) => {
            if (item.children) traverse(item.children);
          });
        }
      }
      traverse(gctFlowData.value?.children);
      return node;
    }

    /**
     * 根据 id 删除节点
     * @param id
     */
    function deleteNodeById(id: string) {
      function traverse(nodes: GctFlowNode.Basic[]) {
        for (let i = nodes.length - 1; i >= 0; i--) {
          const node = nodes[i];
          if (node.id === id || node.syncDeleteById === id) {
            nodes.splice(i, 1);
          } else {
            node.children && traverse(node.children);
          }
        }
      }
      traverse(gctFlowData.value?.children);
      if (id === nodeSelectedId.value) {
        setNodeSelected(gctFlowData.value?.children[0]?.id);
      }
    }

    /**
     * 节点点击
     * @param node
     */
    function onNodeClick(node: GctFlowNode.Basic) {
      setNodeSelected(node.id);
      setFlowSelected('');
      const { onNodeClick: callback } = gctFlowOpts.value ?? {};
      if (callback && typeof callback === 'function') {
        callback(node);
      }
    }

    /**
     * 节点创建
     * @param node
     */
    function onNodeCreate(node: GctFlowNode.Basic, parent?, flow?) {
      flowSelectedId.value = '';
      if (node.type === FlowNodeTypeEnum.Flow) {
        setNodeSelected(node.children[0].id);
      } else {
        setNodeSelected(node.id);
      }
      const { onNodeCreate: callback } = gctFlowOpts.value ?? {};
      if (callback && typeof callback === 'function') {
        callback(node, parent, flow);
      }
    }

    return {
      init,
      reset,
      gctFlowOpts,
      gctFlowData,
      gctFlowDataLastNode,
      gctFlowDataMap,
      setGctFlowData,
      resetGctFlowData,

      customNodeViewMap,
      registerCustomNode,
      nodeRenderMap,
      registerNodeRender,

      addNode,
      addNextNode,
      deleteNodeById,

      nodeSelectedId,
      setNodeSelected,
      flowSelectedId,
      setFlowSelected,
      nodeSelectedData,

      isReadonly,
      setReadonly,

      displayScale,
      displayScaleText,
      changeDisplayScale,

      onNodeClick,
      onNodeCreate,

      isInstMode,
      setInstMode,
      nodeInstStatusMap,
      setNodeInstStatusMap,
    };
  }
  return useFlow;
}

export const useGctFlow = (key = 'commonFlow') => {
  if (!gctflowMap[key]) {
    gctflowMap[key] = newGctFlow();
  }
  return gctflowMap[key]();
};
