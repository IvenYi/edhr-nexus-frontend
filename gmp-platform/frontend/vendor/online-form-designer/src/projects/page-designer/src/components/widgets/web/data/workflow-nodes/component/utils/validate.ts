import { find, includes, isEmpty } from 'lodash-es';
import { Graph, Cell } from '@antv/x6';
import { message } from 'ant-design-vue';
import { IWorkflowNodeRow, WorkflowNodeTypeEnum } from '../types';
import { getProviderInstance } from './provider';
import { postModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey } from '/@/apis/gct-apaas/ModelComprehensiveController';
import { EntityModelCategoryEnum } from '@/projects/app-designer/src/enum';
import { useAppInfoStore } from '/@/store/modules/app-info';

const providerIns = getProviderInstance();

function getLinkInfo(link) {
  if (typeof link === 'string') {
    return JSON.parse(link);
  }
  return {};
}

/**
 * 校验主路径：PATH_MAIN
 */
const validateMain = (source: IWorkflowNodeRow, target: IWorkflowNodeRow, graph): boolean => {
  const sourceLinkInfo = getLinkInfo(source?.link_);
  const targetLinkInfo = getLinkInfo(target?.link_);
  // 场景1：节点只能出一条主路径
  if (sourceLinkInfo?.next) {
    message.warning('节点只允许创建一条主路径！');
    return false;
  }
  // 场景2：并行工艺不能使用主路径
  if (targetLinkInfo?.nextParallels) {
    message.warning('并行工艺只能连接并行工艺！');
    return false;
  }
  // 场景3：作为并行路径起始点不能使用主路径 (排除开始节点)
  if (sourceLinkInfo?.prevParallels) {
    // 如果节点输入包括非并行路径不做限制
    if (sourceLinkInfo?.prev || sourceLinkInfo?.prevOptionals) {
      return true;
    }
    message.warning('当前节点不能使用主路径！');
    return false;
  }
  // 场景4： 不能返回操作节点
  const isProcessor = validateOnPredecessor(source, target, graph);
  if (isProcessor) {
    message.warning('主路径不能指向已操作节点！');
    return false;
  }

  return true;
};

/**
 * 校验备选路径：PATH_OPTIONAL
 */
const validateOptional = (source: IWorkflowNodeRow, target: IWorkflowNodeRow, graph): boolean => {
  const sourceLinkInfo = getLinkInfo(source?.link_);
  const targetLinkInfo = getLinkInfo(target?.link_);
  // 场景1：备选路径必须同时存在主路径
  if (!sourceLinkInfo?.next) {
    message.warning('当前节点没有主路径！');
    return false;
  }
  // 场景2：不能连接并行工艺
  if (targetLinkInfo?.nextParallels) {
    message.warning('并行工艺只能连接并行工艺！');
    return false;
  }
  // 场景3：不能返回操作节点
  const isProcessor = validateOnPredecessor(source, target, graph);
  if (isProcessor) {
    message.warning('备选路径不能指向已操作节点！');
    return false;
  }

  return true;
};

/**
 * 校验并行路径：PATH_PARALLEL
 */
const validateParallel = (source: IWorkflowNodeRow, target: IWorkflowNodeRow, graph): boolean => {
  const sourceLinkInfo = getLinkInfo(source?.link_);
  const targetLinkInfo = getLinkInfo(target?.link_);
  // 场景1：开始节点和结束节点的临近节点不能有并行工艺
  if (targetLinkInfo?.prev?.type === WorkflowNodeTypeEnum.NODE_START) {
    message.warning('第一个工作节点不能有并行工艺!');
    return false;
  }
  // 场景1.1： 开始节点不能有并行
  const targetNode = JSON.parse(target.node_config_);
  if ([WorkflowNodeTypeEnum.NODE_START].includes(targetNode.shape)) {
    message.warning('开始工作节点不能有并行工艺!');
    return false;
  }
  // 场景2：并行线不能和其他线从同一节点指出
  if (sourceLinkInfo.next || sourceLinkInfo?.nextOptionals) {
    message.warning('并行工艺不能包含其他路径！');
    return false;
  }
  // 场景3：并行节点的源头节点必须指向主路径进入的节点
  if (!targetLinkInfo.prev) {
    // FIX: 如果只有并行路径：此处排除
    if (targetLinkInfo.nextParallels) return true;
    message.warning('指向节点不包含输入主路径！');
    return false;
  }
  // 场景4：不能返回操作节点
  const isProcessor = validateOnPredecessor(source, target, graph);
  if (isProcessor) {
    message.warning('并行路径不能指向已操作节点！');
    return false;
  }
  // 场景5：并行工艺如果有进入的线只能是并行线
  if (sourceLinkInfo?.prev || sourceLinkInfo?.prevOptionals || sourceLinkInfo?.prevReworks) {
    message.warning('当前节点输入路径包含非并行工艺路径！');
    return false;
  }
  return true;
};

/**
 * 校验返工路径：PATH_REWORK
 */
const validateRework = (source: IWorkflowNodeRow, target: IWorkflowNodeRow, graph): boolean => {
  // const isProcessor = validateOnPredecessor(source, target, graph);
  // if (!isProcessor) {
  //   message.warning('返工只能返回已操作工艺！！！');
  //   return false;
  // }
  // 场景：返工不能返回开始节点
  if (target.type_ === WorkflowNodeTypeEnum.NODE_START) {
    message.warning('返工操作不能返工至开始节点');
    return false;
  }
  return true;
};

