import { useGctFlow } from '../../../hooks/useGctFlow';
import {
  BpmnNodeTypeEnum,
  CaseOperatorEnum,
  CaseValueType,
  ButtonTypeEnum,
  CaseValueSource,
} from '../enums';
import { BpmnAdapter } from '../utils/BpmnAdapter';
import { validateCaseCfg } from '../utils/node-validator';
import nodeModules from '../models';
import type { ITransformOpts, ITransformResult, IGctBpmnNode, GctBpmnNode } from '../types';

const {
  addNode,
  addNextNode,
  gctFlowData,
  setNodeSelected,
  registerCustomNode,
  setGctFlowData,
  resetGctFlowData,
  nodeSelectedId,
  gctFlowDataMap,
  deleteNodeById,
} = useGctFlow();

/**
 * 注册流程节点
 */
Object.keys(nodeModules).forEach((type) => {
  registerCustomNode(type, nodeModules[type]);
});

function init(json?: string | object) {
  if (json) {
    setGctFlowData(typeof json === 'string' ? JSON.parse(json) : json);
  } else {
    resetGctFlowData();
    addNode(BpmnNodeTypeEnum.BpmnSubmit, {
      allowDelete: false,
    });
    addNode(BpmnNodeTypeEnum.BpmnEnd, {
      allowDelete: false,
      allowNext: false,
    });
  }
  if (
    nodeSelectedId.value &&
    JSON.stringify(gctFlowData.value).includes(`"id":"${nodeSelectedId.value}"`)
  ) {
    // 简单点用 json 直接判断
  } else {
    setNodeSelected(gctFlowData.value.children[0].id);
  }
}

function toJson(): string {
  return JSON.stringify(gctFlowData.value);
}

function toBpmnData(options?: ITransformOpts): ITransformResult {
  const data = JSON.parse(JSON.stringify(gctFlowData.value));
  // 创建 start 节点
  const node = nodeModules[BpmnNodeTypeEnum.BpmnStart].generator();
  data.children.unshift(node);
  return BpmnAdapter.transfer(data, options);
}

function onNodeCreate(node: IGctBpmnNode) {
  if (node.type === BpmnNodeTypeEnum.BpmnJudge) {
    // 判断节点自动添加网关
    const gateway = addNextNode(node.id, BpmnNodeTypeEnum.BpmnExclusive, {
      allowDelete: false,
      syncDeleteById: node.id,
    }) as unknown as GctBpmnNode.BpmnExclusive;
    gateway.data!.name = '判断分支';
    gateway.children[0].caseCfg.name = '合格';
    gateway.children[0].caseCfg.json = {
      logicalOperators: 'and',
      elements: [
        {
          type: 'condition',
          element: {
            type: CaseValueType.String,
            operator: CaseOperatorEnum.EQ,
            lType: CaseValueSource.Node,
            lValue: node.id,
            rType: CaseValueSource.Manual,
            rValue: ButtonTypeEnum.Qualified,
          },
        },
      ],
    };
    gateway.children[1].caseCfg.name = '不合格';
  } else if (
    node.type === BpmnNodeTypeEnum.BpmnInclusiveS ||
    node.type === BpmnNodeTypeEnum.BpmnParallel
  ) {
    // 并行分支自动添加聚合节点
    // 并行节点自动添加聚合节点
    addNextNode(node.id, BpmnNodeTypeEnum.BpmnInclusiveE, {
      syncDeleteById: node.id,
    });
  } else if (node.type === BpmnNodeTypeEnum.BpmnTransaction) {
    // ?不同模块下，需要取不同的事务列表数据
  }
}

function validateNode(node: string | IGctBpmnNode): {
  valid: boolean;
} {
  let valid = true;
  const n = typeof node === 'string' ? gctFlowDataMap.value[node]?.node : node;
  if (!n) {
    console.warn('节点不存在或者已经被删除');
    return { valid: true };
  }
  const validator = nodeModules[n.type]?.validator;
  let tips: any[] = [];
  if (validator) {
    validator.forEach((fn) => {
      const tip = fn(n);
      tip && tips.push(tip);
    });
    tips = tips.flat();
    n.tooltips = tips;
    if (tips.length > 0) {
      valid = false;
    }
  }
  // 针对条件分支的特殊处理
  if (n.type === BpmnNodeTypeEnum.BpmnExclusive) {
    (n as GctBpmnNode.BpmnExclusive).children.forEach((flow, index, arr) => {
      if (index + 1 >= arr.length) return;
      const cTips = validateCaseCfg(flow);
      flow.tooltips = cTips;
      if (cTips.length > 0) {
        valid = false;
      }
    });
  }
  return {
    valid,
  };
}

/**
 * 流程节点完成性校验
 */
function validate(): {
  valid: boolean;
} {
  const validArr: boolean[] = [];
  const traverse = (nodes: IGctBpmnNode[]) => {
    nodes.forEach((node) => {
      const v = validateNode(node).valid;
      validArr.push(v);
      node.children && traverse(node.children);
    });
  };
  traverse(gctFlowData.value.children as any);
  return {
    valid: validArr.every((v) => v),
  };
}

function addTransNextNode(node) {
  const cnode = addNextNode(
    node.id,
    BpmnNodeTypeEnum.BpmnReceiveTask,
    {
      syncDeleteById: node.id,
      hidden: true,
    },
    false,
  ) as unknown as GctBpmnNode.BpmnReceiveTask;
  node.data!.nextKey = cnode.id;
  cnode.data!.prevKey = node.id;
  return cnode;
}

export function useGctBpmn() {
  return {
    init,
    toJson,
    toBpmnData,
    onNodeCreate,
    validateNode,
    validate,
    deleteNodeById,
    addTransNextNode,
  };
}
