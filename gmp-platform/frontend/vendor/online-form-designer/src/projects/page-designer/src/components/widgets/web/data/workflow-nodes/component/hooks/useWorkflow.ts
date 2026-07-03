import { ref, Ref } from 'vue';
import { Graph, Cell, Node } from '@antv/x6';
import { Dnd } from '@antv/x6-plugin-dnd';
import { MiniMap } from '@antv/x6-plugin-minimap';
import { useListener } from './useListener';
import { usePlugin } from './usePlugin';
import { WorkflowNodeTypeEnum } from '../types';
import { ValidateConnection, validateEditable } from '../utils/validate';
import '../utils/statusRender';

interface IOptions {
  containerEl: HTMLElement;
  designMode?: boolean;
}

interface IWorkflow {
  graph?: Graph;
  dnd?: Dnd;
  currentCell?: any;
  props?: IOptions;
}

const workflowDataMap: Ref<Record<string, IWorkflow>> = ref({});

export function useWorkflow(key: string, Event) {
  if (workflowDataMap.value[key] === undefined) {
    workflowDataMap.value[key] = {};
  }
  const workflowData = workflowDataMap.value[key];

  function initWorkflow(options: IOptions) {
    const graph = new Graph({
      container: options.containerEl.querySelector('.wf-canvas') as HTMLElement,
      // width: 800,
      // 是否监听容器大小改变，并自动更新画布大小
      autoResize: true,
      // 画布是否可以拖拽平移
      panning: true,
      // 滚动鼠标滚轮缩放画布
      mousewheel: false,

      background: {
        color: '#fafafa',
      },

      /**
       * 组合节点：节点A能嵌入到节点B中
       */
      embedding: {
        enabled: true,
        findParent({ node }) {
          if (
            [
              WorkflowNodeTypeEnum.NODE_GROUP,
              WorkflowNodeTypeEnum.NODE_START,
              WorkflowNodeTypeEnum.NODE_END,
            ].includes(node.shape as WorkflowNodeTypeEnum)
          ) {
            // 跳过 开始 结束 分组
            return [];
          }
          const bbox = node.getBBox();
          return this.getNodes().filter((pNode) => {
            if (pNode.shape === WorkflowNodeTypeEnum.NODE_GROUP) {
              const targetBBox = pNode.getBBox();
              return bbox.isIntersectWithRect(targetBBox);
            }
            return false;
          });
        },
      },

      /**
       * 绘制连线
       */
      connecting: {
        connector: {
          name: 'smooth',
        },
        createEdge({ sourceMagnet }) {
          console.log(sourceMagnet.attributes);
          const shape =
            sourceMagnet.parentElement!.attributes['port-group'].value.match(/[A-Z_]+/)[0];
          if (shape) {
            return graph.createEdge({
              shape,
            });
          }
        },
        allowBlank: false, // 是否允许连接到画布空白位置的点
        // allowLoop: false, // 是否允许创建循环连线，即边的起始节点和终止节点为同一节点
        // allowNode: false, // 是否允许边连接到节点（非节点上的连接桩）
        // allowEdge: false, // 是否允许边链接到另一个边
        allowPort: false, // 是否允许边链接到连接桩
        allowMulti: true, // 是否允许在相同的起始节点和终止之间创建多条边
        validateEdge(args) {
          const validation = new ValidateConnection(args);
          return validation.validate(graph);
        },
      },
    });

    graph.use(
      new MiniMap({
        container: options.containerEl.querySelector('.wf-canvas-minimap') as HTMLElement,
        width: 160,
        height: 90,
        padding: 10,
        scalable: false,
      }),
    );

    const dnd = new Dnd({
      target: graph!,
      scaled: false,
      // dndContainer: options.dndEl[0],
      // dndContainer: document.querySelector('.workflow_nodes__tool--setting') as HTMLElement,
      // getDragNode: (node) => node.clone({ keepId: true }),
      // getDropNode: (node) => node.clone({ keepId: true }),
    });

    Object.assign(workflowData, {
      graph,
      dnd,
      props: options,
    });

    if (options.designMode) {
      initGraphDemo();
    } else {
      useListener(graph, {
        selectedCallback(cell: Cell | null) {
          workflowData.currentCell = cell;
        },
        Event,
      });
      usePlugin(graph);
    }
  }

  /**
   * 节点转化 自动替换成默认版本
   * @param data
   * @returns
   */
  async function _transData(data) {
    // if (data.base_id_) {
    //   return data;
    // } else {
    //   // 拖拽工艺父节点带出默认版本！！！
    //   // 1. 子节点未加载
    //   if (!data?.children) {
    //     const children = await getSpecChildren(data.id_);
    //     return (children ?? []).find((i) => i.default_);
    //   }
    //   // 2. 子节点已加载
    //   return (data.children ?? []).find((i) => i.default_);
    // }

    // 放开父级拖动，不选中默认版本
    return data;
  }

  async function drag(e: MouseEvent, type: WorkflowNodeTypeEnum, data?: any) {
    console.log(data, type, 'drag');
    const opt: any = {};
    if ([WorkflowNodeTypeEnum.NODE_SPEC, WorkflowNodeTypeEnum.NODE_WORKFLOW].includes(type)) {
      const { id_, base_id_, name_, version_ } = data;
      const nodeNames = workflowData.graph?.getNodes().map((n: Node) => n.attrs!.text.text) ?? [];

      /** 不允许重名 增加数字后缀 */
      const name = base_id_ ? `${name_}:${version_}` : `${name_}`;
      const refId = base_id_ ? `${base_id_}:${id_}` : id_;

      let count = 1;
      let nameCount = name;
      while (nodeNames.includes(nameCount)) {
        nameCount = name + '_' + count++;
      }

      Object.assign(opt, {
        label: nameCount,
        data: {
          _ref_id_: refId,
        },
      });
    } else if (WorkflowNodeTypeEnum.NODE_GROUP === type) {
      Object.assign(opt, {
        label: '并行',
      });
    }
    const node = workflowData.graph!.createNode({
      shape: type,
      ...opt,
      width: 56,
      height: 56,
      attrs: {
        label: {
          class: 'workflow-nodes__name',
          textWrap: {
            width: '180%',
            height: '50%', // 高度为参照元素高度的一半
            ellipsis: true, // 文本超出显示范围时，自动添加省略号
            breakWord: false, // 是否截断单词
          },
        },
      },
    });
    workflowData.dnd!.start(node, e as any);
  }

  /**
   * 初始化开始结束节点
   */
  function initGraph() {
    // 清空画布
    workflowData.graph?.fromJSON({
      cells: [],
    });
    const rect = workflowData.props?.containerEl
      .querySelector('.wf-canvas')
      ?.getBoundingClientRect();
    const height = rect!.height;
    const width = Math.min(rect!.width, 1200);
    workflowData.graph?.addNode({
      shape: WorkflowNodeTypeEnum.NODE_START,
      x: width / 4 - 30,
      y: height / 2 - 50,
    });
    workflowData.graph?.addNode({
      shape: WorkflowNodeTypeEnum.NODE_END,
      x: (width / 4) * 3 - 30,
      y: height / 2 - 50,
    });
  }

  /**
   * 渲染示例
   */
  function initGraphDemo() {
    const rect = workflowData.props?.containerEl
      .querySelector('.wf-canvas')
      ?.getBoundingClientRect();
    const height = rect!.height;
    const width = Math.min(rect!.width, 1200);
    const a = workflowData.graph?.addNode({
      shape: WorkflowNodeTypeEnum.NODE_START,
      x: width / 4 - 30,
      y: height / 2 - 50,
    });
    const b = workflowData.graph?.addNode({
      shape: WorkflowNodeTypeEnum.NODE_SPEC,
      x: (width / 4) * 2 - 30,
      y: height / 2 - 50,
      label: '示例工序1',
    });
    const c = workflowData.graph?.addNode({
      shape: WorkflowNodeTypeEnum.NODE_END,
      x: (width / 4) * 3 - 30,
      y: height / 2 - 50,
    });
    workflowData.graph?.addEdge({
      shape: WorkflowNodeTypeEnum.PATH_MAIN,
      source: { cell: a!.id, port: `${WorkflowNodeTypeEnum.PATH_MAIN}_1` },
      target: { cell: b as Cell }, // 目标节点
    });
    workflowData.graph?.addEdge({
      shape: WorkflowNodeTypeEnum.PATH_MAIN,
      source: { cell: b!.id, port: `${WorkflowNodeTypeEnum.PATH_MAIN}_1` },
      target: { cell: c as Cell }, // 目标节点
    });
  }

  /**
   * 销毁画布，清空
   */
  function destroyGraph() {
    workflowData.graph?.dispose();
    workflowDataMap.value[key] = {};
  }

  /**
   * 获取画布数据
   * @returns
   */
  function getJson() {
    const json = workflowData.graph?.toJSON();
    console.log(json);
    return json;
  }

  /**
   * 初始化图表 更新节点后台id
   * @param arr
   */
  function setJson(arr) {
    console.log(arr, 'graph json');
    workflowData.graph?.fromJSON({
      cells: arr.map((item) => {
        const cell = JSON.parse(item.node_config_);
        if ([WorkflowNodeTypeEnum.NODE_START, WorkflowNodeTypeEnum.NODE_END].includes(cell.type)) {
          cell.attrs.text.text = item.name_;
        }
        cell.data = {
          ...item,
          _ref_id_: cell?.data?._ref_id_ ?? '',
          shape: cell.shape,
          /** FIX: 当工作流比较复杂时，后端请求工步接口获取数据时会出现过载的问题 */
          node_config_: null,
        };

        // 旧数据【...】样式兼容
        cell.attrs = {
          ...cell.attrs,
          label: {
            ...cell.attrs?.label,
            textWrap: {
              width: '180%',
              height: '50%', // 高度为参照元素高度的一半
              ellipsis: true, // 文本超出显示范围时，自动添加省略号
              breakWord: false, // 是否截断单词
            },
          },
        };
        return cell;
      }),
    });
  }

  /**
   * 删除选中节点
   * 清空选中
   */
  async function deleteSelected() {
    const editable = await validateEditable(workflowData.currentCell?.data ?? {});
    if (!editable) return;

    workflowData.graph?.removeCell(workflowData.currentCell?.id);
    workflowData.currentCell = null;
  }

  /**
   * 设置节点状态/NodeStateEnum
   * @param nodeId
   * @param status
   */
  function setNodeStatus(nodeId, status) {
    const node = workflowData.graph?.getCellById(nodeId);
    if (!node) return;

    // !设置 foreignObject 的属性<描绘当前节点状态>
    node.setAttrs({
      status: {
        html: `<node-status status="${status}" type="status" />`,
      },
    });
  }

  function getNodeNames() {
    return (workflowData.graph?.getNodes() ?? []).map((item) => ({
      id: item.id,
      name: item.attrs!.text.text,
    }));
  }

  function setNodeName(id, name) {
    workflowData.graph?.getCellById(id).setAttrs({
      label: { text: name },
      text: { text: name },
    });
  }

  function setNodeData(id, data) {
    workflowData.graph?.getCellById(id)?.setData(data, {
      deep: false,
      silent: false,
    });
  }

  function setNodeHighlight(nodeId) {
    restNodesHighlight();
    const node = workflowData.graph?.getCellById(nodeId);
    if (!node) return;
    node.setAttrs({
      body: {
        stroke: '#f59e0b',
        'stroke-width': 5,
        'stroke-opacity': 0.6,
        'stroke-linecap': 'round',
        rx: 4, // 水平圆角半径
        ry: 4, // 垂直圆角半径
      },
    });
  }

  function setNodesHightLight(nodeIds) {
    restNodesHighlight();
    nodeIds.forEach((nodeId) => {
      const node = workflowData.graph?.getCellById(nodeId);
      if (!node) return;
      node.setAttrs({
        body: {
          stroke: '#f59e0b',
          'stroke-width': 5,
          'stroke-opacity': 0.6,
          'stroke-linecap': 'round',
        },
      });
    });
  }

  function restNodesHighlight() {
    (workflowData.graph?.getNodes() ?? []).forEach((n: Node) => {
      n.setAttrs({
        body: {
          stroke: 'transparent',
          'stroke-width': 0,
        },
      });
    });
  }

  function resetMiniMap(options: IOptions) {
    workflowData.graph?.disposePlugins('minimap');
    setTimeout(() => {
      workflowData.graph?.use(
        new MiniMap({
          container: options.containerEl.querySelector('.wf-canvas-minimap') as HTMLElement,
          width: 160,
          height: 90,
          padding: 10,
          scalable: false,
        }),
      );
    }, 100);
  }

  return {
    initWorkflow,
    workflowData,

    drag,

    deleteSelected,

    // save,
    initGraph,
    getJson,
    setJson,

    getNodeNames,
    setNodeName,

    setNodeData,

    setNodeHighlight,
    setNodesHightLight,
    restNodesHighlight,

    setNodeStatus,

    resetMiniMap,

    destroyGraph,
  };
}
