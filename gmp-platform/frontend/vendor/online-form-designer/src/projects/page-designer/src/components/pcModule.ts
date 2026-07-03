import { defineAsyncComponent } from 'vue';
import type { Component } from 'vue';

export class AsyncGctComponents {
  static componentMap = new Map<string, Component>();
  static init(design = false) {
    /**根据文件名引用异步组件 */
    const modules = asyncImportModules(design);
    Object.entries(modules).forEach(([path, value]) => {
      const fileNameWithExtension = path.split('/').pop()!;
      const fileNameWithoutExtension = fileNameWithExtension
        .split(design ? '-design' : '-render')
        .slice(0, -1)
        .join('.');
      fileNameWithoutExtension &&
        AsyncGctComponents.componentMap.set(
          'gct-' + fileNameWithoutExtension,
          defineAsyncComponent(value),
        );
    });
    // 注册设计态相关内容
    if (design === true) {
      gct.register.designer.web.hooks.register.tap((_, designer) => {
        if (designer) {
          AsyncGctComponents.componentMap.set('gct-' + designer.schema.type, designer.component);
        }
      });
      gct.register.designer.web.getProviders().forEach((designer) => {
        if (designer) {
          AsyncGctComponents.componentMap.set('gct-' + designer.schema.type, designer.component);
        }
      });
      if (window._gct) {
        _gct.register.designer.web.hooks.register.tap((_, tag, designer) => {
          if (designer) {
            AsyncGctComponents.componentMap.set('gct-plugin-' + tag, designer.component as any);
          }
        });
        const keys = _gct.register.designer.web.getKeys();
        keys.forEach((key) => {
          const provider = _gct.register.designer.web.getProvider(key);
          if (provider) {
            AsyncGctComponents.componentMap.set('gct-plugin-' + key, provider.component as any);
          }
        });
      }
    } else {
      // 注册绘制态相关内容
      gct.register.render.web.hooks.register.tap((_, tag, com) => {
        if (tag && com) {
          AsyncGctComponents.componentMap.set('gct-' + tag, com);
        }
      });
      const keys = gct.register.render.web.keys();
      keys.forEach((key) => {
        const com = gct.register.render.web.get(key);
        if (com) {
          AsyncGctComponents.componentMap.set('gct-' + key, com);
        }
      });
      if (window._gct) {
        // 注册绘制态相关内容
        _gct.register.render.web.hooks.register.tap((_, tag, com) => {
          if (tag && com) {
            AsyncGctComponents.componentMap.set('gct-plugin-' + tag, com as any);
          }
        });
        const keys2 = _gct.register.render.web.keys();
        keys2.forEach((key) => {
          const com = _gct.register.render.web.get(key);
          if (com) {
            AsyncGctComponents.componentMap.set('gct-plugin-' + key, com as any);
          }
        });
      }
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
function asyncImportModules(design) {
  const modules: Record<string, () => Promise<Component>> = design
    ? import.meta.glob(`./widgets/web/**/**/*-design.{vue,tsx}`)
    : import.meta.glob(`./widgets/web/**/**/*-render.{vue,tsx}`);
  return modules;
}
