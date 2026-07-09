import { DesignNodeMode } from '@gct/base';
import { IRenderContainerNodeProvider, RenderNodeType } from '@gct/runtime-render';

export class RenderGridItemProvider implements IRenderContainerNodeProvider {
  readonly component = 'MobileRenderGridItem';

  readonly mode = DesignNodeMode.CONTAINER;

  readonly type = RenderNodeType.GRID_ITEM;
}
