import { SyncSeriesHook } from 'qx-util';
import { Component } from 'vue';

/**
 * 绘制组件注册
 *
 * @author zhanghanrui
 * @date 2024-05-25 08:05:52
 * @export
 * @class RenderRegister
 */
export class RenderRegister {
  /**
   * 组件清单
   *
   * @author zhanghanrui
   * @date 2024-05-25 08:05:03
   * @protected
   * @type {Map<string, Component>}
   */
  protected map: Map<string, Component> = new Map();

  readonly hooks = {
    register: new SyncSeriesHook<[string, Component]>(),
    unregister: new SyncSeriesHook<string>(),
  };

  /**
   * 注册界面绘制组件
   *
   * @author zhanghanrui
   * @date 2024-05-25 08:05:05
   * @param {string} tag
   * @param {Component} com
   */
  register(tag: string, com: Component): void {
    this.map.set(tag, com);
    this.hooks.register.callSync(null, tag, com);
  }

  /**
   * 取消组件注册
   *
   * @author zhanghanrui
   * @date 2024-05-25 08:05:34
   * @param {string} tag
   */
  unregister(tag: string): void {
    this.map.delete(tag);
    this.hooks.unregister.callSync(null, tag);
  }

  /**
   * 获取注册的组件
   *
   * @author zhanghanrui
   * @date 2024-05-25 08:05:59
   * @param {string} tag
   * @return {*}  {(Component | undefined)}
   */
  get(tag: string): Component | undefined {
    return this.map.get(tag);
  }

  /**
   * 组件标识清单
   *
   * @author zhanghanrui
   * @date 2024-05-25 08:05:19
   * @return {*}  {string[]}
   */
  keys(): string[] {
    return Array.from(this.map.keys());
  }
}
