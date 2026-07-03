import { createVNode, render as vueRender, createApp, h } from 'vue';
import adTableDataModal from './add-table-data-modal.vue';
import { i18n } from '@/locales/setupI18n';
import { registerGlobComp } from '@/components/registerGlobComp';
class CreateInstanceModal {
  static instanceCache: any = null;
  /**
   * 初始化模态框
   * @param key
   */
  static createModal(arg) {
    if (!this.instanceCache) {
      const container = document.createDocumentFragment() as any;
      const vm = createVNode(adTableDataModal, {
        destroyVm: () => {
          //动画结束后销毁组件
          setTimeout(() => {
            vueRender(null, container);
            this.instanceCache = null;
          }, 300);
        },
        ...arg,
      });
      const app = createApp(vm);
      registerGlobComp(app);
      app.use(i18n);
      this.instanceCache = app.mount(container);
    }
  }

  /**立即执行函数 */
  static getModal(arg) {
    this.createModal(arg);
    console.log(this.instanceCache);
    return this.instanceCache;
  }
}

export const getModal = CreateInstanceModal.getModal.bind(CreateInstanceModal);
