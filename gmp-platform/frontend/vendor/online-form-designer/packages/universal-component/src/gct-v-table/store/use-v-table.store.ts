import { defineStore } from 'pinia';
import { useGctVTableUUID } from '../use';
import { createGctVTableBaseStore } from './v-table-base.store';
import { createGctVTableEditStore } from './v-table-edit.store';

/**
 * GctVTable 组件状态管理
 */
export function useGctVTableStore() {
  const uuid = useGctVTableUUID();
  const key = `gct-v-table-store___${uuid}`;
  return defineStore(key, () => {
    const baseStore = createGctVTableBaseStore();
    const editStore = createGctVTableEditStore(baseStore);

    return {
      key,
      ...baseStore,
      ...editStore,
    };
  })();
}

/**
 * GctVTable 组件状态管理类型
 */
export type IGctVTableStore = ReturnType<typeof useGctVTableStore>;
