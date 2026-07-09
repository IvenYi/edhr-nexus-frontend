import type { IOverlayPopoverContainer, IPopoverOptions } from '../local-runtime';
import { OverlayContainer } from '../overlay-container/overlay-container';

/**
 * 飘窗组件呈现容器
 *
 * @author zhanghanrui
 * @date 2024-04-08 09:04:42
 * @export
 * @class OverlayPopoverContainer
 * @extends {OverlayContainer<IPopoverOptions>}
 * @implements {IOverlayPopoverContainer}
 */
export class OverlayPopoverContainer
  extends OverlayContainer<IPopoverOptions>
  implements IOverlayPopoverContainer
{
  override present(): Promise<void>;

  override present(target: HTMLElement): Promise<void>;

  override present(target?: HTMLElement): Promise<void> {
    return this.modal.present(target);
  }
}
