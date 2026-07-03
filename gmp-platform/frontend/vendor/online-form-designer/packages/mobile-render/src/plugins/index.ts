import { App } from 'vue';
import { RenderNodeType, RenderNodeRegister, DesignRenderViewPrefix } from '@gct/runtime-render';
import RenderDesignEditor from './render-design-editor';
// 组件
import { RenderCardField } from './render-card-field/render-card-field';
import { RenderCardViewPage } from './render-card-view-page/render-card-view-page';
import { MobileRenderGrid } from './render-grid/render-grid';
import { MobileRenderGridItem } from './render-grid-item/render-grid-item';
import { RenderMenuList } from './render-menu-list/render-menu-list';
import { RenderPanel } from './render-panel/render-panel';
import { RenderSelectComponent } from './render-select-component/render-select-component';
import { RenderTabItem } from './render-tab-item/render-tab-item';
import { RenderTabs } from './render-tabs/render-tabs';
// 适配器
import { RenderCardFieldProvider } from './render-card-field/render-card-field.provider';
import { RenderCardViewPageProvider } from './render-card-view-page/render-card-view-page.provider';
import { RenderGctMessageProvider } from './render-gct-message/render-gct-message.provider';
import { RenderGctWorkbenchProvider } from './render-gct-workbench/render-gct-workbench.provider';
import { RenderTodoProvider } from './render-gct-todo/render-gct-todo.provider';
import { RenderGridProvider } from './render-grid/render-grid.provider';
import { RenderGridItemProvider } from './render-grid-item/render-grid-item.provider';
import { RenderMenuListProvider } from './render-menu-list/render-menu-list.provider';
import { RenderPanelProvider } from './render-panel/render-panel.provider';
import { RenderPersonalCenterProvider } from './render-personal-center/render-personal-center.provider';
import { RenderSelectComponentProvider } from './render-select-component/render-select-component.provider';
import { RenderTabItemProvider } from './render-tab-item/render-tab-item.provider';
import { RenderTabsProvider } from './render-tabs/render-tabs.provider';

export default {
  install(app: App) {
    app.use(RenderDesignEditor);

    app.component(RenderCardField.name!, RenderCardField);
    app.component(RenderCardViewPage.name!, RenderCardViewPage);
    app.component(MobileRenderGrid.name!, MobileRenderGrid);
    app.component(MobileRenderGridItem.name!, MobileRenderGridItem);
    app.component(RenderMenuList.name!, RenderMenuList);
    app.component(RenderPanel.name!, RenderPanel);
    app.component(RenderSelectComponent.name!, RenderSelectComponent);
    app.component(RenderTabItem.name!, RenderTabItem);
    app.component(RenderTabs.name!, RenderTabs);

    // 注册公共信息卡适配器
    RenderNodeRegister.register(
      RenderNodeType.PAGE_LOWER,
      () => new RenderCardViewPageProvider(),
      DesignRenderViewPrefix.MOBILE_CARD_VIEW,
    );
    RenderNodeRegister.register(
      RenderNodeType.FIELD,
      () => new RenderCardFieldProvider(),
      DesignRenderViewPrefix.MOBILE_CARD_VIEW,
    );

    RenderNodeRegister.registerCustomHome(
      RenderNodeType.MESSAGE,
      () => new RenderGctMessageProvider(),
    );
    RenderNodeRegister.registerCustomHome(
      RenderNodeType.WORKBENCH,
      () => new RenderGctWorkbenchProvider(),
    );
    RenderNodeRegister.registerCustomHome(RenderNodeType.GRID, () => new RenderGridProvider());
    RenderNodeRegister.registerCustomHome(
      RenderNodeType.GRID_ITEM,
      () => new RenderGridItemProvider(),
    );
    RenderNodeRegister.registerCustomHome(
      RenderNodeType.MENU_LIST,
      () => new RenderMenuListProvider(),
    );
    RenderNodeRegister.registerCustomHome(RenderNodeType.PANEL, () => new RenderPanelProvider());
    RenderNodeRegister.registerCustomHome(
      RenderNodeType.PERSONAL_CENTER,
      () => new RenderPersonalCenterProvider(),
    );
    RenderNodeRegister.registerCustomHome(RenderNodeType.TODO, () => new RenderTodoProvider());
    RenderNodeRegister.registerCustomHome(
      RenderNodeType.SELECT_COMPONENT,
      () => new RenderSelectComponentProvider(),
    );
    RenderNodeRegister.registerCustomHome(
      RenderNodeType.TAB_ITEM,
      () => new RenderTabItemProvider(),
    );
    RenderNodeRegister.registerCustomHome(RenderNodeType.TABS, () => new RenderTabsProvider());
  },
};
