import { App } from 'vue';
import { DesignNodeType } from '../constant';
import { NodeRegister } from '../register';
// 设计界面绘制编辑器
import DesignEditors from './design-editor';
// 组件
import { DesignCustomExpMenuComponent } from './design-custom-exp-menu/components/design-custom-exp-menu.component';
import { DesignMenuListComponent } from './design-menu-list/components/design-menu-list.component';
import { DesignPanelComponent } from './design-panel/components/design-panel.component';
import { DesignTabsComponent } from './design-tabs/components/design-tabs.component';
import { DesignTabItemComponent } from './design-tab-item/components/design-tab-item.component';
import { DesignGridComponent } from './design-grid/components/design-grid.component';
import { DesignGridItemComponent } from './design-grid-item/components/design-grid-item.component';
import { DesignSelectComponentComponent } from './design-select-component/components/design-select-component.component';
import DesignMessageComponent from './design-message/components/design-message.component.vue';
import DesignWorkbenchComponent from './design-workbench/components/design-workbench.component.vue';
import DesignPersonalCenterComponent from './design-personal-center/components/design-personal-center.component.vue';
import DesignTodoComponent from './design-todo/components/design-todo.component.vue';

// 适配器
import { DesignPageProvider } from './design-page/design-page.provider';
import { DesignMenuListProvider } from './design-menu-list/design-menu-list.provider';
import { DesignPanelProvider } from './design-panel/design-panel.provider';
import { DesignTabsProvider } from './design-tabs/design-tabs.provider';
import { DesignTabItemProvider } from './design-tab-item/design-tab-item.provider';
import { DesignSelectComponentProvider } from './design-select-component/design-select-component.provider';
import { DesignGridProvider } from './design-grid/design-grid.provider';
import { DesignGridItemProvider } from './design-grid-item/design-grid-item.provider';
import { DesignMessageProvider } from './design-message/design-message.provider';
import { DesignPersonalCenterProvider } from './design-personal-center/design-personal-center.provider';
import { DesignTodoProvider } from './design-todo/design-todo.provider';
import { DesignWorkbenchProvider } from './design-workbench/design-workbench.provider';
import { DesignCustomExpMenuProvider } from './design-custom-exp-menu/design-custom-exp-menu.provider';

import { installMaterial } from './install-material';

export default {
  install(app: App) {
    installMaterial();

    app.use(DesignEditors);

    app.component(DesignCustomExpMenuComponent.name!, DesignCustomExpMenuComponent);
    app.component(DesignMenuListComponent.name!, DesignMenuListComponent);
    app.component(DesignPanelComponent.name!, DesignPanelComponent);
    app.component(DesignTabsComponent.name!, DesignTabsComponent);
    app.component(DesignTabItemComponent.name!, DesignTabItemComponent);
    app.component(DesignSelectComponentComponent.name!, DesignSelectComponentComponent);
    app.component(DesignGridComponent.name!, DesignGridComponent);
    app.component(DesignGridItemComponent.name!, DesignGridItemComponent);
    app.component('DesignMessageComponent', DesignMessageComponent);
    app.component('DesignWorkbenchComponent', DesignWorkbenchComponent);
    app.component('DesignPersonalCenterComponent', DesignPersonalCenterComponent);
    app.component('DesignTodoComponent', DesignTodoComponent);
    // 自定义导航菜单组件
    NodeRegister.registerCustomExpMenu(
      DesignNodeType.CUSTOM_EXP_MENU,
      () => new DesignCustomExpMenuProvider(),
    );
    // 页面
    NodeRegister.registerCustomHome(DesignNodeType.PAGE, () => new DesignPageProvider());
    NodeRegister.registerCustomExpView(DesignNodeType.PAGE, () => new DesignPageProvider());
    // 菜单列表
    NodeRegister.registerCustomHome(DesignNodeType.MENU_LIST, () => new DesignMenuListProvider());
    // 面板
    NodeRegister.registerCustomHome(DesignNodeType.PANEL, () => new DesignPanelProvider());
    NodeRegister.registerCustomExpView(DesignNodeType.PANEL, () => new DesignPanelProvider());
    // 选项卡
    NodeRegister.registerCustomHome(DesignNodeType.TABS, () => new DesignTabsProvider());
    NodeRegister.registerCustomExpView(DesignNodeType.TABS, () => new DesignTabsProvider());
    // 选项卡子项
    NodeRegister.registerCustomHome(DesignNodeType.TAB_ITEM, () => new DesignTabItemProvider());
    NodeRegister.registerCustomExpView(DesignNodeType.TAB_ITEM, () => new DesignTabItemProvider());
    // 选择组件
    NodeRegister.registerCustomHome(
      DesignNodeType.SELECT_COMPONENT,
      () => new DesignSelectComponentProvider(),
    );
    // 栅格容器
    NodeRegister.registerCustomHome(DesignNodeType.GRID, () => new DesignGridProvider());
    NodeRegister.registerCustomExpView(DesignNodeType.GRID, () => new DesignGridProvider());
    // 栅格容器子项
    NodeRegister.registerCustomHome(DesignNodeType.GRID_ITEM, () => new DesignGridItemProvider());
    NodeRegister.registerCustomExpView(
      DesignNodeType.GRID_ITEM,
      () => new DesignGridItemProvider(),
    );
    // 消息
    NodeRegister.registerCustomExpView(DesignNodeType.MESSAGE, () => new DesignMessageProvider());
    // 审批
    NodeRegister.registerCustomExpView(DesignNodeType.TODO, () => new DesignTodoProvider());
    // 工作台
    NodeRegister.registerCustomExpView(
      DesignNodeType.WORKBENCH,
      () => new DesignWorkbenchProvider(),
    );
    // 个人中心
    NodeRegister.registerCustomExpView(
      DesignNodeType.PERSONAL_CENTER,
      () => new DesignPersonalCenterProvider(),
    );
  },
};
