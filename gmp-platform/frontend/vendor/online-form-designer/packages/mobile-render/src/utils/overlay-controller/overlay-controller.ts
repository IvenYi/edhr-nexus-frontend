import { isFunction, isString } from 'lodash-es';
import { h, resolveComponent, ConcreteComponent, VNode } from 'vue';
import {
  IAppFullScreenContainerOptions,
  IModalData,
  IModalOptions,
  IOverlayContainer,
  IOverlayController,
  IPopoverOptions,
  IDrawerOptions,
  ITipOptions,
} from '@gct/runtime';
import { createModal } from '../../components';
import { Strategy, Placement, Middleware, Platform } from '@floating-ui/dom';

function resolveComponentOrStr(component: unknown): string | ConcreteComponent {
  return isString(component)
    ? resolveComponent(component as string)
    : (component as ConcreteComponent);
}

/**
 * 用不同呈现方式绘制组件的通用工具类
 *
 * @author zhanghanrui
 * @date 2024-03-19 19:03:34
 * @export
 * @class OverlayController
 * @implements {IOverlayController}
 */
export class OverlayController implements IOverlayController {
  async modal<T = IModalData>(
    component: unknown,
    props?: IParams,
    opts?: IModalOptions,
  ): Promise<T> {
    const modal = this.createModal(component, props, opts);
    modal.present();
    return modal.onWillDismiss();
  }

  createModal(component: unknown, props?: IParams, opts?: IModalOptions): IOverlayContainer {
    return createModal(
      isFunction(component)
        ? component as () => VNode
        : () => h(resolveComponentOrStr(component as string), { ...props }),
      opts,
    );
  }

  drawer<T = void>(component: unknown, props?: IParams, opts?: IDrawerOptions): Promise<T> {
    throw new Error('Method not implemented.');
  }
  createDrawer(component: unknown, props?: IParams, opts?: IDrawerOptions): IOverlayContainer {
    throw new Error('Method not implemented.');
  }
  popover<T = void>(
    element: HTMLElement,
    component: unknown,
    props?: IParams,
    opts?: IPopoverOptions<
      Partial<{
        strategy?: Strategy | undefined;
        placement?: Placement | undefined;
        middleware?: Array<Middleware | null | undefined | false> | undefined;
        platform?: Platform | undefined;
      }>
    >,
  ): Promise<T> {
    throw new Error('Method not implemented.');
  }
  createPopover(
    component: unknown,
    props?: IParams,
    opts?: IPopoverOptions<
      Partial<{
        strategy?: Strategy | undefined;
        placement?: Placement | undefined;
        middleware?: Array<Middleware | null | undefined | false> | undefined;
        platform?: Platform | undefined;
      }>
    >,
  ): IOverlayContainer {
    throw new Error('Method not implemented.');
  }
  tip<T = void>(
    element: HTMLElement,
    component: unknown,
    props?: IParams,
    opts?: ITipOptions,
  ): Promise<T> {
    throw new Error('Method not implemented.');
  }
  createTip(component: unknown, props?: IParams, opts?: ITipOptions): IOverlayContainer {
    throw new Error('Method not implemented.');
  }
  fullScreen<T = void>(
    component: unknown,
    props?: IParams,
    opts?: IAppFullScreenContainerOptions,
  ): Promise<T> {
    throw new Error('Method not implemented.');
  }
  createFullScreen(
    component: unknown,
    props?: IParams,
    opts?: IAppFullScreenContainerOptions,
  ): IOverlayContainer {
    throw new Error('Method not implemented.');
  }
}

/**
 * 唯一界面绘制控制器
 */
export const overlay = new OverlayController();
