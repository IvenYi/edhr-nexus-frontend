import { defineAsyncComponent } from 'vue';
import type { PaperWidget } from '/@online-form/views/types/paper-widget';

type AsyncConfigModule = Record<
  string,
  {
    widget: PaperWidget.BasicSchema;
  }
>;

export function asyncImportWidgetConfig() {
  const modules: AsyncConfigModule = import.meta.glob(['./**/*.config.ts', '!./base.config.ts'], {
    eager: true,
  });

  const widgetConfigMap: AsyncConfigModule = Object.keys(modules).reduce((map, path) => {
    const mKey = path.match(/\/([a-z]+)\.config\.ts$/)?.[1];
    if (mKey) {
      map[mKey] = modules[path];
    }
    return map;
  }, {});

  return widgetConfigMap;
}

export function asyncImportWidgetConfigList() {
  const modules: AsyncConfigModule = import.meta.glob(['./**/*.config.ts', '!./base.config.ts'], {
    eager: true,
  });

  const widgetConfigList: PaperWidget.BasicSchema[] = Object.values(modules).map((m) => m.widget);
  widgetConfigList.sort((a, b) => a.sort - b.sort);
  return widgetConfigList;
}

export function asyncImportWidgetDesign() {
  const modules: any = import.meta.glob('../**/*-design.vue');
  const widgetDesignMap = Object.keys(modules).reduce((map, path) => {
    const mKey = path.match(/\/([a-z]+)-design\.vue$/)?.[1];
    if (mKey) {
      map[mKey] = defineAsyncComponent(modules[path]);
    }
    return map;
  }, {});
  // console.log(widgetDesignMap);
  return widgetDesignMap;
}

// function asyncImportWidgetRender() {
//   const modules: any = import.meta.glob('./**/*-render.vue');
//   const widgetRenderMap = Object.keys(modules).reduce((map, path) => {
//     const mKey = path.match(/\/([a-z]+)-render\.vue$/)?.[1];
//     if (mKey) {
//       map[mKey] = defineAsyncComponent(modules[path]);
//     }
//     return map;
//   }, {});
//   // console.log(widgetRenderMap);
//   return widgetRenderMap;
// }

function syncImportWidgetRender() {
  const modules: any = import.meta.glob(
    ['./**/*-render.vue', '!./container/**/*'],
    { eager: true }
  );

  const widgetRenderMap = Object.keys(modules).reduce((map, path) => {
    const mKey = path.match(/\/([a-z]+)-render\.vue$/)?.[1];
    if (mKey) {
      map[mKey] = modules[path].default; // 直接使用同步加载的组件
    }
    return map;
  }, {});

  return widgetRenderMap;
}

// export const widgetRenderMap = asyncImportWidgetRender();
export const widgetRenderMap = syncImportWidgetRender();
