import { BpmnNodeTypeEnum } from '../enums';
import { GctBpmnNode } from '../types';
import { nodeView, validator } from './bpmnEnd.ts';

const generator = function (
  opts: Partial<GctBpmnNode.BpmnEndWithListener> = {},
): GctBpmnNode.BpmnEndWithListener {
  const id = '__end__';
  const type = BpmnNodeTypeEnum.BpmnEndWithListener;
  const node: GctBpmnNode.BpmnEndWithListener = {
    ...opts,
    id,
    type,
    data: {
      key: id,
      name: '结束',
      type,
    },
  };
  return node;
};
const bpmnTransformer = function (node: GctBpmnNode.BpmnEndWithListener): object {
  const { data } = node;
  return {
    tag: 'bpmn:endEvent',
    attrs: {
      id: data!.key,
      name: data!.name,
    },
    children: [
      {
        tag: 'bpmn:extensionElements',
        children: [
          {
            tag: 'camunda:executionListener',
            attrs: {
              expression: '${edhrEndTaskListener.notify(execution)}',
              event: 'end',
            },
          },
        ],
      },
      {
        tag: 'bpmn:incoming',
        text: data!.key,
      },
    ],
  };
};

export { generator, bpmnTransformer, nodeView, validator };
