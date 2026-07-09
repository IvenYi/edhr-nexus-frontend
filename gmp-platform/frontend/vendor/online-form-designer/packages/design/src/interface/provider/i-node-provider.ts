import { Component } from 'vue';
import { IEditForm } from '@gct/runtime';
import { IDesignNode, IDragDataItem } from '@gct/base';
import { DesignNodeMode } from '../../constant';
import { IDesignViewController } from '../controller/i-design-view.controller';
import { IDesignItemAction } from '../i-design-item-action/i-design-item-action';

/**
 * 设计界面节点设计绘制器
 *
 * @author zhanghanrui
 * @date 2024-07-06 11:07:22
 * @export
 * @interface INodeProvider
 */
export interface INodeProvider<T extends IDesignNode = IDesignNode> {
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
   * @date 2025-07-07 15:07:18
   * @type {(string | Component)}
   */
  readonly component: string | Component;

  /**
   * 组件布局方向
   *
   * @default 'horizontal'
   * @type {('vertical' | 'horizontal')}
   */
  direction?: 'vertical' | 'horizontal';

  /**
   * 可操作的行为项
   *
   * @author zhanghanrui
   * @date 2024-07-16 16:07:09
   * @type {IDesignItemAction[]}
   */
  actions?: IDesignItemAction[];

  /**
   * 是否启用拖放，默认启用
   *
   * @author zhanghanrui
   * @date 2024-07-12 17:07:41
   * @type {boolean}
   */
  isDrop?: boolean;

  /**
   * 是否启用拖拽，默认启用
   *
   * @author zhanghanrui
   * @date 2024-07-12 17:07:27
   * @type {boolean}
   */
  isDrag?: boolean;

  /**
   * 是否自定义实现样式
   *
   * @default false
   * @author zhanghanrui
   * @date 2024-08-23 16:08:16
   * @type {boolean}
   */
  isCustomStyle?: boolean;

  /**
   * 特殊情况下，例如表格将表格元素自己复制了好几份，需要指定实际呈现元素在 querySelectorAll 中的位置
   *
   * @type {number}
   */
  selectorIndex?: number;

  /**
   * 放置白名单
   *
   * @type {(string | RegExp)[]}
   */
  whiteList?: (string | RegExp)[];

  /**
   * 放置黑名单
   *
   * @type {(string | RegExp)[]}
   */
  blackList?: (string | RegExp)[];

  /**
   * 属性编辑表单模型
   *
   * @author chitanda
   * @date 2025-06-24 10:06:39
   */
  model: IEditForm | ((context?: IContext, data?: T) => IEditForm);

  /**
   * 项行为点击
   *
   * @author zhanghanrui
   * @date 2024-07-16 17:07:33
   * @param {IDesignViewController} c
   * @param {IDesignNode} data
   * @param {IDesignItemAction} action
   * @return {*}  {boolean} 返回值为 true 时不再执行后续行为
   */
  onClick?(c: IDesignViewController, data: IDesignNode, action: IDesignItemAction): boolean;

  /**
   * 创建新节点
   *
   * @author zhanghanrui
   * @date 2024-07-09 16:07:59
   * @param {Partial<T>} [data]
   * @return {*}  {T}
   */
  create(data?: Partial<T>): T;

  /**
   * 放置节点
   *
   * @param {IDesignViewController} c
   * @param {IDragDataItem} [data]
   * @returns {*}  {(Promise<T | null>)}
   */
  beforeDrop?(c: IDesignViewController, data?: IDragDataItem): Promise<T | null>;

  /**
   * 放置完成
   *
   * @param {IDesignViewController} c
   * @param {IDragDataItem} [data]
   * @returns {*}  {Promise<boolean>}
   */
  afterDrop?(c: IDesignViewController, data?: IDragDataItem): Promise<boolean>;
}
