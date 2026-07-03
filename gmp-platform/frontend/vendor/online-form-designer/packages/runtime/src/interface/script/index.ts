/**
 * 这个是注释
 *
 * @private
 * @interface IObject
 */
export type IObject = Record<string | symbol, any>;

export type { IGctComponent } from './components/i-gct-component';

export type { IScriptContext } from './context/i-script-context';
export type { IMobileScriptContext } from './context/i-mobile-script-context';
export type { IPcScriptContext } from './context/i-pc-script-context';
