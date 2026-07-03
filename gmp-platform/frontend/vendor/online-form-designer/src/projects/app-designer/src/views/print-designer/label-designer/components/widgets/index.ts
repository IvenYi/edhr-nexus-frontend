const comps = {};
const widgets: Record<string, any> = import.meta.glob('./*.vue', { eager: true });
for (const path in widgets) {
  const cname = widgets[path].default.name;
  comps[cname] = widgets[path].default;
}
export function registerWidgets(app) {
  // 全局注册组件
  Object.values({
    ...widgets,
  }).forEach((value) => {
    app.component(value.default.name, value.default);
  });
}
console.log(comps);
export default comps;
