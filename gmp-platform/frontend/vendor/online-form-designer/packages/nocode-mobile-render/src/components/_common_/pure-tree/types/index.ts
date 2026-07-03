// 定义树节点类型
export interface IPureTreeNode {
  /** 唯一标识 */
  id: number | string;
  /** 节点名称 */
  name: string;
  /** 是否展开 */
  expanded?: boolean;
  /** 是否被选中 */
  selected?: boolean;
  /** 子节点集合 */
  children?: IPureTreeNode[];
  /** 给自定义的扩充字段用 */
  [key: string]: any;
}
