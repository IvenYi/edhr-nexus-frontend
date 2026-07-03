import { CustomRenderFunctionArg } from '@visactor/vtable/es/ts-types';
import { IGroup } from '@visactor/vtable/es/vrender';
import { IVTableDataItem } from '../i-v-table-data-item/i-v-table-data-item';

export interface IVTableColumnPlugin {
  /**
   * 更行行数据
   *
   * @param {IVTableDataItem} row
   * @param {number} [rowIndex]
   */
  updateRow(row: IVTableDataItem, rowIndex?: number): void;

  /**
   * 渲染
   */
  render(args: CustomRenderFunctionArg): IGroup;

  /**
   * 重置样式，合并基础样式和动态样式
   * 在样式变更后调用此方法进行样式重置，否则样式更新不及时
   *
   * @memberof IVTableColumnPlugin
   */
  resetStyle?(): void;

  /**
   * 释放资源
   */
  dispose?(): void;
}
