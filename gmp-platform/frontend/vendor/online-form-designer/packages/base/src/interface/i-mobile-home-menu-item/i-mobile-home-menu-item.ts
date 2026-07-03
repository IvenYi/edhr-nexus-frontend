/**
 * 移动端首页菜单项配置
 *
 * @author zhanghanrui
 * @date 2024-08-23 09:08:50
 * @export
 * @interface IMobileHomeMenuItem
 */
export interface IMobileHomeMenuItem {
  id: string;
  /**
   * 菜单模式
   *
   * @author zhanghanrui
   * @date 2024-09-22 16:09:02
   * @type {('system' | 'custom')}
   */
  menuMode: 'system' | 'custom';
  /**
   * 菜单名称
   *
   * @author zhanghanrui
   * @date 2024-08-23 09:08:03
   * @type {string}
   */
  label: string;
  /**
   * 菜单名称国际化配置
   *
   * @author zhanghanrui
   * @date 2024-08-23 09:08:35
   * @type {*}
   */
  i18nConfig?: any;
  /**
   * 预置系统菜单类型
   *
   * @author zhanghanrui
   * @date 2024-08-24 12:08:09
   * @type {('message' | 'workbench' | 'personalCenter')} 消息 | 工作台 | 我的
   */
  presetType?: 'message' | 'workbench' | 'personalCenter' | 'todo';
  /**
   * 未选中的图标配置
   *
   * @author zhanghanrui
   * @date 2024-08-23 09:08:46
   * @type {*}
   */
  icon: any;
  /**
   * 选中的图标配置
   *
   * @author zhanghanrui
   * @date 2024-08-23 09:08:57
   * @type {*}
   */
  selectIcon: any;
  /**
   * 自定义首页导航页面 id，非系统预置菜单时生效
   *
   * @author zhanghanrui
   * @date 2024-08-23 09:08:04
   * @type {string}
   */
  customExpView?: string;
  /**
   * 是否隐藏
   *
   * @default false
   * @author zhanghanrui
   * @date 2024-08-23 09:08:33
   * @type {boolean}
   */
  isHidden: boolean;
  /**
   * 是否为首页
   *
   * @default false
   * @author zhanghanrui
   * @date 2024-08-23 09:08:18
   * @type {boolean}
   */
  isHome: boolean;
  /**
   * 是否为预置系统菜单
   *
   * @default false
   * @author zhanghanrui
   * @date 2024-08-23 09:08:02
   * @type {boolean}
   */
  isSystem: boolean;
}
