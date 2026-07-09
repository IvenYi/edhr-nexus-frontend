import { inject } from 'vue';
import { Store } from 'pinia';
import { DESIGN_VIEW_STORE } from '../constants';
import { IBaseStore } from '../interface';

/**
 * 设计界面状态管理的注入钩子函数
 *
 * @export
 * @returns {*}
 */
export function useViewStore<T extends IBaseStore = IBaseStore>(): Store<string, T> {
  const store = inject(DESIGN_VIEW_STORE);
  if (!store) {
    throw new Error(
      'Design view store not found. Make sure to provide it in the component hierarchy.',
    );
  }
  return store as Store<string, T>;
}
