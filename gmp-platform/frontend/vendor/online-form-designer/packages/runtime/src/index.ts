import './types';
import { GctRuntime } from './global';

export * from './constants';
export * from './context';
export * from './controller';
export * from './enums';
export * from './error';
export * from './hooks';
export * from './interface';
export * from './props';
export * from './regex';
export * from './register';
export * from './use';
export * from './utils';

if (!window.gct) {
  window.gct = new GctRuntime();
}

export { GctRuntime };
