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
  DESIGN_RENDER = 'design-render',
}

/**
 * 绘制界面模式前缀(主要用于插件的区分，此设计界面是通用的，通过此标识区分不同界面加载不同组件)
 *
 * @author zhanghanrui
 * @date 2024-07-15 14:07:42
 * @export
 * @enum {number}
 */
export enum DesignRenderViewPrefix {
  /**
   * 自定义视图
   */
  CUSTOM_HOME = 'custom-home',
  /**
   * 卡片绘制
   */
  CARD_VIEW = 'card-view',
  /**
   * 卡片绘制
   */
  MOBILE_CARD_VIEW = 'mobile-card-view',
  /**
   * 设计编辑器
   */
  DESIGN_EDITOR = 'design-editor',
}

/**
 * 绘制节点类型
 *
 * @author zhanghanrui
 * @date 2024-07-15 15:07:16
 * @export
 * @enum {number}
 */
export enum RenderNodeType {
  /**
   * 页面
   */
  PAGE = 'PAGE',
  /**
   * 页面小写标识
   */
  PAGE_LOWER = 'page',
  /**
   * 属性
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
   * 菜单列表
   */
  MENU_LIST = 'menu-list',
  /**
   * 选择组件
   */
  SELECT_COMPONENT = 'select-component',
  GRID = 'grid',
  GRID_ITEM = 'grid-item',
  /**消息 */
  MESSAGE = 'message',
  /**工作台 */
  WORKBENCH = 'workbench',
  /**个人中心 */
  PERSONAL_CENTER = 'personal-center',
  /**待办 */
  TODO = 'todo',
}
