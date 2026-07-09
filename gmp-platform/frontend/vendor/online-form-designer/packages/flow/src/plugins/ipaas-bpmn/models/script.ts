import { defineAsyncComponent } from 'vue';
import type { GctBpmnNode } from '../types/index';
import { BpmnNodeTypeEnum } from '../enums/index.ts';
// import { validateConnector } from '../utils/node-validator.ts';
import { randomId } from '../../../utils/NodeGenerator.ts';

const generator = function (opts: Partial<GctBpmnNode.BpmnScript> = {}): GctBpmnNode.BpmnScript {
  const id = 'SCR' + randomId(13);
  const type = BpmnNodeTypeEnum.BpmnScript;
  const node: GctBpmnNode.BpmnScript = {
    ...opts,
    id,
    type: BpmnNodeTypeEnum.BpmnScript,
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

const bpmnTransformer = function (node: GctBpmnNode.BpmnScript): object {
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
  () => import('@gct/flow/src/plugins/ipaas-bpmn/views/script.vue'),
);

const validator = [];

export { generator, bpmnTransformer, nodeView, validator };
