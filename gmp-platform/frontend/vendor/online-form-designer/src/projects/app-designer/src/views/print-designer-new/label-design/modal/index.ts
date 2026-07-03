import { App, createApp, createVNode, render as vueRender } from 'vue';
import modals from './template.vue';
import { registerGlobComp } from '/@/components/registerGlobComp';

let app: App | null = null;
let instance: any = null;
export function useModalPicker() {
  // let userRef: any;
  const container = document.createDocumentFragment() as any;
  function readyModal() {
    app = createApp(modals, {
      destroyVm,
    });
    // const vm = createVNode(modals, {
    //   destroyVm,
    // });
    // vueRender(vm, container);
    registerGlobComp(app);
    instance = app.mount(container);
    // userRef = vm.component?.exposed;
  }
  function destroyVm() {
    setTimeout(() => {
      // vueRender(null, container);
      // userRef = null;
      app?.unmount();
      app = null;
    }, 300);
  }
  /**
   * 选择人员
   * @param param0
   */
  function openPickerLabel() {
    readyModal();
    return instance;
  }

  return {
    openPickerLabel,
  };
}
