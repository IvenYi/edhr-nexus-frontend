import { createVNode, render, h, getCurrentInstance, createApp } from 'vue';
import type { DefineComponent, VNodeNormalizedChildren } from 'vue';
import type { DialogProps } from 'vant';

// 核心继承逻辑
export function inheritFromParent(childApp: any, parentContext: any) {
  // 复用全局插件
  const pluginRegistry = new Set(parentContext.app._context.plugins);

  // 1. 继承已注册的插件
  pluginRegistry.forEach((plugin) => {
    // 跳过已安装插件避免重复初始化
    if (!childApp._context.plugins.has(plugin)) {
      childApp.use(plugin, parentContext.config.globalProperties);
    }
  });

  // 2. 继承全局组件
  for (const [key, comp] of Object.entries(parentContext.components)) {
    childApp.component(key, comp);
  }

  // 3. 继承指令
  for (const [key, directive] of Object.entries(parentContext.directives)) {
    childApp.directive(key, directive);
  }

  // 4. 合并全局属性 (如$t)
  Object.defineProperties(
    childApp.config.globalProperties,
    Object.getOwnPropertyDescriptors(parentContext.config.globalProperties),
  );
}

/**
 * 创建一个新的app并绘制到其中
 * @export
 * @param vnode
 * @param container
 * @return {*}
 */
export function renderToNewApp(vnode: any, container: any, parentContext?: any) {
  const app = createApp(vnode);
  if (parentContext) {
    inheritFromParent(app, parentContext);
  }
  app.mount(container);
  document.body.appendChild(container);
  return () => {
    setTimeout(() => {
      console.log('app unmount');
      if (!container) return;
      render(null, container);
      container.remove();
      app?.unmount();
    }, 100);
  };
}

export interface Payload {
  dialogProps?: DialogProps; // 组件属性
}

export class GctDialog {
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
    /** 销毁弹窗函数 */
    const _destroy_dialog = () => {
      console.log('_destroy_dialog:' + id);
      destroyFn();
    };

    const props = {
      ...payload,
      _destroy_dialog,
      dialogProps: {
        onClose: () => {
          _destroy_dialog();
        },
        ...(payload.dialogProps ?? {}),
      },
    };

    const instance = createVNode(component, props as any, children);
    destroyFn = renderToNewApp(instance, container, this.rootApp?.appContext);
  }
}
