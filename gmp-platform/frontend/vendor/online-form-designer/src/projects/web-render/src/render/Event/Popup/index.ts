import { createVNode, render as vueRender, createApp } from 'vue';
import modals from './template.vue';
import registerGlobComp from '@mobile/components/index';
import electronic_signature_template from './electronic-signature-template.vue';
import { i18n } from '@mobile/locales/setupI18n';
// import { i18n } from '@/locales/setupI18n';
class CreateInstanceModal {
  static instanceCache = {};
  static ElectronicSignatureCache;

  static createModal(key) {
    if (!this.instanceCache[key]) {
      const container = document.createDocumentFragment() as any;
      const vm = createVNode(modals, {
        pageKey: key,
        destroyVm: () => {
          //动画结束后销毁组件
          setTimeout(() => {
            vueRender(null, container);
            this.instanceCache[key] = null;
          }, 300);
        },
      });
      const app = createApp(vm);
      //引入国际化和vxetable
      registerGlobComp(app);
      app.config.globalProperties.$t = (key: any, value: any) => i18n.global.t(key, value);
      this.instanceCache[key] = app.mount(container);
    }
  }
  static createElectronicSignature(obj) {
    if (!this.ElectronicSignatureCache) {
      const container = document.createDocumentFragment() as any;
      const vm = createVNode(electronic_signature_template, {
        ...obj,
        destroyVm: () => {
          return new Promise((resolve) => {
            setTimeout(() => {
              vueRender(null, container);
              this.ElectronicSignatureCache = null;
              resolve(null);
            }, 300);
          });
        },
      });
      // vueRender(vm, container);
      const app = createApp(vm);
      //引入国际化和vxetable
      registerGlobComp(app);
      app.use(i18n);
      this.ElectronicSignatureCache = app.mount(container);
    }
  }
  /**立即执行函数 */
  static getModal(key) {
    this.createModal(key);
    const modal = this.instanceCache[key];
    return modal;
  }
  static getElectronicSignature(obj) {
    this.createElectronicSignature(obj);
    return this.ElectronicSignatureCache;
  }
}
export const getModal = CreateInstanceModal.getModal.bind(CreateInstanceModal);
export const ElectronicSignature =
  CreateInstanceModal.getElectronicSignature.bind(CreateInstanceModal);
