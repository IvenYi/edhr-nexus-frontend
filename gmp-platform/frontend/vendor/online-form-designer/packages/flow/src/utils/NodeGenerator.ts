import { FlowNodeTypeEnum } from '../enums';
import type { GctFlowNode } from '../types';

export function randomId(length: number = 8): string {
  let result = Math.random().toString(36).substring(2, 10);
  while (result.length < length) {
    result += Math.random().toString(36).substring(2, 10);
  }
  return result.substring(0, length);
}

export default class NodeGenerator {
  static [FlowNodeTypeEnum.Flow](opts: Partial<GctFlowNode.Flow> = {}): GctFlowNode.Flow {
    return {
      ...opts,
      id: FlowNodeTypeEnum.Flow + randomId(),
      type: FlowNodeTypeEnum.Flow,
      children: [],
    };
  }

  static [FlowNodeTypeEnum.App](opts: Partial<GctFlowNode.App> = {}): GctFlowNode.App {
    return {
      ...opts,
      id: FlowNodeTypeEnum.App + randomId(),
      type: FlowNodeTypeEnum.App,
    };
  }

  // static [FlowNodeTypeEnum.Condition](opts: NodeParams = {}): GctFlowNode.Condition {
  //   return {
  //     id: uuid(undefined,FlowNodeTypeEnum.Condition),
  //     ...opts,
  //     type: FlowNodeTypeEnum.Condition,
  //   };
  // }

  // static [FlowNodeTypeEnum.End](opts: NodeParams = {}): GctFlowNode.End {
  //   const node: GctFlowNode.End = {
  //     id: uuid(undefined,FlowNodeTypeEnum.End),
  //     ...opts,
  //     type: FlowNodeTypeEnum.End,
  //   };
  //   return node;
  // }

  // static [FlowNodeTypeEnum.Loop](opts: NodeParams = {}): GctFlowNode.Loop {
  //   const id = uuid(undefined,FlowNodeTypeEnum.Loop);
  //   const node: GctFlowNode.Loop = {
  //     id,
  //     ...opts,
  //     type: FlowNodeTypeEnum.Loop,
  //     children: [
  //       {
  //         id: uuid(undefined,FlowNodeTypeEnum.Flow),
  //         type: FlowNodeTypeEnum.Flow,
  //         parentId: uuid,
  //         children: [],
  //       },
  //     ],
  //   };
  //   return node;
  // }

  // static [FlowNodeTypeEnum.Switch](opts: NodeParams = {}): GctFlowNode.Switch {
  //   const uuid = _uuid(FlowNodeTypeEnum.Switch);
  //   const flowIf = NodeGenerator[FlowNodeTypeEnum.Flow]();
  //   flowIf.children.push(
  //     NodeGenerator[FlowNodeTypeEnum.Condition](),
  //     NodeGenerator[FlowNodeTypeEnum.App](),
  //   );
  //   const flowElse = NodeGenerator[FlowNodeTypeEnum.Flow]();
  //   /**
  //    * else节点无法删除
  //    */
  //   flowElse.children.push(NodeGenerator[FlowNodeTypeEnum.Condition]({ allowDelete: false }));
  //   const node: GctFlowNode.Switch = {
  //     id: uuid,
  //     ...opts,
  //     type: FlowNodeTypeEnum.Switch,
  //     children: [flowIf, flowElse],
  //   };

  //   return node;
  // }
}
