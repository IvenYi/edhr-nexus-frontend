import { ComponentPublicInstance } from 'vue';

export type ITreeNode = {
  key: string;
  title: string;
  children?: ITreeNode[];
  /**
   * 是否可选择
   */
  selectable?: boolean;
  [k: string]: any;
};

export interface TreeExDropEvent {
  event: DragEvent;
  dragNode: ITreeNode;
  /**
   * 拖拽前
   * @type {({
   *     parent: ITreeNode | undefined; 父节点
   *     index: number; 拖拽节点在父节点中的索引
   *     arr: ITreeNode[]; 节点所在的数组集合
   *     prevNode: ITreeNode | undefined; 节点的前一个节点
   *     nextNode: ITreeNode | undefined; 节点的后一个节点
   *   })}
   */
  before: {
    parent: ITreeNode | undefined;
    index: number;
    arr: ITreeNode[];
    prevNode: ITreeNode | undefined;
    nextNode: ITreeNode | undefined;
  };
  /**
   * 拖拽后
   * @type {({
   *     parent: ITreeNode | undefined; 父节点
   *     index: number; 拖拽节点在父节点中的索引
   *     arr: ITreeNode[]; 节点所在的数组集合
   *     prevNode: ITreeNode | undefined; 节点的前一个节点
   *     nextNode: ITreeNode | undefined; 节点的后一个节点
   *   })}
   */
  after: {
    parent: ITreeNode | undefined;
    index: number;
    arr: ITreeNode[];
    prevNode: ITreeNode | undefined;
    nextNode: ITreeNode | undefined;
  };
}

export declare type TreeExExpose = {
  /**
   * 折叠所有
   */
  collapseAll: () => void;
  /**
   * 展开所有
   */
  expandAll: () => void;

  /**
   * 触发某个节点的展开收起
   * @author lingxiaoming
   * @date 2024-07-31 10:32:28
   * @param {string} key 节点标识
   * @param {boolean} isExpand 是否展开
   */
  expandNode(key: string, isExpand?: boolean): void;
};

export declare type TreeExInstance = ComponentPublicInstance<{}, TreeExExpose>;
