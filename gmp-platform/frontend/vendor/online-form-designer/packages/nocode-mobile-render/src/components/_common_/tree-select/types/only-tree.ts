/** 树节点接口 */
export interface TreeNode {
  id: string;
  name: string;
  children?: TreeNode[];
  /** 禁用，即不能选择 */
  disabled?: boolean;
  [key: string]: any;
}
