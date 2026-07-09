import { Store } from 'pinia';
import { IDesignNode } from '@gct/base';
import { IDesignViewState } from '../state/i-design-view.state';
import { IDesignViewActions } from '../actions/i-design-view.actions';
import { DesignViewHooks } from '../../hooks/designer.hooks';

/**
 * 设计界面控制器
 *
 * @author zhanghanrui
 * @date 2024-07-05 14:07:01
 * @export
 * @interface IDesignViewController
 */
export interface IDesignViewController {
  /**
   * 界面状态
   *
   * @author zhanghanrui
   * @date 2024-07-05 14:07:20
   * @type {Store<string, IDesignViewState, {}, IDesignViewActions>}
   */
  readonly store: Store<string, IDesignViewState, {}, IDesignViewActions>;

  /**
   * 设计界面钩子
   *
   * @type {DesignViewHooks}
   */
  readonly hooks: DesignViewHooks;

  /**
   * 效验设计界面数据
   *
   * @author zhanghanrui
   * @date 2024-08-04 15:08:24
   * @return {*}  {Promise<boolean>}
   */
  validate(): Promise<boolean>;

  /**
   * 界面挂载时调用
   *
   * @author zhanghanrui
   * @date 2024-07-05 14:07:24
   */
  mounted(): void;

  /**
   * 界面销毁调用
   *
   * @author zhanghanrui
   * @date 2024-07-05 14:07:53
   */
  unmounted(): void;

  /**
   * 设置容器展开节点
   *
   * @param {string[]} ids
   */
  setExpansion(ids: string[]): void;

  /**
   * 取消容器展开节点
   *
   */
  cancelExpansion(): void;

  /**
   * 获取当前节点所有子节点类型
   *
   * @param {IDesignNode} node
   * @returns {*}  {string[]}
   */
  types(node: IDesignNode): string[];

  /**
   * 结束放置
   *
   */
  dropEnd(): void;
}
