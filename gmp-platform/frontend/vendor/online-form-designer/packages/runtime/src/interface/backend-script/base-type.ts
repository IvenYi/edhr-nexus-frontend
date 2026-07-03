/* eslint-disable @typescript-eslint/no-empty-interface */
/**
 * @private
 */
export type IObject = Record<string | symbol, any>;

/**
 * 用于覆写的未知类型方法
 *
 * @private
 */
export type AnyFn = (...args: any[]) => any;

/**
 * 方法入参
 *
 * @private
 */
export type MyP<F> = F extends (...args: infer P) => any ? P : any;

/**
 * 方法返回值
 *
 * @private
 */
export type MyR<F> = F extends (...args: any[]) => infer R ? R : any;

/**
 * @private
 */
export interface IModelServiceMap {}
