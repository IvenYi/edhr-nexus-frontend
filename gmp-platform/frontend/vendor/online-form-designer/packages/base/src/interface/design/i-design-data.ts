import { IDesignNode } from './i-design-node';
import { IDesignTreeItem } from './i-design-tree-item';

/**
 * 设计 json
 *
 * @author zhanghanrui
 * @date 2024-07-11 17:07:54
 * @export
 * @interface IDesignData
 */
export interface IDesignData {
  /**
   * 设计界面类型
   *
   * @author zhanghanrui
   * @date 2024-10-12 09:10:39
   * @type {string}
   */
  type: string;

  /**
   * 页面节点
   *
   * @author zhanghanrui
   * @date 2024-07-24 10:07:39
   * @type {IDesignNode<any> | null}
   */
  pageNode: IDesignNode<any> | null;

  /**
   * 设计元素节点
   *
   * @author zhanghanrui
   * @date 2024-07-11 17:07:01
   * @type {IDesignNode[]}
   */
  nodes: IDesignNode[];

  /**
   * 层级树
   *
   * @author zhanghanrui
   * @date 2024-08-20 10:08:11
   * @type {IDesignTreeItem[]}
   */
  tree: IDesignTreeItem[];
}
