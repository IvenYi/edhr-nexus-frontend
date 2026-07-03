import { defineAsyncComponent } from 'vue';
import type { GctBpmnNode } from '../types';
import { BpmnNodeTypeEnum } from '../enums';
import { validateName, validateBizDoc } from '../utils/node-validator';
import { randomId } from '../../../utils/NodeGenerator';

const generator = function (
  opts: Partial<GctBpmnNode.BpmnInspection> = {},
): GctBpmnNode.BpmnInspection {
  const id = 'Insp_' + randomId();
  const type = BpmnNodeTypeEnum.BpmnInspection;
  const node: GctBpmnNode.BpmnInspection = {
    ...opts,
    id,
    type: BpmnNodeTypeEnum.BpmnInspection,
    data: {
      key: id,
      name: '检验执行',
      type,
    },
  };
  return node;
};

const bpmnTransformer = function (node: GctBpmnNode.BpmnInspection): object {
  const { data } = node;
  return {
    tag: 'bpmn:serviceTask',
    attrs: {
      id: data!.key,
      name: data!.name,
      'camunda:expression':
        '${inspectionNodeDelegate.execute(execution,' +
        `'${data!.visibleUsers || ''}'` +
        ',' +
        `'${data!.key}'` +
        ',' +
        `'${data!.nextKey}'` +
        ')}',
    },
  };
};

const nodeView = defineAsyncComponent(() => import('../views/BpmnInspection.vue'));

const validator = [validateName];

export { generator, bpmnTransformer, nodeView, validator };
