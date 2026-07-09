import { ComputedRef, Ref } from 'vue';
import { IVTableDataItem } from '../i-v-table-data-item/i-v-table-data-item';
import { Rect } from '@visactor/vtable/es/tools/Rect';
import { IVTableEditingRow } from '../classes';

/**
 * 表格行编辑功能状态管理接口
 *
 * @export
 * @interface IGctVTableEditStore
 */
export interface IGctVTableEditStore {
  /**
   * 正在编辑的行号，-1 表示没有行在编辑状态
   *
   * @type {Ref<number>}
   */
  rowEditIndex: Ref<number>;
  /**
   * 选中的编辑行数据，不可以直接进行修改，用来做行编辑时的保存或者还原的备份
   *
   * @type {(Ref<IVTableDataItem | null>)}
   */
  rowEditData: Ref<IVTableDataItem | null>;
  /**
   * 当前正在编辑的行数据
   *
   * @type {(Ref<IVTableEditingRow | null>)}
   */
  rowEditingItem: Ref<IVTableEditingRow | null>;
  /**
   * 是否处于行编辑状态，根据判断 rowEditingItem 是否有值
   *
   * @type {ComputedRef<boolean>}
   */
  isRowEdit: ComputedRef<boolean>;
  /**
   * 编辑行的起始 cell 矩形区域信息
   *
   * @description api 的默认返回是没有计算表格头，此信息是处理表格头后的，并且减去滚动条已滚动高度
   * @type {(Ref<Rect | null>)}
   */
  editRect: Ref<Rect | null>;
  /**
   * 每个单元格的宽度数组，按照列顺序匹配。会包含选择列和序号列
   *
   * @type {Ref<number[]>}
   */
  cellWidths: Ref<number[]>;
  /**
   * 设置要编辑的行
   *
   * @param {number} num 行号，当 -1 时表示取消编辑
   */
  setEditRow(num: number): void;
}
