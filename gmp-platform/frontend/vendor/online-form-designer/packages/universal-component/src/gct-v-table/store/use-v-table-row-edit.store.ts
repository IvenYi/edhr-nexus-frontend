import { defineStore } from 'pinia';
import { useGctVTableRowEditUUID } from '../use';
import { useGctVTableStore } from './use-v-table.store';
import { createVTableRowEditStore } from './v-table-row-edit.store';

/**
 * GctVTable 行编辑状态管理
 */
export function useGctVTableRowEditStore() {
  const uuid = useGctVTableRowEditUUID();
  const key = `gct-v-table-row-edit-store___${uuid}`;

  const tableStore = useGctVTableStore();

  return defineStore(key, () => {
    const rowEditStore = createVTableRowEditStore(tableStore);

    return {
      key,
      ...rowEditStore,
    };
  })();
}

/**
 * GctVTable 行编辑状态管理类型
 */
export type IGctVTableRowEditStore = ReturnType<typeof useGctVTableRowEditStore>;
