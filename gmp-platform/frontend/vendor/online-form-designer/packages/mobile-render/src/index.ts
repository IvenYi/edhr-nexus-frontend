import { App } from 'vue';
import Components from './components';
import Plugins from './plugins';
import Vant from 'vant';
// import { OverlayController } from './utils';
// import 'vant/lib/index.css';

// if (!window.gct.openUtil) {
//   window.gct.openUtil = new OverlayController();
// }

export default {
  install(app: App) {
    app.use(Components);
    app.use(Vant);
    app.use(Plugins);
  },
};

export * from './constant';
export * from './interface';
export * from './utils';
export * from './hooks';
export * from './views';
