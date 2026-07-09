import { IDesignNode, IDesignNodeData } from '@gct/base';
import { IDesignRenderBaseController, IDesignRenderBaseState } from '../../interface';
import { DesignRenderBaseState } from '../../state';

export class DesignRenderBaseController implements IDesignRenderBaseController {
  state: IDesignRenderBaseState = new DesignRenderBaseState();

  constructor(public readonly model: IDesignNode<IDesignNodeData>) {}

  mounted(): void {
    // TODO
  }

  destroy(): void {
    // TODO
  }
}
