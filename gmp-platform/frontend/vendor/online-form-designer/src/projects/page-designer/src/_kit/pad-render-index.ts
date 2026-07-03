import { App } from 'vue';
import MedPro from './kit-medpro/pad/render-index';

const kits = [MedPro];

export default {
  install(app: App) {
    kits.forEach((kit) => app.use(kit));
  },
};
