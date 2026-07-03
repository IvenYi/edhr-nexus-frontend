import { DesignNodeMode } from '@gct/base';
import { IRenderContainerNodeProvider, RenderNodeType } from '@gct/runtime-render';

export class RenderTabsProvider implements IRenderContainerNodeProvider {
  readonly component = 'MobileRenderTabs';

  readonly mode = DesignNodeMode.CONTAINER;

  readonly type = RenderNodeType.TABS;
}
