/**
 * 此处为mobile的design组件
 * mobile拆开因为import打包会打进渲染器
 */
import { defineAsyncComponent } from 'vue';
import type { Component } from 'vue';

export class AsyncGctComponents {
  static componentMap = new Map<string, Component>();
  static init() {
    const modules = asyncImportModulebyMobile();
    Object.entries(modules).forEach(([path, value]) => {
      const fileNameWithExtension = path.split('/').pop()!;
      const fileNameWithoutExtension = fileNameWithExtension
        .split('-design')
        .slice(0, -1)
        .join('.');
      fileNameWithoutExtension &&
        AsyncGctComponents.componentMap.set(
          'gct-' + fileNameWithoutExtension,
          defineAsyncComponent(value),
        );
    });
    gct.register.designer.mobile.hooks.register.tap((_, designer) => {
      if (designer) {
        AsyncGctComponents.componentMap.set('gct-' + designer.schema.type, designer.component);
      }
    });
    gct.register.designer.mobile.getProviders().forEach((designer) => {
      if (designer) {
        AsyncGctComponents.componentMap.set('gct-' + designer.schema.type, designer.component);
      }
    });
    if (window._gct) {
      _gct.register.designer.mobile.hooks.register.tap((_, tag, designer) => {
        if (designer) {
          AsyncGctComponents.componentMap.set('gct-plugin-' + tag, designer.component as any);
        }
      });
      const keys2 = _gct.register.designer.mobile.getKeys();
      keys2.forEach((key) => {
        const provider = _gct.register.designer.mobile.getProvider(key);
        if (provider) {
          AsyncGctComponents.componentMap.set('gct-plugin-' + key, provider.component as any);
        }
      });
    }
  }
  static getComponentByType(type: string) {
    return AsyncGctComponents.componentMap.get('gct-' + type);
  }

  static getComponentByPluginTag(tag: string) {
    return AsyncGctComponents.componentMap.get('gct-plugin-' + tag);
  }
}

/**
 * 按需加载动态组件
 * @returns
 */
function asyncImportModulebyMobile() {
  const modules: Record<string, () => Promise<Component>> = import.meta.glob(
    `./widgets/mobile/**/**/*-design.{vue,tsx}`,
  );
  return modules;
}
