import { ComponentPublicInstance } from 'vue';
import { OutlineTreeNode } from '/@/projects/online-form/src/views/designer/hooks/useEDHRWiki';

/**
 * 目录配置树节点数据接口(包含UI状态属性)
 * @author lingxiaoming
 * @date 2024-07-24 11:35:24
 * @export
 * @interface OutlineTreeNode
 * @extends {ITreeNode}
 */
export interface OutlineConfigureTreeNode extends OutlineTreeNode {
  /**
   * 是否开启编辑
   * @author lingxiaoming
   * @date 2024-07-24 07:36:16
   * @type {boolean}
   */
  isEdit?: boolean;
}

/**
 * 目录树选择选项数据接口(只有目录,没有表单)
 * @interface OutlineSelectTreeNode
 */
export interface OutlineSelectTreeNode {
  children?: OutlineSelectTreeNode[];
  /**
   * 选项值(目录id)
   * @type {string}
   */
  value: string;
  /**
   * 目录名称
   * @type {string}
   */
  label: string;
}

export declare type EdhrOutlineConfigureTreeInstance = ComponentPublicInstance<
  {},
  {
    /**
     * 添加目录
     */
    newOutline: () => void;
    /**
     * 删除
     */
    remove: () => void;
    /**
     * 折叠所有
     */
    collapseAll: () => void;
    /**
     * 展开所有
     */
    expandAll: () => void;
  }
>;
