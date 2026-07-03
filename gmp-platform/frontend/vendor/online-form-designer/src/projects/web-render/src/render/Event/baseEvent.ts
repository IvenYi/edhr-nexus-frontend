import { InitNodeOptions, PathType, EventsConstructor } from './eventType';
import Globals from './utils/runGlobalByPage';
import { BizServiceEnum } from '@/enums/httpEnum';
import type { Ref } from 'vue';
import { useStyleTag } from '@vueuse/core';
import { INNER_EVENT, FormComponents } from '/@page-designer/enum';
import { toRaw } from 'vue';
import { creatPageEvent } from '/@page-designer/components/widgets/hooks/hooks';
import { LowCodeWidget } from '/@page-designer/types/widget-basic-types';
import {
  getModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey,
  postModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey,
  putModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey,
  deleteModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey,
  postModelComprehensiveBizServiceGeneralByModelCategoryByModelKeyByBsKey,
} from '/@/apis/gct-apaas/ModelComprehensiveController';
import { postPmProcessEngineProcExecute } from '/@/apis/gct-apaas/PmProcessEngineController';
import { EntityModelCategoryEnum } from '@/projects/app-designer/src/enum';
import _, { cloneDeep, differenceBy } from 'lodash-es';
import dayjs from 'dayjs';
import { IGctComponent, IScriptContext, pageLayoutModeEnum } from '@gct/runtime';
import BigNumber from 'bignumber.js';
import { ProcessAppRovedData } from './utils/processRovedInfo';
import { transformSourceData, transformData } from '/@page-designer/components/widgets/hooks/utils';
import { createUUID } from 'qx-util';

const bizServiceRequestHook =
  (api) =>
  (path: PathType, data, ...config) => {
    return api(
      {
        modelKey: path.key,
        bsKey: path.action,
        modelCategory: path.modelCategory || EntityModelCategoryEnum.ENTITY,
      },
      data,
      ...config,
    );
  };

const BizService = {
  post: bizServiceRequestHook(postModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey),
  get: bizServiceRequestHook(getModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey),
  put: bizServiceRequestHook(putModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey),
  delete: bizServiceRequestHook(deleteModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey),
};

/**
 * 页面事件中心
 */
