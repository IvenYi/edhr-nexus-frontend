import { App, createApp, createVNode, render as vueRender } from 'vue';
import modals from './view.vue';
import { EventCategory } from '/@page-designer/enum';
import { registerGlobComp } from '/@/components/registerGlobComp';
export function useEventPicker() {
  let userRef: any;
  let app: App | null = null;
  const container = document.createDocumentFragment() as any;
  function readyModal() {
    const vm = createVNode(modals, { destroyVm });
    // vueRender(vm, container);
    // userRef = vm.component?.exposed;
    app = createApp(vm);
    registerGlobComp(app);
    userRef = app.mount(container);
  }
  function destroyVm() {
    setTimeout(() => {
      // vueRender(null, container);
      userRef = null;
      app?.unmount();
      app = null;
    }, 300);
  }
  /**
   * 选择人员
   * @param param0
   */
  function openPickerEvent({
    eventType,
    params,
    hiddenEventCategory = [],
  }: {
    eventType: string;
    params: string[];
    /**隐藏的类型 */
    hiddenEventCategory?: EventCategory[];
  }): Promise<{ eventCategory: EventCategory; event: any }> {
    readyModal();
    return new Promise((resolve, reject) => {
      userRef.handleOpenEvent(
        {
          eventType,
          params,
          hiddenEventCategory,
        },
        (arg) => {
          resolve(arg);
        },
      );
    });
  }

  return {
    openPickerEvent,
  };
}
