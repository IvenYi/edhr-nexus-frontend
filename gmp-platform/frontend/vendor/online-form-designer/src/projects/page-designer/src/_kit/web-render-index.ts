import { App } from 'vue';
import Deprecated from './deprecated/web/render-index';
import MedPro from './kit-medpro/web/render-index';
import eDHR from './kit-eDHR/web/render-index';
import QMS from './kit-QMS/web/render-index';

const kits = [MedPro, eDHR, QMS];

export default {
  install(app: App) {
    app.use(Deprecated);
    kits.forEach((kit) => app.use(kit));
  },
};
