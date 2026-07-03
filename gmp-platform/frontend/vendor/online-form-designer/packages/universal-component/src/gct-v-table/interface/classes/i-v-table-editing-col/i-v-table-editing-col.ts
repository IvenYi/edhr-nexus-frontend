import { Emitter } from 'mitt';
import { IGctVTableEditingColEvent } from '../../events';
import { IVTableEditColumn } from '../../i-v-table-column/i-v-table-edit-column';
import { LowCodeWidget } from '@gct/runtime';

/**
 * 正在编辑的表格列实例
 *
 * @export
 * @interface IVTableEditingCol
 */
export interface IVTableEditingCol {
  readonly evt: Emitter<IGctVTableEditingColEvent>;
  /**
   * 设计界面模型配置，只有在设计界面组件时才可使用
   *
   * @type {LowCodeWidget.BasicSchema}
   */
  readonly widget: LowCodeWidget.BasicSchema;
  /**
   * 列配置
   *
   * @type {IVTableEditColumn}
   */
  col: IVTableEditColumn;
  /**
   * 列值
   *
   * @type {*}
   */
  value: any;
  /**
   * 列禁用状态
   *
   * @type {boolean}
   */
  disabled: boolean;
  /**
   * 列只读状态
   *
   * @type {boolean}
   */
  readonly: boolean;
  /**
   * 由 row 调用，需要在所有列实例创建完成后，调用此方法进行初始化
   */
  init(): void;
  /**
   * 销毁当前编辑列实例
   */
  dispose(): void;
}
