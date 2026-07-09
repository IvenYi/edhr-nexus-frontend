import { createVNode, render, createApp } from 'vue';
import popup from './tmpl-modal.vue';
import { i18n } from '@mobile/locales/setupI18n';
import { registerVxeTableGlobComp } from '@mobile/components/index';

export { CategoryModuleEnum } from '@gct/runtime';

let instance: ReturnType<typeof createVNode> | null = null;
export function drawerSelectorInstance(config: object) {
  const container = document.createElement('div');
  let popupRef: any;
  function readyModal() {
    instance = createVNode(popup, {
      ...config,
      destroyVm: () => {
        //动画结束后销毁组件
        setTimeout(() => {
          render(null, container);
          instance = null;
        }, 300);
      },
    });
    const app = createApp(instance);
    //引入国际化和vxetable
    registerVxeTableGlobComp(app);
    app.config.globalProperties.$t = (key: any, value: any) => i18n.global.t(key, value);
    popupRef = app.mount(container);
  }
  function openPicker(arg): Promise<{
    values: string;
    options: object;
  }> {
    readyModal();
    return popupRef.openPicker(arg);
  }

  return { openPicker };
}
