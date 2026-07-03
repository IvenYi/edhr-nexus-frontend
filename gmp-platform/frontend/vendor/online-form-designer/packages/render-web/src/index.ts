import { App } from 'vue';
import Plugins from './plugins';

export default {
  install(app: App) {
    app.use(Plugins);
  },
};

export * from './views';
