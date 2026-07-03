import { App } from 'vue';
import Design from './design';
import Material from './material';
import Panel from './panel';
import Editor from './editor';
import { DesignIconButton } from './design-icon-button/design-icon-button';
import { MobileContainer } from './mobile-container/mobile-container';

export default {
  install(app: App) {
    app.use(Design);
    app.use(Material);
    app.use(Panel);
    app.use(Editor);

    app.component(DesignIconButton.name!, DesignIconButton);
    app.component(MobileContainer.name!, MobileContainer);
  },
};
