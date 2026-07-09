import { DesignNodeMode } from '@gct/base';
import { IRenderItemNodeProvider, RenderNodeType } from '@gct/runtime-render';

export class RenderPersonalCenterProvider implements IRenderItemNodeProvider {
  readonly component = 'gct-user';

  readonly mode = DesignNodeMode.ITEM;

  readonly type = RenderNodeType.PERSONAL_CENTER;
}
