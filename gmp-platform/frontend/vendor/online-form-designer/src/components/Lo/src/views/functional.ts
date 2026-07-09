// import type { Options, Props } from './typing';
import LoDrawer from './lo-drawer.vue';
// import { isClient } from '/@/utils/is';
import { App, createApp, createVNode, render } from 'vue';
import { LoDataObject } from '../types';
import { registerGlobComp } from '/@/components/registerGlobComp';

// interface Options {
//   data: object;
//   callback: (value: string) => void;
// }

interface InitOptions {
  data: LoDataObject;
  callback: (value: string) => void;
}

// let instance: ReturnType<typeof createVNode> | null = null;
let app: App | null = null;
let instance: any = null;
export function openLoEditorDrawer(options: InitOptions) {
  if (!app) {
    // const propsData = {};
    const container = document.createElement('div');
    // Object.assign(propsData, options);
    // instance = createVNode(LoDrawer);
    // render(instance, container);
    document.body.appendChild(container);

    app = createApp(LoDrawer);
    registerGlobComp(app);
    instance = app.mount(container);
  }
  // instance.component?.exposed?.initLoEditor(options);
  instance.initLoEditor(options);
}

export function generateLoId() {
  return 'lo_' + Math.random().toString(32).slice(2, 8);
}
