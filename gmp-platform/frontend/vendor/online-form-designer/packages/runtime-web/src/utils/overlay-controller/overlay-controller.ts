import { isFunction, isString } from 'lodash-es';
import { h, resolveComponent, ConcreteComponent } from 'vue';
import { createAppFullScreenContainer } from '../../components/app-full-screen-container/app-full-screen-container';
import { createDrawer } from '../../components/app-drawer/app-drawer-component';
import { createModal } from '../../components/app-modal/app-modal-component';
import {
  FloatingUIConfig,
  createPopover,
} from '../../components/app-popover/app-popover-component';
import { createTip } from '../../components/app-tip/app-tip-component';

type IModalData<T = IData> = {
  ok: boolean;
  close?: boolean;
  data?: T[];
  params?: IParams;
};
type IModalOptions = IParams;
type IDrawerOptions = IParams;
type IAppFullScreenContainerOptions = IParams;
type IPopoverOptions<T = unknown> = IParams & { floatingUIConfig?: T };
type ITipOptions = IParams;
type IOverlayContainer = {
  present(): Promise<void>;
  dismiss(data?: unknown): Promise<void>;
  onWillDismiss<T = unknown>(): Promise<T>;
};
type IOverlayPopoverContainer = IOverlayContainer;
type IOverlayController = IParams;

function resolveComponentOrStr(component: unknown): string | ConcreteComponent {
  return isString(component) ? resolveComponent(component) : (component as ConcreteComponent);
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
      isFunction(component) ? component : () => h(resolveComponentOrStr(component), { ...props }),
      opts,
    );
  }

  drawer<T = IModalData>(component: unknown, props?: any, opts?: IDrawerOptions): Promise<T> {
    const modal = this.createDrawer(component, props, opts);
    modal.present();
    return modal.onWillDismiss();
  }

  createDrawer(component: unknown, props?: any, opts?: IDrawerOptions): IOverlayContainer {
    return createDrawer(
      isFunction(component) ? component : () => h(resolveComponentOrStr(component), { ...props }),
      opts,
    );
  }

  popover<T = IModalData>(
    element: HTMLElement,
    component: unknown,
    props?: IParams,
    opts?: IPopoverOptions<FloatingUIConfig>,
  ): Promise<T> {
    const popover = this.createPopover(component, props, opts);
    popover.present(element);
    return popover.onWillDismiss();
  }

  createPopover(
    component: unknown,
    props?: IParams,
    opts?: IPopoverOptions<FloatingUIConfig>,
  ): IOverlayPopoverContainer {
    return createPopover(
      isFunction(component) ? component : () => h(resolveComponentOrStr(component), { ...props }),
      opts,
    );
  }

  tip<T = IModalData>(
    element: HTMLElement,
    component: unknown,
    props?: IParams,
    opts?: ITipOptions,
  ): Promise<T> {
    const tip = this.createTip(component, props, opts);
    tip.present(element);
    return tip.onWillDismiss();
  }

  createTip(component: unknown, props?: IParams, opts?: ITipOptions): IOverlayPopoverContainer {
    return createTip(
      isFunction(component) ? component : () => h(resolveComponentOrStr(component), { ...props }),
      opts,
    );
  }

  fullScreen<T = IModalData>(
    component: unknown,
    props?: IParams,
    opts?: IAppFullScreenContainerOptions,
  ): Promise<T> {
    const fullContainer = this.createFullScreen(component, props, opts);
    fullContainer.present();
    return fullContainer.onWillDismiss();
  }

  createFullScreen(
    component: unknown,
    props?: IParams,
    opts?: IAppFullScreenContainerOptions,
  ): IOverlayContainer {
    return createAppFullScreenContainer(
      isFunction(component) ? component : () => h(resolveComponentOrStr(component), { ...props }),
      opts,
    );
  }
}

/**
 * 唯一界面绘制控制器
 */
export const overlay = new OverlayController();
