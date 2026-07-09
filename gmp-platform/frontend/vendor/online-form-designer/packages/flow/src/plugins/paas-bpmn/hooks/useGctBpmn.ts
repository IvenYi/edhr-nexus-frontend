import { useGctFlow } from '../../../hooks/useGctFlow';
import { BpmnNodeTypeEnum } from '../enums';
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
} = useGctFlow();

/**
 * 注册流程节点
 */
Object.keys(nodeModules).forEach((type) => {
  registerCustomNode(type, nodeModules[type]);
});

function init(json?: string | object, isBusiness = false) {
  if (json) {
    setGctFlowData(typeof json === 'string' ? JSON.parse(json) : json);
  } else {
    resetGctFlowData();
    if (isBusiness) {
      addNode(BpmnNodeTypeEnum.BpmnStart, {
        allowDelete: false,
      });
    } else {
      addNode(BpmnNodeTypeEnum.BpmnSubmit, {
        allowDelete: false,
      });
    }
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

function toBpmnData(options?: ITransformOpts, isBusiness = false): ITransformResult {
  const data = JSON.parse(JSON.stringify(gctFlowData.value));
  if (!isBusiness) {
    // 创建 start 节点
    const node = nodeModules[BpmnNodeTypeEnum.BpmnStart].generator();
    data.children.unshift(node);
  }
  return BpmnAdapter.transfer(data, options, isBusiness);
}

function onNodeCreate(node: IGctBpmnNode, parent?, flow?) {
  // 并行分支自动添加聚合节点
  if (node.type === BpmnNodeTypeEnum.BpmnParallel) {
    const { id } = node;
    const cNode = addNextNode(id, BpmnNodeTypeEnum.BpmnJoin, {
      syncDeleteById: id,
    }) as unknown as GctBpmnNode.BpmnJoin;
    const sliceId = id.slice(0, id.lastIndexOf('_fork'));
    cNode.id = sliceId + '_join';
    cNode.data!.key = sliceId + '_join';
  }
  if (node.type === BpmnNodeTypeEnum.BpmnForm) {
    const cnode = addNextNode(
      node.id,
      BpmnNodeTypeEnum.BpmnBusiness,
      {
        syncDeleteById: node.id,
        hidden: true,
      },
      true,
    ) as unknown as GctBpmnNode.BpmnJoin;
    cnode.data!.nextKey = node.id;
    node.data!.prevKey = cnode.id;
  }
  if (
    parent?.type === BpmnNodeTypeEnum.BpmnParallel &&
    node.type === BpmnNodeTypeEnum.BpmnApproval
  ) {
    node.data!.key = `Approval_${parent.id}_${flow.id}_${node.id}`;
    node.id = `Approval_${parent.id}_${flow.id}_${node.id}`;
  }
}

function validateNode(
  node: string | IGctBpmnNode,
  getExtraTips?: Function,
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
  }
  // 针对条件分支的特殊处理
  if (n.type === BpmnNodeTypeEnum.BpmnExclusive || n.type === BpmnNodeTypeEnum.BpmnParallel) {
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
function validate(getExtraTips?: Function): {
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

function toFlowPathNodeIds() {
  console.log('flow--', gctFlowData.value);
  // 所有节点 map
  let bpmnFlowPathNodeIds: any[] = [];
  const bpmnNodes: any[] = [];

  const traverse = (nodes: any[]) => {
    nodes.forEach((node) => {
      bpmnNodes.push(JSON.parse(JSON.stringify(node.data)));
      // 节点包含子 Flow
      if (
        (node.type === BpmnNodeTypeEnum.BpmnExclusive ||
          node.type === BpmnNodeTypeEnum.BpmnParallel) &&
        node.children
      ) {
        const flowPaths: Array<string[]> = node.children.map((item) => {
          // 记录 flow 节点
          return [node.id, item.id, ...(item.children?.map((e) => e.id) || [])];
        });
        bpmnFlowPathNodeIds = bpmnFlowPathNodeIds
          .map((p) => {
            const idx = Array.isArray(p) ? p?.findIndex((e) => e === node.id) : -1;
            return idx > -1
              ? flowPaths.map((fp) => {
                  const list = [...p];
                  list.splice(idx, 1, ...fp);
                  return list;
                })
              : [...p];
          })
          .flat();

        // 去重
        bpmnFlowPathNodeIds = [...new Set(bpmnFlowPathNodeIds)];

        node.children.forEach((item) => {
          traverse(item.children);
        });
      }
    });
  };
  bpmnFlowPathNodeIds.push(gctFlowData.value.children.map((item) => item.id));
  traverse(gctFlowData.value.children);

  console.log('bpmnPaths', bpmnFlowPathNodeIds);
  return { bpmnFlowPathNodeIds, bpmnNodes };
}

function getI18nName(data) {
  const { i18n } = data || {};
  const i18nStr = i18n ? JSON.parse(i18n) : '';
  return i18nStr ? i18nStr.i18nKey : '';
}

export function useGctPaasBpmn() {
  return {
    init,
    addNode,
    resetGctFlowData,
    toJson,
    toBpmnData,
    onNodeCreate,
    validateNode,
    validate,
    toFlowPathNodeIds,
    getI18nName,
  };
}
