/**
 * 设计视图配置参数
 *
 * @author zhanghanrui
 * @date 2024-08-19 17:08:18
 * @export
 * @interface IDesignViewOptions
 */
export interface IDesignViewOptions {
  /**
   * 页面标题
   *
   * @author zhanghanrui
   * @date 2024-08-19 17:08:33
   * @type {string}
   */
  title?: string;
  /**
   * 设计视图前缀
   *
   * @author zhanghanrui
   * @date 2024-08-19 17:08:27
   * @type {string}
   */
  prefix?: string;
  /**
   * 是否有触发预览按钮，默认有
   *
   * @default true
   * @author zhanghanrui
   * @date 2024-08-19 17:08:44
   * @type {boolean}
   */
  isPreview?: boolean;
  /**
   * 是否支持回溯，撤销重做功能。默认支持
   *
   * @default true
   * @author zhanghanrui
   * @date 2024-08-20 09:08:51
   * @type {boolean}
   */
  isBacktrack?: boolean;
  /**
   * 是否显示素材区，默认显示
   *
   * @default true
   * @author zhanghanrui
   * @date 2024-08-19 17:08:28
   * @type {boolean}
   */
  isMaterial?: boolean;
  /**
   * 是否为移动端设计视图，默认是
   *
   * @default true
   * @type {boolean}
   */
  isMobile?: boolean;
  /**
   * 是否显示移动端标题栏，默认显示
   *
   * @default true
   * @author zhanghanrui
   * @date 2024-08-19 17:08:14
   * @type {boolean}
   */
  showMobileTitleBar?: boolean;
}
