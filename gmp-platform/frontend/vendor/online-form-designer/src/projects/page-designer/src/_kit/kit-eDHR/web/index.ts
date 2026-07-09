import { App } from 'vue';
import { KitType } from '../../enums';

const importedPlugins = {};

// 使用 import.meta.glob() 自动引入所有插件文件
const pluginModules = import.meta.glob('./**/schema.ts', { eager: true });
for (const key of Object.keys(pluginModules)) {
  const match = key.replaceAll('-', '_').match(/\.\/(\w+)\/schema/);
  if (match) {
    const pluginName = match[1];
    console.log('pluginName', pluginName);
    const pluginType = KitType[pluginName.toUpperCase()];
    importedPlugins[pluginType] = () => {
      return pluginModules[key].default;
    };
  }
}

export default {
  install(_app: App) {
    Object.keys(importedPlugins).forEach(async (key) => {
      const pluginClass = await importedPlugins[key]();
      pluginClass && gct.register.designer.web.register(`${key}`, () => new pluginClass());
    });
  },
};
