/* eslint-disable @typescript-eslint/no-empty-interface */
/**
 * 当前界面组件映射，根据具体设计界面实时生成
 *
 * @private
 * @interface ComponentKeys
 */
export interface ComponentKeys {}

/**
 * @private
 */
export interface IModelServiceMap {}

/**
 * 方法返回值
 *
 * @private
 */
type MyR<F> = F extends (...args: any[]) => infer R ? R : any;

/**
 * 前端自定义脚本上下文
 *
 * @hidden
 * @interface IScriptContext
 */
export interface IScriptContext {
  /**
   * 获取界面组件实例
   *
   * @template K
   * @param {ComponentKeys[K]} key
   * @return {*}  {IGctComponent}
   */
  $ref<K extends keyof ComponentKeys>(key: K): ComponentKeys[K];
  /**
   * 异步获取界面组件实例
   *
   * @template K
   * @param {ComponentKeys[K]} key
   * @return {*}  {Promise<IGctComponent>}
   */
  $asyncRef<K extends keyof ComponentKeys>(key: K): Promise<ComponentKeys[K]>;
  /**
   * 获取界面模态实例
   *
   * @param {string} key
   * @return {*}  {*}
   */
  $getModal?(key: string): any;
  /**
   * 关闭打开的模态
   *
   */
  $closeModal?(): void;
  /**
   * 系统内置业务服务请求
   *
   * @deprecated
   * @hidden
   * @param {*} path
   * @param {*} params
   * @param {...[any?, any?]} arg
   * @return {*}  {Promise<any>}
   */
  $httpBizService(path: any, params, ...arg: [any?, any?]): Promise<any>;

  /**
   * 调用对应实体方法
   *
   * @param {K} modelKey 模型标识
   * @param {FK} action 方法标识
   * @param {MyP<F>} params 参数
   * @param {IObject} [config] 请求自定义配置参数，具体参数请参考 axios 官方文档
   * @returns {*}  {Promise<MyR<F>>}
   */
  $request<
    K extends keyof IModelServiceMap,
    FK extends keyof IModelServiceMap[K],
    F extends IModelServiceMap[K][FK],
  >(
    modelKey: K,
    action: FK,
    params?: RequestParameter,
    config?: IObject,
  ): Promise<MyR<F>>;

  /**
   * 旧 API
   *
   * @deprecated
   * @hidden
   * @type {*}
   */
  $customBizService?: any;
  /**
   * 获取路由参数
   *
   * @return {*}  {IObject}
   */
  $routeQuery?(): IObject;
  /**
   * 获取应用全局变量
   *
   * @param {string} id
   * @return {*}  {*}
   */
  $getAppGlobalVar(id: string): any;
  /**
   * 设置应用全局变量
   *
   * @param {string} id
   * @param {*} value
   */
  $setAppGlobalVar(id: string, value: any): void;
  /**
   * 获取页面全局变量老版本兼容问题暂时不删除 后续不维护 推荐使用$getPageVar
   *
   * @deprecated
   * @hidden
   * @param {string} id
   */
  $getPageGlobalVar(id: string): any;
  /**
   * 设置页面变量老版本 兼容问题暂时不删除 后续不维护 推荐使用$setPageVar
   *
   * @deprecated
   * @hidden
   * @param {string} id
   * @param {*} val
   */
  $setPageGlobalVar(id: string, val: any): void;
  /**
   * 根据模态框id 获取上下文 id不传默认页面上下文
   *
   * @param {string} modalKey
   */
  $getCtxById(modalKey: string);
  /**
   * 设置组件的属性
   *
   */
  $setPropsByKey(key: string, fromProp: any): void;
  /**
   * 获取组件的属性
   *
   * @param {string} key
   * @param {(string | string[])} PropsKey
   * @return {*}  {IObject}
   */
  $getPropsByKey(key: string, PropsKey: string | string[]): IObject;

  /**获取页面全局变量 */
  $getPageVar(id: string): any;
  /**设置页面全局变量 */
  $setPageVar(id: string, value: any): void;

  /**
   * 历史对象，避免历史脚本报错
   *
   * @deprecated
   * @type {*}
   */
  $message: any;

  /**
   * 历史对象，避免历史脚本报错
   *
   * @deprecated
   * @type {*}
   */
  $utility: any;

  /**
   * 打开签名确认
   *
   * @deprecated
   * @hidden
   * @param {*} props
   * @param {*} successFunction
   * @param {*} failFunction
   */
  $modelingSignatureConfirm(props: any, successFunction: any, failFunction: any): void;

  $onlineFormModal(props: any): void;

  /**
   * 全局loading
   */
  $loading: any;
}

/**
 * CTX.$request 方法请求参数
 *
 * @hidden
 * @interface RequestParameter
 */
export interface RequestParameter {
  /**
   * 请求 url 参数
   *
   * @type {IObject}
   */
  query?: IObject;
  /**
   * 请求 body 参数
   *
   * @type {IObject}
   */
  body?: IObject;
}
