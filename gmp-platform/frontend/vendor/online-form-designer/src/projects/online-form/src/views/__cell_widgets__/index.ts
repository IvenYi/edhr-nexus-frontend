import { defineAsyncComponent } from 'vue';
import type { CellWidget } from '/@online-form/views/designer/types/cell-widget';

type AsyncConfigModule = Record<
  string,
  {
    config: CellWidget.BasicSchema;
  }
>;

export function asyncImportWidgetConfig() {
  const modules: AsyncConfigModule = import.meta.glob(['./**/*.config.ts', '!./base.config.ts'], {
    eager: true,
  });

  const widgetConfigMap: AsyncConfigModule = Object.keys(modules).reduce((map, path) => {
    const mKey = path.match(/\/([a-z-]+)\.config\.ts$/)?.[1];
    if (mKey) {
      map[mKey] = modules[path];
    }
    return map;
  }, {});

  return widgetConfigMap;
}

export const widgetConfigMap = asyncImportWidgetConfig();

export function asyncImportWidgetDesign() {
  const modules: any = import.meta.glob('./**/*-design.vue');
  const widgetDesignMap = Object.keys(modules).reduce((map, path) => {
    const mKey = path.match(/\/([a-z-]+)-design\.vue$/)?.[1];
    if (mKey) {
      map[mKey] = defineAsyncComponent(modules[path]);
    }
    return map;
  }, {});
  // console.log(widgetDesignMap);
  return widgetDesignMap;
}

export function asyncImportWidgetProps() {
  const modules: any = import.meta.glob('./**/*-props.vue');
  const widgetPropsMap = Object.keys(modules).reduce((map, path) => {
    const mKey = path.match(/\/([a-z-]+)-props\.vue$/)?.[1];
    if (mKey) {
      map[mKey] = defineAsyncComponent(modules[path]);
    }
    return map;
  }, {});
  console.log(widgetPropsMap);
  return widgetPropsMap;
}

export function asyncImportWidgetStyle() {
  const modules: any = import.meta.glob('./**/*-style.vue');
  const widgetStyleMap = Object.keys(modules).reduce((map, path) => {
    const mKey = path.match(/\/([a-z-]+)-style\.vue$/)?.[1];
    if (mKey) {
      map[mKey] = defineAsyncComponent(modules[path]);
    }
    return map;
  }, {});
  console.log(widgetStyleMap);
  return widgetStyleMap;
}
