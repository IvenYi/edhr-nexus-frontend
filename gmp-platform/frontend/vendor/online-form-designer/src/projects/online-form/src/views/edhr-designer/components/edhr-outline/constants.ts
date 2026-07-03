enum OutlineType {
  OUTLINE = 'OUTLINE',
  DOC = 'DOC',
}

/**
 * 目录操作类型
 * @author lingxiaoming
 * @date 2024-07-25 01:20:19
 * @export
 * @enum {number}
 */
export enum OutlineActionType {
  /**
   * 目录重命名
   */
  RENAME_OUTLINE = 'rename_outline',
  /**
   * 编辑表单
   */
  EDIT_DOC = 'edit-doc',
  /**
   * 设计表单
   */
  DESIGN_DOC = 'design-doc',
  /**
   * 删除
   */
  DELETE = 'delete',
  /**
   * 新增目录
   */
  NEW_OUTLINE = 'new-outline',
  /**
   * 新增表单
   */
  NEW_DOC = 'new-doc',
}

/** 节点更多的菜单 */
export const NodeMoreMenus = [
  {
    text: $t('sys.component.dataConnection.rename'),
    icon: 'iconfont:icon-bianji',
    include: [OutlineType.OUTLINE],
    event: OutlineActionType.RENAME_OUTLINE,
    divider: true,
  },
  {
    text: $t('sys.onlineForm.editForm'),
    icon: 'iconfont:icon-bianji',
    include: [OutlineType.DOC],
    event: OutlineActionType.EDIT_DOC,
  },
  // {
  //   text: '设计表单',
  //   icon: 'iconfont:icon-template',
  //   include: [OutlineType.DOC],
  //   event: OutlineActionType.DESIGN_DOC,
  //   divider: true,
  // },
  {
    text: $t('sys.delText'),
    class: 'delete-icon',
    icon: 'iconfont:icon-shanchu',
    include: [OutlineType.DOC, OutlineType.OUTLINE],
    event: OutlineActionType.DELETE,
  },
];

export const NodeAddMenus = [
  {
    text: $t('sys.onlineForm.createNewDirectory'),
    icon: 'iconfont:icon-liebiao',
    event: OutlineActionType.NEW_OUTLINE,
  },
  {
    text: $t('sys.onlineForm.createNewDocument'),
    icon: 'iconfont:icon-E-SOP',
    event: OutlineActionType.NEW_DOC,
  },
];
