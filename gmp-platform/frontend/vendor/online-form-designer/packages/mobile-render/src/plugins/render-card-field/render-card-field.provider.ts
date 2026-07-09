import { DesignNodeMode } from '@gct/base';
import { IRenderContainerNodeProvider, RenderNodeType } from '@gct/runtime-render';

export class RenderCardFieldProvider implements IRenderContainerNodeProvider {
  readonly component = 'RenderCardField';

  readonly mode = DesignNodeMode.CONTAINER;

  readonly type = RenderNodeType.FIELD;
}
