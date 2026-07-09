import { defineAsyncComponent } from 'vue';
import type { GctBpmnNode } from '../types/index.d.ts';
import { BpmnNodeTypeEnum } from '../enums';
import { validateName, validateTransactionConfig } from '../utils/node-validator.ts';
import { randomId } from '../../../utils/NodeGenerator.ts';

const generator = function (
  opts: Partial<GctBpmnNode.BpmnTransaction> = {},
): GctBpmnNode.BpmnTransaction {
  const id = 'Trans_' + randomId();
  const type = BpmnNodeTypeEnum.BpmnTransaction;
  const node: GctBpmnNode.BpmnTransaction = {
    ...opts,
    id,
    type: BpmnNodeTypeEnum.BpmnTransaction,
    data: {
      key: id,
      name: '事务节点',
      type,
    },
  };
  return node;
};

const bpmnTransformer = function (node: GctBpmnNode.BpmnTransaction): object {
  const { data } = node;
  return {
    tag: 'bpmn:serviceTask',
    attrs: {
      id: data!.key,
      name: data!.name,
      'camunda:expression':
        '${transactionNodeDelegate.execute(execution,' +
        `'${data!.transactionId}'` +
        ',' +
        `'${data!.interactiveMode || 'sync'}'` +
        ',' +
        `'${data!.key}'` +
        ',' +
        `'${data!.nextKey}'` +
        ')}',
    },
  };
};

const nodeView = defineAsyncComponent(() => import('../views/BpmnTransaction.vue'));

const validator = [validateName, validateTransactionConfig];

export { generator, bpmnTransformer, nodeView, validator };
