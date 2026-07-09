import { DesignNodeMode, IDesignNode } from '@gct/base';
import { IDesignRenderBaseController } from '../controller/i-design-render-base.controller';
import { Component } from 'vue';

/**
 * 界面节点绘制适配器
 *
 * @author zhanghanrui
 * @date 2024-07-15 15:07:30
 * @export
 * @interface IRenderBaseNodeProvider
 */
export interface IRenderBaseNodeProvider {
  /**
   * 节点模式
   *
   * @author zhanghanrui
   * @date 2024-07-06 12:07:05
   * @type {DesignNodeMode}
   */
  readonly mode: DesignNodeMode;

  /**
   * 节点类型
   *
   * @author zhanghanrui
   * @date 2024-07-06 11:07:24
   * @type {string}
   */
  readonly type: string;

  /**
   * 设计界面节点绘制组件
   *
   * @author chitanda
   * @date 2025-07-08 13:07:04
   * @type {(string | Component)}
   */
  readonly component: string | Component;

  /**
   * 创建项控制器实例
   *
   * @author zhanghanrui
   * @date 2024-07-15 17:07:25
   * @return {*}  {IDesignRenderBaseController}
   */
  createController?(model: IDesignNode): IDesignRenderBaseController;
}
