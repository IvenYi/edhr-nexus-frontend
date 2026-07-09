import { App } from 'vue';
import Deprecated from './deprecated';
import MedPro from './kit-medpro';
import eDHR from './kit-eDHR';
import QMS from './kit-QMS';

const kits = [MedPro, eDHR, QMS];

export default {
  install(app: App) {
    app.use(Deprecated);
    kits.forEach((kit) => app.use(kit));
  },
};
