import { defineAsyncComponent } from 'vue';

export function asyncImportWidgetProp() {
  const modules: any = import.meta.glob('./widget-*.vue');
  const widgetPropMap = Object.keys(modules).reduce((map, path) => {
    const mKey = path.match(/\/widget-([a-z]+)\.vue$/)?.[1];
    if (mKey) {
      map[mKey] = defineAsyncComponent(modules[path]);
    }
    return map;
  }, {});
  console.log(widgetPropMap);
  return widgetPropMap;
}