export class Events {
  context: Context;
  searchVNodes: Record<string, { callback: Function; comId: string }[]>;
  cssData?: { css: Ref<string>; load: Function; unload: Function };
  #pageKey?: string;
  exports: Record<string, (...arg) => void>;
  #Oberver: Record<string, ((val: InitNodeOptions) => void)[]>;
  #VNodes: Record<string, InitNodeOptions>;
  /**流程信息 */
  ProcessAppRoved?: ProcessAppRovedData;
  pageLayoutMode?: pageLayoutModeEnum;
  constructor({ js, css, pageKey }: EventsConstructor) {
    this.cssData = this.#createCss(css);
    /**
     * 绑定外部搜索的表格组件
     */
    this.searchVNodes = {};
    /**
     * 存放所有公共事件函数
     */
    this.exports = {};
    /**
     * 当前页面所有组件key和事件对象
     */
    this.#VNodes = {};
    /**
     * 组件订阅中心
     */
    this.#Oberver = {};
    this.context = new Context({
      $ref: this.getComponent.bind(this),
      $asyncRef: this.getSyncComponent.bind(this),
    });
    this.#createFunction(js);
    Globals.setContextByKey(this.context, pageKey);
    this.#pageKey = pageKey;
    creatPageEvent(this);
  }
  /**初始化流程节点信息 */
  async runProcessBySaskId({ taskId, processInstanceId, examineAndApproveState, refFormId }) {
    this.ProcessAppRoved = new ProcessAppRovedData({
      taskId,
      processInstanceId,
      examineAndApproveState,
      refFormId,
    });
    await this.ProcessAppRoved.readyProcess();
  }
  #createCss(str, attr = {}) {
    if (!str) return;
    const { css, load, unload } = useStyleTag(str, attr);
    return { css, load, unload };
  }
  /**保存所有组件的props*/
  runContext(key: string, widget: LowCodeWidget.BasicSchema) {
    this.context.gctWidgets[key] = widget;
  }
  /**触发内置事件 */
  async runEventByName(eventName, events = {}, ...arg) {
    const E = events[eventName];
    let data;
    if (!E) return;
    if (Array.isArray(E)) {
      data = await builtInEvents(E, this.context, arg);
    } else {
      const fun = this.exports[E.name];
      if (!fun) throw `函数${E.name}不存在`;
      data = await fun(...arg, toRaw(E.extraParams));
    }
    return data;
  }
  /**执行公共函数事件 */
  async runExportByName(eventName, ...arg) {
    try {
      const fun = this.exports[eventName];
      if (!fun) throw `函数${eventName}不存在`;
      return fun(...arg);
    } catch (error) {
      console.error(error);
    }
  }
  /**异步执行公共函数事件 */
  async runAsyncExportByName(eventName, ...arg) {
    try {
      const fun = this.exports[eventName];
      if (!fun) throw `函数${eventName}不存在`;
      await this.getReadyByFun(fun);
      return fun(...arg);
    } catch (error) {
      console.error(error);
    }
  }
  #createFunction(jsJSON?: string) {
    if (!jsJSON) return;
    try {
      const fun = new Function('exports', 'CTX', jsJSON);
      fun(this.exports, this.context);
    } catch (error) {
      console.error(error, 'createFunction');
    }
  }
  // 把小组件的实例按照key存起来
  initNode(key: string, options: InitNodeOptions) {
    if (key) {
      this.#VNodes[key] = options;
      this.#publish(key, options);
    }
  }
  /**组件销毁 */
  destroyNode(key) {
    delete this.#VNodes[key];
    delete this.#Oberver[key];
  }
  // 执行查询
  initSearchs(key: string, callback: Function, comId: string) {
    if (!key) return;
    if (this.searchVNodes[key]) {
      /**添加 comId 组件标识 处理显隐藏控制引起的 重复注册回调函数的问题*/
      const item = this.searchVNodes[key].find((i) => i.comId === comId);
      if (item) {
        item.callback = callback;
      } else {
        this.searchVNodes[key].push({ callback, comId });
      }
    } else {
      this.searchVNodes[key] = [{ callback, comId }];
    }
  }
  // 取消注册的查询
  cancelInitSearchs(key: string, comId: string) {
    if (!key || !this.searchVNodes[key]) return;
    this.searchVNodes[key] = this.searchVNodes[key].filter((i) => i.comId !== comId);
    if (this.searchVNodes[key].length === 0) {
      delete this.searchVNodes[key];
    }
  }
  runTableBySearch(key: string, data) {
    const funArg = this.searchVNodes[key] || [];
    funArg.forEach(({ callback }) => callback(data));
  }
  /**
   * 组件初始化订阅
   * @param {*} key 组件唯一key
   * @param {*} eventName  事件名称
   */
  #subscribeready(key, callback) {
    const options = this.#VNodes[key];
    if (options) {
      callback(key, options);
    } else if (this.#Oberver[key]) {
      this.#Oberver[key].push(callback);
    } else {
      this.#Oberver[key] = [callback];
    }
  }
  /**
   *
   * @param key 执行回调
   */
  #publish(key, options) {
    if (this.#Oberver[key]) {
      this.#Oberver[key].forEach((fun) => {
        fun(options);
      });
    }
  }
  /**
   * 获取组件公用方法 getComponent(identity),根据组件唯一标识获取组件。
   * @param {*} key
   * @returns
   */
  getComponent(key: string): GctComponent | undefined {
    const options = this.#VNodes[key];
    if (options) {
      return new GctComponent(key, options);
    }
    console.error(key + '组件不存在或者未初始化');
  }
  /**
   * 获取组件公用方法 getComponent(identity),根据组件唯一标识获取组件。
   * @param {*} key
   * @returns
   */
  getSyncComponent(key?: string): Promise<GctComponent> {
    if (!key) return Promise.reject('标识不能为空');
    const options = this.#VNodes[key];
    if (options) {
      return Promise.resolve(new GctComponent(key, options));
    }
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(key + '不存在或者被隐藏');
      }, 30000);
      this.#subscribeready(key, (options) => {
        clearTimeout(timer);
        resolve(new GctComponent(key, options));
      });
    });
  }
  /**
   * 指定函数中使用到的组件初始化后才执行
   * @param fun
   * @returns
   */
  async getReadyByFun(fun) {
    if (typeof fun !== 'function') return Promise.reject('参数必须是函数');
    const funstr = String(fun);
    const P =
      funstr.match(/\$ref\((["'A-Za-z0-9_-]+)\)/g)?.map((i) => {
        const key = i.match(/\$ref\(['|"]([A-Za-z0-9_-]+)['|"]\)/)?.[1];
        return this.getSyncComponent(key);
      }) || [];
    await Promise.all(P);
  }
  /**
   * 流程处理
   * @param processDateValue
   * @param data
   */
  async processHandle(
    data: any,
    { opinion, reassignId, signature, countersignUserIds, button }: any,
  ) {
    const { taskId, processInstanceId } = this.ProcessAppRoved!;
    const processData = {
      procInstId: processInstanceId,
      data,
      opinion,
      button,
      countersignUserIds,
      taskId,
      signature,
      reassignId,
    } as any;
    await postPmProcessEngineProcExecute(processData);
  }
  /**流程审批校验 */
  async checkedProcess(formProcessId) {
    const { processId } = this.ProcessAppRoved || {};
    if (!processId) return Promise.reject($t('sys.process.pleaseInitiateTheProcessFirst'));
    if (formProcessId !== processId)
      return Promise.reject($t('sys.process.processInstanceMismatch'));
  }
}

// Globals
/**作用域 上下文 */
export class Context implements IScriptContext {
  /**根据key获取当前组件 */
  $ref: (key: string) => GctComponent;
  /**根据key异步获取获取组件 */
  $asyncRef: (key: string) => Promise<GctComponent>;
  /**根据id获取模态框 */
  $getModal?: (key: string) => any;
  /**关闭当前上下文模态框 */
  $closeModal?: () => void;
  /** 跳转指定页面 */
  $push?: (path: string, params?: IData) => void;
  /**调用第三方服务 */
  $customBizService = BizService;
  /**建模追溯 */
  $modelingTraceability?: Function;
  /** 电子签名 */
  $modelingElectronicSignature?: Function;
  /** 单据打印预览弹框 */
  $documentPrint?: Function;
  /** 在线表单信息弹框 */
  $onlineFormModal?: Function;
  /** eDHR填报全屏弹框 */
  $eDHRFillFullScreenModal?: Function;
  /** 表单填报弹框 */
  $openDocumentFillingModal?: Function;
  /** 签名确认弹框 */
  $modelingSignatureConfirm?: Function;
  $routeQuery?: () => IData;
  /**组件id和widget 的map */
  gctWidgets: Record<string, LowCodeWidget.BasicSchema> = {};
  /**ctx 下的工具函数 */
  readonly $utility: any = {
    _,
    cloneDeep,
    differenceBy,
    dayjs,
    BigNumber,
    plus(a, b) {
      return new BigNumber(a).plus(new BigNumber(b)).toNumber();
    },
    minus(a, b) {
      return new BigNumber(a).minus(new BigNumber(b)).toNumber();
    },
    multipliedBy(a, b) {
      return new BigNumber(a).multipliedBy(new BigNumber(b)).toNumber();
    },
    div(a, b) {
      return new BigNumber(a).div(new BigNumber(b)).toNumber();
    },
    /**表格数据data,dict翻译 */
    transformSourceData,
    /**表单数据data,dict翻译*/
    transformData,
    createUUID,
  };
  constructor({ $ref, $asyncRef }) {
    this.$asyncRef = $asyncRef;
    this.$ref = $ref;
  }

  $getPremission(id, isGetPerByKey = false) {
    return Globals.getPremission(id, isGetPerByKey);
  }
  /**
   *
   * @param key 组件权限标识
   * @param id 组件id
   */
  $setPremission(key, id) {
    Globals.setPremission(key, id);
  }
  /**获取应用全局变量 */
  $getAppGlobalVar(id) {
    return Globals.getGlobalVar(id);
  }
  /**设置应用全局变量 */
  $setAppGlobalVar(id, value) {
    Globals.setGlobalVar(id, value);
  }
  /**获取页面全局变量老版本兼容问题暂时不删除 后续不维护*/
  $getPageGlobalVar(id) {
    return Globals.getPageGlobalVar(id);
  }
  /**设置页面变量老版本 兼容问题暂时不删除 后续不维护 */
  $setPageGlobalVar(id, value) {
    Globals.setPageGlobalVar(id, value);
  }
  /**获取页面全局变量 */
  $getPageVar(id) {
    return Globals.getPageVar(id);
  }
  /**设置页面全局变量 */
  $setPageVar(id, value) {
    Globals.setPageVar(id, value);
  }
  /**
   * 系统内置业务服务请求
   * @param path
   * @param params
   * @param config
   * @returns
   */
  async $httpBizService(path: PathType, params, ...arg: [any?, any?]): Promise<any> {
    const method = BizServiceEnum[path.action];
    return this.$customBizService[method](path, params, ...arg);
  }
  /**post 业务服务请求 */
  async $request(modelKey, action, { query, body } = {}, config = {}): Promise<any> {
    const res = await postModelComprehensiveBizServiceGeneralByModelCategoryByModelKeyByBsKey(
      {
        bsKey: action,
        modelKey,
        modelCategory: EntityModelCategoryEnum.ENTITY,
      },
      body,
      query,
      {
        ignoreParamsToData: true,
        ...config,
      },
    );
    return res;
  }
  /**根据模态框id 获取上下文 id不传默认页面上下文*/
  $getCtxById(modalKey?: string) {
    return Globals.getContextByKey(modalKey);
  }
  /**设置组件的属性 */
  $setPropsByKey(key: string, fromProp: LowCodeWidget.BasicSchema['props']) {
    const toProps = this.gctWidgets[key]?.props;
    if (!toProps) return;
    for (const k in fromProp) {
      toProps[k] = fromProp[k];
    }
  }
  /**获取组件的属性 */
  $getPropsByKey(key: string, PropsKey: string | string[] = [], root?: boolean) {
    const props = root ? this.gctWidgets[key] : this.gctWidgets[key].props;
    if (typeof PropsKey === 'string') {
      PropsKey = [PropsKey];
    }
    return PropsKey.reduce((pre, curr) => {
      pre[curr] = props[curr];
      return pre;
    }, {});
  }
  /**全局loading */
  $loading?: Function;
}

/**
 * 获取组件实例公用方法
 */
class GctComponent implements IGctComponent {
  modelKey?: string;
  getValue?: () => { id?: string; [key: string]: string | [] | undefined };
  setValue?: (...args: any[]) => void;
  /**提交 */
  submit?: (...args: any[]) => void;
  /**刷新 */
  reload?: (...args: any[]) => void;
  key: string;
  constructor(key: string, options: InitNodeOptions) {
    this.key = key;
    for (const key in options.elRef) {
      this[key] = options.elRef[key];
    }
  }
}

/**
 * 执行内置事件
 * @param eventList
 */
async function builtInEvents(eventList, context: Context, args: any[]) {
  const allEvent = eventList.map(transformEventFun.bind(context, args));
  // console.log('eventList', eventList, context);
  await Promise.all(allEvent);
}
async function transformEventFun(this: Context, args: any[], item) {
  const { name, refId, scopeId, modalTitle } = item;
  const ids = modalTitle?.split('.') || [];
  let widget = {};
  if (ids.length > 1) {
    const orgWidget = this.gctWidgets?.[ids[0]] || {};
    const opes = [];
    getAllOpe(opes, orgWidget);
    widget = opes.find((i) => i.id === ids[1]) || {};
  } else if (ids.length) {
    widget = this.gctWidgets?.[ids[0]];
  }
  if (name === INNER_EVENT.OPEN_MODAL) {
    await this.$getModal!(refId).open({ title: widget?.props?.title });
  }
  if (name === INNER_EVENT.CLOSE_MODAL) {
    if (refId) {
      await this.$getModal!(refId).close();
    } else {
      await this.$closeModal!();
    }
  }
  if (name === INNER_EVENT.REFRESH_TABLE) {
    const com = await this.$getCtxById(scopeId).$asyncRef(refId);
    await com.reload!(args ? args[0] : null);
  }
}

function getAllOpe(arr, widget) {
  for (const i of widget.children) {
    if (i.type && i.type == FormComponents.CustomButton) {
      arr.push(i);
    } else {
      if (i.children?.length) {
        getAllOpe(arr, i);
      }
    }
  }
}
