import { App } from 'vue';
import { DesignNodeType, DesignViewPrefix, NodeRegister } from '@gct/runtime-design';
import { CardFieldDesignProvider } from './card-field-design/card-field-design.provider';
import { DesignPageProvider } from './design-page/design-page.provider';
import { CardFieldDesign } from './card-field-design/components/card-field-design';
import { SimpleCardDesign } from './design-page/components/simple-card-design';

export default {
  install(app: App) {
    app.component(SimpleCardDesign.name!, SimpleCardDesign);
    app.component(CardFieldDesign.name!, CardFieldDesign);

    NodeRegister.register(
      DesignNodeType.PAGE,
      () => new DesignPageProvider(),
      DesignViewPrefix.CARD_DESIGN,
    );

    NodeRegister.register(
      DesignNodeType.PAGE_LOWER,
      () => new DesignPageProvider(),
      DesignViewPrefix.CARD_DESIGN,
    );

    NodeRegister.register(
      DesignNodeType.FIELD,
      () => new CardFieldDesignProvider(),
      DesignViewPrefix.CARD_DESIGN,
    );
  },
};
