import { App } from 'vue';
import Components from './components';
import Plugins from './plugins';
import Editors from './editor';

export * from './components';
export * from './interface';
export * from './constant';
export * from './controller';
export * from './data';
export * from './hooks';
export * from './props';
export * from './provider';
export * from './register';
export * from './utils';
export * from './views';

export default {
  install(app: App) {
    app.use(Components);
    app.use(Plugins);
    app.use(Editors);
  },
};
