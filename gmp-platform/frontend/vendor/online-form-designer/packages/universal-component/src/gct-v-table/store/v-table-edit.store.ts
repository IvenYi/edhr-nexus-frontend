import { computed, reactive, Ref, ref } from 'vue';
import { IVTableEditingRow, IVTableDataItem, IVTableEditColumn } from '../interface';
import { IGctVTableBaseStore, IGctVTableEditStore } from '../interface/store';
import { Rect } from '@visactor/vtable/es/tools/Rect';
import { cloneDeep } from 'lodash-es';
import { VTableEditingRow } from '../classes';

/**
 * 行编辑相关功能控制
 *
 * @export
 * @param {IGctVTableBaseStore} vt
 * @returns {*}
 */
export function createGctVTableEditStore(vt: IGctVTableBaseStore): IGctVTableEditStore {
  const { tableInst } = vt;

  // 正在编辑的行号，-1 表示没有行在编辑状态
  const rowEditIndex = ref<number>(-1);
  // 选中的编辑行数据，不可以直接进行修改，用来做行编辑时的保存或者还原的备份
  const rowEditData = ref<IVTableDataItem | null>(null);
  // 用于修改的行编辑数据
  const rowEditingItem = ref<IVTableEditingRow | null>(null);
  const isRowEdit = computed<boolean>(() => {
    return rowEditingItem.value != null;
  });
  const editRect = ref<Rect | null>(null);
  const cellWidths = ref<number[]>([]);

  /**
   * 设置选中的编辑行，置空表示取消编辑。只支持单行编辑
   *
   * @param {number} row 需要为编辑的行号，从 1 开始计数，给值小于 1 时表示取消编辑
   * @returns {*}  {void}
   */
  function setEditRow(row: number): void {
    rowEditIndex.value = row;
    if (row < 1 || row > vt.getRecords().length) {
      rowEditData.value = null;
      rowEditingItem.value?.dispose();
      rowEditingItem.value = null;
      editRect.value = null;
      cellWidths.value = [];
      return;
    }
    const rowHeight = tableInst.value.getRowHeight(row);
    editRect.value = tableInst.value.getCellRect(0, row);
    // 行编辑元素时相对于表格的布局，需要减去表格的滚动偏移
    editRect.value.top -= tableInst.value.scrollTop;
    editRect.value.bottom -= tableInst.value.scrollTop;
    // 计算出每个单元格的宽度
    const colCount = tableInst.value.colCount;
    const widths: number[] = [];
    for (let c = 0; c < colCount; c++) {
      const cellRect = tableInst.value.getCellRect(c, row - 1);
      widths.push(cellRect.width);
    }
    cellWidths.value = widths;
    editRect.value.height = rowHeight;
    // 设置选中行的数据
    rowEditData.value = vt.getRecords()[row - 1] ?? null;
    // 过滤出可进行行编辑列
    const columns = [
      ...vt.fixedCols.value,
      ...vt.normalCols.value,
      ...vt.fixedRightCols.value,
    ].filter((col) => {
      return col.type === 'edit';
    }) as IVTableEditColumn[];
    // 创建可编辑行数据实例
    rowEditingItem.value = new VTableEditingRow(columns, row, reactive(cloneDeep(rowEditData.value)));
    // 开启行编辑后，关闭表格行选中状态
    tableInst.value.clearSelected();
  }

  return {
    rowEditIndex,
    rowEditData,
    rowEditingItem,
    isRowEdit,
    editRect: editRect as Ref<Rect | null>,
    cellWidths,
    setEditRow,
  };
}
