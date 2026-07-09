import { App } from 'vue';
import Mobile from './mobile';
import Web from './web';

export default {
  install(app: App) {
    app.use(Mobile);
    app.use(Web);
  },
};
