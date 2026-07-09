import { App } from 'vue';
import Web from './web';
import Pad from './pad';
import Mobile from './mobile';

export default {
  install(app: App) {
    app.use(Web);
    app.use(Pad);
    app.use(Mobile);
  },
};
