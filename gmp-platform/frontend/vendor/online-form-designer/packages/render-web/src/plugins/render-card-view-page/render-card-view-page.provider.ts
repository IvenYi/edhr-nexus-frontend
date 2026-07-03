import { DesignNodeMode } from '@gct/base';
import { IRenderItemNodeProvider, RenderNodeType } from '@gct/runtime-render';

export class RenderCardViewPageProvider implements IRenderItemNodeProvider {
  mode: DesignNodeMode.ITEM = DesignNodeMode.ITEM;

  type: string = RenderNodeType.PAGE;

  component: string = 'RenderCardViewPage';
}