/**
 * @param source
 * @param target
 * @param graph
 * @returns 是否指向前置节点
 */
const validateOnPredecessor = (source: IWorkflowNodeRow, target: IWorkflowNodeRow, graph) => {
  const cell = graph.getCellById(source.node_id_);
  const processors = graph.getPredecessors(cell) || [];
  const processorsIds = processors.map((node) => node.id);
  const isProcessor = includes(processorsIds, target.node_id_);
  return isProcessor;
};

/**
 * 验证节点间是否可以单向连接多条线
 * @param source
 * @param target
 * @param graph
 */
const validateMulti = (source: IWorkflowNodeRow, target: IWorkflowNodeRow) => {
  let sourceLinkNodes: Array<string> = [];
  const sourceLinkInfo = getLinkInfo(source?.link_);
  const next = sourceLinkInfo?.next?.node_id;
  const options = (sourceLinkInfo?.nextOptionals ?? []).map((n) => n.node_id);
  const parallels = (sourceLinkInfo?.nextParallels ?? []).map((n) => n.node_id);
  const reworks = (sourceLinkInfo?.nextReworks ?? []).map((n) => n.node_id);
  sourceLinkNodes = sourceLinkNodes.concat(next, options, parallels, reworks);
  const isMulti = sourceLinkNodes.includes(target.node_id_);

  if (isMulti) {
    message.warning('同两个节点之间同方向的路线只能存在一条');
  }

  return isMulti;
};

const validateMap = {
  [WorkflowNodeTypeEnum.PATH_MAIN]: validateMain,
  [WorkflowNodeTypeEnum.PATH_OPTIONAL]: validateOptional,
  [WorkflowNodeTypeEnum.PATH_PARALLEL]: validateParallel,
  [WorkflowNodeTypeEnum.PATH_BACK]: validateRework,
};

/**
 * 节点连线校验
 */
export class ValidateConnection {
  constructor(args) {
    const { edge } = args;
    this.edge = edge;
    this.shape = edge.shape;
    this.source = edge.source;
    this.target = edge.target;
  }

  edge: Nullable<Cell> = null;
  shape: WorkflowNodeTypeEnum = WorkflowNodeTypeEnum.PATH_MAIN;
  source: Nullable<Cell> = null;
  target: Nullable<Cell> = null;

  validate(graph: Graph) {
    /**
     * 前置处理数据
     * sourceNode
     * targetNode
     */
    const nodeModel = providerIns.modelValue ?? [];
    const sourceNode = find(nodeModel, (node) => node.node_id_ === this.source?.cell);
    const targetNode = find(nodeModel, (node) => node.node_id_ === this.target?.cell);

    const isMulti = validateMulti(sourceNode, targetNode);
    if (isMulti) return false;

    return validateMap[this.shape](sourceNode, targetNode, graph);
  }
}

/**
 * 校验节点是否可以操作（编辑/删除）
 */
export async function validateEditable(data) {
  try {
    const { appInfo } = useAppInfoStore();
    const suiteKey = appInfo.suiteKey;
    if (suiteKey !== 'MEDPRO') return true;

    const formType: string = providerIns?.formData?.formType;
    if (['copy', 'version_copy'].includes(formType)) return true;
    if (!data?.id_) return true;

    if (![WorkflowNodeTypeEnum.NODE_SPEC].includes(data.shape)) return true;

    await postModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey(
      {
        modelKey: 'em_workflow',
        bsKey: 'biz_check_spec_change_szwu',
        modelCategory: EntityModelCategoryEnum.ENTITY,
      },
      { workflow_step_id_: data.id_ },
    );
    return true;
  } catch (err) {
    console.error('validateNode error', err);
    return false;
  }
}

/**
 * 校验主路径的完整性
 */
export async function validateFullMainPath(nodes: Array<any>) {
  const nodeMap = new Map();
  nodes.forEach((node) => {
    nodeMap.set(node.node_id_, node);
  });
  const startNode = nodes.find((d) => d.type_ === WorkflowNodeTypeEnum.NODE_START);
  let currentNode = startNode;
  const visitedNodes = new Set();

  if (!currentNode) {
    return Promise.reject('未检测到完整主路径');
  }

  while (currentNode && currentNode.type_ !== WorkflowNodeTypeEnum.NODE_END) {
    if (visitedNodes.has(currentNode.node_id_)) {
      return Promise.reject(`检测到循环引用，节点 ${currentNode.node_name_} 被重复访问`);
    }
    visitedNodes.add(currentNode.node_id_);

    // 解析link_字段
    let linkData;
    linkData = JSON.parse(currentNode.link_ ?? '{}');
    // 根据节点类型确定下一步
    if (currentNode.type_ === WorkflowNodeTypeEnum.NODE_START) {
      if (!linkData.next) {
        return Promise.reject('未检测到完整主路径');
      }
      currentNode = nodeMap.get(linkData.next.node_id);
    } else if (currentNode.type_ === WorkflowNodeTypeEnum.NODE_SPEC) {
      if (!linkData.next) {
        return Promise.reject('未检测到完整主路径');
      }
      currentNode = nodeMap.get(linkData.next.node_id);
    } else {
      return false;
    }
  }

  const hasNodeSpec = nodes?.find((d) => d.type_ === WorkflowNodeTypeEnum.NODE_SPEC);
  if (!hasNodeSpec) {
    return Promise.reject('未找到工艺路线主路线节点');
  }
}
