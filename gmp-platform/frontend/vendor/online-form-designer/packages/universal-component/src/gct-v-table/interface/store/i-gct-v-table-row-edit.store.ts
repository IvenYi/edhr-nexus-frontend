import { ComputedRef, Ref } from 'vue';
import { BScrollConstructor } from '@better-scroll/core/dist/types/BScroll';
import { IVTableDataItem } from '../i-v-table-data-item/i-v-table-data-item';
import { IVTableColumn } from '../i-v-table-column/i-v-table-column';
import { IVTableEditingRow } from '../classes';
import { Emitter } from 'mitt';
import { IGctVTableEditEvent } from '../events';

/**
 * 行编辑表单状态 Store 接口
 *
 * @export
 * @interface IGctVTableRowEditStore
 */
export interface IGctVTableRowEditStore {
  evt: Emitter<IGctVTableEditEvent>;
  /**
   * 是否存在校验错误
   *
   * @type {Ref<boolean>}
   */
  isError: Ref<boolean>;
  /**
   * 校验错误提示高度
   *
   * @type {Ref<number>}
   */
  errorHeight: Ref<number>;
  /**
   * 普通列集合
   *
   * @type {ComputedRef<IVTableColumn[]>}
   */
  normalCols: ComputedRef<IVTableColumn[]>;
  /**
   * 行编辑数据
   *
   * @type {(Ref<IVTableDataItem | null>)}
   */
  rowEditData: Ref<IVTableDataItem | null>;
  /**
   * 从表格中获取的正在编辑的数据
   *
   * @type {(Ref<IVTableEditingRow | null>)}
   */
  rowEditingItem: Ref<IVTableEditingRow | null>;
  /**
   * 行编辑偏移位置
   *
   * @type {ComputedRef<number>}
   */
  top: ComputedRef<number>;
  /**
   * 行编辑高度
   *
   * @type {ComputedRef<number>}
   */
  height: ComputedRef<number>;
  /**
   * 容器高度，根据是否存在校验错误动态变化
   *
   * @type {ComputedRef<number>}
   */
  containerHeight: ComputedRef<number>;
  /**
   * 左侧固定列宽度集合
   *
   * @type {ComputedRef<number[]>}
   */
  leftFixedWidths: ComputedRef<number[]>;
  /**
   * 中间内容列宽度集合
   *
   * @type {ComputedRef<number[]>}
   */
  contentWidths: ComputedRef<number[]>;
  /**
   * 右侧固定列宽度集合
   *
   * @type {ComputedRef<number[]>}
   */
  rightFixedWidths: ComputedRef<number[]>;
  /**
   * 获取行内修改过的数据
   *
   * @return {*}  {IObject}
   */
  getChangedRowEditData(): IObject;
}
