import { DesignNodeMode, IDesignNode } from '@gct/base';
import { IRenderBaseNodeProvider } from './i-render-base-node.provider';
import { IDesignRenderContainerController } from '../controller/i-design-render-container.controller';

/**
 * 容器项适配器
 *
 * @author zhanghanrui
 * @date 2024-07-15 17:07:43
 * @export
 * @interface IRenderContainerNodeProvider
 * @extends {IRenderBaseNodeProvider}
 */
export interface IRenderContainerNodeProvider extends IRenderBaseNodeProvider {
  /**
   * 节点模式
   *
   * @author zhanghanrui
   * @date 2024-07-15 18:07:57
   * @type {DesignNodeMode.CONTAINER}
   */
  readonly mode: DesignNodeMode.CONTAINER;

  /**
   * 创建项控制器实例
   *
   * @author zhanghanrui
   * @date 2024-07-15 17:07:25
   * @return {*}  {IDesignRenderContainerController}
   */
  createController?(model: IDesignNode): IDesignRenderContainerController;
}
