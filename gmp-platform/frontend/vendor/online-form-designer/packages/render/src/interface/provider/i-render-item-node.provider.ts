import { DesignNodeMode, IDesignNode } from '@gct/base';
import { IRenderBaseNodeProvider } from './i-render-base-node.provider';
import { IDesignRenderItemController } from '../controller/i-design-render-item.controller';

/**
 * 容器项适配器
 *
 * @author zhanghanrui
 * @date 2024-07-15 17:07:43
 * @export
 * @interface IRenderItemNodeProvider
 * @extends {IRenderBaseNodeProvider}
 */
export interface IRenderItemNodeProvider extends IRenderBaseNodeProvider {
  /**
   * 节点模式
   *
   * @author zhanghanrui
   * @date 2024-07-15 18:07:57
   * @type {DesignNodeMode.ITEM}
   */
  readonly mode: DesignNodeMode.ITEM;

  /**
   * 创建项控制器实例
   *
   * @author zhanghanrui
   * @date 2024-07-15 17:07:25
   * @return {*}  {IDesignRenderItemController}
   */
  createController?(model: IDesignNode): IDesignRenderItemController;
}
