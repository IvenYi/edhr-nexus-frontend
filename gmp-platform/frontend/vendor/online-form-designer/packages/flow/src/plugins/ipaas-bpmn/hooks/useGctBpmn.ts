import { watch } from 'vue';
import { useGctFlow } from '../../../hooks/useGctFlow';
import { BpmnNodeTypeEnum } from '../enums';
// import { validateCaseCfg } from '../utils/node-validator';
import nodeModules from '../models';
import type { GctBpmnNode, IGctBpmnNode } from '../types';
import { validateCaseCfg } from '../utils/node-validator';

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
  reset,
} = useGctFlow();

/**
 * 注册流程节点
 */
Object.keys(nodeModules).forEach((type) => {
  registerCustomNode(type, nodeModules[type]);
});

function init(json?: string | object) {
  setNodeSelected('');
  if (json) {
    setGctFlowData(typeof json === 'string' ? JSON.parse(json) : json);
  } else {
    resetGctFlowData();
    addNode(BpmnNodeTypeEnum.BpmnTrigger, {
      allowDelete: false,
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

// function toJson(): string {
//   return JSON.stringify(gctFlowData.value);
// }

// function toBpmnData(options?: ITransformOpts): ITransformResult {
//   const data = JSON.parse(JSON.stringify(gctFlowData.value));
//   // 创建 start 节点
//   const node = nodeModules[BpmnNodeTypeEnum.BpmnStart].generator();
//   data.children.unshift(node);
//   return BpmnAdapter.transfer(data, options);
// }

function onNodeCreate(node: IGctBpmnNode) {}

function validateNode(
  node: string | IGctBpmnNode,
  getExtraTips?: (Idata: IGctBpmnNode) => string[],
): {
  valid: boolean;
} {
  let valid = true;
  const n = typeof node === 'string' ? gctFlowDataMap.value[node]?.node : node;
  if (!n) {
    console.warn('节点不存在或者已经被删除');
    return { valid: true };
  }
  const validator = nodeModules[n.type]?.validator;
  const extraTips = (getExtraTips && getExtraTips(n)) || [];
  let tips: any[] = [];
  if (validator) {
    validator.forEach((fn) => {
      const tip = fn(n);
      tip && tips.push(tip);
    });
    tips = [...tips.flat(), ...extraTips];
    n.tooltips = tips;
    if (tips.length > 0) {
      valid = false;
    }
  } else {
    n.tooltips = extraTips || [];
    valid = !(extraTips && extraTips.length);
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
function validate(getExtraTips?: (Idata) => string[]): {
  valid: boolean;
} {
  const validArr: boolean[] = [];
  const traverse = (nodes: IGctBpmnNode[]) => {
    nodes.forEach((node) => {
      const v = validateNode(node, getExtraTips).valid;
      validArr.push(v);
      node.children && traverse(node.children);
    });
  };
  traverse(gctFlowData.value.children as any);
  return {
    valid: validArr.every((v) => v),
  };
}

export function useGctIPaaSBpmn() {
  return {
    init,
    // toJson,
    // toBpmnData,
    onNodeCreate,
    validateNode,
    validate,
  };
}
