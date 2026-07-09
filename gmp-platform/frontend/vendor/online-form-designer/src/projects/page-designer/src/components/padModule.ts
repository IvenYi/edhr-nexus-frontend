/**
 * 此处为pad的render组件
 * pad拆开因为import打包会打进渲染器
 */
import { defineAsyncComponent } from 'vue';
import type { Component } from 'vue';

export class AsyncGctComponents {
  static componentMap = new Map<string, Component>();
  static init() {
    const modules = asyncImportModulebyPad();
    Object.entries(modules).forEach(([path, value]) => {
      // eslint-disable-next-line no-useless-escape
      const key = path.match(/\/([^\/]+?)-render\.(vue|tsx)$/)?.[1];
      key && AsyncGctComponents.componentMap.set('gct-' + key, defineAsyncComponent(value));
    });
    // 注册绘制态相关内容
    gct.register.render.pad.hooks.register.tap((_, tag, com) => {
      if (tag && com) {
        AsyncGctComponents.componentMap.set('gct-' + tag, com);
      }
    });
    const keys = gct.register.render.pad.keys();
    keys.forEach((key) => {
      const com = gct.register.render.pad.get(key);
      if (com) {
        AsyncGctComponents.componentMap.set('gct-' + key, com);
      }
    });
    // console.log();
    // if (window._gct) {
    //   _gct.register.render.pad.hooks.register.tap((_, tag, com) => {
    //     if (tag && com) {
    //       AsyncGctComponents.componentMap.set('gct-plugin-' + tag, com as any);
    //     }
    //   });
    //   const keys2 = _gct.register.render.pad.keys();
    //   keys2.forEach((key) => {
    //     const com = _gct.register.render.pad.get(key);
    //     if (com) {
    //       AsyncGctComponents.componentMap.set('gct-plugin-' + key, com as any);
    //     }
    //   });
    // }
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
function asyncImportModulebyPad() {
  const modules: Record<string, () => Promise<Component>> = import.meta.glob(
    `./widgets/pad/**/**/*-render.{vue,tsx}`,
  );
  return modules;
}
