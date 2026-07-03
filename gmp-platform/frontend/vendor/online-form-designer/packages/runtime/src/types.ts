import { Router } from 'vue-router';
import { GctRuntime } from './global';

import './interface/script';

declare global {
  const gct: GctRuntime;

  interface Window {
    gct: GctRuntime;
    _vue_router_instance: Router;
    $t(key: string, defaultValue?: any): string;
    gct_expression: {
      // 给入公式字符串和变量值，执行公式计算，返回计算结果
      execute: (expr: string, values: Record<string, any>) => Promise<any>,
      // 识别公式中的变量名称
      identify(expr: string, isAll?: boolean): string[]
    }
  }

  /**
   * 上下文
   *
   * @author zhanghanrui
   * @date 2024-05-06 09:05:35
   * @interface IContext
   */
  interface IContext {
    [key: string | symbol]: any;
  }

  interface IGctContext extends IContext {
    /**
     * 上下文实例唯一标识
     *
     * @author zhanghanrui
     * @date 2024-05-06 10:05:12
     * @type {number}
     */
    readonly _id: number;

    /**
     * 返回自身的上下文，独有的和与父有差异的
     *
     * @author zhanghanrui
     * @date 2024-05-06 09:05:45
     * @return {*}  {IData}
     */
    getOwnContext(): IData;

    /**
     * 销毁当前上下文
     *
     * @author zhanghanrui
     * @date 2024-05-06 09:05:51
     */
    destroy(): void;

    /**
     * 克隆当前上下文
     *
     * @author zhanghanrui
     * @date 2024-05-06 09:05:56
     * @return {*}  {IGctContext}
     */
    clone(): IGctContext;

    /**
     * 在不改变对象引用的情况下，重置上下文
     * 等效于重新实例化，但是引用不变
     *
     * @author zhanghanrui
     * @date 2024-05-06 09:05:02
     * @param {IData} [context] 默认值
     * @param {IContext} [parent] 父上下文
     */
    reset(context?: IData, parent?: IContext): void;
  }

  /**
   * 任意参数对象
   *
   * @author zhanghanrui
   * @date 2024-03-19 19:03:20
   * @interface IParams
   */
  interface IParams {
    [key: string | symbol]: any;
  }

  /**
   * 任意数据对象
   *
   * @author zhanghanrui
   * @date 2024-03-19 19:03:25
   * @interface IData
   */
  interface IData {
    [key: string | symbol]: any;
  }

  /**
   * 任意对象结构
   *
   * @author zhanghanrui
   * @date 2024-03-19 19:03:46
   * @interface IObject
   */
  interface IObject {
    [key: string | symbol]: any;
  }
}
