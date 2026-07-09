import { defineAsyncComponent } from 'vue';
import type { GctBpmnNode } from '../types';
import { BpmnNodeTypeEnum } from '../enums';
import { validateName, validateBizDoc } from '../utils/node-validator';
import { randomId } from '../../../utils/NodeGenerator';

const generator = function (opts: Partial<GctBpmnNode.BpmnRelease> = {}): GctBpmnNode.BpmnRelease {
  const id = 'Release_' + randomId();
  const type = BpmnNodeTypeEnum.BpmnRelease;
  const node: GctBpmnNode.BpmnRelease = {
    ...opts,
    id,
    type: BpmnNodeTypeEnum.BpmnRelease,
    data: {
      key: id,
      name: '放行执行',
      type,
    },
  };
  return node;
};

const bpmnTransformer = function (node: GctBpmnNode.BpmnRelease): object {
  const { data } = node;
  return {
    tag: 'bpmn:serviceTask',
    attrs: {
      id: data!.key,
      name: data!.name,
      'camunda:expression':
        '${releaseNodeDelegate.execute(execution,' +
        `'${data!.visibleUsers || ''}'` +
        ',' +
        `'${data!.key}'` +
        ',' +
        `'${data!.nextKey}'` +
        ')}',
    },
  };
};

const nodeView = defineAsyncComponent(() => import('../views/BpmnRelease.vue'));

const validator = [validateName];

export { generator, bpmnTransformer, nodeView, validator };
