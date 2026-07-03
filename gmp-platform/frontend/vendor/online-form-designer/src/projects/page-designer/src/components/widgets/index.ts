const entry: Record<string, any> = import.meta.glob('./*-entry.vue', { eager: true });
export function registerWidgets(app) {
  // 全局注册组件
  Object.values({
    ...entry,
  }).forEach((value) => {
    app.component(value.default.name, value.default);
  });
}
