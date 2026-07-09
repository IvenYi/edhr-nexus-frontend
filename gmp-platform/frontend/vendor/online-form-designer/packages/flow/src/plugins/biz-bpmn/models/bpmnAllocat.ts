import { defineAsyncComponent } from 'vue';
import type { GctBpmnNode } from '../types/index.d.ts';
import { BpmnNodeTypeEnum } from '../enums';
import { validateName, validateBizOptionConfig } from '../utils/node-validator.ts';
import { randomId } from '../../../utils/NodeGenerator.ts';

const generator = function (opts: Partial<GctBpmnNode.BpmnAllocat> = {}): GctBpmnNode.BpmnAllocat {
  const id = 'Allocat_' + randomId();
  const type = BpmnNodeTypeEnum.BpmnAllocat;
  const node: GctBpmnNode.BpmnAllocat = {
    ...opts,
    id,
    type: BpmnNodeTypeEnum.BpmnAllocat,
    data: {
      key: id,
      name: '配置节点',
      type,
    },
  };
  return node;
};

const bpmnTransformer = function (node: GctBpmnNode.BpmnAllocat): object {
  const { data } = node;
  return {
    tag: 'bpmn:serviceTask',
    attrs: {
      id: data!.key,
      name: data!.name,
      'camunda:expression':
        '${configNodeDelegate.execute(execution,' +
        `'${data!.bizCompId}'` +
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

const nodeView = defineAsyncComponent(() => import('../views/BpmnAllocat.vue'));

const validator = [validateName, validateBizOptionConfig];

export { generator, bpmnTransformer, nodeView, validator };
