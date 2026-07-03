import { defineAsyncComponent } from 'vue';
import type { GctBpmnNode } from '../types/index.d.ts';
import { BpmnNodeTypeEnum } from '../enums';
import {
  generator as _generator,
  bpmnTransformer as _bpmnTransformer,
  validator,
} from './bpmnApproval.ts';

const generator = function (opts: Partial<GctBpmnNode.BpmnJudge> = {}): GctBpmnNode.BpmnJudge {
  const node = _generator(opts as any) as unknown as GctBpmnNode.BpmnJudge;
  node.type = BpmnNodeTypeEnum.BpmnJudge;
  node.allowNext = false; // 判断节点后续节点的创建由内置网关完成
  node.data!.name = '判断节点';
  node.data!.type = BpmnNodeTypeEnum.BpmnJudge;
  return node;
};

const bpmnTransformer = function (node: GctBpmnNode.BpmnJudge): object {
  return _bpmnTransformer(node as any);
};

const nodeView = defineAsyncComponent(() => import('../views/BpmnJudge.vue'));

export { generator, bpmnTransformer, nodeView, validator };
