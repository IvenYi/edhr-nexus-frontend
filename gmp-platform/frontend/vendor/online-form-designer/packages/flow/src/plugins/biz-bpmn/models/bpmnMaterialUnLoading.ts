import { defineAsyncComponent } from 'vue';
import type { GctBpmnNode } from '../types';
import { BpmnNodeTypeEnum } from '../enums';
import { validateName, validateBizDoc } from '../utils/node-validator';
import { randomId } from '../../../utils/NodeGenerator';

const generator = function (
  opts: Partial<GctBpmnNode.BpmnMaterialUnLoading> = {},
): GctBpmnNode.BpmnMaterialUnLoading {
  const id = 'MUnloading_' + randomId();
  const type = BpmnNodeTypeEnum.BpmnMaterialUnLoading;
  const node: GctBpmnNode.BpmnMaterialUnLoading = {
    ...opts,
    id,
    type: BpmnNodeTypeEnum.BpmnMaterialUnLoading,
    data: {
      key: id,
      name: '下料执行',
      type,
    },
  };
  return node;
};

const bpmnTransformer = function (node: GctBpmnNode.BpmnMaterialUnLoading): object {
  const { data } = node;
  return {
    tag: 'bpmn:serviceTask',
    attrs: {
      id: data!.key,
      name: data!.name,
      'camunda:expression':
        '${materialUnLoadingNodeDelegate.execute(execution,' +
        `'${data!.visibleUsers || ''}'` +
        ',' +
        `'${data!.key}'` +
        ',' +
        `'${data!.nextKey}'` +
        ')}',
    },
  };
};

const nodeView = defineAsyncComponent(() => import('../views/BpmnMaterialUnLoading.vue'));

const validator = [validateName, validateBizDoc];

export { generator, bpmnTransformer, nodeView, validator };
