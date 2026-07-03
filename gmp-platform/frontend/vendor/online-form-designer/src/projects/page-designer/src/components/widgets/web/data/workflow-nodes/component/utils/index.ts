import { Node, Edge, Graph } from '@antv/x6';
import { WorkflowNodeTypeEnum, IWorkflowNodeRow } from '../types';
import { groupBy } from 'lodash-es';

function getInfoById(id: string, graph: Graph) {
  const cell = graph.getCellById(id);
  return {
    type: cell.shape,
    node_id: cell.id,
  };
}

function getLinkInfo(node: Node, graph: Graph) {
  const outgoingEdges = graph.getOutgoingEdges(node);
  const inCommingEdges = graph.getIncomingEdges(node);

  const linkInfo = {};

  const outgoingEdgesMap = groupBy(outgoingEdges ?? [], 'shape');
  const inCommingEdgesMap = groupBy(inCommingEdges ?? [], 'shape');

  Object.keys(outgoingEdgesMap).forEach((key) => {
    const data = outgoingEdgesMap[key];
    if (key === WorkflowNodeTypeEnum.PATH_MAIN) {
      if (data.length > 1) console.warn('[outgoing]主路径只能有一个');
      linkInfo.next = getInfoById(data[0].target.cell, graph);
    } else if (key === WorkflowNodeTypeEnum.PATH_OPTIONAL) {
      linkInfo.nextOptionals = data.map((i) => getInfoById(i.target.cell, graph));
    } else if (key === WorkflowNodeTypeEnum.PATH_PARALLEL) {
      linkInfo.nextParallels = data.map((i) => getInfoById(i.target.cell, graph));
    } else if (key === WorkflowNodeTypeEnum.PATH_BACK) {
      linkInfo.nextReworks = data.map((i) => getInfoById(i.target.cell, graph));
    }
  });

  Object.keys(inCommingEdgesMap).forEach((key) => {
    const data = inCommingEdgesMap[key];
    if (key === WorkflowNodeTypeEnum.PATH_MAIN) {
      if (data.length > 1) console.warn('[incomming]主路径只能有一个');
      linkInfo.prev = getInfoById(data[0].source.cell, graph);
    } else if (key === WorkflowNodeTypeEnum.PATH_OPTIONAL) {
      linkInfo.prevOptionals = data.map((i) => getInfoById(i.source.cell, graph));
    } else if (key === WorkflowNodeTypeEnum.PATH_PARALLEL) {
      linkInfo.prevParallels = data.map((i) => getInfoById(i.source.cell, graph));
    } else if (key === WorkflowNodeTypeEnum.PATH_BACK) {
      linkInfo.prevReworks = data.map((i) => getInfoById(i.source.cell, graph));
    }
  });
  console.log(linkInfo);
  return JSON.stringify(linkInfo);
}

export class WfAdapter {
  /**
   * 开始节点
   * @param node
   * @param graph
   * @returns
   */
  static [WorkflowNodeTypeEnum.NODE_START](node: Node, graph: Graph): IWorkflowNodeRow {
    const cell = graph.toJSON().cells.find((c) => c.id === node.id);
    const { id, shape, attrs } = cell as any;
    const label = attrs?.text?.text ?? '开始';
    return {
      type_: shape as WorkflowNodeTypeEnum,
      name_: label,
      node_config_: JSON.stringify(cell),
      node_id_: id,
      link_: getLinkInfo(node, graph),
    };
  }

  /**
   * 结束节点
   * @param node
   * @param graph
   * @returns
   */
  static [WorkflowNodeTypeEnum.NODE_END](node: Node, graph: Graph): IWorkflowNodeRow {
    const cell = graph.toJSON().cells.find((c) => c.id === node.id);
    const { id, shape, attrs } = cell as any;
    const label = attrs?.text?.text ?? '结束';
    return {
      type_: shape as WorkflowNodeTypeEnum,
      name_: label,
      node_config_: JSON.stringify(cell),
      node_id_: id,
      link_: getLinkInfo(node, graph),
    };
  }

