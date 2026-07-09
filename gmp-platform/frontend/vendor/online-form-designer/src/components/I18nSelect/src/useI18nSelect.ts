import { VNode, createVNode, render, unref, ref, createApp } from 'vue';
import type { App, Ref } from 'vue';
import { has } from 'lodash-es';
import I18nSelectModal from './i18n-select-modal.vue';
import { registerGlobComp } from '../../registerGlobComp';

export interface I18nSelectProps {
  i18nModalKey?: string;
  saveCallback?: (params: Recordable<any>) => void;
  destroyCallback?: (params: Recordable<any>) => void;
}

export interface IUseI18nSelectOptions {
  target?: any;
  props?: Partial<I18nSelectProps>;
}

export function useI18nSelect() {
  let app: App | null = null;
  let instance: any = null;
  const i18nModalKey = ref<string>('');

  function open(params: Partial<I18nSelectProps> | Partial<IUseI18nSelectOptions>): void {
    let props: Partial<I18nSelectProps>;
    let target: HTMLElement | Ref<ElRef> = document.body;
    if (has(params, 'target') || has(params, 'props')) {
      const options = params as Partial<IUseI18nSelectOptions>;
      props = options.props || {};
      target = options.target || document.body;
    } else {
      props = params as Partial<I18nSelectProps>;
    }

    i18nModalKey.value =
      props.i18nModalKey || `i18n-select-modal-${Math.random().toString(16).substring(8)}`;

    const propsData = {
      ...props,
      destroyCallback: () => close(props?.destroyCallback),
      i18nModalKey: unref(i18nModalKey),
    };

    if (!app) {
      const container = document.createElement('div');
      container.id = unref(i18nModalKey);

      // instance = createVNode(I18nSelectModal, propsData);
      // render(instance, container);
      const t = unref(target as Ref<ElRef>);
      t?.appendChild(container);

      app = createApp(I18nSelectModal, propsData);
      registerGlobComp(app);
      instance = app.mount(container);
    }
    // instance.component!.exposed!.open();
    instance.open();
  }

  function close(callback) {
    callback && callback();
    document.querySelector(`#${unref(i18nModalKey)}`)!.remove();
    if (app) {
      app.unmount();
      app = null;
    }
  }

  return {
    open,
    close,
  };
}
