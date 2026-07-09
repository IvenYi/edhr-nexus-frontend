import { IDesignNode } from './i-design-node';
import { IDesignNodeData } from './i-design-node-data';

/**
 * 容器节点
 *
 * @author zhanghanrui
 * @date 2024-07-12 17:07:56
 * @export
 * @interface IDesignContainerNode
 * @extends {IDesignNode<T>}
 * @template T
 */
export type IDesignContainerNode<T extends IDesignNodeData = IDesignNodeData> = IDesignNode<T>;
