import { AntTreeNodeDropEvent } from 'ant-design-vue/es/tree';
import { ITreeNode, TreeExDropEvent } from './type';
import { findRecursiveChild } from '/@/utils/recursive';
import { SlotsType } from 'vue';

export const TreeExEmits = {
  ['update:selectedKeys']: (_val: string[]) => true,
  ['update:checkedKeys']: (_val: string[]) => true,
  ['update:expandedKeys']: (_val: string[]) => true,
  drop: (event: TreeExDropEvent) => !!event,
};

export const TreeSlots = {} as SlotsType<{
  title: { node: ITreeNode };
}>;

/**
 * 找到对应的树节点和父节点信息
 * @author lingxiaoming
 * @date 2024-07-23 04:35:47
 * @param {ITreeNode[]} treeData
 * @param {string} key
 */
export function findNodeInfoByKey(treeData: ITreeNode[], key: string) {
  const find = findRecursiveChild<ITreeNode>(treeData, key, { compareField: 'key' });
  return find?.child ? { parent: find.parent, node: find.child } : undefined;
}

/**
 * 转换ant-tree的drop事件
 * @author lingxiaoming
 * @date 2024-07-22 05:52:23
 * @param {AntTreeNodeDropEvent} info
 * @param {ITreeNode[]} treeData 所有的树节点数据
 * @return {*}  {TreeExDropEvent}
 */
export function transferToDropInfo(
  info: AntTreeNodeDropEvent,
  treeData: ITreeNode[],
): TreeExDropEvent {
  const { dragNode, node, dropPosition, dropToGap, event } = info;
  const drag = findNodeInfoByKey(treeData, dragNode.dataRef!.key as string);
  const dragData = drag!.node;
  const beforeParent = drag?.parent;
  const beforeIndex = Number(dragNode.pos!.split('-').pop());
  const beforeArr = beforeParent ? beforeParent.children || [] : treeData;

  const drop = findNodeInfoByKey(treeData, node.dataRef!.key as string);
  const afterParent = dropToGap ? drop?.parent : drop?.node;
  const nodeIndex = Number(node.pos!.split('-').pop());
  let afterIndex = 0;
  switch (dropPosition - nodeIndex) {
    // 表示拖拽到元素上
    case 0:
      afterIndex = 0;
      break;
    // 表示拖拽到元素下
    case 1:
      afterIndex = nodeIndex + 1;
      break;
    case -1:
      afterIndex = nodeIndex;
      break;
    default:
      break;
  }
  const afterArr = afterParent ? afterParent.children || [] : treeData;

  return {
    event: event as DragEvent,
    dragNode: dragData,
    before: {
      parent: beforeParent,
      index: beforeIndex,
      arr: beforeArr,
      prevNode: beforeArr[beforeIndex - 1],
      nextNode: beforeArr[beforeIndex + 1],
    },
    after: {
      parent: afterParent,
      index: afterIndex,
      arr: afterArr,
      prevNode: afterArr[afterIndex - 1],
      nextNode: afterArr[afterIndex],
    },
  };
}
