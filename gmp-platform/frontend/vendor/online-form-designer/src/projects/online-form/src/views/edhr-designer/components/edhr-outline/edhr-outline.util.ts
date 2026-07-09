import { OutlineSelectTreeNode } from './type';
import { OutlineTreeNode } from '/@/projects/online-form/src/views/designer/hooks/useEDHRWiki';
import { findRecursiveChild } from '/@/utils/recursive';

/**
 * 转换格式,变成树选择用的格式,排除非目录的节点
 * @author lingxiaoming
 * @date 2024-07-23 02:50:37
 * @export
 * @param {OutlineTreeNode[]} nodes
 * @return {*}  {OutlineSelectTreeNode[]}
 */
export function getParentOutlines(nodes: OutlineTreeNode[]): OutlineSelectTreeNode[] {
  const result: OutlineSelectTreeNode[] = [];
  nodes.forEach((node) => {
    if (node.type !== 'OUTLINE') {
      return;
    }
    const item: OutlineSelectTreeNode = {
      value: node.key,
      label: node.title,
    };
    // 递归子节点
    if (node.children) {
      item.children = getParentOutlines(node.children);
    }
    result.push(item);
  });

  return result;
}

/**
 * 找到对应的目录节点数据
 * @author lingxiaoming
 * @date 2024-07-24 07:19:54
 * @param {OutlineTreeNode[]} treeData
 * @param {string} key
 * @return {*}
 */
export function findOutlineNode(treeData: OutlineTreeNode[], key: string) {
  const find = findRecursiveChild<OutlineTreeNode>(treeData, key, { compareField: 'key' });
  return find?.child ? { parent: find.parent, node: find.child } : undefined;
}
