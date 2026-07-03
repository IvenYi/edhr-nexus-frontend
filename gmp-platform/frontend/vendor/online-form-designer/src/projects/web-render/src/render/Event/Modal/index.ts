import { createVNode, render as vueRender, createApp, h } from 'vue';
import modals from './template.vue';
import modeling_template from './modeling_template.vue';
import electronic_signature_template from './electronic-signature-template.vue';
import txn_excute_button_template from '/@page-designer/_kit/deprecated/web/excute-button/excute-button-render.vue';
import global_loading_template from '../__component__/global-loading.vue';
import { registerGlobComp } from '@/components/registerGlobComp';
import { i18n } from '@/locales/setupI18n';
import { router } from '/@web-render/router';

export { usageInformation } from './user_info';
export class CreateInstanceModal {
  static instanceCache = {};
  static TracingBackToThePastinstanceCache;
  static ElectronicSignatureCache;
  static TxnExcuteButtonCache;
  static GlobalLoadingCache;
  /**
   * 初始化模态框
   * @param key
   */
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
      app.use(i18n);
      this.instanceCache[key] = app.mount(container);
    }
  }
  /**
   * 建模追朔
   * @param param0
   */
  static createTracingBackToThePast({ id, modelKey }) {
    if (!this.instanceCache[id]) {
      const container = document.createDocumentFragment() as any;
      const vm = createVNode(modeling_template, {
        id,
        modelKey,
        destroyVm: () => {
          setTimeout(() => {
            vueRender(null, container);
            this.instanceCache[id] = null;
          }, 300);
        },
      });
      // vueRender(vm, container);
      const app = createApp(vm);
      //引入国际化和vxetable
      registerGlobComp(app);
      app.use(i18n);
      this.instanceCache[id] = app.mount(container);
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

  static createGlobalLoading(obj) {
    if (!this.GlobalLoadingCache) {
      const container = document.createDocumentFragment() as any;
      const vm = createVNode(global_loading_template, {
        ...obj,
        destroyVm: () => {
          setTimeout(() => {
            vueRender(null, container);
            this.GlobalLoadingCache = null;
          }, 300);
        },
      });
      // vueRender(vm, container);
      document.body.appendChild(container);
      const app = createApp(vm);
      //引入国际化和vxetable
      registerGlobComp(app);
      app.use(i18n);
      this.GlobalLoadingCache = app.mount(container);
    }
  }

  /**立即执行函数 */
  static getModal(key) {
    this.createModal(key);
    const modal = this.instanceCache[key];
    return modal;
  }
  /**立即执行函数 */
  static getModeling({ id, modelKey }) {
    this.createTracingBackToThePast({ id, modelKey });
    const modal = this.instanceCache[id];
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

  static getGlobalLoading(obj) {
    this.createGlobalLoading(obj);
    return this.GlobalLoadingCache;
  }
  static remove() {
    Object.values(this.instanceCache).forEach((vm) => {
      vm && vm.close();
    });
    this.ElectronicSignatureCache && this.ElectronicSignatureCache.close();
  }
}
export const getModal = CreateInstanceModal.getModal.bind(CreateInstanceModal);
export const TracingBackToThePast = CreateInstanceModal.getModeling.bind(CreateInstanceModal);
export const ElectronicSignature =
  CreateInstanceModal.getElectronicSignature.bind(CreateInstanceModal);
export const TxnExcuteButton = CreateInstanceModal.getTxnExcuteButton.bind(CreateInstanceModal);

export const GlobalLoading = CreateInstanceModal.getGlobalLoading.bind(CreateInstanceModal);

router.afterEach(() => {
  CreateInstanceModal.remove();
});
