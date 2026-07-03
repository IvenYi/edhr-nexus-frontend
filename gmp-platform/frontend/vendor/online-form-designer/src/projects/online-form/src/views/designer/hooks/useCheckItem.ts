import { ref } from 'vue';
import CheckItemSelectModal from '/@web-render/views/edhr-application/components/check-item/select-modal.vue';
import { useSpreadSheet } from './useSpreadSheet';
import { CheckTable } from '../utils/check-table';
import type { ITable } from '../types';
import { cloneDeep } from 'lodash-es';

const { paper, insertRows, deleteRow } = useSpreadSheet();

type ReturnType =
  | {
      ok: boolean;
      data: any[];
    }
  | undefined;
const addCheckItem = async (payload: { id: string; data?: any[] }): Promise<ReturnType> => {
  const { ok, data } = await gct.openUtil.modal<{
    ok: Boolean;
    data: any[];
  }>(
    CheckItemSelectModal,
    {
      selected: cloneDeep(payload.data ?? []),
    },
    { title: $t('sys.onlineForm.selectDocumentItem'), width: '1040px' },
  );

  if (!ok) return;
  const ds = paper.value.checkTableDataSource?.find((item) => item.id === payload.id);
  if (ds) {
    ds.data = data;
  }
  return {
    ok: true,
    data,
  };
};

/**
 * 同步检验表布局
 * @param table
 */
const syncDesignLayout = (table: ITable) => {
  const unitHeight = CheckTable.calcRowHeight(table);
  const tableHeight = table.range.b - table.range.t + 1;
  const ds = paper.value.checkTableDataSource?.find((item) => item.id === table.checkDsId);
  const targetHeight = unitHeight * ((ds?.data ?? []).length || 1);
  if (targetHeight > tableHeight) {
    const syncDgRangeFlag = table.dgRange ? table.dgRange.b <= table.range.b : false;
    insertRows(table.range.b + 1, targetHeight - tableHeight);
    // 添加删除行时会自动同步 range
    table.range.b += targetHeight - tableHeight;
    if (syncDgRangeFlag) {
      table.dgRange!.b += targetHeight - tableHeight;
    }
  } else if (targetHeight < tableHeight) {
    const delta = Math.abs(targetHeight - tableHeight);
    const startPos = table.range.b;
    Array(delta)
      .fill('')
      .forEach((_, index) => {
        deleteRow(startPos - index);
      });
  }
};

export function useCheckItem() {
  return {
    addCheckItem,
    syncDesignLayout,
  };
}
