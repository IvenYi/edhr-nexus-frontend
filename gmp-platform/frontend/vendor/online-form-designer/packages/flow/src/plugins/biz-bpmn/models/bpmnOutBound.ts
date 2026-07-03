import { defineAsyncComponent } from 'vue';
import type { GctBpmnNode } from '../types';
import { BpmnNodeTypeEnum } from '../enums';
import { validateName, validateBizDoc } from '../utils/node-validator';
import { randomId } from '../../../utils/NodeGenerator';

const generator = function (
  opts: Partial<GctBpmnNode.BpmnOutBound> = {},
): GctBpmnNode.BpmnOutBound {
  const id = 'Outbound_' + randomId();
  const type = BpmnNodeTypeEnum.BpmnOutBound;
  const node: GctBpmnNode.BpmnOutBound = {
    ...opts,
    id,
    type: BpmnNodeTypeEnum.BpmnOutBound,
    data: {
      key: id,
      name: '出库执行',
      type,
    },
  };
  return node;
};

const bpmnTransformer = function (node: GctBpmnNode.BpmnOutBound): object {
  const { data } = node;
  return {
    tag: 'bpmn:serviceTask',
    attrs: {
      id: data!.key,
      name: data!.name,
      'camunda:expression':
        '${outBoundNodeDelegate.execute(execution,' +
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

const nodeView = defineAsyncComponent(() => import('../views/BpmnOutBound.vue'));

const validator = [validateName, validateBizDoc];

export { generator, bpmnTransformer, nodeView, validator };
