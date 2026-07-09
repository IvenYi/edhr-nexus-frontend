import { App } from 'vue';
import { DesignContent } from './design-content/design-content';
import { DesignDragItem } from './design-drag-item/design-drag-item';
import { DesignDropContainer } from './design-drop-container/design-drop-container';
import { DesignNotDragItem } from './design-not-drag-item/design-not-drag-item';
import { DesignNotFound } from './design-not-found/design-not-found';

export default {
  install(app: App) {
    app.component(DesignContent.name!, DesignContent);
    app.component(DesignDragItem.name!, DesignDragItem);
    app.component(DesignDropContainer.name!, DesignDropContainer);
    app.component(DesignNotDragItem.name!, DesignNotDragItem);
    app.component(DesignNotFound.name!, DesignNotFound);
  },
};

export { DesignItemPreview } from './design-item-preview/design-item-preview';
