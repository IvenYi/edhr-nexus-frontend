import { App } from 'vue';
import { GctFormItemProvider } from './gct-form-item.provider';
import { GctFormItem } from './gct-form-item';
import { GctFormItemModel } from './gct-form-item.model';

export default {
  install(app: App) {
    // 安装表单项适配器
    gct.register.formItem.register('item', () => new GctFormItemProvider());

    // 表单项组件
    app.component(GctFormItem.name!, GctFormItem);
  },
};

export { GctFormItemModel };
