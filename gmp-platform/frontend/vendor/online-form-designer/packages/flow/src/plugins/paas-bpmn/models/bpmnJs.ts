import { defineAsyncComponent } from 'vue';
import type { GctBpmnNode } from '../types/index.d.ts';
import { BpmnNodeTypeEnum } from '../enums';
import { validateName, validateService } from '../utils/node-validator.ts';
import { randomId } from '../../../utils/NodeGenerator.ts';

const generator = function (opts: Partial<GctBpmnNode.BpmnJs> = {}): GctBpmnNode.BpmnJs {
  const id = 'Activity' + '_' + randomId();
  const type = BpmnNodeTypeEnum.BpmnJs;
  const node: GctBpmnNode.BpmnJs = {
    ...opts,
    id,
    type,
    data: {
      key: id,
      name: '脚本节点',
      type,
    },
  };
  return node;
};

const bpmnTransformer = function (node: GctBpmnNode.BpmnJs): object {
  const { data } = node;
  return {
    tag: 'bpmn:serviceTask',
    attrs: {
      id: data!.key,
      name: data!.name,
      'camunda:expression': '${scriptTaskDelegate.execute(execution,' + `'${data!.key}'` + ')}',
    },
  };
};

const nodeView = defineAsyncComponent(() => import('../views/BpmnJs.vue'));

const validator = [validateName, validateService];

export { generator, bpmnTransformer, nodeView, validator };
