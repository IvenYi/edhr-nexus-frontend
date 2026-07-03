import { FieldMetaDTO, LowCodeWidget } from '@gct/runtime';
import { ColumnDefine } from '@visactor/vtable/es/ts-types';
import { IDataVTableColumnPipe } from '../pipe';

/**
 * 表格列配置
 *
 * @export
 * @interface IVTableColumn
 */
export interface IVTableColumn {
  /**
   * 表格项标识
   *
   * @type {string}
   */
  name: string;
  /**
   * 标题
   *
   * @type {string}
   */
  title: string;
  /**
   * 表格项宽度
   *
   * @type {(number | 'auto')}
   */
  width?: number | 'auto';
  /**
   * 数据字段（默认未指定时与 name 相同）
   *
   * @description 支持单一和数组两种形式，数组形式用于范围型呈现，或者其他复杂模式
   * @author chitanda
   * @date 2025-11-08 15:11:51
   * @type {(string[] | string)}
   */
  fields?: string[] | string;
  /**
   * 表格项模式，不配置默认为 default
   *
   * @default 'default'
   * @type {('default' | 'edit' | 'actions')} '默认只呈现' | '编辑项' | '操作列'
   */
  type?: 'default' | 'edit' | 'actions';
  /**
   * 固定列位置
   *
   * @type {('left' | 'right')}
   */
  fixed?: 'left' | 'right';
  /**
   * 是否隐藏该列
   *
   * @type {(boolean | ((widget: LowCodeWidget.BasicSchema) => boolean))}
   */
  hidden?: boolean | ((widget: LowCodeWidget.BasicSchema) => boolean);
  /**
   * 隐藏时不提交（适配平台配置）
   *
   * @description 当该配置为 true 时，当前列在隐藏状态下不参与表单数据提交
   * @type {boolean}
   */
  skipWhenHidden?: boolean;
  /**
   * 项额外配置，用于存储一些扩展信息
   *
   * @type {IObject}
   */
  _item?: IObject;
  /**
   * 字段配置信息
   *
   * @type {FieldMetaDTO}
   */
  _cfg?: FieldMetaDTO;
  /**
   * 如果是枚举字段，会有平台枚举配置
   *
   * @type {IObject[]}
   */
  enumList?: IObject[];
  /**
   * 表格列数据预处理管道
   *
   * @type {IDataVTableColumnPipe}
   */
  pipe?: IDataVTableColumnPipe;
  /**
   * 自定义 VTable 列配置
   *
   * @type {Partial<ColumnDefine>}
   */
  defineOptions?: Partial<ColumnDefine>;
}
