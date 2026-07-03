import type { Component } from 'vue';

/**
 * 同步加载动态组件
 * @returns
 */
function syncImportModules() {
  const modules: Record<string, { default: Component }> = import.meta.glob(
    `./**/*-render.{vue,tsx}`,
    { eager: true }, // 直接同步加载模块
  );

  const widgetRenderMap = Object.keys(modules).reduce((map, path) => {
    const fileNameWithExtension = path.split('/').pop()!;
    const fileNameWithoutExtension = fileNameWithExtension.split('-render').slice(0, -1).join('.');

    if (fileNameWithoutExtension) {
      map[fileNameWithoutExtension] = modules[path].default; // 直接使用同步加载的组件
    }

    return map;
  }, {});

  return widgetRenderMap;
}

export const nocodeMobileWidgetRenderMap = syncImportModules();
