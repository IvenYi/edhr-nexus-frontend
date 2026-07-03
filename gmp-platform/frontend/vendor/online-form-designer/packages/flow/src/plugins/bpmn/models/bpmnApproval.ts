import { defineAsyncComponent } from 'vue';
import type { GctBpmnNode } from '../types/index.d.ts';
import { BpmnNodeTypeEnum, OpinionTypeEnum, ApproveWayEnum } from '../enums';
import { randomId } from '../../../utils/NodeGenerator.ts';
import {
  validateName,
  validateTargetUserConfig,
  validateOpinionType,
  validateEvents,
  validateButtonConfig,
} from '../utils/node-validator.ts';

const generator = function (
  opts: Partial<GctBpmnNode.BpmnApproval> = {},
): GctBpmnNode.BpmnApproval {
  const id = 'Approval' + '_' + randomId();
  const type = BpmnNodeTypeEnum.BpmnApproval;
  const node: GctBpmnNode.BpmnApproval = {
    ...opts,
    id,
    type,
    data: {
      key: id,
      name: '审批节点',
      type,
      approveWay: ApproveWayEnum.Competitive,
    },
  };
  return node;
};

const bpmnTransformer = function (node: GctBpmnNode.BpmnApproval): object {
  const { key, name, targetUserConfig } = node.data!;
  return {
    tag: 'bpmn:userTask',
    attrs: {
      id: key,
      name,
      'camunda:assignee': '${assignee}',
    },
    children: [
      {
        tag: 'bpmn:multiInstanceLoopCharacteristics',
        attrs: {
          isSequential: false,
          'camunda:collection':
            "${processUserService.exchangeUserByRangeUsers(execution,'" +
            (targetUserConfig ?? '') +
            "')}",
          'camunda:elementVariable': 'assignee',
        },
        children: [
          {
            tag: 'bpmn:completionCondition',
            text: '${nrOfCompletedInstances == 1}',
          },
        ],
      },
    ],
  };
};

const nodeView = defineAsyncComponent(() => import('../views/BpmnApproval.vue'));

const validator = [
  validateName,
  validateTargetUserConfig,
  validateOpinionType,
  validateEvents,
  validateButtonConfig,
];

export { generator, bpmnTransformer, nodeView, validator };
