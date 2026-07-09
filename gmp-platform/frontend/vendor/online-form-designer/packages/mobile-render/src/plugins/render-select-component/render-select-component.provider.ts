import { DesignNodeMode } from '@gct/base';
import { IRenderItemNodeProvider, RenderNodeType } from '@gct/runtime-render';

export class RenderSelectComponentProvider implements IRenderItemNodeProvider {
  readonly mode = DesignNodeMode.ITEM;

  readonly type: string = RenderNodeType.PANEL;

  readonly component: string = 'RenderSelectComponent';
}
