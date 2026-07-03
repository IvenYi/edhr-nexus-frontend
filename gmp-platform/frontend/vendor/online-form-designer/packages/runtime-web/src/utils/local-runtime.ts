import { reactive } from 'vue';
import { AsyncSeriesHook } from 'qx-util';

const namespace = 'gct';

function bem(block: string, blockSuffix?: string, element?: string, modifier?: string): string {
  let cls = `${namespace}-${block}`;
  if (blockSuffix) cls += `-${blockSuffix}`;
  if (element) cls += `__${element}`;
  if (modifier) cls += `--${modifier}`;
  return cls;
}

export function useNamespace(block: string) {
  return {
    b: (blockSuffix = '') => bem(block, blockSuffix),
    e: (element?: string) => (element ? bem(block, '', element) : ''),
    m: (modifier?: string) => (modifier ? bem(block, '', '', modifier) : ''),
    is: (name: string, state = true) => (state ? `is-${name}` : ''),
  };
}

export type IModalData<T = IData> = {
  ok: boolean;
  close?: boolean;
  data?: T[];
  params?: IParams;
};

export type IModalOptions = IParams;
export type IDrawerOptions = IParams;
export type IAppFullScreenContainerOptions = IParams;
export type IPopoverOptions<T = unknown> = IParams & { options?: T };
export type ITipOptions = IParams;

export type IOverlayContainer = {
  present(): Promise<void>;
  dismiss(data?: unknown): Promise<void>;
  onWillDismiss<T = unknown>(): Promise<T>;
};

export type IOverlayPopoverContainer = IOverlayContainer;

type ModalHooks = {
  shouldDismiss: AsyncSeriesHook<[], { allowClose?: boolean }>;
  beforeDismiss: AsyncSeriesHook<[], IModalData>;
};

export interface IModal {
  ignoreDismissCheck: boolean;
  state: { okDisabled?: boolean; cancelDisabled?: boolean };
  hooks: ModalHooks;
  dismiss(data?: IModalData): Promise<boolean>;
  setOptions?: (options: object) => void;
  ok?: () => Promise<IModalData | null>;
  cancel?: () => Promise<boolean>;
  callback(ok?: () => Promise<IModalData | null>, cancel?: () => Promise<boolean>): void;
}

type ModalConstructorOptions = {
  dismiss?: (data: IModalData) => void;
  setOptions?: (data: object) => void;
};

export class Modal implements IModal {
  ignoreDismissCheck = false;

  state = reactive({
    okDisabled: false,
    cancelDisabled: false,
  });

  hooks = {
    shouldDismiss: new AsyncSeriesHook<[], { allowClose?: boolean }>(),
    beforeDismiss: new AsyncSeriesHook<[], IModalData>(),
  };

  ok?: () => Promise<IModalData | null>;

  cancel?: () => Promise<boolean>;

  setOptions?: (options: object) => void;

  private dismissHandler: (data: IModalData) => void = () => undefined;

  constructor(opts: ModalConstructorOptions) {
    if (opts.dismiss) this.dismissHandler = opts.dismiss;
    if (opts.setOptions) this.setOptions = opts.setOptions;
  }

  callback(ok?: () => Promise<IModalData | null>, cancel?: () => Promise<boolean>): void {
    if (ok) this.ok = ok;
    if (cancel) this.cancel = cancel;
  }

  async dismiss(data: IModalData = { ok: false, data: [] }): Promise<boolean> {
    const context: IData = {};
    if (this.ignoreDismissCheck !== true) {
      await this.hooks.shouldDismiss.call(context);
    }
    if (context.allowClose === false) {
      return false;
    }

    await this.hooks.beforeDismiss.call(data);
    this.dismissHandler(data);
    this.hooks.shouldDismiss.clear();
    this.hooks.beforeDismiss.clear();
    return true;
  }
}
