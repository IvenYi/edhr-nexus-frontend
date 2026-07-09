import { DesignNodeMode } from '@gct/base';
import { IRenderContainerNodeProvider, RenderNodeType } from '@gct/runtime-render';

export class RenderPanelProvider implements IRenderContainerNodeProvider {
  readonly mode = DesignNodeMode.CONTAINER;

  readonly type: string = RenderNodeType.PANEL;

  readonly component: string = 'MobileRenderPanel';
}
