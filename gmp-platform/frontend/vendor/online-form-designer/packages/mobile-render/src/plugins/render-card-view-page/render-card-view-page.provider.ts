import { DesignNodeMode } from '@gct/base';
import { IRenderContainerNodeProvider, RenderNodeType } from '@gct/runtime-render';

export class RenderCardViewPageProvider implements IRenderContainerNodeProvider {
  readonly component = 'RenderCardViewPage';

  readonly mode = DesignNodeMode.CONTAINER;

  readonly type = RenderNodeType.PAGE_LOWER;
}
