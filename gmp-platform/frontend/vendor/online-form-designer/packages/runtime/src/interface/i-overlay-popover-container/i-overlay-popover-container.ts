import { IOverlayContainer } from '../i-overlay-container/i-overlay-container';

/**
 * 飘窗容器
 *
 * @author chitanda
 * @date 2022-11-09 14:11:39
 * @export
 * @interface IOverlayPopoverContainer
 * @extends {IOverlayContainer}
 */
export interface IOverlayPopoverContainer extends IOverlayContainer {
  /**
   * 展示飘窗容器
   *
   * @author chitanda
   * @date 2022-11-09 14:11:47
   * @param {HTMLElement} target
   * @return {*}  {Promise<void>}
   */
  present(target: HTMLElement): Promise<void>;
  present(): Promise<void>;
}
