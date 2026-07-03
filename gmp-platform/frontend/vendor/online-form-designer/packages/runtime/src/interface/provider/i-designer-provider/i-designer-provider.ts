import { Component } from 'vue';
import { LowCodeWidget } from '../../types';

/**
 * 设计界面项
 *
 * @author zhanghanrui
 * @date 2024-05-24 13:05:47
 * @export
 * @interface IDesignerProvider
 */
export interface IDesignerProvider {
  /**
   * 套件类别，用于识别可使用的系统。取 getApp 中的 suiteKey，例如 MedPro 使用 kit=['MEDPRO']
   *
   * @author zhanghanrui
   * @date 2024-05-28 09:05:32
   * @type {string[]}
   */
  kit?: string[];

  /**
   * 项拖拽钩子
   *
   * @type {LowCodeWidget.hooks}
   */
  hooks?: LowCodeWidget.hooks;

  /**
   * 白名单，只允许在白名单中的组件拖入
   *
   * @type {(string | RegExp)[]}
   */
  whiteList?: (string | RegExp)[];

  /**
   * 黑名单，不允许拖入黑名单中的组件
   *
   * @type {(string | RegExp)[]}
   */
  blackList?: (string | RegExp)[];

  /**
   * render 绘制组件，目前只支持异步组件
   *
   * @author zhanghanrui
   * @date 2024-05-24 17:05:17
   * @type {Component}
   */
  component: Component;

  /**
   * 基础组件描述
   *
   * @author zhanghanrui
   * @date 2024-05-24 16:05:12
   * @type {LowCodeWidget.BasicSchema}
   */
  schema: LowCodeWidget.BasicSchema;

  /**
   * 组件支持配置事件描述
   *
   * @author zhanghanrui
   * @date 2024-05-24 16:05:17
   * @type {LowCodeWidget.EventsType[]}
   */
  events?: LowCodeWidget.EventsType[];

  /**
   * 组件右侧属性表单模型描述
   *
   * @author zhanghanrui
   * @date 2024-05-24 16:05:43
   * @type {LowCodeWidget.PropEditor[]}
   */
  propEditors: LowCodeWidget.PropEditor[];

  /**
   * 保存时钩子函数
   *
   * @author zhanghanrui
   * @date 2024-05-24 18:05:15
   * @type {LowCodeWidget.RunCallback}
   */
  callback?: LowCodeWidget.RunCallback;

  /**
   * 拖入时钩子函数
   *
   * @author zhanghanrui
   * @date 2024-05-24 18:05:13
   * @type {LowCodeWidget.beforeCreate}
   */
  beforeCreate?: LowCodeWidget.beforeCreate;

  /**
   * 样式编辑器配置
   *
   * @author zhanghanrui
   * @date 2024-05-24 16:05:14
   * @type {LowCodeWidget.StyleEditor[]}
   */
  styleEditors?: LowCodeWidget.StyleEditor[];

  /**
   * 设计页面配置信息
   *
   * @author zhanghanrui
   * @date 2024-05-24 16:05:30
   * @type {LowCodeWidget.DesignerConfig}
   */
  designerConfig?: LowCodeWidget.DesignerConfig;
}
