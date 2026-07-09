import { defineAsyncComponent } from 'vue';
import type { GctBpmnNode } from '../types/index.d.ts';
import { BpmnNodeTypeEnum } from '../enums';
import { validateName, validateBizDoc } from '../utils/node-validator.ts';
import { randomId } from '../../../utils/NodeGenerator.ts';

const generator = function (
  opts: Partial<GctBpmnNode.BpmnBizDocument> = {},
): GctBpmnNode.BpmnBizDocument {
  const id = 'Activity_' + randomId();
  const type = BpmnNodeTypeEnum.BpmnBizDocument;
  const node: GctBpmnNode.BpmnBizDocument = {
    ...opts,
    id,
    type: BpmnNodeTypeEnum.BpmnBizDocument,
    data: {
      key: id,
      name: '表单节点',
      type,
    },
  };
  return node;
};

const bpmnTransformer = function (node: GctBpmnNode.BpmnBizDocument): object {
  const { data } = node;
  return {
    tag: 'bpmn:serviceTask',
    attrs: {
      id: data!.key,
      name: data!.name,
      'camunda:expression':
        '${formNodeDelegate.execute(execution,' +
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

const nodeView = defineAsyncComponent(() => import('../views/BpmnBizDocument.vue'));

const validator = [validateName, validateBizDoc];

export { generator, bpmnTransformer, nodeView, validator };
