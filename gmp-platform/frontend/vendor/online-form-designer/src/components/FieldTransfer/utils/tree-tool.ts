import type {
  ColumnItem,
  FieldItem,
  TreeNodeGroup,
  TreeNode,
  ColumnsChange,
} from '../types/index.d';

export function isGroupNode(node: TreeNode): node is TreeNodeGroup {
  return node.type === 'group';
}

export function generateData(nodes: TreeNode[]): ColumnItem[] {
  return nodes.map((node) => {
    if (isGroupNode(node)) {
      return {
        width: node.width,
        id: node.key,
        title: node.title,
        type: node.type,
        children: generateData(node.children || []),
      };
    }
    return {
      width: node.width,
      id: node.key,
      title: node.title,
      type: node.type,
      modelKey: node.modelKey,
    };
  });
}

export function traverse(handler: (node: TreeNode) => void, items: TreeNode[]) {
  items.forEach((node) => {
    handler(node);
    if (isGroupNode(node)) {
      traverse(handler, node.children);
    }
  });
}

export function findNode(key: string, root: TreeNodeGroup) {
  let result: TreeNode | undefined;
  const handler = (items: TreeNode[]): boolean => {
    return items.some((node) => {
      if (node.key === key) {
        result = node;
        return true;
      }
      if (isGroupNode(node)) {
        return handler(node.children);
      }
      return false;
    });
  };
  if (root.key === key) {
    return root;
  }
  handler(root.children);
  return result;
}

export function traverseFilter(handler: (node: TreeNode) => boolean, items: TreeNode[]) {
  const result: TreeNode[] = [];
  items.forEach((node) => {
    if (isGroupNode(node)) {
      const children = traverseFilter(handler, node.children);
      if (children.length === 0 && !handler(node)) {
        return;
      }
      result.push({
        ...node,
        children,
      });
      return;
    }
    if (handler(node)) {
      result.push(node);
    }
  });
  return result;
}
