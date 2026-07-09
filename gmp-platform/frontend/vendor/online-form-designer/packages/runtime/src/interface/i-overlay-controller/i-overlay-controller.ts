import { ComputePositionConfig } from '@floating-ui/dom';
import { IOverlayContainer } from '../i-overlay-container/i-overlay-container';
import { IModalOptions } from '../i-modal-options/i-modal-options';
import { IDrawerOptions } from '../i-drawer-options/i-drawer-options';
import { IAppFullScreenContainerOptions } from '../i-app-full-screen-container-options/i-app-full-screen-container-options';
import { IPopoverOptions } from '../i-popover-options/i-popover-options';
import { ITipOptions } from '../i-tip-options/i-tip-options';

// 飘窗组件配置
export type FloatingUIConfig = Partial<ComputePositionConfig>;

/**
 * 全局呈现容器控制器
 *
 * @author zhanghanrui
 * @date 2024-03-19 19:03:18
 * @export
 * @interface IOverlayController
 */
export interface IOverlayController {
  /**
   * 模态打开组件
   *
   * @author zhanghanrui
   * @date 2024-03-19 19:03:42
   * @template T
   * @param {unknown} component 组件名称，组件对象，或者绘制函数
   * @param {IParams} [props] 组件props
   * @param {IModalOptions} [opts]
   * @return {*}  {Promise<T>}
   */
  modal<T = void>(component: unknown, props?: IParams, opts?: IModalOptions): Promise<T>;

  /**
   * 创建全局模态容器
   *
   * @author zhanghanrui
   * @date 2024-03-19 19:03:04
   * @param {unknown} component 组件名称，组件对象，或者绘制函数
   * @param {IParams} [props] 组件props
   * @param {IModalOptions} [opts]
   * @return {*}  {IOverlayContainer}
   */
  createModal(component: unknown, props?: IParams, opts?: IModalOptions): IOverlayContainer;

  /**
   * 抽屉打开组件
   *
   * @author zhanghanrui
   * @date 2024-03-29 14:03:14
   * @template T
   * @param {unknown} component
   * @param {IParams} [props]
   * @param {IDrawerOptions} [opts]
   * @return {*}  {Promise<T>}
   */
  drawer<T = void>(component: unknown, props?: IParams, opts?: IDrawerOptions): Promise<T>;

  /**
   * 创建全局抽屉容器
   *
   * @author zhanghanrui
   * @date 2024-03-29 14:03:17
   * @param {unknown} component
   * @param {IParams} [props]
   * @param {IDrawerOptions} [opts]
   * @return {*}  {IOverlayContainer}
   */
  createDrawer(component: unknown, props?: IParams, opts?: IDrawerOptions): IOverlayContainer;

  /**
   * 飘窗打开组件
   *
   * @author zhanghanrui
   * @date 2024-04-08 09:04:23
   * @template T
   * @param {HTMLElement} element 飘窗目标元素
   * @param {unknown} component
   * @param {IParams} [props]
   * @param {IPopoverOptions<FloatingUIConfig>} [opts]
   * @return {*}  {Promise<T>}
   */
  popover<T = void>(
    element: HTMLElement,
    component: unknown,
    props?: IParams,
    opts?: IPopoverOptions<FloatingUIConfig>,
  ): Promise<T>;

  /**
   * 创建全局飘窗容器
   *
   * @author zhanghanrui
   * @date 2024-04-08 09:04:58
   * @param {unknown} component
   * @param {IParams} [props]
   * @param {IPopoverOptions<FloatingUIConfig>} [opts]
   * @return {*}  {IOverlayContainer}
   */
  createPopover(
    component: unknown,
    props?: IParams,
    opts?: IPopoverOptions<FloatingUIConfig>,
  ): IOverlayContainer;

  /**
   * 提示框打开组件
   *
   * @author chitanda
   * @date 2025-06-23 16:06:23
   * @template T
   * @param {HTMLElement} element 提示框目标元素
   * @param {unknown} component
   * @param {IParams} [props]
   * @param {ITipOptions<FloatingUIConfig>} [opts]
   * @return {*}  {Promise<T>}
   */
  tip<T = void>(
    element: HTMLElement,
    component: unknown,
    props?: IParams,
    opts?: ITipOptions,
  ): Promise<T>;

  /**
   * 创建全局提示框容器
   *
   * @author chitanda
   * @date 2025-06-23 16:06:58
   * @param {unknown} component
   * @param {IParams} [props]
   * @param {ITipOptions} [opts]
   * @return {*}  {IOverlayContainer}
   */
  createTip(component: unknown, props?: IParams, opts?: ITipOptions): IOverlayContainer;

  /**
   * 全屏容器打开组件
   *
   * @author zhanghanrui
   * @date 2024-07-04 15:07:29
   * @template T
   * @param {unknown} component
   * @param {IParams} [props]
   * @param {IAppFullScreenContainerOptions} [opts]
   * @return {*}  {Promise<T>}
   */
  fullScreen<T = void>(
    component: unknown,
    props?: IParams,
    opts?: IAppFullScreenContainerOptions,
  ): Promise<T>;

  /**
   * 创建全局全屏容器
   *
   * @author zhanghanrui
   * @date 2024-07-04 15:07:02
   * @param {unknown} component
   * @param {IParams} [props]
   * @param {IAppFullScreenContainerOptions} [opts]
   * @return {*}  {IOverlayContainer}
   */
  createFullScreen(
    component: unknown,
    props?: IParams,
    opts?: IAppFullScreenContainerOptions,
  ): IOverlayContainer;
}
