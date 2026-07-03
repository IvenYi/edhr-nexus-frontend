import { DesignNodeMode } from '@gct/base';
import { IRenderItemNodeProvider, RenderNodeType } from '@gct/runtime-render';

export class RenderTodoProvider implements IRenderItemNodeProvider {
  readonly component = 'gct-todo';

  readonly mode = DesignNodeMode.ITEM;

  readonly type = RenderNodeType.TODO;
}
