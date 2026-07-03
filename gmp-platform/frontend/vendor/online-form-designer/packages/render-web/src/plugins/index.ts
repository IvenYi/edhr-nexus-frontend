import { App } from 'vue';
import { DesignRenderViewPrefix, RenderNodeRegister, RenderNodeType } from '@gct/runtime-render';
import { RenderCardField } from './render-card-field/render-card-field';
import { RenderCardViewPage } from './render-card-view-page/render-card-view-page';
import { RenderCardFieldProvider } from './render-card-field/render-card-field.provider';
import { RenderCardViewPageProvider } from './render-card-view-page/render-card-view-page.provider';
import RenderDesignEditor from './render-design-editor';

export default {
  install(app: App) {
    app.use(RenderDesignEditor);

    app.component(RenderCardField.name!, RenderCardField);
    app.component(RenderCardViewPage.name!, RenderCardViewPage);

    RenderNodeRegister.register(
      RenderNodeType.FIELD,
      () => new RenderCardFieldProvider(),
      DesignRenderViewPrefix.CARD_VIEW,
    );
    RenderNodeRegister.register(
      RenderNodeType.PAGE,
      () => new RenderCardViewPageProvider(),
      DesignRenderViewPrefix.CARD_VIEW,
    );
    RenderNodeRegister.register(
      RenderNodeType.PAGE_LOWER,
      () => new RenderCardViewPageProvider(),
      DesignRenderViewPrefix.CARD_VIEW,
    );
  },
};
