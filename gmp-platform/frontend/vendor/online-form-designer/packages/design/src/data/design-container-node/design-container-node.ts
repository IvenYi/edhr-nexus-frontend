import { IDesignContainerNode, IDesignNodeData } from '@gct/base';
import { DesignNode } from '../design-node/design-node';

/**
 * 容器节点
 *
 * @author zhanghanrui
 * @date 2024-07-12 13:07:01
 * @export
 * @abstract
 * @class DesignContainerNode
 * @extends {DesignNode<T>}
 * @template T
 */
export abstract class DesignContainerNode<T extends IDesignNodeData = IDesignNodeData>
  extends DesignNode<T>
  implements IDesignContainerNode<T> {}
