import { createVNode, render } from 'vue';
import type { DefineComponent, VNodeNormalizedChildren } from 'vue';
import { renderToNewApp } from './dialog';

export interface Payload {
  popupProps?: any; // 组件属性
  context?: any; // 上下文
  [key: string]: any;
}

export class GctPopup {
  static rootApp: any;
  static open<P>(
    component: DefineComponent<P>,
    payload: (P | ({} extends P ? null : never)) & Payload = {},
    children?: VNodeNormalizedChildren,
  ) {
    const container: any = document.createElement('div');
    const id = 'gct-dialog-' + Date.now() + '-' + Math.random().toString(36).substring(2, 10);
    container.id = id;
    let destroyFn: Function = () => {};
    const props = {
      ...payload,
      popupProps: {
        _after_close_: () => {
          console.log('beforeClose');
          destroyFn();
          return true;
        },
        position: 'right',
        ...payload.popupProps,
      },
    };
    const instance = createVNode(component, props as any, children);
    destroyFn = renderToNewApp(instance, container, this.rootApp?.appContext);
  }
}
