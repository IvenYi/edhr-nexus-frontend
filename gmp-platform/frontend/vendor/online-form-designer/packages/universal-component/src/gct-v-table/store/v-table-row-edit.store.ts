import { computed, ref } from 'vue';
import mitt from 'mitt';
import { IGctVTableRowEditStore } from '../interface/store';
import { IGctVTableStore } from './use-v-table.store';
import { IGctVTableEditEvent } from '../interface';

/**
 * 创建 GctVTable 行编辑状态管理 Store，每次调用均创建一个新的 Store 实例
 *
 * @export
 * @param {IGctVTableStore} tableStore
 * @return {*}  {IGctVTableRowEditStore}
 */
export function createVTableRowEditStore(tableStore: IGctVTableStore): IGctVTableRowEditStore {
  const evt = mitt<IGctVTableEditEvent>();
  // 是否存在校验错误
  const isError = ref<boolean>(false);
  // 校验错误提示高度
  const errorHeight = ref<number>(26);

  const normalCols = computed(() => {
    return tableStore.normalCols;
  });

  /**
   * 行编辑数据
   */
  const rowEditData = computed(() => {
    return tableStore.rowEditData;
  });

  /**
   * 从表格中获取正在编辑的数据
   */
  const rowEditingItem = computed(() => {
    return tableStore.rowEditingItem;
  });

  /**
   * 行编辑偏移位置
   */
  const top = computed(() => {
    return tableStore.editRect?.top ?? 0;
  });

  /**
   * 行编辑高度
   */
  const height = computed(() => {
    return tableStore.editRect?.height ?? 0;
  });

  // 容器高度，校验错误时增加错误提示高度
  const containerHeight = computed(() => {
    if (isError.value) {
      return height.value + errorHeight.value;
    }
    return height.value;
  });

  // 左侧固定列宽度集合
  const leftFixedWidths = computed<number[]>(() => {
    return tableStore.cellWidths.slice(0, tableStore.options.frozenColCount);
  });

  // 中间内容列宽度集合
  const contentWidths = computed<number[]>(() => {
    return tableStore.cellWidths.slice(
      tableStore.options.frozenColCount,
      tableStore.cellWidths.length - (tableStore.options.rightFrozenColCount ?? 0),
    );
  });

  // 右侧固定列宽度集合
  const rightFixedWidths = computed<number[]>(() => {
    return tableStore.cellWidths.slice(
      tableStore.cellWidths.length - (tableStore.options.rightFrozenColCount ?? 0),
      tableStore.cellWidths.length,
    );
  });

  /**
   * 获取变更的行编辑数据
   * @param rowEditData 原始数据
   * @param rowEditingItem 可修改的行编辑数据
   * @returns 只包含有值变更的属性
   */
  function getChangedRowEditData(): Record<string, any> {
    const changedData: Record<string, any> = {};

    // 遍历可修改数据的所有属性
    for (const key in rowEditingItem.value?.data) {
      // 跳过以 _ 开头的属性和原型链上不能存在的属性
      if (
        key.startsWith('_') ||
        !Object.prototype.hasOwnProperty.call(rowEditingItem.value.data, key)
      ) {
        continue;
      }

      const newValue = rowEditingItem.value.data[key];
      const oldValue = tableStore.rowEditData![key];

      // 比较新旧值，只记录有变更的属性
      if (newValue !== oldValue) {
        changedData[key] = newValue;
      }
    }

    return changedData;
  }

  return {
    evt,
    isError,
    errorHeight,
    normalCols,
    rowEditData,
    rowEditingItem,
    top,
    height,
    containerHeight,
    leftFixedWidths,
    contentWidths,
    rightFixedWidths,
    getChangedRowEditData,
  };
}
