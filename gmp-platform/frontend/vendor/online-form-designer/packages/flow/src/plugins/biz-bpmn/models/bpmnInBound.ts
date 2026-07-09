import { defineAsyncComponent } from 'vue';
import type { GctBpmnNode } from '../types';
import { BpmnNodeTypeEnum } from '../enums';
import { validateName, validateBizDoc } from '../utils/node-validator';
import { randomId } from '../../../utils/NodeGenerator';

const generator = function (opts: Partial<GctBpmnNode.BpmnInBound> = {}): GctBpmnNode.BpmnInBound {
  const id = 'Inbound_' + randomId();
  const type = BpmnNodeTypeEnum.BpmnInBound;
  const node: GctBpmnNode.BpmnInBound = {
    ...opts,
    id,
    type: BpmnNodeTypeEnum.BpmnInBound,
    data: {
      key: id,
      name: '入库执行',
      type,
    },
  };
  return node;
};

const bpmnTransformer = function (node: GctBpmnNode.BpmnInBound): object {
  const { data } = node;
  return {
    tag: 'bpmn:serviceTask',
    attrs: {
      id: data!.key,
      name: data!.name,
      'camunda:expression':
        '${inBoundNodeDelegate.execute(execution,' +
        `'${data!.onlineFormTmplId}'` +
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

const nodeView = defineAsyncComponent(() => import('../views/BpmnInBound.vue'));

const validator = [validateName, validateBizDoc];

export { generator, bpmnTransformer, nodeView, validator };
