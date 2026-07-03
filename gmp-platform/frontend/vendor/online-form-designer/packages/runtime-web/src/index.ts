import './types';
import { App } from 'vue';
import { GctRuntime } from '@gct/runtime';
import { CodeChat } from './ai-components';
import {
  FlexContainer,
  FlexItem,
  GridContainer,
  ViewContainer,
  ViewFooter,
  ViewHeader,
  GctViewHeader,
  Vue3DndDraggable,
  Common,
  SvgIcon,
} from './components';
import AppEditor from './editor';
import AppForm from './widgets/form';
import AppSearchForm from './widgets/app-search-form';
import GctForm from './widgets/gct-form';
import GctEditForm from './widgets/gct-edit-form';
import GctTable from './widgets/gct-table';
import { monacoLoader, OverlayController } from './utils';
import OnlineFormModelSelect from './components/select-online-form-model/online-form-model-select.vue';
import OnlineFormModelModal from './components/select-online-form-model/online-form-model-modal.vue';

export * from './components';
export * from './editor';
export * from './utils';
export { OnlineFormModelSelect, OnlineFormModelModal };

// 避免重复初始化全局对象
if (!window.gct) {
  window.gct = new GctRuntime();
}

if (!window.gct.openUtil) {
  window.gct.openUtil = new OverlayController();
}

if (!window.monacoLoader) {
  window.monacoLoader = monacoLoader;
}

export default {
  install(app: App) {
    // 注册 AI 全局组件
    app.component(CodeChat.name!, CodeChat);
    // 注册全局组件
    app.component(FlexContainer.name!, FlexContainer);
    app.component(FlexItem.name!, FlexItem);
    app.component(GridContainer.name!, GridContainer);
    app.component(ViewContainer.name!, ViewContainer);
    app.component(ViewFooter.name!, ViewFooter);
    app.component(ViewHeader.name!, ViewHeader);
    app.component(GctViewHeader.name!, GctViewHeader);
    app.component(Vue3DndDraggable.name!, Vue3DndDraggable);
    app.component(SvgIcon.name!, SvgIcon);

    app.use(AppEditor);
    app.use(AppForm);
    app.use(AppSearchForm);
    app.use(GctForm);
    app.use(GctEditForm);
    app.use(GctTable);
    app.use(Common);
  },
};

export * from './widgets/gct-form';
