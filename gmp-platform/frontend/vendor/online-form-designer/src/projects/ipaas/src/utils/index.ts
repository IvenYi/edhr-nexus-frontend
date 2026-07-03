import { cloneDeep } from 'lodash-es';
/**
 * 指定位数的随机字符串
 * @param length
 * @returns
 */
export function randomString(length: number = 8, prefix: string = 'node'): string {
  let result = prefix + Math.random().toString(36).substring(2, 10);
  while (result.length < length) {
    result += Math.random().toString(36).substring(2, 10);
  }
  return result.substring(0, length);
}

function findNodeByKeyword(node: any, keyword: string, hitKeys: string[]) {
  // 如果当前节点的 name 匹配，则返回整个节点
  if (node._name_.includes(keyword)) {
    hitKeys.push(node._key_);
    return node;
  }

  // 遍历所有子节点并递归查找
  if (node.children && node.children.length > 0) {
    const result: any[] = [];
    for (let i = 0; i < node.children.length; i++) {
      const target = findNodeByKeyword(node.children[i], keyword, hitKeys);
      target && result.push(target);
    }
    if (result.length > 0) {
      return {
        ...node,
        children: result,
      };
    }
  }

  // 如果没有匹配项，返回 null
  return null;
}

export function findNodeInTree(tree: any[], keyword: string) {
  const result: any[] = [];
  const hitKeys: any[] = [];
  const treeCopy = cloneDeep(tree);
  for (let i = 0; i < treeCopy.length; i++) {
    const target = findNodeByKeyword(treeCopy[i], keyword, hitKeys);
    target && result.push(target);
  }
  return {
    tree: result,
    hitKeys,
  };
}
