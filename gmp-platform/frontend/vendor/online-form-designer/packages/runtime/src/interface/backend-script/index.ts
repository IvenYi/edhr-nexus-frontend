import { IModelServiceMap, MyP, MyR } from './base-type';
import { IGctInvoke } from './i-gct-invoke/i-gct-invoke';
import { ModelManager } from './model-manager/model-manager';
import { RdoModelManager } from './model-manager/rdo-model-manager';
import { MsgManager } from './msg-nanager/msg-nanager';
import { EventPublisher, JsEngine, SystemVar } from './old-types';

declare module 'jsapi' {
  /**
   * 方法已废弃
   *
   * @deprecated
   * @hidden
   * @return {*}  {ModelManager}
   */
  function modelManager(): ModelManager;

  /**
   * 方法已废弃
   *
   * @deprecated
   * @hidden
   * @return {*}  {RdoModelManager}
   */
  function rdoModelManager(): RdoModelManager;

  /**
   * 方法已废弃
   *
   * @deprecated
   * @hidden
   * @return {*}  {JsEngine}
   */
  function jsEngine(): JsEngine;

  /**
   * 方法已废弃
   *
   * @deprecated
   * @hidden
   * @return {*}  {EventPublisher}
   */
  function eventPublisher(): EventPublisher;

  /**
   * 方法已废弃
   *
   * @deprecated
   * @hidden
   * @return {*}  {SystemVar}
   */
  function systemVar(): SystemVar;

  /**
   * 方法已废弃
   *
   * @deprecated
   * @hidden
   * @return {*}  {MsgManager}
   */
  function msgManager(): MsgManager;

  /**
   * 平台方法调用
   *
   * @param {K} methodKey 平台方法名称
   * @param {...MyP<F>} args 平台方法参数
   * @returns {*}  {MyR<F>} 平台方法调用结果
   */
  function GCT_INVOKE<K extends keyof IGctInvoke, F extends IGctInvoke[K]>(
    methodKey: K,
    ...args: MyP<F>
  ): MyR<F>;

  /**
   * 模型方法调用
   *
   * @param {K} modelKey 模型标识(根据平台配置动态变化)
   * @param {FK} methodKey 模型方法(根据平台配置动态变化)
   * @param {...MyP<F>} args 方法参数
   * @return {*}  {MyR<F>} 模型方法调用结果
   */
  function GCT_MODEL_INVOKE<
    K extends keyof IModelServiceMap,
    FK extends keyof IModelServiceMap[K],
    F extends IModelServiceMap[K][FK],
  >(modelKey: K, methodKey: FK, ...args: MyP<F>): MyR<F>;
}
