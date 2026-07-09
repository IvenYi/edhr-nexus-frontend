import { App } from 'vue';
import Deprecated from './deprecated/mobile/render-index';
import MedPro from './kit-medpro/mobile/render-index';

const kits = [MedPro];

export default {
  install(app: App) {
    app.use(Deprecated);
    kits.forEach((kit) => app.use(kit));
  },
};
