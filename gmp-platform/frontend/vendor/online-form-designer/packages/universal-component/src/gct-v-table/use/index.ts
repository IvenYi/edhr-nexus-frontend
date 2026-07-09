import { createUUID } from 'qx-util';
import { inject, provide } from 'vue';
import { LowCodeWidget } from '@gct/runtime';
import {
  GCT_TABLE_SCHEMA_KEY,
  GCT_V_TABLE_ROW_EDIT_UUID_KEY,
  GCT_V_TABLE_ROW_EDITING_COL_KEY,
  GCT_V_TABLE_ROW_EDITING_ROW_KEY,
  GCT_V_TABLE_UUID_KEY,
} from '../constants';
import type { IVTableEditingCol, IVTableEditingRow } from '../interface';

/**
 * 获取当前作用域下表格的唯一标识符
 *
 * @author zhr
 * @date 2025-11-11 11:11:50
 * @export
 * @returns {*}  {string}
 */
export function useGctVTableUUID(): string {
  let uuid = inject<string>(GCT_V_TABLE_UUID_KEY);
  if (!uuid) {
    uuid = createUUID();
    provide(GCT_V_TABLE_UUID_KEY, uuid);
  }
  return uuid;
}

/**
 * 获取当前作用域下表格行编辑的唯一标识符
 *
 * @export
 * @return {*}  {string}
 */
export function useGctVTableRowEditUUID(): string {
  let uuid = inject<string>(GCT_V_TABLE_ROW_EDIT_UUID_KEY);
  if (!uuid) {
    uuid = createUUID();
    provide(GCT_V_TABLE_ROW_EDIT_UUID_KEY, uuid);
  }
  return uuid;
}

/**
 * 获取当前作用域下表格的 schema 配置
 *
 * @export
 * @return {*}  {LowCodeWidget.BasicSchema}
 */
export function useTableWidget(): LowCodeWidget.BasicSchema {
  const tableWidget = inject<LowCodeWidget.BasicSchema>(GCT_TABLE_SCHEMA_KEY);
  if (!tableWidget) {
    throw new Error('无法获取表格的 schema 配置，请确保作用域在表格组件内');
  }
  return tableWidget;
}

/**
 * 获取当前作用域下表格行编辑行实例
 *
 * @export
 * @return {*}  {IVTableEditingRow}
 */
export function useTableEditingRow(): IVTableEditingRow {
  const editingRow = inject<IVTableEditingRow>(GCT_V_TABLE_ROW_EDITING_ROW_KEY);
  if (!editingRow) {
    throw new Error('无法获取表格行编辑实例，请确保作用域在表格行编辑组件内');
  }
  return editingRow;
}

/**
 * 获取当前作用域下表格行编辑列实例
 *
 * @export
 * @return {*}  {IVTableEditingCol}
 */
export function useTableEditingCol(): IVTableEditingCol {
  const editingCol = inject<IVTableEditingCol>(GCT_V_TABLE_ROW_EDITING_COL_KEY);
  if (!editingCol) {
    throw new Error('无法获取表格列编辑实例，请确保作用域在表格行编辑列组件内');
  }
  return editingCol;
}

export * from './popover';
