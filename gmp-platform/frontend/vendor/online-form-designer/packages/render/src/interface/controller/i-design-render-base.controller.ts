import { IDesignNode, IDesignNodeData } from '@gct/base';
import { IDesignRenderBaseState } from '../state/i-design-render-base.state';

/**
 * 渲染节点控制器
 *
 * @author zhanghanrui
 * @date 2024-07-15 17:07:39
 * @export
 * @interface IDesignRenderBaseController
 * @template T
 */
export interface IDesignRenderBaseController<
  T extends IDesignNodeData = IDesignNodeData,
  S extends IDesignRenderBaseState = IDesignRenderBaseState,
> {
  /**
   * 模型只读，在控制器实例化时设置
   *
   * @author zhanghanrui
   * @date 2024-07-15 17:07:46
   * @type {T}
   */
  readonly model: IDesignNode<T>;

  /**
   * 绘制项状态
   *
   * @author zhanghanrui
   * @date 2024-07-15 17:07:24
   * @type {S}
   */
  state: S;

  /**
   * 界面挂载时调用
   *
   * @author zhanghanrui
   * @date 2024-07-15 14:07:05
   */
  mounted(): void;

  /**
   * 控制器销毁调用
   *
   * @author zhanghanrui
   * @date 2024-07-15 14:07:10
   */
  destroy(): void;
}
