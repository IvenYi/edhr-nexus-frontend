import { defineAsyncComponent } from 'vue';
import type { CellWidget } from '/@online-form/views/designer/types/cell-widget';

type AsyncConfigModule = Record<
  string,
  {
    config: CellWidget.BasicSchema;
  }
>;

export function asyncImportWidgetConfig() {
  const modules = import.meta.glob('../views/__cell_widgets__/**/*.config.ts', {
    eager: true,
  }) as AsyncConfigModule;

  return Object.keys(modules).reduce<AsyncConfigModule>((map, path) => {
    const mKey = path.match(/\/([a-z-]+)\.config\.ts$/)?.[1];
    if (mKey) {
      map[mKey] = modules[path];
    }
    return map;
  }, {});
}

export const widgetConfigMap = asyncImportWidgetConfig();

export function asyncImportWidgetDesign() {
  const modules = import.meta.glob('../views/__cell_widgets__/**/*-design.vue');
  return Object.keys(modules).reduce<Record<string, ReturnType<typeof defineAsyncComponent>>>(
    (map, path) => {
      const mKey = path.match(/\/([a-z-]+)-design\.vue$/)?.[1];
      if (mKey) {
        map[mKey] = defineAsyncComponent(modules[path] as any);
      }
      return map;
    },
    {},
  );
}

export function asyncImportWidgetProps() {
  return {};
}

export function asyncImportWidgetStyle() {
  return {};
}
