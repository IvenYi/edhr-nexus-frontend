import { defineAsyncComponent } from 'vue';
import type { GctBpmnNode } from '../types/index.d.ts';
import { ApproveWayEnum, BpmnNodeTypeEnum, ButtonTypeEnum, OpinionTypeEnum } from '../enums';
import { randomId } from '../../../utils/NodeGenerator.ts';
import { validateName, validateOpinionType } from '../utils/node-validator.ts';

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
      ...opts.data,
      type,
      opinionConfig: {
        enabled: true,
        opinionType: [OpinionTypeEnum.Required],
      },
    },
  };
  return node;
};

const bpmnTransformer = function (node: GctBpmnNode.BpmnApproval): object {
  const { key, name, approveWay, buttonConfig } = node.data!;
  const rejectBtn = buttonConfig?.find((e) => e.type === ButtonTypeEnum.Reject);
  return {
    tag: 'bpmn:userTask',
    attrs: {
      id: key,
      name,
      'camunda:assignee': '${assignee}',
    },
    children: [
      {
        tag: 'bpmn:extensionElements',
        children: [
          {
            tag: 'camunda:field',
            attrs: {
              name: 'REJECT_TO_NODE',
              stringValue: rejectBtn?.dismissTo,
            },
          },
          {
            tag: 'camunda:field',
            attrs: {
              name: 'REJECT_APPROVE_TYPE',
              stringValue: rejectBtn?.dismissRule,
            },
          },
        ],
      },
      {
        tag: 'bpmn:multiInstanceLoopCharacteristics',
        attrs: {
          isSequential: false,
          'camunda:collection': '${approveUserDelegate.execute(execution, ' + `'${key}'` + ')}',
          'camunda:elementVariable': 'assignee',
        },
        children: [
          {
            tag: 'bpmn:completionCondition',
            text:
              '${nrOfCompletedInstances == ' +
              (approveWay !== ApproveWayEnum.ApprovedByAll ? 1 : 'nrOfInstances') +
              '}',
          },
        ],
      },
    ],
  };
};

const nodeView = defineAsyncComponent(() => import('../views/BpmnApproval.vue'));

const validator = [validateName, validateOpinionType];

export { generator, bpmnTransformer, nodeView, validator };
