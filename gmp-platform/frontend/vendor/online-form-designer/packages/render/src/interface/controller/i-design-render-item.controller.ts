import { IDesignNodeData } from '@gct/base';
import { IDesignRenderItemState } from '../state/i-design-render-item.state';
import { IDesignRenderBaseController } from './i-design-render-base.controller';

/**
 * 渲染节点控制器
 */
export type IDesignRenderItemController<
  T extends IDesignNodeData = IDesignNodeData,
  S extends IDesignRenderItemState = IDesignRenderItemState,
> = IDesignRenderBaseController<T, S>;
