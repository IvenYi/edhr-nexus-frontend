import { defineAsyncComponent } from 'vue';
import type { GctBpmnNode } from '../types/index';
import { BpmnNodeTypeEnum } from '../enums/index.ts';
// import { validateConnector } from '../utils/node-validator.ts';
import { randomId } from '../../../utils/NodeGenerator.ts';

const generator = function (
  opts: Partial<GctBpmnNode.BpmnConnector> = {},
): GctBpmnNode.BpmnConnector {
  const id = 'CON' + randomId(13);
  const type = BpmnNodeTypeEnum.BpmnConnector;
  const node: GctBpmnNode.BpmnConnector = {
    ...opts,
    id,
    type: BpmnNodeTypeEnum.BpmnConnector,
    data: {
      key: id,
      bizData: {
        nodeId: id,
      },
      ...opts.data,
      type,
    },
  };
  return node;
};

const bpmnTransformer = function (node: GctBpmnNode.BpmnConnector): object {
  const { data } = node;
  return {
    // tag: 'bpmn:userTask',
    attrs: {
      id: data!.key,
      name: data!.name,
    },
  };
};

const nodeView = defineAsyncComponent(
  () => import('@gct/flow/src/plugins/ipaas-bpmn/views/Connector.vue'),
);

const validator = [];

export { generator, bpmnTransformer, nodeView, validator };
