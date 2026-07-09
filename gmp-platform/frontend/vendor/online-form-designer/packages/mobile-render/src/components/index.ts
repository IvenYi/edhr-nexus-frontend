import { App } from 'vue';
import { MenuImage } from './menu-image/menu-image';
export { createModal } from './app-modal/app-modal-component';

export default {
  install(app: App) {
    app.component(MenuImage.name!, MenuImage);
  },
};
