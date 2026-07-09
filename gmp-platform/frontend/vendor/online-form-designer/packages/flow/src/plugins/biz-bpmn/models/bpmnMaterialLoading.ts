import { defineAsyncComponent } from 'vue';
import type { GctBpmnNode } from '../types';
import { BpmnNodeTypeEnum } from '../enums';
import { validateName, validateLabelRules } from '../utils/node-validator';
import { randomId } from '../../../utils/NodeGenerator';

const generator = function (
  opts: Partial<GctBpmnNode.BpmnMaterialLoading> = {},
): GctBpmnNode.BpmnMaterialLoading {
  const id = 'MLoading_' + randomId();
  const type = BpmnNodeTypeEnum.BpmnMaterialLoading;
  const node: GctBpmnNode.BpmnMaterialLoading = {
    ...opts,
    id,
    type: BpmnNodeTypeEnum.BpmnMaterialLoading,
    data: {
      key: id,
      name: '上料执行',
      type,
    },
  };
  return node;
};

const bpmnTransformer = function (node: GctBpmnNode.BpmnMaterialLoading): object {
  const { data } = node;
  return {
    tag: 'bpmn:serviceTask',
    attrs: {
      id: data!.key,
      name: data!.name,
      'camunda:expression':
        '${materialLoadingNodeDelegate.execute(execution,' +
        `'${data!.labelParsingRules || ''}'` +
        ',' +
        `'${data!.bomInit ? 1 : 0}'` +
        ',' +
        `'${data!.visibleUsers || ''}'` +
        ',' +
        `'${data!.key}'` +
        ',' +
        `'${data!.nextKey}'` +
        ')}',
    },
  };
};

const nodeView = defineAsyncComponent(() => import('../views/BpmnMaterialLoading.vue'));

const validator = [validateName, validateLabelRules];

export { generator, bpmnTransformer, nodeView, validator };
