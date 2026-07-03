export * from './design-editor-type';

/**
 * 设计界面模式前缀(主要用于插件的区分，此设计界面是通用的，通过此标识区分不同界面加载不同组件)
 *
 * @author zhanghanrui
 * @date 2024-07-09 09:07:19
 * @export
 * @enum {number}
 */
export enum DesignViewPrefix {
  /**
   * 自定义视图
   */
  CUSTOM_HOME = 'custom-home',
  /**
   * 自定义导航
   */
  CUSTOM_EXP_VIEW = 'custom-exp-view',
  /**
   * 自定义导航菜单
   */
  CUSTOM_EXP_MENU = 'custom-exp-menu',
  /**
   * 卡片设计
   */
  CARD_DESIGN = 'card-design',
}

/**
 * 特殊设计节点前缀
 *
 * @author chitanda
 * @date 2025-07-07 15:07:00
 * @export
 * @enum {number}
 */
export enum DesignNodePrefix {
  /**
   * 设计编辑器（所有单独需要直接使用编辑器的，可以从注册器中直接取来使用，不用跟着设计界面的类型走）
   */
  DESIGN_EDITOR = 'design-editor',
}

/**
 * 控制器类型
 *
 * @author zhanghanrui
 * @date 2024-07-05 13:07:45
 * @export
 * @enum {number}
 */
export enum ControllerType {
  /**
   * 设计视图
   */
  DESIGN_VIEW = 'design-view',
}

/**
 * 设计节点类型
 *
 * @author zhanghanrui
 * @date 2024-07-05 15:07:14
 * @export
 * @enum {number}
 */
export enum DesignNodeType {
  /**
   * 页面
   */
  PAGE = 'PAGE',
  /**
   * 页面小写
   */
  PAGE_LOWER = 'page',
  /**
   * 属性配置
   */
  FIELD = 'field',
  /**
   * 面板
   */
  PANEL = 'panel',
  /**
   * 选项卡
   */
  TABS = 'tabs',
  /**
   * 选项卡子项
   */
  TAB_ITEM = 'tab-item',
  /**
   * 栅格容器
   */
  GRID = 'grid',
  /**
   * 栅格容器子项
   */
  GRID_ITEM = 'grid-item',
  /**
   * 菜单列表
   */
  MENU_LIST = 'menu-list',
  /**
   * 选择组件
   */
  SELECT_COMPONENT = 'select-component',
  /**
   * 消息
   */
  MESSAGE = 'message',
  /**
   * 工作台
   */
  WORKBENCH = 'workbench',
  /**
   * 个人中心
   */
  PERSONAL_CENTER = 'personal-center',
  /**
   * 审批
   */
  TODO = 'todo',
  /**
   * 自定义导航菜单
   */
  CUSTOM_EXP_MENU = 'custom-exp-menu',
  /**
   * 设计编辑器
   */
  DESIGN_EDITOR = 'design-editor',
}

/**
 * 节点模式
 *
 * @author zhanghanrui
 * @date 2024-07-06 12:07:24
 * @export
 * @enum {number}
 */
export enum DesignNodeMode {
  /**
   * 主页面模式
   */
  PAGE = 'PAGE',
  /**
   * 主页面模式
   */
  PAGE_LOWER = 'page',
  /**
   * 容器模式
   */
  CONTAINER = 'container',
  /**
   * 子项模式
   */
  ITEM = 'item',
}

/**
 * 插入节点模式
 *
 * @author zhanghanrui
 * @date 2024-07-08 14:07:44
 * @export
 * @enum {number}
 */
export enum InsertNodeMode {
  /**
   * 出入前
   */
  BEFORE = 'before',
  /**
   * 插入后
   */
  AFTER = 'after',
}

/**
 * 素材分组
 *
 * @author zhanghanrui
 * @date 2024-07-09 16:07:08
 * @export
 * @enum {number}
 */
export enum MaterialGroup {
  /**
   * 布局
   */
  LAYOUT = 'layout',
  /**
   * 系统
   */
  SYSTEM = 'system',
}

/**
 * 设计项标识标签属性
 *
 * @author zhanghanrui
 * @date 2024-07-11 20:07:11
 * @export
 * @enum {number}
 */
export enum DesignItemAttribute {
  /**
   * 可以激活项的标识
   */
  ACTIVE_TAG = 'design-active-item',
  /**
   * 拖拽项标识属性
   */
  DRAG_TAG = 'design-drop-item',
  /**
   * 项排序值标识
   */
  INDEX_TAG = 'design-item-index',
  /**
   * 设计项标识属性
   */
  NODE_ID_TAG = 'design-item-id',
  /**
   * 项文本名称
   */
  DESIGN_NAME = 'design-item-name',
  /**
   * 分组标识
   */
  GROUP_TAG = 'design-group-tag',
  /**
   * 拖拽组类型
   */
  DRAG_GROUP_TYPE = 'drag-group-type',
  /**
   * 是否为行内元素
   */
  IS_INLINE_BLOCK = 'is-inline-block',
  /**
   * 特殊情况下，例如表格将表格元素自己复制了好几份，需要指定实际呈现元素在 querySelectorAll 中的位置。便于悬浮或者选中时位置的计算
   */
  SELECTOR_INDEX = 'selector-index',
}

/**
 * 行为标识
 *
 * @author zhanghanrui
 * @date 2024-07-16 17:07:34
 * @export
 * @enum {number}
 */
export enum DesignItemActionTag {
  /**
   * 删除
   */
  DELETE = 'delete',
  /**
   * 选中父
   */
  SELECT_PARENT = 'select-parent',
}
