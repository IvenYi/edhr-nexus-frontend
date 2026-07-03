import { TreeNode } from './only-tree';

export interface SelectTreeNode extends TreeNode {
  children?: SelectTreeNode[];
}
