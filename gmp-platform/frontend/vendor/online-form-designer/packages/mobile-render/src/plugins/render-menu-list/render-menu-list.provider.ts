import { DesignNodeMode } from '@gct/base';
import { IRenderItemNodeProvider, RenderNodeType } from '@gct/runtime-render';

export class RenderMenuListProvider implements IRenderItemNodeProvider {
  mode: DesignNodeMode.ITEM = DesignNodeMode.ITEM;

  type: string = RenderNodeType.MENU_LIST;

  component: string = 'RenderMenuList';
}
