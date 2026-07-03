import { DesignNodeMode } from '@gct/base';
import { IRenderItemNodeProvider, RenderNodeType } from '@gct/runtime-render';

export class RenderGctMessageProvider implements IRenderItemNodeProvider {
  readonly component = 'gct-message';

  readonly mode = DesignNodeMode.ITEM;

  readonly type = RenderNodeType.MESSAGE;
}
