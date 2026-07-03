import { DesignNodeMode } from '@gct/base';
import { IRenderContainerNodeProvider, RenderNodeType } from '@gct/runtime-render';

export class RenderGridProvider implements IRenderContainerNodeProvider {
  readonly component = 'MobileRenderGrid';

  readonly mode = DesignNodeMode.CONTAINER;

  readonly type = RenderNodeType.GRID;
}
