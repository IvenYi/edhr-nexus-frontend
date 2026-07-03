import { App } from 'vue';
import { DesignRender } from './components';

export default {
  install(app: App) {
    // 注册组件
    app.component(DesignRender.name!, DesignRender);
  },
};

export * from './components';
export * from './constant';
export * from './controller';
export * from './hooks';
export * from './interface';
export * from './props';
export * from './register';
export * from './state';
export * from './utils';
