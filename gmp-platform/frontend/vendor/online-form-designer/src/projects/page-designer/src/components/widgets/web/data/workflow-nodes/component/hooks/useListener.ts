import { Graph, Cell } from '@antv/x6';
import { WorkflowNodeTypeEnum, IEmitEventEnum } from '../types';
import { useEvent } from './useEvent';
import { WfAdapter } from '../utils';
import { debounce } from 'lodash-es';
import { getRenderDeferMap } from '../utils/deferred';
import { hideTooltip, bindTooltip } from '../utils/tooltip';

const CONNECTOR = ' is ';
interface IOptions {
  selectedCallback: (cell: Cell | null) => void;
  Event?: any;
}

const deferred = getRenderDeferMap();

export function useListener(graph: Graph, options: IOptions) {
  // 节点变化缓存
  let nodeChangeCache: string[] = [];
  const { emitEvent, onClick, onGraphMounted } = useEvent(options.Event);

  // 批量更新节点
  const updateMultiDebounce = debounce(() => {
    const nodeIds = [...new Set(nodeChangeCache)];
    nodeIds.forEach((n) => {
      const [id, shape] = n.split(CONNECTOR);
      if (!graph.hasCell(id)) return;
      emitEvent!({
        data: WfAdapter[shape]({ id }, graph),
        type: IEmitEventEnum.EDIT,
      });
    });
    nodeChangeCache = [];
    console.log('nodeChangeCache clear');
  }, 300);

  graph.on('edge:connected', ({ isNew, edge }) => {
    console.log('use listener', 'edge:connected');
    // edge.setZIndex(25);
    if (isNew) {
      // 对新创建的边进行插入数据库等持久化操作
      emitEvent!({
        data: WfAdapter[edge.shape](edge, graph),
        type: IEmitEventEnum.ADD,
      });

      const { source, target } = edge;
      // @ts-ignore
      const sourceNode = graph.getCellById(source.cell);
      // @ts-ignore
      const targetNode = graph.getCellById(target.cell);
      nodeChangeCache.push(
        `${sourceNode.id}${CONNECTOR}${sourceNode.shape}`,
        `${targetNode.id}${CONNECTOR}${targetNode.shape}`,
      );
      updateMultiDebounce();
    }
  });

  graph.on('node:added', ({ node }) => {
    console.log('use listener', 'node:added');
    if (node.shape === WorkflowNodeTypeEnum.NODE_GROUP) {
      node.setZIndex(50);
      // node.setAttrs({
      //   label: { text: `并行_${Math.random().toString(36).substring(2, 10)}` },
      // });
    } else {
      node.setZIndex(100);
    }
    emitEvent!({
      data: WfAdapter[node.shape](node, graph),
      type: IEmitEventEnum.ADD,
    });
  });

  // 元素删除
  graph.on('cell:removed', ({ cell }) => {
    console.log('use listener', 'cell:removed');
    emitEvent!({
      data: {
        node_id_: cell.id,
      },
      type: IEmitEventEnum.DELETE,
    });

    if (graph.isEdge(cell)) {
      // 删除边影响两端节点
      const { source, target } = cell;
      // @ts-ignore
      if (graph.hasCell(source.cell)) {
        const sourceNode = graph.getCellById(source.cell);
        nodeChangeCache.push(`${sourceNode.id}${CONNECTOR}${sourceNode.shape}`);
      }
      // @ts-ignore
      if (graph.hasCell(target.cell)) {
        const targetNode = graph.getCellById(target.cell);
        nodeChangeCache.push(`${targetNode.id}${CONNECTOR}${targetNode.shape}`);
      }
    } else {
      // 删除节点影响相邻节点 如果有连线会同时触发线删除 这里不用处理
    }
    updateMultiDebounce();
  });

  /**
   * 节点更新
   * 注意点：多个相关节点同时触发、单个节点更新会遗漏其他节点
   */
  graph.on('node:change:*', ({ node }) => {
    console.log('use listener', 'node:change:*');
    nodeChangeCache.push(`${node.id}${CONNECTOR}${node.shape}`);
    updateMultiDebounce();
  });

  // 元素选中相关监听
  graph.on('cell:selected', ({ cell }) => {
    const { shape } = cell;
    if (
      [WorkflowNodeTypeEnum.NODE_START, WorkflowNodeTypeEnum.NODE_END].includes(
        shape as WorkflowNodeTypeEnum,
      )
    ) {
      graph.cleanSelection();
      return;
    }
    console.log('use listener', 'cell:selected');
    if (options.selectedCallback && typeof options.selectedCallback === 'function') {
      options.selectedCallback(cell);
    }
    emitEvent!({
      data: cell as any,
      type: IEmitEventEnum.SELECTED,
    });
    onClick(cell);
  });

  /**
   * 注册label节点鼠标事件
   */
  graph.on('node:mouseenter', ({ node, e }) => {
    bindTooltip(node, e);
  });

  graph.on('node:mouseleave', ({ node, e }) => {
    hideTooltip();
  });

  graph.on('blank:click', () => {
    console.log('use listener', 'blank:click');
    if (options.selectedCallback && typeof options.selectedCallback === 'function') {
      options.selectedCallback(null);
    }
  });

  graph.on('render:done', () => {
    emitEvent!({
      data: graph as any,
      type: IEmitEventEnum.MOUNTED,
    });
    if (!deferred.deferKey) return;
    deferred.renderDefer[deferred.deferKey].resolve(deferred.deferKey);
    onGraphMounted(graph);
  });
}
