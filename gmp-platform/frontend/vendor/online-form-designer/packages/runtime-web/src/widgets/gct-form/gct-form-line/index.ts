import { App } from 'vue';
import { GctFormLineProvider } from './gct-form-line.provider';
import { GctFormLine } from './gct-form-line';
import { GctFormLineModel } from './gct-form-line.model';

export default {
  install(app: App) {
    // 安装表单项适配器
    gct.register.formItem.register('line', () => new GctFormLineProvider());

    // 表单项组件
    app.component(GctFormLine.name!, GctFormLine);
  },
};

export { GctFormLineModel };
