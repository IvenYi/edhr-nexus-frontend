import { defineAsyncComponent } from 'vue';
import type { GctBpmnNode } from '../types/index.d.ts';
import { BpmnNodeTypeEnum } from '../enums';
import { validateName, validateLabelPrintNode } from '../utils/node-validator.ts';
import { randomId } from '../../../utils/NodeGenerator.ts';
import { pick } from 'lodash-es';
import { Base64 } from 'js-base64';

const generator = function (
  opts: Partial<GctBpmnNode.BpmnLabelPrint> = {},
): GctBpmnNode.BpmnLabelPrint {
  const id = 'Printer_' + randomId();
  const type = BpmnNodeTypeEnum.BpmnLabelPrint;
  const node: GctBpmnNode.BpmnLabelPrint = {
    ...opts,
    id,
    type: BpmnNodeTypeEnum.BpmnLabelPrint,
    data: {
      key: id,
      name: '标签打印',
      type,
    },
  };
  return node;
};

const bpmnTransformer = function (node: GctBpmnNode.BpmnLabelPrint): object {
  const { data } = node;
  const config = JSON.stringify(
    pick(data, ['printTmplId', 'printService', 'printNumber', 'templateType']),
  );
  return {
    tag: 'bpmn:serviceTask',
    attrs: {
      id: data!.key,
      name: data!.name,
      'camunda:expression':
        '${labelPrintNodeDelegate.execute(execution,' +
        `'${Base64.encode(config)}'` +
        ',' +
        `'${data!.key}'` +
        ',' +
        `'${data!.nextKey}'` +
        ')}',
    },
  };
};

const nodeView = defineAsyncComponent(() => import('../views/BpmnLabelPrint.vue'));

const validator = [validateName, validateLabelPrintNode];

export { generator, bpmnTransformer, nodeView, validator };
