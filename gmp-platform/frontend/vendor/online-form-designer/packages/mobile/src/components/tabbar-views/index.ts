import type { App } from 'vue';

const modules: Record<string, any> = import.meta.glob('./**/index.vue', { eager: true });

export function registerTabbarViews(app: App) {
  for (const path in modules) {
    const componentConfig = modules[path].default;
    const componentName = 'gct-' + path.split('/')[1];
    app.component(componentName, componentConfig);
  }
}
