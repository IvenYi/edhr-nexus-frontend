import { App } from 'vue';
import Web from './web';

export default {
  install(app: App) {
    app.use(Web);
  },
};
