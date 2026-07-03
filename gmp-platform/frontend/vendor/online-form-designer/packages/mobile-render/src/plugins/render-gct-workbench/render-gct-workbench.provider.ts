import { DesignNodeMode } from '@gct/base';
import { IRenderItemNodeProvider, RenderNodeType } from '@gct/runtime-render';

export class RenderGctWorkbenchProvider implements IRenderItemNodeProvider {
  readonly component = 'gct-workbench';

  readonly mode = DesignNodeMode.ITEM;

  readonly type = RenderNodeType.WORKBENCH;
}
