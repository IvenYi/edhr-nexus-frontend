function syncImportWidgetRender() {
  const modules: any = import.meta.glob(['./**/*-runtime.vue', '!./container/**/*'], {
    eager: true,
  });

  const widgetRuntimeMap = Object.keys(modules).reduce((map, path) => {
    const mKey = path.match(/\/([a-z]+)-runtime\.vue$/)?.[1];
    if (mKey) {
      map[mKey] = modules[path].default; // 直接使用同步加载的组件
    }
    return map;
  }, {});

  return widgetRuntimeMap;
}

export const widgetRuntimeMap = syncImportWidgetRender();
