import { IDesignNodeData } from '@gct/base';
import { IDesignRenderContainerState } from '../state/i-design-render-container.state';
import { IDesignRenderBaseController } from './i-design-render-base.controller';

/**
 * 容器渲染控制器
 */
export type IDesignRenderContainerController<
  T extends IDesignNodeData = IDesignNodeData,
  S extends IDesignRenderContainerState = IDesignRenderContainerState,
> = IDesignRenderBaseController<T, S>;
