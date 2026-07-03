import { LowCodeWidget } from './widget-basic-types';
import { LowCodeModal } from './modal-types';
import { LoDataObject } from '/@/components/Lo/src/types';
import { pageLayoutModeEnum } from '@gct/runtime';

export interface PageJson {
  id: string;
  keepAlive: boolean;
  /**页面事件 */
  pageEvents: {
    /**页面加载前 */
    pageBeforeMount?: LowCodeWidget.JsEvent | LowCodeWidget.InnerEvents[];
    /**页面加载事件 */
    pageMounted?: LowCodeWidget.JsEvent | LowCodeWidget.InnerEvents[];
    /**页面离开事件 */
    pageDestroyed?: LowCodeWidget.JsEvent | LowCodeWidget.InnerEvents[];
  };
  widgets: LowCodeWidget.BasicSchema[];
  js: string;
  css: string;
  modals: LowCodeModal.Modal[];
  template: any[];
  timestamp?: number;
  // 是否使用新的设计器
  newDesigner?: boolean;
  /**全局页面事件 */
  globalEvents: {
    /**页面加载公共事件ID */
    pageMounted?: string;
    /**页面离开公共事件ID */
    pageDestroyed?: string;
  };
  los?: Record<string, LoDataObject>;
  permissions: {
    [key: string]: string | null;
  };
  style: Partial<LowCodeWidget.BasicStyle>;
  pageConfig: Partial<PageConfig>;
  pageVars: LowCodeWidget.PageVars[];
  /**滚动条适配方式 */
  pageLayoutMode?: pageLayoutModeEnum;
  // 当前页面用到的所有插件，拖入时的状态
  plugins: PagePlugin[];
}

export interface PagePlugin {
  key: string;
  version: string;
  url: string;
}

interface PageConfig {
  title: string;
  i18n: {
    key?: string;
    title?: string;
  };
  hasFooter: boolean;
}

interface PageStyle {
  enableHeaderBGColor?: boolean;
}

export interface ExportMethod {
  [key: string]: {
    params: string;
    source: string;
    type: string;
  };
}
export interface EventJs {
  [key: string]: Fn;
}

export interface History {
  createTime: string;
  createUserName: string;
  designJson: string;
  runtimeJson: string;
}

export interface RuntimePageJson {
  widgets: LowCodeWidget.BasicSchema[];
  runJs: string;
  modals: RuntimeModal[];
  css: string;
  keepAlive: boolean;
  /**全局页面事件 */
  globalEvents: {
    /**页面加载公共事件ID */
    pageMounted?: string;
    /**页面激活公共事件ID */
    pageActivated?: string;
    /**页面离开公共事件ID */
    pageDestroyed?: string;
  };
  /**页面加载事件 */
  pageEvents: {
    /**页面加载前 */
    pageBeforeMount?: {
      /**JS方法名称 */
      name: string;
      /**event额外参数 */
      extraParams: { [key: string]: any } | string | number | boolean;
    };
    /**页面加载事件 */
    pageMounted?: {
      /**JS方法名称 */
      name: string;
      /**event额外参数 */
      extraParams: { [key: string]: any } | string | number | boolean;
    };
    /**页面激活事件 */
    pageActivated?: {
      /**JS方法名称 */
      name: string;
      /**event额外参数 */
      extraParams: { [key: string]: any } | string | number | boolean;
    };
    /**页面离开事件 */
    pageDestroyed?: {
      /**JS方法名称 */
      name: string;
      /**event额外参数 */
      extraParams: { [key: string]: any } | string | number | boolean;
    };
  };
  pageConfig: Partial<PageConfig>;
  pageStyle: Partial<PageStyle>;
  pageLayoutMode?: pageLayoutModeEnum;
}

export interface RuntimeModal {
  props?: LowCodeModal.ModalProps;
  css?: string;
  modalName?: string;
  id?: string;
  i18n?: Record<string, string>;
  events?: LowCodeWidget.BasicEvents;
  children?: [LowCodeModal.ModalBody, LowCodeModal.ModalBody];
  runJs?: string;
  style: Partial<LowCodeWidget.BasicStyle>;
}
