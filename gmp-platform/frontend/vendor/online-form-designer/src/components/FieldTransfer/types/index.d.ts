import { FIELD_TYPE } from '/@/enums/appEnum';

/** 字段信息 */
export type FieldItem = {
  /** id */
  id: string;
  /** 所属模型key */
  modelKey: string;
  /** 字段名称 */
  displayLabel: string;
  /** 字段类型 */
  type: FIELD_TYPE;
  /** 是否禁用 */
  disabled: boolean;
  /** 是否隐藏 */
  hidden?: boolean;
};

/** 树形信息 */
export type ColumnItem = {
  id: string;
  title: string;
  width?: number;
  type: 'group' | 'field';
  children?: ColumnItem[];
};

export interface BaseTreeNode {
  key: string;
  title: string;
  level: number;
  parent: TreeNodeGroup;
  disableCheckbox?: boolean;
  isLeaf?: boolean;
  isNew?: boolean;
}

export interface TreeNodeGroup extends BaseTreeNode {
  type: 'group';
  width?: number;
  children: TreeNode[];
}

export interface TreeNodeLeaf extends BaseTreeNode {
  type: 'field';
  field: FieldItem;
  modelKey: string;
  width?: number;
  fieldType: FIELD_TYPE;
}

export type TreeNode = TreeNodeGroup | TreeNodeLeaf;

export type ColumnsChange = (data: ColumnItem[]) => void;
