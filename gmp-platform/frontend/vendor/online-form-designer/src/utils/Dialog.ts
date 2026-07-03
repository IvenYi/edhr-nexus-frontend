import { ConfigProvider } from 'ant-design-vue';
import { createVNode, render, createApp } from 'vue';
import { i18n } from '@/locales/setupI18n';

export interface Payload {
  props?: object;
  options?: object;
  [key: string]: any;
}

export class GctDialog {
  static open(component: any, payload: Payload = {}) {
    const container = document.createElement('div');
    const dialogId = 'gct-dialog-' + Date.now() + '-' + Math.random().toString(36).substring(2, 10);
    container.id = dialogId;
    const payloadNext = {
      ...payload,
      options: {
        getContainer: () => document.querySelector('#' + dialogId),
        // destroyOnClose: true,
        afterClose: () => {
          // model的回调
          setTimeout(() => {
            if (!container) return;
            render(null, container);
            container.remove();
          }, 300);
        },
        onAfterVisibleChange: (visible: boolean) => {
          // drawer关闭时销毁
          if (visible) return;
          setTimeout(() => {
            if (!container) return;
            render(null, container);
            container.remove();
          }, 300);
        },
        ...payload.options,
      },
    };
    const locale = (window as any).___GCT___.locale;
    const { getAntdLocale } = locale;
    const instance = createVNode(
      ConfigProvider,
      {
        locale: getAntdLocale.value,
      },
      [createVNode(component, payloadNext as any)],
    );

    // render(instance, container);
    document.body.appendChild(container);

    const app = createApp(instance);
    //引入国际化和vxetable
    void import('../components/registerGlobComp').then(({ registerGlobComp }) => {
      registerGlobComp(app);
      app.use(i18n);
      app.mount(container);
    });
  }
}
