import { createVNode, render as vueRender, createApp } from 'vue';
import modals from './template.vue';
import registerGlobComp from '@mobile/components/index';
import signature_template from './signature-template.vue';
import electronic_signature_template from './electronic-signature-template.vue';
import txn_excute_button_template from '/@page-designer/_kit/kit-medpro/pad/excute-button/excute-button-render.vue';
import { openOnlineFormModal } from './component/openOnlineFormModal';
import { i18n } from '@mobile/locales/setupI18n';
// import { i18n } from '@/locales/setupI18n';
class CreateInstanceModal {
  static instanceCache = {};
  static ElectronicSignatureCache;
  static TxnExcuteButtonCache;
  static SignatureCache;

  static createSignature(obj, successCallback?, failCallback?) {
    console.log(successCallback, 'successCallback');
    if (!this.SignatureCache) {
      const container = document.createDocumentFragment() as any;
      const vm = createVNode(signature_template, {
        ...obj,
        successCallback,
        failCallback,
        destroyVm: () => {
          setTimeout(() => {
            vueRender(null, container);
            this.SignatureCache = null;
          }, 300);
        },
      });
      // vueRender(vm, container);
      const app = createApp(vm);
      //引入国际化和vxetable
      registerGlobComp(app);
      app.use(i18n);
      this.SignatureCache = app.mount(container);
    }
  }
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
  static createTxnExcuteButton(obj) {
    if (!this.TxnExcuteButtonCache) {
      const container = document.createDocumentFragment() as any;
      const vm = createVNode(txn_excute_button_template, {
        ...obj,
        destroyVm: () => {
          setTimeout(() => {
            vueRender(null, container);
            this.TxnExcuteButtonCache = null;
          }, 300);
        },
      });
      // vueRender(vm, container);
      const app = createApp(vm);
      //引入国际化和vxetable
      registerGlobComp(app);
      app.use(i18n);
      this.TxnExcuteButtonCache = app.mount(container);
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
  static getTxnExcuteButton(obj) {
    this.createTxnExcuteButton(obj);
    return this.TxnExcuteButtonCache;
  }
  static getSignatureConfirm(obj, successCallback?, failCallback?) {
    this.createSignature(obj, successCallback, failCallback);
    return this.SignatureCache;
  }
}
export const getModal = CreateInstanceModal.getModal.bind(CreateInstanceModal);
export const ElectronicSignature =
  CreateInstanceModal.getElectronicSignature.bind(CreateInstanceModal);
export const TxnExcuteButton = CreateInstanceModal.getTxnExcuteButton.bind(CreateInstanceModal);
export const SignatureConfirm = CreateInstanceModal.getSignatureConfirm.bind(CreateInstanceModal);
export const OnlineFormModal = openOnlineFormModal;
