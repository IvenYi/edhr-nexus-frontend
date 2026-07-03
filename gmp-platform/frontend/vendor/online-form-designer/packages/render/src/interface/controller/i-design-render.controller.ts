import { IDesignNode, IDesignTreeItem } from '@gct/base';
import { IDesignRenderState } from '../state/i-design-render.state';
import { IDesignRenderBaseController } from './i-design-render-base.controller';

/**
 * 设计绘制界面控制器
 *
 * @author zhanghanrui
 * @date 2024-07-15 14:07:15
 * @export
 * @interface IDesignRenderController
 */
export interface IDesignRenderController {
  /**
   * 状态管理
   *
   * @author zhanghanrui
   * @date 2024-07-15 17:07:30
   * @type {IDesignRenderState}
   */
  state: IDesignRenderState;

  /**
   * 界面绘制项控制器实例
   *
   * @author zhanghanrui
   * @date 2024-07-15 17:07:19
   * @type {Map<string, IDesignRenderBaseController>}
   */
  item: Map<string, IDesignRenderBaseController>;

  /**
   * 界面绘制类型前缀
   *
   * @author zhanghanrui
   * @date 2024-07-15 15:07:26
   * @type {string}
   */
  prefix: string;

  /**
   * 是否为预览模式
   *
   * @author zhanghanrui
   * @date 2024-07-19 09:07:58
   * @type {boolean}
   */
  preview: boolean;

  /**
   * 设置结构树形数据
   *
   * @author zhanghanrui
   * @date 2024-09-03 11:09:13
   * @param {IDesignTreeItem[]} tree
   */
  setTree(tree: IDesignTreeItem[]): void;

  /**
   * 设置节点清单
   *
   * @author zhanghanrui
   * @date 2024-07-15 17:07:04
   * @param {IDesignNode[]} nodes
   */
  setNodes(nodes: IDesignNode[]): void;

  /**
   * 获取节点清单
   *
   * @author zhanghanrui
   * @date 2024-07-15 14:07:09
   * @param {string} [parentId] 父节点ID
   * @return {*}  {IDesignNode[]}
   */
  getNodes(parentId?: string): IDesignNode[];

  /**
   * 获取控制器实例
   *
   * @author zhanghanrui
   * @date 2024-07-15 17:07:58
   * @param {string} id
   * @return {*}  {IDesignRenderBaseController}
   */
  getController(id: string): IDesignRenderBaseController;

  /**
   * 界面挂载时调用
   *
   * @author zhanghanrui
   * @date 2024-07-15 14:07:05
   */
  mounted(): void;

  /**
   * 界面销毁调用
   *
   * @author zhanghanrui
   * @date 2024-07-15 14:07:10
   */
  unmounted(): void;
}
