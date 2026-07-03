import type { App } from 'vue';

const modules: Record<string, any> = import.meta.glob('./**/index.vue', { eager: true });
export function registerWidgets(app: App) {
  // 全局注册组件
  for (const path in modules) {
    const componentConfig = modules[path].default;
    const componentName = 'gct-old-' + path.split('/')[1];
    if (path.split('/')[1] === 'user') {
      app.component('GctUser', componentConfig);
    } else {
      app.component(componentName, componentConfig);
    }
  }
}
