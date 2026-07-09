import { App } from 'vue';
import { GctFormItem } from './gct-form-item/gct-form-item';
import { GctForm } from './gct-form';
import { GctFormItemProvider } from './gct-form-item/gct-form-item.provider';
import { GctFormHiddenItemProvider } from './gct-form-hidden-item/gct-form-hidden-item.provider';

// 导入表单项组件
import GctFormCollapsePane from './gct-form-collapse-pane';
import GctFormCollapse from './gct-form-collapse';
import GctFormGroup from './gct-form-group';
import GctFormLine from './gct-form-line';
import GctFormTab from './gct-form-tab';
import GctFormTabPane from './gct-form-tab-pane';
import GctFormTitleGroup from './gct-form-title-group';

export default {
  install(app: App) {
    // 安装表单项适配器
    gct.register.formItem.register('item', () => new GctFormItemProvider());
    gct.register.formItem.register('hidden', () => new GctFormHiddenItemProvider());

    // 注册表单项组件
    app.use(GctFormCollapsePane);
    app.use(GctFormCollapse);
    app.use(GctFormGroup);
    app.use(GctFormLine);
    app.use(GctFormTab);
    app.use(GctFormTabPane);
    app.use(GctFormTitleGroup);

    app.component(GctForm.name!, GctForm);
    app.component(GctFormItem.name!, GctFormItem);
  },
};

export * from './gct-form-tab';
export * from './gct-form-tab-pane';
export * from './gct-form-collapse';
export * from './gct-form-collapse-pane';
export * from './gct-form-group';
export * from './gct-form-title-group';
export * from './gct-form-hidden-item';
export * from './gct-form-item';
export * from './gct-form-line';
