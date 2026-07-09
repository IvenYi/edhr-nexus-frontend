import { DesignNodeMode } from '@gct/base';
import { IRenderContainerNodeProvider, RenderNodeType } from '@gct/runtime-render';

export class RenderTabItemProvider implements IRenderContainerNodeProvider {
  readonly component = 'MobileRenderTabItem';

  readonly mode = DesignNodeMode.CONTAINER;

  readonly type = RenderNodeType.TAB_ITEM;
}
