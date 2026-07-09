import { DesignNodeMode } from '@gct/base';
import { IRenderItemNodeProvider, RenderNodeType } from '@gct/runtime-render';

export class RenderCardFieldProvider implements IRenderItemNodeProvider {
  mode: DesignNodeMode.ITEM = DesignNodeMode.ITEM;

  type: string = RenderNodeType.FIELD;

  component: string = 'RenderCardField';
}
