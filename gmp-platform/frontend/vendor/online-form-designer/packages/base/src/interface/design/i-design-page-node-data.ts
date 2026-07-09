import { IDesignNodeData } from './i-design-node-data';

/**
 * 设计界面节点
 *
 * @author zhanghanrui
 * @date 2024-07-24 10:07:27
 * @export
 * @interface IDesignPageNode
 * @extends {IDesignNode}
 */
export interface IDesignPageNodeData extends IDesignNodeData {
  background: string;

  padding: string;

  headerBgColor?: boolean;
}