  /**
   * 工艺节点
   * @param node
   * @param graph
   * @returns
   */
  static [WorkflowNodeTypeEnum.NODE_SPEC](node: Node, graph: Graph): IWorkflowNodeRow {
    const cell = graph.toJSON().cells.find((c) => c.id === node.id);
    const { id, shape, parent, data, attrs } = cell as any;
    const label = (attrs?.label?.text || attrs?.text?.text) ?? '';
    const nodeConfig = {
      ...cell,
      data: {
        ...data,
        node_config_: undefined, // 确保 node_config_ 不在data中被传递
      },
    };
    return {
      type_: shape as WorkflowNodeTypeEnum,
      name_: label,
      spec_id_: data?.spec_id_ || data?._ref_id_ || '',
      node_id_: id,
      group_node_id_: (parent as unknown as string) ?? '',
      node_config_: JSON.stringify(nodeConfig),
      link_: getLinkInfo(node, graph),
    };
  }

  /**
   * 工作流节点
   * @param node
   * @param graph
   * @returns
   */
  static [WorkflowNodeTypeEnum.NODE_WORKFLOW](node: Node, graph: Graph): IWorkflowNodeRow {
    const cell = graph.toJSON().cells.find((c) => c.id === node.id);
    const { id, shape, parent, data, attrs } = cell as any;
    const label = attrs?.text?.text ?? '';
    const nodeConfig = {
      ...cell,
      data: {
        ...data,
        node_config_: undefined, // 确保 node_config_ 不在data中被传递
      },
    };
    return {
      type_: shape as WorkflowNodeTypeEnum,
      name_: label,
      sub_workflow_: data?._ref_id_ ?? '',
      node_id_: id,
      group_node_id_: (parent as unknown as string) ?? '',
      node_config_: JSON.stringify(nodeConfig),
      link_: getLinkInfo(node, graph),
    };
  }

  /**
   * 分组节点
   * @param node
   * @param graph
   * @returns
   */
  static [WorkflowNodeTypeEnum.NODE_GROUP](node: Node, graph: Graph): IWorkflowNodeRow {
    const cell = graph.toJSON().cells.find((c) => c.id === node.id);
    const { id, shape, attrs } = cell as any;
    const label = attrs?.text?.text ?? '';
    return {
      type_: shape as WorkflowNodeTypeEnum,
      name_: label,
      node_id_: id,
      node_config_: JSON.stringify(cell),
      link_: getLinkInfo(node, graph),
    };
  }

  /**
   * 路径
   * @param edge
   * @param graph
   * @returns
   */
  static path(edge: Edge, graph: Graph): IWorkflowNodeRow {
    const cell = graph.toJSON().cells.find((c) => c.id === edge.id);
    const { id, shape, source, target } = cell as any;
    return {
      type_: shape as WorkflowNodeTypeEnum,
      node_id_: id,
      source_node_id_: source.cell ?? '',
      target_node_id_: target.cell ?? '',
      node_config_: JSON.stringify(cell),
      name_: id, // NDO name_ 必填
    };
  }
  static [WorkflowNodeTypeEnum.PATH_MAIN](edge: Edge, graph: Graph): IWorkflowNodeRow {
    return WfAdapter.path(edge, graph);
  }
  static [WorkflowNodeTypeEnum.PATH_OPTIONAL](edge: Edge, graph: Graph): IWorkflowNodeRow {
    return WfAdapter.path(edge, graph);
  }
  static [WorkflowNodeTypeEnum.PATH_PARALLEL](edge: Edge, graph: Graph): IWorkflowNodeRow {
    return WfAdapter.path(edge, graph);
  }
  static [WorkflowNodeTypeEnum.PATH_BACK](edge: Edge, graph: Graph): IWorkflowNodeRow {
    return WfAdapter.path(edge, graph);
  }
}
